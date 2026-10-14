# webOS TV 2.0 上的音视频格式
> 原文链接: https://webostv.developer.lge.com/develop/specifications/video-audio-20 ｜ 简体中文翻译

## 最大数据传输速率

| 类型 | 分辨率与画质 | 支持的机型 |
| --- | --- | --- |
| Full HD | • H.264 1920x1080@60P BP/MP/HP@L4.2 20Mbps<br>• HEVC 1920x1080@60P MP@L4.1, Main10 Profile@L4.1 20Mbps | All models |
| Ultra HD | • H.264 4096x2160@30P BP/MP/HP@L5.1 50Mbps<br>• HEVC 4096x2160@60P MP@L5.1, Main10 Profile@L5.1 50Mbps | Ultra HD models |

## 支持的视频编解码器

| 文件扩展名 | 编解码器 |  |
| --- | --- | --- |
| .asf .wmv | Video | VC-1 Advanced Profile (except WMVA), VC-1 Simple and Main Profiles |
| Audio | WMA Standard (except WMA v1/ WMA Speech), WMA 9 Professional |  |
| .avi | Video | Xvid(except 3 warp-point GMC), H.264/AVC, Motion Jpeg, MPEG-4 |
| Audio | MPEG-1 Layer I, II, MPEG-1 Layer III (MP3), Dolby Digital, LPCM, ADPCM, DTS |  |
| .mp4 .m4v .mov | Video | H.264/AVC, MPEG-4, HEVC |
| Audio | AAC, MPEG-1 Layer III (MP3) |  |
| .3gp .3g2 | Video | H.264/AVC, MPEG-4 |
| Audio | AAC, AMR-NB, AMR-WB |  |
| .mkv | Video | MPEG-2, MPEG-4, H.264/AVC, VP8, VP9<br>1)<br>, HEVC |
| Audio | Dolby Digital, PCM, DTS, MPEG-1 Layer I, II, MPEG-1 Layer III (MP3), AAC |  |
| .ts .trp .tp .mts | Video | H.264/AVC, MPEG-2, HEVC |
| Audio | MPEG-1 Layer I, II, MPEG-1 Layer III (MP3), Dolby Digital, Dolby Digital Plus, AAC, PCM |  |
| .mpg .mpeg .dat | Video | MPEG-1, MPEG-2 |
| Audio | MPEG-1 Layer I, II, MPEG-1 Layer III (MP3) |  |
| .vob | Video | MPEG-1, MPEG-2 |
| Audio | Dolby Digital, MPEG-1 Layer I, II, DVD-LPCM |  |

VP9 codec 仅在 Ultra HD 机型上受支持。

### 视频播放限制

- 不支持包含 Global Motion Compensation (GMC) 或 Quarter-pixel motion (Qpel) 的流。
- 对于分辨率为 3840 × 2160px 的 Ultra HD 机型，支持以下编解码器。File ExtensionCodec.mkv .mp4 .tsVideoH.264/AVC, HEVCAudioDolby Digital, Dolby Digital Plus, AAC, HE-AAC
- 对于 Windows Media Audio (WMA)，仅支持 version 7 或更高版本。不支持 AAC Main profile。
- 某些由编码器程序编码的视频无法播放。某些未在上面列出的视频可能无法正常播放。

## 支持的音频编码格式

| 文件扩展名 | 项目 | 说明 |
| --- | --- | --- |
| .mp3 | Bit Rate | 32 Kbps - 320 Kbps |
| Sample Frequency | 16 kHz - 48 kHz |  |
| Support | MPEG1, MPEG2 |  |
| Channels | Mono, Stereo |  |
| .wav | Bit Rate | - |
| Sample Frequency | ~384 kHz |  |
| Support | PCM |  |
| Channels | Mono, Stereo |  |
| .ogg | Bit Rate | 64 kbps - 500 kbps |
| Sample Frequency | 8 kHz ~ 48 kHz |  |
| Support | Vorbis |  |
| Channels | Mono, Stereo |  |
| .wma | Bit Rate | ~1.5 Mbps |
| Sample Frequency | 8 kHz ~ 192 kHz |  |
| Support | WMA |  |
| Channels | up to 6 channels |  |

声道数可能因采样频率而异。

## 图像格式

| 名称 | 文件扩展名 | webOS TV 中支持 | 模拟器 (Emulator) 中支持 |
| --- | --- | --- | --- |
| JPEG | .jpg, .jpeg | Yes | Yes |
| Graphics Interchange Format | .gif | Yes | Yes |
| Portable Network Graphics | .png | Yes | Yes |
| Bitmap | .bmp | Yes | Yes |
| WebP | .webp | Yes | Yes |

## 字幕格式

| 名称 | 文件扩展名 | webOS TV 中支持 | 模拟器 (Emulator) 中支持 |
| --- | --- | --- | --- |
| WebVTT | .vtt | Yes | Yes |
