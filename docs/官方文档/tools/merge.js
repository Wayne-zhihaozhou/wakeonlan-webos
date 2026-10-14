// 合并切分文件的翻译结果，并加上标题与原文链接
// 用法: node tools/merge.js <slug>    例如 references__ble-gatt
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// 切分页面的中文标题
const TITLES = {
  'references__ble-gatt': 'BLE GATT API 参考',
  'tools__cli-dev-guide': 'webOS CLI 开发者指南',
  'tools__webos-tv-cli-dev-guide': 'webOS TV CLI 开发者指南',
};

function main() {
  const slug = process.argv[2];
  if (!slug) throw new Error('缺少 slug');
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'parts', slug + '.meta.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'manifest.json'), 'utf8'));
  const item = manifest.find((m) => m.en === meta.source);
  if (!item) throw new Error('manifest 中找不到 ' + meta.source);

  const parts = [];
  const ordered = path.join(ROOT, '.staging', 'zh', `${slug}.ordered.md`);
  if (fs.existsSync(ordered)) {
    // 已按原文顺序重排（见 tools/reorder.js）
    parts.push(fs.readFileSync(ordered, 'utf8').trim());
  } else {
    for (const p of meta.parts.sort((a, b) => a.part - b.part)) {
      const zh = path.join(ROOT, '.staging', 'zh', `${slug}.part${p.part}.md`);
      if (!fs.existsSync(zh)) throw new Error('缺少译文分片: ' + path.relative(ROOT, zh));
      parts.push(fs.readFileSync(zh, 'utf8').trim());
    }
  }
  const body = parts.join('\n\n');
  const title = TITLES[slug] || item.title;
  const out = `# ${title}\n> 原文链接: ${item.url} ｜ 简体中文翻译\n\n${body}\n`;
  const target = path.join(ROOT, item.target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, out, 'utf8');
  console.log('已写入 ' + item.target + ' (' + out.length + ' 字符)');
}

main();
