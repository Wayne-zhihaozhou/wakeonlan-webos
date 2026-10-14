# Database（数据库）
> 原文链接: https://webostv.developer.lge.com/develop/references/database ｜ 简体中文翻译

Service URI - `luna://com.palm.db`

允许应用存储持久化数据。

DB8 是用于管理嵌入式 JSON 数据库的 API。DB8 允许应用存储持久化数据。DB8 提供了各种函数，允许对大量信息进行录入、存储和检索，同时也提供了管理这些信息组织方式的方法。

它提供以下数据管理功能：

-   添加对象
-   更新对象
-   删除对象
-   查询对象
-   管理对数据库中对象的访问

若要了解 webOS Database (DB8) 服务及其使用方法，请参阅 [Database (DB8)](../../02-开发指南/数据库DB8/DB8基础.md)。

**方法**

| 方法 | 描述 | 模拟器支持 |
| --- | --- | --- |
| [batch](#batch) | 允许应用在一次服务请求中执行多个数据库操作。 | 是 |
| [del](#del) | 从数据库中删除 JSON 数据对象。 | 是 |
| [delKind](#delkind) | 从数据库中删除一个 kind。 | 是 |
| [find](#find) | 返回一组与 `query` 参数中指定查询匹配的对象。 | 是 |
| [get](#get) | 按 ID 检索 JSON 数据对象。 | 是 |
| [merge](#merge) | 更新现有对象中的对象属性。 | 是 |
| [put](#put) | 将特定 kind 的 JSON 数据对象存储到数据库中。 | 是 |
| [putKind](#putkind) | 向数据库注册一个 kind。 | 是 |
| [putPermissions](#putpermissions) | 允许其他应用或服务访问应用所存储的 DB8 数据。 | 是 |
| [reserveIds](#reserveids) | 预留一块对象 ID。 | 是 |
| [search](#search) | 支持用于全文搜索的 **?** 运算符。 | 是 |
| [watch](#watch) | 监视数据库更新，此类更新会改变查询的结果。 | 是 |

## batch

**描述**

允许应用在一次服务请求中执行多个数据库操作。它仅允许以下数据库操作：

-   put
-   get
-   del
-   find（不带 watch）
-   merge

不保证批处理操作之间具备原子性。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [operations](#batchoperation) | 是 | 对象数组 | 要执行的数据库操作列表。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [BatchResponse](#batchresponse) | 否 | 对象 | 如果方法成功，将返回 **BatchResponse** 对象。 |
| [ErrResponse](#errresponse) | 否 | 对象 | 如果方法失败，将返回 **ErrResponse** 对象。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3984 | No required key: "method" | 缺少必需的数据库操作名称。 |
| \-3984 | No required key: "params" | 缺少数据库操作所需的参数。 |
| \-3982 | db: invalid operation in batch | 在 **operations** 参数中指定了不正确或不受支持的数据库操作。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'batch',
  parameters: {
    operations: [
      {
        method: 'put',
        params: {
          objects: [
            {
              _kind: 'com.yourdomain.test:1',
              sample: 'sample1',
              test: 'test1',
            },
          ],
        },
      },
      {
        method: 'merge',
        params: {
          query: {
            from: 'com.yourdomain.test:1',
            where: [
              {
                prop: 'sample',
                op: '=',
                val: 'sample1',
              },
            ],
          },
          props: {
            sample: 'sample2',
            test: 'test2',
          },
        },
      },
    ],
  },
  onSuccess: function (inResponse) {
    console.log('The batch work is executed');
    console.log(JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to execute the batch work');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例**

```javascript
{
  "responses": [
      {
          "returnValue": true,
          "results": [
              {
                  "id": "JHd3Dg427oB",
                  "rev": 21868
              }
          ]
      },
      {
          "count": 1,
          "returnValue": true
      }
  ],
  "returnValue": true
}
```

**另请参阅**

-   [del](#del)

## del

**描述**

从数据库中删除 JSON 数据对象。  
应用可以通过以下方式指定对象：

-   一组 ID
-   一个 DB8 查询

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| ids | 否 | 字符串数组 | 要删除的 JSON 对象 id 数组。如果不想指定 JSON 对象 id，则必须在 **query** 参数中指定一个查询。 |
| [query](#query) | 否 | 对象 | 用于指定要删除的一组对象的查询。如果不想指定查询，则必须在 **ids** 参数中指定 JSON 对象 id 列表。 |
| purge | 否 | 布尔值 | 默认值为 **false**。<ul><li>false：目标对象将仅被标记为删除。被标记为删除的对象仍可恢复。只有运行管理性清除操作时，它们才会被永久清除。</li><li>true：目标对象将立即被永久删除。</li></ul> |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [PutResponse](#putresponse) | 否 | 对象 | 当方法成功，且要删除的对象是通过 JSON 对象 id 列表指定时，将返回 **PutResponse** 对象。 |
| [CountResponse](#countresponse) | 否 | 对象 | 当方法成功，且要删除的对象是通过查询指定时，将返回 **CountResponse** 对象。 |
| [ErrResponse](#errresponse) | 否 | 对象 | 如果方法失败，将返回 **ErrResponse** 对象。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3963 | db: permission denied | 应用没有权限删除指定的对象。 |
| \-3965 | db: no index for query | 查询引用了一个在指定 kind 中不存在的索引。 |
| \-3962 | db: quota exceeded | 设备上没有足够的空间来完成此操作。建议应用将 **purge** 设置为 **true** 后再次调用该方法。 |

**示例**

```javascript
// Delete data with ID
var request = webOS.service.request('luna://com.palm.db', {
  method: 'del',
  parameters: {
    ids: ['JHd3Dg427oB'],
  },
  onSuccess: function (inResponse) {
    console.log('The ' + inResponse.results.id + 'object is deleted');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to delete the object');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});

// Delete data with query
// Delete all data object from com.yourdomain.test:1 kind
var request = webOS.service.request('luna://com.palm.db', {
  method: 'del',
  parameters: {
    query: {
      from: 'com.yourdomain.test:1',
    },
  },
  onSuccess: function (inResponse) {
    console.log('The ' + inResponse.count + 'object(s) is(are) deleted');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to delete the object');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例**

```javascript
// Result: Delete with ID 
{
  "returnValue": true,
  "results": [
      {
          "id": "J8rBI6u7uh+"
      }
  ]
}

// Result: Delete with Query
{
  "count": 11,
  "returnValue": true
}
```

**另请参阅**

-   [delKind](#delkind)
-   [put](#put)

## delKind

**描述**

从数据库中删除一个 kind。删除 kind 会删除该 kind 的**全部**数据对象。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| id | 是 | 字符串 | 应用想要删除的 kind 的 id。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 否 | 数字 | 如果方法失败，errorCode 包含错误代码。方法仅在失败时返回 errorCode。<br>有关详细信息，请参阅本方法的错误代码参考。 |
| errorText | 否 | 字符串 | 如果方法失败，errorText 包含错误文本。方法仅在失败时返回 errorText。<br>有关详细信息，请参阅本方法的错误代码参考。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3970 | db: kind not registered | 指定的 kind 在数据库中不存在。 |
| \-3999 | db: access denied | 指定的 kind 在数据库中存在，但应用没有删除权限。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'delKind',
  parameters: {
    id: 'com.yourdomain.test:1',
  },
  onSuccess: function (inResponse) {
    console.log('The kind is deleted');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to delete the kind');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**另请参阅**

-   [del](#del)
-   [putKind](#putkind)

## find

**描述**

返回一组与 **query** 参数中指定查询匹配的对象。

应用可以指定要返回的结果数量。但如果应用不想指定限制，可以将 **count** 参数设置为 **true**。这将使 **find** 方法在 **FindResponse** 对象中返回结果的总数。  
应用还可以请求在查询的任一返回结果将来发生变化时收到通知。要接收更改通知，请将 **watch** 参数设置为 **true**。

find 方法支持 group by（distinct），使应用能够移除重复对象。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [query](#query) | 是 | 对象 | 用于检索结果的 DB8 查询。 |
| count | 否 | 布尔值 | **count** 参数的默认值为 **false**。<br>如果应用没有指定返回结果数量的限制，并想知道返回的结果总数，则应将 **count** 参数设置为 **true**。 |
| watch | 否 | 布尔值 | **watch** 参数的默认值为 **false**。<br>如果应用想要在返回结果发生任何变化时收到通知，则应将 **watch** 参数设置为 **true**。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [FindResponse](#findresponse) | 否 | 对象 | 如果 **find** 方法成功，**find** 方法返回 **FindResponse** 对象。 |
| [NotificationResponse](#notificationresponse) | 否 | 对象 | 如果应用将 **watch** 参数设置为 **true**，**find** 方法返回 **NotificationResponse** 对象。 |
| [ErrResponse](#errresponse) | 否 | 对象 | 如果 **find** 方法失败，返回 **ErrResponse** 对象。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3970 | db: kind not registered | 指定的 kind 未在数据库中注册。 |
| \-3978 | db: invalid query | 查询语法正确，但包含拼写错误的命令或逻辑错误。 |
| \-3965 | db: no index for query | SELECT 查询包含所选 kind 不存在的字段名称。 |
| \-3963 | db: permission denied | 指定的 kind 在数据库中存在，但应用没有权限读取指定 kind 的数据。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'find',
  parameters: {
    query: {
      from: 'com.yourdomain.test:1',
      where: [{ prop: 'sample', op: '=', val: 'sample1' }],
    },
  },
  onSuccess: function (inResponse) {
    console.log(inResponse.results.length + ' object(s) is(are) found');
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to find the object with query');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例**

```javascript
{
  "returnValue": true,
  "results": [
      {
          "_rev": 21873,
          "sample": "sample2",
          "test": "test2",
          "_id": "JHdxo18aqjZ",
          "_kind": "com.yourdomain.test:1"
      },
      {
          "_rev": 21875,
          "sample": "sample2",
          "test": "test2",
          "_id": "JHdyO1clmYs",
          "_kind": "com.yourdomain.test:1"
      }
  ]
}
```

**另请参阅**

-   [get](#get)
-   [search](#search)

## get

**描述**

按 id 检索 JSON 数据对象。这是检索数据最快的方式。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| ids | 是 | 字符串数组 | 要检索的 JSON 数据对象的 id。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [GetResponse](#getresponse) | 否 | 对象 | 如果方法成功，将返回 **GetResponse** 对象。 |
| [ErrResponse](#errresponse) | 否 | 对象 | 如果方法失败，将返回 **ErrResponse** 对象。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3999 | db: access denied | 指定的对象在数据库中存在，但应用没有访问该对象的权限。 |
| \-3950 | db: I/O error | 无法从数据库读取，这是一个严重错误。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'get',
  parameters: {
    ids: ['J8rKTaBClIo'],
  },
  onSuccess: function (inResponse) {
    console.log(inResponse.results.length + ' object(s) is(are) retrieved');
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to get the object(s)');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例**

```javascript
{
  "returnValue": true,
  "results": [
      {
          "_rev": 21,
          "sample": "sample1",
          "test": "test1",
          "_id": "J8rKTaBClIo",
          "_kind": "com.yourdomain.test:1"
      }
  ]
}
```

**另请参阅**

-   [find](#find)
-   [search](#search)

## merge

**描述**

更新现有对象中的对象属性。

可以通过以下方式之一指定对象：

-   一个查询
-   一个 ID 数组

对象可以通过查询（返回 CountResponse）或 ID 数组（返回 PutResponse）来指定。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| objects | 否 | 对象数组 | **objects** 参数是一个对象数组，每个对象将包含一个 id 以及表示应用需要合并的对象属性的键/值对。如果未指定 **query** 参数，则 **objects** 参数是必需的。 |
| [query](#query) | 否 | 对象 | 用于指定应用想要更新其属性的一组对象的查询对象。<br>如果未指定 **objects** 参数，则 **query** 参数是必需的。 |
| props | 否 | 对象 | **props** 参数是一个包含键/值对的对象，用于指定要合并到 **query** 参数指定的现有对象中的一组属性。如果应用在 **props** 参数中指定属性，则 **query** 是必需的。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [PutResponse](#putresponse) | 否 | 对象 | 如果指定了 objects 参数，且方法成功，将返回 **PutResponse** 对象。 |
| [CountResponse](#countresponse) | 否 | 对象 | 如果指定了该参数，且 **merge** 方法成功，将返回 **CountResponse** 对象。 |
| [ErrResponse](#errresponse) | 否 | 对象 | 如果方法失败，将返回 **ErrResponse** 对象。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3961 | db: quota exceeded | 应用已超出其配额，或设备上没有可用空间。 |
| \-3963 | db: permission denied | 应用没有权限修改指定的对象。 |
| \-3965 | db: no index for query | 查询对某些对象属性进行了 SELECT，而这些属性没有关联的索引。 |

**示例**

```javascript
// Update object with ids and values
var request = webOS.service.request('luna://com.palm.db', {
  method: 'merge',
  parameters: {
    objects: [
      {
        _id: 'J8rKTaBClIo',
        test: 'test1',
        sample: 'sample_updated_value',
      },
    ],
  },
  onSuccess: function (inResponse) {
    console.log('The object(s) is(are) updated');
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to update the object(s)');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});

// Update data with query
var request = webOS.service.request('luna://com.palm.db', {
  method: 'merge',
  parameters: {
    query: {
      from: 'com.yourdomain.test:1',
      where: [
        {
          prop: 'sample',
          op: '=',
          val: 'sample1',
        },
      ],
    },
    props: {
      sample: 'sample_updated_value',
    },
  },
  onSuccess: function (inResponse) {
    console.log(inResponse.count + ' object(s) is(are) updated');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to update the object(s)');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例**

```javascript
// Return: Update object with ids and values
{
  "returnValue": true,
  "results": [
      {
          "id": "J8rKTaBClIo",
          "rev": 23
      }
  ]
}

// Return: Update data with query
{
  "count": 2,
  "returnValue": true
}
```

**另请参阅**

-   [del](#del)
-   [put](#put)
-   [watch](#watch)

## put

**描述**

将特定 kind 的 JSON 数据对象存储到数据库中。**put** 方法将：

-   为每个对象分配一个 **id** 字段（如果未设置）
-   返回每个已存储对象的 **id** 和 **rev**

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| objects | 是 | 对象数组 | 应用想要存储到数据库中的特定 kind 的 JSON 数据对象列表。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [PutResponse](#putresponse) | 否 | 对象 | 如果方法成功，将返回 **PutResponse** 对象。 |
| [ErrResponse](#errresponse) | 否 | 对象 | 如果方法失败，将返回 **ErrResponse** 对象。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3962 | db: quota exceeded | 应用已超出其配额，或设备上没有可用空间。 |
| \-3970 | db: kind not registered | 指定对象的 kind 未在数据库中注册。 |
| \-3963 | db: permission denied | 应用没有权限保存指定 kind 的对象。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'put',
  parameters: {
    objects: [
      {
        _kind: 'com.yourdomain.test:1',
        sample: 'sample1',
        test: 'test1',
      },
    ],
  },
  onSuccess: function (inResponse) {
    console.log('The object(s) is(are) added');
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to add the object(s)');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例**

```javascript
{
  "returnValue": true,
  "results": [
      {
          "id": "J8rTIa65u++",
          "rev": 27
      }
  ]
}
```

**另请参阅**

-   [del](#del)
-   [merge](#merge)
-   [putKind](#putkind)

## putKind

**描述**

向数据库注册一个 kind。  
kind 定义了 JSON 数据对象的所有者和索引。索引可以由单个或多个属性组成。创建索引时请注意，查询只能返回已建立索引且连续排序的结果。  
如果应用或服务只想在对象属性子集更新时收到通知，则可以使用 revision set（修订集）。  
如果应用或服务创建的对象需要被其他应用或服务访问，请参阅 [putPermissions](#putpermissions) 方法以了解更多信息。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| id | 是 | 字符串 | kind 的 id。 |
| owner | 是 | 字符串 | kind 的所有者。可能的值：<ul><li>服务的 bus 地址，或</li><li>应用的 app ID</li></ul>只有所有者才有权限修改该 kind。 |
| private | 否 | 布尔值 | private 参数在 webOS TV 3.0 或更高版本上可用。<ul><li>true：当应用被卸载时，该 kind 也会被移除。</li><li>false（默认）：当应用被卸载时，该 kind 不会被移除。</li></ul> |
| schema | 否 | 对象 | 如果定义 schema，则必须放入符合 schema 格式的有效数据。有关 schema 的更多信息，请参阅 [Schema 强制](../../02-开发指南/数据库DB8/DB8使用.md#schema-enforcement)。 |
| sync | 否 | 布尔值 | 允许应用启用特定 kind 对象的备份和恢复。<br>该参数的默认值为 **false**。<br>如果应用希望每天将对象备份到 LG 服务器并支持恢复，应将 **sync** 设置为 **true**。<br>如果用户更换到另一台设备，保存的应用数据可以被恢复。 |
| extends | 否 | 字符串数组 | kind 父级的 id 列表。 |
| [indexes](#indexclause) | 否 | 对象 | kind 的索引。 |
| [revsets](#revsetclause) | 否 | 对象数组 | 数据库修订集列表。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 否 | 数字 | 如果方法失败，errorCode 包含错误代码。方法仅在失败时返回 errorCode。<br>有关详细信息，请参阅本方法的错误代码参考。 |
| errorText | 否 | 字符串 | 如果方法失败，errorText 包含错误文本。方法仅在失败时返回 errorText。<br>有关详细信息，请参阅本方法的错误代码参考。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3981 | db: invalid owner for kind | 指定的所有者没有权限添加或修改指定的 kind。 |
| \-3962 | db: quota exceeded | 应用已超出其配额，或没有足够的可用磁盘空间来创建指定的 kind。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'putKind',
  parameters: {
    id: 'com.yourdomain.test:1',
    owner: 'com.yourdomain.test',
    private: true,
    indexes: [
      {
        name: 'sample',
        props: [{ name: 'sample' }],
      },
      {
        name: 'testsample',
        props: [{ name: 'test' }, { name: 'sample' }],
      },
    ],
  },
  onSuccess: function (inResponse) {
    console.log('The kind is created');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to create the kind');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**另请参阅**

-   [put](#put)
-   [putPermissions](#putpermissions)

## putPermissions

**描述**

允许其他应用或服务访问应用所存储的 DB8 数据。应用可以授予对特定 kind 的数据对象的访问权限。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| type | 是 | 字符串 | 必须设置为 **db.kind**。 |
| object | 是 | 字符串 | 应用想要提供访问权限的对象的 DB8 kind。 |
| caller | 是 | 字符串 | 应用授予其数据访问权限的应用或服务的 id。 |
| [operations](#operation) | 是 | 对象 | 应用授予权限的数据库操作。 |
| create | 否 | 字符串 | 要授予创建权限，请将 **create** 参数设置为 **allow**。 |
| read | 否 | 字符串 | 要授予读取权限，请将 **read** 参数设置为 **allow**。 |
| update | 否 | 字符串 | 要授予更新权限，请将 **update** 参数设置为 **allow**。 |
| delete | 否 | 字符串 | 要授予删除权限，请将 **delete** 参数设置为 **allow**。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 否 | 数字 | 如果方法失败，errorCode 包含错误代码。方法仅在失败时返回 errorCode。<br>有关详细信息，请参阅本方法的错误代码参考。 |
| errorText | 否 | 字符串 | 如果方法失败，errorText 包含错误文本。方法仅在失败时返回 errorText。<br>有关详细信息，请参阅本方法的错误代码参考。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3999 | db: access denied | 应用无法修改指定 kind 的权限。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'putPermissions',
  parameters: {
    permissions: [
      {
        operations: {
          read: 'allow',
          create: 'allow',
          update: 'allow',
          delete: 'allow',
        },
        object: 'com.yourdomain.test:1',
        type: 'db.kind',
        caller: 'com.yourdomain.testapp',
      },
    ],
  },
  onSuccess: function (inResponse) {
    console.log('The permission(s) is(are) set');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to set the permission(s)');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**另请参阅**

-   [putKind](#putkind)

## reserveIds

**描述**

预留一块对象 id。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| count | 是 | 数字 | 要预留的 id 数量。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [ReserveIdsResponse](#reserveidsresponse) | 否 | 对象 | 如果方法成功，将返回 **ReserveIdsResponse** 对象。 |
| [ErrResponse](#errresponse) | 否 | 对象 | 如果方法失败，将返回 **ErrResponse** 对象。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3968 | db: malformed id | 指定的 count 包含无效的值。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'reserveIds',
  parameters: {
    count: 3,
  },
  onSuccess: function (inResponse) {
    console.log(inResponse.ids.length + ' object ID(s) is(are) reserved');
    console.log('Result: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to reserve object IDs');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例**

```javascript
{
  "ids": [
      "J9FJ12j0Usk",
      "J9FJ12j18hJ",
      "J9FJ12j1Mic"
  ],
  "returnValue": true
}
```

**另请参阅**

-   [del](#del)
-   [get](#get)
-   [merge](#merge)
-   [put](#put)

## search

**描述**

支持 **?** 运算符。**?** 运算符可用于全文搜索。不过，**search** 方法明显更慢，应仅用于全文字的边输入边搜索。**search** 方法不应用于检索将要在列表中滚动的结果。  
**search** 方法支持：

-   按任意属性排序
-   使用 distinct 方法移除重复对象
-   在 filter 中使用 **%%** 运算符进行子字符串搜索

**search** 方法存在一些限制：

-   所搜索的字段必须建有索引。
-   搜索操作查找以搜索字符串开头的单词。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [query](#query) | 是 | 对象 | 用于搜索的查询。 |
| watch | 否 | 布尔值 | **watch** 参数的默认值为 **false**。<br>如果应用想要在搜索结果发生任何变化时收到通知，应将 watch 参数设置为 true。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [FindResponse](#findresponse) | 否 | 对象 | 如果方法成功，将返回 **FindResponse** 对象。 |
| [NotificationResponse](#notificationresponse) | 否 | 对象 | 如果方法成功且应用将 **watch** 参数设置为 true，search 将返回 **NotificationResponse** 对象。 |
| [ErrResponse](#errresponse) | 否 | 对象 | 如果方法失败，将返回 **ErrResponse** 对象。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3987 | db: invalid filter op | 在 filter 中指定了无效的操作。 |
| \-3978 | db: invalid query | 查询存在语法错误。 |
| \-3977 | db: collations on property do not match | 同一属性在不同对象之间的排序规则序列不匹配。 |
| \-3975 | db: invalid combination of query operations | 查询语法正确，但包含逻辑错误。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'search',
  parameters: {
    query: {
      from: 'com.yourdomain.test:1',
      where: [
        {
          prop: 'sample',
          op: '?',
          val: 'sample',
        },
      ],
    },
  },
  onComplete: function (inResponse) {
    console.log(inResponse.count + ' objects is(are) returned.');
    console.log('Results: ' + JSON.stringify(inResponse));
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to search');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例**

```javascript
{
  "count": 4,
  "returnValue": true,
  "results": [
    {
      "_rev": 22,
      "sample": "sample_updated_value",
      "test": "test1",
      "_id": "J8rKQDOvxdF",
      "_kind": "com.yourdomain.test:1"
    },
    {
      "_rev": 23,
      "sample": "sample_updated_value",
      "test": "test1",
      "_id": "J8rKTaBClIo",
      "_kind": "com.yourdomain.test:1"
    },
    {
      "_rev": 26,
      "sample": "sample1",
      "test": "test1",
      "_id": "J8rTH76hfcB",
      "_kind": "com.yourdomain.test:1"
    },
    {
      "_rev": 27,
      "sample": "sample1",
      "test": "test1",
      "_id": "J8rTIa65u++",
      "_kind": "com.yourdomain.test:1"
    }
  ]
}
```

**另请参阅**

-   [find](#find)
-   [get](#get)

## watch

**描述**

监视数据库的更新，此类更新会改变查询的结果。

**参数**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [query](#query) | 是 | 对象 | 应用想要监视其结果变化的查询。 |

**调用返回**

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [SuccessResponse](#successresponse) | 否 | 对象 | 如果 DB8 有足够资源将客户端添加到 "watch stack"，且 **watch** 方法成功，将返回 **SuccessResponse** 对象。 |
| [NotificationResponse](#notificationresponse) | 否 | 对象 | 如果 DB8 有足够资源添加到 "watch stack"，且 DB8 为查询找到某些记录，将返回 **NotificationResponse** 对象。 |
| [ErrResponse](#errresponse) | 否 | 对象 | 如果方法失败，将返回 **ErrResponse** 对象。 |

**错误参考**

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3999 | db: access denied | 应用没有权限监视数据库。 |

**示例**

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'watch',
  parameters: {
    query: {
      from: 'com.yourdomain.test:1',
      where: [
        {
          prop: 'sample',
          op: '=',
          val: 'sample1',
        },
      ],
    },
  },
  onSuccess: function (inResponse) {
    console.log('The object, which is met specified criteria, was found.');
    // To-Do something
  },
  onFailure: function (inError) {
    console.log('Failed to watch');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

**返回示例**

```javascript
{
  "returnValue": true,
  "fired": true
}
```

**另请参阅**

-   [merge](#merge)
-   [put](#put)

## 对象

### BatchOperation 对象

用于批处理操作的对象。

```javascript
{
  "method" : string,
  "params" : any
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| method | 是 | 字符串 | 要执行的数据库操作。<br>允许的值为：del、find、get、merge、put。 |
| params | 是 | 字符串 | 数据库操作的参数列表。 |

### BatchResponse 对象

对批处理操作的响应。

```javascript
{
  "returnValue": boolean,
  "responses"  : any array
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| responses | 是 | 数组 | 批处理中每个操作的响应数组。 |

### ErrResponse 对象

标准错误响应，包含操作成功/失败标志、错误代码和错误消息。

```javascript
{
  "returnValue": boolean,
  "errorCode"  : int,
  "errorText"  : string
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul>如果方法失败，方法将分别在 errorCode 和 errorText 字段中返回错误消息和错误消息描述。 |
| errorCode | 是 | 数字 | 数字错误代码。 |
| errorText | 是 | 字符串 | 来自服务的错误消息。此属性在请求失败时可用。 |

### Query 对象

定义 DB8 查询。

```javascript
// Schema
{
  "select"  : string array,
  "from"    : string,
  "where"   : WhereClause array,
  "orderBy" : string,
  "desc"    : boolean,
  "incDel"  : boolean,
  "limit"   : int,
  "page"    : string
}

// Example
{
  "select"  : ["displayName", "state"],
  "from"    : "com.mystuff.contacts:1",
  "where"   : [{"prop":"state","op":"=","val":"CA"}],
  "orderBy" : "displayName",
  "desc"    : true
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| select | 否 | 字符串数组 | 要返回的属性名称数组。 |
| from | 是 | 字符串 | 要从中检索结果的 kind 的名称。 |
| where | 否 | 对象数组 | 要测试的子句数组。 |
| orderBy | 否 | 字符串 | 按此属性对结果排序。 |
| desc | 否 | 布尔值 | 如果设置为 true，查询结果将按降序返回。 |
| incDel | 否 | 布尔值 | 如果 incDel 为 true，查询结果将包含已删除的对象。<br>注意：仅当你在 putKind 操作中创建索引时 incDel 字段为 true，你才可以请求此行为。否则，查询将以 "no index for this query" 消息失败。 |
| limit | 否 | 数字 | 指定要返回的最大结果数（0-500）。默认值为 500。 |
| page | 否 | 字符串 | 上一次查询返回的页码键。 |
| filter | 否 | 对象数组 | 子句数组——仅用于 search 方法——与 WhereClause 相同。可以与 where 一起使用以执行范围搜索。 |

### PutResponse 对象

指示操作成功，并为每个对象返回 id 和 rev 字段。

```javascript
{
  "returnValue" : boolean,
  "results"     : PutResult
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| results | 是 | 对象数组 | 包含每个已 put 对象的 id 和 rev 的对象数组。 |

### CountResponse 对象

操作影响的对象数量。

```javascript
{
  "returnValue" : boolean,
  "count"       : int
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| count | 是 | 数字 | 包含每个已 put 对象的 id 和 rev 的对象数组。 |

### FindResponse 对象

对 find 对象操作的响应。

```javascript
{
  "returnValue" : boolean,
  "results"     : any,
  "count"       : int,
  "next"        : string
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| results | 是 | 任意 | DB8 kind 数据对象数组。返回的内容取决于查询以及存储的内容。 |
| count | 否 | 数字 | 如果未指定 limit，本应返回的结果数量。 |
| next | 否 | 字符串 | 在检索下一页结果时，作为查询 "page" 属性传入的键。 |

### NotificationResponse 对象

通知调用方从 "find" 调用返回的查询结果发生了变化。

```javascript
{
  "returnValue" : boolean,
  "fired"       : boolean
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 否 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| fired | 是 | 布尔值 | 变化通知标志。 |

### GetResponse 对象

get 对象操作响应的参数。

```javascript
{
  "returnValue" : boolean,
  "results"     : any
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| results | 是 | 对象数组 | 返回已存储的 DB8 数据对象数组。 |

### IndexClause 对象

用于在 putKind 调用中创建 kind 对象索引。注意，索引决定了应用可以进行的查询类型。有关更多信息，请参阅 Queries and Indexing。如果希望未来的查询返回被标记为删除的对象，请将 incDel 标志设置为 true。对象在运行管理性清除操作之前不会被完全删除。

```javascript
//Schema
{
  "name"    : string,
  "props"   : IndexPropClause,
  "incDel"  : boolean 
}

//Example
{
  "name"   : "state",
  "props"  : [{"name": "state"}],
  "incDel" : false
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 是 | 字符串 | 索引名称。 |
| props | 是 | 对象数组 | 要一起索引的属性数组。 |
| incDel | 否 | 布尔值 | 如果 incDel 为 true，查询结果将包含已删除的对象。<br>注意：仅当你在 putKind 操作中创建索引时 incDel 字段为 true，你才可以请求此行为。否则，查询将以 "no index for this query" 消息失败。 |

### RevSetClause 对象

定义修订集——对象属性的一个子集，当其中某个属性被修改时，你的应用可以收到通知。有关更多信息，请参阅 Change Notification。

```javascript
// Schema
{
  "name"  : string,
  "props" : RevSetPropClause array
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 是 | 字符串 | 修订集的名称（对该 kind 唯一）。 |
| props | 是 | 对象数组 | 要包含在修订集中的属性数组。 |

### operation 对象

用于表示要运行的批处理操作的对象。  
（此对象与产品中的格式不同。以下对象示例是针对 TV 产品的）。

```javascript
{
  "method" : string,
  "params" : []
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| method | 是 | 字符串 | 所请求的操作。 |
| params | 是 | 任意数组 | params 将取决于所请求的操作类型。 |

### ReserveIdsResponse 对象

包含操作成功/失败标志以及从 "reserveIds" 调用返回的预留 db8 ID 数组。

```javascript
{
  "returnValue" : boolean,
  "ids"         : string array
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| ids | 否 | 字符串数组 | 预留的 ID 数组。 |

### SuccessResponse 对象

指示操作成功或失败。

```javascript
// Schema
{
  "returnValue"  : boolean
}

// Example
{
  "returnValue": false
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 是 | 布尔值 | 表示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |

### WhereClause 对象

为 DB8 Query 定义类似 SQL 的 JSON where 子句。

```javascript
// Schema
{
  "prop"    : string,
  "op"      : string,
  "val"     : any,
  "collate" : string
}
// Example
{
  "prop"    : "state",
  "op"      : "=",
  "val"     : "CA"
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| prop | 是 | 字符串 | 要测试的属性名称。 |
| op | 是 | 字符串 | 测试运算符。必须是以下之一：<、<=、=、>=、>、!=、%、?、%%（小于、小于或等于、等于、大于或等于、大于、不等于、通配符以及全文）。% 运算符（又称前缀运算符）将返回所有以指定值开头的匹配项。%% 运算符用于定位子字符串或部分字符串匹配。 |
| val | 是 | 任意 | 要测试的值。 |
| collate | 否 | 字符串 | 指示用于对结果排序的字符串比较例程。有关更多信息，请参阅 IndexPropClause 数据结构中的 collate 字段。 |

### FilterClause 对象

作为 Query 对象一部分的 Filter 子句的定义。

```javascript
// Schema
{
  "prop"    : string,
  "op"      : string,
  "val"     : any,
  "collate" : string
}

// Example
{
  "prop" : "state",
  "op"   : "=",
  "val"  : "CA"
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| prop | 是 | 字符串 | 要测试的属性名称。 |
| op | 是 | 字符串 | 测试运算符。必须是以下之一：<、<=、=、>=、>、!=、%、?、%%（小于、小于或等于、等于、大于或等于、大于、不等于、通配符、全文以及部分文本）。% 运算符（又称前缀运算符）将返回所有以指定值开头的匹配项。%% 运算符用于定位子字符串或部分字符串匹配。 |
| val | 是 | 任意 | 要测试的值。 |
| collate | 否 | 字符串 | 指示用于对结果排序的字符串比较例程。有关更多信息，请参阅 IndexPropClause 数据结构中的 collate 字段。 |

### PutResult 对象

包含 PutResponse 中 JSON 数据对象的 "id" 和 "rev" 字段。

```javascript
// Schema
{
  "id"    : any,
  "rev"   : any
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| id | 是 | 任意 | 已 put 对象的 ID。 |
| rev | 是 | 任意 | 对象的修订 ID。每个 DB8 对象都有此 ID 字段。DB8 维护一个全局 rev id 计数器，每当 DB8 对象被创建或更新时，该计数器都会递增。 |

### IndexPropClause 对象

为 IndexClause 定义索引属性。

```javascript
// Schema
{
  "name"     : string,
  "collate"  : string,
  "default"  : any,
  "tokenize" : string,
  "type"     : string
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 是 | 字符串 | 正在被索引的属性名称。 |
| collate | 是 | 字符串 | 指示用于对索引排序的字符串比较例程。必须是以下之一：<ul><li>default：执行二进制比较。</li><li>primary：比较基础字符（例如，"a" < "b"），不考虑重音、大小写或声调符号。</li><li>secondary：字符中的重音被视为次要差异（例如，"as" < "às" < "at"）。字母之间的其他差异也可能被视为次要差异，具体取决于语言。当字符串任意位置存在主差异时，次要差异将被忽略。</li><li>tertiary：字符的大小写差异在第三级被区分（例如，"ao" < "Ao" < "aò"）。此外，字母的变体在第三级上不同于基本形式（例如 "A" 和 "?"）。当字符串任意位置存在主差异或次差异时，第三级差异将被忽略。</li></ul> |
| default | 否 | 任意 | 插入时为该属性设置的默认值（如果不存在）。 |
| tokenize | 否 | 字符串 | 指示是否应将字符串中的单词拆分，即 "Hello World" 是否应变成 "Hello" 和 "World" 用于索引目的。必须是以下之一：<ul><li>none：不进行分词。</li><li>default：使用语言环境的默认设置（可能剥离停用词）。停用词是为索引目的而被剥离的常见词，例如 "the"、"a"、"an"、"is" 等。</li><li>all：对所有单词进行分词。</li></ul> |
| type | 是 | 字符串 | single 或 multi。单个属性或多个属性。 |

### RevSetPropClause 对象

用于 RevSetPropClause 的对象。

```javascript
{
  "name"     : string
}
```

| 名称 | 必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 是 | 字符串 | 要包含在修订集中的属性名称。 |
