# webOSTV.js webOSDev API
> 原文链接: https://webostv.developer.lge.com/develop/references/webostvjs-webosdev ｜ 简体中文翻译

# webOSDev API

webOSDev API 提供了用于设备信息、数字版权管理（DRM）以及应用启动的方法。

webOSDev API 的大多数方法都是新增的，尤其是针对 webOS TV 而新增的。

方法

| 类型 | 名称 | 说明 |
| --- | --- | --- |
| 成员 | [APP](#app) | 保存用于表示 webOS TV 上已打开的内置应用列表的属性。 |
| | [DRM](#drm) | 保存用于表示 DRM 错误编号和 DRM 类型的属性。 |
| 方法 | [drmAgent](#drmagent) | 返回特定 DRM 类型的 DRMAgent 实例。 |
| | [launch](#launch) | 使用参数启动一个应用。 |
| | [launchParams](#launchparams) | 在调用 webOS.launch 之后、应用被启动时传递参数。 |
| | [LGUDID](#lgudid) | 返回由 webOS TV 提供的设备 ID（LGUDID），自 webOS TV 3.0 起可用。 |
| | [connection.getStatus](#connectiongetstatus) | 返回网络连接状态。 |

## APP

说明

一个成员，用于表示 webOS TV 上向外部开发者开放的内置应用列表。

属性

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| BROWSER | String | webOS TV 上的内置浏览器 |

示例

```javascript
// You can launch webOS browser application.
webOSDev.launch({
  id: webOSDev.APP.BROWSER,
  params: {
    target: 'http://www.your-web-page.com', // target should be
  },
  onSuccess(res) {
    // do something
  },
  onFailure(res) {
    // handle error
  },
});
```

另请参阅

-   无

## DRM

说明

一个对象，包含用于表示 DRM 错误编号和 DRM 类型的属性。

属性

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| Error | DRMError | 来自 DRM 服务的错误编号 |
| Type | DRMType | DRM 的类型 |

另请参阅

-   无

## drmAgent

说明

返回特定 DRM 类型的 DRMAgent 实例。

关于 DRMAgent 的更多详细信息，请参阅 [DRMAgent](../DRM与安全/webOSTV.jsDRMAgent指南.md)。

参数

| 名称 | 类型 | 说明 | 必填 |
| --- | --- | --- | --- |
| type | String | 要设置到 DRMAgent 实例的 DRM 类型<br><br>**属性**<br><br>\| 名称 \| 类型 \| 说明 \|<br>\| --- \| --- \| --- \|<br>\| PLAYREADY \| String \| PlayReady \| | 是 |

返回值

返回 DRMAgent 的实例。

示例

```javascript
var drmagent;
drmagent = webOSDev.drmAgent(webOSDev.DRM.Type.PLAYREADY);
```

另请参阅

-   无

## launch

说明

使用参数启动一个应用。

参数

| 名称 | 类型 | 说明 | 必填 |
| --- | --- | --- | --- |
| parameters | Object | 包含应用 ID、参数、回调处理程序的 JSON 对象<br><br>**属性**<br><br>\| 名称 \| 类型 \| 说明 \|<br>\| --- \| --- \| --- \|<br>\| id  \| String \| 应用 ID 或 webOSDev.APP \|<br>\| params \| Object \| 启动应用时要传递的 JSON 数据对象 \|<br>\| onSuccess \| Function \| 方法成功时调用的回调函数。 \|<br>\| onFailure \| Function \| 方法失败时调用的回调函数。 \| | 是 |

成功回调返回值

无

失败回调返回值

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| error | Object | 包含 DRM 服务错误详情的 JSON 对象。<br><br>**属性**<br><br>\| 名称 \| 类型 \| 说明 \|<br>\| --- \| --- \| --- \|<br>\| errorCode \| String \| 方法失败时返回的错误代码。 \|<br>\| errorText \| String \| 方法失败时返回的错误文本。 \| |

返回值

返回 undefined。

示例

```javascript
// Calls the launch application 'B' in 'A'
webOSDev.launch({
  id: 'your.app.B',
  params: {
    userId: 'user',
    page: 'shown page',
  },
  onSuccess: function (res) {
    // do something
  },
  onFailure: function (res) {
    // error
  },
});

// 'B' receives parameters that are passed by the application 'A'
document.addEventListener('webOSLaunch', function (data) {
  console.log(data.detail.userId + ', ' + data.detail.page);
});

document.addEventListener('webOSRelaunch', function (data) {
  console.log(data.detail.userId + ', ' + data.detail.page);
});

var params = webOSDev.launchParams();
if (params.userId === 'user') {
  console.log(params.userId + ' wants to access to ' + params.page);
}
```

另请参阅

-   [launchParams](#launchparams)

## launchParams

说明

传递由 webOSDev.lauch 方法启动的应用的参数。

注意

这些参数通常会在 webOSLaunch 事件或 webOSRelaunch 事件发生时被传递。当这些事件不发生（而你又需要从别处获取参数）时，可以使用本方法获取参数。

参数

无

返回值

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| params | Object | 传递给应用的参数 |

示例

```javascript
var params = webOSDev.launchParams();
if (params) {
  console.log(params.userId + ' wants to access to page ' + params.page);
}
```

另请参阅

-   [launch](#launch)

## LGUDID

说明

返回由 webOS TV 提供的设备 ID，自 webOS TV 3.0 起可用。

参数

| 名称 | 类型 | 说明 | 必填 |
| --- | --- | --- | --- |
| parameters | Object | JSON 对象<br><br>**属性**<br><br>\| 名称 \| 类型 \| 说明 \|<br>\| --- \| --- \| --- \|<br>\| onSuccess \| Function \| 方法成功时调用的回调函数。 \|<br>\| onFailure \| Function \| 方法失败时调用的回调函数。 \| | 是 |

成功回调返回值

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| info | Object | 包含设备 ID 的 JSON 对象。<br><br>**属性**<br><br>\| 名称 \| 类型 \| 说明 \|<br>\| --- \| --- \| --- \|<br>\| id  \| String \| LG 唯一设备 ID。 \| |

失败回调返回值

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| info | Object | 包含 UDID 错误详情的 JSON 对象。<br><br>**属性**<br><br>\| 名称 \| 类型 \| 说明 \|<br>\| --- \| --- \| --- \|<br>\| errorCode \| String \| 方法失败时返回的错误代码。 \|<br>\| errorText \| String \| 方法失败时返回的错误文本。 \| |

返回值

返回 undefined。

示例

```javascript
webOSDev.LGUDID({
  onSuccess: function (res) {
    // user device from server
    if (res.id === user.device) {
      // do something
    }
  },
  onFailure: function (res) {
    // API calling error
  },
});
```

另请参阅

-   无

## connection.getStatus

说明

返回网络连接状态。

参数

| 名称 | 类型 | 说明 | 必填 |
| --- | --- | --- | --- |
| parameters | Object | 包含处理程序的 JSON 对象<br><br>**属性**<br><br>\| 名称 \| 类型 \| 说明 \| 必填 \|<br>\| --- \| --- \| --- \| --- \|<br>\| onSuccess \| Function \| 方法成功时调用的回调函数。 \| 是 \|<br>\| onFailure \| Function \| 方法失败时调用的回调函数。 \| 是 \|<br>\| subscribe \| Boolean \| 指示是否订阅网络连接状态。<ul><li>true：订阅网络连接状态。</li><li>false：不订阅网络连接状态。</li></ul> \| 是 \| |

成功回调返回值

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| response | Object | 包含与网络连接相关的服务响应数据的 JSON 对象。<br><br>**属性**<br><br>\| 名称 \| 类型 \| 说明 \|<br>\| --- \| --- \| --- \|<br>\| isInternetConnectionAvailable \| Boolean \| 指示互联网连接是否可用。<ul><li>true：互联网连接可用。</li><li>false：互联网连接不可用。</li></ul> \|<br>\| wired \| Object \| 包含有线连接状态信息的对象。<br>更多详细信息，请参阅 <a href="/develop/references/connection-manager#wired">wired</a> 对象。 \|<br>\| wifi \| Object \| 包含 WiFi 连接状态信息的对象。<br>更多详细信息，请参阅 <a href="/develop/references/connection-manager#wifi">wifi</a> 对象。 \|<br>\| wifiDirect \| Object \| 包含 WiFi 直连状态信息的对象。<br>更多详细信息，请参阅 <a href="/develop/references/connection-manager#wifiDirect">wifiDirect</a> 对象。 \| |

失败回调返回值

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| info | Object | 包含错误详情的 JSON 对象。<br><br>**属性**<br><br>\| 名称 \| 类型 \| 说明 \|<br>\| --- \| --- \| --- \|<br>\| errorCode \| String \| 方法失败时返回的错误代码。 \|<br>\| errorText \| String \| 方法失败时返回的错误文本。 \| |

返回值

返回 undefined。

示例

```javascript
webOSDev.connection.getStatus({
  onSuccess: function (res) {
    if (res.isInternetConnectionAvailable === false) {
      // pop up network error message
    } else {
      if (res.wired) {
        // do something
      } else if (res.wifi) {
        // do something
      }
    }
  },
  onFailure: function (res) {
    // API calling error
  },
  subscribe: true,
});
```

另请参阅

-   无
