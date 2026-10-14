# 使用检查器调试
> 原文链接: https://webostv.developer.lge.com/develop/tools/ide-debugging-with-inspectors ｜ 简体中文翻译

注意：IDE 弃用

我们已决定自 2022 年起不再支持 IDE。我们建议您改用 [VS Code extension](VSCode扩展简介.md)。

webOS TV IDE 提供两个检查器，用于调试 Web 应用和 JS 服务。让我们进一步了解这些检查器。

注意

Web Inspector 基于 Chrome DevTools。有关如何使用 Chrome DevTools 的详细说明，请参阅 [Chrome DevTools](https://developer.chrome.com/docs/devtools/)。某些版本的 Google Chrome 可能不支持 Web Inspector。有关更多信息，请参阅 [FAQ](https://webostv.developer.lge.com/faq)。

## 使用 Web Inspector 调试 Web 应用

webOS TV IDE 提供 Web Inspector 用于调试 Web 应用。Web Inspector 会结合执行信息监控在目标设备上运行的应用。Web Inspector 使用 Chromium 浏览器作为默认浏览器。IDE 已包含 Chromium 浏览器，因此您无需在计算机上安装 Chromium 浏览器。

要调试应用，您必须以 non-minify 模式打包应用。如果源代码被缩减或文件被合并，检查信息会变得困难。

以下展示如何在模拟器上打包、安装和启动应用，并使用 Web Inspector 进行调试：

1. 在 IDE 中，在 Project Explorer 中选择要调试的项目。
2. 从菜单单击 **webOS Menu > Debug webOS Application**。或者，您也可以通过以下方式调试应用：
  - 从菜单单击 **Run > Debug**。
  - 单击工具栏图标。
3. 在 Debug Configurations 窗口中，双击窗口左侧树状视图中的 **webOS Application** 以创建新配置。
4. 在 **webOS** 选项卡中，检查您的应用名称，并在列表中选择 **emulator** 作为目标设备。如果未输入应用名称，请单击 **Browse** 按钮选择您的应用。
5. 然后，单击 **Debug**，在 Web Inspector 中调试您的应用。

注意

该插件目前不支持用于 JS 服务调试的 Node Inspector。您可以通过 CLI 命令来使用它。有关详细信息，请参阅 [Launching Node Inspector](../命令行工具/webOSCLI开发者指南.md#launch-node-inspector)。

## 使用 Node Inspector 调试 JS 服务

webOS TV IDE 提供 Node Inspector 用于调试 JS 服务。Node Inspector 会结合执行信息监控在目标设备上运行的 JS 服务。Node Inspector 使用 Chromium 浏览器作为默认浏览器。IDE 已包含 Chromium 浏览器，因此您无需在计算机上安装 Chromium 浏览器。

要在 webOS TV IDE 中调试您的服务：

1. 确认您的应用和服务都在目标设备上运行。
2. 从菜单选择 **webOS Menu** > **Debug webOS Service**。或者，单击工作台工具栏上的工具栏图标。
3. 在 Debug Service 窗口中，选择您服务的服务 ID 以及目标设备。
  - 在 **Service ID** 字段中，输入您的服务 ID，或单击 **Browse** 按钮选择您的服务项目。
  - 对于 **Select Target** 字段，选择您的服务正在运行的目标设备。
4. 单击 **Debug** 按钮开始调试应用。Node Inspector 会打开。 ![Screenshot of Node Inspector](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274944/webOS-TV/images/docs/tools/ide_node_inspector_shwouc.webp)​
