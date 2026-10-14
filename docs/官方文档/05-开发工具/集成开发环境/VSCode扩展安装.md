# VS Code 扩展安装
> 原文链接: https://webostv.developer.lge.com/develop/tools/vsce-installation ｜ 简体中文翻译

注意：VS Code 扩展已停止支持

我们决定自 2024 年 3 月起不再支持 VS Code 扩展。我们建议您改用

[webOS Studio](../webOS%20Studio/webOSStudio简介.md)

本文介绍如何为 Visual Studio (VS) Code 安装 webOS TV 扩展。

- 要了解如何连接电视设备，请参见 [webOS TV 扩展配置](VSCode扩展开发者指南.md#configuration) 。
- 要了解如何使用该扩展的关键功能，请参见 [使用 webOS TV 扩展开发应用](VSCode扩展开发者指南.md#app-development) 。

## 前提条件

### webOS TV CLI

该扩展提供的功能与 CLI（命令行界面）相同。因此，在使用之前，您必须安装最新版本的 CLI，并在环境变量（WEBOS_CLI_TV）中配置 CLI 路径。

要配置环境变量，请参见 [CLI 安装](../命令行工具/webOSCLI安装.md)。

### Chrome 浏览器

要使用 Web Inspector 调试应用，您必须在 PC 上安装与 webOS TV 的 Chromium 浏览器兼容的 Chrome 浏览器（或 Chromium）。不过，某些版本的 Chrome 浏览器可能无法正常工作。

下表列出了各 webOS TV 版本兼容的 Chrome 版本及下载链接。

| webOS TV 版本 | webOS TV 发布年份 | 使用 Inspector 时兼容的 Chrome 版本 |
| --- | --- | --- |
| webOS TV 23 | 2023 | • 最新版本的 Chrome |
| webOS TV 22 | 2022 |  |
| webOS TV 6.0 | 2021 |  |
| webOS TV 5.0 | 2020 | • [Chrome v68 (Windows)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win/561747/)<br>• [Chrome v68 (macOS)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Mac/561749/)<br>• [Chrome v68 (Linux 64bit)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Linux_x64/561747/) |
| webOS TV 4.x | 2018-2019 |  |
| webOS TV 3.x | 2016-2017 | • [Chrome v38 (Windows)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win/290006/)<br>• [Chrome v38 (macOS)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Mac/306948/)<br>• [Chrome v38 (Linux 64bit)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Linux_x64/320008/) |
| webOS TV 2.0 | 2015 |  |
| webOS TV 1.0 | 2014 |  |

## 安装 webOS TV 扩展

要在 VS Code 上安装 VS Code 扩展，请执行以下步骤。您也可以在 Marketplace 上查看 webOS TV 扩展。

1. 运行 VS Code。
2. 单击 VS Code 侧边活动栏中的“扩展”图标，或执行 View: Extensions 命令（Ctrl+Shift+X），打开“扩展”视图。
3. 搜索“webOS TV”扩展，并从 [Marketplace](https://marketplace.visualstudio.com/items?itemName=webostvsdk.webostv) 安装它。
