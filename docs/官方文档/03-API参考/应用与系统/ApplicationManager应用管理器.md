# Application Manager（应用管理器）
> 原文链接: https://webostv.developer.lge.com/develop/references/application-manager ｜ 简体中文翻译

**Service URI - luna://com.webos.applicationManager**

Application Manager 提供了 `launch` 方法，用于启动指定的应用。你可以通过指定 app ID 和相应的参数，直接使用 `launch` 方法来启动应用。

方法

| 方法 | 描述 | 模拟器是否支持 |
| --- | --- | --- |
| [launch](#launch) | 使用 app ID 调起一个应用。 | 是 |
| [getAppLoadStatus](#getapploadstatus) | 返回具有给定 app ID 的应用是否已安装。 | 是  <br>（Emulator 5.0 或更高版本） |

## launch

描述

启动与给定 app ID 相对应的应用。你可以使用此方法打开你的服务或应用。例如，用户可以在后台使用你的服务下载内容。当下载内容完成时，你的服务需要再次启动你的应用。

在启动应用时，你可以在 JSON 对象中传入参数。此方法可以针对同一个应用、使用不同参数被多次调用。应用应处理这些多次请求。通常，每次请求都会重新启动该应用。
关于如何解析参数并处理你的应用，请参阅 [App Lifecycle](../../01-快速入门/应用生命周期.md)。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| id  | 必需 | String | 要启动的应用的 ID。 |
| params | 可选 | Object | 包含目标应用参数的对象。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 可选 | Number | 当方法失败时，errorCode 包含错误代码。仅当方法失败时，该方法才会返回 errorCode。<br>有关更多详细信息，请参阅此方法的 Error Codes Reference。 |
| errorText | 可选 | String | 当方法失败时，errorText 包含错误文本。仅当方法失败时，该方法才会返回 errorText。<br>有关更多详细信息，请参阅此方法的 Error Codes Reference。 |

错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| \-1 | 一般错误。 |
| \-2 | 无法读取 schema。 |
| \-3 | 没有可用内存。 |
| \-4 | 启动应用时内存分配失败。 |
| \-5 | 不支持文件下载。 |
| \-6 | 目标 URI 没有处理器。 |
| \-101 | 未找到该应用。 |
| \-102 | 该应用已被锁定。 |
| \-103 | 安全检查未通过。 |
| \-104 | 无法从开发者应用路径在开发模式下启动特权应用。 |
| \-105 | 指定了无效的 id。 |
| \-106 | 不支持的应用类型。 |
| \-107 | 在启动另一个应用时，无法通过终止前台应用来启动最后一个应用。 |
| \-201 | 正在等待原生应用。 |
| \-202 | 原生应用启动进程失败。 |
| \-203 | 原生应用已在启动中。 |
| \-300 | 一般 Callchain 错误。 |
| \-301 | 下载 RO（Right Objects）失败。 |
| \-302 | 检查 DRM 失败。 |
| \-303 | 检查 App Signing 失败。 |
| \-304 | 获取设置值失败。 |
| \-305 | 匹配 Pincode 失败。 |
| \-306 | Pin 不匹配。 |
| \-307 | 发送启动事件失败。 |
| \-308 | 查找 LaunchPoint 失败。 |
| \-309 | 向 DB 注册 kind 失败。 |
| \-310 | 注册 Permission 失败。 |
| \-311 | EULA 错误。 |

示例

```javascript
// One-time call
// Launching app without parameter
var request = webOS.service.request('luna://com.webos.applicationManager', {
  method: 'launch',
  parameters: { id: 'com.yourdomain.callee' },
  onSuccess: function (inResponse) {
    console.log('The app is launched');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to launch the app');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});

// Launching app with parameters
var request = webOS.service.request('luna://com.webos.applicationManager', {
  method: 'launch',
  parameters: {
    id: 'com.yourdomain.callee',
    params: {
      customParam1: 'value1',
      customParam2: 'value2',
    },
  },
  onSuccess: function (inResponse) {
    console.log('The app is launched');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to launch the app');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

另请参阅

-   [App Lifecycle Management](../../02-开发指南/应用基础/应用生命周期管理.md)

## getAppLoadStatus

描述

返回具有给定 ID 的应用是否已安装。

如果你尝试启动一个未安装到 webOS TV 上的应用，会发生错误。在启动应用之前，可使用此方法来检查应用是否存在。此方法适用于 webOS TV 4.0 或更高版本。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| appId | 必需 | String | 要检查其是否已安装的应用的 ID。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| exist | 可选 | Boolean | 表示应用是否存在的标志。<ul><li>true：具有给定 ID 的应用已安装。</li><li>false：具有给定 ID 的应用未安装。</li></ul> |
| errorCode | 可选 | Number | 当方法失败时，errorCode 包含错误代码。仅当方法失败时，该方法才会返回 errorCode。<br>有关更多详细信息，请参阅此方法的 Error Codes Reference。 |
| errorText | 可选 | String | 当方法失败时，errorText 包含错误文本。仅当方法失败时，该方法才会返回 errorText。<br>有关更多详细信息，请参阅此方法的 Error Codes Reference。 |

错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| 1   | 指定了无效的 appId。当 appId 参数为空时，会返回此错误。 |

示例

```javascript
// One-time call
// Checking app installation
var request = webOS.service.request('luna://com.webos.applicationManager', {
  method: 'getAppLoadStatus',
  parameters: { appId: 'com.yourdomain.callee' },
  onSuccess: function (inResponse) {
    if (inResponse.exist) {
      console.log('The app exists');
      // To-Do something
    } else {
      console.log('The app does not exist');
      // To-Do something
    }
  },
  onFailure: function (inError) {
    console.log('Failed to check app installation');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回示例

```json
// Success return
{
  "exist": true,
  "returnValue": true
}
```

另请参阅

-   [launch](#launch)
