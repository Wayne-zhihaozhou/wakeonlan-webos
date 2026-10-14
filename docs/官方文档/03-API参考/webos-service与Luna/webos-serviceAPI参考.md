# webos-service API 参考
> 原文链接: https://webostv.developer.lge.com/develop/references/webos-service-reference ｜ 简体中文翻译

# webos-Service API 参考

## Service 对象

### Service 对象

**语法**

```js
Service(busID);
```

**描述**

创建一个 `Service` 对象，它负责在系统总线上注册方法（methods）。

**参数**

-   busID：一个字符串，包含服务的总线地址，例如 "com.example.helloworld"

**示例**

```js
var service = new Service(busID);
```

### service.activityManager

**描述**

该服务的 `ActivityManager` 代理对象。详情请参见 [ActivityManager](webos-serviceAPI参考.md#activitymanager-object) 对象。

### service.busId

**描述**

创建 `Service` 时使用的 busId。

### service.call

**描述**

向另一个服务发送一次性请求。

**语法**

```js
service.call(uri, arguments, function callback(message) {
    ...
})
```

**参数**

-   uri：该参数是要发送到的服务的总线地址，例如：luna://com.palm.wifi/status
-   arguments：该参数是一个 JSON 兼容对象，由库进行编码，并作为请求的一部分发送。
-   callback：该回调函数以单个参数调用，参数是一个 `Message`。详情请参见 [Message](webos-serviceAPI参考.md#message-object) 对象。

### service.register

**描述**

为服务注册一个方法。当针对该方法发出请求时，会调用回调函数。回调接收一个参数，即 [Message](webos-serviceAPI参考.md#message-object) 对象。

**语法**

```js
service.register(methodName, [function request(message) {
    ...
}], [function cancel(message) {
    ...
}])
```

**参数**

-   methodName：该参数是要注册的方法的名称。你可以通过在 methodName 前面加上类别并以 "/" 字符分隔，来将方法分组到类别中，例如：
    
    ```js
    service.register("/config/setup", function callback(message) {
      ...
    });
    ```
    

**返回值**

该方法返回一个 [Method](webos-serviceAPI参考.md#method-object) 对象，该对象会触发 `request` 和 `cancel` 事件。如果提供了 `request` 和 `cancel` 参数，它们会分别绑定到 `request` 和 `cancel` 事件上。

### service.subscribe

**描述**

向支持订阅的另一个服务发送订阅请求。

**语法**

```js
service.subscribe(uri, arguments);
```

**参数**

-   上述 `uri` 和 `arguments` 参数与上面 call 方法中的相同。

**返回值**

该方法返回一个 [Subscription](webos-serviceAPI参考.md#subscription-object) 对象，当另一个服务返回响应时会触发相应事件。

### service.subscriptions

**描述**

当前订阅到此服务的所有 Message，按其 System Bus uniqueToken 索引。

## Message 对象

Message 对象用于表示从其他服务或应用程序发来的消息。

### message.cancel

**描述**

向发送方发送一条 "cancel" 消息，表示将不再发送更多响应。此方法通常只用于订阅调用。一次性调用不需要 "cancel" 响应。

**语法**

```js
message.cancel();
```

### message.category

**描述**

被调用方法所属的类别。

### message.isSubscription

**描述**

如果 `payload` 中包含 `"subscribe": true`，则该属性被设为 _true_，这表示发送方想要订阅。

### message.method

**描述**

被调用方法的名称。该属性是服务 URI 中方法名之前的部分。

### message.respond

**描述**

向请求方发送响应。

**语法**

```js
message.respond(payload);
```

**参数**

-   payload：该参数是一个对象，在发送前会被 JSON 编码。每个响应都应包含一个 `returnValue` 属性，成功响应时设为 _true_，出错时设为 _false_。

### message.sender

**描述**

消息发送方的 `applicationID` 或 `busID`，具体取决于消息来自应用还是另一个服务。

### message.uniqueToken

**描述**

唯一标识此请求的字符串。可以保证在服务任意一次运行范围内是唯一的。如果你需要跟踪服务请求，这很可能是你想要使用的 token。

## Method 对象

### service.register

**描述**

创建一个 `Method` 对象，它是一个 EventEmitter，会触发 `request()` 和 `cancel()` 方法。

**语法**

```js
service.register(methodName[, requestCallback][, cancelCallback])
```

### 事件 "request"

**描述**

当有消息发送到已注册的方法时，会触发此事件。事件处理器会接收到与请求对应的 `Message` 对象。

### 事件 "cancel"

**描述**

当消息的发送方表示不再对接收回复感兴趣时，会触发此事件。此事件仅为已订阅的消息触发。

## Subscription 对象

### service.subscribe

**描述**

创建一个 `Subscription` 对象，表示向 uri 发出的请求。

**语法**

```js
service.subscribe(uri, payload);
```

**参数**

-   uri：该参数是服务方法的完整 URI，例如 luna://com.palm.wifi/status
-   payload：该参数是一个对象，在发送前会被 JSON 编码。

### subscription.on 配合 "response"

**描述**

每当另一个服务发送响应时，会发送一个 `response` 事件。回调接收单个 `Message` 参数。

**语法**

```js
subscription.on("response", function callback(message) {
    ...
})
```

### subscription.on 配合 "cancel"

**描述**

`cancel` 表示另一个服务已取消该订阅。此时最好移除对该订阅的任何引用，以便该消息可以被垃圾回收。

**语法**

```js
subscription.on("cancel", function callback(message) {
    ...
})
```

### subscription.cancel

**描述**

向另一个服务发送取消消息，表示你不再希望接收响应。

**语法**

```js
subscription.cancel();
```

## ActivityManager 对象

### service.activityManager

**描述**

该对象表示到 ActivityManager System Bus 服务（com.palm.activitymanager）的代理，同时还提供一个用于控制服务生命周期的计时器。

**示例**

```js
var activityManager = service.activityManager;
```

### activityManager.create 配合 "name"

**描述**

创建一个带合理默认属性集的活动（activity），供服务立即执行。只要活动处于活动状态，服务就不会因超时而消失。请注意，webos-service 库会为每个传入的请求创建一个新活动，因此在简单情况下你无需自行创建。你的回调会以新活动作为参数被调用。

**语法**

```js
activityManager.create('name', callback);
```

### activityManager.create 配合给定的活动规范

**描述**

使用给定的活动规范创建一个活动。当你想要带回调创建一个活动，以便稍后执行你的服务时，这很有用。你的回调会以新活动作为参数被调用。

**语法**

```js
activityManager.create(activitySpecification, callback);
```

### activityManager.complete

**描述**

当你发送响应时，与命令关联的活动会被自动完成。如果你想为完成操作指定选项，例如重启活动，或更改与该活动关联的触发条件或计划，你可以显式调用 `complete` 方法。

**语法**

```js
activityManager.complete(activitySpecification, options, callback);
```
