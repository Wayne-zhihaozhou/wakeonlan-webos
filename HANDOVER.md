# Wake-on-LAN webOS 项目交接文档

## 一、项目是什么

一个运行在 LG webOS 电视上的 **Wake-on-LAN（WOL）** 应用，用来远程唤醒局域网内的电脑。

它由两部分组成：

| 部分 | 包 ID | 作用 |
|---|---|---|
| 界面应用 | `com.woltv.wakeonlan` | 用户看到的界面：配置 MAC/IP、扫描设备、手动唤醒、开关自动发送 |
| 后台服务 | `com.woltv.wakeonlan.service` | 真正干活的部分：发送魔术包、存取配置、开机自动发包 |

界面通过 Luna 总线调用后台服务的方法来完成任务。

## 二、目录结构

```
wakeonlan-webos/
├── appinfo.json                 # 界面应用元数据（不含开机自启）
├── index.html / js/app.js       # 界面程序（前端逻辑）
├── css/style.css                # 界面样式
├── icon.png / largeIcon.png     # 应用图标
├── services/com.woltv.wakeonlan.service/
│   ├── services.json            # 服务声明：暴露的方法 + 开机自启开关
│   ├── wol_service.js           # 服务核心逻辑
│   └── package.json             # 服务依赖
├── deploy-wakeonlan.ps1         # 一键打包 + 部署到电视
├── dist/*.ipk                   # 打包产物
└── README.md / HANDOVER.md
```

## 三、核心机制：魔术包的发送路径

所有魔术包的发送都收敛到后台服务 `wol_service.js` 的 **`wake` 方法**，调用链：

```
wake 方法
  └─ sendMagicPacket(cfg, cb)
       └─ sendWOLWhenNetworkReady(cfg, cb)   ← 先等网络就绪
            └─ networkReady(...)             ← 每 5 秒查一次，超时 5 分钟放弃
            └─ sendWOL(cfg, cb)              ← 用 UDP 真正发 dgram 魔术包
                 └─ buildMagicPacket(mac)    ← 拼 6 个 0xFF + MAC 重复 16 次
```

`wake` 方法有两条触发来源：

| 触发来源 | 调用方 | 特征 |
|---|---|---|
| **手动** | 界面「唤醒」按钮 → `app.js wakeNow()` | 直接 luna 调用 `wake`，发一次 |
| **开机自动** | 后台服务启动时 `startBootAutosend()` | 服务开机常驻后自动调用，发一次 |

### 开机自动发送（本次改动重点）

- 后台服务通过 `onBoot:true` 在电视开机时自动常驻启动。
- 服务启动时执行 `startBootAutosend()`。
- 若配置里 `enabled` 和 `sendOnBoot` 都为 `true`，则直接调用 `sendMagicPacket` 发送一次魔术包。
- 发送前走 `sendWOLWhenNetworkReady`：先确认电视已联网，未联网每 5 秒重查，最多等待 5 分钟。
- **不再使用 ActivityManager 周期定时器**，逻辑已大幅简化：开机即发一次，无需手动打开应用。

## 四、本次改动：`onBoot: true`

### 解决的问题（坑）

**改动前**：服务没有声明开机常驻，是**懒加载**——只有被调用时才被拉起。而 keepalive 闹钟是服务**启动后**才挂上的。于是：

- 电视断电重启后，服务没被拉起 → `startBootAutosend()` 没执行 → 闹钟没挂上 → 永远不发魔术包。
- 只有**手动启动过一次应用**（界面调用服务，把服务拉起来），闹钟才挂上，之后才能自动发包。

**改动后**：在 `services/com.woltv.wakeonlan.service/services.json` 的服务定义层加了 `"onBoot": true`：

```json
{
    "name": "com.woltv.wakeonlan.service",
    "description": "Sends Wake-on-LAN magic packets and stores configuration",
    "onBoot": true,
    "commands": [ ... ]
}
```

- 电视开机时系统**自动常驻**启动后台服务。
- 服务一启动就执行 `startBootAutosend()` → 直接发一次魔术包。
- **即使界面不启动，后台也会自动发包。**

### 补充改动：移除定时器，逻辑简化

在加 `onBoot` 的同时，移除了原来基于 ActivityManager 周期定时器（keepalive activity）的复杂逻辑，改为「**服务开机启动后直接等网络就绪发一次魔术包**」：

- 删除了 `armBootAuto` / `cancelKeepalive` / `setBootAuto` / `incrementAndMaybeStop` 及 keepalive activity 相关代码。
- `startBootAutosend` 改为：判断 `enabled` 和 `sendOnBoot` 开关 → 调用 `sendMagicPacket`（内含 `sendWOLWhenNetworkReady` 等网络就绪，5 分钟超时）→ 发一次。
- `wake` 方法去掉 `fromPull` 分支，手动与开机自动统一走同一发送逻辑。
- 移除了配置里的定时器字段：`sendIntervalSec`、`sendMaxCount`、`sendCount`，对应界面控件同步删除。
- 服务状态 `bootAuto` 简化为 `{ sent, error, lastSend }`，界面只显示开机自动发送的结果。

### 生效条件

1. **必须重新打包安装**：`onBoot` 是安装包元数据，已装旧版不受影响。运行 `deploy-wakeonlan.ps1` 重新部署。
2. **配置开关要打开**：`onBoot` 只保证服务开机常驻，最终发不发还取决于配置里 `enabled` 和 `sendOnBoot` 是否都为 `true`。

## 五、配置项（存于 webOS 数据库 com.palm.db）

配置数据不是写在代码里的，是用户在界面填写、点保存后，经 `setConfig` 存进系统数据库的。字段定义见 `wol_service.js` 的 `DEFAULT_CONFIG`：

| 字段 | 默认值 | 含义 |
|---|---|---|
| `enabled` | `true` | 总开关 |
| `sendOnBoot` | `true` | 开机自动发送开关 |
| `mac` | `CC:28:AA:A7:B4:1F` | 目标电脑 MAC 地址 |
| `ip` | `255.255.255.255` | 目标 IP（默认全网广播） |
| `port` | `9` | WOL 端口 |
| `broadcast` | `true` | 是否广播方式发送 |

> 说明：早期版本的 `sendIntervalSec`、`sendMaxCount`、`sendCount`（定时器相关）已在简化逻辑时移除。

## 六、后台服务暴露的方法（services.json）

| 方法 | 作用 |
|---|---|
| `wake` | 立即发送一个魔术包（手动 + 自动共用入口） |
| `getConfig` | 读取当前配置 |
| `setConfig` | 保存配置 |
| `getStatus` | 读取最近一次发送状态 / 开机自启状态 |
| `scan` | 扫描局域网，列出设备（IP + MAC） |

## 七、部署方式

用项目根目录的 `deploy-wakeonlan.ps1` 一键部署：

```
powershell -ExecutionPolicy Bypass -File .\deploy-wakeonlan.ps1
```

可选参数：`-TvIp <电视IP>`、`-Device <设备名>`、`-Passphrase <6位Passphrase>`。

关键注意点：
- **先断开 VPN**，否则连不到电视 `192.168.1.4:9922`。
- 电视上保持 **Developer Mode 应用在前台**（Key Server 生效）。
- Passphrase 按优先级取：`-Passphrase` 参数 → 环境变量 `WEBOS_PASSPHRASE` → 本地 `passphrase.txt`（已 gitignore）→ 交互输入。
- 部署脚本流程：连通行检查 → 修正 novacom host → 取密钥 → 打包 → 安装 → 启动。

## 八、验证方法

重新部署后验证 `onBoot` 生效：

1. 电视彻底断电重启。
2. **不要手动打开应用**。
3. 等待网络就绪（最多 5 分钟）后，观察目标电脑是否被唤醒。
4. 若被唤醒，说明 `onBoot` 生效、后台服务已随开机自动启动并发出魔术包。

## 九、其他说明

- 本仓库 README 要求：**禁止添加代码注释**、**非用户要求不添加其他文档**。本次交接文档是用户明确要求添加。
- `passphrase.txt` 已加入 `.gitignore`，不提交。
- 当前开发分支：`feature/network-check-before-send`。
