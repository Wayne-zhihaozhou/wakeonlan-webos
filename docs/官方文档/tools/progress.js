// 统计当前仍未生成译文的页面（按当前文件系统状态）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const m = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'manifest.json'), 'utf8'));
const pending = m.filter((x) => !fs.existsSync(path.join(ROOT, x.target)));
const bySection = {};
for (const p of pending) {
  const g = p.path.split('/')[2];
  (bySection[g] = bySection[g] || []).push(p);
}
for (const [g, items] of Object.entries(bySection)) {
  console.log(`### ${g} (${items.length})`);
  for (const it of items) console.log(`    ${it.target}`);
}
console.log(`\n进度: ${m.length - pending.length}/${m.length} 已完成，剩余 ${pending.length}`);
