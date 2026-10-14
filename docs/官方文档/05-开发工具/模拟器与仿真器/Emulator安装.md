# 模拟器(Emulator)安装
> 原文链接: https://webostv.developer.lge.com/develop/tools/emulator-installation ｜ 简体中文翻译

注意：Emulator 已弃用

从 webOS TV 22 起，将不再提供 Emulator。作为替代，我们提供

[Simulator](Simulator简介.md)

，其开发便利性更好。如果你仍需要为 webOS TV 6.0 或更低版本使用 Emulator，可以通过

[webOS Studio | Packager Manager](../webOS%20Studio/webOSStudio开发者指南.md#package-manager)

安装。

请按照以下步骤安装模拟器(Emulator)。

## 安装准备

在开始安装之前，请检查是否满足系统要求和前提条件。

### 系统要求

| 操作系统/组件 | 要求 |
| --- | --- |
| Linux | Ubuntu 14.04 或更高版本（64 位） |
| Windows | Windows 7 或更高版本（64 位） |
| macOS | • macOS 10.12 Sierra（支持，但未经过完整测试）<br>• macOS 10.13 High Sierra - 11 Big Sur<br>• Intel 芯片（不支持 Apple silicon） |
| 内存 | 3 GB 或更多 RAM |

### 前提条件

确保已安装 Virtualbox 和 webOS TV CLI。

- Virtualbox 6.1：[https://www.virtualbox.org/wiki/Download_Old_Builds_6_1](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
- webOS TV CLI：[webOS TV CLI Installation](../命令行工具/webOSCLI安装.md)

## 步骤 1. 下载模拟器(Emulator)

下载与你的操作系统对应的模拟器(Emulator)并解压。

### webOS TV 6.0

Linux 64-bit

Emulator_tv_linux_v6.0.0.zip (1342M)

<br>

<br>

Windows 64-bit

Emulator_tv_win_v6.0.0.zip (1345M)

<br>

<br>

macOS 64-bit

Emulator_tv_mac_v6.0.0.zip (1342M)

<br>

<br>

### webOS TV 5.0

Linux 64-bit

Emulator_tv_linux_v5.0.0.zip (1451M)

<br>

<br>

Windows 64-bit

Emulator_tv_win_v5.0.0.zip (1454M)

<br>

<br>

macOS 64-bit

Emulator_tv_mac_v5.0.0.zip (1451M)

<br>

<br>

### webOS TV 4.0

Linux 64-bit

Emulator_tv_linux_v4.0.0.zip (1262M)

<br>

<br>

Windows 64-bit

Emulator_tv_win_v4.0.0.zip (1265M)

<br>

<br>

macOS 64-bit

Emulator_tv_mac_v4.0.0.zip (1262M)

<br>

<br>

### webOS TV 3.0

Linux 64-bit

Emulator_tv_linux_v3.0.0.zip (1174M)

<br>

<br>

Windows 64-bit

Emulator_tv_win_v3.0.0.zip (1177M)

<br>

<br>

macOS 64-bit

Emulator_tv_mac_v3.0.0.zip (1174M)

<br>

<br>

### webOS TV 2.0

Linux 64-bit

Emulator_tv_linux_v2.0.0.zip (873M)

<br>

<br>

Windows 64-bit

Emulator_tv_win_v2.0.0.zip (876M)

<br>

<br>

macOS 64-bit

Emulator_tv_mac_v2.0.0.zip (873M)

<br>

<br>

### webOS TV 1.2

Linux 64-bit

Emulator_tv_linux_v1.2.0.zip (1092M)

<br>

<br>

Windows 64-bit

Emulator_tv_win_v1.2.0.zip (1095M)

<br>

<br>

macOS 64-bit

Emulator_tv_mac_v1.2.0.zip (1092M)

<br>

<br>

<br>

## 步骤 2. 下载资源文件

下载与你的操作系统对应的资源文件并解压。

Linux Resource File

Resources_linux.zip (81M)

<br>

<br>

Windows Resource File

Resources_win.zip (37M)

<br>

<br>

macOS Resource File

Resources_mac.zip (38M)

<br>

<br>

## 步骤 3. 将解压后的目录放到 `LG_WEBOS_TV_SDK_HOME` 下

将步骤 1 中解压得到的 `Emulator` 目录，以及步骤 2 中解压得到的 `Resources` 目录，放到 `LG_WEBOS_TV_SDK_HOME` 的路径下。

- 关于如何找到 `LG_WEBOS_TV_SDK_HOME` 的路径，请参见[检查环境变量](../命令行工具/webOSCLI安装.md#step2)。
- 如果你已经安装了模拟器(Emulator)并想安装其他版本，请将步骤 1 中解压得到的 `Emulator` 目录下的 `vX.0.0` 目录，放到 `LG_WEBOS_TV_SDK_HOME` 路径下的 `Emulator` 目录中。

说明：步骤 3 之后的文件树示例

请查看下面的示例以加深理解。在以下示例中，

`LG_WEBOS_TV_SDK_HOME`

的路径为

`/home/user/tool/webos_tv_sdk/`

。

```shell
/home/user/tool/
├── webOS_TV_SDK
│   ├── Emulator
│   │   ├── v6.0.0
│   │   ├── v5.0.0 (if installing multiple versions)
│   │   ├── v4.0.0 (if installing multiple versions)
│   │   └── ...
│   ├── Resources
│   │   └── jre
```

## 步骤 4. 完成安装

请根据你的操作系统执行以下相应操作以完成安装。

### Windows

1. 进入 `Emulator/vX.0.0` 目录，其中 `X` 是要安装的版本。
2. 运行 *vm_register.bat*。
3. 运行 *LG_webOS_TV_Emulator.exe*。

### Linux

1. 打开终端并执行以下命令。`$ cd /LG_WEBOS_TV_SDK_HOME_PATH/Emulator/vX.0.0 $ chmod 777 ./* $ ./vm_register.sh $ ./create_desktop.sh $ sudo desktop-file-install webOS_TV_Emulator_vX.0.0.desktop`
   - LG_WEBOS_TV_SDK_HOME_PATH：`LG_WEBOS_TV_SDK_HOME` 的路径
   - X.0.0：要安装的模拟器(Emulator)版本
2. 在应用程序列表中运行 **webOS TV Emulator X.0.0**。

### macOS

1. 打开终端并执行以下命令。`$ cd /LG_WEBOS_TV_SDK_HOME_PATH/Emulator/vX.0.0 $ chmod 777 ./* $ ./vm_register.command`
   - LG_WEBOS_TV_SDK_HOME_PATH：`LG_WEBOS_TV_SDK_HOME` 的路径
   - X.0.0：要安装的模拟器(Emulator)版本
2. 执行以下命令以运行模拟器(Emulator)。`$ ./run_webos_emulator.sh`
