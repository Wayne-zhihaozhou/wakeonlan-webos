# 启动您的应用
> 原文链接: https://webostv.developer.lge.com/develop/tools/ide-launching-your-app ｜ 简体中文翻译

注意：IDE 弃用

我们已决定自 2022 年起不再支持 IDE。我们建议您改用 [VS Code extension](VSCode扩展简介.md)。

在启动 Web 应用之前，您必须将应用打包并安装到目标设备上。通过单击 **Run Configurations** 或 **Debug Configurations** 菜单，以下三个步骤会依次执行：

## 步骤 1. 打包

您可以通过以下两种模式打包应用：

### Minify 模式

**Minify 模式**在创建包文件（.ipk）时会缩减源代码的大小。它会调整并缩短变量名和行距。它还会将多个文件合并为单个文件，以减少源代码大小和文件加载时间。您可以使用 minify 模式将应用安装到目标设备，或将应用提交到 LG Seller Lounge。

注意：Minify 模式限制

目前只有基于 Enyo 的源代码才能被压缩和合并。我们建议您使用其他 JavaScript 压缩工具来压缩非基于 Enyo 的源代码。

### Non-minify 模式

**Non-minify 模式**跳过压缩源代码的过程，直接使用源代码创建包文件。您可以使用 non-minify 模式来调试应用。

## 步骤 2. 安装

应用打包完成后，包文件会立即安装到选定的目标设备上。

## 步骤 3. 启动

已安装的应用会在目标设备上自动启动。

注意：webOS TV 模拟器

webOS TV 模拟器是一个工具，可在您的计算机上提供与 webOS TV 类似的环境。如果您希望在 webOS TV 上启动应用之前先进行模拟，建议先在模拟器上运行该应用。

以下展示如何在 webOS TV IDE 中通过一步完成应用的打包、安装和启动：

1. 在 Project Explorer 中选择您要启动的项目。
2. 从菜单单击 **webOS Menu > Run webOS Application**。或者，您也可以通过以下方式启动 Web 应用：
  - 从菜单单击 **Run > Run**。
  - 单击工具栏图标。
3. 在 Run Configurations 窗口中，双击窗口左侧树状视图中的 **webOS Application** 以创建新配置。
4. 在 **webOS** 选项卡中，检查您的应用名称，并在列表中选择目标设备。如果未输入应用名称，请单击 **Browse** 按钮选择一个应用。
5. 如果您有需要随应用一起打包的服务，请执行以下步骤。如果没有，请跳过此步骤。
  1. 在 Project Reference 中单击 **Include Service Projects** 选项。
  2. 选择 **webOSService** 选项卡。
  3. 选择要随应用一起打包的服务。
6. 然后，单击 **Run**，在目标设备上启动您的应用。

注意：目标设备配置

如果 **Run** 按钮未激活，请将 IDE 连接到目标设备。有关如何连接目标设备，请参阅[配置目标设备](IDE配置目标设备.md)。要在模拟器中启动应用，您必须先在计算机上启动模拟器。

您可以在模拟器的 Launcher 和 [App Manager](../模拟器与仿真器/Emulator开发者指南.md#using-app-manager) 中启动或关闭 Web 应用。要在真实电视上安装包文件，请参阅 [App Testing on webOS TV](../../01-快速入门/开发者模式应用.md)。
