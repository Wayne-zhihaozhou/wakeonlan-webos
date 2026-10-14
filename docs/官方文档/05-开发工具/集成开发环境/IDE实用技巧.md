# 实用技巧
> 原文链接: https://webostv.developer.lge.com/develop/tools/ide-useful-tips ｜ 简体中文翻译

注意：IDE 弃用

我们已决定自 2022 年起不再支持 IDE。我们建议您改用 [VS Code extension](VSCode扩展简介.md)。

以下是一些适用于 webOS TV IDE 的实用技巧。

## 快捷键

webOS TV IDE 为 webOS 菜单提供快捷键。要使用下面的快捷键，请同时按下所指示的组合按键，然后按下代表字符。例如，`Ctrl+Alt+W, P` 表示先按下 `Ctrl` 键，并在继续按住 `Ctrl` 键的同时按下 `Alt` 键和 `W` 键。然后从键盘上松开所有按键，再按 `P` 键以执行该快捷键。

按下 `Ctrl+Alt+W` 时，快捷键会列在屏幕右下角。

| 菜单 | 快捷键 |
| --- | --- |
| New webOS Project | Ctrl+Alt+W, P |
| Register Application as Template | Ctrl+Alt+W, A |
| New Enyo Source File | Ctrl+Alt+W, F |
| Import webOS Project | Ctrl+Alt+W, I |
| Export IPK | Ctrl+Alt+W, E |
| Run as browser | Ctrl+Alt+W, B |
| Run webOS Application | Ctrl+Alt+W, R |
| Debug webOS Application | Ctrl+Alt+W, D |
| Debug JS service with Node inspector | Ctrl+Alt+W, N |

## 导出 IPK

您必须打包 Web 应用，才能在真实电视上测试、提交到 LG Seller Lounge 或用于任何其他目的。

以下展示如何在 webOS TV IDE 中导出包文件（.ipk）：

1. 从菜单单击 **webOS Menu > Export IPK**。
2. 在 Export IPK 窗口中，选择打包类型：minify 或 non-minify。如有需要，在打包 Web 应用后选择导出 IPK 文件的位置。注意：Minify 选项目前只有基于 Enyo 的源代码才能使用 minify 选项进行压缩。我们建议您使用其他 JavaScript 压缩工具来压缩非基于 Enyo 的源代码。
3. 如果您的应用有需要打包的服务，请执行以下步骤。如果没有，请跳过此步骤。
  1. 单击 **Next** 按钮。
  2. 选择要随应用一起打包的服务。
4. 单击 **Finish** 按钮。包文件（.ipk）会在 Export IPK 菜单中设置的位置创建。您可以在 **Console** 中查看所创建包文件的状态和路径。

## 在 Web 浏览器上运行 HTML

webOS TV IDE 通过集成的 Chromium 浏览器作为外部 Web 浏览器提供预览。您可以在目标设备上启动应用之前查看应用的预览。

以下展示如何在 Chromium 浏览器上运行应用：

1. 在 Project Explorer 中选择您要预览的 HTML 文件。
2. 从菜单单击 **webOS Menu > Run as browser**。或者，单击工具栏图标。
3. 随后，预览会在 Chromium 浏览器上启动。

## 打开视图

在 IDE 中开发应用的过程中，您可能会误关闭某些视图，例如 Project Explorer 或 Target Configuration。

以下展示如何打开视图：

1. 从菜单单击 **Window > Show View**。可打开的视图会列在菜单的左侧或右侧。
2. 从 Console、Image Viewer、Outline、Problems、Project Explorer、Search、Servers、Target Configuration 等视图中选择一个。
3. 随后，所选视图会在当前透视图中打开。

## 帮助菜单

About webOS IDE for webOS TV Developers 菜单为开发者提供有用的链接。

1. 在 IDE 中，从菜单单击 **Help > About webOS IDE for webOS TV Developers**。
2. 单击弹出窗口中的链接。随后，Web 浏览器会打开并跳转到 webOS TV Developer 网站上的 **IDE** 页面。
