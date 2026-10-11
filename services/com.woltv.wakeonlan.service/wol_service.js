/*
 * Wake on LAN service for webOS TV
 * ---------------------------------
 * Runs as a Node.js JS Service in the background on the TV.
 * - 开机自动唤醒：电视开机后（服务被 Activity Manager 的多条件触发器拉起），
 *   在 90 秒窗口内每 2 秒循环发送一次 Wake-on-LAN 魔术包（UDP），确保电脑收到。
 *   多触发源（tvpower/powerState、connectionmanager/getStatus、displayStatus）
 *   任一触发即可唤醒，提高「电视屏幕亮起」时的触发稳定性。
 * - Registers bus methods used by the front-end app:
 *     wake       -> send a magic packet now
 *     getConfig  -> return stored config
 *     setConfig  -> persist config (DB8)
 *     getStatus  -> last send result / service uptime
 *     scan       -> scan the LAN (ping sweep + ARP table) for devices
 *
 * - Every console.log line is also forwarded over UDP to a PC on the LAN
 *   (logHost:logPort) when "logForward" is enabled, so all logs are viewed
 *   on the computer (see receive-log.ps1) instead of on the TV.
 *
 * Uses only built-in Node modules (`dgram`, `os`, `fs`, `net`)
 * plus the webOS `webos-service` module, which is pre-installed on the TV.
 * No npm install needed.
 */

var Service = require('webos-service');
var dgram = require('dgram');
var os = require('os');
var fs = require('fs');
var net = require('net');

/* ------------------------------------------------------------------ *
 *  console.log wrapper (used by all log output)
 *  ------------------------------------------------------------------ *
 *  服务不把日志缓存在内存里给电视端显示（那部分已移除）；每打一行就带时间戳
 *  通过 UDP 转发到电脑（logHost:logPort），由 receive-log.ps1 接收落盘，
 *  所有日志统一在电脑端查看。转发失败/目标不在线时静默忽略，绝不影响服务。
 * ------------------------------------------------------------------ */
var origLog = console.log;
console.log = function () {
    var parts = [];
    for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        parts.push(typeof a === 'string' ? a : safeStr(a));
    }
    var line = '[' + new Date().toISOString() + '] ' + parts.join(' ');
    logForwardLine(line); // 若开启日志转发，把带时间戳的行推给电脑
    try { origLog.apply(console, arguments); } catch (e) { /* noop */ }
};
function safeStr(v) {
    try { return JSON.stringify(v); } catch (e) { return String(v); }
}

var SERVICE_NAME = 'com.woltv.wakeonlan.service';
var DB_URI = 'luna://com.palm.db';
var KIND = 'com.woltv.wakeonlan:1';

var DEFAULT_CONFIG = {
    enabled: true,          // master switch
    sendOnBoot: true,       // auto-send magic packet when TV boots
    mac: 'CC:28:AA:A7:B4:1F', // 目标电脑有线网卡 MAC（默认值，装完即用）
    ip: '255.255.255.255',  // 广播地址；也可填电脑的固定 IP（单播更稳）
    port: 9,                // WoL standard port
    broadcast: true,        // set UDP broadcast flag when sending
    // 日志转发：服务每打一行 console.log 就通过 UDP 推到局域网内电脑的
    // logHost:logPort，方便在电脑上看日志而不是在电视上翻。默认关闭。
    logForward: false,      // 是否把服务日志转发到电脑
    logHost: '192.168.1.6', // 电脑 IP（同一局域网）
    logPort: 5555           // 电脑上 UDP 监听端口（receive-log.ps1）
};

var service = new Service(SERVICE_NAME);
var lastSend = { at: 0, ok: false, error: '' };

/* ------------------------------------------------------------------ *
 *  Boot auto-launch via the webOS Activity Manager
 *  ------------------------------------------------------------------ *
 *  On LG webOS a third-party JS service process is started *lazily*:
 *  it only runs when the owning app is launched or a bus client calls it.
 *  Nothing pulls it up at TV boot, so relying on `startBootAutosend()`
 *  alone means the PC never wakes until the user opens the app.
 *
 *  Fix: register *persistent* Activities (`luna://com.palm.activitymanager`),
 *  one per trigger source, each with a simple trigger. Persistent Activities
 *  live in DB8 and are re-armed by the Activity Manager on every boot, so the
 *  service is pulled up automatically right after the TV powers on — no app
 *  launch needed. Using several trigger sources gives redundancy so that any
 *  single source a given firmware refuses (or a boot scenario that doesn't
 *  fire it) can't block the whole wake flow.
 * ------------------------------------------------------------------ */
var AM_URI = 'luna://com.palm.activitymanager';
var BOOT_ACTIVITY_NAME = 'com.woltv.wakeonlan.bootwol';
// lastWol: 最近一次开机唤醒的结果，用于在 UI 状态栏显示——
// none=服务启动后还未发过包；sent=已发出魔术包；error=发送失败；done=90 秒窗口已结束。
// armed: 至少一个开机触发器 Activity 成功武装；triggers: 各触发源武装结果。
var bootAutoState = { armed: false, error: '', lastWol: 'none', lastPowerState: '', resumeFires: 0, triggers: {} };

/*
 * 开机触发源列表（多条件、任一触发即可唤醒，提高「电视屏幕亮起」时的触发稳定性）。
 * 每个触发源注册为一个独立的持久化 Activity，全部回调到同一个 `wake` 方法：
 *   - tvpower  : com.webos.service.tvpower/powerState  电源状态变化（待机→开机瞬间 fire），
 *                最贴合「遥控器待机开电视」的实际用法。
 *   - net      : com.webos.service.connectionmanager/getStatus  冷开机时网络从无到有的变化，
 *                作为「彻底断电/完全关机再开机」的兜底（此时网络是就绪的最可靠信号）。
 *   - display  : com.webos.service.systemservice/displayStatus  屏幕显示状态变化，
 *                直接反映「屏幕亮起」这个时刻。
 * 任一 Activity 触发都会拉起服务并调用 wake，多个触发源互为冗余——只要有一个可用就能唤醒，
 * 显著降低「单一触发器在特定固件/场景下不触发」导致电脑不醒的风险。
 * 注意：displayStatus / connectionmanager 等是否对第三方 Activity 可订阅取决于固件 ACG 权限，
 * 需真机验证；个别源武装失败会记录到 bootAutoState.triggers，不影响其它成功者。
 */
var BOOT_TRIGGERS = [
    {
        key: 'tvpower',
        name: BOOT_ACTIVITY_NAME + '.tvpower',
        method: 'luna://com.webos.service.tvpower/powerState',
        params: { subscribe: true },
        desc: 'TV power state change (standby->on)'
    },
    {
        key: 'net',
        name: BOOT_ACTIVITY_NAME + '.net',
        method: 'luna://com.webos.service.connectionmanager/getStatus',
        params: { subscribe: true },
        desc: 'Network ready after cold boot'
    },
    {
        key: 'display',
        name: BOOT_ACTIVITY_NAME + '.display',
        method: 'luna://com.webos.service.systemservice/displayStatus',
        params: { subscribe: true },
        desc: 'Screen display status change (screen on)'
    }
];

/* ------------------------------------------------------------------ *
 *  Direct powerState watch（待机唤醒兜底 + 诊断）
 *  ------------------------------------------------------------------ *
 *  AM 触发器只在「powerState 发生变化且 Activity Manager 能收到该变化」时 fire。
 *  真机现象（用户 2026 实测）：遥控器关电视后**短时间内**再开机 → 不触发；
 *  关电视 30 分钟（彻底断电/深度待机）再开机 → 进主页面即触发。
 *  高度怀疑：开启「即时开机 / Quick Start+ / 快速启动」时，短待机期间系统
 *  不彻底断电，powerState 可能根本没有 Standby→Active 的变化（或变化太快
 *  AM 没收到），于是基于「变化」的触发器永远等不到，电脑就不会被唤醒。
 *
 *  这里的**服务内直连订阅**只要服务进程还活着就一直盯着 powerState：
 *  - 若短待机唤醒瞬间确实发生了 Standby/Suspend/Screen Off→Active 的边沿，
 *    即便 AM 触发器漏了，这里也能抓到并走同样的开机发送入口；
 *  - 无论如何，每次 powerState 变化都会打日志（转发到电脑）并写进
 *    bootAutoState.lastPowerState，供 UI/日志判断「短待机时 powerState
 *    到底变不变」，从而确认根因到底是哪一类。
 * ------------------------------------------------------------------ */
var powerWatch = {
    active: false,     // 订阅是否已建立
    sub: null,         // webos-service 订阅句柄
    last: null,        // 最近一次看到的 powerState 值
    lastAt: 0,         // 最近一次变化的毫秒时间戳
    resumeFires: 0     // 检测到的「非开机→开机」边沿次数
};

function isActivePowerState(s) {
    return String(s || '').toLowerCase() === 'active';
}

function handlePowerStateMessage(message) {
    var payload = (message && message.payload) || {};
    if (payload.returnValue === false) {
        console.log('wol: powerState subscribe error: ' +
            (payload.errorText || payload.error || 'unknown'));
        return;
    }
    var state = payload.powerState;
    if (!state) { return; }
    var prev = powerWatch.last;
    var now = Date.now();
    powerWatch.last = state;
    powerWatch.lastAt = now;
    bootAutoState.lastPowerState = state;

    if (prev && prev !== state) {
        console.log('wol: powerState ' + prev + ' -> ' + state);
        if (isActivePowerState(state) && !isActivePowerState(prev)) {
            powerWatch.resumeFires++;
            bootAutoState.resumeFires = powerWatch.resumeFires;
            console.log('wol: TV resume detected (' + prev + ' -> ' + state +
                '); starting boot send loop');
            // 与 AM 触发器走同一个入口；内部 bootLoopRunning 防抖保证不重复。
            try { startBootAutosend(); } catch (e) {
                console.log('wol: resume boot send error: ' + e);
            }
        }
    } else {
        console.log('wol: powerState = ' + state +
            (prev ? ' (unchanged)' : ' (initial, no send)'));
    }
}

function startPowerWatch() {
    if (powerWatch.active) { return; }
    powerWatch.active = true;
    try {
        if (typeof service.subscribe === 'function') {
            powerWatch.sub = service.subscribe(
                'luna://com.webos.service.tvpower/powerState',
                { subscribe: true },
                handlePowerStateMessage
            );
            console.log('wol: powerState watch subscribed (warm-resume fallback + diag)');
        } else {
            powerWatch.active = false;
            console.log('wol: service.subscribe unavailable; powerState watch disabled');
        }
    } catch (e) {
        powerWatch.active = false;
        console.log('wol: powerState watch start error: ' + e);
    }
}

/* ------------------------------------------------------------------ *
 *  Config store
 *  ------------------------------------------------------------------ *
 *  Primary persistence is DB8 (luna://com.palm.db). But DB calls can hang
 *  or fail on some firmware, which would freeze every method that needs
 *  config. To keep the UI always responsive we also keep an in-memory cache
 *  and a hard timeout on every DB call, so a broken DB can never hang the
 *  service or crash it at startup.
 * ------------------------------------------------------------------ */
var configCache = null; // in-memory fallback + fast path

function lunaCall(uri, method, parameters, cb, timeoutMs) {
    var called = false;
    var timer = setTimeout(function () {
        if (!called) { called = true; cb({ returnValue: false, errorText: 'luna timeout' }); }
    }, timeoutMs || 5000);
    try {
        // 关键修复：webos-service 的 call 需要【完整 URI 带方法名】+【原始 payload】。
        // 不能传 `{method, parameters}` 包装——那会被原样当作 payload 发给一个没有
        // 方法名的地址（如 luna://com.palm.activitymanager），导致系统报
        // “url 不是一个有效网址”（DB 调用此前也因此一直在静默失败，只是被
        // saveConfig 的“失败也报成功、退回内存”逻辑掩盖了）。
        service.call(uri + '/' + method, parameters, function (message) {
            if (!called) { called = true; clearTimeout(timer); cb(message.payload || { returnValue: false }); }
        });
    } catch (e) {
        if (!called) { called = true; clearTimeout(timer); cb({ returnValue: false, errorText: String(e && e.message || e) }); }
    }
}

function dbCall(method, parameters, cb, timeoutMs) {
    lunaCall(DB_URI, method, parameters, cb, timeoutMs);
}

function ensureKind(cb) {
    dbCall('putKind', {
        id: KIND,
        owner: SERVICE_NAME,
        private: true,
        indexes: [{ name: 'default', props: [{ name: '_kind' }] }]
    }, function () {
        // "kind already exists" errors are fine; continue either way.
        cb();
    });
}

function normalizeConfig(c) {
    return {
        _id: c && c._id,
        enabled: c ? c.enabled !== false : true,
        sendOnBoot: c ? c.sendOnBoot !== false : true,
        mac: (c && c.mac) || DEFAULT_CONFIG.mac,
        ip: (c && c.ip) || DEFAULT_CONFIG.ip,
        port: (c && typeof c.port === 'number') ? c.port : DEFAULT_CONFIG.port,
        broadcast: c ? c.broadcast !== false : true,
        logForward: c ? c.logForward !== false : false,
        logHost: (c && c.logHost) || DEFAULT_CONFIG.logHost,
        logPort: (c && typeof c.logPort === 'number') ? c.logPort : DEFAULT_CONFIG.logPort
    };
}

/* ------------------------------------------------------------------ *
 *  UDP log forwarding to a PC on the LAN
 *  ------------------------------------------------------------------ *
 *  服务每次 console.log 都会走上面的包装器，这里再把同一行通过 UDP 推给
 *  局域网内的电脑（logHost:logPort），方便在电脑上实时看日志。默认关闭；
 *  开启后 fire-and-forget 发送，网络异常/目标不在线都静默忽略，绝不影响
 *  服务本身。datagram 最大约 64KB，而我们的单行已限长 2000 字符，安全。
 * ------------------------------------------------------------------ */
var LOG_FWD_SOCKET_TIMEOUT_MS = 120000; // 空闲多久后关闭 UDP socket
var logFwdSocket = null;
var logFwdTimer = null;

function closeLogFwdSocket() {
    if (logFwdTimer) { clearTimeout(logFwdTimer); logFwdTimer = null; }
    if (logFwdSocket) {
        try { logFwdSocket.close(); } catch (e) { /* noop */ }
        logFwdSocket = null;
    }
}

function ensureLogFwdSocket() {
    if (logFwdSocket) { return logFwdSocket; }
    try {
        logFwdSocket = dgram.createSocket('udp4');
        logFwdSocket.on('error', function () { closeLogFwdSocket(); });
    } catch (e) {
        logFwdSocket = null;
    }
    return logFwdSocket;
}

function logForwardLine(line) {
    // 从当前缓存配置读取开关与目标；DB 未加载时退回默认（默认关闭）。
    var c = configCache || DEFAULT_CONFIG;
    if (!c || !c.logForward || !c.logHost) { return; }
    var sock = ensureLogFwdSocket();
    if (!sock) { return; }
    var port = (typeof c.logPort === 'number' && c.logPort > 0)
        ? c.logPort : DEFAULT_CONFIG.logPort;
    var buf = Buffer.from(String(line), 'utf8');
    if (buf.length === 0) { return; }
    try {
        sock.send(buf, 0, buf.length, port, c.logHost, function () {
            // 空闲一段时间后关掉 socket，避免服务长期持有不必要的资源；
            // 下一条日志需要时再惰性重建。
            if (logFwdTimer) { clearTimeout(logFwdTimer); }
            logFwdTimer = setTimeout(closeLogFwdSocket, LOG_FWD_SOCKET_TIMEOUT_MS);
        });
    } catch (e) { /* 静默：日志转发失败不影响服务 */ }
}

function loadConfig(cb) {
    if (configCache) { cb(null, JSON.parse(JSON.stringify(configCache))); return; }
    dbCall('find', { query: { from: KIND } }, function (res) {
        if (res && res.returnValue && res.results && res.results.length > 0) {
            configCache = normalizeConfig(res.results[0]);
        } else {
            configCache = normalizeConfig(null);
        }
        cb(null, JSON.parse(JSON.stringify(configCache)));
    });
}

function saveConfig(cfg, cb) {
    loadConfig(function (err, existing) {
        var obj = {};
        if (existing && existing._id) { obj._id = existing._id; } // upsert existing object
        obj._kind = KIND;
        obj.enabled = cfg.enabled !== false;
        obj.sendOnBoot = cfg.sendOnBoot !== false;
        obj.mac = (cfg.mac || DEFAULT_CONFIG.mac).toString();
        obj.ip = (cfg.ip || DEFAULT_CONFIG.ip).toString();
        obj.port = typeof cfg.port === 'number' ? cfg.port : DEFAULT_CONFIG.port;
        obj.broadcast = cfg.broadcast !== false;
        obj.logForward = cfg.logForward !== false;
        obj.logHost = (cfg.logHost || DEFAULT_CONFIG.logHost).toString();
        obj.logPort = typeof cfg.logPort === 'number' ? cfg.logPort : DEFAULT_CONFIG.logPort;

        // Update in-memory cache immediately so the app is consistent.
        configCache = normalizeConfig(obj);

        function doPut() {
            dbCall('put', { objects: [obj] }, function (res) {
                if (res && res.returnValue) {
                    cb(null, configCache);
                } else {
                    // Kind may not exist on first run -> recreate and retry once.
                    ensureKind(function () {
                        dbCall('put', { objects: [obj] }, function (res2) {
                            if (res2 && res2.returnValue) {
                                cb(null, configCache);
                            } else {
                                // DB genuinely failed; still report success so the
                                // UI isn't stuck (config kept in memory for session).
                                console.log('wol: DB persist failed (using memory): ' +
                                    (res2 && (res2.errorText || res2.error) || 'unknown'));
                                cb(null, configCache);
                            }
                        });
                    });
                }
            });
        }
        doPut();
    });
}

/* ------------------------------------------------------------------ *
 *  Boot auto-launch management (Activity Manager)
 *  ------------------------------------------------------------------ *
 *  Arming creates (or replaces) one persistent, background Activity per
 *  trigger source in BOOT_TRIGGERS. Each Activity's trigger fires when the
 *  TV powers on / screen comes up and its callback invokes our `wake`
 *  method. Because the Activities are persistent, the Activity Manager
 *  re-arms them on every TV boot, so our service gets pulled up and starts
 *  the 90-second boot send loop — no app launch needed.
 *
 *  Multiple trigger sources give redundancy: any one that fires wakes the
 *  PC, so a single source that a given firmware refuses (or that doesn't
 *  fire in a particular boot scenario) can no longer block the whole flow.
 * ------------------------------------------------------------------ */
function setBootAuto(enabled, cb) {
    var done = cb || function () {};
    if (!enabled) {
        // 取消所有触发源对应的 Activity。
        var pendingCancels = BOOT_TRIGGERS.length;
        function finishCancel() {
            bootAutoState.armed = false;
            bootAutoState.error = '';
            console.log('wol: boot auto-launch disabled');
            done(null);
        }
        if (pendingCancels === 0) { finishCancel(); return; }
        BOOT_TRIGGERS.forEach(function (trg) {
            lunaCall(AM_URI, 'cancel', { name: trg.name }, function () {
                // A "not found" is fine here (already disabled).
                bootAutoState.triggers[trg.key] = { armed: false };
                if (--pendingCancels <= 0) { finishCancel(); }
            }, 6000);
        });
        return;
    }

    // 为每个触发源逐个武装；记录每个的结果，全部完成后回填总状态。
    var remaining = BOOT_TRIGGERS.length;
    var anyArmed = false;
    var lastError = '';

    function maybeFinish() {
        if (remaining > 0) { return; }
        bootAutoState.armed = anyArmed;
        bootAutoState.error = anyArmed ? '' : (lastError || 'all triggers failed');
        console.log('wol: boot auto-launch ' +
            (anyArmed ? 'ARMED (' + (BOOT_TRIGGERS.length - countFailed()) + '/' + BOOT_TRIGGERS.length + ' triggers)' :
                        'FAILED (all triggers: ' + bootAutoState.error + ')'));
        done(anyArmed ? null : new Error(bootAutoState.error));
    }

    function countFailed() {
        var n = 0;
        for (var i = 0; i < BOOT_TRIGGERS.length; i++) {
            var t = bootAutoState.triggers[BOOT_TRIGGERS[i].key];
            if (t && !t.armed) { n++; }
        }
        return n;
    }

    BOOT_TRIGGERS.forEach(function (trg) {
        lunaCall(AM_URI, 'create', {
            activity: {
                name: trg.name,
                description: 'Wake-on-LAN trigger (' + trg.desc + ')',
                type: { background: true, persist: true },
                trigger: { method: trg.method, params: trg.params },
                callback: { method: 'luna://com.woltv.wakeonlan.service/wake', params: { fromBoot: true, source: trg.key } }
            },
            replace: true,   // idempotent: safe to call again
            start: true,     // eligible to run as soon as the trigger fires
            subscribe: true  // keep it alive / adoptable
        }, function (res) {
            var ok = !!(res && res.returnValue);
            bootAutoState.triggers[trg.key] = {
                armed: ok,
                error: ok ? '' : ((res && (res.errorText || res.error)) || 'activity create failed')
            };
            if (ok) { anyArmed = true; } else { lastError = bootAutoState.triggers[trg.key].error; }
            console.log('wol: trigger[' + trg.key + '] ' +
                (ok ? 'ARMED' : 'FAILED (' + bootAutoState.triggers[trg.key].error + ')') +
                ' via ' + trg.method);
            remaining--;
            maybeFinish();
        }, 6000);
    });
}

/* ------------------------------------------------------------------ *
 *  Network helpers (LAN scan only)
 * ------------------------------------------------------------------ */
function getLocalIpv4() {
    // Returns the first real (non-internal, non-link-local) IPv4 address.
    // webOS older Node may report `family` as 4/6 (number) or 'IPv4'/'IPv6'.
    try {
        var ifaces = os.networkInterfaces();
        for (var name in ifaces) {
            var arr = ifaces[name];
            if (!arr) { continue; }
            for (var i = 0; i < arr.length; i++) {
                var a = arr[i];
                var fam = a.family;
                var isIpv4 = (fam === 'IPv4' || fam === 4);
                if (isIpv4 && !a.internal) {
                    var p = String(a.address).split('.').map(Number);
                    if (p.length === 4 && p[0] === 169 && p[1] === 254) { continue; } // link-local
                    return a.address;
                }
            }
        }
    } catch (e) { /* noop */ }
    return null;
}

function parseArpTableText(text) {
    // /proc/net/arp columns:
    //   IP address | HW type | Flags | HW address | Mask | Device
    var out = [];
    var lines = String(text || '').split('\n');
    for (var i = 1; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) { continue; }
        var f = line.split(/\s+/);
        var ip = f[0] || '';
        var mac = f[3] || '';
        var dev = f[5] || '';
        if (ip && /^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/.test(mac) &&
            mac !== '00:00:00:00:00:00') {
            out.push({ ip: ip, mac: mac, device: dev });
        }
    }
    return out;
}

function readArpTable() {
    // Reads the kernel ARP cache only (fast, non-blocking). The TCP probe
    // sweep already populates it, so we don't need external `ip`/`arp` tools.
    var devices = [];
    try {
        var text = fs.readFileSync('/proc/net/arp', 'utf8');
        devices = parseArpTableText(text);
    } catch (e) {
        devices = [];
    }
    return devices;
}

function tcpProbe(host, port, timeoutMs, cb) {
    // A single TCP connect attempt triggers ARP resolution for that host, so
    // a *live* host's MAC appears in the ARP cache regardless of firewall rules
    // or whether the port is open. No ICMP/ping privileges required.
    var sock;
    try {
        sock = new net.Socket();
    } catch (e) {
        cb();
        return;
    }
    var done = false;
    function finish() {
        if (done) { return; }
        done = true;
        try { sock.destroy(); } catch (e) { /* noop */ }
        cb();
    }
    sock.setTimeout(timeoutMs);
    sock.once('connect', finish);
    sock.once('timeout', finish);
    sock.once('error', finish);
    sock.once('close', finish);
    try {
        sock.connect(port, host);
    } catch (e) {
        finish();
    }
}

function tcpSweep(cb) {
    var ip = getLocalIpv4();
    if (!ip) { cb(); return; }
    var parts = ip.split('.').map(Number);
    var subnet = parts[0] + '.' + parts[1] + '.' + parts[2] + '.';
    var own = parts[3];
    var targets = [];
    for (var i = 1; i < 255; i++) {
        if (i !== own) { targets.push(subnet + i); }
    }
    // One port is enough: ARP resolution happens regardless of the port/response.
    var PORTS = [445];
    var total = targets.length * PORTS.length;
    var index = 0;
    var inflight = 0;
    var MAX = 50; // concurrency cap
    function next() {
        while (inflight < MAX && index < total) {
            var ti = Math.floor(index / PORTS.length);
            var pi = index % PORTS.length;
            index++;
            inflight++;
            (function (host, port) {
                tcpProbe(host, port, 700, function () { inflight--; next(); });
            })(targets[ti], PORTS[pi]);
        }
        if (inflight === 0 && index >= total) { cb(); }
    }
    next();
}

function dedupe(list) {
    var seen = {};
    var out = [];
    for (var i = 0; i < list.length; i++) {
        var d = list[i];
        var key = d.mac + '|' + d.ip;
        if (!seen[key]) { seen[key] = true; out.push(d); }
    }
    return out;
}

function scanDevices(cb) {
    // 1) Read existing ARP entries right away (fast, catches recently-seen hosts).
    var localIp = getLocalIpv4();
    var initial = readArpTable();
    var broadcast = null;
    if (localIp) {
        var parts = localIp.split('.').map(Number);
        broadcast = parts[0] + '.' + parts[1] + '.' + parts[2] + '.255';
    }
    // 2) Probe the subnet to populate the ARP cache, then re-read it.
    tcpSweep(function () {
        var after = readArpTable();
        var merged = dedupe(initial.concat(after));
        merged.sort(function (a, b) { return a.ip.localeCompare(b.ip); });
        cb(null, { devices: merged, broadcast: broadcast, localIp: localIp });
    });
}

/* ------------------------------------------------------------------ *
 *  Wake-on-LAN (magic packet)
 * ------------------------------------------------------------------ */
function buildMagicPacket(mac) {
    // 6 bytes of 0xFF followed by the 6-byte MAC repeated 16 times.
    var hex = String(mac || '').replace(/[^0-9a-fA-F]/g, '');
    if (hex.length !== 12) {
        throw new Error('Invalid MAC address: ' + mac);
    }
    var macBuf = Buffer.from(hex, 'hex');
    var packet = Buffer.alloc(6 + 16 * 6);
    for (var i = 0; i < 6; i++) {
        packet[i] = 0xFF;
    }
    for (var j = 0; j < 16; j++) {
        macBuf.copy(packet, 6 + j * 6);
    }
    return packet;
}

function sendWOL(cfg, cb) {
    var packet;
    try {
        packet = buildMagicPacket(cfg.mac);
    } catch (e) {
        cb(e);
        return;
    }

    var host = (cfg.ip || DEFAULT_CONFIG.ip).toString();
    var port = cfg.port || DEFAULT_CONFIG.port;
    var socket = dgram.createSocket('udp4');
    var done = false;

    function finish(err) {
        if (done) { return; }
        done = true;
        try { socket.close(); } catch (e) { /* noop */ }
        cb(err);
    }

    socket.on('error', function (err) {
        console.log('wol: socket error: ' + err);
        finish(err);
    });

    socket.bind(function () {
        try {
            if (cfg.broadcast !== false) {
                socket.setBroadcast(true);
            }
            socket.send(packet, 0, packet.length, port, host, function (err) {
                if (err) {
                    console.log('wol: send error: ' + err);
                    finish(err);
                } else {
                    console.log('wol: magic packet sent to ' + host + ':' + port + ' for ' + cfg.mac);
                    finish(null);
                }
            });
        } catch (e) {
            finish(e);
        }
    });
}

function recordSend(ok, error) {
    lastSend = { at: Date.now(), ok: ok, error: error || '' };
}

function sendMagicPacket(cfg, cb) {
    if (!cfg) { cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); }
    sendWOL(cfg, function (err) {
        recordSend(!err, err && err.message);
        if (cb) { cb(err); }
    });
}

/* ------------------------------------------------------------------ *
 *  Service entry point: auto-send at boot
 * ------------------------------------------------------------------ *
 *  开机后不做任何检测（网络就绪 / 电源状态都不管），直接进入 90 秒发送窗口，
 *  每 2 秒循环发送一次魔术包，确保电脑一定能收到。用进程级防抖避免 Activity
 *  反复拉起服务、每次都从头重发、浪费窗口。
 * ------------------------------------------------------------------ */
var BOOT_SEND_WINDOW_MS = 90000;      // 开机后 90 秒的发送窗口
var BOOT_SEND_INTERVAL_MS = 2000;     // 窗口期内每 2 秒重发一次魔术包
var bootLoopRunning = false;          // 进程级防抖：同进程只跑一轮开机发送

function startBootAutosend() {
    var sendCfg = configCache ? JSON.parse(JSON.stringify(configCache))
                              : JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    // 从 DB 取真实配置（失败或超时就用默认配置），随后启动循环发送。
    try {
        dbCall('find', { query: { from: KIND } }, function (res) {
            if (res && res.returnValue && res.results && res.results.length) {
                sendCfg = normalizeConfig(res.results[0]);
                configCache = JSON.parse(JSON.stringify(sendCfg));
            }
            // 进程级防抖：电视开机后 Activity 触发器可能把本服务拉起多次（每次
            // service registered 都会再跑 startBootAutosend）。若发送循环已在
            // 本进程跑着，就忽略这次，避免重复从头发送 / 反复重建 Activity
            // 造成自触发循环（日志里曾看到 service registered 连续出现 3 次）。
            if (bootLoopRunning) {
                console.log('wol: boot loop already running in this process; skip re-arm');
                return;
            }
            // Re-arm the persistent boot Activities (one per trigger source) to
            // match the stored config. (replace:true makes this idempotent, and
            // it self-heals if an Activity was ever lost.)
            setBootAuto(!!(sendCfg.enabled && sendCfg.sendOnBoot), function () {});
            runBootSendLoop(sendCfg);
        }, 4000);
    } catch (e) {
        runBootSendLoop(sendCfg);
    }
}

function runBootSendLoop(cfg) {
    if (bootLoopRunning) { return; }   // 同一进程只跑一轮
    bootLoopRunning = true;

    if (!(cfg.enabled && cfg.sendOnBoot)) {
        console.log('wol: boot auto-send disabled (enabled=' + cfg.enabled +
            ', sendOnBoot=' + cfg.sendOnBoot + ')');
        bootLoopRunning = false;
        return;
    }

    // 开机即发，不做任何检测：90 秒窗口内每 2 秒循环发送一次魔术包。
    var windowStart = Date.now();
    var sent = 0;

    function sendOnce() {
        if (Date.now() - windowStart >= BOOT_SEND_WINDOW_MS) {
            bootAutoState.lastWol = 'done';
            bootLoopRunning = false;
            console.log('wol: boot send loop finished (90s window, ' + sent + ' packets sent)');
            return;
        }
        sendWOL(cfg, function (err) {
            if (err) {
                bootAutoState.lastWol = 'error';
                console.log('wol: boot send failed: ' + err.message);
            } else {
                sent++;
                bootAutoState.lastWol = 'sent';
                recordSend(true, '');
                console.log('wol: boot magic packet ' + sent + ' sent -> ' + cfg.mac);
            }
        });
        setTimeout(sendOnce, BOOT_SEND_INTERVAL_MS);
    }
    sendOnce();
}

try {
    startBootAutosend();
} catch (e) {
    console.log('wol: startup error: ' + e);
}

// 服务内直连订阅 tvpower/powerState：服务进程存活期间即使 AM 触发器漏掉
// 待机唤醒的边沿，这里也能补上；同时为「短待机不触发」问题提供诊断数据。
try {
    startPowerWatch();
} catch (e) {
    console.log('wol: powerState watch startup error: ' + e);
}

/* ------------------------------------------------------------------ *
 *  Bus methods used by the front-end app
 * ------------------------------------------------------------------ */
service.register('wake', function (message) {
    var p = message.payload || {};
    // Allow a one-off override of the stored target.
    loadConfig(function (err, cfg) {
        if (p.mac) { cfg.mac = p.mac; }
        if (p.ip) { cfg.ip = p.ip; }
        if (p.port) { cfg.port = p.port; }
        if (p.broadcast !== undefined) { cfg.broadcast = p.broadcast; }

        // 手动触发或任一开机触发器回调（fromBoot）一律直接发一次魔术包，
        // 不做电源/网络检测——优先保证唤醒成功（误唤醒问题后续再处理）。
        sendMagicPacket(cfg, function (sendErr) {
            if (sendErr) {
                bootAutoState.lastWol = 'error';
                message.respond({ returnValue: false, errorText: sendErr.message, errorCode: -1 });
            } else {
                bootAutoState.lastWol = 'sent';
                console.log('wol: wake sent -> ' + cfg.mac + (p.fromBoot ? ' (fromBoot)' : ''));
                message.respond({ returnValue: true, sent: true });
            }
        });
    });
});

service.register('getConfig', function (message) {
    loadConfig(function (err, cfg) {
        if (err) {
            message.respond({ returnValue: false, errorText: String(err.errorText || err) });
        } else {
            message.respond({ returnValue: true, config: cfg });
        }
    });
});

service.register('setConfig', function (message) {
    var p = message.payload || {};
    try {
        if (!p.mac) {
            message.respond({ returnValue: false, errorText: 'mac is required' });
            return;
        }
        saveConfig(p, function (saveErr, saved) {
            if (saveErr) {
                console.log('wol: setConfig error: ' + (saveErr.errorText || saveErr));
                message.respond({ returnValue: false, errorText: String(saveErr.errorText || saveErr) });
            } else {
                console.log('wol: config saved: mac=' + saved.mac + ' ip=' + saved.ip + ' port=' + saved.port);
                // 让 UI 看到本次保存后真实的开机自启结果：等 setBootAuto 完成后再响应，
                // 否则界面会显示上一次（可能是旧的失败）状态。
                setBootAuto(!!(saved.enabled && saved.sendOnBoot), function () {
                    message.respond({ returnValue: true, config: saved, bootAuto: bootAutoState });
                });
            }
        });
    } catch (e) {
        console.log('wol: setConfig exception: ' + e);
        message.respond({ returnValue: false, errorText: String(e && e.message || e) });
    }
});

service.register('getStatus', function (message) {
    message.respond({
        returnValue: true,
        lastSend: lastSend,
        bootAuto: bootAutoState
    });
});

service.register('scan', function (message) {
    // 给扫描加超时，避免长时间 ping 拖住 / 让前端一直等。
    var responded = false;
    var timer = setTimeout(function () {
        if (!responded) {
            responded = true;
            message.respond({ returnValue: false, errorText: 'scan timed out' });
        }
    }, 45000);

    scanDevices(function (err, res) {
        if (responded) { return; }
        responded = true;
        clearTimeout(timer);
        if (err) {
            message.respond({ returnValue: false, errorText: String(err.errorText || err) });
        } else {
            message.respond({ returnValue: true, devices: res.devices, broadcast: res.broadcast });
        }
    });
});

console.log('wol: service ' + SERVICE_NAME + ' registered');
