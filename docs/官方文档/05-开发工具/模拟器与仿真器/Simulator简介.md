# 模拟器(Simulator)简介
> 原文链接: https://webostv.developer.lge.com/develop/tools/simulator-introduction ｜ 简体中文翻译

webOS TV 模拟器(Simulator)在 PC 上提供与 TV 设备类似的 Web 应用开发环境。

- 它支持 Web 应用开发所需的大部分功能，例如 RCU、Luna API、webOSSystem API、webOSTV.js 以及相同版本的 Chromium。
- 它允许使用 Inspector 轻松调试，并通过自动重新加载功能实现边修改边测试。
- 它可以在大多数 PC 上运行，无需额外的环境设置。

## 布局

以下是 webOS TV 模拟器(Simulator)的布局。

![webOS TV Simulator Screenshot](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1667291160/webOS-TV/images/docs/tools/webOS_TV_22_Simulator_v1.2.0_layout_ilrhxj.webp)

## 主要功能

以下是模拟器(Simulator)便于开发应用或服务的主要功能。

### 轻松运行应用和服务

有多种方式可以轻松运行应用和服务。

- 你可以使用菜单栏、RCU 底部的特殊按键或快捷键来执行应用或服务。
- 执行过一次的应用会被添加到主屏幕，因此你可以点击主屏幕上的图标来运行该应用。
- 添加到服务列表中的服务可以通过开关按钮打开或关闭。

### 应用调试

你可以使用 inspector 调试应用，它会在应用运行时自动启动。

### 自动重新加载

一旦你修改并保存代码，应用就会自动重新加载，因此你可以立即查看所做修改的结果，无需终止并重新启动应用。

### 与 webOS CLI 和 webOS Studio 互通

你可以直接通过 webOS CLI 或 webOS Studio 运行你的应用。

### RCU

包含一个用于测试遥控器操作的 RCU。

## 限制

- 不支持原生应用（仅支持 Web 应用）。
- 视频和音频规格与真实 TV 设备不同。
- 不支持 DRM 功能。
- 不支持 [mediaOption](../../02-开发指南/媒体播放/mediaOption参数.md)。
- 部分 luna API 和 webOSSystem API 不受支持。
