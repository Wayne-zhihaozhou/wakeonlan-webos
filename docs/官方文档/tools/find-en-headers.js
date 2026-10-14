// 找出“表头行仍是纯英文”的表格（表头行 = 分隔行 `| --- |` 的前一行）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'manifest.json'), 'utf8'));

const hasCJK = (s) => /[\u4e00-\u9fff]/.test(s);
let count = 0;
for (const m of manifest) {
  const p = path.join(ROOT, m.target);
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  const hits = [];
  for (let i = 1; i < lines.length; i++) {
    if (/^\|\s*-{3,}/.test(lines[i]) && /^\|/.test(lines[i - 1]) && !hasCJK(lines[i - 1])) {
      hits.push(i + ': ' + lines[i - 1].slice(0, 100));
    }
  }
  if (hits.length) {
    count++;
    console.log('=== ' + m.target);
    hits.slice(0, 4).forEach((h) => console.log('   ' + h));
    if (hits.length > 4) console.log(`   ... 共 ${hits.length} 处`);
  }
}
console.log(`\n共 ${count} 个文件存在纯英文表头`);
