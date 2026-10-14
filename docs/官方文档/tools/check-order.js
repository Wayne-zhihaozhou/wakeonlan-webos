// 校验：允许译文首行 H1 被省略的情况（比较时按偏移对齐）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const lv = (t) => (t.match(/^(#{1,6})\s/gm) || []).map((s) => s.trim().length);

for (const [zhRel, enRel] of [
  ['develop/references/ble-gatt.md', '.staging/en/references__ble-gatt.md'],
  ['develop/tools/cli-dev-guide.md', '.staging/en/tools__cli-dev-guide.md'],
  ['develop/tools/webos-tv-cli-dev-guide.md', '.staging/en/tools__webos-tv-cli-dev-guide.md'],
]) {
  const a = lv(fs.readFileSync(path.join(ROOT, zhRel), 'utf8')).slice(1); // 去掉新增头部标题
  const b = lv(fs.readFileSync(path.join(ROOT, enRel), 'utf8'));
  let shifted = null;
  if (a.length === b.length - 1) shifted = a.every((v, k) => v === b[k + 1]);
  const exact = a.length === b.length && a.every((v, k) => v === b[k]);
  console.log(`${zhRel}: ZH=${a.length} EN=${b.length} -> ${exact ? '完全一致 ✔' : shifted ? '整体错位 1（译文省略了正文 H1）✔' : '不一致 ✘'}`);
  if (!exact && !shifted) {
    for (let k = 0; k < Math.max(a.length, b.length); k++) {
      if (a[k] !== b[k]) {
        console.log(`    首个差异 @${k}: ZH=${a[k]} EN=${b[k]}`);
        break;
      }
    }
  }
}
