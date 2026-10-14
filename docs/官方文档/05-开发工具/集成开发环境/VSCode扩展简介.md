# VS Code 扩展简介
> 原文链接: https://webostv.developer.lge.com/develop/tools/vsce-introduction ｜ 简体中文翻译

注意：VS Code 扩展已停止支持

我们决定自 2024 年 3 月起不再支持 VS Code 扩展。我们建议您改用

[webOS Studio](../webOS%20Studio/webOSStudio简介.md)

如果您对 Visual Studio (VS) Code 比对 Eclipse IDE 更熟悉，那么您无需为了开发 webOS TV 应用而更换自己习惯的编辑器。您可以继续使用 VS Code，只是现在要搭配一个 webOS TV 扩展。要安装该插件，请阅读开发者指南中的[配置](VSCode扩展开发者指南.md#configuration)一节。

## 支持的功能

下表列出了 VS Code 扩展支持与不支持的功能。

| CLI 命令 | 功能 | VS Code 扩展是否支持 |
| --- | --- | --- |
| ares-generate | 从模板创建应用 | 是 |
| 创建 JS service 文件 | 是 |  |
| 创建<br>*appinfo.json*<br>文件 | 是 |  |
| ares-package | 以 minify 或非 minify 模式打包应用 | 是 |
| 将应用与 js service 打包为一个包文件（<br>*.ipk*<br>） | 是 |  |
| 分析应用包文件 | 否 |  |
| ares-setup-device | 添加目标设备 | 是 |
| 修改目标设备 | 是 |  |
| 移除目标设备 | 是 |  |
| 将目标设备设为默认设备 | 是 |  |
| 使用<br>[SSDP](https://en.wikipedia.org/wiki/Simple_Service_Discovery_Protocol)<br>搜索同一网络中的 webOS 设备 | 否 |  |
| ares-install | 在目标设备上安装应用 | 是 |
| 卸载目标设备上的应用。 | 是 |  |
| 列出目标设备上已安装的应用 | 是 |  |
| ares-launch | 在目标设备上启动应用 | 是 |
| 带参数在目标设备上启动应用 | 是 |  |
| 列出目标设备上正在运行的应用 | 是 |  |
| 终止正在运行的应用 | 是 |  |
| 无需安装直接启动应用 | 是 |  |
| 在模拟器上启动应用 | 是 |  |
| ares-inspect | 在 Web Inspector 中调试应用 | 是 |
| 在 Node Inspector 中调试 JS service | 是 |  |
| ares-server | 运行 Web 服务器并在 Web 浏览器中启动应用 | 是 |
| ares-novacom | 从目标设备获取私钥 | 是 |
| 在主机 PC 与目标设备之间启用端口转发 | 否 |  |
| 在目标设备的 shell 上运行命令 | 否 |  |
| ares-device-info | 获取目标设备的系统信息 | 是 |
| 监控目标设备的资源使用情况 | 否 |  |
| ares-extend-dev | 延长 Developer Mode 应用的开发者模式会话时间 | 是 |
