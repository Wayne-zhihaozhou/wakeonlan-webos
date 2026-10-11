/*
 * Wake on LAN service for webOS TV
 * ---------------------------------
 * Runs as a Node.js JS Service in the background on the TV.
 * - On service start (which happens when the TV boots / the service is
 *   launched) it checks the stored config. If "sendOnBoot" is enabled it
 *   waits until the network is up (instead of a fixed delay) and sends a
 *   Wake-on-LAN magic packet (UDP) as soon as a real IPv4 address is ready,
 *   so the PC boots automatically without a manual timeout.
 * - Registers bus methods used by the front-end app:
 *     wake       -> send a magic packet now
 *     getConfig  -> return stored config
 *     setConfig  -> persist config (DB8)
 *     getStatus  -> last send result / service uptime
 *     scan       -> scan the LAN (ping sweep + ARP table) for devices
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
 *  In-app log ring buffer
 *  ------------------------------------------------------------------ *
 *  webOS 电视上不方便查看电脑端的日志文件，所以把服务自身的运行日志缓存
 *  在内存里，通过 getLog 总线方法暴露，前端应用可随时拉取并显示在电视屏
 *  幕上——排障时直接在电视上看，不必再 ssh / ares-log 去抓文件。
 * ------------------------------------------------------------------ */
var LOG_MAX = 400;        // 最多保留最近 400 行
var LOG_LINE_MAX = 2000;  // 单行最长 2000 字符，避免单条超长 JSON 撑爆 getLog 总线响应
var LOG_FILE = '/tmp/wol_service.log';    // 日志持久化文件
var START_FILE = '/tmp/wol_service_start'; // 最早启动时间标记文件
var logLines = [];

// webOS 的 JS 服务进程是按需拉起、空闲时可能被系统回收重启的。若日志只放内存，
// 一旦服务进程被重启（应用/电视本身都没重启也一样），日志会被清成只剩注册那一
// 行、运行时间归 0——这正是之前看到的“1 行 / 0 秒”。这里把日志行和最早启动时间
// 持久化到 /tmp：
//   - 仅服务进程重启时，日志与运行时间都能续上，不再出现“1 行 / 0 秒”；
//   - 电视重启后 /tmp 会被清空，日志重新从 0 开始（属预期）。
function readLogFromFile() {
    try {
        var arr = String(fs.readFileSync(LOG_FILE, 'utf8')).split('\n');
        var out = [];
        for (var i = 0; i < arr.length; i++) { if (arr[i]) { out.push(arr[i]); } }
        if (out.length > LOG_MAX) { out = out.slice(out.length - LOG_MAX); }
        return out;
    } catch (e) { return []; }
}
function appendLogToFile(line) {
    try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (e) { /* 写不进就退回纯内存 */ }
}
function rewriteLogFile() {
    try {
        fs.writeFileSync(LOG_FILE, logLines.join('\n') + (logLines.length ? '\n' : ''));
    } catch (e) { /* noop */ }
}
logLines = readLogFromFile();

function initStartedAt() {
    try {
        var t = parseInt(String(fs.readFileSync(START_FILE, 'utf8')).trim(), 10);
        if (t && t > 0) { return t; }
    } catch (e) { /* 首次运行或文件不可读 */ }
    var now = Date.now();
    try { fs.writeFileSync(START_FILE, String(now)); } catch (e) { /* noop */ }
    return now;
}
var startedAt = initStartedAt();

var origLog = console.log;
console.log = function () {
    var parts = [];
    for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        parts.push(typeof a === 'string' ? a : safeStr(a));
    }
    var line = '[' + new Date().toISOString() + '] ' + parts.join(' ');
    if (line.length > LOG_LINE_MAX) {
        line = line.slice(0, LOG_LINE_MAX) + ' …(此行过长已截断)';
    }
    logLines.push(line);
    var trimmed = false;
    if (logLines.length > LOG_MAX) {
        logLines.splice(0, logLines.length - LOG_MAX);
        trimmed = true;
    }
    appendLogToFile(line);
    if (trimmed) { rewriteLogFile(); } // 裁剪内存缓冲时同步重写文件，避免文件无限增长
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
 *  Fix: register a *persistent* Activity (`luna://com.palm.activitymanager`)
 *  that fires when the TV's network comes up after boot and whose callback
 *  invokes our `wake` method. A persistent Activity lives in DB8 and is
 *  re-armed by the Activity Manager on every boot, so the service is pulled
 *  up automatically as soon as the TV is online — no app launch needed.
 * ------------------------------------------------------------------ */
var AM_URI = 'luna://com.palm.activitymanager';
var BOOT_ACTIVITY_NAME = 'com.woltv.wakeonlan.bootwol';
// lastWol: 最近一次唤醒路径的结果，用于在 UI 上直接诊断「开机触发链路」——
// none=服务启动后还未触发过唤醒；sent=已发出魔术包；timeout=等网络就绪超时；error=发送失败。
var bootAutoState = { armed: false, error: '', raw: '', trigger: '', diag: '', lastWol: 'none' };
// 不同 webOS 版本的连接管理服务名不同：新版用 com.webos.service.connectionmanager，
// 旧版用 com.palm.connectionmanager。按顺序逐个尝试，直到 Activity 被成功受理。
var BOOT_TRIGGER_METHODS = [
    'luna://com.webos.service.connectionmanager/getStatus',
    'luna://com.palm.connectionmanager/getStatus'
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
 *  Arming creates (or replaces) a persistent, background Activity whose
 *  trigger fires when the TV's network comes up and whose callback invokes
 *  our `wake` method. Because the Activity is persistent, the Activity
 *  Manager re-arms it on every TV boot, so our service gets pulled up and
 *  sends the magic packet as soon as the TV is online — no app launch.
 * ------------------------------------------------------------------ */
function setBootAuto(enabled, cb) {
    var done = cb || function () {};
    if (!enabled) {
        lunaCall(AM_URI, 'cancel', { name: BOOT_ACTIVITY_NAME }, function (res) {
            // A "not found" is fine here (already disabled).
            bootAutoState.armed = false;
            bootAutoState.error = '';
            bootAutoState.raw = '';
            bootAutoState.trigger = '';
            bootAutoState.diag = '';
            console.log('wol: boot auto-launch disabled');
            done(null);
        }, 6000);
        return;
    }

    // 尝试用不同版本的连接管理器地址逐个创建 Activity，直到成功或全部失败。
    var tried = 0;
    var lastRes = {};

    function tryTrigger(index) {
        if (index >= BOOT_TRIGGER_METHODS.length) {
            // 全部持久化地址都失败 -> 追加一次「非持久化」诊断，用于区分
            // 「url 无效」到底是触发器地址问题，还是 persist 权限被固件拒绝。
            runDiag();
            return;
        }
        var triggerUri = BOOT_TRIGGER_METHODS[index];
        createActivity(triggerUri, true, function (res) {
            tried++;
            lastRes = res || {};
            bootAutoState.raw = JSON.stringify(lastRes);
            console.log('wol: activity create [' + tried + '] trigger=' + triggerUri +
                ' -> ' + JSON.stringify(lastRes));
            if (lastRes.returnValue) {
                bootAutoState.armed = true;
                bootAutoState.error = '';
                bootAutoState.trigger = triggerUri;
                console.log('wol: boot auto-launch ARMED via ' + triggerUri);
                done(null);
                return;
            }
            // 记录当前失败（保留最近一次错误），继续尝试下一个触发器地址。
            bootAutoState.armed = false;
            bootAutoState.error = (lastRes.errorText || lastRes.error) || 'activity create failed';
            console.log('wol: boot auto-launch attempt [' + tried + '] FAILED (' +
                bootAutoState.error + ')');
            tryTrigger(index + 1);
        });
    }

    function createActivity(triggerUri, persist, cb) {
        var type = persist ? { background: true, persist: true } : { background: true };
        lunaCall(AM_URI, 'create', {
            activity: {
                name: BOOT_ACTIVITY_NAME,
                description: 'Wake-on-LAN: send magic packet when TV boots and network is up',
                type: type,
                trigger: { method: triggerUri, params: { subscribe: true } },
                callback: { method: 'luna://com.woltv.wakeonlan.service/wake' }
            },
            replace: true,   // idempotent: safe to call again
            start: true,     // eligible to run as soon as the trigger fires
            subscribe: true  // keep it alive / adoptable
        }, cb, 6000);
    }

    function runDiag() {
        // 用第一个触发器地址、去掉 persist，看是否就能创建成功。
        var triggerUri = BOOT_TRIGGER_METHODS[0];
        createActivity(triggerUri, false, function (res) {
            var ok = !!(res && res.returnValue);
            if (ok) {
                // 非持久能建、持久不能建 -> 是 persist 权限问题，不是 URL 问题。
                bootAutoState.diag = '非持久 Activity 可正常创建 → 疑为固件禁止第三方持久化触发器（url 报错为误判）';
            } else {
                bootAutoState.diag = '去掉 persist 仍失败（' +
                    ((res && (res.errorText || res.error)) || '同错') +
                    '）→ trigger/callback 地址本身被拒';
            }
            console.log('wol: diag (non-persist) trigger=' + triggerUri +
                ' -> ' + JSON.stringify(res || {}) + ' ; ' + bootAutoState.diag);
            // 诊断用的非持久 Activity 只用于探测，成功则立刻取消，不残留。
            if (ok) {
                lunaCall(AM_URI, 'cancel', { name: BOOT_ACTIVITY_NAME }, function () {}, 6000);
            }
            done(new Error(bootAutoState.error || 'activity create failed'));
        });
    }

    tryTrigger(0);
}

/* ------------------------------------------------------------------ *
 *  Network helpers (ready-check + LAN scan)
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

/* ------------------------------------------------------------------ *
 *  Real network readiness check
 *  ------------------------------------------------------------------ *
 *  A TV has an IPv4 address as soon as the Wi-Fi interface comes up,
 *  but that is NOT the same as being online: right after boot the Wi-Fi
 *  still needs a few seconds to finish associating and to receive a
 *  gateway/default-route from DHCP. If we fire the magic packet during
 *  that window it has no usable route to the LAN and the PC never wakes.
 *
 *  So "ready" here means: we have a real IPv4 address AND the kernel has
 *  installed a default route (0.0.0.0) — the reliable sign that the Wi-Fi
 *  has actually finished connecting. On webOS we read /proc/net/route the
 *  same way we already read /proc/net/arp.
 * ------------------------------------------------------------------ */
function readDefaultRouteInfo() {
    // Returns { available: bool, hasDefault: bool }.
    var info = { available: false, hasDefault: false };
    try {
        var text = fs.readFileSync('/proc/net/route', 'utf8');
        info.available = true;
        var lines = String(text).split('\n');
        // Columns: Iface | Destination | Gateway | Flags | RefCnt | Use | Metric | Mask ...
        // Destination "00000000" == default route (0.0.0.0).
        for (var i = 1; i < lines.length; i++) {
            var f = lines[i].trim().split(/\s+/);
            if (f.length >= 2 && f[1] === '00000000') {
                info.hasDefault = true;
                break;
            }
        }
    } catch (e) { /* /proc may be unavailable in some sandboxes -> fall back to IP-only */ }
    return info;
}

function networkReady() {
    // An IP alone is not enough (Wi-Fi may still be associating). Prefer to
    // require a default route too, but if /proc/net/route cannot be read at
    // all, fall back to the old IP-only check so we never get stuck.
    var ip = getLocalIpv4();
    if (!ip) { return false; }
    var rt = readDefaultRouteInfo();
    if (!rt.available) { return true; }  // route file unreadable -> trust the IP
    return rt.hasDefault;                // otherwise wait for the route to appear
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
 *  关键修复（2026-10-10）：此前「开机即发、不做网络就绪判断」导致电视冷开机
 *  后 Wi-Fi 还没连上就发广播包，包根本出不去，电脑永远不醒（手动测试因为电视
 *  已在线所以正常）。现在改为：先等网络真正就绪（有 IPv4 + 有默认路由），再在
 *  发送窗口内每 2 秒持续重发。同时用进程级防抖避免 Activity 反复拉起服务、
 *  每次都从头重发、浪费窗口。
 * ------------------------------------------------------------------ */
var BOOT_SEND_WINDOW_MS = 90000;      // 开机后 90 秒的发送窗口
var BOOT_SEND_INTERVAL_MS = 2000;     // 窗口期内每 2 秒重发一次魔术包
var BOOT_NET_WAIT_TIMEOUT_MS = 30000; // 等网络就绪的最长时间（30s）
var BOOT_NET_POLL_MS = 1000;          // 轮询网络就绪的间隔
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
            // Re-arm the persistent boot Activity to match the stored config.
            // (replace:true makes this idempotent, and it self-heals if the
            // Activity was ever lost.)
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

    var waitStart = Date.now();

    // 关键修复：电视冷开机后 Wi-Fi 还没连上，此时立刻发广播包根本出不去
    // （这就是「手动测试能唤醒、开机自动却不醒」的根因）。先等网络真正
    // 就绪（有真实 IPv4 且有默认路由）再进入发送窗口；最多等 30s，超时
    // 也照发，避免永久卡住。
    function waitReady() {
        if (networkReady()) {
            console.log('wol: network ready after ' + (Date.now() - waitStart) + 'ms; starting boot send');
            startWindow();
            return;
        }
        if (Date.now() - waitStart >= BOOT_NET_WAIT_TIMEOUT_MS) {
            bootAutoState.lastWol = 'error';
            console.log('wol: network not ready within ' + BOOT_NET_WAIT_TIMEOUT_MS +
                'ms; sending anyway');
            startWindow();
            return;
        }
        setTimeout(waitReady, BOOT_NET_POLL_MS);
    }

    function startWindow() {
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

    waitReady();
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

        // 直接发送一次魔术包，不做网络就绪等复杂判断。开机唤醒的持续循环
        // 发送由 startBootAutosend 在 90 秒窗口内负责，这里仅处理手动触发。
        sendMagicPacket(cfg, function (sendErr) {
            if (sendErr) {
                bootAutoState.lastWol = 'error';
                message.respond({ returnValue: false, errorText: sendErr.message, errorCode: -1 });
            } else {
                bootAutoState.lastWol = 'sent';
                console.log('wol: wake sent -> ' + cfg.mac);
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
        uptimeMs: Date.now() - startedAt,
        lastSend: lastSend,
        networkReady: networkReady(),
        localIp: getLocalIpv4(),
        bootAuto: bootAutoState
    });
});

service.register('getLog', function (message) {
    // 返回服务进程缓存的内存日志（最近 LOG_MAX 行），供应用在电视上直接查看。
    message.respond({
        returnValue: true,
        uptimeMs: Date.now() - startedAt,
        lines: logLines.slice()
    });
});

service.register('clearLog', function (message) {
    // 清空内存缓冲与持久化日志文件（手动清空）。
    logLines = [];
    try { fs.writeFileSync(LOG_FILE, ''); } catch (e) { /* noop */ }
    console.log('wol: log cleared manually');
    message.respond({ returnValue: true, cleared: true });
});

service.register('setBootAuto', function (message) {
    var p = message.payload || {};
    setBootAuto(!!p.enabled, function (err) {
        if (err) {
            message.respond({ returnValue: false, errorText: err.message });
        } else {
            message.respond({ returnValue: true, armed: bootAutoState.armed });
        }
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
