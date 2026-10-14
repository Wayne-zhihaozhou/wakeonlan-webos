# JS 服务使用
> 原文链接: https://webostv.developer.lge.com/develop/guides/js-service-usage ｜ 简体中文翻译

## 创建 JavaScript 服务

要创建 JS 服务，您可以使用 **`ares-generate`** 命令，该命令会从模板生成一个 JS 服务项目。如果您还没有一个用于调用服务的应用项目，则应在创建 JS 服务之前先创建一个应用项目。请注意，JS 服务不能单独打包。

重要

-   服务名称必须以应用 ID 开头。如果您不遵循此命名规则，服务打包将无法正常工作。例如，
    -   应用 ID：**`com.example.myapplication`**
    -   服务名称：**`com.example.myapplication.myservice`**
-   Luna Service 不允许在 JS 服务名称中使用减号（-）和 .(句点)+数字（例如 **`abc-1.0`**）。因此，如果您要在应用中添加 JS 服务，请不要在应用 ID 中包含减号（-）或 .(句点)+数字，因为如上所述，服务名称必须以应用 ID 开头。

**`ares-generate`** 命令及选项的用法如下。根据应用类型，使用 **`-t`** 选项指定相应的模板。以下是一些不同用途的示例：

**使用 CLI 从模板创建虚拟 Web 应用**

```shell
ares-generate -t basic -p "id=com.yourdomain.myapp" samplePrj
```

创建应用项目后，请以应用名称开头来创建 JS 服务项目。

**使用 CLI 从模板创建 JS 服务**

```shell
ares-generate -t js_service -s com.yourdomain.myapp.service samplePrjService
```

有关 **`ares-generate`** 命令及选项的用法，请参阅 [ares-generate](../../05-开发工具/命令行工具/webOSCLI开发者指南.md#ares-generate)。

### 打包 JS 服务

生成 JS 服务项目后，您应按如下所示配置 JS 服务目录。

![JS 服务创建目录结构](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914916/webOS-TV/images/docs/guides/JSservice_creation_vgshr8.png)

-   APP_DIR：应用目录
-   SERVICE_DIR：服务目录，其中包含一个以服务名称命名的子文件夹以及 JS 服务文件。您可以在 SERVICE_DIR 中放置多个服务文件夹。

关于服务子目录中文件的说明，请参阅下一节。

### 注册 JS 服务

JS 服务由以下文件组成：

-   package.json：配置服务元数据，并指向主服务文件。此文件用于打包（与 Node.js 相关）。
-   services.json：定义服务及其方法。此文件用于在 Luna 总线上注册 JS 服务。
-   JavaScript 服务源文件：服务实现文件，提供 JS 服务的各种用例。

#### package.json 文件

由于服务程序是 Node.js 模块，因此服务必须包含 _package.json_ 文件。最小的 _package.json_ 文件如下所示：

```shell
{
    "name": "com.mycom.helloworld.service",
    "main": "helloworld_webos_service.js"
}
```

-   在 **`name`** 属性中写入您的服务名称。
-   在 **`main`** 属性中写入您的主服务 JavaScript 文件名。

您还可以在 package.json 文件中设置许多其他值。有关 package.json 的完整规范，请参阅 [NPM（node package manager）](https://docs.npmjs.com/)。

#### services.json 文件

此服务配置文件描述了服务在 webOS 总线上提供的命令。请定义供其他应用和服务调用的命令。更多信息，请参阅 [services.json](../../03-API参考/配置文件/services.json服务配置.md)。

```shell
{
    "id": "com.mycom.helloworld.service",
    "description": "Sample helloworld service",
    "services": [{
        "name": "com.mycom.helloworld.service",
        "description": "Sample helloworld service"
    }]
}
```

#### 主服务 JavaScript 文件

在主服务 JavaScript 文件中，您应定义一个命令处理程序（command assistant），用于执行 _services.json_ 文件中定义的命令。

在将服务注册到您的代码之前，您应加载 **`webos-service`** 模块。用于 Node.js 的 **`webos-service`** 模块提供了系统总线的接口，并以熟悉的 Node.js 惯用方式封装。

以下示例演示如何加载 **`webos-service`** 模块。

```javascript
var Service = require('webos-service');
```

以下 JavaScript 示例注册了一个服务（**`luna://com.mycom.helloworld.service/hello`**），该服务以一条 "Hello, World!" 消息响应请求。

```javascript
var service = new Service("com.mycom.helloworld.service");

service.register("Hello", function(message) {
    message.respond({
                Response: "Hello, World " + message.payload.name + "!"
       });
});
```

有关 **`webos-service`** 模块的更多详情，请参阅 [webOS-Service API 参考](../../03-API参考/webos-service与Luna/webos-serviceAPI参考.md)。

### 打包 JS 服务

完成服务注册以及应用和服务的实现后，您需要将它们打包成一个 .IPK 文件。

打包 JS 服务时，ares-package 命令及选项的用法如下。如上图所示，**`APP_DIR`** 和 **`SERVICE_DIR`** 分别指应用目录和服务目录。您可以为 **`APP_DIR`** 和 **`SERVICE_DIR`** 使用绝对路径或相对路径。

```shell
ares-package APP_DIR SERVICE_DIR
```

以下是一些不同用途的示例：

**使用绝对路径打包服务（Windows）**

```shell
ares-package c:\samples\app1 c:\samples\service1
```

**使用绝对路径打包服务（Linux/macOS）**

```shell
ares-package ~/samples/app1 ~/samples/service1
```

**使用相对路径打包服务（Windows）**

```shell
ares-package app1 service1
```

**使用相对路径打包服务（Linux/macOS）**

```shell
ares-package ./app1 ./service1
```

**为应用打包多个服务（Windows）**

```shell
ares-package app1 service1 service2
```

**为应用打包多个服务（Linux/macOS）**

```shell
ares-package ./app1 ./service1 ./service2
```

有关 **`ares-package`** 命令及选项的用法，请参阅 [ares-package](../../05-开发工具/命令行工具/webOSCLI开发者指南.md#ares-package)。

## 调用 JavaScript 服务

### 导入 JS 文件

在 webOS TV 平台上，您可以使用 webOSTV.js 库调用 webOS 服务。webOSTV.js 库基本包含在 CLI 的基础模板中。不过，我们建议您下载并使用该库的最新版本。您可以在 [webOSTV.js 介绍](../../03-API参考/webOSTV.js库/webOSTV.js库简介.md) 页面下载最新的 webOSTV.js 库。

要应用最新的 webOSTV.js 库，请按照以下步骤操作：

1.  下载并解压 _webOSTV.js zip_ 文件。
2.  将解压后的文件复制到您的应用目录。
3.  在应用的主文件（例如 index.html）中插入以下 script 标签。请确保源路径与应用目录的路径相对应。
    ```javascript
    <script type="text/javascript" src="webOSTVjs-1.2.4/webOSTV.js"></script>
    ```

有关 webOSTV.js 库的更多详情，请参阅 [webOSTV.js](../../03-API参考/webOSTV.js库/webOSTV.js库简介.md) 指南。

### 从 Web 应用调用服务

任何应用都可以包含 webOSTV.js，并使用 **`webOS.service.request`** 方法进行 webOS 服务调用。

要在未使用 Enyo 开发的应用中调用服务，请使用 **`webOS.service.request`** 方法。

```javascript
var subscribeStatus = true; //change this to false to disable subscription
var resubscribeStatus = true; //change this to false to disable resubscription

var request = webOS.service.request("luna://com.mycom.helloworld/", {
    method:"someMethod",
    parameters: {
        foo:"bar"
    },
    onSuccess: function(inResponse) {
        //....
    },
    onFailure: function(inError) {
        //....
    },
    onComplete: function(inResponse) {
        //....
    },
    subscribe: subscribeStatus,
    resubscribe: resubscribeStatus
});
```

请查看 [Hello World Service](https://github.com/webOS-TV-app-samples/HelloWorldService) 示例应用。

### 从另一个服务调用服务

任何服务都可以包含 webOSTV.js，并使用 **`service.call`** 方法进行 webOS 服务调用，如下例所示。

```javascript
var Service = require('webos-service');
var service = new Service("com.palm.service.helloworld");
service.register("hello", function(message) {
    service.call("luna://com.palm.connectionmanager/getstatus", {}, function(response) {
        console.log(response.payload);
        if(response.payload.isInternetConnectionAvailable == true) {
            // ...
            message.respond({
                "returnValue": true
            });
        }
    });
});
```

有关 webos-service 模块的更多详情，请参阅 [webOS-Service API 参考](../../03-API参考/webos-service与Luna/webos-serviceAPI参考.md)。

重要

**存储与共享数据** JavaScript 服务运行在 **`jail`**（沙箱）中，即权限受限的环境中。每当一个受限（jailed）服务运行时，它都应始终使用相同的用户 ID，以便能够访问它上次运行时写入的文件，但它无法访问由其他应用或服务创建的文件。如果某个服务需要与其它应用或服务共享数据，它必须提供一些方法，让应用和其它服务能够查询和/或更新其数据。服务存储的数据应保存到 **`/media/internal`**。

**不要（Do Not）**

-   服务不应运行很长时间（几分钟），主要是出于内存成本的考虑。
-   不要使用 node.js 中的同步 API。

## 请求订阅（subscription）

**`webos-service`** 模块支持订阅功能。对于支持订阅的服务，您可以向另一个服务发送订阅请求。有关 **`webos-service`** 模块的更多详情，请参阅 [webOS-Service API 参考](../../03-API参考/webos-service与Luna/webos-serviceAPI参考.md)。

### 客户端订阅

在客户端（请求方）一侧，订阅由 Subscription 对象处理。在大多数情况下，您只需要执行类似以下操作：

```javascript
var Service = require('webos-service'); 
var service = new Service("com.domain.app"); 
var sub = service.subscribe("luna://com.palm.connection/status", {"subscribe": true}); 
sub.on("response", function(message) { 
    //do something with the subscription 
});
```

### 服务端订阅

webos-service 库为希望支持订阅的服务提供了一些内置支持。如果某个方法有 cancel（取消）处理程序，那么它就被视为可订阅。该库会自动跟踪订阅请求，并将其注册到 System Bus（系统总线），以确保 **`cancel`** 事件能够正确传递。您为该方法编写的请求处理程序应检查消息的 **`isSubscription`** 属性，以判断是否已请求订阅。

在大多数情况下，您会希望将订阅消息添加到一个数组或 Object 哈希中，以便在稍后需要更新它们时进行跟踪。以下是一个部分示例：

```javascript
var subscriptions = {};

var heartbeat = service.register("heartbeat2");
heartbeat.on("request", function(message) {
    message.respond({event: "beat"}); // initial response 
    if (message.isSubscription) { 
        subscriptions[message.uniqueToken] = message; //add message to "subscriptions" 
        if (!interval) { 
            createInterval(); // launch some async process 
        } 
    } 
}); 
heartbeat.on("cancel", function(message) { 
    delete subscriptions[message.uniqueToken]; // remove message from "subscriptions" 
    var keys = Object.keys(subscriptions); 
    if (keys.length === 0) { // count the remaining subscriptions 
        console.log("no more subscriptions, canceling interval"); 
        clearInterval(interval); // don't do work in the background when there are no subscriptions 
        interval = undefined; 
    } 
});
```
