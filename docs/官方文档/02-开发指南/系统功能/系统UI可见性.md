# 系统 UI 可见性
> 原文链接: https://webostv.developer.lge.com/develop/guides/system-ui-visibility ｜ 简体中文翻译

从 webOS TV 3.0 开始，可以通过以下事件检测虚拟键盘和光标的可见性：

- **`keyboardStateChange`**：针对[虚拟键盘](https://webostv.developer.lge.com/develop/guides/virtual-keyboard)的可见性事件。
- **`cursorStateChange`**：针对 [Magic Remote](https://webostv.developer.lge.com/develop/guides/magic-remote) 或 HID 指向设备光标的可见性事件。

你可以通过这些事件在应用中判断光标是否处于开启状态（以便使用 Magic Remote 进行导航），或者你的应用是否拥有焦点并能够接收指针输入。

## 虚拟键盘的可见性

当虚拟键盘出现或消失时，会触发 **`keyboardStateChange`** 事件。它会通过 **`event.detail.visibility`** 属性返回以下值之一：

- true，如果虚拟键盘出现。
- false，如果虚拟键盘消失。

> **注意**
>
> 当按下虚拟键盘上的语音按钮时，**`keyboardStateChange`** 事件会被触发两次。当语音按钮被选中时，虚拟键盘会暂时消失，随后语音 UI 出现。当虚拟键盘消失时，**`keyboardStateChange`** 事件的 visibility 值会从 true 变为 false。过一会儿，当语音 UI 出现时，该值又会变回 true。

以下代码片段展示了如何处理 **`keyboardStateChange`** 事件。

```javascript
function keyboardVisibilityChange(event) {
  var visibility = event.detail.visibility;
  if (visibility) {
    console.log('Virtual keyboard appeared');
    // Do something.
  } else {
    console.log('Virtual keyboard disappeared');
    // Do something.
  }
}
document.addEventListener(
  'keyboardStateChange',
  keyboardVisibilityChange,
  false
);
```

你可以使用下面的代码来检查虚拟键盘的可见性。

```html
<html>
  <head>
    <script>
      function load() {
        document.addEventListener(
          'keyboardStateChange',
          keyboardVisibilityChange,
          false
        );
        var textinput = document.getElementById('text1');
        textinput.addEventListener('input', inputfunc, false);
        textinput.addEventListener('change', inputfunc, false);
        textinput.addEventListener('keypress', keyfunc, false);
        textinput.addEventListener('keyup', keyfunc, false);
        textinput.addEventListener('keydown', keyfunc, false);
      }

      function keyboardVisibilityChange(event) {
        var visibility = event.detail.visibility;
        if (visibility) Log('Virtual keyboard appeared');
        else Log('Virtual keyboard disappeared');
      }

      function inputfunc(event) {
        var x = document.getElementById('text1');
        Log(event.type + ': ' + x.value);
      }

      function keyfunc(event) {
        Log(
          event.type + ': keyCode=' + event.keyCode + ' which=' + event.which
        );
      }

      var line = 0;
      function Log(msg) {
        console.log(msg);
        document.getElementById('log').innerHTML +=
          ++line + ': ' + msg + '<br>';
      }
    </script>
  </head>
  <body onload="load()" style="background-color:black; color:white">
    <input id="text1" type="text" />
    <div id="log"></div>
  </body>
</html>
```

这段代码还包含了按键输入（input、change、keypress、keyup 和 keydown）的事件处理程序。关于每个按键输入事件处理程序的详细信息如下：

- input 事件处理程序：检测文本输入字段中的每一次字符输入。
- change 事件处理程序：检测文本输入字段中的值变化。
- keypress、keyup 和 keydown 事件处理程序：这些通常用于检测按键按下。但是，除了 enter 和 back space 等控制键之外，它们在虚拟键盘上不起作用。因此，在使用虚拟键盘时，上面代码中的 **`keyfunc`** 回调函数将不会生效。

## 光标的可见性

在 webOS TV 2.x 或更高版本上支持 **`cursorStateChange`** 事件。当 Magic Remote 或 HID 指向设备的光标出现或消失时，会触发 **`cursorStateChange`** 事件，并通过 **`event.detail.visibility`** 属性返回以下值之一：

- true，如果光标出现。
- false，如果光标消失。

> **注意：支持的 webOS TV 平台版本**
>
> 在 webOS TV 1.x 上不支持 **`cursorStateChange`** 事件。要检查光标状态，你需要使用 **`keydown`** 事件。以下是光标的键码值（keycode）：
>
> - 1536：cursor_show
> - 1537：cursor_hide

以下代码片段展示了如何处理 **`cursorStateChange`** 事件。

```javascript
function cursorVisibilityChange(event) {
  var visibility = event.detail.visibility;
  if (visibility) {
    console.log('Cursor appeared');
    // Do something.
  } else {
    console.log('Cursor disappeared');
    // Do something.
  }
}
document.addEventListener('cursorStateChange', cursorVisibilityChange, false);
```

你可以使用下面的代码测试光标可见性。这段代码包含额外的事件处理程序：

- **`blur`** 和 **`focus`** 事件处理程序：当你的应用失去或获得焦点时，会触发这些事件。当覆盖型的系统 UI 元素（例如 Launcher 启动器或 Settings 设置菜单）出现时，你的应用无法接收指针事件。为了防止这种情况，你可以使用这些事件来测试你的应用是否拥有焦点。

```html
<html>
  <head>
    <script>
      function load() {
        document.addEventListener('cursorStateChange', onCursor, false);
        document.addEventListener(
          'visibilitychange',
          function () {
            Log(document.visibilityState);
          },
          false
        );
        window.addEventListener(
          'blur',
          function () {
            Log('Focus off');
          },
          false
        );
        window.addEventListener(
          'focus',
          function () {
            Log('Focus on');
          },
          false
        );
      }

      function onCursor(event) {
        if (event.detail.visibility) Log('Cursor on');
        else Log('Cursor off');
      }

      var line = 0;
      function Log(msg) {
        console.log(msg);
        document.getElementById('log').innerHTML +=
          ++line + ': ' + msg + '<br>';
      }
    </script>
  </head>
  <body onload="load()" style="background-color:black; color:white">
    <div id="log"></div>
  </body>
</html>
```
