# Keymanager3（密钥管理器）
> 原文链接: https://webostv.developer.lge.com/develop/references/keymanager3 ｜ 简体中文翻译

Service URI - luna://com.webos.service.keymanager3

提供密钥的生成与删除、加密与解密、签名生成与验证等方法。  
这些加密操作由运行在可信执行环境（TEE）下的 keymaster 可信应用（TA）执行。它与 Android 的 HW keymaster 概念类似，体现了高标准的密钥保护技术。  
  
自 webOS TV 24 起，你可以使用该 API 进行数据保护（机密性、完整性）。  
  
以下是 keymanager3 提供的加密算法及其密钥大小列表。

| 加密（密钥类型） | 用途 | 密钥大小 | 备注 |
| --- | --- | --- | --- |
| AES | encrypt、decrypt | 128, 192, 256 |     |
| RSA | sign、verify、encrypt、decrypt | 1024, 2048, 3072, 4096 | 在 TEE 中生成 RSA 密钥会对电视的性能产生显著影响。使用 keymanager3 生成的密钥大小只能为 1024。要生成其他大小的密钥，请先在应用中生成密钥，再将其导入 keymanager3 以执行加密操作。 |
| ED  | sign、verify | 224(P224)、256(P256)、384(P384)、521(P521) | 密钥大小由曲线算法决定。 |
| HMAC | sign、verify | 64 或更大 | 推荐大小为 256（32 字节）。 |

方法

| 方法 | 描述 | 是否支持模拟器 |
| --- | --- | --- |
| [generateKey](#generatekey) | 请求为 keymanager3 支持的加密算法生成一个密钥。需要指定密钥的长度与类型。 | 否  |
| [importKey](#importkey) | 将外部生成的密钥传递给 keymanager3 服务。密钥经 keymanager3 加密后存储，之后用于 keymanager3 支持的加密操作。 | 否  |
| [exportKey](#exportkey) | 获取指定密钥对应的公钥。 | 否  |
| [removeKey](#removekey) | 请求删除由 keymanager3 生成或存储的密钥。 | 否  |
| [begin](#begin) | 通过密钥名指定要使用的 keymanager3 加密操作，并获取后续调用 update/finish 方法所需的唯一 handle id。 | 否  |
| [update](#update) | 传递通过调用 begin 方法获取的唯一 handle id 和数据。 | 否  |
| [finish](#finish) | 传递通过调用 begin 方法获取的唯一 handle id 和数据，使用 update 方法传递的数据完成加密操作，并接收结果。 | 否  |
| [abort](#abort) | 在通过调用 begin 方法获取唯一 handle id 之后，请求中止相应的加密操作。调用 begin 方法后，你必须调用此 abort 方法以停止该操作。这样可防止因资源不足而在电视设备上导致严重错误。 | 否  |

## generateKey

描述

使应用能够生成新的密钥或密钥对并将其存储到数据库中。  
通过此方法生成的密钥只能由该密钥的所有者使用。例如，如果应用 A 使用此方法创建了密钥，则该密钥只能由应用 A 使用。  
密钥名必须唯一，即你不能使用已有的密钥名生成密钥。要使用已有名称生成密钥，请先使用 `removeKey` 方法删除该已有密钥。

参数

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 必填 | String | 要生成的密钥的名称。 |
| params | 必填 | [Object::ParamSet](#paramset) | 指定与密钥关联的授权参数集。 |

调用返回值

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 表示操作的结果。<ul><li>true：操作成功。</li><li>false：操作失败。</li></ul> |
| errorCode | 可选 | Number | 若方法失败，errorCode 包含错误代码。仅当失败时该方法才返回 errorCode。 |
| errorText | 可选 | String | 若方法失败，errorText 包含错误文本。仅当失败时该方法才返回 errorText。 |

错误参考

| 错误代码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| \-10001, -10002, -10003, -10004, -10005, -10006, -10007, -10008, -10009, -10010, -10011, -10012, -10016, -10017, -10018 | 更多详情请参见[错误代码参考](#errorcodereference)。 | 更多详情请参见[错误代码参考](#errorcodereference)。 |

示例

使用 `generateKey` 方法生成一个 AES 密钥

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "generateKey",
  parameters: {
    name: "AES256",
    params: {
      type: "AES",
      size: 256,
      mode: ["ECB", "CBC"],
      purpose: ["encrypt", "decrypt"],
      padding: ["PKCS7"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 `generateKey` 方法生成一个 RSA 密钥

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "generateKey",
  parameters: {
    name: "RSA1024",
    params: {
      type: "RSA",
      size: 1024,
      purpose: ["sign", "verify"],
      padding: ["PKCS1"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 `generateKey` 方法生成一个 HMAC 密钥

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "generateKey",
  parameters: {
    name: "HMAC256",
    params: {
      type: "HMAC",
      size: 256,
      purpose: ["sign", "verify"],
      digest: ["SHA2_256"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 `generateKey` 方法生成一个 EC 密钥

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "generateKey",
  parameters: {
    name: "EC256",
    params: {
      type: "EC",
      size: 256,
      purpose: ["sign", "verify"],
      padding: "PKCS1",
      digest: ["SHA2_256"],
      curve: "P256",
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回示例

成功返回

```javascript
{
  "returnValue": true
}
```

密钥已存在时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10002,
  "errorText": "Key already exists"
}
```

密钥大小无效时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10003,
  "errorText": "Invalid key size"
}
```

用途无效时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10004,
  "errorText": "Invalid purpose"
}
```

不支持该填充方式时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10006,
  "errorText": "Invalid padding"
}
```

## importKey

描述

使应用能够导入密钥或密钥对并将其存储到数据库中。  
要导入密钥对，只需导入私钥，`keymanager3` 便会派生其公钥。

参数

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 必填 | String | 要导入的密钥的名称。 |
| data | 必填 | String | 应用想要导入的、经过 Base64 编码的密钥数据。<ul><li>对于 AES 和 HMAC：Base64 编码的<strong>二进制格式</strong></li><li>对于 RSA 和 EC：Base64 编码的<strong>PKCS#8 DER 格式</strong></li></ul> |
| params | 必填 | [Object::ParamSet](#paramset) | 指定与密钥关联的授权参数集。 |

调用返回值

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 表示操作的结果。<ul><li>true：操作成功。</li><li>false：操作失败。</li></ul> |
| errorCode | 可选 | Number | 若方法失败，errorCode 包含错误代码。仅当失败时该方法才返回 errorCode。 |
| errorText | 可选 | String | 若方法失败，errorText 包含错误文本。仅当失败时该方法才返回 errorText。 |

错误参考

| 错误代码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| \-10001, -10002, -10003, -10004, -10005, -10006, -10007, -10008, -10009, -10010, -10011, -10012, -10016, -10017, -10018 | 更多详情请参见[错误代码参考](#errorcodereference)。 | 更多详情请参见[错误代码参考](#errorcodereference)。 |

示例

使用 `importKey` 方法将现有的 AES 密钥存储到 keymanager3 数据库中

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "importKey",
  parameters: {
    name: "AES256",
    data: "JFWOIEJFOIJQOIEJFOIJQOIEJFOQIJFOIQJEFOQIJFE",
    params: {
      type: "AES",
      size: 256,
      mode: ["ECB", "CBC"],
      purpose: ["encrypt", "decrypt"],
      padding: ["PKCS7"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 `importKey` 方法将现有的 RSA 密钥存储到 keymanager3 数据库中

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "importKey",
  parameters: {
    name: "RSA2048",
    data: base64data,
    params: {
      type: "RSA",
      size: 2048,
      purpose: ["sign", "verify"],
      padding: ["PKCS1"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 `importKey` 方法将现有的 HMAC 密钥存储到 keymanager3 数据库中

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "importKey",
  parameters: {
    name: "HMAC192",
    data: "AAECAwQFBgcICQoLDA0OD/Dg0MCwoJCA",
    params: {
      type: "HMAC",
      size: 192,
      purpose: ["sign", "verify"],
      digest: ["SHA2_256"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 `importKey` 方法将现有的 EC 密钥存储到 keymanager3 数据库中

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "importKey",
  data: "MHgCAQAwEAYHKoZIzj0CAQYFK4EEACEEYTBfAgEBBBzdKeUoBI95MlFJ0fJf7Ny0j2KeaTGWueZpkD1boTwDOgAEwB3KS89AOv+OTGRzshsXPX4CpYJcPIrD6A+z2K0pTBJV/DcefaLag3fhNcFH96jEKcDZxHYNWUA=",
  parameters: {
    name: "EC224",
    params: {
      type: "EC",
      size: 224,
      purpose: ["sign", "verify"],
      padding: "PKCS1",
      digest: ["SHA2_256"],
      curve: "P224",
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回示例

成功返回

```javascript
{
  "returnValue": true
}
```

密钥已存在时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10002,
  "errorText": "Key already exists"
}
```

密钥类型无效时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10010,
  "errorText": "Invalid key type"
}
```

密钥大小无效时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10003,
  "errorText": "Invalid key size"
}
```

用途无效时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10004,
  "errorText": "Invalid purpose"
}
```

不支持该填充方式时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10006,
  "errorText": "Invalid padding"
}
```

## exportKey

描述

使应用能够通过密钥名从现有的密钥对中导出公钥。  

参数

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 必填 | String | 应用想要从中导出公钥的密钥名称。<br><br>注意<br><br>因此，只有 RSA 和 EC 密钥可以导出。 |

调用返回值

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 表示操作的结果。<ul><li>true：操作成功。</li><li>false：操作失败。</li></ul> |
| pubkey | 可选 | String | Base64 编码的<strong>DER</strong>格式公钥。 |
| errorCode | 可选 | Number | 若方法失败，errorCode 包含错误代码。仅当失败时该方法才返回 errorCode。 |
| errorText | 可选 | String | 若方法失败，errorText 包含错误文本。仅当失败时该方法才返回 errorText。 |

错误参考

| 错误代码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| \-10001, -20017 | 更多详情请参见[错误代码参考](#errorcodereference)。 | 更多详情请参见[错误代码参考](#errorcodereference)。 |

示例

使用 `exportKey` 方法获取现有 RSA 密钥的公钥

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "exportKey",
  parameters: {
    name: "RSA1024",
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 `exportKey` 方法获取现有 EC 密钥的公钥

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "exportKey",
  parameters: {
    name: "EC224",
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回示例

成功返回

```javascript
{
    "returnValue": true,
    "pubkey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwfSdrRlE50jwRsj/WJ8rDpGPaFcMn/1XlKRsRqYUKM/cI4x8DXZjBFtedxJwVRHGzODpyCL7LqyaUU4M9W5seNdnZXtQ2Kfyiq7Bx9QIy5Z1G7eif6ZnG2AN4SruJ+P4vfWBlzu9RyufhwybRoCS08oOS9H
yb+uhrFoh7TiQQRx8zGM2j04pNGuuvyjV0MQNuBL8RjCnoBnQX5PnYonQh4NReIcGH/J3C3XdlnrpuhArYb8wMxzQkOAM91wtMPwU2VX8sYLmdnqDrW+LameghtacuAZUUdJnG4ccanmDj1mPAxpWFx8Q3bxm+OStqt1LnQT5vLc7kgoMyfH70h2dTwIDAQAB"
}
```

密钥名不存在时的失败返回

```javascript
{
    "returnValue": false,
    "errorCode": -10001,
    "errorText": "Key not found"
}
```

密钥类型既不是 RSA 也不是 EC 时的失败返回

```javascript
{
    "returnValue": false,
    "errorCode": -20017,
    "errorText": "Get error from keymaster"
}
```

## removeKey

描述

通过密钥名从设备中删除密钥。

参数

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 必填 | String | 要删除的密钥的名称。 |

调用返回值

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 表示操作的结果。<ul><li>true：操作成功。</li><li>false：操作失败。</li></ul> |
| errorCode | 可选 | Number | 若方法失败，errorCode 包含错误代码。仅当失败时该方法才返回 errorCode。 |
| errorText | 可选 | String | 若方法失败，errorText 包含错误文本。仅当失败时该方法才返回 errorText。 |

错误参考

| 错误代码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| \-10000, -10001, -10009 | 更多详情请参见[错误代码参考](#errorcodereference)。 | 更多详情请参见[错误代码参考](#errorcodereference)。 |

示例

使用 `removeKey` 方法删除密钥

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "removeKey",
  parameters: {
    name: "AES256",
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回示例

成功返回

```javascript
{
  "returnValue": true
}
```

密钥名不存在时的失败返回

```javascript
{
    "returnValue": false,
    "errorCode": -10001,
    "errorText": "Key not found"
}
```

## begin

描述

使用指定的密钥，针对指定的用途，并结合指定的参数（视情况而定）开始一项加密操作，并返回一个与 `update` 和 `finish` 一起使用以完成该操作的操作句柄（operation handle）。

参数

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 必填 | String | 要执行加密操作的密钥的名称。 |
| params | 必填 | [Object::ParamSet](#paramset) | 指定与操作关联的授权参数集。由于无法以任何与生成时所指定授权不一致的方式来使用密钥，因此密钥所有者应列出之后会用到的每一项授权参数集。<ul><li>AES<ul><li>要使用 AES，必须设置 "mode"。</li><li>默认填充方式为 None。PKCS7 仅适用于 ECB 或 CBC 模式。</li><li>除 AES-ECB 外，若要解密密文，<strong>必须设置加密操作返回的 iv 值</strong>。（Base64 编码值，明文长度为 CBC、CTR -16字节、GCM-12字节）</li><li>若为 AES-ECB 或 CBC 选择 "None" 作为 "padding"，则输入数据的大小必须是块大小的整数倍。</li></ul></li><li>RSA<ul><li>默认填充方式为 PKCS1。</li><li>默认 digest 为 SHA2_256。</li><li>注意<ul><li>若将 "padding" 设置为 PKCS1_OAEP，则 "digest" 不能设置为 None。</li><li>若将 "padding" 设置为 None，则必须将 "digest" 显式设置为 None。</li></ul></li></ul></li><li>EC<ul><li>对于 EC 算法，"curve" 是必填参数。</li><li>对于 EcDsa 曲线（P224/P256/P384/P521），默认 digest 为 SHA2_256。</li></ul></li><li>HMAC<ul><li>默认 MAC 长度为 32 字节。</li></ul></li></ul> |

调用返回值

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 表示操作的结果。<ul><li>true：操作成功。</li><li>false：操作失败。</li></ul> |
| handle | 可选 | String | 用于与 update 和 finish 方法配合以完成操作的句柄。该句柄是加密操作的上下文。<br>注意<br>handle 的实际数据类型为 uint64，但返回值以字符串形式呈现。 |
| iv | 可选 | String | 对于 AES-CBC/GCM/CTR 加密，若用户未设置 iv 值，将自动生成并返回一个唯一的 iv。 |
| errorCode | 可选 | Number | 若方法失败，errorCode 包含错误代码。仅当失败时该方法才返回 errorCode。 |
| errorText | 可选 | String | 若方法失败，errorText 包含错误文本。仅当失败时该方法才返回 errorText。 |

错误参考

| 错误代码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| \-10001, -10002, -10003, -10004, -10005, -10006, -10007, -10008, -10009, -10010, -10011, -10012, -10016, -10017, -10018, -20033, -20052 | 更多详情请参见[错误代码参考](#errorcodereference)。 | 更多详情请参见[错误代码参考](#errorcodereference)。 |

示例

使用 AES 密钥调用 `begin` 方法进行加密

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "begin",
  parameters: {
    name: "AES256",
    params: {
      type: "AES",
      mode: ["CBC"],
      purpose: ["encrypt"],
      padding: ["PKCS7"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
    // Should parse "iv" param
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 AES 密钥调用 `begin` 方法进行解密

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "begin",
  parameters: {
    name: "AES256",
    params: {
      type: "AES",
      size: 256,
      mode: ["CBC"],
      purpose: ["decrypt"],
      padding: ["PKCS7"],
      iv: "tipAtFblvLXf/iLR8t5dGw==",
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 RSA 密钥调用 `begin` 方法进行签名

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "begin",
  parameters: {
    name: "RSA1024",
    params: {
      type: "RSA",
      purpose: ["sign"],
      padding: ["PKCS1"],
      digest: ["SHA2_256"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 RSA 密钥调用 `begin` 方法进行验证

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "begin",
  parameters: {
    name: "RSA1024",
    params: {
      type: "RSA",
      purpose: ["verify"],
      padding: ["PKCS1"],
      digest: ["SHA2_256"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 HMAC 密钥调用 `begin` 方法进行签名

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "begin",
  parameters: {
    name: "HMAC256",
    params: {
      type: "HMAC",
      purpose: ["sign"],
      digest: ["SHA2_256"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 HMAC 密钥调用 `begin` 方法进行验证

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "begin",
  parameters: {
    name: "HMAC256",
    params: {
      type: "HMAC",
      purpose: ["verify"],
      digest: ["SHA2_256"],
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 EC 密钥调用 `begin` 方法进行签名

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "generateKey",
  parameters: {
    name: "EC256",
    params: {
      type: "EC",
      purpose: ["sign"],
      padding: "PKCS1",
      digest: ["SHA2_512"],
      curve: "P256",
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用 EC 密钥调用 `begin` 方法进行验证

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "generateKey",
  parameters: {
    name: "EC256",
    params: {
      type: "EC",
      purpose: ["verify"],
      padding: "PKCS1",
      digest: ["SHA2_512"],
      curve: "P256",
    },
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回示例

成功返回

```javascript
{
  "returnValue": true,
  "handle": "10699227874884526357"
}
```

携带 iv 值的成功返回

```javascript
{
  "returnValue": true,
  "handle": "10699227874884526357",
  "iv": "tpoUOY8ca/Fd46JGSDKmtw=="
}
```

失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10002,
  "errorText": "Key already exists"
}
```

密钥大小无效时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10003,
  "errorText": "Invalid key size"
}
```

用途无效时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10004,
  "errorText": "Invalid purpose"
}
```

不支持该填充方式时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10006,
  "errorText": "Invalid padding"
}
```

密钥类型无效时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -10010,
  "errorText": "Invalid key type"
}
```

## update

描述

提供数据以处理由 `begin` 方法启动的、正在进行的操作。若返回的 `consumed_size` 与输入数据的完整长度不匹配，你应使用从数据的 `consumed_size` 之后开始的剩余数据，再次调用 `update` 方法。  
不要一次性处理大量数据。若数据大小超过 1M，请将数据拆分，并使用分割后的数据集多次调用 `update` 方法。

参数

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| handle | 必填 | String | 由 begin 方法返回的操作句柄。<br><br>注意<br><br>handle 的实际数据类型为 uint64，但以字符串形式输入。 |
| data | 必填 | String | 要处理的输入数据。必须经过 base64 编码。 |
| aad | 可选 | String | 经过认证但未加密的 aad。仅适用于 AES-GCM 块模式，且必须经过 base64 编码。 |

调用返回值

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 表示操作的结果。<ul><li>true：操作成功。</li><li>false：操作失败。</li></ul> |
| consumed_size | 可选 | String | 方法成功时返回已消耗的大小。<br>注意<br>若该值等于输入的大小，则表示所有输入均已传递。若不等，则应用必须再次调用 update 方法以传递剩余输入。 |
| output | 可选 | String | 方法成功时返回 base64 编码的输出。<br>注意<br>其内容可能是密文、明文或签名。 |
| errorCode | 可选 | Number | 若方法失败，errorCode 包含错误代码。仅当失败时该方法才返回 errorCode。 |
| errorText | 可选 | String | 若方法失败，errorText 包含错误文本。仅当失败时该方法才返回 errorText。 |

错误参考

| 错误代码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| \-10003, -10008, -10009, -10010, -10016, -10017, -20028 | 更多详情请参见[错误代码参考](#errorcodereference)。 | 更多详情请参见[错误代码参考](#errorcodereference)。 |

示例

使用调用 `begin` 方法获取的 handle 调用 `update` 方法

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "update",
  parameters: {
    handle: "10699227874884526357",
    data: "dGVzdCB1cGRhdGUgZGF0YQ==",
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回示例

成功返回

```javascript
{
  "returnValue": true,
  "consumed_size": 16,
  "output": "uvFYV8bL3EByEcswuUOYUg=="
}
```

成功返回

```javascript
{
  "returnValue": true
}
```

handle 无效时的失败返回

```javascript
{
  "errorCode": -20028,
  "errorText": "Get error from keymaster",
  "returnValue": false
}
```

## finish

描述

使用指定的密钥，针对指定的用途，并结合指定的参数（视情况而定）完成一项加密操作。  
不要一次性处理大量数据。若数据大小超过 1M，请将数据拆分，并使用分割后的数据集多次调用 `finish` 方法。

参数

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 必填 | String | 要执行加密操作的密钥的名称。 |
| data | 可选 | String | 要处理的输入数据。必须经过 base64 编码。 |
| signature | 可选 | String | 消息的 Base64 编码签名。<br><br>注意<br><br>signature 仅用于验证目的。 |
| aad | 可选 | String | 经过认证但未加密的 aad。仅适用于 AES-GCM 块模式，且必须经过 base64 编码。 |

调用返回值

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 表示操作的结果。<ul><li>true：操作成功。</li><li>false：操作失败。</li></ul> |
| output | 可选 | String | 方法成功时的 Base64 编码输出。<br>注意<br>其内容可能是密文、明文或签名。 |
| errorCode | 可选 | Number | 若方法失败，errorCode 包含错误代码。仅当失败时该方法才返回 errorCode。 |
| errorText | 可选 | String | 若方法失败，errorText 包含错误文本。仅当失败时该方法才返回 errorText。 |

错误参考

| 错误代码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| \-10008, -10016, -10017, -20030 | 更多详情请参见[错误代码参考](#errorcodereference)。 | 更多详情请参见[错误代码参考](#errorcodereference)。 |

示例

使用调用 `begin` 方法获取的 handle 调用 `finish` 方法

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "finish",
  parameters: {
    handle: "13123551428131904409",
    data: "dGVzdCBmaW5pc2ggZGF0YQ==",
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

使用调用 `begin` 方法获取的 handle 调用 `finish` 方法（用于验证）

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "finish",
  parameters: {
    handle: "13123551428131904409",
    data: "dGVzdCBmaW5pc2ggZGF0YQ==",
    signature:
"jUZPi2UrptakGiThbBFQzOKXRGpRP2Jp3v1HJZPE5Y0s+zexj+i8d57rGQ/EoBCwDtJNCgK8wPa9tF7jWjp3mL41P5xszxXzkvOufZ3nME9zj4SbknBNP2Pw16mjOolp1FF0xau5Zpyotm+7D60nu2tJl9tW1j+7Ck+r1OxmDdMdFNbMBJiClwbk3hFU/wtEF1kbN0Z6+XPfkSu5NAs8O83rMWsoJ4iDmeFoF+T2YZlWQLZM6IvN8KNKnkhkVR86RlBeh7Yu8BF3UpA2poVReRuIOLwz8+MLt00+bgiIAPSIBCDg6En0AKZPTLT1gx7PTHwkB05ReyDEJmGNMbslDA==",
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回示例

用途为加密/解密时的成功返回

```javascript
{
  "returnValue": true,
  "output": "rXXAt28n9kGyNGBK8Ur2fd6eM2FJoPcROwuBMC6l4Cc="
}
```

用途为签名时的成功返回

```javascript
{
  "returnValue": true,
  "output": "jUZPi2UrptakGiThbBFQzOKXRGpRP2Jp3v1HJZPE5Y0s+zexj+i8d57rGQ/EoBCwDtJNCgK8wPa9tF7jWjp3mL41P5xszxXzkvOufZ3nME9zj4SbknBNP2Pw16mjOolp1FF0xau5Zpyotm+7D60nu2tJl9tW1j+7Ck+r1OxmDdMdFNbMBJiClwbk3hFU/
wtEF1kbN0Z6+XPfkSu5NAs8O83rMWsoJ4iDmeFoF+T2YZlWQLZM6IvN8KNKnkhkVR86RlBeh7Yu8BF3UpA2poVReRuIOLwz8+MLt00+bgiIAPSIBCDg6En0AKZPTLT1gx7PTHwkB05ReyDEJmGNMbslDA=="
}
```

用途为验证时的成功返回

```javascript
{
  "returnValue": true
}
```

验证失败时的失败返回

```javascript
{
  "errorCode": -20030,
  "errorText": "Get error from keymaster",
  "returnValue": false
}
```

## abort

描述

中止正在进行的操作。  
一旦你使用某个 handle 调用 abort，该 handle 值将不再可用于加密操作。

参数

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| handle | 必填 | String | 用于中止进行中操作的上下文。<br>注意<br>handle 的实际数据类型为 uint64，但以字符串形式输入。 |

调用返回值

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 表示操作的结果。<ul><li>true：操作成功。</li><li>false：操作失败。</li></ul> |
| errorCode | 可选 | Number | 若方法失败，errorCode 包含错误代码。仅当失败时该方法才返回 errorCode。 |
| errorText | 可选 | String | 若方法失败，errorText 包含错误文本。仅当失败时该方法才返回 errorText。 |

错误参考

| 错误代码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| \-20028 | 更多详情请参见[错误代码参考](#errorcodereference)。 | 更多详情请参见[错误代码参考](#errorcodereference)。 |

示例

当通过调用 `begin` 方法获取的 handle 不再需要时

```javascript
var request = webOS.service.request("luna://com.webos.service.keymanager3", {
  method: "abort",
  parameters: {
    handle: "3901299957133494448",
  },
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回示例

成功返回

```javascript
{
  "returnValue": true
}
```

handle 无效时的失败返回

```javascript
{
  "returnValue": false,
  "errorCode": -20028,
  "errorText": "Get error from keymaster"
}
```

## Object

### ParamSet object

#### 描述

包含密钥或操作参数值的信息。  
由于无法以任何与生成时所指定授权不一致的方式来使用密钥，因此密钥所有者应列出之后会用到的每一项授权参数集。

#### 属性

| 名称 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| type | 必填 | String | 密钥的类型。可能的值有：<ul><li>AES</li><li>RSA</li><li>EC</li><li>HMAC</li></ul> |
| size | 可选 | Number | 密钥的大小。每种密钥类型可能的值如下：<ul><li>AES：128、192、256</li><li>RSA：1024、2048、3072、4096。keymanager3 只能生成 1024 大小。应用可以将生成的 RSA-2048/RSA-3072/RSA-4096 密钥数据导入 keymanager3。</li><li>EC：224、256、384、521。密钥大小由曲线算法决定，因此生成/导入 EC 密钥时无需指定大小。支持的匹配密钥大小为：P224(224)、P256(256)、P384(384)、P521(521)。</li><li>HMAC：最小大小随摘要算法而变化。不过，推荐大小至少为 256（32 字节）。</li></ul> |
| purpose | 可选 | String 数组 | 操作的用途。每种密钥类型可能的值如下：<ul><li>AES：encrypt、decrypt</li><li>RSA：sign、verify、encrypt、decrypt</li><li>EC：sign、verify</li><li>HMAC：sign、verify</li></ul> |
| mode | 可选 | String 数组 | 注意<br>仅适用于 AES 密钥。生成/导入/begin AES 密钥时必须设置。操作的模式。可能的值有：<ul><li>ECB</li><li>CBC</li><li>CTR</li><li>GCM</li></ul> |
| padding | 可选 | String 数组 | 注意<br>密钥的填充模式。可能的值有：<ul><li>AES<ul><li>None</li><li>PKCS7（若未指定 "padding" 则为默认值）（PKCS7 仅适用于 ECB 和 CBC 模式。）</li></ul></li><li>RSA（私钥）<ul><li>None</li><li>PKCS1</li><li>PKCS1_OAEP（若未指定 "padding" 则为默认值）</li></ul></li></ul> |
| digest | 可选 | String 数组 | 签名/验证操作的摘要算法。受支持的密钥类型可能的值如下：<ul><li>RSA：SHA2_224、SHA2_256、SHA2_384、SHA2_512</li><li>EC：SHA2_224、SHA2_256、SHA2_384、SHA2_512</li><li>HMAC：SHA2_256</li></ul> |
| mac_length | 可选 | String | 需要 MAC 的操作（HMAC、AES-GCM）的 MAC 长度。默认情况下，最小 MAC 长度如下：<ul><li>HMAC：64</li><li>RSA：128</li></ul>你可以将该值更新为更大的值。 |
| iv | 可选 | String | 注意<br>仅适用于 AES-CBC、AES-GCM 和 AES-CTR 密钥。若需要使用特定的 iv 值，请使用此参数。若不需要，则在需要使用 iv 值的算法中，keymanager3 会自动生成并返回该值。调用 keymanager3 API 的客户端服务必须自行管理它。<ul><li>对于加密，若未设置 iv 参数，将自动生成并返回一个唯一的 iv 值。（该值将经过 Base64 编码，明文 iv 长度为 CBC、CTR -16字节，或 GCM-12字节。）</li><li>对于解密，必须设置加密时使用的 iv 值。</li></ul> |
| curve | 可选 | String | 注意<br>仅适用于 EC 密钥。指定椭圆曲线算法。生成/导入/begin EC 密钥时必须设置。可能的值有：<ul><li>P224</li><li>P256</li><li>P384</li><li>P521</li></ul> |

## 错误代码参考

| 错误代码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| \-10000 | not implemented | 不支持此功能。 |
| \-10001 | key not found | 找不到该密钥。 |
| \-10002 | key already exists | 已存在同名密钥。 |
| \-10003 | invalid key size | 不支持所选的密钥大小。 |
| \-10004 | invalid purpose | 不支持所选的用途。 |
| \-10005 | invalid mode | 不支持所选的操作模式。 |
| \-10006 | invalid padding | 不支持的填充方式。 |
| \-10007 | invalid digest | 不支持所选的摘要算法。 |
| \-10008 | invalid data size | 数据大小过大。 |
| \-10009 | not supported parameter | 数据大小过大或与所选算法不匹配。 |
| \-10010 | Invalid key type | 不支持的密钥类型。 |
| \-10011 | Failed to encrypt key | 密钥加密失败。 |
| \-10012 | Failed to decrypt key | 密钥解密失败。 |
| \-10016 | Base64 encoding is failed | 数据 Base64 编码失败。 |
| \-10017 | Base64 decoding is failed | 数据 Base64 解码失败。 |
| \-10018 | Invalid EC curve | 不支持的 EC 曲线。 |
| \-20009 | Get error from keymaster | 不支持所选的 MAC 长度。 |
| \-20010 | Get error from keymaster | 不支持的填充模式。 |
| \-20011 | Get error from keymaster | 所选填充模式不兼容。 |
| \-20012 | Get error from keymaster | 不支持的摘要模式。 |
| \-20013 | Get error from keymaster | 所选摘要模式不兼容。 |
| \-20017 | Get error from keymaster | 不支持的密钥类型。 |
| \-20019 | Get error from keymaster | 所选密钥类型不支持加密。 |
| \-20020 | Get error from keymaster | 所选密钥类型不支持验证。 |
| \-20021 | Get error from keymaster | 输入的数据大小无效。 |
| \-20028 | Get error from keymaster | handle 无效。 |
| \-20030 | Get error from keymaster | 验证失败。 |
| \-20033 | Get error from keymaster | 密钥数据已损坏或无效。 |
| \-20052 | Get error from keymaster | 未设置 IV 值。 |
