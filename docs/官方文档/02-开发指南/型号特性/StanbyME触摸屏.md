# StanbyME 上的触摸屏
> 原文链接: https://webostv.developer.lge.com/develop/guides/stanbyme-touch-screen ｜ 简体中文翻译

对于 StanbyME 型号，我们提供触摸屏界面来控制设备。根据你希望应用如何处理触摸屏输入和触摸事件，你可以在 `_appinfo.json_` 文件中指定 [supportTouchMode](../../03-API参考/配置文件/appinfo.json应用元数据.md#supporttouchmode) 属性，如下所示：

- [让应用完全支持触摸屏输入和触摸事件，请将其设置为 `"full"`](#fully-supporting-touch-screen-inputs-and-touch-events)
- [让应用将触摸屏输入作为按键事件处理，请将其设置为 `"virtual"`](#handling-touch-screen-inputs-as-key-events)
- [让应用不允许触摸屏输入，请将其设置为 `"none"`](#not-allowing-touch-screen-inputs)

## 完全支持触摸屏输入和触摸事件

如果你希望应用支持触摸屏输入并将其作为触摸事件处理，请将 **supportTouchMode** 属性设置为 **full**。当用户触摸屏幕时，触摸事件会传递给你的应用。你可以使用标准 Web API 实现各种触摸事件处理程序。关于触摸事件的更多信息，请参阅 [MDN Touch events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)。

请注意，以下两种触摸事件之一会触发 [Touch Remote 界面](StanbyME概述.md#touch-remote-interface)，具体使用哪一种由用户设定。因此，你不需要在应用中处理这两个事件。

- 多点触控：在任意位置用 3 根或更多手指触摸
- 边缘手势：从屏幕右边缘向左拖动

## 将触摸屏输入作为按键事件处理

如果你希望应用支持触摸屏输入，但将其作为键盘和鼠标事件（而非触摸事件）处理，请将 **supportTouchMode** 属性设置为 **virtual**。我们称此设置为虚拟触摸模式。当用户触摸屏幕时，键盘和鼠标事件会传递给你的应用。

如果你已经在 LG Apps 上发布了应用，你可以使用这种虚拟触摸模式，在保留现有键盘和鼠标事件处理程序的同时，控制 StanbyME 型号上的触摸屏。让我们看看具体的运行方式。

- 当用户在屏幕上短时间触摸按钮时，会发生鼠标点击事件。关于鼠标点击事件的更多信息，请参阅 [MDN Click event](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event)。
- 当用户从右向左滑动屏幕时，会发生左方向键事件，并且屏幕会向左滚动。关于键盘事件的更多信息，请参阅 [MDN KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)。
- 长按的超时时间为 0.2 秒。

你还可以针对虚拟触摸模式详细设置阈值和事件选项。更多信息请参阅 `_appinfo.json_` 文件中的 [virtualTouch](../../03-API参考/配置文件/appinfo.json应用元数据.md#virtualtouch) 属性。

## 不允许触摸屏输入

如果你不希望应用支持触摸屏输入，请将 **supportTouchMode** 属性设置为 **none**，这是默认值。如果用户触摸屏幕，将不会向你的应用传递任何事件。在这种情况下，用户只能使用遥控器或 Touch Remote 上的四向方向键来控制应用。

> **注意**
>
> 如果 **supportTouchMode** 属性设置为 **none**，用户触摸屏幕将触发 Touch Remote 界面。
