# 流媒体协议与 DRM
> 原文链接: https://webostv.developer.lge.com/develop/specifications/streaming-protocol-drm ｜ 简体中文翻译

本文列出了 webOS TV 与 webOS TV 模拟器所支持的媒体和 DRM 格式。

**本文未提及的媒体和 DRM 格式在 webOS TV 平台上不受支持，也不建议使用。**

## 流媒体协议

| **协议** | **WEBOS TV 设备** | **模拟器 (Emulator)** |
| --- | --- | --- |
| **HTTP/HTTPS** | Supported<br>1) | Supported<br>2) |
| **HLS** | Supported | Emulator 1.0 - 4.0: Not supported<br>Emulator 5.0 - 6.0: Supported |

1) HTTP/2 仅在 webOS TV 5.0 或更高版本上受支持，且不支持 HTTP/3。

2) HTTP/2 仅在 Emulator 5.0 和 6.0 上受支持，且不支持 HTTP/3。

### 注意事项

#### 媒体播放

媒体播放功能支持情况如下：

- Seek：支持
- Live Seek：在 webOS TV 3.0 或更高版本上支持
- 快进与快退：不支持
- 1.0 以外的播放速度：不支持

为获得最佳播放质量，音频和视频的分片时长必须相同。webOS TV 平台不支持音频与视频之间使用不同的分片时长。

#### HLS 标签

原生播放器对以下 HLS 标签不支持或仅部分支持：

- EXT-X-PROGRAM-DATE-TIME：不支持
- EXT-X-ALLOW-CACHE：不支持
- EXT-X-DATERANGE：不支持
- EXT-X-I-FRAMES-ONLY：不支持
- EXT-X-I-FRAME-STREAM-INF：不支持
- EXT-X-SESSION-DATA：不支持
- EXT-X-INDEPENDENT-SEGMENTS：不支持
- EXT-X-DISCONTINUITY：在 webOS TV 4.0 或更高版本上仅支持 PTS 不连续。除 PTS 不连续外，其他不连续情况（如编解码器、容器和 pid）均不受支持。
- EXT-X-DISCONTINUITY-SEQUENCE：不支持
- EXT-X-MEDIA-SEQUENCE：每个分辨率的分片媒体序列号应保持一致（从 webOS3.0 到 webOS22）。
- EXT-X-MEDIA：在 webOS TV 3.5 或更早版本上不支持
- EXT-X-MEDIA：在 webOS TV 4.0 或更高版本上不支持 VIDEO TYPE

有关 HLS 流媒体的故障排查，请参阅 FAQ 中的 [HTTP Live Streaming (HLS) 故障排查](https://webostv.developer.lge.com/faq/streaming-http-live-streaming-hls-troubleshooting)和[我可以使用 Smooth Streaming 开发应用吗？](https://webostv.developer.lge.com/faq/streaming-can-i-develop-app-using-smooth-streaming)。

## DRM

| **DRM 名称** | **WEBOS TV** | **仿真器 (Simulator)** | **模拟器 (Emulator)** |
| --- | --- | --- | --- |
| **PlayReady** | Supported | Not supported | Not supported |
| **Widevine Modular** | Supported | Not supported | Not supported |

对于 PlayReady，在 OTT 流媒体服务中我们强烈建议使用 post-delivery 方式，而非 pre-delivery 方式。webOS TV 3.0、3.5 和 4.0 上不提供 non-persistent 许可证。

关于 Widevine，webOS TV 3.5 或更高版本支持 L1 / HW_SECURE_ALL。

**请注意**，Widevine Classic 已从 webOS TV 23 起废弃。您不应再使用此解决方案。有关 DRM 的更多详细信息，请参阅 [DRM 内容播放](../../02-开发指南/媒体播放/DRM内容播放.md)。

## 流媒体协议与 DRM 的组合

### webOS TV 26

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 4.6 | HTML5 MSE/EME<br>• Media Source Extensions: W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| AES128 | HLS version 7 |
| Widevine Modular version 17 | HTML5 MSE/EME<br>• Media Source Extensions W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |

### webOS TV 25

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 4.4 | HTML5 MSE/EME<br>• Media Source Extensions: W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| AES128 | HLS version 7 |
| Widevine Modular version 17 | HTML5 MSE/EME<br>• Media Source Extensions W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |

### webOS TV 24

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 4.4 | HTML5 MSE/EME<br>• Media Source Extensions: W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| AES128 | HLS version 7 |
| Widevine Modular version 17 | HTML5 MSE/EME<br>• Media Source Extensions W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |

### webOS TV 23

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 4.4 | HTML5 MSE/EME<br>• Media Source Extensions: W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| AES128 | HLS version 7 |
| Widevine Modular version 16 | HTML5 MSE/EME<br>• Media Source Extensions W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |

### webOS TV 22

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 4.4 | HTML5 MSE/EME<br>• Media Source Extensions: W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| AES128 | HLS version 7 |
| Widevine Modular version 16 | HTML5 MSE/EME<br>• Media Source Extensions W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |

### webOS TV 6.0

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 4.0 | HTML5 MSE/EME<br>• Media Source Extensions: W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| AES128 | HLS version 7 |
| Widevine Modular version 16 | HTML5 MSE/EME<br>• Media Source Extensions: W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |

### webOS TV 5.0

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 4.0 | HTML5 MSE/EME<br>• Media Source Extensions: W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| AES128 | HLS version 7 |
| Widevine Modular version 16 | HTML5 MSE/EME<br>• Media Source Extensions: W3C Recommendation 17 November 2016<br>• Encrypted Media Extensions W3C Recommendation 18 September 2017 |

### webOS TV 4.5

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 3.0 | HTML5 MSE/EME<br>• Media Source Extensions W3C Proposed Recommendation 04 October 2016<br>• Encrypted Media Extensions W3C Working Draft 31 March 2015 |
| AES128 | HLS version 5 |
| Widevine Modular version 14 | HTML5 MSE/EME<br>• Media Source Extensions W3C Proposed Recommendation 04 October 2016<br>• Encrypted Media Extensions W3C Working Draft 31 March 2015 |

### webOS TV 4.0

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 3.0 | HTML5 MSE/EME<br>• Media Source Extensions W3C Proposed Recommendation 04 October 2016<br>• Encrypted Media Extensions W3C Working Draft 31 March 2015 |
| AES128 | HLS version 5 |
| Widevine Modular version 3.2.1 | HTML5 MSE/EME<br>• Media Source Extensions W3C Proposed Recommendation 04 October 2016<br>• Encrypted Media Extensions W3C Working Draft 31 March 2015 |

### webOS TV 3.5

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady version 3.0 | HTML5 MSE/EME<br>• Media Source Extensions Editor's Draft 10 December 2013<br>• Encrypted Media Extensions W3C Editor's Draft 19 July 2012 (0.1b) |
| AES128 | HLS version 3 |
| Widevine Modular version 3.0.5 | HTML5 MSE/EME<br>• Media Source Extensions Editor's Draft 10 December 2013<br>• Encrypted Media Extensions W3C Editor's Draft 19 July 2012 (0.1b) |

### webOS TV 3.0

| **DRM** | **流媒体协议** |
| --- | --- |
| PlayReady | HTML5 MSE/EME<br>• Media Source Extensions Editor's Draft 10 December 2013<br>• Encrypted Media Extensions W3C Editor's Draft 19 July 2012 (0.1b) |
| AES128 | HLS version 3 |
| Widevine Modular version 2.2 | HTML5 MSE/EME<br>• Media Source Extensions Editor's Draft 10 December 2013<br>• Encrypted Media Extensions W3C Editor's Draft 19 July 2012 (0.1b) |

### webOS TV 2.0

| **DRM** | **流媒体协议** |
| --- | --- |
| AES128 | HLS version 3 |

### webOS TV 1.0

| **DRM** | **流媒体协议** |
| --- | --- |
| AES128 | HLS version 3 |

### 注意事项

#### HLS

Byte-Range 功能从版本 4 开始受支持。在版本 5 中，以下功能仅部分受支持：

- Byte-Range
- Multi-Audio
- WebVTT Multi-subtitles（仅适用于 VoD）

## 媒体源扩展

| **平台版本** | **发布年份** | **支持的 MSE 版本** |
| --- | --- | --- |
| webOS TV 26 | 2026 | Media Source Extensions W3C Recommendation 17 November 2016 |
| webOS TV 25 | 2025 | Media Source Extensions W3C Recommendation 17 November 2016 |
| webOS TV 24 | 2024 | Media Source Extensions W3C Recommendation 17 November 2016 |
| webOS TV 23 | 2023 | Media Source Extensions W3C Recommendation 17 November 2016 |
| webOS TV 22 | 2022 | Media Source Extensions W3C Recommendation 17 November 2016 |
| webOS TV 6.0 | 2021 | Media Source Extensions W3C Recommendation 17 November 2016 |
| webOS TV 5.0 | 2020 | Media Source Extensions W3C Recommendation 17 November 2016 |
| webOS TV 4.x | 2018~2019 | Media Source Extensions W3C Proposed Recommendation 04 October 2016 |
| webOS TV 3.x | 2016~2017 | Media Source Extensions Editor's Draft 10 December 2013 |
| webOS TV 2.x | 2015 | Not supported |
| webOS TV 1.x | 2014 | Not supported |

## 加密媒体扩展

| **平台版本** | **发布年份** | **支持的 EME 版本** |
| --- | --- | --- |
| webOS TV 26 | 2026 | Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| webOS TV 25 | 2025 | Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| webOS TV 24 | 2024 | Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| webOS TV 23 | 2023 | Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| webOS TV 22 | 2022 | Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| webOS TV 6.0 | 2021 | Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| webOS TV 5.0 | 2020 | Encrypted Media Extensions W3C Recommendation 18 September 2017 |
| webOS TV 4.x | 2018~2019 | Encrypted Media Extensions W3C Working Draft 31 March 2015 |
| webOS TV 3.x | 2016~2017 | Encrypted Media Extensions W3C Editor's Draft 19 July 2012 (0.1b) |
| webOS TV 2.x | 2015 | Not supported |
| webOS TV 1.x | 2014 | Not supported |
