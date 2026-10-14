# BLE GATT API 参考
> 原文链接: https://webostv.developer.lge.com/develop/references/ble-gatt ｜ 简体中文翻译

# BLE GATT

**Service URI - luna://com.webos.service.blegatt**

当 `**returnValue`**包含 false 时，所有方法返回的响应中都包含 `**errorCode`**（Number）和 `**errorText`**（String）。所有已订阅的方法（即传入了 `**subscribe:true`**）返回的响应中都包含 `**subscribed`**。

服务通过将 `**subscribed`** 设置为 false 来通知客户端它将不再发送任何后续订阅响应（包括在方法调用中拒绝初始订阅请求的情况）。当客户端收到 `**subscribed`** 的值为 false 时，必须始终调用 `**LSCallCancel()`**或 `**handle.cancel()`**。

**Methods**

| **Method** | **Description** | **Supported in Emulator** |
| --- | --- | --- |
| [isEnabled](#isenabled) | 检查 Bluetooth 当前是否已启用并可供使用。 | No |
| [startScan](#startscan) | 仅扫描 BLE 设备。 | No |
| [stopScan](#stopscan) | 停止正在进行的 BLE 扫描。 | No |
| [getState](#getstate) | 获取扫描状态以及已连接/已配对设备的信息。 | No |
| [pair](#pair) | 配对指定的远端 Bluetooth 设备。 | No |
| [unpair](#unpair) | 断开已配对的远端设备。该设备的所有配对信息都将被移除。 | No |
| [client/connect](#clientconnect) | 将指定的远端设备连接到 GATT 配置文件。 | No |
| [client/disconnect](#clientdisconnect) | 断开已建立的连接。 | No |
| [client/discoverServices](#clientdiscoverservices) | 发现远端设备提供的服务及其特征和描述符。 | No |
| [client/getServices](#clientgetservices) | 返回远端设备提供的 GATT 服务列表。 | No |
| [client/setCharacteristicNotification](#clientsetcharacteristicnotification) | 为给定的特征启用或禁用通知/指示。 | No |
| [client/readCharacteristic](#clientreadcharacteristic) | 从关联的远端设备读取所请求的特征。 | No |
| [client/readDescriptor](#clientreaddescriptor) | 从关联的远端设备读取给定描述符的值。 | No |
| [client/writeCharacteristic](#clientwritecharacteristic) | 将给定的特征及其值写入关联的远端设备。 | No |
| [client/writeDescriptor](#clientwritedescriptor) | 将给定描述符的值写入关联的远端设备。 | No |

## isEnabled

**Description**

检查蓝牙当前是否已启用并可供使用。

如果电视设备的蓝牙适配器已启用，则 `**isEnabled`**return 为 true；否则为 false。如果 `**isEnabled`**return 为 false，则无法执行 BLE 操作。在执行任何 BLE 操作之前，您应先调用 `**isEnabled`**method，并检查 `**isEnabled`**return 是否返回 true。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribe | Optional | Boolean | 是否订阅变更通知。可能的值为：<br>• true：订阅。<br>• false：不订阅。该方法仅调用一次。（默认） |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribed | Optional | Boolean | 指示是否已订阅以获取通知。 |
| returnValue | Required | Boolean | 指示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 失败操作的错误代码。 |
| errorText | Optional | String | 操作失败的原因。 |
| isEnabled | Required | Boolean | 如果本地适配器当前已启用并可供使用，则为 true。 |

**Example**

```javascript
// One-time call
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "isEnabled",
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
// Subscription
var subscriptionHandle = webOS.service.request(
  "luna://com.webos.service.blegatt",
  {
    method: "isEnabled",
    parameters: {
      subscribe: true,
    },
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

**Return Example**

Success return

```javascript
{
  "subscribed": true,
  "returnValue": true,
  "isEnabled": false
}
```

```javascript
{
  "returnValue": true,
  "isEnabled": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 105,
  "errorText": "Failed to parse incoming message"
}
```

## startScan

**Description**

仅扫描 BLE 设备并启动扫描。

如果要搜索包含特定服务 UUID 的某个设备，请在调用此方法时将该服务 UUID 包含在 `**uuid`**参数中。

为避免获取过多设备的信息，该方法还允许仅挑选在其广播信息中包含名称的设备。为此，请在调用 `**startScan`**方法时在参数中包含 `**“scanType”:”name”`**。

返回值以数组格式包含每个被搜索设备的 name、rssi、mac 地址、制造商数据和扫描记录（scan record），并且每当数据发生变化时，都会推送 `**subscribed`**返回值。

如果在调用 `**startScan`**方法后没有显式调用 `**stopScan`**方法，则扫描操作会持续 60 秒后停止。之后若要继续扫描，需要再次调用 `**startScan`**方法。

要检查扫描操作是否正在进行，请查看 `**getState`**方法的 `**isScan`**返回值。

如果扫描已在进行中时再次调用 `**startScan`**方法，`**returnValue`**将为 false，并返回 `**errorCode:1003`**和 `**errorText: Scan is already in progress`**。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribe | Required | Boolean | 是否订阅变更通知。可选值如下：<br>• true：订阅。<br>• false：不订阅。仅调用该方法一次。（默认值）。 |
| uuid | Required | String | 要搜索具有特定服务 UUID 的某个设备，请输入该设备的服务 uuid。 |
| serviceData |  | Object:<br>[serviceData](#servicedata-object) | 包含待广播的 serviceData 相关信息的对象。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribed | Required | Boolean | 表示是否已订阅以获取通知。 |
| returnValue | Required | Boolean | 表示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 失败操作的错误代码。 |
| errorText | Optional | String | 操作失败的原因。 |
| adapterAddress | Optional | String | 电视蓝牙适配器的地址。 |
| devices | Required | Object array:<br>[deviceStatus](#devicestatus-object) | "devices" 将包含系统已知的所有设备的状态信息，而不仅仅是状态发生变化的设备。<br>每个设备的 name、rssi、mac 地址、制造商数据和扫描记录（scan record）均以数组格式推送。 |

**Example**

```javascript
// Subscription
var subscriptionHandle = webOS.service.request(
  "luna://com.webos.service.blegatt",
  {
    method: "startScan",
    parameters: {
      subscribe: true,
    },
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

**Return Example**

Suceess return

```javascript
{
  "subscribed": true,
  "returnValue": true
}
```

```javascript
{
  "returnValue": true,
  "devices": [
    {
      "manufactureData": {
        "companyId": [87, 0],
        "value": [79, 32, 1, 52, 0, 0, 65, 58]
      },
      "name": "JBL Flip 6",
      "address": "55:fd:b4:8f:52:86",
      "scanRecord": [
        11, 255, 87, 0, 79, 32, 1, 52, 0, 0, 65, 58, 3, 22, 223, 253, 11, 9, 74,
        66, 76, 32, 70, 108, 105, 112, 32, 54
      ],
      "rssi": -57
    },
    {
      "manufactureData": {
        "companyId": [196, 0],
        "value": [64, 192, 64, 215, 75]
      },
      "name": "LG_Speaker_S90QY",
      "address": "7e:e4:c4:64:2c:bc",
      "scanRecord": [
        2, 1, 0, 8, 255, 196, 0, 64, 192, 64, 215, 75, 17, 7, 27, 197, 213, 165,
        2, 0, 8, 186, 229, 17, 190, 19, 208, 119, 32, 176, 17, 9, 76, 71, 95,
        83, 112, 101, 97, 107, 101, 114, 95, 83, 57, 48, 81, 89
      ],
      "rssi": -55
    }
  ]
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 200,
  "errorText": "Blegatt already scanning"
}
```

```javascript
// Failure Subsequent Response
{
  "subscribed":false,
  "returnValue": true,
  "values": {    
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

## stopScan

**Description**

停止正在进行的 BLE 扫描。

如果在扫描进行中调用 `**stopScan`**方法，则正在进行的扫描操作会停止，且不再发送任何设备搜索信息作为 `**startScan`**方法的返回值。当调用 `**startScan`**方法后经过 60 秒，或另一个应用进入前台时，扫描操作也会停止。扫描操作的状态可以在 `**getState`**方法的 `**isScan`**返回值中查看。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| uuid | Required | String | 若要停止对具有特定服务 UUID 的某个设备的扫描，请输入该设备的服务 uuid。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 操作失败时的错误码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "stoptScan",
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 101,
  "errorText": "Invalid JSON input"
}
```

## getState

**Description**

获取有关扫描状态、已连接设备和已配对设备的信息。

如果 `**subscribe`**parameter 的值为 true，则每当返回数据发生变化时，都会下发更新后的信息。

`**isScan`**return 指示扫描操作当前是否正在进行。如果该值为 true，则表示扫描操作正在进行；如果为 false，则表示操作已停止。

`**connectedDevice`**return 下发有关当前已连接的 GATT 服务端设备的信息。如果调用此方法时将 `**subscribe`**parameter 设置为 true，则每当已连接设备发生变化时，数据都会更新。数据包括 mac 地址和名称；如果连接了两台或更多设备，则每台设备的信息以数组格式下发。

`**pairedDevice`**return 下发有关当前已配对设备的信息。如果调用此方法时将 `**subscribe`**parameter 设置为 true，则每当已配对设备发生变化时，数据都会更新。数据包括 mac 地址和名称；如果配对了两台或更多设备，则每台设备的信息以数组格式下发。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribe | Optional | Boolean | 是否订阅变更通知。可能的值为：<br>• true：订阅。<br>• false：不订阅。该方法仅调用一次。（默认） |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribed | Optional | Boolean | 指示是否已订阅以获取通知。 |
| returnValue | Required | Boolean | 指示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 失败操作的错误代码。 |
| errorText | Optional | String | 操作失败的原因。 |
| Version | Required | String | SDK 的版本 |
| isScan | Required | Boolean | 扫描操作的当前状态。<br>• true：扫描操作正在进行。<br>• false：扫描操作已停止。 |
| connectedDevice | Optional | Object array:<br>[connectedDevice](#connecteddevice-object) | 当前已连接设备的信息。<br>数据包括 mac 地址和名称。如果连接了两台或更多设备，则每台设备的信息以数组格式下发。 |
| pairedDevice | Object array:<br>[pairedDevice](#paireddevice-object) | String | 操作失败的原因。 |

**Example**

```javascript
// One-time call
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "getState",
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
 
// Subscription
var subscriptionHandle = webOS.service.request(
  "luna://com.webos.service.blegatt",
  {
    method: "getState",
    parameters: {
      subscribe: true,
    },
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

**Return Example**

Success return

```javascript
{
  "subscribed": true,
  "returnValue": true,
  "version": "1.0",
  "isScan": false,
  "connectedDevice": [
    {
      "address": "45:8b:7f:e0:56:45",
      "name": "LG TV"
    },
    {
      "address": "aa:bb:cc:dd:ee:ff",
      "name": "soundbar"
    }
  ],
  "pairedDevice": [
    {
      "address": "45:8b:7f:e0:56:45",
      "name": "LG TV"
    },
    {
      "address": "aa:bb:cc:dd:ee:ff",
      "name": "soundbar"
    }
  ]
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 105,
  "errorText": "Failed to parse incoming message"
}
```

## pair

**Description**

将指定的远端 Bluetooth 设备与指定的 Bluetooth 适配器配对。

在任一时刻，一个适配器只能有一个配对请求处于活动状态。调用 `**pair`**方法时，应添加要配对的设备的 mac 地址。如果未提供地址或地址错误，将返回错误。如果调用此方法时 `**subscribe`**参数为 true，则配对结果（成功或失败）将通过 `**subscribed`**返回值传递。配对状态可以在 `**state`**返回值中查看：如果值为 `**“pairing”`**，表示配对正在进行中；如果为 `**“successPairing”`**，表示配对成功；如果为 `**“failPairing”`**，表示配对失败。配对成功后，有关成功配对设备的信息会被添加并更新到 `**getState`**方法的 `**pairedDevice`**返回值中。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribe | Optional | Boolean | 是否订阅变更通知。可能的值为：<br>• true：订阅。<br>• false：不订阅。该方法只调用一次。（默认值）。 |
| address | Required | String | 尝试配对的远端设备的地址（bdaddr）。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 操作失败时的错误码。 |
| errorText | Optional | String | 操作失败的原因。 |
| state | Required | String | 配对状态。可能的值为：<br>• pairing：配对正在进行中。<br>• successPairing：配对成功。<br>• failPairing：配对失败。 |

**Example**

```javascript
// One-time call
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "pair",
  parameters: {
    address: "4f:6b:40:db:5b:b2"
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
 
// Subscription
var subscriptionHandle = webOS.service.request(
  "luna://com.webos.service.blegatt",
  {
    method: "pair",
    parameters: {
      address: "4f:6b:40:db:5b:b2",
      subscribe: true,
    },
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

**Return Example**

Success return

```javascript
{
  "returnValue": true,
  "subscribe": true,
  "state": "pairing"
}
```

```javascript
{
  "returnValue": true,
  "state": "successPairing"
}
```

```javascript
// Success Subsequent Response
{
  "subscribed":false,
  "returnValue": true,
  "state": "successPairing"
}
```

Failure return

```javascript
{
  "returnValue": false,
  "state": "failPairing"
}
```

```javascript
// Failure Subsequent Response
{
  "subscribed":false,
  "returnValue": true,
  "state": "failPairing",
  "values": {    
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

## unpair

**Description**

断开与已配对的远端设备的连接。

远端设备的所有配对信息都将被移除，所有已打开的连接都将被关闭。不过，该远端设备仍然可被发现。调用此方法时，应包含要从配对历史中删除的设备的 mac 地址。当配对历史被删除后，请求取消配对的设备的相关信息将被删除，并更新到 `**getState`**方法的 `**pairedDevice`**返回值中。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribe | Optional | Boolean | 是否订阅变更通知。可选值如下：<br>• true：订阅。<br>• false：不订阅。仅调用该方法一次。（默认值）。 |
| address | Required | String | 要取消配对的远端设备的地址（bdaddr）。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 失败操作的错误代码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "unpair",
  parameters: {
    address: "4f:6b:40:db:5b:b2",
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

```javascript
// Success Subsequent Response
{
  "subscribed":false,
  "returnValue": true,
  "state": "successUnpairing"
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 318,
  "errorText": "Failed to unpair"
}
```

```javascript
// Failure Subsequent Response
{
  "subscribed":false,
  "returnValue": true,
  "state": "failUnpairing",
  "values": {    
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

## client/connect

**Description**

连接到指定远端设备上的 GATT 配置文件（profile）。

调用此方法时，应包含要连接的设备的 mac 地址。此外，若要在连接期间接收所有事件，`**subscribe`**参数的值应为 true。

**event** 返回值不仅推送连接状态，还会推送所有 GATT 客户端操作的相关信息。每个事件所需的信息和值都在 `**values`**对象中推送。

如果连接状态发生变化，会以 `**event`**返回值的形式推送 `**onConnectionStateChange`**，并且状态信息（connecting、connected 或 disconnected）会在 `**values`**对象中推送。连接建立过程中，值为 `**connecting: true`**和 `**connected: false`**。连接成功建立后，值为 `**connecting: false`**和 `**connected:true`**。连接关闭后，值为 `**connecting:false`**和 `**connected:false`**。如果成功连接到 GATT 服务器，已连接设备的相关信息会被添加到 `**getState`**方法的 `**connectedDevice`**参数中并推送。

如果调用 `**discoverServices`**或 `**getServices`**方法并成功发现 GATT 服务器的服务，则会推送一个 `**onServicesDiscovered`**事件，并在 `**values`**对象中携带所搜索到的服务、特征和描述符的相关信息。

如果调用 `**readCharacteristic`**方法并成功读取所请求特征的信息，则会推送一个 `**onCharacteristicRead`**事件，并在 `**values`**对象中推送请求读取的特征的相关信息。

如果调用 `**writeCharacteristic`**方法并成功写入所请求特征的信息，则会推送一个 `**onCharacteristicWrite`**事件。如果调用 `**readDescriptor`**方法并成功读取所请求描述符的信息，则会推送一个 `**onDescriptorRead`**事件，并在 `**values`**对象中推送请求读取的描述符的相关信息。

如果调用 `**writeDescriptor`**方法并成功写入所请求描述符的信息，则会推送一个 `**onDescriptorWrite`**事件。如果调用 `**setCharacteristicNotification`**方法并请求对特定特征信息的变更进行通知，则每当相应特征的信息发生变化时，都会推送一个 `**onCharacteristicChanged`**事件，并在 `**values`**对象中推送该特征变更后的信息。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribe | Required | Boolean | 是否订阅变更通知。可选值如下：<br>• true：订阅。<br>• false：不订阅。仅调用该方法一次。（默认值）。 |
| address | Required | String | 远端设备的地址。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribed | Optional | Boolean | 表示是否已订阅以获取通知。 |
| returnValue | Required | Boolean | 表示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 失败操作的错误代码。 |
| errorText | Optional | String | 操作失败的原因。 |
| event | Required | String | 该值用于向调用方（Caller）传递结果，例如连接状态以及后续的任何 GATT 客户端操作<br>• onConnectionStateChange：表示 GATT 客户端已连接/断开与远端 GATT 服务器的连接。<br>• onServicesDiscovered：表示远端设备的远端服务、特征和描述符列表已更新。<br>• onCharacteristicChanged：由远端特征通知触发。<br>• onCharacteristicRead：报告特征读取操作的结果。<br>• onCharacteristicWrite：表示特征写入操作的结果。<br>• onDescriptorRead：报告描述符读取操作的结果。<br>• onDescriptorWrite：表示描述符写入操作的结果。 |
| values | Optional | Object:<br>[values](#values-object) | 与每个事件对应的数据。 |

**Example**

```javascript
// Subscription
var subscriptionHandle = webOS.service.request(
  "luna://com.webos.service.blegatt",
  {
    method: "client/connect",
    parameters: {
      subscribe: true,
      address: "4f:8f:d7:c4:e3:e1",
    },
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

**Return Example**

Success return

```javascript
{
  "subscribed": true,
  "returnValue": true
}
```

- Connecting status

```javascript
{
  "event": "onConnectionStateChange",
  "returnValue": true,
  "values": {
    "connected": false,
    "address": "4f:8f:d7:c4:e3:e1",
    "connecting": true
  }
}
```

- Device connected

```javascript
{
  "event": "onConnectionStateChange",
  "returnValue": true,
  "values": {
    "connected": true,
    "address": "4f:8f:d7:c4:e3:e1",
    "connecting": false
  }
}
```

- Discover service

```javascript
{
  "event": "onServicesDiscovered",
  "returnValue": true,
  "values": {
    "returnValue": true,
    "address": "4f:8f:d7:c4:e3:e1"
  }
}
```

- Get service

```javascript
{
  "event": "onServicesDiscovered",
  "returnValue": true,
  "values": {
    "address": "4f:8f:d7:c4:e3:e1",
    "services": [
      {
        "includes": [],
        "characteristics": [
          {
            "properties": {
              "authenticatedSignedWrites": false,
              "extendedProperties": false,
              "write": false,
              "read": false,
              "notify": false,
              "broadcast": false,
              "writeWithoutResponse": false,
              "indicate": true
            },
            "characteristic": "00002a05-0000-1000-8000-00805f9b34fb",
            "instanceId": "003",
            "permissions": {},
            "value": {
              "bytes": []
            },
            "descriptors": []
          },
          {
            "properties": {
              "authenticatedSignedWrites": false,
              "extendedProperties": false,
              "write": false,
              "read": true,
              "notify": false,
              "broadcast": false,
              "writeWithoutResponse": false,
              "indicate": false
            },
            "characteristic": "00002b3a-0000-1000-8000-00805f9b34fb",
            "instanceId": "005",
            "permissions": {},
            "value": {
              "bytes": []
            },
            "descriptors": []
          },
          {
            "properties": {
              "authenticatedSignedWrites": false,
              "extendedProperties": false,
              "write": true,
              "read": true,
              "notify": false,
              "broadcast": false,
              "writeWithoutResponse": false,
              "indicate": false
            },
            "characteristic": "00002b29-0000-1000-8000-00805f9b34fb",
            "instanceId": "007",
            "permissions": {},
            "value": {
              "bytes": []
            },
            "descriptors": []
          },
          {
            "properties": {
              "authenticatedSignedWrites": false,
              "extendedProperties": false,
              "write": false,
              "read": true,
              "notify": false,
              "broadcast": false,
              "writeWithoutResponse": false,
              "indicate": false
            },
            "characteristic": "00002b2a-0000-1000-8000-00805f9b34fb",
            "instanceId": "009",
            "permissions": {},
            "value": {
              "bytes": []
            },
            "descriptors": []
          }
        ],
        "service": "00001801-0000-1000-8000-00805f9b34fb",
        "type": "primary"
      }
    ]
  }
}
```

- Receive notification

```javascript
{
  "event": "onCharacteristicChanged",
  "returnValue": true,
  "values": {
    "address": "4f:8f:d7:c4:e3:e1",
    "changed": {
      "characteristic": "0000fff4-0000-1000-8000-00805f9b34fb",
      "instanceId": "055",
      "value": {
        "bytes": [
          125, 71, 69, 95, 121, 99, 36, 86, 42, 110, 87, 70, 70, 83, 117, 19,
          92, 91, 93
        ]
      }
    }
  }
}
```

- Read characteristic

```javascript
{
  "event": "onCharacteristicRead",
  "returnValue": true,
  "values": {
    "service": "0000fff0-0000-1000-8000-00805f9b34fb",
    "address": "4f:8f:d7:c4:e3:e1",
    "values": [
      {
        "properties": {
          "authenticatedSignedWrites": false,
          "extendedProperties": false,
          "write": false,
          "read": true,
          "notify": false,
          "broadcast": false,
          "writeWithoutResponse": false,
          "indicate": false
        },
        "characteristic": "0000fff1-0000-1000-8000-00805f9b34fb",
        "instanceId": "042",
        "permissions": {},
        "value": {
          "bytes": []
        },
        "descriptors": [
          {
            "instanceId": "044",
            "descriptor": "00002901-0000-1000-8000-00805f9b34fb",
            "permissions": {},
            "value": {
              "bytes": []
            }
          },
          {
            "instanceId": "043",
            "descriptor": "00002904-0000-1000-8000-00805f9b34fb",
            "permissions": {},
            "value": {
              "bytes": []
            }
          }
        ]
      }
    ]
  }
}
```

- Read descriptor

```javascript
{
  "event": "onDescriptorRead",
  "returnValue": true,
  "values": {
    "characteristic": "0000fff4-0000-1000-8000-00805f9b34fb",
    "service": "0000fff0-0000-1000-8000-00805f9b34fb",
    "address": "4f:8f:d7:c4:e3:e1",
    "values": [
      {
        "instanceId": "058",
        "descriptor": "00002901-0000-1000-8000-00805f9b34fb",
        "permissions": {},
        "value": {
          "bytes": []
        }
      },
      {
        "instanceId": "057",
        "descriptor": "00002902-0000-1000-8000-00805f9b34fb",
        "permissions": {},
        "value": {
          "bytes": [1, 0]
        }
      },
      {
        "instanceId": "056",
        "descriptor": "00002904-0000-1000-8000-00805f9b34fb",
        "permissions": {},
        "value": {
          "bytes": []
        }
      }
    ]
  }
}
```

- Write characteristic

```javascript
{
  "event": "onCharacteristicWrite",
  "returnValue": true,
  "values": {
    "adapterAddress": "ac:f1:08:d4:6f:eb",
    "returnValue": true,
    "address": "4f:8f:d7:c4:e3:e1"
  }
}
```

- Device disconnected

```javascript
{
  "event": "onConnectionStateChange",
  "returnValue": true,
  "values": {
    "connected": false,
    "address": "4f:8f:d7:c4:e3:e1",
    "connecting": false
  }
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 400,
  "errorText": "Device is already connected"
}
```

- Connecting status

```javascript
// Failure Subsequent Response
{
  "subscribed":false,
  "returnValue": true,
  "event": "onConnectionStateChange",
  "values": {
      "connecting": false,
      "connected": false,           
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

- Discover service

```javascript
// Failure Subsequent Response
{
  "subscribed":true,
  "returnValue": true,
  "event": "onServicesDiscovered",
  "values": {
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

- Get service

```javascript
// Failure Subsequent Response
{
  "subscribed":true,
  "returnValue": true,
  "event": "onServicesDiscovered",
  "values": {
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

- Receive notification

```javascript
// Failure Subsequent Response
{
  "subscribed":true,
  "returnValue": true,
  "event": "onCharacteristicChanged",
  "values": {
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

- Read characteristic

```javascript
// Failure Subsequent Response
{
  "subscribed":true,
  "returnValue": true,
  "event": "onCharacteristicRead",
  "values": {
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

- Write characteristic

```javascript
// Failure Subsequent Response
{
  "subscribed":true,
  "returnValue": true,
  "event": "onCharacteristicWrite",
  "values": {
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

## client/disconnect

**Description**

断开 GATT 连接。

调用此方法时，您应在**address**parameter 中包含要断开连接的 mac 地址。连接关闭时，会通过**client/connect**method 的**event**return 下发**onConnectionStateChange**event。**values**object 的**connecting**和**connected**值将为 false。此外，连接关闭时，已断开连接的设备会从**getState**method 的**connectedDevice**return 中移除。如果带有已连接设备的 app 在未断开设备连接的情况下转入后台，则所有已连接的设备都将被断开连接。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| subscribe | Optional | Boolean | 是否订阅变更通知。可能的值为：<br>• true：订阅。<br>• false：不订阅。该方法仅调用一次。（默认） |
| address | Required | String | 远端设备的地址。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 指示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 失败操作的错误代码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "client/disconnect",
  parameters: {
    address: "4f:6b:40:db:5b:b2",
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 401,
  "errorText": "Device is not connected"
}
```

```javascript
// Failure Subsequent Response
{
  "subscribed":false,
  "returnValue": true,
  "state": "failDisconnecting",
  "values": {    
      "errorCode": 111,
      "errorText": "Fail call function"  
  }
}
```

## client/discoverServices

**Description**

发现给定远端设备可用的服务。

调用此方法时，应在 `**address`**参数中包含已连接设备的 mac 地址。当已完成对连接设备所支持服务的搜索后，会通过 `**client/connect`**方法的 `**event`**返回值传递一个 `**onServicesDiscovered`**事件。要查看所搜索服务的信息，请调用 `**client/getServices`**方法。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 远端设备的地址。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 操作失败时的错误码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "discoverServices",
  parameters: {
    address: "4f:6b:40:db:5b:b2",
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 404,
  "errorText": "Failed to start service discovery"
}
```

## client/getServices

**Description**

获取远端设备可用的服务。

调用此方法时，您应在 `**address`**parameter 中包含已连接设备的 mac 地址。已连接设备的服务信息会通过 `**client/connect`**method 的 `**event`**return 以 `**onServicesDiscovered`**event 的形式下发，而有关服务、特征和描述符的信息则在 `**values`**object 中下发。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 远端设备的地址。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 指示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 失败操作的错误代码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "getServices",
  parameters: {
    address: "4f:6b:40:db:5b:b2",
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 405,
  "errorText": "Adapter Address is not valid"
}
```

## client/setCharacteristicNotification

**Description**

为给定的特征启用或禁用通知/指示。

调用此方法时，应在 `**address`**参数中包含已连接设备的 mac 地址，并在 service 参数中包含通知所用特征所属服务的 UUID。此外，应在 `**characteristic`**参数中包含用于通知的特征 UUID，并在 enable 参数中设置是否启用通知。当已开启通知的特征信息发生变更时，会通过 `**client/connect`**方法的 `**event`**返回值传递一个 `**onCharacteristicChanged`**事件，变更后的值通过 `**values`**对象传递。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 远端设备的地址。 |
| service | Required | String | 该特征所属服务的 UUID。 |
| characteristic | Required | String | 要监控的特征的 UUID。 |
| enable | Required | Boolean | 启用或禁用通知。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 操作失败时的错误码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "setCharacteristicNotification",
  parameters: {
    address: "4f:6b:40:db:5b:b2",
    characteristic: "0000fff4-0000-1000-8000-00805f9b34fb",
    service: "0000fff0-0000-1000-8000-00805f9b34fb",
    enable: true,
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 408,
  "errorText": "GATT monitor characteristic failed for characteristic"
}
```

## client/readCharacteristic

**Description**

读取特定特征的值。

调用此方法时，您应在 `**address`**parameter 中包含已连接设备的 mac 地址，在 service parameter 中包含要读取的特征所属服务的 UUID，并在 `**characteristic`**parameter 中包含要读取的特征 UUID。有关所读取特征的信息会通过 `**client/connect`**method 的 `**event`**return 以 `**onCharacteristicRead`**event 的形式下发，而有关该特征的信息则在 `**values`**object 中下发。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 远端设备的地址。 |
| service | Required | String | 该特征所属服务的 UUID。 |
| characteristic | Required | String | 要读取的特征的 UUID。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 指示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 失败操作的错误代码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "readCharacteristic",
  parameters: {
    address: "4f:6b:40:db:5b:b2",
    characteristic: "0000fff4-0000-1000-8000-00805f9b34fb",
    service: "0000fff0-0000-1000-8000-00805f9b34fb",
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 410,
  "errorText": "GATT read characteristics failed"
}
```

## client/readDescriptor

**Description**

读取服务特征描述符的值。

调用此方法时，应在 `**address`**参数中包含已连接设备的 mac 地址，在 `**descriptor`**参数中包含要读取的描述符 UUID，在 `**characteristic`**参数中包含该描述符所属特征的 UUID，并在 `**service`**参数中包含该特征所属服务的 UUID。有关所读取描述符的信息会通过 `**client/connect`**方法的 `**event`**返回值以 ``**onDescriptorRead**事件的形式传递，描述符信息则通过 `**values`**对象传递。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 远端设备的地址。 |
| service | Required | String | 该特征所属服务的 UUID。 |
| characteristic | Required | String | 该描述符所属特征的 UUID。 |
| descriptor | Required | String | 描述符的 UUID。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 操作失败时的错误码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "readDescriptor",
  parameters: {
    address: "4f:6b:40:db:5b:b2",
    descriptor: "00002902-0000-1000-8000-00805f9b34fb",
    characteristic: "0000fff4-0000-1000-8000-00805f9b34fb",
    service: "0000fff0-0000-1000-8000-00805f9b34fb",
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 411,
  "errorText": "Required 'characteristic' uuid parameter is not supplied"
}
```

## client/writeCharacteristic

**Description**

为远端特征写入值。

调用此方法时，您应在 `**address`**parameter 中包含已连接设备的 mac 地址，在 `**service`**parameter 中包含要写入的特征所属服务的 UUID，并在 `**characteristic`**parameter 中包含特征 UUID。此外，您还应在 `**value`**object 中包含要写入的值，且该值只能是 string、number 和 bytes 中的单一类型。如果包含两种或更多类型，则该方法调用将失败。如果对某个特征的写入成功，则会通过 `**client/connect`**method 的 `**event`**return 下发 `**onCharacteristicWrite`**event。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 远端设备的地址。 |
| service | Required | String | 该特征所属服务的 UUID。 |
| characteristic | Required | String | 该特征的 UUID。 |
| value | Required | Object:<br>[gattValueInfo](#gattvalueinfo-object) | 特征的值。<br>值只能有一种类型，并且根据该类型，应传入 "string"、"number" 或 "bytes" 字段之一。如果传入多个字段，该方法将失败。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 指示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 失败操作的错误代码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "writeCharacteristic",
  parameters: {
    address: "4f:6b:40:db:5b:b2",
    characteristic: "0000fff4-0000-1000-8000-00805f9b34fb",
    service: "0000fff0-0000-1000-8000-00805f9b34fb",
    value: { bytes: [0] },
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 413,
  "errorText": "GATT write characteristic failed"
}
```

## client/writeDescriptor

**Description**

写入远端设备中服务特征的特定描述符的值。

调用此方法时，应在 `**address`**参数中包含已连接设备的 mac 地址，在 `**descriptor`**参数中包含要写入的描述符 UUID，在 `**characteristic`**参数中包含该描述符所属特征的 UUID，并在 service 参数中包含该特征所属服务的 UUID。此外，应在 `**value`**对象中包含要写入的值，且该值只能是 string、number 和 bytes 中的单一类型。如果包含两种或更多类型，方法调用将失败。如果对某个描述符的写入成功，会通过 `**client/connect`**方法的 `**event`**返回值传递一个 `**onDescriptorWrite` `event`**。

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 远端设备的地址。 |
| service | Required | String | 该特征所属服务的 UUID。 |
| characteristic | Required | String | 该描述符所属特征的 UUID。 |
| descriptor | Required | String | 描述符的 UUID。 |
| value | Optional | Object:<br>[gattValueInfo](#gattvalueinfo-object) | 特征的值。<br>一个值只能有一种类型，并且根据该类型，应传入 "string"、"number" 或 "bytes" 字段之一。如果传入了多个字段，该方法将失败。 |
| notification | Optional | String | 如果要接收或拒绝通知，请在客户端特征配置描述符（CCCD）中设置相应的值。可用的值有：<br>• ENABLE_NOTIFICATION_VALUE：接收通知。<br>• DISABLE_NOTIFICATION_VALUE：不接收通知。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败。<br>• true：操作成功。<br>• false：操作失败。 |
| errorCode | Optional | Number | 操作失败时的错误码。 |
| errorText | Optional | String | 操作失败的原因。 |

**Example**

```javascript
var request = webOS.service.request("luna://com.webos.service.blegatt", {
  method: "writeDescriptor",
  parameters: {
    address: "4f:6b:40:db:5b:b2",
    descriptor: "00002902-0000-1000-8000-00805f9b34fb",
    characteristic: "0000fff4-0000-1000-8000-00805f9b34fb",
    service: "0000fff0-0000-1000-8000-00805f9b34fb",
    value: { bytes: [0] },
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

**Return Example**

Success return

```javascript
{
  "returnValue": true
}
```

Failure return

```javascript
{
  "returnValue": false,
  "errorCode": 414,
  "errorText": "Invalid value input for GATT characteristic"
}
```

## Object

### deviceStatus object

#### Description

包含由 address 标识的设备状态相关信息的 object。

该 object 在调用 `**startScan`**method 时返回，包含所搜索设备的信息。它包括所搜索设备的 mac 地址、名称、rssi、制造商信息以及服务数据。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 设备的地址。 |
| name | Required | String | 设备的名称。 |
| rssi | Required | Number | 设备的信号强度级别。 |
| scanRecord | Required | Number array | 远端设备的服务数据。 |
| manufactureData | Required | Number array | 制造商特定的公司 ID 和数据（如果由远端设备广播，否则为空）。 |

### connectedDevice object

#### Description

包含已连接设备相关信息的 object。

该 object 在调用 `**getState`**method 时返回，包含已连接的远端设备的信息。它包括已连接设备的 mac 地址和名称。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 已连接设备的地址。 |
| name | Optional | String | 已连接设备的名称。 |

### pairedDevice object

#### Description

包含已配对设备相关信息的 object。

该 object 在调用 `**getState`**method 时返回，包含已配对（已绑定）的远端设备的信息。它包括已配对（已绑定）设备的 mac 地址和名称。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| address | Required | String | 已配对设备的地址。 |
| name | Optional | String | 已配对设备的名称。 |

### values object

#### Description

有关连接状态以及任何其他 GATT 客户端操作的值。

该 object 在调用 `**client/connect`**method 时返回，包含 GATT 客户端操作期间要下发的信息。它包括连接状态信息、特征信息，以及用于通知的特征变更值。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| connecting | Optional | Boolean | 指示连接请求当前是否正在处理中。可能的值为：<br>• true：请求正在处理中。<br>• false：未在处理中。 |
| connected | Optional | Boolean | 指示连接是否已打开。可能的值为：<br>• true：连接已打开。<br>• false：连接未打开。 |
| serviceClasses | Optional | Object | 该设备支持的 Service Classes 数组。 |
| connectRequest | Optional | Boolean | 指示该请求是否为连接请求。可能的值为：<br>• true：请求为连接请求。<br>• false：请求为断开连接请求。 |
| service | Optional | String | 该特征所属服务的 UUID。 |
| characteristic | Optional | String | 该描述符所属特征的 UUID。 |
| services | Optional | Object array:<br>[serviceInfo](#serviceinfo-object) | 可用服务的列表。 |
| changed | Optional | Object array:<br>[characteristicInfo](#characteristicinfo-object) | 包含特征 uuid 和值相关信息的 object。 |

### serviceInfo object

#### Description

包含 GATT 服务配置的 object。

远端设备支持的服务以数组格式提供。每个数组包含服务 UUID、服务类型以及该服务包含的特征。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| service | Required | String | 服务的 UUID。 |
| type | Required | String | 描述服务类型的 UUID。定义了以下类型：<br>• primary（UUID 0x2800）<br>• secondary（UUID 0x2801） |
| includes | Optional | String array | 该服务在其定义中包含的服务 UUID 列表。 |
| characteristics | Optional | Object array:<br>[characteristicInfo](#characteristicinfo-object) | 属于该服务的特征列表。 |

### characteristicInfo object

#### Description

包含 GATT 特征相关信息的 object。

某个服务所包含的特征信息以数组格式提供。每个数组包含特征 UUID、值、属性、权限以及该特征包含的描述符。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| characteristic | Required | String | 该特征的 UUID。 |
| value | Required | Object array:<br>[gattValueInfo](#gattvalueinfo-object) | 特征的值。 |
| properties | Required | Object array:<br>[propertiesInfo](#propertiesinfo-object) | 为该特征配置的属性。 |
| permissions | Required | Object array:<br>[permissionsInfo](#permissionsinfo-object) | 为该特征配置的权限。 |
| descriptors | Required | Object array:<br>[descriptorInfo](#descriptorinfo-object) | 该特征的描述符列表。 |

### descriptorInfo object

#### Description

包含 GATT 描述符相关信息的 object。

某个特征所包含的描述符信息以数组格式提供。每个数组包含描述符 UUID 和值。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| descriptor | Required | String | 该描述符的 UUID。 |
| value | Required | Object array:<br>[gattValueInfo](#gattvalueinfo-object) | 该描述符的值。 |

### gattValueInfo object

#### Description

包含 GATT 值相关信息的 object。

由于 GATT 特征可以通过描述符进行扩展，以描述所存储值的类型，因此目前值有三种不同的表示形式：stringnumbernumber 数组。仅当存在非值类型描述符时，才会使用最后一种形式。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| string | Optional | String | 当值类型为 string 时存在。否则不存在。 |
| number | Optional | Number | 当值类型为 number 时存在。否则不存在。 |
| bytes | Optional | Number array | 如果未指定值的类型，则该值以字节序列的形式返回。 |

### propertiesInfo object

#### Description

包含特征所设置属性相关信息的 object。

所有属性均在 Bluetooth Core Specification 4.1 vol. 4 Part G chapter 3.3.1.1 中定义。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| broadcast | Optional | Boolean | 如果已设置，则允许使用 Server Characteristic Configuration Descriptor 广播特征值。<br>如果已设置，则 Server Characteristic Configuration Descriptor 必须存在。 |
| read | Optional | Boolean | 如果已设置，则允许读取特征值。 |
| writeWithoutResponse | Optional | Boolean | 如果已设置，则允许无响应写入特征值。 |
| write | Optional | Boolean | 如果已设置，则允许带响应写入特征值。 |
| notify | Optional | Boolean | 如果已设置，则允许在无需确认的情况下通知特征值。<br>如果已设置，则 Client Characteristic Configuration Descriptor 必须存在。 |
| indicate | Optional | Boolean | 如果已设置，则允许在需要确认的情况下指示特征值。 |
| authenticatedSignedWrites | Optional | Boolean | 如果已设置，则允许对特征值进行签名写入。 |
| extendedProperties | Optional | Boolean | 如果已设置，则会在 Characteristic Extended Properties Descriptor 中定义额外的特征属性。<br>如果已设置，则 Characteristic Extended Properties Descriptor 必须存在。 |

### permissionsInfo object

#### Description

包含允许客户端使用特定特征值的权限相关信息的 object。

所有属性均在 Bluetooth Core Specification 4.1 vol. 4 Part G chapter 3.3.1.1 中定义。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| read | Optional | Boolean | 如果已设置，则允许客户端读取特征值。 |
| readEncrypted | Optional | Boolean | 如果已设置，则允许加密读取操作。 |
| readEncryptedMitm | Optional | Boolean | 如果已设置，则允许带响应写入特征值。 |
| notify | Optional | Boolean | 如果已设置，则允许在中间人保护下进行读取。 |
| write | Optional | Boolean | 如果已设置，则允许客户端写入特征值。 |
| writeEncrypted | Optional | Boolean | 如果已设置，则允许加密写入。 |
| writeEncryptedMitm | Optional | Boolean | 如果已设置，则允许在中间人保护下进行加密写入。 |
| writeSigned | Optional | Boolean | 如果已设置，则允许签名写入操作。 |
| writeSignedMitm | Optional | Boolean | 如果已设置，则允许在中间人保护下进行签名写入操作。 |

### serviceData object

#### Description

包含要广播的服务数据相关信息的 object。

#### Properties

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| uuid | Required | String | 指示数据 uuid。<br>请注意，uuid 是 128 位通用唯一标识符的不可变表示形式。 |
| data | Required | Number array | 包含与服务有关的数据数组。 |
| mask | Required | Number array | 指示服务 uuid 的位掩码。可能的值为：<br>• 1：将掩码中的任意位设置为 1，表示 service uuid 中对应的位需要匹配。<br>• 0：将掩码中的任意位设置为 0，表示忽略该位。 |

## Error code reference

| **Error Code** | **Error Text** | **Description** |
| --- | --- | --- |
| 0 | OK | 操作成功完成。未发生错误。 |
| 1 | This is unknown error | 发生了未指明或未知的错误。 |
| 2 | CallerInfo is null | 内部调用方信息对象为 null。 |
| 3 | SubscriptionInfo is null | 订阅信息对象为 null。订阅上下文缺失。 |
| 4 | SubscriptionInfo is already existed | 该资源的订阅已存在。属于重复订阅尝试。 |
| 100 | Bluetooth adapter is not available. | 底层 Bluetooth 守护进程未运行，或未连接到硬件。 |
| 101 | Invalid JSON input | JSON 输入的格式无效，无法解析。 |
| 102 | The JSON input does not match the expected schema | 一个或多个参数的类型不正确。有关每个输入参数预期的数据类型，请参阅 “Parameters” 表。 |
| 103 | This app is not have permission. | 所请求的应用没有控制附近设备的权限。 |
| 104 | Unknown device address | 用于执行所请求操作的远端 Bluetooth 设备地址不在已发现的远端设备列表中，或该地址无效。 |
| 105 | Failed to parse incoming message | 传递给该方法的 JSON 负载无法解析，因而无法确定输入参数的值。 |
| 106 | Required 'address' parameter is not supplied | address 参数是必需参数，但方法调用方未提供。 |
| 107 | Device with supplied address is not available | 具有所提供地址的远端 Bluetooth 设备不可用（不在已发现设备列表中），无法继续执行此方法的操作。 |
| 108 | BLE open api version is not matched | 客户端使用的 BLE API 版本与服务器支持的版本不匹配。 |
| 109 | Other process is already in progress | 另一个操作正在进行中；不允许并发操作。 |
| 110 | Fail register service category | 向 Luna Service 框架注册服务类别失败。 |
| 111 | Fail call function | 内部函数调用失败。 |
| 200 | Blegatt already scanning | Blegatt 已在扫描 |
| 201 | Blegatt already scanning by other service | 另一个服务已在执行 BLE 扫描。 |
| 301 | Device is not paired | 设备未配对 |
| 302 | The operation failed for an unspecified or generic reason | 所请求的 Bluetooth 操作因 Bluetooth 协议栈中未指明或一般性的原因而失败。 |
| 303 | The device is not ready to perform the requested operation | Bluetooth 适配器（本地设备）尚未准备好执行所请求的操作。 |
| 304 | The SIL failed to allocate memory | 与底层协议栈交互的 Bluetooth SIL（Stack Interface Layer）未能分配执行所请求操作所需的内存。 |
| 305 | The operation can not be performed at this time | 由于适配器或 SIL（Stack Interface Layer）正忙于其他操作，适配器当前无法执行所请求的操作。 |
| 306 | The requested operation is not supported by the stack or device | Bluetooth 协议栈或适配器不支持所请求的操作。 |
| 307 | An invalid value was passed for one of the parameters | 从 Bluetooth 服务调用 SIL（Stack Interface Layer）时，为其中一个参数传入了无效值。 |
| 308 | An unhandled error was encountered | 执行所请求操作时，在 SIL（Stack Interface Layer）处遇到了未处理的错误。 |
| 309 | Authentication with a remote device was canceled | 与远端 Bluetooth 设备的身份验证被远端 Bluetooth 设备取消。 |
| 310 | Authentication with a remote device failed | 与远端 Bluetooth 设备的身份验证在底层协议栈处失败。 |
| 311 | Authentication with a remote was rejected | 与远端 Bluetooth 设备的身份验证被远端 Bluetooth 设备拒绝。 |
| 312 | Authentication with a remote device timed out | 与远端 Bluetooth 设备的身份验证在收到远端设备的有效响应之前已超时。 |
| 313 | Failed to parse incoming message | 传递给该方法的 JSON 负载无法解析，因而无法确定输入参数的值。 |
| 314 | Method needs to be subscribed | 该 API 方法需要以 subscribe 输入参数设置为 true 的方式调用，才能获得此方法 LS 调用的多个响应。如果 subscribe 未设置为 true，则抛出此错误。 |
| 315 | Only one subscription allowed | 只允许一个客户端订阅此方法 |
| 316 | Pairing canceled by user | 与远端 Bluetooth 设备正在进行的配对已被取消。取消操作由本地设备上的客户端发起。 |
| 317 | Pairing already in progress | 在任一时刻，只能有一个远端设备与 Bluetooth 适配器进行配对。此错误表示适配器已在与某个远端 Bluetooth 设备配对（无论是作为主叫还是被叫），因此无法发起另一次配对。 |
| 318 | Failed to unpair | 未能解除 Bluetooth 适配器与已配对的远端 Bluetooth 设备之间的配对。 |
| 400 | Device is already connected | 远端 Bluetooth 设备已连接 |
| 401 | Device is not connected | 远端 Bluetooth 设备尚未通过配置文件连接到我们的 Bluetooth 适配器。 |
| 402 | Profile backend is not available | 所使用的 SIL（Stack Interface Layer）模块未提供该配置文件的任何实现。 |
| 403 | Bandwidth is not enough, please remove connected devices and try again | 带宽不足，请移除已连接的设备后重试 |
| 404 | Failed to start service discovery. | 无法启动 GATT 服务发现，应提供 adapterAddress 或 address 之一 |
| 405 | Adapter Address is not valid | 所给的适配器地址无效。 |
| 406 | Required 'service' uuid parameter is not supplied | 此方法调用所需的必需 Service name 参数未提供。 |
| 407 | Invalid GATT characteristic for the given service | 所提供的特征 ID 不属于该服务。 |
| 408 | GATT monitor characteristic failed for characteristic | 未能监控 GATT 特征。 |
| 409 | Invalid GATT Service | 所提供的 GATT 服务不可用或未配置。 |
| 410 | GATT read characteristics failed | 未能读取所请求的特征。 |
| 411 | GATT Encryption is not ready | GATT 操作所需的加密尚未就绪。 |
| 412 | Required 'characteristic' uuid parameter is not supplied | 请求中缺少 'characteristic' UUID 参数。 |
| 413 | Invalid value input for GATT characteristic (The supplied value for GATT characteristics is invalid.) | 为 GATT 特征提供的值无效。 |
| 414 | GATT write characteristic failed | 未能写入指定的 GATT 特征。 |
| 415 | Invalid value input for GATT characteristic (Characteristic value is not valid.) | 为 GATT 特征提供的值无效。 |
| 416 | Failed to write GATT descriptor | 未能写入指定的 GATT 描述符。 |
| 417 | Invalid value input for FTMS characteristic | 为 FTMS 特征提供的值无效。 |
| 418 | ClientId is empty | 客户端 ID 缺失或为空。 |
| 419 | Characteristic is already existed | 指定的特征已存在。 |
| 420 | Failed to connect with remote device | 未能与远端设备建立连接。 |
