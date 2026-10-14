# System Service（系统服务）
> 原文链接: https://webostv.developer.lge.com/develop/references/system-service ｜ 简体中文翻译

Service URI - luna://com.palm.systemservice

提供关于系统时间的信息。应用可以订阅该方法以获得系统时间更新。

## Methods

| 方法 | 描述 | 在模拟器中支持 |
| --- | --- | --- |
| [time/getSystemTime](#getsystemtime) | 返回设备的详细信息。 | 是 |

## time/getSystemTime

### Description（描述）

请求系统时间。应用可以订阅该方法，并在时区发生变化以及/或系统时间发生显著变化（当前为 5 分钟）时接收通知。

### Parameters（参数）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| subscribe | 可选 | Boolean | 决定是否订阅的标志。<br>如果应用希望在时区发生变化以及/或系统时间按系统定义的阈值发生变化时收到通知，则应将 **subscribe** 设为 **true**。当前系统定义的阈值是 5 分钟。<br>如果应用不希望接收关于时区变化以及/或系统时间变化的通知，则应将 **subscribe** 设为 **false**。<ul><li>true：订阅。</li><li>false：不订阅。仅调用该方法一次。（默认）</li></ul> |

### Call returns（调用返回）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | Boolean | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| subscribed | 可选 | Boolean | 指示订阅是否已启用的标志。<ul><li>true：已启用</li><li>false：未启用。</li></ul> |
| utc | 必需 | Number | 自 Epoch（1970 年 1 月 1 日 UTC 午夜）以来的毫秒数，也称为 Unix 时间。 |
| [localtime](#localtime) | 必需 | Object | 包含当前系统时间信息的对象。 |
| offset | 必需 | Number | 距 UTC 的分钟数。对于 UTC 以西的时区为负数，对于 UTC 以东的时区为正数。 |
| timezone | 必需 | String | 当前系统时区。其格式与 **TZ** 环境变量相同。有关信息，请访问 [http://www.gnu.org/software/libc/manual/html_node/TZ-Variable.html](http://www.gnu.org/software/libc/manual/html_node/TZ-Variable.html)。 |
| TZ | 必需 | String | 包含标准 Unix 格式的时区缩写，例如 PDT（代表 Pacific Daylight Time，太平洋夏令时间）。该 timezone 对应于系统的当前时区。 |
| timeZoneFile | 必需 | String | 当前所设置时区的 Linux zone 信息文件。有关更多信息，请访问 [http://linux.die.net/man/5/tzfile](http://linux.die.net/man/5/tzfile)。 |
| NITZValid | 必需 | String | 已弃用。此前它用于提醒 UI 该方法是否使用 NITZ 正确设置了时间。目前，它不再指示任何有意义的信息。 |

#### Subscription return（订阅返回）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| utc | 必需 | Number | 自 Epoch（1970 年 1 月 1 日 UTC 午夜）以来的毫秒数，也称为 Unix 时间。 |
| [localtime](#localtime) | 必需 | Object | 包含当前系统时间信息的对象。 |
| offset | 必需 | Number | 距 UTC 的分钟数。对于 UTC 以西的时区为负数，对于 UTC 以东的时区为正数。 |
| timezone | 必需 | String | 当前系统时区。其格式与 **TZ** 环境变量相同。有关信息，请访问 [http://www.gnu.org/software/libc/manual/html_node/TZ-Variable.html](http://www.gnu.org/software/libc/manual/html_node/TZ-Variable.html)。 |
| TZ | 必需 | String | 包含标准 Unix 格式的时区缩写，例如 PDT（代表 Pacific Daylight Time，太平洋夏令时间）。该 timezone 对应于系统的当前时区。 |
| timeZoneFile | 必需 | String | 当前所设置时区的 Linux zone 信息文件。有关更多信息，请访问 [http://linux.die.net/man/5/tzfile](http://linux.die.net/man/5/tzfile)。 |
| NITZValid | 必需 | String | 已弃用。此前它用于提醒 UI 该方法是否使用 NITZ 正确设置了时间。目前，它不再指示任何有意义的信息。 |
| NITZValidTime | 可选 | String | 指示已使用 NITZ 正确设置了一个有效的时间。之所以需要此值，是因为有时时区可能会先于时间收到。 |
| NITZValidZone | 可选 | String | 指示已使用 NITZ 正确设置了一个有效的时区。之所以需要此值，是因为有时时间可能会先于时区收到。 |

### Example（示例）

```javascript
// One-time call
	var request = webOS.service.request('luna://com.palm.systemservice', {
	  method: 'time/getSystemTime',
	  parameters: { subscribe: false },
	  onSuccess: function (inResponse) {
		console.log('Result: ' + JSON.stringify(inResponse));
		// To-Do something
	  },
	  onFailure: function (inError) {
		console.log('Failed to get system time information');
		console.log('[' + inError.errorCode + ']: ' + inError.errorText);
		// To-Do something
		return;
	  },
	});
	
	// Subscription
	var subscriptionHandle;
	
	subscriptionHandle = webOS.service.request('luna://com.palm.systemservice', {
	  method: 'time/getSystemTime',
	  parameters: { subscribe: true },
	  onSuccess: function (inResponse) {
		if (!inResponse.subscribed) {
		  console.log('Failed to subscribe the system time information');
		  return;
		}
	
		console.log('Result: ' + JSON.stringify(inResponse));
		// To-Do something
	  },
	  onFailure: function (inError) {
		console.log('Failed to get system time information');
		console.log('[' + inError.errorCode + ']: ' + inError.errorText);
		// To-Do something
		return;
	  },
	});
	...
	// If you need to unsubscribe the data, use cancel() method as below
	subscriptionHandle.cancel();
```

### Return example（返回示例）

```javascript
{
  "timeZoneFile": "/var/luna/preferences/localtime",
  "utc": 1418745990,
  "localtime": {
    "month": 12,
    "day": 16,
    "hour": 11,
    "minute": 6,
    "year": 2014,
    "second": 30
  },
  "offset": -300,
  "timezone": "Asia/Seoul",
  "TZ": "EST",
  "systemTimeSource": "sdp"
}
```

### See also（另请参阅）

无

## Object

### LocalTime object（LocalTime 对象）

此对象提供当前系统时间的详细信息。

```javascript
{
  "year": number,
  "month": number,
  "dayOfWeek": number,
  "day": number,
  "hour": number,
  "minute": number,
  "second": number
} 
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| year | 必需 | Number | 年 |
| month | 必需 | Number | 月（1-12） |
| dayOfWeek | 可选 | Number | 星期几（0 - 6） |
| day | 必需 | Number | 日（1 - 31） |
| hour | 必需 | Number | 时（0 - 23） |
| minute | 必需 | Number | 分（0 - 59） |
| second | 必需 | Number | 秒（0 - 59，闰秒时为 60） |
