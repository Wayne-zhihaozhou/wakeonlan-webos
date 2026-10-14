// 快速枚举 develop 之外站点的章节规模
const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return resolve(get(new URL(res.headers.location, url).href));
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        const c = [];
        res.on('data', (d) => c.push(d));
        res.on('end', () => resolve(Buffer.concat(c).toString('utf8')));
      })
      .on('error', reject);
  });
}
const seeds = ['/discover', '/distribute', '/faq', '/more/glossary', '/more/netcast', '/news', '/notice'];
(async () => {
  const all = new Set();
  for (const s of seeds) {
    try {
      const html = await get('https://webostv.developer.lge.com' + s);
      const links = new Set();
      for (const m of html.matchAll(/href="(\/(?:discover|distribute|faq|more|news|notice)\/[^"#?]*)"/g)) links.add(m[1]);
      links.forEach((l) => all.add(l));
      console.log(`${s} -> ${links.size} 个子页面`);
    } catch (e) {
      console.log(`${s} -> 失败: ${e.message}`);
    }
  }
  console.log('\n合计 ' + all.size + ' 个页面:');
  console.log([...all].sort().join('\n'));
})();
