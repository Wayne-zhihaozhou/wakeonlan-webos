# webOSTV.js DRM Agent
> 原文链接: https://webostv.developer.lge.com/develop/references/webostvjs-drm-agent ｜ 简体中文翻译

# DRMAgent 类

DRMAgent 是提供给 webOSDev API 的一个类。

方法

| 类型 | 名称 | 描述 |
| --- | --- | --- |
| 构造器 | [DRMAgent](#drmagent) | 创建一个 DRM agent。 |
| 方法 | [getClientId](#getclientid) | 返回 DRM 的 client ID。 |
| | [getDrmType](#getdrmtype) | 返回要设置的 DRM 类型。 |
| | [getErrorCode](#geterrorcode) | 从 DRM 服务返回一个[错误代码](#errorcodereference)。 |
| | [getErrorText](#geterrortext) | 返回由 DRM 服务错误所表示的文本。 |
| | [getRightsError](#getrightserror) | 当内容播放期间发生 DRM 许可证错误时，返回错误信息。 |
| | [load](#load) | 为给定类型的 DRM 创建一个 client 实例。 |
| | [isLoaded](#isloaded) | 检查是否存在与给定 application ID 对应的 DRM client。 |
| | [sendDrmMessage](#senddrmmessage) | 向 DRM 服务发送一条 DRM 消息。 |
| | [unload](#unload) | 移除一个 DRM client 实例并释放相关资源。 |

## DRMAgent

描述

创建一个 DRM agent。

属性

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| type | String | DRM 的类型。<ul><li>PLAYREADY: PlayReady</li></ul> |

## getClientId

描述

返回 DRM 的 client ID。

参数

无

示例

```javascript
function loadPlayer() {
  var player = document.querySelector('video');
  var options = {
    mediaTransportType: 'PLAYREADY',
    option: {
      drm: {
        type: drmAgent.getDrmType(),
        clientId: drmAgent.getClientId(),
      },
    },
  };
  var mediaOption = encodeURI(JSON.stringify(options));
  var source = document.createElement('source');
  source.setAttribute('src', CONTENT_URL);
  source.setAttribute('type', 'video/mp4;mediaOption=' + mediaOption);
  player.appendChild(source);
  player.load();
}
```

另请参阅

-   无

## getDrmType

描述

返回要设置的 DRM 类型。

参数

无

调用返回

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| type | String | DRM 类型。<ul><li>PLAYREADY: PlayReady</li></ul> |

示例

```javascript
function loadPlayer() {
  var player = document.querySelector('video');
  var options = {
    mediaTransportType: 'PLAYREADY',
    option: {
      drm: {
        type: drmAgent.getDrmType(),
        clientId: drmAgent.getClientId(),
      },
    },
  };
  var mediaOption = encodeURI(JSON.stringify(options));
  var source = document.createElement('source');
  source.setAttribute('src', CONTENT_URL);
  source.setAttribute('type', 'video/mp4;mediaOption=' + mediaOption);
  player.appendChild(source);
  player.load();
}
```

另请参阅

-   无

## getErrorCode

描述

从 DRM 服务返回一个[错误代码](#errorcodereference)。

参数

无

调用返回

返回[错误代码](#errorcodereference)。

示例

```javascript
drmAgent.load({
  onSuccess: function (res) {
    sendDrmMessage();
  },
  onFailure: function (res) {
    // API calling error
    console.log('error -', res.errorCode, '/', res.errorText);
    // or but it does not guarantee sync
    console.log(
      'error -',
      drmAgent.getErrorCode(),
      '/',
      drmAgent.getErrorText()
    );
  },
});
```

另请参阅

-   [getErrorText](#geterrortext)

## getErrorText

描述

返回由 DRM 服务错误所表示的文本。

参数

无

调用返回

返回来自 DRM 服务的错误文本。

示例

```javascript
drmAgent.load({
  onSuccess: function (res) {
    sendDrmMessage();
  },
  onFailure: function (res) {
    // API calling error
    console.log('error -', res.errorCode, '/', res.errorText);
    // or but it does not guarantee sync
    console.log(
      'error -',
      drmAgent.getErrorCode(),
      '/',
      drmAgent.getErrorText()
    );
  },
});
```

另请参阅

-   [getErrorCode](#geterrorcode)

## getRightsError

描述

当内容播放期间发生 DRM 许可证错误时，返回错误信息。
此方法仅支持以下 DRM 类型：

-   PlayReady

参数

| 名称 | 类型 | 描述 | 必需 |
| --- | --- | --- | --- |
| params | Object | 包含 handlers 的 JSON 对象<br><br>**属性**<br><br>| 名称 | 类型 | 描述 | 必需 |
| --- | --- | --- | --- |
| onSuccess | Function | 方法成功时调用的回调函数。 | 是 |
| onFailure | Function | 方法失败时调用的回调函数。 | 是 | | 是 |

成功回调返回

| 名称 | 类型 | 描述 | 必需 |
| --- | --- | --- | --- |
| returnValue | Boolean | 指示请求成功/失败的标志。<ul><li>true: 成功</li><li>false: 失败</li></ul> | 是 |
| subscribed | Boolean | 指示订阅是否启用的标志。<ul><li>true: 已启用</li><li>false: 未启用</li></ul> | 是 |
| errorCode | Number | 如果方法失败，errorCode 包含错误代码。仅当方法失败时，方法才会返回 errorCode。<br>更多详情请参阅此方法的[错误代码参考](#errorcodereference)。 | 否 |
| errorText | String | 如果方法失败，errorText 包含错误文本。仅当方法失败时，方法才会返回 errorText。<br>更多详情请参阅此方法的[错误代码参考](#errorcodereference)。 | 否 |

失败回调返回

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| error | Object | 包含 DRM 服务错误详情的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| errorCode | Number | 方法失败时返回的错误代码。 |
| errorText | String | 方法失败时返回的错误文本。 |

调用返回

返回 undefined。

示例

```javascript
function getRightsError() {
  drmAgent.getRightsError({
    onSuccess: function (res) {
      // playready only
      // handle error
    },
    onFailure: function (res) {
      // API calling error
    },
  });
}
```

另请参阅

-   无

## isLoaded

描述

检查是否存在与给定 application ID 对应的 DRM client。

参数

| 名称 | 类型 | 描述 | 必需 |
| --- | --- | --- | --- |
| params | Object | 包含 handlers 的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| onSuccess | Function | 方法成功时调用的回调函数。 |
| onFailure | Function | 方法失败时调用的回调函数。 | | 是 |

成功回调返回

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| response | Object | 包含 DRM 服务错误详情的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| loadStatus | Boolean | 指示 DRM client 是否已加载。<ul><li>true: DRM client 已加载。</li><li>false: DRM client 未加载。</li></ul> |
| clientId | String | 当 DRM client 成功加载时，返回已加载的 client ID。 |
| drmType | String | 当 DRM client 成功加载时，返回 DRM 的 client 类型。 |

失败回调返回

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| error | Object | 包含 DRM 服务错误详情的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| errorCode | Number | 方法失败时返回的错误代码。 |
| errorText | String | 方法失败时返回的错误文本。 |

示例

```javascript
function isDrmLoaded() {
  drmAgent.isLoaded({
    onSuccess: function (res) {
      if (res.loadStatus === true) {
        loadDrm();
      } else {
        sendDrmMessage();
      }
    },
    onFailure: function (res) {
      // API calling error
    },
  });
}
```

另请参阅

-   [load](#load)
-   [unload](#unload)

## load

描述

为某种类型的 DRM 创建一个 client 实例。
DRM 类型在创建 DRM agent 时指定。

参数

| 名称 | 类型 | 描述 | 必需 |
| --- | --- | --- | --- |
| params | Object | 包含 handlers 的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| onSuccess | Function | 方法成功时调用的回调函数。 |
| onFailure | Function | 方法失败时调用的回调函数。 | | 是 |

成功回调返回 (loadCallback)

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| response | Object | 返回值的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| clientId | String | 如果 DRM agent 成功加载了 DRM client，则返回其 client ID。 |

失败回调返回 (failureCallback)

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| error | Object | 包含 DRM 服务错误详情的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| errorCode | Number | 方法失败时返回的错误代码。 |
| errorText | String | 方法失败时返回的错误文本。 |

调用返回

返回 undefined。

示例

```javascript
function loadDrm() {
  drmAgent.load({
    onSuccess: function (res) {
      sendDrmMessage();
    },
    onFailure: function (res) {
      // API calling error
    },
  });
}
```

另请参阅

-   [unload](#unload)

## sendDrmMessage

描述

向 DRM 服务发送一条 DRM 消息。
收到消息后，DRM 服务将开始解析该消息并执行 DRM 操作。

参数

| 名称 | 类型 | 描述 | 必需 |
| --- | --- | --- | --- |
| params | Object | 包含 handlers 的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| msg | String | 要提供给底层 DRM 服务器的消息，其格式根据 DRM 类型而定。 |
| onSuccess | Function | 方法成功时调用的回调函数。 |
| onFailure | Function | 方法失败时调用的回调函数。 | | 否 |

成功回调返回 (sendDrmMessageCallback)

| 名称 | 类型 | 属性 | 描述 |
| --- | --- | --- | --- |
| response | Object | | 发送消息后结果的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 属性 | 描述 |
| --- | --- | --- | --- |
| msgId | String | \<optional\> | 导致产生此结果消息的消息的唯一 ID。 |
| resultCode | Number | \<optional\> | 仅用于 PlayReady 的结果代码。 |
| resultMsg | String | \<optional\> | 仅用于 PlayReady 的 DRM 系统特定结果消息。 |

失败回调返回 (failureCallback)

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| error | Object | 包含 DRM 服务错误详情的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| errorCode | Number | 方法失败时返回的错误代码。 |
| errorText | String | 方法失败时返回的错误文本。 |

示例

```javascript
function sendDrmMessage() {
  drmAgent.sendDrmMessage({
    msg: 'some messages',
    onSuccess: function (res) {
      loadPlayer();
    },
    onFailure: function (res) {
      // API calling error
    },
  });
}
```

另请参阅

-   无

## unload

描述

移除一个 DRM client 实例并释放相关资源。

参数

| 名称 | 类型 | 描述 | 必需 |
| --- | --- | --- | --- |
| params | Object | 包含 handlers 的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| onSuccess | Function | 方法成功时调用的回调函数。 |
| onFailure | Function | 方法失败时调用的回调函数。 | | 是 |

成功回调返回 (unloadCallback)

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| response | Object | 空的 JSON 对象 |

失败回调返回 (failureCallback)

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| error | Object | 包含 DRM 服务错误详情的 JSON 对象。<br>**属性**<br><br>| 名称 | 类型 | 描述 |
| --- | --- | --- |
| errorCode | Number | 方法失败时返回的错误代码。 |
| errorText | String | 方法失败时返回的错误文本。 |

调用返回

返回 undefined。

示例

```javascript
function unloadDrm() {
  drmAgent.unload({
    onSuccess: function (res) {
      // do something
    },
    onFailure: function (res) {
      // API calling error
    },
  });
}
```

另请参阅

-   [load](#load)

## 错误代码参考

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| NOT\_ERROR | Number | 无错误。 |
| CLIENT\_NOT\_LOADED | Number | DRM client 未加载。 |
| VENDOR\_ERROR | Number | 由厂商管理的错误。 |
| API\_NOT\_SUPPORTED | Number | 当前激活的 DRM 不支持此 API。 |
| WRONG\_CLIENT\_ID | Number | 没有与 client ID 匹配的进程。 |
| KEY\_NOT\_FOUND | Number | 在 DRM 存储中找不到密钥文件。 |
| INVALID\_PARAMS | Number | 部分参数不是有效的数据或格式。 |
| UNSUPPORTED\_DRM\_TYPE | Number | 这不是受支持的 DRM 类型。 |
| INVALID\_KEY\_FORMAT | Number | 密钥文件不是有效格式。 |
| INVALID\_TIME\_INFO | Number | 无法获取有效的时间信息。 |
| DRM\_TYPE\_UNMATCHED | Number | 当前加载的 client 的 DRM 类型与创建 DRM agent 时设置的 DRM 类型不匹配。 |
| UNKNOWN\_ERROR | Number | 这是一个未知错误。 |
