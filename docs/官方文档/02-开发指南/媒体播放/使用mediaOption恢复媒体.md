# 使用 mediaOption 快速恢复媒体
> 原文链接: https://webostv.developer.lge.com/develop/guides/resuming-media-with-mediaoption ｜ 简体中文翻译

在 web 应用中播放媒体文件时，媒体文件可以从用户上次离开的位置，或从某个特定的中间位置开始播放。为此，你可以使用 [HTMLMediaElement](http://www.w3.org/TR/html5/embedded-content-0.html#media-elements) 的 \`**loadeddata**\` 事件来改变媒体对象的 [currentTime](http://www.w3.org/TR/html5/embedded-content-0.html#offsets-into-the-media-resource) 属性，也可以为媒体的 [src](http://www.w3.org/TR/html5/embedded-content-0.html#location-of-the-media-resource) 属性使用 [Media Fragments URI](http://www.w3.org/TR/media-frags/)。

下面的示例使用 \`**loadeddata**\` 事件从给定位置播放媒体文件。

```html
<html>
  <head>
    <script>
      function load() {
        var vid = document.getElementById('myVideo');
        var source = document.createElement('source');
        source.setAttribute(
          'src',
          'http://media.w3.org/2010/05/sintel/trailer.mp4'
        );
        source.setAttribute('type', 'video/mp4');

        vid.appendChild(source);
        vid.addEventListener(
          'loadeddata',
          function (e) {
            loadeddata(30);
          },
          false
        );
        vid.load();
      }

      function loadeddata(start) {
        var vid = document.getElementById('myVideo');
        vid.currentTime = start;
      }
    </script>
  </head>

  <body onload="load()">
    <video
      id="myVideo"
      controls="controls"
      autoplay
      width="640"
      height="360"
    ></video>
  </body>
</html>
```

web 引擎在恢复媒体文件时执行以下任务：

1.  web 引擎加载媒体文件。

2.  媒体文件加载后，播放位置被移动到目标位置。

这一操作看起来似乎没什么特别。然而，如果你仔细观察，就会发现 Media Player（媒体播放器）在媒体加载完成后，会立即从起始位置开始预加载媒体数据（即缓冲 Buffering）。随后，播放位置通过媒体 seek（跳转）被移动到目标位置。然后 Media Player 再次从目标位置预加载媒体数据。

![恢复媒体_操作结构](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914915/webOS-TV/images/docs/guides/Resume_Media_-_Operation_Strcture_ibrv95.png)

由于在加载阶段进行了预加载操作，会产生不必要的数据处理和 I/O 操作。这常常会导致恢复媒体文件时出现一些延迟。

![使用 mediaOption 快速恢复媒体](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914918/webOS-TV/images/docs/guides/Resume_Media_by_HTMLMediaElement_yil8kz.png)

## 使用 mediaOption 避免不必要的预加载

为避免在媒体文件开始时进行不必要的预加载，你可以使用 [mediaOption 参数](mediaOption参数.md)。由 webOS TV 提供的 mediaOption 参数是媒体元素的扩展接口。web 应用层的 mediaOption 参数与 Media Player 层的 Media Pipeline 协同实现，它可以将与播放相关的数据直接转发给 Media Player。

![使用 mediaOption 快速恢复媒体](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914917/webOS-TV/images/docs/guides/mediaOption_-_Operation_Structure_yuyric.png)

你可以将播放相关的数据（例如播放起始位置）插入到 mediaOption 参数中。

![使用 mediaOption 快速恢复媒体](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914917/webOS-TV/images/docs/guides/Resume_Media_by_mediaOption_ecjzii.png)

下面的示例展示了如何使用 mediaOption 参数恢复媒体。

```html
<html>
  <head>
    <script>
      function load(start) {
        var options = {};
        options.option = {};
        options.option.transmission = {};
        options.option.transmission.playTime = {};
        options.option.transmission.playTime.start = start * 1000;

        var source = document.createElement('source');
        source.setAttribute(
          'src',
          'http://media.w3.org/2010/05/sintel/trailer.mp4'
        );
        source.setAttribute(
          'type',
          'video/mp4;mediaOption=' + escape(JSON.stringify(options))
        );

        var vid = document.getElementById('myVideo');
        vid.appendChild(source);
        vid.load();
      }
    </script>
  </head>

  <body onload="load(30)">
    <video
      id="myVideo"
      controls="controls"
      autoplay
      width="640"
      height="360"
    ></video>
  </body>
</html>
```
