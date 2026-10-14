# TV Device Information（电视设备信息）
> 原文链接: https://webostv.developer.lge.com/develop/references/tv-device-information ｜ 简体中文翻译

Service URI - luna://com.webos.service.tv.systemproperty

提供用于获取电视系统信息的方法。此 API 用于检查 webOS TV 的版本及其功能特性。

方法（Methods）

| 方法 | 描述 | 模拟器支持 |
| --- | --- | --- |
| [getSystemInfo](#getsysteminfo) | 按指定键获取系统信息。 | 是 |

## getSystemInfo

描述（Description）

按参数中数组所指定的键获取系统信息。可用的键如下：

| 键名 | 描述 | 类型 | 用户协议 | 支持的 webOS TV 版本 |
| --- | --- | --- | --- | --- |
| boardType | 主板类型用于检查芯片组。返回字符串的格式如下。<ul><li>[Chipset]_[DTV Standard]_[Country Code]<ul><li>示例："H15_ATSC_US"、"M14_ATSC_KR"、"LM15U_ATSC_KR"</li></ul></li></ul><ul><li>[DTV Standard](http://en.wikipedia.org/wiki/Digital_television) 可用的值如下：<ul><li>ATSC: Advanced Television System Committee</li><li>DVB: Digital Video Broadcasting</li><li>ARIB: ISDB (Integrated Services Digital Broadcasting)，由日本组织 [ARIB](http://en.wikipedia.org/wiki/ARIB)（Association of Radio Industries and Businesses，无线工业及商贸联合会）维护。</li></ul></li></ul><div><strong>注意。</strong>此属性在模拟器中不受支持。</div> | String | 不需要 | 自 webOS TV 2.0 起 |
| firmwareVersion | 固件版本 | String | 需要 | 自 webOS TV 1.2 起 |
| modelName | 型号名称<ul><li>示例："LB6700AKR"</li></ul> | String | 需要 | 自 webOS TV 1.2 起 |
| sdkVersion | webOS TV SDK 版本<ul><li>示例："1.3.0"、"2.0.0"</li></ul> | String | 不需要 | 自 webOS TV 1.2 起 |
| UHD | 是否支持超高清（Ultra HD）分辨率<ul><li>true：支持 UHD 分辨率。</li><li>false：不支持。</li></ul> | String | 不需要 | 自 webOS TV 1.2 起 |
| _3d | 是否支持 3D 视频<ul><li>true：支持 3D 视频。</li><li>false：不支持。</li></ul> | String | 不需要 | 自 webOS TV 1.2 起 |

参数（Parameters）

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| keys | 必填 | String array | 用于获取系统信息的键名数组。<ul><li>示例：["boardType", "projectName"]</li></ul> |
| subscribe | 可选 | Boolean | 决定是否订阅的标记。如果启用订阅，每当所指定的任一系统信息发生变化时，您都会收到相应事件。<ul><li>true：订阅</li></ul><div><ul><li>false：不订阅。仅调用一次该方法。（默认）</li></ul></div> |

调用返回（Call returns）

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 指示请求成功/失败的标记。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 可选 | String | 当方法失败时，errorCode 包含错误代码。仅当方法失败时才会返回 errorCode。<br>有关更多详情，请参阅本方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | String | 当方法失败时，errorText 包含错误文本。仅当方法失败时才会返回 errorText。<br>有关更多详情，请参阅本方法的错误代码参考（Error Codes Reference）。 |
| [key name]* | 可选 | String | 如果 getSystemInfo 方法成功，将返回您所指定的键值对。 |

备注（Remarks）

-   如果使用了错误的键或发生错误，将不会为该键返回任何结果数据。
-   如果您订阅了多个键，首次返回时会收到全部键的结果数据。首次返回之后，当相应系统信息发生变化时，您将收到对应各键的结果数据。

错误参考（Error reference）

| 错误代码 | 错误消息 |
| --- | --- |
| ERROR\_06 | Invalid argument（无效参数） |
| ERROR\_10 | Resource temporarily unavailable（资源暂时不可用） |
| ERROR\_99 | JSON format error（JSON 格式错误） |

示例（Example）

```javascript
// 一次性调用
var request = webOS.service.request(
  'luna://com.webos.service.tv.systemproperty',
  {
    method: 'getSystemInfo',
    parameters: {
      keys: ['modelName', 'firmwareVersion', 'UHD', 'sdkVersion'],
    },
    onComplete: function (inResponse) {
      var isSucceeded = inResponse.returnValue;

      if (isSucceeded) {
        console.log('Result: ' + JSON.stringify(inResponse));
        // 在这里做些什么
      } else {
        console.log('Failed to get TV device information');
        // 在这里做些什么
        return;
      }
    },
  }
);

// 订阅
var subscriptionHandle;

subscriptionHandle = webOS.service.request(
  'luna://com.webos.service.tv.systemproperty',
  {
    method: 'getSystemInfo',
    parameters: {
      keys: ['modelName', 'firmwareVersion', 'UHD', 'sdkVersion'],
      subscribe: true,
    },
    onComplete: function (inResponse) {
      var isSucceeded = inResponse.returnValue;

      if (typeof inResponse.subscribed != 'undefined') {
        if (!inResponse.subscribed) {
          console.log('Failed to subscribe TV device information');
          return;
        }
      }

      if (isSucceeded) {
        console.log('Result: ' + JSON.stringify(inResponse));
        // 在这里做些什么
      } else {
        console.log('Failed to TV device information');
        // 在这里做些什么
        return;
      }
    },
  }
);
...
// 如果需要取消订阅数据，请使用如下所示的 cancel() 方法
subscriptionHandle.cancel();
```

返回示例（Return example）

```javascript
// 成功返回
{
    "returnValue" : true,
    "modelName" : "WEBOS1",
    "firmwareVersion" : "3.00.00",
    "UHD":"true",
    "sdkVersion":"1.05.00"
}

// 失败返回
{
    "returnValue" : false,
    "errorCode" : "ERROR_06",
    "errorText" : "Invalid argument."
}


// 订阅示例

// 首次响应
{ 
    "returnValue" : true, 
    "modelName" : "WEBOS1", 
    "firmwareVersion" : "3.00.00" 
}

// 当 modelName 变为 "WEBOS2" 时
{ 
    "returnValue" : true, 
    "modelName" : "WEBOS2" 
}

// 当 firmwareVersion 变为 "3.02.00" 时
{ 
    "returnValue": true, 
    "firmwareVersion" : "3.02.00" 
}
```

另请参阅（See also）

无
