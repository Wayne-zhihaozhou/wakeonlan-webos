# BLE GATT
> 原文链接: https://webostv.developer.lge.com/develop/guides/ble-gatt ｜ 简体中文翻译

BLE GATT API 允许你使用 webOS TV 的 BLE GATT 客户端功能。对于采用 webOS TV 24 或更高版本的设备，你可以使用 BLE GATT API。

要使用 BLE GATT API，你的应用需要获取用户权限。如果应用在未获得权限的情况下调用该 API，将出现一个用于获取用户权限的弹出窗口，只有在用户选择授予权限后，应用才能使用 BLE GATT API。一旦获得权限，应用的权限将一直有效，直到用户删除它，在此之前不会再出现获取权限的弹出窗口。如果用户明确删除了该权限，应用将无法使用 BLE GATT API，只有用户再次授予权限后，应用才能再次使用该 API。

本文档中介绍的 API 操作，已通过一台充当 GATT 服务器的 Android 手机进行了验证，用于充当 GATT 服务器的 Android 应用是 [Google Play](https://play.google.com/store/apps/details?id=com.cozyoz.bletool&hl=en_US) 上提供的 **BLE Tool**。

有关 BLE GATT API 每个方法的使用方法，请参阅 [BLE GATT API Reference](../../03-API参考/无线与输入/BLEGATT蓝牙服务.md)。

> **注意（Note）**
>
> 此 API 仅适用于 webOS TV 24 或更高版本。

## 概述

本指南描述了一个电视设备如何充当 GATT 客户端的示例。如果在不支持该 API 的 webOS TV 平台上调用本文档中介绍的任何方法，**`returnValue`** 将返回 false，且 **`errorText`** 为 **`Unknown method`**。

```javascript
// 从不支持的 webOS 版本调用 BLE API 时

var isEnabledHandle = webOS.service.request(
  "luna://com.webos.service.blegatt",
  {
    method: "isEnabled",
    parameters: {
      subscribe: true,
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
    },
    onFailure: function (inError) {
      // "errorCode": -1,
      // "errorText": "Unknown method "isEnabled" for category "/""
      console.log("[" + inError.errorCode + "]: " + inError.errorText); // To-Do something
      return;
    },
  }
);
```

当连接蓝牙硬件出现问题或未找到蓝牙硬件时，如果调用本文档中介绍的任何方法，**`returnValue`** 将返回 false，且 **`errorText`** 为 **`Bluetooth adapter is not available`**。

```javascript
// 如果蓝牙硬件的连接出现问题或
// 硬件缺失
var isEnabledHandle = webOS.service.request(
  "luna://com.webos.service.blegatt",
  {
    method: "isEnabled",
    parameters: {
      subscribe: true,
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
    },
    onFailure: function (inError) {
      // "errorCode": 100,
      // "errorText": " Bluetooth adapter is not available"
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  }
);
```

此外，维护 BLE 连接以及所有其他与 BLE 相关的操作（如 read、write 和 notify）都可以在应用处于前台时执行。如果应用进入后台或被终止，所有 BLE 连接都将丢失。如果应用回到前台或被重新启动，应再次执行本节中的以下流程。

## 检查蓝牙适配器

调用 isEnabled 方法检查蓝牙是否已启用。如果此方法返回的 **`isEnabled`** 为 false，则表示电视设备的蓝牙功能当前不可用。**`isEnabled`** 方法支持订阅，每当蓝牙功能的可用性发生变化时，都会返回更新后的信息。

```javascript
var isEnabledHandle = webOS.service.request(
  "luna://com.webos.service.blegatt",
  {
    method: "isEnabled",
    parameters: {
      subscribe: true,
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // check isEnabled
      if (inResponse.isEnabled === true) {
        isEnabledHandle.cancel(); // cancel subscribe
        // To-Do something
      }
    },
    onFailure: function (inError) {
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  }
);
```

## 查找 BLE 设备

要查找 BLE 设备，请使用 **`startScan`** 方法。如果你想搜索某种特定类型的外围设备，可在调用该方法时包含 **`uuid`** 参数。此 **`uuid`** 参数应包含指示 GATT 服务的值。以下是关于 **`startScan`** 方法需要注意的一些要点。

- 如果在调用此方法后未通过调用 **`stopScan`** 方法来停止扫描，扫描将在 60 秒后自动停止。

- 你可以通过 **`getState`** 方法的返回值来检查扫描当前是否正在进行。

- 如果在扫描已在进行时再次调用 **`startScan`** 方法，**`returnValue`** 将为 false，且 **`errorCode:1003`**、**`errorText`** 为 **`Scan is already in progress`**。

```javascript
stopScan = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: "stopScan",
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
};

startScan = function () {
  var scanHandle = webOS.service.request("luna://com.webos.service.blegatt", {
    method: "startScan",
    parameters: {
      subscribe: true,
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      if (inResponse.devices) {
        for (let i = 0; i < inResponse.devices.length; i++) {
          if (inResponse.devices[i].address === targetAddress) {
            // find target device
            scanHandle.cancel(); // cancel subscribe
            stopScan(); // stop scanning
            // To-Do something
            break;
          }
        }
      }
    },
    onFailure: function (inError) {
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
    },
  });
};
```

以下是使用 **`getState`** 方法检查扫描当前是否正在进行的示例。

```javascript
getState = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: "getState",
    parameters: {
      subscribe: true,
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      if (inResponse.isScan === true) {
        // scanning in progress
        // To-Do something
      } else {
        // timeout or stopScan is called somewhere else
        // Scan request available status
        // To-Do something
      }
    },
    onFailure: function (inError) {
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
    },
  });
};
```

## 连接到 GATT 服务器

与 BLE 设备交互的第一步是连接到该设备，更具体地说，是连接到该设备的 GATT 服务器。要连接到 BLE 设备的 GATT 服务器，请使用 **`client/connect`** 方法。此方法接收 GATT 服务器的 mac 地址作为参数。

```javascript
connect = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: "client/connect",
    parameters: {
      subscribe: true,
      address: "f7:0e:a1:0b:e7:84", // your taeget device address
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
      handleEvent(inResponse);
    },
    onFailure: function (inError) {
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
    },
  });
};
```

前一个示例中的调用会连接到由 BLE 设备托管的 GATT 服务器，webOS TV 可以充当 GATT 客户端。从订阅返回值中，你可以查看连接状态以及 GATT 客户端的额外操作结果。

```javascript
handleEvent = function (inResponse) {
  console.log("Result: " + JSON.stringify(inResponse));
  var event = inResponse.event;
  var values = inResponse.vales;

  // check connection state
  if (event === "onConnectionStateChange") {
    if (values) {
      if (values.address === targetAddress && values.connected === true) {
        // device is connected
        // To-Do something
      } else {
        // device is disconnected
        // To-Do something
      }
    }
  }
  // new services discovered
  else if (event === "onServicesDiscovered") {
    // To-Do something
  }
  // Characteristic notification
  else if (event === "onCharacteristicChanged") {
    // To-Do something
  }
  // Result of a characteristic read operation
  else if (event === "onCharacteristicRead") {
    // To-Do something
  }
  // Result of a characteristic write operation
  else if (event === "onCharacteristicWrite") {
    // To-Do something
  }
  // Result of a descriptor read operation
  else if (event === "onDescriptorRead") {
    // To-Do something
  }
  // Result of a descriptor write operation
  else if (event === "onDescriptorWrite") {
    // To-Do something
  }
};
```

通过作为 **`client/connect`** 方法订阅返回值交付的事件，可以获知 GATT 客户端的操作情况，并且根据收到的事件，你可以添加适当的后续操作。

## 发现/获取 GATT 服务器服务

要向 GATT 服务器的特征中读取或写入数据，首先应搜索服务器支持的各项服务。这可以通过调用 **`client/discoverServices`** 方法来完成，当搜索完成时，会以 **`client/connect`** 方法订阅返回值的形式交付一个 **`onServicesDiscovered`** 事件。

```javascript
discoverServices = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: " client/discoverServices",
    parameters: {
      address: "f7:0e:a1:0b:e7:84",
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
};
```

```javascript
handleEvent = function (inResponse) {
  var event = inResponse.event;
  // Result of discover services operation
  if (event === "onServicesDiscovered") {
    // To-Do something
  }
};
```

关于已发现的服务器服务的信息，可以通过调用 **`client/getServices`** 方法来查看，该信息会与 **`onServicesDiscovered`** 事件一起，以 **`client/connect`** 方法订阅返回值的形式交付。

```javascript
getServices = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: " client/getServices",
    parameters: {
      address: "f7:0e:a1:0b:e7:84",
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
};
```

```javascript
handleEvent = function (inResponse) {
  var event = inResponse.event;
  var values = inResponse.vales;
  // Result of a characteristic read operation
  if (event === "onServicesDiscovered") {
    // To-Do something
    console.log("values: " + JSON.stringify(values));
  }
};
```

## 读取/写入 BLE 特征

当 webOS TV 连接到 GATT 服务并发现一项服务后，它就可以读取和写入特征（如果支持的话）。可以使用 **`client/readCharacteristic`** 方法来读取特征，读取到的信息会以 **`onCharacteristicRead`** 事件的形式，作为 **`client/connect`** 方法的订阅返回值交付。

```javascript
readCharacteristic = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: " client/readCharacteristic",
    parameters: {
      address: "f7:0e:a1:0b:e7:84",
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
};
```

```javascript
handleEvent = function (inResponse) {
  var event = inResponse.event;
  var values = inResponse.vales;
  // Result of a characteristic read operation
  if (event === "onCharacteristicRead") {
    // To-Do something
    console.log("values: " + JSON.stringify(values));
  }
};
```

使用 **`client/writeCharacteristic`** 方法，你可以向特征写入一个值，写入结果会以 **`onCharacteristicWrite`** 事件的形式，作为 **`client/connect`** 方法的订阅返回值交付。但是，如果需要连续地向某个特征写入数据，请先调用 **`client/writeCharacteristic`** 方法。然后，在收到作为 **`client/connect`** 方法订阅返回值的 **`onCharacteristicWrite`** 事件后，再使用 **`client/writeCharacteristic`** 方法写入数据。

```javascript
writeCharacteristic = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: " client/writeCharacteristic",
    parameters: {
      address: "f7:0e:a1:0b:e7:84",
      characteristic: "0000fff4-0000-1000-8000-00805f9b34fb",
      service: "0000fff0-0000-1000-8000-00805f9b34fb",
      value: { bytes: [92, 91, 93] },
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
};
```

```javascript
var availableWriteCharacteristic = true;
var pollingCount = 0;
var timerId = 0;

handleEvent = function (inResponse) {
  var event = inResponse.event;
  var values = inResponse.vales;
  // Result of a characteristic write operation
  if (event === "onCharacteristicWrite") {
    console.log("values: " + JSON.stringify(values));
    availableWriteCharacteristic = ture;
  }
};

checkWriteCharacteristic = function () {
  // check to available writeCharacteristic
  if (availableWriteCharacteristic === true) {
    // clear timer
    clearTimeout(timerId);
    timerId = 0;
    pollingCount = 0;
    // write characteristic
    availableWriteCharacteristic = false;
    writeCharacteristic();
  } else {
    // need to polling to check write characteristic
    // This is an example implemented in the case of repetition three times.
    if (pollingCount < 3) {
      pollingCount++;
      timerId = setTimeout(function () {
        checkWriteCharacteristic();
      }, 100); // period is 100ms
    } else {
      clearTimeout(timerId);
      timerId = 0;
      pollingCount = 0;
    }
  }
};
```

## 接收 GATT 通知

你可以开启针对某个特征变化的通知。使用 **`setCharacteristicNotification`** 方法开启针对某个特征的通知。在针对该特征的通知开启期间，如果远端设备上的特征发生变化，会以 **`client/connect`** 方法订阅返回值的形式交付 **`onCharacteristicChanged`** 事件以及变化后的信息。

```javascript
setCharacteristicNotification = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: " client/setCharacteristicNotification",
    parameters: {
      address: "f7:0e:a1:0b:e7:84",
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
};
```

```javascript
handleEvent = function (inResponse) {
  var event = inResponse.event;
  var values = inResponse.vales;
  // Result of a characteristic read operation
  if (event === " onCharacteristicChanged") {
    // To-Do something
    console.log("values: " + JSON.stringify(values.changed));
  }
};
```

如有必要，为了接收通知，你需要更改客户端特征配置描述符（Client Characteristic Configuration Descriptor，CCCD）的配置以开启通知。这可以通过 **`client/writeDescriptor`** 方法的 **`notification`** 参数来完成。

```javascript
setCharacteristicNotification = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: "writeDescriptor",
    parameters: {
      address: "4f:6b:40:db:5b:b2",
      descriptor: "00002902-0000-1000-8000-00805f9b34fb", // CCCD
      characteristic: "0000fff4-0000-1000-8000-00805f9b34fb",
      service: "0000fff0-0000-1000-8000-00805f9b34fb",
      notification: "ENABLE_NOTIFICATION_VALUE",
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
};
```

## 关闭 GATT 连接

当应用对 BLE 设备的使用完毕时，应通过调用 **`client/disconnect`** 方法来终止与该设备的连接。

```javascript
disconnect = function () {
  var request = webOS.service.request("luna://com.webos.service.blegatt", {
    method: " client/disconnect",
    parameters: {
      address: "f7:0e:a1:0b:e7:84",
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
};
```
