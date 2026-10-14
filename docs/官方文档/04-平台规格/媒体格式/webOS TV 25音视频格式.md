# webOS TV 25 上的音视频格式
> 原文链接: https://webostv.developer.lge.com/develop/specifications/video-audio-250 ｜ 简体中文翻译

## 最大数据传输速率

| 类型 | 分辨率与画质 | 支持的机型 |
| --- | --- | --- |
| Full HD | • H.264 1920x1080@60P BP/MP/HP@L4.2 Maximum 40Mbps<br>• HEVC 1920x1080@60P Main/Main10@L4.1 Maximum 40Mbps | 所有机型 |
| 4K Ultra HD | • H.264 3840x2160@30P BP/MP/HP@L5.1 Maximum 50Mbps<br>• HEVC 3840x2160@60P Main/Main10@L5.1 Maximum 60Mbps VP9 3840x2160@60P Maximum 50Mbps<br>• AV1 3840x2160@60P Maximum 50Mbps | Ultra HD 机型 |
| 8K Ultra HD | • AV1 7680x4320@60P Maximum 60Mbps<br>• HEVC 7680x4320@60P Main/Main10@L6.1 Maximum 100Mbps | 8K Ultra HD 机型 |

对于 Ultra HD 机型，部分机型支持 H.264 3840x2160@60P。

<br>

对于部分 8K Ultra HD 机型，某些机型不支持 VP9 8K。如需检查 Ultra HD 或 8K 能力，请使用

`deviceinfo`

webOSTV.js 库上的方法。

## 视频编解码器

| 文件扩展名 | 编解码器 |  |
| --- | --- | --- |
| .asf .wmv | 视频 | VC-1 Advanced Profile (except WMVA), VC-1 Simple and Main Profiles |
| 音频 | WMA Standard (except WMA v1/ WMA Speech) |  |
| .avi | 视频 | Xvid(except 3 warp-point GMC), H.264/AVC, Motion Jpeg, MPEG-4 |
| 音频 | MPEG-1 Layer I, II, MPEG-1 Layer III (MP3), Dolby Digital, LPCM, ADPCM |  |
| .m4v .mp4 .mov | 视频 | H.264/AVC, MPEG-4, HEVC, AV1 |
| 音频 | Dolby Digital, Dolby Digital Plus, AAC, MPEG-1 Layer III (MP3), Dolby AC-4<br>1)<br>, MPEG-H 3D Audio<br>1)<br>, DTS<br>1)<br>, DTS-HD<br>1)<br>, DTS:X1<br>1) |  |
| .3gp .3g2 | 视频 | H.264/AVC, MPEG-4 |
| 音频 | AAC, AMR-NB, AMR-WB |  |
| .mkv | 视频 | MPEG-2, MPEG-4, H.264/AVC, VP8, VP9, HEVC, AV1 |
| 音频 | Dolby Digital, Dolby Digital Plus, AAC, PCM, Opus, DTS<br>1)<br>, DTS-HD<br>1)<br>, DTS:X1<br>1)<br>, MPEG-1 LayerI, II, MPEG-1 Layer III (MP3) |  |
| .ts .trp .tp .mts | 视频 | H.264/AVC, MPEG-2, HEVC |
| 音频 | MPEG-1 Layer I, II, MPEG-1 Layer III (MP3), Dolby Digital, Dolby Digital Plus, AAC, PCM, DTS<br>1)<br>, DTS-HD<br>1)<br>, DTS:X1<br>1)<br>, Dolby AC-4 |  |
| .mpg .mpeg .dat | 视频 | MPEG-1, MPEG-2 |
| 音频 | MPEG-1 Layer I, II, MPEG-1 Layer III (MP3) |  |
| .vob | 视频 | MPEG-1, MPEG-2 |
| 音频 | Dolby Digital, MPEG-1 Layer I, II, DVD-LPCM |  |
| .asf<br>1)<br>.wmv<br>1) | 视频 | VC-1 Advanced Profile (except WMVA), VC-1 Simple and Main Profiles<br>1) |
| 音频 | DWMA Standard (except WMA v1/ WMA Speech)<br>1) |  |

1) 部分机型可能不支持 VC-1(WMV)、WMA、Dolby AC-4、DTS、DTS-HD、DTS:X。

### 视频播放限制

- 不支持包含 Global Motion Compensation (GMC) 或 Quarter-pixel motion (Qpel) 的流。
- 对于分辨率为 3840 × 2160px、4096 × 2160px 的 Ultra HD 机型，支持以下编解码器。文件扩展名编解码器.mkv .mp4 .ts视频H.264/AVC, HEVC音频Dolby Digital, Dolby Digital Plus, AAC
- 对于 Windows Media Audio (WMA)，仅支持 version 7 或更高版本。不支持 AAC Main profile。
- 部分由编码器程序编码的视频无法播放。上述未列出的部分视频可能无法正常播放。

## 音频编码格式

| 文件扩展名 | 项目 | 说明 |
| --- | --- | --- |
| .mp3 | 比特率 | 32 Kbps - 320 Kbps |
| 采样频率 | 16 kHz - 48 kHz |  |
| 支持 | MPEG1, MPEG2 |  |
| 声道 | 单声道, 立体声 |  |
| .wav | 比特率 | - |
| 采样频率 | 8 kHz - 96 kHz |  |
| 支持 | PCM |  |
| 声道 | 单声道, 立体声 |  |
| .ogg | 比特率 | 64 kbps - 320 kbps |
| 采样频率 | 8 kHz - 48 kHz |  |
| 支持 | Vorbis |  |
| 声道 | 单声道, 立体声 |  |
| .flac | 比特率 | - |
| 采样频率 | 8 kHz - 96 kHz |  |
| 支持 | FLAC |  |
| 声道 | 2 声道 |  |
| .wma<br>1) | 比特率 | 128 kbps - 320 kbps |
| 采样频率 | 8 kHz - 48 kHz |  |
| 支持 | WMA |  |
| 声道 | 最多 6 声道 |  |

1) .wma 仅在特定机型上可用。

注意

声道数量可能因采样频率而异。

## 图像格式

| 名称 | 文件扩展名 | webOS TV 支持 | 模拟器支持 | 仿真器支持 |
| --- | --- | --- | --- | --- |
| JPEG | .jpg, .jpeg | 是 | 是 | 是 |
| 图形交换格式 | .gif | 是 | 是 | 是 |
| 可移植网络图形 | .png | 是 | 是 | 是 |
| 位图 | .bmp | 是 | 是 | 是 |
| WebP | .webp | 是 | 是 | 是 |

## 字幕格式

| 名称 | 文件扩展名 | webOS TV 支持 | 模拟器支持 | 仿真器支持 |
| --- | --- | --- | --- | --- |
| WebVTT | .vtt | 是 | 是 | 是 |
