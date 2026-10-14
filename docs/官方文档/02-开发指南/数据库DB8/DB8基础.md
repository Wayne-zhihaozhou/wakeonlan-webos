# DB8 基础
> 原文链接: https://webostv.developer.lge.com/develop/guides/db8-basic ｜ 简体中文翻译

DB8 是 webOS TV 的一种存储方式（storage method）。DB8 旨在满足稳健、高性能应用的需求。DB8 是 Luna Bus 上提供的一项服务（service），其接口对接一个内嵌的 JSON 数据库（embedded JSON database）。

如需了解如何从应用或服务调用此服务的信息，请参见 [Database API](../../03-API参考/媒体与数据/Database数据库.md)（数据库 API）或 [Media Database API](../../03-API参考/媒体与数据/MediaDatabase媒体数据库.md)（媒体数据库 API）。您也可以在 [GitHub 仓库](https://github.com/webOS-TV-app-samples/DB8)中查看代码示例并下载示例应用。

在下面的主题说明中，我们假设您已具备数据库概念和 SQL 的基础知识。

## DB8 主要特性

DB8 的主要特性包括：

- 支持高速访问与查询（high-speed access and queries）。
- 存储 JSON 对象。
- 支持应用感知的访问控制（app-aware access control）。
- 支持分页（paging），每次查询最多可检索 500 个对象。
- 支持变更通知（change notification）。
- 通过模式强制（schema enforcement）实现数据对象校验。

## 快速上手

要在代码中使用 DB8 存储，请按照以下步骤操作。

1. 确定您要在数据库中存储什么内容。
2. 确定您的索引（index）是什么。这一点至关重要，因为索引决定了您能够进行的查询类型。
3. 使用 [putKind()](../../03-API参考/媒体与数据/Database数据库.md#putkind) 方法创建一个 kind（种类）。现在您的应用就可以将数据对象存储到所创建的 kind 中。
4. 使用 [put()](../../03-API参考/媒体与数据/Database数据库.md#put) 方法开始存储您的数据。

## DB8 JSON 对象

DB8 存储两种类型的 JSON 对象：

- Kind 对象（种类对象）：您可以把它理解为数据库中我们通常所说的"表"（table）。该对象为 JSON 数据对象定义 owner（属主）、schema（模式）和 indexes（索引）。在 DB8 中，这些对象被称为 kind。在数据对象被保存之前，其定义的 kind 对象必须先通过 [putKind()](../../03-API参考/媒体与数据/Database数据库.md#putkind) 调用进行存储和注册。
- 数据对象（Data object）：某种特定 kind 下包含数据的 JSON 对象。它类似于面向对象编程中类的实例化对象。

提示（Tip）

JSON 是一种轻量级的数据交换文本格式，它基于 JavaScript 编程语言的一个子集，既便于人类读写，也便于机器解析和生成。与 XML 一样，JSON 包含名称/值对的集合以及有序的值列表（即数组）。关于 JSON 对象的格式及 JSON 的更多信息，请参见以下网站：[http://www.json.org/](http://www.json.org/)

JSON 对象格式简述：

- 使用花括号（'{', '}'）来括住对象。
- 使用方括号（'[', ']'）来括住数组。
- 使用冒号（':'）作为名称/值的分隔符。
- 使用引号（"）表示字符串值。数值和布尔值不需要加引号。

### 示例

让我们看一些对象示例来帮助理解。在创建 kind 对象之前，我们按照[快速上手](DB8基础.md#getting-started)中的指引，先确定要在数据库中存储什么内容。让我们创建一个通讯录（contacts）数据库。我们将把联系人信息存储在数据库中。

#### 数据对象

经过充分讨论，我们决定存储如下形式的联系人信息：

```shell
{
    "displayName"  : "John Doe",
    "name"         : {"familyName":"Doe", "givenName":"John"},
    "nickname"     : "Skippy",
    "emails"       : [ "jdoe@gmail.com", "john.doe@palm.com", "jdoe99@gmail.com" ]
}
```

上述 JSON 对象的定义如下所示：

```shell
{
    "displayName" : string,
    "name"        : {
        "familyName" : string,
        "givenName"  : string
    },
    "nickname"    : string,
    "emails"      : string array
}
```

#### Kind 对象

在存储我们上面定义的数据对象之前，我们需要一个`**table**`（表）来存储数据对象。您可以使用 [putKind()](../../03-API参考/媒体与数据/Database数据库.md#putkind) 方法创建一个 kind 对象。该方法的参数大致如下所示：

```shell
{
    "id"      :  "com.yourdomain.contact:1",
    "owner"   :  "com.yourdomain.contacts",
    "extends" :  ["PimObject:1"],
    "indexes" :  [{"name":"dname", "props":[{"name":"displayName"}]}]
}
```

kind 对象的属性如下。这些属性可以在使用 [putKind()](../../03-API参考/媒体与数据/Database数据库.md#putkind) 方法注册 kind 时定义。

| 属性 | 说明 |
| --- | --- |
| id | 对象的全局唯一标识符（globally unique identifier）。即使对象包含在另一个对象中，也会被分配该标识；如果没有分配 id，则由数据库自动分配一个。它被设计为 JSON 对象内部的一个不透明对象（opaque object）——不要对该字段做任何假设。 |
| extends | 用于继承。Kind 可以扩展其他 kind。在上面的示例中，contacts（通讯录）kind 扩展自 PimObject kind。 |
| owner | 属主应用 ID。只有属主有权修改该 kind。 |
| indexes | 决定您可以进行的查询类型。更多信息请参阅 [DB8 索引](DB8使用.md#all-queries-must-be-on-indexed-fields)。在上面的示例中，只定义了一个索引。 |

## 特殊属性

有一些 DB8 分配给对象的特殊属性。根据 JSON DB 的惯例，这些属性以下划线（`_`）为前缀来区分。正因为如此，应用不能创建以下划线开头的属性。

目前，DB8 会为存储对象分配以下特殊属性。

| 特殊属性 | 说明 |
| --- | --- |
| _id | 对象的全局唯一标识符。即使对象包含在另一个对象中，也会被分配该标识。如果尚未分配，则由数据库分配一个。它被设计为 JSON 对象内部的一个不透明对象，因此建议您的代码不要对该字段做任何假设。 |
| _rev | DB8 中的每个对象实例（无论对象类型如何）都维护一个全局唯一的修订计数器（revision counter），该计数器在每次对象更新或变更后递增。每次对象被修改时，DB8 服务都会为该对象分配这个计数器。任何两个对象的该属性值都不可能是相同的。您可以将此数字用作同步的基础点，也可以在查询中使用它，例如检索自某个特定修订号以来的所有变更。 |
| _kind | 您必须指定这个字符串类型的 kind 标识符。通常的做法是使用属主应用 ID。 |

以下是一个分配了特殊属性的通讯录对象示例：

```shell
{
    "_id"          : "2+n4",
    "_rev"         : 276,
    "_kind"        : "com.yourdomain.contact:1",
    "displayName"  : "John Doe",
    "name"         : {"familyName":"Doe", "givenName":"John"},
    "nickname"     : "Skippy",
    "emails"       : [ "jdoe@gmail.com", "john.doe@palm.com", "jdoe99@gmail.com" ]
}
```

## 原子性与乐观并发（Atomicity & optimistic concurrency）

对于更新对象而言，原子性（atomicity）意味着要么整个更新全部发生并提交到数据库，要么全部不发生。在 DB8 中，在单次方法调用中完成的所有更新（即插入或删除多个对象）都是原子的。不支持将多个操作原子地组合在一起的批处理操作（batch operations）。不支持应用级事务。如果支持的话，数据库锁可能会被长时间持有，从而可能阻塞其他应用，包括用户正在等待的应用。您可以实现一种乐观并发（optimistic concurrency）机制来确保原子性。这涉及以下步骤：

1. 获取一个对象并记录其修订值（`**_rev**`）。
2. 修改该对象。
3. 使用一个指定对象 id 和修订值（**`_id`** 和 `**_rev**`）的查询执行条件合并（conditional merge）操作。
4. 如果修订号已发生变化（表明对象已被修改），则重复上述循环并重试。
