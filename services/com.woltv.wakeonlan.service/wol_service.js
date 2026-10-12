var Service = require('webos-service');
var dgram = require('dgram');
var os = require('os');
var fs = require('fs');
var net = require('net');

var SERVICE_NAME = 'com.woltv.wakeonlan.service';
var DB_URI = 'luna://com.palm.db';
var KIND = 'com.woltv.wakeonlan:1';
var CONN_URI = 'luna://com.webos.service.connectionmanager';
var ACT_URI = 'luna://com.palm.activitymanager';
var ACT_NAME = 'com.woltv.wakeonlan.wake-loop';

var DEFAULT_CONFIG = {
    enabled: true,
    sendOnBoot: true,
    triggerOnNetwork: false,
    triggerTimer: false,
    timerInterval: 5,
    mac: 'CC:28:AA:A7:B4:1F',
    ip: '255.255.255.255',
    port: 9,
    broadcast: true
};

var service = new Service(SERVICE_NAME);
var lastSend = { at: 0, ok: false, error: '' };

var bootState = { error: '', lastSend: 'none' };
var netTriggerState = { active: false, lastSend: 'none', error: '' };
var netSub = null;
var prevNetConnected = null;
var keepAliveActivity = null;
var timerState = { active: false, lastSend: 'none', error: '' };

var configCache = null;

function lunaCall(uri, method, parameters, cb, timeoutMs) {
    var called = false;
    var timer = setTimeout(function () {
        if (!called) { called = true; cb({ returnValue: false, errorText: 'luna timeout' }); }
    }, timeoutMs || 5000);
    try {
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
        cb();
    });
}

function normalizeConfig(c) {
    return {
        _id: c && c._id,
        enabled: c ? c.enabled !== false : true,
        sendOnBoot: c ? c.sendOnBoot !== false : true,
        triggerOnNetwork: c ? c.triggerOnNetwork === true : false,
        triggerTimer: c ? c.triggerTimer === true : false,
        timerInterval: (c && typeof c.timerInterval === 'number') ? c.timerInterval : DEFAULT_CONFIG.timerInterval,
        mac: (c && c.mac) || DEFAULT_CONFIG.mac,
        ip: (c && c.ip) || DEFAULT_CONFIG.ip,
        port: (c && typeof c.port === 'number') ? c.port : DEFAULT_CONFIG.port,
        broadcast: c ? c.broadcast !== false : true
    };
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
        if (existing && existing._id) { obj._id = existing._id; }
        obj._kind = KIND;
        obj.enabled = cfg.enabled !== false;
        obj.sendOnBoot = cfg.sendOnBoot !== false;
        obj.triggerOnNetwork = cfg.triggerOnNetwork === true;
        obj.triggerTimer = cfg.triggerTimer === true;
        obj.timerInterval = typeof cfg.timerInterval === 'number' ? cfg.timerInterval : DEFAULT_CONFIG.timerInterval;
        obj.mac = (cfg.mac || DEFAULT_CONFIG.mac).toString();
        obj.ip = (cfg.ip || DEFAULT_CONFIG.ip).toString();
        obj.port = typeof cfg.port === 'number' ? cfg.port : DEFAULT_CONFIG.port;
        obj.broadcast = cfg.broadcast !== false;

        configCache = normalizeConfig(obj);

        function doPut() {
            dbCall('put', { objects: [obj] }, function (res) {
                if (res && res.returnValue) {
                    cb(null, configCache);
                } else {
                    ensureKind(function () {
                        dbCall('put', { objects: [obj] }, function (res2) {
                            if (res2 && res2.returnValue) {
                                cb(null, configCache);
                            } else {
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

function getLocalIpv4() {
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
                    if (p.length === 4 && p[0] === 169 && p[1] === 254) { continue; }
                    return a.address;
                }
            }
        }
    } catch (e) { }
    return null;
}

function parseArpTableText(text) {
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
        try { sock.destroy(); } catch (e) { }
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
    var PORTS = [445];
    var total = targets.length * PORTS.length;
    var index = 0;
    var inflight = 0;
    var MAX = 50;
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
    var localIp = getLocalIpv4();
    var initial = readArpTable();
    var broadcast = null;
    if (localIp) {
        var parts = localIp.split('.').map(Number);
        broadcast = parts[0] + '.' + parts[1] + '.' + parts[2] + '.255';
    }
    tcpSweep(function () {
        var after = readArpTable();
        var merged = dedupe(initial.concat(after));
        merged.sort(function (a, b) { return a.ip.localeCompare(b.ip); });
        cb(null, { devices: merged, broadcast: broadcast, localIp: localIp });
    });
}

function buildMagicPacket(mac) {
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

var NET_CHECK_INTERVAL_MS = 5000;
var NET_CHECK_TIMEOUT_MS = 5 * 60 * 1000;

function isConnectedPayload(res) {
    if (!res) { return false; }
    var state = String(res.state || '').toLowerCase();
    var inetState = String(res.internetConnectionState || '').toLowerCase();
    return res.connected === true || res.connected === 'connected' ||
        (res.wired && (res.wired.connected === true ||
            String(res.wired.state || '').toLowerCase() === 'connected')) ||
        (res.wifi && (res.wifi.connected === true ||
            String(res.wifi.state || '').toLowerCase() === 'connected')) ||
        state === 'connected' || state === 'ipv4' || state === 'ipv6' ||
        inetState === 'connected';
}

function networkReady(cb) {
    lunaCall(CONN_URI, 'getStatus', {}, function (res) {
        cb(isConnectedPayload(res));
    }, 3000);
}

function startNetworkTrigger(cfg) {
    stopNetworkTrigger();
    if (!(cfg.enabled && cfg.triggerOnNetwork)) { return; }
    try {
        service.activityManager.create('keepAlive', function (activity) {
            keepAliveActivity = activity;
        });
    } catch (e) { }
    try {
        netSub = service.subscribe(CONN_URI + '/getStatus', { subscribe: true });
        netSub.on('response', function (message) {
            var payload = message && message.payload;
            var connected = isConnectedPayload(payload);
            if (prevNetConnected === false && connected) {
                netTriggerState.lastSend = 'sending';
                netTriggerState.error = '';
                sendMagicPacket(cfg, function (sendErr) {
                    netTriggerState.lastSend = sendErr ? 'error' : 'sent';
                    netTriggerState.error = sendErr ? (sendErr.message || String(sendErr)) : '';
                });
            }
            prevNetConnected = connected;
            netTriggerState.active = true;
        });
        netSub.on('cancel', function () {
            netTriggerState.active = false;
        });
    } catch (e) {
        netTriggerState.active = false;
    }
}

function stopNetworkTrigger() {
    if (netSub) {
        try { netSub.cancel(); } catch (e) { }
        netSub = null;
    }
    if (keepAliveActivity) {
        try { service.activityManager.complete(keepAliveActivity, function () { }); } catch (e) { }
        keepAliveActivity = null;
    }
    prevNetConnected = null;
    netTriggerState.active = false;
}

function formatInterval(minutes) {
    var m = parseInt(minutes, 10) || 5;
    if (m < 5) { m = 5; }
    var h = Math.floor(m / 60);
    var r = m % 60;
    if (h > 0 && r > 0) { return h + 'h' + r + 'm'; }
    if (h > 0) { return h + 'h'; }
    return m + 'm';
}

function startTimerTrigger(cfg) {
    stopTimerTrigger();
    if (!(cfg.enabled && cfg.triggerTimer)) { return; }
    lunaCall(ACT_URI, 'create', {
        activity: {
            name: ACT_NAME,
            description: 'Periodic wake-on-LAN for Windows PC',
            type: { persist: true, background: true },
            schedule: { interval: formatInterval(cfg.timerInterval) },
            callback: {
                method: 'luna://' + SERVICE_NAME + '/wake',
                params: { mac: cfg.mac, ip: cfg.ip, port: cfg.port, broadcast: cfg.broadcast }
            }
        },
        start: true,
        replace: true
    }, function (res) {
        if (res && res.returnValue) {
            timerState.active = true;
            timerState.error = '';
        } else {
            timerState.active = false;
            timerState.error = String((res && res.errorText) || 'activity create failed');
        }
    }, 6000);
}

function stopTimerTrigger() {
    lunaCall(ACT_URI, 'cancel', { activityId: ACT_NAME }, function () {
        timerState.active = false;
    }, 6000);
}

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
            finish(new Error('network not ready within 5 minutes'));
            return;
        }
        networkReady(function (ok) {
            if (done) { return; }
            if (ok) {
                sendWOL(cfg, function (err) { finish(err); });
            } else {
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
        try { socket.close(); } catch (e) { }
        cb(err);
    }

    socket.on('error', function (err) {
        finish(err);
    });

    socket.bind(function () {
        try {
            if (cfg.broadcast !== false) {
                socket.setBroadcast(true);
            }
            socket.send(packet, 0, packet.length, port, host, function (err) {
                if (err) {
                    finish(err);
                } else {
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

function startBootAutosend() {
    loadConfig(function (err, cfg) {
        configCache = JSON.parse(JSON.stringify(cfg));
        startNetworkTrigger(cfg);
        startTimerTrigger(cfg);
        if (!(cfg.enabled && cfg.sendOnBoot)) { return; }
        sendMagicPacket(cfg, function (sendErr) {
            bootState.lastSend = sendErr ? 'error' : 'sent';
            bootState.error = sendErr ? (sendErr.message || String(sendErr)) : '';
        });
    });
}

startBootAutosend();

service.register('wake', function (message) {
    var p = message.payload || {};
    loadConfig(function (err, cfg) {
        if (p.mac) { cfg.mac = p.mac; }
        if (p.ip) { cfg.ip = p.ip; }
        if (p.port) { cfg.port = p.port; }
        if (p.broadcast !== undefined) { cfg.broadcast = p.broadcast; }

        function respond(sendErr) {
            if (sendErr) {
                bootState.lastSend = 'error';
                bootState.error = sendErr.message || String(sendErr);
                message.respond({ returnValue: false, errorText: sendErr.message, errorCode: -1 });
            } else {
                bootState.lastSend = 'sent';
                bootState.error = '';
                message.respond({ returnValue: true, sent: true });
            }
        }

        sendMagicPacket(cfg, function (sendErr) {
            respond(sendErr);
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
                message.respond({ returnValue: false, errorText: String(saveErr.errorText || saveErr) });
            } else {
                startNetworkTrigger(saved);
                startTimerTrigger(saved);
                message.respond({ returnValue: true, config: saved, bootAuto: bootState, netTrigger: netTriggerState, timer: timerState });
            }
        });
    } catch (e) {
        message.respond({ returnValue: false, errorText: String(e && e.message || e) });
    }
});

service.register('getStatus', function (message) {
    message.respond({
        returnValue: true,
        lastSend: lastSend,
        bootAuto: bootState,
        netTrigger: netTriggerState,
        timer: timerState
    });
});

service.register('scan', function (message) {
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
