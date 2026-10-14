// 批量抓取 Develop 文档并转换为英文 Markdown（供翻译使用）
// 用法: node tools/build.js [--force]
const fs = require('fs');
const path = require('path');
const { fetchHtml, convert } = require('./convert.js');

const ROOT = path.resolve(__dirname, '..');
const STAGE = path.join(ROOT, '.staging', 'en');
const BASE = 'https://webostv.developer.lge.com';

// guides 中缺失的设计指南页面 -> 本地中文路径
const GUIDE_TARGETS = {
  'design-principles': '01-设计指南/设计原则.md',
  'home-screen': '01-设计指南/系统UI/主屏幕.md',
  'notifications': '01-设计指南/系统UI/通知.md',
  'interacting-with-apps': '01-设计指南/系统UI/与应用交互.md',
  'virtual-keyboard': '01-设计指南/系统UI/虚拟键盘.md',
  'magic-remote': '01-设计指南/系统UI/魔法遥控器.md',
  icon: '01-设计指南/样式/图标.md',
  overscan: '01-设计指南/样式/过扫描.md',
  color: '01-设计指南/样式/颜色.md',
  'privacy-guideline': '01-设计指南/隐私指南.md',
};

const SECTION_DIR = {
  'getting-started': 'develop/getting-started',
  guides: 'develop/guides',
  references: 'develop/references',
  specifications: 'develop/specifications',
  tools: 'develop/tools',
  samples: 'develop/samples',
};

// 已存在的中文译文（guides 部分），跳过
const EXISTING = new Set(
  fs
    .readdirSync(ROOT, { recursive: true })
    .filter((f) => typeof f === 'string' && f.endsWith('.md'))
    .map((f) => f.replace(/\\/g, '/'))
);

function targetFor(urlPath) {
  const parts = urlPath.split('/').filter(Boolean); // develop, <section>, <slug...>
  const section = parts[1];
  const slug = parts.slice(2).join('/');
  const dir = SECTION_DIR[section];
  if (!dir) return null;
  if (!slug) return `${dir}/00-索引.md`;
  if (section === 'guides') {
    const t = GUIDE_TARGETS[slug];
    return t ? t : null; // 其他 guides 页面已翻译
  }
  return `${dir}/${slug}.md`;
}

async function main() {
  const force = process.argv.includes('--force');
  const links = JSON.parse(fs.readFileSync(path.join(ROOT, '.staging', 'links.json'), 'utf8'));
  fs.mkdirSync(STAGE, { recursive: true });
  const manifest = [];

  for (const urlPath of links) {
    const target = targetFor(urlPath);
    if (!target) continue;
    const slug = urlPath.replace(/^\/develop\//, '').replace(/\//g, '__') || 'index';
    const enFile = path.join(STAGE, slug + '.md');
    let md;
    if (!force && fs.existsSync(enFile)) {
      md = fs.readFileSync(enFile, 'utf8');
    } else {
      const url = BASE + urlPath;
      try {
        const html = await fetchHtml(url);
        md = convert(html);
        fs.writeFileSync(enFile, md, 'utf8');
      } catch (e) {
        console.error('FAIL ' + url + ': ' + e.message);
        continue;
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    const title = (md.split('\n')[0] || '').replace(/^#\s*/, '');
    manifest.push({
      url: BASE + urlPath,
      path: urlPath,
      en: path.relative(ROOT, enFile).replace(/\\/g, '/'),
      target,
      title,
      chars: md.length,
      targetExists: EXISTING.has(target),
    });
    console.log(`${String(md.length).padStart(7)}  ${target}  <- ${urlPath}`);
  }
  fs.writeFileSync(path.join(ROOT, '.staging', 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('\n合计 ' + manifest.length + ' 页；其中目标已存在 ' + manifest.filter((m) => m.targetExists).length + ' 页');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
