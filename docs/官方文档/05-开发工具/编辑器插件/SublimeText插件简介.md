# Sublime Text 插件简介
> 原文链接: https://webostv.developer.lge.com/develop/tools/sublime-introduction ｜ 简体中文翻译

**注意：Sublime Text 插件已弃用**

自 2022 年起，我们已决定不再支持 Sublime Text 插件。建议您改用 [VS Code 扩展](../集成开发环境/VSCode扩展简介.md)。

如果您是 Sublime Text 用户，则无需更换自己钟爱的编辑器来编写 webOS TV 应用。您可以继续使用 Sublime Text，只不过现在搭配了 webOS TV 插件。要安装该插件，请阅读[配置指南](配置webOSTV插件.md)。

如果您刚接触 Sublime Text，该编辑器可以免费使用。但若想稳定、持续地使用，则需要购买许可证。如果您不希望购买许可证密钥，也不必担心。您可以选择改用 webOS TV SDK 中打包的 eclipse IDE。

尽管我们已尽力将 SDK 组件的所有功能都应用到 Sublime Text，但并非所有功能都能在 Sublime Text 上使用。请阅读下一节，了解您可以使用哪些功能。

**注意：支持的 Sublime Text 版本**

目前，该插件仅支持 Sublime Text 2。

## 支持的功能

下表说明了 Sublime Text 插件支持与不支持的功能。

| 类别 | 功能 | Sublime Text 插件支持情况 |
| --- | --- | --- |
| 创建 | 从模板创建应用。查看<br>[可用模板](使用webOSTV插件.md#creating-web-apps)<br>。 | 支持 |
|  | 创建 JS service 文件。 | 支持 |
|  | 创建 appinfo.json 文件。 | 支持 |
| 打包 | 以 minify 模式打包应用。 | 支持 |
|  | 以非 minify 模式打包应用。 | 支持 |
| 目标设备 | 添加目标设备（Emulator）。 | 仅 CLI |
|  | 修改目标设备（Emulator）。 | 仅 CLI |
|  | 移除目标设备（Emulator）。 | 仅 CLI |
| 安装/卸载 | 在模拟器上安装应用。 | 支持 |
|  | 在模拟器上卸载应用。 | 支持 |
| 列表 | 列出目标设备。 | 支持 |
|  | 列出模拟器上已安装的应用。 | 支持 |
|  | 列出模拟器上正在运行的应用。 | 支持 |
| 启动/终止 | 在模拟器上启动应用。 | 支持 |
|  | 启动托管应用（hosted app）。 | 仅 CLI |
|  | 运行 Web 服务器并在 Web 浏览器上启动应用。 | 支持 |
|  | 终止正在运行的应用。 | 仅 CLI |
| 检查器 | 在 Web inspector 中调试应用。 | 支持 |
|  | 在 Node inspector 中调试 JS service。 | 仅 CLI |
