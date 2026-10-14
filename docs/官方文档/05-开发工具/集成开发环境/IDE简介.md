# IDE 简介
> 原文链接: https://webostv.developer.lge.com/develop/tools/ide-introduction ｜ 简体中文翻译

注意：IDE 弃用

我们已决定自 2022 年起不再支持 IDE。我们建议您改用 [VS Code extension](VSCode扩展简介.md)。

webOS TV IDE 提供便捷的环境来支持您的开发工作。IDE 提供的功能与 webOS TV CLI 相同，因此如果您觉得基于命令的环境更好用，请随意使用 CLI。如果您更喜欢友好的用户界面，那么您来对地方了。

## IDE 入门

假设您要使用 webOS TV IDE 编写一个应用。以下过程是您需要执行的完整流程。每当您在使用 IDE 时感到困惑，请回到本页查看您遗漏了哪一步。

1. [启动 webOS TV IDE](IDE简介.md#launching-the-webos-tv-ide) 。
2. [创建应用项目](IDE设置项目.md) 。
3. [配置 appinfo.json](IDE配置JSON文件.md) 。
4. 开发您的应用。
5. [配置目标设备](IDE配置目标设备.md) ，以便在目标设备上启动您的应用。
6. [启动您的应用](IDE启动应用.md) 。
7. [通过检查器调试您的应用](IDE使用检查器调试.md) 。

要随应用一起实现服务，请执行以下步骤：

1. 使用上述步骤创建一个应用。
2. [创建服务项目](IDE设置项目.md#creating-project-for-services) 。
3. [配置 service.json](IDE配置JSON文件.md#servicesjson) 。
4. 开发您的服务。

## 启动 webOS TV IDE

在计算机上安装 webOS TV SDK 后，启动 **webOS TV IDE**。

- 在 Windows 上，
  - 双击桌面上的 webOS TV IDE 图标（即右图所示被 webOS TV 压住的悲惨 Beanbird）*或者*
  - 选择快捷菜单，**Start** > **webOS TV SDK** > **webOS TV IDE**
- 在 Mac OS 上，
  - 双击桌面上的 webOS TV IDE 图标（如右图所示）*或者*
  - 转到 **Applications** > **webOS TV SDK**，然后单击 **webOS TV IDE** 图标。
