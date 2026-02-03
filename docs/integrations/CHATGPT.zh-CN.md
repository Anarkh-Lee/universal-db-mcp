# ChatGPT 集成指南

本指南展示如何通过 MCP Connectors 将 Universal Database MCP Server 与 ChatGPT 集成。

## 概述

ChatGPT 通过 MCP Connectors 支持远程 MCP 服务器，可以通过 SSE 或 Streamable HTTP 协议直接与 Universal Database MCP Server 集成。这使得 ChatGPT 能够使用自然语言查询和分析您的数据库数据。

## 前置要求

- 部署了 HTTP 模式的 Universal Database MCP Server
- ChatGPT Plus、Team 或 Enterprise 订阅（MCP Connectors 需要付费计划）
- 数据库实例（MySQL、PostgreSQL 等）
- 可公开访问的服务器 URL（供 ChatGPT 连接）

## 设置步骤

### 步骤 1: 部署 HTTP 服务器

以 HTTP 模式部署 Universal Database MCP Server，并确保可公开访问：

```bash
# 使用 npm
export MODE=http
export HTTP_PORT=3000
export API_KEYS=your-secret-api-key
npx universal-db-mcp

# 或使用 Docker
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=your-secret-api-key \
  universal-db-mcp:latest
```

生产环境建议部署到云平台（Railway、Render、Fly.io、AWS 等）。参见[部署指南](../http-api/DEPLOYMENT.zh-CN.md)。

> **重要**：ChatGPT 需要可公开访问的 HTTPS URL。本地服务器（localhost）无法使用。

### 步骤 2: 验证服务器部署

测试服务器是否可访问：

```bash
# 测试健康检查端点
curl https://your-server-url/health

# 测试 MCP 端点
curl https://your-server-url/mcp
```

### 步骤 3: 在 ChatGPT 中添加 MCP Connector

1. 打开 [ChatGPT](https://chat.openai.com/)
2. 点击左下角的个人头像
3. 选择 **设置**（Settings）
4. 导航到 **Connectors** 或 **MCP Connectors**
5. 点击 **添加 Connector**（Add Connector）或 **添加 MCP 服务器**（Add MCP Server）

### 步骤 4: 配置 MCP Connector

#### 方式 A: Streamable HTTP 端点（推荐）

**服务器 URL**：
```
https://your-server-url/mcp
```

**请求头配置**：
```
X-API-Key: your-secret-api-key
X-DB-Type: mysql
X-DB-Host: your-database-host
X-DB-Port: 3306
X-DB-User: your-username
X-DB-Password: your-password
X-DB-Database: your-database-name
```

#### 方式 B: SSE 端点

**服务器 URL**：
```
https://your-server-url/sse?type=mysql&host=your-database-host&port=3306&user=your-username&password=your-password&database=your-database-name
```

**请求头配置**：
```
X-API-Key: your-secret-api-key
```

> **说明**：SSE 端点通过 URL 参数传递数据库配置，而 Streamable HTTP 使用请求头。

### 步骤 5: 保存并测试连接

1. 点击 **保存**（Save）或 **连接**（Connect）
2. ChatGPT 将尝试连接到您的 MCP 服务器
3. 如果成功，连接器将显示为"已连接"（Connected）

## 可用的 MCP 工具

连接成功后，以下工具将在 ChatGPT 中可用：

| 工具 | 描述 |
|------|------|
| `execute_query` | 对数据库执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息 |
| `get_table_info` | 获取特定表的详细信息 |
| `clear_cache` | 清除结构缓存 |

## 请求头参考

### 认证请求头

| 请求头 | 必需 | 描述 |
|--------|------|------|
| `X-API-Key` | 是* | API 密钥认证（如果服务器配置了 API_KEYS） |

### 数据库配置请求头（用于 Streamable HTTP）

| 请求头 | 必需 | 描述 |
|--------|------|------|
| `X-DB-Type` | 是 | 数据库类型：mysql、postgres、redis、oracle、dm、sqlserver、mongodb、sqlite、kingbase、gaussdb、oceanbase、tidb、clickhouse、polardb、vastbase、highgo、goldendb |
| `X-DB-Host` | 是* | 数据库主机地址 |
| `X-DB-Port` | 否 | 数据库端口（未指定时使用默认值） |
| `X-DB-User` | 是* | 数据库用户名 |
| `X-DB-Password` | 是* | 数据库密码 |
| `X-DB-Database` | 是* | 数据库名称 |
| `X-DB-FilePath` | 是* | SQLite 文件路径（仅用于 sqlite 类型） |
| `X-DB-Allow-Write` | 否 | 启用写操作（默认：false） |
| `X-DB-Oracle-Client-Path` | 否 | Oracle Instant Client 路径（用于 Oracle 11g） |

*必需字段取决于数据库类型

## URL 参数（用于 SSE 端点）

| 参数 | 必需 | 描述 |
|------|------|------|
| `type` | 是 | 数据库类型 |
| `host` | 是* | 数据库主机 |
| `port` | 否 | 数据库端口 |
| `user` | 是* | 数据库用户名 |
| `password` | 是* | 数据库密码 |
| `database` | 是* | 数据库名称 |
| `filePath` | 是* | SQLite 文件路径（用于 sqlite 类型） |
| `allowWrite` | 否 | 启用写操作（默认：false） |

## 配置示例

### MySQL

**Streamable HTTP 请求头**：
```
X-API-Key: your-api-key
X-DB-Type: mysql
X-DB-Host: mysql.example.com
X-DB-Port: 3306
X-DB-User: app_user
X-DB-Password: secure_password
X-DB-Database: production_db
```

**SSE URL**：
```
https://your-server/sse?type=mysql&host=mysql.example.com&port=3306&user=app_user&password=secure_password&database=production_db
```

### PostgreSQL

**Streamable HTTP 请求头**：
```
X-API-Key: your-api-key
X-DB-Type: postgres
X-DB-Host: postgres.example.com
X-DB-Port: 5432
X-DB-User: postgres_user
X-DB-Password: secure_password
X-DB-Database: analytics_db
```

**SSE URL**：
```
https://your-server/sse?type=postgres&host=postgres.example.com&port=5432&user=postgres_user&password=secure_password&database=analytics_db
```

### SQLite

**Streamable HTTP 请求头**：
```
X-API-Key: your-api-key
X-DB-Type: sqlite
X-DB-FilePath: /path/to/database.db
```

**SSE URL**：
```
https://your-server/sse?type=sqlite&filePath=/path/to/database.db
```

### Redis

**Streamable HTTP 请求头**：
```
X-API-Key: your-api-key
X-DB-Type: redis
X-DB-Host: redis.example.com
X-DB-Port: 6379
X-DB-Password: redis_password
```

## 使用示例

配置好 MCP Connector 后，您可以在 ChatGPT 中使用自然语言与数据库交互：

### 示例 1: 探索数据库结构

```
用户：我的数据库里有哪些表？

ChatGPT：[使用 get_schema 工具]
您的数据库包含以下表：
- users（id、name、email、created_at）
- orders（id、user_id、total、status、created_at）
- products（id、name、price、category、stock）
```

### 示例 2: 简单查询

```
用户：显示前 10 个用户

ChatGPT：[使用 execute_query 工具执行 "SELECT * FROM users LIMIT 10"]
以下是前 10 个用户：
| ID | 姓名 | 邮箱 | 创建时间 |
|----|------|------|----------|
| 1 | Alice | alice@example.com | 2026-01-15 |
| 2 | Bob | bob@example.com | 2026-01-16 |
...
```

### 示例 3: 聚合查询

```
用户：上个月有多少订单？总收入是多少？

ChatGPT：[使用 execute_query 工具]
上个月订单统计：
- 总订单数：1,234
- 总收入：¥125,430.50
- 平均订单金额：¥101.65
```

### 示例 4: 复杂分析

```
用户：本季度哪些产品销量最高？

ChatGPT：[分析结构，生成适当的 SQL，执行查询]
本季度销量前 5 的产品：
1. Widget Pro - 523 件（¥26,150）
2. Gadget Plus - 412 件（¥20,600）
3. Super Tool - 389 件（¥19,450）
...
```

## 高级配置

### 启用写操作

允许 INSERT、UPDATE、DELETE 操作：

**Streamable HTTP**：
```
X-DB-Allow-Write: true
```

**SSE URL**：
```
https://your-server/sse?type=mysql&host=...&allowWrite=true
```

> **警告**：请谨慎启用写操作。确保已设置适当的访问控制。

### 多数据库连接

您可以在 ChatGPT 中添加多个 MCP Connector，每个连接到不同的数据库：

1. 添加第一个连接器："生产环境 MySQL"
2. 添加第二个连接器："分析 PostgreSQL"
3. 添加第三个连接器："缓存 Redis"

ChatGPT 会根据您的查询智能选择适当的连接器。

## 安全最佳实践

### 1. 使用 HTTPS

始终使用启用 HTTPS 的方式部署 MCP 服务器。ChatGPT 要求安全连接。

### 2. 强 API 密钥

- 生成强随机 API 密钥
- 定期轮换密钥
- 切勿在公共仓库中分享密钥

### 3. 数据库用户权限

- 为 ChatGPT 访问创建专用数据库用户
- 仅授予必要的权限（最好是只读）
- 避免使用 root/admin 凭据

### 4. 网络安全

- 使用防火墙规则限制访问
- 对敏感数据库考虑使用 VPN 或私有网络
- 定期监控访问日志

### 5. 数据敏感性

- 注意查询和结果会通过 ChatGPT 传输
- 避免连接包含高度敏感数据的数据库（个人身份信息、财务记录）
- 考虑对敏感列进行数据脱敏

## 故障排除

### 问题：连接失败

**症状**：ChatGPT 无法连接到 MCP 服务器

**解决方案**：
1. 验证服务器 URL 可公开访问（不是 localhost）
2. 确保 HTTPS 配置正确
3. 检查 API 密钥是否正确
4. 验证服务器正在运行且健康
5. 检查防火墙是否允许入站连接

### 问题：认证错误

**症状**："未授权"或"无效 API 密钥"错误

**解决方案**：
1. 验证 X-API-Key 请求头设置正确
2. 确保 API 密钥与服务器配置匹配
3. 检查密钥中是否有多余的空格或字符

### 问题：数据库连接错误

**症状**：服务器连接成功但数据库查询失败

**解决方案**：
1. 验证数据库凭据正确
2. 检查数据库主机是否可从服务器访问
3. 确保数据库端口已开放
4. 验证数据库名称存在

### 问题：查询超时

**症状**：查询耗时过长或超时

**解决方案**：
1. 优化 SQL 查询
2. 添加数据库索引
3. 增加服务器超时设置
4. 对大结果集使用 LIMIT

### 问题：SSL/TLS 错误

**症状**：证书或 SSL 相关错误

**解决方案**：
1. 确保安装了有效的 SSL 证书
2. 检查证书是否过期
3. 验证证书链完整

## 限制

- ChatGPT MCP Connectors 需要付费订阅
- 服务器必须通过 HTTPS 公开访问
- 某些复杂查询可能需要多次交互
- 大结果集可能会被截断
- 结果的实时流式传输可能有所不同

## 资源

- [ChatGPT 文档](https://help.openai.com/)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [API 参考](../http-api/API_REFERENCE.zh-CN.md)
- [部署指南](../http-api/DEPLOYMENT.zh-CN.md)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- OpenAI 帮助中心: https://help.openai.com/
