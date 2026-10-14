# 旧版 webOS TV SDK 的移除
> 原文链接: https://webostv.developer.lge.com/develop/tools/removal-of-old-webos-tv-sdk ｜ 简体中文翻译

在安装 webOS TV 工具之前，您可能需要卸载旧的已弃用工具，以确保即将安装的新工具能够正常工作、不受干扰。

本页将指导您卸载旧的已弃用工具，作为安装 webOS TV 工具的准备工作。

## 安装 webOS CLI 的准备工作

### 卸载 webOS TV CLI 或 webOS OSE CLI

如果您已安装现已弃用的 webOS TV CLI 或 webOS OSE CLI，则需要先卸载它们，然后再安装 webOS CLI。

1. 检查是否已安装 webOS TV CLI 或 webOS OSE CLI。您可以使用 `ares -V` 命令检查是否已安装 webOS TV CLI 或 webOS OSE CLI。如果看到如下所示的版本，则需要卸载现有的 CLI。
   ```
   $ ares -V
   webOS TV CLI Version: 1.12.4-j27
   ```
   ```
   $ ares -V
   webOS OSE CLI Version: 2.3.1
   ```
2. 卸载旧版 CLI
  - 卸载 **webOS TV CLI**。使用以下命令删除已安装的 CLI 目录。（将 "YOUR_PATH" 替换为现有 CLI 目录的路径。）
    - Windows
      ```
      $ rmdir /S "C:\YOUR_PATH\webOS_TV_SDK\CLI"
      ```
    - Linux 或 macOS
      ```
      $ rm -rf "/YOUR_PATH/webOS_TV_SDK/CLI"
      ```
  - 卸载 **webOS OSE CLI**
    ```
    $ npm uninstall -g @webosose/ares-cli
    ```
3. 验证 CLI 是否已成功卸载。使用 `ares -V` 命令检查是否还存在任何 CLI。如果看到如下输出，说明已不存在旧版 CLI。
   ```
   $ ares -V
   ares: command not found
   ```

## 安装 webOS Studio 的准备工作

如果您此前已使用 webOS TV CLI 安装并使用过 webOS TV 工具，则需要清理它们，作为安装 webOS Studio 的准备工作。之后，您可以使用 [webOS Studio | Package Manager](../webOS%20Studio/webOSStudio开发者指南.md#package-manager) 安装所需的工具，并通过其命令来管理它们。

### 卸载 webOS TV CLI 或 webOS OSE CLI

请参见[卸载 webOS TV CLI 或 webOS OSE CLI](#uninstall-webos-tv-or-webos-ose-cli)。

### 卸载适用于 VS Code 的 webOS TV 或 webOS OSE 扩展

1. 运行 VS Code。
2. 单击活动栏中的 Extensions 图标，在侧边打开 **Extensions** 视图。
3. 单击 `webOS TV` 或 'webOS OSE' 扩展项右侧的 **Manage** 齿轮按钮，然后从下拉菜单中选择 **Uninstall**。

### 卸载 webOS TV Simulator

删除安装模拟器的 `Simulator` 目录。

### 卸载 webOS TV Emulator

1. 移除虚拟机。
   - Windows<br>a. 进入 `Emulator/vX.0.0` 目录，其中 X 为要安装的版本。<br>b. 运行 `vm_remove.bat`。
   - Linux 打开终端并执行以下命令。
     ```
     $ cd /LG_WEBOS_TV_SDK_HOME_PATH/Emulator/vX.0.0
     $ ./vm_remove.sh
     $ sudo desktop-file-install webOS_TV_Emulator_vX.0.0.desktop
     ```
   - macOS 打开终端并执行以下命令。
     ```
     $ cd /LG_WEBOS_TV_SDK_HOME_PATH/Emulator/vX.0.0
     $ ./vm_register.command
     ```
2. 移除 `LG_WEBOS_TV_SDK_HOME` 的路径目录。a. 使用 echo 命令检查 `LG_WEBOS_TV_SDK_HOME` 变量。b. 删除该目录。
   - Windows
     ```
     echo %LG_WEBOS_TV_SDK_HOME%
     ```
   - Linux 或 macOS
     ```
     echo $LG_WEBOS_TV_SDK_HOME
     ```
   - Windows
     ```
     rmdir LG_WEBOS_TV_SDK_HOME_PATH /s /q
     ```
   - Linux 或 macOS
     ```
     rm -rf LG_WEBOS_TV_SDK_HOME_PATH
     ```
3. 移除环境变量。
   - Windows<br>a. 单击 **Start** 按钮，在搜索栏中输入 **environment properties**。<br>b. 在对话框中，单击右下角的 **Environment Variables**。<br>c. 在 **Environment variables** 对话框中，于 **System variables** 下删除 `LG_WEBOS_TV_SDK_HOME` 和 `WEBOS_CLI_TV`。<br>d. 在 **System variables** 下选择 **Path**，然后单击 **Edit**。<br>e. 移除包含 `WEBOS_CLI_TV` 目录的目录。
   - Linux 或 macOS<br>删除 `/etc/profile or /etc/zprofile` 中的以下行。
     ```
     # Setting the LG_WEBOS_TV_SDK_HOME variable to the parent directory of CLI
     export LG_WEBOS_TV_SDK_HOME="/YOUR_PATH/webOS_TV_SDK"
     if [ -d "$LG_WEBOS_TV_SDK_HOME/CLI/bin" ]; then
         # Setting the WEBOS_CLI_TV variable to the bin directory of CLI
         export WEBOS_CLI_TV="$LG_WEBOS_TV_SDK_HOME/CLI/bin"
         # Adding the bin directory of CLI to the PATH variable
         export PATH="$PATH:$WEBOS_CLI_TV"
     fi
     ```
