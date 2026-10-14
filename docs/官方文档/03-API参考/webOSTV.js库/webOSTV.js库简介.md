# webOSTV.js 库简介
> 原文链接: https://webostv.developer.lge.com/develop/references/webostvjs-introduction ｜ 简体中文翻译

webOSTV.js 是一个可移植的库，用于访问 webOS TV 的特定电视功能。webOSTV.js 库为你的应用提供了一套可在 webOS TV 上使用的 API。要了解如何使用 webOSTV.js 库，请参考[示例代码](https://github.com/webOS-TV-app-samples/webOSTVJSLibrary)。

> **重要**
>
> 本库在 webOS TV 4.0 或更高版本上获得完全支持；不过，[webOS API](webOSTV.js的webOSAPI.md) 的方法与用于旧版 webOS TV 的 [webOS.js](https://webostv.developer.lge.com/assets/library/webOSjs-0.1.0.zip) 库兼容。

![下载图标](https://res.cloudinary.com/dcsdn4mzr/image/upload/c_scale,w_81/v1655796051/webOS-TV/images/docs/guides/2331_wotytv.gif)

下载

[webOSTV.js library v1.2.13](https://webostv.developer.lge.com/assets/library/webOSTVjs-1.2.13.zip)

## API

| API | 功能 |
| --- | --- |
| [webOS](webOSTV.js的webOSAPI.md) | 提供与 webOS.js 库兼容的方法。在 webOS.js 库的方法中，不在 webOS TV 上执行的方法已被排除。 |
| [webOSDev](webOSTV.js的webOSDevAPI.md) | 提供包含 webOS.js 中未包含的新 API 的库方法。 |

## Class

| Class | 功能 |
| --- | --- |
| [DRMAgent](../DRM与安全/webOSTV.jsDRMAgent指南.md) | 提供表示 DRM agent 的类。此类用于在 webOSDev API 中管理 DRM service。 |
