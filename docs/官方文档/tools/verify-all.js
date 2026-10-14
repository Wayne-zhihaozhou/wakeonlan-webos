// 全量结构校验：对比英文暂存稿与中文译文的结构指纹
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'manifest.json'), 'utf8'));

const fp = (t) => ({
  fences: (t.match(/^```/gm) || []).length,
  rows: (t.match(/^\|.*\|\s*$/gm) || []).length,
  heads: (t.match(/^#{1,6}\s/gm) || []).length,
});

let bad = 0;
let missing = 0;
const problems = [];
for (const m of manifest) {
  const zhPath = path.join(ROOT, m.target);
  if (!fs.existsSync(zhPath)) {
    missing++;
    problems.push(`缺失: ${m.target}`);
    continue;
  }
  const en = fp(fs.readFileSync(path.join(ROOT, m.en), 'utf8'));
  const zh = fp(fs.readFileSync(zhPath, 'utf8'));
  const issues = [];
  if (en.fences !== zh.fences) issues.push(`代码块 ${zh.fences} != ${en.fences}`);
  if (en.rows !== zh.rows) issues.push(`表格行 ${zh.rows} != ${en.rows}`);
  if (zh.heads < en.heads) issues.push(`标题 ${zh.heads} < ${en.heads}`);
  if (issues.length) {
    bad++;
    problems.push(`${m.target}: ${issues.join('; ')}`);
  }
}
console.log(`总计 ${manifest.length} 页；缺失 ${missing}；结构异常 ${bad}`);
if (problems.length) console.log('\n' + problems.join('\n'));
