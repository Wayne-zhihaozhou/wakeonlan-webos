// 清理：把 /_next/image 代理图片地址还原为原始 URL；合并重复的“注意：注意”
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function walk(dir, out = [], isRoot = true) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.staging' || e.name === 'node_modules') continue;
    if (isRoot && e.name === 'tools') continue; // 仅跳过仓库根目录下的脚本目录
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out, false);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

let imgFixed = 0;
let noteFixed = 0;
for (const f of walk(ROOT)) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (rel === 'README.md') continue;
  let t = fs.readFileSync(f, 'utf8');
  const before = t;

  // /_next/image?url=<encoded>&w=...&q=...  ->  解码后的原始地址
  t = t.replace(/\/_next\/image\?url=([^&\s)]+)&(?:amp;)?w=[^&\s)]*&(?:amp;)?q=[^&\s)]*/g, (all, enc) => {
    try {
      imgFixed++;
      return decodeURIComponent(enc);
    } catch {
      return all;
    }
  });

  const n = (t.match(/注意：注意/g) || []).length;
  if (n) {
    noteFixed += n;
    t = t.replace(/注意：注意/g, '注意');
  }

  if (t !== before) fs.writeFileSync(f, t, 'utf8');
}
console.log(`图片地址还原 ${imgFixed} 处；重复“注意”合并 ${noteFixed} 处`);
