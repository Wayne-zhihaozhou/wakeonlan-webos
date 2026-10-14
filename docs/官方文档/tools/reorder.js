// 修复切分导致的顺序错乱：按原始 chunk 顺序重新拼装已翻译的分片
// 依据：切分算法确定，chunk->part 归属可精确复算；每个 chunk 的标题数量已知，
// 因此可以把每个 part 的译文按标题行切回 chunk，再按原文顺序重排。
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function buildChunks(text) {
  const lines = text.split('\n');
  const chunks = [];
  let cur = [];
  for (const line of lines) {
    if (/^##\s/.test(line) && cur.length) {
      chunks.push(cur.join('\n'));
      cur = [];
    }
    cur.push(line);
  }
  if (cur.length) chunks.push(cur.join('\n'));
  return chunks;
}

function refine(chunks) {
  const refined = [];
  for (const c of chunks) {
    if (c.length <= 15000) {
      refined.push(c);
      continue;
    }
    const lines = c.split('\n');
    const sub = [];
    let acc = [];
    for (const line of lines) {
      if (/^###\s/.test(line) && acc.length) {
        sub.push(acc.join('\n'));
        acc = [];
      }
      acc.push(line);
    }
    if (acc.length) sub.push(acc.join('\n'));
    for (const s of sub) {
      if (s.length <= 15000) refined.push(s);
      else {
        const ls = s.split('\n');
        let buf = [];
        let len = 0;
        for (const l of ls) {
          buf.push(l);
          len += l.length + 1;
          if (len > 12000) {
            refined.push(buf.join('\n'));
            buf = [];
            len = 0;
          }
        }
        if (buf.length) refined.push(buf.join('\n'));
      }
    }
  }
  return refined;
}

const countHeadings = (t) => (t.match(/^#{1,6}\s/gm) || []).length;

function reorder(slug, nParts) {
  const src = fs.readFileSync(path.join(ROOT, '.staging', 'en', slug + '.md'), 'utf8');
  const chunks = refine(buildChunks(src));

  // 复算切分归属
  const groups = Array.from({ length: nParts }, () => []);
  const sizes = Array(nParts).fill(0);
  chunks.forEach((c, k) => {
    const idx = sizes.indexOf(Math.min(...sizes));
    groups[idx].push(k);
    sizes[idx] += c.length + 1;
  });

  const counts = chunks.map(countHeadings);
  const out = new Array(chunks.length);
  let ok = true;

  groups.forEach((gk, gi) => {
    const file = path.join(ROOT, '.staging', 'zh', `${slug}.part${gi + 1}.md`);
    if (!fs.existsSync(file)) {
      console.log(`  [缺失] ${path.relative(ROOT, file)}`);
      ok = false;
      return;
    }
    const lines = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n');
    const headingLines = [];
    lines.forEach((l, i) => {
      if (/^#{1,6}\s/.test(l)) headingLines.push(i);
    });

    let exp = gk.map((k) => counts[k]);
    let total = exp.reduce((a, b) => a + b, 0);
    if (total !== headingLines.length && total - 1 === headingLines.length && exp[0] >= 1) {
      // 译文中省略了 H1 标题
      exp[0] -= 1;
      total -= 1;
    }
    if (total !== headingLines.length) {
      console.log(
        `  [标题数不匹配] part${gi + 1}: 预期 ${total}，实际 ${headingLines.length}（chunks ${gk.join(',')}）`
      );
      ok = false;
      return;
    }

    let cursor = 0;
    gk.forEach((k, j) => {
      const start = exp[j] > 0 ? headingLines[cursor] : 0;
      cursor += exp[j];
      const end = cursor < headingLines.length ? headingLines[cursor] : lines.length;
      out[k] = lines
        .slice(start, end)
        .join('\n')
        .replace(/^\n+|\s+$/g, '');
    });
  });

  if (!ok) return false;
  const doc = out.join('\n\n').replace(/\n{3,}/g, '\n\n');
  const dest = path.join(ROOT, '.staging', 'zh', slug + '.ordered.md');
  fs.writeFileSync(dest, doc, 'utf8');
  console.log(`  OK -> ${path.relative(ROOT, dest)} (${doc.length} 字符, ${countHeadings(doc)} 个标题)`);
  return true;
}

const targets = [
  ['references__ble-gatt', 3],
  ['tools__cli-dev-guide', 3],
  ['tools__webos-tv-cli-dev-guide', 3],
];
let all = true;
for (const [slug, n] of targets) {
  console.log('=== ' + slug);
  if (!reorder(slug, n)) all = false;
}
console.log(all ? '\n全部重排成功' : '\n存在需人工处理的分片');
