# 使用 webOS TV 插件
> 原文链接: https://webostv.developer.lge.com/develop/tools/sublime-using-webos-tv-plugin ｜ 简体中文翻译

注意：Sublime Text 插件已弃用

我们已决定自 2022 年起不再支持 Sublime Text 插件。我们建议你改用 [VS Code 扩展](../集成开发环境/VSCode扩展简介.md)。

你可能已经熟悉的 Sublime Text 插件提供了 webOS TV CLI 的大部分功能。这意味着你无需从头学习 CLI 命令。借助 Sublime Text 插件中提供的 webOS 菜单，你可以获得与 webOS TV CLI 相同的结果。如果你想查看 Sublime Text 插件中可用的功能，请参见[支持的功能](SublimeText插件简介.md#supported-features)。

## 创建 Web 应用

对于 Web 应用创建，webOS TV SDK 提供了 Web 应用模板、JS service 模板和配置文件模板（*appinfo.json*）。

### 从 webOS 项目模板创建 Web 应用

webOS TV SDK 提供了一个 Web 应用模板，让你可以轻松开发 Web 应用。以下展示如何使用模板创建 Web 应用：

1. 从菜单中点击 **webOS > Create webOS Application**。
2. 从列表中选择一个模板。
3. 在 Sublime Text 窗口底部输入你的应用名称。状态栏会显示应用创建进度。如果新应用项目创建成功，状态栏会显示所创建应用的路径，并且模板包会列在侧边栏中。
4. 根据你的开发计划实现你的应用。

注意

有关模板的更多详细信息，请参见[应用模板](../../01-快速入门/应用模板.md)。

### 从模板创建 JS service

webOS TV SDK 提供了一个 JS service 模板，其中包含一个示例 JS service。该示例 JS service 会响应服务请求的简单消息。请注意，JS service 模板必须与 Web 应用模板一起创建，或添加到现有的 Web 应用中。

以下展示如何使用模板创建 JS service：

1. 从菜单中点击 **webOS > Create JS Service**。
2. 在列表上选择你要创建的 `js_service` 模板。
3. 在 Sublime Text 窗口底部输入服务名称。随后，状态栏会显示 JS service 创建进度。如果项目创建成功，状态栏会显示所创建服务的路径，并且模板包会列在侧边栏中。
4. 根据你的开发计划实现该 JS service。

注意

有关 JS service 的更多详细信息，请参见 [JS services](../../02-开发指南/JavaScript服务/JS服务基础.md)。

### 从模板创建 appinfo.json

该插件提供与 webOS TV CLI 相同的配置文件模板（`appinfo.json`）。`appinfo.json` 模板是 webOS TV 应用必不可少的文件。它指定 Web 应用的元数据，例如应用 ID、名称及其他相关资源。*appinfo.json* 的示例如下：

```json
{
  "id": "com.yourdomain.app",
  "version": "0.0.1",
  "vendor": "My Company",
  "type": "web",
  "main": "index.html",
  "title": "new app",
  "icon": "icon.png",
  "largeIcon": "largeIcon.png"
}
```

webOS TV 使用 *appinfo.json* 文件来标识或启动应用。以下展示如何创建 *appinfo.json* 文件：

1. 从菜单中点击 **webOS > Create Appinfo.json**。一旦 *appinfo.json* 文件存在于当前选中的 Web 应用包中，**Setup Appinfo.json** 菜单就会被禁用。
2. `appinfo.json` 模板会在编辑器中打开。
3. 根据你的应用修改各项属性。
4. 将其保存到应用包的根目录。当你打包 Web 应用时，系统会首先搜索 *appinfo.json* 文件，所有子文件夹和文件都会基于 *appinfo.json* 文件的位置进行打包。

如果相关的 *appinfo.json* 文件存在于 Web 应用包中，webOS 菜单上会显示 **Setup Appinfo.json** 菜单。要设置 *appinfo.json* 文件：

1. 在侧边栏中选择 *appinfo.json* 文件。或者，从菜单中点击 **webOS > Setup Appinfo.json**。
2. 当前 Web 应用包的 *appinfo.json* 文件会打开以供编辑。
3. 根据你的应用修改各项属性。
4. 保存更改。

注意

有关 appinfo.json 文件的详细信息，请参见 [appinfo.json](../../03-API参考/配置文件/appinfo.json应用元数据.md)。

### 导入代码示例

LG Developer 提供的[代码示例](https://github.com/webOS-TV-app-samples)可以导入到 Sublime Text 中。以下展示如何导入从 LG Developer 下载的代码示例：

1. 在你的计算机上下载一个压缩的代码示例并将其解压到任意文件夹。
2. 将解压后的项目文件夹拖放到 Sublime Text 的任意位置。
3. 检查代码示例项目是否已成功导入。然后，在网络浏览器或目标设备上运行它。

## 打包 Web 应用

要在目标设备上安装并启动应用和服务，你必须将应用和 JS service 打包到指定的目录中。你可以通过以下两种模式进行打包：

### Minify 模式

**Minify 模式**会在创建包文件时缩减源代码的大小。它会调整并缩短变量名和行间距。它还会将多个文件合并为单个文件，以减少源代码大小和文件加载时间。你可以使用 minify 模式将应用安装到目标设备，或将应用提交到 LG Seller Lounge。

注意

目前只有基于 Enyo 的源代码可以使用此 minify 模式进行压缩。我们建议你使用其他 JavaScript 压缩工具来压缩非基于 Enyo 的源代码。

### Non-minify 模式

**Non-minify 模式**会跳过压缩源代码的过程，并使用源代码创建包文件（.ipk）。你可以使用 non-minify 模式来调试应用。

### 如何打包 Web 应用

要在 Sublime Text 中打包 Web 应用，请按照以下步骤操作。

1. 从菜单中点击 **webOS > Package - minify mode** 或 **webOS > Package - non-minify mode**。
2. 包文件（.ipk）会创建在与 *appinfo.json* 文件相同的目录中。你可以在状态栏中查看所创建包文件的状态和路径。

## 安装 Web 应用

你可以将包文件安装到目标设备上。在安装 Web 应用之前，请准备好包文件，并选择目标设备。同时，根据所选目标设备连接到该目标设备。

要在 Sublime Text 中安装 Web 应用，请从菜单中点击 **webOS > Install**。如果该目录中不存在包文件，应用会自动被打包。你可以在状态栏中查看安装状态。

注意

在安装或启动应用之前，你必须提前运行目标设备。否则，安装 Web 应用会失败。有关目标设备的详细信息，请参见[选择用于启动应用的目标设备](配置webOSTV插件.md#selecting-target-for-applaunching)。

### 检查已安装的应用

你需要检查应用是否已成功安装在目标设备上。要检查目标设备上已安装的应用，请从菜单中点击 **webOS > Installed Application List**。此菜单会显示已安装在所选目标设备上的应用 ID。

## 启动 Web 应用

你可以在目标设备或网络浏览器上运行已安装的应用。

### 在网络浏览器上运行

该插件提供在外部网络浏览器上的预览。此功能让你可以在目标设备上启动应用之前先检查应用的预览效果。要在网络浏览器上运行 Web 应用，请按照以下步骤操作。

1. 在该插件中，在侧边栏中选择项目。
2. 从菜单中点击 **webOS > Run as browser**。随后，预览会在网络浏览器中启动。

### 在目标设备上运行

要在 Sublime Text 中在目标设备上启动 Web 应用，请从菜单中点击 **webOS > Launch**。如果应用未安装在目标设备上，包文件会自动安装到目标设备并启动。

注意

要启动 Web 应用，你必须提前在计算机上启动目标设备。

### 检查正在运行的应用

你需要检查应用是否已成功在目标设备上启动。要检查目标设备上已启动的应用，请从菜单中点击 **webOS > Running Application List**。此菜单会显示在所选目标设备上正在运行的应用 ID。

## 使用 Web Inspector 调试 Web 应用

webOS TV SDK 提供用于调试 Web 应用的 Web inspector。Web inspector 通过执行信息监视在目标设备上运行的 Web 应用。Web inspector 使用 Chromium 浏览器作为默认浏览器。webOS TV SDK 包含 Chromium 浏览器，因此你无需在计算机上安装 chromium-browser。

要调试 Web 应用，你必须以 non-minify 模式打包应用。如果源代码被压缩或文件被合并，检查信息会变得困难。选择一个包文件，并从菜单中点击 **webOS > Debug with Web Inspector** 进行调试。

注意

该插件目前不支持用于 JS service 调试的 Node Inspector。你可以通过使用 CLI 命令来使用它。有关详细信息，请参见[启动 Node Inspector](../命令行工具/webOSCLI开发者指南.md#launch-node-inspector)。

## 插件实用技巧

以下是一些插件的实用技巧。

### 快捷键

该插件为 webOS 菜单提供快捷键。要使用下面的快捷键，请同时按下所指示的按键组合。

| 菜单 | 快捷键 |
| --- | --- |
| Create webOS app | Ctrl+Alt+A |
| Create JS service | Ctrl+Alt+J |
| Package – minify mode | Ctrl+Alt+P |
| Run as browser | Ctrl+Alt+B |
| Install | Ctrl+Alt+I |
| Launch | Ctrl+Alt+L |
| Debug with Web Inspector | Ctrl+Alt+D |

### 快捷按钮

应用开发完成后，打包、安装和启动应用的步骤既复杂又繁琐。你可能希望只需一个按钮就能简单地完成这些步骤。

该插件为此功能提供了如下两个菜单：

- `Install` + `Launch` 按钮

包文件必须存在于所选项目中。如果不存在，则会出错并显示错误消息。

- `Package` + `Install` + `Launch` 按钮

应用会以 minify 模式打包。

### 自动补全

自动补全会在你于编辑器中输入时，为关键词弹出补全提示框。因此，借助此自动补全功能，只需输入少量字符即可显示完整的候选词或语句。

要使用自动补全功能，请同时按下 `Ctrl` + `Space bar`，然后从补全提示框中选择一项。例如，在输入 **`luna://`** 字样后按下 `Ctrl` + `Space bar`。随后，补全提示框会显示可用的服务 API。当鼠标指针移动到某个方法上时，按下 `Ctrl` + `Spacebar` 即可在补全提示框中列出可用的方法。

### 代码片段

该插件仅为 JavaScript 文件提供代码片段，例如 *enyo.kind* 和 *webos.service.request*。

代码片段是一种向编辑器插入文本的模板，可帮助你避免烦人的重复输入。例如，在 JavaScript 文件中输入 **`enyo`**，然后按 **Tab** 按钮从列表中选择 **`enyo.kind`**。随后会插入如下相关源代码。

```js
enyo.kind({
    name:"*MyNewKind*",
    kind:"*enyo.object*",
    components:[
    ],

    create: function(){
        this.inherited(arguments);
    }
});
```

输入 **`webOS`**，然后按 **Tab** 按钮从列表中选择 **`webOS.service.request`**。随后会插入如下相关源代码。

```js
webOS.service.request("luna://*com.palm.connectionmanager*",{
    method:"*getStatus*",
    parameters: {},
    onSuccess: *getStatusResponse*,
    onFailure: function(inError){
        //...
    },
    onComplete: function(inResponse){
        //...
    },
    subscribe: true,
    resubscribe: true
});

function *getStatusResponse*(inResponse){
    var success = inResponse.returnValue;
    return true;
}
```

## 帮助菜单

Help SublimePlugin 菜单为开发者提供了有用的链接。

1. 在该插件中，从菜单中点击 **webOS > Help SublimePlugin**。
2. 点击弹出窗口上的链接。随后，网络浏览器会打开并跳转到 webOS TV Developer 网站上的 **Using Plugin for Sublime Text** 帮助页面。
