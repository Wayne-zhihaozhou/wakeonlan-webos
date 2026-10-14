# Simulator 开发者指南
> 原文链接: https://webostv.developer.lge.com/develop/tools/simulator-dev-guide ｜ 简体中文翻译

本指南将向你展示如何在 webOS TV Simulator 上测试和控制应用与服务。

## 应用开发

本节说明如何在 Simulator 上控制你的应用。

### 启动应用

启动应用有三种方式。

#### 在菜单栏上选择 'Launch App' 或按 RCU 上的 'App'

1. 在菜单栏上选择 **File** > **Launch App**，或点击 RCU 底部的 **App**。
2. 选择应用的根目录并点击 **OK**。根目录必须是 *appinfo.json* 所在的目录。

#### 使用 CLI 命令 'ares-launch'

在终端上执行以下命令。

```shell
ares-launch -s VERSION /APP/DIR/PATH
```

```shell
// example

ares-launch -s 23 /home/user/myApp
```

- 路径可以是相对路径，也可以是绝对路径。
- VERSION 是 webOS TV 的版本。例如，对于 webOS TV 23 Simulator，它就是 23。

如果安装了多个与指定 webOS TV 版本对应的 Simulator，将运行最新版本的 Simulator 并启动应用。

#### 点击主屏幕上的应用图标或从应用列表中选择应用

应用一旦启动，其图标就会被添加到主屏幕和应用列表中。点击主屏幕上的应用图标，或在应用列表窗口中选择该应用，即可启动该应用。

### 调试应用

应用运行时，Web Inspector 会自动启动，因此你可以用它来调试应用。

![Simulator 检查器的截图](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275150/webOS-TV/images/docs/tools/Simulator_Inspector_yamsab.webp)

#### 自动重新加载

你修改并保存代码后，应用会立即自动重新加载，因此你可以马上查看所做修改的结果。

### 关闭应用

你可以通过以下任一方式关闭应用：

- 在菜单栏上选择 **File** > **Close App**，或者
- 点击 RCU 底部的 **Close**

### 移除应用

要将应用从主屏幕和应用列表中移除，请右键点击主屏幕或应用列表中要移除的应用，然后选择 **Remove**。

## 服务开发

本节说明如何在 Simulator 上控制你的服务。

### 添加服务

重要

要添加的服务目录应位于用户主目录之下。

你可以在 Simulator 上添加 JS Service。

1. 在菜单栏上选择 **File** > **Add Service**，或点击 RCU 底部的 **Service**。
2. 选择要添加的服务的根目录并点击 **OK**。根目录必须是 *package.json* 所在的目录。
3. 在 **JS Service** 窗口中检查服务是否已成功添加。

### 启动或停止服务

你可以启动或停止已添加的服务。

1. 在菜单栏上选择 **Tools** > **Service List**。
2. 在 **JS Service** 窗口中点击要启动或停止的服务。

### 移除服务

你可以移除服务。

1. 在菜单栏上选择 **Tools** > **Service List**。
2. 在 **JS Service** 窗口中右键点击要移除的服务，然后选择 **Remove**。

## RCU

本节展示 RCU 的布局，并说明其按钮的功能。

### RCU 布局

![Simulator RCU 的截图](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1667291397/webOS-TV/images/docs/tools/webOS_TV_Simulator_RCU_with_media_keys_ceu3tk.webp)

### 按钮

#### 数字键、颜色键、方向键、OK 键、返回键和媒体键

这些按钮使用与真实 RCU 设备上按钮相同的按键代码。应用可以处理这些按键事件。

#### Home

如果应用正在运行时点击此 Home 按钮，屏幕会切回主屏幕。此时，应用会隐藏而不是终止，仍在后台运行。

#### 功能按钮

底部的功能按钮在真实 RCU 设备上并不存在。它们仅存在于 Simulator 上，以便于开发。

- **App**：启动应用（与菜单栏上的 **File** > **Launch App** 相同）
- **Service**：添加服务（与菜单栏上的 **File** > **Add Service** 相同）
- **Inspector**：打开或关闭应用的 Inspector
- **Close**：关闭应用（与菜单栏上的 **File** > **Close App** 相同）
- **Touch**：打开或关闭触控模式（与菜单栏上的 **Action** > **Touch Mode** 相同）
- **Portrait**：打开或关闭竖屏模式（与菜单栏上的 **Action** > **Orientation** > **landscape/portrait** 相同）

## 触控模式

本节展示如何打开触控模式以及支持哪些触控手势。

### 打开触控模式

你可以在菜单栏上或使用 RCU 底部的特殊键来打开触控模式。

- 在菜单栏上，选择 **Action**>**Touch Mode**。![webOS TV Simulator 触控模式菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653897959/webOS-TV/images/docs/tools/Simulator-enable-touch-mode-menu_dcujno.webp)
- 在 RCU 底部，点击 **Touch**。![webOS TV Simulator 触控模式 - 特殊键](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653897959/webOS-TV/images/docs/tools/Simulator-enable-touch-mode-special-key_cygvxo.webp)

### 支持的触控手势

如果启用了触控模式，用鼠标点击就相当于在屏幕上触控。

#### 基本手势

用鼠标点击时，会根据 *appinfo.json* 中 `supportTouchMode` 的值向应用传递不同的事件。也可以使用短触控（按住约 200ms 或更短的触控被视为短触控）。更多详细信息，请参见[触控屏幕](../../02-开发指南/型号特性/StanbyME触摸屏.md)。

#### 滑动

从窗口边缘滑动会触发特定操作，就如同在设备上滑动一样。

注意

从顶部向下滑动不会触发任何操作。

#### 触控遥控器

也可以使用触控遥控器。

![webOS TV Simulator 触控遥控器](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653897959/webOS-TV/images/docs/tools/Simulator-touch-remote_rg8dra.webp)

## 竖屏模式

本节展示如何打开竖屏模式，并说明其工作原理。

### 打开竖屏模式

你可以在菜单栏上或使用 RCU 底部的特殊键来打开竖屏模式。

- 在菜单栏上，选择 **Action** > **Orientation** > **portrait**。

![webOS TV Simulator 竖屏模式菜单](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653898730/webOS-TV/images/docs/tools/Simulator-enable-portrait-mode-menu_valvtb.webp)

- 在 RCU 底部，点击 **portrait**。

![webOS TV Simulator 竖屏模式特殊键](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1653898730/webOS-TV/images/docs/tools/Simulator-enable-portrait-mode-special-key_hfoqyo.webp)

注意

你无法在 RCU 上选择 **reversed_landscape** 和 **reversed_portrait**。请转到菜单栏使用这些模式。

### 工作原理

当竖屏模式打开时，

- `webOSSystem.screenOrientation` 会发生改变，并且
- 会触发一个 `screenOrientationChange` 事件。

注意

即使方向更改为竖屏，Simulator 自身的方向也不会改变。

如果应用使用 `webOSSystem.setWindowOrientation` 请求更改方向，实际应用布局的方向会发生改变。有关竖屏模式的更多详细信息，请参见[竖屏模式](../../02-开发指南/型号特性/StanbyME竖屏模式.md)。

## 屏幕保护

本节说明如何打开屏幕保护以及如何更改其超时延迟。

### 打开屏幕保护

你可以在菜单栏上打开屏幕保护。请注意，此处的打开是指启用屏幕保护功能，并不意味着立即显示屏幕保护图像。

- 在菜单栏上，选择 **Action** > **Screen Saver** > **Turn On**。

![打开 webOS TV Simulator 的屏幕保护](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1667293092/webOS-TV/images/docs/tools/webOS_TV_Simulator_screen_saver_turn_on_mxobew.webp)

### 更改超时延迟

你可以将等待时间设置为 **5s**、**10s**、**30s**、**2m** 或 **1h**。默认值为 **2m**。

- 在菜单栏上，选择 **Action** > **Screen Saver** > **Timeout delay** 并选择相应的值。

![更改 webOS TV Simulator 屏幕保护的等待时间](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1667293092/webOS-TV/images/docs/tools/webOS_TV_Simulator_screen_saver_timeout_delay_u4psop.webp)
