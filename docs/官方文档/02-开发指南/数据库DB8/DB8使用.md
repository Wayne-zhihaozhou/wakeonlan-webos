# DB8 使用指南
> 原文链接: https://webostv.developer.lge.com/develop/guides/db8-usage ｜ 简体中文翻译

## 查询与索引

### 查询格式与运算符

一条 DB8 查询采用如下 JSON 对象的形式。

```javascript
{
    "select"  : string array,
    "from"    : string,
    "where"   : [ {
        "prop"    : string,
        "op"      : string,
        "val"     : any
  } ]
    "orderBy" : string,
    "desc"    : boolean,
    "incDel"  : boolean,
    "limit"   : integer,
    "page"    : string
}
```

各字段的说明请参见《Database API 参考指南》中的 Query 对象。

例如，假设我们要完成下面的任务。

> 获取所有居住在加利福尼亚州的联系人的显示名（display name）与状态（state），按显示名排序，以倒序返回，包含已删除的记录，最多返回 40 条记录，并使用上一条查询返回的 "next page"（下一页）键。

那么我们的查询对象将如下所示：

```javascript
{
    "select"  : ["displayName", "state"],
    "from"    : "com.yourdomain.contacts:1",
    "where"   : [{"prop":"state","op":"=","val":"CA"}],
    "orderBy" : "displayName",
    "desc"    : true,
    "incDel"  : true,
    "limit"   : 40,
    "page"    : "BGhlbGxvAAs3"
}
```

查询允许你做以下事情：

-   指定如下过滤运算符。

    | 运算符 | 说明 |
    | --- | --- |
    | \=  | 等于 |
    | <   | 小于 |
    | \>  | 大于 |
    | \>= | 大于或等于 |
    | !=  | 不等于 |
    | %   | 通配符 |
    | ?   | 全文搜索 |

    虽然并没有特定的范围过滤运算符，但你可以在两个 where 子句中通过其他过滤运算符（例如 \`>\` 和 \`<\`）来实现范围查询。\`%\` 运算符（即前缀运算符）是一种通配符——它将返回所有以你指定的值开头的匹配项。例如：

    ```javascript
    "where":[{
      "prop":"displayName",
      "op":"%",
      "val":"J"
    }]
    ```

    这条 where 子句返回所有 displayName 字段以 'J' 开头的对象。

    在 SQL 中，这个 JSON 格式的 where 子句看起来如下：

    ```javascript
    WHERE displayName LIKE 'J%'
    ```

-   按指定的字段以升序或降序排列对象。

-   限制返回对象的数量（最大为 500）。

-   获取在没有设置 limit 的情况下会返回的对象数量。

-   使用一条查询返回的页标识符（键）来获取下一页对象。

### 所有查询都必须基于已索引的字段

需要特别注意的是，所有查询都必须基于已索引的字段进行，而你创建的 _indexes_（索引）属性决定了你能执行哪些类型的查询。这意味着两件事：

1.  你只能查询已索引的属性。

2.  你的查询仅限于那些能够通过索引表（index table）中的连续结果（contiguous results）来回答的查询。

当你通过 [putKind()](../../03-API参考/媒体与数据/Database数据库.md#putkind) 调用创建 kind 时，需要用 [IndexClause 对象](../../03-API参考/媒体与数据/Database数据库.md#indexclause) 来定义 **\`indexes\`** 属性。

你可以为 kind 创建多个索引，每个索引可以由多个属性组成。索引中的每个条目都是一个值的数组。例如，以我们在《DB8 服务基础》中见过的例子来说，如果你创建一个多属性索引，它首先由 **\`state\`** 属性构成，然后由 **\`displayName\`** 属性构成，那么这些条目将如下所示：

```javascript
["CA", "John Doe"], ["CA", "Mabel Syrup"], ["OR", "Don Juan"]...
```

这些索引首先按 **\`state\`** 排序，然后按 **\`displayName\`** 排序。这意味着如果你按 **\`state\`** 查询（即 state = "CA"），你可以得到结果，因为 state 的值在索引中是连续排序的；但如果你按 **\`displayName\`** 查询，则无法得到结果。

结果不仅必须连续排序，而且必须预先保证它们是连续排序的。这是什么意思呢？让我们看一个例子；给定下面的 [state, displayName] 索引：

```javascript
["CA", "Helen Wheels"], ["CA", "Jerry Seinfeld"], ["CA", "John Doe"], ["CA", "Mabel Syrup"], ["CA", "Tony Soprano"]
```

你可以对单个 **\`displayName\`** 条目进行搜索，例如 **\`"where" :\[&#123;"prop":"displayName", "op":"=", "val":"Tony Soprano"&#125;\]\`**，这将返回一条结果。它满足连续排序的标准，但无法预先保证这一点。属性值并不保证唯一，而且可能在不同的州存在多个 "Tony Soprano" 条目。为了解决这个问题，你可以创建一个额外的索引，该索引首先由 **\`displayName\`** 构成，并（可选地）在其后再加其他属性。

在创建索引以及考虑你的数据将如何被访问时，你需要牢记以上信息。

## 模式强制（Schema enforcement）

DB8 服务提供了一种机制，用于在使用 [put()](../../03-API参考/媒体与数据/Database数据库.md#put) 方法存储 JSON 数据对象时对其进行验证。你的应用或服务可以在使用 [putKind()](../../03-API参考/媒体与数据/Database数据库.md#putkind) 方法通过 schema 属性创建数据对象的 kind 时进行此验证。对于该字段，请按照官方 JSON 标准输入对象的 JSON schema（模式）。

以下是一个使用 Enyo 的 serviceRequest API 说明该机制如何工作的简单示例。

1.  创建一个带 schema 的 kind：

    ```javascript
    var request = new enyo.ServiceRequest();
    var parameter = {
      id: 'com.yourdomain.schema.test:1',
      // Define schema here
      // （在此处定义 schema）
      schema: {
        id: 'com.yourdomain.schema.test:1',
        type: 'object',
        properties: {
          _kind: {
            type: 'string',
            value: 'com.yourdomain.schema.test:1',
          },
          foo: {
            type: 'string',
            description: 'foo string',
          },
          bar: {
            type: 'string',
            description: 'bar string',
          },
          isMember: {
            type: 'boolean',
            description: 'Is member flag',
          },
        },
      },
      owner: 'com.yourdomain.dbtest',
      indexes: [
        {
          name: 'foo',
          props: [{ name: 'foo' }],
        },
        {
          name: 'barfoo',
          props: [{ name: 'bar' }, { name: 'foo' }],
        },
      ],
    };
    request.service = 'luna://com.palm.db/putKind';
    request.response(this, 'registerDatabaseKindResponse');
    request.error(this, 'registerDatabaseKindError');
    request.go(parameter);
    ```

    创建 kind 完成后，将调用下面两个处理器之一。

    ```javascript
    registerDatabaseKindResponse: function(inSender, inResponse) {
        enyo.log("Schema test, putKind success!");
    },
    registerDatabaseKindError: function(inSender, inResponse) {
        enyo.log("Schema test, putKind failure!");
    },
    ```

    如果 kind 创建成功，你将在日志中看到以下输出。

    ```shell
    Schema test, putKind success!
    ```

2.  存储一个包含第 1 步所定义 schema 中所有必填字段的对象：

    ```javascript
    var testObj = {
      _kind: 'com.yourdomain.schema.test:1',
      foo: 'myFoo',
      bar: 'myBar',
      isMember: true,
    };
    var objs = [testObj];
    var request = new enyo.ServiceRequest();
    var parameter = { objects: objs };
    request.service = 'luna://com.palm.db/put';
    request.response(this, 'putDataIntoDatabaseResponse');
    request.error(this, 'putDataIntoDatabaseError');
    request.go(parameter);
    ```

    存储对象的请求完成后，将调用下面两个处理器之一。

    ```javascript
    putDataIntoDatabaseResponse: function(inSender, inResponse) {
        enyo.log("Schema test, put success!");
    },
    putDataIntoDatabaseError: function(inSender, inResponse) {
        enyo.log("Schema test, put failure!");
    },
    ```

    你将在日志中看到以下输出。

    ```shell
    Schema test, put success!
    ```

3.  尝试存储一个缺少必填字段的对象：

    ```javascript
    var incompletedObj = {
      _kind: 'com.yourdomain.schema.test:1',
      foo: 'myFoo',
      bar: 'myBar',
    };
    objs = [incompletedObj];

    var request = new enyo.ServiceRequest();
    var parameter = { objects: objs };
    request.service = 'luna://com.palm.db/put';
    request.response(this, 'putDataIntoDatabaseResponse');
    request.error(this, 'putDataIntoDatabaseError');
    request.go(parameter);
    ```

    由于你的请求不符合已注册的 schema，你将在日志中看到以下输出。

    ```shell
    Schema test, put failure!
    ```

4.  尝试存储一个含有错误类型值的字段的对象：

    ```javascript
    var invalidObj = {
      _kind: 'com.palm.schema.test:1',
      foo: 'myFoo',
      bar: 'myBar',
      isMember: 'true',
    };
    objs = [invalidObj];

    var request = new enyo.ServiceRequest();
    var parameter = { objects: objs };
    request.service = 'luna://com.palm.db/put';
    request.response(this, 'putDataIntoDatabaseResponse');
    request.error(this, 'putDataIntoDatabaseError');
    request.go(parameter);
    ```

    与第 3 步类似，你的请求不符合已注册的 schema，你将在日志中看到以下输出。

    ```shell
    Schema test, put failure!
    ```

## 变更通知

只有使用 **\`revision sets\`**（修订集合）时，你才能在对象属性的一个子集被更新时收到通知。例如，同步引擎可能只想在联系人的电话号码发生变化时才收到通知。revision set 会创建一个属性，该属性仅在该集合中的某个属性被更新时才被更新。

如果在 **\`phoneNumber\`** 属性上使用名为 **\`phoneRev\`** 的 revision set，则会创建一个 **\`phoneRev\`** 属性，其整数值在 **\`phoneNumber\`** 属性被更新时被设置为 **\`\_rev\`** 的当前值。这使得应用能够创建一个形如 "where phoneRev > X" 的查询的 watch（监视器），以便在电话号码被更新时收到通知。

Revision sets 在创建 kind 时通过 [putKind()](../../03-API参考/媒体与数据/Database数据库.md#putkind) 方法指定。下面为 _state_ 属性创建一个 revision set：

```javascript
//**
//** Note here that the revision set field ("stateRev") is added
//** to the indexes so that we can query on it later.
//** （请注意，这里将 revision set 字段（"stateRev"）添加到了索引中，
//**  以便我们稍后能对它进行查询。）
//**
var indexes = [
  {
    name: 'state',
    props: [{ name: 'state' }],
  },
  {
    name: 'stateRev',
    props: [{ name: 'stateRev' }],
  },
];
var revSets = [
  {
    name: 'stateRev',
    props: [{ name: 'state' }],
  },
];

var request = new enyo.ServiceRequest();
var parameter = {
  id: 'com.yourdomain.sample:1',
  owner: 'com.yourdomain.dbtest',
  indexes: indexes,
  revSets: revSets,
};
request.service = 'luna://com.palm.db/putKind';
request.go(parameter);
```

kind 创建完成后，我们将使用 [put()](../../03-API参考/媒体与数据/Database数据库.md#put) 方法放入一条联系人数据。

```javascript
var contact = {
  _kind: 'com.yourdomain.sample:1',
  name: 'Mabel Syrup',
  state: 'CA',
};
var objs = [contact];
var parameter = { objects: objs };

var request = new enyo.ServiceRequest();
request.service = 'luna://com.palm.db/put'; // putting data into DB（将数据放入数据库）
request.response(this, 'putDataIntoDatabaseResponse');
request.go(parameter);
```

"putting"（写入）完成时，将调用以下处理器。

```javascript
putDataIntoDatabaseResponse: function(inSender, inResponse) {
    if (inResponse.returnValue === true) {
        enyo.log("put success! results=" + JSON.stringify(inResponse.results));
    } else {
        enyo.log("put failure!");
    }
}
```

你将在日志中看到以下输出。

```shell
put success! results=[{"id":"++HEIviIqT+9MYkj","rev":4881}]
```

在你 "put" 一条记录之后，我们将使用 [get()](../../03-API参考/媒体与数据/Database数据库.md#get) 获取 revision set 的编号。

```javascript
var id = '++HEIviIqT+9MYkj';
var ids = [id1];
var parameter = { ids: ids };
var request = new enyo.ServiceRequest();
request.service = 'luna://com.palm.db/get';
request.go(parameter);
```

作为结果，你将看到以下内容。

```shell
get success!, results ={
  "returnValue":true,
  "results":[
  {
    "_id":"++HEIviIqT+9MYkj",
    "_kind":"com.yourdomain.sample:1",
    "_rev":4881,
    "name":"Mabel Syrup",
    "state":"CA",
    "stateRev":4881
  }]
}
```

使用 revision set 的编号，当修订号被修改时你可以收到通知。请注意，如果你想对 revision set 进行查询，那么必须为它建立一个索引（参见上面的 putKind 示例）。以下是调用 [watch()](../../03-API参考/媒体与数据/Database数据库.md#watch) 方法的示例（在结果中 _fired_ 标志为 true）：

```javascript
var fquery = {
    "from":"com.yourdomain.sample:1",
    "where":[
        {
            "prop":"stateRev",
            "op":">",
            "val":4881
        }
    ]
};

var parameter = {"query": fquery};
var request = new enyo.ServiceRequest();
request.service = "luna://com.palm.db/watch"; // watch（监视）
request.go(parameter);
```

如果随后 _state_ 字段被更新，watch 就会触发。例如，下面的 [merge()](../../03-API参考/媒体与数据/Database数据库.md#merge) 就会触发它：

```javascript
var mprops = { "state":"MA"};
var mquery = {
    "from":"com.yourdomain.sample:1",
    "where":[
        {"prop":"state","op":"%","val":"C"}
    ]
};
var parameter = { "query": mquery, "props": mprops };
var request = new enyo.ServiceRequest();
request.service = "luna://com.palm.db/merge";
request.go(parameter);
```
