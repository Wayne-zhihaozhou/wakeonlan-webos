# webOS 事件
> 原文链接: https://webostv.developer.lge.com/develop/references/webos-event ｜ 简体中文翻译

webOS 事件允许 Web 应用针对特定情况注册不同的事件处理器（event handler）。事件通常与函数结合使用，在事件发生之前，该函数不会被执行。

| 事件 | 描述 |
| --- | --- |
| [webOSLaunch](#weboslaunch) | 当应用被启动时触发此事件。 |
| [webOSRelaunch](#webosrelaunch) | 当应用的状态从后台状态切换到前台状态之前触发此事件。 |
| [webOSLocaleChange](#weboslocalechange) | 当语言在设置（Settings）中被更改时触发此事件。 |
| [webOSMouse](#webosmouse) | 根据 LG Magic Remote 的指针光标是否聚焦在应用上触发此事件。 |
| [keyboardStateChange](#keyboardstatechange) | 当虚拟键盘的可见状态发生更改时触发此事件。 |
| [cursorStateChange](#cursorstatechange) | 当 [LG Magic Remote](https://webostv.developer.lge.com/develop/guides/magic-remote) 的指针光标的可见状态发生更改时触发此事件。 |

## webOSLaunch

描述

当应用被启动时触发此事件。当正在运行的应用的 HTML 文档加载完成后立即触发的 DOMContentLoaded 事件结束时，此事件会被传送给该应用。

示例

```javascript
document.addEventListener('webOSLaunch', function()
{
  // 执行某些操作
}
)
```

另请参阅

[应用生命周期管理](../../02-开发指南/应用基础/应用生命周期管理.md#handle-app-launch)

## webOSRelaunch

描述

当应用的状态从后台状态切换到前台状态之前触发此事件。

示例

```javascript
document.addEventListener('webOSRelaunch', function()
{
  // 执行某些操作
}
)
```

另请参阅

[应用生命周期](https://webostv.developer.lge.com/develop/guides/app-lifecycle#HandlingAppRelaunch)

## webOSLocaleChange

描述

当语言在设置（Settings）中被更改时触发此事件。

示例

```javascript
document.addEventListener('webOSLocaleChange', function(){' '}
{
  // 执行某些操作，例如重新加载重定向 URL
}
)
```

## webOSMouse

描述

根据 LG Magic Remote 的指针光标是否聚焦在应用上触发此事件。此事件与 HTML5 的 mouseenter 事件和 mouseleave 事件类似。

示例

```javascript
document.addEventListener('webOSMouse', function(event) {
    var mouse = event.detail.type;
    if (mouse === 'Enter') {
        // 执行某些操作
    } else if ( mouse === 'Leave') {
        // 执行某些操作
    }
})
```

属性

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| detail | Object | 包含事件信息的对象 |

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| type | String | - Enter：指针光标进入应用区域。<br>- Leave：指针光标离开应用区域，可能是因为应用切换到了后台状态，或者光标聚焦到了覆盖层应用（overlay app）或弹出提示（popup toast）上。 |

## keyboardStateChange

描述

当[虚拟键盘](https://webostv.developer.lge.com/develop/guides/virtual-keyboard)的可见状态发生更改时触发此事件。可见状态的更改取决于虚拟键盘是被激活还是被停用。虚拟键盘通常在输入元素获得焦点时被激活。

示例

```javascript
document.addEventListener('keyboardStateChange', function(event) {
    if (event.detail && event.detail.visibility) {
         // 执行某些操作
     } else {
         // 执行某些操作
     }
})
```

属性

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| detail | Object | 包含事件信息的对象 |

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| visibility | Boolean | - true：虚拟键盘已出现。<br>- false：虚拟键盘已消失。 |

另请参阅

[系统 UI 可见性](../../02-开发指南/系统功能/系统UI可见性.md#visibility-of-the-virtual-keyboard)

## cursorStateChange

描述

当 [LG Magic Remote](https://webostv.developer.lge.com/develop/guides/magic-remote) 的指针光标的可见状态发生更改时触发此事件。

示例

```javascript
document.addEventListener('cursorStateChange', function(event) {
    if (event.detail && event.detail.visibility) {
        // 执行某些操作
    } else {
        // 执行某些操作
    }
})
```

属性

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| detail | Object | 包含事件信息的对象 |

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| visibility | Boolean | - true：指针光标已出现。<br>- false：指针光标已消失。 |

另请参阅

[系统 UI 可见性](../../02-开发指南/系统功能/系统UI可见性.md#visibility-of-the-cursor)
