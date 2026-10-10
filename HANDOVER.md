# 交接文档 · Wake on LAN（webOS TV 开机唤醒 Win11）

> 项目路径：`C:\0_Code\wakeonlan-webos`　|　文档更新：2026

## ✅ 当前状态
**电视已成功通过 WOL 唤醒电脑**（电视点「立即唤醒（测试）」→ 电脑正常开机）。目标电脑有线网卡 MAC 已**硬编码为默认值** `CC:28:AA:A7:B4:1F`，装完即用，无需遥控器打字。

## 1. 一句话说明
在 LG webOS 电视（G6，`192.168.1.4`）上安装一个后台应用：**电视每次开机后，自动向同一局域网内的 Win11 电脑（有线网卡）发送 Wake-on-LAN 魔术包，让电脑自动开机**。全程后台、无弹窗，可开关。

## 2. 已部署环境（现状）
| 项 | 值 |
| --- | --- |
| 电视 | LG **OLED55G6PCA**（webOS，IP `192.168.1.4`） |
| 应用 | `com.woltv.wakeonlan` v0.0.1（**已安装、已启动、已验证能唤醒电脑**） |
| 电脑 | Win11，走**有线网卡** IP `192.168.1.6`，MAC `CC:28:AA:A7:B4:1F` |
| 局域网 | `192.168.1.0/24`，网关 `192.168.1.1` |
| 快速启动 | 已关闭（`HiberbootEnabled=0`） |
| 电脑 Wi-Fi | 已手动关闭，仅保留有线 |

> 电视上该应用的默认配置：MAC=**硬编码默认值 `CC:28:AA:A7:B4:1F`**、IP=`255.255.255.255`(广播)、端口=9、开机自动发送=开、**开机后网络一就绪就立即发送（无固定延迟）**。首次打开即已填好，点「保存」即可。
>
> **开机唤醒速度优化（2026 更新）**：原服务开机时先串行等两次 DB8（`ensureKind`+`loadConfig`，每次最长 5s），之后才每 1 秒轮询网络，慢 DB 会额外拖慢唤醒。现已改为——服务一启动就**立刻**开始每 500ms 轮询网络（关键路径不含 DB 调用），真实配置在**并行**用短超时(4s)从 DB 加载并即时替换（正常 <1s，远早于冷启动网络就绪）；若 DB 卡住，6s 后自动用默认配置发送兜底。这样电脑会在**网络一就绪后的瞬间**被唤醒，把可控的延迟降到近乎 0。

## 3. 架构（怎么实现的）
- **前端** `js/app.js`：设置界面，**完全支持遥控器操作**（方向键移动焦点 + OK 确认，webOS 要求 `PalmServiceBridge` 回调 `return true`，前端所有调用带超时兜底，打开时自动 `getStatus` 自检后台服务是否存活）。用 webOS 内置 `PalmServiceBridge` 调用后台服务，**无需 webOSTV.js**。
- **后台 JS Service** `services/com.woltv.wakeonlan.service/wol_service.js`：Node.js 进程，在电视上后台跑。
  - **开机自动拉起 = webOS Activity Manager 持久化触发器**：LG webOS 不会主动拉起第三方应用的 JS Service
    （懒启动，只在打开应用 / 总线调用时启动）。因此服务在保存设置时向 `com.palm.activitymanager` 注册一个
    持久化（persist）带触发器的 Activity——电视开机、网络就绪（`connectionmanager/getStatus` 变化）时触发，
    回调直接调 `wake` 发魔术包。持久化 Activity 存于 DB8，每次开机系统自动重新武装，无需打开应用。
  - 服务进程被拉起后，若 `enabled && sendOnBoot`，**轮询等网络就绪后立即**（无固定延迟）用 Node `dgram` 发魔术包。
  - 魔术包 = 6×`0xFF` + 目标 MAC×16，发往 UDP 端口 9。
  - 配置存 DB8（`luna://com.palm.db`，kind `com.woltv.wakeonlan:1`，`private:true`，卸载即清）。**DB 调用均带超时 + 内存缓存兜底**，DB 挂起/损坏也绝不卡死界面或崩溃服务；启动阶段全程 try/catch，保证方法总能注册、服务必活。
- 服务总线方法：`wake` / `getConfig` / `setConfig` / `getStatus` / **`scan`**（`services.json` 里声明）。
- **局域网扫描 `scan`**：不依赖 ICMP ping（服务进程无权限），改为**TCP 探测填充 ARP 缓存 + 读 `/proc/net/arp`**，只返回**当前开机**设备的 IP+MAC。

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
成功应看到：`wol: service started; network already ready; sending magic packet now`（或 `waiting for network...`）和 `wol: magic packet sent to ...`。

### 卸载（不用了直接卸载应用即可，DB 一并清除）
```powershell
ares-remove --device lg com.woltv.wakeonlan
```

## 5. 改配置入口（在电视上操作）
打开电视「Wake on LAN」应用（**全程用遥控器即可，无需键盘**）：
- **默认已填好**目标 MAC `CC:28:AA:A7:B4:1F`，通常**直接点「保存设置」**即可。
- 想换设备：点**扫描设备** → 用方向键在**下拉框选择**（只列出当前开机的设备），按 OK 确认（自动填入 MAC/IP）。
- 「启用功能」总开关、「开机自动发送」开关（默认开；电视开机、网络就绪后**立即发送，无延迟**）。
改完点**保存设置**。状态栏会显示「后台服务正常」即说明服务链路 OK。

## 6. 电脑（Win11）侧要求（缺一不可，否则发了也开不了机）
**推荐用检查脚本一键核对/修复：**
```powershell
cd C:\0_Code\wakeonlan-webos
powershell -ExecutionPolicy Bypass -File .\check-wol-win.ps1       # 只检查
powershell -ExecutionPolicy Bypass -File .\check-wol-win.ps1 -Fix  # 管理员：检查并自动修复
```
检查项：① 有线网卡存在且 MAC 正确 ② 允许此设备唤醒计算机 ③ Wake on Magic Packet ④ 魔术包电源管理 ⑤ 快速启动已关闭。任一 [FAIL] 都会导致 WOL 失效。

手动核对：
1. 网卡开启 **Wake-on-LAN**（设备管理器→网卡→电源管理勾「允许此设备唤醒计算机」；高级页 `Wake on Magic Packet` 设为 Enabled）。
2. **快速启动已关闭**（控制面板→电源→选择电源按钮功能→取消「启用快速启动」）。
3. 电视与电脑**同一局域网**（均已满足：`192.168.1.x`）。
4. 想最稳：在路由器上给电脑有线网卡绑**静态 IP**，并可在应用里把目标 IP 填成 `192.168.1.6`（单播）。

## 7. 已踩过的坑（排障速查）
| 现象 | 原因 / 解决 |
| --- | --- |
| `192.168.1.4:9922` 连不上 / getkey `Failed to get ssh private key` | **电脑开了 VPN**，与电视不在同一局域网。→ 部署时断开 VPN。 |
| 扫描不到电脑 | 扫描只能发现**当前开机**的设备（电视权限限制，不能 ICMP ping，改用 TCP 探测 + ARP 表）。目标电脑若**关机**就扫不到 → 先开机扫描一次，或**手动填 MAC** `CC:28:AA:A7:B4:1F`。路由器的 IP/MAC（如 `192.168.1.1`）通常总能扫到，可用来确认扫描本身正常。 |
| ping 通但 9922 不通 | 电视 Developer Mode 应用未在前台 / **Key Server 未开** / 会话过期（需重新登录/EXTEND）。保持应用前台，必要时重启电视。 |
| 安装报 `All configured authentication methods failed` | SSH 密钥没装好。→ 用 `ares-novacom --device lg --getkey --passphrase <6位> `（**必须用 `--passphrase` 参数**，管道喂密码不可靠）。 |
| 打包报 `Cannot package the directory with package directory` | 应用目录根放了 `packageinfo.json`。→ 删除它（打包自动生成），并把服务目录单独传给 `ares-package`。 |
| CLI 把设备 host 存成 `127.0.0.1` | 手动改 `%APPDATA%\.webos\tv\novacom-devices.json` 对应设备 `host` 为 `192.168.1.4`（脚本自动修）。 |
| Passphrase 取密钥失败 | 核对电视 Dev Mode 左下角 6 位字符，区分大小写；确认传入的 Passphrase 与之一致（脚本通过参数 / 环境变量 `WEBOS_PASSPHRASE` / 本地 `passphrase.txt` / 交互输入获取，见脚本头注释）。 |
| 打包警告 `requiredACG` | appinfo.json 里已加 `"requiredACG": []`。 |
| 打包警告 Node 版本 | 服务代码已用 ES5 风格（`var`/回调），兼容旧 Node，可忽略。 |
| 保存一直「保存中」或提示超时 | 旧版已修：DB 调用带超时+内存缓存、服务启动全程容错、前端回调 `return true`+12s 超时、打开时自检。若仍提示「后台服务无响应」，用 `ares-log` 看 `wol_service.js` 日志，或重启电视/重装。 |
| 开机不自动唤醒电脑 | 检查 ① 应用里「开机自动发送」是否开且保存后状态栏显示「开机自启已启用 ✓」 ② 电脑侧 `check-wol-win.ps1` 是否全 OK ③ `ares-log` 是否打印 `wol: boot auto-launch armed` 与 `magic packet sent`。若打印 `boot auto-launch FAILED` 说明该固件对第三方 Activity Manager 权限较严，改用「常开设备监测 TV 上线」方案。 |

## 8. 编码 / 文件格式避坑（重要，改文件前必读）

本项目文件**默认 UTF-8**，但不同文件对 **BOM（字节序标记）** 的要求不同。改文件前先看下面的规则，否则会出现「能读不能跑」或「看着正常、一运行就乱码/报错」的问题。

| 文件类型 | 必须的编码 | 原因 |
| --- | --- | --- |
| `*.ps1`（PowerShell 脚本） | **UTF-8 带 BOM** | Windows PowerShell 5.1（`powershell.exe`）对**不带 BOM** 的 `.ps1` 会按系统 ANSI 代码页（简体中文系统 = GB2312）解析。文件含中文时会被误读：轻则中文乱码，重则某些汉字的字节序列撞上 `"` 等字符，直接**解析失败**（报 `string is missing the terminator: "` / `Missing closing '}'`）。带 BOM 则 5.1 与 7+ 都能正确读。 |
| `.html` / `.js` / `.css` / `.json` | UTF-8（**不带 BOM** 即可，带也无妨） | 由浏览器/Node 按 UTF-8 读取，不需要 BOM。 |
| `.md` / `.gitignore` | UTF-8 不带 BOM | 纯文档/配置，按 UTF-8 读取即可。 |

**常见坑（已踩过）：**
1. 用某些编辑器/工具（或本会话的文件编辑工具）改 `.ps1` 时会把 **BOM 悄悄剥掉**，文件仍是 UTF-8，但 Windows PowerShell 5.1 就解析不了中文了。**改完 `.ps1` 一定要检查首字节是 `EF BB BF`。**
2. 判断方法：用十六进制看文件开头——带 BOM 应为 `EF BB BF`，不带则直接是 `<`（`3C`）等实际内容。
3. 用 PowerShell 校验语法（能提前暴露这种问题）：
   ```powershell
   $t=$null;$e=$null
   [System.Management.Automation.Language.Parser]::ParseFile('.\deploy-wakeonlan.ps1',[ref]$t,[ref]$e)
   if ($e.Count) { $e | % { $_.Message } } else { 'OK: 解析通过' }
   ```
   若在 5.1 下报「missing the terminator」，几乎都是 BOM 丢了，补上 BOM 即可。
4. 给 `.ps1` 补 BOM（PowerShell 一键）：
   ```powershell
   $p='.\deploy-wakeonlan.ps1'
   $b=[IO.File]::ReadAllBytes($p)
   if(-not($b.Length -ge 3 -and $b[0]-eq 239 -and $b[1]-eq 187 -and $b[2]-eq 191)){
     [IO.File]::WriteAllBytes($p, ([byte[]](239,187,191) + $b))
   }
   ```
5. 换行符：本项目 `.ps1` 建议保持 **LF**；Git 在 Windows 上可能按 `core.autocrlf` 提示转成 CRLF，属正常告警，不影响功能。别用「改换行符」的方式去「修」乱码。

---

## 9. 关键文件
| 文件 | 作用 |
| --- | --- |
| `deploy-wakeonlan.ps1` | 一键部署脚本（断 VPN 后运行） |
| `check-wol-win.ps1` | **Windows 侧 WOL 设置检查/一键修复脚本** |
| `services/.../wol_service.js` | 后台服务：发魔术包 + DB8 配置 + 开机自启 + 局域网扫描 |
| `services/.../services.json` | 声明服务总线方法 |
| `js/app.js` | 前端：遥控器导航 + 下拉选设备 + 开关 + 测试唤醒 |
| `appinfo.json` | 应用元数据 |
| `dist/` | 打包产物（.ipk，已加入 .gitignore） |

## 10. 说明 / 限制
- 前端用 `PalmServiceBridge` 直接调服务，自包含、无需外部库；服务只用 webOS 预装模块 + Node 内置 `dgram`，无需 npm install。
- **扫描只能发现当前开机的设备**（电视服务进程不能 ICMP ping，靠 TCP 探测 + ARP 表）；目标电脑关机时扫不到属正常，可手动填 MAC。
- 「开机自动发送」依赖 webOS 开机自动拉起 JS Service。本机已验证可用；若某固件开机不自动拉起服务，可用 `ares-launch` 启动一次验证链路，再考虑固化开机自启。
- 发的是**局域网 UDP** 魔术包，外网不可用，需电视与电脑同网。
- `check-wol-win.ps1`、`deploy-wakeonlan.ps1` 均为 **UTF-8(带 BOM)** 编码（含中文输出）；若用编辑器改过，请保持 BOM，否则 Windows PowerShell 5.1 会因中文乱码/解析错误而失败（详见上文「第 8 节 编码/文件格式避坑」）。
- 默认 MAC `CC:28:AA:A7:B4:1F` 目前**硬编码**为默认值（前端 `DEFAULT_MAC` + 后台 `DEFAULT_CONFIG.mac`），目标电脑若更换需改这两处并重新部署。
