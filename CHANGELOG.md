# 更新日志

本文档记录 Universal DB MCP 的版本更新历史。

## [2.8.0] - 2026

### 新增
- **Schema 核心增强** - 提升 LLM 对数据库结构的理解，提高 Text2SQL 准确性
  - **表注释支持** - Schema 信息现在包含表级别注释（`comment` 字段）
    - 支持的数据库：MySQL、PostgreSQL、Oracle、SQL Server、TiDB、达梦、KingbaseES、GaussDB、OceanBase、PolarDB、Vastbase、HighGo、GoldenDB、ClickHouse（14个）
    - 不支持：Redis、MongoDB（NoSQL）、SQLite（无原生表注释）
  - **隐式关系推断** - 基于列命名规则自动推断表间关系
    - 支持模式：`xxx_id` → `xxxs.id`、`xxxId` → `xxxs.id`（驼峰）、`xxx_code` → `xxxs.code`、`xxx_no` → `xxxs.xxx_no`
    - 推断规则：不覆盖显式外键、验证目标表存在、验证目标列存在
    - 置信度评分：0.7-0.95，LLM 可根据置信度判断关系可靠性
  - **关系类型细化** - 通过检查唯一约束区分 `one-to-one` 和 `many-to-one`
  - **关系来源标注** - `source` 字段区分 `foreign_key`（显式外键）和 `inferred`（推断关系）

### 改进
- 新增 `SchemaEnhancer` 工具类（`src/utils/schema-enhancer.ts`）
- 更新 `RelationshipInfo` 类型，添加 `source` 和 `confidence` 字段
- 更新 `TableInfo` 类型，添加 `comment` 字段
- 更新 14 个数据库适配器，添加表注释查询支持

## [2.7.0] - 2026

### 新增
- **外键关系支持** - Schema 信息现在包含外键和表关系数据，帮助 LLM 更好地理解数据库结构
  - `foreignKeys` - 表级别外键约束信息，包含约束名、列、引用表、引用列、ON DELETE/UPDATE 规则
  - `relationships` - 全局关系视图，展示所有表之间的关联关系
  - 支持的数据库：MySQL、PostgreSQL、Oracle、SQL Server、SQLite、达梦、KingbaseES、GaussDB、OceanBase、TiDB、PolarDB、Vastbase、HighGo、GoldenDB
  - NoSQL 数据库（Redis、MongoDB、ClickHouse）不支持传统外键，返回结果中不包含这些字段

### 改进
- 更新 API 参考文档（中英文），添加外键和关系字段的示例
- 更新数据库功能支持表，添加"外键关系"功能行

## [2.6.0] - 2026

### 新增
- **MCP SSE/Streamable HTTP 传输支持** - 在 HTTP 模式下新增 MCP 协议端点
  - `/sse` - SSE 传输端点（传统方式），支持通过 URL 参数配置数据库连接
  - `/sse/message` - SSE 消息接收端点
  - `/mcp` (POST) - Streamable HTTP 端点（MCP 2025 规范，推荐），支持通过请求头配置数据库连接
  - `/mcp` (GET) - Streamable HTTP 的 SSE 流端点
  - `/mcp` (DELETE) - 关闭会话端点
- Dify 等平台现在可以直接通过 MCP 协议连接，无需使用自定义 API 工具
- 灵活架构：2 种启动模式（stdio/http），4 种接入方式（MCP stdio、MCP SSE、MCP Streamable HTTP、REST API）
- **统一 API Key 认证** - MCP SSE/Streamable HTTP 端点现在也支持 API Key 认证，与 REST API 保持一致

### 改进
- 更新架构文档，清晰区分启动模式和接入方式
- 更新 Dify 集成指南，添加 MCP 协议集成方式（SSE 和 Streamable HTTP）
- 更新 API 参考文档，添加 MCP 协议端点说明

### 安全
- 所有 HTTP 端点（包括 MCP SSE/Streamable HTTP）现在统一使用 API Key 认证
- 如果未配置 `API_KEYS` 环境变量，则跳过认证（开发模式）

## [2.5.0] - 2026

### 新增
- Oracle 11g 及以前老版本支持（通过 Thick 模式）

## [2.3.8] - 2026

### 修复
- Oracle、达梦执行 SQL 去掉分号

## [2.3.7] - 2026

### 修复
- 达梦 get_schema 问题修复

## [2.3.6] - 2026

### 修复
- 达梦 get_schema 问题修复

## [2.3.5] - 2026

### 修复
- 达梦 get_schema 问题修复

## [2.3.4] - 2026

### 修复
- 达梦 get_schema 问题修复

## [2.3.3] - 2026

### 修复
- 达梦 get_schema 问题，达梦不使用批量查询优化功能

## [2.3.2] - 2026

### 修复
- 达梦 get_schema 返回 table 为空问题处理

## [2.3.1] - 2026

### 修复
- 达梦适配器修复列名规范化、空值检查、类型安全

## [2.3.0] - 2026

### 性能优化
- 为 Oracle、达梦增加批量查询优化功能

## [2.2.0] - 2026

### 性能优化
- 批量查询优化，大幅提升 Schema 获取性能
- 支持的数据库：MySQL、PostgreSQL、SQL Server、Oracle、达梦等 13 个适配器

### 性能提升
| 表数量 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| 50 张表 | ~5 秒 | ~200 毫秒 | 25x |
| 100 张表 | ~10 秒 | ~300 毫秒 | 33x |
| 500 张表 | ~50 秒 | ~500 毫秒 | 100x |

## [2.1.0] - 2026

### 新增
- Schema 缓存机制
- 缓存 TTL 配置
- 强制刷新功能
- 缓存统计信息

## [2.0.0] - 2026

### 新增
- HTTP API 模式
- 双模式架构（MCP + HTTP）
- API Key 认证
- 速率限制
- CORS 配置
- Docker 部署支持
- Serverless 部署配置（阿里云、腾讯云、AWS、Vercel）
- PaaS 部署配置（Railway、Render、Fly.io）

### 文档
- HTTP API 参考文档
- 部署指南
- 集成指南（Coze、n8n、Dify）

## [1.0.0] - 2026

### 新增
- 支持 17 种数据库
  - MySQL、PostgreSQL、Redis、Oracle、SQL Server
  - MongoDB、SQLite、达梦、KingbaseES、GaussDB
  - OceanBase、TiDB、ClickHouse、PolarDB
  - Vastbase、HighGo、GoldenDB
- MCP 协议支持
- 只读安全模式
- Claude Desktop 集成

---

## 版本号说明

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正
