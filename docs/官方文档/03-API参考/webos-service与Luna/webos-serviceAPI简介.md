# webos-service API 简介
> 原文链接: https://webostv.developer.lge.com/develop/references/webos-service-introduction ｜ 简体中文翻译

# webos-service 模块简介

用于 Node.js 的 webos-service 模块提供对系统总线的接口，并以熟悉的 Node.js 惯用写法封装。

## 代码示例

以下示例在 webOS TV 系统总线上注册一个服务（luna://com.example.helloworld/hello），该服务会以一条 "Hello, World!" 消息响应请求。

```js
// helloworld.js
// simple service, based on webos-service API
var Service = require('webos-service');

var service = new Service('com.example.helloworld');
service.register('hello', function (message) {
  message.respond({
    greeting: 'Hello, World!',
  });
});
```

## 加载 webos-service 库

这会加载 webos-service 模块。webos-service 模块唯一导出的内容是 Service 构造函数。

```js
var Service = require('webos-service');
```
