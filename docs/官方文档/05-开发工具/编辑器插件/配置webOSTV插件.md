# 配置 webOS TV 插件
> 原文链接: https://webostv.developer.lge.com/develop/tools/sublime-configuring-webos-tv-plugin ｜ 简体中文翻译

**注意：Sublime Text 插件已弃用**

自 2022 年起，我们已决定不再支持 Sublime Text 插件。建议您改用 [VS Code 扩展](../集成开发环境/VSCode扩展简介.md)。

本文指导您如何为 Sublime Text 安装 webOS TV 插件。要了解如何使用该插件的关键功能，请参见[使用 webOS TV 插件](使用webOSTV插件.md)。

## 前提条件

该插件提供与 CLI（命令行界面）相同的功能。因此，在使用该插件之前，您必须先安装 CLI 并在环境变量中配置 CLI 路径。安装程序会为您完成此操作。

## 为 Sublime Text 安装插件

如果您的计算机上已安装 Sublime Text，SDK 安装程序会自动安装该插件。但如果您尚未安装 Sublime Text，则可以在安装 Sublime Text 后手动安装该插件。

手动安装插件：

1. 针对您的操作系统运行如下指定的执行文件（.bat 或 .sh）。随后插件将被自动安装。
   - Linux `<SDK_Installed_Path>/SublimePlugin/webOS_plugin_install_linux.sh`
   - macOS `<SDK_Installed_Path>/SublimePlugin/webOS_plugin_install_mac.sh`
   - Windows `<SDK_Installed_Path>\SublimePlugin\webOS_plugin_install.bat`
2. 打开 Sublime Text，确认 webOS 菜单已成功添加，如下图所示。 ![Sublime Text 2 上 webOS 菜单的截图](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274956/webOS-TV/images/docs/tools/install_sublime_cedtbn.webp)

## 选择应用启动的目标设备

在计算机上安装 webOS TV SDK 和该插件后，从 **Start** 菜单启动 **Sublime Text 2**。然后，您可以在 **webOS > Select Target Device** 菜单中选择目标设备。

**注意：目标设备**

如果您是首次启动 Sublime Text，默认会选择模拟器作为目标设备。要添加您想要作为目标的其他设备，请使用 webOS TV CLI 命令。添加后，您可以在 **webOS > Select Target Device** 中看到已添加的目标设备。
