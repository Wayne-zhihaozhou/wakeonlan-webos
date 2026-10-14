# webOS TV CLI 开发者指南
> 原文链接: https://webostv.developer.lge.com/develop/tools/webos-tv-cli-dev-guide ｜ 简体中文翻译

# CLI 开发者指南

注意：webOS TV CLI 已弃用

我们决定自 2024 年 3 月起不再支持 webOS TV CLI。建议您改用

[webOS CLI](webOSCLI简介.md)

。

本指南将带您了解使用 CLI 进行 webOS TV 应用开发的完整流程，从创建到调试。该流程包括应用的创建、打包、安装、启动和调试；如果您使用 webOS TV Simulator，则无需进行打包和安装。

提示

在每一步中，系统都会引导您输入应用或设备信息。输入这些信息后，下述命令语法将为您定制显示。此项为可选操作，但我们建议您提供这些信息。与使用默认值相比，它能让您更好地理解命令语法。

## 创建 Web 应用

输入你的应用信息。

第一步是使用 [ares-generate](webOSTVCLI开发者指南.md#ares-generate) 命令从模板创建一个 Web 应用。共有两种可用的 Web 应用模板。

- 基础 Web 应用模板：一种[基础 Web 应用](../../01-快速入门/Web应用类型.md#basic-web-app)模板，会在屏幕上显示 "Hello World" 消息
- 托管 Web 应用模板：一种[托管 Web 应用](../../01-快速入门/Web应用类型.md#hosted-web-app)模板

webOS TV CLI 还提供用于 JS 服务、配置文件等的模板。有关所有可用模板的列表，请参阅[应用模板](../../01-快速入门/应用模板.md)，或使用以下命令。

```shell
ares-generate --list
```

#### 创建基础 Web 应用

`basic` 模板提供一个仅包含最基本文件的 "Hello World" Web 应用。如果你打算使用其他 UI 框架，该模板会很有用。

执行以下命令，在 `./sampleApp` 目录中创建一个基础 Web 应用。

```shell
ares-generate -t basic ./sampleApp
```

下表列出了该模板所提供的 Web 应用文件：

| 目录 / 文件 | 描述 |
| --- | --- |
| webOSTVjs-x.x.x | webOS TV 库目录。用于调用<br>[LS API](../../03-API参考/webos-service与Luna/LunaServiceAPI简介.md)<br>的 webOS TV 专用库。有关 webOS TV 库的详细说明，请参阅<br>[webOSTV.js](../../03-API参考/webOSTV.js库/webOSTV.js库简介.md)<br>。 |
| appinfo.json | Web 应用配置文件。<br>*appinfo.json*<br>文件包含 Web 应用的元数据。打包 Web 应用时该文件必须存在。有关<br>*appinfo.json*<br>文件的详细说明，请参阅<br>[appinfo.json](../../03-API参考/配置文件/appinfo.json应用元数据.md)<br>。 |
| icon.png | 图标图像文件。有关<br>*icon.png*<br>文件的详细说明，请参阅<br>[应用资源](../../01-快速入门/应用资源.md#app-icons)<br>。 |
| largeicon.png | 大图标图像文件。有关<br>*largeicon.png*<br>文件的详细说明，请参阅<br>[应用资源](../../01-快速入门/应用资源.md#app-icons)<br>。 |
| index.html | Web 应用的主页面。该页面仅在屏幕上显示 "Hello World" 文本。 |

#### 创建托管 Web 应用

`hosted_webapp` 模板提供一个包含重定向 URL 的托管 Web 应用，其中仅含最基本的文件。

执行以下命令，在 `./sampleApp` 目录中创建一个托管 Web 应用。

```shell
ares-generate -t hosted_webapp ./sampleApp
```

下表列出了该模板所提供的托管 Web 应用文件：

| 目录 / 文件 | 描述 |
| --- | --- |
| appinfo.json | Web 应用配置文件。<br>*appinfo.json*<br>文件包含 Web 应用的元数据。打包 Web 应用时该文件必须存在。有关<br>*appinfo.json*<br>文件的详细说明，请参阅<br>[appinfo.json](../../03-API参考/配置文件/appinfo.json应用元数据.md)<br>。 |
| icon.png | 图标图像文件。有关<br>*icon.png*<br>文件的详细说明，请参阅<br>[应用资源](../../01-快速入门/应用资源.md#app-icons)<br>。 |
| largeicon.png | 大图标图像文件。有关<br>*largeicon.png*<br>文件的详细说明，请参阅<br>[应用资源](../../01-快速入门/应用资源.md#app-icons)<br>。 |
| index.html | Web 应用的主页面，其中包含重定向 URL。 |

#### 创建 JS 服务

`js_service` 模板提供一个示例 [JS 服务](../../02-开发指南/JavaScript服务/JS服务基础.md)，它在 webOS TV 上作为后台服务运行。该示例 JS 服务会响应服务请求的简单消息。

执行以下命令，从模板在 `./sampleService` 目录中创建一个 JS 服务。

```shell
ares-generate -t js_service ./sampleService
```

下表列出了示例 JS 服务的文件及其描述：

| 文件 | 描述 |
| --- | --- |
| helloworld_service.js | 示例 JS 服务代码，提供若干简单命令。这些命令在<br>*services.json*<br>文件中指定后方可使用。 |
| package.json | NPM 的配置文件。有关更多信息，请参阅<br>[https://docs.npmjs.com/getting-started/using-a-package.json](https://docs.npmjs.com/getting-started/using-a-package.json)<br>。 |
| services.json | 该配置文件定义服务在 webOS 总线上提供哪些命令。有关更多信息，请参阅<br>[services.json](../../03-API参考/配置文件/services.json服务配置.md)<br>。 |

#### 从模板创建 appinfo.json 文件

`webappinfo` 模板提供一个带有示例值的 *appinfo.json* 文件。如果你要在没有模板的情况下构建新的 Web 应用，或者使用并非由模板创建的现有 Web 应用，则应将 *appinfo.json* 文件添加到你的应用中。该文件保存应用的名称、ID、应用类型、图标图像和主页面信息。

执行以下命令，从模板在 `sampleApp` 目录中创建一个 *appinfo.json* 文件。

```shell
ares-generate -t webappinfo ./sampleApp
```

以下是由该模板创建的示例 *appinfo.json* 文件。

```json
{
  "id": "com.domain.app",
  "version": "0.0.1",
  "vendor": "My Company",
  "type": "web",
  "main": "index.html",
  "title": "new app",
  "icon": "icon.png",
  "largeIcon": "largeIcon.png"
}
```

## 在电视设备上部署 Web 应用

本节介绍如何打包 Web 应用并将其安装到 webOS TV 设备上。你将使用 [ares-package](#ares-package)、[ares-install](#ares-install) 和 [ares-setup-device](#ares-setup-device) 来部署 Web 应用。

如果你使用的是 webOS TV 模拟器（Simulator），请跳过此步骤，直接转到[启动 Web 应用](#launch-the-web-app)。

### 打包 Web 应用

第一步是使用 `ares-package` 命令为你的应用创建包文件（.ipk）。

在执行打包命令之前，你需要检查必需的文件是否存在。`ares-package` 命令会从应用目录中查找并读取 *appinfo.json* 文件，其中定义了诸如 `main` 和 `icon` 等必需字段。同理，图标图像文件和主页面文件也必须存在于正确的路径下。

#### 仅打包 Web 应用

执行以下命令以打包 `./sampleApp` 目录中的应用。

```shell
ares-package ./sampleApp
```

#### 打包带 JavaScript 服务的 Web 应用

执行以下命令以将 `sampleApp` 目录中的应用与 `sampleService` 目录中的服务一起打包。

```shell
ares-package ./sampleApp ./sampleService
```

注意

要将你的应用和服务打包为单个 IPK 文件，请让服务名称以应用 ID 开头。

<br>

例如：

- 应用 ID：“com.yourdomain.app”
- 服务 ID：“com.yourdomain.app.myservice”

现在你可以看到，包文件存在于执行该命令的目录中。

### 安装 Web 应用

使用 `ares-install` 命令将创建的包文件安装到你的设备上。你也可以使用 `ares-install` 命令查看目标设备列表。使用 `ares-setup-device` 命令修改设备的设置。

注意

从 webOS TV 3.0 开始，你可以使用 Developer Mode 应用在真实设备上测试你的应用。更多信息，请参见

[Developer Mode App](../../01-快速入门/开发者模式应用.md)

。

#### 列出目标设备

使用 `ares-setup-device` 命令查看目标设备的名称、平台类型、描述以及 SSH 访问地址。

执行以下命令以查看目标设备列表。

```shell
ares-setup-device --list
```

以下是该命令的示例结果。模拟器（emulator）包含在默认设备列表中。

```shell
name        deviceinfo                 connection    profile
---------   ------------------------   ------------  --------
emulator    developer@127.0.0.1:6622   ssh           tv
tv          prisoner@10.123.45.67      ssh           tv
```

使用 `ares-setup-device` 命令时，你可以通过 `-F`、`--listfull` 选项查看更详细的列表。下面展示了该命令及示例结果。

```shell
ares-setup-device --listfull
[
  {
    "profile": "tv",
    "name": "tv",
    "deviceinfo": {
        "ip": "10.123.45.67",
        "port": "9922",
        "user": "prisoner"
    },
    "connection": [
        "ssh"
    ],
    "details": {
        "platform": "starfish",
        "privatekey": "tv_webos",
        "passphrase": "ares-setup-device --full",
        "description": "new device"
    }
  },
  {
    "profile": "tv",
    "name": "emulator",
    "deviceinfo": {
        "ip": "127.0.0.1",
        "port": "6622",
        "user": "developer"
    },
    "connection": [
    "ssh"
    ],
    "details": {
        "platform": "starfish",
        "privatekey": "webos_emul",
        "description": "LG webOS TV Emulator"
    }
  }
]
```

#### 修改目标设备的设置

如果你在远程计算机上使用模拟器进行测试，则需要将默认的回环地址改为远程主机地址。以下示例介绍了如何将模拟器的主机地址设置为目标设备。

```shell
ares-setup-device --modify emulator --info "host=10.177.231.137"
```

如以下示例所示，重新检查设备列表以确认目标设备的主机地址是否已被修改。

```shell
ares-setup-device --list

name     deviceinfo                     connection  profile
-------- -----------------------------  ----------  -------
tv       prisoner@10.123.45.67          ssh         tv
emulator developer@10.177.231.137:6622  ssh         tv
```

还有另一种方式可以通过 `ares-setup-device` 命令的交互模式更改目标设备的信息。以下示例展示了如何在交互模式下更改目标设备的主机地址。不带任何选项运行 `ares-setup-device` 命令，它将显示目标设备列表并如下所示启动交互模式。

```shell
ares-setup-device

name     deviceinfo                connection  profile
-------- ------------------------  ----------  --------
tv       prisoner@10.123.45.67     ssh         tv
emulator developer@127.0.0.1:6622  ssh         tv

** You can modify the device info in the above list, or add new device.
? Select
> add
  modify
  remove
```

如果你不想更改之前的值，请在不输入任何值的情况下按回车键。有关该命令用法的更多信息，请参见 [ares-setup-device](#ares-setup-device)。

#### 安装 Web 应用的包文件

输入你的设备信息。

请确保你的目标设备正在运行。使用目标设备的名称和包文件作为参数执行以下命令，以将包文件安装到目标设备上。

```shell
ares-install --device myTV ./com.domain.app_0.0.1_all.ipk
```

如果安装成功，你将看到 `success` 消息。

要验证安装，请执行以下命令查看已安装的应用 ID 列表，并检查你的应用 ID 是否存在于结果中。

```shell
ares-install --device myTV --list
```

#### 移除 Web 应用

使用带 `--remove` 选项的 `ares-install` 命令从设备中移除应用。你需要输入要移除的应用 ID 作为参数。执行以下命令以从目标设备中移除你的应用。

```shell
ares-install --device myTV --remove com.domain.app
```

## 运行 Web 应用

使用 `ares-launch` 命令启动或关闭您的 Web 应用。

### 启动 Web 应用

以设备名称和应用 ID 作为参数执行 `ares-launch` 命令，即可在目标设备上启动该应用。

```shell
ares-launch --device myTV com.domain.app
```

执行命令后，请检查您的应用是否已在目标设备上启动。

### 关闭 Web 应用

在目标设备名称和用于启动应用的应用 ID 之外，再使用 `--close` 选项执行 `ares-launch` 命令，即可关闭目标设备上的该应用。

```shell
ares-launch --device myTV --close com.domain.app
```

## 调试 Web 应用

您可以使用 Web Inspector 和 Node Inspector 监控目标设备上运行的 Web 应用或 JS 服务的执行信息；为此，您需要创建未压缩（non-minifying）的包文件（.ipk）。本节介绍如何创建包文件，以及如何为调试目的执行 Web Inspector 和 Node Inspector。

### 打包 Web 应用时不进行压缩

创建包文件（.ipk）时，`ares-package` 命令会缩减并合并源代码，并调整和缩短变量名与行距，这一过程称为压缩（minifying）。压缩会使调试变得困难。

因此，为了调试目的，请使用 `ares-package` 命令的 `--no-minify` 选项来省略压缩任务。

```shell
ares-package --no-minify ./sampleApp
```

注意

由于用于调试的包文件体积大于基本包文件，请仅在调试目的下使用未压缩的包文件。

### 启动 Inspector

webOS TV 分别提供用于调试 Web 应用和 JS 服务的 Web Inspector 与 Node Inspector。

#### 启动 Web Inspector

对于 Web 应用的调试，`ares-inspect` 命令提供 Web Inspector，用于显示应用的执行信息。

在应用运行时执行以下命令：

```shell
ares-inspect --device myTV --app com.domain.app --open
```

使用 `--open` 选项后，Web Inspector 将在您 PC 的默认浏览器中打开。请注意，Web Inspector 和 Node Inspector 在基于 Chromium 的浏览器上才能正常工作。

要使用 Inspector，您的 PC 上应安装与 webOS TV 版本兼容的相应 Chromium 版本。下表列出了按 webOS TV 版本划分的兼容 Chromium 版本及其下载链接。

| webOS TV 版本 | webOS TV 发布年份 | 使用 Inspector 支持的 Chrome 版本 |
| --- | --- | --- |
| webOS TV 23 | 2023 | • 最新版 Chrome |
| webOS TV 22 | 2022 |  |
| webOS TV 6.0 | 2021 |  |
| webOS TV 5.0 | 2020 | • [Chrome v68 (Windows)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win/561747/)<br>• [Chrome v68 (macOS)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Mac/561749/)<br>• [Chrome v68 (Linux 64bit)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Linux_x64/561747/) |
| webOS TV 4.x | 2018-2019 |  |
| webOS TV 3.x | 2016-2017 | • [Chrome v38 (Windows)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win/290006/)<br>• [Chrome v38 (macOS)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Mac/306948/)<br>• [Chrome v38 (Linux 64bit)](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Linux_x64/320008/) |
| webOS TV 2.0 | 2015 |  |
| webOS TV 1.0 | 2014 |  |

您将看到如下图所示的 Web Inspector。

![Web Inspector 的截图](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275186/webOS-TV/images/docs/tools/Web_Inspector_Screen_ksh2yl.webp)Web Inspector 的截图

注意

Web Inspector 基于 Google Chrome 开发者工具，因此有关如何使用 Google Chrome 开发者工具的详细说明，请参阅

[Google Developers](https://developers.google.com/chrome-developer-tools/)

。某些版本的 Google Chrome 可能不支持 Web Inspector。更多信息，请参见

[FAQ](https://webostv.developer.lge.com/faq)

。

#### 启动 Node Inspector

对于 JS 服务的调试，`ares-inspect` 命令还提供 Node Inspector，用于显示 JS 服务的执行信息。

在 JS 服务运行时执行以下命令：

```shell
ares-inspect --device myTV --service com.domain.app.myservice --open
```

您将看到如下图所示的 Node Inspector：

![Node Inspector 的截图](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275004/webOS-TV/images/docs/tools/Node_Inspector_Screen_jq9qoj.webp)Node Inspector 的截图

注意

有关 Node Inspector 的更多信息，请参阅 [Node Inspector 的 GitHub](https://github.com/node-inspector/node-inspector)。

### 测试 Web 应用

本节介绍如何使用 CLI 在 TV 设备或模拟器上测试您的 Web 应用。有关在 VS Code Extension 上调试 Web 应用的内容，请参阅 [在 VS Code Extension 上调试 Web 应用](../集成开发环境/VSCode扩展开发者指南.md#debug-the-web-app)。

#### 无需安装即可测试

您可以在不打包、不安装、不在 TV 设备上运行应用的情况下，测试对 Web 应用所做的代码更改。

`ares-launch` 命令的 `--hosted(-H)` 选项可让您轻松地在 TV 设备上测试代码更改。如果将 `--hosted` 选项与应用目录一起使用，则会在设备上启动一个 id 为 `com.sdk.ares.hostedapp` 的应用，并打开该目录中的文件。从 CLI v1.12.0 起新增了自动重新加载功能，因此只要您对应用文件进行修改并保存，TV 设备上的应用就会自动重新加载。

#### 示例

以下示例展示了使用 CLI 创建示例应用后，跳过打包和安装步骤直接进行测试的过程。

```shell
# Generate the sample app for test
$ ares-generate ./sampleApp
? app id com.domain.app
? title new app
? version 0.0.1
Generating basic in ./sampleApp
Success
```

```shell
# Test the sample app on the target device (name: myTV) without packaging and installation
$ ares-launch -H ./sampleApp -d myTV
Installing package
./sampleApp/com.domain.app.ipk
Ares Hosted App is now running...
```

- 要终止，请按 *Ctrl* + *C*。

**如何将特定文件排除在自动重新加载之外**

要将具有特定扩展名的文件或特定目录下的文件排除在自动重新加载之外，请创建一个 *.reloadignore* 文件。该 *.reloadignore* 文件应位于待测试应用的根目录下，且该文件本身会被排除在应用打包之外。

请将要排除在自动重新加载之外的文件或目录的绝对路径或相对路径添加到 *.reloadignore* 文件中。每一项以换行符分隔，各项的相对路径（以 ** 开头的情况除外）在应用之前，会基于应用的根目录转换为绝对路径。

即使在自动重新加载开启的情况下修改 *.reloadignore* 文件，修改也会立即生效，无需终止并重新运行该命令。

以下是一个 *.reloadignore* 文件的示例。

```text
appinfo.json
tests
**/tmp
**/*.png
```

- appinfo.json - 根目录下的 appinfo.json 文件将被忽略。
- tests - 根目录下 tests 目录中的目录和文件将被忽略。
- **/tmp - 应用工作目录中的任何 tmp 目录和文件都将被忽略。
- **/*.png - 应用工作目录中任何扩展名为 .png 的文件都将被忽略。

但使用此选项时，您无法测试包含 JS 服务的应用。

#### 在模拟器上测试

选择您想要使用的模拟器版本。

带 `--simulator` 选项的 `ares-launch` 命令会运行 webOS TV Simulator 来测试应用。

使用该命令时，模拟器的位置将根据环境变量 `LG_WEBOS_TV_SDK_HOME` 确定，并运行由 `--simulator` 选项指定的 webOS TV Simulator 版本的可执行文件。

有关如何安装和使用模拟器，请参阅[模拟器安装](../模拟器与仿真器/Simulator安装.md)和[模拟器开发者指南](../模拟器与仿真器/Simulator开发者指南.md#using-app)。

以下示例展示如何使用 CLI 运行所选版本的模拟器并测试 `./sampleApp`。

```shell
$ ares-launch --simulator 24 ./sampleApp

Finding simulator in /webOS_TV_SDK/Simulator
Launched webOS_TV_24_Simulator_1.0.0.appimage
```

#### 在本地服务器上测试

`ares-server` 命令会运行一个用于测试本地文件的 Web 服务器。该 Web 服务器将在给定路径上运行。

执行该命令即可在您的应用源代码目录上启动 Web 服务器。

```shell
ares-server ./sampleApp
```

您可以使用给出的 URL 打开您的应用。

```shell
Local server running on http://localhost:7496
```

如果您想直接使用 PC 的默认浏览器打开，请如下所示使用 `--open` 选项：

```shell
ares-server ./sampleApp --open
```

注意

要终止 Web 服务器，请在提示符处使用

*Control*

-

*C*

。

## 监控资源使用情况

自 v1.12.0 起，CLI 中新增了[Beanviser](../性能分析工具/Beanviser简介.md) 中提供的 CPU 和内存使用情况监控功能。

使用带有 `--resource-monitor`（`-r`）选项的 `ares-device-info` 命令，你可以在系统级或进程级监控 CPU 和内存的使用情况。你还可以设置时间间隔以定期获取使用数据，并将数据保存到 `.csv` 文件中。

有关各选项和参数的详细信息，请参阅 [ares-device-info](webOSCLI简介.md#ares-device-info)。

### 在系统级监控

以下示例显示系统级的 CPU 和内存使用情况。

```shell
# Display resource usage
$ ares-device-info -d myTV -r
 
2022-02-17 08:46:13
 
(%)   overall  usermode  kernelmode  others
----  -------  --------  ----------  ------
cpu   2.41     0         1.38        1.03
cpu0  1.05     0         1.05        0
cpu1  1.03     0         1.03        0
cpu2  4.12     0         1.03        3.09
 
(KB)    total    used    free    shared  buff/cache  available
------  -------  ------  ------  ------  ----------  ---------
memory  1023356  245668  458604  1552    319084      727128
swap    0        0       0
 
=================================================================
 
 
# Display resource usage every one second and save them to the resource.csv file
$ ares-device-info -d myTV -r -s resource.csv -t 1
 
Create resource.csv to D:webOS_TV_SDK\CLI\bin
2022-02-17 08:47:02
 
(%)   overall  usermode  kernelmode  others
----  -------  --------  ----------  ------
cpu   1.37     0         1.37        0
cpu0  1.02     0         1.02        0
cpu1  1.03     0         1.03        0
cpu2  2.04     0         2.04        0
 
(KB)    total    used    free    shared  buff/cache  available
------  -------  ------  ------  ------  ----------  ---------
memory  1023356  245576  458688  1552    319092      727220
swap    0        0       0
 
=================================================================
2022-02-17 08:47:03
 
(%)   overall  usermode  kernelmode  others
----  -------  --------  ----------  ------
cpu   1.02     0         1.02        0
cpu0  3        1         2           0
cpu1  0        0         0           0
cpu2  2.04     0         1.02        1.02
 
(KB)    total    used    free    shared  buff/cache  available
------  -------  ------  ------  ------  ----------  ---------
memory  1023356  245684  458580  1552    319092      727112
swap    0        0       0
 
=================================================================
```

要终止对资源使用情况的周期性监控，请按 `Ctrl` + `C`。

### 在进程级监控

以下示例显示进程级的 CPU 和内存使用情况。

```shell
# Launch your app before test
$ ares-launch -d myTV com.domain.app
Launched application com.domain.app
 
# Display resource usage of running apps and services
$ ares-device-info -d myTV -r -l
 
2022-02-17 08:51:51
 
PID   ID                 CPU(%)  MEMORY(%)  MEMORY(KB)
----  -----------------  ------  ---------  ----------
2336  com.domain.app  0.34    8.01       76060
2439  test               0       8.21       77924
 
======================================================================
 
# Display resource usage of specified running app
$ ares-device-info -d myTV -r -id com.domain.app
 
2022-02-17 08:52:53
 
PID   ID                 CPU(%)  MEMORY(%)  MEMORY(KB)
----  -----------------  ------  ---------  ----------
2336  com.domain.app  0.34    8.01       76060
 
======================================================================
```

## 命令

下表列出了你可以使用的命令。

| 命令 | 说明 |
| --- | --- |
| ares | 提供使用 ares 命令的帮助菜单 |
| [ares-generate](#ares-generate) | 从模板创建 Web 应用。 |
| [ares-package](#ares-package) | 创建并分析应用包文件。 |
| [ares-setup-device](#ares-setup-device) | 管理目标设备。 |
| [ares-install](#ares-install) | 在目标设备上安装应用。 |
| [ares-launch](#ares-launch) | 运行或终止 Web 应用。 |
| [ares-inspect](#ares-inspect) | 运行 Web Inspector 以调试 Web 应用。 |
| [ares-server](#ares-server) | 运行 Web 服务器以测试本地应用文件。 |
| [ares-novacom](#ares-novacom) | 从 webOS TV 为 Developer Mode 应用获取私钥。 |
| [ares-device-info](#ares-device-info) | 获取设备的系统信息并监控设备的资源使用情况。 |
| [ares-extend-dev](#ares-extend-dev) | 为 Developer Mode 应用延长开发者模式的会话时间。 |

### ares-generate

从模板创建应用。带 `--list` 选项的 `ares-generate` 命令会显示可用模板的列表。

#### 用法

```shell
ares-generate [OPTION...] APP_DIR|SERVICE_DIR
ares-generate --list|-l
ares-generate --version
ares-generate --help|-h
```

#### 选项

| 选项 | 参数 | 说明 |
| --- | --- | --- |
| -t, –template | TEMPLATE | 使用指定的模板。 |
| -p, –property | PROPERTY | 保存所输入的应用信息。 |
| -s, –servicename | SERVICE_NAME | 指定 JS 服务 ID。 |
| -f, –overwrite | None | 允许覆盖现有文件。 |
| -l, –list | None | 列出所有可用模板。 |
| -v | None | 显示执行日志。 |
| -V, –version | None | 显示<br>`ares-generate`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-generate`<br>命令的帮助 |

#### 参数

| 参数 | 说明 |
| --- | --- |
| APP_DIR | 指定你的应用项目目录。如果该目录不存在，则在执行此命令时创建该目录。 |
| SERVICE_DIR | 指定你的服务目录。如果指定的目录不存在，则在执行此命令时创建该目录。 |
| PROPERTY | 指定你的应用信息。你应使用 “Key=Value” 或 “{‘key1’:‘value1’, ‘key2’:‘value2’, …\}” 格式的 JSON 类型字符串输入此参数。 |
| TEMPLATE | 指定创建项目时要使用的模板。 |
| SERVICE_NAME | 指定你正在创建的 JS 服务 ID。服务 ID 必须是该服务所属应用 ID 的子域。 |

#### 示例

以下是一些 CLI 用法示例：

- 检查模板列表 `ares-generate -l basic Web App - (default) basic web app for webOS TV hosted_webapp Web App - hosted web app for webOS TV webappinfo Web App Info - appinfo.json for web app js_service JS Service - js service for webOS TV jsserviceinfo JS Service Info - services.json, package.json for JS service packageinfo Package Info - packageinfo.json for webOS package `
- 从默认模板创建 Web 应用 `ares-generate sampleApp ? app id com.example.sampleapp ? title Sample App ? version 0.0.1 Generating basic in C:\webOS_TV_SDK\CLI\sampleApp Success `
- 在 `./sampleApp` 目录中创建带自定义应用 ID 的 Web 应用 `ares-generate -p "id=com.example.sampleapp" sampleApp Generating basic in C:\webOS_TV_SDK\CLI\sampleApp Success `
- 在 `./sampleApp` 目录中从托管 Web 应用模板创建 Web 应用 `ares-generate -t hosted_webapp sampleApp ? app id com.example.hostedapp ? title Hosted App ? version 0.0.1 ? url http://webostv.hostedapp.lge.com Generating hosted_webapp in C:\webOS_TV_SDK\CLI\sampleApp Success `
- 在 `./sampleService` 目录中创建带自定义服务 ID 的 JS 服务。注意，服务 ID 必须是该服务所属应用 ID 的子域。 `ares-generate -t js_service -s com.example.sampleapp.sampleservice sampleService `
- 在 `./sampleApp` 目录中创建 Web 应用并使用 JSON 字符串设置属性 `ares-generate -p "{'id':'com.example.sampleapp', 'version':'0.0.1', 'icon':'icon.png', 'type':'web', 'title':'Sample App', 'main':'index'}" sampleApp`

### ares-package

将你的应用和 JS 服务打包为一个包文件（.ipk），并存储在指定目录中。使用 `info` 或 `info-detail` 选项，你可以查看有关该包文件的信息。

打包过程分为两个阶段：压缩源代码；以及创建包文件。`ares-package` 命令通过尽可能去除冗余代码来减小源代码体积，并在创建包文件时将其合并。`ares-package` 命令会调整并缩短变量名和行间距，并将多个文件合并为单个文件，以减小代码体积和文件加载时间。

重要

应用文件名必须只包含拉丁字母。如果包含非 ASCII 字符，将会发生错误。

#### 用法

```shell
ares-package [OPTION...] APP_DIR [[SERVICE_DIR][PKG_DIR][...]]
ares-package -i, --info PACKAGE_FILE
ares-package -I, --info-detail PACKAGE_FILE
ares-package --version
ares-package -help|-h
```

#### 选项

| 选项 | 参数 | 描述 |
| --- | --- | --- |
| -o, –outdir | OUT_DIR | 指定创建包文件的目录。 |
| -c, –check | None | 检查你的应用的<br>*appinfo.json*<br>文件是否存在。<br>该选项不会生成包文件。如果<br>*appinfo.json*<br>文件不存在，则会显示警告消息。 |
| -e, –app-exclude | EX_DIR | 列出要从包文件中排除的目录。 |
| -n, –no-minify | None | 跳过压缩源代码的过程。 |
| -r, –rom | None | 仅执行到创建包文件阶段之前的步骤。 |
| -i, –info | PACKAGE_FILE | 指定要分析的扩展名为 .ipk 的文件。 |
| -I, –info-detail | PACKAGE_FILE | 指定要详细分析的扩展名为<br>*.ipk*<br>的文件。 |
| -v | None | 显示执行日志。 |
| -V, –version | None | 显示<br>`ares-package`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-package`<br>命令的帮助信息。 |

#### 参数

| 参数 | 描述 |
| --- | --- |
| APP_DIR | 指定要打包的应用所在目录。 |
| SERVICE_DIR | 指定 JS 服务的<br>[package.json](https://docs.npmjs.com/getting-started/using-a-package.json)<br>文件所在目录。 |
| PKG_DIR | 指定<br>*packageinfo.json*<br>文件所在的目录。<br>该文件是元数据文件，包含打包工具和系统所使用的信息。一般而言，除非你在应用包中包含 JS 服务，否则无需创建<br>*packageinfo.json*<br>文件。如果未指定<br>`PKG_DIR`<br>，则<br>`ares-package`<br>命令会根据<br>*appinfo.json*<br>文件生成<br>*packageinfo.json*<br>文件。请注意，如果你使用自己的<br>*packageinfo.json*<br>文件，请保持数据规则一致，例如<br>*appinfo.json*<br>文件中的 ID 命名约定。 |
| OUT_DIR | 指定创建包文件的目录。<br>如果你不输入目录，包文件将创建在与命令相同的目录中。 |
| EX_DIR | 指定在打包包文件时要排除的应用目录和文件的名称。<br>你必须输入用于示例和测试的目录。指定目录中的所有子目录和文件都会被排除。此外，指定的文件也会被排除。该命令会从匹配的应用目录中递归查找目录和文件。要排除多个目录，请输入为 "-e subdir -e filename"。你还可以使用通配符（*）等通用模式表达式。 |
| PACKAGE_FILE | 指定要分析的扩展名为<br>*.ipk*<br>的文件。 |

注意

`ares-package`

命令会根据配置文件自动识别

`SERVICE_DIR`

和

`PKG_DIR`

。

`SERVICE_DIR`

与

`PKG_DIR`

之间没有顺序要求。

#### 示例

以下是一些不同用法的示例：

- 从 `./sampleApp` 目录创建包文件并输出到工作目录 `ares-package sampleApp`
- 从 `./sampleApp` 目录创建包文件并输出到 `./output` 目录 `ares-package -o output sampleApp`
- 创建用于调试的包文件（不压缩） `ares-package --no-minify sampleApp`
- 创建包文件，但排除 `testCode1` 子目录、`README.md` 文件和所有文本文件（.txt） `ares-package -e "testCode1" -e "README.md" -e "*.txt" samplePrj`
- 使用外部 JS 服务目录创建包文件 `ares-package sampleApp sampleService`
- 分析包文件 `ares-package -i ./com.examples.app_1.0.0_all.ipk`
- 详细分析包文件 `ares-package -I ./com.examples.app_1.0.0_all.ipk`

### ares-setup-device

显示已注册目标设备的列表。您还可以在列表中添加、修改或删除设备。该命令主要用于修改在远程主机上运行的目标主机地址。

#### 用法

```shell
ares-setup-device
ares-setup-device [OPTIONS...] --add|-a [TARGET_NAME] [--info|-i [DEVICE_INFO]]
ares-setup-device [OPTIONS...] --modify|-m [TARGET_NAME] [--info|-i [DEVICE_INFO]]
ares-setup-device [OPTIONS...] --remove|-r [TARGET_NAME]
ares-setup-device [OPTIONS...] -f, --default [TARGET_NAME]
ares-setup-device --search|-s
ares-setup-device [--search|-s] --timeout|-t [TIMEOUT]
ares-setup-device --reset|-R
ares-setup-device --list|-l
ares-setup-device --listfull|-F
ares-setup-device --version|-V
ares-setup-device --help|-h
```

#### 选项

| 选项 | 参数 | 说明 |
| --- | --- | --- |
| -a, –add | TARGET_NAME | 使用指定信息添加一个目标设备。 |
| -m, –modify | TARGET_NAME | 修改目标设备的信息。<br>您可以更改目标设备的信息，但名称除外。 |
| -i, –info | DEVICE_INFO | 设置目标设备的信息。 |
| -r, –remove | TARGET_NAME | 删除一个目标设备。 |
| -f, –default | TARGET_NAME | 将某个目标设备设为默认设备。 |
| -s, –search | None | 使用<br>[SSDP](https://en.wikipedia.org/wiki/Simple_Service_Discovery_Protocol)<br>搜索同一网络中的 webOS 设备，并显示找到的设备列表。<br>当您从设备列表中选择一个设备时，所选设备的 IP 地址会自动设置为设备信息。 |
| -t, –timeout | TIMEOUT | 为<br>`–search`<br>选项设置超时值。<br>该选项之前不必带有<br>`–search`<br>选项。默认值为 5（单位：秒）。 |
| -R, –reset | None | 初始化已注册目标设备的列表。 |
| -v | None | 显示执行日志。 |
| -l, –list | None | 列出已注册的目标设备。 |
| -F, –listfull | None | 更详细地列出已注册目标设备的信息（JSON 字符串）。 |
| –version | None | 显示<br>`ares-setup-device`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-setup-device`<br>命令的帮助信息。 |

#### 参数

| 参数 | 说明 |
| --- | --- |
| DEVICE_INFO | 指定目标设备的信息。<br>可以使用 “Key=Value” 格式的字符串，或诸如 ‘{“key1”:“value1”, “key2”:“value2”, …}’ 之类的 JSON 格式输入。您可以将以下各项用作目标设备的键：<br>• **name**<br>：目标设备名称<br>• **description**<br>：目标设备描述<br>• **host**<br>：目标设备主机地址<br>• **port**<br>：目标设备端口号<br>• **username**<br>：用于访问目标设备的用户名。可能的值：<br>• root（默认）– 仅供内部用户使用。<br>• developer – 用于访问模拟器。<br>• prisoner – 用于连接 TV 设备。<br>• **password:**<br>用于验证<br>**root**<br>用户的密码。<br>• 默认情况下，root 用户的密码为空。<br>• 如果之前已为 root 用户设置过密码，请在此处输入。<br>• 不适用于<br>**developer**<br>和<br>**prisoner**<br>用户。<br>• **privatekey**<br>：SSH 私钥的文件名。<br>• 用于验证<br>**developer**<br>和<br>**prisoner**<br>用户。不适用于 root 用户。<br>• 对于模拟器，该值必须为<br>`webos_emul`<br>（默认值）。<br>• 对于 TV，请不要输入任何内容，保持空白。该值会使用用户提供的口令自动生成。<br>• **passphrase**<br>：用于使用 SSH 私钥文件的口令。<br>• developer 用户不需要。<br>• 仅 prisoner 用户需要。<br>• 为 prisoner 自动生成 SSH 私钥文件。<br>在交互模式下使用 CLI 时，输入必需值或选择使用默认值时要格外小心，否则您可能无法使用该设备。 |
| TARGET_NAME | 指定目标设备的名称。 |
| TIMEOUT | 设备搜索的超时时间（单位：秒）。 |

以下示例展示了以 JSON 格式编写的 DEVICE_INFO：

```shell
{"host":"127.0.0.1", "port":"6622"}
```

#### 示例

以下是一些 CLI 用法示例：

- 列出目标设备 `ares-setup-device --list`
- 添加目标设备（目标设备名称：sampleEmulator，主机地址：10.123.45.67，端口号：6622，用户：developer） `ares-setup-device --add sampleEmulator -i "host=10.123.45.67" -i "port=6622" -i "username=developer"`
- 以 JSON 格式添加目标设备（目标设备名称：sampleEmulator，主机地址：10.123.45.67，端口号：6622，用户：developer） `ares-setup-device --add sampleEmulator --info "{'host':'10.123.45.67', 'port':'6622', 'username':'developer'}" `
- 以交互模式添加目标设备（目标设备名称：sampleEmulator，主机地址：10.123.45.67，端口号：6622，用户：developer） `ares-setup-device name deviceinfo connection Profile -------- ------------------------ ---------- ------- emulator developer@127.0.0.1:6622 ssh tv ** You can modify the device info in the above list, or add a new device. ? Select: add ? Enter Device Name: sampleEmulator ? Enter Device IP address: 10.123.45.67 ? Enter Device Port: 6622 ? Enter ssh user: developer ? Enter description: sample ? Select authentification: ssh key ? Enter ssh private key filename: webOS_emul ? Enter keys passphrase: ? Save? Yes name deviceinfo connection profile -------- --------------------------- ---------- ------- emulator developer@127.0.0.1:6622 ssh tv sampleEmulator developer@10.123.45.67:6622 ssh tv ` NoteIf you want to input the default value or set it empty, press the enter key without any value.
- 修改目标设备（目标设备名称：sampleEmulator，端口号：9922） `ares-setup-device --modify sampleEmulator -i "port=9922"`
- 以交互模式修改目标设备（目标设备名称：sampleEmulator，端口号：9922） `ares-setup-device name deviceinfo connection profile -------------- --------------------------- ---------- ------- emulator developer@127.0.0.1:6622 ssh tv sampleEmulator developer@10.123.45.67:6622 ssh tv ** You can modify the device info in the above list, or add a new device. ? Select: modify ? Enter Device Name: sampleEmulator ? Enter Device IP address: 10.123.45.67 ? Enter Device Port: 6622 ? Enter ssh user: developer ? Enter description: sample ? Select authentification: ssh key ? Enter ssh private key filename: webOS_emul ? Enter keys passphrase: ? Save? Yes name deviceinfo connection -------------- --------------------------- ---------- emulator developer@127.0.0.1:6622 ssh sampleEmulator developer@10.123.45.67:9922 ssh Success to modify a device!! ` NoteIf you want to keep the previous value, press Enter without any value.
- 移除目标设备（目标设备名称：sampleEmulator） `ares-setup-device --remove sampleEmulator`
- 搜索 webOS 设备 `ares-setup-device --search`
- 将某个设备设为默认设备 `ares-setup-device -f DEVICE`

### ares-install

将指定应用包文件（.ipk）的应用安装到目标设备上。你也可以使用此命令查看目标设备上已安装的应用列表，或移除这些应用。

#### 用法

```shell
ares-install [OPTION...] PKG_FILE
ares-install [OPTION...] --remove APP_ID
ares-install [OPTION...] --list|-l [--type|-t APPLICATION_TYPE]
ares-install [OPTION...] --listfull|-F [--type|-t APPLICATION_TYPE]
ares-install --device-list|-D
ares-install --version|-V
ares-install --help|-h
```

#### 选项

| 选项 | 参数 | 说明 |
| --- | --- | --- |
| -d, –device | TARGET_DEVICE | 指定应将你的应用安装到的目标设备。 |
| -l, –list | [-t, –type option] | 列出指定目标设备上已安装的应用。<br>请将此选项与<br>`-d`<br>、<br>`–device`<br>选项一起使用。 |
| -F, –listfull | [-t, –type option] | 列出已安装应用的更多详细信息。<br>请将此选项与<br>`-d`<br>、<br>`–device`<br>选项一起使用。 |
| -t, –type | APPLICATION_TYPE | 从已安装应用列表中筛选出相应的应用类型。<br>请将此选项与<br>`-l`<br>、<br>`–list`<br>选项或<br>`-F`<br>、<br>`–listfull`<br>选项一起使用。 |
| –device-list | None | 列出所有可用的目标设备。 |
| -v | None | 显示执行日志。 |
| –version | None | 显示<br>`ares-install`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-install`<br>命令的帮助。 |

注意

`storage-list`

和

`storage`

选项自 CLI v1.12.0 起已弃用。

#### 参数

| 参数 | 说明 |
| --- | --- |
| PKG_FILE | 指定你的应用包文件的路径。 |
| APP_ID | 要从设备中移除的应用的 ID。 |
| TARGET_DEVICE | 指定用于安装或移除应用，或查看已安装应用列表的目标设备。 |
| APPLICATION_TYPE | 指定用于筛选已安装应用列表的应用类型。<br>支持的应用类型为：<br>• **web**<br>：Web 应用类型 |

#### 示例

以下是一些 CLI 用法示例：

- 列出可用的目标设备 `ares-install --device-list`
- 在模拟器上安装包名为 `com.example.sampleapp_0.0.1_all.ipk` 的应用 `ares-install --device emulator com.example.sampleapp_0.0.1_all.ipk`
- 列出模拟器上已安装的应用 `ares-install --device emulator --list`
- 列出应用类型为 **web** 的应用 `ares-install --device emulator --list --type web`
- 从模拟器中移除应用 ID 为 `com.example.sampleapp` 的应用 `ares-install --device emulator --remove com.example.sampleapp`

### ares-launch

运行或终止目标设备上已安装的应用。此命令还可以显示目标设备上正在运行的应用列表。

#### 用法

```shell
ares-launch [OPTION...] APP_ID
ares-launch [OPTION...] --hosted|-H APP_DIR [--host-ip|-I HOST_IP]
ares-launch [OPTION...] --close|-c APP_ID
ares-launch [OPTION...] --running|-r
ares-launch [OPTION...] --simulator|-s WEBOS_TV_VERSION APP_DIR
ares-launch --device-list|-D
ares-launch --version|-V
ares-launch --help|-h
```

#### 选项

| 选项 | 参数 | 说明 |
| --- | --- | --- |
| -d, –device | TARGET_DEVICE | 指定你要将应用安装到的目标设备。 |
| -H, –hosted | APP_DIR | 无需安装即可运行你的应用。<br>但是，使用此选项时，你无法执行包含 JS 服务的应用。更多信息，请参见<br>[Debugging Web App](webOSCLI开发者指南.md#debug-the-web-app)<br>。 |
| -I, –host-ip | HOST_IP | 指定主机的 IP 地址。<br>你必须将此选项与<br>`–hosted`<br>选项一起使用。<br>`–hosted`<br>选项的主机 IP 默认会自动选择。但是，如果<br>`–hosted`<br>选项因网络连接错误而无法正常工作，请使用此选项指定主机的 IP 地址。 |
| -c, –close | APP_ID | 终止目标设备上的应用。 |
| -r, –running | None | 列出目标设备上正在运行的应用。 |
| -s, –simulator | WEBOS_TV_VERSION | 指定要启动的模拟器（Simulator）的 webOS TV 版本。<br>更多信息，请参见<br>[Debugging Web App](webOSCLI开发者指南.md#debug-the-web-app)<br>。 |
| -p, –params | PARAMS | 使用指定的参数启动应用。 |
| –device-list | None | 列出所有可用的目标设备。 |
| -v | None | 显示执行日志。 |
| –version | None | 显示<br>`ares-launch`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-launch`<br>命令的帮助。 |

#### 参数

| 参数 | 说明 |
| --- | --- |
| APP_ID | 指定要运行或终止的应用 ID。 |
| TARGET_DEVICE | 指定应用所安装到的目标设备。 |
| WEBOS_TV_VERSION | 指定测试应用所用的模拟器（Simulator）的 webOS TV 版本。 |
| APP_DIR | 指定要测试的应用工作目录。 |
| HOST_IP | 指定主机的 IP 地址。 |
| PARAMS | 指定应用启动时使用的参数。<br>你应使用 ‘{“param1”:“value1”, “param2”:“value2 which is containing spaces”, …}’ 格式的 JSON 类型字符串输入参数和值。 |

#### 示例

以下是一些不同用法的示例：

- 在模拟器上运行应用 ID 为 `com.example.sampleapp` 的应用 `ares-launch --device emulator com.example.sampleapp`
- 使用 URL 参数运行应用 `ares-launch --device emulator com.example.sampleapp --params "{'url':'www.lge.com'}"` 注意当你使用参数时，应用会通过`webOSLaunch` 事件接收该参数。有关 webOSLaunch 事件的更多信息，请参见 [App Lifecycle](https://webostv.developer.lge.com/develop/guides/app-lifecycle)。
- 列出模拟器上正在运行的应用 `ares-launch --device emulator --running`
- 在模拟器上终止应用 ID 为 `com.example.sampleapp` 的应用 `ares-launch --device emulator --close com.example.sampleapp`
- 无需安装即可运行 `sampleApp` 目录中的应用 `ares-launch --device emulator --hosted sampleApp`
- 在模拟器上使用主机 IP 地址 `192.168.0.10` 无需安装即可运行 `sampleApp` 目录中的应用 `ares-launch --device emulator --hosted sampleApp --host-ip 192.168.0.10`
- 在 webOS TV 23 模拟器（Simulator）上运行 `sampleApp` 目录中的应用 `ares-launch -s 23 sampleApp`
- 在 webOS TV 23 模拟器（Simulator）上使用两个参数运行 `sampleApp` 目录中的应用 `ares-launch -s 23 APP_DIR -p "{'data1':'foo', 'data2':'bar'}"` `ares-launch -s 23 APP_DIR -p "data1=foo" -p "data2=bar"`

### ares-inspect

提供 Web Inspector 和 Node Inspector。

Web Inspector 和 Node Inspector 在 Web 浏览器上运行。每个 inspector 都会显示有关你的 Web 应用或 JS 服务的运行信息。

#### 用法

```shell
ares-inspect [OPTION...] [--app|-a] APP_ID
ares-inspect [OPTION...] --service|-s SERVICE_ID
ares-inspect --version|-V
ares-inspect --help|-h
```

#### 选项

| 选项 | 参数 | 描述 |
| --- | --- | --- |
| -d, –device | TARGET_DEVICE | 指定你要在其中安装应用的目标设备。 |
| -a, –app | APP_ID | 指定要使用 Web Inspector 运行的应用。 |
| -s, –service | SERVICE_ID | 指定要使用 Node Inspector 运行的 JS 服务。 |
| -o, –open | None | 打开 webOS TV SDK 捆绑浏览器（Chromium）。 |
| -v | None | 显示执行日志。 |
| –version | None | 显示<br>`ares-inspect`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-inspect`<br>命令的帮助信息。 |

#### 参数

| 参数 | 描述 |
| --- | --- |
| APP_ID | 要使用 Web Inspector 查看其信息的应用的应用 ID。 |
| SERVICE_ID | 要使用 Node Inspector 查看其信息的 JS 服务的 ID。 |
| TARGET_DEVICE | 指定你要在其中安装应用的目标设备。 |

#### 示例

以下是一些不同用法的示例：

- 为应用 ID 为 `com.example.sampleapp` 的应用启动 Web Inspector `ares-inspect --device emulator --app com.example.sampleapp`
- 为应用 ID 为 `com.example.sampleapp.sampleservice` 的 JS 服务启动 Node Inspector `ares-inspect --device emulator --service com.example.sampleapp.sampleservice`

### ares-server

运行一个用于测试本地文件的 Web 服务器。

Web 服务器在给定路径上运行。你可以使用 control-C（在 Windows、Linux 上）或 Command-C（在 macOS 上）终止该 Web 服务器。

#### 用法

```shell
ares-server [OPTION...] APP_DIR
ares-server --version|-V
ares-server --help|-h
```

#### 选项

| 选项 | 参数 | 描述 |
| --- | --- | --- |
| -o, –open | None | 打开 webOS TV SDK 捆绑浏览器（Chromium）。 |
| -v | None | 显示执行日志。 |
| –version | None | 显示<br>`ares-server`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-server`<br>命令的帮助信息。 |

#### 参数

| 参数 | 描述 |
| --- | --- |
| APP_DIR | 指定你要发布到 Web 服务器上的应用所在目录。 |

#### 示例

以下是一些不同用法的示例：

- 在源代码目录中运行 Web 服务器 `ares-server ./source`
- 使用浏览器运行 Web 服务器 `ares-server ./source --open`

### ares-novacom

从 webOS TV 为 Developer Mode 应用获取私钥。<br>获取私钥后，你可以在 webOS TV 上安装和启动应用，或运行命令。

#### 用法

```shell
ares-novacom [OPTION...] --forward|-f [--port|-p DEVICE_PORT1[:HOST_PORT1]][--port|-p DEVICE_PORT2]][...]
ares-novacom [OPTION...] --getkey|-k
ares-novacom [OPTION...] --run|-r DEVICE_COMMAND
ares-novacom --device|-d
ares-novacom --device-list
ares-novacom --version|-V
ares-novacom --help|-h
```

#### 选项

| 选项 | 参数 | 描述 |
| --- | --- | --- |
| -d, –device | TARGET_DEVICE | 指定执行该命令的目标设备。 |
| -f, –forward | -p、-port 选项的列表 | 启用主机 PC 与目标设备之间的端口转发。<br>你可以通过附加选项（<br>`-p`<br>、<br>`–port`<br>选项）指定端口号。 |
| -p, –port | DEVICE_PORT[:HOST_PORT] | 指定用于端口转发的端口。 |
| -k, –getkey | None | 从 webOS TV 获取私钥。<br>使用该选项之前，你应在 webOS TV 上运行 Developer Mode 应用。 |
| -r, –run | DEVICE_COMMAND | 在目标设备的 shell 上执行命令。 |
| -D, –device-list | None | 列出可用的目标设备。 |
| -v | None | 显示执行日志。 |
| –version | None | 显示<br>`ares-novacom`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-novacom`<br>命令的帮助信息。 |

#### 参数

| 参数 | 描述 |
| --- | --- |
| DEVICE_PORT | 指定目标设备用于在主机 PC 与目标设备之间进行端口转发的端口号。<br>如果仅指定<br>`DEVICE_PORT`<br>，则主机 PC 使用相同的端口号进行端口转发。 |
| HOST_PORT | 指定主机 PC 用于在主机 PC 与目标设备之间进行端口转发的端口号。 |
| DEVICE_COMMAND | 指定在目标设备的 shell 上运行的命令。 |

#### 示例

以下是一些不同用法的示例：

- 从名为 `tv` 的 webOS TV 获取私钥（需要 Developer Mode 应用设置） `ares-novacom --device tv --getkey`
- 在模拟器（6622）与主机 PC（3030）之间设置端口转发 `ares-novacom --device emulator --forward --port 6622:3030`
- 在名为 `tv` 的 webOS TV 上运行 `ps aux` 命令 `ares-novacom --device tv --run "ps aux"`

### ares-device-info

获取设备的以下系统信息。

- 型号名称
- SDK 版本
- 固件版本
- 主板类型
- OTA（Over The Air，空中下载）ID

请注意，如果该命令未能获取某些系统信息，则只会显示已获取到的信息。使用 `resource-monitor` 选项，您可以监控目标设备或正在运行的应用和服务的 CPU（%）和内存（KB）使用情况。

#### 用法

```shell
ares-device-info
ares-device-info [OPTION...]
ares-device-info [OPTION...] --resource-monitor|-r
ares-device-info --device|-d
ares-device-info --device-list|-D
ares-device-info --version|-V
ares-device-info --help|-h
```

#### 选项

| 选项 | 参数 | 说明 |
| --- | --- | --- |
| -d, –device | TARGET_DEVICE | 指定执行该命令的目标设备。 |
| -r, –resource-monitor | None | 监控目标设备的资源使用情况。 |
| -l, –list | None | 监控正在运行的应用和服务的资源使用情况。<br>请将该选项与<br>`–resource-monitor`<br>选项配合使用。 |
| -id, –id-filter | ID | 请将该选项与<br>`–resource-monitor`<br>选项配合使用。 |
| -t, –time-interval | TIME_INTERVAL | 以秒为单位设置监控间隔。<br>请将该选项与<br>`–resource-monitor`<br>选项配合使用。 |
| -s, –save | CSV_FILE | 指定用于保存资源使用情况数据的文件名或路径。<br>请将该选项与<br>`–resource-monitor`<br>选项配合使用。 |
| –device-list | None | 列出所有可用设备。 |
| -v | None | 显示执行日志。 |
| –version | None | 显示<br>`ares-device-info`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-device-info`<br>命令的帮助信息。 |

#### 参数

| 参数 | 说明 |
| --- | --- |
| TARGET_DEVICE | 指定用于获取设备信息的目标设备。 |
| ID | 指定要显示其资源使用情况的应用或服务的 ID。 |
| TIME_INTERVAL | 以秒为单位指定监控资源使用情况的时间间隔。 |
| CSV_FILE | 指定用于保存资源使用情况数据的文件名或路径。<br>该文件只能为<br>*.csv*<br>格式。 |

#### 示例

以下是一些 CLI 用法示例：

- 列出可用的目标设备 `ares-device-info --device-list`
- 获取设备有效的系统信息 `ares-device-info --device target** modelName: WEBOS4.0 sdkVersion: 04.00.00 firmwareVersion: 04.00.00 boardType: M16PP_ATSC_KR otaId: HE_DTV_W18H_AFADATAA `
- 显示资源使用情况 `ares-device-info -d Device -r`
- 定期显示资源使用情况并将数据保存到 CSV 文件 `ares-device-info -d DEVICE -r -s resource.csv -t 1`
- 显示正在运行的应用和服务的资源使用情况 `ares-device-info -d DEVICE -r -l`
- 每隔三秒显示指定运行中应用的资源使用情况 `ares-device-info -d DEVICE -r -id com.example.app -t 3`

### ares-extend-dev

为 Developer Mode 应用延长开发者模式的会话时间。

请注意，此命令仅在开发者模式已开启且会话时间剩余超过 0 分钟时有效。如果此命令未能更新会话时间，请检查你的网络连接或开发者模式状态。**请勿**在模拟器上使用此命令，因为 Developer Mode 应用无法安装在模拟器上。

#### 用法

```shell
ares-extend-dev [OPTION...]
ares-extend-dev --device-list|-D
ares-extend-dev --version|-V
ares-extend-dev --help|-h
```

#### 选项

| 选项 | 参数 | 说明 |
| --- | --- | --- |
| -d, –device | TARGET_DEVICE | 指定执行该命令的目标设备。 |
| -D, –device-list | None | 列出可用的目标设备。 |
| -v | None | 显示执行日志。 |
| –version | None | 显示<br>`ares-extend-dev`<br>命令的版本。 |
| -h, –help | None | 显示<br>`ares-extend-dev`<br>命令的帮助。 |

#### 参数

| 参数 | 说明 |
| --- | --- |
| TARGET_DEVICE | 指定用于延长开发者模式会话时间的目标设备。 |

#### 示例

以下是一些 CLI 用法示例：

- 列出可用的目标设备 `ares-extend-dev --device-list`
- 在名为 `tv` 的 webOS TV 上延长开发者模式的会话时间 `ares-extend-dev -d tv`
