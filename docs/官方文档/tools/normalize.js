// 规范化译文文件头部：确保为
//   # 中文标题
//   > 原文链接: <url> ｜ 简体中文翻译
//   (空行)
// 并统一为 UTF-8 无 BOM、LF 之前的 CRLF 规范化（保留 CRLF）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'manifest.json'), 'utf8'));
const urlByTarget = {};
for (const m of manifest) urlByTarget[m.target.replace(/\\/g, '/')] = m.url;

// 设计指南页面（guides 下的中文路径）
const guideUrls = {
  '01-设计指南/设计原则.md': 'https://webostv.developer.lge.com/develop/guides/design-principles',
  '01-设计指南/系统UI/主屏幕.md': 'https://webostv.developer.lge.com/develop/guides/home-screen',
  '01-设计指南/系统UI/通知.md': 'https://webostv.developer.lge.com/develop/guides/notifications',
  '01-设计指南/系统UI/与应用交互.md': 'https://webostv.developer.lge.com/develop/guides/interacting-with-apps',
  '01-设计指南/系统UI/虚拟键盘.md': 'https://webostv.developer.lge.com/develop/guides/virtual-keyboard',
  '01-设计指南/系统UI/魔法遥控器.md': 'https://webostv.developer.lge.com/develop/guides/magic-remote',
  '01-设计指南/样式/图标.md': 'https://webostv.developer.lge.com/develop/guides/icon',
  '01-设计指南/样式/过扫描.md': 'https://webostv.developer.lge.com/develop/guides/overscan',
  '01-设计指南/样式/颜色.md': 'https://webostv.developer.lge.com/develop/guides/color',
  '01-设计指南/隐私指南.md': 'https://webostv.developer.lge.com/develop/guides/privacy-guideline',
};
Object.assign(urlByTarget, guideUrls);

function walk(dir, out = [], isRoot = true) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.staging' || e.name === 'node_modules') continue;
    if (isRoot && e.name === 'tools') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out, false);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

let fixed = 0;
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel === 'README.md') continue;
  const inScope = rel.startsWith('develop/') || rel.startsWith('01-设计指南/');
  // 旧目录（02-14）也统一格式，但仅当文件本身已有来源标注时

  let text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const hadCrlf = /\r\n/.test(text);
  text = text.replace(/\r\n/g, '\n');
  const lines = text.split('\n');

  // 找到标题行与来源行（支持 > 原文链接: 与 来源：[原始页面](url)）
  let titleIdx = lines.findIndex((l) => /^#\s+/.test(l));
  if (titleIdx < 0) continue;
  const title = lines[titleIdx].trim();
  const head = lines.slice(0, titleIdx).filter((l) => l.trim() !== '');
  const rest = lines.slice(titleIdx + 1);

  let url = null;
  const look = Math.min(rest.length, 5);
  for (let i = 0; i < look; i++) {
    const l = rest[i].trim();
    if (l === '') continue;
    if (/^>\s*原文链接[:：]/.test(l) || /^来源[:：]/.test(l)) {
      const m = /https?:\/\/\S+/.exec(l);
      if (m) url = m[0];
      rest.splice(0, i + 1);
      break;
    }
    break;
  }
  if (!url) {
    if (!inScope) continue; // 非本次范围且没有来源行 -> 不动
    url = urlByTarget[rel] || null;
  }
  while (rest.length && rest[0].trim() === '') rest.shift();

  const outHead = ['# ' + title.replace(/^#\s+/, '')];
  if (url) outHead.push('> 原文链接: ' + url + ' ｜ 简体中文翻译');
  const out = head.concat(outHead, [''], rest).join('\n');
  const final = hadCrlf ? out.replace(/\n/g, '\r\n') : out;
  if (final !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, final, 'utf8');
    fixed++;
    console.log('normalized ' + rel + (url ? '' : '  [缺少链接]'));
  }
}
console.log('共规范化 ' + fixed + ' 个文件');
