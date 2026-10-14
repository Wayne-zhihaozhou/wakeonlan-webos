# CLI 简介
> 原文链接: https://webostv.developer.lge.com/develop/tools/webos-tv-cli-introduction ｜ 简体中文翻译

注意：webOS TV CLI 已弃用

我们决定自 2024 年 3 月起不再支持 webOS TV CLI。我们建议您改用

[webOS CLI](webOSCLI简介.md)

。

webOS TV CLI（命令行界面）提供了一组命令，用于在命令行环境中创建、打包、安装和启动 Web 应用。通过 CLI，您无需使用特定的 IDE 即可开发和测试应用。

## 功能

使用 webOS TV CLI，您可以将应用安装到目标设备上，例如模拟器、仿真器或 webOS TV 设备。此外，您还可以检索、运行、终止和移除目标设备上已安装的应用。您可以在开发过程的以下任一阶段使用 CLI：

![使用 CLI 的开发流程](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274811/webOS-TV/images/docs/tools/Development_Process_with_CLI_-_No_Dev_Mode_hwfryw.webp)

## 命令

下表列出了您可以使用的命令：

| 命令 | 说明 |
| --- | --- |
| ares | 提供使用 ares 命令的帮助菜单 |
| [ares-generate](webOSCLI开发者指南.md#ares-generate) | 从模板创建 Web 应用。 |
| [ares-package](webOSCLI开发者指南.md#ares-package) | 创建并分析应用包文件。 |
| [ares-setup-device](webOSCLI开发者指南.md#ares-setup-device) | 管理目标设备。 |
| [ares-install](webOSCLI开发者指南.md#ares-install) | 在目标设备上安装应用。 |
| [ares-launch](webOSCLI开发者指南.md#ares-launch) | 运行或终止 Web 应用。 |
| [ares-inspect](webOSCLI开发者指南.md#ares-inspect) | 运行 Web Inspector 以调试 Web 应用。 |
| [ares-server](webOSCLI开发者指南.md#ares-server) | 运行 Web 服务器，以测试本地应用文件。 |
| [ares-novacom](webOSCLI开发者指南.md#ares-novacom) | 从 webOS TV 获取 Developer Mode 应用所需的私钥。 |
| [ares-device-info](webOSCLI开发者指南.md#ares-device-info) | 检索设备的系统信息并监控设备的资源使用情况。 |
| [ares-extend-dev](webOSCLI开发者指南.md#ares-extend-dev) | 延长 Developer Mode 应用的开发者模式会话时间。 |
