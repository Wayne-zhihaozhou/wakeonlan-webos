// 按 ## 标题把大文件切成若干份，便于并行翻译
// 用法: node tools/split.js <staging-en-file> <parts> [--force]
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function main() {
  const [file, nStr] = process.argv.slice(2);
  const n = Number(nStr || 2);
  const src = path.resolve(ROOT, file);
  const text = fs.readFileSync(src, 'utf8');
  const slug = path.basename(src, '.md');
  const outDir = path.join(ROOT, '.staging', 'parts');
  fs.mkdirSync(outDir, { recursive: true });

  // 按 "## " 一级小节切块（保留文件开头的前言）
  const lines = text.split('\n');
  const chunks = [];
  let cur = [];
  for (const line of lines) {
    if (/^##\s/.test(line) && cur.length) {
      chunks.push(cur);
      cur = [];
    }
    cur.push(line);
  }
  if (cur.length) chunks.push(cur);

  // 单块过大时用 ### / #### 再细分
  const refined = [];
  for (const c of chunks) {
    const size = c.join('\n').length;
    if (size <= 15000) {
      refined.push(c);
      continue;
    }
    const sub = [];
    let acc = [];
    for (const line of c) {
      if (/^###\s/.test(line) && acc.length) {
        sub.push(acc);
        acc = [];
      }
      acc.push(line);
    }
    if (acc.length) sub.push(acc);
    // 若仍有超大块，按行硬切
    for (const s of sub) {
      const text = s.join('\n');
      if (text.length <= 15000) {
        refined.push([text]);
      } else {
        const lines = text.split('\n');
        let buf = [];
        let len = 0;
        for (const l of lines) {
          buf.push(l);
          len += l.length + 1;
          if (len > 12000) {
            refined.push([buf.join('\n')]);
            buf = [];
            len = 0;
          }
        }
        if (buf.length) refined.push([buf.join('\n')]);
      }
    }
  }
  chunks.length = 0;
  chunks.push(...refined);

  // 均分为 n 组
  const total = chunks.reduce((a, c) => a + c.join('\n').length, 0);
  const groups = Array.from({ length: n }, () => []);
  const sizes = Array(n).fill(0);
  for (const c of chunks) {
    const size = c.join('\n').length + 1;
    let idx = sizes.indexOf(Math.min(...sizes));
    groups[idx].push(c);
    sizes[idx] += size;
  }

  const written = [];
  groups.forEach((g, i) => {
    if (!g.length) return;
    const out = path.join(outDir, `${slug}.part${i + 1}.md`);
    fs.writeFileSync(out, g.map((c) => c.join('\n')).join('\n'), 'utf8');
    written.push({ part: i + 1, file: path.relative(ROOT, out).replace(/\\/g, '/'), chars: sizes[i] });
  });
  console.log(`源文件 ${total} 字符 -> ${written.length} 份`);
  for (const w of written) console.log(`  part${w.part}: ${w.chars} 字符  ${w.file}`);
  fs.writeFileSync(
    path.join(outDir, slug + '.meta.json'),
    JSON.stringify({ slug, source: path.relative(ROOT, src).replace(/\\/g, '/'), parts: written }, null, 2),
    'utf8'
  );
}

main();
