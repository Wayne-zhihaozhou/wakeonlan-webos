# 与 NetCast 的对比
> 原文链接: https://webostv.developer.lge.com/develop/specifications/comparison-netcast ｜ 简体中文翻译

webOS TV 是 LG 全新的 Smart TV 平台，开发者可以从中获得诸多优势。下文描述了 LG Smart TV 平台 webOS TV 与 NetCast 之间的差异，以便开发者轻松进行比较。

与 NetCast 相比，webOS TV 的优势如下：

- 支持多任务处理
- 支持基于键值（no-SQL）的数据库
- 支持基于 Node.js 的 JavaScript 服务开发
- 支持增强的 HTML5
- 支持 Enyo Framework

## webOS TV 与 NetCast 对比

|  | webOS TV | NetCast |
| --- | --- | --- |
| 设备发布时间 | webOS TV 是自 2014 年起发布的 LG Smart<br>+<br>TV 上搭载的平台。<br>参见<br>[规格](../00-推荐阅读.md)<br>。 | NetCast 是 2011 年（NetCast 2.0）至 2015 年（NetCast 4.5）发布的 LG Smart TV 上搭载的平台。<br>参见<br>[NetCast 平台与设备规格](https://webostv.developer.lge.com/more/netcast/platform-specifications)<br>。 |
| 应用分辨率 | 1920x1080：FHD 分辨率（默认值）<br>1280x720：HD 分辨率 | 1280 x 720（推荐） |
| 应用元数据 | 应用打包需要<br>[appinfo.json](../../03-API参考/配置文件/appinfo.json应用元数据.md)<br>文件。 | 无需特定的应用元数据文件。 |
| 应用打包 | 应使用 CLI 的<br>[ares-package](../../05-开发工具/命令行工具/webOSCLI开发者指南.md#ares-package)<br>命令将应用打包为 IPK 格式。应用包应包含 webOS TV 所需的<br>[应用包资源](../../01-快速入门/应用资源.md)<br>。 | 无需特定的打包工具。应用项目应压缩为 ZIP 格式。 |
| SDK 组件 | [webOS TV Tools](../../05-开发工具/00-推荐阅读.md)<br>• Command Line Interface<br>• Simulator<br>• Visual Studio Code extension<br>• Beanviser<br>• VirtualBox-based Emulator<br>• Eclipse-based IDE (Deprecated)<br>• Plugin for Sublime Text (Deprecated) | [NetCast SDK](https://webostv.developer.lge.com/more/netcast/sdk-overview)<br>• Eclipse-based IDE<br>• VirtualBox-based Emulator |
| 虚拟键盘 | 在系统 UI 中受支持。<br>您无法在 webOS TV 上使用基于 NetCast 的虚拟键盘库。 | 如果要将包含虚拟键盘库的 NetCast 应用部署到 webOS TV，您应将<br>[虚拟键盘库](https://webostv.developer.lge.com/more/netcast/tools-samples#web_virtual-keyboard-library)<br>更新到可在 webOS TV 上使用的最新版本。 |
| 返回键行为 | 返回键行为使用标准 Web 技术。参见<br>[返回按钮](../../02-开发指南/应用基础/返回按钮.md)<br>。 | 使用 window.NetCastBack() 方法，该方法实现返回上一个 NetCast 菜单的功能。 |
| API | [支持的 Web API](../Web平台/WebAPI与Web引擎.md#supported-web-api)<br>[ HTML5 ]<br>• Audio & Video<br>• Communication<br>• Canvas<br>• SVG<br>• Offline Web Application<br>• Web Storage<br>• Indexed DB<br>• User Interaction<br>• Web Workers<br>• WebGL<br>[ CSS3 ]<br>• Static CSS: Backgrounds, Borders and Outline, Box, Colors, Columns, Flexible Box, Text, Fonts, User Interface, Media Queries, Selectors<br>• Dynamic CSS: Transforms, Transitions, Animations<br>[Luna Service API](../../03-API参考/webos-service与Luna/LunaServiceAPI简介.md)<br>• ActivityManager<br>• Application Manager<br>• Audio<br>• Camera (deprecated)<br>• Connection Manager<br>• Database<br>• Device Unique ID<br>• DRM<br>• Media Database<br>• Magic Remote<br>• Settings Service<br>• System Service<br>• TV Device Information | 支持的 Web API<br>[ HTML5 ]<br>• Audio & Video<br>• Communication<br>• Canvas<br>• SVG<br>• Offline Web Applications<br>• Web Storage<br>• User Interactions<br>• Web Workers<br>[ CSS3 ]<br>• Static CSS: Background and Borders, Box, Color, Columns and Multi Column Layout, Flexible Box, Text<br>• Dynamic CSS: Transforms, Transitions, Animations<br>Web Open API<br>• NetCast API<br>• Media Player Plugin and API<br>• Device Info Plugin and API<br>• Advertisement API<br>• Voice Recognition Plugin and API<br>• AppToApp Plugin and API<br>• Membership Plugin and API<br>• Sound Plugin and API<br>• DRMAgent Plugin and API<br>• Media Device NetCast API<br>• Image Viewer Framework API<br>• Media Plugin Video Player Framework API<br>• Billing Plugin and API (deprecated) |
| API 兼容性 | NetCast Web Open API 与 webOS TV 不兼容。<br>为使您的应用兼容任何 LG Smart TV，我们建议您使用标准 Web 技术开发应用。 | Luna Service API 与 NetCast 平台不兼容。<br>为使您的应用兼容任何 LG Smart TV，我们建议您使用标准 Web 技术开发应用。 |
| 应用提交所需文档 | 参见<br>[应用自检清单](https://webostv.developer.lge.com/distribute/app-self-checklist)<br>中的“Required Documents for Application Submission to LG Seller Lounge”。webOS TV 应用的应用检查清单目前正在更新中。 | 参见<br>[技术说明](https://webostv.developer.lge.com/more/netcast/technical-notes)<br>中的“Required Documents for Application Submission to LG Seller Lounge”。 |
| 应用分发 | 在<br>[LG Seller Lounge](http://seller.lgappstv.com/seller/main/Main.lge)<br>上提交您的应用。 | 在<br>[LG Seller Lounge](http://seller.lgappstv.com/seller/main/Main.lge)<br>上提交您的应用。 |
