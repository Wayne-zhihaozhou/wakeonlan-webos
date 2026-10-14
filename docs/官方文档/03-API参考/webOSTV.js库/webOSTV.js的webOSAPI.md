# webOSTV.js webOS API
> 原文链接: https://webostv.developer.lge.com/develop/references/webostvjs-webos ｜ 简体中文翻译

# webOS API

webOS API 提供了用于获取电视特定信息和设置的方法。

本 API 的方法与旧版本 webOS TV 上使用的 webOS.js 库中的方法兼容。如果您曾使用 webOS.js 的方法来实现您的应用，我们建议您将 webOS.js 库替换为 webOSTV.js 库。

注意

webOS.js 的某些方法不会在 webOS TV 上执行。在 webOSTV.js 库中，仅提供了电视所支持的方法。

## 方法（Methods）

| 类型 | 名称 | 描述 |
| --- | --- | --- |
| 成员 | [libVersion](#libversion) | 保存代表 webOSTV.js 库构建版本的属性。 |
| [platform](#platform) | 保存代表 webOS 变体平台识别的属性。 |
| 方法 | [deviceInfo](#deviceinfo) | 返回设备特定信息。 |
| [fetchAppId](#fetchappid) | 返回调用方应用的 app ID。 |
| [fetchAppInfo](#fetchappinfo) | 返回调用方应用的 [appinfo.json](../配置文件/appinfo.json应用元数据.md) 数据，并带有保存到 webOS.appInfo 的缓存。 |
| [fetchAppRootPath](#fetchapprootpath) | 返回调用方应用的完整 URI 路径。 |
| [platformBack](#platformback) | 模拟遥控器的返回键，以向后移动 1 级。 |
| [systemInfo](#systeminfo) | 返回系统特定信息。 |
| [keyboard.isShowing](#isshowing) | 检查虚拟键盘是否可见。 |
| [service.request](#request) | 创建并发送服务请求到 webOS TV 的系统。 |

## libVersion

描述

一个代表 webOSTV.js 库构建版本的成员。

属性

无

示例

```javascript
if (Number(webOS.libVersion.split('.')[0]) > 0) {
  // use webOSDev APIs
}
```

另请参阅

- 无

## platform

描述

一个代表 webOS 变体平台识别的成员。

属性

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| tv | Boolean | 指示平台识别是否为 webOS TV。如果平台识别不是 webOS TV，则返回 undefined。<ul><li>true: webOS TV</li></ul> |

示例

```javascript
if (webOS.platform.tv === true) {
    // calls TV specific service APIs
} else {
    console.log('This device is not TV.');
}
```

另请参阅

- 无

## deviceInfo

描述

返回有关电视型号、操作系统版本、SDK 版本、屏幕尺寸和分辨率的设备特定信息。

参数

| 名称 | 类型 | 描述 | 必填 |
| --- | --- | --- | --- |
| devicecallback(info) | Function | 信息收集完成后调用的函数。<ul><li>info: 包含设备信息详情的 JSON 对象<br>**属性**</li></ul> | 是 |

**info 对象的属性：**

| 名称 | 类型 | 描述 | 必填 |
| --- | --- | --- | --- |
| modelName | String | 设备的型号名称，采用 UTF-8 格式。 | 必填 |
| version | String | TV 软件版本的完整名称。<br>您可以在电视设置菜单的软件版本中查看该值。 | 必填 |
| versionMajor | Number | TV 软件版本的子集：主版本号。 | 必填 |
| versionMinor | Number | TV 软件版本的子集：次版本号。 | 必填 |
| versionDot | Number | TV 软件版本的子集：修订版本号。 | 必填 |
| sdkVersion | String | webOS TV SDK 版本，采用 X.X.X 格式。<br>您可以在电视设置菜单的 webOS TV 版本中查看该值。有关 SDK 版本的更多详情，请参阅 [webOS TV SDK Introduction](../../05-开发工具/SDK/SDK简介.md)。 | 必填 |
| screenWidth | Number | 用于视频播放的屏幕宽度（像素）。<br>对于图形显示的应用分辨率（宽度），请使用 `window.innerWidth`。 | 必填 |
| screenHeight | Number | 用于视频播放的屏幕高度（像素）。<br>对于图形显示的应用分辨率（高度），请使用 `window.innerHeight`。 | 必填 |
| uhd | Boolean | 指示设备是否支持超高清（Ultra HD）分辨率。<ul><li>true: 设备支持超高清分辨率。</li><li>false: 设备不支持超高清分辨率。</li></ul> | 必填 |
| uhd8K | Boolean | 指示设备是否支持 8K 超高清分辨率。<ul><li>true: 设备支持 8K 超高清分辨率。</li><li>false: 设备不支持 8K 超高清分辨率。</li></ul> | 必填 |
| oled | Boolean | 指示设备的显示类型是否为 OLED。<ul><li>true: 显示类型为 OLED。</li><li>false: 显示类型为 LCD。</li></ul> | 可选* |
| ddrSize | String | DDR DRAM 的大小（以字节为单位）。例如，如果 DDR DRAM 的大小为 3G，则返回值为 '3G'。 | 可选* |
| hdr10 | Boolean | 指示设备是否支持 HDR10。<ul><li>true: 设备支持 HDR10。</li><li>false: 设备不支持 HDR10。</li></ul> | 必填 |
| dolbyVision | Boolean | 指示设备是否支持 Dolby Vision。<ul><li>true: 设备支持 Dolby Vision。</li><li>false: 设备不支持 Dolby Vision。</li></ul> | 必填 |
| dolbyAtmos | Boolean | 指示设备是否支持 Dolby Atmos。<br>从 webOSTV.js v1.2.6 开始，它会考虑外部 ARC 设备的连接状态和声音设置，返回设备是否支持 Dolby Atmos。<ul><li>true: 设备支持 Dolby Atmos。</li><li>false: 设备不支持 Dolby Atmos。</li></ul> | 必填 |
| brandName | String | 设备的品牌名称。<ul><li>例如) "LG"</li></ul> | 必填 |
| manufacturer | String | 设备的制造商。<ul><li>例如) "LG Electronics"</li></ul> | 必填 |
| mainboardMaker | String | 设备的主板制造商。<ul><li>例如) "LG"</li></ul> | 可选* |
| platformBizType | String | 设备的平台业务类型。<ul><li>"LG"</li><li>"wee": 平台业务类型不是 "LG"。</li></ul> | 必填 |
| tuner | Boolean | 指示设备是否支持调谐器。<ul><li>true: 设备支持调谐器。</li><li>false: 设备无调谐器。</li></ul> | 必填 |

> \* 在不支持此属性的旧版 webOS TV 上，返回 undefined。

**调用返回值**

返回 undefined。

**示例**

```javascript
webOS.deviceInfo(function (device) {
  if (device.modelName.indexOf('32LB') > -1) {
    // do something
  }

  var version = device.version.split('.');
  if (Number(version[0]) > 3 || Number(device.versionMajor) > 3) {
    // do something
    if (Number(version[1]) > 2 || Number(device.versionMinor) > 2) {
      // do something
      if (Number(version[2]) > 13 || Number(device.versionDot) > 13) {
        // do something
      }
    }
  }

  var sdkVersion = device.sdkVersion.split('.');
  if (sdkVersion[0] === '3') {
    // do something
  }

  if (device.screenWidth === 1920 && device.screenHeight === 1080) {
    // do something
  }

  if (device.uhd && device.uhd === true) {
    // shows UHD contents
  }

  if (device.uhd8K && device.uhd8K === true) {
    // shows 8K UHD contents
  }

  if (device.oled && device.oled === true) {
    // do something
  }

  if (device.ddrSize) {
    var ddrSize = device.ddrSize.split('G')[0];
    // do something
  }

  if (device.hdr10 && device.hdr10 === true) {
    // play HDR10 contents
  }

  if (device.dolbyVision && device.dolbyVision === true) {
    // play Dolby Vision contents
  }

  if (device.dolbyAtmos && device.dolbyAtmos === true) {
    // play Dolby ATMOS contents
  }

  if (device.brandName && device.brandName === "LG") {
    // Do something
  }

  if (device.manufacturer && device.manufacturer === "LG Electronics") {
    // Do something
  }

  if (device.mainboardMaker && device.mainboardMaker === "LG") {
    // Do something
  }

  if (device.platformBizType && device.platformBizType === "LG") {
    // Do something
  }

  if (device.tuner === false) {
    // The device is tunerless
  }
  
});
```

另请参阅

- [systemInfo](#systeminfo)

## fetchAppId

描述

返回调用此方法的应用的 app ID。

参数

无

调用返回值

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| appId | String | 应用的 app ID |

示例

```javascript
var appId = webOS.fetchAppId();
if (appId.length !== 0) {
  webOS.service.request('com.webos.service.drm', {
    method: 'load',
    parameters: {
      appId: appId,
      drmType: 'playready',
    },
    onSuccess: function (res) {
      // sendDrmMessage
    },
    onFailure: function (res) {
      // error handling
    },
  });
} else {
  console.error('Getting application ID failed.');
}
```

另请参阅

- [fetchAppInfo](#fetchappinfo)

## fetchAppInfo

描述

返回调用方应用的 [appinfo.json](../配置文件/appinfo.json应用元数据.md) 数据，并带有保存的缓存。

参数

| 名称 | 类型 | 描述 | 必填 |
| --- | --- | --- | --- |
| appinfocallback | Function | 完成后调用的函数 | 否 |

**appinfocallback 回调参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| info | object | 从应用的 appinfo.json 文件读取的 JSON 对象。如果未找到，则返回 undefined。 |

| 名称 | 类型 | 描述 | 必填 |
| --- | --- | --- | --- |
| path | String | 读取 appinfo.json 的可选相对文件路径。文件路径中必须包含文件名（appinfo.json）。<ul><li>如果您的应用被打包为 IPK 文件，请使用 [fetchAppRootPath](#fetchapprootpath) 方法获取路径。</li><li>如果您的应用由服务器托管，则该路径将是服务器的 URL。</li></ul> | 否 |

调用返回值

返回 undefined。

示例

```javascript
var path = webOS.fetchAppRootPath();
if (path.length !== 0) {
  // It works only in the case of packaged application
  webOS.fetchAppInfo(function (info) {
    if (info) {
      var version = info.version && info.version.split('.');
      if (Number(version[0]) > 1) {
        // different implementation
      }
    } else {
      console.error('Error occurs while getting appinfo.json.');
    }
  }, path + 'appinfo.json');
} else {
  console.error('Getting application root path failed.');
}
```

另请参阅

- [fetchAppId](#fetchappid)
- [fetchAppRootPath](#fetchapprootpath)

## fetchAppRootPath

描述

返回调用方应用的完整 URI 路径。

参数

无

调用返回值

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| uri | String | 应用所在的 URI 路径 |

示例

```javascript
var path = webOS.fetchAppRootPath();
if (path.length !== 0) {
  // It works only in the case of packaged application
  webOS.fetchAppInfo(function (info) {
    if (info) {
      var version = info.version && info.version.split('.');
      if (Number(version[0]) > 1) {
        // different implementation
      }
    } else {
      console.error('Error occurs while getting appinfo.json.');
    }
  }, path + 'appinfo.json');
} else {
  console.error('Getting application root path failed.');
}
```

另请参阅

- 无

## platformBack

描述

模拟遥控器的返回键，以向后移动 1 级。在 webOS TV 6.0 或更高版本上，会显示一个询问是否退出应用的弹出窗口；在 webOS TV 5.0 或更低版本上，会启动 Home launcher。有关更多信息，请参阅 [Back Button](../../02-开发指南/应用基础/返回按钮.md) 。

参数

无

调用返回值

无

示例

```javascript
function initPage() {
  document.querySelector('#refresh').addEventListener('click', function () {
    window.location.reload();
  });
  ...
  document
    .querySelector('#platformBack')
    .addEventListener('click', function () {
      webOS.platformBack();
    });
}
```

另请参阅

- 无

## systemInfo

描述

返回有关国家、服务国家和时区的系统特定信息。

参数

无

调用返回值

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| country | String | 电视广播所在的国家。如果值不存在，则返回 undefined。 |
| smartServiceCountry | String | 提供 Smart 服务的国家。如果值不存在，则返回 undefined。 |
| timezone | String | 电视广播所在的时区。如果值不存在，则返回 undefined。 |

示例

```javascript
var sysInfo = webOS.systemInfo;
if (
  (sysInfo.country && sysInfo.country === 'KOR') ||
  (sysInfo.smartServiceCountry && sysInfo.smartServiceCountry === 'KOR') ||
  (sysInfo.timezone && sysInfo.timezone)
) {
  // shows Korean contents
}
```

另请参阅

- [deviceInfo](#deviceinfo)

## keyboard.isShowing

描述

检查虚拟键盘是否可见。
在不支持此属性的旧版 webOS TV 上，返回 undefined。

参数

无

调用返回值

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| show | Boolean | 指示虚拟键盘是显示还是隐藏。<ul><li>true: 虚拟键盘已显示。</li><li>false: 虚拟键盘已隐藏。</li></ul> |

示例

```javascript
if (webOS.keyboard.isShowing() === true) {
  // other div style fade out
} else {
  console.log('Keyboard is hidden or this API is not supported.');
}
```

另请参阅

- 无

## service.request

描述

创建并发送服务请求到 webOS TV 的系统。

参数

| 名称 | 类型 | 描述 | 必填 |
| --- | --- | --- | --- |
| uri | String | 服务 URI。<br>它接受正常的服务 URI 格式，也接受包含服务方法的扩展格式。 | 是 |
| param | Object | 服务请求选项。<br>**属性** | 否 |

**param 对象的属性：**

| 名称 | 类型 | 描述 | 必填 |
| --- | --- | --- | --- |
| method | String | 正在调用的服务方法。 | 否 |
| parameters | Object | 要发送的请求参数的 JSON 对象。 | 否 |
| subscribe | Boolean | 指示此请求是否需要进行订阅。<ul><li>true: 请求订阅。</li><li>false: 不请求订阅。</li></ul> | 否 |
| resubscribe | Boolean | 指示请求在发生失败后是否应重新订阅。<ul><li>true: 请求重新订阅。</li><li>false: 不请求重新订阅。</li></ul> | 否 |
| onSuccess | Function | 方法成功时调用的回调函数。 | 否 |
| onFailure | Function | 方法失败时调用的回调函数。 | 否 |
| onComplete | Function | 请求完成时调用的回调函数（无论成功或失败）。 | 否 |

调用返回值

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| requestObject | Object | 生成的请求对象。该对象可用于取消订阅。<br>**属性** |

**requestObject 对象的属性：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| uri | String | 包含方法名称的完整服务请求 URI。 |
| params | Object | 要发送的请求参数的 JSON 对象。 |
| subscribe | Boolean | 指示此请求是否需要进行订阅。<ul><li>true: 已订阅</li><li>false: 未订阅</li></ul> |
| resubscribe | Boolean | 指示请求在发生失败后是否应重新订阅。<ul><li>true: 已重新订阅</li><li>false: 未重新订阅</li></ul> |
| onSuccess | Function | 方法成功时调用的回调函数。 |
| onFailure | Function | 方法失败时调用的回调函数。 |
| onComplete | Function | 请求完成时调用的回调函数（无论成功或失败）。 |
| send | function | 发送请求。它在创建时自动调用。无需参数。 |
| cancel | function | 取消服务请求及任何关联的订阅。无需参数。 |

完成回调返回值

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| response | Object | 包含服务响应数据的 JSON 对象；它既可以是正确的响应数据，也可以是错误详情。 |

成功回调返回值

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| response | Object | 包含服务响应数据的 JSON 对象 |

失败回调返回值

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| error | Object | 包含服务错误详情的 JSON 对象。 |

示例

```javascript
function callSystemService() {
  webOS.service.request('luna://com.palm.systemservice', {
    method: 'time/getSystemTime',
    parameters: { subscribe: true },
    onSuccess: function (res) {
      console.log('system time suc', res);
    },
    onFailure: function (res) {
      console.log('system time fail', res);
    },
  });
}
```

另请参阅

- 无
