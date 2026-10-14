/**
 * restructure-zh.js
 *
 * 一次性整理脚本（已执行）：
 *   1) 删除与软件开发无关的文档（设计/隐私/法务类）与空目录；
 *   2) 把 develop/ 原始结构与 01~14 编号目录合并成单一中文分类树；
 *   3) 全部文档文件名中文化；
 *   4) 把文档内的官网路径链接（/develop/...）改写成指向本地中文文件；
 *      本地已删除的页面回退为官网绝对地址；
 *   5) 重新生成 README.md 目录。
 *
 * 用法： node tools/restructure-zh.js [--dry]
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

/* ------------------------------------------------------------------ *
 * 1. 旧路径 -> 新路径 映射
 * ------------------------------------------------------------------ */
const M = {};

// --- 01 快速入门（原 develop/getting-started） ---
const GS = 'develop/getting-started/';
M[GS + '00-索引.md'] = '01-快速入门/00-推荐阅读.md';
M[GS + 'app-debugging.md'] = '01-快速入门/应用调试.md';
M[GS + 'app-lifecycle.md'] = '01-快速入门/应用生命周期.md';
M[GS + 'app-resources.md'] = '01-快速入门/应用资源.md';
M[GS + 'app-template.md'] = '01-快速入门/应用模板.md';
M[GS + 'build-your-first-web-app.md'] = '01-快速入门/构建第一个应用.md';
M[GS + 'developer-mode-app.md'] = '01-快速入门/开发者模式应用.md';
M[GS + 'developer-workflow.md'] = '01-快速入门/开发者工作流.md';
M[GS + 'web-app-types.md'] = '01-快速入门/Web应用类型.md';

// --- 02 开发指南（原编号目录 + develop/guides 索引） ---
M['develop/guides/00-索引.md'] = '02-开发指南/00-推荐阅读.md';
M['02-开发者指南/应用生命周期管理.md'] = '02-开发指南/应用基础/应用生命周期管理.md';
M['02-开发者指南/本地化.md'] = '02-开发指南/应用基础/应用本地化.md';
M['03-JavaScript服务/返回按钮.md'] = '02-开发指南/应用基础/返回按钮.md';
M['11-向后兼容性.md'] = '02-开发指南/应用基础/向后兼容性.md';
M['14-ACG指南.md'] = '02-开发指南/应用基础/访问控制组ACG.md';
M['12-Enyo与Enact指南.md'] = '02-开发指南/应用基础/Enyo与Enact指南.md';
M['13-面向webOS的Flutter.md'] = '02-开发指南/应用基础/面向webOS的Flutter.md';
M['03-JavaScript服务/JS服务基础.md'] = '02-开发指南/JavaScript服务/JS服务基础.md';
M['03-JavaScript服务/JS服务使用.md'] = '02-开发指南/JavaScript服务/JS服务使用.md';
M['03-JavaScript服务/JS服务常见问题.md'] = '02-开发指南/JavaScript服务/JS服务常见问题.md';
M['03-JavaScript服务/BLE-GATT.md'] = '02-开发指南/JavaScript服务/BLE-GATT服务.md';
M['04-数据库DB8/DB8基础.md'] = '02-开发指南/数据库DB8/DB8基础.md';
M['04-数据库DB8/DB8使用.md'] = '02-开发指南/数据库DB8/DB8使用.md';
M['04-数据库DB8/DB8常见问题.md'] = '02-开发指南/数据库DB8/DB8常见问题.md';
M['08-DRM内容播放.md'] = '02-开发指南/媒体播放/DRM内容播放.md';
M['09-多声音播放.md'] = '02-开发指南/媒体播放/多声音播放.md';
M['10-mediaOption/mediaOption参数.md'] = '02-开发指南/媒体播放/mediaOption参数.md';
M['10-mediaOption/使用mediaOption快速恢复媒体.md'] = '02-开发指南/媒体播放/使用mediaOption恢复媒体.md';
M['04-数据库DB8/屏幕保护程序.md'] = '02-开发指南/系统功能/屏幕保护程序.md';
M['04-数据库DB8/系统UI可见性.md'] = '02-开发指南/系统功能/系统UI可见性.md';
M['07-应用内购买.md'] = '02-开发指南/系统功能/应用内购买.md';
M['05-StanbyME型号上的应用/StanbyME概述.md'] = '02-开发指南/型号特性/StanbyME概述.md';
M['05-StanbyME型号上的应用/StanbyME竖屏模式.md'] = '02-开发指南/型号特性/StanbyME竖屏模式.md';
M['05-StanbyME型号上的应用/StanbyME触摸屏.md'] = '02-开发指南/型号特性/StanbyME触摸屏.md';
M['06-魔法遥控器动作传感器/动作传感器概述.md'] = '02-开发指南/型号特性/动作传感器概述.md';
M['06-魔法遥控器动作传感器/动作传感器实现.md'] = '02-开发指南/型号特性/动作传感器实现.md';
M['06-魔法遥控器动作传感器/动作传感器数据.md'] = '02-开发指南/型号特性/动作传感器数据.md';

// --- 03 API 参考（原 develop/references） ---
const RF = 'develop/references/';
M[RF + '00-索引.md'] = '03-API参考/00-推荐阅读.md';
M[RF + 'activity-manager.md'] = '03-API参考/应用与系统/ActivityManagerAPI参考.md';
M[RF + 'application-manager.md'] = '03-API参考/应用与系统/ApplicationManager应用管理器.md';
M[RF + 'connection-manager.md'] = '03-API参考/应用与系统/ConnectionManager连接管理器.md';
M[RF + 'system-service.md'] = '03-API参考/应用与系统/SystemService系统服务.md';
M[RF + 'settings-service.md'] = '03-API参考/应用与系统/SettingsService设置服务.md';
M[RF + 'device-unique-id.md'] = '03-API参考/应用与系统/DeviceUniqueID设备唯一标识.md';
M[RF + 'tv-device-information.md'] = '03-API参考/应用与系统/TVDeviceInformation电视设备信息.md';
M[RF + 'webos-event.md'] = '03-API参考/应用与系统/webOS事件.md';
M[RF + 'audio.md'] = '03-API参考/媒体与数据/Audio音频.md';
M[RF + 'camera.md'] = '03-API参考/媒体与数据/Camera摄像头.md';
M[RF + 'database.md'] = '03-API参考/媒体与数据/Database数据库.md';
M[RF + 'media-database.md'] = '03-API参考/媒体与数据/MediaDatabase媒体数据库.md';
M[RF + 'ble-gatt.md'] = '03-API参考/无线与输入/BLEGATT蓝牙服务.md';
M[RF + 'magic-remote.md'] = '03-API参考/无线与输入/MagicRemote魔法遥控器.md';
M[RF + 'drm.md'] = '03-API参考/DRM与安全/DRM数字版权管理.md';
M[RF + 'drm-message.md'] = '03-API参考/DRM与安全/DRM消息.md';
M[RF + 'keymanager3.md'] = '03-API参考/DRM与安全/Keymanager3密钥管理器.md';
M[RF + 'webostvjs-drm-agent.md'] = '03-API参考/DRM与安全/webOSTV.jsDRMAgent指南.md';
M[RF + 'webostvjs-introduction.md'] = '03-API参考/webOSTV.js库/webOSTV.js库简介.md';
M[RF + 'webostvjs-webos.md'] = '03-API参考/webOSTV.js库/webOSTV.js的webOSAPI.md';
M[RF + 'webostvjs-webosdev.md'] = '03-API参考/webOSTV.js库/webOSTV.js的webOSDevAPI.md';
M[RF + 'webostvjs-release-notes.md'] = '03-API参考/webOSTV.js库/webOSTV.js发行说明.md';
M[RF + 'luna-service-introduction.md'] = '03-API参考/webos-service与Luna/LunaServiceAPI简介.md';
M[RF + 'webos-service-introduction.md'] = '03-API参考/webos-service与Luna/webos-serviceAPI简介.md';
M[RF + 'webos-service-reference.md'] = '03-API参考/webos-service与Luna/webos-serviceAPI参考.md';
M[RF + 'appinfo-json.md'] = '03-API参考/配置文件/appinfo.json应用元数据.md';
M[RF + 'services-json.md'] = '03-API参考/配置文件/services.json服务配置.md';

// --- 04 平台规格（原 develop/specifications） ---
const SP = 'develop/specifications/';
M[SP + '00-索引.md'] = '04-平台规格/00-推荐阅读.md';
M[SP + 'web-api-and-web-engine.md'] = '04-平台规格/Web平台/WebAPI与Web引擎.md';
M[SP + 'app-resolution.md'] = '04-平台规格/Web平台/应用分辨率.md';
M[SP + 'tls.md'] = '04-平台规格/Web平台/TLS与根证书.md';
M[SP + 'comparison-netcast.md'] = '04-平台规格/兼容性/与NetCast对比.md';
M[SP + 'streaming-protocol-drm.md'] = '04-平台规格/媒体格式/流媒体协议与DRM.md';
// 版本号命名与官网标题一致：10→1.0、220→22、260→26
const AV_VERSIONS = {
  10: '1.0', 20: '2.0', 30: '3.0', 35: '3.5', 40: '4.0', 45: '4.5', 50: '5.0', 60: '6.0',
  220: '22', 230: '23', 240: '24', 250: '25', 260: '26',
};
for (const [v, label] of Object.entries(AV_VERSIONS)) {
  M[`${SP}video-audio-${v}.md`] = `04-平台规格/媒体格式/webOS TV ${label}音视频格式.md`;
}

// --- 05 开发工具（原 develop/tools） ---
const TL = 'develop/tools/';
M[TL + '00-索引.md'] = '05-开发工具/00-推荐阅读.md';
M[TL + 'sdk-introduction.md'] = '05-开发工具/SDK/SDK简介.md';
M[TL + 'sdk-release-notes.md'] = '05-开发工具/SDK/SDK发行说明.md';
M[TL + 'cli-introduction.md'] = '05-开发工具/命令行工具/webOSCLI简介.md';
M[TL + 'cli-installation.md'] = '05-开发工具/命令行工具/webOSCLI安装.md';
M[TL + 'cli-dev-guide.md'] = '05-开发工具/命令行工具/webOSCLI开发者指南.md';
M[TL + 'cli-release-notes.md'] = '05-开发工具/命令行工具/webOSCLI发行说明.md';
M[TL + 'webos-tv-cli-introduction.md'] = '05-开发工具/命令行工具/webOSTVCLI简介.md';
M[TL + 'webos-tv-cli-installation.md'] = '05-开发工具/命令行工具/webOSTVCLI安装.md';
M[TL + 'webos-tv-cli-dev-guide.md'] = '05-开发工具/命令行工具/webOSTVCLI开发者指南.md';
M[TL + 'webos-tv-cli-release-notes.md'] = '05-开发工具/命令行工具/webOSTVCLI发行说明.md';
M[TL + 'ide-introduction.md'] = '05-开发工具/集成开发环境/IDE简介.md';
M[TL + 'ide-setting-project.md'] = '05-开发工具/集成开发环境/IDE设置项目.md';
M[TL + 'ide-configuring-json-file.md'] = '05-开发工具/集成开发环境/IDE配置JSON文件.md';
M[TL + 'ide-configuring-target.md'] = '05-开发工具/集成开发环境/IDE配置目标设备.md';
M[TL + 'ide-launching-your-app.md'] = '05-开发工具/集成开发环境/IDE启动应用.md';
M[TL + 'ide-debugging-with-inspectors.md'] = '05-开发工具/集成开发环境/IDE使用检查器调试.md';
M[TL + 'ide-useful-tips.md'] = '05-开发工具/集成开发环境/IDE实用技巧.md';
M[TL + 'vsce-introduction.md'] = '05-开发工具/集成开发环境/VSCode扩展简介.md';
M[TL + 'vsce-installation.md'] = '05-开发工具/集成开发环境/VSCode扩展安装.md';
M[TL + 'vsce-dev-guide.md'] = '05-开发工具/集成开发环境/VSCode扩展开发者指南.md';
M[TL + 'vsce-release-notes.md'] = '05-开发工具/集成开发环境/VSCode扩展发行说明.md';
M[TL + 'webos-studio-introduction.md'] = '05-开发工具/webOS Studio/webOSStudio简介.md';
M[TL + 'webos-studio-installation.md'] = '05-开发工具/webOS Studio/webOSStudio安装.md';
M[TL + 'webos-studio-dev-guide.md'] = '05-开发工具/webOS Studio/webOSStudio开发者指南.md';
M[TL + 'webos-studio-faq.md'] = '05-开发工具/webOS Studio/webOSStudio常见问题.md';
M[TL + 'simulator-introduction.md'] = '05-开发工具/模拟器与仿真器/Simulator简介.md';
M[TL + 'simulator-installation.md'] = '05-开发工具/模拟器与仿真器/Simulator安装.md';
M[TL + 'simulator-dev-guide.md'] = '05-开发工具/模拟器与仿真器/Simulator开发者指南.md';
M[TL + 'simulator-release-notes.md'] = '05-开发工具/模拟器与仿真器/Simulator发行说明.md';
M[TL + 'emulator-introduction.md'] = '05-开发工具/模拟器与仿真器/Emulator简介.md';
M[TL + 'emulator-installation.md'] = '05-开发工具/模拟器与仿真器/Emulator安装.md';
M[TL + 'emulator-dev-guide.md'] = '05-开发工具/模拟器与仿真器/Emulator开发者指南.md';
M[TL + 'beanviser-introduction.md'] = '05-开发工具/性能分析工具/Beanviser简介.md';
M[TL + 'beanviser-installation.md'] = '05-开发工具/性能分析工具/Beanviser安装.md';
M[TL + 'beanviser-dev-guide.md'] = '05-开发工具/性能分析工具/Beanviser开发者指南.md';
M[TL + 'beanviser-release-notes.md'] = '05-开发工具/性能分析工具/Beanviser发行说明.md';
M[TL + 'resource-monitor-introduction.md'] = '05-开发工具/性能分析工具/资源监视器简介.md';
M[TL + 'resource-monitor-installation.md'] = '05-开发工具/性能分析工具/资源监视器安装.md';
M[TL + 'resource-monitor-dev-guide.md'] = '05-开发工具/性能分析工具/资源监视器开发者指南.md';
M[TL + 'resource-monitor-release-notes.md'] = '05-开发工具/性能分析工具/资源监视器发行说明.md';
M[TL + 'sublime-introduction.md'] = '05-开发工具/编辑器插件/SublimeText插件简介.md';
M[TL + 'sublime-configuring-webos-tv-plugin.md'] = '05-开发工具/编辑器插件/配置webOSTV插件.md';
M[TL + 'sublime-using-webos-tv-plugin.md'] = '05-开发工具/编辑器插件/使用webOSTV插件.md';
M[TL + 'sublime-updating-and-uninstalling-plugin.md'] = '05-开发工具/编辑器插件/更新与卸载插件.md';
M[TL + 'removal-of-old-webos-tv-sdk.md'] = '05-开发工具/其他/旧版webOSTVSDK的移除.md';

// --- 06 示例应用（原 develop/samples） ---
M['develop/samples/00-索引.md'] = '06-示例应用/示例应用清单.md';

/* ------------------------------------------------------------------ *
 * 2. 需要删除的内容（与软件开发无关）
 * ------------------------------------------------------------------ */
const DELETE_FILES = [
  'develop/tools/privacy-policy-for-app.md', // 应用隐私政策（法务/合规）
];
const DELETE_DIRS = [
  '01-设计指南', // 设计原则、系统 UI、样式、隐私指南（UX/设计/法务，非软件开发）
  'discover', 'distribute', 'faq', 'more', 'news', 'notice', // 官网其他栏目，仓库内为空
];

/* 章节首页标题调整 */
const H1_FIX = {
  '01-快速入门/00-推荐阅读.md': '# 快速入门（Getting Started）',
  '02-开发指南/00-推荐阅读.md': '# 开发指南（Guides）',
  '03-API参考/00-推荐阅读.md': '# API 参考（References）',
  '04-平台规格/00-推荐阅读.md': '# 平台规格（Specifications）',
  '05-开发工具/00-推荐阅读.md': '# 开发工具（Tools）',
  '06-示例应用/示例应用清单.md': '# 示例应用（Samples）',
};

/* ------------------------------------------------------------------ *
 * 辅助函数
 * ------------------------------------------------------------------ */
const abs = (rel) => path.join(ROOT, rel.replace(/\//g, path.sep));
const readUTF8 = (rel) => fs.readFileSync(abs(rel), 'utf8');
const exists = (rel) => fs.existsSync(abs(rel));
const relPath = (fromFile, toFile) => {
  let r = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
  return r.split('/').map((s) => s.replace(/ /g, '%20')).join('/');
};
const rmrf = (rel) => fs.rmSync(abs(rel), { recursive: true, force: true });

/* 官网路径 -> 新本地路径（由每篇文档第 2 行的原文链接推导） */
const siteToLocal = {
  '/develop/getting-started': '01-快速入门/00-推荐阅读.md',
  '/develop/guides': '02-开发指南/00-推荐阅读.md',
  '/develop/references': '03-API参考/00-推荐阅读.md',
  '/develop/specifications': '04-平台规格/00-推荐阅读.md',
  '/develop/tools': '05-开发工具/00-推荐阅读.md',
  '/develop/samples': '06-示例应用/示例应用清单.md',
};
const SITE = 'https://webostv.developer.lge.com';
const README_ONLY = process.argv.includes('--readme');
if (!README_ONLY) {
  // 官网路径 -> 本地路径（由每篇文档第 2 行的原文链接推导），仅在正式执行时构建
  for (const [oldP, newP] of Object.entries(M)) {
    if (!exists(oldP)) throw new Error('缺少源文件: ' + oldP);
    const head = readUTF8(oldP).split(/\r?\n/).slice(0, 3).join('\n');
    const m = head.match(/原文链接:\s*(https:\/\/webostv\.developer\.lge\.com\/[^\s｜|]+)/);
    if (m) siteToLocal[m[1].replace(SITE, '').replace(/\/$/, '')] = newP;
  }
}

/* 链接改写：
 *   /develop/...      -> 本地中文文档路径（本仓库未收录的页面回退为官网绝对地址）
 *   其他 /xxx 站点路径 -> 官网绝对地址（/faq、/distribute、/more/netcast、/assets 等）
 *   源站损坏的 /?#xxx -> #xxx
 */
function rewriteLinks(text, newPath) {
  text = text.replace(/\]\((\/develop[^)\s]*)\)/g, (whole, target) => {
    const hashIdx = target.indexOf('#');
    const bare = (hashIdx >= 0 ? target.slice(0, hashIdx) : target).replace(/\/$/, '');
    const hash = hashIdx >= 0 ? target.slice(hashIdx) : '';
    const local = siteToLocal[bare];
    if (local) return `](${relPath(newPath, local)}${hash})`;
    return `](${SITE}${target})`;
  });
  text = text.replace(/\]\((\/(?!develop)[^)\s]*)\)/g, (w, u) => `](${SITE}${u})`);
  return text.replace(/\]\(\?#/g, '](#');
}

/* ------------------------------------------------------------------ *
 * 3. 执行
 * ------------------------------------------------------------------ */
const moved = []; // {newPath, title}
if (!README_ONLY) {
for (const [oldP, newP] of Object.entries(M)) {
  if (exists(newP)) throw new Error('目标已存在: ' + newP);
  let text = readUTF8(oldP);
  text = rewriteLinks(text, newP);
  if (H1_FIX[newP]) {
    const cr = text.includes('\r\n') ? '\r' : '';
    text = text.replace(/^# .*\r?$/m, H1_FIX[newP] + cr);
  }
  const title = (text.match(/^# (.+)$/m) || [, path.basename(newP, '.md')])[1].trim();
  moved.push({ newPath: newP, title, section: newP.split('/')[0] });

  if (!DRY) {
    fs.mkdirSync(path.dirname(abs(newP)), { recursive: true });
    fs.writeFileSync(abs(newP), text, 'utf8');
    fs.rmSync(abs(oldP), { force: true });
  }
}
console.log(`移动并重写文档: ${moved.length}`);

if (!DRY) {
  // 删除无关文档与空目录
  for (const f of DELETE_FILES) { rmrf(f); console.log('删除文件: ' + f); }
  for (const d of DELETE_DIRS) { rmrf(d); console.log('删除目录: ' + d); }

  // 清理残留空目录（develop、01-设计指南 之外的编号目录等）
  const legacy = [
    '02-开发者指南', '03-JavaScript服务', '04-数据库DB8', '05-StanbyME型号上的应用',
    '06-魔法遥控器动作传感器', '10-mediaOption', 'develop',
  ];
  for (const d of legacy) rmrf(d);
  for (const v of ['07-应用内购买.md', '08-DRM内容播放.md', '09-多声音播放.md', '11-向后兼容性.md',
    '12-Enyo与Enact指南.md', '13-面向webOS的Flutter.md', '14-ACG指南.md']) rmrf(v);
}
}

/* ------------------------------------------------------------------ *
 * 4. 重新生成 README.md
 * ------------------------------------------------------------------ */
const SECTIONS = [
  ['01-快速入门', '从零开始构建并运行第一个 webOS TV 应用。'],
  ['02-开发指南', '按主题组织的能力指南：应用基础、JavaScript 服务、DB8 数据库、媒体播放、系统功能与型号特性。'],
  ['03-API参考', 'Luna / webos-service / webOSTV.js 各服务与 API 的完整参考。'],
  ['04-平台规格', 'Web 引擎、媒体格式、DRM 与兼容性等平台能力规格。'],
  ['05-开发工具', 'SDK、CLI、IDE、模拟器、性能分析工具与编辑器插件的安装与使用。'],
  ['06-示例应用', '官方示例应用仓库索引。'],
];
const enc = (s) => s.split('/').map((x) => x.replace(/ /g, '%20')).join('/');
const h1 = (rel) => (readUTF8(rel).match(/^# (.+?)\r?$/m) || [, path.basename(rel, '.md')])[1].trim();

/* 目录顺序沿用映射表的书写顺序（已按主题分组），标题取文档 H1 */
function buildReadme() {
  const entries = Object.entries(M).map(([, newPath]) => ({ newPath, section: newPath.split('/')[0] }));
  let out = `# webOS TV 开发者文档（简体中文翻译）

本仓库收录 [webOS TV 开发者官网](https://webostv.developer.lge.com) \`Develop\` 栏目全部页面的简体中文翻译，并按**软件开发主题**重新分类归档。

> 所有文档均基于官网原文完整翻译，保留代码块、表格与全部技术标识（API 名、方法名、参数名、事件名、服务名、错误码、文件名等一律保留英文）。每篇文档第 2 行标注原文链接。
>
> 本仓库仅收录**软件开发**相关文档；官网的设计指南（设计原则、系统 UI、样式）、隐私与合规类内容不在收录范围内。

---

## 目录

`;
  for (const [dir, desc] of SECTIONS) {
    out += `### ${dir}\n\n${desc}\n\n`;
    let sub = null;
    for (const it of entries.filter((e) => e.section === dir)) {
      const parts = it.newPath.split('/');
      const cur = parts.length > 2 ? parts[1] : '';
      if (cur !== sub) {
        sub = cur;
        if (sub) out += `\n**${sub}**\n\n`;
      }
      out += `${sub ? '  ' : ''}- [${h1(it.newPath)}](${enc(it.newPath)})\n`;
    }
    out += '\n';
  }
  out += `---

## 说明与维护

- **页面数量**：共收录 ${entries.length} 篇文档。
- **目录结构**：单一中文分类树，六大门类，章节内按主题二级分组；文件名全部中文化。
- **链接**：文档内指向官网的链接已改写为指向本地中文文档；本仓库未收录的页面保留官网绝对地址。
- **图片**：保留原始图片链接，可直接在 Markdown 预览中查看。
- **英文原文**：\`.staging/\` 目录保存抓取到的英文原文，用于对照校订。
- **维护脚本**：\`tools/\` 目录提供抓取、HTML→Markdown 转换与完整性校验脚本；\`tools/restructure-zh.js --readme\` 可重新生成本目录，其映射表记录了全部中文命名与分类关系。
`;
  return out;
}

if (DRY || process.argv.includes('--readme')) {
  fs.writeFileSync(abs('README.md'), buildReadme(), 'utf8');
  console.log('README 生成完毕');
  process.exit(0);
}
