# Wake on LAN（webOS TV）— 开机自动唤醒 Win11

方案 A：**前端网页应用 + 后台 JS Service（Node.js `dgram` 发 UDP 魔术包）**。

- 电视开机后，后台服务自动向指定 PC 发送 WoL 魔术包（**无弹窗、后台执行**）。
- 提供一个简单的设置界面，可**开关「开机自动发送」**、填写目标 MAC / IP / 端口，并可手动测试唤醒。
- 卸载应用即完全移除功能（DB 数据也会被清理）。

---

## 部署状态（2026 已上线）

- 电视：**LG OLED55G6PCA**（webOS G6 系列，IP `192.168.1.4`）
- 应用已安装并启动：`com.woltv.wakeonlan` v0.0.1
- 部署脚本：`deploy-wakeonlan.ps1`（**断 VPN 后**执行）
- 交接 / 维护文档：见 **`HANDOVER.md`**

> ### 部署脚本怎么用（含 SSH 密钥）
> 直接运行即可，脚本会自动：连通检查 → 修正 novacom host → 取密钥 → 打包 → 安装 → 启动。
> 其中的 **SSH 密钥（Passphrase，电视 Developer Mode 左下角 6 位）按顺序读取**：
> `-Passphrase` 参数 → 环境变量 `WEBOS_PASSPHRASE` → 本地 `passphrase.txt` → 交互输入。
> **本项目仓库里 `passphrase.txt` 已被 gitignore，不会提交**，放的是作者自己电视的密钥；
> 其他开发者拉到源码后，请把 `passphrase.txt` 改成**自己电视**左下角显示的 6 位即可（只改这一个文件，无需改脚本）。

---

## 目录结构

```
wakeonlan-webos/
├── appinfo.json                          # web 应用元数据（含 requiredACG）
├── icon.png / largeIcon.png              # 应用图标（占位）
├── index.html                            # 前端页面
├── css/style.css                         # 前端样式
├── js/app.js                             # 前端逻辑（PalmServiceBridge 调用服务）
├── deploy-wakeonlan.ps1                  # 一键打包/安装/启动脚本（断 VPN 后运行）
└── services/
    └── com.woltv.wakeonlan.service/
        ├── package.json                  # 服务 npm 配置（main 指向服务入口）
        ├── services.json                 # 注册到 webOS 总线的方法
        └── wol_service.js                # ★ 核心：dgram 发魔术包 + DB8 存配置
```

> ⚠️ `packageinfo.json` **不要**放在应用目录根！`ares-package` 检测到被传目录里有 `packageinfo.json`
> 会报 `Cannot package the directory with package directory` 并拒绝打包（打包时会自动生成）。

> 前端使用 webOS 内置的 `PalmServiceBridge`，**不需要**额外下载 webOSTV.js。
> 服务使用 webOS 预装的 `webos-service` 模块和 Node 内置的 `dgram`，**无需 npm install**。

---

## 工作原理

1. **后台服务（JS Service）**
   - 以 Node.js 进程在电视上后台运行，通过 `services.json` 注册到 webOS 总线，地址为
     `luna://com.woltv.wakeonlan.service`。
   - 服务启动时（电视开机、服务被拉起时）读取配置：若 `enabled` 且 `sendOnBoot` 为真，
     延迟 `bootDelayMs`（默认 15 秒，等网络就绪）后，用 `dgram` 向目标发送魔术包。
   - 魔术包 = 6 字节 `0xFF` + 目标 MAC 重复 16 遍，发往 UDP 端口 9（可改 7）。
2. **配置持久化（DB8）**
   - 用 `luna://com.palm.db`（DB8）存储 `com.woltv.wakeonlan:1` kind。
   - `putKind` 时 `private: true`，**卸载应用时 kind 一并删除**，无残留。
3. **前端设置界面**
   - `getConfig` / `setConfig` / `wake` 三个方法，通过 `PalmServiceBridge` 调用。

---

## ⚠️ 已知坑 / 排障记录

- **电脑开着 VPN 时，电脑与电视就不在同一局域网了**，`192.168.1.4:9922` 连不上，`ares-novacom --getkey` 会报
  `Failed to get ssh private key`。→ **部署时请断开 VPN**，让电脑回到 `192.168.1.x` 再连电视。
- 电视 `ping` 通但 `9922` 端口不通：说明开发者模式的 **Key Server 未生效**。
  打开 Developer Mode 应用并保持在前台，确认 **Dev Mode Status = ON**、**Key Server = ON**、
  **Remain Session 未过期**（过期需重新登录/EXTEND）；必要时重启电视。
- CLI 的 `ares-setup-device -a/-i` 有时会把设备 host 存成 `127.0.0.1`（应为电视真实 IP）。
  可手动修改配置文件 `%APPDATA%\.webos\tv\novacom-devices.json` 里对应设备的 `host` 为电视 IP。
  脚本 `deploy-wakeonlan.ps1` 会自动修正并校验。

---

## 部署到真机（webOS CLI）

前置条件：电脑安装 [webOS CLI（ares）](https://webostv.developer.lge.com/develop/tools/cli-installation)，
电视开启**开发者模式**（安装 Developer Mode app，并打开 `ares` 远程开关）。

```powershell
# 1. 登录电视（输入电视上 Developer Mode 显示的 IP + 密码）
ares-setup-device

# 2. 打包（应用目录 + 服务目录一起传；项目根目录不要放 packageinfo.json）
cd C:\0_Code\wakeonlan-webos
ares-package . .\services\com.woltv.wakeonlan.service

# 3. 安装（生成 com.woltv.wakeonlan_0.0.1_all.ipk）
ares-install --device <设备名> com.woltv.wakeonlan_0.0.1_all.ipk

# 4. 启动应用做首次设置
ares-launch --device <设备名> com.woltv.wakeonlan

# （可选）后台查看 JS Service 日志
ares-log --device <设备名> com.woltv.wakeonlan.service
```

> 首次打开应用填写目标电脑 **MAC 地址**并保存；勾选「开机自动发送」后，
> 之后电视每次开机都会自动发送。想停用就取消勾选，不想用了直接卸载应用。

卸载：`ares-remove --device <设备名> com.woltv.wakeonlan`

---

## 关于「开机自动 + 后台无弹窗」的说明（重要）

- 本方案把自动发送放在 **JS Service**（后台进程）里，而不是放在网页应用里，因此
  **不会弹出任何界面**，符合「默认无弹窗后台执行」的需求。
- webOS 会管理 JS Service 的生命周期，服务进程在设备启动 / 被拉起时运行。
  **请在实际 LG 电视上验证**：开机后观察 `ares-log` 是否打印
  `wol: service started; auto-sending magic packet in ...ms` 和
  `wol: magic packet sent to ...`。若你的固件没有在开机时自动拉起该服务，
  可先手动启动一次应用（`ares-launch`）以确认整套链路可用，再考虑进一步固化开机自启。

## 电脑（Win11）侧必备设置（否则发出去也开不了机）

1. **开启 Wake-on-LAN**：设备管理器 → 网络适配器 → 属性 → 「电源管理」勾选
   「允许此设备唤醒计算机」；「高级」页把 `Wake on Magic Packet` 设为 Enabled。
2. **关闭「快速启动」**：控制面板 → 电源选项 → 选择电源按钮功能 → 取消勾选
   「启用快速启动」。否则关机后无法被魔术包唤醒。
3. 电视与 Win11 **必须在同一局域网/同一网段**。若电视走 Wi-Fi、电脑走网线，
   注意路由器 AP 隔离；也可把目标 IP 填成电脑的具体 IP（单播）替代广播，更稳。
4. 若 Win11 是从「关机」唤醒，推荐同时把目标 IP 填成电脑在路由器上绑定的**静态 IP**。

---

## 本机检查结果（2026 实测 Win11）

| 检查项 | 状态 | 说明 |
| --- | --- | --- |
| 当前局域网 | 192.168.1.0/24 | 电视 `192.168.1.4`，电脑走有线 `192.168.1.6`，网关 `192.168.1.1` |
| 有线网卡(Realtek 2.5GbE) WoL | ✅ 已开启 | 魔术封包唤醒/关机网络唤醒 均开启，已接网线（Up, 1Gbps） |
| Wi-Fi(MediaTek) WoL | ✅ 已开启 | 已手动关闭 Wi-Fi，仅保留有线；Wi-Fi 唤醒本就不推荐 |
| 快速启动(Fast Startup) | ✅ **已关闭** | 已通过注册表 `HiberbootEnabled=0` 关闭 |
| 目标 MAC（已填入默认） | `CC:28:AA:A7:B4:1F` | 有线网卡 MAC（推荐） |
| 目标 IP（已填入默认） | `255.255.255.255` | 广播；也可填电脑固定 IP `192.168.1.6`（单播更稳） |

> 建议：把电脑用**网线**接到路由器（192.168.1.x），并**关闭快速启动**，WoL 才最可靠。

---

## 主要文件说明

| 文件 | 作用 |
| --- | --- |
| `services/com.woltv.wakeonlan.service/wol_service.js` | 后台服务：`dgram` 发魔术包 + DB8 存/读配置 + 开机自启发送 |
| `services/com.woltv.wakeonlan.service/services.json` | 声明服务名与总线方法（wake / getConfig / setConfig / getStatus） |
| `js/app.js` | 前端逻辑：加载/保存配置、开关、测试唤醒 |
| `appinfo.json` | 应用元数据（含 requiredACG） |
