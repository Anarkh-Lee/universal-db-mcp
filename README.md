# 🔌 MCP 数据库万能连接器

> 让 Claude Desktop 直接连接你的数据库，用自然语言查询和分析数据
>
> **NEW!** 现在支持 HTTP API 模式，可在 Coze、n8n、Dify 等平台中使用

[![npm version](https://img.shields.io/npm/v/universal-db-mcp.svg)](https://www.npmjs.com/package/universal-db-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 为什么使用本项目

作为开发者，你是否遇到过这些场景：

- 📊 **临时数据分析**：想快速查看生产数据库的某些指标，但不想写 SQL？
- 🔍 **问题排查**：需要跨多个表关联查询，但记不清表结构？
- 🤖 **AI 辅助开发**：希望 Claude 能直接理解你的数据库结构，生成准确的查询？

**MCP 数据库万能连接器** 通过 Model Context Protocol (MCP) 协议，让 Claude Desktop 成为你的数据库助手：

✅ **自然语言查询** - 用中文描述需求，Claude 自动生成并执行 SQL

✅ **智能表结构理解** - 自动获取数据库 Schema，提供精准建议

✅ **多数据库支持** - MySQL、PostgreSQL、Redis、Oracle、达梦、SQL Server、MongoDB、SQLite、KingbaseES、GaussDB/OpenGauss、OceanBase、TiDB、ClickHouse、PolarDB、Vastbase、HighGo、GoldenDB 一键切换

✅ **安全第一** - 默认只读模式，防止误操作删库

✅ **开箱即用** - 无需复杂配置，一行命令启动

✅ **智能缓存** - Schema 信息自动缓存，大幅提升大型数据库的响应速度

## 🌐 双模式支持

本项目支持两种运行模式：

### 1. MCP 模式（默认）
- 通过 stdio 协议与 Claude Desktop 通信
- 适用于本地开发和 Claude Desktop 集成
- 启动命令：`npm start` 或 `npm run start:mcp`

### 2. HTTP API 模式（NEW!）
- 提供 REST API 接口
- 适用于 Coze、n8n、Dify 等第三方平台集成
- 支持 Docker、Serverless、PaaS 等多种部署方式
- 启动命令：`npm run start:http`

**快速切换模式**：
```bash
# MCP 模式（Claude Desktop）
npm run start:mcp -- --type mysql --host localhost --port 3306 --user root --password xxx --database mydb

# HTTP API 模式（REST API）
MODE=http npm start
```

📖 **详细文档**:
- [HTTP API 参考文档（中文）](docs/http-api/API_REFERENCE.zh-CN.md) | [English](docs/http-api/API_REFERENCE.md)
- [部署指南（中文）](docs/http-api/DEPLOYMENT.zh-CN.md) | [English](docs/http-api/DEPLOYMENT.md)
- [Coze 集成指南（中文）](docs/integrations/COZE.zh-CN.md) | [English](docs/integrations/COZE.md)
- [n8n 集成指南（中文）](docs/integrations/N8N.zh-CN.md) | [English](docs/integrations/N8N.md)
- [Dify 集成指南（中文）](docs/integrations/DIFY.zh-CN.md) | [English](docs/integrations/DIFY.md)
- [中文文档索引](docs/README.zh-CN.md) - 所有中文文档导航

## 🚀 快速开始（HTTP API 模式）

### 1. 安装依赖
```bash
npm install -g universal-db-mcp
```

### 2. 配置环境变量
创建 `.env` 文件：
```bash
MODE=http
HTTP_PORT=3000
API_KEYS=your-secret-key
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=your_database
```

### 3. 启动服务
```bash
npm run start:http
```

### 4. 测试 API
```bash
# 健康检查
curl http://localhost:3000/api/health

# 连接数据库
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"type":"mysql","host":"localhost","port":3306,"user":"root","password":"xxx","database":"test"}'

# 执行查询
curl -X POST http://localhost:3000/api/query \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"xxx","query":"SELECT * FROM users LIMIT 10"}'
```

### 5. Docker 部署
```bash
# 使用 Docker Compose
cd docker
docker-compose up -d

# 或使用 Docker 直接运行
docker build -t universal-db-mcp -f docker/Dockerfile .
docker run -p 3000:3000 \
  -e MODE=http \
  -e API_KEYS=your-key \
  universal-db-mcp
```

## 🚀 快速开始（MCP 模式）

### 前置要求

- Node.js >= 20
- Claude Desktop 应用
- 至少一个数据库实例（MySQL/PostgreSQL/Redis/Oracle/达梦/SQL Server/MongoDB/SQLite/KingbaseES/GaussDB/OceanBase/TiDB/ClickHouse/PolarDB/Vastbase/HighGo/GoldenDB）

### 安装

```bash
npm install -g universal-db-mcp
```

或使用 npx 直接运行（无需安装）：

```bash
npx universal-db-mcp
```

### 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

添加以下配置：

#### 1. MySQL 示例

```json
{
  "mcpServers": {
    "mysql-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

#### 2. PostgreSQL 示例

```json
{
  "mcpServers": {
    "postgres-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

#### 3. Redis 示例

```json
{
  "mcpServers": {
    "redis-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "your_password"
      ]
    }
  }
}
```

**注意**：Redis 不需要 `--database` 参数，可以通过 `--database` 指定数据库编号（0-15）。

#### 4. Oracle 示例

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "your_password",
        "--database", "ORCL"
      ]
    }
  }
}
```

**说明**：
- Oracle 12c 及以上版本
- 默认端口为 1521
- `--database` 参数为服务名（Service Name）

#### 5. 达梦（DM）示例

```json
{
  "mcpServers": {
    "dm-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "dm",
        "--host", "localhost",
        "--port", "5236",
        "--user", "SYSDBA",
        "--password", "your_password",
        "--database", "DAMENG"
      ]
    }
  }
}
```

**说明**：
- 达梦数据库 DM7/DM8
- 默认端口为 5236
- 驱动会自动安装

#### 6. SQL Server 示例

```json
{
  "mcpServers": {
    "sqlserver-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "localhost",
        "--port", "1433",
        "--user", "sa",
        "--password", "your_password",
        "--database", "master"
      ]
    }
  }
}
```

**说明**：
- 支持 SQL Server 2012 及以上版本
- 支持 Azure SQL Database
- 默认端口为 1433

#### 7. MongoDB 示例

```json
{
  "mcpServers": {
    "mongodb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "admin",
        "--password", "your_password",
        "--database", "test"
      ]
    }
  }
}
```

**说明**：
- 支持 MongoDB 4.0 及以上版本
- 默认端口为 27017

#### 8. SQLite 示例

```json
{
  "mcpServers": {
    "universal-db-sqlite": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file", "/path/to/your/database.db"
      ]
    }
  }
}
```

**注意**：
- SQLite 不需要 `--host`、`--port`、`--user`、`--password` 参数
- 使用 `--file` 参数指定数据库文件的绝对路径
- Windows 路径示例：`"C:\\Users\\YourName\\data\\mydb.db"`
- macOS/Linux 路径示例：`"/Users/YourName/data/mydb.db"`

#### 9. KingbaseES 示例

```json
{
  "mcpServers": {
    "kingbase-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "kingbase",
        "--host", "localhost",
        "--port", "54321",
        "--user", "system",
        "--password", "your_password",
        "--database", "test"
      ]
    }
  }
}
```

**说明**：
- KingbaseES 基于 PostgreSQL 开发，兼容 PostgreSQL 协议
- 默认端口为 54321
- 使用与 PostgreSQL 相同的驱动（pg）

#### 10. GaussDB / OpenGauss 示例

```json
{
  "mcpServers": {
    "gaussdb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "gaussdb",
        "--host", "localhost",
        "--port", "5432",
        "--user", "gaussdb",
        "--password", "your_password",
        "--database", "postgres"
      ]
    }
  }
}
```

**说明**：
- GaussDB 和 OpenGauss 基于 PostgreSQL 开发，兼容 PostgreSQL 协议
- 默认端口为 5432
- 可以使用 `--type gaussdb` 或 `--type opengauss`
- 使用与 PostgreSQL 相同的驱动（pg）

#### 11. OceanBase 示例

```json
{
  "mcpServers": {
    "oceanbase-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oceanbase",
        "--host", "localhost",
        "--port", "2881",
        "--user", "root@test",
        "--password", "your_password",
        "--database", "test"
      ]
    }
  }
}
```

**说明**：
- OceanBase 兼容 MySQL 协议
- 默认端口为 2881（直连端口）或 2883（代理端口）
- 用户名格式：`用户名@租户名`（如 `root@test`）
- 使用与 MySQL 相同的驱动（mysql2）

#### 12. TiDB 示例

```json
{
  "mcpServers": {
    "tidb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "tidb",
        "--host", "localhost",
        "--port", "4000",
        "--user", "root",
        "--password", "your_password",
        "--database", "test"
      ]
    }
  }
}
```

**说明**：
- TiDB 兼容 MySQL 5.7 协议
- 默认端口为 4000
- 支持分布式事务和水平扩展
- 使用与 MySQL 相同的驱动（mysql2）

#### 13. ClickHouse 示例

```json
{
  "mcpServers": {
    "clickhouse-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "clickhouse",
        "--host", "localhost",
        "--port", "8123",
        "--user", "default",
        "--password", "",
        "--database", "default"
      ]
    }
  }
}
```

**说明**：
- ClickHouse 是高性能列式 OLAP 数据库
- 默认 HTTP 端口为 8123（原生 TCP 端口为 9000）
- 默认用户为 default，默认数据库为 default
- 适合大数据分析和实时查询场景

#### 14. PolarDB 示例

```json
{
  "mcpServers": {
    "polardb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "polardb",
        "--host", "pc-xxxxx.mysql.polardb.rds.aliyuncs.com",
        "--port", "3306",
        "--user", "your_username",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

**说明**：
- PolarDB 是阿里云的云原生数据库
- 完全兼容 MySQL 5.6/5.7/8.0 协议
- 支持一写多读架构，读写分离
- 使用与 MySQL 相同的驱动（mysql2）

#### 15. Vastbase 示例

```json
{
  "mcpServers": {
    "vastbase-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "vastbase",
        "--host", "localhost",
        "--port", "5432",
        "--user", "vastbase",
        "--password", "your_password",
        "--database", "postgres"
      ]
    }
  }
}
```

**说明**：
- Vastbase 是海量数据公司的国产数据库
- 基于 PostgreSQL 开发，兼容 PostgreSQL 协议
- 默认端口为 5432
- 使用与 PostgreSQL 相同的驱动（pg）

#### 16. HighGo 示例

```json
{
  "mcpServers": {
    "highgo-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "highgo",
        "--host", "localhost",
        "--port", "5866",
        "--user", "highgo",
        "--password", "your_password",
        "--database", "highgo"
      ]
    }
  }
}
```

**说明**：
- HighGo 是瀚高公司的国产数据库
- 基于 PostgreSQL 开发，兼容 PostgreSQL 协议
- 默认端口为 5866
- 使用与 PostgreSQL 相同的驱动（pg）

#### 17. GoldenDB 示例

```json
{
  "mcpServers": {
    "goldendb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "goldendb",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "test"
      ]
    }
  }
}
```

**说明**：
- GoldenDB 是中兴通讯的国产分布式数据库
- 完全兼容 MySQL 5.7/8.0 协议
- 默认端口为 3306
- 使用与 MySQL 相同的驱动（mysql2）
- 支持分布式事务和水平扩展

### 配置 Cherry Studio

Cherry Studio 也支持 MCP 协议。在 Cherry Studio 中配置 MCP 主要是配置命令。

以下是所有 17 个数据库的 Cherry Studio 配置命令：

#### 1. MySQL

```bash
npx universal-db-mcp@latest --type mysql --host localhost --port 3306 --user root --password your_password --database your_database
```

#### 2. PostgreSQL

```bash
npx universal-db-mcp@latest --type postgres --host localhost --port 5432 --user postgres --password your_password --database your_database
```

#### 3. Redis

```bash
npx universal-db-mcp@latest --type redis --host localhost --port 6379 --password your_password
```

#### 4. Oracle

```bash
npx universal-db-mcp@latest --type oracle --host localhost --port 1521 --user system --password your_password --database ORCL
```

#### 5. 达梦（DM）

```bash
npx universal-db-mcp@latest --type dm --host localhost --port 5236 --user SYSDBA --password your_password --database DAMENG
```

#### 6. SQL Server

```bash
npx universal-db-mcp@latest --type sqlserver --host localhost --port 1433 --user sa --password your_password --database master
```

#### 7. MongoDB

```bash
npx universal-db-mcp@latest --type mongodb --host localhost --port 27017 --user admin --password your_password --database test
```

#### 8. SQLite

```bash
npx universal-db-mcp@latest --type sqlite --file /path/to/your/database.db
```

#### 9. KingbaseES

```bash
npx universal-db-mcp@latest --type kingbase --host localhost --port 54321 --user system --password your_password --database test
```

#### 10. GaussDB / OpenGauss

```bash
npx universal-db-mcp@latest --type gaussdb --host localhost --port 5432 --user gaussdb --password your_password --database postgres
```

#### 11. OceanBase

```bash
npx universal-db-mcp@latest --type oceanbase --host localhost --port 2881 --user root@test --password your_password --database test
```

#### 12. TiDB

```bash
npx universal-db-mcp@latest --type tidb --host localhost --port 4000 --user root --password your_password --database test
```

#### 13. ClickHouse

```bash
npx universal-db-mcp@latest --type clickhouse --host localhost --port 8123 --user default --password "" --database default
```

#### 14. PolarDB

```bash
npx universal-db-mcp@latest --type polardb --host pc-xxxxx.mysql.polardb.rds.aliyuncs.com --port 3306 --user your_username --password your_password --database your_database
```

#### 15. Vastbase

```bash
npx universal-db-mcp@latest --type vastbase --host localhost --port 5432 --user vastbase --password your_password --database postgres
```

#### 16. HighGo

```bash
npx universal-db-mcp@latest --type highgo --host localhost --port 5866 --user highgo --password your_password --database highgo
```

#### 17. GoldenDB

```bash
npx universal-db-mcp@latest --type goldendb --host localhost --port 3306 --user root --password your_password --database test
```

**注意**：
- 将命令中的参数替换为你的实际数据库连接信息
- 如需启用写入模式，在命令前添加 `--danger-allow-write` 参数

### 启动使用

1. 重启 Claude Desktop
2. 在对话中直接询问：
   - "帮我查看 users 表的结构"
   - "统计最近 7 天的订单数量"
   - "找出消费金额最高的 10 个用户"

Claude 会自动调用数据库工具完成查询！

## 🛡️ 安全模式

**默认情况下，本工具运行在只读模式**，会拒绝所有写入操作（DELETE、UPDATE、DROP、TRUNCATE）。

如果你需要执行写入操作（请谨慎！），需要显式添加参数：

```json
{
  "args": [
    "universal-db-mcp",
    "--danger-allow-write",
    "--type", "mysql",
    ...
  ]
}
```

⚠️ **警告**：启用写入模式后，Claude 可以修改你的数据库。请仅在开发环境使用，或确保你完全理解操作的后果。

## 📦 Schema 缓存

为了提升大型数据库的性能，本项目实现了智能 Schema 缓存机制。

### 缓存特性

- **自动缓存**: 首次获取 Schema 后自动缓存，后续请求直接返回缓存数据
- **默认 TTL**: 缓存有效期为 5 分钟，过期后自动刷新
- **强制刷新**: 支持手动强制刷新缓存，获取最新的数据库结构
- **缓存统计**: 提供缓存命中率等统计信息，便于监控和调优

### MCP 模式

在 MCP 模式下，新增了以下工具：

| 工具名 | 描述 |
|--------|------|
| `get_schema` | 获取数据库结构（支持 `forceRefresh` 参数强制刷新） |
| `get_table_info` | 获取表信息（支持 `forceRefresh` 参数强制刷新） |
| `clear_cache` | 清除 Schema 缓存 |

**使用示例**（在 Claude Desktop 中）：
- "获取数据库结构" - 使用缓存
- "强制刷新数据库结构" - 忽略缓存，重新获取
- "清除 Schema 缓存" - 手动清除缓存

### HTTP API 模式

在 HTTP API 模式下，Schema 相关端点支持 `forceRefresh` 参数：

```bash
# 使用缓存（默认，推荐）
curl "http://localhost:3000/api/schema?sessionId=xxx"

# 强制刷新缓存
curl "http://localhost:3000/api/schema?sessionId=xxx&forceRefresh=true"

# 清除缓存
curl -X DELETE "http://localhost:3000/api/cache?sessionId=xxx"

# 查看缓存状态
curl "http://localhost:3000/api/cache/status?sessionId=xxx"
```

### 性能提升

对于表数量较多的数据库，Schema 缓存可以显著提升性能：

| 场景 | 无缓存 | 有缓存 | 提升 |
|------|--------|--------|------|
| 100 张表 | ~2-5 秒 | <10 毫秒 | 200-500x |
| 500 张表 | ~10-30 秒 | <10 毫秒 | 1000-3000x |
| 1000+ 张表 | 可能超时 | <10 毫秒 | ∞ |

### 批量查询优化

除了缓存机制，本项目还对 Schema 获取进行了批量查询优化：

**优化前（N+1 查询问题）**：
```
100 张表 = 1次获取表列表 + 100次获取列信息 + 100次获取主键 + 100次获取索引 + 100次获取行数
         = 401 次数据库查询
```

**优化后（批量查询）**：
```
100 张表 = 1次获取所有列 + 1次获取所有主键 + 1次获取所有索引 + 1次获取所有行数
         = 4 次数据库查询
```

**首次加载性能提升**：

| 表数量 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| 50 张表 | ~5 秒 | ~200 毫秒 | 25x |
| 100 张表 | ~10 秒 | ~300 毫秒 | 33x |
| 500 张表 | ~50 秒 | ~500 毫秒 | 100x |

已优化的数据库适配器：
- MySQL、TiDB、OceanBase、PolarDB、GoldenDB（MySQL 兼容）
- PostgreSQL、KingbaseES、GaussDB、Vastbase、HighGo（PostgreSQL 兼容）
- SQL Server
- Oracle（使用 ALL_* 视图批量查询）
- 达梦 DM（使用 USER_* 视图批量查询）

共 **13 个**适配器已完成批量查询优化。

未修改的适配器（4 个）：
  - SQLite: 本地文件数据库，PRAGMA 查询已经很快
  - ClickHouse: 使用 system 表查询，已经是批量方式
  - Redis: 键值存储，无传统表结构
  - MongoDB: 文档数据库，需要采样推断结构

### 何时需要刷新缓存

以下情况建议强制刷新或清除缓存：
- 新增或删除了表
- 修改了表结构（新增/删除/修改列）
- 新增或删除了索引
- 数据库版本升级后

## 🏗️ 架构设计

### 双模式架构

本项目采用双模式架构，支持 MCP 和 HTTP API 两种运行模式，共享核心业务逻辑：

```
┌─────────────────────────────────────────────────────────────┐
│                      入口层 (index.ts)                       │
│                    根据 MODE 环境变量选择模式                  │
└──────────────────┬──────────────────────┬───────────────────┘
                   │                      │
         ┌─────────▼─────────┐  ┌────────▼──────────┐
         │   MCP 模式         │  │  HTTP API 模式     │
         │  (stdio 传输)      │  │  (REST API)       │
         └─────────┬─────────┘  └────────┬──────────┘
                   │                      │
                   │    ┌─────────────────▼──────────────────┐
                   │    │      HTTP 服务器 (Fastify)         │
                   │    │  ┌──────────────────────────────┐  │
                   │    │  │  中间件层                     │  │
                   │    │  │  - API Key 认证               │  │
                   │    │  │  - CORS 配置                  │  │
                   │    │  │  - 速率限制                   │  │
                   │    │  │  - 错误处理                   │  │
                   │    │  └──────────────────────────────┘  │
                   │    │  ┌──────────────────────────────┐  │
                   │    │  │  路由层                       │  │
                   │    │  │  - /api/connect              │  │
                   │    │  │  - /api/query                │  │
                   │    │  │  - /api/schema               │  │
                   │    │  │  - /api/health               │  │
                   │    │  └──────────────────────────────┘  │
                   │    └────────┬──────────────────────────┘
                   │             │
         ┌─────────▼─────────────▼──────────────────┐
         │         核心业务逻辑层                     │
         │  ┌────────────────────────────────────┐  │
         │  │  DatabaseService                   │  │
         │  │  - executeQuery()                  │  │
         │  │  - getSchema()                     │  │
         │  │  - getTableInfo()                  │  │
         │  │  - validateQuery()                 │  │
         │  └────────────────────────────────────┘  │
         │  ┌────────────────────────────────────┐  │
         │  │  ConnectionManager                 │  │
         │  │  - connect()                       │  │
         │  │  - disconnect()                    │  │
         │  │  - 会话管理 (HTTP 模式)            │  │
         │  └────────────────────────────────────┘  │
         │  ┌────────────────────────────────────┐  │
         │  │  AdapterFactory                    │  │
         │  │  - createAdapter()                 │  │
         │  │  - validateConfig()                │  │
         │  └────────────────────────────────────┘  │
         └──────────────────┬────────────────────────┘
                            │
         ┌──────────────────▼────────────────────────┐
         │           数据库适配器层                   │
         │  ┌──────────────────────────────────────┐ │
         │  │  DbAdapter 接口                       │ │
         │  │  - connect()                         │ │
         │  │  - disconnect()                      │ │
         │  │  - executeQuery()                    │ │
         │  │  - getSchema()                       │ │
         │  └──────────────────────────────────────┘ │
         │                                            │
         │  17 个数据库适配器实现:                     │
         │  MySQL, PostgreSQL, Redis, Oracle, DM,    │
         │  SQL Server, MongoDB, SQLite, KingbaseES, │
         │  GaussDB, OceanBase, TiDB, ClickHouse,    │
         │  PolarDB, Vastbase, HighGo, GoldenDB      │
         └────────────────────────────────────────────┘
```

### 目录结构

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
│   └── config-loader.ts        # 配置加载器
├── core/                       # 核心业务逻辑（MCP 和 HTTP 共享）
│   ├── database-service.ts     # 数据库服务
│   └── connection-manager.ts   # 连接管理器
├── mcp/                        # MCP 模式特定代码
│   ├── mcp-server.ts           # MCP 服务器
│   └── mcp-index.ts            # MCP 入口
├── http/                       # HTTP API 模式特定代码
│   ├── server.ts               # Fastify 服务器
│   ├── http-index.ts           # HTTP 入口
│   ├── routes/                 # API 路由
│   │   ├── connection.ts       # 连接管理端点
│   │   ├── query.ts            # 查询执行端点
│   │   ├── schema.ts           # Schema 端点
│   │   ├── health.ts           # 健康检查端点
│   │   └── index.ts            # 路由聚合器
│   └── middleware/             # 中间件
│       ├── auth.ts             # API Key 认证
│       ├── error-handler.ts    # 错误处理
│       └── index.ts            # 中间件聚合器
└── adapters/                   # 数据库适配器（17 个）
    ├── mysql.ts
    ├── postgres.ts
    ├── redis.ts
    ├── oracle.ts
    ├── dm.ts
    ├── sqlserver.ts
    ├── mongodb.ts
    ├── sqlite.ts
    ├── kingbase.ts
    ├── gaussdb.ts
    ├── oceanbase.ts
    ├── tidb.ts
    ├── clickhouse.ts
    ├── polardb.ts
    ├── vastbase.ts
    ├── highgo.ts
    └── goldendb.ts
```

### 核心设计原则

1. **关注点分离**: MCP 和 HTTP 模式各自独立，共享核心业务逻辑
2. **适配器模式**: 统一的 DbAdapter 接口，支持 17 种数据库
3. **工厂模式**: AdapterFactory 集中管理适配器创建
4. **服务层**: DatabaseService 封装业务逻辑，被两种模式复用
5. **会话管理**: HTTP 模式支持多并发连接，MCP 模式单连接
6. **安全第一**: 默认只读模式，查询验证，API Key 认证

### 数据流

#### MCP 模式数据流
```
Claude Desktop → stdio → MCP Server → DatabaseService → Adapter → Database
```

#### HTTP API 模式数据流
```
HTTP Client → REST API → Middleware → Routes → DatabaseService → Adapter → Database
```

### 扩展性

- **添加新数据库**: 实现 DbAdapter 接口，在 AdapterFactory 中注册
- **添加新端点**: 在 `src/http/routes/` 中添加新路由文件
- **添加新中间件**: 在 `src/http/middleware/` 中添加新中间件
- **自定义认证**: 修改 `src/http/middleware/auth.ts`

## 📖 支持的数据库

| 数据库 | 类型参数 | 默认端口 | 状态 | 说明 |
|--------|---------|---------|------|------|
| MySQL | `--type mysql` | 3306 | ✅ 已支持 | - |
| PostgreSQL | `--type postgres` | 5432 | ✅ 已支持 | - |
| Redis | `--type redis` | 6379 | ✅ 已支持 | - |
| Oracle（12c以上） | `--type oracle` | 1521 | ✅ 已支持 | - |
| 达梦（DM7/DM8） | `--type dm` | 5236 | ✅ 已支持 | 驱动自动安装 |
| SQL Server (2012+) | `--type sqlserver` 或 `--type mssql` | 1433 | ✅ 已支持 | 支持 Azure SQL Database |
| MongoDB | `--type mongodb` | 27017 | ✅ 已支持 | 支持 MongoDB 4.0+ |
| SQLite | `--type sqlite` | - | ✅ 已支持 | 本地文件数据库 |
| KingbaseES（人大金仓） | `--type kingbase` | 54321 | ✅ 已支持 | 兼容 PostgreSQL 协议 |
| GaussDB / OpenGauss | `--type gaussdb` 或 `--type opengauss` | 5432 | ✅ 已支持 | 华为高斯数据库，兼容 PostgreSQL |
| OceanBase | `--type oceanbase` | 2881 | ✅ 已支持 | 蚂蚁金服分布式数据库，兼容 MySQL |
| TiDB | `--type tidb` | 4000 | ✅ 已支持 | PingCAP 分布式数据库，兼容 MySQL 5.7 |
| ClickHouse | `--type clickhouse` | 8123 | ✅ 已支持 | 高性能列式 OLAP 数据库 |
| PolarDB | `--type polardb` | 3306 | ✅ 已支持 | 阿里云云原生数据库，兼容 MySQL |
| Vastbase | `--type vastbase` | 5432 | ✅ 已支持 | 海量数据国产数据库，兼容 PostgreSQL |
| HighGo | `--type highgo` | 5866 | ✅ 已支持 | 瀚高国产数据库，兼容 PostgreSQL |
| GoldenDB | `--type goldendb` | 3306 | ✅ 已支持 | 中兴分布式数据库，兼容 MySQL |

**注意**:
- 达梦数据库驱动 `dmdb` 会作为可选依赖自动安装。如果安装失败，请手动运行 `npm install -g dmdb`。
- SQLite 驱动 `better-sqlite3` 需要编译。在 Windows 上，需要安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)。如果安装失败，可以使用预编译版本或在支持的平台上使用。

## 🔧 命令行参数

```bash
universal-db-mcp [选项]

选项：
  --type <db>              数据库类型 (mysql|postgres|redis|oracle|dm|sqlserver|mssql|mongodb|sqlite|kingbase|gaussdb|opengauss|oceanbase|tidb|clickhouse|polardb|vastbase|highgo|goldendb)
  --host <host>            数据库主机地址 (默认: localhost)
  --port <port>            数据库端口
  --user <user>            用户名
  --password <password>    密码
  --database <database>    数据库名称
  --file <file>            SQLite 数据库文件路径
  --danger-allow-write     启用写入模式（危险！）
  --help                   显示帮助信息
```

## 🏗️ 架构设计

本项目采用模块化适配器模式，方便社区贡献新的数据库支持：

```
src/
├── adapters/          # 数据库适配器
│   ├── mysql.ts
│   ├── postgres.ts
│   ├── redis.ts
│   ├── oracle.ts
│   ├── dm.ts
│   ├── sqlserver.ts
│   ├── mongodb.ts
│   ├── sqlite.ts
│   ├── kingbase.ts
│   ├── gaussdb.ts
│   ├── oceanbase.ts
│   ├── tidb.ts
│   ├── clickhouse.ts
│   ├── polardb.ts
│   ├── vastbase.ts
│   ├── highgo.ts
│   └── goldendb.ts
├── types/             # TypeScript 类型定义
│   └── adapter.ts
├── utils/             # 工具函数
│   └── safety.ts      # 安全检查逻辑
└── server.ts          # MCP 服务器主逻辑
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

如果你想添加新的数据库支持，只需：

1. 在 `src/adapters/` 下实现 `DbAdapter` 接口
2. 添加对应的数据库驱动依赖
3. 更新 README 文档

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 开源协议

MIT License - 自由使用，欢迎 Star ⭐

## 🙏 致谢

- [Model Context Protocol](https://modelcontextprotocol.io/) - Anthropic 提供的强大协议
- 所有贡献者和使用者

---

**如果这个项目对你有帮助，请给个 Star ⭐ 支持一下！**
