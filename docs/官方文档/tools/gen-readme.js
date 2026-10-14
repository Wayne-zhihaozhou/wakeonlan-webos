// 根据当前文件树生成 README.md 目录
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function title(file) {
  const t = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const line = t.split('\n').find((l) => /^#\s+/.test(l)) || path.basename(file, '.md');
  return line.replace(/^#\s+/, '').trim();
}
const enc = (p) => p.split('/').map(encodeURIComponent).join('/').replace(/%2F/g, '/');
const link = (rel) => `[${title(path.join(ROOT, rel))}](${enc(rel)})`;

function listDir(rel, filter) {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && (!filter || filter(f)))
    .sort()
    .map((f) => rel + '/' + f);
}

const out = [];
out.push('# webOS TV 开发者文档（简体中文翻译）');
out.push('');
out.push(
  '本仓库收录 [webOS TV 开发者官网](https://webostv.developer.lge.com) `Develop` 栏目下全部页面的简体中文翻译，目录结构与官网导航一一对应。'
);
out.push('');
out.push(
  '> 所有文档均基于官网原文完整翻译，保留代码块、表格与全部技术标识（API 名、方法名、参数名、事件名、服务名、错误码、文件名等一律保留英文）。每篇文档开头标注原文链接。'
);
out.push('');
out.push('---');
out.push('');
out.push('## 目录');
out.push('');

// 01 设计指南
out.push('### 01 设计指南（Design Guidelines）');
out.push('');
out.push('- ' + link('01-设计指南/设计原则.md'));
const sysui = listDir('01-设计指南/系统UI');
if (sysui.length) {
  out.push('- **系统 UI（System UI）**');
  for (const f of sysui) out.push('  - ' + link(f));
}
const style = listDir('01-设计指南/样式');
if (style.length) {
  out.push('- **样式（Style）**');
  for (const f of style) out.push('  - ' + link(f));
}
out.push('- ' + link('01-设计指南/隐私指南.md'));
out.push('');

// 02-14 旧目录
const legacy = fs
  .readdirSync(ROOT)
  .filter((f) => /^\d\d-/.test(f) && f !== '01-设计指南')
  .sort();
if (legacy.length) {
  out.push('### 02–14 开发者指南（Developer Guides）');
  out.push('');
  for (const d of legacy) {
    const st = fs.statSync(path.join(ROOT, d));
    if (st.isDirectory()) {
      out.push(`- **${d.replace(/^\d\d-/, '')}**`);
      for (const f of listDir(d)) out.push('  - ' + link(f));
    } else {
      out.push('- ' + link(d));
    }
  }
  out.push('');
}

// develop 各章节
const sections = [
  ['develop/getting-started', 'Getting Started（快速入门）', 'https://webostv.developer.lge.com/develop/getting-started'],
  ['develop/references', 'References（参考资料）', 'https://webostv.developer.lge.com/develop/references'],
  ['develop/specifications', 'Specifications（规格）', 'https://webostv.developer.lge.com/develop/specifications'],
  ['develop/tools', 'Tools（开发工具）', 'https://webostv.developer.lge.com/develop/tools'],
  ['develop/samples', 'Samples（示例）', 'https://webostv.developer.lge.com/develop/samples'],
  ['develop/guides', 'Guides（指南索引）', 'https://webostv.developer.lge.com/develop/guides'],
];
for (const [dir, name, url] of sections) {
  const files = listDir(dir);
  if (!files.length) continue;
  out.push(`### Develop → ${name}`);
  out.push('');
  out.push(`> 章节首页：${url}`);
  out.push('');
  for (const f of files) out.push('- ' + link(f));
  out.push('');
}

const total = fs
  .readdirSync(ROOT, { recursive: true })
  .filter((f) => typeof f === 'string' && f.endsWith('.md') && !f.startsWith('tools') && !f.startsWith('.staging') && f !== 'README.md').length;

out.push('---');
out.push('');
out.push('## 说明');
out.push('');
out.push(`- **页面数量**：共收录 ${total} 个页面（含各章节索引页）。`);
out.push('- **目录结构**：与官网左侧导航层级保持一致；`develop/` 下按官网章节组织。');
out.push('- **图片**：保留原始图片链接，可直接在 Markdown 预览中查看。');
out.push('- **原文参考**：每篇文档第 2 行标注来源页面 URL。');
out.push('- **维护脚本**：`tools/` 目录下提供了页面抓取、HTML→Markdown 转换、切分/合并与完整性校验脚本。');
out.push('');

fs.writeFileSync(path.join(ROOT, 'README.md'), out.join('\n'), 'utf8');
console.log(`README.md 已更新，共 ${total} 个页面`);
