# tools/ 维护脚本

## 当前结构相关

| 脚本 | 用途 |
| --- | --- |
| `restructure-zh.js` | 本次「删除无关文档 + 中文分类 + 文件名中文化」的完整映射与执行脚本。表 `M` 记录了 **旧路径 → 新中文路径** 的全部对应关系，`rewriteLinks()` 记录了链接改写规则。`--dry` 只校验映射，`--readme` 仅按映射表重新生成仓库根目录的 `README.md`。 |
| `check-links-zh.js` | 校验全部文档中的本地相对链接是否可解析，并检查文件名是否已中文化。 |

```
node tools/check-links-zh.js      # 链接与文件名体检
node tools/restructure-zh.js --readme   # 重新生成 README 目录
```

## 导入流水线（历史脚本）

以下脚本用于最初从 `webostv.developer.lge.com` 抓取并转换文档，输入为 `.staging/`（英文原文）
与官网 HTML，输出为**整理前**的 `develop/` 目录结构。仓库重分类后这些脚本不再与当前目录结构对应，
保留作为溯源与重新抓取的参考。

`enumerate.js`、`enumerate-more.js`、`convert.js`、`split.js`、`merge.js`、`normalize.js`、
`reorder.js`、`build.js`、`cleanup.js`、`gen-readme.js`、`check-*.js`、
`verify*.js`、`fix-*.js`、`find-en-headers.js`、`pending.js`、`progress.js`
