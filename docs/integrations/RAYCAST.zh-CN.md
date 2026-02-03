# Raycast 集成指南

本指南展示如何将 Universal Database MCP Server 与 Raycast 集成。

## 概述

Raycast 是一款极速、可扩展的 macOS 启动器。从 1.98 版本开始，Raycast 支持模型上下文协议（MCP），允许您将 AI 助手连接到外部工具和数据源。通过集成 Universal Database MCP Server，您可以让 Raycast 的 AI 直接查询和分析数据库数据，从而更轻松地探索数据、生成报告和获取洞察，而无需离开启动器。

**主要优势：**
- 直接从 Raycast 的 AI 聊天中查询数据库
- 获得 AI 辅助编写 SQL 查询
- 快速探索数据库结构
- 即时生成数据洞察

## 前置要求

- 已安装 [Raycast](https://raycast.com/)（需要 1.98 或更高版本）
- Raycast Pro 订阅（AI 功能需要）
- 已安装 Node.js 18+
- 数据库实例（MySQL、PostgreSQL、SQLite 等）

## 配置

Raycast 使用 MCP stdio 模式进行工具集成。配置通过 Raycast 设置界面或导入 JSON 配置文件完成。

### 步骤 1: 打开 Raycast 设置

使用快捷键 `Cmd + ,` 打开 Raycast 设置，或在 Raycast 中搜索"Settings"。

### 步骤 2: 导航到 MCP 服务器

在设置侧边栏中导航到 **Extensions > AI > MCP Servers**。

### 步骤 3: 添加 MCP 服务器配置

您可以选择：
- 点击 **"Import MCP Servers"** 导入 JSON 配置文件
- 点击 **"Add Server"** 手动添加服务器配置

#### 导入配置

创建一个包含以下结构的 JSON 文件并导入：

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### 手动配置

如果手动添加，请输入以下详细信息：
- **名称**: `universal-db-mcp`
- **命令**: `npx`
- **参数**: `universal-db-mcp --type mysql --host localhost --port 3306 --user root --password your_password --database your_database`

### 步骤 4: 启用服务器

添加配置后，确保在列表中启用 MCP 服务器。

## 配置示例

### MySQL

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

### PostgreSQL

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

### SQLite

```json
{
  "mcpServers": {
    "sqlite-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/your/database.db"
      ]
    }
  }
}
```

### SQL Server

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
        "--database", "your_database"
      ]
    }
  }
}
```

### Oracle

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

### MongoDB

```json
{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "admin",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

### Redis

```json
{
  "mcpServers": {
    "redis": {
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

### 达梦数据库

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

### 人大金仓

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
        "--database", "your_database"
      ]
    }
  }
}
```

### 多数据库配置

您可以配置多个数据库连接：

```json
{
  "mcpServers": {
    "mysql-production": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "prod-db.example.com",
        "--port", "3306",
        "--user", "readonly_user",
        "--password", "prod_password",
        "--database", "production_db"
      ]
    },
    "mysql-development": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "dev_password",
        "--database", "development_db"
      ]
    },
    "postgres-analytics": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "analytics-db.example.com",
        "--port", "5432",
        "--user", "analyst",
        "--password", "analytics_password",
        "--database", "analytics"
      ]
    }
  }
}
```

### 启用写操作

默认情况下，为安全起见禁用写操作。要启用写操作：

```json
{
  "mcpServers": {
    "mysql-db-writable": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database",
        "--allow-write", "true"
      ]
    }
  }
}
```

> **警告**：启用写操作允许 AI 执行 INSERT、UPDATE、DELETE 和其他修改查询。请谨慎使用，尤其是在生产环境中。

## 可用工具

配置完成后，以下 MCP 工具将在 Raycast 中可用：

| 工具 | 描述 |
|------|------|
| `execute_query` | 对数据库执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息（表、列、类型） |
| `get_table_info` | 获取特定表的详细信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 使用示例

### 示例 1: 探索数据库结构

在 Raycast 的 AI 聊天中，您可以询问：

```
我的数据库中有哪些表？
```

AI 将使用 `get_schema` 工具检索并显示您的数据库结构。

### 示例 2: 查询数据

让 AI 查询您的数据：

```
显示 orders 表中最近的 10 条订单
```

AI 将生成并执行适当的 SQL 查询：

```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10
```

### 示例 3: 编写 SQL 查询

获取编写复杂查询的帮助：

```
编写一个查询，找出按总订单金额排名前 5 的客户
```

AI 将分析您的结构并生成：

```sql
SELECT
  c.id,
  c.name,
  SUM(o.total_amount) as total_value
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_value DESC
LIMIT 5
```

### 示例 4: 生成报告

请求快速数据摘要：

```
给我过去一年按月份的销售汇总
```

AI 将查询您的数据库并提供洞察。

### 示例 5: 数据分析

获取 AI 驱动的分析：

```
分析用户注册趋势并识别任何模式
```

AI 将检查您的数据并提供分析洞察。

## 命令行参数

| 参数 | 必填 | 描述 |
|------|------|------|
| `--type` | 是 | 数据库类型：mysql、postgres、sqlite、sqlserver、oracle、mongodb、redis、dm、kingbase、gaussdb、oceanbase、tidb、clickhouse、polardb、vastbase、highgo、goldendb |
| `--host` | 是* | 数据库主机 |
| `--port` | 否 | 数据库端口（不指定则使用默认端口） |
| `--user` | 是* | 数据库用户名 |
| `--password` | 是* | 数据库密码 |
| `--database` | 是* | 数据库名称 |
| `--file-path` | 是* | SQLite 文件路径（仅 sqlite 类型） |
| `--allow-write` | 否 | 启用写操作（默认：false） |
| `--oracle-client-path` | 否 | Oracle Instant Client 路径（用于 Oracle 11g） |

*必填字段取决于数据库类型

## 最佳实践

### 1. 安全性

- **使用只读数据库用户**访问生产数据库
- **切勿分享**包含真实凭据的配置文件
- **尽可能使用环境变量**存储敏感数据
- **限制数据库权限**仅授予必要的权限

### 2. 性能

- 使用具体查询而非 `SELECT *`
- 添加 `LIMIT` 子句以防止大结果集
- 考虑使用只读副本进行大量查询

### 3. 工作流

- 为开发和生产配置单独的连接
- 为多个数据库连接使用描述性名称
- 除非特别需要，否则保持禁用写操作

## 故障排除

### 问题：MCP 服务器未显示

**症状**：数据库工具在 Raycast AI 中不可用

**解决方案**：
1. 验证 Raycast 版本是否为 1.98 或更高
2. 确保您有 Raycast Pro 订阅
3. 检查 MCP 服务器是否在 Settings > Extensions > AI > MCP Servers 中启用
4. 更改配置后重启 Raycast

### 问题：连接被拒绝

**症状**：关于连接被拒绝的错误消息

**解决方案**：
1. 验证数据库主机和端口是否正确
2. 检查数据库服务器是否正在运行
3. 确保防火墙允许连接到数据库端口
4. 验证到数据库主机的网络连接

### 问题：认证失败

**症状**：关于无效凭据的错误消息

**解决方案**：
1. 仔细检查用户名和密码
2. 验证用户是否有权访问指定的数据库
3. 检查数据库是否需要 SSL/TLS 连接
4. 确保用户可以从您的 IP 地址连接

### 问题：权限被拒绝

**症状**：查询因权限错误而失败

**解决方案**：
1. 验证数据库用户是否具有 SELECT 权限
2. 检查特定表是否需要额外权限
3. 对于写操作，确保设置了 `--allow-write` 且用户具有写权限

### 问题：找不到 npx 命令

**症状**：错误提示 npx 未被识别

**解决方案**：
1. 安装 Node.js（版本 18 或更高）
2. 确保 Node.js bin 目录在系统 PATH 中
3. 尝试使用 npx 的完整路径
4. 安装 Node.js 后可能需要重启 Raycast

### 问题：服务器超时

**症状**：MCP 服务器响应时间过长

**解决方案**：
1. 检查数据库服务器性能
2. 优化慢查询
3. 确保到数据库的网络连接稳定
4. 考虑使用本地数据库进行测试

## 资源

- [Raycast 官方网站](https://raycast.com/)
- [Raycast 文档](https://developers.raycast.com/)
- [Raycast MCP 文档](https://developers.raycast.com/ai/mcp)
- [Universal Database MCP Server 文档](../README.zh-CN.md)
- [MCP 协议规范](https://modelcontextprotocol.io/)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Raycast 社区: https://raycast.com/community
