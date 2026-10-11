/*
 * Wake on LAN service for webOS TV
 * ---------------------------------
 * Runs as a Node.js JS Service in the background on the TV.
 * - 开机自动唤醒：电视开机后（服务被 Activity Manager 的触发器拉起），
 *   在 90 秒窗口内每 2 秒循环发送一次 Wake-on-LAN 魔术包（UDP），确保电脑收到。
 *   触发源为 connectionmanager/getStatus（tvpower/displayStatus/screenState 对第三方
 *   服务无 ACG 权限、无法武装，已删除）。关键：常驻服务另设【屏幕状态看护 + 轮询看护】，
 *   靠「屏幕灭→亮」边沿触发——即使开启「即时开机 / Quick Start+」导致 powerState 在短待机时
 *   不变化，屏幕也一定在每次开机时由灭变亮，因此【每次开机（含短待机唤醒）】都能发送魔术包。
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
    // 发送节奏：服务进程存活期间，每 sendIntervalSec 秒持续发送一次魔术包
    // （死循环，不依赖任何触发信号），确保「电视一直发」。默认 1 秒。
    sendIntervalSec: 1,
    // 拉起节奏：持久化周期 Activity 每 pullIntervalSec 秒主动拉起本服务一次。
    // 这是「开机后服务没被拉起」的根治手段——无论电视开机/唤醒/快速启动，
    // 周期 Activity 都会定时把服务拉起来，不依赖 powerState/屏幕触发器。
    pullIntervalSec: 20,
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
var bootAutoState = { armed: false, error: '', lastWol: 'none', lastPowerState: '', resumeFires: 0, screenOnFires: 0, triggers: {} };

/*
 * 开机触发源列表。
 * 真机实测（2026）：第三方服务对 tvpower/powerState、systemservice/displayStatus、
 * tvpower/screenState 均无 ACG 权限，这些触发器武装必然失败（trigger[...] FAILED），
 * 已删除。唯一可武装的是 connectionmanager/getStatus（网络状态）：
 *   - net  : com.webos.service.connectionmanager/getStatus  冷开机时网络从无到有的变化，
 *            作为「彻底断电/完全关机再开机」的兜底（此时网络是就绪的最可靠信号）。
 * 该 Activity 触发会拉起服务并调用 wake。服务常驻后由周期拉起(pull) +
 * screenWatch / powerWatch 看护负责「短待机唤醒」的检测。
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

// 常驻 Activity：让服务进程被 Activity Manager 持续持有而不退出。
// 方向 1 的核心——服务被 net 触发器拉起后，通过 adopt 这个无触发器、start:true
// 的持久化后台 Activity 成为其 parent，从而保持进程常驻；进程存活期间
// startPowerWatch 直连订阅的 tvpower/powerState 一直监听，待机唤醒时能抓到
// Standby→Active 边沿并触发发送（绕开 AM 触发器对 tvpower 的 ACG 限制）。
var KEEPALIVE_ACTIVITY_NAME = BOOT_ACTIVITY_NAME + '.keepalive';

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

/*
 * 屏幕状态看护（screenWatch）。
 * ------------------------------------------------------------------
 * 关键修复：仅靠 powerState 的 Standby→Active 边沿在「即时开机 / Quick Start+」
 * 下不可靠——短待机时电视并不真正断电，powerState 全程停在 Active，根本不发生
 * 边沿，于是基于边沿的触发永远等不到，电脑就不会被唤醒（用户实测：遥控关机后
 * 短时间内再开不触发，关 1 小时后才触发）。
 *
 * 真正在【每次】唤醒（无论长短待机、是否 Quick Start+）都会变化的是【屏幕状态】：
 * 待机/睡眠时屏幕是关的，一开机屏幕就亮。screenState（tvpower）与 displayStatus
 * （systemservice）都能反映屏幕亮/灭。本服务通过 keep-alive 常驻，短待机期间进程
 * 不退出，因此能稳定订阅到「屏幕灭→亮」的边沿并触发发送——这正是短待机唤醒时
 * 之前漏掉的关键信号。
 * ------------------------------------------------------------------ */
var screenWatch = {
    active: false,
    subs: [],            // 所有屏幕相关订阅句柄
    lastOn: false,       // 最近一次是否「屏幕亮」
    sawFirst: false,     // 是否已收到过第一条屏幕状态（用于跳过首次快照）
    fires: 0             // 检测到的「屏幕灭→亮」边沿次数
};

function isScreenOn(val) {
    var s = String(val || '').toLowerCase();
    return s === 'on' || s === 'active' || s === 'screen_on' || s === 'picture_on' ||
           s === 'true' || s === '1';
}

// 统一的「电视刚被唤醒」入口：无论来自 powerState 边沿还是屏幕亮起边沿，
// 都走这里。内部 bootLoopRunning 防抖保证同一进程内不重复。
function fireWakeEvent(source) {
    try { startBootAutosend(); } catch (e) {
        console.log('wol: ' + source + ' wake event error: ' + e);
    }
}

function handleScreenOn() {
    screenWatch.fires++;
    bootAutoState.screenOnFires = screenWatch.fires;
    console.log('wol: screen turned ON (screen edge #' + screenWatch.fires +
        '); starting boot send loop');
    fireWakeEvent('screen');
}

// 处理 screenState 订阅消息（com.webos.service.tvpower/screenState）
function handleScreenStateMessage(message) {
    var payload = (message && message.payload) || {};
    if (payload.returnValue === false) {
        console.log('wol: screenState subscribe error: ' +
            (payload.errorText || payload.error || 'unknown'));
        return;
    }
    var val = payload.screenState !== undefined ? payload.screenState : payload.state;
    if (val === undefined || val === null) { return; }
    var on = isScreenOn(val);
    console.log('wol: screenState = ' + val + (on ? ' (on)' : ' (off)'));
    if (screenWatch.sawFirst) {
        // 只有在已经看到过屏幕状态、且确实发生了「灭→亮」边沿时才触发，
        // 避免订阅建立时的首次快照被误当成一次唤醒。
        if (on && !screenWatch.lastOn) {
            handleScreenOn();
        }
    } else {
        screenWatch.sawFirst = true;
        console.log('wol: screenState initial snapshot (no send): ' + val);
    }
    screenWatch.lastOn = on;
}

// 处理 displayStatus 订阅消息（com.webos.service.systemservice/displayStatus）
function handleDisplayStatusMessage(message) {
    var payload = (message && message.payload) || {};
    if (payload.returnValue === false) {
        console.log('wol: displayStatus subscribe error: ' +
            (payload.errorText || payload.error || 'unknown'));
        return;
    }
    // displayStatus 常见字段：status = "Screen On"/"Screen Off"，或 state。
    var raw = payload.status !== undefined ? payload.status : payload.state;
    if (raw === undefined || raw === null) { return; }
    var on = isScreenOn(raw);
    console.log('wol: displayStatus = ' + raw + (on ? ' (on)' : ' (off)'));
    if (screenWatch.sawFirst) {
        if (on && !screenWatch.lastOn) {
            handleScreenOn();
        }
    } else {
        screenWatch.sawFirst = true;
        console.log('wol: displayStatus initial snapshot (no send): ' + raw);
    }
    screenWatch.lastOn = on;
}

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
            fireWakeEvent('power');
        }
    } else {
        console.log('wol: powerState = ' + state +
            (prev ? ' (unchanged)' : ' (initial, no send)'));
    }
}

// 订阅一个 luna 方法（屏状态），返回是否成功订阅。
function subscribeScreenMethod(uri, method, handler) {
    try {
        var sub = service.subscribe(uri + '/' + method, { subscribe: true }, handler);
        if (sub) { screenWatch.subs.push(sub); return true; }
    } catch (e) {
        console.log('wol: screen subscribe error (' + uri + '/' + method + '): ' + e);
    }
    return false;
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

    // 新增：屏幕状态看护（短待机唤醒的关键信号）。订阅多个可能的屏幕状态源，
    // 任一可用即可；个别源失败不影响其它源。
    if (screenWatch.active) { return; }
    screenWatch.active = true;
    var s1 = subscribeScreenMethod('luna://com.webos.service.tvpower', 'screenState', handleScreenStateMessage);
    var s2 = subscribeScreenMethod('luna://com.webos.service.systemservice', 'displayStatus', handleDisplayStatusMessage);
    console.log('wol: screen watch ' +
        ((s1 ? 'screenState ok ' : 'screenState FAIL ') +
         (s2 ? 'displayStatus ok' : 'displayStatus FAIL')) +
        ' (any is enough for warm-resume wake)');

    // 订阅建立后立刻开始轮询看护（见 startScreenPoll）。
    startScreenPoll();
}

/* ------------------------------------------------------------------ *
 *  屏幕/电源轮询看护（订阅失效时的兜底）
 *  ------------------------------------------------------------------ *
 *  某些固件上第三方服务订阅 screenState / displayStatus 可能被 ACG 拒绝，
 *  导致上面的屏幕订阅一个都建立不起来。作为兜底，常驻服务每隔一段时间主动
 *  查询一次「屏幕是否亮着」：如果上一轮是灭、这一轮是亮，就认为发生了一次
 *  唤醒并触发发送。这样即使订阅全失败，短待机唤醒依然能被抓到。
 * ------------------------------------------------------------------ */
var SCREEN_POLL_INTERVAL_MS = 10000;  // 每 10 秒查一次（常驻服务，开销极低）
var screenPollTimer = null;
var pollLastScreenOn = null;          // null=尚未获得首条真实值
var pollFirstSeen = false;

function queryScreenState(cb) {
    // 依次尝试 screenState / displayStatus / powerState，取第一个能返回有效值的。
    var tried = 0;
    var sources = [
        { uri: 'luna://com.webos.service.tvpower', method: 'screenState', extract: function (p) {
            var v = p.screenState !== undefined ? p.screenState : p.state;
            return v === undefined ? null : { on: isScreenOn(v), raw: v };
        }},
        { uri: 'luna://com.webos.service.systemservice', method: 'displayStatus', extract: function (p) {
            var v = p.status !== undefined ? p.status : p.state;
            return v === undefined ? null : { on: isScreenOn(v), raw: v };
        }},
        { uri: 'luna://com.webos.service.tvpower', method: 'powerState', extract: function (p) {
            var v = p.powerState;
            return v === undefined ? null : { on: isActivePowerState(v), raw: v, isPower: true };
        }}
    ];
    function next() {
        if (tried >= sources.length) { cb(null); return; }
        var src = sources[tried++];
        try {
            lunaCall(src.uri, src.method, { subscribe: false }, function (res) {
                if (res && res.returnValue) {
                    var r = src.extract(res);
                    if (r) { cb(r); return; }
                }
                next();
            }, 2500);
        } catch (e) { next(); }
    }
    next();
}

function startScreenPoll() {
    if (screenPollTimer) { return; }
    screenPollTimer = setInterval(function () {
        queryScreenState(function (r) {
            if (!r) { return; } // 全失败，跳过这一轮
            if (!pollFirstSeen) {
                pollFirstSeen = true;
                pollLastScreenOn = r.on;
                console.log('wol: poll initial screen=' + r.raw + (r.isPower ? ' (powerState)' : ''));
                return;
            }
            // 上一轮灭、这一轮亮 -> 唤醒
            if (r.on && !pollLastScreenOn) {
                console.log('wol: poll detected wake (screen ' +
                    (pollLastScreenOn === null ? 'unknown' : 'off') + ' -> ' + r.raw + ')');
                handleScreenOn();
            }
            pollLastScreenOn = r.on;
        });
    }, SCREEN_POLL_INTERVAL_MS);
    console.log('wol: screen poll watchdog started (every ' +
        (SCREEN_POLL_INTERVAL_MS / 1000) + 's)');
}

/* ------------------------------------------------------------------ *
 *  周期拉起（服务常驻 & 死循环拉起）—— 根治「开机不拉起」
 *  ------------------------------------------------------------------ *
 *  webOS 的第三方 JS 服务进程是懒启动的：只有 (a) 有总线客户端调用它，或
 *  (b) Activity Manager 拉起它，进程才会起来。用户实测遥控开机（短待机/
 *  快速启动）后服务没被拉起、powerState/屏幕触发器都不触发——这是病根。
 *
 *  方案：在 setBootAuto() 中武装一个【带周期 schedule 的持久化 Activity】，
 *  它不依赖任何电源/屏幕信号，而是每 pullIntervalSec 秒主动调用本服务的
 *  `wake` 方法（拉起进程并启动持续发送循环），并 adopt 使其常驻。等价于
 *  系统层的「死循环」——电视只要开机，无论处于什么电源状态，服务都会在几秒
 *  内被拉起来并持续发送魔术包，先保证电脑一定能被唤醒。
 * ------------------------------------------------------------------ */

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
        pullIntervalSec: (c && typeof c.pullIntervalSec === 'number' && c.pullIntervalSec >= 5)
            ? c.pullIntervalSec : DEFAULT_CONFIG.pullIntervalSec,
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
        obj.pullIntervalSec = (typeof cfg.pullIntervalSec === 'number' && cfg.pullIntervalSec >= 5)
            ? cfg.pullIntervalSec : DEFAULT_CONFIG.pullIntervalSec;
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
        // 取消所有触发源对应的 Activity + 常驻 Activity。
        var cancelNames = BOOT_TRIGGERS.map(function (t) { return t.name; });
        cancelNames.push(KEEPALIVE_ACTIVITY_NAME);
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

    // 为每个触发源逐个武装 + 武装周期拉起 Activity；记录每个的结果，全部完成后回填总状态。
    var pullKey = 'pull';
    var remaining = BOOT_TRIGGERS.length + 1; // +1 是周期拉起 Activity
    var anyArmed = false;
    var lastError = '';

    function maybeFinish() {
        if (remaining > 0) { return; }
        bootAutoState.armed = anyArmed;
        bootAutoState.error = anyArmed ? '' : (lastError || 'all triggers failed');
        console.log('wol: boot auto-launch ' +
            (anyArmed ? 'ARMED (triggers ' + (BOOT_TRIGGERS.length - countFailed()) + '/' + BOOT_TRIGGERS.length +
                        ' + pull ' + (bootAutoState.triggers[pullKey] && bootAutoState.triggers[pullKey].armed ? 'OK' : 'FAIL') + ')' :
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

    // 周期拉起 Activity：不依赖任何电源/屏幕信号，每 pullIntervalSec 秒主动拉起
    // 本服务（回调 wake -> 拉起进程并启动持续发送循环）。这是「开机不拉起」的
    // 根治手段。precise:true 表示不使用智能对齐间隔，按精确 interval 触发。
    var pullInterval = (configCache && typeof configCache.pullIntervalSec === 'number')
        ? configCache.pullIntervalSec : DEFAULT_CONFIG.pullIntervalSec;
    if (pullInterval < 5) { pullInterval = 5; }
    lunaCall(AM_URI, 'create', {
        activity: {
            name: KEEPALIVE_ACTIVITY_NAME,
            description: 'Periodically pull up WOL service to send magic packets on every TV power-on',
            type: { background: true, persist: true },
            schedule: { interval: pullInterval + 's', precise: true },
            callback: { method: 'luna://com.woltv.wakeonlan.service/wake', params: { fromPull: true, source: pullKey } }
        },
        replace: true,
        start: true,
        subscribe: true
    }, function (res) {
        var ok = !!(res && res.returnValue);
        var pullAid = res && res.activityId;
        bootAutoState.triggers[pullKey] = {
            armed: ok,
            error: ok ? '' : ((res && (res.errorText || res.error)) || 'pull activity create failed')
        };
        if (ok) { anyArmed = true; } else { lastError = bootAutoState.triggers[pullKey].error; }
        console.log('wol: pull[' + pullKey + '] ' +
            (ok ? 'ARMED (every ' + pullInterval + 's)' : 'FAILED (' + bootAutoState.triggers[pullKey].error + ')'));
        // 立即 adopt 该周期 Activity：使本服务进程成为其 parent 而常驻，这样
        // 持续发送循环在两次拉起之间不会断（进程不退出）。
        if (ok && pullAid) {
            lunaCall(AM_URI, 'adopt', { activityId: pullAid, wait: false, subscribe: true }, function (res2) {
                console.log('wol: pull adopt ' +
                    ((res2 && res2.returnValue) ? 'OK (service resident)' : 'FAILED (' + (res2 && (res2.errorText || res2.error)) + ')'));
            }, 6000);
        }
        remaining--;
        maybeFinish();
    }, 6000);

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
 *  Service entry point: 持续发送（死循环）
 * ------------------------------------------------------------------ *
 *  只要服务进程存活，就【一直发魔术包】，不做任何检测、不设窗口、永不自动停止。
 *  每 sendIntervalSec 秒发一次（默认 1 秒），配合周期拉起 Activity（pull 触发器）
 *  保证：电视一开机服务就被拉起来，起来后立刻持续发——彻底绕开 powerState /
 *  屏幕触发器「短待机不触发」的问题，先保证电脑一定能被唤醒。
 *
 *  进程级防抖 bootLoopRunning：服务被周期 Activity / AM 触发器反复拉起时，每次
 *  service registered 都会重新走 startBootAutosend。若发送循环已在本进程跑着，
 *  就跳过，避免重复起循环。
 * ------------------------------------------------------------------ */
var bootLoopRunning = false;          // 进程级防抖：同进程只跑一个持续发送循环

function startBootAutosend() {
    var sendCfg = configCache ? JSON.parse(JSON.stringify(configCache))
                              : JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    // 从 DB 取真实配置（失败或超时就用默认配置），随后启动持续发送循环。
    try {
        dbCall('find', { query: { from: KIND } }, function (res) {
            if (res && res.returnValue && res.results && res.results.length) {
                sendCfg = normalizeConfig(res.results[0]);
                configCache = JSON.parse(JSON.stringify(sendCfg));
            }
            // 进程级防抖：电视开机后周期 Activity / AM 触发器可能把本服务拉起
            // 多次（每次 service registered 都会再跑 startBootAutosend）。若发送
            // 循环已在本进程跑着，就忽略这次，避免重复从头发送 / 反复重建
            // Activity 造成自触发循环。
            if (bootLoopRunning) {
                console.log('wol: continuous loop already running in this process; skip re-arm');
                return;
            }
            // Re-arm the persistent pull/trigger Activities to match stored config.
            // (replace:true makes this idempotent, and it self-heals if lost.)
            // 周期拉起 Activity 已并入 setBootAuto：只要启用，无论电源/屏幕信号，
            // 都会每 pullIntervalSec 秒定时拉起本服务。
            setBootAuto(!!(sendCfg.enabled && sendCfg.sendOnBoot), function () {});
            runContinuousSendLoop(sendCfg);
        }, 4000);
    } catch (e) {
        runContinuousSendLoop(sendCfg);
    }
}

function runContinuousSendLoop(cfg) {
    if (bootLoopRunning) { return; }   // 同一进程只跑一个持续发送循环
    bootLoopRunning = true;

    if (!(cfg.enabled && cfg.sendOnBoot)) {
        console.log('wol: continuous send disabled (enabled=' + cfg.enabled +
            ', sendOnBoot=' + cfg.sendOnBoot + ')');
        bootLoopRunning = false;
        return;
    }

    var intervalMs = (typeof cfg.sendIntervalSec === 'number' && cfg.sendIntervalSec >= 1)
        ? cfg.sendIntervalSec * 1000 : DEFAULT_CONFIG.sendIntervalSec * 1000;
    var sent = 0;

    console.log('wol: continuous send loop STARTED (every ' +
        (intervalMs / 1000) + 's, never stops while resident)');

    function sendOnce() {
        sendWOLWhenNetworkReady(cfg, function (err) {
            if (err) {
                bootAutoState.lastWol = 'error';
                console.log('wol: continuous send failed: ' + err.message);
            } else {
                sent++;
                bootAutoState.lastWol = 'sent';
                recordSend(true, '');
                console.log('wol: magic packet ' + sent + ' sent -> ' + cfg.mac);
            }
            // 等本次（含网络等待）结束后再排下一轮，避免未联网时叠出多个等待循环。
            setTimeout(sendOnce, intervalMs);
        });
    }
    sendOnce();
}

try {
    startBootAutosend();
} catch (e) {
    console.log('wol: startup error: ' + e);
}

// 服务内直连订阅 tvpower/powerState + 屏幕状态（screenState/displayStatus）
// + 轮询看护：服务进程存活期间即使 AM 触发器漏掉待机唤醒的边沿，这里也能补上。
// 关键：屏幕「灭→亮」在【每次】开机（含即时开机/Quick Start+ 的短待机唤醒）都
// 必然发生，因此常驻服务能可靠抓到短待机唤醒并触发发送——这正好修复用户实测的
// 「遥控关机后短时间再开不触发、关 1 小时后才触发」问题。
try {
    startPowerWatch();
} catch (e) {
    console.log('wol: powerState watch startup error: ' + e);
}

// 常驻与周期拉起：持久化周期 Activity（并入 setBootAuto 武装）会在电视开机后
// 每 pullIntervalSec 秒主动拉起本服务，并 adopt 使其常驻；持续发送循环保证
// 一直发魔术包。屏幕/电源看护（startPowerWatch）作为冗余补充。
// （setBootAuto 已在 startBootAutosend 中被调用并创建该周期 Activity。）

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

        // 被周期拉起 Activity 回调（fromPull）时：本服务刚被拉起来，务必启动
        // 持续发送循环（死循环），确保之后一直发。
        if (p.fromPull && !bootLoopRunning) {
            console.log('wol: pulled up by periodic activity; starting continuous loop');
            if (cfg.enabled && cfg.sendOnBoot) { runContinuousSendLoop(cfg); }
        }

        // 手动触发或任一开机触发器回调（fromBoot/fromPull）一律直接发一次魔术包，
        // 不做电源/网络检测——优先保证唤醒成功。
        sendMagicPacket(cfg, function (sendErr) {
            if (sendErr) {
                bootAutoState.lastWol = 'error';
                message.respond({ returnValue: false, errorText: sendErr.message, errorCode: -1 });
            } else {
                bootAutoState.lastWol = 'sent';
                var src = p.fromPull ? ' (fromPull)' : (p.fromBoot ? ' (fromBoot)' : '');
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
