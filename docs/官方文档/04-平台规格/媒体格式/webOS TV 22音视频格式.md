# webOS TV 22 上的音视频格式
> 原文链接: https://webostv.developer.lge.com/develop/specifications/video-audio-220 ｜ 简体中文翻译

## 最大数据传输速率

| 类型 | 分辨率与画质 | 支持的机型 |
| --- | --- | --- |
| Full HD | • H.264 1920x1080@60P BP/MP/HP@L4.2 Maximum 40Mbps<br>• HEVC 1920x1080@60P Main/Main10@L4.1 Maximum 40Mbps | All models |
| 4K Ultra HD | • H.264 3840x2160@30P BP/MP/HP@L5.1 Maximum 50Mbps<br>• HEVC 3840x2160@60P Main/Main10@L5.1 Maximum 60Mbps VP9 3840x2160@60P Maximum 50Mbps<br>• AV1 3840x2160@60P Maximum 50Mbps | Ultra HD models |
| 8K Ultra HD | • AV1 7680x4320@60P Maximum 40Mbps<br>• HEVC 7680x4320@60P Main/Main10@L6.1 Maximum 100Mbps | 8K Ultra HD models |

对于 Ultra HD 机型，部分机型支持 H.264 3840x2160@60P。

<br>

对于部分 8K Ultra HD 机型，有些机型不支持 VP9 8K。要检查 Ultra HD 或 8K 能力，请使用

`deviceinfo`

webOSTV.js 库上的这个方法。

## 视频编解码器

| 文件扩展名 | 编解码器 |  |
| --- | --- | --- |
| .asf .wmv | Video | VC-1 Advanced Profile (except WMVA), VC-1 Simple and Main Profiles |
| Audio | WMA Standard (except WMA v1/ WMA Speech) |  |
| .avi | Video | Xvid(except 3 warp-point GMC), H.264/AVC, Motion Jpeg, MPEG-4 |
| Audio | MPEG-1 Layer I, II, MPEG-1 Layer III (MP3), Dolby Digital, LPCM, ADPCM |  |
| .m4v .mp4 .mov | Video | H.264/AVC, MPEG-4, HEVC, AV1 |
| Audio | Dolby Digital, Dolby Digital Plus, AAC, MPEG-1 Layer III (MP3), Dolby AC-4<br>1)<br>, MPEG-H 3D Audio |  |
| .3gp .3g2 | Video | H.264/AVC, MPEG-4 |
| Audio | AAC, AMR-NB, AMR-WB |  |
| .mkv | Video | MPEG-2, MPEG-4, H.264/AVC, VP8, VP9, HEVC, AV1 |
| Audio | Dolby Digital, Dolby Digital Plus, AAC, PCM, DTS, MPEG-1 Layer I, II, MPEG-1 Layer III (MP3) |  |
| .ts .trp .tp .mts | Video | H.264/AVC, MPEG-2, HEVC |
| Audio | MPEG-1 Layer I, II, MPEG-1 Layer III (MP3), Dolby Digital, Dolby Digital Plus, AAC, PCM, Dolby AC-4 |  |
| .mpg .mpeg .dat | Video | MPEG-1, MPEG-2 |
| Audio | MPEG-1 Layer I, II, MPEG-1 Layer III (MP3) |  |
| .vob | Video | MPEG-1, MPEG-2 |
| Audio | Dolby Digital, MPEG-1 Layer I, II, DVD-LPCM |  |

1) Dolby AC-4 和 MPEG-H 3D Audio 仅在特定机型上可用。

### 视频播放限制

- 不支持包含 Global Motion Compensation (GMC) 或 Quarter-pixel motion (Qpel) 的流。
- 对于具备 3840 × 2160px、4096 × 2160px 的 Ultra HD 机型，支持以下编解码器。File ExtensionCodec.mkv .mp4 .tsVideoH.264/AVC, HEVCAudioDolby Digital, Dolby Digital Plus, AAC
- 对于 Windows Media Audio (WMA)，仅支持 version 7 或更高版本。不支持 AAC Main profile。
- 某些由编码器程序编码的视频无法播放。某些未在上面列出的视频可能无法正常播放。

## 音频编码格式

| 文件扩展名 | 项目 | 说明 |
| --- | --- | --- |
| .mp3 | Bit Rate | 32 Kbps - 320 Kbps |
| Sample Frequency | 16 kHz - 48 kHz |  |
| Support | MPEG1, MPEG2 |  |
| Channels | Mono, Stereo |  |
| .wav | Bit Rate | - |
| Sample Frequency | 8 kHz ~ 96 kHz |  |
| Support | PCM |  |
| Channels | Mono, Stereo |  |
| .ogg | Bit Rate | 64 kbps - 320 kbps |
| Sample Frequency | 8 kHz ~ 48 kHz |  |
| Support | Vorbis |  |
| Channels | Mono, Stereo |  |
| .wma | Bit Rate | 128 kbps - 320 kbps |
| Sample Frequency | 8 kHz ~ 48 kHz |  |
| Support | WMA |  |
| Channels | up to 6 channels |  |
| .flac | Bit Rate | - |
| Sample Frequency | 8 kHz ~ 96 kHz |  |
| Support | FLAC |  |
| Channels | 2 channels |  |

声道数可能因采样频率而异。

## 图像格式

| 名称 | 文件扩展名 | webOS TV 中支持 | 仿真器 (Simulator) 中支持 | 模拟器 (Emulator) 中支持 |
| --- | --- | --- | --- | --- |
| JPEG | .jpg, .jpeg | Yes | Yes | Yes |
| Graphics Interchange Format | .gif | Yes | Yes | Yes |
| Portable Network Graphics | .png | Yes | Yes | Yes |
| Bitmap | .bmp | Yes | Yes | Yes |
| WebP | .webp | Yes | Yes | Yes |

## 字幕格式

| 名称 | 文件扩展名 | webOS TV 中支持 | 仿真器 (Simulator) 中支持 | 模拟器 (Emulator) 中支持 |
| --- | --- | --- | --- | --- |
| WebVTT | .vtt | Yes | Yes | Yes |
