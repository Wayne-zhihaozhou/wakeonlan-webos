# Luna Service API 简介
> 原文链接: https://webostv.developer.lge.com/develop/references/luna-service-introduction ｜ 简体中文翻译

webOS TV 提供 Luna Service，它由 webOS TV 所需的基本服务与功能组成。每项服务与功能都为你提供应用程序编程接口（API）及其方法。借助这些 Luna service API，你可以从相应的服务请求数据，并将响应信息用于你的应用。

## 支持的 Luna Service API

webOS TV 目前提供以下 API。更多的服务与 API 正在推出中。

| API 名称 | 描述 |
| --- | --- |
| [Activity Manager](../应用与系统/ActivityManagerAPI参考.md) | Activity Manager 负责协调系统中的工作。这包括当前正在进行的工作，以及计划在将来某个时间点执行的工作。 |
| [Application Manager](../应用与系统/ApplicationManager应用管理器.md) | 提供以下方法：根据请求的命令和资源类型隐式启动常驻应用，或显式启动指定的应用 |
| [Audio](../媒体与数据/Audio音频.md) | 提供用于音量控制的方法。 |
| [BLE GATT](../无线与输入/BLEGATT蓝牙服务.md) | 提供用于 BLE GATT 的方法。 |
| [Camera](../媒体与数据/Camera摄像头.md) | 提供返回摄像头与麦克风信息的方法。 |
| [Connection Manager](../应用与系统/ConnectionManager连接管理器.md) | 提供可用 Internet 连接的状态。 |
| [Database](../媒体与数据/Database数据库.md) | 使应用能够存储持久化数据。 |
| [Device Unique ID](../应用与系统/DeviceUniqueID设备唯一标识.md) | 提供用于设备标识的方法。 |
| [DRM](../DRM与安全/DRM数字版权管理.md) | 提供用于管理 DRM 客户端、发送 DRM 消息以及订阅 DRM 权限错误信息的方法。 |
| [Keymanager3](../DRM与安全/Keymanager3密钥管理器.md) | 提供用于生成和删除密钥、加密和解密、生成和验证签名等的方法。 |
| [Media Database](../媒体与数据/MediaDatabase媒体数据库.md) | 使应用能够持久化存储与媒体相关的大型数据集。 |
| [Magic Remote](../无线与输入/MagicRemote魔法遥控器.md) | 提供与魔术遥控器相关的功能，例如传感器与配对。 |
| [Settings Service](../应用与系统/SettingsService设置服务.md) | 提供用于获取系统设置值的方法。 |
| [System Service](../应用与系统/SystemService系统服务.md) | 提供有关系统时间的信息。 |
| [TV Device Information](../应用与系统/TVDeviceInformation电视设备信息.md) | 提供用于获取电视系统信息的方法。 |

### webOS TV 设备上的 API 兼容性

下表显示各 API 在 webOS TV 平台上的支持情况。

| API 名称 | 在 webOS TV 中受支持 |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1.x | 2.x | 3.x | 4.x | 5.x | 6.x | 22 | 23 | 24 | 25 |  |
| [Activity Manager](../应用与系统/ActivityManagerAPI参考.md) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [Application Manager](../应用与系统/ApplicationManager应用管理器.md) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [Audio](../媒体与数据/Audio音频.md) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [BLE GATT](../无线与输入/BLEGATT蓝牙服务.md) | No | No | No | No | No | No | No | No | Yes | Yes |
| [Camera](../媒体与数据/Camera摄像头.md) | Yes | Yes | Yes | Deprecated | Deprecated | Deprecated | Deprecated | Deprecated | Deprecated | Deprecated |
| [Connection Manager](../应用与系统/ConnectionManager连接管理器.md) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [Database](../媒体与数据/Database数据库.md) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [Device Unique ID](../应用与系统/DeviceUniqueID设备唯一标识.md) | No | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [DRM](../DRM与安全/DRM数字版权管理.md) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [Keymanager3](../DRM与安全/Keymanager3密钥管理器.md) | No | No | No | No | No | No | No | No | Yes | Yes |
| [Media Database](../媒体与数据/MediaDatabase媒体数据库.md) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [Magic Remote](../无线与输入/MagicRemote魔法遥控器.md) | Partially | Partially | Partially | Partially | Partially | Partially | Partially | Partially | Yes | Yes |
| [Settings Service](../应用与系统/SettingsService设置服务.md) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [System Service](../应用与系统/SystemService系统服务.md) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| [TV Device Information](../应用与系统/TVDeviceInformation电视设备信息.md) | Partially | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |

### webOS TV 模拟器上的 API 兼容性

下表显示各 API 当前在模拟器上的支持情况。

| API 名称 | 在 webOS TV 模拟器中受支持 |
| --- | --- |
| [Activity Manager](../应用与系统/ActivityManagerAPI参考.md) | Yes |
| [Application Manager](../应用与系统/ApplicationManager应用管理器.md) | Yes |
| [Audio](../媒体与数据/Audio音频.md) | No |
| [BLE GATT](../无线与输入/BLEGATT蓝牙服务.md) | No |
| [Camera](../媒体与数据/Camera摄像头.md) | No |
| [Connection Manager](../应用与系统/ConnectionManager连接管理器.md) | Yes |
| [Database](../媒体与数据/Database数据库.md) | Yes |
| [Device Unique ID](../应用与系统/DeviceUniqueID设备唯一标识.md) | Yes |
| [DRM](../DRM与安全/DRM数字版权管理.md) | No |
| [Keymanager3](../DRM与安全/Keymanager3密钥管理器.md) | No |
| [Media Database](../媒体与数据/MediaDatabase媒体数据库.md) | Yes |
| [Magic Remote](../无线与输入/MagicRemote魔法遥控器.md) | Partially (only getSensorData) |
| [Settings Service](../应用与系统/SettingsService设置服务.md) | Yes |
| [System Service](../应用与系统/SystemService系统服务.md) | Yes |
| [TV Device Information](../应用与系统/TVDeviceInformation电视设备信息.md) | Yes |

### webOS TV 仿真器上的 API 兼容性

下表显示各 API 当前在仿真器上的支持情况。

| API 名称 | 在 webOS TV 仿真器中受支持 |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| 1.2 | 2.x | 3.x | 4.x | 5.x | 6.x |  |
| [Activity Manager](../应用与系统/ActivityManagerAPI参考.md) | Yes | Yes | Yes | Yes | Yes | Yes |
| [Application Manager](../应用与系统/ApplicationManager应用管理器.md) | Yes | Yes | Yes | Yes | Yes | Yes |
| [Audio](../媒体与数据/Audio音频.md) | Yes | Yes | Yes | Yes | Yes | Yes |
| [BLE GATT](../无线与输入/BLEGATT蓝牙服务.md) | No | No | No | No | No | No |
| [Camera](../媒体与数据/Camera摄像头.md) | No | No | No | No | No | No |
| [Connection Manager](../应用与系统/ConnectionManager连接管理器.md) | Partially | Partially | Partially | Partially | Partially | Partially |
| [Database](../媒体与数据/Database数据库.md) | Yes | Yes | Yes | Yes | Yes | Yes |
| [Device Unique ID](../应用与系统/DeviceUniqueID设备唯一标识.md) | No | No | No | Yes | Yes | Yes |
| [DRM](../DRM与安全/DRM数字版权管理.md) | No | No | No | No | No | No |
| [Keymanager3](../DRM与安全/Keymanager3密钥管理器.md) | No | No | No | No | No | No |
| [Media Database](../媒体与数据/MediaDatabase媒体数据库.md) | Yes | Yes | Yes | Yes | Yes | Yes |
| [Magic Remote](../无线与输入/MagicRemote魔法遥控器.md) | No | No | No | No | No | No |
| [Settings Service](../应用与系统/SettingsService设置服务.md) | Yes | Yes | Yes | Yes | Yes | Partially |
| [System Service](../应用与系统/SystemService系统服务.md) | Yes | Yes | Yes | Yes | Yes | Yes |
| [TV Device Information](../应用与系统/TVDeviceInformation电视设备信息.md) | Partially | Partially | Partially | Partially | Partially | Yes |

## API 服务调用的基本要素

### 服务 URI

服务 URI 是指向服务的 URI，其形式如下：

```shell
luna://service name
```

例如，

```shell
luna://com.webos.mediadb
```

### 参数

参数是服务请求选项，以 JSON 对象的形式传递。它们由服务请求所需的属性以及少量对所有服务请求都通用的保留属性组成。

### 方法名称

所调用的 API 服务方法。方法名称既可作为 URI 的一部分传递，也可作为参数对象的属性单独传递。

### Subscribe 属性

'subscribe' 属性是参数对象的保留属性，可以发送给允许订阅的服务。如果 subscribe 属性设置为 true，该方法会保留在内存中，并按固定周期返回响应，或在其数据更新时返回响应。

### Resubscribe 属性

'resubscribe' 属性是参数对象的保留属性，与 'subscribe' 属性一起使用。如果 resubscribe 设置为 true，它会在发生故障后重新订阅某个方法。

### 成功回调

'onSuccess' 属性是参数对象的保留属性，用于设置一个回调函数，当请求成功时会调用该函数。此函数会接收一个包含服务响应数据的 JSON 对象。

### 失败回调

'onFailure' 属性是参数对象的保留属性，用于设置一个函数，当请求失败时会调用该函数。此函数会接收一个包含服务错误详情的 JSON 对象。

### 完成回调

'onComplete' 属性是参数对象的保留属性，用于设置一个函数，当请求完成时（无论成功还是失败）会调用该函数。

### 请求对象

服务请求调用返回的对象。它可用于取消服务请求以及任何关联的订阅。

### 响应对象

包含服务响应数据的 JSON 对象。它有一个保留属性 'returnValue'，用于指示调用的成功或失败。

如果 returnValue 设置为 false，则表示调用失败，响应对象可能包含更多属性，例如 errorCode 和 errorText，用于提供有关该错误的更多信息。

如果 'returnValue' 为 true，则调用成功，响应对象可能根据所发起的 API 调用而具有附加属性。如果参数中的 subscribe 属性设置为 true，响应对象会返回一个 subscribed 属性，用于指示订阅是否成功。subscribed 的值为 true 表示订阅成功。

## 从任意 Web 应用程序调用 webOS 服务

webOSTV.js 是一个专用于 webOS TV 的可移植库。任何应用都可以引入 webOSTV.js，并且你可以使用 webOS.service.request API 发起 webOS 服务调用。

从 webOS TV 4.0 起，我们提供 webOSTV.js 库来取代 webOS.js 库。Bootplate-web 模板在其 webOSTVjs-x.x.x 目录中包含 webOSTV.js 库。你可以按如下方式将此库添加到你的应用：

```js
<script type="text/javascript" src="webOSTVjs-1.1.1/webOSTV.js"></script>
```

有关 webOSTV.js 的更多详细信息，请参阅 [webOSTV.js](../webOSTV.js库/webOSTV.js库简介.md) 指南。以下代码片段展示了如何使用 webOSTV.js 调用 webOS 服务。

```js
var request = webOS.service.request("luna://com.mycom.helloworld.service", {
    method:"hello",
    parameters: {"input": inputMessage},

    onSuccess: function (args) {
        //TO-DO
    },

    onFailure: function(inError) {
        //TO-DO
    },

    onComplete: function(inResponse) {
        //....
    },

    subscribe: subscribeStatus ,
    resubscribe: resubscribeStatus
});
```

重要

**隐式对象**

（用于 Luna API 调用）

**可能会在你获取返回数据之前被垃圾回收（GC）**

因此，我们建议

**使用变量来调用或订阅 Luna API**

正如上面的代码示例所示。

## 使用 Enact 调用 webOS 服务

要使用 Enact 框架调用 webOS 服务，请参阅以下文档。

| 文档 | URL |
| --- | --- |
| webOS Support Module | [http://enactjs.com/docs/developer-guide/webos/](http://enactjs.com/docs/developer-guide/webos/) |
| webOS Library | [http://enactjs.com/docs/modules/webos/LS2Request/](http://enactjs.com/docs/modules/webos/LS2Request/) |
