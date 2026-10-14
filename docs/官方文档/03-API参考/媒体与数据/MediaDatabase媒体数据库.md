# Media Database（媒体数据库）
> 原文链接: https://webostv.developer.lge.com/develop/references/media-database ｜ 简体中文翻译

服务 URI - `luna://com.webos.mediadb`

支持应用将大型媒体相关数据集持久化地存储起来。

Media Database 服务使应用能够：

- 添加对象（Add objects）
- 更新对象（Update objects）
- 删除对象（Delete objects）
- 查询对象（Query objects）
- 管理对数据库中对象的访问（Manage access to objects within the database）

与 DB8 服务不同，Media Database 允许应用管理大型媒体数据集。

不过，Media Database 的使用方式与 Database（DB8）完全相同。要了解 webOS Database（DB8）服务及其使用方法，请参阅 [Database（DB8）](Database数据库.md)。

## 方法（Methods）

| 方法 | 描述 | 是否支持在模拟器中运行 |
| --- | --- | --- |
| [batch](#batch) | 使应用能够在一次服务请求中执行多个数据库操作。 | 是 |
| [del](#del) | 从数据库中删除 JSON 数据对象。 | 是 |
| [delKind](#delkind) | 从数据库中删除一个 kind。 | 是 |
| [find](#find) | 返回与 `query` 参数中指定的查询相匹配的一组对象。 | 是 |
| [get](#get) | 按 id 检索 JSON 数据对象。 | 是 |
| [merge](#merge) | 更新现有对象中的对象属性。 | 是 |
| [put](#put) | 将特定 kind 的 JSON 数据对象存储到数据库中。 | 是 |
| [putKind](#putkind) | 向数据库注册一个 kind JSON 对象。 | 是 |
| [putPermissions](#putpermissions) | 使其他应用或其他服务能够访问应用存储的 DB8 数据。 | 是 |
| [reserveIds](#reserveids) | 预分配一整块对象 id。 | 是 |
| [search](#search) | 支持用于全文搜索的 **?** 运算符。 | 是 |
| [watch](#watch) | 监视可能导致查询结果发生变化的数据库更新。 | 是 |

## batch

### 描述

使应用能够在一次服务请求中执行多个数据库操作。它只允许以下数据库操作：

- put
- get
- del
- find（不带 watch）
- merge

**不保证**批量操作之间的原子性。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [operations](#batchoperation) | 必需 | 对象数组（Object array） | 要执行的数据库操作列表。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [BatchResponse](#batchresponse) | 可选 | 对象（Object） | 如果方法成功，将返回 **BatchResponse** 对象。 |
| [ErrResponse](#errresponse) | 可选 | 对象（Object） | 如果方法失败，将返回 **ErrResponse** 对象。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3984 | No required key: "method" | 必需的数据库操作名称缺失。 |
| \-3984 | No required key: "params" | 数据库操作必需的参数缺失。 |
| \-3982 | db: invalid operation in batch | 在 **operations**（操作）参数中指定了错误或不支持的数据库操作。 |

### 示例（Example）

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
    console.log('The batch work is excuted');
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

### 返回示例（Return example）

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

### 另请参阅（See also）

- [del](#del)

## del

### 描述

从数据库中删除 JSON 数据对象。应用可以将对象指定为：

- 一组 id —— 这会返回一个 `PutResponse` 对象
- 一个 DB8 查询 —— 这会返回一个 `CountResponse` 对象

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| ids | 可选 | 字符串数组（String array） | 你想要删除的 JSON 对象 id 数组。如果你不希望指定 JSON 对象 id，则必须在 **query**（查询）参数中指定一个查询。 |
| [query](#query) | 可选 | 对象（Object） | 对一组待删除对象的查询。如果你不希望指定查询，则必须在 **ids** 参数中指定一个 JSON 对象 id 列表。 |
| purge | 可选 | 布尔值（Boolean） | 默认值为 **false**。<ul><li>false：目标对象只会被标记为删除。标记为删除的对象仍然可以恢复。只有当执行管理性清理操作时，它们才会被永久清除。</li><li>true：目标对象会被立即永久删除。</li></ul> |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [PutResponse](#putresponse) | 可选 | 对象（Object） | 当方法成功，且待删除对象是作为 JSON 对象 id 列表指定时，将返回 **PutResponse** 对象。 |
| [CountReponse](#countresponse) | 可选 | 对象（Object） | 当方法成功，且待删除对象是作为查询指定时，将返回 **CountResponse** 对象。 |
| [ErrResponse](#errresponse) | 可选 | 对象（Object） | 如果方法失败，将返回 **ErrResponse** 对象。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3963 | db: permission denied | 应用没有删除指定对象的权限。 |
| \-3965 | db: no index for query | 该查询引用了指定 kind 中不存在的索引。 |
| \-3962 | db: quota exceeded | 设备上没有足够的空间来完成此操作。建议应用将 **purge**（清理）设置为 true 后再次调用该方法。 |

### 示例（Example）

```javascript
// Delete data with ID
var request = webOS.service.request("luna://com.palm.db", {
	method: "del",
	parameters: {
		"ids" :["JHd3Dg427oB"]
	},
	onSuccess: function (inResponse) {
		console.log("The " + inResponse.results.id + "object is deleted");
		// To-Do something
	},
	onFailure: function (inError) {
		console.log("Failed to delete the obejct");
		console.log("[" + inError.errorCode + "]: " + inError.errorText);
		// To-Do something
		return;
	}
});

// Delete data with query
// Delete all data object from com.yourdomain.test:1 kind
var request = webOS.service.request("luna://com.palm.db", {
	method: "del",
	parameters: {
                "query" : {
                        "from" : "com.yourdomain.test:1"
                }
        },
	onSuccess: function (inResponse) {
		console.log("The " + inResponse.count " + object(s) is(are) deleted");
		// To-Do something
	},
	onFailure: function (inError) {
		console.log("Failed to delete the obejct");
		console.log("[" + inError.errorCode + "]: " + inError.errorText);
		// To-Do something
		return;
	}
});
```

### 返回示例（Return example）

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

### 另请参阅（See also）

- [delKind](#delkind)
- [put](#put)

## delKind

### 描述

从数据库中删除一个 kind。删除一个 kind 会删除该 kind 的**所有**数据对象。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| id | 必需 | 字符串（String） | 应用想要删除的 kind 的 id。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 可选 | 数值（Number） | 如果方法失败，errorCode 包含错误代码。方法仅在失败时返回 errorCode。<br>有关更多详细信息，请参阅此方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | 字符串（String） | 如果方法失败，errorText 包含错误文本。方法仅在失败时返回 errorText。<br>有关更多详细信息，请参阅此方法的错误代码参考（Error Codes Reference）。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3970 | db: kind not registered | 数据库中不存在指定的 kind。 |
| \-3999 | db: access denied | 数据库中确实存在指定的 kind，但应用没有删除权限。 |

### 示例（Example）

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

### 另请参阅（See also）

- [del](#del)
- [putKind](#putkind)

## find

### 描述

返回与 `query` 参数中指定的查询相匹配的一组对象。

应用可以指定要返回的结果数量。但是，如果应用不希望指定限制，则可以将 `count` 参数设置为 `true`。这会使 `find` 方法在 `FindResponse` 对象中返回结果的总数。

应用还可以请求在查询返回的结果将来发生任何变化时收到通知。要接收变更通知，请将 `watch` 参数设置为 `true`。

`find` 方法支持 distinct 分组，使应用能够去除重复对象。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [query](#query) | 必需 | 对象（Object） | 用于检索结果的 DB8 查询。 |
| count | 可选 | 布尔值（Boolean） | 默认值为 **false**。<br>如果应用没有对要返回的结果数量指定限制，并且希望知道返回结果的总数，则应将 **count** 参数设置为 **true**。 |
| watch | 可选 | 布尔值（Boolean） | 默认值为 **false**。<br>如果应用希望在返回结果发生任何变化时收到通知，则应将 **watch** 参数设置为 **true**。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [FindResponse](#findresponse) | 可选 | 对象（Object） | 如果方法成功，将返回 **FindResponse** 对象。 |
| [NotificationResponse](#notificationresponse) | 可选 | 对象（Object） | 如果应用将 **watch** 参数设置为 **true**，`find` 方法将返回 **NotificationResponse** 对象。 |
| [ErrResponse](#errresponse) | 可选 | 对象（Object） | 如果方法失败，将返回 **ErrResponse** 对象。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3970 | db: kind not registered | 数据库中未注册指定的 kind。 |
| \-3978 | db: invalid query | 查询语法正确，但包含拼写错误的命令或逻辑错误。 |
| \-3965 | db: no index for query | SELECT 查询包含所选 kind 中不存在的字段名。 |
| \-3963 | db: permission denied | 数据库中确实存在指定的 kind，但应用没有读取该 kind 数据的权限。 |

### 示例（Example）

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
    console.log('Failed to find the obejct with query');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

### 返回示例（Return example）

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

### 另请参阅（See also）

- [get](#get)
- [search](#search)

## get

### 描述

按 id 检索 JSON 数据对象。这是检索数据最快的方式。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| ids | 必需 | 字符串数组（String array） | 要检索的 JSON 数据对象的 id。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [GetResponse](#getresponse) | 可选 | 对象（Object） | 如果方法成功，将返回 **GetResponse** 对象。 |
| [ErrResponse](#errresponse) | 可选 | 对象（Object） | 如果方法失败，将返回 **ErrResponse** 对象。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3999 | db: access denied | 数据库中确实存在指定的对象，但应用没有访问该对象的权限。 |
| \-3950 | db: I/O error | 无法从数据库读取数据，这是一个严重错误。 |

### 示例（Example）

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
    console.log('Failed to get the obejct(s)');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

### 返回示例（Return example）

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

### 另请参阅（See also）

- [find](#find)
- [search](#search)

## merge

### 描述

更新现有对象中的对象属性。

对象可以用以下任一方式指定：

- 一个查询（query）
- 一个 ID 数组

可以使用查询（返回 CountResponse）或 ID 数组（返回 PutResponse）来指定对象。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| objects | 可选 | 对象数组（Object array） | 对象 id 列表以及应用需要合并的属性。如果未指定 **query**（查询）参数，则 **objects**（对象）参数是必需的。 |
| [query](#query) | 可选 | 对象（Object） | 指定一组对象的查询，应用想要更新这些对象的属性。<br>如果未指定 **objects**（对象）参数，则 **query**（查询）参数是必需的。 |
| props | 可选 | 对象（Object） | props 参数应指定要合并到 **query**（查询）参数所指定现有对象中的一组属性。如果应用在 **props**（属性）参数中指定了属性，则 **query**（查询）是必需的。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [PutResponse](#putresponse) | 可选 | 对象（Object） | 如果指定了 **objects**（对象）参数，且 **merge**（合并）方法成功，**merge** 将返回 **PutResponse** 对象。 |
| [CountResponse](#countresponse) | 可选 | 对象（Object） | 如果指定了 **query**（查询）参数，且 **merge**（合并）方法成功，**merge** 将返回 **CountResponse** 对象。 |
| [ErrResponse](#errresponse) | 可选 | 对象（Object） | 如果 **merge**（合并）方法失败，将返回 **ErrResponse** 对象。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3961 | db: quota exceeded | 应用已超出其配额，或者设备上没有可用空间。 |
| \-3963 | db: permission denied | 应用没有修改指定对象的权限。 |
| \-3965 | db: no index for query | 查询中包含对没有关联索引的对象属性的 SELECT。 |

### 示例（Example）

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
    console.log('Failed to update the obejct(s)');
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
    console.log('Failed to update the obejct(s)');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

### 返回示例（Return example）

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

### 另请参阅（See also）

- [del](#del)
- [put](#put)
- [watch](#watch)

## put

### 描述

将特定 kind 的 JSON 数据对象存储到数据库中。`put` 方法将会：

- 为每个对象分配一个 `id` 字段（如果未设置）
- 为每个已存储的对象返回 `id` 和 `rev`

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| objects | 必需 | 对象数组（Object array） | 应用想要存储到数据库中的特定 kind 的 JSON 数据对象列表。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [PutResponse](#putresponse) | 可选 | 对象（Object） | 如果方法成功，将返回 **PutResponse** 对象。 |
| [ErrResponse](#errresponse) | 可选 | 对象（Object） | 如果方法失败，将返回 **ErrResponse** 对象。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3962 | db: quota exceeded | 应用已超出其配额，或者设备上没有可用空间。 |
| \-3970 | db: kind not registered | 指定对象的 kind 未在数据库中注册。 |
| \-3963 | db: permission denied | 应用没有保存指定 kind 对象的权限。 |

### 示例（Example）

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
    console.log('Failed to add the obejct(s)');
    console.log('[' + inError.errorCode + ']: ' + inError.errorText);
    // To-Do something
    return;
  },
});
```

### 返回示例（Return example）

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

### 另请参阅（See also）

- [del](#del)
- [merge](#merge)
- [putKind](#putkind)

## putKind

### 描述

向数据库注册一个 kind JSON 对象。

kind 对象定义了 JSON 数据对象的所有者（owner）和索引（indexes）。索引可以由单个字段或多个字段组成。当创建索引时，请注意查询只能返回那些已建立索引、并且按连续顺序排列的结果。

如果应用或服务只想在对象的一部分属性被更新时才收到通知，则可以使用 revision sets（修订集）。

如果应用或服务创建的对象需要被其他应用或服务访问，请参阅 **[putPermissions](#putpermissions)** 方法了解更多信息。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| id | 必需 | 字符串（String） | kind JSON 对象的 id。 |
| owner | 必需 | 字符串（String） | kind JSON 对象的所有者。可能的值有：<ul><li>服务的 bus 地址，或者，</li><li>应用的 app ID</li></ul>只有所有者有权修改 kind JSON 对象。 |
| schema | 可选 | 对象（Object） | 特定 kind 的数据对象的 JSON 语法。如果设置，该 kind 的数据对象在存储之前会被校验。有关详细信息，请参阅 [http://www.json.org/](http://www.json.org/)。 |
| sync | 可选 | 布尔值（Boolean） | 此版本的 DB8 不支持。<br>默认值为 **false**。 |
| extends | 可选 | 字符串数组（String array） | kind 的父级 id 列表。 |
| [indexes](#indexclause) | 可选 | 对象（Object） | kind 索引。 |
| [revsets](#revsetclause) | 可选 | 对象数组（Object array） | 数据库修订集（revision sets）列表。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 可选 | 数值（Number） | 如果方法失败，errorCode 包含错误代码。方法仅在失败时返回 errorCode。<br>有关更多详细信息，请参阅此方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | 字符串（String） | 如果方法失败，errorText 包含错误文本。方法仅在失败时返回 errorText。<br>有关更多详细信息，请参阅此方法的错误代码参考（Error Codes Reference）。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3981 | db: invalid owner for kind | 指定的所有者没有添加或修改指定 kind 的权限。 |
| \-3962 | db: quota exceeded | 应用已超出其配额，或者没有足够的磁盘空间来创建指定的 kind。 |

### 示例（Example）

```javascript
var request = webOS.service.request('luna://com.palm.db', {
  method: 'putKind',
  parameters: {
    id: 'com.yourdomain.test:1',
    owner: 'com.yourdomain.test',
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

### 另请参阅（See also）

- [put](#put)
- [putPermissions](#putpermissions)

## putPermissions

### 描述

使其他应用或其他服务能够访问应用存储的 DB8 数据。

应用可以授予访问特定 kind 数据对象的权限。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| type | 必需 | 字符串（String） | 必须设置为 **db.kind**。 |
| object | 必需 | 字符串（String） | 应用想要提供访问权限的对象的 DB8 kind。 |
| caller | 必需 | 字符串（String） | 应用向其授予访问其数据权限的应用或服务的 id。 |
| [operations](#operation) | 必需 | 对象（Object） | 应用为其授予权限的数据库操作。 |
| create | 可选 | 字符串（String） | 要授予创建权限，请将该值设置为 **allow**。 |
| read | 可选 | 字符串（String） | 要授予读取权限，请将该值设置为 **allow**。 |
| update | 可选 | 字符串（String） | 要授予更新权限，请将该值设置为 **allow**。 |
| delete | 可选 | 字符串（String） | 要授予删除权限，请将该值设置为 **allow**。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 可选 | 数值（Number） | 如果方法失败，errorCode 包含错误代码。方法仅在失败时返回 errorCode。<br>有关更多详细信息，请参阅此方法的错误代码参考（Error Codes Reference）。 |
| errorText | 可选 | 字符串（String） | 如果方法失败，errorText 包含错误文本。方法仅在失败时返回 errorText。<br>有关更多详细信息，请参阅此方法的错误代码参考（Error Codes Reference）。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3999 | db: access denied | 没有修改某个 kind 权限的权限。 |

### 示例（Example）

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
  onSUccess: function (inResponse) {
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

### 另请参阅（See also）

- [putKind](#putkind)

## reserveIds

### 描述

预分配一整块对象 id。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| count | 必需 | 数值（Number） | 要预分配的 Id 数量。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [ReserveIdsResponse](#reserveidsresponse) | 可选 | 对象（Object） | 如果方法成功，将返回 **ReserveIdsResponse** 对象。 |
| [ErrResponse](#errresponse) | 可选 | 对象（Object） | 如果方法失败，将返回 **ErrResponse** 对象。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3968 | db: malformed id | 指定的 count 包含无效值。 |

### 示例（Example）

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

### 返回示例（Return example）

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

### 另请参阅（See also）

- [del](#del)
- [get](#get)
- [merge](#merge)
- [put](#put)

## search

### 描述

与 `find` 方法不同，`search` 方法调用支持 **?** 运算符。**?** 运算符可用于全文搜索。不过，`search` 方法明显较慢，只应用于全文逐字输入式搜索。`search` 方法不应用于检索要滚动显示在列表中的结果。

`search` 方法支持：

- 按任意属性排序（Ordering by any property）
- _Distinct method_（去重方法）去除重复对象
- 在 filter（筛选器）中使用 **%%** 运算符进行子字符串搜索

`search` 方法有一些限制：

- 必须为你正在搜索的字段建立索引。
- 搜索操作会查找以搜索字符串开头的内容。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [query](#query) | 必需 | 对象（Object） | 搜索查询。 |
| watch | 可选 | 布尔值（Boolean） | 默认值为 **false**。<br>如果应用希望在搜索结果发生任何变化时收到通知，则应将 watch（监视）参数设置为 **true**。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [FindResponse](#findresponse) | 可选 | 对象（Object） | 如果方法成功，将返回 **FindResponse** 对象。 |
| [NotificationResponse](#notificationresponse) | 可选 | 对象（Object） | 如果方法成功且应用已将 **watch** 参数设置为 true，search（搜索）将返回 **NotificationResponse** 对象。 |
| [ErrResponse](#errresponse) | 可选 | 对象（Object） | 如果方法失败，将返回 **ErrResponse** 对象。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3987 | db: invalid filter op | 在 filter（筛选器）中指定了无效的操作。 |
| \-3978 | db: invalid query | 查询中出现语法错误。 |
| \-3977 | db: collations on property do not match | 不同对象之间某个属性的排序（collation）序列不匹配。 |
| \-3975 | db: invalid combination of query operations | 查询语法正确，但包含逻辑错误。 |

### 示例（Example）

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
  onSuccess: function (inResponse) {
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

### 返回示例（Return example）

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

### 另请参阅（See also）

- [find](#find)
- [get](#get)

## watch

### 描述

监视可能导致查询结果发生变化的数据库更新。

### 参数（Parameters）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [query](#query) | 必需 | 对象（Object） | 应用想要监视其结果变化的查询。 |

### 调用返回值（Call returns）

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| [SuccessResponse](#successresponse) | 可选 | 对象（Object） | 如果 DB8 有足够资源将客户端添加到 "watch stack"（监视栈）中且方法成功，将返回 **SuccessResponse** 对象。 |
| [NotificationResponse](#notificationresponse) | 可选 | 对象（Object） | 如果 DB8 有足够资源添加到 "watch stack"（监视栈）中，并且 DB8 为查询找到了某些记录，将返回 **NotificationResponse** 对象。 |
| [ErrResponse](#errresponse) | 可选 | 对象（Object） | 如果方法失败，将返回 **ErrResponse** 对象。 |

### 错误参考（Error reference）

| 错误代码 | 错误消息 | 错误描述 |
| --- | --- | --- |
| \-3999 | db: access denied | 应用没有监视数据库的权限。 |

### 示例（Example）

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

### 返回示例（Return example）

```javascript
{
  "returnValue": true,
  "fired": true
}
```

### 另请参阅（See also）

- [merge](#merge)
- [put](#put)

## 对象（Object）

### object

用于表示要运行的 batch（批量）操作的 object 对象。

```json
{
  "method": string,
  "params": []
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| method | 必需 | 字符串（String） | 正在请求的操作。 |
| params | 必需 | 任意数组（Any array） | 取决于正在请求的操作类型。 |

### SuccessResponse object

指示操作成功或失败。

```javascript
// Schema
{
  "returnValue" : boolean
}
```

```javascript
// Example
{
  "returnValue": false
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |

### ErrResponse object

标准的错误响应，包含操作成功或失败标志、错误代码和错误消息。

```json
{
  "returnValue" : boolean,
  "errorCode" : int,
  "errorText" : string
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| errorCode | 必需 | 数值（Number） | 来自服务的错误代码。当请求失败时此属性可用。 |
| errorText | 必需 | 字符串（String） | 来自服务的错误消息。当请求失败时此属性可用。 |

### Query object

定义一个 db8 查询。

```javascript
// Schema
{
  "select" : string array,
  "from" : string,
  "where" : WhereClause array,
  "orderBy" : string,
  "desc" : boolean,
  "incDel" : boolean,
  "limit" : int,
  "page" : string
}
```

```javascript
// Example
{
  "select" : ["displayName", "state"],
  "from" : "com.mystuff.contacts:1",
  "where" : [{"prop":"state","op":"=","val":"CA"}],
  "orderBy" : "displayName",
  "desc" : true
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| select | 可选 | 字符串数组（String array） | 要返回的属性名数组。 |
| from | 必需 | 字符串（String） | 要从中检索结果的 kind 的名称。 |
| where | 可选 | 对象数组（Object array） | 要进行测试的子句数组。 |
| orderBy | 可选 | 字符串（String） | 按此属性对结果进行排序。 |
| desc | 可选 | 布尔值（Boolean） | 如果设置为 **true**，查询结果将按降序返回。 |
| incDel | 可选 | 布尔值（Boolean） | 如果设置为 **true**，查询结果将包含已删除的对象。**注意**：只有当你在 `putKind` 操作期间创建索引时将 `incDel` 字段设为 true，你才能请求此选项。否则，查询会以 "no index for this query"（此查询没有索引）消息失败。 |
| limit | 可选 | 数值（Number） | 指定要返回的最大结果数量（0-500）。默认值为 500。 |
| page | 可选 | 字符串（String） | 检索下一页结果时，作为查询 `page`（页码）属性传递的页面键。 |
| filter | 可选 | 对象数组（Object array） | 子句数组——仅在 search（搜索）方法中有效——与 WhereClause 相同。可以与 where 一起使用以执行范围搜索。 |

### IndexClause object

用于 putKind 方法中创建 kind 对象索引。请注意，索引决定了你的应用可以执行的查询类型。有关更多信息，请参阅 Queries and Indexing（查询与索引）。如果你希望将来的查询返回被标记为已删除的对象，请将 incDel 标志设置为 true。在管理性清理操作执行之前，对象不会被完全删除。

```javascript
//Schema
{
  "name" : string,
  "props" : IndexPropClause,
  "incDel" : boolean
}
```

```javascript
//Example
{
  "name" : "state",
  "props" : [{"name": "state"}],
  "incDel" : false
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 必需 | 字符串（String） | 索引名称。 |
| props | 必需 | 对象数组（Object array） | 一起建立索引的属性数组。 |
| incDel | 可选 | 布尔值（Boolean） | 如果 incDel 为 true，查询结果将包含已删除的对象。**注意**：只有当你在 `putKind` 操作期间创建索引时将 `incDel` 字段设为 true，你才能请求此选项。否则，查询会以 "no index for this query"（此查询没有索引）消息失败。 |

### IndexPropClause object

定义 IndexClause 的索引属性。

```json
{
  "name" : string,
  "collate" : string,
  "default" : any,
  "tokenize" : string,
  "type" : string
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| collate | 可选 | 字符串（String） | 指示用于排列索引的字符串比较例程。必须是以下之一：<ul><li>default：进行二进制比较。</li><li>primary：比较基本字符（例如，"a" < "b"），不考虑重音、大小写或音调符号。</li><li>secondary：字符中的重音被视为次要差异（例如，"as" < "às" < "at"）。字母之间的其他差异也可能被视为次要差异，具体取决于语言。当字符串中任何位置存在主要差异时，次要差异会被忽略。</li><li>tertiary：字符的大写和小写差异在第三级进行区分（例如，"ao" < "Ao" < "aò"）。此外，字母的变体形式在第三级上与基本形式有差异（例如 "A" 和 "?"）。当字符串中任何位置存在主要或次要差异时，第三级差异会被忽略。</li></ul> |
| default | 可选 | 任意（Any） | 插入时为该属性设置的默认值（如果不存在）。 |
| tokenize | 可选 | 字符串（String） | 指示字符串中的单词是否应被拆分，即 "Hello World" 是否应变成 "Hello" 和 "World" 以便进行索引。必须是以下之一：<ul><li>none：不进行分词。</li><li>default：使用该区域设置的默认值（可能会去除停用词）。停用词是为了便于索引而被移除的常见单词，例如 "the"、"a"、"an"、"is" 等。</li><li>all：对所有单词进行分词。</li></ul> |
| type | 必需 | 字符串（String） | single 或 multi。单一属性或多个属性。 |

### RevSetClause object

定义一个修订集（revision set）——即当其中某个属性被修改时你的应用可以被通知的那部分对象属性。有关更多信息，请参阅 Change Notification（变更通知）。

```json
{
  "name" : string,
  "props" : RevSetPropClause array
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 必需 | 字符串（String） | 修订集的名称（对该 kind 是唯一的）。 |
| prop | 必需 | 对象数组（Object array） | 要包含在修订集中的属性数组。 |

### PutResponse object

指示操作成功，并返回每个对象的 id 和 rev 字段。

```json
{
  "returnValue" : boolean,
  "results" : PutResult
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| results | 必需 | 对象数组（Object array） | 包含每个已 put 对象的 id 和 rev 的对象数组。 |

### PutResult object

在 PutResponse 中包含 JSON 数据对象的 id 和 rev 字段。

```json
{
  "id" : any,
  "rev" : any
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| id | 必需 | 任意（Any） | 已 put 对象的 ID。 |
| rev | 必需 | 任意（Any） | 对象的修订 ID。每个 db8 对象都有此 ID 字段。db8 维护一个全局的 rev id 计数器，每当一个 db8 对象被创建或更新时，该计数器都会递增。 |

### CountResponse object

受操作影响的对象数量。

```json
{
  "returnValue" : boolean,
  "count" : int
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| count | 必需 | 数值（Number） | 受操作影响的对象数量。 |

### FindResponse object

find objects 操作的响应。

```json
{
  "returnValue" : boolean,
  "results" : any,
  "count" : int,
  "next" : string
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| results | 必需 | 任意（Any） | db8 kind 数据对象数组。返回的内容取决于查询以及存储的内容。 |
| count | 可选 | 数值（Number） | 如果未指定 limit（限制）则会返回的结果数量。 |
| next | 可选 | 字符串（String） | 检索下一页结果时，作为查询 `page`（页码）属性传递的键。 |

### NotificationResponse object

通知调用者，从某个 find 方法返回的查询结果发生了变化。

```json
{
  "returnValue" : boolean,
  "fired" : boolean
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 可选 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| fired | 必需 | 布尔值（Boolean） | 变更通知标志。 |

### GetResponse object

get objects 操作响应的参数。

```json
{
  "returnValue" : boolean,
  "result" : any
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| result | 必需 | 对象数组（Object array） | 返回已存储的 db8 数据对象数组。 |

### BatchResponse object

batch（批量）操作的响应。

```json
{
  "returnValue" : boolean,
  "responses" : any array
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| responses | 必需 | 数组（Array） | batch（批量）中每个操作的响应数组。 |

### BatchOperation object

batch（批量）操作的方法和参数。

```json
{
  "method" : string,
  "params" : any
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| method | 必需 | 字符串（String） | 要执行的数据库操作。允许的值有：del、find、get、merge、put。 |
| params | 必需 | 字符串（String） | 数据库操作的参数列表。 |

### ReserveIdsResponse object

包含操作成功/失败标志以及 reserveIds 方法返回的已预分配 db8 ID 数组。

```json
{
  "returnValue" : boolean,
  "ids" : string array
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| returnValue | 必需 | 布尔值（Boolean） | 指示请求成功/失败的标志。<ul><li>true：成功</li><li>false：失败</li></ul> |
| ids | 可选 | 字符串数组（String array） | 已预分配的 ID 数组。 |

### WhereClause object

为 db8 Query 定义一条类似 SQL 的 JSON where 子句。

```javascript
// Schema
{
  "prop" : string,
  "op" : string,
  "val" : any,
  "collate" : string
}
```

```javascript
// Example
{
  "prop" : "state",
  "op" : "=",
  "val" : "CA"
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| prop | 必需 | 字符串（String） | 要进行测试的属性的名称。 |
| op | 必需 | 字符串（String） | 测试运算符。必须是以下之一：`<`、`<=`、`=`、`>=`、`>`、`!=`、`%`、`?`、`%%`（小于、小于或等于、等于、大于或等于、大于、不等于、通配符、全文）。`%` 运算符（即前缀运算符）将返回所有以指定值开头的结果。`%%` 运算符用于定位子串或部分字符串匹配。 |
| val | 必需 | 任意（Any） | 要对其进行测试的值。 |
| collate | 可选 | 字符串（String） | 指示用于排列结果的字符串比较例程。有关更多信息，请参阅 IndexPropClause 数据结构中的 collate 字段。 |

### FilterClause object

属于 Query 对象一部分的 Filter（筛选器）子句的定义。

```javascript
// Schema
{
  "prop" : string,
  "op" : string,
  "val" : any,
  "collate" : string
}
```

```javascript
// Example
{
  "prop" : "state",
  "op" : "=",
  "val" : "CA"
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| prop | 必需 | 字符串（String） | 要进行测试的属性的名称。 |
| op | 必需 | 字符串（String） | 测试运算符。必须是以下之一：`<`、`<=`、`=`、`>=`、`>`、`!=`、`?`、`%`、`%%`（小于、小于或等于、等于、大于或等于、大于、不等于、通配符、全文、部分文本）。`%` 运算符（即前缀运算符）将返回所有以指定值开头的结果。`%%` 运算符用于定位子串或部分字符串匹配。 |
| val | 必需 | 任意（Any） | 要对其进行测试的值。 |
| collate | 可选 | 字符串（String） | 指示用于排列结果的字符串比较例程。有关更多信息，请参阅 IndexPropClause 数据结构中的 collate 字段。 |

### RevSetPropClause object

RevSetClause 中的一个属性。

```json
{
  "name" : string
}
```

| 名称 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| name | 必需 | 字符串（String） | 要包含在修订集中的属性的名称。 |