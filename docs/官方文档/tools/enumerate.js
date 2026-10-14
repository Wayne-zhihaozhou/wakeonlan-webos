// 枚举 Develop 文档树的全部页面链接
const https = require('https');
const fs = require('fs');

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(get(new URL(res.headers.location, url).href));
          return;
        }
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' ' + url));
        const c = [];
        res.on('data', (d) => c.push(d));
        res.on('end', () => resolve(Buffer.concat(c).toString('utf8')));
      })
      .on('error', reject);
  });
}

const seeds = [
  'https://webostv.developer.lge.com/develop/getting-started',
  'https://webostv.developer.lge.com/develop/guides',
  'https://webostv.developer.lge.com/develop/references',
  'https://webostv.developer.lge.com/develop/samples',
  'https://webostv.developer.lge.com/develop/specifications',
  'https://webostv.developer.lge.com/develop/tools',
];

(async () => {
  const found = new Map(); // url -> 出现次数
  for (const s of seeds) {
    let html;
    try {
      html = await get(s);
    } catch (e) {
      console.error('skip ' + s + ': ' + e.message);
      continue;
    }
    for (const m of html.matchAll(/href="(\/develop\/[^"#?]*)"/g)) {
      found.set(m[1], (found.get(m[1]) || 0) + 1);
    }
  }
  const list = [...found.keys()].sort();
  fs.writeFileSync('.staging/links.json', JSON.stringify(list, null, 2));
  console.log('共 ' + list.length + ' 个链接');
  console.log(list.join('\n'));
})();
