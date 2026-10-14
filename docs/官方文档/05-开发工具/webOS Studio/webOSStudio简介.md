# webOS Studio 简介
> 原文链接: https://webostv.developer.lge.com/develop/tools/webos-studio-introduction ｜ 简体中文翻译

webOS Studio 是一个面向 webOS 的 [Microsoft Visual Studio Code](https://code.visualstudio.com/) (VS Code) 扩展。借助该扩展，开发者可以轻松开始制作 webOS 应用/服务（Web 应用、Enact 应用、JS 服务）。

注意

有关变更和更新，请查看

[Change Log | VS Code marketplace](https://marketplace.visualstudio.com/items/webOSSDK.webosstudio/changelog)

。

## 主要功能

webOS Studio 的主要功能如下：

- 管理 webOS 应用和服务的生命周期
- 从 VS Code 安装 webOS TV SDK
- 提示 Luna API，并协助你完成方法和参数的填写
- 为 webOS TV 应用开发提供许多便捷功能

## 界面

这是 webOS Studio 的用户界面。![webOS Studio 扩展的截图](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1730804933/webOS-TV/images/docs/tools/webOS_Studio_v2.1.1_UI_Overview_gjxh2t_bg37ol.webp)

| 组件 | 说明 |
| --- | --- |
| APPS IN WORKSPACE | 列出工作区中的应用。webOS Studio 的工作区与 VS Code 的工作区不同。更多详情，请参阅<br>[webOS Studio \| VS Code marketplace](https://marketplace.visualstudio.com/items/webOSSDK.webosstudio/changelog)<br>。 |
| KNOWN DEVICE | 列出由 webOS Studio 或 CLI 注册的已知设备。默认情况下，视图中会列出虚拟的 emulator 设备。 |
| PACKAGE MANAGER | 管理用于 webOS 应用开发的 SDK。参见<br>[包管理器](webOSStudio开发者指南.md#package-manager)<br>。 |
| SIMULATOR MANAGER | 列出已安装的 webOS TV 模拟器。参见<br>[模拟器管理器](webOSStudio开发者指南.md#simulator-manager)<br>。 |
| EMULATOR MANAGER | 列出 VirtualBox Emulator 中已安装的镜像。参见<br>[Emulator 管理器](webOSStudio开发者指南.md#emulator-manager)<br>。 |
| QUICK LAUNCHER | 列出指向 webOS Studio 文档的链接。 |
| Command Palette | 输入并执行各种命令（快捷键：<br>*Ctrl*<br>+<br>*Shift*<br>+<br>*P*<br>）。 |
| Notification Area | 显示该扩展的完成、错误等通知消息。 |
| Status Bar | 显示当前的设备配置文件。 |
