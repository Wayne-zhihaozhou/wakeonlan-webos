/*
 * Front-end app for Wake on LAN (webOS TV)
 * -----------------------------------------
 * Uses the built-in PalmServiceBridge to call the JS service
 * `com.woltv.wakeonlan.service` (no external webOSTV.js needed).
 *
 * Loads current config, lets the user edit it, saves it, and can
 * trigger a test wake.
 */

(function () {
    'use strict';

    var SERVICE = 'luna://com.woltv.wakeonlan.service';

    var els = {
        mac: document.getElementById('mac'),
        ip: document.getElementById('ip'),
        port: document.getElementById('port'),
        enabled: document.getElementById('enabled'),
        sendOnBoot: document.getElementById('sendOnBoot'),
        bootDelay: document.getElementById('bootDelay'),
        save: document.getElementById('btnSave'),
        wake: document.getElementById('btnWake'),
        status: document.getElementById('status')
    };

    /* ---------------- service call helper (PalmServiceBridge) ------- */
    function callService(method, params) {
        return new Promise(function (resolve, reject) {
            var bridge = new PalmServiceBridge();
            bridge.onservicecallback = function (response) {
                var msg;
                try {
                    msg = JSON.parse(response);
                } catch (e) {
                    reject({ errorText: 'bad response' });
                    return;
                }
                if (msg && msg.returnValue) {
                    resolve(msg);
                } else {
                    reject(msg || { errorText: 'unknown error' });
                }
            };
            bridge.call(SERVICE + '/' + method, JSON.stringify(params || {}));
        });
    }

    /* ---------------- status helpers -------------------------------- */
    function setStatus(text, kind) {
        els.status.textContent = text;
        els.status.className = 'status' + (kind ? ' ' + kind : '');
    }

    function showError(err) {
        setStatus('错误: ' + (err && (err.errorText || err.message) || '未知错误'), 'err');
    }

    /* ---------------- load / save ----------------------------------- */
    function loadConfig() {
        callService('getConfig')
            .then(function (res) {
                var c = res.config;
                els.mac.value = c.mac || '';
                els.ip.value = c.ip || '255.255.255.255';
                els.port.value = c.port || 9;
                els.enabled.checked = c.enabled !== false;
                els.sendOnBoot.checked = c.sendOnBoot !== false;
                els.bootDelay.value = Math.round((c.bootDelayMs || 15000) / 1000);
                setStatus('已加载设置', 'ok');
            })
            .catch(function (err) {
                // First run: nothing stored yet. Pre-fill defaults and allow save.
                els.mac.value = 'CC:28:AA:A7:B4:1F';
                els.ip.value = '255.255.255.255';
                els.port.value = 9;
                els.enabled.checked = true;
                els.sendOnBoot.checked = true;
                els.bootDelay.value = 15;
                setStatus('首次使用：请核对 MAC 并保存', '');
            });
    }

    function readForm() {
        return {
            mac: els.mac.value.trim(),
            ip: els.ip.value.trim() || '255.255.255.255',
            port: parseInt(els.port.value, 10) || 9,
            enabled: els.enabled.checked,
            sendOnBoot: els.sendOnBoot.checked,
            bootDelayMs: (parseInt(els.bootDelay.value, 10) || 15) * 1000
        };
    }

    function saveConfig() {
        var cfg = readForm();
        if (!/^[0-9a-fA-F:.\-]{12,17}$/.test(cfg.mac) ||
            cfg.mac.replace(/[^0-9a-fA-F]/g, '').length !== 12) {
            setStatus('MAC 地址格式不正确（例如 AA:BB:CC:DD:EE:FF）', 'err');
            return;
        }
        setStatus('保存中…');
        callService('setConfig', cfg)
            .then(function () {
                setStatus('已保存 ✓', 'ok');
            })
            .catch(showError);
    }

    function wakeNow() {
        var cfg = readForm();
        if (!/^[0-9a-fA-F:.\-]{12,17}$/.test(cfg.mac) ||
            cfg.mac.replace(/[^0-9a-fA-F]/g, '').length !== 12) {
            setStatus('MAC 地址格式不正确', 'err');
            return;
        }
        setStatus('正在发送魔术包…');
        callService('wake', cfg)
            .then(function () {
                setStatus('魔术包已发送 ✓（若电脑未开机，请检查网络/WOL 设置）', 'ok');
            })
            .catch(showError);
    }

    /* ---------------- wire up --------------------------------------- */
    els.save.addEventListener('click', saveConfig);
    els.wake.addEventListener('click', wakeNow);

    loadConfig();
})();
