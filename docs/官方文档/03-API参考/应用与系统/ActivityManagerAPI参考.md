# Activity Manager API 参考
> 原文链接: https://webostv.developer.lge.com/develop/references/activity-manager ｜ 简体中文翻译

**Service URI - luna://com.palm.activitymanager**

监控系统的各个组成部分，并在相应事件发生时启动服务。Activity 还可用于安排工作，既可以周期性地执行，也可以在特定时间执行。

Activity Manager 负责协调系统中的工作，包括当前正在执行的工作，以及计划在未来某个时间点执行的工作。控制的基本单元是 Activity，它代表系统中的某个具体工作项——例如同步一个电子邮件账户，或者正在运行的一款游戏。Activity Manager 会跟踪哪些 App、Service 以及其他系统资源与特定的 Activity 相关联。Activity Manager 会动态调整这些资源的操作系统优先级，以便优先满足用户当前正在直接交互的 Activity，同时降低与后台 Activity 相关联资源的优先级。这样做的目的是提升系统整体的感知性能。

方法

| 方法 | 描述 | Supported in Emulator |
| --- | --- | --- |
| [adopt](#adopt) | 注册应用或服务接管成为该 Activity 父级的意愿。 | Yes |
| [cancel](#cancel) | 终止指定的 Activity，并向所有订阅者发送一个<br>`cancel`<br>事件。 | Yes |
| [complete](#complete) | Activity 的父级可以使用此方法结束该 Activity，并可选地以新属性重新启动它 | Yes |
| [create](#create) | 创建一个新的 Activity 并返回其 ID。 | Yes |
| [release](#release) | 允许父级释放一个 Activity 并通知其他订阅者。 | Yes |
| [start](#start) | 尝试启动指定的 Activity | Yes |
| [stop](#stop) | 停止一个 Activity，并向所有 Activity 订阅者发送一个<br>`stop`<br>事件。 | Yes |

## adopt

描述

注册应用或服务接管成为该 Activity 父级的意愿。

如果你的应用可以等待一个不可用、尚未释放的 [Activity](#activity) 变为可用，请将 "wait" 标志设为 true。如果是这种情况，并且该 Activity 有效（即 Activity 存在且未处于退出过程中），那么该调用应当成功。如果无法等待，而该 Activity 有效但无法被收养，那么该调用会失败。返回的 adopted 标志表示收养成功或失败。

如果未能立即被收养并且请求了等待，`orphan` 事件会通知收养者：它们已成为该 Activity 的新父级。

收养机制适用的一个例子是：某应用为一个同步任务分配单独的 Activity，并把该 Activity 传递给某个服务使用。该服务应当收养这个 Activity，并准备好在该应用于同步完成之前退出时接管它。否则，它会收到一个 `cancel` 事件，并应立即退出。该服务应等到 adopt() 调用成功返回后再开始 Activity 的工作。如果收养失败，说明调用方已经退出或关闭了该 Activity，此时不应对该请求进行处理。Service 应继续处理其对该 Activity 的订阅上传来的事件。

如果服务没有调用 adopt() 来向 Activity Manager 表明其接管成为父级的意愿，那么一旦收到 `cancel` 事件，它就应准备好停止该 Activity 的工作并取消订阅。反之，如果它收到 `orphan` 事件，表明原父级已取消订阅、而该服务现在成为父级，那么它应在完成时使用 complete() 通知 Activity Manager，然后再取消订阅。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| activityId | Required | Number | Activity ID。该项与 "activityName" 二者必填其一。 |
| activityName | Required | String | Activity 名称。该项与 "activityId" 二者必填其一。 |
| wait | Required | Boolean | 用于等待 Activity 被释放的标志。 |
| subscribe | Required | Boolean | 决定是否进行订阅的标志。<br>• true：订阅。<br>• false：不订阅。该方法只调用一次。（默认值） |
| detailedEvents | Optional | Boolean | 用于让 Activity Manager 在 Activity 的某个需求状态发生变化时生成<br>`update`<br>事件的标志。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | Optional | Number | 如果方法失败，errorCode 会包含错误码。方法只在失败时返回 errorCode。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |
| errorText | Optional | String | 如果方法失败，errorText 会包含错误文本。方法只在失败时返回 errorText。更多详细信息请参阅该方法的 Error Codes Reference。 |
| adopted | Optional | Boolean | 如果该 Activity 已被收养，则为 True。 |

错误参考

| 错误码 | 错误信息 |
| --- | --- |
| 2 | 没有该文件或目录 |
| 11 | 操作被阻止 |
| 12 | 内存不足 |
| 13 | 权限被拒绝 |
| 17 | 文件已存在 |
| 22 | 无效参数 |
| 38 | 函数未实现 |
| -1000 | 内部错误 |

订阅返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| activityId | Required | Number | 已创建的 Activity ID。当有状态更新时，你可以获得订阅通知。 |
| event | Required | String | 该 Activity 做了什么。如果需求得到满足，Activity Manager 会生成一个<br>`start`<br>事件，然后把该结果返回给订阅者。当 Activity 被取消或停止时同样如此，事件为 "cancel" 或 "stop"。<br>示例：<br>`{ "activityId": 10813, "event": "start", "returnValue": true }` |
| [activity](#activity) | Required | Object | Activity 对象。 |

示例

```javascript
// Adopt an activity
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'adopt',
  parameters: {
    activityId: 90,
    wait: true,
    subscribe: true,
    detailedEvents: false,
  },
  onSuccess: function (inResponse) {
    if (inResponse.event == 'orphan') {
      console.log('The activity has been adopted to current app or service');
      // To-Do something
    } else if (inResponse.adopted) {
      console.log(
        'The activity has been transferred from current app or service to another adopter'
      );
      // To-Do something
    } else if (!inResponse.adopted) {
      console.log(
        'The succeeded to request a activity adoption and start subscription'
      );
    }
  },
  onFailure: function (inError) {
    console.log('Failed to request a activity adoption');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回值示例

```json
// Subscription return: If the parent of the activity did not release the activity. 
// Mostly your app or service will receive this result at first time return.
{
    "adopted": false,
    "returnValue": true
}

// Subscription return: When the activity is released and current app or service adopts the activity.
// Only one adopter receives this result and it becomes the parent of the activity.
// Other adopter candidates remain as adopter continuously. (First in, First out)
{
    "event": "orphan",
    "activityId": 90,
    "returnValue": true
}

// Subscription return: When the activity is transferred to another adopter.
{
    "adopted": true,
    "returnValue": true
}

// Error return
{
    "errorCode": 2,
    "returnValue": false,
    "errorText": "activityId not found"
}
```

另请参阅

- [complete](#complete)
- [create](#create)
- [release](#release)

## cancel

描述

终止指定的 Activity，并向所有订阅者发送一个 `cancel` 事件。如果该 Activity 存在且尚未处于退出过程中，该调用应当成功。它与 stop 方法的不同之处在于：Activity 应当只需要很少的时间或无需时间进行清理。收到 `cancel` 时，它应当立即中止处理任务、执行清理并退出；收到 `stop` 时，它应当在合理的时长内（10-15 秒）完成处理任务。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| activityId | Required | Number | Activity ID。该项与 "activityName" 二者必填其一。 |
| activityName | Required | String | Activity 名称。该项与 "activityId" 二者必填其一。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | Optional | Number | 如果方法失败，errorCode 会包含错误码。方法只在失败时返回 errorCode。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |
| errorText | Optional | String | 如果方法失败，errorText 会包含错误文本。方法只在失败时返回 errorText。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |

错误参考

| 错误码 | 错误信息 |
| --- | --- |
| 2 | 没有该文件或目录 |
| 11 | 操作被阻止 |
| 12 | 内存不足 |
| 13 | 权限被拒绝 |
| 17 | 文件已存在 |
| 22 | 无效参数 |
| 38 | 函数未实现 |
| -1000 | 内部错误 |

示例

```javascript
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'cancel',
  parameters: {
    activityId: 93,
  },
  onSuccess: function (inResponse) {
    console.log('The Activity is canceled');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to cancel the Activity');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回值示例

```json
// Success return
{
    "returnValue": true
}

// Error return
{
    "errorCode": 2,
    "returnValue": false,
    "errorText": "activityId not found"
}
```

另请参阅

- [create](#create)
- [stop](#stop)

## complete

描述

Activity 的父级可以使用此方法结束该 Activity，并可选地以新属性重新启动它。

如果存在其他订阅者，它们会收到一个 `complete` 事件。如果请求了重新启动，该 Activity 会可选地用新的 Callback、Schedule 或 Trigger 数据更新，并回到排队状态。将其中任一属性指定为 false 会彻底移除该属性。对于未指定的任何属性，则使用当前属性。如果该 Activity 是持久化的（在 Type 对象中用 persist 标志指定），则会在 Call 返回之前更新 db8 数据库。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| activityId | Required | Number | Activity ID。该项与 "activityName" 二者必填其一。 |
| activityName | Required | String | Activity 名称。该项与 "activityId" 二者必填其一。 |
| restart | Optional | Boolean | 重新启动 Activity 的标志。默认值为 false。 |
| [callback](#callback) | Optional | Object | 如果 Activity 被重新启动，则使用该回调。 |
| [schedule](#schedule) | Optional | Object | 如果 Activity 被重新启动，或仅将其设为 false 时使用。 |
| [trigger](#trigger) | Optional | Object | 如果 Activity 被重新启动，则使用该触发器。 |
| metadata | Optional | Object | 如果提供了 Metadata，或仅将其设为 false 时使用。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | Optional | Number | 如果方法失败，errorCode 会包含错误码。方法只在失败时返回 errorCode。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |
| errorText | Optional | String | 如果方法失败，errorText 会包含错误文本。方法只在失败时返回 errorText。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |

错误参考

| 错误码 | 错误信息 |
| --- | --- |
| 2 | 没有该文件或目录 |
| 11 | 操作被阻止 |
| 12 | 内存不足 |
| 13 | 权限被拒绝 |
| 17 | 文件已存在 |
| 22 | 无效参数 |
| 38 | 函数未实现 |
| -1000 | 内部错误 |

订阅返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| activityId | Required | Number | 已创建的 Activity ID。当有状态更新时，你可以获得订阅通知。 |
| event | Required | String | 该 Activity 做了什么。如果需求得到满足，Activity Manager 会生成一个<br>`start`<br>事件，然后把该结果返回给订阅者。当 Activity 被取消或停止时同样如此，事件为<br>`cancel`<br>或<br>`stop`<br>。<br>示例：<br>`{ "activityId": 10813, "event": "start", "returnValue": true }` |
| [activity](#activity) | Required | Object | Activity 对象。 |

示例

```javascript
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'complete',
  parameters: {
    activityId: 94,
  },
  onSuccess: function (inResponse) {
    console.log('The Activity is completed');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to complete the Activity');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回值示例

```json
// Success return
{
  "returnValue": true
}

// Error return
{
  "errorCode": 2,
  "returnValue": false,
  "errorText": "activityId not found"
}
```

另请参阅

- [create](#create)

## create

描述

创建一个新的 Activity 并返回其 ID。

你既可以创建前台 Activity，也可以创建后台 Activity。前台 Activity 一旦满足其指定的先决条件就会立即运行。后台 Activity 的先决条件得到满足后，它会被移入就绪队列，并根据系统资源情况允许有限数量的后台 Activity 运行。默认值为前台。

Activity 可以被安排为在特定时间运行，或在满足特定条件、发生特定事件时运行。你创建并拥有的每个 Activity 都必须具有唯一的名称。若要替换某个已存在的 Activity，请将 "replace" 标志设为 true。这会取消原有的 Activity，并用新的 Activity 替换它。

为了保持 Activity 存活并接收状态更新，父级（以及收养者，如果有的话）必须将 "subscribe" 标志设为 true。对于带有回调且 "subscribe=false" 的 Activity，必须在回调被调用后立即收养该 Activity，该 Activity 才能继续存在。

若要表明该 Activity 已完全初始化并准备好启动，请将 "start" 标志设为 true。带有回调的 Activity 应当在创建时就启动——当先决条件得到满足，并且对于后台的非立即执行 Activity 而言，当它被允许运行时，回调会被调用。

如果 Activity 的创建者还指定了 "subscribe":true，并且为该订阅启用了详细事件，那么 Activity Manager 会在需求满足时生成一个立即的 `start` 事件，或者在该 Activity 由于缺少需求、schedule 或 trigger 对象而尚未准备好启动时生成一个 `update` 事件。这样，创建该 Activity 的 Service 就能判断自己是应当在等待回调期间继续执行，还是在该 Activity 可能还需较长时间才能运行的情况下退出以释放内存。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [activity](#activity) | Required | Object | Activity 对象 |
| subscribe | Optional | Boolean | 用于启用是否订阅的标志。<br>• true：启用订阅<br>• false：不启用订阅（默认值）。 |
| detailedEvents | Optional | Boolean | 用于让 Activity Manager 在该 Activity 的某个需求状态发生变化时生成<br>`update`<br>事件的标志。 |
| start | Optional | Boolean | 立即启动 Activity。当 subscribe 为 false 时，应将该标志设为 true。 |
| replace | Optional | Boolean | 取消 Activity 并替换为同名 Activity 的标志。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | Optional | Number | 如果方法失败，errorCode 会包含错误码。方法只在失败时返回 errorCode。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |
| errorText | Optional | String | 如果方法失败，errorText 会包含错误文本。方法只在失败时返回 errorText。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |
| activityId | Optional | Number | Activity ID |

错误参考

| 错误码 | 错误信息 |
| --- | --- |
| 2 | 没有该文件或目录 |
| 11 | 操作被阻止 |
| 12 | 内存不足 |
| 13 | 权限被拒绝 |
| 17 | 文件已存在 |
| 22 | 无效参数 |
| 38 | 函数未实现 |
| -1000 | 内部错误 |

订阅返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| activityId | Required | Number | 已创建的 Activity ID。当有状态更新时，你可以获得订阅通知。 |
| event | Required | String | 该 Activity 做了什么。如果需求得到满足，Activity Manager 会生成一个<br>`start`<br>事件，然后把该结果返回给订阅者。当 Activity 被取消或停止时同样如此，事件为<br>`cancel`<br>或<br>`stop`<br>。<br>示例：<br>`{ "activityId": 10813, "event": "start", "returnValue": true }` |
| [activity](#activity) | Required | Object | Activity 对象 |

示例

```javascript
// Create a basic activity
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'create',
  parameters: {
    activity: {
      name: 'basicactivity',
      description: 'Test create',
      type: {
        foreground: true,
      },
    },
    start: true,
    subscribe: true,
  },
  onSuccess: function (inResponse) {
    if (!inResponse.event) {
      console.log('The Activity is created');
      // To-Do something
    } else {
      console.log('Received event: ' + inResponse.event);
      // To-Do something
    }
  },
  onFailure: function (inError) {
    console.log('Failed to create the Activity');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});

// Create a scheduled activity
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'create',
  parameters: {
    activity: {
      name: 'ScheduledActivity',
      description: 'Test create of scheduled activity',
      type: {
        foreground: true,
      },
      schedule: {
        start: '2015-02-15 13:22:00',
      },
    },
    start: true,
    subscribe: true,
  },
  onSuccess: function (inResponse) {
    if (!inResponse.event) {
      console.log('The scheduled Activity is created');
      // To-Do something
    } else {
      console.log('Received event: ' + inResponse.event);
      // To-Do something
    }
  },
  onFailure: function (inError) {
    console.log('Failed to create the Activity');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});

// Create a scheduled activity with callback
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'create',
  parameters: {
    activity: {
      name: 'ScheduledActivityWithCallback',
      description: 'Test create of scheduled activity with callback',
      type: {
        foreground: true,
      },
      schedule: {
        start: '2015-02-15 00:05:00',
      },
      callback: {
        method: 'luna://com.webos.audio/setMuted',
        params: {
          muted: 'true',
        },
      },
    },
    start: true,
    subscribe: true,
  },
  onSuccess: function (inResponse) {
    if (!inResponse.event) {
      console.log('The scheduled Activity is created');
      // To-Do something
    } else {
      console.log('Received event: ' + inResponse.event);
      console.log('Audio will be muted');
      // To-Do something
    }
  },
  onFailure: function (inError) {
    console.log('Failed to create the Activity');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});

// Create a triggered activity with callback
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'create',
  parameters: {
    activity: {
      name: 'triggeredActivity',
      description: 'Test create Activity with Trigger',
      type: {
        background: true,
      },
      trigger: {
        method: 'luna://com.palm.connectionmanager/getStatus',
        params: { subscribe: true },
      },
      callback: {
        method: 'luna://com.webos.applicationManager/launch',
        params: {
          id: 'com.yourdomain.app.downloader',
        },
      },
    },
    start: true,
    subscribe: true,
  },
  onSuccess: function (inResponse) {
    if (!inResponse.event) {
      console.log('The scheduled Activity is created');
      // To-Do something
    } else {
      console.log('Received event: ' + inResponse.event);
      console.log('Audio will be muted');
      // To-Do something
    }
  },
  onFailure: function (inError) {
    console.log('Failed to create the Activity');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回值示例

```json
// Success return - First return (When activity is created)
{
  "activityId": 83,
  "returnValue": true
}

// Success return - When activity starts
{
  "event": "start",
  "activityId": 83,
  "returnValue": true
}

// Error return
{
  "errorCode": 22,
  "returnValue": false,
  "errorText": "invalid parameters: caller=' error='required property not found - 'activity'"
}
```

另请参阅

- [adopt](#adopt)

## release

描述

允许父级释放一个 Activity 并通知其他订阅者。除非该 Activity 的某个非父级订阅者收养它并成为新的父级，否则该 Activity 会被取消。该 Activity 会被立即取消。为了实现完全安全的移交，订阅该 Activity 的应用或服务应当在释放之前就已调用 adopt 方法，表明其接管成为父级的意愿。

语法

release(Number activityId, String activityName)

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| activityId | Required | Number | Activity ID。该项与 "activityName" 二者必填其一。 |
| activityName | Required | String | Activity 名称。该项与 "activityId" 二者必填其一。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | Optional | Number | 如果方法失败，errorCode 会包含错误码。方法只在失败时返回 errorCode。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |
| errorText | Optional | String | 如果方法失败，errorText 会包含错误文本。方法只在失败时返回 errorText。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |

错误参考

| 错误码 | 错误信息 |
| --- | --- |
| 2 | 没有该文件或目录 |
| 11 | 操作被阻止 |
| 12 | 内存不足 |
| 13 | 权限被拒绝 |
| 17 | 文件已存在 |
| 22 | 无效参数 |
| 38 | 函数未实现 |
| -1000 | 内部错误 |

示例

```javascript
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'release',
  parameters: {
    activityId: 98,
  },
  onSuccess: function (inResponse) {
    console.log('The Activity is released');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to release the Activity');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回值示例

```json
// Success return
{
  "returnValue": true
}

// Error return
{
  "errorCode": 2,
  "returnValue": false,
  "errorText": "activityId not found"
}
```

另请参阅

- [adopt](#adopt)
- [create](#create)

## start

描述

尝试启动指定的 Activity，既可以把它从 "init" 状态移出使其具备运行资格，也可以在它当前处于暂停状态时恢复它。当该 Activity 被允许开始时，会向所有已订阅的监听者发送 `start` 事件。如果存在 "force" 参数（且为 true），为了释放该 Activity 运行所需的资源，其他 Activity 可能会被取消。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| activityId | Required | Number | Activity ID。该项与 "activityName" 二者必填其一。 |
| activityName | Required | String | Activity 名称。该项与 "activityId" 二者必填其一。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | Optional | Number | 如果方法失败，errorCode 会包含错误码。方法只在失败时返回 errorCode。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |
| errorText | Optional | String | 如果方法失败，errorText 会包含错误文本。方法只在失败时返回 errorText。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |

错误参考

| 错误码 | 错误信息 |
| --- | --- |
| 2 | 没有该文件或目录 |
| 11 | 操作被阻止 |
| 12 | 内存不足 |
| 13 | 权限被拒绝 |
| 17 | 文件已存在 |
| 22 | 无效参数 |
| 38 | 函数未实现 |
| -1000 | 内部错误 |

示例

```javascript
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'start',
  parameters: {
    activityId: 93,
  },
  onSuccess: function (inResponse) {
    console.log('The Activity is started');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to start the Activity');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回值示例

```json
// Success return
{
  "returnValue": true
}

// Error return
{
  "errorCode": 2,
  "returnValue": false,
  "errorText": "activityId not found"
}
```

另请参阅

- [create](#create)

## stop

描述

停止一个 Activity，并向所有 Activity 订阅者发送一个 `stop` 事件。除非该 Activity 已经被取消，否则该操作会成功。

它与 cancel 方法的不同之处在于：允许该 Activity 有更多时间进行清理。收到 `cancel` 时，它应当立即中止处理任务、执行清理并退出。收到 `stop` 时，它应当在合理的时长内（10-15 秒）完成处理任务。

参数

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| activityId | Required | Number | Activity ID。该项与 "activityName" 二者必填其一。 |
| activityName | Required | String | Activity 名称。该项与 "activityId" 二者必填其一。 |

调用返回值

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 表示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | Optional | Number | 如果方法失败，errorCode 会包含错误码。方法只在失败时返回 errorCode。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |
| errorText | Optional | String | 如果方法失败，errorText 会包含错误文本。方法只在失败时返回 errorText。<br>更多详细信息请参阅该方法的 Error Codes Reference。 |

错误参考

| 错误码 | 错误信息 |
| --- | --- |
| 2 | 没有该文件或目录 |
| 11 | 操作被阻止 |
| 12 | 内存不足 |
| 13 | 权限被拒绝 |
| 17 | 文件已存在 |
| 22 | 无效参数 |
| 38 | 函数未实现 |
| -1000 | 内部错误 |

示例

```javascript
var request = webOS.service.request('luna://com.palm.activitymanager', {
  method: 'stop',
  parameters: {
    activityId: 93,
  },
  onSuccess: function (inResponse) {
    console.log('The Activity is stopped');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to stop the Activity');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

返回值示例

```json
// Success return
{
  "returnValue": true
}

// Error return
{
  "errorCode": 2,
  "returnValue": false,
  "errorText": "activityId not found"
}
```

另请参阅

- [cancel](#cancel)
- [create](#create)

## Object

### Activity 对象

表示关于一个 Activity 的一切——名称、类型、状态、需求、schedule、trigger、callback、id、创建者、收养者、进程、流程以及关联关系。

```json5
{
    //**The following are Activity creator specified attributes.
    "name" : string,
    "description" : string,
    "type" : Type object,
    "schedule" : Schedule object,
    "trigger" : Trigger object,
    "callback" : Callback object,

    //**The following are AM maintained read-only attributes.
    "metadata" : any object,
    "activityId" : int,
    "creator" : Parent object,
    "parent" : Parent object,
    "adopters" : Parent object array,
    "state" : State object,
    "focused" : boolean
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | Required | String | Activity 名称。对于同一个创建者而言它必须唯一。对持久化和非持久化 Activity 均适用。如果该字段不唯一，create 调用会失败，除非 "replace" 字段为 true。 |
| description | Required | String | Activity 描述。 |
| [type](#type) | Required | Object | 表示该 Activity 的处理方式。主要用于将该 Activity 标记为前台或后台，以及它是否可以被暂停或取消。 |
| [schedule](#schedule) | Optional | Object | 针对 Activity 的基于时间的需求。 |
| [trigger](#trigger) | Optional | Object | 该 Activity 运行所必须发生的事件。 |
| [callback](#callback) | Optional | Object | Activity 运行时调用的回调。当 Activity 需要立即启动时，应定义该对象。 |
| metadata | Optional | Object | Activity Manager 存储并在回调参数中返回的不透明对象。 |
| activityId | Optional | Number | Activity ID |
| [creator](#parent) | Optional | Object | Activity 创建者（parent 对象） |
| [parent](#parent) | Optional | Object | Activity 父级 |
| [adopters](#parent) | Optional | Object array | Activity 收养者（parent 对象数组） |
| state | Optional | String | Activity 状态。表示当前 activity 状态的属性，取值如下：<br>• init：Activity 已创建，正在等待 Activity 的关联关系以及初始的应用和服务订阅就位。<br>• waiting：Activity 正在等待 trigger 触发，或等待其排定的开始运行时间。<br>• blocked：Activity 正在等待其指定的 Requirements 得到满足。<br>• queued：该 Activity 已排队，准备运行。<br>• running：该 Activity 正在运行。<br>• pause：该 Activity 已暂停。<br>• canceling：该 Activity 已被取消，正在等待潜在的收养者接管成为父级。<br>• canceled：该 Activity 已被取消。<br>• stopping：该 Activity 正处于停止过程中。<br>• stopped：该 Activity 已停止。<br>• complete：该 Activity 已完成并已停止。 |
| focused | Optional | Boolean | 表示 Activity 是否已获得焦点的标志。 |

### Callback 对象

回调允许服务在等待 Activity 于设定时间启动或等待 trigger 触发期间停止运行并释放资源。当 Activity 开始时，回调会被调用，服务便可以恢复运行。回调规范由一个 method 和若干参数组成。带有回调的 Activity 应当立即启动。当先决条件得到满足，并且对于后台/非立即执行的 Activity 而言它被允许运行时，Activity Manager 会调用该回调。

```json
{
  "method" : string,
  "params" : any
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| method | Required | String | 回调 URI。 |
| params | Optional | Any | 要传递给回调的任意参数。 |

### Schedule 对象

Schedule 对象定义 Activity 基于时间的需求。Activity 计划运行的时间既可以是绝对时间，也可以是本地时间。如果指定的是本地时间，Activity Manager 会监测时区变化并自动调整 UTC。

使用 interval 字段指定的 *Smart Intervals* 允许以均匀对齐的批次来安排任务，从而优化电池电量和效率。Smart Intervals 通过 interval 字符串字段指定，格式为 "##d##h##m##s"。天（d）、小时（h）、分钟（m）和秒（s）必须按该顺序指定，但任何一项都可以省略。24 小时 Activity 时隙会对齐到本地时间午夜至凌晨 2 点之间的一个随机时间点（每次设备启动时确定），以避免在午夜时分造成过多的服务器访问。如果并不需要精确的间隔，建议你使用该功能。Smart Intervals 必须指定为天数的偶数倍、1、3、6 或 12 小时的间隔，以及 5、10 或 15 分钟的间隔。该间隔上的所有任务都会对齐在大致相同的时间。

如果指定了额外的 Requirements，或者某个 Trigger 尚未触发，启动可能会被延迟。

大多数计划执行的 Activity 都应当是后台 Activity。

重要

所有字段都是可选的，但你必须指定 "start" 或 "interval" 其中之一。不以 Z 结尾的 UTC 字符串会被解释为本地时间。

```json
{
  "precise" : boolean,
  "start" : string,
  "interval" : string,
  "skip" : boolean,
  "local" : boolean,
  "end" : string,
  "relative" : boolean,
  "lastFinished" : string
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| precise | Required | Boolean | 表示该间隔按照精确指定的开始时间发生，并在其后每隔给定的间隔发生一次。 |
| start | Required | String | 启动时间。时间格式是 ISO 8601 的子集："YYYY-MM-DD HH:MM:SS"（本地时间）或 "YYYY-MM-DD HH:MM:SSZ" 表示<br>[UTC](http://www.nhc.noaa.gov/aboututc.shtml)<br>。对于基本的计划项，该字段是必需的；对于间隔，它是可选的。 |
| interval | Optional | String | 指定 Activity 两次执行之间的天数、小时数、分钟数和秒数——"##d##h##m##s"。如果设置了该字段，那么在 Activity 被标记为 Complete 之后，它会以新的开始时间重新入队。天、小时、分钟和秒必须按该顺序指定，但任何一项都可以省略。 |
| skip | Optional | Boolean | 如果某个间隔型 Activity 无法运行，例如在计划启动时设备处于关机状态，那么它（默认情况下）会在第一个机会出现时运行。但是，如果 skip 为 true，它会等到下一个计划间隔时间到来后再运行。 |
| local | Optional | Boolean | 表示不以 'Z' 结尾的日期/时间属于本地时间。一旦默认情况下不以 'Z' 结尾的时间都被解释为本地时间，该属性就不再必要。 |
| end | Optional | String | 该间隔的结束日期/时间。 |
| relative | Optional | Boolean | 表示该间隔按照上一次 activity 的完成时间发生。上一次 activity 的完成时间被设为该间隔的基准时间。初始化需要提供开始时间。因此，该属性在 precise 属性为 true 时可用。 |
| lastFinished | Optional | Boolean | 上次完成时间。时间格式是 ISO 8601 的子集："YYYY-MM-DD HH:MM:SS"（本地时间）或 "YYYY-MM-DD HH:MM:SSZ" 表示<br>[UTC](http://www.nhc.noaa.gov/aboututc.shtml)<br>。 |

### Trigger 对象

带有 Trigger 的 Activity 在一个订阅方法上发生事件之前不会变为可运行状态。此外，在该 Activity 可运行之前，可能还需要满足其他需求或安排约束。当该 Activity 启动时，会以 "subscribe=true" 以及 Activity 创建者提供的任何附加参数来调用指定的方法。如果此前已有另一个 Activity 以完全相同的 Trigger（方法名和参数都相同）被创建并启动，那么 Activity Manager 可能会利用其已有的订阅来监测触发事件，除非 Trigger 规范中的 "unique" 为 true。

如果 Trigger 规范中包含 "key" 属性，Activity Manager 会查找对 Trigger 方法调用的响应中是否包含所指定的 "key" 属性。当看到包含该属性的响应时（包括初始响应），Trigger 就会触发。如果 Trigger 方法返回错误结果——无论是初始调用结果还是任何后续结果——Trigger 同样会触发。如果未指定 "key" 属性，则 Trigger 会在初始成功响应之后的第一个响应上触发。

"key" 属性的一个例子是 db8 在通知中返回的 "fired" 属性，该通知表示 *watched* 查询结果已发生变化。

Trigger 不是 "持久化订阅"。在导致其触发的那个响应被看到之后，该 Trigger 就会取消订阅。

Trigger 会在任何错误返回结果上触发。一旦触发，该 Trigger 就会被取消订阅。如果需要新的 Trigger，你的应用应当创建一个新的 Activity。

重要

不要

**忽略**

回调中返回的 trigger 信息。如果为 Trigger 指定的方法返回错误，那么 Trigger 会立即触发。例如，传递给该方法的参数无效或错误时就可能发生这种情况。如果 Trigger 回调重新启动了该 Activity，也就是说在 db8 watch 的情况下，那么就有可能形成无限循环。请务必检查错误。

<br>

请保持 "key"、"compare" 和 "where" 属性之间的互斥性。它们彼此不兼容。

```json
{
  "method" : string,
  "key" : string,
  "params" : object,
  "where" : string or array of strings,
  "compare" : {
    "key": string,
    "value": number or string
  }
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| method | Required | String | 回调方法的名称。 |
| params | Optional | Object | 用于订阅或 watch 的参数。 |
| where | Optional | Object | 单个 db8 where 子句，或 db8 where 子句的数组。 |
| compare | Optional | Object | 包含 key 和 value 属性的对象。带 key 的 trigger 查询会将旧值与指定的 value 进行比较。 |
| key | Optional | String | Key 属性名。Activity Manager 会在回调响应中查找该字段，例如 db8 watch 中表示查询结果已发生变化的 "fired"。 |

### Type 对象

表示该 Activity 的处理方式。主要用于将该 Activity 标记为前台或后台，以及它是否可以被暂停或取消。

#### 前台或后台

后台和前台 Activity 各自关联着默认属性：

- **Foreground Activities** 具有 *高* 优先级且是 *立即执行* 的——它们不能被排队，先决条件一满足就开始运行。
- **Background Activities** 具有 *低* 优先级且不是 *立即执行* 的——它们可以运行，但会排队，直到必要的资源变得可用。

一个 activity 是前台还是后台只应设置一次。默认值为前台。如果你的应用指定了 foreground 或 background，请 **不要** 再设置像 "immediate" 和 "priority" 这样的高级属性。如果你设置了它们，Activity Manager 将 **不会** 创建该 Activity。如果你既不设置 foreground 也不设置 background，那么你就 **必须** 设置 "immediate" 和 "priority"。

#### 优先级

如果你的 Activity 性能至关重要，例如 3D 游戏——无法跟上期望的帧率会非常明显——请使用 "high" 或 "highest" 优先级。普通的交互式 UI Activity 应使用 "normal"。如果立即显示对你的应用并不关键，例如电子邮件同步，那么 "low" 优先级是合适的，因为用户并不一定期望在点击 'sync' 按钮后邮件立刻出现，所以稍微多花一点时间也没问题。此外，只有在设备还有其他事情要做时才会出现延迟；如果你的 Activity 是唯一在运行的东西，它就能获得所需的全部 CPU。

#### Probe Activity

如 "probe" 标志所示，*probe* Activity 是一种不影响资源的 Activity，它允许许多个并行运行，而不是串行运行。当你需要更复杂的逻辑来判断某个 Activity 能否继续时，可以使用它。把 probe Activity 交给 Activity Manager 进行调度，然后结束该 probe。例如，某个电子邮件同步应用或服务可能想先看看是否有邮件需要同步。假设有 10 个电子邮件账户。建立连接、登录协商以及等待服务器响应可能需要 15-30 秒。如果按顺序执行，要发现所有账户中是否有邮件需要同步将花费 5 分钟。这其中的大部分时间都在等待，因此占用的 CPU 极少。而且它们很可能由同样的少数几个服务来实现，所以就内存占用而言，做五个大概和做一个的代价相当。在这种情况下，更好的做法是让它们并行运行，找出哪些账户有邮件需要同步，然后再专门创建新的后台 Activity 来同步每个有邮件的账户。

#### Persistent Activity

如果 "persist" 为 true，该 Activity 会跨设备重启而持续存在。这些 Activity 会被原子性地更新，并在版本更新以及设备或服务崩溃后重新调度。但请注意，Activity Manager 无法看到你的 activity 实际在做什么，因此如果你的应用正在响应某个已触发的 activity 做某件事，Activity Manager 对此并不知情。换句话说，activity 的状态（例如 "paused"）不会被保存；实际发生的是 activity 规范被重新加载，就好像你刚刚为它调用了 "create" 一样。

#### Explicit Activity

如果 "explicit" 为 true，该 Activity 只能通过 stop、cancel 或 complete 调用终止。如果某个 explicit Activity 的父级取消订阅，并且没有其他可用的收养者，那么该 Activity 不会被取消（默认行为），而是被移回就绪状态并调用其回调。

#### Schema

重要

所有字段都是可选的，但如果你不设置 "foreground" 或 "background"，那么你必须设置 "immediate" 和 "priority"。

```json
{
  "foreground" : boolean | "background": boolean,
  "immediate" : boolean,
  "priority" : string,
  "userInitiated" : boolean,
  "persist" : boolean,
  "explicit" : boolean,
  "continutous" : boolean,
  "power" : boolean,
  "powerDebounce" : boolean
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| foreground | Optional | Boolean | Activity 在前台运行，并在其先决条件得到满足时开始运行。设置该项或 background，或设置 immediate 和 priority。 |
| background | Optional | Boolean | Activity 在后台运行。当先决条件得到满足时，它会被放入就绪队列，并在系统资源允许时运行。设置该项或 foreground，或设置 immediate 和 priority。 |
| immediate | Optional | Boolean | Activity 应立即运行。设置该项和 priority，或设置 background 或 foreground。 |
| priority | Optional | String | 表示 Activity 的优先级。必须是下列之一："highest"、"high"、"normal"、"low" 或 "lowest"。设置该项和 immediate，或设置 background 或 foreground。 |
| userInitiated | Optional | Boolean | 当前未使用。 |
| persist | Optional | Boolean | 将 Activity 状态存储在 DB 中，使其能够跨重启、服务丢失或更新而保留。 |
| explicit | Optional | Boolean | 除非通过 complete、stop 或 cancel 终止，否则该 Activity 会被重新启动。 |
| continuous | Optional | Boolean | 该 Activity 没有明确定义的结束点，可能无限期运行。 |
| power | Optional | Boolean | 该 Activity 要求设备在其运行期间保持通电。 |
| powerDebounce | Optional | Boolean | 与该 Activity 关联的事件即将结束。设置该标志可避免设备在此期间必须挂起/重启。 |

### Parent 对象

Activity 的 Parent（或潜在父级），以应用 ID 或服务 ID 指定。当应用或服务调用 create 方法或 adopt 方法时，Activity Manager 会自动获取该值。

```json
{
  "appId" : string | "serviceId" : string
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| appId | Optional | String | 应用 ID。必须指定该项或 serviceId。 |
| serviceId | Optional | String | 服务 ID。必须指定该项或 appId。 |
