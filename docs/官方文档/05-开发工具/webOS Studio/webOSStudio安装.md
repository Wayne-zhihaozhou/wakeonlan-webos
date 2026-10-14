# webOS Studio 安装
> 原文链接: https://webostv.developer.lge.com/develop/tools/webos-studio-installation ｜ 简体中文翻译

本文指导你为 Visual Studio (VS) Code 安装 webOS Studio 扩展。

- 要了解如何连接电视设备，请参见 [准备并连接设备](webOSStudio开发者指南.md#prepare-and-connect-a-device) 。
- 要了解如何使用该扩展的关键功能，请参见 [基本用法](webOSStudio开发者指南.md#basic-usage) 。

## 系统要求

### 硬件

Apple Silicon Mac 不支持与 Emulator 相关的功能。

### 软件

| 软件 | 要求 |
| --- | --- |
| Microsoft Visual Studio Code | 1.58.0 或更高版本 |
| Node.js | v14.15.1 或更高版本（已在 v14.15.1 和 v16.20.2 上验证） |
| Python | 3.6 或更高版本 |
| VirtualBox | 6.1 |

## 安装准备

注意

如果你以前曾使用 webOS TV CLI 安装并使用过 **webOS TV tools**，则需要先将其清理干净。具体做法请参见 [安装 webOS Studio 的准备工作](../其他/旧版webOSTVSDK的移除.md#preparation-for-installing-webos-studio)。

### 安装 webOS CLI

webOS Studio 支持 webOS CLI（命令行界面）所提供的相同命令。因此，你必须在改用 webOS Studio 之前安装 webOS CLI。

有关如何安装 webOS CLI，请参见 [CLI 安装](../命令行工具/webOSCLI安装.md)。

## 安装 webOS Studio 扩展

要安装该扩展，请启动 VS Code 并执行以下步骤：

1. 转到 **View > Extensions** 。
2. 在搜索栏中搜索 **webOS Studio**。
3. 点击 **Install** 按钮。

![安装 webOS Studio 扩展的截图](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1708491792/webOS-TV/images/docs/guides/install-webos-studio_mteiym.webp)

随后你将在活动栏（Activity Bar）中看到 webOS Studio 图标。你也可以在 [webOS Studio | VS Code marketplace](https://marketplace.visualstudio.com/items/webOSSDK.webosstudio) 中找到安装和设置信息。
