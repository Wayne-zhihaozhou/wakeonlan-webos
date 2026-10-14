# DRM 内容播放
> 原文链接: https://webostv.developer.lge.com/develop/guides/drm-content-playback ｜ 简体中文翻译

> **注意**
>
> 本指南介绍 DRM 服务，并提供使用该服务的示例代码。若要使用 Media Source Extensions（MSE，媒体源扩展）实现流媒体播放器，请结合 [Supported Media Formats（支持的媒体格式）](../../04-平台规格/媒体格式/流媒体协议与DRM.md#media-source-extensions) 中所述的 Encrypted Media Extensions（EME，加密媒体扩展）使用。

webOS TV 提供 [DRM 服务](../../03-API参考/DRM与安全/DRM数字版权管理.md) 以支持 DRM 内容播放。DRM 服务管理 DRM Client（DRM 客户端），该客户端持有获取许可证密钥（license key）所需的特定类型信息。播放 DRM 内容时，Media Pipeline（媒体管线，即播放器）需要许可证密钥来进行解密。Media Pipeline 直接从 DRM Client（PlayReady）获取许可证密钥。

webOS TV 支持以下 DRM 类型：

- [PlayReady](DRM内容播放.md#playready)

## PlayReady

在 [PlayReady](https://learn.microsoft.com/en-us/playready/overview/overview) DRM 上，DRM Client 直接使用发起方信息（initiator information）向 DRM License Server（DRM 许可证服务器）请求密钥。Media Pipeline 从 DRM Client 获取许可证密钥。下图展示了 PlayReady DRM 内容播放的操作流程。

![PlayReady 结构图](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914918/webOS-TV/images/docs/guides/PlayReady_Structure_xowcdv.png)

下面介绍上图中各个组件的功能：

- **DRM Service（DRM 服务）**：DRM Service 管理 DRM Client 实例，并提供用于管理 DRM Client 的 API。
- **Web App（Web 应用）**：Web 应用请求 Media Pipeline 播放 DRM 内容，并将 DRM 消息（发起方信息）发送给 DRM Client。
- **DRM Client（DRM 客户端）**：DRM Client 持有发起方信息，并从 License Server 获取许可证密钥。通过 DRM Client 播放内容时可能会发生许可错误（licensing error）。
- **Media Pipeline（媒体管线）**：Media Pipeline 从 DRM Client 获取许可证密钥。Media Pipeline 使用许可证密钥解密 DRM 内容并进行播放。
- **Content Server（内容服务器）**：Content Server 存储并发布 DRM 内容。
- **License Server（许可证服务器）**：License Server 管理权限并返回用于解密的密钥。

以下时序图展示了各组件之间 PlayReady DRM 播放的过程。

![PlayReady 时序图](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914918/webOS-TV/images/docs/guides/PlayReady_Sequence_Diagram_rk7vj6.png)

PlayReady DRM 播放的时序描述如下：

1. Web 应用使用 [load()](../../03-API参考/DRM与安全/DRM数字版权管理.md#load) 方法请求 DRM Service 创建一个 DRM Client。`load()` 方法需要提供 DRM 类型和 App ID（应用 ID）。
2. DRM Service 创建 DRM Client 实例，并通过回调函数将其 ID 返回给 Web 应用。
3. Web 应用使用 [sendDrmMessage()](../../03-API参考/DRM与安全/DRM数字版权管理.md#senddrmmessage) 方法将 DRM 消息交给 DRM Client。该 DRM 消息以 [DRM 消息格式](../../03-API参考/DRM与安全/DRM消息.md) 承载发起方信息。
4. DRM Client 校验 DRM 消息，并通过 `msgId` 返回结果。`msgId` 用于标识 `getRightsError()` 方法的订阅消息。
5. 由于通过 DRM Client 播放内容时可能发生许可错误，Web 应用需要使用 [getRightsError()](../../03-API参考/DRM与安全/DRM数字版权管理.md#getrightserror) 方法订阅许可错误消息。
6. DRM Client 从 License Server 获取许可证密钥。
7. Web 应用通过 video 元素和 [mediaOption 参数](mediaOption参数.md)，将内容目标（content target）、DRM Client ID 以及播放选项交给 Media Pipeline。
8. Media Pipeline 从 DRM Client 获取许可证密钥。
9. Media Pipeline 使用许可证密钥解密 DRM 内容流，并播放解密后的内容流。
10. 由 `getRightsError()` 方法为许可错误消息注册的回调函数会校验该消息，并在内容播放期间处理错误。
11. 在卸载 Web 应用之前，必须使用 [unload()](../../03-API参考/DRM与安全/DRM数字版权管理.md#unload) 方法移除 DRM Client。

许可错误消息会广播给每个已订阅的应用。Web 应用需要通过 `sendDrmMessage()` 方法返回的 `msgId` 来校验有效消息。

> **注意**
>
> 必须在以下情况之前卸载 DRM Client：
>
> - 终止应用时
> - 准备播放其他类型的 DRM 内容时（用于重新初始化）。

要播放 PlayReady DRM 内容，你需要使用 DRM 服务的 LS API 和 mediaOption 参数。你可以按照以下步骤播放 PlayReady DRM 内容：

1. 在应用中添加 webOS 库，以便调用 DRM Service API。

   ```html
   <!-- HTML Code -->
   <script type="text/javascript" src="lib/webOS.js"></script>
   ...
   ```

2. 当应用加载时，调用 [load()](../../03-API参考/DRM与安全/DRM数字版权管理.md#load) 方法。

   ```javascript
   var appId = 'com.yourdomain.yourapp';

   // Define DRM Type
   var drmType = 'playready';
   var clientId;
   var isDrmClientLoaded;

   function loadDrmClient() {
     var request = webOS.service.request('luna://com.webos.service.drm', {
       method: 'load',
       parameters: {
         drmType: drmType,
         appId: appId,
       },
       onSuccess: function (result) {
         clientId = result.clientId;
         isDrmClientLoaded = true;
         console.log('DRM Client is loaded successfully.');
       },
       onFailure: function (result) {
         console.log('[' + result.errorCode + '] ' + result.errorText);
         // Do something for error handling
       },
     });
   }
   ```

3. 使用 [sendDrmMessage()](../../03-API参考/DRM与安全/DRM数字版权管理.md#senddrmmessage) 方法发送 DRM 消息（发起方信息）。

   ```javascript
   // Message example for playready
   var msg = '<?xml version="1.0" encoding="utf-8"?>
   <PlayReadyInitiator xmlns= "http://schemas.microsoft.com/DRM/2007/03/protocols/">
     <LicenseAcquisition>
       <Header>
         <WRMHEADER xmlns= "http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0">
           <DATA>
             <PROTECTINFO>
               <KEYLEN>16</KEYLEN>
               <ALGID>AESCTR</ALGID>
             </PROTECTINFO>
             <LA_URL>http://playready.directtaps.net/pr/svc/rightsmanager.asmx</LA_URL>
             <KID>lFmb2gxg0Cr5bfEnJXgJeA==</KID>
             <CHECKSUM>P7ORpD2IpA==</CHECKSUM>
           </DATA>
         </WRMHEADER>
       </Header>
       <CustomData>AuthZToken XYZ</CustomData>
     </LicenseAcquisition>
   </PlayReadyInitiator>'

   var msgId;

   // Message type for PlayReady
   var msgType = "application/vnd.ms-playready.initiator+xml";

   // Unique ID of DRM system
   var drmSystemId = "urn:dvb:casystemid:19219";

   function sendRightInformation() {
       request = webOS.service.request("luna://com.webos.service.drm", {
           method:"sendDrmMessage",
           parameters: {
               "clientId": clientId,
               "msgType": msgType,
               "msg": msg,
               "drmSystemId": drmSystemId
           },
           onSuccess: function (result) {
               msgId = result.msgId;
               var resultCode = result.resultCode;
               var resultMsg = result.resultMsg;
               console.log("Message ID: " + msgId);
               console.log("[" + resultCode + "] " + resultMsg);

               if (resultCode != 0){
                   // Do Handling DRM message error
               }
           },
           onFailure: function (result) {
               console.log("[" + result.errorCode + "] " + result.errorText);
           }
       });
   }
   ```

   > **注意**
   >
   > 有关 DRM 消息的更多信息，请参阅 [DRM Message（DRM 消息）](../../03-API参考/DRM与安全/DRM消息.md)。

4. 使用 [getRightsError()](../../03-API参考/DRM与安全/DRM数字版权管理.md#getrightserror) 方法订阅许可错误消息。

   ```javascript
   // JavaScript code
   var subscriptionHandler;
   ...
   function subscribeLicensingError() {
       var request = webOS.service.request("luna://com.webos.service.drm", {
           method:"getRightsError",
           parameters: {
               "clientId": clientId,
               "subscribe": true
           },
           onSuccess: function (result) { // Subscription Callback
               contentId = result.contentId;
               if (contentId == msgId) {
                   if ( 0 == result.errorState) {
                       console.log("No license");
                       // Do something for error handling
                   }
                   else if ( 1 == result.errorState) {
                       console.log("Invalid license");
                       // Do something for error handling
                   }
                   console.log("DRM System ID: " + result.drmSystemId);
                   console.log("License Server URL: " + result.rightIssueUrl);
               }
           },
           onFailure: function (result) {
               console.log("[" + result.errorCode + "] " + result.errorText);
           }
       });
       //Register subscription handler
       subscriptionHandler = request;
   }
   ...
   ```

5. 为 video 元素创建一个用于 [mediaOption](mediaOption参数.md) 的对象，并设置播放选项。

   ```html
   <!-- HTML code -->
   <video id="myVideo" ...> </video>
   ```

   ```javascript
   // JavaScript code
   var options = {};
   options.option = {};
   options.option.drm = {};
   options.option.drm.type = drmType;
   options.option.drm.clientId = clientId;
   ```

6. 将创建的对象转换为 JSON 字符串并进行编码。

   ```javascript
   var mediaOption = encodeURIComponent(JSON.stringify(options));
   ```

7. 创建 source 元素。

   ```javascript
   var source = document.createElement('source');
   ```

8. 为创建的 source 元素添加媒体内容所需的属性。将编码后的字符串添加到 type 属性中，如下所示：

   ```javascript
   var dataURL = 'http://example.com/test.mp4';
   source.setAttribute('src', dataURL);
   source.setAttribute('type', 'video/mp4;mediaOption=' + mediaOption);
   ```

   > **注意**
   >
   > 有关媒体类型的更多信息，请参阅 [Platform Specification（平台规范）](../../04-平台规格/00-推荐阅读.md)。

9. 将创建的 source 元素添加到 video 元素或 audio 元素中。

   ```javascript
   video = document.getElementById('myVideo');
   video.appendChild(source);
   ```

10. 在终止应用或准备播放其他类型的 DRM 内容（用于重新初始化）之前，调用 [unload()](../../03-API参考/DRM与安全/DRM数字版权管理.md#unload) 方法并取消订阅。

    ```html
    <!-- HTML Code -->
    ...
    <body onunload="unloadDrmClient()">
    ...
    ```

    ```javascript
    // JavaScript Code
    ...
    function unloadDrmClient() {
        if (isDrmClientLoaded) {
            var request = webOS.service.request("luna://com.webos.service.drm", {
                method:"unload",
                parameters: { "clientId": clientId },
                onSuccess: function (result) {
                    isDrmClientLoaded = false;
                    console.log("DRM Client is unloaded successfully.");
                },
                onFailure: function (result) {
                    console.log("[" + result.errorCode + "] " + result.errorText);
                    // Do something for error handling
                }
            });

            // Cancel the subscription
            subscriptionHandler.cancel();
        }
    }
    ```
