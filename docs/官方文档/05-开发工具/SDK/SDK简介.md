# SDK 简介
> 原文链接: https://webostv.developer.lge.com/develop/tools/sdk-introduction ｜ 简体中文翻译

**注意**

2024 年，webOS TV CLI 已升级为 webOS CLI，webOS TV Extension for VS Code 也已升级为 webOS Studio。旧的 webOS TV CLI 和 webOS TV Extension for VS Code 已弃用。

以下为 webOS TV 为支持您的应用开发所提供的工具。

- webOS CLI - 这是一款基础工具，提供一组命令，用于在命令行环境中完成从创建到安装、启动 Web 应用的全过程。
- webOS Studio - webOS TV 为熟悉 VS Code 的开发者提供的扩展。
- webOS TV Simulator - webOS TV Simulator 允许开发者在没有真实设备的情况下，在计算机上测试应用。
- Beanviser - 这是一款用于测量应用或服务性能的图形化工具。

## SDK 工具的兼容平台版本

- 最新版本的 webOS CLI、webOS Studio 和 Beanviser 支持所有平台版本。
- Emulator 已弃用，webOS TV 22 或更高版本改为提供 Simulator。如果您仍需要为 webOS TV 6.0 或更低版本使用 Emulator，可以使用 [webOS Studio | Packager Manager](../webOS%20Studio/webOSStudio开发者指南.md#package-manager) 安装它。
- IDE 和 Sublime Text Plugin 已弃用。
- 关于各工具兼容平台版本的详细信息，请参见下表。

| 工具 | 支持的平台版本 | 平台发布年份 | SDK 版本* |
| --- | --- | --- | --- |
| webOS CLI | 支持所有平台版本 |  |  |
| webOS Studio | 支持所有平台版本 |  |  |
| webOS TV Simulator | webOS TV 24 | 2024 | 9.x.x |
| webOS TV 23 | 2023 | 8.x.x |  |
| webOS TV 22 | 2022 | 7.x.x |  |
| webOS TV 6.0 | 2021 | 6.x.x |  |
| Resource Monitor | webOS TV 6.0 或更高版本（支持所有平台版本，但不保证兼容性） |  |  |

**注意**

关于 SDK 版本，请在电视设备上进入 **Settings** 并查看 **webOS TV Version**。具体路径可能因平台版本而异。
