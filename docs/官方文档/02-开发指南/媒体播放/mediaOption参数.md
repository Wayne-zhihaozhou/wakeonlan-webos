# mediaOption 参数（mediaOption Parameters）
> 原文链接: https://webostv.developer.lge.com/develop/guides/mediaoption-parameter ｜ 简体中文翻译

## 如何使用 mediaOption 参数

1. 创建一个 mediaOption 对象并设置附加信息。

   ```html
   // HTML 代码
   <video id="myVideo" ...>
   </video>
   ```

   ```javascript
   // JavaScript 代码
   var options = {};
   options.mediaTransportType = "PLAYREADY";
   options.option = {};
   options.option.drm = {};
   options.option.drm.type = drmType;
   ...
   options.option.transmission = {};
   options.option.transmission.playTime = {};
   options.option.transmission.playTime.start = start * 1000;
   ```

2. 将创建的对象转换为 JSON 字符串并进行编码。

   ```javascript
   var mediaOption = encodeURI(JSON.stringify(options));
   ```

3. 创建 source（来源）元素。

   ```javascript
   var source = document.createElement("source");
   ```

4. 为所创建的 source 元素添加用于媒体内容的属性。

   ```javascript
   var dataURL = "http://example.com/test.mp4";
   source.setAttribute('src', dataURL);
   ```

5. 将转义后的字符串添加到 type 属性中，如下所示：

   ```javascript
   source.setAttribute('type', 'video/mp4;mediaOption=' + mediaOption);
   ```

6. 将所创建的 source 元素添加到 video 元素或 audio 元素中。

   ```javascript
   video = document.getElementById('myVideo');
   video.appendChild(source)
   ```

## mediaOption 参考（mediaOption reference）

下表描述了 mediaOption 的参数。

| 参数（Parameter） | 是否必需（Required） | 数据类型（Data Type） | 说明（Description） |
| --- | --- | --- | --- |
| mediaTransportType | 可选 | string | 媒体传输类型（Media Transport Type）的代码。播放器类型由该代码决定。此属性会自动设置。更多详情，请参阅「媒体传输类型（Media Transport Types）」。默认值为 URI。 |
| option | 可选 | object | 用于保存每种媒体传输类型的附加信息的对象。 |
| option.mediaFormat | 可选 | object | 用于保存媒体格式信息的对象。 |
| option.mediaFormat.type | 可选 | string | 用于设置媒体类型的字符串。默认值为 video。<ul><li>"audio"：音频</li><li>"video"：视频/音频</li><li>"video_only"：仅视频</li><li>"audio_test"：仅用于测试的音频</li></ul> |
| option.drm | 可选 | object | 保存 DRM 信息的对象。 |
| option.drm.type | 可选 | string | DRM 的类型。<ul><li>"playready"</li></ul> |
| option.drm.clientId | 可选 | string | DRM 服务发送给应用（app）的客户端 ID（Client ID）。仅当 DRM 服务发送了客户端 ID 时才设置此属性。 |
| option.transmission | 可选 | object | 用于保存由服务器类型和传输协议确定的媒体内容信息的对象。此对象会发送到媒体管线（media pipeline）。 |
| option.transmission.playTime | 可选 | object | 保存与播放时间相关的参数的对象。 |
| option.transmission.playTime.start | 可选 | number | 用于恢复（继续播放）媒体的开始时间（毫秒）。 |
| option.adaptiveStreaming | 可选 | object | 保存网络传输状态信息的对象。 |
| option.adaptiveStreaming.audioOnly | 可选 | boolean | 指示流媒体模式的标志。此属性可在使用 HLS 协议传输纯音频流（例如音乐服务或广播服务）时使用。默认值为 false。<ul><li>true：仅音频</li><li>false：视频/音频</li></ul> |
| option.adaptiveStreaming.adaptiveResolution | 可选 | boolean | 指示屏幕比例是否可以随网络状态变化的标志。默认值为 false。<ul><li>true：可变</li><li>false：不可变</li></ul> |
| option.adaptiveStreaming.seamlessPlay | 可选 | boolean | 内容是否支持无缝播放（seamless play）的标志。默认值为 false。<ul><li>true：支持无缝播放</li><li>false：不支持</li></ul> |
| option.adaptiveStreaming.maxWidth | 可选 | number | 内容的最大屏幕宽度。默认值为 1920。 |
| option.adaptiveStreaming.maxHeight | 可选 | number | 内容的最大屏幕高度。默认值为 1080。 |
| option.adaptiveStreaming.bps | 可选 | object | 保存用于控制网络传输速度的信息的对象。 |
| option.adaptiveStreaming.bps.start | 可选 | number | 网络传输的起始速度（bps）。注意：对于 HLS，此参数在 webOS TV 3.0 或更高版本上受支持。 |

### 媒体传输类型（Media transport types）

下表描述了媒体传输类型。

| 媒体传输类型（Media Transport Type） | 说明（Description） |
| --- | --- |
| URI | URI 是一种通用播放类型。此类型播放 URI 的内容。 |
| HLS | 使用 HLS 协议播放内容。当 src 属性包含 "m3u8" 文件扩展名时，以下 MIME 类型会自动将媒体传输类型（Media Transport Type）设置为 HLS：<ul><li>application/vnd.apple.mpegurl</li><li>application/mpegurl</li><li>application/x-mpegurl</li><li>application/vnd.apple.mpegurl.audio</li><li>audio/mpegurl</li><li>audio/x-mpegurl</li></ul> |
