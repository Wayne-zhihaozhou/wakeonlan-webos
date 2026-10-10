/*
 * Wake on LAN service for webOS TV
 * ---------------------------------
 * Runs as a Node.js JS Service in the background on the TV.
 * - On service start (which happens when the TV boots / the service is
 *   launched) it checks the stored config. If "sendOnBoot" is enabled it
 *   waits `bootDelayMs` (to let the network come up) and sends a Wake-on-LAN
 *   magic packet (UDP) so the PC boots automatically.
 * - Registers bus methods used by the front-end app:
 *     wake       -> send a magic packet now
 *     getConfig  -> return stored config
 *     setConfig  -> persist config (DB8)
 *     getStatus  -> last send result / service uptime
 *
 * Uses only built-in Node modules (`dgram`) plus the webOS `webos-service`
 * module, which is pre-installed on the TV. No npm install needed.
 */

var Service = require('webos-service');
var dgram = require('dgram');

var SERVICE_NAME = 'com.woltv.wakeonlan.service';
var DB_URI = 'luna://com.palm.db';
var KIND = 'com.woltv.wakeonlan:1';

var DEFAULT_CONFIG = {
    enabled: true,          // master switch
    sendOnBoot: true,       // auto-send magic packet when TV boots
    bootDelayMs: 15000,     // wait after service start before sending
    mac: 'CC:28:AA:A7:B4:1F', // 目标电脑 有线(Realtek 2.5GbE) 网卡 MAC（推荐走有线才可靠）
    ip: '255.255.255.255',  // 广播地址；也可填电脑的固定 IP（单播更稳）
    port: 9,                // WoL standard port
    broadcast: true         // set UDP broadcast flag when sending
};

var service = new Service(SERVICE_NAME);
var startedAt = Date.now();
var lastSend = { at: 0, ok: false, error: '' };

/* ------------------------------------------------------------------ *
 *  DB8 helpers (config persistence via luna://com.palm.db)
 * ------------------------------------------------------------------ */
function dbCall(method, parameters, cb) {
    service.call(DB_URI, { method: method, parameters: parameters }, function (message) {
        cb(message.payload || { returnValue: false });
    });
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

function loadConfig(cb) {
    dbCall('find', { query: { from: KIND } }, function (res) {
        if (res && res.returnValue && res.results && res.results.length > 0) {
            var c = res.results[0];
            cb(null, {
                _id: c._id,
                enabled: c.enabled !== false,
                sendOnBoot: c.sendOnBoot !== false,
                bootDelayMs: c.bootDelayMs || DEFAULT_CONFIG.bootDelayMs,
                mac: c.mac || DEFAULT_CONFIG.mac,
                ip: c.ip || DEFAULT_CONFIG.ip,
                port: c.port || DEFAULT_CONFIG.port,
                broadcast: c.broadcast !== false
            });
        } else {
            cb(null, JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
        }
    });
}

function saveConfig(cfg, cb) {
    loadConfig(function (err, existing) {
        var obj = {};
        if (existing && existing._id) {
            obj._id = existing._id; // upsert existing object
        }
        obj._kind = KIND;
        obj.enabled = cfg.enabled !== false;
        obj.sendOnBoot = cfg.sendOnBoot !== false;
        obj.bootDelayMs = typeof cfg.bootDelayMs === 'number' ? cfg.bootDelayMs : DEFAULT_CONFIG.bootDelayMs;
        obj.mac = (cfg.mac || DEFAULT_CONFIG.mac).toString();
        obj.ip = (cfg.ip || DEFAULT_CONFIG.ip).toString();
        obj.port = typeof cfg.port === 'number' ? cfg.port : DEFAULT_CONFIG.port;
        obj.broadcast = cfg.broadcast !== false;

        dbCall('put', { objects: [obj] }, function (res) {
            if (res && res.returnValue) {
                cb(null, obj);
            } else {
                cb(res || { error: 'db put failed' });
            }
        });
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

/* ------------------------------------------------------------------ *
 *  Service entry point: auto-send once at boot if enabled
 * ------------------------------------------------------------------ */
function sendMagicPacket(cfg, cb) {
    if (!cfg) { cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); }
    sendWOL(cfg, function (err) {
        recordSend(!err, err && err.message);
        if (cb) { cb(err); }
    });
}

ensureKind(function () {
    loadConfig(function (err, cfg) {
        if (cfg && cfg.enabled && cfg.sendOnBoot) {
            var delay = cfg.bootDelayMs || DEFAULT_CONFIG.bootDelayMs;
            console.log('wol: service started; auto-sending magic packet in ' + delay + 'ms');
            setTimeout(function () {
                sendMagicPacket(cfg);
            }, delay);
        } else {
            console.log('wol: service started; auto-send disabled (enabled=' +
                (cfg && cfg.enabled) + ', sendOnBoot=' + (cfg && cfg.sendOnBoot) + ')');
        }
    });
});

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
        sendMagicPacket(cfg, function (sendErr) {
            if (sendErr) {
                message.respond({ returnValue: false, errorText: sendErr.message, errorCode: -1 });
            } else {
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
    if (!p.mac) {
        message.respond({ returnValue: false, errorText: 'mac is required' });
        return;
    }
    saveConfig(p, function (saveErr, saved) {
        if (saveErr) {
            message.respond({ returnValue: false, errorText: String(saveErr.errorText || saveErr) });
        } else {
            message.respond({ returnValue: true, config: saved });
        }
    });
});

service.register('getStatus', function (message) {
    message.respond({
        returnValue: true,
        uptimeMs: Date.now() - startedAt,
        lastSend: lastSend
    });
});

console.log('wol: service ' + SERVICE_NAME + ' registered');
