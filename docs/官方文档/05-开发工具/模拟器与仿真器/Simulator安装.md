# 模拟器(Simulator)安装
> 原文链接: https://webostv.developer.lge.com/develop/tools/simulator-installation ｜ 简体中文翻译

请按照以下步骤安装模拟器(Simulator)。

## 安装准备

在开始安装之前，请检查是否满足系统要求和前提条件。即使不满足系统要求，模拟器(Simulator)也可能可以运行，但无法保证稳定性。

### 系统要求

| 操作系统 | 要求 |  |
| --- | --- | --- |
| Windows | Windows 7 或更高版本（仅 64 位） |  |
| Linux | webOS TV 26 Simulator | Ubuntu 16.04 或更高版本，包括 Ubuntu 24（仅 64 位） |
| webOS TV 25 Simulator | Ubuntu 16.04 至 22.04（仅 64 位） |  |
| webOS TV 24 Simulator |  |  |
| webOS TV 23 Simulator |  |  |
| webOS TV 22 Simulator | Ubuntu 16.04 至 20.04（仅 64 位） |  |
| webOS TV 6.0 Simulator |  |  |
| macOS | webOS TV 26 Simulator | macOS High Sierra (10.13) 或更高版本（仅 ARM64） |
| webOS TV 25 Simulator |  |  |
| webOS TV 24 Simulator 及更早版本 | macOS High Sierra (10.13) 或更高版本（仅 64 位） |  |

## 下载模拟器(Simulator)

下载与你的操作系统对应的模拟器(Simulator)并解压。

### webOS TV 26 Simulator

Linux 64-bit

webOS_TV_26_Simulator_1.5.0_linux.zip (118M)

<br>

<br>

Windows 64-bit

webOS_TV_26_Simulator_1.5.0_win.zip (124M)

<br>

<br>

macOS 64-bit

webOS_TV_26_Simulator_1.5.0_mac.zip (111M)

<br>

<br>

说明

要在 **Ubuntu 24 或更高版本**上运行 webOS TV 26 Simulator，请使用以下参数执行 AppImage：

- `--ozone-platform=x11`：在 X11 兼容模式下运行，以规避 [Electron 的 Wayland 限制](https://www.electronjs.org/docs/latest/api/browser-window)。
- `--no-sandbox`：禁用沙箱限制，以符合 Ubuntu 24 的安全策略。

例如：

```bash
./webOS_TV_26_Simulator_1.5.0.AppImage --ozone-platform=x11 --no-sandbox
```

**注意：** `ares-launch` 在启动模拟器(Simulator)时无法传递上述参数。你必须直接带参数运行模拟器(Simulator)，然后使用模拟器(Simulator)的界面启动你的应用。

### webOS TV 25 Simulator

Linux 64-bit

webOS_TV_25_Simulator_1.4.4_linux.zip (118M)

<br>

<br>

Windows 64-bit

webOS_TV_25_Simulator_1.4.4_win.zip (124M)

<br>

<br>

macOS 64-bit

webOS_TV_25_Simulator_1.4.4_mac.zip (111M)

<br>

<br>

- 此适用于 macOS 64-bit 的 webOS TV 25 Simulator 面向 macOS ARM64；从 webOS TV 25 起，macOS 平台仅提供面向 macOS ARM64 的模拟器(Simulator)。

### webOS TV 24 Simulator

Linux 64-bit

webOS_TV_24_Simulator_1.4.1_linux.zip (111M)

<br>

<br>

Windows 64-bit

webOS_TV_24_Simulator_1.4.1_win.zip (75M)

<br>

<br>

macOS 64-bit

webOS_TV_24_Simulator_1.4.1_mac.zip (110M)

<br>

<br>

macOS 64-bit (ARM)

webOS_TV_24_Simulator_1.4.1_mac-arm64.zip (105M)

<br>

<br>

### webOS TV 23 Simulator

Linux 64-bit

webOS_TV_23_Simulator_1.4.1_linux.zip (99M)

<br>

<br>

Windows 64-bit

webOS_TV_23_Simulator_1.4.1_win.zip (68M)

<br>

<br>

macOS 64-bit

webOS_TV_23_Simulator_1.4.1_mac.zip (101M)

<br>

<br>

macOS 64-bit (ARM)

webOS_TV_23_Simulator_1.4.1_mac-arm64.zip (104M)

<br>

<br>

### webOS TV 22 Simulator

Linux 64-bit

webOS_TV_22_Simulator_1.4.1_linux.zip (93M)

<br>

<br>

Windows 64-bit

webOS_TV_22_Simulator_1.4.1_win.zip (63M)

<br>

<br>

macOS 64-bit

webOS_TV_22_Simulator_1.4.1_mac.zip (97M)

<br>

<br>

macOS 64-bit (ARM)

webOS_TV_22_Simulator_1.4.1_mac-arm64.zip (99M)

<br>

<br>

### webOS TV 6.0 Simulator

Linux 64-bit

webOS_TV_6.0_Simulator_1.4.1_linux.zip (86M)

<br>

<br>

Windows 64-bit

webOS_TV_6.0_Simulator_1.4.1_win.zip (57M)

<br>

<br>

macOS 64-bit

webOS_TV_6.0_Simulator_1.4.1_mac.zip (83M)

<br>

<br>

- 适用于 macOS 64-bit 的 webOS TV 6.0 Simulator 与 macOS ARM64 兼容。

说明

你也可以使用

[webOS Studio 的 Packager Manager](../webOS%20Studio/webOSStudio开发者指南.md#package-manager)

安装 webOS TV Simulator。
