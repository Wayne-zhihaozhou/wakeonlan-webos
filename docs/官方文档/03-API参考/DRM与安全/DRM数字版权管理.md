# DRM（数字版权管理）
> 原文链接: https://webostv.developer.lge.com/develop/references/drm ｜ 简体中文翻译

Service URI - luna://com.webos.service.drm

提供用于管理 DRM 客户端的方法，这些客户端负责处理 DRM 权利信息、发送 DRM 消息，并订阅 DRM 权利错误信息。关于 DRM 播放的更多细节，请参阅 [DRM Content Playback](../../02-开发指南/媒体播放/DRM内容播放.md)。

## 方法

| 方法 | 描述 | 是否在模拟器中受支持 |
| --- | --- | --- |
| [load](#load) | 为指定类型创建 DRM 客户端实例。 | 否 |
| [unload](#unload) | 移除 DRM 客户端实例并释放相关资源。 | 否 |
| [isLoaded](#isloaded) | 检查是否存在与给定应用 ID 映射的 DRM 客户端。 | 否 |
| [sendDrmMessage](#senddrmmessage) | 使用 DRM 系统所定义的消息类型，向 DRM service 发送 DRM 消息。 | 否 |
| [getRightsError](#getrightserror) | 当内容播放期间发生 DRM 许可错误时，返回 DRM 权利错误信息。 | 否 |

## load

### 描述

为指定类型创建 DRM 客户端实例。
使用此方法创建 DRM 客户端实例后，即可使用 DRM service 提供的其他方法。
如果应用中的不同插件需要访问同一个 DRM 客户端实例，请使用 **[isLoaded](#isloaded)** 方法检查客户端 ID。该客户端 ID 由 11 字节大小写混合的字母和数字随机生成。最后一个字节预留给 '0'。（例如 ISQTUFTWV40、5DaOSFv82A0）
后置条件：将创建一个唯一的 DRM 客户端实例。

### 参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| drmType | 必需 | String | DRM 类型<ul><li>PlayReady: "playready"</li></ul> |
| appId | 可选 | String | 使用 DRM 客户端的应用的唯一 ID |

### 调用返回

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 指示请求成功/失败的标志。<ul><li>true: 成功</li><li>false: 失败</li></ul> |
| clientId | 可选 | String | DRM 客户端实例的唯一 ID |
| errorCode | 可选 | Number | errorCode 在方法失败时包含错误代码。该方法仅在失败时返回 errorCode。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | String | errorText 在方法失败时包含错误文本。该方法仅在失败时返回 errorText。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |

### 错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| 500 | 供应商管理的错误 |
| 501 | 此 API 在激活的 DRM 中不受支持。 |
| 502 | 没有与输入的 clientId 匹配的进程。 |
| 503 | 无法在 DRM 存储中找到密钥文件。 |
| 504 | 全部参数中的某一部分不是有效的数据或格式。 |
| 505 | 不支持该 drmType。 |
| 506 | 密钥文件不是有效的格式。 |
| 507 | 无法获取有效的时间信息。 |
| 599 | 未知错误。 |

### 示例

```javascript
var appId = "com.yourdomain.yourapp";
var drmType = "playready";
var clientId;
var isDrmClientLoaded;

var request = webOS.service.request("luna://com.webos.service.drm",
    method: "load",
    parameters: {
        "drmType": drmType,
        "appId": appId
    },
    onSuccess: function (inResponse) {
		clientId = result.clientId;
		isDrmClientLoaded= true;
		console.log("DRM Client is loaded successfully.");
		// To-Do something
		return;
    },
	onFailure: function (inError) {
		console.log("Result: " + JSON.stringify(inResponse));
		console.log("[" + inError.errorCode + "]: " + inError.errorText);
		// To-Do something
		return;
	}
});
```

### 返回示例

```javascript
{// Success return
  "returnValue":true,
  "clientId":"LE3bZyIZzY"
}

// Failure return - Use wrong DRM type
{
  "returnValue":false,
  "errorCode":505,
  "errorText":"It's not supporting drmType"
}
```

### 另请参阅

- [unload](#unload)
- [isLoaded](#isloaded)

## unload

### 描述

移除 DRM 客户端实例并释放相关资源。
调用此方法后，被移除的 DRM 客户端实例不能用于任何其他方法。

### 参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| clientId | 必需 | String | DRM 客户端实例的唯一 ID |

### 调用返回

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 指示请求成功/失败的标志。<ul><li>true: 成功</li><li>false: 失败</li></ul> |
| errorCode | 可选 | Number | errorCode 在方法失败时包含错误代码。该方法仅在失败时返回 errorCode。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | String | errorText 在方法失败时包含错误文本。该方法仅在失败时返回 errorText。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |

### 错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| 500 | 供应商管理的错误 |
| 501 | 此 API 在激活的 DRM 中不受支持。 |
| 502 | 没有与输入的 clientId 匹配的进程。 |
| 503 | 无法在 DRM 存储中找到密钥文件。 |
| 504 | 全部参数中的某一部分不是有效的数据或格式。 |
| 505 | 不支持该 drmType。 |
| 506 | 密钥文件不是有效的格式。 |
| 507 | 无法获取有效的时间信息。 |
| 599 | 未知错误。 |

### 示例

```javascript
<body onunload="unloadDrmClient()">
...
  
// JavaScript Code
...
function unloadDrmClient() {
    if (isDrmClientLoaded) {
        var request = webOS.service.request("luna://com.webos.service.drm", { 
            method:"unload", 
            parameters: { "clientId": clientId },
            onSuccess: function (result) {
                isDrmClientLoaded = false;
                console.log("DRM Client is unloaded successfully.");
            },
            onFailure: function (result) {
                console.log("[" + result.errorCode + "] " + result.errorText);
                // Do something for error handling
            });
    }
}
```

### 返回示例

```javascript
// Success return
{
  "returnValue":true
}

// Failure return
{
  "returnValue":false,
  "errorCode":502,
  "errorText":"There is no process matching to input clientId"
}
```

### 另请参阅

- [load](#load)
- [isLoaded](#isLoaded)

## isLoaded

### 描述

检查是否存在与给定应用 ID 映射的 DRM 客户端。
如果存在，则返回客户端 ID。否则，可以使用 **[load](#load)** 方法为应用 ID 创建新的 DRM 客户端实例。
由于每个应用 ID 只能创建一个 DRM 客户端 ID，因此当具有相同应用 ID 的不同插件尝试访问已存在的 DRM 客户端时，会使用此方法。

### 参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| appId | 可选 | String | 应用的唯一 ID |

### 调用返回

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 指示请求成功/失败的标志。<ul><li>true: 成功</li><li>false: 失败</li></ul> |
| loadStatus | 可选 | Boolean | 指示 DRM 客户端实例是否已加载的标志。<ul><li>true : 已加载</li><li>false: 未加载</li></ul> |
| clientId | 可选 | String | 已加载的 DRM 客户端的唯一 ID |
| errorCode | 可选 | Number | errorCode 在方法失败时包含错误代码。该方法仅在失败时返回 errorCode。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | String | errorText 在方法失败时包含错误文本。该方法仅在失败时返回 errorText。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |

### 错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| 500 | 供应商管理的错误 |
| 501 | 此 API 在激活的 DRM 中不受支持。 |
| 502 | 没有与输入的 clientId 匹配的进程。 |
| 503 | 无法在 DRM 存储中找到密钥文件。 |
| 504 | 全部参数中的某一部分不是有效的数据或格式。 |
| 505 | 不支持该 drmType。 |
| 506 | 密钥文件不是有效的格式。 |
| 507 | 无法获取有效的时间信息。 |
| 599 | 未知错误。 |

### 示例

```javascript
var appId = "com.yourdomain.yourapp";

var request = webOS.service.request("luna://com.webos.service.drm",
    method: "isLoaded",
    parameters: {
        "appId": appId
    },
    onSuccess: function (inResponse) {
        clientId = result.clientId;
        isDrmClientLoaded = result.loadStatus;
		drmType = result.drmType
		console.log("Result: " + JSON.stringify(inResponse));

		if (isDrmCliendLoaded) {
            console.log("DRM Client is already loaded");
			// To-Do something
		} else {
			console.log("DRM Client is not loaded");
			// To-Do something
		}
    },
	onFailure: function (inError) {
		console.log("Failed to get DRM client loading state");
		console.log("[" + inError.errorCode + "]: " + inError.errorText);
		// To-Do something
		return;
	}
);
```

### 返回示例

```javascript
// Success return - already loaded
{
  "returnValue":true,
  "loadStatus":true,
  "clientId":"i5wAE5ws1i",
  "drmType":"playready"
}

// Success return - not loaded
{
  "returnValue": true,
  "loadStatus": false
}
```

### 另请参阅

- [load](#load)
- [unload](#unload)

## sendDrmMessage

### 描述

使用 DRM 系统所定义的消息类型，向 DRM service 发送 DRM 消息。DRM service 会解析收到的消息并执行 DRM 操作。设置、初始化命令以及认证信息都通过此消息传递。
消息的格式根据 DRM 类型来确定。消息必须符合预定义的模式。请参阅 **[msg](DRM消息.md)** 参数描述中的消息示例。

前置条件：对于 PlayReady，必须使用 **[getRightsError](#getrightserror)** 注册一个回调函数，以接收 DRM service 处理消息过程中发生的错误。
后置条件：返回该消息的唯一 ID。

### 参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| clientId | 必需 | String | DRM 客户端实例的唯一 ID |
| msgType | 必需 | String | 由 DRM 系统定义的全局唯一消息类型<ul><li>PlayReady: "application/vnd.ms-playready.initiator+xml"</li></ul> |
| msg | 必需 | String | 提供给底层 DRM 服务器的消息，其格式依据 **msgType** 所指示的消息类型而定。msg 参数的有效格式在 [DRM message](DRM消息.md) 中有描述。 |
| drmSystemId | 必需 | String | DRM 系统的唯一 ID<ul><li>PlayReady: "urn:dvb:casystemid:19219"</li></ul> |

### 调用返回

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 指示请求成功/失败的标志。<ul><li>true: 成功</li><li>false: 失败</li></ul> |
| msgId | 可选 | String | <div class="note">注意</div>此参数仅用于 PlayReady。导致此结果消息的消息的唯一 ID |
| resultCode | 可选 | Number | <div class="note">注意</div>此参数仅用于 PlayReady。<table><tbody><tr><th>结果代码</th><th>描述</th><th>语义</th></tr><tr><td>0</td><td>成功</td><td>sendDrmMessage() 所请求的操作已成功完成</td></tr><tr><td>1</td><td>未知错误</td><td>sendDrmMessage() 因发生未指定的错误而失败。</td></tr><tr><td>2</td><td>无法处理请求</td><td>sendDrmMessage() 因 DRM agent 无法在分配的时间内完成必要的计算而失败。</td></tr><tr><td>3</td><td>未知 MIME 类型</td><td>sendDrmMessage() 失败，因为指定的 MIME 类型对 MIME 类型中指示的 DRM 系统而言是未知的。</td></tr><tr><td>4</td><td>需要用户同意</td><td>sendDrmMessage() 因该操作需要用户同意而失败。</td></tr></tbody></table> |
| resultMsg | 可选 | String | <div class="note">注意</div>此参数仅用于 PlayReady。<p>DRM 系统特定的结果消息<br>例如，结果消息如下所示。</p><pre class="code-block"><code class="language-html">&lt;?xml version="1.0" encoding="utf-8"?&gt;
&lt;PlayReadyResponse xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/"&gt;
&lt;DRM_RESULT&gt;0&lt;/DRM_RESULT&gt; 
&lt;CustomData&gt;CID=abc&lt;/CustomData&gt;
&lt;/PlayReadyResponse&gt;</code></pre> |
| errorCode | 可选 | Number | errorCode 在方法失败时包含错误代码。该方法仅在失败时返回 errorCode。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | String | errorText 在方法失败时包含错误文本。该方法仅在失败时返回 errorText。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |

### 错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| 500 | 供应商管理的错误 |
| 501 | 此 API 在激活的 DRM 中不受支持。 |
| 502 | 没有与输入的 clientId 匹配的进程。 |
| 503 | 无法在 DRM 存储中找到密钥文件。 |
| 504 | 全部参数中的某一部分不是有效的数据或格式。 |
| 505 | 不支持该 drmType。 |
| 506 | 密钥文件不是有效的格式。 |
| 507 | 无法获取有效的时间信息。 |
| 599 | 未知错误。 |

### 示例 - PlayReady

```javascript
// Message example for playready
var msg = '<?xml version="1.0" encoding="utf-8"?>
<PlayReadyInitiator xmlns= "http://schemas.microsoft.com/DRM/2007/03/protocols/">
  <LicenseAcquisition>
    <Header>
      <WRMHEADER xmlns= "http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0">
        <DATA>
          <PROTECTINFO>
            <KEYLEN>16</KEYLEN>
            <ALGID>AESCTR</ALGID>
          </PROTECTINFO>
          <LA_URL>http://rm.contoso.com/rightsmanager.asmx</LA_URL>
          <KID>lFmb2gxg0Cr5bfEnJXgJeA==</KID>
          <CHECKSUM>P7ORpD2IpA==</CHECKSUM>
        </DATA>
      </WRMHEADER>
    </Header>
    <CustomData>AuthZToken XYZ</CustomData>
  </LicenseAcquisition>
</PlayReadyInitiator>'

var msgId;

// Message type for PlayReady
var msgType = "application/vnd.ms-playready.initiator+xml";

// Unique ID of DRM system
var drmSystemId = "urn:dvb:casystemid:19219";

function sendRightInformation() {
    request = webOS.service.request("luna://com.webos.service.drm", {
        method:"sendDrmMessage",
        parameters: {
            "clientId": clientId,
            "msgType": msgType,
            "msg": msg,
            "drmSystemId": drmSystemId
        },
        onSuccess: function (result) {
            msgId = result.msgId;
            var resultCode = result.resultCode;
            var resultMsg = result.resultMgs;
            console.log("Message ID: " + msgId);
            console.log("[" + resultCode + "] " + resultMsg);

            if (resultCode != 0){
                // Do Handling DRM message error
            }
        },
        onFailure: function (result) {
            console.log("[" + result.errorCode + "] " + result.errorText);
        });
}
```

### 另请参阅

- [getRightsError](#getrightserror)

## getRightsError

### 描述

当内容播放期间发生 DRM 许可错误时，返回 DRM 权利错误信息。当参数 **subscribe** 设置为 'true' 时，会返回 DRM 权利错误信息。如果收到错误信息，应用会重试获取 DRM 权利，或执行适当的操作，例如向用户显示错误。
此方法仅在以下 DRM 类型中受支持：

- **PlayReady**

### 参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| clientId | 必需 | String | DRM 客户端实例的唯一 ID |
| subscribe | 必需 | Boolean | 决定是否订阅的标志。<ul><li>true: 订阅</li><li>false: 不订阅。表示此方法只应被调用一次。（默认）</li></ul><div class="note">注意</div>当您将此参数设置为 false 时，目前会返回一个错误（错误代码：504）。为避免该错误，请将此参数设置为 true。 |

### 调用返回

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 指示请求成功/失败的标志。<ul><li>true: 成功</li><li>false: 失败</li></ul> |
| subscribed | 必需 | Boolean | 指示订阅是否已启用的标志。<ul><li>true: 已启用</li><li>false: 未启用</li></ul> |
| errorCode | 可选 | Number | errorCode 在方法失败时包含错误代码。该方法仅在失败时返回 errorCode。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | String | errorText 在方法失败时包含错误文本。该方法仅在失败时返回 errorText。<br>更多细节请参阅此方法的错误代码参考（Error Codes Reference）。 |

### 错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| 500 | 供应商管理的错误 |
| 501 | 此 API 在激活的 DRM 中不受支持。 |
| 502 | 没有与输入的 clientId 匹配的进程。 |
| 503 | 无法在 DRM 存储中找到密钥文件。 |
| 504 | 全部参数中的某一部分不是有效的数据或格式。 |
| 505 | 不支持该 drmType。 |
| 506 | 密钥文件不是有效的格式。 |
| 507 | 无法获取有效的时间信息。 |
| 599 | 未知错误。 |

### 订阅返回

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| errorState | 可选 | String | 描述错误类型的错误代码<ul><li>0: 无许可证</li><li>1: 无效许可证</li></ul> |
| contentId | 可选 | String | 在引发错误的 DRM 系统范围内，受保护内容的唯一 ID。 |
| drmSystemId | 可选 | String | DRM 系统 ID<ul><li>PlayReady: "urn:dvb:casystemid:19219"</li></ul> |
| rightsIssuerUrl | 可选 | String | 许可证服务器 URL |

### 示例

```javascript
var subscriptionHandler;
...
function subscribeLicensingError() {
    var request = webOS.service.request("luna://com.webos.service.drm", { 
        method:"getRightsError", 
        parameters: {
            "clientId": clientId,
            "subscribe": true
        }, 
        onSuccess: function (result) { // Subscription Callback
            contentId = result.contentId;
            if (contentId == msgId) {
                if ( 0 == result.errorState) {
                    console.log("No license");
                    // Do something for error handling
                }
                else if ( 1 == result.errorState) {
                    console.log("Invalid license");
                    // Do something for error handling
                }
                console.log("DRM System ID: " + result.drmSystemId);
                console.log("License Server URL: " + result.rightIssueUrl);
            }
        },
        onFailure: function (result) {
            console.log("[" + result.errorCode + "] " + result.errorText);
        });
    //Register subscription handler
    subscriptionHandler = request;
}
...
```

### 另请参阅

- [sendDrmMessage](#senddrmmessage)