# StanbyME 竖屏模式（Portrait Mode）
> 原文链接: https://webostv.developer.lge.com/develop/guides/stanbyme-portrait-mode ｜ 简体中文翻译

对于 StanbyME 型号，您可以让应用以竖屏模式显示。本指南将介绍如何设计并实现应用，使其支持 StanbyME 型号的竖屏模式。

![竖屏支持](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914917/webOS-TV/images/docs/guides/portrait-support_i30tyw.png)

在以下两种情况下，您的应用可能需要更改其 UI 以适配竖屏模式：

- 当用户在电视的竖屏模式下运行您的应用时
- 当应用正在运行时，用户将电视切换到竖屏模式时

> **注意**
>
> 默认情况下，即使电视设备被旋转，您的应用方向仍将保持为横屏模式，这意味着用户会看到旋转了 90 度的显示画面。详情请参阅[不支持竖屏模式](StanbyME竖屏模式.md#not-supporting-portrait-mode)。

如果您认为您的应用不适合竖屏模式，您可以禁用在竖屏模式下运行您的应用。详情请参阅[在竖屏模式下禁用您的应用](StanbyME竖屏模式.md#disabling-your-app-in-portrait-mode)。

以下是使您的应用支持竖屏模式需要遵循的步骤：

1. [在 appinfo.json 文件中设置属性。](StanbyME竖屏模式.md#setting-property-in-your-app)
2. [检查电视设备是否为 StanbyME 型号](StanbyME竖屏模式.md#checking-stanbyme-model)。
3. [在应用启动期间检查屏幕方向](StanbyME竖屏模式.md#checking-screen-orientation-during-app-launch)。
4. [如果方向发生变化则更改应用布局](StanbyME竖屏模式.md#changing-app-layout-by-screen-rotation)。

## 在您的应用中设置属性

要使您的应用支持竖屏模式，请在应用的 _appinfo.json_ 文件中插入 [supportPortraitMode](../../03-API参考/配置文件/appinfo.json应用元数据.md#supportportraitmode) 属性并将其设置为 `true`。您还可以设置启动画面（splash image）的背景颜色和适配模式。关于启动画面的更多信息，请参阅 [splashColor](../../03-API参考/配置文件/appinfo.json应用元数据.md#splashcolor) 属性和 [splashFitModeOnPortrait](../../03-API参考/配置文件/appinfo.json应用元数据.md#splashfitmodeonportrait) 属性。

## 检查 StanbyME 型号

要区分电视是否为 StanbyME 型号，请检查 `**webOSSystem.screenOrientation**` 属性或 `**webOSSystem.currentOrientation**` 属性的值。

- **`webOSSystem.screenOrientation`**：返回实际电视设备的屏幕方向。当用户更改实际设备（TV）的屏幕方向时，该值会随之改变。
- **`webOSSystem.currentOrientation`**：返回 Web 应用的窗口方向。当通过调用 webOSSystem.setWindowOrientation API 设置了窗口的屏幕旋转时，该值会随之改变。

下表对 `**webOSSystem.screenOrientation**` 和 `**webOSSystem.currentOrientation**` 进行了比较。

| 说明 | webOSSystem.screenOrientation | webOSSystem.currentOrientation |
| --- | --- | --- |
| 描述 | 返回实际电视设备的屏幕方向。 | 返回 Web 应用的窗口方向。 |
| 可旋转电视中的属性值 | <ul><li>"landscape"：顺时针旋转 0°</li><li>"portrait"：顺时针旋转 90°</li><li>"reversed_landscape"：顺时针旋转 180°</li><li>"reversed_portrait"：顺时针旋转 270°</li></ul> | |
| 非旋转电视中的属性值 | "up" | undefined |

以下示例展示了如何通过检查 `**webOSSystem.currentOrientation**` 属性来确定电视是否为可旋转型号。

```javascript
if (webOSSystem.currentOrientation === undefined) {
  //  此设备不是可旋转的 webOS TV
} else {
  //  此设备是可旋转的 webOS TV
}
```

### 在应用启动期间检查屏幕方向

如果在您的应用启动过程中，`**screenOrientationChange**` 事件在事件处理程序被添加之前就已触发，那么布局旋转可能不会应用到您的应用上。为避免此问题，您应该在应用启动期间使用 `**webOSSystem.screenOrientation**` 属性来检查电视屏幕的旋转情况。

该 API 的属性值与 `**screenOrientationChange**` 事件相同。

- "landscape"：顺时针旋转 0°
- "portrait"：顺时针旋转 90°
- "reversed_landscape"：顺时针旋转 180°
- "reversed_portrait"：顺时针旋转 270°

```javascript
var orientation = webOSSystem.screenOrientation;
if (orientation === 'landscape' || orientation === 'reversed_landscape') {
  // 加载横向布局
} else if (orientation === 'portrait' || orientation === 'reversed_portrait') {
  // 加载纵向布局
} else {
  // 加载默认布局
}
```

> **注意**
>
> 当将布局设置为竖屏模式时，您应该调整内容（如图像和视频）的宽度，使其适配屏幕的纵向长度。例如，如果您的应用分辨率为 1920x1080px，那么在竖屏模式下，您的内容宽度不应超过 1080px。

### 通过屏幕旋转更改应用布局

在横向与纵向屏幕之间更改应用布局的场景如下：

1. 当电视屏幕被旋转时，应用会通过 **`screenOrientationChange`** 事件处理程序接收方向信息。
2. 应用通过调用 webOSSystem.setWindowOrientation API，请求 Web 引擎设置应用的窗口方向。
3. Web 引擎旋转窗口，并触发窗口调整大小（resize）事件。
4. 当应用接收到窗口调整大小事件时，应用会更改其布局。

以下示例展示了如何在 StanbyME 型号上实现应用竖屏模式的骨架代码。

```javascript
// 步骤 1：处理 screenOrientationChange 事件
document.addEventListener('screenOrientationChange', function (event) {
  console.log('handleScreenOrientationChange', event.screenOrientation);
  // 步骤 2：调用 webOSSystem.setWindowOrientation API
  webOSSystem.setWindowOrientation(event.screenOrientation);
});

// 步骤 3：处理窗口调整大小事件
window.onresize = function () {
  console.log(
    'width x height : ' + window.innerWidth + ' x ' + window.innerHeight
  );
  // 更改应用布局
};
```

#### 步骤 1：处理 screenOrientationChange 事件

当电视的方向发生变化时，会触发 `**screenOrientationChange**` 事件。您应该添加一个事件处理程序，让您的应用接收到以下 event.screenOrientation 属性值：

- "landscape"：顺时针旋转 0°
- "portrait"：顺时针旋转 90°
- "reversed_landscape"：顺时针旋转 180°
- "reversed_portrait"：顺时针旋转 270°

#### 步骤 2：调用 webOSSystem.setWindowOrientation API

当事件处理程序接收到 `**screenOrientationChange**` 事件时，您应该调用 webOSSystem.setWindowOrientation API，请求 Web 引擎重新设置窗口的方向。

请注意，在您调用 webOSSystem.setWindowOrientation API 之后，可能会触发窗口调整大小事件。

#### 步骤 3：处理窗口调整大小事件

要根据方向更改应用的布局，您应该注册 resize（调整大小）事件处理程序。当触发 resize 事件时，您应该更改应用的布局。

关于窗口调整大小事件的更多信息，请参阅 [Window: resize event](https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event)。

> **注意**
>
> 由于用户可能在您的应用位于后台时旋转屏幕，因此您应该为 focus（聚焦）事件注册一个监听器，并调用 setWindowOrientation API。

示例：

```javascript
// 处理 focus 事件，以便在应用切换后重新调用 webOSSystem.setWindowOrientation API

document.addEventListener("focus", function() {
    webOSSystem.setWindowOrientation(webOSSystem.screenOrientation);
});
```

## 不支持竖屏模式

![不支持竖屏](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914920/webOS-TV/images/docs/guides/portrait-not-support_kjh0fx.png)

如果您不更改配置，那么即使电视设备旋转到横屏模式，您的应用也会在横屏模式下运行。这意味着用户会像图片中那样看到旋转了 90 度的显示画面。

## 在竖屏模式下禁用您的应用

![禁用竖屏](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914916/webOS-TV/images/docs/guides/portrait-disable_oswsmd.png)

如果您认为您的应用不适合竖屏模式，您可以在竖屏模式下禁用您的应用。您的应用将不会在竖屏模式下运行，并且会弹出 toast 提示，说明您的应用不支持竖屏模式。

### 在您的应用中设置属性

要在竖屏模式下禁用您的应用，请在应用的 _appinfo.json_ 文件中插入 [closeOnRotation](../../03-API参考/配置文件/appinfo.json应用元数据.md#closeonrotation) 属性并将其设置为 `**true**`。
