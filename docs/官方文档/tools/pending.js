const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const m = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'manifest.json'), 'utf8'));
const pending = m.filter((x) => !x.targetExists);
const groups = {};
for (const p of pending) {
  const g = p.path.split('/')[2];
  (groups[g] = groups[g] || []).push(p);
}
let total = 0;
for (const [g, items] of Object.entries(groups)) {
  const sum = items.reduce((a, b) => a + b.chars, 0);
  total += sum;
  console.log(`### ${g}  (${items.length} 页, ${sum} 字符)`);
  for (const it of items) console.log(`  ${String(it.chars).padStart(6)}  ${it.en}  ==>  ${it.target}`);
}
console.log('\n待翻译合计: ' + pending.length + ' 页, ' + total + ' 字符');
