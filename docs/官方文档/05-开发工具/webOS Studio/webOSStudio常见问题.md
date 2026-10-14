# webOS Studio 常见问题
> 原文链接: https://webostv.developer.lge.com/develop/tools/webos-studio-faq ｜ 简体中文翻译

## 常规

**问：在该扩展中可以创建哪些不同类型的项目？**

支持的类型如下：

| 类型 | 说明 |
| --- | --- |
| Basic Web App | 创建一个示例 HTML "hello world" 应用，它带有标准的 webOS 文件系统。 |
| Hosted Web App | 创建一个示例 HTML 应用，其中包含在应用内显示某些外部页面的示例，并带有标准的 webOS 文件系统。 |
| Web App Info | 一个虚拟 Web 应用，其中仅包含 appinfo 文件，用于配合任何已开发好的 HTML 应用使用。 |
| JS Service | 一个带有服务文件的简单 JS 服务。 |
| JS Service Info | 一个虚拟的服务信息目录，用于参考标准的服务信息。 |
| Basic Enact App | 按照所选模板创建一个 Enact 示例应用。 |

**问：什么是 "Add webOS library"，什么时候需要它？**

该功能会将 webos-service 库添加到你的项目中。webos-service 库用于在应用/服务中调用 LS2 API。<br><br>

**问：当我的文件夹路径包含特殊字符时，打包应用会出错。**

工作区路径和名称不应包含任何转义字符或特殊字符。否则可能会在添加、打包、安装操作时触发错误。<br><br>

**问：如何解决通知区域（Notification Area）中的错误？**

以下是你可能看到的错误列表，以及它们的含义和可能的解决方式。

| 错误 | 说明 |
| --- | --- |
| **ERROR!**<br>Failed to get the device list. | 本地系统上缺少某些依赖包。要解决此问题，请手动安装这些包，或者<br>在收到提示时点击<br>**Yes**<br>（如果你此前未安装就关闭了提示，请点击<br>**KNOWN DEVICE**<br>视图中的刷新按钮以重新获得提示）。 |
| **ERROR!**<br>Failed to list the applications installed on (device) | 设备未运行。 |
| **ERROR!**<br>Failed to list the applications running on (device) | 设备未运行。 |
| **ERROR!**<br>Please check IP address or port of(device) | 设备无法访问。 |
| **ERROR!**<br>Unable to find the Virtual Box | 更新环境路径变量，使其指向 VirtualBox 的安装目录。 |
| **ERROR!**<br>Packaging App Failed. Details As follows:(errMsg) | 由于以下原因之一，应用打包失败：<br>• 检查 ID 格式。只允许小写字母（a-z）、数字（0-9）、减号和句点。<br>• 检查版本格式。它应当类似 1.0.0。<br>• 只有有效的应用才能被打包。请确保目录中包含 'appinfo.json'。<br>• 项目所需的某些依赖资源（例如图片、库和模块）缺失。请手动添加或通过 npm 命令添加。 |

## 包管理器

**问：我在 Windows PC 上尝试通过包管理器安装工具，但它一直显示 verifying 消息。**

这种情况会出现在某些 Windows PC 上。此时，请将 **wmic** 添加到系统 PATH 环境变量中。<br><br>

**问：通过包管理器安装 Emulator 失败，并出现了以下错误消息。如何解决该问题？**

![VirtualBox 安装错误](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1722245576/webOS-TV/images/docs/tools/webOS_Studio_FAQ_virtualbox_installation_error_rok5dg.webp)

这可能是由于某些环境设置问题导致的。此时，请手动安装 [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1) 后重试。<br><br>

## Emulator

**问：我还没有在 KNOWN DEVICE 视图中添加任何设备，但我却能看到名为 emulator 的设备。**

默认情况下，**KNOWN DEVICE** 视图中已经添加了一个 emulator。该 emulator 运行在本地系统上。如果你的 emulator 实例尚未设置，请转到 **EMULATOR MANAGER** 视图并添加该 emulator 实例。<br><br>

**问：我安装了 Emulator，但在 Emulator Manager 中看不到它，也无法启动它。**

如果你是 Windows 用户并且想要使用 Emulator，则应将 VirtualBox 的安装目录包含在系统 PATH 环境变量中。<br><br>

## 调试

**问："Run and Debug" 视图没有打开。如何打开它？**

点击 **View** > **Open View...** > **Run and Debug**。<br><br>

**问：调试会话没有启动。如何启动它？**

关闭 webOS 设备上所有正在运行的应用，然后重新点击 **Debug on**。<br><br>

**问：（极少发生）通知提示调试会话已激活。我该怎么办？**

如果你在所有调试会话都已关闭的情况下仍收到该通知，请重启 VS Code 并再次尝试启动调试会话。<br><br>

**问："Debug on VS Code" 在较旧的 webOS TV 平台上无法使用。我该如何调试？**

- Web 应用调试<br>对于 webOS TV 5.0 或更低版本，**Debug on VS Code** 无法使用。请在安装对应版本的 Chromium 后使用 **Web Inspector**。更多详情，请参见 [webOS CLI 开发者指南 - Launch Inspectors](../命令行工具/webOSCLI开发者指南.md#launch-inspectors)。
- JS 服务调试<br>对于 webOS TV 4.5 或更低版本，**Debug on VS Code** 无法使用。请在安装对应版本的 Chromium 后使用 **Node Inspector**。更多详情，请参见 [webOS CLI 开发者指南 - Launch Inspectors](../命令行工具/webOSCLI开发者指南.md#launch-inspectors)。

## 自动补全

**问：使用 *Tab* 键进行自动补全不起作用。该如何使用它？**

请检查 **Tab Completion** 设置是否已开启。![VS Code 的 Tab Completion 设置](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721988222/webOS-TV/images/docs/tools/webOS_Studio_FAQ_tab_completion_kluyts.webp)

**问：我输入了触发字符串，但没有出现建议。如何开启它们？**

要使用自动补全，项目根文件夹中必须存在 `.webosstudio.config` 文件。该文件包含 API 级别（API level）的相关信息。<br>

如果你使用 **Project Wizard** 生成项目，该文件会自动生成。如果你没有该文件，请按以下方式生成：

1. 输入 `luna://`。这会触发一个通知，询问是否生成配置文件。
2. 点击 **Yes**。![询问配置文件的提示](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721989233/webOS-TV/images/docs/tools/webOS_Studio_FAQ_notification_config_r9vmlu.webp)
3. VS Code 顶部会出现一个 Quick Pick 弹出框。输入 **0** 作为 API Level。对于 webOS TV，默认且唯一可用的 API level 为 0。![选择 API level](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721989233/webOS-TV/images/docs/tools/webOS_Studio_FAQ_api_level_ed38z1.webp)
4. 在生成的配置文件中检查 API level。![生成的配置文件](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1721989237/webOS-TV/images/docs/tools/webOS_Studio_FAQ_webos_studio_config_xisljl.webp)
