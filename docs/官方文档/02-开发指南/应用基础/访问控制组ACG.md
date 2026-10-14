# 访问控制组（ACG）指南
> 原文链接: https://webostv.developer.lge.com/develop/guides/acg-guide ｜ 简体中文翻译

**访问控制组（Access Control Group，ACG）** 是在调用 webOS 的服务总线系统 Luna Bus API 时所必需的一种权限控制机制。ACG 有助于保护对敏感数据和受限操作的访问，从而支持用户隐私和系统安全。

Luna 服务会根据功能对 API 进行分组，应用则依据所声明的组名获得对这些 API 的访问权限。随后，webOS 系统会验证发起请求的应用是否拥有相应的权限，从而提升对潜在的敏感或高风险应用行为的透明度和可控性。

## 平台支持

| **webOS 版本** | **ACG 支持** | **备注** |
| --- | --- | --- |
| webOS TV 25 或更低版本 | 不支持 |  |
| webOS TV 26 Re:New | 支持 | 可使用 ACG 强制机制。如果在 _appinfo.json_ 中添加了 `**requiredACG**` 字段，则会应用并可测试 ACG 权限。这允许在 webOS TV 27 将其设为强制要求之前进行早期采用和验证。 |
| webOS TV 27 或更高版本 | 必需 | 所有应用都必须在 _appinfo.json_ 中包含 `**requiredACG**` 字段——即使它们没有进行任何 Luna API 调用也是如此。`**requiredACG**` 字段是 Seller Lounge（卖方休息室）资格检查中的必填项，因此缺少该字段的应用将无法通过验证，也无法提交。 |

> **重要提示（Important）**
>
> 在 webOS TV 27 或更高版本上，对于所有应用（包括那些不调用任何 Luna API 的应用），`**requiredACG**` 字段都是 Seller Lounge 资格检查中的必填项。如果您的应用不使用 Luna API，请声明一个空数组（`**"requiredACG": []**`）。缺少此字段的应用将无法通过资格验证，也无法提交。

## API ACG 列表

下表列出了每个公开可用的 Luna 服务方法所对应的 ACG 组。请参考此表来确定您的应用所使用的方法需要哪些 ACG 组。

| API 名称 | 服务 | 方法 | ACG |
| --- | --- | --- | --- |
| [Activity Manager](../../03-API参考/应用与系统/ActivityManagerAPI参考.md) | com.palm.activitymanager | [adopt](../../03-API参考/应用与系统/ActivityManagerAPI参考.md#adopt) | activity.operation |
|  |  | [cancel](../../03-API参考/应用与系统/ActivityManagerAPI参考.md#cancel) | activity.operation |
|  |  | [complete](../../03-API参考/应用与系统/ActivityManagerAPI参考.md#complete) | activity.operation |
|  |  | [create](../../03-API参考/应用与系统/ActivityManagerAPI参考.md#create) | activity.operation |
|  |  | [release](../../03-API参考/应用与系统/ActivityManagerAPI参考.md#release) | activity.operation |
|  |  | [start](../../03-API参考/应用与系统/ActivityManagerAPI参考.md#start) | activity.operation |
|  |  | [stop](../../03-API参考/应用与系统/ActivityManagerAPI参考.md#stop) | activity.operation |
| [Application Manager](../../03-API参考/应用与系统/ApplicationManager应用管理器.md) | com.webos.applicationManager | [launch](../../03-API参考/应用与系统/ApplicationManager应用管理器.md#launch) | application.launcher |
|  |  | [getAppLoadStatus](../../03-API参考/应用与系统/ApplicationManager应用管理器.md#getapploadstatus) | application.query |
| [Audio](../../03-API参考/媒体与数据/Audio音频.md) | com.webos.audio | [setMuted](../../03-API参考/媒体与数据/Audio音频.md#setmuted) | audio.operation |
|  |  | [volumeDown](../../03-API参考/媒体与数据/Audio音频.md#volumedown) | audio.operation |
|  |  | [volumeUp](../../03-API参考/媒体与数据/Audio音频.md#volumeup) | audio.operation |
| [BLE GATT](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md) | com.webos.service.blegatt | [isEnabled](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#isenabled) | blegatt.query |
|  |  | [startScan](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#startscan) | blegatt.operation |
|  |  | [stopScan](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#stopscan) | blegatt.operation |
|  |  | [getState](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#getstate) | blegatt.query |
|  |  | [pair](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#pair) | blegatt.operation |
|  |  | [unpair](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#unpair) | blegatt.operation |
|  |  | [client/connect](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#clientconnect) | blegatt.operation |
|  |  | [client/disconnect](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#clientdisconnect) | blegatt.operation |
|  |  | [client/discoverServices](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#clientdiscoverservices) | blegatt.operation |
|  |  | [client/getServices](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#clientgetservices) | blegatt.query |
|  |  | [client/setCharacteristicNotification](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#clientsetcharacteristicnotification) | blegatt.operation |
|  |  | [client/readCharacteristic](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#clientreadcharacteristic) | blegatt.operation |
|  |  | [client/readDescriptor](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#clientreaddescriptor) | blegatt.operation |
|  |  | [client/writeCharacteristic](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#clientwritecharacteristic) | blegatt.operation |
|  |  | [client/writeDescriptor](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md#clientwritedescriptor) | blegatt.operation |
| [Connection Manager](../../03-API参考/应用与系统/ConnectionManager连接管理器.md) | com.palm.connectionmanager | [getStatus](../../03-API参考/应用与系统/ConnectionManager连接管理器.md#getstatus) | network.query |
| [Database](../../03-API参考/媒体与数据/Database数据库.md) | com.palm.db | [batch](../../03-API参考/媒体与数据/Database数据库.md#batch) | database.operation |
|  |  | [del](../../03-API参考/媒体与数据/Database数据库.md#del) | database.operation |
|  |  | [delKind](../../03-API参考/媒体与数据/Database数据库.md#delkind) | database.operation |
|  |  | [find](../../03-API参考/媒体与数据/Database数据库.md#find) | database.operation |
|  |  | [get](../../03-API参考/媒体与数据/Database数据库.md#get) | database.operation |
|  |  | [merge](../../03-API参考/媒体与数据/Database数据库.md#merge) | database.operation |
|  |  | [put](../../03-API参考/媒体与数据/Database数据库.md#put) | database.operation |
|  |  | [putKind](../../03-API参考/媒体与数据/Database数据库.md#putkind) | database.operation |
|  |  | [putPermissions](../../03-API参考/媒体与数据/Database数据库.md#putpermissions) | database.operation |
|  |  | [reserveIds](../../03-API参考/媒体与数据/Database数据库.md#reserveids) | database.operation |
|  |  | [search](../../03-API参考/媒体与数据/Database数据库.md#search) | database.operation |
|  |  | [watch](../../03-API参考/媒体与数据/Database数据库.md#watch) | database.operation |
| [Device Unique ID](../../03-API参考/应用与系统/DeviceUniqueID设备唯一标识.md) | com.webos.service.sm | [deviceid/getIDs](../../03-API参考/应用与系统/DeviceUniqueID设备唯一标识.md#getids) | deviceinfo.query |
| [DRM](../../03-API参考/DRM与安全/DRM数字版权管理.md) | com.webos.service.drm | [load](../../03-API参考/DRM与安全/DRM数字版权管理.md#load) | drm.operation |
|  |  | [unload](../../03-API参考/DRM与安全/DRM数字版权管理.md#unload) | drm.operation |
|  |  | [isLoaded](../../03-API参考/DRM与安全/DRM数字版权管理.md#isloaded) | drm.query |
|  |  | [sendDrmMessage](../../03-API参考/DRM与安全/DRM数字版权管理.md#senddrmmessage) | drm.operation |
|  |  | [getRightsError](../../03-API参考/DRM与安全/DRM数字版权管理.md#getrightserror) | drm.query |
| [Keymanager3](../../03-API参考/DRM与安全/Keymanager3密钥管理器.md) | com.webos.service.keymanager3 | [generateKey](../../03-API参考/DRM与安全/Keymanager3密钥管理器.md#generatekey) | securitykey.operation |
|  |  | [importKey](../../03-API参考/DRM与安全/Keymanager3密钥管理器.md#importkey) | securitykey.operation |
|  |  | [exportKey](../../03-API参考/DRM与安全/Keymanager3密钥管理器.md#exportkey) | securitykey.operation |
|  |  | [removeKey](../../03-API参考/DRM与安全/Keymanager3密钥管理器.md#removekey) | securitykey.operation |
|  |  | [begin](../../03-API参考/DRM与安全/Keymanager3密钥管理器.md#begin) | securitykey.operation |
|  |  | [update](../../03-API参考/DRM与安全/Keymanager3密钥管理器.md#update) | securitykey.operation |
|  |  | [finish](../../03-API参考/DRM与安全/Keymanager3密钥管理器.md#finish) | securitykey.operation |
|  |  | [abort](../../03-API参考/DRM与安全/Keymanager3密钥管理器.md#abort) | securitykey.operation |
| [Media Database](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md) | com.webos.mediadb | [batch](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#batch) | mediadatabase.operation |
|  |  | [del](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#del) | mediadatabase.operation |
|  |  | [delKind](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#delkind) | mediadatabase.operation |
|  |  | [find](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#find) | mediadatabase.operation |
|  |  | [get](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#get) | mediadatabase.operation |
|  |  | [merge](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#merge) | mediadatabase.operation |
|  |  | [put](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#put) | mediadatabase.operation |
|  |  | [putKind](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#putkind) | mediadatabase.operation |
|  |  | [putPermissions](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#putpermissions) | mediadatabase.operation |
|  |  | [reserveIds](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#reserveids) | mediadatabase.operation |
|  |  | [search](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#search) | mediadatabase.operation |
|  |  | [watch](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md#watch) | mediadatabase.operation |
| [Magic Remote](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md) | com.webos.service.mrcu | [getAPIVersion](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md#getapiversion) | mrcu.query |
|  |  | [sensor2/getSensorEventData](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md#sensor2getsensoreventdata) | mrcu.query |
|  |  | [sensor2/cancelSensorDataSubscribe](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md#sensor2cancelsensordatasubscribe) | mrcu.operation |
|  |  | [sensor2/getSensorState](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md#sensor2getsensorstate) | mrcu.query |
|  |  | [sensor2/getSensorInterval](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md#sensor2getsensorinterval) | mrcu.query |
|  |  | [sensor2/setSensorInterval](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md#sensor2setsensorinterval) | mrcu.operation |
|  |  | [sensor2/resetQuaternion](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md#sensor2resetquaternion) | mrcu.operation |
|  |  | [sensor/getSensorData](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md#sensorgetsensordata) | mrcu.query |
|  |  | [sensor/resetQuaternion](../../03-API参考/无线与输入/MagicRemote魔法遥控器.md#sensorresetquaternion) | mrcu.operation |
| [Settings Service](../../03-API参考/应用与系统/SettingsService设置服务.md) | com.webos.settingsservice | [getSystemSettings](../../03-API参考/应用与系统/SettingsService设置服务.md#getsystemsettings) | settings.query |
| [System Service](../../03-API参考/应用与系统/SystemService系统服务.md) | com.palm.systemservice | [time/getSystemTime](../../03-API参考/应用与系统/SystemService系统服务.md#timegetsystemtime) | time.query |
| [TV Device Information](../../03-API参考/应用与系统/TVDeviceInformation电视设备信息.md) | com.webos.service.tv.systemproperty | [getSystemInfo](../../03-API参考/应用与系统/TVDeviceInformation电视设备信息.md#getsysteminfo) | systemconfig.query |

## webOSTV.js API ACG 列表

webOSTV.js 库中的某些方法（`webOS` 和 `webOSDev` 对象）会在内部调用 Luna 服务。即使您的应用不直接使用 `webOS.service.request()`，调用这些库方法也会在底层触发 Luna API 调用，因此您必须在 _appinfo.json_ 的 `requiredACG` 字段中声明相应的 ACG 组。请参考下表来确定您的应用使用了哪些方法，并声明所有相关的 ACG 组。标记为 `None` 的方法不会调用任何 Luna 服务，也无需进行 ACG 声明。webOSTV.js 版本（webOSTV.js Version）列指示了每个库版本所需的 ACG 组——随着库的演进，某些方法会在内部调用额外的 Luna API，从而需要声明更多的 ACG。

### webOS API

| 方法 | 所需 ACG 组 | webOSTV.js 版本 |
| --- | --- | --- |
| deviceInfo | systemconfig.query | v1.0.0 ~ v1.2.5 |
|  | systemconfig.query, settings.query, arc.query, externalinput.query | v1.2.6 ~ v1.2.12 |
|  | systemconfig.query, settings.query, arc.query, externalinput.query, profile.query | v1.2.13+ |
| fetchAppId | None | v1.0.0+ |
| fetchAppInfo | None | v1.0.0+ |
| fetchAppRootPath | None | v1.0.0+ |
| platformBack | None | v1.0.0+ |
| systemInfo | None | v1.0.0+ |
| keyboard.isShowing | None | v1.0.0+ |
| service.request | 取决于目标 API（Depends on the target API） | v1.0.0+ |

### webOSDev API

| 方法 | 所需 ACG 组 | webOSTV.js 版本 |
| --- | --- | --- |
| launch | application.launcher | v1.0.0+ |
| launchParams | None | v1.0.0+ |
| LGUDID | deviceinfo.query | v1.0.0+ |
| connection.getStatus | network.query | v1.0.0+ |
| drmAgent.getClientId | drm.operation | v1.0.0+ |
| drmAgent.getDrmType | None | v1.0.0+ |
| drmAgent.getErrorCode | drm.operation, drm.query | v1.0.0+ |
| drmAgent.getErrorText | drm.operation, drm.query | v1.0.0+ |
| drmAgent.getRightsError | drm.query | v1.0.0+ |
| drmAgent.load | drm.operation | v1.0.0+ |
| drmAgent.isLoaded | drm.query | v1.0.0+ |
| drmAgent.sendDrmMessage | drm.operation | v1.0.0+ |
| drmAgent.unload | drm.operation | v1.0.0+ |

## 实现（Implementation）

### 第一步：为您的 API 查找 ACG 组

请参阅上文中的「API ACG 列表」表，为您的应用将要调用的每个 Luna API 查找对应的 ACG 组。例如，要查询网络状态并在数据库中存储数据，您的应用将使用以下 API：

| 服务 | 方法 | ACG |
| --- | --- | --- |
| com.palm.connectionmanager | getStatus | network.query |
| com.palm.db | put | database.operation |

### 第二步：在 appinfo.json 中声明 ACG 权限

将 ACG 组值添加到应用的 _appinfo.json_ 中的 `requiredACG` 数组中：

```json
{
  "id": "com.example.myapp",
  "version": "1.0.0",
  "vendor": "My Company",
  "type": "web",
  "title": "My App",
  "main": "index.html",
  "requiredACG": [
    "network.query",
    "database.operation"
  ]
}
```

如果您的应用不调用任何 Luna API，请声明一个空数组：

```json
{
  "id": "com.example.myapp",
  "version": "1.0.0",
  "vendor": "My Company",
  "type": "web",
  "title": "My App",
  "main": "index.html",
  "requiredACG": []
}
```

### 第三步：从您的应用中调用 Luna API

一旦声明了 ACG 权限，您就可以在应用代码中调用这些 API。

#### 使用 webOS.service.request（直接调用 Luna API）

```js
// 所需 ACG：network.query
var request = webOS.service.request("luna://com.palm.connectionmanager", {
  method: "getStatus",
  parameters: {
    subscribe: false
  },
  onSuccess: function (response) {
    console.log("Network status:", response.isInternetConnectionAvailable);
    console.log("WiFi state:", response.wifi.state);
  },
  onFailure: function (error) {
    console.error("Failed to get network status:", error.errorCode, error.errorText);
  }
});
```

#### 使用 webOSTV.js 库方法

以下示例使用了 webOSTV.js 库中会在内部调用 Luna API 的方法。即使您的代码没有直接调用 `webOS.service.request()`，也必须声明所需的 ACG 组。

```js
// 所需 ACG：systemconfig.query, settings.query, arc.query, externalinput.query, profile.query
webOS.deviceInfo(function (info) {
  console.log("Model:", info.modelName);
  console.log("SDK Version:", info.sdkVersion);
  console.log("UHD:", info.uhd);
  console.log("Dolby Atmos:", info.dolbyAtmos);
});
```

```js
// 所需 ACG：application.launcher
webOSDev.launch({
  id: webOSDev.APP.BROWSER,
  params: {
    target: 'https://www.example.com',
  },
  onSuccess(res) {
    console.log('Browser launched');
  },
  onFailure(res) {
    console.error('Launch failed:', res.errorText);
  },
});
```

### 第四步：带有应用内服务（in-app service）的应用

如果您的应用包含一个会调用 Luna API 的应用内服务，则该服务所需的 ACG 组也必须在该应用的 _appinfo.json_ 中声明。请参阅「API ACG 列表」表，为该服务调用的每个 Luna API 查找对应的 ACG 组，并将它们与您的应用本身所需的任何组一起添加到 `requiredACG` 字段中。

以下示例展示了一个调用 Device Unique ID API（`deviceid/getIDs`）来获取设备 LGUDID 的应用内服务。

#### 带有应用内服务的应用的 appinfo.json

```json
{
  "id": "com.example.myapp",
  "version": "1.0.0",
  "vendor": "My Company",
  "type": "web",
  "title": "My App",
  "main": "index.html",
  "requiredACG": [
    "deviceinfo.query"
  ]
}
```

#### 应用内服务代码

```js
// services/com.example.myapp.service/service.js
var Service = require("webos-service");
var service = new Service("com.example.myapp.service");

service.register("getDeviceId", function (message) {
  // 所需 ACG：deviceinfo.query（已在应用的 appinfo.json 中声明）
  service.call("luna://com.webos.service.sm/deviceid/getIDs", {
    idType: ["LGUDID"]
  }, function (response) {
    if (response.payload.returnValue) {
      var idList = response.payload.idList;
      message.respond({
        returnValue: true,
        idList: idList
      });
    } else {
      message.respond({
        returnValue: false,
        errorCode: response.payload.errorCode,
        errorText: response.payload.errorText
      });
    }
  });
});
```

## 验证（Verification）

如果某个 ACG 组未被声明，API 调用将返回如下错误：

```json
{
  "errorCode": -1,
  "returnValue": false,
  "errorText": "Denied method call \"{method}\" for category \"/\""
}
```

### 如何识别缺失的 ACG 组

1. 检查错误消息——它包含了被拒绝的方法名（`{method}`）。
2. 在上文中的「API ACG 列表」表中查找该方法。
3. 记下对应的 ACG 列的值。
4. 将缺失的 ACG 组添加到 _appinfo.json_ 中的 `requiredACG` 数组中。

## 常见问题（FAQ）

**问：我的应用发布后，还可以再添加 ACG 组吗？**

可以。请更新 _appinfo.json_ 中的 `requiredACG` 字段，并通过 Seller Lounge 提交一个新版本。更新后的权限将在新版本获批后生效。

**问：我需要为我的应用内服务单独进行 ACG 声明吗？**

不需要。所有 ACG 组（既包括应用的，也包括其应用内服务的）都必须在应用的 _appinfo.json_ 中声明。应用内服务没有自己独立的 ACG 声明。

**问：我的应用不使用任何 Luna API，还需要 `requiredACG` 吗？**

在 webOS TV 27 或更高版本上，无论应用是否调用 Luna API，`requiredACG` 字段对所有应用都是必填的。如果您的应用不使用任何 Luna API，请声明一个空数组：

```json
{
  "id": "com.example.simpleapp",
  "version": "1.0.0",
  "vendor": "My Company",
  "type": "web",
  "title": "Simple App",
  "main": "index.html",
  "requiredACG": []
}
```

**问：我的应用在 webOS TV 25 上无需 ACG 也能正常运行，我需要更新它吗？**

如果您计划支持 webOS TV 26 或更高版本，那么答案是肯定的。虽然在 webOS TV 26 上，您的应用即使没有 ACG 声明也可能仍然可以运行，但在 webOS TV 27 或更高版本上，`requiredACG` 字段是 Seller Lounge 资格检查中的必填项。所有应用都必须包含此字段——即使是空数组——否则将无法通过验证，也无法提交。

**问：我如何知道某个 API 属于哪个 ACG 组？**

请参阅本文档中的「API ACG 列表」表。每个 API 都映射到了其对应的 ACG 组。
