# 面向 webOS 的 Flutter
> 原文链接: https://webostv.developer.lge.com/develop/guides/flutter-for-webos ｜ 简体中文翻译

Flutter-webOS 是 Flutter SDK 的一个扩展，它让开发者能够使用 Flutter 框架为 webOS 开发应用。它提供了构建、打包以及在基于 webOS 的设备上运行 Flutter 应用所需的全部必要工具和库。本文档将指导你如何设置环境，以便使用 flutter-webOS 工具链在 webOS TV 上创建、构建并运行 Flutter 应用。

## 系统要求

### 宿主环境

Flutter for webOS 开发**仅支持 Linux（Ubuntu）**。

| Ubuntu 版本 | 代号（Codename） |
| --- | --- |
| 22.04.3 LTS | Jammy Jellyfish |
| 24.04 LTS | Noble Numbat |
| 26.04 LTS | Resolute Raccoon |

重要（Important）

仅官方支持 Ubuntu 环境。如果你使用的是 macOS 或 Windows，请使用 WSL2（适用于 Linux 的 Windows 子系统）或基于 Docker 的 DevContainer 来搭建兼容的 Ubuntu 环境。

### 目标设备

Flutter for webOS 支持**从 webOS 26 Re:New 起**的 webOS TV。

在部署应用之前，必须在电视上启用开发者模式。更多信息，请参阅[开发者模式应用](../../01-快速入门/开发者模式应用.md)。

## 设置环境

本节介绍开发机器所需的初始设置。设置环境包括三个阶段：安装系统级依赖项、安装 flutter-webOS SDK 和 NDK，以及验证安装。

### 1. 设置 Linux 环境

在 Ubuntu 上安装所需的系统软件包，并配置 Git（版本 2.23 或更高）。

### 2. 安装 flutter-webOS SDK

克隆 flutter-webOS 仓库，并将 CLI 添加到 PATH 中。然后安装 webOS NDK（原生开发工具包，Native Development Kit）并配置所需的环境变量。

### 3. 验证安装

运行 **`flutter-webos doctor -v`** 以确认所有组件均已正确配置，然后使用 **`flutter-webos precache`** 预缓存引擎构件。

有关详细说明，请参阅[设置环境指南](https://github.com/lg-flutter-webos/flutter-webos/blob/main/doc/getting-started.md#set-up-the-environment)。

## 设置设备

本节介绍如何将你的 webOS TV 连接为开发目标设备。一旦你的 SDK 就绪，你需要先在电视上启用开发者模式并注册该设备，以便 flutter-webOS 能够通过网络部署应用并与设备通信。

### 1. 在电视上启用开发者模式

在你的 webOS TV 上启用开发者模式，开启 Key Server，并记下你的密码短语（passphrase）。

### 2. 添加设备

通过输入电视的 ID、IP 地址和端口，将你的电视注册为自定义设备。然后使用你的密码短语从电视上获取 SSH 密钥。

### 3. 验证连接

使用 **`flutter-webos devices`** 确认设备已出现并且可以访问。

有关详细说明，请参阅[设置设备指南](https://github.com/lg-flutter-webos/flutter-webos/blob/main/doc/getting-started.md#device-setup)。

## 开发应用

环境就绪后，开发工作流程包括创建项目、构建可安装的 **`.ipk`** 软件包，以及将其运行在你的电视上。

### 1. 创建项目

使用 **`flutter-webos create`** 创建一个支持 webOS 平台的新的 Flutter 项目。

### 2. 构建与打包

在你的项目目录中构建一个可安装的 **`.ipk`** 软件包。flutter-webOS 支持三种构建模式：**`--debug`**、**`--profile`** 和 **`--release`**。

### 3. 安装并运行应用

使用 **`flutter-webos run`** 将应用部署到你已注册的设备上。

### 4. 调试

使用 **`--debug`** 标志以调试模式运行应用。

有关详细说明，请参阅[开发应用指南](https://github.com/lg-flutter-webos/flutter-webos/blob/main/doc/getting-started.md#develop-an-app)。

## webOS TV 集成

### Luna Service（Luna 服务）

webOS TV 使用 **Luna Service** 作为其 IPC（进程间通信，Inter-Process Communication）机制。Luna Service 允许应用与系统服务进行交互，例如网络、媒体、设置和输入。通过使用 **webos_service_bridge** 插件，你可以从 Flutter 应用中调用 Luna Service API。

### ACG（访问控制组，Access Control Group）

webOS TV 通过 ACG 对所有 Luna Service API 调用强制实施访问控制。每个 Luna Service 方法都归属于一个或多个 ACG 组，你的应用必须声明所需的组才能获得访问权限。如果 ACG 设置不正确，无论实现如何，Luna Service 调用都会在运行时被拒绝。

有关详细说明，请参阅[ACG 指南](https://github.com/lg-flutter-webos/flutter-webos/blob/main/doc/getting-started.md#acg-access-control-group)。

### 插件（Plugins）

flutter-webOS 提供了一组 webOS 专属插件，可让您的 Flutter 应用访问 webOS TV 的原生能力。这些插件充当 Flutter 与 webOS 平台之间的桥梁，能够启用标准 Flutter SDK 所不具备的功能。

有关详细说明，请参阅[插件指南](https://github.com/lg-flutter-webos/plugins)。
