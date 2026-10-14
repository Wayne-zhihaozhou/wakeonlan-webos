# Magic Remote API 参考
> 原文链接: https://webostv.developer.lge.com/develop/references/magic-remote ｜ 简体中文翻译

服务 URI - luna://com.webos.service.mrcu

提供与 Magic Remote 传感器相关的方法。该服务用于检查来自 Magic Remote 的传感器数据，或停止接收来自 Magic Remote 的传感器数据。<br>该 API 包含用于运动传感器（Motion Sensor）的方法，可提供光标输出以及不同类型的运动数据。有关运动传感器的更多信息（例如使用场景以及如何在应用中实现），请参阅 [Motion Sensor 概览](../../02-开发指南/型号特性/动作传感器概述.md)。

注意

[sensor/getSensorData](#getsensordata) 和 [sensor/resetQuaternion](#resetquaternion) 可能很快会被弃用。因此，强烈建议不要使用这些方法。

方法

| 方法 | 描述 | 模拟器是否支持 |
| --- | --- | --- |
| [getAPIVersion](#getapiversion)<br>* | 获取 MRCU API 版本。 | 否 |
| [sensor2/getSensorEventData](#getsensoreventdata)<br>* | 订阅来自 Magic Remote 的传感器数据。 | 否 |
| [sensor2/cancelSensorDataSubscribe](#cancelsensordatasubscribe)<br>* | 取消当前正在订阅的应用或服务的订阅。 | 否 |
| [sensor2/getSensorState](#getsensorstate)<br>* | 通知遥控器上运动传感器的当前状态。 | 否 |
| [sensor2/getSensorInterval](#getsensorinterval)<br>* | 在对应的区间范围内，将运动传感器的回调间隔更改为所需的值。 | 否 |
| [sensor2/setSensorInterval](#setsensorinterval)<br>* | 设置回调间隔。 | 否 |
| [sensor2/resetQuaternion](#getapiversion)<br>* | 重置 Magic Remote 的四元数传感器。 | 否 |
| [sensor/getSensorData](#getsensordata) | 订阅来自 magic remote 的传感器数据。 | 否 |
| [sensor/resetQuaternion](#resetquaternion) | 重置 magic remote 的四元数数据。 | 否 |

* 该方法在 webOS TV 24 或更高版本上受支持。

## getAPIVersion

描述

获取 MRCU API 版本。<br>该方法返回 MRCU 服务所提供的 API 版本。API 的可用性可能随 API 版本而变化，其实现方式也可能不同。若存在特殊之处，本规范中会随版本一同补充有关该变更的说明。

参数

无

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| version | 必需 | String | MRCU API 版本。 |

示例

```javascript
var handle = webOS.service.request("luna://com.webos.service.mrcu", {
  method: "getAPIVersion",
  parameters: {},
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    if (inResponse.returnValue === true) {
      return;
    }
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回值示例

```javascript
{
  "returnValue": true,
  "version": "1.0"
}
```

## sensor2/getSensorEventData

描述

订阅来自 magic remote 的传感器数据。<br>该数据包括坐标点、陀螺仪传感器、加速度计传感器以及四元数值。你可以通过以指定间隔订阅回调函数来获取传感器数据。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| subscribe | 必需 | Boolean | 决定是否进行订阅的标志。<br>• true：订阅<br>• false：不订阅。仅调用该方法一次。（默认值）<br>注意<br>请勿将其设置为 false。目前一次性调用无法正常工作。 |
| sensorType | 必需 | String | 在运动传感器提供的参数中，可以将所需的参数以字符串形式进行请求。<br>如果存在多个所需参数，可以将参数名串联为字符串后传递。可用的参数有：<br>• ["coordinate"](#coordinate)<br>• ["gyroscope"](#gyroscope)<br>• ["acceleration"](#acceleration)<br>• ["gameRotationVector"](#gamerotationvector)<br>• ["gravity"](#gravity)<br>• ["linearAcceleration"](#linearacceleration)<br>• ["accelerometerUncalibrated"](#accelerometeruncalibrated)<br>• ["gyroscopeUncalibrated"](#gyroscopeuncalibrated)<br>• ["pedometer"](#pedometer)<br>• ["motionDetector"](#motiondetector)<br>• "all"（包含上述全部 10 个参数） |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | 可选 | String | 如果方法失败，errorCode 会包含错误码。只有在方法失败时才会返回 errorCode。 |
| errorText | 可选 | String | 如果方法失败，errorText 会包含错误文本。只有在方法失败时才会返回 errorText。 |
| subscribed | 可选 | Boolean | 表示订阅是否已启用的标志。<br>• true：已启用<br>• false：已禁用 |

备注

如果该接口返回 false，则订阅会被禁用。因此，为了保持订阅处于启用状态，请再次订阅传感器数据。该服务为订阅提供了 `subscribe`。

错误参考

| 错误码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| 1001, 1002, 1003, 1004, 1005, 1006 | 详情请参阅<br>[Error Code Reference](#errorcodereference)<br>。 | 详情请参阅<br>[Error Code Reference](#errorcodereference)<br>。 |

订阅返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| interval | 必需 | Number | 实际时间间隔（当前时间 - 上一时间） |
| [coordinate](#coordinate) | 可选 | Object | 坐标信息对象 |
| [gyroscope](#gyroscope) | 可选 | Object | 陀螺仪传感器信息对象 |
| [acceleration](#acceleration) | 可选 | Object | 加速度计传感器信息对象 |
| [gameRotationVector](#gamerotationvector) | 可选 | Object | 四元数传感器信息对象 |
| [gravity](#gravity) | 可选 | Object | 重力传感器信息对象 |
| [linearAcceleration](#linearacceleration) | 可选 | Object | LinearAcceleration 传感器信息对象 |
| [accelerometerUncalibrated](#accelerometeruncalibrated) | 可选 | Object | 加速度计（未校准）传感器信息对象 |
| [gyroscopeUncalibrated](#gyroscopeuncalibrated) | 可选 | Object | 陀螺仪（未校准）传感器信息对象 |
| [pedometer](#pedometer) | 可选 | Object | 计步器传感器信息对象 |
| [motionDetector](#motiondetector) | 可选 | Object | 运动检测器信息对象 |

注意

如果请求参数有两个以上，向 `sensorType` 请求的参数名可以带分隔符传递，也可以在不带分隔符的情况下附上参数名发送。例如，即使 `sensorType` 为 `gyroscopeacceleter`、`gyroscope`、`acceleter`，API 请求的结果也是相同的。

示例

```javascript
var subscriptionHandle = webOS.service.request(
  "luna://com.webos.service.mrcu",
  {
    method: "sensor2/getSensorEventData",
    parameters: { sensorType: "all", subscribe: true },
    onSuccess: function (inResponse) {
      if (typeof inResponse.subscribed !== "undefined") {
        if (!inResponse.subscribed) {
          console.log("Failed to subscribe");
        }
      }
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
    },
  }
);
 
// If you need to unsubscribe the data, use cancel() method as below
subscriptionHandle.cancel();
```

返回值示例

订阅启用时

```javascript
{
  "subscribed": true,
  "returnValue": true
}
```

订阅返回值

```javascript
{
  "returnValue": true,
  "gyroscopeUncalibrated": {
    "y_bias": 0.00045741553185507655,
    "z_bias": 0.0037106915842741728,
    "x_uncalib": -0.68176925182342529,
    "y_uncalib": -0.14487597346305847,
    "x_bias": 0.0029623473528772593,
    "z_uncalib": -0.12570120394229889
  },
  "coordinate": {
    "y": 1074,
    "x": 99
  },
  "motionDetector": {
    "significantMotion": 0
  },
  "interval": 995.0,
  "gravity": {
    "z": 9.7079868316650391,
    "y": -0.85266518592834473,
    "x": -0.16893911361694336
  },
  "linearAcceleration": {
    "z": 1.6079120635986328,
    "y": 0.98088634014129639,
    "x": -0.23738378286361694
  },
  "gyroscope": {
    "z": -0.12941189110279083,
    "y": -0.14533339440822601,
    "x": -0.68473160266876221
  },
  "pedometer": {
    "stepDetected": 0,
    "stepCount": 4,
    "stepDetectedLatency": 0
  },
  "gameRotationVector": {
    "z": 0.61527740955352783,
    "w": 0.78128117322921753,
    "y": -0.02904123067855835,
    "euler": {
      "pitch": 7.0074191093444824,
      "roll": -9.8386898040771484,
      "yaw": -77.046409606933594
    },
    "x": 0.10094617307186127
  },
  "accelerometer": {
    "z": 11.315898895263672,
    "y": 0.12822112441062927,
    "x": -0.4063228964805603
  },
  "accelerometerUncalibrated": {
    "y_bias": -0.082731291651725769,
    "z_bias": 0.066136360168457031,
    "x_uncalib": -0.31842881441116333,
    "y_uncalib": 0.045489832758903503,
    "x_bias": 0.087894082069396973,
    "z_uncalib": 11.382035255432129
  }
}
```

## sensor2/cancelSensorDataSubscribe

描述

取消当前正在订阅的应用或服务的订阅（应用/服务终止状态）。

参数

无

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | 可选 | String | 如果方法失败，errorCode 会包含错误码。只有在方法失败时才会返回 errorCode。 |
| errorText | 可选 | String | 如果方法失败，errorText 会包含错误文本。只有在方法失败时才会返回 errorText。 |

注意

如果不再需要 getSensorEventData 的订阅，则应执行订阅取消操作。

错误参考

| 错误码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| 1003 | 详情请参阅<br>[Error Code Reference](#errorcodereference)<br>。 | 详情请参阅<br>[Error Code Reference](#errorcodereference)<br>。 |

示例

```javascript
var handle = webOS.service.request("luna://com.webos.service.mrcu", {
  method: "sensor2/cancelSensorDataSubscribe",
  parameters: {},
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

返回值示例

```javascript
{
  "returnValue": true
}
```

## sensor2/getSensorState

描述

通知遥控器上运动传感器的当前状态（`getSensorEventData` 是否可用）。

参数

无

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| isAlive | 必需 | Boolean | 表示运动传感器是启用还是禁用的标志。<br>• true：已启用<br>• false：已禁用 |

示例

```javascript
var handle = webOS.service.request("luna://com.webos.service.mrcu", {
  method: "sensor2/getSensorState",
  parameters: {},
  onSuccess: function (inResponse) {
    console.log("Result: " + JSON.stringify(inResponse));
    if (inResponse.isAlive === true) {
      return;
    }
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

返回值示例

```javascript
{
  "isAlive": true,
  "returnValue": true
}
```

## sensor2/getSensorInterval

描述

通知当前传感器回调间隔的最小/最大值以及运动传感器所支持的回调间隔。

参数

无

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| interval | 必需 | Number | 当前 getSensorEventData 订阅的回调间隔（单位：毫秒） |
| minInterval | 必需 | Number | getSensorEventData 订阅所支持的最小回调间隔（单位：毫秒） |
| maxInterval | 必需 | Number | getSensorEventData 订阅所支持的最大回调间隔（单位：毫秒） |

注意

- 初始回调间隔为 1000ms，但如果你有 SDK 使用历史，即使取消订阅，回调间隔也不会被初始化，因此在调用 `setSensorInterval` 方法之前必须检查回调间隔。
- 应在回调间隔所支持的范围内设置数值。

示例

```javascript
var handle = webOS.service.request("luna://com.webos.service.mrcu", {
  method: "sensor2/getSensorInterval",
  parameters: {},
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

返回值示例

```javascript
{
  "minInterval": 10,
  "returnValue": true,
  "interval": 10,
  "maxInterval": 1000
}
```

## sensor2/setSensorInterval

描述

在对应的区间范围内（最小：10ms，最大：1000ms），将运动传感器的回调间隔更改为所需的值。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| interval | 必需 | Int | 设置你想要更改的回调间隔，并以整数形式输入，单位为毫秒。可用的间隔范围为 10 ms 到 1000 ms。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | 可选 | String | 如果方法失败，errorCode 会包含错误码。只有在方法失败时才会返回 errorCode。 |
| errorText | 可选 | String | 如果方法失败，errorText 会包含错误文本。只有在方法失败时才会返回 errorText。 |

注意

即使在订阅期间，也可以使用 `setSensorInterval` 方法实时更改回调间隔。

错误参考

| 错误码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| 1006 | 详情请参阅<br>[Error Code Reference](#errorcodereference)<br>。 | 详情请参阅<br>[Error Code Reference](#errorcodereference)<br>。 |

示例

```javascript
var handle = webOS.service.request("luna://com.webos.service.mrcu", {
  method: "sensor2/setSensorInterval",
  parameters: { interval: 10 },
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

返回值示例

```javascript
{
  "returnValue": true
}
```

## sensor2/resetQuaternion

描述

重置 Magic Remote 的四元数传感器。<br>有时你需要在用户操作之前重置传感器，例如游戏开始或 magic remote 从睡眠模式唤醒时。

参数

无

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | 可选 | String | 如果方法失败，errorCode 会包含错误码。只有在方法失败时才会返回 errorCode。 |
| errorText | 可选 | String | 如果方法失败，errorText 会包含错误文本。只有在方法失败时才会返回 errorText。 |

错误参考

| 错误码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| 1003 | 详情请参阅<br>[Error Code Reference](#errorcodereference)<br>。 | 详情请参阅<br>[Error Code Reference](#errorcodereference)<br>。 |

注意

由于该功能会重置用户的方向基准，因此被称为“重新居中（recenter）”功能。在使用 Magic Remote 的过程中，用户可能会丢失中心位置而发生偏移。此时，该功能可以将用户的方向基准重置到中心。

示例

```javascript
var handle = webOS.service.request("luna://com.webos.service.mrcu", {
  method: "sensor2/resetQuaternion",
  parameters: {},
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

返回值示例

```javascript
{
  "returnValue": true
}
```

## sensor/getSensorData

描述

订阅来自 magic remote 的传感器数据。<br>该数据包括坐标点、陀螺仪传感器、加速度计传感器以及四元数值。你可以通过以指定间隔订阅回调函数来获取传感器数据。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| callbackInterval | 必需 | Number | 回调间隔：<br>• 1：100 pkt/sec<br>• 2：50 pkt/sec<br>• 3：33 pkt/sec<br>• 4：10 pkt/sec |
| subscribe | 必需 | Boolean | 决定是否进行订阅的标志。<br>• true：订阅<br>• false：不订阅。仅调用该方法一次。（默认值）<br>注意<br>请勿将其设置为 false，目前一次性调用无法正常工作。 |

注意

在 webOS TV 1.x 中，`sensor/getSensorData` 方法需要更多参数，即 `sleep` 和 `autoAlign`。如果你在 webOS TV 1.x 中使用 `sensor/getSensorData` 方法，请按如下方式设置 `sleep` 和 `autoAlign` 参数：

- `sleep` : **true**
- `autoAlign` : **false**

你可以通过 [getSystemInfo()](../应用与系统/TVDeviceInformation电视设备信息.md#getsysteminfo) 方法了解用户所使用的 webOS TV 版本。

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | 可选 | String | 如果方法失败，errorCode 会包含错误码。只有在方法失败时才会返回 errorCode。<br>详情请参阅该方法的错误参考。 |
| errorText | 可选 | String | 如果方法失败，errorText 会包含错误文本。只有在方法失败时才会返回 errorText。<br>详情请参阅该方法的错误参考。 |
| subscribed | 可选 | Boolean | 表示订阅是否已启用的标志。<br>• true：已启用<br>• false：已禁用 |

备注

如果该接口返回 false，则订阅会被禁用。因此，为了保持订阅，请再次订阅传感器数据。该服务为订阅提供了 `subscribe`。

错误参考

| 错误码 | 错误文本 |
| --- | --- |
| 1001 | Magic remote is not ready |
| 1002 | Undefined callback interval |
| 1003 | Subscription add fail |
| 1004 | invalid parameter |

订阅返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| deviceId | 必需 | String | Magic remote 设备 ID |
| [coordinate](#coordinate) | 必需 | Object | 坐标信息对象 |
| [gyroscope](#gyroscope) | 必需 | Object | [Gyroscope sensor](http://en.wikipedia.org/wiki/Gyroscope)<br>信息对象 |
| [acceleration](#acceleration) | 必需 | Object | [Accelerometer sensor](http://en.wikipedia.org/wiki/Accelerometer)<br>信息对象 |
| [quaternion](#quaternion) | 必需 | Object | [Quaternion sensor](http://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation)<br>信息对象 |

示例

```javascript
var webOSTVVersion = "2.0.0";
// Get webOS TV version
var request = webOS.service.request(
  "luna://com.webos.service.tv.systemproperty",
  {
    method: "getSystemInfo",
    parameters: { keys: ["sdkVersion"] },
    onSuccess: function (inResponse) {
      webOSTVVersion = inResponse.sdkVersion;
      console.log("webOS TV Version: " + inResponse.sdkVersion);
      //To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get webOS TV Version: " + inResponse.errorText);
      // To-Do something
    },
  }
);
 
// Set parameters by webOS TV version
var options;
if (webOSTVVersion == "2.0.0") {
  options.callbackInterval = 1;
  options.subscribe = true;
} else {
  options.callbackInterval = 1;
  options.subscribe = true;
  options.sleep = true;
  options.autoAlign = false;
}
 
// Call sensor/getSensorData with subscription
var subscriptionHandle = webOS.service.request(
  "luna://com.webos.service.mrcu",
  {
    method: "sensor/getSensorData",
    parameters: options,
    onSuccess: function (inResponse) {
      if (typeof inResponse.subscribed !== "undefined") {
        if (!inResponse.subscribed) {
          console.log("Failed to subscribe");
          return;
        }
      }
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
    },
  }
);
 
// If you need to unsubscribe the data, use cancel() method as below
subscriptionHandle.cancel();
```

返回值示例

订阅启用时

```javascript
{
  "subscribed": true,
  "returnValue": true
}
```

订阅返回值

```javascript
{
  "deviceId": 0,
  "coordinate": {
    "x": 1101,
    "y": 518
  },
  "gyroscope": {
    "z": -1.682723,
    "x": 0.3041,
    "y": -0.582472
  },
  "acceleration": {
    "z": 12.035406,
    "x": 9.713932,
    "y": 5.446675
  },
  "returnValue": true,
  "quaternion": {
    "q0": 0.042376,
    "q1": 0.088355,
    "q2": 0.937461,
    "q3": 0.334014
  }
}
```

## sensor/resetQuaternion

描述

重置 magic remote 的四元数传感器。<br>有时你需要在用户操作之前重置传感器，例如游戏开始或 magic remote 从睡眠模式唤醒时。

参数

无

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | 可选 | String | 如果方法失败，errorCode 会包含错误码。只有在方法失败时才会返回 errorCode。<br>详情请参阅该方法的错误参考。 |
| errorText | 可选 | String | 如果方法失败，errorText 会包含错误文本。只有在方法失败时才会返回 errorText。<br>详情请参阅该方法的错误参考。 |

错误参考

| 错误码 | 错误文本 |
| --- | --- |
| 1001 | Magic remote is not ready |
| 1003 | MotionEngine is not ready |
| 1004 | Device is no added to the MotionEngine |

注意

MotionEngine 会根据 Magic Remote 的传感器数据计算数值数据。

示例

```javascript
var request = webOS.service.request("luna://com.webos.service.mrcu", {
  method: "sensor/resetQuaternion",
  onSuccess: function (inResponse) {
    console.log("Succeeded to reset the quaternion sensor");
    // To-Do something
  },
  onFailure: function (inError) {
    console.log("[" + inError.errorCode + "]: " + inError.errorText);
    // To-Do something
  },
});
```

另请参阅

- [sensor/getSensorData](#getsensordata)

## 对象

### coordinate 对象

保存来自 magic remote 的坐标信息的对象。

```js
{
  "x": number,
  "y": number
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| x | 必需 | number | X 坐标 |
| y | 必需 | number | Y 坐标 |

### gyroscope 对象

保存来自 magic remote 的陀螺仪传感器信息的对象。

```js
{
  "x": number,
  "y": number,
  "z": number
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| x | 必需 | number | X 轴值 |
| y | 必需 | number | Y 轴值 |
| z | 必需 | number | Z 轴值 |

### acceleration 对象

保存来自 magic remote 的加速度传感器信息的对象。

```js
{
  "x": number,
  "y": number,
  "z": number
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| x | 必需 | number | X 轴值 |
| y | 必需 | number | Y 轴值 |
| z | 必需 | number | Z 轴值 |

### quaternion 对象

保存来自 magic remote 的四元数传感器信息的对象。

```js
{
  "q0": number,
  "q1": number,
  "q2": number,
  "q3": number
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| q0 | 必需 | number | x 值 |
| q1 | 必需 | number | y 值 |
| q2 | 必需 | number | z 值 |
| q3 | 必需 | number | w 值 |

### gyroscopeUncalibrated 对象

保存陀螺仪（未校准）传感器信息的对象。

```js
{  
    "x_bias": number,
    "y_bias": number,
    "z_bias": number,
    "x_uncalib": number,
    "y_uncalib": number,   
    "z_uncalib": number
 }
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| x_bias | 必需 | number | x 偏置值 |
| y_bias | 必需 | number | y 偏置值 |
| z_bias | 必需 | number | z 偏置值 |
| x_uncalib | 必需 | number | x 未校准值 |
| y_uncalib | 必需 | number | y 未校准值 |
| z_uncalib | 必需 | number | z 未校准值 |

### accelerometerUncalibrated 对象

保存加速度计（未校准）传感器信息的对象。

```js
{  
    "x_bias": number,
    "y_bias": number,
    "z_bias": number,
    "x_uncalib": number,
    "y_uncalib": number,   
    "z_uncalib": number
 }
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| x_bias | 必需 | number | x 偏置值 |
| y_bias | 必需 | number | y 偏置值 |
| z_bias | 必需 | number | z 偏置值 |
| x_uncalib | 必需 | number | x 未校准值 |
| y_uncalib | 必需 | number | y 未校准值 |
| z_uncalib | 必需 | number | z 未校准值 |

### linearAcceleration 对象

保存 LinearAcceleration 传感器信息的对象。

```js
{
  "x": number,
  "y": number,
  "z": number
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| x | 必需 | number | X 轴值 |
| y | 必需 | number | Y 轴值 |
| z | 必需 | number | Z 轴值 |

### gameRotationVector 对象

保存四元数传感器信息的对象。它是与四元数值性质相同的对象。

```js
{
  "x": number,
  "y": number,
  "z": number,
  "w": number,
  "euler": object
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| x | 必需 | number | x 值 |
| y | 必需 | number | y 值 |
| z | 必需 | number | z 值 |
| w | 必需 | number | w 值 |
| euler | 必需 | object | Pitch、roll、yaw 值 |

### gravity 对象

保存重力传感器信息的对象。

```js
{
  "x": number,
  "y": number,
  "z": number
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| x | 必需 | number | X 轴值 |
| y | 必需 | number | Y 轴值 |
| z | 必需 | number | Z 轴值 |

### pedometer 对象

保存计步器传感器信息的对象。

```js
{
  "stepDetected": number,
  "stepCount": number,
  "stepDetectedLatency": number
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| stepDetected | 必需 | number | 是否检测到步伐（1.0）或未检测到（0.0） |
| stepCount | 必需 | number | 传感器激活期间，自上次重启以来用户所走的步数。 |
| stepDetectedLatency | 必需 | number | 过去检测到步伐峰值的样本数量。 |

### motionDetector 对象

保存运动检测器信息的对象。

```js
{
  "significationMotion": number,
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| significationMotion | 必需 | number | 检测到运动时，检测器会输出值 1.0，并在该事件输出后立即自行复位。 |

## 错误码参考

| 错误码 | 错误文本 | 错误描述 |
| --- | --- | --- |
| 1001 | Subscription add fail | 订阅 API 的订阅请求方法不正确。 |
| 1002 | Invalid parameter | getSensorEvent API 的参数名输入不正确。 |
| 1003 | Magic remote is not ready | 在 magic remote 处于睡眠状态时调用了 API。在这种情况下，应使 magic remote 处于激活状态。 |
| 1004 | Already add subscription | 已订阅的客户端在未取消的情况下再次请求订阅。 |
| 1005 | Over subscription app/service number | 请求订阅的客户端数量超过最大值。 |
| 1006 | Wrong callback interval | 所设置的间隔超出了允许的间隔范围。 |
