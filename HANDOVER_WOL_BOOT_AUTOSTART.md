# 交接文档 · 电视开机自动唤醒电脑（开机自启问题）

> 供接手同事排查/解决「电视开机 → 电脑自动开机」的问题。
> 项目根：`C:\0_Code\wakeonlan-webos`　|　文档更新：2026　|　状态：**进行中，卡在电视侧固件限制**

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

> 关键背景：局域网里 **除电视和这台(关机)电脑外，没有其它常开设备**（无 NAS / 树莓派 / 常开 Windows）。

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

---

## 3. 已经做的修改（本次会话，待验证）

目标：让电视开机时**自动**触发发送，无需打开应用。
采用 webOS **Activity Manager**（`luna://com.palm.activitymanager`）注册一个**持久化、带触发器**的 Activity：
电视开机、网络就绪（`connectionmanager/getStatus` 订阅变化）→ 触发 → 回调直接调用服务的 `wake` 方法发魔术包。
持久化 Activity 存 DB8，每次开机系统自动重新武装。

改动文件：
1. `services/com.woltv.wakeonlan.service/wol_service.js`
   - 新增 `setBootAuto(enabled, cb)`：`create`（`replace:true, start:true, subscribe:true`，
     `type:{background,persist}`，`trigger: com.webos.service.connectionmanager/getStatus`，
     `callback: com.woltv.wakeonlan.service/wake`）或 `cancel`。
   - `setConfig` 保存后按 `enabled && sendOnBoot` 自动同步；
   - `startBootAutosend` 里按配置自愈重武装；
   - `getStatus` 返回 `bootAuto:{armed,error,raw}`；
   - 新增总线方法 `setBootAuto`；
   - Activity Manager 的**完整原始返回已打进日志**（`wol: activity create response: {...}`）。
2. `services/com.woltv.wakeonlan.service/services.json` —— 新增 `setBootAuto` 命令。
3. `js/app.js` —— 保存后/打开时在状态栏显示「开机自启已启用 ✓ / 失败」。
4. `README.md`、`HANDOVER.md` —— 更正开机自启原理说明。

> ⚠️ 注意：本次代码改动**尚未在真机验证通过**，见下节。

---

## 4. 当前卡点（需要接手同事解决的事）

**现象**：保存设置后，界面状态栏报「开机自启启用失败，**url 不是一个有效网址**」。

**首次尝试用的是** `trigger: luna://com.palm.connectionmanager/getStatus`，被 Activity Manager 校验拒绝（报 url 无效）。
**已改成** `luna://com.webos.service.connectionmanager/getStatus`（新版 webOS 的正确订阅地址）。

> **已做修复（2026 交接会话）**，见下节「本次修复」。代码层面已：
> 1. 把 `trigger` 连接管理器地址做成**多候选逐一尝试**：先试 `com.webos.service.connectionmanager`，失败再试 `com.palm.connectionmanager`，直到 Activity 被受理；
> 2. 修复 `setConfig` 的**竞态**：之前保存后 UI 读到的是上一次（可能是旧的失败）的 `bootAuto` 状态，现在会等 `setBootAuto` 真正返回后再响应，界面显示的就是本次的真实结果；
> 3. **UI 自动诊断（无需看日志）**：持久化创建失败时，服务会自动再用「非持久」试一次，并在**状态栏**直接显示结论。在电视上保存设置后看状态栏即可判断。
> 4. **★ 真正根因一（调用方式，已修复）**：去掉 persist 仍报「url 无效」→ `service.call` 必须用
>    「完整 URI 带方法名 + 原始 payload」(`service.call(uri + '/' + method, parameters)`)，不能传
>    `{method, parameters}` 包装（会被原样发给无方法名地址，系统报 url 无效；DB 也因此在静默失败）。
> 5. **★ 时机问题（已修复）**：触发器在 `connectionmanager` 状态一变化（常早于 WiFi 连上）就回调 `wake`，
>    网络未就绪、无 IP 时发 UDP 无效。已让 `wake` 先等 `networkReady()`（最多 2 分钟）再发；
>    等待期间不 `respond`，让请求保持 pending、服务进程不提前退出。
>
> **仍需真机验证**，见下节「接手第一步」。

**接手第一步：重新部署并看这次结果。**
```powershell
cd C:\0_Code\wakeonlan-webos
powershell -ExecutionPolicy Bypass -File .\deploy-wakeonlan.ps1   # 断 VPN 后执行
```
打开应用 → 勾选「开机自动发送」→ 点保存设置。然后：
```powershell
ares-log --device lg com.woltv.wakeonlan.service
```
**重点看这行日志，它会直接告诉你拒绝原因：**
```
wol: activity create [N] trigger=... -> { ... }
wol: boot auto-launch ARMED via <触发器地址>   ← 成功
wol: boot auto-launch attempt [N] FAILED (...) ← 失败，括号内即拒绝原因
```
- 若 `returnValue:true`（日志出现 `ARMED`）→ 成功，继续做「完全关电视再开机」的端到端验证。
- 若两条候选地址都 `FAILED` → 看 `activity create [N] ... -> { ... }` 里到底指认**触发器地址**还是**回调地址**，再按第 5 节定位。

---

## 5. 接下来怎么排查 / 候选方案（按可靠性排序）

### 方案 A：修好电视侧 Activity Manager（零额外硬件，优先）
- 已把触发器换成 `com.webos.service.connectionmanager/getStatus`。若还报 url 无效：
  1. 用 `luna-send` 在电视上手动验证触发器地址是否存在：
     ```bash
     luna-send -i -f luna://com.webos.service.connectionmanager/getStatus '{"subscribe":true}'
     luna-send -i -f luna://com.palm.connectionmanager/getStatus '{"subscribe":true}'
     ```
  2. 若两者都不行，改用**系统电源事件**作触发器（研究 `com.webos.service.tvpower` / `systemservice` 的 powerState 订阅）。
  3. 确认是否是"持久化 + 第三方"被拒：先去掉 `persist` / 改 `foreground` 试一次，区分是**权限问题**还是**参数问题**。
- 风险：webOS 26 可能根本不允许第三方应用注册这类持久系统触发器——若排查确认是固件硬限制，果断转方案 B。

### 方案 B：常开设备监测电视上线（最可靠，但需加硬件）
原理：局域网里一台**始终在线**的设备，轮询/ARP 检测到电视 IP `192.168.1.4` 上线 → 立刻向电脑 `CC:28:AA:A7:B4:1F` 发 WoL。
- 可选载体：树莓派 Zero 2 W（几十元）、旧安卓手机插电常开（跑 Termux）、或任何常开小主机。
- 电视上线→发 WoL 的延迟可做到 <1s，真正实现"同步开机"。
- 荣耀 XD16 路由器**不能跑脚本**，无法用路由器实现，必须依赖这类常开设备。

### 方案 C（需调研，仅记录）
- webOS bootd（`com.webos.service.bootd`）能否把 JS Service 加入开机启动——大概率需签名/root，消费者固件不开放。
- `appinfo.json` 是否有"开机自启"字段——官方文档未见，基本不可用。

> **建议**：先花少量时间确认方案 A 是否被固件硬限制；若 1~2 次尝试仍被拒，直接采用方案 B（加一台常开小设备），它不依赖电视固件、稳定且真正同步。

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
| `url 不是一个有效网址`（持久与非持久都报） | **根因是调用方式**：`service.call` 必须用「完整 URI 带方法名 + 原始 payload」。若看到此错，先确认 `wol_service.js` 的 `lunaCall` 用的是 `service.call(uri + '/' + method, parameters, ...)`，而不是 `{method, parameters}` 包装。 |
| 保存后状态栏仍提示失败 | 用 `ares-log` 看 `wol: activity create [N] ... -> { ... }` 与 `wol: boot auto-launch attempt [N] FAILED (...)`。（已修复竞态：现在状态栏显示的是本次保存的真实 arm 结果。） |
| `192.168.1.4:9922` 连不上 / getkey 失败 | 电脑开了 VPN，与电视不同网段 → **部署时断开 VPN**。 |
| ping 通但 9922 不通 | 电视 Developer Mode 应用需保持前台、Key Server 开、会话未过期；必要时重启电视。 |
| 手动唤醒能开机、开机自启不行 | 印证根因：服务进程没被自动拉起，或触发时网络未就绪。**先确认已修复的两点**：① `service.call` 调用方式（见上「url 无效」行）；② `wake` 会先等 `networkReady()` 再发（电视冷开机连 WiFi 需时间，网络没 IP 时 UDP 无效）。若两点都排除了仍不行，走方案 B。 |

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

先别急着大改。**第一步 = 重新部署，打开应用勾选「开机自动发送」并保存，直接看 UI 状态栏**：
- 显示「开机自启已启用 ✓」→ 通过，做端到端验证；
- 显示「⚠ 启用失败」+ 自动诊断文案（见第 8 节）→ 按诊断结论走：若是固件禁止第三方持久化，
  多数情况最终建议落在**方案 B（常开设备监测电视上线）**，它不依赖电视固件、稳定且真正实现"同步开机"。
