# 模拟器(Emulator)简介
> 原文链接: https://webostv.developer.lge.com/develop/tools/emulator-introduction ｜ 简体中文翻译

注意：Emulator 已弃用

从 webOS TV 22 起，将不再提供 Emulator。作为替代，我们提供开发便利性更好的[Simulator](Simulator简介.md)。如果你仍需要为 webOS TV 6.0 或更低版本使用 Emulator，可以通过[webOS Studio | Packager Manager](../webOS%20Studio/webOSStudio开发者指南.md#package-manager)安装。

webOS TV 模拟器(Emulator)在你的计算机上仿真 webOS TV，使你能够在计算机上测试和调试应用。它运行在 Oracle VM VirtualBox 上以仿真 webOS TV，并仿真 LG Smart+TV 遥控器。

## 支持的平台版本

各模拟器(Emulator)支持的平台版本如下所示。

| **模拟器(Emulator)版本** | **支持的 webOS TV 版本** | **webOS TV 发布年份** |
| --- | --- | --- |
| 6.0.0 | webOS TV 6.x | 2021 |
| 5.0.0 | webOS TV 5.x | 2020 |
| 4.0.0 | webOS TV 4.x | 2018, 2019 |
| 3.0.0 | webOS TV 3.x | 2016, 2017 |
| 2.0.0 | webOS TV 2.x | 2015 |
| 1.2.0 | webOS TV 1.x | 2014 |

## 启动和退出模拟器(Emulator)

启动模拟器(Emulator)会激活虚拟机并启动主屏幕。随后，遥控器会被启动。

### 启动模拟器(Emulator)

- Windows：在**Start > webOS TV SDK**中选择快捷菜单，或点击桌面上的快捷方式图标。
- Mac OS：选择**Finder > Favorites > Applications > webOS_TV_SDK**，然后双击快捷方式图标。
- Linux：在**Dash home**中以关键字 "webOS" 搜索模拟器(Emulator)，然后点击快捷方式图标。

说明

我们建议你在 macOS 或 Linux 上安装模拟器(Emulator)后重启 PC。

### 退出模拟器(Emulator)

**Step 1:**在遥控器模拟器中按![Close icon](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653901447/webOS-TV/images/docs/tools/button-close_dkakjw.png)，或点击**MENU**并选择**Exit**。

**Step 2:**当出现确认弹出窗口时，点击**OK**。

## 熟悉模拟器(Emulator) UI

以下屏幕截图显示了在计算机上启动的 webOS TV 模拟器(Emulator)。

![Screenshot of the emulator](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274835/webOS-TV/images/docs/tools/emulator_and_mrcu_l5gxrr.png)

| **项** | **名称** | **说明** |
| --- | --- | --- |
| ① | 主窗口 | 显示模拟器(Emulator)的操作画面。它属于 VirtualBox 的一部分，分辨率与 LG Smart TV 屏幕相同（1920 x 1080 Full HD）。可以调整其大小或切换为全屏模式。 |
| ② | 遥控器模拟器 | 仿真遥控器。 |
| ③ | 模拟器(Emulator)菜单 | 提供主要功能。点击<br>**MENU**<br>，随后会出现子菜单：<br>[App Manager](Emulator开发者指南.md#using-app-manager)<br>、<br>[Take Screenshot](Emulator开发者指南.md#taking-screenshot)<br>、<br>**Help**<br>、<br>**About,**<br>以及<br>**Exit**<br>。 |

## 用户输入和预装应用

webOS TV 模拟器(Emulator)的用户输入与 webOS TV 类似，使用 HID 键盘、鼠标和遥控器模拟器。

**•**使用鼠标上下滚动页面并使用光标进行导航。

**•**使用 HID 键盘在应用中输入文本。

**•**遥控器模拟器支持以下按键。

- **Power, Home, Back, OK, Left, Right, Volume, Mute**

**•**在遥控器模拟器中按**Home**键可启动和退出 Home UI。

**•**在 macOS 上按**Command**键、在 Windows 上按**Windows**键、在 Linux 上按**Super**键可启动和退出 Home UI。

下图显示了 webOS TV Emulator v6.0.0 中包含预装应用的 Home UI。

![Screenshot of emulator Home UI](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274847/webOS-TV/images/docs/tools/emulator_home_ui_o7vaga.png)

- Welcome：显示欢迎消息的应用
- Enact Hello：基于 Enact 的 Web 应用，显示 "HELLO WORLD!" 消息
- Enact Sampler：Enact 及其库的全面导览

## 模拟器(Emulator)支持的 API

要了解各模拟器(Emulator)版本支持哪些 API，请前往[API](../../03-API参考/webos-service与Luna/LunaServiceAPI简介.md)并查看各章节。

## 模拟器(Emulator)的限制与差异

以下说明 webOS TV 模拟器(Emulator)与 webOS TV 相比有哪些限制。

- webOS TV 平台 UI 仅有限支持：仅支持启动/退出 Home UI。
- 不支持 TV 调谐器。
- 有限支持动感应遥控器。不支持加速度传感器。
- 支持的编解码器和容器列在[Streaming Protocol and DRM](../../04-平台规格/媒体格式/流媒体协议与DRM.md)中。
- 不支持 LG Apps。
- 在模拟器(Emulator)中，多音频可与多个 audio 元素一起工作。但在真实电视中，一个应用只能使用一个 audio 元素。详情请参见[Multi-sound Playback](../../02-开发指南/媒体播放/多声音播放.md)。
- 传统遥控器上媒体播放按键的键码在 webOS TV Emulator 6.0 中未正确映射。如果需要使用这些键码，请改用 webOS TV Emulator 5.0。正确的键码请参见[Media playback keys](https://webostv.developer.lge.com/develop/guides/magic-remote#media-playback-keys)。

说明

webOS TV 与模拟器(Emulator)之间可能存在性能差异。性能取决于你的计算机的 CPU 速度、显卡和显存。
