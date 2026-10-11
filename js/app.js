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
        logForward: document.getElementById('logForward'),
        logHost: document.getElementById('logHost'),
        logPort: document.getElementById('logPort'),
        swEnabled: document.getElementById('swEnabled'),
        swSendOnBoot: document.getElementById('swSendOnBoot'),
        swLogForward: document.getElementById('swLogForward'),
        save: document.getElementById('btnSave'),
        exit: document.getElementById('btnExit'),
        wake: document.getElementById('btnWake'),
        status: document.getElementById('status'),
        btnLog: document.getElementById('btnLog'),
        logCard: document.getElementById('logCard'),
        logView: document.getElementById('logView'),
        logMeta: document.getElementById('logMeta'),
        logRefresh: document.getElementById('btnLogRefresh'),
        logClear: document.getElementById('btnLogClear'),
        logClose: document.getElementById('btnLogClose')
    };

    var devicesCache = []; // last scan results
    var logOpen = false;   // whether the in-app log panel is showing
    var logActive = 0;     // index of the highlighted log control (刷新/关闭)

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

    /* ---------------- in-app log viewer ------------------------------ */
    // 在电视上直接查看服务进程的内存日志（getLog），排障不必去电脑端抓文件。

    // 电视浏览器对 CSS `white-space: pre-wrap` 支持不牢靠，超长单行（例如
    // 一条完整的 activity create JSON 响应）会被容器宽度横向裁掉、且滚不出来。
    // 因此在 JS 端主动按固定宽度把长行拆成多行，保证任何长行都能完整显示。
    var LOG_WRAP_WIDTH = 90;
    // 日志打开时，上/下键显式滚动整页的步长（像素），用于 webOS 上可靠地翻页。
    var PAGE_SCROLL_STEP = 160;

    function wrapLogLine(line) {
        var s = String(line || '');
        if (s.length <= LOG_WRAP_WIDTH) { return s; }
        var out = [];
        var rest = s;
        while (rest.length > LOG_WRAP_WIDTH) {
            out.push(rest.slice(0, LOG_WRAP_WIDTH));
            rest = rest.slice(LOG_WRAP_WIDTH);
        }
        if (rest.length) { out.push(rest); }
        return out.join('\n');
    }

    function renderLog(lines) {
        var wrapped = [];
        for (var i = 0; i < lines.length; i++) {
            wrapped.push(wrapLogLine(lines[i]));
        }
        // 日志区为无限高度、随整页滚动，无需（也无法）在容器内部滚到底。
        els.logView.textContent = wrapped.length ? wrapped.join('\n') : '（服务暂无日志输出）';
    }

    function loadLog() {
        els.logView.textContent = '正在加载日志…';
        els.logMeta.textContent = '';
        callService('getLog', {}, 8000)
            .then(function (res) {
                var lines = res.lines || [];
                renderLog(lines);
                els.logMeta.textContent = '共 ' + lines.length + ' 行 · 服务已运行 ' +
                    Math.round((res.uptimeMs || 0) / 1000) + ' 秒';
                setStatus('日志已加载', 'ok');
            })
            .catch(function (err) {
                els.logView.textContent = '加载日志失败：' +
                    (err && (err.errorText || err.message) || '未知错误');
                setStatus('日志加载失败', 'err');
            });
    }

    function openLog() {
        logOpen = true;
        els.logCard.hidden = false;
        loadLog();
        // 日志随整页滚动；打开时把日志卡片带到可见区域，之后用滚轮滚动整页查看。
        els.logCard.scrollIntoView({ block: 'start' });
        els.logView.focus();
    }

    function closeLog() {
        logOpen = false;
        els.logCard.hidden = true;
        els.btnLog.focus();
    }

    function logFocusOrder() {
        return [els.logRefresh, els.logClear, els.logClose].filter(function (el) { return el && el.offsetParent !== null; });
    }

    function focusLogControl(delta) {
        var order = logFocusOrder();
        if (order.length === 0) { return; }
        logActive = (logActive + delta + order.length) % order.length;
        order[logActive].focus();
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
                els.logForward.checked = c.logForward === true;
                els.logHost.value = c.logHost || '192.168.1.6';
                els.logPort.value = c.logPort || 5555;
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
                els.logForward.checked = false;
                els.logHost.value = '192.168.1.6';
                els.logPort.value = 5555;
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
            sendOnBoot: els.sendOnBoot.checked,
            logForward: els.logForward.checked,
            logHost: els.logHost.value.trim(),
            logPort: parseInt(els.logPort.value, 10) || 5555
        };
    }

    function validMac(mac) {
        return /^[0-9a-fA-F:.\-]{12,17}$/.test(mac) &&
            mac.replace(/[^0-9a-fA-F]/g, '').length === 12;
    }

    function bootAutoTxt(ba) {
        if (!ba) { return ''; }
        if (ba.armed) { return '，开机自启已启用 ✓'; }
        var s = '，⚠ 开机自启启用失败';
        if (ba.error) { s += '（' + ba.error + '）'; }
        if (ba.diag) { s += '；诊断：' + ba.diag; }
        return s;
    }

    function lastWolTxt(ba) {
        if (!ba || !ba.armed) { return ''; }
        var m = {
            sent: '已发送 ✓',
            timeout: '等网络就绪超时（未发出）',
            error: '发送失败',
            done: '90秒循环发送已完成',
            none: '开机后尚未触发'
        };
        return '；上次开机唤醒：' + (m[ba.lastWol] || ba.lastWol);
    }

    function saveConfig() {
        var cfg = readForm();
        if (!validMac(cfg.mac)) {
            setStatus('请先选择设备或填写正确的 MAC 地址（例如 AA:BB:CC:DD:EE:FF）', 'err');
            return;
        }
        setStatus('保存中…');
        callService('setConfig', cfg)
            .then(function (res) {
                setStatus('已保存 ✓' + bootAutoTxt(res && res.bootAuto) +
            lastWolTxt(res && res.bootAuto), 'ok');
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

    /* ---------------- exit app -------------------------------------- */
    // 点击「退出」按钮时关闭应用，返回 webOS 桌面。webOS 中应用主窗口是
    // 系统创建的子窗口，因此 window.close() 即可终止并退出；部分固件支持
    // PalmSystem.close()，一并尝试兜底。
    function exitApp() {
        try {
            if (window.PalmSystem && typeof window.PalmSystem.close === 'function') {
                window.PalmSystem.close();
                return;
            }
        } catch (e) { /* ignore and fall through */ }
        try {
            window.close();
        } catch (e) { /* ignore */ }
    }

    /* ---------------- remote control navigation --------------------- */
    function getFocusOrder() {
        var sel = [
            els.device, els.scan, els.mac, els.ip, els.port,
            els.swEnabled, els.swSendOnBoot, els.swLogForward, els.logHost, els.logPort,
            els.save, els.exit, els.wake, els.btnLog
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
        else if (el === els.swLogForward) { els.logForward.checked = !els.logForward.checked; }
        else if (el.tagName === 'BUTTON') { el.click(); }
    }

    /* ---------------- deferred keyboard for text fields -------------- */
    // webOS 会在文本框获得焦点时立刻弹出系统软键盘，但用户往往只是在
    // 用方向键「路过」这些输入框，并不想马上打字。因此让输入框平时保持
    // readonly（聚焦不弹键盘），只有用户对某个输入框按 OK、明确要输入时
    // 才解除 readonly，这时系统才会弹出键盘。编辑结束（失焦）后自动恢复
    // readonly，下次再聚焦不会打扰。
    function isEditableInput(el) {
        return el && (el === els.mac || el === els.ip || el === els.port ||
            el === els.logHost || el === els.logPort);
    }

    ['mac', 'ip', 'port', 'logHost', 'logPort'].forEach(function (key) {
        els[key].addEventListener('blur', function () {
            this.readOnly = true; // 结束编辑/移开焦点后再次锁定
        });
    });

    document.addEventListener('keydown', function (e) {
        var key = e.keyCode;

        // While the log panel is open, route keys inside it.
        if (logOpen) {
            // 日志是「无限高度、随整页滚动」。webOS 浏览器对「方向键默认滚动整页」
            // 支持不可靠，因此这里显式用 window.scrollBy 滚动整个页面，滚轮（在
            // 非 overflow 元素上）默认也是滚动整页——两者都只拖页面、不碰日志内容。
            if (key === 40) { e.preventDefault(); window.scrollBy(0, PAGE_SCROLL_STEP); return; }  // down: 整页下滚
            if (key === 38) { e.preventDefault(); window.scrollBy(0, -PAGE_SCROLL_STEP); return; } // up: 整页上滚
            if (key === 37 || key === 39) { e.preventDefault(); focusLogControl(key === 39 ? 1 : -1); return; }
            if (key === 13) { e.preventDefault(); activateFocused(); return; }
            if (key === 461 || key === 8 || key === 27) { // Back / Exit / Esc: close
                e.preventDefault();
                closeLog();
                return;
            }
            return;
        }

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
            var act = document.activeElement;
            // 对仍处于锁定的输入框按 OK：解除 readonly，此时系统才弹软键盘。
            if (isEditableInput(act) && act.readOnly) {
                act.readOnly = false;
                act.focus();
            } else {
                activateFocused();
            }
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
    els.exit.addEventListener('click', exitApp);
    els.wake.addEventListener('click', wakeNow);
    els.btnLog.addEventListener('click', function () {
        if (logOpen) { closeLog(); } else { openLog(); }
    });
    els.logRefresh.addEventListener('click', loadLog);
    els.logClear.addEventListener('click', function () {
        callService('clearLog', {}, 8000)
            .then(function () {
                els.logView.textContent = '';
                els.logMeta.textContent = '已清空日志';
                setStatus('日志已清空', 'ok');
            })
            .catch(function (err) {
                setStatus('清空日志失败：' + ((err && (err.errorText || err.message)) || '未知错误'), 'err');
            });
    });
    els.logClose.addEventListener('click', closeLog);

    loadConfig();
    // Give the TV remote something focused right away.
    window.setTimeout(function () { focusAt(0); }, 300);

    // 后台服务自检：getStatus 不依赖 DB，若它也超时说明服务进程没起来/崩了。
    callService('getStatus', {}, 6000)
        .then(function (res) {
            setStatus('后台服务正常' + (res.localIp ? '，本机 ' + res.localIp : '') +
                bootAutoTxt(res && res.bootAuto) +
                lastWolTxt(res && res.bootAuto) + '。', 'ok');
        })
        .catch(function () {
            setStatus('警告：后台服务无响应。请重新部署或重启电视后重试。', 'err');
        });

})();
