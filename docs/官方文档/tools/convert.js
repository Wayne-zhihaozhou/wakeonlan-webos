// 抓取页面并转为 Markdown（webOS TV 开发者文档）
// 用法:
//   node tools/convert.js fetch <url> <out.html>      # 抓取原始 HTML 到本地
//   node tools/convert.js md <in.html> <out.md>       # HTML -> Markdown
//   node tools/convert.js url <url> <out.md>          # 抓取并直接转换
const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (docs-converter)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(fetchHtml(new URL(res.headers.location, url).href));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      })
      .on('error', reject);
  });
}

// 提取 <div class="docs"> ... </div>（按 div 配对）
function extractDocs(html) {
  const start = html.indexOf('<div class="docs">');
  if (start < 0) throw new Error('未找到 <div class="docs">');
  const contentStart = start + '<div class="docs">'.length;
  let depth = 1;
  const re = /<div\b[^>]*>|<\/div>/g;
  re.lastIndex = contentStart;
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('</')) depth--;
    else depth++;
    if (depth === 0) return html.slice(contentStart, m.index);
  }
  throw new Error('div 未闭合');
}

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  copy: '©', reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', times: '×', deg: '°',
  bull: '•', middot: '·', laquo: '«', raquo: '»', euro: '€', yen: '¥',
};
function decode(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (all, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : all;
    }
    return Object.prototype.hasOwnProperty.call(ENTITIES, e) ? ENTITIES[e] : all;
  });
}

// --- 极简 HTML 解析：构建节点树 ---
const VOID_TAGS = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'source', 'col']);

// HTML 隐含闭合规则（站点 HTML 常省略 </p>、</li>、</td>）
const BLOCK_STARTERS = new Set([
  'p', 'div', 'table', 'ul', 'ol', 'li', 'pre', 'blockquote',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'section', 'article', 'tr', 'td', 'th',
]);
function impliedClose(stack, tag) {
  const top = stack[stack.length - 1];
  if (!top || top.tag === 'root') return;
  if (top.tag === 'p' && BLOCK_STARTERS.has(tag)) {
    stack.pop();
    return;
  }
  if ((tag === 'li' || tag === 'dt' || tag === 'dd') && (top.tag === 'li' || top.tag === 'dt' || top.tag === 'dd')) {
    stack.pop();
    return;
  }
  if ((tag === 'td' || tag === 'th') && (top.tag === 'td' || top.tag === 'th')) {
    stack.pop();
    return;
  }
  if (tag === 'tr' && (top.tag === 'td' || top.tag === 'th')) {
    stack.pop();
    return;
  }
  if ((tag === 'td' || tag === 'th') && top.tag === 'tr') return;
  if (tag === 'tr' && top.tag === 'tr') {
    stack.pop();
  }
}

function parse(html) {
  const root = { tag: 'root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    const [all, tag, attrStr, selfClose, text] = m;
    if (all.startsWith('<!--') || all.startsWith('<![')) continue;
    const cur = stack[stack.length - 1];
    if (text !== undefined) {
      cur.children.push({ tag: '#text', text: decode(text) });
      continue;
    }
    if (all[1] === '/') {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag.toLowerCase()) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const attrs = {};
    const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let a;
    while ((a = attrRe.exec(attrStr || ''))) {
      attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
    }
    const node = { tag: tag.toLowerCase(), attrs, children: [] };
    if (!VOID_TAGS.has(node.tag)) impliedClose(stack, node.tag);
    const parent = stack[stack.length - 1];
    parent.children.push(node);
    if (!selfClose && !VOID_TAGS.has(node.tag)) stack.push(node);
  }
  return root;
}

// --- Markdown 渲染 ---
function textOf(node) {
  if (node.tag === '#text') return node.text;
  return (node.children || []).map(textOf).join('');
}

function inline(nodes, ctx) {
  let out = '';
  for (const n of nodes || []) {
    if (n.tag === '#text') {
      out += n.text.replace(/\s+/g, ' ');
      continue;
    }
    const kids = n.children || [];
    switch (n.tag) {
      case 'br':
        out += '<br>';
        break;
      case 'strong':
      case 'b': {
        const t = inline(kids, ctx).trim();
        out += t ? '**' + t + '**' : '';
        break;
      }
      case 'em':
      case 'i': {
        const t = inline(kids, ctx).trim();
        out += t ? '*' + t + '*' : '';
        break;
      }
      case 'code': {
        const t = textOf(n).replace(/\s+/g, ' ');
        out += '`' + t + '`';
        break;
      }
      case 'a': {
        const t = inline(kids, ctx).trim();
        const href = n.attrs.href || '';
        out += t ? `[${t}](${href})` : '';
        break;
      }
      case 'img': {
        const src = n.attrs.src || '';
        const alt = n.attrs.alt || '';
        if (src.includes('logo_red_gray')) break; // 页脚 logo
        out += `![${alt}](${src})`;
        break;
      }
      case 'span':
        out += inline(kids, ctx);
        break;
      default:
        out += inline(kids, ctx);
    }
  }
  return out.replace(/[ \t]+/g, ' ').replace(/ ?<br> ?/g, '<br>').trim();
}

// 表格单元格：把多个 <p> / 列表块拼接为 <br> 分隔
function renderCell(nodes) {
  const parts = [];
  for (const n of nodes || []) {
    if (n.tag === '#text') {
      const t = n.text.replace(/\s+/g, ' ').trim();
      if (t) parts.push(t);
      continue;
    }
    if (n.tag === 'p' || n.tag === 'div') {
      const t = renderCell(n.children || []);
      if (t) parts.push(t);
      continue;
    }
    if (n.tag === 'ul' || n.tag === 'ol') {
      const items = (n.children || []).filter((c) => c.tag === 'li');
      const lines = items.map((li, i) => {
        const t = renderCell(li.children || []);
        return (n.tag === 'ol' ? i + 1 + '. ' : '• ') + t;
      });
      if (lines.length) parts.push(lines.join('<br>'));
      continue;
    }
    if (n.tag === 'table') {
      // Markdown 不支持嵌套表格：把内层表格压成单元格内的“行”文本
      const rows = [];
      const collect = (x) => {
        for (const c of x.children || []) {
          if (c.tag === 'tr') {
            const cells = (c.children || [])
              .filter((y) => y.tag === 'th' || y.tag === 'td')
              .map((y) => renderCell(y.children || []));
            if (cells.length) rows.push(cells.join(' | '));
          } else collect(c);
        }
      };
      collect(n);
      if (rows.length) parts.push(rows.join('<br>'));
      continue;
    }
    if (n.tag === 'pre') {
      const code = n.children.find((c) => c.tag === 'code') || n;
      parts.push('`' + textOf(code).replace(/\s+/g, ' ').trim() + '`');
      continue;
    }
    const t = inline([n], {});
    if (t) parts.push(t);
  }
  return parts
    .filter(Boolean)
    .join('<br>')
    .replace(/<br>(\s*<br>)+/g, '<br>')
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, ' ');
}

function renderTable(node) {
  const rows = [];
  const walk = (n) => {
    for (const c of n.children || []) {
      if (c.tag === 'tr') {
        const cells = [];
        for (const cell of c.children || []) {
          if (cell.tag === 'th' || cell.tag === 'td') cells.push(renderCell(cell.children || []));
        }
        rows.push(cells);
      } else walk(c);
    }
  };
  walk(node);
  if (!rows.length) return '';
  const cols = Math.max(...rows.map((r) => r.length));
  const pad = (r) => {
    const c = r.slice();
    while (c.length < cols) c.push('');
    return c;
  };
  const lines = [];
  lines.push('| ' + pad(rows[0]).join(' | ') + ' |');
  lines.push('| ' + Array(cols).fill('---').join(' | ') + ' |');
  for (let i = 1; i < rows.length; i++) lines.push('| ' + pad(rows[i]).join(' | ') + ' |');
  return lines.join('\n') + '\n\n';
}

function renderList(node, ctx, depth) {
  const ordered = node.tag === 'ol';
  let idx = 1;
  let out = '';
  const items = (node.children || []).filter((c) => c.tag === 'li');
  for (const li of items) {
    const inlineParts = [];
    const blockParts = [];
    for (const c of li.children || []) {
      if (c.tag === 'ul' || c.tag === 'ol') blockParts.push(renderList(c, ctx, depth + 1));
      else if (c.tag === 'p' || c.tag === 'div') {
        const t = inline(c.children || []);
        if (t) inlineParts.push(t);
      } else if (c.tag === '#text') {
        const t = c.text.replace(/\s+/g, ' ').trim();
        if (t) inlineParts.push(t);
      } else inlineParts.push(inline([c], ctx));
    }
    const marker = ordered ? `${idx++}. ` : '- ';
    const indent = '  '.repeat(depth);
    out += indent + marker + inlineParts.join(' ').trim() + '\n';
    for (const b of blockParts) out += b;
  }
  return out + (depth === 0 ? '\n' : '');
}

function renderBlocks(nodes, ctx) {
  let out = '';
  for (const n of nodes || []) {
    if (n.tag === '#text') {
      const t = n.text.replace(/\s+/g, ' ').trim();
      if (t) out += t + '\n\n';
      continue;
    }
    switch (n.tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const lvl = Math.min(6, Number(n.tag[1]) + (ctx.headingOffset || 0));
        const t = inline(n.children || []);
        if (t) out += '#'.repeat(lvl) + ' ' + t + '\n\n';
        break;
      }
      case 'p': {
        const t = inline(n.children || []);
        if (t) out += t + '\n\n';
        break;
      }
      case 'table':
        out += renderTable(n);
        break;
      case 'ul':
      case 'ol':
        out += renderList(n, ctx, 0);
        break;
      case 'pre': {
        const code = n.children.find((c) => c.tag === 'code') || n;
        const cls = (code.attrs && code.attrs.class) || (n.attrs && n.attrs.class) || '';
        const langMatch = /language-([a-zA-Z0-9+#-]+)/.exec(cls);
        const lang = langMatch ? langMatch[1] : '';
        let text = '';
        const collect = (x) => {
          if (x.tag === '#text') text += x.text;
          else if (x.tag === 'br') text += '\n';
          else (x.children || []).forEach(collect);
        };
        collect(code);
        text = text.replace(/\r/g, '').replace(/^\n+|\s+$/g, '');
        out += '```' + lang + '\n' + text + '\n```\n\n';
        break;
      }
      case 'blockquote': {
        const inner = renderBlocks(n.children || [], ctx).trim();
        out += inner.split('\n').map((l) => '> ' + l).join('\n') + '\n\n';
        break;
      }
      case 'hr':
        out += '---\n\n';
        break;
      case 'div':
      case 'section':
      case 'article':
      case 'main':
        out += renderBlocks(n.children || [], ctx);
        break;
      default: {
        const t = inline([n], ctx);
        if (t) out += t + '\n\n';
      }
    }
  }
  return out;
}

function convert(html) {
  const docs = extractDocs(html);
  const tree = parse(docs);
  let md = renderBlocks(tree.children, {});
  md = md.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  return md;
}

async function main() {
  const [cmd, a, b] = process.argv.slice(2);
  if (cmd === 'fetch') {
    const html = await fetchHtml(a);
    fs.mkdirSync(path.dirname(b), { recursive: true });
    fs.writeFileSync(b, html, 'utf8');
    console.log('saved ' + b + ' (' + html.length + ' chars)');
  } else if (cmd === 'md') {
    const md = convert(fs.readFileSync(a, 'utf8'));
    fs.mkdirSync(path.dirname(b), { recursive: true });
    fs.writeFileSync(b, md, 'utf8');
    console.log('saved ' + b + ' (' + md.length + ' chars)');
  } else if (cmd === 'url') {
    const html = await fetchHtml(a);
    const md = convert(html);
    fs.mkdirSync(path.dirname(b), { recursive: true });
    fs.writeFileSync(b, md, 'utf8');
    console.log('saved ' + b + ' (' + md.length + ' chars)');
  } else {
    console.error('用法: node tools/convert.js fetch|md|url <input> <output>');
    process.exit(1);
  }
}

module.exports = { convert, extractDocs, parse, renderBlocks, renderTable, renderCell, renderList, inline, textOf, fetchHtml };

if (require.main === module) {
  main().catch((e) => {
    console.error('ERROR: ' + e.message);
    process.exit(1);
  });
}
