// 全量表格逐表对比：找出译文中比原文少行的表格
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'manifest.json'), 'utf8'));

function tablesOf(text) {
  const lines = text.split('\n');
  const res = [];
  let cur = null;
  for (const l of lines) {
    if (/^\|\s*---/.test(l)) {
      cur = 1;
      continue;
    }
    if (/^\|/.test(l)) {
      if (cur === null) cur = 1;
      else cur++;
    } else if (cur !== null) {
      res.push(cur);
      cur = null;
    }
  }
  if (cur !== null) res.push(cur);
  return res;
}

let flagged = 0;
for (const m of manifest) {
  const zhPath = path.join(ROOT, m.target);
  if (!fs.existsSync(zhPath)) continue;
  const zh = tablesOf(fs.readFileSync(zhPath, 'utf8'));
  const en = tablesOf(fs.readFileSync(path.join(ROOT, m.en), 'utf8'));
  const notes = [];
  if (zh.length !== en.length) notes.push(`表格数 ZH ${zh.length} / EN ${en.length}`);
  else {
    const diffs = zh.map((v, i) => v - en[i]);
    const neg = diffs.filter((d) => d < 0);
    const pos = diffs.filter((d) => d > 0);
    if (neg.length) notes.push(`少行 ${neg.length} 处（最多 -${Math.max(...neg.map(Math.abs))}）`);
    if (pos.length) notes.push(`多行 ${pos.length} 处`);
  }
  if (notes.length) {
    flagged++;
    console.log(`${m.target}\n    ${notes.join('; ')}`);
  }
}
console.log(`\n共 ${manifest.length} 页，表格结构有差异 ${flagged} 页`);
