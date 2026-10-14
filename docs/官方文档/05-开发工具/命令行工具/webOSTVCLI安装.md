# CLI 安装
> 原文链接: https://webostv.developer.lge.com/develop/tools/webos-tv-cli-installation ｜ 简体中文翻译

注意：webOS TV CLI 已弃用

我们决定自 2024 年 3 月起不再支持 webOS TV CLI。我们建议您改用

[webOS CLI](webOSCLI简介.md)

。

重要

如果您已使用 npm 安装了 webOS OSE CLI（

`@webosose/ares-cli`

），则在安装 webOS TV CLI 之前，您需要先使用以下命令将其移除。

```shell
npm uninstall -g @webosose/ares-cli
```

请按照以下步骤安装 CLI。

## 安装准备

开始安装前，请确认是否满足系统要求。即使不满足这些要求，CLI 也可能可以工作，但不保证稳定性。

### 系统要求

| 操作系统 | 要求 |
| --- | --- |
| Windows | Windows 7 或更高版本（仅 64 位） |
| Linux | Ubuntu 16.04 或更高版本（仅 64 位） |
| macOS | macOS High Sierra (10.13) 或更高版本（仅 64 位） |

## 第 1 步. 下载 CLI

下载与您的操作系统相对应的 CLI (V1.12.4) 并解压。

Linux 64 位

webOS_TV_CLI_linux_1.12.4-j27.tgz (18M)

<br>

<br>

Windows 64 位

webOS_TV_CLI_win_1.12.4-j27.zip (19M)

<br>

<br>

macOS 64 位

webOS_TV_CLI_mac_1.12.4-j27.tgz (16M)

<br>

<br>

## 第 2 步. 检查环境变量

使用`echo` 命令检查 `LG_WEBOS_TV_SDK_HOME` 变量。

Windows

Linux 或 macOS

```shell
echo %LG_WEBOS_TV_SDK_HOME%
```

如果环境变量 `LG_WEBOS_TV_SDK_HOME`已存在，将输出其路径。

## 第 3 步. 配置环境变量

配置环境变量。如果环境变量 `LG_WEBOS_TV_SDK_HOME`已存在，您可以跳过配置，只需将现有的 `CLI` 目录替换为新目录即可。

Windows

Linux 或 macOS

- **如果环境变量 LG_WEBOS_TV_SDK_HOME 已存在，**
  1. 删除第 2 步输出的路径中现有的 `CLI` 目录。
  2. 将第 1 步中解压得到的新 `CLI` 目录放入第 2 步输出的路径中。
- **如果环境变量 LG_WEBOS_TV_SDK_HOME 不存在，**
  1. 在所需的路径中创建 `webOS_TV_SDK` 目录。
  2. 将第 1 步中解压得到的 `CLI` 目录放到 `webOS_TV_SDK` 目录下。
  3. 按如下方式配置环境变量。将 "YOUR_PATH" 替换为您创建 `webOS_TV_SDK` 目录的路径。 `// Setting the LG_WEBOS_TV_SDK_HOME variable to the parent directory of CLI > setx /m LG_WEBOS_TV_SDK_HOME "C:\YOUR_PATH\webOS_TV_SDK" // Setting the WEBOS_CLI_TV variable to the bin directory of CLI > setx /m WEBOS_CLI_TV "%LG_WEBOS_TV_SDK_HOME%\CLI\bin" // Adding the bin directory of CLI to the PATH variable // on CMD > setx /m PATH "%PATH%;%WEBOS_CLI_TV%" // or on PowerShell > setx /m PATH "$Env:PATH;$Env:WEBOS_CLI_TV”`
  4. 重启命令窗口或您的 PC，使更改生效。

## 第 4 步. 验证安装

通过执行 `ares –V` 命令来验证安装。如果安装成功，您将看到 webOS TV CLI 的版本。

```shell
$ ares -V
webOS TV CLI Version: 1.12.4-j27
```

**示例**<br>以下是 Linux 上环境变量 `LG_WEBOS_TV_SDK_HOME` 和文件树的示例。

```shell
$ echo $LG_WEBOS_TV_SDK_HOME
/home/user/tool/webOS_TV_SDK
```

```shell
/home/user/tool/
├── webOS_TV_SDK
│   ├── CLI
│   │   ├── bin
│   │   └── ...
│   ├── Simulator
│   │   ├── webOS_TV_23_Simulator_1.3.0
│   │   │   ├── webOS_TV_23_Simulator_1.3.0.appimage
│   │   │   └── ...
```
