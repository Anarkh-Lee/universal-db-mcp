# HTTP API 参考文档

## 概述

Universal Database MCP Server HTTP API 提供 RESTful 端点和 MCP 协议端点用于数据库操作。此 API 支持 17 种数据库类型，包括会话管理、API Key 认证、速率限制和 CORS 支持等功能。

**基础 URL**: `http://localhost:3000`（可通过 `HTTP_PORT` 环境变量配置）

**API 版本**: 1.0.0

## 认证

除 `/api/health` 和 `/api/info` 外，所有端点（包括 REST API 和 MCP SSE/Streamable HTTP 端点）都需要 API Key 认证。

> **注意**: 如果未配置 `API_KEYS` 环境变量，则跳过认证（开发模式）。

### 认证方式

**方式 1: X-API-Key 请求头**
```http
X-API-Key: your-secret-key
```

**方式 2: Authorization Bearer Token**
```http
Authorization: Bearer your-secret-key
```

### 配置

通过环境变量设置 API Keys：
```bash
API_KEYS=key1,key2,key3
```

### 错误响应

**401 未授权** - 缺少 API Key
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "需要 API Key。请提供 X-API-Key 请求头或 Authorization: Bearer <key>"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

**403 禁止访问** - 无效的 API Key
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "无效的 API Key"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

## 速率限制

默认：每个 API Key（或 IP）每分钟 100 次请求

**配置**:
```bash
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m  # 1m, 1h, 1d
```

**超出限制响应** (429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求过多，请稍后重试"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

## API 端点

### MCP 协议端点

MCP（Model Context Protocol）端点允许 Dify 等 AI 平台通过 MCP 协议直接连接数据库。

#### SSE 端点（传统方式）

##### GET /sse

建立 SSE 连接，数据库配置通过 URL 参数传递。

**URL 参数**:
| 参数 | 必填 | 描述 |
|------|------|------|
| `type` | 是 | 数据库类型 |
| `host` | 是* | 数据库主机 |
| `port` | 否 | 数据库端口 |
| `user` | 是* | 用户名 |
| `password` | 是* | 密码 |
| `database` | 是* | 数据库名称 |
| `filePath` | 是* | SQLite 文件路径 |
| `allowWrite` | 否 | 启用写操作（默认: false） |

*必填字段取决于数据库类型

**请求示例**:
```bash
curl "http://localhost:3000/sse?type=mysql&host=localhost&port=3306&user=root&password=secret&database=mydb" \
  -H "X-API-Key: your-secret-key"
```

##### POST /sse/message

向 SSE 会话发送消息。

**查询参数**:
- `sessionId` (字符串, 必需): SSE 会话 ID

**请求示例**:
```bash
curl -X POST "http://localhost:3000/sse/message?sessionId=your-session-id" \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

#### Streamable HTTP 端点（MCP 2025 规范，推荐）

##### POST /mcp

MCP Streamable HTTP 端点，数据库配置通过请求头传递。

**请求头参数**:
| 请求头 | 必填 | 描述 |
|--------|------|------|
| `X-API-Key` | 是* | API 密钥（或使用 Authorization Bearer） |
| `X-DB-Type` | 是 | 数据库类型 |
| `X-DB-Host` | 是* | 数据库主机 |
| `X-DB-Port` | 否 | 数据库端口 |
| `X-DB-User` | 是* | 用户名 |
| `X-DB-Password` | 是* | 密码 |
| `X-DB-Database` | 是* | 数据库名称 |
| `X-DB-FilePath` | 是* | SQLite 文件路径 |
| `X-DB-Allow-Write` | 否 | 启用写操作（默认: false） |
| `mcp-session-id` | 否 | 后续请求的会话 ID |

*必填字段取决于数据库类型；如果配置了 API_KEYS 则需要认证

**初始化请求示例**:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -H "X-DB-Type: mysql" \
  -H "X-DB-Host: localhost" \
  -H "X-DB-Port: 3306" \
  -H "X-DB-User: root" \
  -H "X-DB-Password: secret" \
  -H "X-DB-Database: mydb" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}'
```

**后续请求示例**（使用会话 ID）:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: your-session-id" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}'
```

##### GET /mcp

获取 Streamable HTTP 的 SSE 流。

**请求头**:
- `mcp-session-id` (字符串, 必需): 会话 ID
- `X-API-Key` (字符串, 必需*): API 密钥

##### DELETE /mcp

关闭 MCP 会话。

**查询参数或请求头**:
- `sessionId` 或 `mcp-session-id`: 会话 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:3000/mcp?sessionId=your-session-id" \
  -H "X-API-Key: your-secret-key"
```

#### MCP 工具

通过 MCP 协议连接后，以下工具可用：

| 工具名 | 描述 |
|--------|------|
| `execute_query` | 执行 SQL 查询或数据库命令 |
| `get_schema` | 获取数据库结构信息 |
| `get_table_info` | 获取指定表的详细信息 |
| `clear_cache` | 清除 Schema 缓存 |

### REST API 端点

### 健康检查和信息

#### GET /api/health

健康检查端点（无需认证）。

**请求示例**:
```bash
curl http://localhost:3000/api/health
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600.5,
    "timestamp": "2026-01-27T12:00:00.000Z"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### GET /api/info

服务信息端点（无需认证）。

**请求示例**:
```bash
curl http://localhost:3000/api/info
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "name": "universal-db-mcp",
    "version": "1.0.0",
    "mode": "http",
    "supportedDatabases": [
      "mysql", "postgres", "redis", "oracle", "dm",
      "sqlserver", "mongodb", "sqlite", "kingbase",
      "gaussdb", "oceanbase", "tidb", "clickhouse",
      "polardb", "vastbase", "highgo", "goldendb"
    ]
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

### 连接管理

#### POST /api/connect

连接到数据库并创建会话。

**请求体**:
```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "your_password",
  "database": "mydb",
  "allowWrite": false
}
```

**参数说明**:
- `type` (字符串, 必需): 数据库类型（mysql, postgres, redis, oracle, dm, sqlserver, mongodb, sqlite, kingbase, gaussdb, oceanbase, tidb, clickhouse, polardb, vastbase, highgo, goldendb）
- `host` (字符串, 非 SQLite 必需): 数据库主机
- `port` (数字, 非 SQLite 必需): 数据库端口
- `user` (字符串, 可选): 用户名
- `password` (字符串, 可选): 密码
- `database` (字符串, 可选): 数据库名称
- `filePath` (字符串, SQLite 必需): SQLite 数据库文件路径
- `authSource` (字符串, MongoDB 可选): 认证数据库（默认: admin）
- `allowWrite` (布尔值, 可选): 启用写操作（默认: false）

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "password",
    "database": "testdb"
  }'
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessionId": "V1StGXR8_Z5jdHi6B-myT",
    "databaseType": "mysql",
    "connected": true
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

**错误响应** (500):
```json
{
  "success": false,
  "error": {
    "code": "CONNECTION_FAILED",
    "message": "用户 'root'@'localhost' 访问被拒绝"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### POST /api/disconnect

断开数据库连接并关闭会话。

**请求体**:
```json
{
  "sessionId": "V1StGXR8_Z5jdHi6B-myT"
}
```

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/disconnect \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "V1StGXR8_Z5jdHi6B-myT"}'
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "disconnected": true
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

### 查询执行

#### POST /api/query

执行读取查询（SELECT、SHOW、DESCRIBE 等）。

**请求体**:
```json
{
  "sessionId": "V1StGXR8_Z5jdHi6B-myT",
  "query": "SELECT * FROM users WHERE id = ?",
  "params": [1]
}
```

**参数说明**:
- `sessionId` (字符串, 必需): 从 `/api/connect` 获取的会话 ID
- `query` (字符串, 必需): SQL 查询或数据库命令
- `params` (数组, 可选): 参数化查询的参数

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/query \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "V1StGXR8_Z5jdHi6B-myT",
    "query": "SELECT * FROM users LIMIT 10"
  }'
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "rows": [
      {"id": 1, "name": "Alice", "email": "alice@example.com"},
      {"id": 2, "name": "Bob", "email": "bob@example.com"}
    ],
    "executionTime": 15,
    "metadata": {
      "fieldCount": 3
    }
  },
  "metadata": {
    "executionTime": 15,
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

**错误响应 - 写操作被阻止** (500):
```json
{
  "success": false,
  "error": {
    "code": "QUERY_FAILED",
    "message": "❌ 操作被拒绝：当前处于只读安全模式"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### POST /api/execute

执行写操作（INSERT、UPDATE、DELETE 等）。需要在连接配置中设置 `allowWrite: true`。

**请求体**:
```json
{
  "sessionId": "V1StGXR8_Z5jdHi6B-myT",
  "query": "INSERT INTO users (name, email) VALUES (?, ?)",
  "params": ["Charlie", "charlie@example.com"]
}
```

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/execute \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "V1StGXR8_Z5jdHi6B-myT",
    "query": "UPDATE users SET name = ? WHERE id = ?",
    "params": ["Alice Smith", 1]
  }'
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "rows": [],
    "affectedRows": 1,
    "executionTime": 8
  },
  "metadata": {
    "executionTime": 8,
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

### Schema 信息

#### GET /api/tables

列出数据库中的所有表。

**查询参数**:
- `sessionId` (字符串, 必需): 从 `/api/connect` 获取的会话 ID
- `forceRefresh` (字符串, 可选): 是否强制刷新缓存，值为 `true` 或 `false`（默认: `false`）

**请求示例**:
```bash
# 使用缓存（默认）
curl "http://localhost:3000/api/tables?sessionId=V1StGXR8_Z5jdHi6B-myT" \
  -H "X-API-Key: your-secret-key"

# 强制刷新缓存
curl "http://localhost:3000/api/tables?sessionId=V1StGXR8_Z5jdHi6B-myT&forceRefresh=true" \
  -H "X-API-Key: your-secret-key"
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "tables": ["users", "orders", "products", "categories"]
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### GET /api/schema

获取完整的数据库 Schema。

**查询参数**:
- `sessionId` (字符串, 必需): 从 `/api/connect` 获取的会话 ID
- `forceRefresh` (字符串, 可选): 是否强制刷新缓存，值为 `true` 或 `false`（默认: `false`）

**请求示例**:
```bash
# 使用缓存（默认，推荐）
curl "http://localhost:3000/api/schema?sessionId=V1StGXR8_Z5jdHi6B-myT" \
  -H "X-API-Key: your-secret-key"

# 强制刷新缓存（当数据库结构发生变化时使用）
curl "http://localhost:3000/api/schema?sessionId=V1StGXR8_Z5jdHi6B-myT&forceRefresh=true" \
  -H "X-API-Key: your-secret-key"
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "type": "mysql",
    "name": "testdb",
    "version": "8.0.32",
    "tables": [
      {
        "name": "orders",
        "columns": [
          {
            "name": "id",
            "type": "int",
            "nullable": false,
            "default": null,
            "comment": "订单ID"
          },
          {
            "name": "user_id",
            "type": "int",
            "nullable": false,
            "default": null,
            "comment": "用户ID"
          }
        ],
        "primaryKey": ["id"],
        "indexes": [
          {
            "name": "PRIMARY",
            "columns": ["id"],
            "unique": true
          }
        ],
        "foreignKeys": [
          {
            "name": "fk_orders_user",
            "columns": ["user_id"],
            "referencedTable": "users",
            "referencedColumns": ["id"],
            "onDelete": "CASCADE",
            "onUpdate": "NO ACTION"
          }
        ],
        "estimatedRows": 5000
      },
      {
        "name": "users",
        "columns": [
          {
            "name": "id",
            "type": "int",
            "nullable": false,
            "default": null,
            "comment": "用户ID"
          },
          {
            "name": "name",
            "type": "varchar(255)",
            "nullable": false,
            "default": null,
            "comment": "用户名"
          }
        ],
        "primaryKey": ["id"],
        "indexes": [
          {
            "name": "PRIMARY",
            "columns": ["id"],
            "unique": true
          }
        ],
        "estimatedRows": 1000
      }
    ],
    "relationships": [
      {
        "fromTable": "orders",
        "fromColumns": ["user_id"],
        "toTable": "users",
        "toColumns": ["id"],
        "type": "many-to-one",
        "constraintName": "fk_orders_user"
      }
    ],
    "_cacheInfo": {
      "cached": true,
      "cachedAt": "2026-01-27T12:00:00.000Z",
      "hitRate": "85.00%"
    }
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### GET /api/schema/:table

获取特定表的信息。

**路径参数**:
- `table` (字符串, 必需): 表名

**查询参数**:
- `sessionId` (字符串, 必需): 从 `/api/connect` 获取的会话 ID
- `forceRefresh` (字符串, 可选): 是否强制刷新缓存，值为 `true` 或 `false`（默认: `false`）

**请求示例**:
```bash
curl "http://localhost:3000/api/schema/users?sessionId=V1StGXR8_Z5jdHi6B-myT" \
  -H "X-API-Key: your-secret-key"
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "name": "orders",
    "columns": [
      {
        "name": "id",
        "type": "int",
        "nullable": false,
        "default": null,
        "comment": "订单ID"
      },
      {
        "name": "user_id",
        "type": "int",
        "nullable": false,
        "default": null,
        "comment": "用户ID"
      },
      {
        "name": "amount",
        "type": "decimal(10,2)",
        "nullable": false,
        "default": null,
        "comment": "订单金额"
      }
    ],
    "primaryKey": ["id"],
    "indexes": [
      {
        "name": "PRIMARY",
        "columns": ["id"],
        "unique": true
      },
      {
        "name": "idx_user_id",
        "columns": ["user_id"],
        "unique": false
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_orders_user",
        "columns": ["user_id"],
        "referencedTable": "users",
        "referencedColumns": ["id"],
        "onDelete": "CASCADE",
        "onUpdate": "NO ACTION"
      }
    ],
    "estimatedRows": 5000
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

### 缓存管理

为了提高大型数据库的性能，Schema 信息会被缓存。以下端点用于管理缓存。

#### DELETE /api/cache

清除指定会话的 Schema 缓存。当数据库结构发生变化（如新增表、修改列）时，可以调用此端点清除缓存。

**查询参数**:
- `sessionId` (字符串, 必需): 从 `/api/connect` 获取的会话 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:3000/api/cache?sessionId=V1StGXR8_Z5jdHi6B-myT" \
  -H "X-API-Key: your-secret-key"
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "cleared": true,
    "message": "Schema 缓存已清除"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### GET /api/cache/status

获取指定会话的缓存状态信息。

**查询参数**:
- `sessionId` (字符串, 必需): 从 `/api/connect` 获取的会话 ID

**请求示例**:
```bash
curl "http://localhost:3000/api/cache/status?sessionId=V1StGXR8_Z5jdHi6B-myT" \
  -H "X-API-Key: your-secret-key"
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessionId": "V1StGXR8_Z5jdHi6B-myT",
    "cache": {
      "isCached": true,
      "cachedAt": "2026-01-27T12:00:00.000Z",
      "expiresAt": "2026-01-27T12:05:00.000Z",
      "hitCount": 15,
      "missCount": 2
    },
    "hitRate": "88.24%"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

## 错误代码

| 代码 | HTTP 状态 | 描述 |
|------|-----------|------|
| `UNAUTHORIZED` | 401 | 缺少 API Key |
| `FORBIDDEN` | 403 | 无效的 API Key |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求过多 |
| `CONNECTION_FAILED` | 500 | 连接数据库失败 |
| `DISCONNECTION_FAILED` | 500 | 断开数据库连接失败 |
| `QUERY_FAILED` | 500 | 执行查询失败 |
| `EXECUTE_FAILED` | 500 | 执行操作失败 |
| `LIST_TABLES_FAILED` | 500 | 列出表失败 |
| `GET_SCHEMA_FAILED` | 500 | 获取 Schema 失败 |
| `GET_TABLE_INFO_FAILED` | 500 | 获取表信息失败 |
| `CLEAR_CACHE_FAILED` | 500 | 清除缓存失败 |
| `GET_CACHE_STATUS_FAILED` | 500 | 获取缓存状态失败 |
| `INTERNAL_ERROR` | 500 | 内部服务器错误 |

## 会话管理

### 会话生命周期

1. **创建**: 调用 `/api/connect` 创建会话
2. **使用**: 在后续 API 调用中使用 `sessionId`
3. **关闭**: 调用 `/api/disconnect` 关闭会话

### 会话超时

会话在不活动后自动过期（默认：1 小时）。

**配置**:
```bash
SESSION_TIMEOUT=3600000  # 1小时（毫秒）
SESSION_CLEANUP_INTERVAL=300000  # 5分钟
```

### 会话清理

过期的会话每 5 分钟自动清理一次（可配置）。

## 数据库特定示例

### MySQL
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "password",
    "database": "mydb"
  }'
```

### PostgreSQL
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "password",
    "database": "mydb"
  }'
```

### Redis
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "redis",
    "host": "localhost",
    "port": 6379,
    "password": "password"
  }'
```

### MongoDB
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mongodb",
    "host": "localhost",
    "port": 27017,
    "user": "admin",
    "password": "password",
    "database": "mydb",
    "authSource": "admin"
  }'
```

### SQLite
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sqlite",
    "filePath": "/path/to/database.db",
    "allowWrite": false
  }'
```

## 最佳实践

### 安全性

1. **使用强 API Keys**: 生成加密安全的随机密钥
2. **启用 HTTPS**: 在生产环境使用反向代理（nginx、Caddy）配置 HTTPS
3. **限制 CORS**: 设置特定的源而不是 `*`
4. **默认只读**: 仅在必要时启用 `allowWrite`
5. **关闭会话**: 完成后始终调用 `/api/disconnect`

### 性能

1. **复用会话**: 为多个查询保持会话活跃
2. **使用参数化查询**: 防止 SQL 注入并提高性能
3. **限制结果集**: 对大表使用 `LIMIT` 子句
4. **监控速率限制**: 为速率限制错误实现指数退避

### 错误处理

1. **检查 `success` 字段**: 始终检查响应中的 `success` 字段
2. **处理速率限制**: 实现带退避的重试逻辑
3. **会话过期**: 如果会话过期则重新连接
4. **记录请求 ID**: 使用元数据中的 `requestId` 进行调试

## 完整工作流示例

```bash
# 1. 连接到数据库
RESPONSE=$(curl -s -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "password",
    "database": "testdb"
  }')

# 2. 提取会话 ID
SESSION_ID=$(echo $RESPONSE | jq -r '.data.sessionId')

# 3. 列出表
curl "http://localhost:3000/api/tables?sessionId=$SESSION_ID" \
  -H "X-API-Key: your-key"

# 4. 获取表 Schema
curl "http://localhost:3000/api/schema/users?sessionId=$SESSION_ID" \
  -H "X-API-Key: your-key"

# 5. 执行查询
curl -X POST http://localhost:3000/api/query \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"query\": \"SELECT * FROM users LIMIT 10\"
  }"

# 6. 断开连接
curl -X POST http://localhost:3000/api/disconnect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\"}"
```

## 支持

如有问题和疑问：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- 文档: https://github.com/Anarkh-Lee/universal-db-mcp#readme
