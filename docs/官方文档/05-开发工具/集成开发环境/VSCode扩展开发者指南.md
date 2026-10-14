# VS Code 扩展开发者指南
> 原文链接: https://webostv.developer.lge.com/develop/tools/vsce-dev-guide ｜ 简体中文翻译

注意：VS Code 扩展已停止支持

我们决定自 2024 年 3 月起不再支持 VS Code 扩展。我们建议您改用[webOS Studio](../webOS%20Studio/webOSStudio简介.md)。

本指南将说明如何在 VS Code 上配置 webOS TV 扩展，以及可用于应用开发的界面和命令。

## 配置

在开始使用 webOS TV 扩展之前，需要完成一些准备工作。

### 设置 webOS TV 扩展

在 VS Code 的 **File**>**Preferences**>**Settings**（*Ctrl*+*,*）中设置以下各项。您可以在 **Extensions**>**webOS TV** 类别中看到以下各项。

**webostv.chromeExecutable**

设置 Chrome 浏览器可执行文件的位置，以便使用 Web Inspector 调试 webOS TV 上的应用，示例如下。

```shell
"C:webOS_TV_SDKIDEchromiumchrome.exe"
```

**webostv.defaultDevice**

设置默认设备名称，以便在每次运行命令时跳过选择设备，示例如下。此设置为可选项。

```shell
"emulator"
```

**webostv.hostIP**

设置主机 IP 地址，以便在每次运行 **webOS TV: Run without Installation** 命令时跳过输入主机 IP 地址，示例如下。此设置为可选项。

```shell
"192.168.0.1"
```

### 连接目标设备

要在 webOS TV 设备上运行或调试应用，您应将设备连接到 PC。使用模拟器时无需此操作。

#### 步骤 1. 安装 Developer Mode 应用

首先，在电视上安装 Developer Mode 应用并打开开发者模式。有关安装 Developer Mode 应用和准备登录账户的更多信息，请参见[Developer Mode 应用](../../01-快速入门/开发者模式应用.md)。

**步骤 1-1：**从 [LG Apps](https://www.lgappstv.com) 在电视上安装 Developer Mode 应用。

**步骤 1-2：**从 webOS TV 启动器启动 Developer Mode 应用，并使用您的 LG 账户登录开发者模式。

**步骤 1-3：**单击 **Dev Mode Status** 按钮以打开开发者模式。

#### 步骤 2. 注册目标设备

在 VS Code 上注册您的目标设备信息。

**步骤 2-1：**从命令面板（*Ctrl*+*Shift*+*P*）中选择 **webOS TV: Set Up Device**，然后选择 **Add Device**。您也可以单击活动栏中 **webOS TV Devices** 上的 Add Device 图标 (+)。

**步骤 2-2：**输入设备名称。

**步骤 2-3：**输入设备的 IP 地址。

**步骤 2-4：**输入用于连接的设备端口号。在大多数情况下，按 **Enter** 将其设为默认值（**22**）。

**步骤 2-5：**输入用于连接的设备用户名。在大多数情况下，按 **Enter** 将其设为默认值（**root**）。

#### 步骤 3. 设置 SSH 密钥

**步骤 3-1：**在设备上打开开发者模式后，启动 Developer Mode 应用。

**步骤 3-2：**在 Developer Mode 应用中单击 **Key Server** 按钮。

**步骤 3-3：**在 VS Code 上从命令面板（*Ctrl*+*Shift*+*P*）中选择 **webOS TV: Set Up SSH Key**，然后选择您的设备。您也可以右键单击设备，并在活动栏中的 **webOS TV Devices** 上选择 **Set Up SSH Key**。

**步骤 3-4：**输入 Developer Mode 应用中显示的密码短语（区分大小写）。

## 应用开发

本节介绍如何使用 VS Code 上的 webOS TV 扩展开发应用。请在完成[配置](VSCode扩展开发者指南.md#configuration)后阅读本节。

### 创建 Web 应用

要在 VS Code 中创建 Web 应用，首先生成项目，然后编写代码。

从可用模板之一开始创建 Web 应用。这些模板为开发 Web 应用提供了起点。

**步骤 1：**从命令面板（*Ctrl*+*Shift*+*P*）中选择 **webOS TV: Generate Project**。

**步骤 2：**选择 **Basic Web App**。

**步骤 3：**使用命令面板右上角的文件系统按钮选择应用的位置。您可以按 Enter 在默认路径（当前工作区目录）中创建基本 Web 应用。

**步骤 4：**输入应用的工程名称。

**步骤 5：**输入应用属性 —— 应用 ID、应用版本和应用标题。您可以按 Enter 将它们设为默认值。

**步骤 6：**选择是否将创建的应用目录作为工作区打开。

下图是从 basic web app 模板创建的、位于 **MY_PROJECT** 文件夹下的 **my_web_app** 项目示例。由于在最后一步选择了 **No**，因此它没有将 **my_web_app** 项目作为工作区打开。

![Screenshot shown the generated project with a template on VS Code](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275077/webOS-TV/images/docs/tools/vscode-generate-project_u8srzy.png)

### 部署 Web 应用

在目标设备上部署 Web 应用之前，请务必将目标设备连接到 PC。有关连接的更多信息，请参见[连接目标设备](VSCode扩展开发者指南.md#connect-a-target-device)。

#### 打包 Web 应用

将上一节创建的项目打包为应用包（IPK）文件。

**步骤 1：**从命令面板（*Ctrl*+*Shift*+*P*）中选择 **webOS TV: Package Application**。

**步骤 2：**输入 Web 应用的目录。您可以按 Enter 将其设为默认路径（当前工作区目录）。要打包带 JS service 的 Web 应用，请单击右上角的 **Browser File System**，并使用 *ctrl* 键选择要一起打包的 Web 应用和 JS service 目录。

**步骤 3：**输入用于存放应用包文件的目录路径。您可以按 Enter 将其设为默认路径（当前工作区目录）。

**步骤 4：**选择是否对应用进行 minify。要使用 Web Inspector 调试，请选择 **No**。

如果应用打包成功，将生成如下所示的 IPK 文件。

![Screenshot shown the packaged app in the Explorer](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275125/webOS-TV/images/docs/tools/vscode-package-project_lyllsx.png)

您也可以使用资源管理器的上下文菜单打包项目。

#### 安装 Web 应用

将应用包文件安装到目标设备上。

**步骤 1：**在资源管理器中右键单击 IPK 文件。

**步骤 2：**选择要安装应用的设备。

如果应用成功安装到目标设备上，您可以在下方的 **webOS TV Devices** 视图中看到该应用。

![Screenshot shown the installed app on the webOS TV device view](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275101/webOS-TV/images/docs/tools/vscode-install-app_bnkdzp.png)

您也可以使用[命令面板](VSCode扩展开发者指南.md#command-palette)上的 **webOS TV: Install Application** 命令或设备上下文菜单来安装应用。

### 启动 Web 应用

启动已安装到目标设备上的应用。

**步骤 1：**在已安装应用列表中右键单击要启动的应用 ID。

**步骤 2：**选择 **Run**。

![Screenshot shown the 'Run' menu to launch the app](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275115/webOS-TV/images/docs/tools/vscode-launch-app_svtf2z.png)

您也可以使用[命令面板](VSCode扩展开发者指南.md#command-palette)上的 **webOS TV: Launch Application** 命令启动应用。

#### 带参数启动应用

您可以带启动参数启动已安装到目标设备上的应用。

**步骤 1：**从命令面板（*Ctrl*+*Shift*+*P*）中选择 **webOS TV: Launch Application with Parameters**。

**步骤 2：**选择要启动应用的设备。

**步骤 3：**选择要启动的应用 ID。

**步骤 4：**输入启动参数。如果您不输入参数而直接按 Enter，将默认填入工作区根目录中 *.launchparams.json* 文件的内容。如果您输入了参数，它们将被保存到 *.launchparams.json* 文件中。以下是当 *.launchparams.json* 文件内容为 {"key":"test 123"} 时参数输入窗口的示例。如果您不输入参数而按 Enter，将默认填入 {"key":"test 123"}。

![webOS TV VSCE 1.2.0 Launch with parameters_parameter input example](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653880608/webOS-TV/images/docs/tools/vscode-launch-with-parameters-input-example_hqcfxn.png)

#### 在模拟器上启动应用

您无需打包和安装应用即可在模拟器上运行它。

如果您尚未安装 webOS TV 模拟器，请前往[模拟器安装](../模拟器与仿真器/Simulator安装.md)并先安装模拟器。

![Screenshot showing the 'Run on Simulator' menu](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653886248/webOS-TV/images/docs/tools/vsce-run-on-simulator_wy9xfr.png)

**步骤 1：**在资源管理器中右键单击应用目录，然后选择 **Run on Simulator**。

**步骤 2：**选择要启动的 webOS TV 模拟器版本。

您也可以在[命令面板](VSCode扩展开发者指南.md#command-palette)上执行 **webOS TV: Run on Simulator** 命令。

注意

您可以使用[命令面板](VSCode扩展开发者指南.md#command-palette)上的 **webOS TV: Run on Simulator with Parameters** 命令，按照[带参数启动应用](VSCode扩展开发者指南.md#launch-the-app-with-parameters)中所述的相同方式，在模拟器上带参数启动应用。

### 调试 Web 应用

在调试应用之前，请务必在“设置”中设置 **webostv.chromeExecutable** 属性的值。有关该设置的更多信息，请参见[设置 webOS TV 扩展](VSCode扩展开发者指南.md#set-webos-tv-extension)。

#### 检查 Web 应用

运行 Web Inspector 并打开浏览器。Web Inspector 会显示应用的运行信息。

**步骤 1：**在已安装或正在运行的应用列表中右键单击要调试的应用 ID。

**步骤 2：**选择 **Debug**。

**步骤 3：**用于 Web Inspector 的 Chrome 浏览器将使用调试 URL 启动。

![Screenshot shown the 'Debug' menu to inspect the app](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275089/webOS-TV/images/docs/tools/vscode-inspect-app_womnrr.png)

您也可以使用[命令面板](VSCode扩展开发者指南.md#command-palette)上的 **webOS TV: Inspect Application** 命令启动应用。

#### 检查 JS service

在设备上运行 Node Inspector，并创建启动配置文件以在 VS Code 中运行 Node Inspector Client。要检查的 JS service 应与应用一起打包并安装到设备上。

**步骤 1：**从命令面板（*Ctrl+Shift+P*）中选择 **webOS TV: Inspect JS Service**。

**步骤 2：**选择设备。

**步骤 3：**输入要检查的 service ID。

**步骤 4：**对于 webOS TV 5.0 或更高版本，将在工作区中创建启动配置文件（*.vscode/launch.json*）。如果没有打开的工作区，请使用右上角的文件系统按钮选择启动配置文件的位置。要开始调试，请按 *F5*。对于 webOS TV 4.5 或更低版本，将使用调试 URL 启动用于 Node Inspector 的 Chrome 浏览器。以下是在 webOS TV 22 上调试 com.domain.app.service 的示例。

![Screenshot of inspecting a JS service using the 'Inspect JS service' menu](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653885753/webOS-TV/images/docs/tools/vsce-Inspect-js-service_s9qosl.png)

#### 无需安装直接运行应用

您可以在每次更改代码后，无需打包和安装即可在目标设备上运行应用。

![Screenshot shown the 'Run without Installation' menu](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275162/webOS-TV/images/docs/tools/vscode-run-app-without-installation_tvoajt.png)

**步骤 1：**在资源管理器中右键单击应用目录，然后选择 **webOS TV: Run without Installation**。

**步骤 2：**选择用于运行应用的目标设备。

**步骤 3：**输入主机 PC（您的本地 PC）的 IP 地址。

您也可以在[命令面板](VSCode扩展开发者指南.md#command-palette)上执行 **webOS TV: Run without Installation** 命令。

![Screenshot showing how to close an hosted app](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275138/webOS-TV/images/docs/tools/vscode-run-app-without-installation_command_palette.png_zolbar.png)

要关闭目标设备上托管的（hosted）应用，请按以下步骤操作。

**步骤 1：**在正在运行的应用列表中右键单击 com.sdk.ares.hostedapp。

**步骤 2：**选择 **Close**。

## 界面和命令

适用于 VS Code 的 webOS TV 扩展提供了 webOS TV CLI 的大部分功能，因此通过它的命令和菜单，您将获得与 webOS TV CLI 相同的结果。如果您想查看该扩展中可用的功能，请参见[支持的功能](VSCode扩展简介.md#supported-features)。

### 命令面板

要查看所有可用的 webOS TV 命令，请打开命令面板（*Ctrl*+*Shift*+*P*）并输入 **webOS TV**。

![The command palette of the Visual Studio Code](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275271/webOS-TV/images/docs/tools/webostv_vsc_command_palette_lzfcw0.png)

#### 开发应用

要开发应用，请使用以下命令。

- **webOS TV: Generate Project**：从模板创建 Web 应用。
- **webOS TV: Preview Application**：运行 Web 服务器，以便在本地 PC 上测试应用文件。
- **webOS TV: Package Application**：将应用文件打包为存放在指定目录中的包文件（.ipk）。

#### 连接设备

要将目标设备与 PC 连接以测试应用（模拟器除外），请使用以下命令。

- **webOS TV: Set Up Device**：在设备列表中添加、修改或移除设备。
- **webOS TV: Set Up SSH Key**：从 webOS TV 设备获取私钥。获取私钥后，您就可以在 webOS TV 上安装和启动应用，或运行其他命令。

#### 在设备上测试应用

要在目标设备上测试应用，请使用以下命令。

- **webOS TV: Install Application**：使用选定的应用包文件（.IPK）将应用安装到目标设备上。
- **webOS TV: Launch Application**：运行已安装到设备上的应用。
- **webOS TV: Inspect Application**：运行 Web Inspector 并打开浏览器。Web Inspector 会显示应用的运行信息。
- **webOS TV: Inspect JS Service**：在目标设备上运行 Node Inspector，并创建启动配置文件以在 VS Code 中运行 Node Inspector Client。您应通过 CLI 将 JS service 与应用一起打包，并将其安装到目标设备上。
- **webOS TV: Run without Installation**：在每次更改代码后，无需打包和安装即可在设备上运行 Web 应用。

#### 批量命令

要一次执行多个命令，请使用以下命令。

- **webOS TV: Run Application**：依次打包、安装并启动应用。
- **webOS TV: Debug Application**：依次打包、安装并检查应用。

### 资源管理器

在资源管理器中，您可以浏览、打开和管理 webOS TV 项目中的所有文件和文件夹。

#### 资源管理器上下文菜单

当您在资源管理器中右键单击应用的 IPK 文件时，可以安装、运行和调试应用。

![The Explorer context menu by clicking the IPK file of the Visual Studio Code](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275319/webOS-TV/images/docs/tools/webostv_vsc_explorer_context_menu_hfbw0t.png)

- **webOS TV: Install Application**：安装选定的应用。
- **webOS TV: Run Application**：安装并启动选定的应用。
- **webOS TV: Debug Application**：在目标设备上安装并检查选定的应用。

当您在资源管理器中右键单击应用文件所在目录时，还可以打包、预览应用，或无需安装直接运行应用。

![The Explorer context menu by clicking the directory of the Visual Studio Code](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275307/webOS-TV/images/docs/tools/webostv_vsc_explorer_context_menu_directory_byt2up.png)

- **webOS TV: Package Application**：将选定的应用目录打包为存放在指定目录中的包文件（.ipk）。
- **webOS TV: Preview Application**：运行 Web 服务器以测试选定的应用目录。
- **webOS TV: Run without Installation**：在每次更改代码后，无需打包和安装即可在设备上运行选定的应用目录。

### 编辑器

您可以在编辑器中右键单击直接运行某些命令，而无需打开命令面板。

#### 编辑器上下文菜单

![The editor context menu of the Visual Studio Code](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274823/webOS-TV/images/docs/tools/Editor_context_menu_full_bqub9b.png)

- webOS TV: Generate Project
- webOS TV: Package Application
- webOS TV: Run Application
- webOS TV: Debug Application

### 活动栏

您可以在活动栏的 webOS TV devices 中运行一些与目标设备和应用相关的命令。要激活该扩展，请先单击 Refresh 图标。

#### 设备内联菜单

![The device inline menu of the Visual Studio Code](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275295/webOS-TV/images/docs/tools/webostv_vsc_device_inline_menu_rx6xtn.png)

- **Refresh**：刷新设备列表。
- **Add Device**：向列表中添加设备。
- **Modify Device**：修改选定的设备。
- **Remove Device**：移除选定的设备。

#### 设备上下文菜单

![The device context menu of the Visual Studio Code](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275283/webOS-TV/images/docs/tools/webostv_vsc_device_context_menu_mxpw6s.png)

**•****Refresh**：刷新所选设备的已安装应用列表和正在运行的应用列表。

**•****Install Application**：将应用安装到所选设备上。

**•****Set Up SSH Key**：从所选设备获取私钥。

**•****Extend DevMode Session**：延长所选设备的开发者模式会话时间。请注意，该命令仅在满足以下条件时才有效。

- 开发者模式已打开。
- 会话剩余时间大于 0 分钟。

**•****Show Information**：获取所选设备的以下系统信息。请注意，如果某些系统信息因电视型号不同而无法获取，则只显示已获取的信息。

- 型号名称
- SDK 版本
- 固件版本
- 主板类型
- OTA（空中下载）ID

#### 应用上下文菜单

![The application context menu of the Visual Studio Code](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275258/webOS-TV/images/docs/tools/webostv_vsc_application_context_menu_she66t.png)

请注意，只有在设备已连接时，您才能刷新已安装应用列表和正在运行的应用列表。

- **Run**：在设备上运行选定的应用。它与命令面板中的 **webOS TV: Launch Application** 命令相同。
- **Debug**：运行 Web Inspector 并打开浏览器。Web Inspector 会显示应用的运行信息。它与命令面板中的 **webOS TV: Inspect Application** 命令相同。
- **Uninstall**：从设备上卸载选定的应用。该命令仅对已安装的应用有效。
- **Close**：在设备上关闭选定的应用。该命令仅对正在运行的应用有效。
