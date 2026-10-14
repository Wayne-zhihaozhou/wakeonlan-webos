// 检查译文中是否遗漏了英文原文里的标识符/小节名（粗粒度完整性检查）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'manifest.json'), 'utf8'));

for (const m of manifest) {
  const en = fs.readFileSync(path.join(ROOT, m.en), 'utf8');
  const zhPath = path.join(ROOT, m.target);
  if (!fs.existsSync(zhPath)) continue;
  const zh = fs.readFileSync(zhPath, 'utf8');
  // 标题中的英文标识符（对象名、方法名等）
  const heads = en.match(/^#{1,6}\s.*$/gm) || [];
  const missing = [];
  for (const h of heads) {
    const ids = (h.match(/[A-Za-z][A-Za-z0-9_./-]{4,}/g) || []).filter(
      (w) => !/^(object|Object|Description|Parameters|Returns|Example|Method|Methods|Reference|Reference)$/i.test(w)
    );
    for (const id of ids) {
      if (!zh.toLowerCase().includes(id.toLowerCase())) missing.push(id);
    }
  }
  const uniq = [...new Set(missing)];
  if (uniq.length) console.log(`${m.target}\n    缺失标识符: ${uniq.slice(0, 25).join(', ')}`);
}
