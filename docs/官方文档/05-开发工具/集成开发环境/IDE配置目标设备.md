# 配置目标设备
> 原文链接: https://webostv.developer.lge.com/develop/tools/ide-configuring-target ｜ 简体中文翻译

注意：IDE 弃用

我们已决定自 2022 年起不再支持 IDE。我们建议您改用 [VS Code extension](VSCode扩展简介.md)。

要在 IDE 中测试您的应用，您必须将 IDE 连接到任意目标设备。安装 IDE 后，模拟器会被配置为默认目标设备，并显示 'X' 标记。您可以从右键菜单手动连接模拟器（或者，如果您添加了新的目标设备，也可以手动移除模拟器）。

![Target Configuration tab](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275041/webOS-TV/images/docs/tools/target_config_context_menu_g996pl.webp)

模拟器连接到 IDE 后，模拟器上已安装并正在运行的应用会被列出。您可以选择列出的应用来运行、调试、卸载或关闭。

要添加目标设备：

1. 单击 **New Connection** 按钮。
2. 选择设备类型，并输入所选类型的信息。
3. 单击 **Finish**。如果设备添加成功，其名称会添加到 Target Configuration 列表中。

注意：连接到真实电视

要添加真实电视作为新目标设备，请参阅 [App Testing on webOS TV](../../01-快速入门/开发者模式应用.md)。
