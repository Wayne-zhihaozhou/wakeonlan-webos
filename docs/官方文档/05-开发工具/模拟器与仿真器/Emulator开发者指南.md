# 模拟器(Emulator)开发者指南
> 原文链接: https://webostv.developer.lge.com/develop/tools/emulator-dev-guide ｜ 简体中文翻译

注意：Emulator 已弃用

从 webOS TV 22 起，将不再提供 Emulator。作为替代，我们提供开发便利性更好的 [Simulator](Simulator简介.md)。如果你仍需要为 webOS TV 6.0 或更低版本使用 Emulator，可以通过 [webOS Studio | Packager Manager](../webOS%20Studio/webOSStudio开发者指南.md#package-manager) 安装。

本文介绍如何使用 webOS TV 模拟器(Emulator)的主要功能。

## 使用 App Manager

说明

如果你已安装 webOS CLI v3.0.0 或更高版本，则无法使用 Emulator 的 App Manager。作为替代，你可以使用 [webOS CLI](../命令行工具/webOSCLI开发者指南.md#install-the-web-app) 或 [webOS Studio](../webOS%20Studio/webOSStudio开发者指南.md#package-install-and-launch-the-app) 在 Emulator 上安装应用。

App Manager 是一款供开发者使用的工具，可通过窗口轻松地从模拟器(Emulator)安装、启动、关闭和移除打包的应用文件（.IPK）。借助该工具，你在模拟器上进行简单测试时无需在终端中手动输入 CLI 命令。要启动它，请点击遥控器模拟器中的 **MENU**，然后选择 **App Manager**。

在 **App Manager** 窗口中，当前正在运行的应用列在 **Running Apps** 中，已安装的应用列在 **Installed Apps** 中。请注意，在 webOS TV Emulator v2.0.0 或更高版本中，**Installed Apps** 列表仅显示用户安装的应用；而在 webOS TV Emulator v1.2.0 中，它会显示所有已安装的应用，包括预装应用。

### 安装应用

1. 点击 **INSTALL**。
2. 在 [Open] 窗口中选择一个打包的应用文件（.ipk），然后点击 **Open**。你可以选择多个文件进行安装。
3. 安装过程中，每个应用的安装进度都会显示进度条。如果你点击图标 **x**，安装将被取消。![Screenshot of installing an app on the App Manager](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274570/webOS-TV/images/docs/tools/appmanager1_edwq7z.webp)
4. 安装完成后，会显示该图标，并且已安装的应用 ID 会添加到 **Installed Apps** 的末尾。请注意，已安装的应用 ID 可能会延迟一段时间后才添加到列表中。![Screenshot of the installed app list on the App Manager](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274581/webOS-TV/images/docs/tools/appmanager2_httwgt.webp)

### 启动应用

1. 从 **Installed Apps** 中选择一个应用 ID。
2. 点击 **LAUNCH**。
3. 随后，所选应用将在模拟器(Emulator)上启动，你可以看到该应用 ID 被添加到 **Running Apps** 中。

### 关闭应用

1. 从 **Running Apps** 中选择一个应用 ID。
2. 点击 **TERMINATE**。
3. 所选应用将被关闭，并且该应用 ID 会从 **Running Apps** 中移除。

### 移除应用

1. 从 **Running Apps** 或 **Installed Apps** 中选择一个应用 ID。
2. 点击 **REMOVE**。
3. 所选应用将被移除，并且该应用 ID 会从 **Installed Apps** 中移除。

### 重新加载应用

如果你未使用 App Manager 安装或移除应用，则必须点击 **RELOAD**，才能使其立即反映到 **Running Apps** 和 **Installed Apps** 中。

## 截取屏幕截图

你可以截取主屏幕的屏幕截图并保存。

1. 点击 **MENU**，然后选择 **Take Screenshot**。
2. 在 Take Screenshot 窗口中，点击 **Take**。
3. 屏幕截图图像将以 PNG 格式保存，文件名自动生成。屏幕截图文件名格式为 "screenshot\_{ *yyyymmdd_hhmmss* }.png"，并且该屏幕截图文件保存在 **{*UserProfileFolder*}\webOS_SDK\Screenshot** 下。

说明

如果你在模拟器(Emulator)运行时移除了 Screenshot 文件夹，则 **Take Screenshot** 不会保存图像。一旦重新启动模拟器(Emulator)，Screenshot 文件夹会被重新生成，图像即可正常保存。
