/**
 * check-links-zh.js — 校验所有文档中的本地相对链接是否可解析，并检查文件名是否已中文化。
 * 用法： node tools/check-links-zh.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const docs = [];
(function walk(rel) {
  for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
    if (e.name === '.staging' || e.name === 'tools') continue;
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) walk(r);
    else if (e.name.endsWith('.md')) docs.push(r);
  }
})('');

let broken = 0, local = 0, external = 0;
for (const d of docs) {
  const text = fs.readFileSync(path.join(ROOT, d), 'utf8');
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    let t = m[1];
    if (/^(https?:|mailto:|#)/.test(t)) { external++; continue; }
    if (t.startsWith('/develop')) { broken++; console.log(`[站点路径未改写] ${d} -> ${t}`); continue; }
    const target = decodeURI(t.split('#')[0]);
    local++;
    if (!fs.existsSync(path.join(ROOT, path.dirname(d), target))) {
      broken++; console.log(`[死链] ${d} -> ${t}`);
    }
  }
}

const asciiOnly = docs.filter((d) => /^[\x00-\x7F]+$/.test(path.basename(d)) && path.basename(d) !== 'README.md');
console.log(`\n文档 ${docs.length} 篇 | 本地链接 ${local} | 站外链接 ${external} | 死链 ${broken}`);
console.log(asciiOnly.length ? '未中文化文件名:\n  ' + asciiOnly.join('\n  ') : '文件名检查: 全部已中文化 ✔');
process.exit(broken || asciiOnly.length ? 1 : 0);
