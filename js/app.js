/*
 * Front-end app for Wake on LAN (webOS TV)
 * -----------------------------------------
 * Uses the built-in PalmServiceBridge to call the JS service
 * `com.woltv.wakeonlan.service` (no external webOSTV.js needed).
 *
 * - Scans the LAN and lets the user pick the target device from a dropdown
 *   (much easier than typing MAC/IP with a TV remote).
 * - Fully navigable with the TV remote: direction keys move focus, OK
 *   activates the focused control.
 */

(function () {
    'use strict';

    var SERVICE = 'luna://com.woltv.wakeonlan.service';

    var els = {
        device: document.getElementById('device'),
        deviceList: document.getElementById('deviceList'),
        scan: document.getElementById('btnScan'),
        mac: document.getElementById('mac'),
        ip: document.getElementById('ip'),
        port: document.getElementById('port'),
        enabled: document.getElementById('enabled'),
        sendOnBoot: document.getElementById('sendOnBoot'),
        swEnabled: document.getElementById('swEnabled'),
        swSendOnBoot: document.getElementById('swSendOnBoot'),
        save: document.getElementById('btnSave'),
        wake: document.getElementById('btnWake'),
        status: document.getElementById('status')
    };

    var devicesCache = []; // last scan results

    /* ---------------- service call helper (PalmServiceBridge) ------- */
    // webOS 要求 onservicecallback 返回 true，否则某些固件会丢弃响应导致卡住；
    // 再加超时兜底，保证界面永远不会卡在「保存中」。扫描类调用可传更长超时。
    var CALL_TIMEOUT = 12000;

    function callService(method, params, timeoutMs) {
        return new Promise(function (resolve, reject) {
            var bridge = new PalmServiceBridge();
            var settled = false;

            function settle(fn, val) {
                if (settled) { return; }
                settled = true;
                fn(val);
            }

            bridge.onservicecallback = function (response) {
                var msg;
                try {
                    msg = JSON.parse(response);
                } catch (e) {
                    settle(reject, { errorText: '服务返回格式错误' });
                    return true;
                }
                if (msg && msg.returnValue) {
                    settle(resolve, msg);
                } else {
                    settle(reject, msg || { errorText: '服务返回未知错误' });
                }
                return true; // 关键：webOS 需要回调返回 true
            };

            setTimeout(function () {
                settle(reject, { errorText: '服务无响应（超时）' });
            }, timeoutMs || CALL_TIMEOUT);

            try {
                bridge.call(SERVICE + '/' + method, JSON.stringify(params || {}));
            } catch (e) {
                settle(reject, { errorText: '调用服务失败: ' + (e && e.message || e) });
            }
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

    /* ---------------- device dropdown ------------------------------- */
    // 使用自定义下拉列表（非原生 <select>），否则 webOS 电视上的系统原生
    // 下拉弹层会吞掉遥控器返回键，导致用户进入列表后无法退出。
    function macLabel(mac) {
        return String(mac || '').toUpperCase();
    }

    var deviceOptions = []; // [{ value, label }]
    var deviceSelected = 0; // index of the chosen option
    var deviceOpen = false;
    var deviceActive = 0;   // index of the highlighted option while open

    function rebuildDeviceList(devices, broadcast) {
        devicesCache = devices || [];
        deviceOptions = [];

        // 1) Preserve the currently saved target as the first option.
        var curMac = macLabel(els.mac.value.trim());
        var curIp = els.ip.value.trim();
        if (curMac && curMac.length >= 12) {
            deviceOptions.push({
                value: curMac,
                label: '当前设置 (' + curMac + (curIp ? ' / ' + curIp : '') + ')'
            });
        } else {
            deviceOptions.push({ value: '', label: '—— 请选择设备 ——' });
        }

        // 2) Discovered devices.
        if (broadcast) {
            deviceOptions.push({
                value: 'broadcast:' + broadcast,
                label: '广播唤醒所有设备 (' + broadcast + ')'
            });
        }
        for (var i = 0; i < devicesCache.length; i++) {
            var d = devicesCache[i];
            var label = (d.ip || '?') + (d.mac ? '  (' + macLabel(d.mac) + ')' : '');
            deviceOptions.push({ value: d.mac + '|' + (d.ip || ''), label: label });
        }

        deviceSelected = matchCurrentIndex();
        renderDeviceList();
        setTriggerLabel();
    }

    function renderDeviceList() {
        var frag = document.createDocumentFragment();
        for (var i = 0; i < deviceOptions.length; i++) {
            (function (idx) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'dd-item';
                btn.setAttribute('role', 'option');
                btn.textContent = deviceOptions[idx].label;
                btn.addEventListener('click', function () {
                    selectDevice(idx);
                    closeDropdown();
                });
                frag.appendChild(btn);
            })(i);
        }
        els.deviceList.innerHTML = '';
        els.deviceList.appendChild(frag);
    }

    // Index of the option matching the current MAC (fall back to 0).
    function matchCurrentIndex() {
        var curMac = macLabel(els.mac.value.trim());
        for (var i = 0; i < deviceOptions.length; i++) {
            if (curMac && deviceOptions[i].value.indexOf(curMac) === 0) { return i; }
        }
        return 0;
    }

    function selectDevice(idx) {
        if (idx < 0 || idx >= deviceOptions.length) { return; }
        deviceSelected = idx;
        applyDeviceValue(deviceOptions[idx].value);
        setTriggerLabel();
    }

    function setTriggerLabel() {
        var opt = deviceOptions[deviceSelected];
        els.device.textContent = opt ? opt.label : '—— 请选择设备 ——';
    }

    function applyDeviceValue(val) {
        if (!val) { return; }
        if (val.indexOf('broadcast:') === 0) {
            els.mac.value = '';
            els.ip.value = val.slice('broadcast:'.length);
            els.mac.placeholder = '广播模式：请在下方手动填 MAC';
            return;
        }
        var parts = val.split('|');
        var mac = parts[0] || '';
        var ip = parts[1] || '';
        if (mac) { els.mac.value = mac; }
        if (ip) { els.ip.value = ip; }
        els.mac.placeholder = 'AA:BB:CC:DD:EE:FF';
        setStatus('已选择设备：' + mac + (ip ? ' @ ' + ip : ''), 'ok');
    }

    function openDropdown() {
        if (deviceOpen) { return; }
        deviceOpen = true;
        els.device.setAttribute('aria-expanded', 'true');
        els.deviceList.hidden = false;
        deviceActive = deviceSelected;
        updateActiveItem();
    }

    function closeDropdown() {
        if (!deviceOpen) { return; }
        deviceOpen = false;
        els.device.setAttribute('aria-expanded', 'false');
        els.deviceList.hidden = true;
        els.device.focus();
    }

    function updateActiveItem() {
        var items = els.deviceList.children;
        for (var i = 0; i < items.length; i++) {
            items[i].classList.toggle('focused', i === deviceActive);
        }
        if (items[deviceActive]) {
            items[deviceActive].scrollIntoView({ block: 'nearest' });
        }
    }

    function moveActive(delta) {
        if (deviceOptions.length === 0) { return; }
        deviceActive = (deviceActive + delta + deviceOptions.length) % deviceOptions.length;
        updateActiveItem();
    }

    function chooseActive() {
        selectDevice(deviceActive);
        closeDropdown();
    }

    function scanDevices() {
        setStatus('正在扫描局域网…');
        els.scan.disabled = true;
        // scan 后端要做整段子网的探测，给它更长的超时（默认只有 12s）。
        callService('scan', {}, 30000)
            .then(function (res) {
                var devs = res.devices || [];
                rebuildDeviceList(devs, res.broadcast);
                if (devs.length === 0) {
                    setStatus('未发现在线设备。目标电脑若处于关机状态无法被发现，请先开机扫描一次，或直接手动填写 MAC 地址。', '');
                } else {
                    setStatus('扫描完成：发现 ' + devs.length + ' 台设备，请选择', 'ok');
                }
            })
            .catch(function (err) {
                // Scan may be unavailable on some firmware; fall back to manual.
                rebuildDeviceList([], null);
                var msg = (err && (err.errorText || err.message)) || '未知错误';
                setStatus('扫描失败：' + msg + '。请手动填写 MAC 地址。', 'err');
            })
            .then(function () {
                els.scan.disabled = false;
            });
    }

    /* ---------------- load / save ----------------------------------- */
    // 默认目标电脑 MAC（硬编码，装完即用，不用遥控打字）。
    var DEFAULT_MAC = 'CC:28:AA:A7:B4:1F';

    function ensureMacDefault() {
        if (!els.mac.value.trim()) { els.mac.value = DEFAULT_MAC; }
    }

    function loadConfig() {
        callService('getConfig')
            .then(function (res) {
                var c = res.config;
                els.mac.value = c.mac || '';
                els.ip.value = c.ip || '255.255.255.255';
                els.port.value = c.port || 9;
                els.enabled.checked = c.enabled !== false;
                els.sendOnBoot.checked = c.sendOnBoot !== false;
                ensureMacDefault(); // 存的是空就回退到默认 MAC
                rebuildDeviceList([], null);
                setStatus('已加载设置。可点「扫描设备」选择目标。', 'ok');
            })
            .catch(function () {
                // First run: nothing stored yet. Use the hardcoded default.
                els.mac.value = DEFAULT_MAC;
                els.ip.value = '255.255.255.255';
                els.port.value = 9;
                els.enabled.checked = true;
                els.sendOnBoot.checked = true;
                rebuildDeviceList([], null);
                setStatus('已使用默认目标（' + DEFAULT_MAC + '），可直接保存。', '');
            });
    }

    function readForm() {
        return {
            mac: els.mac.value.trim(),
            ip: els.ip.value.trim() || '255.255.255.255',
            port: parseInt(els.port.value, 10) || 9,
            enabled: els.enabled.checked,
            sendOnBoot: els.sendOnBoot.checked
        };
    }

    function validMac(mac) {
        return /^[0-9a-fA-F:.\-]{12,17}$/.test(mac) &&
            mac.replace(/[^0-9a-fA-F]/g, '').length === 12;
    }

    function saveConfig() {
        var cfg = readForm();
        if (!validMac(cfg.mac)) {
            setStatus('请先选择设备或填写正确的 MAC 地址（例如 AA:BB:CC:DD:EE:FF）', 'err');
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
        if (!validMac(cfg.mac)) {
            setStatus('请先选择设备或填写正确的 MAC 地址', 'err');
            return;
        }
        setStatus('正在发送魔术包…');
        callService('wake', cfg)
            .then(function () {
                setStatus('魔术包已发送 ✓（若电脑未开机，请检查网络/WOL 设置）', 'ok');
            })
            .catch(showError);
    }

    /* ---------------- remote control navigation --------------------- */
    function getFocusOrder() {
        var sel = [
            els.device, els.scan, els.mac, els.ip, els.port,
            els.swEnabled, els.swSendOnBoot, els.save, els.wake
        ];
        return sel.filter(function (el) { return el && el.offsetParent !== null; });
    }

    function focusAt(index) {
        var order = getFocusOrder();
        if (order.length === 0) { return; }
        var i = (index + order.length) % order.length;
        order[i].focus();
        order[i].scrollIntoView({ block: 'nearest' });
    }

    function currentIndex() {
        var order = getFocusOrder();
        return order.indexOf(document.activeElement);
    }

    function activateFocused() {
        var el = document.activeElement;
        if (!el) { return; }
        if (el === els.swEnabled) { els.enabled.checked = !els.enabled.checked; }
        else if (el === els.swSendOnBoot) { els.sendOnBoot.checked = !els.sendOnBoot.checked; }
        else if (el.tagName === 'BUTTON') { el.click(); }
        // For text/number inputs, OK keeps native editing behaviour.
    }

    document.addEventListener('keydown', function (e) {
        var key = e.keyCode;

        // While the device list is open, route keys inside it.
        if (deviceOpen) {
            if (key === 40 || key === 38) {      // down / up: move highlight
                e.preventDefault();
                moveActive(key === 40 ? 1 : -1);
                return;
            }
            if (key === 13) {                    // OK: choose highlighted option
                e.preventDefault();
                chooseActive();
                return;
            }
            if (key === 461 || key === 8 || key === 27) { // Back / Exit / Esc
                e.preventDefault();
                closeDropdown();                 // exit the list
                return;
            }
            if (key === 37 || key === 39) {      // left / right: exit list, continue page nav
                closeDropdown();
                // fall through to normal focus navigation
            } else {
                return;                          // swallow other keys while open
            }
        }

        var active = document.activeElement;

        // Direction keys: move focus.
        if (key === 38 || key === 40 || key === 37 || key === 39) {
            e.preventDefault();
            var idx = currentIndex();
            if (key === 38 || key === 37) { focusAt(idx - 1); }
            else { focusAt(idx + 1); }
            return;
        }

        // OK / Enter: activate.
        if (key === 13) {
            e.preventDefault();
            activateFocused();
            return;
        }

        // Back / Exit on the main page: this is a single-screen app, so there
        // is no internal page to "go back" to — the expected behaviour is to
        // close the app and return to the launcher. Deliberately do NOT
        // preventDefault here: let webOS's default action close the app window.
        // (Backspace/8 only matters while typing in a field, where the browser
        // default of deleting a character is exactly what we want.)
        if (key === 461 || key === 8) {
            return;
        }
    });

    /* ---------------- wire up --------------------------------------- */
    els.scan.addEventListener('click', scanDevices);
    els.device.addEventListener('click', function () {
        if (deviceOpen) { closeDropdown(); }
        else { openDropdown(); }
    });
    els.save.addEventListener('click', saveConfig);
    els.wake.addEventListener('click', wakeNow);

    loadConfig();
    // Give the TV remote something focused right away.
    window.setTimeout(function () { focusAt(0); }, 300);

    // 后台服务自检：getStatus 不依赖 DB，若它也超时说明服务进程没起来/崩了。
    callService('getStatus', {}, 6000)
        .then(function (res) {
            setStatus('后台服务正常' + (res.localIp ? '，本机 ' + res.localIp : '') + '。', 'ok');
        })
        .catch(function () {
            setStatus('警告：后台服务无响应。请重新部署或重启电视后重试。', 'err');
        });

})();
