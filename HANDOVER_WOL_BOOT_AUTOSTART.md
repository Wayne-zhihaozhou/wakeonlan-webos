# 交接文档 · 电视开机自动唤醒电脑（开机自启问题）

> 供接手同事排查/解决「电视开机 → 电脑自动开机」的问题。
> 项目根：`C:\0_Code\wakeonlan-webos`　|　文档更新：2026-10-11　|　状态：**根因修正：冷开机（彻底断电）无法自启是平台限制；用户实际用法=遥控器待机唤醒，改用 tvpower/powerState 触发器（待机唤醒即触发）+ 电源守卫，待真机复测**

---

## 0. 需求（用户原话）

> 电视开机后不会自动启动我的应用 / 服务，需要我手动打开应用电脑才开机。不符合要求。
> 我要求的是：**电视开机、电脑开机，两者同步开机，时间越近越好。**

一句话：**电视一开机，同一局域网内的 Win11 电脑就自动被 WoL 唤醒，无需任何人手动操作。**

---

## 1. 现状（已部署环境）

| 项 | 值 |
| --- | --- |
| 电视 | **LG G6，2026 款，webOS 26**，IP `192.168.1.4` |
| 应用 | `com.woltv.wakeonlan` v0.0.1（web 应用 + JS Service） |
| 电脑 | Win11，走**有线网卡** IP `192.168.1.6`，MAC `CC:28:AA:A7:B4:1F` |
| 局域网 | `192.168.1.0/24`，网关 `192.168.1.1` |
| 路由器 | **荣耀（Honor）XD16** —— 华为系固件，**无 SSH/telnet/自定义脚本**，无法在路由器上跑脚本 |
| 电脑侧 WoL 配置 | 已全部就绪（有线网卡 WoL 开启、快速启动已关），`check-wol-win.ps1` 全 OK |
| 手动链路 | ✅ **验证可用**：在应用里点「立即唤醒（测试）」→ 电脑能正常开机 |

---

## 2. 已确认的根因（最重要，先讲清楚）

**LG webOS 不会自动拉起第三方应用的 JS Service 进程。** JS Service 是"懒启动"的——
只有**打开应用**，或总线上有其它进程调用它时，服务进程才会被启动
（官方 `services.json` 文档原话：service 在 *when the application is started* 时运行）。

因此原来方案的问题不是"发 WoL 的代码"有问题，而是：
- 电视冷开机时，**没有任何东西去启动 `wol_service.js` 这个进程**；
- 服务进程没启动 → 它内部的"开机自动发送"逻辑根本没机会执行 → 电脑不醒；
- 用户**手动打开应用** = 手动拉起了服务进程 → 电脑才醒。

> 之前 README/HANDOVER 里"webOS 会自动拉起 JS Service"的说法是**错的**，已在文档中更正。

**2026-10-11 真机结论（用户实测，推翻此前"触发链路已打通"的判断）：**
- 用户**遥控器待机**（不拔电）→ 开机等 10 分钟，电脑端**收不到任何转发日志**；
- 一旦**手动打开应用**，日志立刻到达。说明**开机时服务进程根本没被拉起**——
  之前文档第 4 节"重大进展（service registered 连续出现、magic packet sent）"里的日志，
  实际上是**手动打开应用后**才产生的，**不是**开机自动触发产生的。
- 进一步确认：**连接管理器触发器（connectionmanager/getStatus）在"待机唤醒"场景不会 fire**——
  待机期间 Wi-Fi 一直连着，唤醒瞬间网络状态**无变化**，Activity 触发器只在状态**变化**时触发，
  所以永远等不到。这就是之前冷开机/待机唤醒都不生效的真正原因（不是 persist 不被恢复，
  而是**触发事件没发生**；用户用待机而非彻底断电，persist 在这场景根本不重要）。

---

## 3. 已经做的修改（均已提交 git，且真机验证了一部分）

目标：让电视开机时**自动**触发发送，无需打开应用。
采用 webOS **Activity Manager**（`luna://com.palm.activitymanager`）注册一个**持久化、带触发器**的 Activity：
电视开机、网络就绪（`connectionmanager/getStatus` 订阅变化）→ 触发 → 回调直接调用服务的 `wake` 方法发魔术包。

改动文件（最近提交：`1afdf4c`「wake 先等网络就绪再发魔术包」、`df63f9b`「修复 service.call 调用方式 + UI 自动诊断」）：
1. `services/com.woltv.wakeonlan.service/wol_service.js`
   - `setBootAuto(enabled, cb)`：`create`（`replace/start/subscribe:true`、`type:{background,persist}`、
     `trigger: connectionmanager/getStatus`、`callback: wake`）或 `cancel`；触发器地址**多候选**尝试
     （`com.webos.service` → `com.palm` 两种 connectionmanager）。
   - **修复调用方式**：`service.call` 必须用「完整 URI 带方法名 + 原始 payload」
     `service.call(uri + '/' + method, parameters)`，不能传 `{method, parameters}` 包装。
   - **修复时机**：`wake` 会先等 `networkReady()`（最多 2 分钟）再发，等待期间不 `respond`。
   - `setConfig`/`startBootAutosend` 按配置自动同步武装；`getStatus` 返回 `bootAuto`。
   - `setBootAuto(enabled, cb)` 为**内部函数**（非总线方法），由 `setConfig`/`startBootAutosend` 内部调用。
2. `services/com.woltv.wakeonlan.service/services.json` —— 声明总线命令（不含 `setBootAuto`，其为内部逻辑）。
3. `js/app.js` —— 状态栏显示开机自启状态 + **UI 自动诊断**（无需看日志）。
4. `README.md`、`HANDOVER.md`、`HANDOVER_WOL_BOOT_AUTOSTART.md` —— 文档同步。

**真机验证结果（已部署到 LG G6 / webOS 26）：**
- ✅ `url 无效` 报错已消除：保存设置后状态栏显示「开机自启已启用 ✓」（说明 Activity 已被 Activity Manager 受理）。
- ❌ **端到端失败**：完全关电视再开机，**电脑始终没有被唤醒**。已连续两次真实测试均如此。

> 关键结论：**触发器能"武装成功"（create 不报错），但电视冷开机后回调并没有真正把电脑唤醒。**

**2026-10-11 改动（针对真机结论的修复，未复测）：**
- **触发器优先级改为 `luna://com.webos.service.tvpower/powerState` 优先**（原 connectionmanager/getStatus 靠后）。
  powerState 在「待机→开机」状态变化瞬间就 fire，最贴合用户「遥控器待机开电视」的实际用法；
  connectionmanager 触发器在待机唤醒场景不 fire（见第 2 节），保留仅作冷开机网络就绪兜底。
- **电源守卫 `isTvActive()`**：tvpower/powerState 触发器在「开机→待机」方向也会 fire，
  为避免用户按遥控器让电视进待机时把刚关机的电脑又唤醒，`wake`（fromBoot 分支）和
  `runBootSendLoop` 发送循环在发包前都会先查电视电源状态，只有 Active 才发；非 Active 记为
  `lastWol='skip'`，窗口内中途待机则提前结束循环。查询失败 fail-open（照发）。
- **诊断增强**：`bootAutoState` 新增 `trigger`（实际生效的触发器 URI）、`lastPowerState`；
  UI 状态栏会显示实际触发器与电源状态，`skip` 状态也会显示。
- 真机复测步骤见下节。

---

## 4. 当前卡点（需要接手同事解决的事）

> **2026-10-10 重大进展**：抓到的开机日志显示触发链路其实**已经打通**了——
> `service com.woltv.wakeonlan.service registered` 连续出现、`magic packet sent to
> 255.255.255.255:9`、`activity create ... returnValue:true` + `boot auto-launch ARMED`
> 都正常。也就是说：**服务能被拉起、Activity 能触发、包也真的发出来了**，但电脑还是不醒。
>
> 结合「手动点『立即唤醒（测试）』能唤醒、电脑侧 check-wol-win 全 OK」这两个事实，
> 根因锁定为**发送时机**：电视冷开机瞬间（`service registered` 后仅 ~37ms）Wi-Fi 还没
> 连上就发广播包，包根本出不了电视；此前的代码为了图省事**删掉了网络就绪判断**，所以
> 窗口内的前几包全在「无网」状态下发出，白白浪费。
>
> **已做的修复（`services/.../wol_service.js`）**：
> - 开机发送循环改为**先等网络就绪**（`networkReady()`：有真实 IPv4 + `/proc/net/route`
>   有默认路由，路由文件不可读则退回仅看 IP），就绪后才进入 90s/每 2s 的发送窗口；
>   等网络最多 30s，超时也照发，避免卡死。
> - 加了**进程级防抖** `bootLoopRunning`：电视开机后 Activity 触发器可能把服务拉起多次
>   （日志里曾见 `service registered` 连出现 3 次），每次都会重跑开机发送、重建 Activity
>   造成自触发循环。现在同进程只跑一轮。
>
> **下一步（真机复测）**：重新部署（`deploy-wakeonlan.ps1`）→ 打开应用保存一次配置
> （确认状态栏「开机自启已启用 ✓」）→ **完全关机→再开机** → 看电脑是否被唤醒；
> 开机日志应看到 `wol: network ready after xxxms; starting boot send` 后再发包。

**现象（最新）**：保存设置后状态栏「开机自启已启用 ✓」——Activity 武装**成功**；
但**完全关电视再开机后，电脑从未被唤醒**（已两次真机复现）。

这说明问题不在"能不能注册 Activity"，而在"**冷开机后这个 Activity 有没有真正触发并完成唤醒**"。
接手者下一步**必须上真机抓日志**（电视上看日志不便，见第 9 节坑；可用 `ares-log` 在电脑端抓）：

**接手第一步（诊断触发链路断在哪一环）：**
1. 重新部署：
   ```powershell
   cd C:\0_Code\wakeonlan-webos
   powershell -ExecutionPolicy Bypass -File .\deploy-wakeonlan.ps1   # 断 VPN 后执行
   ```
2. 打开应用 → 勾选「开机自动发送」→ 保存，确认状态栏「开机自启已启用 ✓」且括号里显示
   **`tvpower/powerState`**（若显示的是 connectionmanager，说明 tvpower 触发器被固件拒绝，
   诊断逻辑会如实显示实际生效的触发器）。
3. **按遥控器让电视进入待机 → 等 30 秒 → 再按遥控器开机**（模拟用户真实用法），看电脑是否被唤醒：
   - 电视从待机唤醒瞬间 → powerState Standby→Active → Activity 触发 → 服务被拉起 → 发魔术包。
   - 开机后电脑端抓日志：
     ```powershell
     ares-log --device lg com.woltv.wakeonlan.service
     ```
     重点看标志：`boot auto-launch ARMED via luna://com.webos.service.tvpower/powerState`、
     `boot wake sent -> ... (powerState=Active)`。若看到 `boot trigger fired but TV powerState=...
     (not Active); skip wake` 或 `boot send skipped`，说明触发器在待机方向 fire 被守卫正确拦下。
   - **反向验证**：电视开机状态按遥控器进待机，电脑**不应**被唤醒（守卫生效）。
   - **UI 状态栏**（打开应用可见）：`上次开机唤醒：已发送 ✓（电源状态=Active）`；若显示
     `电视非开机状态，跳过唤醒` 说明守卫拦下了待机方向触发。

   **不用日志也能看（UI 状态栏）**：服务已把「最近一次开机唤醒结果」写进 `bootAuto.lastWol`，
   打开应用后状态栏会显示：
   - `上次开机唤醒：开机后尚未触发` → Activity 冷开机**没有触发**（重点排查方向 B：Activity 未重武装/未触发）；
   - `上次开机唤醒：等网络就绪超时（未发出）` → **重点方向 A：`networkReady()` 在 webOS 上探测不到网络**；
   - `上次开机唤醒：已发送 ✓` → 包已发出，若电脑仍不醒则排查发送目标/网段。

**接手者重点怀疑 / 排查方向（按可能性排序）：**
- **A. `networkReady()`/`os.networkInterfaces()` 在 webOS 上不反映 WiFi**：`getLocalIpv4()` 可能一直返回
  null（webOS 的 Node 对网络接口的报告与普通 Linux 不同），导致 `wake` 一直等到 2 分钟超时、不发包。
  排查：开机后日志若持续出现 `wake aborted, network not ready` 即实锤。修法：改用连接管理器的
  `com.webos.service.connectionmanager/getStatus` 返回的**有线/WiFi 状态或 IP 字段**判断就绪，
  而不是依赖 `os.networkInterfaces()`；或在发送前强制按 `cfg.ip` 直发而不等接口探测。
- **B. Activity 冷开机后没有被重新武装 / 没有触发**：`persist` 活动对第三方可能不会在每次开机自动
  重新武装，或触发器没有在"网络就绪"这个时刻触发。排查：看开机后是否连 `service registered` 都没有。
- **C. 回调被触发但目标地址/广播问题**：手动唤醒可用，基本可排除，但仍可核对 `cfg.ip` 是否落到正确网段。

> **建议**：在方案 A 上花少量时间（重点是确认 `networkReady` 是否真的在开机后变 true），
> 并抓开机日志定位触发链路断在哪一环（见第 4 节）。

---

## 5. 接下来怎么排查 / 候选方向

### 方案 A：修好电视侧 Activity Manager（零额外硬件，先花少量时间）
> ⚠️ `url 无效` 调用方式问题**已修复**，Activity 已能武装成功；但**真机冷开机两次仍不醒**。
> 方案 A 目前只剩"触发链路"没打通，重点先查第 4 节的**方向 A（networkReady 是否真的变 true）**：
> - 确认 `os.networkInterfaces()` 在 webOS 上是否反映 WiFi；若一直拿不到 IP，`wake` 会等到 2 分钟超时。
> - 备用触发器：系统电源事件（`com.webos.service.tvpower` / `systemservice` powerState 订阅）。

### 其它方向（需调研，仅记录）
- webOS bootd（`com.webos.service.bootd`）能否把 JS Service 加入开机启动——大概率需签名/root，消费者固件不开放。
- `appinfo.json` 是否有"开机自启"字段——官方文档未见，基本不可用。

> **建议**：电视侧 Activity 方案已在真机**两次失败**（能武装但不唤醒）。先花少量时间按第 4 节
> 抓日志确认「触发链路断在哪一环」（重点方向 A：networkReady 是否变 true），确认后再决定下一步。

---

## 6. 电脑侧必备条件（缺一不可，接手前先核对）

`check-wol-win.ps1` 已全 OK，但改过电脑/网卡后要重跑：
```powershell
cd C:\0_Code\wakeonlan-webos
powershell -ExecutionPolicy Bypass -File .\check-wol-win.ps1 -Fix   # 管理员：检查并自动修复
```
要点：有线网卡开 WoL（允许此设备唤醒 + Wake on Magic Packet）、**快速启动已关闭**、与电视同网段。

---

## 7. 重新打包 / 部署 / 日志命令（速查）

```powershell
cd C:\0_Code\wakeonlan-webos
powershell -ExecutionPolicy Bypass -File .\deploy-wakeonlan.ps1   # 一键：连通→密钥→打包→安装→启动（断 VPN）

# 手动方式：
ares-package . .\services\com.woltv.wakeonlan.service
ares-install --device lg .\dist\com.woltv.wakeonlan_0.0.1_all.ipk
ares-launch  --device lg com.woltv.wakeonlan
ares-log     --device lg com.woltv.wakeonlan.service
# 卸载：ares-remove --device lg com.woltv.wakeonlan
```
服务日志中成功标志：`wol: boot auto-launch armed` → 电视重启后 `wol: magic packet sent to ...`。

---

## 8. 排障速查

| 现象 | 原因 / 处理 |
| --- | --- |
| 保存后状态栏「开机自启已启用 ✓」，但**完全关机再开机后电脑不醒** | **当前核心卡点**。Activity 能武装但冷开机触发链路没打通。按第 4 节抓日志，判断断在：① 服务进程没被拉起（无 `service registered`）→ Activity 未触发/未重武装；② 有 `wake aborted, network not ready` → `networkReady()` 在 webOS 上探测不到网络（重点方向 A）；③ 无 `wake sent` → 回调未真正发包。 |
| `url 不是一个有效网址`（持久与非持久都报） | **已修复**：`service.call` 必须用「完整 URI 带方法名 + 原始 payload」。若再看到此错，确认 `lunaCall` 用的是 `service.call(uri + '/' + method, parameters, ...)`。 |
| 保存后状态栏仍提示失败 | 用 `ares-log` 看 `wol: activity create [N] ... -> { ... }` 与 `wol: boot auto-launch attempt [N] FAILED (...)`。 |
| `192.168.1.4:9922` 连不上 / getkey 失败 | 电脑开了 VPN，与电视不同网段 → **部署时断开 VPN**。 |
| ping 通但 9922 不通 | 电视 Developer Mode 应用需保持前台、Key Server 开、会话未过期；必要时重启电视。 |
| 手动唤醒能开机、开机自启不行 | **核心现状**：手动链路 OK、Activity 武装 OK，但冷开机不醒。先按第 4 节抓日志定位触发链路断在哪一环。 |

---

## 9. 编码 / 格式避坑（改文件前必读）

- `*.ps1` 必须是 **UTF-8 带 BOM**（否则 Windows PowerShell 5.1 会把中文按 GBK 解析而报错）。
  改完检查首字节为 `EF BB BF`，补 BOM 命令见原 `HANDOVER.md` 第 8 节。
- `.js / .json / .html / .md` 用 **UTF-8（不带 BOM 即可）**。
- 服务代码用 **ES5 风格**（`var` / 回调），兼容电视上的旧 Node。
- **⚠ 坑：电视上看 ares-log 不方便，别把诊断信息只打在日志里。** 用户/接手同事在电视前只能看应用 UI 状态栏，
  所以任何排障结论（如「url 报错是不是误判」）都必须**同步显示到 UI 状态栏**（见第 8 节）。
  日志仅作补充，UI 才是主排障入口。

---

## 10. 交接人给接手同事的一句话建议

**不要只盯着"能不能武装"——那已经成功了。真正的坑是：Activity 武装 OK，但电视冷开机后电脑就是不醒（两次实测）。**
下一步的唯一关键是**抓开机日志定位触发链路断在哪一环**（见第 4 节）：
- 连 `service registered` 都没有 → Activity 冷开机根本没触发/没重武装；
- 有 `wake aborted, network not ready` → `networkReady()` 在 webOS 上探测不到网络，改判断方式；
- 有 `wake sent` 仍不醒 → 再看发送目标/网段。

排障时可把电视日志实时推到电脑上看（电视应用勾选「把日志转发到电脑」+ 电脑运行 `receive-log.ps1`），
或在本机用 `capture-boot-log.ps1` 抓电视冷开机后的日志，定位更省事。
