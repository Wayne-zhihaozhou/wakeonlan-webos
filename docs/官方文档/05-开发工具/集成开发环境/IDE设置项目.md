# 设置项目
> 原文链接: https://webostv.developer.lge.com/develop/tools/ide-setting-project ｜ 简体中文翻译

注意：IDE 弃用

我们已决定自 2022 年起不再支持 IDE。我们建议您改用 [VS Code extension](VSCode扩展简介.md)。

webOS TV IDE 为 Web 应用和 JS 服务提供项目模板。

## 从模板创建 Web 应用和服务

webOS TV IDE 提供基本的 Web 应用模板和 JS 服务模板，让您的 Web 应用开发更加轻松。

- webapp：基本的 Web 应用模板
- jsservice：JS 服务模板

注意

从 webOS TV 4.0 SDK 开始，IDE 不再提供包含 Moonstone 库的 Moonstone 模板。要使用 Moonstone 库，请参阅 [Enyo/Enact Guides](../../02-开发指南/应用基础/Enyo与Enact指南.md)。

以下展示如何使用模板创建 Web 应用：

1. 在 IDE 中，从菜单单击 **webOS Menu > New webOS Project**。或者，您也可以通过以下任一方式新建 webOS 项目：
  - 从菜单单击 **File > New > New webOS Project**。
  - 在 Project Explorer 中从右键菜单选择 **New > New webOS Project**。
  - 从工具栏图标旁的下拉菜单中单击 **New webOS Project**。
2. 输入项目名称，并从 Project Templates 列表中选择一个模板。 ![Selecting webapp template on the New webOS Project window](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274980/webOS-TV/images/docs/tools/New_Project_bv80jh.webp)
3. 单击 **Finish** 按钮。

**New webOS SmartTV Project** 窗口底部的状态栏会显示应用创建进度。如果您成功创建新的应用项目，**Console** 会显示所创建应用的路径，并且模板包会列在 Project Explorer 中。所创建项目的 *appinfo.json* 文件会自动在编辑器中打开，以便您进行任何修改。

### 从模板编辑 appinfo.json 文件

创建应用项目后，webOS TV IDE 会提供与 webOS TV CLI 相同的配置文件模板。*appinfo.json* 是 webOS TV 应用必不可少的文件，它指定 Web 应用的元数据，例如应用 ID、名称以及其他相关资源。以下示例展示了 *appinfo.json* 的部分属性。

```json
{
  "id": "com.yourdomain.app",
  "version": "0.0.1",
  "vendor": "My Company",
  "type": "web",
  "main": "index.html",
  "title": "Your Project Name",
  "icon": "icon.png",
  "largeIcon": "largeIcon.png"
}
```

webOS TV 使用 *appinfo.json* 文件来识别并启动应用。*appinfo.json* 文件可以通过以下两种方式编辑：

- 使用 **Overview** 选项卡，您可以通过其界面编辑必填属性。不过，可选属性无法添加到 **Overview** 选项卡中。
- 使用 **appinfo.json** 源代码选项卡，您可以编辑必填属性和可选属性。

webOS TV IDE 会检查 *appinfo.json* 文件的语法错误和警告。它会在源代码上显示红色和黄色图标；这些颜色表示属性名或属性值不正确或不受支持；IDE 中的红色图标表示语法错误，黄色图标表示警告。

编辑 appinfo.json 文件后，请务必保存以应用更改。有关 *appinfo.json* 文件的详细信息，请参阅 [appinfo.json](../../03-API参考/配置文件/appinfo.json应用元数据.md)。

### 在项目中创建源文件

您需要在项目中实现源文件。以下展示如何创建源文件：

1. 在 IDE 中，从菜单单击 **webOS Menu > New > New Source File**。或者，您也可以通过以下方式创建源文件：
  - 从菜单单击 **File > New > New Source File**。
  - 从工具栏图标右侧的箭头中单击 **New Source File**。
2. 选择项目中创建的父文件夹。
3. 在 **File name** 字段中输入文件名，然后单击 **Finish** 按钮。

## 导入 webOS 项目

您可以将任何包含 appinfo.json 文件的 Web 应用项目导入 webOS TV IDE。请确保 webOS TV IDE 中尚未创建同名项目。

以下展示如何导入现有的 webOS TV 项目：

1. 在 IDE 中，从菜单单击 **webOS Menu > Import webOS Project**，将 webOS TV 项目导入 IDE。或者，您也可以通过以下方式导入 webOS TV 项目：
  - 从菜单单击 **File > Import**，并在 Import 窗口中选择 **webOS > Import webOS Project**。
  - 在 Project Explorer 中从右键菜单选择 **Import**，并在 Import 窗口中选择 **webOS > Import webOS Project**。
2. 单击 **Browse** 按钮，在文件对话框中选您的项目文件夹，然后单击 **Open**。
3. 选择您的项目类型，并勾选复制选项以导入项目。
4. 单击 **Finish**，将项目导入到某个文件夹中。

注意

这里有一些由 LG Developer 提供的 [Code Samples](../../06-示例应用/示例应用清单.md)，可以导入到 webOS TV IDE 中。

## 导入自定义模板

webOS TV IDE 提供模板，方便您轻松开发 Web 应用。不过，如果您想使用自己的模板进行 Web 应用开发，请参考以下步骤：

以下展示如何在工作区下的 `UserTemplate` 文件夹中注册新的自定义模板：

1. 从菜单单击 **webOS Menu > Register Application as Template**，将当前应用项目注册为模板。或者，单击工具栏图标。
2. 单击第二个 **Browse** 按钮来修改模板位置。默认 IDE 工作区下的 `UserTemplates` 文件夹用于保存自定义模板。
3. 输入您的模板名称。如果需要，输入描述并注册预览图像。然后，单击 **Finish** 注册自定义模板。
4. 要查看已注册的自定义模板，请从菜单单击 **webOS Menu > New webOS Project**。`UserTemplate` 菜单下会新建已注册的模板，并且可以选择其中一个用户模板。

注意

要更改自定义模板的保存位置，请从 Window 菜单设置 **Preferences**。在 **Preferences** 窗口中，单击树状视图中的 **webOS > User Template**，然后使用 **Browser** 按钮更改位置。

## 为服务创建项目

webOS TV SDK 提供服务模板，帮助您轻松开始开发服务。在创建服务之前，您必须先创建一个应用项目。

1. 单击 **webOS Menu** > **New webOS Project**。或者，您也可以通过以下任一方式新建 webOS 项目：
  - 从菜单单击 **File > New > New webOS Project**。
  - 在 Project Explorer 中从右键菜单选择 **New > New webOS Project**。
  - 从工具栏图标旁的下拉菜单中单击 **New webOS Project**。
2. 在 New webOS Project 对话框中，
  1. 从 **Project Template** 列表中选择 jsservice 类别。
  2. 在 Project name 字段中，为您的服务输入项目名称。 ![Selecting JS service template on the New webOS Project window](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274992/webOS-TV/images/docs/tools/New_Service_rbugxg.webp)
  3. 如有需要，更改此服务项目的位置。如果不需要，请跳过此步骤。
  4. 单击 **Next** 按钮。
3. 在这个新的 New webOS Project 对话框中，单击 **Browse** 按钮，选择要为其开发服务的应用项目。 ![Clicking the Browse button on the New webOS Project window](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274920/webOS-TV/images/docs/tools/ide_new_project_service_select_app_project_omeejs.webp)
4. 在 webOS Project Selection 对话框中，选择要为其编写此服务的应用项目，然后单击 **OK** 按钮。 ![Selecting the app project on the New webOS Project window](https://res.cloudinary.com/dcsdn4mzr/image/upload/v1650274908/webOS-TV/images/docs/tools/ide_choose_app_project_rmm32l.webp)
5. 设置服务名称后，单击 **Finish** 按钮继续。随后会很快弹出一个窗口，向您显示项目创建状态。
6. 如果您成功创建新项目，Console 中会出现一组关于项目生成的消息。
