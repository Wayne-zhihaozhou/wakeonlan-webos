// 对比英文暂存稿与已有中文译文的“结构指纹”（代码块数、表格行数），用于发现截断/缺漏
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'manifest.json'), 'utf8'));

function fingerprint(text) {
  const fences = (text.match(/^```/gm) || []).length;
  const tableRows = (text.match(/^\|.*\|\s*$/gm) || []).length;
  const lines = text.split('\n').length;
  return { fences, tableRows, lines };
}

for (const m of manifest) {
  if (!m.targetExists) continue;
  const en = fs.readFileSync(path.join(ROOT, m.en), 'utf8');
  const zhPath = path.join(ROOT, m.target);
  if (!fs.existsSync(zhPath)) continue;
  const zh = fs.readFileSync(zhPath, 'utf8');
  const a = fingerprint(en);
  const b = fingerprint(zh);
  const same = a.fences === b.fences && a.tableRows === b.tableRows;
  const flag = same ? 'OK  ' : 'DIFF';
  console.log(
    `${flag} ${m.path}\n     EN fences=${a.fences} rows=${a.tableRows} lines=${a.lines}\n     ZH fences=${b.fences} rows=${b.tableRows} lines=${b.lines}`
  );
}
