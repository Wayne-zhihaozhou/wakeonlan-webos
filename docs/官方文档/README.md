# webOS TV 开发者文档（简体中文翻译）

本仓库收录 [webOS TV 开发者官网](https://webostv.developer.lge.com) `Develop` 栏目全部页面的简体中文翻译，并按**软件开发主题**重新分类归档。

> 所有文档均基于官网原文完整翻译，保留代码块、表格与全部技术标识（API 名、方法名、参数名、事件名、服务名、错误码、文件名等一律保留英文）。每篇文档第 2 行标注原文链接。
>
> 本仓库仅收录**软件开发**相关文档；官网的设计指南（设计原则、系统 UI、样式）、隐私与合规类内容不在收录范围内。

---

## 目录

### 01-快速入门

从零开始构建并运行第一个 webOS TV 应用。

- [快速入门（Getting Started）](01-快速入门/00-推荐阅读.md)
- [应用调试](01-快速入门/应用调试.md)
- [应用生命周期](01-快速入门/应用生命周期.md)
- [应用资源](01-快速入门/应用资源.md)
- [应用模板](01-快速入门/应用模板.md)
- [构建您的第一个 webOS TV 应用](01-快速入门/构建第一个应用.md)
- [使用开发者模式应用测试应用](01-快速入门/开发者模式应用.md)
- [开发者工作流](01-快速入门/开发者工作流.md)
- [Web 应用类型](01-快速入门/Web应用类型.md)

### 02-开发指南

按主题组织的能力指南：应用基础、JavaScript 服务、DB8 数据库、媒体播放、系统功能与型号特性。

- [开发指南（Guides）](02-开发指南/00-推荐阅读.md)

**应用基础**

  - [应用生命周期管理](02-开发指南/应用基础/应用生命周期管理.md)
  - [应用本地化](02-开发指南/应用基础/应用本地化.md)
  - [返回按钮](02-开发指南/应用基础/返回按钮.md)
  - [向后兼容性（Backward Compatibility）](02-开发指南/应用基础/向后兼容性.md)
  - [访问控制组（ACG）指南](02-开发指南/应用基础/访问控制组ACG.md)
  - [Enyo 与 Enact 指南](02-开发指南/应用基础/Enyo与Enact指南.md)
  - [面向 webOS 的 Flutter](02-开发指南/应用基础/面向webOS的Flutter.md)

**JavaScript服务**

  - [JavaScript 服务基础](02-开发指南/JavaScript服务/JS服务基础.md)
  - [JS 服务使用](02-开发指南/JavaScript服务/JS服务使用.md)
  - [JavaScript 服务常见问题](02-开发指南/JavaScript服务/JS服务常见问题.md)
  - [BLE GATT](02-开发指南/JavaScript服务/BLE-GATT服务.md)

**数据库DB8**

  - [DB8 基础](02-开发指南/数据库DB8/DB8基础.md)
  - [DB8 使用指南](02-开发指南/数据库DB8/DB8使用.md)
  - [DB8 常见问题](02-开发指南/数据库DB8/DB8常见问题.md)

**媒体播放**

  - [DRM 内容播放](02-开发指南/媒体播放/DRM内容播放.md)
  - [多声音播放（Multi-Sound Playback）](02-开发指南/媒体播放/多声音播放.md)
  - [mediaOption 参数（mediaOption Parameters）](02-开发指南/媒体播放/mediaOption参数.md)
  - [使用 mediaOption 快速恢复媒体](02-开发指南/媒体播放/使用mediaOption恢复媒体.md)

**系统功能**

  - [屏幕保护程序（Screensaver）](02-开发指南/系统功能/屏幕保护程序.md)
  - [系统 UI 可见性](02-开发指南/系统功能/系统UI可见性.md)
  - [应用内购买（In-App Purchase）](02-开发指南/系统功能/应用内购买.md)

**型号特性**

  - [StanbyME 概述](02-开发指南/型号特性/StanbyME概述.md)
  - [StanbyME 竖屏模式（Portrait Mode）](02-开发指南/型号特性/StanbyME竖屏模式.md)
  - [StanbyME 上的触摸屏](02-开发指南/型号特性/StanbyME触摸屏.md)
  - [动作传感器概述](02-开发指南/型号特性/动作传感器概述.md)
  - [动作传感器（Motion Sensor）的实现](02-开发指南/型号特性/动作传感器实现.md)
  - [动作传感器的传感器数据](02-开发指南/型号特性/动作传感器数据.md)

### 03-API参考

Luna / webos-service / webOSTV.js 各服务与 API 的完整参考。

- [API 参考（References）](03-API参考/00-推荐阅读.md)

**应用与系统**

  - [Activity Manager API 参考](03-API参考/应用与系统/ActivityManagerAPI参考.md)
  - [Application Manager（应用管理器）](03-API参考/应用与系统/ApplicationManager应用管理器.md)
  - [Connection Manager（连接管理器）](03-API参考/应用与系统/ConnectionManager连接管理器.md)
  - [System Service（系统服务）](03-API参考/应用与系统/SystemService系统服务.md)
  - [Settings Service API 参考](03-API参考/应用与系统/SettingsService设置服务.md)
  - [Device Unique ID（设备唯一标识）](03-API参考/应用与系统/DeviceUniqueID设备唯一标识.md)
  - [TV Device Information（电视设备信息）](03-API参考/应用与系统/TVDeviceInformation电视设备信息.md)
  - [webOS 事件](03-API参考/应用与系统/webOS事件.md)

**媒体与数据**

  - [Audio（音频）](03-API参考/媒体与数据/Audio音频.md)
  - [Camera（摄像头）](03-API参考/媒体与数据/Camera摄像头.md)
  - [Database（数据库）](03-API参考/媒体与数据/Database数据库.md)
  - [Media Database（媒体数据库）](03-API参考/媒体与数据/MediaDatabase媒体数据库.md)

**无线与输入**

  - [BLE GATT API 参考](03-API参考/无线与输入/BLEGATT蓝牙服务.md)
  - [Magic Remote API 参考](03-API参考/无线与输入/MagicRemote魔法遥控器.md)

**DRM与安全**

  - [DRM（数字版权管理）](03-API参考/DRM与安全/DRM数字版权管理.md)
  - [DRM 消息](03-API参考/DRM与安全/DRM消息.md)
  - [Keymanager3（密钥管理器）](03-API参考/DRM与安全/Keymanager3密钥管理器.md)
  - [webOSTV.js DRM Agent](03-API参考/DRM与安全/webOSTV.jsDRMAgent指南.md)

**webOSTV.js库**

  - [webOSTV.js 库简介](03-API参考/webOSTV.js库/webOSTV.js库简介.md)
  - [webOSTV.js webOS API](03-API参考/webOSTV.js库/webOSTV.js的webOSAPI.md)
  - [webOSTV.js webOSDev API](03-API参考/webOSTV.js库/webOSTV.js的webOSDevAPI.md)
  - [webOSTV.js 发行说明](03-API参考/webOSTV.js库/webOSTV.js发行说明.md)

**webos-service与Luna**

  - [Luna Service API 简介](03-API参考/webos-service与Luna/LunaServiceAPI简介.md)
  - [webos-service API 简介](03-API参考/webos-service与Luna/webos-serviceAPI简介.md)
  - [webos-service API 参考](03-API参考/webos-service与Luna/webos-serviceAPI参考.md)

**配置文件**

  - [appinfo.json（应用元数据）](03-API参考/配置文件/appinfo.json应用元数据.md)
  - [services.json（服务配置）](03-API参考/配置文件/services.json服务配置.md)

### 04-平台规格

Web 引擎、媒体格式、DRM 与兼容性等平台能力规格。

- [平台规格（Specifications）](04-平台规格/00-推荐阅读.md)

**Web平台**

  - [Web API 与 Web 引擎](04-平台规格/Web平台/WebAPI与Web引擎.md)
  - [支持的应用分辨率](04-平台规格/Web平台/应用分辨率.md)
  - [TLS 与根证书](04-平台规格/Web平台/TLS与根证书.md)

**兼容性**

  - [与 NetCast 的对比](04-平台规格/兼容性/与NetCast对比.md)

**媒体格式**

  - [流媒体协议与 DRM](04-平台规格/媒体格式/流媒体协议与DRM.md)
  - [webOS TV 1.0 上的音视频格式](04-平台规格/媒体格式/webOS%20TV%201.0音视频格式.md)
  - [webOS TV 2.0 上的音视频格式](04-平台规格/媒体格式/webOS%20TV%202.0音视频格式.md)
  - [webOS TV 3.0 上的音视频格式](04-平台规格/媒体格式/webOS%20TV%203.0音视频格式.md)
  - [webOS TV 3.5 上的音视频格式](04-平台规格/媒体格式/webOS%20TV%203.5音视频格式.md)
  - [webOS TV 4.0 上的 AV 格式](04-平台规格/媒体格式/webOS%20TV%204.0音视频格式.md)
  - [webOS TV 4.5 上的 AV 格式](04-平台规格/媒体格式/webOS%20TV%204.5音视频格式.md)
  - [webOS TV 5.0 上的 AV 格式](04-平台规格/媒体格式/webOS%20TV%205.0音视频格式.md)
  - [webOS TV 6.0 上的 AV 格式](04-平台规格/媒体格式/webOS%20TV%206.0音视频格式.md)
  - [webOS TV 22 上的音视频格式](04-平台规格/媒体格式/webOS%20TV%2022音视频格式.md)
  - [webOS TV 23 上的 AV 格式](04-平台规格/媒体格式/webOS%20TV%2023音视频格式.md)
  - [webOS TV 24 上的 AV 格式](04-平台规格/媒体格式/webOS%20TV%2024音视频格式.md)
  - [webOS TV 25 上的音视频格式](04-平台规格/媒体格式/webOS%20TV%2025音视频格式.md)
  - [webOS TV 26 上的音视频格式](04-平台规格/媒体格式/webOS%20TV%2026音视频格式.md)

### 05-开发工具

SDK、CLI、IDE、模拟器、性能分析工具与编辑器插件的安装与使用。

- [开发工具（Tools）](05-开发工具/00-推荐阅读.md)

**SDK**

  - [SDK 简介](05-开发工具/SDK/SDK简介.md)
  - [SDK 发行说明](05-开发工具/SDK/SDK发行说明.md)

**命令行工具**

  - [webOS CLI 简介](05-开发工具/命令行工具/webOSCLI简介.md)
  - [webOS CLI 安装](05-开发工具/命令行工具/webOSCLI安装.md)
  - [webOS CLI 开发者指南](05-开发工具/命令行工具/webOSCLI开发者指南.md)
  - [CLI 发行说明](05-开发工具/命令行工具/webOSCLI发行说明.md)
  - [CLI 简介](05-开发工具/命令行工具/webOSTVCLI简介.md)
  - [CLI 安装](05-开发工具/命令行工具/webOSTVCLI安装.md)
  - [webOS TV CLI 开发者指南](05-开发工具/命令行工具/webOSTVCLI开发者指南.md)
  - [CLI 发行说明](05-开发工具/命令行工具/webOSTVCLI发行说明.md)

**集成开发环境**

  - [IDE 简介](05-开发工具/集成开发环境/IDE简介.md)
  - [设置项目](05-开发工具/集成开发环境/IDE设置项目.md)
  - [配置 JSON 文件](05-开发工具/集成开发环境/IDE配置JSON文件.md)
  - [配置目标设备](05-开发工具/集成开发环境/IDE配置目标设备.md)
  - [启动您的应用](05-开发工具/集成开发环境/IDE启动应用.md)
  - [使用检查器调试](05-开发工具/集成开发环境/IDE使用检查器调试.md)
  - [实用技巧](05-开发工具/集成开发环境/IDE实用技巧.md)
  - [VS Code 扩展简介](05-开发工具/集成开发环境/VSCode扩展简介.md)
  - [VS Code 扩展安装](05-开发工具/集成开发环境/VSCode扩展安装.md)
  - [VS Code 扩展开发者指南](05-开发工具/集成开发环境/VSCode扩展开发者指南.md)
  - [VS Code 扩展发行说明](05-开发工具/集成开发环境/VSCode扩展发行说明.md)

**webOS Studio**

  - [webOS Studio 简介](05-开发工具/webOS%20Studio/webOSStudio简介.md)
  - [webOS Studio 安装](05-开发工具/webOS%20Studio/webOSStudio安装.md)
  - [webOS Studio 开发者指南](05-开发工具/webOS%20Studio/webOSStudio开发者指南.md)
  - [webOS Studio 常见问题](05-开发工具/webOS%20Studio/webOSStudio常见问题.md)

**模拟器与仿真器**

  - [模拟器(Simulator)简介](05-开发工具/模拟器与仿真器/Simulator简介.md)
  - [模拟器(Simulator)安装](05-开发工具/模拟器与仿真器/Simulator安装.md)
  - [Simulator 开发者指南](05-开发工具/模拟器与仿真器/Simulator开发者指南.md)
  - [模拟器(Simulator)发行说明](05-开发工具/模拟器与仿真器/Simulator发行说明.md)
  - [模拟器(Emulator)简介](05-开发工具/模拟器与仿真器/Emulator简介.md)
  - [模拟器(Emulator)安装](05-开发工具/模拟器与仿真器/Emulator安装.md)
  - [模拟器(Emulator)开发者指南](05-开发工具/模拟器与仿真器/Emulator开发者指南.md)

**性能分析工具**

  - [Beanviser 简介](05-开发工具/性能分析工具/Beanviser简介.md)
  - [Beanviser 安装](05-开发工具/性能分析工具/Beanviser安装.md)
  - [Beanviser 开发者指南](05-开发工具/性能分析工具/Beanviser开发者指南.md)
  - [Beanviser 发行说明](05-开发工具/性能分析工具/Beanviser发行说明.md)
  - [资源监视器(Resource Monitor)简介](05-开发工具/性能分析工具/资源监视器简介.md)
  - [资源监视器(Resource Monitor)安装](05-开发工具/性能分析工具/资源监视器安装.md)
  - [资源监视器开发者指南](05-开发工具/性能分析工具/资源监视器开发者指南.md)
  - [资源监视器(Resource Monitor)发行说明](05-开发工具/性能分析工具/资源监视器发行说明.md)

**编辑器插件**

  - [Sublime Text 插件简介](05-开发工具/编辑器插件/SublimeText插件简介.md)
  - [配置 webOS TV 插件](05-开发工具/编辑器插件/配置webOSTV插件.md)
  - [使用 webOS TV 插件](05-开发工具/编辑器插件/使用webOSTV插件.md)
  - [更新与卸载插件](05-开发工具/编辑器插件/更新与卸载插件.md)

**其他**

  - [旧版 webOS TV SDK 的移除](05-开发工具/其他/旧版webOSTVSDK的移除.md)

### 06-示例应用

官方示例应用仓库索引。

- [示例应用（Samples）](06-示例应用/示例应用清单.md)

---

## 说明与维护

- **页面数量**：共收录 131 篇文档。
- **目录结构**：单一中文分类树，六大门类，章节内按主题二级分组；文件名全部中文化。
- **链接**：文档内指向官网的链接已改写为指向本地中文文档；本仓库未收录的页面保留官网绝对地址。
- **图片**：保留原始图片链接，可直接在 Markdown 预览中查看。
- **英文原文**：`.staging/` 目录保存抓取到的英文原文，用于对照校订。
- **维护脚本**：`tools/` 目录提供抓取、HTML→Markdown 转换与完整性校验脚本；`tools/restructure-zh.js --readme` 可重新生成本目录，其映射表记录了全部中文命名与分类关系。
