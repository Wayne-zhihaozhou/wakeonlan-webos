# webOS CLI 简介
> 原文链接: https://webostv.developer.lge.com/develop/tools/cli-introduction ｜ 简体中文翻译

webOS CLI（命令行界面）提供了一组命令，用于在命令行环境中创建、打包、安装和启动 Web 应用。借助 CLI，你无需使用特定的 IDE 即可开发和测试应用。

注意

你可以在 [Releases | webos-tools/cli](https://github.com/webos-tools/cli/releases) 查看发行说明，如需了解各命令的详细变更与更新，可以参阅 [Change Log | webos-tools/cli](https://github.com/webos-tools/cli/blob/main/CHANGELOG.md)。

## 功能

借助 webOS CLI，你可以将应用安装到目标设备上，例如模拟器、仿真器或 webOS TV 设备。此外，你还可以获取、运行、终止和移除目标设备上已安装的应用。你可以在开发过程的以下任一阶段使用 CLI：

![使用 CLI 的开发过程](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274811/webOS-TV/images/docs/tools/Development_Process_with_CLI_-_No_Dev_Mode_hwfryw.webp)

## 命令

下表列出了你可以使用的命令：

| 命令 | 说明 |
| --- | --- |
| ares | 提供使用 ares 命令的帮助菜单 |
| [ares-config](webOSCLI开发者指南.md#ares-config) | 配置 webOS CLI。 |
| [ares-generate](webOSCLI开发者指南.md#ares-generate) | 从模板创建 Web 应用。 |
| [ares-package](webOSCLI开发者指南.md#ares-package) | 创建并分析应用包文件。 |
| [ares-setup-device](webOSCLI开发者指南.md#ares-setup-device) | 管理目标设备。 |
| [ares-install](webOSCLI开发者指南.md#ares-install) | 将应用安装到目标设备上。 |
| [ares-launch](webOSCLI开发者指南.md#ares-launch) | 启动或终止 Web 应用。 |
| [ares-inspect](webOSCLI开发者指南.md#ares-inspect) | 启用 Web Inspector 或 Node 的 Inspector，用于调试 Web 应用或 JS 服务。 |
| [ares-server](webOSCLI开发者指南.md#ares-server) | 运行 Web 服务器以测试本地应用文件。 |
| [ares-novacom](webOSCLI开发者指南.md#ares-novacom) | 用于控制设备的命令行工具。 |
| [ares-device](webOSCLI开发者指南.md#ares-device) | 获取设备的系统信息并监控设备的资源使用情况。 |
