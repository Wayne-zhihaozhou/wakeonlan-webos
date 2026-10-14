# webOS CLI 安装
> 原文链接: https://webostv.developer.lge.com/develop/tools/cli-installation ｜ 简体中文翻译

请按照以下步骤安装 CLI。

## 系统要求

开始安装前，请确认是否满足系统要求。即使不满足要求，CLI 也可能可以运行，但不保证其稳定性。

### 操作系统

| 操作系统 | 要求 |
| --- | --- |
| Windows | Windows 10 或更高版本（仅限 64 位） |
| Linux | Ubuntu 20.04 或更高版本（仅限 64 位） |
| macOS | macOS High Sierra (10.13) 或更高版本（仅限 64 位） |

### 软件工具

- Node.js（推荐版本：14.15.1 - 16.20.2）
- npm

## 安装 webOS CLI

警告

如果你已安装

**webOS TV**

或

**webOS OSE CLI**

（两者现已弃用），请参阅

[安装 webOS CLI 的准备工作](../其他/旧版webOSTVSDK的移除.md#preparation-for-installing-webos-cli)

并先卸载它们。

CLI 可以使用 Node Package Manager(npm) 安装。在终端中执行以下命令，并使用 `-g` 选项将 CLI 全局安装。

```shell
$ npm install -g @webos-tools/cli
```

- 在 Linux 和 macOS 上，此操作后可能会出现 EACCES 权限错误。在这种情况下，请[手动更改 npm 的默认目录](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally#manually-change-npms-default-directory) 。

安装完成后，请检查版本是否与 [CLI npm 包](https://www.npmjs.com/package/@webos-tools/cli)的最新版本一致。

```shell
$ ares -V
```
