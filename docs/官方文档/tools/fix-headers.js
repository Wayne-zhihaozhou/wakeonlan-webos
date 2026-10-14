// 修复遗留的英文表头（限定在指定文件与精确表头字符串上）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const MAP = {
  'develop/tools/cli-dev-guide.md': [
    ['| Option | Parameter | Description |', '| 选项 | 参数 | 说明 |'],
    ['| Parameter | Description |', '| 参数 | 说明 |'],
    ['| Directory / File | Description |', '| 目录 / 文件 | 说明 |'],
    ['| File | Description |', '| 文件 | 说明 |'],
    ['| Commands | Description |', '| 命令 | 说明 |'],
  ],
  'develop/specifications/streaming-protocol-drm.md': [
    ['| **DRM** | **STREAMING PROTOCOL** |', '| **DRM** | **流媒体协议** |'],
    ['| **PROTOCOL** | **WEBOS TV DEVICE** | **EMULATOR** |', '| **协议** | **WEBOS TV 设备** | **模拟器 (Emulator)** |'],
    ['| **DRM NAME** | **WEBOS TV** | **SIMULATOR** | **EMULATOR** |', '| **DRM 名称** | **WEBOS TV** | **仿真器 (Simulator)** | **模拟器 (Emulator)** |'],
    ['| **PLATFORM VERSION** | **RELEASE YEAR** | **SUPPORTED MSE VERSION** |', '| **平台版本** | **发布年份** | **支持的 MSE 版本** |'],
    ['| **PLATFORM VERSION** | **RELEASE YEAR** | **SUPPORTED EME VERSION** |', '| **平台版本** | **发布年份** | **支持的 EME 版本** |'],
  ],
  'develop/specifications/tls.md': [
    ['| **WEBOS TV PLATFORM VERSION** | **RELEASE YEAR** | **TLS V1.3** | **TLS V1.2** |', '| **WEBOS TV 平台版本** | **发布年份** | **TLS V1.3** | **TLS V1.2** |'],
  ],
  'develop/specifications/web-api-and-web-engine.md': [
    ['| PLATFORM VERSION | RELEASE YEAR | WEB ENGINE |', '| 平台版本 | 发布年份 | Web 引擎 |'],
  ],
};

for (const f of ['10', '20', '30', '35']) {
  MAP[`develop/specifications/video-audio-${f}.md`] = [
    ['| Type | Resolution and Image Quality | Supported Models |', '| 类型 | 分辨率与画质 | 支持的机型 |'],
    ['| File Extension | Codec |  |', '| 文件扩展名 | 编解码器 |  |'],
    ['| File Extension | Items | Description |', '| 文件扩展名 | 项目 | 说明 |'],
    ['| Name | File Extension | Supported in webOS TV | Supported in Emulator |', '| 名称 | 文件扩展名 | webOS TV 中支持 | 模拟器 (Emulator) 中支持 |'],
  ];
}
MAP['develop/specifications/video-audio-220.md'] = [
  ['| Type | Resolution and Image Quality | Supported Models |', '| 类型 | 分辨率与画质 | 支持的机型 |'],
  ['| File Extension | Codec |  |', '| 文件扩展名 | 编解码器 |  |'],
  ['| File Extension | Items | Description |', '| 文件扩展名 | 项目 | 说明 |'],
  [
    '| Name | File Extension | Supported in webOS TV | Supported in Simulator | Supported in Emulator |',
    '| 名称 | 文件扩展名 | webOS TV 中支持 | 仿真器 (Simulator) 中支持 | 模拟器 (Emulator) 中支持 |',
  ],
];


let total = 0;
for (const [rel, pairs] of Object.entries(MAP)) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  let t = fs.readFileSync(p, 'utf8');
  let n = 0;
  for (const [from, to] of pairs) {
    const before = t;
    t = t.split('\n').map((l) => (l === from ? to : l)).join('\n');
    if (t !== before) n += before.split('\n').filter((l) => l === from).length;
  }
  if (n) {
    fs.writeFileSync(p, t, 'utf8');
    total += n;
    console.log(`${rel}: 替换 ${n} 处表头`);
  }
}
console.log('合计 ' + total + ' 处');
