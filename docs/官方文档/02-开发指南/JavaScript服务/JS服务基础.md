# JavaScript 服务基础
> 原文链接: https://webostv.developer.lge.com/develop/guides/js-service-basics ｜ 简体中文翻译

## 什么是 webOS JavaScript 服务？

webOS 上的 JavaScript 服务（JS 服务）为应用提供了一种即使应用未运行时也能执行工作的方式。它们还提供对通常 Web 应用无法访问的平台功能的访问。

webOS TV 上的 JS 服务具有以下特性：

-   它使用 JavaScript 编写，并使用 Node.js 创建。
-   它在 webOS TV 上于后台运行。
-   它提供对平台功能的额外访问，例如底层网络（low-level networking）、文件系统访问和二进制数据处理。
-   它为一个或多个应用执行任务。

### webOS JavaScript 服务的用例

通常，你会使用服务来执行 webOS 应用无法完成的任务，或由服务在后台执行工作。以下是一些服务在过去的 webOS 应用中使用的示例：

-   为电子邮件客户端在后台下载附件
-   从应用上传图片到图片分享网站
-   执行长时间运行的计算或文件操作

## 关于 Node.js

[Node.js](http://www.nodejs.org/) 是作为服务端 JavaScript 应用的框架而创建的。webOS 中的服务与 Web 应用服务器并不完全相同（特别是因为它们不会一直保持运行），但异步 I/O 和网络栈的基本框架作为 webOS 应用环境的扩展非常有意义。

### 受支持的 Node.js 版本

webOS TV 根据 webOS TV 平台版本的不同，支持不同版本的 Node.js 核心模块，如下表所示。

| **webOS TV 平台版本** | **Node.js 版本** |
| --- | --- |
| webOS TV 26 | v20.12.2 |
| webOS TV 25 | v16.20.2 |
| webOS TV 24 | v16.19.1 |
| webOS TV 23 | v12.22.2 |
| webOS TV 22 | v12.21.0 |
| webOS TV 6.0 | v8.12.0 |
| webOS TV 5.0 | v8.12.0 |
| webOS TV 4.x | v0.12.2 |
| webOS TV 3.x | v0.12.2 |
| webOS TV 2.x | v0.10.25 |
| webOS TV 1.x | v0.10.15 |

> **Caution（注意）**
>
> 在开发 JS 服务时，应始终牢记 webOS TV 各版本所支持的 Node.js 版本。例如，在 webOS TV 4.x 或更低版本中，不支持以下 ES6 语法：
>
> -   `const`、`let`
> -   箭头函数（arrow function）
> -   解构（destructing）
>
> 你可以在 [node.green](https://node.green/) 查看 Node.js 各版本所支持的语法。

### 使用 Node.js 核心模块

要使用 Node.js 核心模块，请使用顶层标识符将模块添加到你的服务中，代码如下所示。

```javascript
var Service = require('webos-service');
var md5 = require('md5');

var service = new Service('com.yourdomain.helloworldservice.service');

service.register('hello', function (message) {
  message.respond({
    data: 'Hello, ' + md5(message.payload.name) + '!',
  });
});
```

### 使用第三方模块

Node.js 有许多第三方模块。要使用第三方模块，请按以下步骤操作。

1.  在你的计算机上使用 NPM（Node 包管理器）工具安装第三方模块。该模块将被安装到 Node.js 安装目录下的 `node_modules` 目录中。有关这些模块的搜索与安装，请参阅 [Node 打包模块（NPM）](https://www.npmjs.org)。
2.  在你的服务根目录下创建一个 `node_modules` 目录。
3.  将 Node.js 目录下的 `node_modules` 目录中的模块，复制到你的服务根目录下的 `node_modules` 目录中。

现在，将第三方模块添加到你的服务中，代码如下所示。Node 将首先从 `node_modules` 目录中查找该模块。

```javascript
var md = require('md5');
```

> **Important（重要）**
>
> -   Web 应用将文件下载到电视设备是不受支持的。服务可以下载文件，但已下载的这些文件无法从 Web 应用中访问。
> -   你不能使用包含 C/C++ 插件的模块。你必须使用仅以 JavaScript 实现的模块。
