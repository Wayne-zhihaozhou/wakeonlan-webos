# 配置 JSON 文件
> 原文链接: https://webostv.developer.lge.com/develop/tools/ide-configuring-json-file ｜ 简体中文翻译

注意：IDE 弃用

我们已决定自 2022 年起不再支持 IDE。我们建议您改用 [VS Code extension](VSCode扩展简介.md)。

编写应用时，您需要定义一个名为 *appinfo.json* 的配置文件。如果您随应用一起创建服务，则需要定义一个名为 service.json 的配置文件。

现在，如果您使用 webOS TV IDE 创建项目，就无需自行创建 [appinfo.json](../../03-API参考/配置文件/appinfo.json应用元数据.md) 文件或 [services.json](../../03-API参考/配置文件/services.json服务配置.md) 文件。不过，如果您导入的项目不包含这两个 JSON 文件，则确实需要自行创建它们。webOS TV IDE 为 *appinfo.json* 和 *service.json* 提供配置文件模板，与 webOS TV CLI 提供的模板相同。请继续阅读，了解如何设置这些 JSON 文件。

## appinfo.json

*appinfo.json* 文件包含应用元数据，webOS TV 使用它来确定应用信息并启动应用。有关 appinfo.json 文件的详细信息，请参阅 [appinfo.json](../../03-API参考/配置文件/appinfo.json应用元数据.md)。

### 添加 appinfo.json

如简介中所述，如果您的项目缺少 *appinfo.json*，您需要通过以下选项之一手动创建它。

- 在工作台菜单栏中，选择 **webOS Menu** > **New** > **appinfo.json** 。
- 在工作台菜单栏中，选择 **File** > **New** > **Other..** > **webOS** > **appinfo.json** 。
- 在工作台工具栏中，单击新建向导图标旁的箭头，然后选择 **Other..** > **webOS** > **appinfo.json** 。
- 在 **Project Explorer** 视图中的任意位置单击右键，选择 **New** > **Other..** > **webOS** > **appinfo.json** 。

### 配置 appinfo.json

要配置 *appinfo.json* 文件，请在 **Project Explorer** 视图中双击该文件将其打开。（请注意，如果您刚刚创建了新项目，该文件会出现在第一个屏幕上，因此无需打开它。）您看到的默认选项卡是 **Overview** 选项卡。您可以使用任一选项卡修改该文件。

- 使用 **Overview** 选项卡：此选项卡由友好的用户界面组成。您只能填写必填属性。不过，您无法在此选项卡上添加可选属性。
- 使用 **appinfo.json** 选项卡：此选项卡以原始形式显示 JSON 对象。您可以在此选项卡上编辑必填属性，以及添加/编辑可选属性。

webOS TV IDE 会检查语法错误，并在您保存 *appinfo.json* 时提供警告。您可能会在 Overview 选项卡的代码上看到红色和黄色图标；这些图标表示代码中存在不受支持的属性名或属性值。当这些图标出现在选项卡上时，请确保输入[有效的属性](../../03-API参考/配置文件/appinfo.json应用元数据.md#appinfojson-reference)。

- ![Error icon](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274859/webOS-TV/images/docs/tools/error_xgj4q4.gif) ：表示语法错误
- ![Warning icon](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650275174/webOS-TV/images/docs/tools/warning_ehz9in.gif) ：表示警告

## services.json

*services.json* 文件包含服务元数据，并定义该服务提供哪些命令。您的服务必须配置此文件。

### 添加 services.json

如果您的 JS 服务项目缺少 *services.json*，您需要通过以下选项之一手动创建它。

- 在工作台菜单栏中，选择 **webOS Menu** > **New** > **services.json** 。
- 在工作台菜单栏中，选择 **File** > **New** > **Other..** > **webOS** > **services.json** 。
- 在工作台工具栏中，单击新建向导图标旁的箭头，然后选择 **Other..** > **webOS** > **services.json** 。
- 在 **Project Explorer** 视图中的任意位置单击右键，选择 **New** > **Other..** > **webOS** > **services.json** 。

### 配置 services.json

要配置 *service.json* 文件，请在 **Project Explorer** 视图中双击该文件将其打开。与 *appinfo.json* 文件不同，查看该文件并未提供友好的用户界面版本。

有关有效的属性，请查看 [service.json 规范](../../03-API参考/配置文件/services.json服务配置.md)。
