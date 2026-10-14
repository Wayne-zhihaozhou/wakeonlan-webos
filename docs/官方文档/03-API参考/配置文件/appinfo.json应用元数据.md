# appinfo.json（应用元数据）
> 原文链接: https://webostv.developer.lge.com/develop/references/appinfo-json ｜ 简体中文翻译

webOS TV 平台使用应用元数据（app metadata）来标识一个应用，并获取安装和运行该应用所需的其他信息。因此，在打包应用之前，你必须在名为 _appinfo.json_ 的文件中编写应用的元数据。_appinfo.json_ 文件位于应用根目录下，其中包含一个单一的 JSON 对象。

提示：JSON 语法

以下是一些可能对 JSON 语法有所帮助的小贴士。

- 不要包含任何注释（`/**/`** 或 `//`）。
- 属性请使用双引号括起来，而不是单引号。

## appinfo.json 参考

这些属性由必填属性和可选属性组成。下面列出的以下属性尤其是在向 LG Apps 提交应用时所必需的。请确保你正确指定这些属性。

- id
- title
- type
- main
- icon
- version

下面的示例展示了一个由各种属性组成的 appinfo.json 文件。

```javascript
{
    "id": "com.mycompany.app.appname",
    "title": "AppName",
    "main": "index.html",
    "icon": "AppName_80x80.png",
    "largeIcon": "AppName_130x130.png",
    "type": "web",
    "vendor": "My Company",
    "version": "1.0.0",
    "appDescription": "This's an app tagline",
    "resolution": "1920x1080",
    "bgColor": "red",
    "iconColor": "red",
    "bgImage": "AppName_Preview.png",
    "closeOnRotation": false
    "disableBackHistoryAPI": false,
    "handlesRelaunch": false,
    "splashBackground": "AppName_Splash.png",
    "splashColor": "#111111",
    "splashFitModeOnPortrait": "width",
    "requiredMemory": 20,
    "supportPortraitMode": true,
    "supportTouchMode": "virtual",
    "transparent": false,
    "virtualTouch": {
        "verticalThreshold": 20,
        "horizontalThreshold": 50,
        "positionEventOnPress": true,
        "shortTouchThreshold": 30
    },
    "accessibility": {
      "supportsAudioGuidance": true
    }
    "screenSaverProperties": {
      "preferredType": 3
    },
    "useGalleryMode": true
}
```

### icon

此属性为必填项，类型为 String。指定应用的图标文件，为 PNG 格式、80x80 像素的小图标。文件路径必须相对于 appinfo.json 文件。该图标文件是应用提交所必需的，并且仅用于应用测试。在 [LG Apps](https://www.lgappstv.com) 中，你在 [LG Seller Lounge](http://seller.lgappstv.com/) 单独上传的另一个 400x400 像素图标文件会经过自动缩放后取代该图标使用。

### id

此属性为必填项，类型为 String。指定你的应用 ID。例如 `**com.newcompany.app.myapp`**。每个应用必须具有唯一的 ID，该 ID 按照反向 DNS 命名规范构成。Launcher 使用此 ID 来标识你的应用，并将其与标题一起显示。应用一旦发布，应用 ID 便无法更改。

- 必须仅使用小写字母（a-z）、数字（0-9）、减号和句点来创建 ID。它必须以字母数字字符开头，并且长度至少为两个字符。

注意

如果要在应用中添加 JS services，不要在应用 ID 中包含减号（-）或句点（.）+ 数字（例如 `abc-1.0`），因为 Luna Service 不允许 JS service 名称中包含这些字符，且 service 名称必须以应用 ID 开头。

- 不得以下列保留域名开头：`**com.palm`**、`**com.webos`**、`**com.lge`**、`**com.palmdts`**
- 以公司/机构的反向域名作为 ID 的开头。（推荐）
- 以子域名 `**app.app-name`** 结束 ID。（推荐）

### largeIcon

此属性为可选属性，类型为 String。指定应用的大图标文件，为 PNG 格式、130x130 像素的图标。文件路径必须相对于 appinfo.json 文件。该大图标文件是应用提交所必需的，并且仅用于应用测试。在 [LG Apps](https://www.lgappstv.com) 中，你在 [LG Seller Lounge](http://seller.lgappstv.com/) 单独上传的另一个 400x400 像素图标文件会经过自动缩放后取代该大图标使用。

### main

此属性为必填项，类型为 String。指定应用的启动点。文件路径必须相对于 appinfo.json 文件，并且需要指向一个 HTML 文件。默认值为 `**index.html`**。

### title

此属性为必填项，类型为 String。指定要在 Launcher 和应用窗口中显示的标题。

提示：HTML `<title>` 元素

你可以在应用中使用 HTML `<title>` 元素作为副标题。建议使用应用版本号或厂商名称作为副标题。

### type

此属性为必填项，类型为 String。指定你的应用类型。当前仅允许使用 `**web`**。

### vendor

此属性为可选属性，类型为 String。指定应用的所有者，用于 launcher 和 deviceinfo 对话框。

### version

此属性为必填项，类型为 String。指定应用版本号，由以句点分隔的三个非负整数组成。默认值为 `**1.0.0`**。

- 不要包含前导零。示例：`**2.1.0`**（而不是 `**002.1.0`**）
- 主版本号（major）、次版本号（minor）和修订版本号（revision）都是必填的；如果缺少任何一项，应用可能无法安装。示例：`**2.1.0`**（而不是 `**2.1`**）
- 每个数字最多可有九位。换言之，最大的可能版本号为 `**999999999.999999999.999999999`**。
- 主版本号、次版本号和修订版本号是离散的。例如，`**1.5.3`** 是比 `**1.15.3`** 更低的版本。
- 一旦你在 LG Apps 上上传应用的某个版本，你就无法再次上传相同版本。要上传应用，你必须提高版本号。

### appDescription

此属性为可选属性，类型为 String。指定关于你的应用的简要信息。可以将其视为应用的一个简短标语。其长度不得超过 60 个字符。

### bgColor

此属性为可选属性，类型为 String。此属性仅在 webOS TV 1.x 和 2.x 中可用。在更高版本中，此属性会被忽略。指定应用在 Launcher 上显示的背景颜色。当未提供 `**bgImage`** 或 `**bgImage`** 不可用时，将使用此属性。你可以使用十六进制值或 HTML 颜色名称来指定颜色。例如，"bgColor":"#5e70a2"，"bgColor":"#ffffff"。

### bgImage

此属性为可选属性，类型为 String。此属性仅在 webOS TV 1.x 和 2.x 中可用。在更高版本中，此属性会被忽略。指定应用在 Launcher 上被激活时显示的后台图像。图像必须为 PNG 格式，图像大小必须为 1920 x 1080 像素。文件路径必须相对于 appinfo.json 文件。例如，_image/myappbgimage.png_。

### closeOnRotation

此属性为可选属性，类型为 Boolean。设置当屏幕纵向旋转时是否关闭你的应用。此属性仅适用于 StanbyME 机型。

- false（默认值）——无论屏幕是否旋转，你的应用都正常运行。
- true —— 当屏幕纵向旋转时，你的应用会收到通知后关闭。

### cloudgame\_active

此属性为可选属性，类型为 Boolean。指示游戏手柄 HID 设备是否受应用支持。

- false（默认值）——你的应用从不直接从游戏手柄设备读取输入事件。当用户控制与电视关联的游戏手柄设备时，webOS 平台会向应用提供相应的键盘事件。你的应用无需检查游戏手柄设备是否已连接。
- true —— 你的应用需要直接处理来自游戏手柄设备的输入事件。并非来自游戏手柄设备的每个事件都由 webOS 平台处理。

注意

此属性在 webOS TV 23 或更高版本上受支持。

### disableBackHistoryAPI

此属性为可选属性，类型为 Boolean。设置当按 Magic Remote 上的返回按钮时，你的应用是否接收返回按钮事件。有关此属性的更多信息，请参阅 [Back Button](../../02-开发指南/应用基础/返回按钮.md)。

- false（默认值）——你的应用不接收返回按钮事件。相反，webOS TV 平台使用标准 HTML history API（例如 `**history.pushState()`、**history.back()`** 和 `**popState`** 事件）管理历史记录。
- true —— 你的应用接收返回按钮事件。你应该在应用中实现如何处理返回按钮事件。

### enablePigScreenSaver

此属性为可选属性，类型为 Boolean。设置在视频未全屏播放时是否启动 PIG Screensaver。

- true（默认值）——如果视频未全屏播放，将启动 PIG Screensaver。
- false —— 即使视频未全屏播放，也将启动全屏屏保。

注意

PIG Screensaver 是在视频未全屏播放时，于视频未播放的区域出现的屏保。它在 webOS TV 3.0 或更高版本上默认应用。

### handlesRelaunch

此属性为可选属性，类型为 Boolean。设置你的应用是否处理 `**webOSRelaunch`** 事件。当你的应用被重新启动时，会发生 `**webOSRelaunch`** 事件，webOS TV 平台会将 `**webOSRelaunch`** 事件传递给你的应用。然后，根据该 `**handlesRelaunch`** 属性的值，你的应用自行决定是否处理该事件。

- false（默认值）——你的应用不处理 `**webOSRelaunch`** 事件。webOS TV 平台自动以全屏模式显示你的应用。
- true —— 你的应用先在后台处理 `**webOSRelaunch`** 事件一段时间，然后通过调用 `**PalmSystem.activate()`** 方法进入前台。有关更多详细信息，请参阅 [App Lifecycle](../../02-开发指南/应用基础/应用生命周期管理.md)。

### iconColor

此属性为可选属性，类型为 String。指定应用磁贴的背景颜色。默认值为 `**white`**。

### requiredMemory

此属性为可选属性，类型为 Number。设置运行你的应用所需的最小内存量（以兆字节为单位）。该值不必与应用消耗的最大内存量相同。

### resolution

此属性为可选属性，类型为 String。指定应用图形显示的分辨率。webOS TV 不支持 web 应用的 UHD 分辨率。支持的分辨率如下：

- "1920x1080"（默认值）——FHD 分辨率
- "1280x720"——HD 分辨率

要获取图形显示的应用分辨率，请使用 `**window.innerWidth`** 和 `**window.innerHeight`** 属性。

### screenSaverProperties

此属性为可选属性。添加此属性以使用类型 2 或类型 3 屏保，它们会逐渐降低亮度并延长屏保的超时时间。有关如何确定使用哪种类型，请参阅 [How to Determine Which Type to Use](../../02-开发指南/系统功能/屏幕保护程序.md#how-to-determine-which-type-to-use)。

#### screenSaverProperties 对象

### **preferredType**

此属性为可选属性，类型为 Number。

- "2"——屏保超时时间延长至 30 分钟，并且屏幕显示（OSD）区域的亮度逐渐降低。有关更多详细信息，请参阅 [Type 2 Screensaver](../../02-开发指南/系统功能/屏幕保护程序.md#type-2-screensaver)。
- "3"——屏保超时时间延长至 30 分钟。如果使用此类型 3 屏保，你还必须将 `**useGallerymode`** 设置为 `**true`**。有关更多详细信息，请参阅 [Type 3 Screensaver](../../02-开发指南/系统功能/屏幕保护程序.md#type-3-screensaver)。

### splashBackground

此属性为可选属性，类型为 String。指定应用加载时显示的启动背景图像。路径必须相对于 appinfo.json 文件。图像文件必须为 PNG 格式的 1920 x 1080 分辨率。

### splashColor

此属性为可选属性，类型为 String。此属性仅适用于 StanbyME 机型。指定启动图像的背景颜色（RGB）。默认值为 `**gray`**。你可以通过指定十六进制（hex）值或 HTML 颜色名称来设置颜色。例如，以下值都是可接受的：`**#000000`** 和 `**black`**。

### splashFitModeOnPortrait

此属性为可选属性，类型为 String。此属性仅适用于 StanbyME 机型。指定启动图像在纵向模式下的适配模式。此属性仅在应用支持纵向模式时生效。

- "none"（默认值）——启动图像以其原始大小显示。
- "width"——调整启动图像的大小以适配屏幕宽度。

### supportPortraitMode

此属性为可选属性，类型为 String。此属性仅适用于 StanbyME 机型。指定你的应用是否支持纵向模式。

- "false"（默认值）——你的应用不支持纵向模式。
- "true"——你的应用支持纵向模式。启动图像会以 `**splashColor`** 属性设置的背景颜色显示。

### supportTouchMode

此属性为可选属性，类型为 String。此属性仅适用于 StanbyME 机型。指定如何处理触摸事件。

- "none"（默认值）——你的应用不处理触摸输入。
- "full"——你的应用处理触摸输入。你可以使用标准 web API 为触摸输入实现事件处理器。
- "virtual"——如果发生触摸事件，webOS TV 平台会将其作为键盘或鼠标事件发送给你的应用。

### transparent

此属性为可选属性，类型为 Boolean。设置应用背景的透明度。如果你未设置背景颜色或背景图像，则会显示系统背景（黑色）。

- false（默认值）——应用背景的透明度降低，系统背景以略带灰色显示。
- true ——系统背景清晰显示。

### useGalleryMode

注意

如果你将 [screenSaverProperties](appinfo.json应用元数据.md#screensaverproperties) 对象（[preferredType](appinfo.json应用元数据.md#preferredtype)）设置为 `3`，则**必须**将此属性设置为 `true`。

此属性为可选属性，类型为 Boolean。设置是否将画面设置更改为 Gallery 模式。对于画廊类型的应用，请将此属性设置为 `**true`**。

### virtualTouch

此属性为可选属性，类型为 `**virtualTouch`** 对象。此属性仅在 StanbyME 机型中将 `**supportTouchMode`** 属性设置为 `**virtual`** 时应用。设置触摸输入的细节值。该对象由用于将触摸输入转换为键盘或鼠标事件的详细阈值组成。

#### virtualTouch 对象

##### **verticalThreshold**

此属性为可选属性，类型为 Number。你可以设置触发纵向触摸和拖拽事件所需的阈值（10-100 px）。如果用户触摸屏幕并移动超过该阈值，则会被视为拖拽操作，并触发一个按键事件。也就是说，如果阈值设置得较小，即使是很短的滑动也会触发纵向（上、下）的按键事件。因此，阈值设置得越小，用户在相同长度下滑动屏幕时触发的按键事件就越多。

- 默认值为 40。
- 当小于 10 时，会设置为 10。
- 当大于 100 时，会设置为 100。

##### **horizontalThreshold**

此属性为可选属性，类型为 Number。你可以设置触发横向触摸和拖拽事件所需的阈值（10-100 px）。如果用户触摸屏幕并移动超过该阈值，则会被视为拖拽操作，并触发一个按键事件。也就是说，如果阈值设置得较小，即使是很短的滑动也会触发横向（左、右）的按键事件。因此，阈值设置得越小，用户在相同长度下滑动屏幕时触发的按键事件就越多。

- 默认值为 40。
- 当小于 10 时，会设置为 10。
- 当大于 100 时，会设置为 100。

##### **positionEventOnPress**

此属性为可选属性，类型为 Boolean。你可以设置是否将触摸按下（短于 200ms）事件作为鼠标位置事件发送。

- false（默认值）——触摸按下事件不会发送给你的应用，但触摸释放事件会作为按键或鼠标事件发送给你的应用。
- true ——触摸按下事件会作为鼠标位置事件发送给你的应用，触摸释放事件会作为按键或鼠标事件发送给你的应用。

##### **shortTouchThreshold**

此属性为可选属性，类型为 Number。你可以设置被识别为短触摸（类似于点击）的点击阈值（10-50 px）。如果拖拽距离小于 shortTouchThreshold 值，则被视为一次点击。滑动距离超过 shortTouchThreshold 值则不会将点击事件发送给你的应用。

- 默认值为 10。
- 当小于 10 时，会设置为 10。
- 当大于 50 时，会设置为 50。

### accessibility

此属性为可选属性，类型为 `**accessibility`** 对象。此对象用于支持辅助功能。

#### accessibility 对象

##### **supportsAudioGuidance**

此属性为可选属性，类型为 Boolean。你可以设置你的应用是否支持语音引导。

- false（默认值）——你的应用不支持语音引导。
- true ——你的应用支持语音引导。

注意

要支持语音引导，你的应用应使用 ARIA 标签。它受 webOS TV 3.0 或更高版本支持，但在 webOS TV 3.x 上并未得到完全支持。有关 ARIA 的更多信息，请参阅 [https://www.w3.org/TR/wai-aria/](https://www.w3.org/TR/wai-aria/)。