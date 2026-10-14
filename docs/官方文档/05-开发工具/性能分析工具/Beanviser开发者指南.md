# Beanviser 开发者指南
> 原文链接: https://webostv.developer.lge.com/develop/tools/beanviser-dev-guide ｜ 简体中文翻译

## 快速入门

以下是使用 Beanviser 测量应用性能所涉及任务的简要概述。![Beanviser 任务简要概述](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274642/webOS-TV/images/docs/tools/beanviser-gettingstarted_typlop.webp)

### 1. 环境准备

无需安装，只需将下载的文件解压到所需位置即可。有关下载说明，请参见 [Beanviser 安装](Beanviser安装.md)。

### 2. 启动 Beanviser

要测量应用性能，请启动 Beanviser。你也可以在此阶段之前启动 Beanviser；我们只是把这一步放在这里，让顺序看起来更自然。

| 操作系统 | 启动方法 |
| --- | --- |
| Linux | 1. 在 Linux 上打开终端，并进入到包含已解压 Beanviser 包的目录。<br>2. 在终端中输入<br>**beanviser.sh**<br>并按<br>**Enter**<br>启动 Beanviser。 |
| macOS | 1. 在 macOS 上打开终端，并进入到包含已解压 Beanviser 包的目录。<br>2. 在终端中输入<br>**beanviser.sh**<br>并按<br>**Enter**<br>启动 Beanviser。 |
| Windows | 在 Windows 上，你可以使用文件资源管理器或命令提示符。<br>**使用文件资源管理器：**<br>1. 在 Windows 上打开文件资源管理器，并进入到包含已解压 Beanviser 包的目录。<br>2. 双击<br>**beanviser.cmd**<br>以启动 Beanviser。<br>**使用命令提示符：**<br>1. 在 Windows 上打开命令提示符，并进入到包含已解压 Beanviser 包的目录。<br>2. 在命令提示符中输入<br>**beanviser.cmd**<br>并按<br>**Enter**<br>启动 Beanviser。 |

### 3. 将 Beanviser 连接到目标设备

要测量应用性能，请启动 Beanviser 并将 Beanviser 连接到你的目标设备。更多信息请参见 [连接到目标设备](Beanviser开发者指南.md#connecting-to-target-device)。

### 4. 测量应用性能

现在，你可以开始测量应用性能了。在相关选项卡上点击 **START** 按钮。

## 连接到目标设备

要在目标设备上使用 Beanviser，你必须先在 Beanviser 上添加目标设备，然后按以下步骤连接到该设备：

1. 启动 Beanviser。
2. 点击 **Configuration** 按钮 **(...)** 以获取可用设备列表。![Configuration 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274619/webOS-TV/images/docs/tools/beanviser-device-devicelist_nann6r.webp) 注意由于模拟器是用于测试的基础设备，Beanviser 默认会在其设备列表中包含该模拟器。如果你不小心从列表中删除了模拟器，请按照下面给出的步骤重新添加模拟器。注意如果你已经通过 IDE 或 [ares-setup-device](../命令行工具/webOSCLI开发者指南.md#ares-setup-device) 添加了目标设备，Beanviser 会自动显示已添加的目标设备。
3. 点击 **+** 按钮，并提供目标设备的以下详细信息：
  1. **Name** - 输入设备名称。请选择一个易于识别该设备的名称。
  2. **Host**
    - TV 设备：TV 设备的 IP 地址。
    - 模拟器：127.0.0.1
  3. **Port**
    - TV 设备：9922
    - 模拟器：6622
4. **Username** 注意你无需输入 **Password** 和 **PrivateKey**。使用真实 TV 时，请在连接目标设备之前启用 [开发者模式](../../01-快速入门/开发者模式应用.md#turning-developer-mode-on)。
  - TV 设备：prisoner
  - 模拟器：developer
5. 要连接到目标设备，请从设备列表中选择它并点击 **Connect** 按钮。![模拟器的设置项与 Connect 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274593/webOS-TV/images/docs/tools/beanviser-device-devicelist-connect_ir6c4l.webp)
6. 现在你可以测量应用的性能了。在相关选项卡上点击 **START** 按钮。

## 了解 Beanviser 用户界面

Beanviser 提供多个选项卡（在下图中标记为 Ⓑ），每个选项卡都提供特定 Beanviser 功能的可视化。通过用户界面了解 Beanviser 提供了哪些功能。

![突出显示主要组成部分的 Beanviser 截图](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274654/webOS-TV/images/docs/tools/beanviser-mainmenu-intro_bel60m.webp)

### 控制按钮

除 Compare System Logs 选项卡外，所有选项卡都提供这些按钮。这些按钮提供与性能测量相关的功能。

![Beanviser 的控制按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274787/webOS-TV/images/docs/tools/ControlButtons_wxv6gy.webp)

1. **START** - 开始测量目标性能指标。仅当 Beanviser 已连接到目标设备时，此按钮才可用。
2. **STOP** - 暂停或暂时停止测量。仅当测量已开始时，此按钮才可用。
3. **CLEAR** - 从选项卡中清除现有的可视化图表。仅当测量已停止且存在需要清除的图表时，此选项才可用。
4. **SAVE** - 将测量数据保存到你的计算机上。要保存数据，你必须先停止测量。数据保存在“[Beanviser 安装路径]/logs”目录中。日志文件名会标明时间戳和日志类型。
5. **IMPORT** - 从你的计算机导入已保存的日志文件并显示该日志。仅当 Beanviser 未连接到目标设备（TV 设备或模拟器）时，此功能才可用。
6. **HISTORY DATA** - 显示一小时以前的报告数据。你可以选择查看历史数据的总体趋势，也可以选择要查看报告的时间区间。从 Beanviser v1.5 起可用。
7. **LIVE MONITORING** - 显示一小时时长内的实时报告。从 Beanviser v1.5 起可用。

### 导航栏

使用导航栏可以浏览图表、放大某一区段以及缩小。以下截图显示了导航栏手柄从默认位置放大到某个时间范围的效果。移动手柄之前，图表显示的是 05:05:00 到 05:15:00 的数据。移动手柄之后，图表显示的是 05:09:30 到 05:10:50 的数据。换言之，图表已被放大。

![Beanviser 上导航栏的用法](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274678/webOS-TV/images/docs/tools/beanviser-navigationbar_wdrcnk.webp)

### 管理自定义视图

Beanviser 上使用的视图以 Web 应用类型制作，并且 Beanviser 允许使用自定义视图。你可以添加一个新视图，该视图由包含 HTML、JavaScript 和 CSS 文件的默认视图模板创建。

#### 创建新视图

要创建新视图：

1. 点击左上角的 Configuration 按钮 ![Configuration 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964470/webOS-TV/images/docs/tools/button_configuration.jpg)。随后会显示设备列表。
2. 点击左上角的 Main Menu 按钮 ![Main Menu 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964743/webOS-TV/images/docs/tools/button_mainmenu.jpg)。
3. 点击 **Manage Custom Views** 菜单。![Manage Custom Views 菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274726/webOS-TV/images/docs/tools/beanviser-select-managecustomviews_gygmoh.webp)
4. 输入该视图的详细信息（Name、Chart Type 和 Tab title）。
5. 点击 **ADD** 按钮。随后，添加的视图会列在下面的表格中。![Add Custom View 对话框上的详细项目与 Add 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274606/webOS-TV/images/docs/tools/beanviser-add-customview_fvfepz.webp)
6. 点击 **SAVE** 按钮。保存后，Beanviser 会重新启动，以反映 Tabs UI 的变更。
7. 会弹出一个对话框，询问是否重新启动以反映 Tabs UI 的变更。点击 **YES**。

新添加的视图会显示为一个新选项卡。你可以通过编辑相应视图的文件来自定义它。

#### 修改/移除视图

要修改或移除已添加的视图：

1. 点击左上角的 Configuration 按钮 ![Configuration 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964470/webOS-TV/images/docs/tools/button_configuration.jpg)。随后会显示设备列表。
2. 点击左上角的 Main Menu 按钮 ![Main Menu 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964743/webOS-TV/images/docs/tools/button_mainmenu.jpg)。
3. 点击 **Manage Custom Views** 菜单。![Manage Custom Views 菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274726/webOS-TV/images/docs/tools/beanviser-select-managecustomviews_gygmoh.webp)
4. 点击 Edit 或 Remove 按钮。
  - 如果点击 Edit 按钮，你可以更改选项卡标题或图表类型。
  - 如果点击 Remove 按钮，所选视图会从表格中移除。
5. 点击 SAVE 按钮。保存后，Beanviser 会重新启动，以反映 Tabs UI 的变更。![Add Custom Views 对话框上的 Edit、Remove、Save 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274666/webOS-TV/images/docs/tools/beanviser-modifydelete-customview_yyufdr.webp)
6. 会弹出一个对话框，询问是否重新启动以反映 Tabs UI 的变更。点击 **YES**。

#### 自定义视图

如上所述，Beanviser 会使用包含 HTML、JavaScirpt 和 CSS 文件的默认模板提供新视图。你可以在 **viewer/elements** 中找到所创建视图的相应文件。

| 文件 | 描述 |
| --- | --- |
| webos-[Specified Name].html | 布局文件，包含<br>[控制按钮](Beanviser开发者指南.md#control-buttons)<br>和图表区域。 |
| webos-[Specified Name].js | 包含用于绘制图表的源代码。 |
| webos-[Specified Name].css | 样式表文件。 |

此外，你还可以自定义 Beanviser service（一种 JavaScript Service），它运行在 webOS TV 上并向 Beanviser 提供监控数据。如果你自定义了 Beanviser service，则需要重新打包 Beanviser service 才能应用它。请参见 [重新打包 Beanviser Service](Beanviser开发者指南.md#repackaging-beanviser-service)

### 开始后台日志记录

Beanviser 不仅在连接到目标设备时实时工作，还会启动后台日志记录。目标设备会在指定时长内收集日志。后台日志记录完成后，你可以[从目标设备获取所收集的日志](Beanviser开发者指南.md#getting-log-from-target)。

要开始后台日志记录：

1. 将 [Beanviser 连接](Beanviser开发者指南.md#connecting-to-target-device)到目标设备。
2. 点击左上角的 Configuration 按钮 ![Configuration 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964470/webOS-TV/images/docs/tools/button_configuration.jpg)。随后会显示设备列表。
3. 点击左上角的 Main Menu 按钮 ![Main Menu 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964743/webOS-TV/images/docs/tools/button_mainmenu.jpg)。
4. 点击 **Start Logging** 菜单。![Start Logging 菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274763/webOS-TV/images/docs/tools/beanviser-select-startlogging_hlifk6.webp)
5. 输入日志记录的时长（秒）。
6. 然后点击 **START** 按钮。![Log duration 对话框上的时间输入框与 START 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274630/webOS-TV/images/docs/tools/beanviser-enter-logduration_vvo8m7.webp)

### 从目标设备获取日志

后台日志记录完成后，你可以将日志文件从目标设备获取到本地存储（[Beanviser 安装路径]/logs）。

要从目标设备获取日志文件：

1. 将 [Beanviser 连接](Beanviser开发者指南.md#connecting-to-target-device)到目标设备。
2. 点击左上角的 Configuration 按钮 ![Configuration 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964470/webOS-TV/images/docs/tools/button_configuration.jpg)。随后会显示设备列表。
3. 点击左上角的 Main Menu 按钮 ![Main Menu 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964743/webOS-TV/images/docs/tools/button_mainmenu.jpg)。
4. 点击 **Get Log from Target** 菜单。随后会显示 Info 对话框，向你展示日志文件所在位置。![Get Log from Target 菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274714/webOS-TV/images/docs/tools/beanviser-select-getlogfromtarget_nzpnko.webp)

### 重新打包 Beanviser service

Beanviser server 是一项面向 webOS TV 的 JavaScript service，它与 Beanviser 通信以传输监控数据。当 Beanviser 连接到目标设备时，Beanviser service 会随一个 dummy 应用自动安装。如果你修改了 Beanviser service，则应重新打包该 dummy 应用并重新安装 Beanviser service，以应用你的修改。

要更新 Beanviser service：

1. 将 [Beanviser 连接](Beanviser开发者指南.md#connecting-to-target-device)到目标设备。
2. 点击左上角的 Configuration 按钮 ![Configuration 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964470/webOS-TV/images/docs/tools/button_configuration.jpg)。随后会显示设备列表。
3. 点击左上角的 Main Menu 按钮 ![Main Menu 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964743/webOS-TV/images/docs/tools/button_mainmenu.jpg)。
4. 点击 **(Re)Package** 菜单。随后，Beanviser 会在几秒内显示成功消息。![(Re)Package 菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274739/webOS-TV/images/docs/tools/beanviser-select-repackage_kg2fpl.webp)

### 卸载 Beanviser service

在你**断开 Beanviser 与目标设备的连接**后，你可以从所选目标设备中移除 Beanviser service。请参见以下步骤：

1. 选择要卸载 Beanviser service 的目标设备。
2. 点击左上角的 Configuration 按钮 ![Configuration 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964470/webOS-TV/images/docs/tools/button_configuration.jpg)。随后会显示设备列表。
3. 点击左上角的 Main Menu 按钮 ![Main Menu 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964743/webOS-TV/images/docs/tools/button_mainmenu.jpg)。
4. 点击 **Uninstall** 菜单。随后，Beanviser 会在几秒内显示成功消息。![Uninstall 菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274775/webOS-TV/images/docs/tools/beanviser-select-uninstall_pc2jvq.webp)

### 重新排序视图

你可以在 Beanviser UI 中自定义选项卡的顺序和可见性。要自定义选项卡：

1. 点击左上角的 Configuration 按钮 ![Configuration 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964470/webOS-TV/images/docs/tools/button_configuration.jpg)。随后会显示设备列表。
2. 点击左上角的 Main Menu 按钮 ![Main Menu 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964743/webOS-TV/images/docs/tools/button_mainmenu.jpg)。
3. 选择 Favorite Views 菜单。![Favorite Views 菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274751/webOS-TV/images/docs/tools/beanviser-select-reorderviews_ysmug0.webp) 随后会显示收藏视图自定义表格，如下所示。![Re-order/hide Views 对话框上的复选框](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274690/webOS-TV/images/docs/tools/beanviser-reorder-views_hk7uxb.webp)
4. 要更改选项卡的可见性，请使用复选框。
5. 要更改选项卡的顺序，请使用箭头按钮。

### 清除所有视图

无论 Beanviser 是否连接到设备，你都可以清除所有选项卡中的图表。要清除所有图表：

1. 点击左上角的 Configuration 按钮 ![Configuration 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964470/webOS-TV/images/docs/tools/button_configuration.jpg)。随后会显示设备列表。
2. 点击左上角的 Main Menu 按钮 ![Main Menu 按钮](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653964743/webOS-TV/images/docs/tools/button_mainmenu.jpg)。
3. 选择 Clear All Views 菜单。随后，每个选项卡上的图表都会被清除。![Clear All Views 菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274702/webOS-TV/images/docs/tools/beanviser-select-clearallviews_triotv.webp)
