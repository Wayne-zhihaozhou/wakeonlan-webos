/*
 * Wake on LAN service for webOS TV
 * ---------------------------------
 * Runs as a Node.js JS Service in the background on the TV.
 * - 开机自动唤醒：电视冷开机（彻底断电/完全关机再开机）后，Activity Manager 的
 *   `net` 触发器（connectionmanager/getStatus 网络从无到有）拉起本服务并调用 `wake`
 *   单次发送一次魔术包。tvpower/displayStatus/screenState 对第三方服务无 ACG 权限、
 *   无法武装，且屏幕/电源订阅与轮询看护均已移除——本服务不再持续发送，也不订阅
 *   屏幕或电源状态，短待机/Quick Start+ 唤醒不再自动发包。
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
    // sendIntervalSec：保留字段，供前端表单存取（历史兼容），
    // 已不再驱动任何发送——本服务不再持续发送，只做单次发送。
    sendIntervalSec: 1,
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
// lastWol: 最近一次发送魔术包的结果，用于在 UI 状态栏显示——
// none=尚未发过包；sent=已发出魔术包；error=发送失败。
// armed: 至少一个开机触发器 Activity 成功武装；triggers: 各触发源武装结果。
var bootAutoState = { armed: false, error: '', lastWol: 'none', triggers: {} };

/*
 * 开机触发源列表。
 * 真机实测（2026）：第三方服务对 tvpower/powerState、systemservice/displayStatus、
 * tvpower/screenState 均无 ACG 权限，这些触发器武装必然失败（trigger[...] FAILED），
 * 已删除。唯一可武装的是 connectionmanager/getStatus（网络状态）：
 *   - net  : com.webos.service.connectionmanager/getStatus  冷开机时网络从无到有的变化，
 *            作为「彻底断电/完全关机再开机」的兜底（此时网络是就绪的最可靠信号）。
 * 该 Activity 触发会拉起服务并调用 wake（单次发送）。本服务不再做持续发送，
 * 也不订阅/轮询屏幕或电源状态。
 */
var BOOT_TRIGGERS = [
    {
        key: 'net',
        name: BOOT_ACTIVITY_NAME + '.net',
        method: 'luna://com.webos.service.connectionmanager/getStatus',
        params: { subscribe: true },
        desc: 'Network ready after cold boot'
    }
];

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
        sendIntervalSec: (c && typeof c.sendIntervalSec === 'number' && c.sendIntervalSec >= 1)
            ? c.sendIntervalSec : DEFAULT_CONFIG.sendIntervalSec,
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
        obj.sendIntervalSec = (typeof cfg.sendIntervalSec === 'number' && cfg.sendIntervalSec >= 1)
            ? cfg.sendIntervalSec : DEFAULT_CONFIG.sendIntervalSec;
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
        var cancelNames = BOOT_TRIGGERS.map(function (t) { return t.name; });
        var pendingCancels = cancelNames.length;
        function finishCancel() {
            bootAutoState.armed = false;
            bootAutoState.error = '';
            console.log('wol: boot auto-launch disabled');
            done(null);
        }
        if (pendingCancels === 0) { finishCancel(); return; }
        cancelNames.forEach(function (name) {
            lunaCall(AM_URI, 'cancel', { name: name }, function () {
                // A "not found" is fine here (already disabled).
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
            (anyArmed ? 'ARMED (triggers ' + (BOOT_TRIGGERS.length - countFailed()) + '/' + BOOT_TRIGGERS.length + ')' :
                        'FAILED (all: ' + bootAutoState.error + ')'));
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

/* ------------------------------------------------------------------ *
 *  网络就绪检测 + 等待（每次发送魔术包前的网络门禁）
 *  ------------------------------------------------------------------ *
 *  要求：每次发送魔术包前先确认电视已联网；若尚未联网则每隔几秒重查一次，
 *  直到联网为止；最多等待 5 分钟（NET_CHECK_TIMEOUT_MS），超时则放弃本次发送。
 *  通过 com.webos.service.connectionmanager/getStatus 判断，兼容不同固件上
 *  wired/wifi/state/internetConnectionState 等不同的返回字段。
 * ------------------------------------------------------------------ */
var NET_CHECK_INTERVAL_MS = 5000;              // 未联网时每 5 秒重查一次
var NET_CHECK_TIMEOUT_MS = 5 * 60 * 1000;      // 等待网络的总超时：5 分钟

// 查询电视是否已联网，结果通过 cb(true/false) 返回（查询失败视为未联网）。
function networkReady(cb) {
    lunaCall('luna://com.webos.service.connectionmanager', 'getStatus', {}, function (res) {
        if (!res || !res.returnValue) { cb(false); return; }
        var state = String(res.state || '').toLowerCase();
        var inetState = String(res.internetConnectionState || '').toLowerCase();
        var ok =
            res.connected === true || res.connected === 'connected' ||
            (res.wired && (res.wired.connected === true ||
                String(res.wired.state || '').toLowerCase() === 'connected')) ||
            (res.wifi && (res.wifi.connected === true ||
                String(res.wifi.state || '').toLowerCase() === 'connected')) ||
            state === 'connected' || state === 'ipv4' || state === 'ipv6' ||
            inetState === 'connected';
        cb(ok);
    }, 3000);
}

// 等到网络就绪后再发送一次魔术包。未联网则间隔轮询，超时 5 分钟则 cb 报错、
// 放弃本次发送。保证「每次发送前都确认有网络连接」。
function sendWOLWhenNetworkReady(cfg, cb) {
    var deadline = Date.now() + NET_CHECK_TIMEOUT_MS;
    var done = false;

    function finish(err) {
        if (done) { return; }
        done = true;
        if (cb) { cb(err); }
    }

    function checkAndSend() {
        if (Date.now() > deadline) {
            console.log('wol: network not ready within ' + (NET_CHECK_TIMEOUT_MS / 60000) +
                ' min; skip this send');
            finish(new Error('network not ready within 5 minutes'));
            return;
        }
        networkReady(function (ok) {
            if (done) { return; }
            if (ok) {
                sendWOL(cfg, function (err) { finish(err); });
            } else {
                console.log('wol: no network yet; re-check in ' +
                    (NET_CHECK_INTERVAL_MS / 1000) + 's');
                setTimeout(checkAndSend, NET_CHECK_INTERVAL_MS);
            }
        });
    }
    checkAndSend();
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
    sendWOLWhenNetworkReady(cfg, function (err) {
        recordSend(!err, err && err.message);
        if (cb) { cb(err); }
    });
}

/* ------------------------------------------------------------------ *
 *  Service entry point: 开机触发器武装（不再持续发送）
 * ------------------------------------------------------------------ *
 *  服务启动时不直接发包，只负责从 DB 读取配置并武装开机触发器 Activity
 *  （AM 触发器 `net`：冷开机网络从无到有时拉起服务并调用 `wake` 单次发送）。
 *  真正的发送由两条路径完成：
 *    1. AM 触发器 `net`（冷开机）-> `wake` 单次发送；
 *    2. 用户手动点「立即唤醒」-> `wake` 单次发送。
 *  不再有持续发送死循环，也不再订阅/轮询屏幕或电源状态。
 * ------------------------------------------------------------------ */
function startBootAutosend() {
    var sendCfg = configCache ? JSON.parse(JSON.stringify(configCache))
                              : JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    try {
        dbCall('find', { query: { from: KIND } }, function (res) {
            if (res && res.returnValue && res.results && res.results.length) {
                sendCfg = normalizeConfig(res.results[0]);
                configCache = JSON.parse(JSON.stringify(sendCfg));
            }
            // 按配置武装（或取消）开机触发器 Activity。
            // (replace:true makes this idempotent, and it self-heals if lost.)
            setBootAuto(!!(sendCfg.enabled && sendCfg.sendOnBoot), function () {});
        }, 4000);
    } catch (e) {
        // 读配置失败：用内存/默认配置武装触发器。
        setBootAuto(!!(sendCfg.enabled && sendCfg.sendOnBoot), function () {});
    }
}

try {
    startBootAutosend();
} catch (e) {
    console.log('wol: startup error: ' + e);
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

        // 手动触发或 AM 开机触发器回调（fromBoot）都走这里：单次发送魔术包。
        // sendMagicPacket 内部会等电视联网（最多 5 分钟）后再发，保证网络就绪。
        sendMagicPacket(cfg, function (sendErr) {
            if (sendErr) {
                bootAutoState.lastWol = 'error';
                message.respond({ returnValue: false, errorText: sendErr.message, errorCode: -1 });
            } else {
                bootAutoState.lastWol = 'sent';
                var src = p.fromBoot ? ' (fromBoot)' : '';
                console.log('wol: wake sent -> ' + cfg.mac + src);
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
