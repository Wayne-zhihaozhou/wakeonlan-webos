# TLS 与根证书
> 原文链接: https://webostv.developer.lge.com/develop/specifications/tls ｜ 简体中文翻译

## TLS 协议兼容性

下表列出了各 webOS TV 平台版本支持的 Transport Layer Security (TLS) 版本。

| **WEBOS TV 平台版本** | **发布年份** | **TLS V1.3** | **TLS V1.2** |
| --- | --- | --- | --- |
| **webOS TV 26** | **2026** | 支持 | 支持 |
| **webOS TV 25** | **2025** | 支持 | 支持 |
| **webOS TV 24** | **2024** | 支持 | 支持 |
| **webOS TV 23** | **2023** | 支持 | 支持 |
| **webOS TV 22** | **2022** | 支持 | 支持 |
| **webOS TV 6.x** | **2021** | 支持 | 支持 |
| **webOS TV 5.x** | **2020** | 支持 | 支持 |
| **webOS TV 4.x** | **2018-2019** | 不支持 | 支持 |
| **webOS TV 3.x** | **2016-2017** | 不支持 | 支持 |
| **webOS TV 1.x/2.x** | **2014-2015** | 不支持 | 支持 |

## 受信任的根证书

您可以按如下方式下载 webOS TV 中受信任的根证书。请注意，受信任根证书的列表因 webOS TV 平台版本而异，下面的文件包含其中一些在所有平台版本中都兼容的证书。

[下载受信任的根证书](https://webostv.developer.lge.com/assets/root-certificate/webOS_TV_Root_CAs.zip)

注意

- 以 HTTPS 方式提供的 webOS TV 应用资源应使用其根证书为受信任根证书之一的证书。如果该根证书不存在于启动该应用的电视的受信任根证书列表中，则会出现 **Filed to load resource: net::ERR_INSECURE_RESPONSE** 错误。
- 使用 ISRG Root X1 作为根证书的 Let’s Encrypt 证书从 webOS TV 5.0 起受支持。不过，在 webOS TV 3.X 和 4.X 上，如果正确执行了软件更新，则也受支持。
