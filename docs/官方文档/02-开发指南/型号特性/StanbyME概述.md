# StanbyME 概述
> 原文链接: https://webostv.developer.lge.com/develop/guides/stanbyme-overview ｜ 简体中文翻译

基于 webOS TV 6.0 平台的 StanbyME 型号允许用户旋转电视屏幕，并通过触摸来控制显示。作为开发者，你应在应用中实现以下功能，以确保它在 StanbyME 型号上正常工作。

- [竖屏模式（Portrait Mode）](StanbyME竖屏模式.md)
- [触摸屏（Touch Screen）](StanbyME触摸屏.md)

> **Note（注意）**
>
> StanbyME 型号于 2021 年在韩国发布。该型号将在全球范围内发布。

![StanbyME 型号（standbyme-model）](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914918/webOS-TV/images/docs/guides/standbyme-model_s2xrrh.png)

## 注意事项（Considerations）

在为 StanbyME 型号开始开发新应用或修改现有应用之前，你应牢记它与传统 LG 电视设备之间的差异。

### 遥控器单元没有颜色键（No color keys in remote controller unit）

StanbyME 型号的遥控器没有颜色键，因此我们建议你设计应用时不要使用颜色键。尽管用户可以通过菜单设置使用普通电视遥控器，或使用[触摸遥控界面（Touch Remote interface）](StanbyME概述.md#touch-remote-interface)来输入颜色键，但我们仍建议在应用中不要使用颜色键。

### 触摸遥控界面（Touch Remote interface）

对于 StanbyME 型号，我们提供了触摸遥控界面（Touch Remote interface），使用户能够控制不支持触摸事件的应用。

![触摸遥控界面（Touch-remote-interface）](https://res.cloudinary.com/dcsdn4mzr/image/upload/f_auto/q_auto/v1649914919/webOS-TV/images/docs/guides/Touch-remote-interface_dgyie3.png)

触摸遥控界面由以下按钮组成。

| 按钮（Button） | 用途（Usage） |
| --- | --- |
| ![方向键和确定键（Arrow and OK buttons）](https://res.cloudinary.com/dcsdn4mzr/image/upload/c_scale,w_80/v1649914919/webOS-TV/images/docs/guides/Touch_Remote_arrow_ixzis1.webp) | 方向键和确定（OK）键。当用户触摸并按住其中某个按钮时，该按钮的输入会被持续处理。<br><br>- 4 个方向键：移动焦点（Move focus）<br>- OK：选择 / 执行（Select/Execute） |
| ![返回键（Back button）](https://res.cloudinary.com/dcsdn4mzr/image/upload/c_scale,w_40/v1649914918/webOS-TV/images/docs/guides/Touch_Remote_back_d0kfia.webp) | 返回键。此按钮与 Magic Remote 的返回键功能相同。当用户触摸此按钮时，应用会返回上一页。如果没有上一页，则会显示一个询问是否退出应用的弹出窗口。 |
| ![快速设置键（Quick Settings button）](https://res.cloudinary.com/dcsdn4mzr/image/upload/c_scale,w_40/v1649914917/webOS-TV/images/docs/guides/Touch_Remote_settings_zg3br3.webp) | 快速设置键。此按钮执行设置菜单。 |
| ![主页键（Home button）](https://res.cloudinary.com/dcsdn4mzr/image/upload/c_scale,w_40/v1650270833/webOS-TV/images/docs/guides/14283_ggox2i.webp) | 主页键。此按钮使屏幕返回主页屏幕（Home screen）。 |
| ![更多操作键（More actions button）](https://res.cloudinary.com/dcsdn4mzr/image/upload/c_scale,w_40/v1649914918/webOS-TV/images/docs/guides/Touch_Remote_more_kiqj03.webp) | 更多操作键。此按钮执行“更多操作（More Actions）”菜单。 |
| ![颜色键（Color key buttons）](https://res.cloudinary.com/dcsdn4mzr/image/upload/c_scale,w_40/v1649914919/webOS-TV/images/docs/guides/Touch_Remote_colorkey_qycygz.webp) | 颜色键。这些按钮执行由应用自定义的功能。 |

> **Note（注意）**
>
> 触摸遥控界面不支持长按。
