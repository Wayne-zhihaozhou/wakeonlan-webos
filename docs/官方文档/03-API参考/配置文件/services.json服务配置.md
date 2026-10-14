# services.json（服务配置）
> 原文链接: https://webostv.developer.lge.com/develop/references/services-json ｜ 简体中文翻译

_services.json_ 文件位于服务的根目录中，用于描述服务的构建方式及其运作方式。

## 结构（Schema）与属性

```json
{
    "services":   [{
        "name"            : string,
        "description"   : string,
        "commands"      :   [{
            "name"              : string,
            "description"     : string,
            "public"          : boolean
        }]
    }]
}
```

| 属性 | 是否必填 | 类型 | 描述 |
|---|---|---|---|
| services | 必填 | 对象数组 | 应用程序提供的服务。通常情况下，一个应用程序只提供一个服务。不过，也有理由在同一个应用程序内提供多个服务。一个应用程序必须至少定义一个服务（因为一个没有服务的应用程序可能没有意义）。 |
| -name | 必填 | 字符串 | 服务在 webOS 消息总线（webOS message bus）上的名称。服务名称必须以 app ID 开头。例如：<ul><li>App ID：com.example.myapplication</li><li>服务名称：com.example.myapplication.myservice</li></ul> |
| -description | 可选 | 字符串 | 对服务的描述。 |
| -commands | 必填 | 对象数组 | 指明服务提供什么内容。每个服务可以包含零个或多个命令（没有命令的服务可能希望在应用程序启动时运行一次）。 |
| --name | 必填 | 字符串 | 指明命令的名称。为命令命名时，建议采用驼峰式（camel case）命名约定。例如：`getProperties` 和 `setProperties`。命令名称不能超过 255 个字符。 |
| --description | 可选 | 字符串 | 指明命令的描述。此内容仅供开发人员使用和参考，不会提供给任何应用程序。 |
| --public | 可选 | 布尔值 | 默认值为 false。若要使该命令对所有应用程序可用，必须将此属性设置为 _true_。 |

## 示例

```json
{
  "services": [
    {
      "name": "com.test.testacct.test.service",
      "description": "Test Contact",
      "commands": [
        {
          "name": "checkCredentials",
          "public": true
        },
        {
          "name": "onCapabiltiesChanged",
          "public": true
        },
        {
          "name": "onCredentialsChanged",
          "public": true
        },
        {
          "name": "onCreate",
          "public": true
        },
        {
          "name": "onEnabled",
          "public": true
        },
        {
          "name": "onDelete",
          "public": true
        },
        {
          "name": "sync",
          "public": true
        }
      ]
    }
  ]
}
```
