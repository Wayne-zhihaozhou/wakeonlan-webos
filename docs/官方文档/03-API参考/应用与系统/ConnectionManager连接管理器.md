# Connection Manager（连接管理器）
> 原文链接: https://webostv.developer.lge.com/develop/references/connection-manager ｜ 简体中文翻译

**服务 URI - luna://com.palm.connectionmanager**

提供可用 Internet 连接的状态。

Connection Manager 提供了用于管理 Internet 连接的方法。它使应用能够获取连接的状态。

## 方法

| 方法 | 描述 | 模拟器中是否支持 |
| --- | --- | --- |
| [getStatus](#getstatus) | 获取系统当前网络连接（WiFi 与有线连接）的状态。 | 部分支持  <br>（仅支持有线） |

## getStatus

### 描述

获取系统当前网络连接（Wi-Fi 与有线连接）的状态。应用可以订阅该方法，以便在网络状态变化时收到通知。

### 参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| subscribe | 可选 | Boolean | 决定是否订阅的标志。<ul><li>true：订阅。</li><li>false：不订阅。仅调用该方法一次。（默认）</li></ul> |

### 调用返回

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorText | 可选 | String | 如果方法执行失败，errorText 将包含错误文本。只有当方法失败时，该方法才会返回 errorText。有关更多详细信息，请参见本方法的错误代码参考（Error Codes Reference）。 |
| subscribed | 可选 | Boolean | 指示订阅是否已启用的标志。<ul><li>true：已启用</li><li>false：未启用。</li></ul> |
| isInternetConnectionAvailable | 必需 | Boolean | 指示 Internet 连接是否可用的标志。<ul><li>true：任一 Internet 连接可用。</li><li>false：没有任何可用的 Internet 连接。</li></ul> |
| [wired](#wired) | 必需 | Object | 包含有线连接状态信息的对象。 |
| [wifi](#wifi) | 必需 | Object | 包含 Wi-Fi 连接状态信息的对象。 |
| [wifiDirect](#wifidirect) | 必需 | Object | 包含 Wi-Fi Direct 连接状态信息的对象。 |

### 订阅返回

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| isInternetConnectionAvailable | 必需 | Boolean | 指示 Internet 连接是否可用的标志。<ul><li>true：任一 Internet 连接可用。</li><li>false：没有任何可用的 Internet 连接。</li></ul> |
| [wired](#wired) | 必需 | Object | 包含有线连接状态信息的对象。 |
| [wifi](#wifi) | 必需 | Object | 包含 Wi-Fi 连接状态信息的对象。 |
| [wifiDirect](#wifidirect) | 必需 | Object | 包含 Wi-Fi Direct 连接状态信息的对象。 |

### 注意

- 在 webOS TV 3.X 中，getStatus() 的订阅功能无法正常工作。在这种情况下，请使用以下服务 URI 进行订阅：**luna://com.webos.service.connectionmanager**
- 无论 webOS TV 版本如何，你都可以使用 webOSTV.js 中的以下方法轻松监控网络状态：[connection.getStatus](../webOSTV.js库/webOSTV.js的webOSDevAPI.md#connectiongetstatus)

### 错误参考

| 错误消息 | 错误描述 |
| --- | --- |
| Connman manager is not available | Connection Manager（connman）进程未运行，此时无法获取网络状态。 |

### 示例

```javascript
// 一次性调用
var request = webOS.service.request('luna://com.palm.connectionmanager', {
  method: 'getStatus',
  onSuccess: function (inResponse) {
    console.log('Result: ' + JSON.stringify(inResponse));
    // 待处理事项
  },
  onFailure: function (inError) {
    console.log('Failed to get network state');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // 待处理事项
    return;
  },
});

// 订阅
var subscriptionHandle;

subscriptionHandle = webOS.service.request(
  'luna://com.palm.connectionmanager',
  {
    method: 'getStatus',
    parameters: { subscribe: true },
    onSuccess: function (inResponse) {
      if (typeof inResponse.subscribed != 'undefined') {
        if (!inResponse.subscribed) {
          console.log('Failed to subscribe network state');
          return;
        }
      }

      console.log('Result: ' + JSON.stringify(inResponse));
      // 待处理事项
    },
    onFailure: function (inError) {
      console.log('Failed to get network state');
      console.log('[' + inError.errorCode + ']: ' + inError.errorText);
      // 待处理事项
      return;
    },
  }
);
...
// 如果你需要取消订阅数据，请按如下所示使用 cancel() 方法
subscriptionHandle.cancel();
```

### 返回示例

```json
{
  "wired": {
      "netmask": "255.255.254.0",
      "dns1": "123.456.789.180",
      "ipAddress": "123.456.789.12",
      "onInternet": "yes",
      "method": "manual",
      "state": "connected",
      "gateway": "123.456.789.1",
      "interfaceName": "eth0"
  },
  "isInternetConnectionAvailable": true,
  "wifi": {
      "state": "disconnected"
  },
  "returnValue": true,
  "wifiDirect": {
      "state": "disconnected"
  }
}
```

### 另请参阅

无

## 对象

### wired 对象

**wired** 对象提供有线连接状态的详细信息。
只有当有线连接可用时，该对象的所有字段才会包含相关信息。如果有线连接不可用，该对象的 **state** 字段将被设置为 **disconnected**，并且这是返回给调用应用的唯一值。

```json
{
  "state": String,
  "interfaceName": String,
  "ipAddress": String,
  "netmaks": String,
  "gateway": String,
  "dns1": String,
  "dns2": String,
  "dns2": String,
  "method": String,
  "onInternet": String
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| state | 必需 | String | 如果有线连接可用，该字段将被设置为 **connected**。如果有线连接不可用，它将被设置为 **disconnected**。 |
| interfaceName | 可选 | String | 当前使用中的有线接口的名称。例如 **ppp0。** |
| ipAddress | 可选 | String | 与该有线连接关联的 IP 地址。 |
| netmask | 可选 | String | 有线连接的子网掩码值。 |
| gateway | 可选 | String | 网络网关的 IP 地址。 |
| dns1 | 可选 | String | 有线连接的主 DNS 地址 |
| dns2 | 可选 | String | 有线连接的备用 DNS 地址 |
| dns3 | 可选 | String | 有线连接的第三 DNS 地址 |
| method | 可选 | String | 如果 IP 地址是使用手动模式分配的，**method** 将包含 **Manual**。如果 IP 地址是通过 DHCP 分配的，**method** 将包含 **dhcp。** |
| onInternet | 可选 | String | 强制门户（captive portal）技术会强制网络上的 HTTP 客户端在正常使用 Internet 之前看到一个特殊的网页（通常用于身份验证）。强制门户被用于大多数 Wi-Fi 热点。**onInternet** 将包含以下值之一：<ul><li>yes：表示 Wi-Fi 连接已连接到 Internet。</li><li>no：表示 Wi-Fi 连接未连接到 Internet。</li></ul> |

### wifi 对象

**wifi** 对象提供 Wi-Fi 连接状态的详细信息。只有当 Wi-Fi 连接可用时，该对象的所有字段才会包含相关信息。如果 Wi-Fi 连接不可用，该对象只有 **state** 字段会被设置为 **disconnected**，并且这是返回给调用应用的唯一值。

```json
{
  "state": String,
  "interfaceName": String,
  "ipAddress": String,
  "netmaks": String,
  "gateway": String,
  "dns1": String,
  "dns2": String,
  "dns3": String,
  "method": String,
  "ssid": String,
  "isWakeOnWiFiEnabled": String,
  "onInternet": String
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| state | 必需 | String | 如果 Wi-Fi 连接可用，该字段将被设置为 **connected**。如果 Wi-Fi 连接不可用，它将被设置为 **disconnected**。 |
| interfaceName | 可选 | String | 当前使用中的 Wi-Fi 接口的名称。例如 **eth0。** |
| ipAddress | 可选 | String | 与该 Wi-Fi 连接关联的 IP 地址。 |
| netmask | 可选 | String | Wi-Fi 连接的子网掩码值。 |
| gateway | 可选 | String | 网络网关的 IP 地址。 |
| dns1 | 可选 | String | Wi-Fi 连接的主 DNS 地址 |
| dns2 | 可选 | String | Wi-Fi 连接的备用 DNS 地址 |
| dns3 | 可选 | String | Wi-Fi 连接的第三 DNS 地址 |
| method | 可选 | String | 如果 IP 地址是使用手动模式分配的，**method** 将包含 **Manual**。如果 IP 地址是通过 DHCP 分配的，**method** 将包含 **dhcp。** |
| ssid | 可选 | String | 已连接服务的 SSID（如果已知）。 |
| isWakeOnWiFiEnabled | 可选 | Boolean | 如果 Wi-Fi 接口被设置为即使在挂起时也保持开启，**isWakeOnWiFiEnabled** 将包含 **true**。如果 Wi-Fi 接口未被设置为在挂起时保持开启，**isWakeOnWiFiEnabled** 将包含 false。 |
| onInternet | 可选 | String | 强制门户（captive portal）技术会强制网络上的 HTTP 客户端在正常使用 Internet 之前看到一个特殊的网页（通常用于身份验证）。强制门户被用于大多数 Wi-Fi 热点。**onInternet** 将包含以下值之一：<ul><li>yes：表示 Wi-Fi 连接已连接到 Internet。</li><li>no：表示 Wi-Fi 连接未连接到 Internet。</li></ul> |

### wifiDirect 对象

**wifidirect** 对象提供 Wi-Fi Direct 连接状态的详细信息。只有当 Wi-Fi Direct 连接可用时，该对象的所有字段才会包含相关信息。如果 Wi-Fi Direct 连接不可用，该对象只有 **state** 字段会被设置为 **disconnected**，并且这是返回给调用应用的唯一值。

```json
{
  "state": String,
  "connectedPeers": WifiPeerInfo Object,
  "localIp": String,
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| state | 必需 | String | 如果 Wi-Fi 连接可用，该字段将被设置为 **connected**。如果 Wi-Fi 连接不可用，它将被设置为 disconnected。 |
| [connectedPeers](#wifipeerinfo) | 可选 | Object 数组 | 提供已连接对端（peer）信息的对象列表。 |
| localIp | 可选 | String | 本地连接端点的 IP 地址。 |

### WifiPeerInfo 对象

该对象包含有关点对点客户端的信息。

```json
{
  "deviceName": String,
  "deviceAddress": String,
  "groupOwner": Boolean,
  "configMethod": Number,
  "signalLevel": Number,
  "wfdInfo": WifiWfdInfo Object,
  "connected": Boolean,
  "peerIp": String,
  "invited": String,
  "serviceDiscoveryResponse": String
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| deviceName | 必需 | String | 设备名称 |
| deviceAddress | 可选 | String | 设备地址 |
| groupOwner | 必需 | Boolean | 组所有者 |
| configMethod | 可选 | Number | 配置方法 |
| signalLevel | 必需 | Number | 信号强度 |
| [wfdInfo](#wifiwfdinfo) | 可选 | Object | WFD 信息 |
| connected | 必需 | Boolean | 连接状态 |
| peerIp | 可选 | String | IPv4 地址 |
| invited | 可选 | String | 如果连接可用，此属性将被设置为 true。如果连接不可用，此属性将被设置为 false。 |
| serviceDiscoveryResponse | 可选 | String | 服务发现响应。仅在首次查询时发送，之后不再发送。 |

### WifiWfdInfo 对象（Wi-Fi Direct Info 对象）

该对象包含 Wi-Fi 对端连接中 Wi-Fi Direct 设置的信息。它用于 Wi-Fi Peer Info，并且仅当连接使用 Wi-Fi Direct 时才存在。

```json
{
  "wfdCpSupport": Boolean,
  "wfdDeviceType": String,
  "wfdRtspPort": Number,
  "wfdSessionAvail": Boolean,
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| wfdCpSupport | 必需 | Boolean | 指示是否支持 Wi-Fi Direct 内容保护的标志：<ul><li>true：支持</li><li>false：不支持。</li></ul> |
| wfdDeviceType | 必需 | String | Wi-Fi Direct 设备类型，取值之一：<ul><li>source</li><li>primary-sink</li><li>secondary-sink</li></ul> |
| wfdRtspPort | 必需 | Number | 用于 Wi-Fi Direct 会话管理的控制端口 |
| wfdSessionAvail | 必需 | Boolean | 指示会话是否可用的标志：<ul><li>true：可用</li><li>false：不可用</li></ul> |
