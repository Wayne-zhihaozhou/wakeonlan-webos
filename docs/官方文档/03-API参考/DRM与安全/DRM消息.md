# DRM 消息
> 原文链接: https://webostv.developer.lge.com/develop/references/drm-message ｜ 简体中文翻译

本文介绍 [sendDrmMessage](DRM数字版权管理.md#senddrmmessage) 方法的 `msg` 参数的有效格式。

-   [PlayReady](#playready)

## PlayReady

### 预获取（Pre-acquisition）

```xml
<?xml version="1.0" encoding="utf-8"?>
<PlayReadyInitiator xmlns= "http://schemas.microsoft.com/DRM/2007/03/protocols/">
  <LicenseAcquisition>
    <Header>
      <WRMHEADER xmlns= "http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0">
        <DATA>
          <PROTECTINFO>
            <KEYLEN>16</KEYLEN>
            <ALGID>AESCTR</ALGID>
          </PROTECTINFO>
          <LA_URL>http://rm.contoso.com/rightsmanager.asmx</LA_URL>
          <KID>lFmb2gxg0Cr5bfEnJXgJeA==</KID>
          <CHECKSUM>P7ORpD2IpA==</CHECKSUM>
        </DATA>
      </WRMHEADER>
    </Header>
    <CustomData>AuthZToken XYZ</CustomData>
  </LicenseAcquisition>
</PlayReadyInitiator>
```

| 元素 | 设备支持情况 | 服务包含情况 |
| --- | --- | --- |
| Header | 必填 | 必填 |
| CustomData | 必填 | 可选 |

### 用于后获取（post-acquisition）认证的自定义数据

**用于许可证后获取的许可证服务器 URL 覆盖**

```xml
<?xml version="1.0" encoding="utf-8"?>
<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">
  <LicenseServerUriOverride>
    <LA_URL>http://rm.contoso.com/rightsmanager.asmx</LA_URL>
  </LicenseServerUriOverride>
</PlayReadyInitiator>
```

此消息之后，所有后续的许可证后获取都将许可证质询（license challenge）发送到指定的 `LA_URL`，而不是发送到内容 WRMHEADER 中包含的默认 `LA_URL`（应用程序持久化）。许可证预获取不受此命令影响。

```xml
<?xml version="1.0" encoding="utf-8"?>
<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">
  <LicenseServerUriOverride>
    <LA_URL></LA_URL>
  </LicenseServerUriOverride>
</PlayReadyInitiator>
```

此消息之后，所有后续的许可证后获取都将许可证质询发送到内容 WRMHEADER 中包含的默认 `LA_URL`（URL 覆盖已取消）。

**为许可证后获取设置质询自定义数据（challenge customdata）**

```xml
<?xml version="1.0" encoding="utf-8"?>
<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">
  <SetCustomData>
    <CustomData>AuthZToken XYZ</CustomData>
  </SetCustomData>
</PlayReadyInitiator>
```

此消息之后，所有后续的许可证后获取都将使用指定值作为所生成许可证质询的 `CustomData` 值（应用程序持久化）。许可证预获取不受此命令影响。

```xml
<?xml version="1.0" encoding="utf-8"?>
<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">
  <SetCustomData>
    <CustomData></CustomData>
  </SetCustomData>
</PlayReadyInitiator>
```

此消息之后，所有后续的许可证后获取在所生成的许可证质询中将不再使用任何 `CustomData` 值。
