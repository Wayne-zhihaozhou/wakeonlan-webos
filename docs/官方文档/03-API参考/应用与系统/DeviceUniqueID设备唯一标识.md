# Device Unique ID（设备唯一标识）
> 原文链接: https://webostv.developer.lge.com/develop/references/device-unique-id ｜ 简体中文翻译

# Device Unique ID

Service URI - `luna://com.webos.service.sm`

提供应用安全与身份验证服务，例如应用签名验证。从 **webOS 3.0 或更高版本**的平台设备开始，你可以使用此安全管理器服务所提供的设备标识/身份验证 API。

方法

| 方法 | 描述 | 在模拟器中支持 |
| --- | --- | --- |
| [deviceid/getIDs](#getids) | 返回 webOS TV 提供的设备 ID | 否 |

## deviceid/getIDs

描述

此 API 返回 webOS TV 提供的设备 ID。目前支持 **LGUDID**（LG 唯一设备 ID）。

**LGUDID** 使用 MAC 作为种子生成，但同时也会使用随机生成的 UUID（通用唯一标识符）。LGUDID 依据 UUID 版本 5 规范生成，并使用 MAC 作为名称、以随机生成的 UUID（版本 4）来代替命名空间 ID。

重要说明: 隐私政策

在使用此 API 之前，你必须就使用用户的个人信息获得用户的同意。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| `idType` | 必需 | 字符串数组 | ID 类型的数组。目前允许使用 `"LGUDID"`。<ul><li>示例: `["LGUDID"]`</li></ul> |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [idList](#idList) | 必需 | 对象数组 | 设备 ID 数据的数组（`idType` 和 `idValue`） |

错误代码参考

| 错误代码 | 错误代码文本 | 错误代码描述 |
| --- | --- | --- |
| ERR.001 | Invalid Parameters | 无效的参数 |
| ERR.002 | Security Manager Internal Error | 安全管理器内部错误 |
| ERR.801 | Unsupported Device ID Type | 为 `deviceId/getIDs` API 提供了不支持的设备 ID 类型 |

示例

```javascript
// Get system ID information
var request = webOS.service.request('luna://com.webos.service.sm', {
  method: 'deviceid/getIDs',
  parameters: {
    idType: ['LGUDID'],
  },
  onSuccess: function (inResponse) {
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to get system ID information');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回值示例

```javascript
// Success return
{
  "idList": [
      {
          "idValue": "095f142a-xxxx-ac5d-xxxx-92c8be18xxxx",
          "idType": "LGUDID"
      }
  ],
  "returnValue": true
}

// Failure return
{
  "returnValue" : false
  "errorCode": "ERR.001",
  "errorText": "Invalid Parameters"
}
```

另请参阅

-   [TV Device Information](TVDeviceInformation电视设备信息.md)

## 对象

### idList 对象

由 `idType` 和 `idValue` 组成的对象。

```javascript
{
  "idType": string,
  "idValue": string
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| `idType` | 必需 | 字符串 | 设备 ID 类型 |
| `idValue` | 必需 | 字符串 | 设备 ID 值 |