# Web API 与 Web 引擎
> 原文链接: https://webostv.developer.lge.com/develop/specifications/web-api-and-web-engine ｜ 简体中文翻译

## 支持的 Web API

HTML、CSS 和 JavaScript 是构建网页或 Web 应用的核心 Web 技术。HTML 使用标记呈现页面或应用的结构，CSS 则对以 HTML 编写的内容（如颜色、布局、字体等）进行格式化。JavaScript 是面向 Web 的编程语言，已在 [ECMAScript](https://www.ecma-international.org/publications/standards/Ecma-262.htm) 中实现标准化。使用 HTML5、CSS3 和 JavaScript，您可以为 webOS TV 开发 Web 应用。

### webOS TV 1.0、2.0 和 3.0

我们提供规格图表，其中列出了 webOS TV 和 webOS TV 模拟器当前支持的 HTML5 方法、属性和事件，CSS3 属性，以及 JavaScript 特性（ECMAScript 特性）。请注意，webOS TV 1.0 和 2.0 上的内部 Web 浏览器与 Web 应用使用了两种不同的引擎。因此，我们建议您检查这些 API 在 webOS TV 或模拟器上是否按预期运行。

下载 [Supported Standard Web APIs](https://webostv.developer.lge.com/assets/web-api/Supported_Standard_Web_APIs_2019.pdf) 文件。

### webOS TV 4.0 及以上

从 webOS TV 4.0 起，我们不再提供这些图表。取而代之，我们会告知您 webOS TV 上使用的 [Web 引擎](WebAPI与Web引擎.md#web-engine)及其版本。

注意：Chrome 浏览器兼容性

您可以在 [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) 中每个 API 的 Browser compatibility 部分查看兼容的 Chrome 版本。不过，对于某些与 webOS TV 平台相关的功能，兼容性可能并不一致。

## Web 引擎

webOS TV 平台的 Web 引擎为内容提供商和内容聚合商提供了应用编程环境。下表列出了各 webOS TV 平台对应的 Web 引擎及其版本：

| 平台版本 | 发布年份 | Web 引擎 |
| --- | --- | --- |
| webOS TV 26 | 2026 | Chromium 132 |
| webOS TV 25 | 2025 | Chromium 120 |
| webOS TV 24 | 2024 | Chromium 108 |
| webOS TV 23 | 2023 | Chromium 94 |
| webOS TV 22 | 2022 | Chromium 87 |
| webOS TV 6.x | 2021 | Chromium 79 |
| webOS TV 5.x | 2020 | Chromium 68 |
| webOS TV 4.x | 2018~2019 | Chromium 53 |
| webOS TV 3.x | 2016~2017 | Chromium 38 |
| webOS TV 2.x | 2015 | WebKit 538.2 |
| webOS TV 1.x | 2014 | WebKit 537.41 |

注意：浏览器应用的 Web 引擎

webOS TV 1.x 和 2.x 使用 **WebKit** 作为 Web 引擎；不过，webOS TV 1.x 和 2.x 的浏览器应用分别使用 Chromium 26 和 34。

您可以在电视菜单中或使用 Luna API 查看 webOS TV 版本，方法如下：

- **Settings menu:**Settings > General > TV Information > webOS TV version
- **Luna API: `sdkVersion`**parameter in the[getSystemInfo()](../../03-API参考/应用与系统/TVDeviceInformation电视设备信息.md#getsysteminfo)method

## LG Web 浏览器引擎的 Cookie 与缓存支持

LG Web 浏览器引擎支持 Cookie 并保存缓存以提升性能。所存储的缓存仅在 Web 浏览器引擎运行期间使用，一旦应用终止便不再使用。请注意，只有 [托管型 Web 应用](../../01-快速入门/Web应用类型.md#hosted-web-app)（HTTP/HTTPS scheme）可以使用 Cookie；webOS TV 平台不支持打包型 Web 应用（file scheme）上的 Cookie。

## userAgent 字符串

Web 应用可以从 HTML DOM 属性 `**navigator.userAgent`** 获取该字符串。HTTP 请求的 User-Agent 头中也包含相同的字符串。各 webOS TV 平台对应 LG 浏览器引擎的 `**userAgent`** 字符串如下：

- **webOS TV 26** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6834.207 Safari/537.36 WebAppManager`
- **webOS TV 25** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.270 Safari/537.36 WebAppManager`
- **webOS TV 24** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.211 Safari/537.36 WebAppManager`
- **webOS TV 23** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.128 Safari/537.36 WebAppManager`
- **webOS TV 22** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 WebAppManager`
- **webOS TV 6.x** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager`
- **webOS TV 5.x** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36 WebAppManager`
- **webOS TV 4.x** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.34 Safari/537.36 WebAppManager`
- **webOS TV 3.x** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) QtWebEngine/5.2.1 Chrome/38.0.2125.122 Safari/537.36 WebAppManager`
- **webOS TV 2.x** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/538.2 (KHTML, like Gecko) Large Screen WebAppManager Safari/538.2`
- **webOS TV 1.x** `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.41 (KHTML, like Gecko) Large Screen WebAppManager Safari/537.41`
