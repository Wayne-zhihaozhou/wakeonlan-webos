# JavaScript 服务常见问题
> 原文链接: https://webostv.developer.lge.com/develop/guides/js-service-faq ｜ 简体中文翻译

## Q1. 我该如何测试我的服务？

要测试 JS 服务，请参见以下文章。

-   [在 webOS TV 上测试应用](../../01-快速入门/开发者模式应用.md)
-   [使用 CLI 测试 JS 服务](../../05-开发工具/命令行工具/webOSCLI开发者指南.md#launch-node-inspector)
-   [使用模拟器测试 JS 服务](../../05-开发工具/模拟器与仿真器/Simulator开发者指南.md#using-service)

## Q2. 我该如何调试我的服务？

SDK 中包含的一个实用 CLI 工具 `ares-inspect` 可用于调试。对于 HelloWorldService 示例，请使用以下命令在浏览器中启动 Node Inspector。关于使用 CLI 调试 JS 服务的信息，你也可以从 [Launch Node Inspector](../../05-开发工具/命令行工具/webOSCLI开发者指南.md#launch-node-inspector) 中找到。

```shell
ares-inspect -d emulator -s com.mycom.helloworldservice.service -o
```

有关使用 node-inspector 的更多信息，请参见他们的 [Github](https://github.com/node-inspector/node-inspector) 页面。

## Q3. 为什么我的服务会在 5 秒后退出，并显示 "No active activities" 消息？

webos-service 库内置了一个 5 秒定时器，如果服务当前不处于 _active_（活动）状态，该定时器会导致服务退出。就这个定时器而言，如果满足以下任一条件，则视为服务处于活动状态：

1.  有其他应用或服务对它持有订阅（subscription）
2.  它收到了一条尚未响应的消息 \[尚未调用 message.respond()\]

## Q4. 为什么我的服务永远不会退出？

作为上述问题的推论，如果你的服务在应该退出时似乎仍然存在，有几种可能。它可能收到了一条从未对其调用 respond() 的消息，或者可能有另一个服务对其持有一个未结清的订阅（outstanding subscription），或者它可能只是陷入了一个无限循环。

## Q5. 我怎样才能延长空闲超时时间？

Service 对象将来会新增一个 API 来支持操作该定时器。目前，你必须通过 ActivityManager 对象来实现：

```javascript
var Service = require("webos-service"); 
var service = new Service("com.example.myservice"); 
service.activityManager.idleTimeout = 15; 
// this timeout is in seconds
```

（注：上述注释意为“该超时时间以秒为单位”）

## Q6. 我怎样才能永久禁用空闲超时？

首先，请确保你确实需要这样做。

一般来说，你应该顺应标准的服务生命周期，而不是与它对着干。特别是，如果你的服务正在等待某个条件发生变化，更好的做法是使用 ActivityManager 注册一个活动（activity），并在条件满足时让 ActivityManager 重新启动你的服务。

禁用超时的最佳方式是创建一个 ActivityManager 活动，并在你需要服务保持运行的这段时间内让它保持 "live"（存活）状态。这是最佳做法，因为这样不仅会禁用定时器，而且即使有人启用了 ActivityManager 的空闲任务终止功能，也能保护你的服务不被 ActivityManager 杀死。

```javascript
// create an Activity 
var keepAlive; 
service.activityManager.create("keepAlive", function(activity) {
	keepAlive = activity; 
}); 
// When you're done, complete the activity 
service.activityManager.complete(keepAlive, function(activity) { 
	console.log("completed activity"); 
});
```

（注：上述注释意为“创建一个活动”和“完成后，结束该活动”）

## Q7. 当我尝试向我的服务发送消息时，收到 'Service does not exist' 错误，这是什么意思，我该如何修复？

这意味着 hub（集线器）不知道你的服务。以下是一些需要检查的事项：

-   检查应用中使用的服务名称是否与服务注册时所使用的服务名称完全一致。
