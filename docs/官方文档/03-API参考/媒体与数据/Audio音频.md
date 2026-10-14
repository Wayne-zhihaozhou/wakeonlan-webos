# Audio（音频）
> 原文链接: https://webostv.developer.lge.com/develop/references/audio ｜ 简体中文翻译

**服务 URI - luna://com.webos.audio**

提供音量控制相关方法。
**Audio Setting** 服务使应用能够控制音量，提供以下方法。

方法

| 方法 | 说明 | 在模拟器中是否支持 |
| --- | --- | --- |
| [setMuted](#setmuted) | 静音或取消静音。 | 是 |
| [volumeDown](#volumedown) | 音量减小 1。 | 是 |
| [volumeUp](#volumeup) | 音量增大 1。 | 是 |

## setMuted

说明

静音或取消静音。

参数

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| muted | 必填 | Boolean | 指示是静音还是取消静音的标志。<ul><li>true：静音</li><li>false：取消静音</li></ul> |

调用返回

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 可选 | Number | 如果方法失败，errorCode 包含错误代码。仅当方法失败时才会返回 errorCode。<br>有关更多详细信息，请参阅本方法的错误代码参考。 |
| errorText | 可选 | String | 如果方法失败，errorText 包含错误文本。仅当方法失败时才会返回 errorText。<br>有关更多详细信息，请参阅本方法的错误代码参考。 |

错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| 1 | 不是有效的 JSON 消息 |

示例

```javascript
// One-time call
var request = webOS.service.request('luna://com.webos.audio', {
  method: 'setMuted',
  parameters: { muted: true },
  onSuccess: function (inResponse) {
    console.log('TV is muted');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to set muted');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回示例

```json
{
  'returnValue': true
}
```

另请参阅

-   [volumeDown](#volumedown)
-   [volumeUp](#volumeup)

## volumeDown

说明

音量减小 1。

参数

无

调用返回

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 可选 | Number | 如果方法失败，errorCode 包含错误代码。仅当方法失败时才会返回 errorCode。<br>有关更多详细信息，请参阅本方法的错误代码参考。 |
| errorText | 可选 | String | 如果方法失败，errorText 包含错误文本。仅当方法失败时才会返回 errorText。<br>有关更多详细信息，请参阅本方法的错误代码参考。 |

错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| ERROR_3 | 参数应为空 |

示例

```javascript
// One-time call
var request = webOS.service.request('luna://com.webos.audio', {
    method: 'volumeDown',
    onSuccess: function (inResponse) {
        console.log('The volume is decreased by 1.');
        // To-Do something
    },
	onFailure: function (inError) {
		console.log('Failed to decrease volume by 1.');
		console.log('[' + inError.errorCode + ']: ' + inError.errorText);
		// To-Do something
		return;
	}
});
```

返回示例

```json
{
  'returnValue': true
}
```

另请参阅

-   [setMuted](#setmuted)
-   [volumeUp](#volumeup)

## volumeUp

说明

音量增大 1。

参数

无

调用返回

| 名称 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| returnValue | 必填 | Boolean | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 可选 | Number | 如果方法失败，errorCode 包含错误代码。仅当方法失败时才会返回 errorCode。<br>有关更多详细信息，请参阅本方法的错误代码参考。 |
| errorText | 可选 | String | 如果方法失败，errorText 包含错误文本。仅当方法失败时才会返回 errorText。<br>有关更多详细信息，请参阅本方法的错误代码参考。 |

错误参考

| 错误代码 | 错误消息 |
| --- | --- |
| ERROR_3 | 参数应为空 |

示例

```javascript
// One-time call
var request = webOS.service.request('luna://com.webos.audio', {
  method: 'volumeUp',
  onComplete: function (inResponse) {
    console.log('The volume is increased by 1.');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to increase volume by 1.');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回示例

```json
{
  'returnValue': true
}
```

另请参阅

-   [setMuted](#setmuted)
-   [volumeDown](#volumedown)
