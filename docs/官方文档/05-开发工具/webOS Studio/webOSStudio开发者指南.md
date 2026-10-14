# webOS Studio 开发者指南
> 原文链接: https://webostv.developer.lge.com/develop/tools/webos-studio-dev-guide ｜ 简体中文翻译

本指南将说明如何在 VS Code 上设置并使用 webOS Studio 扩展。

## 设置

要使用 webOS Studio，必须先完成以下设置。

### 选择工作区

工作区是所有 webOS 应用和服务的根目录。webOS Studio 的所有命令都将基于该工作区执行。

转到 **文件 > 打开文件夹**，然后选择一个目录。该目录将成为你的新工作区。

![选择工作区文件夹](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1710123740/webOS-TV/images/docs/tools/selecting-the-workspace-folder_sol4zb.png)

注意

webOS Studio 的工作区与 VS Code 的工作区不同，并且 webOS Studio 同一时间只能有一个工作区，这意味着它不支持 VS Code 的多根工作区（multi-root workspaces）功能。

### 安装全局包

全局包是运行 webOS Studio 所必需的包。webOS TV 扩展支持通过一条命令一次性安装这些包，并且只需在最初运行一次。

1. 打开命令面板（*Ctrl + Shift + P*）。
2. 执行 **webOS: Install Global Packages**。![webOS Studio 开发者指南 - 图片 webOS-TV/images/docs/tools/ins (slot_3)-822223](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1710123739/webOS-TV/images/docs/tools/install-global-packages_nvvf08.png)

也可以使用以下命令完成同样的工作：

```shell
npm install -g @enact/cli @webos-tools/cli patch-package
```

### 设置设备配置文件

webOS Studio 支持多个 webOS 平台。因此，在开始使用该扩展之前，需要将设备配置文件设置为 tv。

注意

默认情况下，设备配置文件已设置为 **webOS TV**。

1. 转到命令面板（*Ctrl + Shift + P*）。
2. 执行 **webOS: Set Device Profile**。
3. 选择 **tv**。

你可以在左下角查看当前的设备配置文件。它应被设置为 **webOS TV**。

![设备配置文件为 webOS TV](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1708500483/webOS-TV/images/docs/guides/webos-studio-device-profile-tv_ftha5j.png)

### 配置包管理器

选择一个用于安装 SDK 工具的文件夹。当用户首次运行包管理器时，会弹出用于选择文件夹的提示消息。通过包管理器安装的所有工具都将安装到该目录中。

![配置包管理器](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1710402198/webOS-TV/images/docs/tools/configure-a-package-manager-directory_ckkvgb.png)

更多详情，请参见[包管理器](#package-manager)。

## 准备并连接设备

### 安装 Developer Mode 应用

首先，在电视上安装 Developer Mode 应用并开启开发者模式。有关安装 Developer Mode 应用的更多信息，请参见 [Developer Mode App](../../01-快速入门/开发者模式应用.md)。

1. 从 [LG Apps](https://www.lgappstv.com) 在电视上安装 Developer Mode 应用。
2. 从 webOS TV 启动器启动 Developer Mode 应用，并使用你的 LG 账户登录开发者模式。
3. 点击 **Dev Mode Status** 按钮以开启开发者模式。

### 注册目标设备

在 webOS Studio 上注册你的目标设备信息。

1. 在 **KNOWN DEVICE** 视图中点击 **+** 按钮。或者打开命令面板（*Ctrl+Shift+P*），选择 **webOS: Set Up Device**，然后选择 **Add Device**。![在 webOS Studio 上添加已知设备](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1709789349/webOS-TV/images/docs/tools/adding-known-device_l5atzf.png)
2. 输入用于连接的设备名称、IP 地址、端口号和用户名。
  - 设备名称不应以 "%" 或 "$" 开头。
  - 如果使用的是电视设备，端口号请输入 **9922**，用户名请输入 **prisoner**。（这些是 **tv** 的默认值。）
3. 在电视设备的 Developer Mode 应用界面中，点击 **Key Server** 按钮。![Developer Mode 应用上的 Key Server 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1649914918/webOS-TV/images/docs/guides/Key_Server_On_ql4tls.png)
4. 在 webOS Studio 中打开命令面板（*Ctrl+Shift+P*），从命令面板（*Ctrl+Shift+P*）中选择 **webOS TV: Set Up SSH Key**。
5. 选择你的设备，并输入 Developer Mode 应用中显示的密码短语（区分大小写）。

你可以重复上述步骤添加更多设备。若要将多个已注册设备中的某一台设为默认设备，请右键点击该设备并选择 **Set Default Device**。除非指定了目标设备，否则所有操作都将在该默认设备上执行。

## 基本用法

本节介绍使用该扩展进行 webOS 应用和服务开发的典型流程。

### 创建应用或服务

1. 在 **APPS IN WORKSPACE** 视图中点击 **+** 按钮。![在 webOS Studio 上创建应用或服务](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721971429/webOS-TV/images/docs/tools/webOS_Studio_v2.1_creating_app_qlfzpk.png) 或者在命令面板中执行 **webOS: Create ProjectWizard**。**Project Wizard** 窗口将显示在右侧。![webOS Studio 的 Project Wizard 窗口](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1711959322/webOS-TV/images/docs/tools/project-wizard_b1ovqc.jpg)
2. 第 2 步：在 **Project Wizard** 窗口中，在 webOS Product 处选择 **TV**，在 API Version 处选择 **Default**，然后点击 **Generate Project**。
3. 选择要使用的模板并点击 **Next**。以下是所提供的模板列表 TemplateDescriptionWeb AppBasic Web App用于 webOS 的基础 Web 应用Web AppHosted Web App托管 Web 应用Web AppWeb App InfoWeb 应用的配置文件（appinfo.json）。参见 [appinfo.json](../../03-API参考/配置文件/appinfo.json应用元数据.md)。JS ServiceJS Service用于 webOS 的 JavaScript 服务。该服务必须与应用一起打包并安装。JS ServiceJS Service InfoJS 服务的配置文件（services.json 和 package.json）。参见 [services.json](../../03-API参考/配置文件/services.json服务配置.md)。Enact AppSandstone使用 Sandstone 库的 Enact 应用。更多信息请访问 [Enact 网站](https://enactjs.com)。Enact AppMoonstone使用 Moonstone 库的 Enact 应用。更多信息请访问 [Enact 网站](https://enactjs.com)。 对于 JS 服务和 Enact 应用，你可以添加 [webos-service 库](../../03-API参考/webos-service与Luna/webos-serviceAPI参考.md) 以使用 webOS 组件。要在你的服务或应用中使用该库，请在 **Add webOS library** 选项处勾选 **Yes**。或者你也可以稍后在 **APPS IN WORKSPACE** 视图中右键点击该应用或服务，然后选择 **Install webOS NPM Library**。
4. 输入项目信息，例如 Project Location、Project Name 以及 App 或 Service ID，然后点击 **Finish**。所需的信息项会因所选模板而异。

### 导入应用或服务

1. 在 **APPS IN WORKSPACE** 视图中点击 **↓** 按钮。![在 webOS Studio 上导入应用或服务](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721972008/webOS-TV/images/docs/tools/webOS_Studio_v2.1_importing_app_sjbbn3.png)
2. 选择要导入的应用或服务所在的文件夹。该应用或服务将被添加到列表中。

### 编辑源代码

在已创建的应用或服务上实现你自己的功能。

#### 使用自动补全编写代码

webOS Studio 提供了一项强大的内容辅助功能，称为自动补全（Auto-Completion）。自动补全包含 API 建议，并能自动补全方法名，帮助用户更轻松地实现 webOS 功能。

有关自动补全功能的更多详情，请参见[自动补全](#auto-completion)。

![使用自动补全编写代码](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721972306/webOS-TV/images/docs/tools/webOS_Studio_v2.1_auto_complete_luna_kfnmmm.png)

#### 使用自动重载预览

在编辑应用时，你可以在安装之前预览应用的 UI。

要预览应用，请在 **APPS IN WORKSPACE** 视图中右键点击该应用并选择 **Preview App**。应用的预览将自动在右侧启动。

![在 webOS Studio 上预览应用](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721973354/webOS-TV/images/docs/tools/webOS_Studio_v2.1_previewing_app_i0scq5.png)

你可以在该预览中即时查看源代码修改的结果。

### 打包、安装并启动应用

安装 webOS 应用的典型流程分为三步：

1. 将源代码打包为 **.ipk** 文件。
2. 安装该 IPK 文件。
3. 启动已安装的应用。

你可以通过点击 **APPS IN WORKSPACE** 视图中的 **Run App** 按钮来依次触发这些步骤。点击该按钮后，输入要运行的应用的相关信息。如果使用默认信息，直接按 Enter 键即可。

![在 webOS Studio 上运行应用](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1709795318/webOS-TV/images/docs/tools/run-app_yfldlb.jpg)

你也可以通过其他几种方式分别执行应用的打包、安装和启动。

- 在 **APPS IN WORKSPACE** 视图中右键点击该应用，然后选择你想要的操作。![在 APPS IN WORKSPACE 视图中打包应用 ](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721982370/webOS-TV/images/docs/tools/webOS_Studio_v2.1_package_app_apps_in_workspace_dve2rc.png)
- 打开命令面板（*Ctrl+Shift+P*）并输入你想要的操作。![在命令面板中打包应用](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721982371/webOS-TV/images/docs/tools/webOS_Studio_v2.1_package_app_command_palette_kqxhas.png)
- 在 VS Code 的 **Explorer** 中右键点击应用文件夹，然后选择你想要的操作。![在 VS Code Explorer 视图中打包应用](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721982372/webOS-TV/images/docs/tools/webOS_Studio_v2.1_package_app_explorer_view_rtwryp.png)

注意

JavaScript 服务始终与应用一起打包。如果要安装 JavaScript 服务，请在 **Service directory to pack with App** 步骤中选择该服务。

#### 带参数启动应用

你可以在目标设备上使用启动参数运行应用。要带启动参数运行应用，请打开命令面板（*Ctrl+Shift+P*）并选择 **webOS: Launch Application with Parameters**。有关带参数启动的更多内容，请参见 [ares-launch](../命令行工具/webOSCLI开发者指南.md#ares-launch)。

#### 在模拟器上运行应用

你可以在不打包和安装的情况下在模拟器上运行应用。要在模拟器上运行应用，可以：

- 在 **APPS IN WORKSPACE** 视图中右键点击要运行的应用，然后选择 **webOS TV: Run on Simulator**；
- 在 **Simulator Manager** 视图中右键点击要使用的模拟器，然后选择 **Run App**；或者
- 从命令面板（*Ctrl+Shift+P*）中选择 **webOS TV: Run on Simulator**。![图片说明](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1712539200/webOS-TV/images/docs/tools/run-on-simulator_jtorai.jpg)

你也可以从命令面板（*Ctrl+Shift+P*）中选择 **webOS TV: Run on Simulator with Parameters**，从而在模拟器上带启动参数运行应用。

如果你尚未安装 webOS TV 模拟器，请先使用[包管理器](#package-manager)安装模拟器。

### 卸载应用

你可以在 **KNOWN DEVICE** 视图中卸载应用。

要从某台设备卸载应用，请在设备已安装（**Installed**）应用列表中右键点击该应用，然后选择 **Uninstall**。

### 调试应用

你可以调试已安装在已知设备上的应用或服务。

支持的类型如下：

- Web 应用
- Enact 应用
- JavaScript 服务

注意

根据 webOS TV 平台版本的不同，你可能无法使用下文所述的调试会话。在这种情况下，你仍然可以使用 Inspectors 进行调试。更多详情请参见[关于调试的常见问题](webOSStudio常见问题.md#debug-does-not-work)。

#### 前提条件

- 目标设备或模拟器应作为默认设备（Default Device）运行。
- （使用 Chrome Inspector 调试时）已安装基于 Chromium 的浏览器。更多详情请参见[启动 Web Inspector](../命令行工具/webOSCLI开发者指南.md#launch-inspectors)。

#### 启动调试会话 - 应用

1. 在 **APPS IN WORKSPACE** 视图中右键点击某个应用，然后选择 **Debug on**。![在 webOS Studio 上调试应用](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1712539204/webOS-TV/images/docs/tools/debug-on_z66jch.jpg)
2. 选择 **Chrome Inspector** 或 **VS Code Debugger**。

- **Chrome Inspector**<br>输入浏览器可执行文件的路径 ![输入浏览器可执行文件的路径](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1709865764/webOS-TV/images/docs/tools/enter-browser-executable-path_kyyufv.png) 随后调试会话将在浏览器中启动。![浏览器中的调试会话](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1709879687/webOS-TV/images/docs/tools/debugging-app-with-browser_pvp711.png)
- **VS Code Debugger**<br>**DEBUG CONSOLE** 面板将自动激活。在该面板中，你可以查看来自应用或服务的控制台消息。![VS Code 上的调试控制台](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1709879982/webOS-TV/images/docs/tools/debugging_session_x0a5j3.png)

在调试会话中，你可以设置断点、查看变量、调用栈等。

#### 启动调试会话 - 服务

1. 在 **APPS IN WORKSPACE** 视图中右键点击某个已安装的服务，然后选择 **Debug on**。
2. 选择 **Chrome Inspector** 或 **VS Code Debugger**。

- **Chrome Inspector**
  - 调试会话的 URL 将显示在 OUTPUT 面板中。复制该 URL。![图片说明](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1709880455/webOS-TV/images/docs/tools/url-for-debugging-service_ev1fh0.png)
  - 打开浏览器并访问 `**chrome://inspect**`。按如下方式配置该 URL：![图片 webOS-TV/images/docs/tools/con (slot_27)-822223](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1709880454/webOS-TV/images/docs/tools/configure-debugging-url_bku3ze.png) 注意Microsoft Edge 浏览器会自动将 **`chrome://inspect**` 重定向到 **`edge://inspect`**。
  - 点击 inspect![inspect](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1709880439/webOS-TV/images/docs/tools/click-the-inspect-button_hhwedy.png)
  - 这将为调试会话打开一个新窗口。![tes2image](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1709880439/webOS-TV/images/docs/tools/debugging-service-with-browser_jrvb1x.png)
  - **VS Code Debugger**<br>**DEBUG CONSOLE** 面板将自动激活。![test3image](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1709880438/webOS-TV/images/docs/tools/debugging-service-with-ide_sdexap.png) 注意每次重新启动调试会话时，目标设备上已打包的应用都会被关闭。如果你想查看应用的行为，请手动重新启动该应用。

### 在 Enact 应用上运行 ESLint

ESLint 会对文件进行静态分析以发现潜在错误（或警告），并帮助统一编码风格。更多信息请查看 [ESLint Configurations](https://enactjs.com/docs/developer-tools/eslint-config-enact/)。

要运行 ESLint，请在 **APPS IN WORKSPACE** 视图中右键点击 React 应用并选择 **Run Lint**。

**PROBLEMS** 面板将显示结果消息。

![ESLint 结果消息](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1709882849/webOS-TV/images/docs/tools/running-eslint_j7nbwj.jpg)

要清除面板中的 Lint 消息，请在 **APPS IN WORKSPACE** 视图中右键点击 React 应用并选择 **Clear Lint**。

## 实用功能

### 自动补全

自动补全可帮助你使用 LS2 API。它会提示服务，并引导你完成方法和参数的填写。

具体而言，它会执行以下操作：

- 使用 Tab 键自动补全 API 字符串
- 提供可用 LS2 API 的列表（服务、方法和参数）
- 提供每个 LS2 API 的说明
- 提供指向 API 文档网页的链接

你可以通过输入触发字符串之一来触发建议，即 **`luna://`** 或 **`new LS2Request**`。

- 输入 `**luna://**` ItemTrigger stringService**`luna://`**Method在**`luna://<service name>`**之后输入 '/'Parameter在**`luna://<service>/<method>`**之后按 *Ctrl + Space* ![图片说明](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1721972306/webOS-TV/images/docs/tools/webOS_Studio_v2.1_auto_complete_luna_kfnmmm.png) ![图片说明](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1721972307/webOS-TV/images/docs/tools/webOS_Studio_v2.1_auto_complete_luna_method_qrssin.png)
- 输入 **`new LS2Request`**<br>这是为了使用 [Enact webos LibraryES](https://enactjs.com/docs/modules/webos/LS2Request/)。<br>输入 **`new LS2Request**`，然后按 *Ctrl*+*Space* 触发建议。使用 *Tab* 跳到下一项。![使用 new LS2Request 的自动补全](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721972305/webOS-TV/images/docs/tools/webOS_Studio_v2.1_auto_complete_ls2request_w2onbc.png)

### 包管理器

重要

要在 Windows 上启动包管理器，必须以管理员权限打开 VS Code。在 Mac 和 Ubuntu 上，安装组件时系统会提示你输入 root 用户密码。

包管理器可帮助你便捷地管理用于 webOS 应用开发的 SDK。只需简单点击即可安装和卸载 SDK。

![webOS Studio 的包管理器](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721986619/webOS-TV/images/docs/tools/webOS_Studio_v2.1_package_manager_oeiyjy.png)

每次启动 webOS Studio 扩展（或 VS Code）时，包管理器都会自动更新包列表。它会检查是否存在更新版本的 SDK，若存在，列表将自动更新。

- 当用户首次运行包管理器时，会弹出用于选择目录的提示消息。一旦设置好目录，所有 SDK 都将安装到该目录中。![配置包管理器](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1710402198/webOS-TV/images/docs/tools/configure-a-package-manager-directory_ckkvgb.png)
- 部分 SDK 需要前置软件，因此包管理器会检查该软件是否已安装。如果未安装，它将下载、解压并安装该软件。下表列出了每个 SDK 的软件前置要求。 SDKPrerequisitewebOS TV EmulatorPython: 3.6 或更高版本VirtualBox: 6.1Emulator Launcher: 0.9.4 或更高版本

### 模拟器管理器

你可以在 **SIMULATOR MANAGER** 视图中找到已安装模拟器的列表。

右键点击要使用的模拟器并选择 **Run App** 来运行你的应用。

![模拟器管理器](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721982853/webOS-TV/images/docs/tools/webOS_Studio_v2.1_simulator_manager_xllfya.png)

### 模拟器（Emulator）管理器

你可以在 **EMULATOR MANAGER** 视图中找到已安装 Emulator 的列表。

点击 Emulator 右侧的 Launch 按钮即可启动。

![Emulator 管理器](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1710403930/webOS-TV/images/docs/tools/emulator-manager_nvbnno.jpg)

注意

- 从 webOS TV 22 起，将不再提供 Emulator。我们建议你改用 [webOS TV 模拟器](../模拟器与仿真器/Simulator简介.md)。
- 如果你使用的是 webOS Studio v2.0.2 或更低版本，则需要安装 Emulator Launcher（一个基于命令行的工具，可帮助用户设置 webOS Emulator）才能使用 Emulator Manager。要安装 Emulator Launcher，可以：
  - 打开命令面板（*Ctrl*+*Shift*+*P*）并输入 **webOS: Install Emulator Launcher**，或者
  - 执行以下命令。（如果你使用的是 Windows，请用 **python** 代替 **python3**。） **python3 -m pip install --upgrade webos-emulator --force-reinstall**

### IPK 分析器

你可以分析 IPK 文件中应用或服务的文件大小。

1. 打开命令面板（*Ctrl*+*Shift*+*P*）并输入 **webOS: IPK Analyzer**。
2. 选择要分析的 IPK 文件。文件加载完成后，你将看到以下界面：![IPK 分析器](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721972741/webOS-TV/images/docs/tools/webOS_Studio_v2.1_ipk_analyzer_teiwhl.png)
3. 点击右侧区域的 **Browse** 按钮以加载另一个 IPK——例如它的旧版本。![比较 ipk 文件](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721972742/webOS-TV/images/docs/tools/webOS_Studio_v2.1_ipk_analyzer_compare_yogwcc.png)

### 进程日志

webOS Studio 有许多内部实用命令，包括 ares-cli、enact-cli 和 VirtualBox 实用程序。在 **OUTPUT** 面板中，你可以查看这些命令的输出日志，并找到有助于调试应用或服务的信息。

![OUTPUT 面板中的进程日志](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1710139409/webOS-TV/images/docs/tools/process-log-output-panel_dem6be.png)
