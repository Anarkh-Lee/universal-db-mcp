# 项目架构

本文档介绍 Universal DB MCP 的架构设计和核心模块。

## 架构概览

项目支持两种启动模式，HTTP 模式下同时提供 MCP 协议和 REST API 两种接入方式：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Universal DB MCP                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  启动模式：                                                               │
│  ┌────────────────────────────┬────────────────────────────────────┐    │
│  │ stdio 模式                 │ http 模式                          │    │
│  │ (npm run start:mcp)        │ (npm run start:http)               │    │
│  └─────────────┬──────────────┴───────────────┬────────────────────┘    │
│                │                              │                          │
│                ▼                              ▼                          │
│  ┌─────────────────────────┐    ┌───────────────────────────────────┐   │
│  │      MCP 协议           │    │           HTTP 服务器             │   │
│  │    (stdio 传输)         │    │                                   │   │
│  │                         │    │  ┌─────────────────────────────┐  │   │
│  │  工具：                 │    │  │       MCP 协议              │  │   │
│  │  • execute_query        │    │  │  (SSE / Streamable HTTP)    │  │   │
│  │  • get_schema           │    │  │                             │  │   │
│  │  • get_table_info       │    │  │  工具：（与 stdio 相同）    │  │   │
│  │  • clear_cache          │    │  │  • execute_query            │  │   │
│  │                         │    │  │  • get_schema               │  │   │
│  │  适用：Claude Desktop,  │    │  │  • get_table_info           │  │   │
│  │        Cursor 等        │    │  │  • clear_cache              │  │   │
│  └─────────────┬───────────┘    │  │                             │  │   │
│                │                │  │  适用：Dify、远程访问       │  │   │
│                │                │  └──────────────┬──────────────┘  │   │
│                │                │                 │                 │   │
│                │                │  ┌──────────────┴──────────────┐  │   │
│                │                │  │        REST API             │  │   │
│                │                │  │                             │  │   │
│                │                │  │  端点：                     │  │   │
│                │                │  │  • /api/connect             │  │   │
│                │                │  │  • /api/query               │  │   │
│                │                │  │  • /api/schema              │  │   │
│                │                │  │  • ...（10+ 端点）          │  │   │
│                │                │  │                             │  │   │
│                │                │  │  适用：Coze、n8n、自定义    │  │   │
│                │                │  └──────────────┬──────────────┘  │   │
│                │                └─────────────────┼─────────────────┘   │
│                │                                  │                     │
│                └──────────────────┬───────────────┘                     │
│                                   ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       核心业务逻辑层                               │  │
│  │  • DatabaseService    • ConnectionManager                        │  │
│  │  • 查询执行           • Schema 缓存                              │  │
│  │  • 安全校验           • 连接管理                                 │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      数据库适配器层                                │  │
│  │  MySQL │ PostgreSQL │ Redis │ Oracle │ MongoDB │ SQLite │ ...    │  │
│  │                      （17 个适配器）                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 协议与接入方式

| 启动模式 | 协议 | 传输方式 | 工具/端点 | 适用场景 |
|---------|------|---------|----------|---------|
| stdio | MCP | stdio | 4 个工具 | Claude Desktop、Cursor |
| http | MCP | SSE | 4 个工具 | Dify（传统方式） |
| http | MCP | Streamable HTTP | 4 个工具 | Dify（推荐） |
| http | REST | HTTP | 10+ 端点 | Coze、n8n、自定义集成 |

### MCP 协议工具

无论使用哪种传输方式（stdio/SSE/Streamable HTTP），MCP 协议都提供相同的 4 个工具：

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询或数据库命令 |
| `get_schema` | 获取数据库结构信息 |
| `get_table_info` | 获取指定表的详细信息 |
| `clear_cache` | 清除 Schema 缓存 |

### REST API 端点

REST API 提供更细粒度的控制，支持多会话管理：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/connect` | POST | 连接数据库 |
| `/api/disconnect` | POST | 断开连接 |
| `/api/query` | POST | 执行查询 |
| `/api/execute` | POST | 执行写操作 |
| `/api/tables` | GET | 列出表 |
| `/api/schema` | GET | 获取数据库结构 |
| `/api/schema/:table` | GET | 获取表信息 |
| `/api/cache` | DELETE | 清除缓存 |
| `/api/cache/status` | GET | 缓存状态 |
| `/api/health` | GET | 健康检查 |
| `/api/info` | GET | 服务信息 |

### MCP SSE/Streamable HTTP 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/sse` | GET | 建立 SSE 连接（传统方式） |
| `/sse/message` | POST | 向 SSE 会话发送消息 |
| `/mcp` | POST | Streamable HTTP 端点（推荐） |
| `/mcp` | GET | Streamable HTTP 的 SSE 流 |
| `/mcp` | DELETE | 关闭会话 |

## 目录结构

```
src/
├── index.ts                    # 入口文件，模式选择器
├── server.ts                   # 向后兼容导出
├── types/
│   ├── adapter.ts              # 数据库适配器类型定义
│   └── http.ts                 # HTTP API 类型定义
├── utils/
│   ├── safety.ts               # 查询安全验证
│   ├── adapter-factory.ts      # 适配器工厂
│   ├── config-loader.ts        # 配置加载器
│   └── schema-enhancer.ts      # Schema 增强器（隐式关系推断）
├── core/                       # 核心业务逻辑
│   ├── database-service.ts     # 数据库服务
│   └── connection-manager.ts   # 连接管理器
├── mcp/                        # MCP 模式
│   ├── mcp-server.ts           # MCP 服务器（工具定义）
│   └── mcp-index.ts            # MCP stdio 入口
├── http/                       # HTTP 模式
│   ├── server.ts               # Fastify 服务器
│   ├── http-index.ts           # HTTP 入口
│   ├── routes/                 # 路由
│   │   ├── index.ts            # 路由注册
│   │   ├── health.ts           # 健康检查路由
│   │   ├── connection.ts       # 连接管理路由
│   │   ├── query.ts            # 查询路由
│   │   ├── schema.ts           # Schema 路由
│   │   └── mcp-sse.ts          # MCP SSE/Streamable HTTP 路由
│   └── middleware/             # 中间件
│       ├── index.ts            # 中间件注册
│       ├── auth.ts             # API Key 认证
│       └── error-handler.ts    # 错误处理
└── adapters/                   # 数据库适配器
    ├── mysql.ts
    ├── postgres.ts
    ├── redis.ts
    └── ...                     # 17 个适配器
```

## 核心模块

### DatabaseService

数据库服务层，封装核心业务逻辑：

```typescript
class DatabaseService {
  // 执行查询
  async executeQuery(query: string, params?: unknown[]): Promise<QueryResult>

  // 获取数据库结构
  async getSchema(): Promise<SchemaInfo>

  // 获取表信息
  async getTableInfo(tableName: string): Promise<TableInfo>

  // 验证查询安全性
  validateQuery(query: string): boolean
}
```

### ConnectionManager

连接管理器，处理数据库连接生命周期：

```typescript
class ConnectionManager {
  // 创建连接
  async connect(config: DbConfig): Promise<string>

  // 断开连接
  async disconnect(sessionId: string): Promise<void>

  // 获取连接
  getConnection(sessionId: string): DbAdapter | undefined

  // 清理过期会话
  cleanupExpiredSessions(): void
}
```

### AdapterFactory

适配器工厂，集中管理适配器创建：

```typescript
class AdapterFactory {
  // 创建适配器
  static createAdapter(type: string, config: DbConfig): DbAdapter

  // 验证配置
  static validateConfig(type: string, config: DbConfig): boolean

  // 获取支持的数据库类型
  static getSupportedTypes(): string[]
}
```

### SchemaEnhancer

Schema 增强器，提升 LLM 对数据库结构的理解：

```typescript
class SchemaEnhancer {
  // 增强关系信息
  // 1. 为现有外键关系添加 source='foreign_key' 标记
  // 2. 推断隐式关系并添加 source='inferred' 标记
  // 3. 细化关系类型（区分 one-to-one 和 many-to-one）
  enhanceRelationships(
    tables: TableInfo[],
    existingRelationships: RelationshipInfo[]
  ): RelationshipInfo[]

  // 更新配置
  updateConfig(config: Partial<SchemaEnhancerConfig>): void

  // 获取当前配置
  getConfig(): SchemaEnhancerConfig
}
```

**隐式关系推断规则：**

| 列名模式 | 目标表 | 目标列 | 置信度 |
|---------|--------|--------|--------|
| `xxx_id` | `xxxs` / `xxx` | `id` | 0.90-0.95 |
| `xxxId` (驼峰) | `xxxs` / `xxx` | `id` | 0.85-0.90 |
| `xxx_code` | `xxxs` / `xxx` | `code` | 0.90-0.95 |
| `xxx_no` | `xxxs` / `xxx` | `xxx_no` | 0.70-0.75 |

**推断安全规则：**
- 不覆盖显式外键：已有外键的列不进行推断
- 验证目标表存在：只有目标表确实存在时才推断
- 验证目标列存在：确保目标表有对应的主键列
- 标注来源和置信度：让 LLM 知道这是推断的关系

## 数据库适配器

### DbAdapter 接口

所有数据库适配器实现统一接口：

```typescript
interface DbAdapter {
  // 连接数据库
  connect(): Promise<void>

  // 断开连接
  disconnect(): Promise<void>

  // 执行查询
  executeQuery(query: string, params?: unknown[]): Promise<QueryResult>

  // 获取数据库结构
  getSchema(): Promise<SchemaInfo>

  // 获取表信息
  getTableInfo(tableName: string): Promise<TableInfo>

  // 检查是否为写操作
  isWriteOperation(query: string): boolean
}
```

### 适配器分类

| 类型 | 适配器 | 驱动 |
|------|--------|------|
| MySQL 兼容 | mysql, tidb, oceanbase, polardb, goldendb | mysql2 |
| PostgreSQL 兼容 | postgres, kingbase, gaussdb, vastbase, highgo | pg |
| 其他 | oracle, sqlserver, mongodb, redis, sqlite, clickhouse | 各自驱动 |

## 数据流

### MCP 模式

```
Claude Desktop → stdio → MCP Server → DatabaseService → Adapter → Database
```

### HTTP API 模式

```
HTTP Client → REST API → Middleware → Routes → DatabaseService → Adapter → Database
```

## 设计原则

1. **关注点分离** - MCP 和 HTTP 模式各自独立，共享核心逻辑
2. **适配器模式** - 统一的 DbAdapter 接口，支持 17 种数据库
3. **工厂模式** - AdapterFactory 集中管理适配器创建
4. **服务层** - DatabaseService 封装业务逻辑，被两种模式复用
5. **会话管理** - HTTP 模式支持多并发连接，MCP 模式单连接
6. **安全第一** - 默认只读模式，查询验证，API Key 认证

## 扩展指南

### 添加新数据库

1. 在 `src/adapters/` 创建新适配器
2. 实现 `DbAdapter` 接口
3. 在 `AdapterFactory` 中注册
4. 更新文档

详见 [添加新数据库](./adding-database.md)。

### 添加新 API 端点

1. 在 `src/http/routes/` 创建新路由
2. 在 `src/http/routes/index.ts` 注册
3. 更新 API 文档

### 添加新中间件

1. 在 `src/http/middleware/` 创建新中间件
2. 在 `src/http/middleware/index.ts` 注册
