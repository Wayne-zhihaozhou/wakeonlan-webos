# Camera（摄像头）
> 原文链接: https://webostv.developer.lge.com/develop/references/camera ｜ 简体中文翻译

**服务 URI - luna://com.webos.service.camera**

提供返回摄像头和麦克风信息的方法。

Camera 服务管理连接到 webOS TV 的摄像头/麦克风设备。您可以通过此 API 获取设备 URI，并通过设备 URI 获取每个设备的更多信息。

> **注意：API 弃用**
>
> 此 API 自 webOS TV 4.0 起已被弃用。

## 方法（Methods）

| 方法 | 说明 | 模拟器中是否支持 |
| --- | --- | --- |
| [getInfo](#getinfo) | 返回设备的详细信息。 | 否 |
| [getList](#getlist) | 返回连接到 webOS TV 的摄像头和麦克风设备列表。 | 否 |
| [isCovered](#iscovered) | 返回内置摄像头的遮挡状态。 | 否 |

## getInfo

**说明**

返回设备的详细信息。您需要将 getList() 方法提供的 URI 作为参数传入。

**参数（Parameters）**

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| uri | 必填 | string | 设备 URI |

**调用返回（Call returns）**

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| returnValue | 必填 | boolean | 指示请求成功/失败的标志。<ul><li>true: 成功</li><li>false: 失败</li></ul> |
| errorCode | 可选 | number | 如果方法失败，errorCode 包含错误代码。仅当方法失败时才返回 errorCode。<br>更多详情请参阅本方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | string | 如果方法失败，errorText 包含错误文本。仅当方法失败时才返回 errorText。<br>更多详情请参阅本方法的错误代码参考（Error Codes Reference）。 |
| [info](#info) | 可选 | object | 保存设备详细信息的对象。 |

**错误参考（Error reference）**

| 错误代码 | 错误消息 |
| --- | --- |
| 1 | 无法关闭（Can not close） |
| 2 | 无法打开（Can not open） |
| 3 | 无法设置（Can not set） |
| 4 | 无法启动（Can not start） |
| 5 | 无法停止（Can not stop） |
| 6 | 摄像头设备已关闭 |
| 7 | 摄像头设备已打开 |
| 8 | 摄像头设备已启动 |
| 9 | 摄像头设备已停止 |
| 10 | 摄像头设备正在更新 |
| 11 | 摄像头设备正忙 |
| 12 | 摄像头设备未打开 |
| 13 | 摄像头设备未启动 |
| 14 | 没有设备 |
| 15 | 设备无响应 |
| 16 | 解析错误 |
| 17 | 内存不足 |
| 18 | 超出参数范围 |
| 19 | 缺少参数 |
| 20 | 服务未就绪 |
| 21 | 部分参数未设置 |
| 22 | 请求过多 |
| 23 | 请求超时 |
| 24 | 未知服务 |
| 25 | 不支持的设备 |
| 26 | 不支持的格式 |
| 27 | 不支持的采样率 |
| 28 | 不支持的视频尺寸 |
| 29 | 摄像头固件正在更新 |
| 30 | 设备编号错误 |
| 31 | 会话 ID 错误 |
| 32 | 参数错误 |
| 33 | 类型错误 |
| 34 | 已获取 |
| 35 | 未知错误 |
| 36 | 特效失败 |
| 37 | 照片查看效果失败 |
| 38 | 打开文件失败 |
| 39 | 删除文件失败 |
| 40 | 创建目录失败 |
| 41 | 存储空间不足 |
| 42 | 文件已存在 |

**示例（Example）**

```javascript
// 摄像头设备示例
var request = webOS.service.request('luna://com.webos.service.camera', {
  method: 'getInfo',
  parameters: { uri: 'camera://com.webos.service.camera/camera1' },
  onSuccess: function (inResponse) {
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to get camera device info');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});

// 麦克风设备示例
var request = webOS.service.request('luna://com.webos.service.camera', {
  method: 'getInfo',
  parameters: { uri: 'camera://com.webos.service.camera/mic1' },
  onSuccess: function (inResponse) {
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to get microphone device info');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例（Return example）**

```javascript
// 摄像头设备信息
{
  'returnValue': true,
  'info': {
      'name': 'BC600 Camera',
      'type': 'camera',
      'builtin': true,
      'details': {
          'video': {
              'maxWidth': 1920,
              'maxHeight': 1080
          },
          'picture': {
              'maxWidth': 3264,
              'maxHeight': 2448
          },
          'format': 'H264ES|H264TS|SECS|MP4|'
      }
  }
}

// 麦克风设备信息
{
  'returnValue': true,
  'info': {
      'name': 'BC600 Camera',
      'type': 'microphone',
      'builtin': true,
      'details': {
          'samplingRate': 'WB',
          'codec': 'PCM'
      }
  }
}

// 失败返回
{
  'returnValue': false,
  'errorCode': '32',
  'errorText': 'Wrong param'
}
```

**另请参阅（See also）**

- [getList](#getlist)

## getList

**说明**

返回连接到 webOS TV 的摄像头和麦克风设备列表。

此方法提供订阅功能。每当有设备连接或断开时，都会触发事件。每次事件都会返回更新后的列表。

**参数（Parameters）**

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| subscribe | 可选 | boolean | 决定是否订阅的标志。<ul><li>true: 订阅。</li><li>false: 不订阅。仅调用一次该方法。（默认）</li></ul> |

**调用返回（Call returns）**

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| returnValue | 必填 | boolean | 指示请求成功/失败的标志。<ul><li>true: 成功</li><li>false: 失败</li></ul> |
| errorCode | 可选 | number | 如果方法失败，errorCode 包含错误代码。仅当方法失败时才返回 errorCode。<br>更多详情请参阅本方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | string | 如果方法失败，errorText 包含错误文本。仅当方法失败时才返回 errorText。<br>更多详情请参阅本方法的错误代码参考（Error Codes Reference）。 |
| [uriList](#urilist) | 可选 | object array | 连接到 webOS TV 的设备列表。此对象保存设备类型和 URI。如果没有连接的设备，getList() 将返回空数组。 |
| subscribed | 可选 | boolean | 指示订阅是否启用的标志。<ul><li>true: 已启用</li><li>false: 未启用。</li></ul> |

**错误参考（Error reference）**

| 错误代码 | 错误消息 |
| --- | --- |
| 1 | 无法关闭（Can not close） |
| 2 | 无法打开（Can not open） |
| 3 | 无法设置（Can not set） |
| 4 | 无法启动（Can not start） |
| 5 | 无法停止（Can not stop） |
| 6 | 摄像头设备已关闭 |
| 7 | 摄像头设备已打开 |
| 8 | 摄像头设备已启动 |
| 9 | 摄像头设备已停止 |
| 10 | 摄像头设备正在更新 |
| 11 | 摄像头设备正忙 |
| 12 | 摄像头设备未打开 |
| 13 | 摄像头设备未启动 |
| 14 | 没有设备 |
| 15 | 设备无响应 |
| 16 | 解析错误 |
| 17 | 内存不足 |
| 18 | 超出参数范围 |
| 19 | 缺少参数 |
| 20 | 服务未就绪 |
| 21 | 部分参数未设置 |
| 22 | 请求过多 |
| 23 | 请求超时 |
| 24 | 未知服务 |
| 25 | 不支持的设备 |
| 26 | 不支持的格式 |
| 27 | 不支持的采样率 |
| 28 | 不支持的视频尺寸 |
| 29 | 摄像头固件正在更新 |
| 30 | 设备编号错误 |
| 31 | 会话 ID 错误 |
| 32 | 参数错误 |
| 33 | 类型错误 |
| 34 | 已获取 |
| 35 | 未知错误 |
| 36 | 特效失败 |
| 37 | 照片查看效果失败 |
| 38 | 打开文件失败 |
| 39 | 删除文件失败 |
| 40 | 创建目录失败 |
| 41 | 存储空间不足 |
| 42 | 文件已存在 |

**订阅返回（Subscription Returns）**

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| [uriList](#urilist) | 必填 | Object array | 连接到 webOS TV 的设备列表。此对象保存设备类型和 URI。如果没有连接的设备，getList() 将返回空数组。 |

**示例（Example）**

```javascript
// 一次性调用
var request = webOS.service.request('luna://com.webos.service.camera', {
  method: 'getList',
  onSuccess: function (inResponse) {
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to get camera device list');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});

// 订阅
var subscriptionHandle;

subscriptionHandle = webOS.service.request('luna://com.webos.service.camera', {
  method: 'getList',
  parameters: { subscribe: true },
  onSuccess: function (inResponse) {
    if (typeof inResponse.subscribed != 'undefined') {
      if (!inResponse.subscribed) {
        console.log('Failed to subscribe the camera device list');
        return;
      }
    }

    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to get camera device list');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
...
// 如需取消订阅数据，请如下所示使用 cancel() 方法
subscriptionHandle.cancel();
```

**返回示例（Return example）**

```javascript
// 一次性调用返回
{
  'returnValue': true,
  'uriList': [
      {
          'uri': 'camera://com.webos.service.camera/camera1',
          'type': 'camera'
      },
      {
          'uri': 'camera://com.webos.service.camera/mic1',
          'type': 'microphone'
      }
  ]
}

// 无设备连接
{
  'returnValue': true,
  'uriList': [ ],
  'subscribed': true
}

// 失败返回
{
  'returnValue': false,
  'errorCode': '23',
  'errorText': 'Request timeout'
}

// 使用订阅时返回
{
  'returnValue': true,
  'uriList': [
      {
          'uri': 'camera://com.webos.service.camera/camera1',
          'type': 'camera'
      },
      {
          'uri': 'camera://com.webos.service.camera/mic1',
          'type': 'microphone'
      }
  ],
  'subscribed': true
}

// 订阅返回
{
  'uriList': [
      {
          'uri': 'camera://com.webos.service.camera/camera1',
          'type': 'camera'
      },
      {
          'uri': 'camera://com.webos.service.camera/mic1',
          'type': 'microphone'
      }
  ]
}

// 无设备连接（订阅返回）
{
  'uriList': [ ]
}
```

**另请参阅（See also）**

- [getInfo](#getinfo)
- [isCovered](#iscovered)

## isCovered

**说明**

返回内置摄像头的遮挡状态。您需要将 getList() 提供的 URI 作为参数传入。

**参数（Parameters）**

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| uri | 必填 | string | 设备 URI |
| subscribe | 可选 | boolean | 决定是否订阅的标志。<ul><li>true: 订阅。</li><li>false: 不订阅。仅调用一次该方法。（默认）</li></ul> |

**调用返回（Call returns）**

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| returnValue | 必填 | boolean | 指示请求成功/失败的标志。<ul><li>true: 成功</li><li>false: 失败</li></ul> |
| errorCode | 可选 | number | 如果方法失败，errorCode 包含错误代码。仅当方法失败时才返回 errorCode。<br>更多详情请参阅本方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | string | 如果方法失败，errorText 包含错误文本。仅当方法失败时才返回 errorText。<br>更多详情请参阅本方法的错误代码参考（Error Codes Reference）。 |
| covered | 可选 | boolean | 指示内置摄像头是否被遮挡的标志。<ul><li>true: 已遮挡</li><li>false: 未遮挡</li></ul> |
| subscribed | 可选 | boolean | 指示订阅是否启用的标志。<ul><li>true: 已启用</li><li>false: 未启用。</li></ul> |

**错误参考（Error reference）**

| 错误代码 | 错误消息 |
| --- | --- |
| 1 | 无法关闭（Can not close） |
| 2 | 无法打开（Can not open） |
| 3 | 无法设置（Can not set） |
| 4 | 无法启动（Can not start） |
| 5 | 无法停止（Can not stop） |
| 6 | 摄像头设备已关闭 |
| 7 | 摄像头设备已打开 |
| 8 | 摄像头设备已启动 |
| 9 | 摄像头设备已停止 |
| 10 | 摄像头设备正在更新 |
| 11 | 摄像头设备正忙 |
| 12 | 摄像头设备未打开 |
| 13 | 摄像头设备未启动 |
| 14 | 没有设备 |
| 15 | 设备无响应 |
| 16 | 解析错误 |
| 17 | 内存不足 |
| 18 | 超出参数范围 |
| 19 | 缺少参数 |
| 20 | 服务未就绪 |
| 21 | 部分参数未设置 |
| 22 | 请求过多 |
| 23 | 请求超时 |
| 24 | 未知服务 |
| 25 | 不支持的设备 |
| 26 | 不支持的格式 |
| 27 | 不支持的采样率 |
| 28 | 不支持的视频尺寸 |
| 29 | 摄像头固件正在更新 |
| 30 | 设备编号错误 |
| 31 | 会话 ID 错误 |
| 32 | 参数错误 |
| 33 | 类型错误 |
| 34 | 已获取 |
| 35 | 未知错误 |
| 36 | 特效失败 |
| 37 | 照片查看效果失败 |
| 38 | 打开文件失败 |
| 39 | 删除文件失败 |
| 40 | 创建目录失败 |
| 41 | 存储空间不足 |
| 42 | 文件已存在 |

**订阅返回（Subscription Returns）**

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| covered | 必填 | Boolean | 指示内置摄像头是否被遮挡的标志。<ul><li>true: 已遮挡</li><li>false: 未遮挡</li></ul> |

**示例（Example）**

```javascript
// 一次性调用
var request = webOS.service.request('luna://com.webos.service.camera', {
  method: 'isCovered',
  parameters: { id: 'camera://com.webos.service.camera/camera1' },
  onSuccess: function (inResponse) {
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to get camera cover state');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});

// 订阅
var subscriptionHandle;

subscriptionHandle = webOS.service.request('luna://com.webos.service.camera', {
  method: 'isCovered',
  parameters: {
    id: 'camera://com.webos.service.camera/camera1',
    subscribe: true,
  },
  onSuccess: function (inResponse) {
    if (typeof inResponse.subscribed != 'undefined') {
      if (!inResponse.subscribed) {
        console.log('Failed to subscribe the camera cover state');
        return;
      }
    }
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to get camera cover state');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
...
// 如需取消订阅数据，请如下所示使用 cancel() 方法
subscriptionHandle.cancel();
```

**返回示例（Return example）**

```javascript
// 一次性调用返回
{
  'returnValue': true,
  'covered': true
}

// 订阅返回
{
  'returnValue': false,
  'covered': false,
  'subscribed': true
}
```

**另请参阅（See also）**

- [getList](#getlist)

## 对象（Object）

### deviceInfo 对象

保存摄像头或麦克风设备详细信息的对象。

```javascript
{
  'name': string,
  'type': string,
  'builtin': boolean,
  'details': deviceDetail object
}
```

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| name | 必填 | string | 设备名称 |
| type | 必填 | string | 设备类型（camera 或 microphone） |
| builtin | 必填 | boolean | 指示设备是否为内置设备的标志。 |
| [details](#detail) | 必填 | object | 保存录制分辨率、支持的视频格式、采样率和音频编解码器信息的对象。 |

### uriList 对象

连接到 webOS TV 的设备列表。此对象保存设备类型和 URI。

```javascript
{
    'uri': string,
    'type': string
}
```

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| uri | 必填 | string | 设备 URI |
| type | 必填 | string | 区分 camera 和 microphone 的设备类型。 |

### deviceDetail 对象

保存摄像头和麦克风更详细信息对象的对象。

```javascript
{
  'video': videoDetail Object,
  'picture': pictureDetail Object,
  'format': String,
  'samplingRate': String,
  'codec': String
}
```

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| [video](#video) | 可选 | object | 保存视频录制所支持的最大视频帧尺寸的对象。 |
| [picture](#picture) | 可选 | object | 保存拍照所支持的最大图像尺寸的对象。 |
| format | 可选 | string | 视频录制所支持的视频格式。在返回的字符串中，使用管道符（\|）作为分隔符来区分多种格式。 |
| samplingRate | 可选 | string | 音频录制所支持的采样率。 |
| codec | 可选 | string | 音频录制所支持的音频编解码器。 |

### videoDetail 对象

保存视频录制所支持的最大视频帧尺寸的对象。此对象包含最大宽度和高度。

```javascript
{
  'maxWidth': Number,
  'maxHeight': Number
}
```

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| maxWidth | 必填 | number | 摄像头设备进行视频录制所支持的最大宽度 |
| maxHeight | 必填 | number | 摄像头设备进行视频录制所支持的最大高度。 |

### pictureDetail 对象

保存拍照所支持的最大图像尺寸的对象。此对象包含最大宽度和高度。

```javascript
{
  'maxWidth': Number,
  'maxHeight': Number
}
```

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| maxWidth | 必填 | number | 摄像头设备进行拍照所支持的最大宽度 |
| maxHeight | 必填 | number | 摄像头设备进行拍照所支持的最大高度 |
