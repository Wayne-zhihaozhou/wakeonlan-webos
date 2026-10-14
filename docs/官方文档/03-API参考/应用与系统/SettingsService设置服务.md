# Settings Service API 参考
> 原文链接: https://webostv.developer.lge.com/develop/references/settings-service ｜ 简体中文翻译

# Settings Service

**Service URI - luna://com.webos.settingsservice**

提供用于获取系统设置值的方法。

**Methods**

| **Method** | **Description** | **Supported in Emulator** |
| --- | --- | --- |
| [getSystemSettings](#getsystemsettings) | 使用键从系统设置中获取值。 | Yes |

## getSystemSettings

**Description**

使用在参数中以数组形式指定的键，从系统设置中获取值。可用的键如下：

| **Category** | **Key Name** | **Description** | **Type** |
| --- | --- | --- | --- |
| - | localeInfo | 语言、键盘、时区和时钟的区域设置。 | Object |
| option | country | 国家/地区代码（<br>[ISO 3166-1 alpha-3](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3)<br>）。 | String |
| option | smartServiceCountryCode2 | 服务国家/地区代码（<br>[ISO 3166 alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)<br>）。该代码与 LG Apps 服务相关。 | String |
| option | audioGuidance | 指示是否为无障碍菜单启用语音引导。该键在 webOS TV 3.0 或更高版本中可用。 | String |
| caption | captionEnable | 指示是否为无障碍菜单启用隐藏式字幕设置。 | String |
| caption | captionAnalog | 获取 EIA608 标准的 CAPTION 服务。可能的值为："cc1"/"cc2"/"cc3"/"cc4"/"t1"/"t2"/"t3"/"t4" | String |
| caption | captionDigital | 获取 EIA708 标准的 CAPTION 服务。可能的值为："off"/"svc1"/"svc2"/"svc3"/"svc4"/"svc5"/"svc6" | String |
| caption | captionStyle | 获取隐藏式字幕的样式是广播样式还是用户设置样式。可能的值为："auto"/"manual" | String |
| caption | captionSize | 获取隐藏式字幕的大小。可能的值为："small"/"standard"/"large" | String |
| caption | captionFont | 获取隐藏式字幕的字体。可能的值为："font0"/"font1"/"font2"/"font3"/"font4"/"font5"/"font6"/"font7" | String |
| caption | captionTextColor | 获取隐藏式字幕的文字颜色。可能的值为："white"/"black"/"red"/"green"/"blue"/"cyan"/"magenta"/"yellow" | String |
| caption | captionTextOpacity | 获取隐藏式字幕的文字透明度。可能的值为："flash"/"translucent"/"transparent"/"solid" | String |
| caption | captionBgColor | 获取隐藏式字幕的背景颜色。可能的值为："white"/"black"/"red"/"green"/"blue"/"cyan"/"magenta"/"yellow" | String |
| caption | captionBgOpacity | 获取隐藏式字幕的背景透明度。可能的值为："flash"/"translucent"/"transparent"/"solid" | String |
| caption | captionEdgeType | 获取隐藏式字幕的边框样式。可能的值为："none"/"uniform"/"raised"/"depressed"/"left_drop_shadow"/"right_drop_shadow" | String |
| caption | captionEdgeColor | 获取隐藏式字幕的边框颜色。可能的值为："white"/"black"/"red"/"green"/"blue"/"cyan"/"magenta"/"yellow" | String |
| caption | captionWindowColor | 获取隐藏式字幕的窗口颜色。可能的值为："white"/"black"/"red"/"green"/"blue"/"cyan"/"magenta"/"yellow" | String |
| caption | captionWindowOpacity | 获取隐藏式字幕的窗口透明度。可能的值为："translucent"/"transparent"/"solid" | String |

**Parameters**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| category | Optional | String | 设置的类别。<br>• 如果指定的键（key）具有类别，则必须指定该属性。 |
| keys | Optional | String array | 用于获取设置值的键。必须指定 keys 和 key 属性中的其中一个。 |
| key | Optional | String | 用于获取设置值的键。必须指定 keys 和 key 属性中的其中一个。 |
| subscribe | Optional | Boolean | 决定是否订阅的标志。如果启用订阅，当指定设置的值发生变更时，您将收到事件。<br>• true：订阅。<br>• false：不订阅。仅调用该方法一次。（默认值） |

**Remarks**

下表展示了 getSystemSettings 的用例。

| **Case** | **category** | **keys** | **key** | **Description** |
| --- | --- | --- | --- | --- |
| 指定非分类的键 | - | - | "localeInfo" | 返回对应的区域设置值。 |
| 指定类别但不指定键。 | "option" | - | - | 返回错误。 |
| 使用类别名称指定键 | "option" | - | "country" | 返回国家/地区设置值。 |
| 使用错误的类别指定键 | "option" | - | "localeInfo" | 返回错误。 |
| 使用类别名称指定多个键 | "option" | ["country", "smartServiceCountryCode2"] | - | 返回指定的设置。（country 和 samrtServiceCountryCode2） |
| 指定属于不同类别的多个键 | "option" | ["localeInfo", "country"] | - | 返回错误。 |
| 不指定任何内容。 | - | - | - | 返回错误。 |

**Call returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 指示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| errorCode | Optional | String | 如果方法失败，errorCode 包含错误代码。仅当方法失败时才会返回 errorCode。有关详细信息，请参阅该方法的错误代码参考。 |
| errorText | Optional | String | 如果方法失败，errorText 包含错误文本。仅当方法失败时才会返回 errorText。有关详细信息，请参阅该方法的错误代码参考。 |
| category | Optional | String | 结果设置值的类别字符串。它与方法调用中的 category 参数相同。 |
| method | Required | String | 方法名称，用于在订阅消息中表明调用的是哪个方法。 |
| [settings](#settings-object) | Required | Object | 保存结果设置值的对象。 |
| subscribed | Optional | Boolean | 决定是否订阅的标志。<br>• true：订阅<br>• false：不订阅。仅调用该方法一次。（默认值） |

**Remarks**

如果您订阅了多个键，在首次返回时您将收到所有键的结果数据。首次返回之后，当相应的系统信息发生变更时，您将收到每个键各自的结果数据。

**Error reference**

| **Error Text** | **Error Description** |
| --- | --- |
| There is no matched result from DB. | 如果请求的键未定义，API 将返回错误。 |

**Subscription Returns**

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| returnValue | Required | Boolean | 指示请求成功/失败的标志。<br>• true：成功<br>• false：失败 |
| category | Optional | String | 结果设置值的类别字符串。它与方法调用中的 category 参数相同。 |
| method | Required | String | 方法名称，用于在订阅消息中表明调用的是哪个方法。 |
| [settings](SettingsService设置服务.md#settings-object) | Required | Object | 保存结果设置值的对象。 |

**Example**

```javascript
// Get country information
    var request = webOS.service.request('luna://com.webos.settingsservice', {
      method: 'getSystemSettings',
      parameters: {
        category: 'option',
        keys: ['country', 'smartServiceCountryCode2'],
      },
      onSuccess: function (inResponse) {
        console.log('Result: ' + JSON.stringify(inResponse));
        // To-Do something
      },
      onFailure: function (inError) {
        console.log("Failed to get settings' value");
        console.log('[' + inError.errorCode + ']: ' + inError.errorText);
        // To-Do something
        return;
      },
    });
    
    // Get locale information with subscription
    var subscriptionHandle;
    
    subscriptionHandle = webOS.service.request('luna://com.webos.settingsservice', {
      method: 'getSystemSettings',
      parameters: {
        keys: ['localeInfo'],
        subscribe: true,
      },
      onSuccess: function (inResponse) {
        if (typeof inResponse.subscribed != 'undefined') {
          if (!inResponse.subscribed) {
            console.log("Failed to subscribe settings' value");
            return;
          }
        }
    
        console.log('Result: ' + JSON.stringify(inResponse));
        // To-Do something
      },
      onFailure: function (inError) {
        console.log("Failed to get settings' value");
        console.log('[' + inError.errorCode + ']: ' + inError.errorText);
        // To-Do something
        return;
      },
    });
    ...
    
    // Get audio guidance information
    var audioGuidanceRequest = webOS.service.request(
      'luna://com.webos.settingsservice',
      {
        method: 'getSystemSettings',
        parameters: {
          category: 'option',
          keys: ['audioGuidance'],
        },
        onSuccess: function (inResponse) {
          console.log('Result: ' + JSON.stringify(inResponse));
          // To-Do something
        },
        onFailure: function (inError) {
          console.log("Failed to get settings' value");
          console.log('[' + inError.errorCode + ']: ' + inError.errorText);
          // To-Do something
          return;
        },
      }
    );
    
    // Get caption information
    var captionRequest = webOS.service.request('luna://com.webos.settingsservice', {
      method: 'getSystemSettings',
      parameters: {
        category: 'caption',
        keys: ['captionEnable'],
      },
      onSuccess: function (inResponse) {
        console.log('Result: ' + JSON.stringify(inResponse));
        // To-Do something
      },
      onFailure: function (inError) {
        console.log("Failed to get settings' value");
        console.log('[' + inError.errorCode + ']: ' + inError.errorText);
        // To-Do something
        return;
      },
    });
    
    

// Get captionAnalog information
var captionAnalogRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionAnalog"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionDigital information
var captionDigitalRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionDigital"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionStyle information
var captionStyleRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionStyle"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionSize information
var captionSizeRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionSize"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionFont information
var captionFontRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionFont"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionTextColor information
var captionTextColorRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionTextColor"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionTextOpacity information
var captionTextOpacityRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionTextOpacity"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionBgColor information
var captionBgColorRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionBgColor"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionBgOpacity information
var captionBgOpacityRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionBgOpacity"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionEdgeType information
var captionEdgeTypeRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionEdgeType"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionEdgeColor information
var captionEdgeColorRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionEdgeColor"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionWindowColor information
var captionWindowColorRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionWindowColor"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// Get captionWindowOpacity information
var captionWindowOpacityRequest = webOS.service.request(
  "luna://com.webos.settingsservice",
  {
    method: "getSystemSettings",
    parameters: {
      category: "caption",
      keys: ["captionWindowOpacity"],
    },
    onSuccess: function (inResponse) {
      console.log("Result: " + JSON.stringify(inResponse));
      // To-Do something
    },
    onFailure: function (inError) {
      console.log("Failed to get settings' value");
      console.log("[" + inError.errorCode + "]: " + inError.errorText);
      // To-Do something
      return;
    },
  },
);

// If you need to unsubscribe the data, use cancel() method as below
    subscriptionHandle.cancel();
```

**Return example**

```javascript
// Success return - country information
{
    "category": "option",
    "method": "getSystemSettings",
    "settings": {
        "smartServiceCountryCode2": "GB",
        "country": "FRA"
    },
    "returnValue": true
}

// Success return - locale information
{
    "method": "getSystemSettings",
    "settings": {
        "localeInfo": {
            "locales": {
                "UI": "en-GB",
                "TV": "en-GB",
                "FMT": "en-GB",
                "NLP": "en-GB",
                "STT": "fr-FR",
                "AUD": "fr-FR",
                "AUD2": "en-GB"
            },
            "clock": "locale",
            "keyboards": [
                "en"
            ],
            "timezone": "
        }
    },
    "returnValue": true
}

// Success return - audio guidance information
{
    "subscribed": false,
    "category": "option",
    "method": "getSystemSettings",
    "settings": {
        "audioGuidance": "off"
    },
    "returnValue": true
}

// Success return - caption information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionEnable": "off"
    },
    "returnValue": true
}

// Success return - captionAnalog information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionAnalog": "cc1"
    },
    "returnValue": true
}

// Success return - captionDigital information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionDigital": "svc1"
    },
    "returnValue": true
}

// Success return - captionStyle information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionStyle": "auto"
    },
    "returnValue": true
}

// Success return - captionSize information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionSize": "standard"
    },
    "returnValue": true
}

// Success return - captionFont information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionFont": "font0"
    },
    "returnValue": true
}

// Success return - captionTextColor information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionTextColor": "white"
    },
    "returnValue": true
}

// Success return - captionTextOpacity information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionTextOpacity": "solid"
    },
    "returnValue": true
}

// Success return - captionBgColor information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionBgColor": "black"
    },
    "returnValue": true
}

// Success return - captionBgOpacity information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionBgOpacity": "solid"
    },
    "returnValue": true
}

// Success return - captionEdgeType information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionEdgeType": "none"
    },
    "returnValue": true
}

// Success return - captionEdgeColor information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionEdgeColor": "black"
    },
    "returnValue": true
}

// Success return - captionWindowColor information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionWindowColor": "black"
    },
    "returnValue": true
}

// Success return - captionWindowOpacity information
{
    "subscribed": false,
    "category": "caption",
    "method": "getSystemSettings",
    "settings": {
        "captionWindowOpacity": "solid"
    },
    "returnValue": true
}

// Failure return
    {
    "method": "getSystemSettings",
    "returnValue": false,
    "errorText": "There is no matched result from DB"
}
```

**See also**

None

## Object

### settings object

保存来自设置服务的设置值的对象。可包含区域设置和国家/地区设置。

```javascript
{
    "localeInfo": object,
    "smartServiceCountryCode2": String,
    "country": String,
    "audioGuidance": String,
    "captionEnable": String,
    "captionAnalog": String,
    "captionDigital": String,
    "captionStyle": String,
    "captionSize": String,
    "captionFont": String,
    "captionTextColor": String,
    "captionTextOpacity": String,
    "captionBgColor": String,
    "captionBgOpacity": String,
    "captionEdgeType": String,
    "captionEdgeColor": String,
    "captionWindowColor": String,
    "captionWindowOpacity": String
}
```

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| localeInfo | Optional | Object | 保存区域设置值的对象。 |
| smartServicecountryCode2 | Optional | String | 服务国家/地区代码（<br>[ISO 3166-1 alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)<br>）。 |
| country | Optional | String | 国家/地区代码（<br>[ISO 3166-1 alpha-3](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3)<br>）。 |
| audioGuidance | Optional | String | 指示是否启用语音引导。<br>• on：启用语音引导。<br>• off：禁用语音引导。 |
| captionEnable | Optional | String | 指示是否启用隐藏式字幕。<br>• on：启用隐藏式字幕。<br>• off：禁用隐藏式字幕。 |
| captionAnalog | Optional | String | EIA608 标准的 CAPTION 服务。<br>• cc1：设置为 Primary Synchronous Service (CC1)。<br>• cc2：设置为 Special Non-Synchronous Channel (CC2)。<br>• cc3：设置为 Secondary Synchronous Service (CC3)。<br>• cc4：设置为 Special Non-Synchronous Channel (CC4)。<br>• t1：设置为 Text Services(T1)。<br>• t2：设置为 Text Services(T2)。<br>• t3：设置为 Text Services(T3)。<br>• t4：设置为 Text Services(T4)。 |
| captionDigital | Optional | String | EIA708 标准的 CAPTION 服务。<br>• off：未设置 Caption Channel Service。<br>• svc1：设置为 Caption Channel Service(service1)。<br>• svc2：设置为 Caption Channel Service(service2)。<br>• svc3：设置为 Caption Channel Service(service3)。<br>• svc4：设置为 Caption Channel Service(service4)。<br>• svc5：设置为 Caption Channel Service(service5)。<br>• svc6：设置为 Caption Channel Service(service6)。 |
| captionStyle | Optional | String | 隐藏式字幕的样式是设置为广播样式还是用户设置样式。<br>• auto：设置为广播样式。<br>• manual：设置为用户样式。 |
| captionFont | Optional | String | 隐藏式字幕的字体。<br>• font0<br>• font1<br>• font2<br>• font3<br>• font4<br>• font5<br>• font6<br>• font7 |
| captionTextColor | Optional | String | 隐藏式字幕的文字颜色。<br>• white<br>• black<br>• red<br>• green<br>• blue<br>• cyan<br>• magenta<br>• yellow |
| captionTextOpacity | Optional | String | 隐藏式字幕的文字透明度。<br>• flash：隐藏式字幕的文字闪烁。<br>• translucent<br>• transparent<br>• solid：隐藏式字幕的文字不透明。 |
| captionBgColor | Optional | String | 隐藏式字幕的背景颜色。<br>• white<br>• black<br>• red<br>• green<br>• blue<br>• cyan<br>• magenta<br>• yellow |
| captionBgOpacity | Optional | String | 隐藏式字幕的背景透明度。<br>• flash：隐藏式字幕的背景闪烁。<br>• translucent<br>• transparent<br>• solid：隐藏式字幕的背景不透明。 |
| captionEdgeType | Optional | String | 隐藏式字幕的边框样式。<br>• none：未设置边框类型。<br>• uniform<br>• raised<br>• depressed<br>• left_drop_shadow<br>• right_drop_shadow |
| captionEdgeColor | Optional | String | 隐藏式字幕的边框颜色。<br>• white<br>• black<br>• red<br>• green<br>• blue<br>• cyan<br>• magenta<br>• yellow |
| captionWindowColor | Optional | String | 隐藏式字幕的窗口颜色。<br>• black<br>• red<br>• green<br>• blue<br>• cyan<br>• magenta<br>• yellow |
| captionWindowOpacity | Optional | String | 隐藏式字幕的窗口透明度。<br>• flash：隐藏式字幕的窗口闪烁。<br>• translucent<br>• transparent<br>• solid：隐藏式字幕的窗口不透明。 |

### localeInfo object

保存语言、键盘和时间设置的对象。

```javascript
{
    "locales": {
        "UI": String,
        "TV": String,
        "FMT": String,
        "NLP": String,
        "STT": String,
        "AUD": String,
        "AUD2": String
    },
    "clock": String,
    "keyboards": String array,
    "timezone": String
    }
```

| **Name** | **Required** | **Type** | **Description** |
| --- | --- | --- | --- |
| locales | Required | Object | 保存区域设置的对象。每个属性使用<br>[language tag](http://en.wikipedia.org/wiki/IETF_language_tag)<br>，例如 "en_US"。 |
| locales.UI | Required | String | 系统大部分区域中 UI 使用的通用语言。 |
| locales.TV | Required | String | 用于 TV 的语言，例如 OSD（屏幕显示）。 |
| locales.FMT | Required | String | 用于数据格式（例如日期格式和时间格式）的区域设置。 |
| locales.NLP | Required | String | 自然语言处理语言。 |
| locales.STT | Required | String | 语音转文字语言。 |
| locales.AUD | Required | String | 音频语言所用的语言。 |
| locales.AUD2 | Required | String | 第二音频语言所用的语言。 |
| clock | Required | String | 时钟设置有三个可能的值：<br>• "12"<br>• "24"<br>• "locale" |
| keyboards | Required | String array | 为虚拟键盘添加的语言（<br>[language tag](http://en.wikipedia.org/wiki/IETF_language_tag)<br>）<br>• 示例：["en", "ko"] |
| timezone | Required | String | [时区](http://www.iana.org/time-zones)<br>设置值。 |
