# DB8 常见问题
> 原文链接: https://webostv.developer.lge.com/develop/guides/db8-faq ｜ 简体中文翻译

查找有关 DB8 服务的常见问题解答。

**Q1. DB8 数据库是否有大小限制？**

总的来说，所有应用或服务共享 10 MB 的限制。Media DB 也是如此，所有应用或服务共享 10 MB 的限制。

**Q2. 如何让单个应用无法耗尽全部 10 MB？**

目前没有办法…！用户可以把所有空间分配给一个他们真正在意的应用。

**Q3. 应用如何知道是否有可用存储空间以及有多少可用空间？**

目前没有方法可以做到这一点。

**Q4. 当数据库已满而应用试图保存到数据库时会发生什么？**

应用会收到一个"空间不足"（out-of-space）错误。

**Q5. 是否可以同时打开多个 DB8 数据库？**

只有一个共享的 DB8 数据库。应用或服务可以针对该数据库注册多个 kind（种类）。

**Q6. DB8 如何处理排序和查询中的非英文字符（大写/小写）？**

这取决于系统区域设置（locale）以及索引中定义的排序强度（collation strength）。如果未设置 collate 属性，则按 UTF-8 码点排序。

-   如果设置了 `"collate": "primary"`，则会使用特定于区域设置的规则进行不区分大小写和口音（accent）的排序（在搜索时这通常是你想要的）。
-   如果设置了 `"collate": "secondary"`，则在期望依赖口音排序的区域设置中会考虑口音（通常在你显示排序列表时是你想要的）。

如需更多信息，请阅读关于排序概念的内容，了解[排序强度（collation strengths）](https://unicode-org.github.io/icu/userguide/collation/concepts.html)。请注意，查询上定义的 collate 属性必须与索引上定义的 collate 属性相匹配。
