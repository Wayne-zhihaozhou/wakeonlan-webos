// 检查所有文档是否具备“原文链接”行与标题行格式
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

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

let bad = 0;
for (const f of walk(ROOT)) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (rel === 'README.md') continue;
  const t = fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, '');
  const lines = t.split(/\r?\n/);
  const okTitle = /^#\s+/.test(lines[0] || '');
  const inScope = rel.startsWith('develop/') || rel.startsWith('01-设计指南/');
  const okLink = /^>\s*原文链接[:：]/.test(lines[1] || '');
  if (!okTitle || (inScope && !okLink)) {
    bad++;
    console.log(`${rel}  标题行=${okTitle}  链接行=${okLink}`);
  }
}
console.log(bad ? `\n共 ${bad} 个文件格式异常` : '\n全部文件格式正常');
