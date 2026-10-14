# Web 应用类型
> 原文链接: https://webostv.developer.lge.com/develop/getting-started/web-app-types ｜ 简体中文翻译

webOS TV 的 Web 应用可细分为两种类型：基础（打包）Web 应用和托管 Web 应用。每种应用类型都有其优缺点，因此请结合您应用的功能与特性，选择合适的类型。

## 基础 Web 应用

它是 webOS TV 最基本的一种应用类型，由于以包的形式提供，因此也可称为打包 Web 应用。

您提交的是包含所有资源的应用包，当用户下载该包并安装应用时，资源也会安装到他们的设备上。因此，当包、代码或资源发生变更时，您需要提交包含该变更的新包。

![usage_scenario_of_packaged_app_l7z2cd](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1778148072/webOS-TV/images/docs/guides/usage_scenario_of_packaged_app_l7z2cd.png)

### 如何创建打包应用

要创建打包应用，请在 webOS CLI 上执行带 **`-t basic`** 参数的 **`ares-generate`** 命令，这意味着您将使用名为 basic 的模板创建应用。有关该命令的更多详细信息，请参见[ares-generate](../05-开发工具/命令行工具/webOSCLI开发者指南.md#ares-generate)。

```shell
ares-generate -t hosted_webapp [your-project-name]
```

## 托管 Web 应用

在托管 Web 应用中，应用的实际内容托管在远程 Web 服务器上。因此，它由两部分组成：一部分是用户将下载并安装到其设备上的本地虚拟应用，另一部分是在远程 Web 服务器上实际托管内容的 Web 应用。

当用户在设备上启动本地应用时，该应用的 URL 会被重定向到 Web 服务器上的 Web 应用，资源将从服务器下载到设备。

![usage_scenario_of_hosted_app_gkbvsv](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1778148077/webOS-TV/images/docs/guides/usage_scenario_of_hosted_app_gkbvsv.png)

由于托管 Web 应用的实际内容位于远程 Web 服务器上，您当然可以随时更新内容（包括新功能的代码），而无需担心向设备推送更新。因此，如果您的应用预计会有大量变更，您可能需要考虑使用托管 Web 应用。但是，其性能取决于从服务器下载内容时的连接质量，而且运营和维护远程服务器会产生成本。因此，请结合您应用的特性选择合适的类型。

### 如何创建托管 Web 应用

要创建托管 Web 应用，请在 webOS CLI 上执行带 **`-t hosted_webapp`** 参数的 **`ares-generate`** 命令，这意味着您将使用名为 basic 的模板创建应用。

```shell
ares-generate -t hosted_webapp [your-project-name]
```

### 如何配置托管 Web 应用

创建托管 Web 应用本质上包含两个步骤：

1. 创建托管应用。它包含*index.html*、*appinfo.json* 以及所需的应用资源等文件。
2. 将所创建托管 Web 应用的默认页面重定向到远程服务器中 Web 应用的默认页面。

以下示例展示了如何将托管 Web 应用的*index.html*重定向到远程服务器中 Web 应用的*index.html*。

```html
<html>
  <head>
    <meta
      http-equiv="refresh"
      content="0;url=http://www.example.com/index.html"
    />
  </head>
</html>
```

下一个示例展示了如何使用 JavaScript 重定向*index.html*。

```html
<html>
  <script>
    location.href = 'http://www.example.com/index.html';
  </script>
</html>
```

您可以将托管 Web 应用的默认页面从*index.html*更改为任何其他 HTML 文件。要更改默认页面，请修改托管 Web 应用的*appinfo.json*文件中的 main 属性。有关更多信息，请参见[appinfo.json](../03-API参考/配置文件/appinfo.json应用元数据.md)。

## 另请参阅

- 请查看[托管 Web 应用示例](https://github.com/webOS-TV-app-samples/HostedWebApp)。
- 您可以使用模板创建基础 Web 应用和托管 Web 应用。有关模板的更多信息，请参见[应用模板](应用模板.md)。
