# 交接文档 · Wake on LAN（webOS TV 开机唤醒 Win11）

> 项目路径：`C:\0_Code\wakeonlan-webos`　|　文档更新：2026

## 1. 一句话说明
在 LG webOS 电视（G6，`192.168.1.4`）上安装一个后台应用：**电视每次开机后，自动向同一局域网内的 Win11 电脑（有线网卡）发送 Wake-on-LAN 魔术包，让电脑自动开机**。全程后台、无弹窗，可开关。

## 2. 已部署环境（现状）
| 项 | 值 |
| --- | --- |
| 电视 | LG **OLED55G6PCA**（webOS，IP `192.168.1.4`） |
| 应用 | `com.woltv.wakeonlan` v0.0.1（**已安装、已启动**） |
| 电脑 | Win11，走**有线网卡** IP `192.168.1.6`，MAC `CC:28:AA:A7:B4:1F` |
| 局域网 | `192.168.1.0/24`，网关 `192.168.1.1` |
| 快速启动 | 已关闭（`HiberbootEnabled=0`） |
| 电脑 Wi-Fi | 已手动关闭，仅保留有线 |

> 电视上该应用的默认配置：MAC=`CC:28:AA:A7:B4:1F`、IP=`255.255.255.255`(广播)、端口=9、开机自动发送=开、延迟15秒。

## 3. 架构（怎么实现的）
- **前端** `js/app.js`：设置界面。用 webOS 内置 `PalmServiceBridge` 调用后台服务，**无需 webOSTV.js**。
- **后台 JS Service** `services/com.woltv.wakeonlan.service/wol_service.js`：Node.js 进程，在电视上后台跑。
  - 服务启动（电视开机/被拉起）时读配置，若 `enabled && sendOnBoot`，延迟 15 秒后用 Node `dgram` 发魔术包。
  - 魔术包 = 6×`0xFF` + 目标 MAC×16，发往 UDP 端口 9。
  - 配置存 DB8（`luna://com.palm.db`，kind `com.woltv.wakeonlan:1`，`private:true`，卸载即清）。
- 服务总线方法：`wake` / `getConfig` / `setConfig` / `getStatus`（`services.json` 里声明）。

## 4. 维护常用操作

### 重新部署 / 升级（断 VPN 后执行）
```powershell
cd C:\0_Code\wakeonlan-webos
powershell -ExecutionPolicy Bypass -File .\deploy-wakeonlan.ps1
```
脚本会自动：检查连通 → 修正 novacom host → 取密钥 → 打包 → 安装 → 启动。

### 手动打包安装
```powershell
cd C:\0_Code\wakeonlan-webos
ares-package . .\services\com.woltv.wakeonlan.service   # app 目录 + 服务目录一起
ares-install --device lg .\dist\com.woltv.wakeonlan_0.0.1_all.ipk
ares-launch  --device lg com.woltv.wakeonlan
```

### 查看后台服务日志
```powershell
ares-log --device lg com.woltv.wakeonlan.service
```
成功应看到：`wol: service started; auto-sending magic packet in ...ms` 和 `wol: magic packet sent to ...`。

### 卸载（不用了直接卸载应用即可，DB 一并清除）
```powershell
ares-remove --device lg com.woltv.wakeonlan
```

## 5. 改配置入口（在电视上操作）
打开电视「Wake on LAN」应用：
- 目标 MAC / IP / 端口
- 「启用功能」总开关
- 「开机自动发送」开关（默认开）
- 「开机后延迟（秒）」（默认 15）
改完点**保存设置**。

## 6. 电脑（Win11）侧要求（缺一不可，否则发了也开不了机）
1. 网卡开启 **Wake-on-LAN**（设备管理器→网卡→电源管理勾「允许此设备唤醒计算机」；高级页 `Wake on Magic Packet` 设为 Enabled）。
2. **快速启动已关闭**（控制面板→电源→选择电源按钮功能→取消「启用快速启动」）。
3. 电视与电脑**同一局域网**（均已满足：`192.168.1.x`）。
4. 想最稳：在路由器上给电脑有线网卡绑**静态 IP**，并可在应用里把目标 IP 填成 `192.168.1.6`（单播）。

## 7. 已踩过的坑（排障速查）
| 现象 | 原因 / 解决 |
| --- | --- |
| `192.168.1.4:9922` 连不上 / getkey `Failed to get ssh private key` | **电脑开了 VPN**，与电视不在同一局域网。→ 部署时断开 VPN。 |
| ping 通但 9922 不通 | 电视 Developer Mode 应用未在前台 / **Key Server 未开** / 会话过期（需重新登录/EXTEND）。保持应用前台，必要时重启电视。 |
| 安装报 `All configured authentication methods failed` | SSH 密钥没装好。→ 用 `ares-novacom --device lg --getkey --passphrase <6位> `（**必须用 `--passphrase` 参数**，管道喂密码不可靠）。 |
| 打包报 `Cannot package the directory with package directory` | 应用目录根放了 `packageinfo.json`。→ 删除它（打包自动生成），并把服务目录单独传给 `ares-package`。 |
| CLI 把设备 host 存成 `127.0.0.1` | 手动改 `%APPDATA%\.webos\tv\novacom-devices.json` 对应设备 `host` 为 `192.168.1.4`（脚本自动修）。 |
| Passphrase 取密钥失败 | 核对电视 Dev Mode 左下角 6 位字符，区分大小写；与应用里 `C30E73` 一致。 |
| 打包警告 `requiredACG` | appinfo.json 里已加 `"requiredACG": []`。 |
| 打包警告 Node 版本 | 服务代码已用 ES5 风格（`var`/回调），兼容旧 Node，可忽略。 |

## 8. 关键文件
| 文件 | 作用 |
| --- | --- |
| `deploy-wakeonlan.ps1` | 一键部署脚本（断 VPN 后运行） |
| `services/.../wol_service.js` | 后台服务：发魔术包 + DB8 配置 + 开机自启 |
| `services/.../services.json` | 声明服务总线方法 |
| `js/app.js` | 前端：设置界面、开关、测试唤醒 |
| `appinfo.json` | 应用元数据 |
| `dist/` | 打包产物（.ipk，已加入 .gitignore） |

## 9. 说明 / 限制
- 前端用 `PalmServiceBridge` 直接调服务，自包含、无需外部库；服务只用 webOS 预装模块 + Node 内置 `dgram`，无需 npm install。
- 「开机自动发送」依赖 webOS 开机自动拉起 JS Service。本机已成功安装启动；若某固件开机不自动拉起服务，可用 `ares-launch` 启动一次验证链路，再考虑固化开机自启。
- 发的是**局域网 UDP** 魔术包，外网不可用，需电视与电脑同网。
