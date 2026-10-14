// 修正“原文链接”行中误带入的尾部标点
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

let n = 0;
for (const f of walk(ROOT)) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (rel === 'README.md') continue;
  let t = fs.readFileSync(f, 'utf8');
  const fixed = t.replace(/^(>\s*原文链接:\s*)(\S+?)([)\]},.;]+)?(\s*｜.*)$/gm, (all, pre, url, junk, tail) => {
    if (junk) n++;
    return pre + url + tail;
  });
  if (fixed !== t) fs.writeFileSync(f, fixed, 'utf8');
}
console.log(`修正 ${n} 处带尾部标点的链接`);
