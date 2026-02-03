# Claude Desktop 集成指南

本指南展示如何将 Universal Database MCP Server 与 Claude Desktop 集成。

## 概述

[Claude Desktop](https://claude.ai/download) 是 Anthropic 官方桌面应用，原生支持 MCP（模型上下文协议）。通过集成 Universal Database MCP Server，您可以：

- 使用自然语言查询数据库
- 以对话方式探索数据库结构
- 自动生成和执行 SQL 查询
- 无需编写代码即可分析数据

**主要优势：**
- **原生 MCP 支持** - Claude Desktop 内置 MCP 协议支持（stdio 传输）
- **本地执行** - MCP 服务器在本地运行，确保数据安全
- **无缝体验** - 配置后即可使用，无需额外设置
- **多数据库支持** - 支持 17+ 种数据库类型

## 前置要求

- **Claude Desktop** 已安装（[下载地址](https://claude.ai/download)）
- **Node.js** 20.0.0 或更高版本（[下载地址](https://nodejs.org/)）
- **数据库** 实例可从您的机器访问

### 验证 Node.js 安装

```bash
node --version
# 应输出 v20.0.0 或更高版本
```

## 配置

### 配置文件位置

| 平台 | 配置文件路径 |
|------|-------------|
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |

> **注意**：如果文件不存在，请手动创建。

### 基本配置

将以下内容添加到 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "my-database": {
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

### 配置参数

| 参数 | 必需 | 描述 |
|------|------|------|
| `--type` | 是 | 数据库类型（见下方支持的类型） |
| `--host` | 是* | 数据库主机地址 |
| `--port` | 否 | 数据库端口（不指定则使用默认端口） |
| `--user` | 是* | 数据库用户名 |
| `--password` | 是* | 数据库密码 |
| `--database` | 是* | 数据库名称 |
| `--file-path` | 是* | SQLite 数据库文件路径（仅 sqlite 类型） |
| `--danger-allow-write` | 否 | 启用写操作（默认：只读） |
| `--oracle-client-path` | 否 | Oracle Instant Client 路径（用于 Oracle 11g 及更早版本） |

*必需字段取决于数据库类型

### 支持的数据库类型

| 数据库 | 类型值 | 默认端口 |
|--------|--------|----------|
| MySQL | `mysql` | 3306 |
| PostgreSQL | `postgres` | 5432 |
| Redis | `redis` | 6379 |
| Oracle | `oracle` | 1521 |
| SQL Server | `sqlserver` | 1433 |
| MongoDB | `mongodb` | 27017 |
| SQLite | `sqlite` | - |
| 达梦 | `dm` | 5236 |
| 人大金仓 | `kingbase` | 54321 |
| 华为 GaussDB | `gaussdb` | 5432 |
| 蚂蚁 OceanBase | `oceanbase` | 2881 |
| TiDB | `tidb` | 4000 |
| ClickHouse | `clickhouse` | 8123 |
| 阿里云 PolarDB | `polardb` | 3306 |
| 海量 Vastbase | `vastbase` | 5432 |
| 瀚高 HighGo | `highgo` | 5866 |
| 中兴 GoldenDB | `goldendb` | 3306 |

## 配置示例

### MySQL

```json
{
  "mcpServers": {
    "mysql-production": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "mysql_password",
        "--database", "myapp"
      ]
    }
  }
}
```

### PostgreSQL

```json
{
  "mcpServers": {
    "postgres-analytics": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "postgres_password",
        "--database", "analytics"
      ]
    }
  }
}
```

### SQLite

```json
{
  "mcpServers": {
    "sqlite-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/database.db"
      ]
    }
  }
}
```

### SQL Server

```json
{
  "mcpServers": {
    "sqlserver-erp": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "localhost",
        "--port", "1433",
        "--user", "sa",
        "--password", "sqlserver_password",
        "--database", "erp_system"
      ]
    }
  }
}
```

### Oracle

```json
{
  "mcpServers": {
    "oracle-finance": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "oracle_password",
        "--database", "ORCL"
      ]
    }
  }
}
```

### Oracle 11g（旧版本）

对于 Oracle 11g 及更早版本，需要指定 Oracle Instant Client 路径：

```json
{
  "mcpServers": {
    "oracle11g-legacy": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "oracle_password",
        "--database", "ORCL",
        "--oracle-client-path", "/opt/oracle/instantclient_19_8"
      ]
    }
  }
}
```

### MongoDB

```json
{
  "mcpServers": {
    "mongodb-logs": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "admin",
        "--password", "mongodb_password",
        "--database", "logs"
      ]
    }
  }
}
```

### Redis

```json
{
  "mcpServers": {
    "redis-cache": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "redis_password"
      ]
    }
  }
}
```

### 达梦数据库

```json
{
  "mcpServers": {
    "dameng-gov": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "dm",
        "--host", "localhost",
        "--port", "5236",
        "--user", "SYSDBA",
        "--password", "dameng_password",
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
    "kingbase-enterprise": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "kingbase",
        "--host", "localhost",
        "--port", "54321",
        "--user", "system",
        "--password", "kingbase_password",
        "--database", "mydb"
      ]
    }
  }
}
```

### 多数据库配置

您可以同时配置多个数据库：

```json
{
  "mcpServers": {
    "mysql-users": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "mysql_password",
        "--database", "users_db"
      ]
    },
    "postgres-orders": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "postgres_password",
        "--database", "orders_db"
      ]
    }
  }
}
```

### 启用写操作

默认情况下，服务器以只读模式运行。要启用写操作：

```json
{
  "mcpServers": {
    "mysql-writable": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database",
        "--danger-allow-write"
      ]
    }
  }
}
```

> **警告**：仅在开发环境中启用写入模式。生产环境请勿使用。

## 使用示例

配置并重启 Claude Desktop 后，您可以使用自然语言与数据库交互。

### 探索数据库结构

**您：** "数据库里有哪些表？"

**Claude：** 让我查看一下数据库结构。

```
可用的表：
- users（12 列）
- orders（8 列）
- products（10 列）
- categories（4 列）
- order_items（6 列）
```

---

**您：** "显示 users 表的结构"

**Claude：** 这是 users 表的结构：

| 列名 | 类型 | 可空 | 键 |
|------|------|------|-----|
| id | INT | 否 | 主键 |
| email | VARCHAR(255) | 否 | 唯一 |
| name | VARCHAR(100) | 是 | |
| created_at | TIMESTAMP | 否 | |
| status | ENUM | 是 | |

### 数据查询

**您：** "这个月有多少新注册用户？"

**Claude：** 让我帮您查询。

```sql
SELECT COUNT(*) as new_users
FROM users
WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
```

结果：本月有 **247 位新用户** 注册。

---

**您：** "显示订单金额最高的前 5 位客户"

**Claude：** 我来分析订单数据。

| 姓名 | 邮箱 | 总消费 |
|------|------|--------|
| 张三 | zhang@example.com | ¥12,450.00 |
| 李四 | li@example.com | ¥9,230.50 |
| 王五 | wang@example.com | ¥7,890.25 |
| 赵六 | zhao@example.com | ¥6,540.00 |
| 钱七 | qian@example.com | ¥5,120.75 |

### 复杂分析

**您：** "上个季度各产品类别的平均订单金额是多少？"

**Claude：** 让我按类别分析销售数据。

| 类别 | 订单数 | 平均订单金额 |
|------|--------|--------------|
| 电子产品 | 1,234 | ¥245.50 |
| 服装 | 2,456 | ¥89.25 |
| 图书 | 890 | ¥32.10 |
| 家居园艺 | 567 | ¥156.80 |

## 可用的 MCP 工具

配置完成后，Claude Desktop 将可以使用以下工具：

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取完整的数据库结构信息 |
| `get_table_info` | 获取指定表的详细信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 故障排除

### 问题：Claude Desktop 无法识别 MCP 服务器

**症状**：Claude 不响应数据库查询或显示没有可用工具。

**解决方案**：
1. **重启 Claude Desktop** - 修改配置文件后，必须完全重启 Claude Desktop（退出并重新打开）。
2. **验证配置文件位置** - 确保文件在正确的位置。
3. **检查 JSON 语法** - 使用 JSON 验证器验证配置。
4. **检查 Node.js 安装** - 确保 Node.js v20+ 已安装。

### 问题：连接失败

**症状**：数据库连接失败的错误消息。

**解决方案**：
1. **验证凭据** - 仔细检查用户名、密码、主机和端口。
2. **测试数据库连接** - 先用数据库客户端测试连接。
3. **检查防火墙** - 确保数据库端口可访问。
4. **验证数据库运行状态** - 确认数据库服务正在运行。

### 问题：权限被拒绝

**症状**：查询因权限错误而失败。

**解决方案**：
1. **检查用户权限** - 确保数据库用户有 SELECT 权限。
2. **验证数据库访问** - 确认用户可以访问指定的数据库。
3. **检查表级权限** - 某些表可能有访问限制。

### 问题：写操作被阻止

**症状**：INSERT、UPDATE、DELETE 操作失败。

**解决方案**：
1. **检查模式** - 默认情况下，写操作被阻止。
2. **启用写入模式** - 如需要，添加 `--danger-allow-write` 参数。
3. **验证用户权限** - 确保数据库用户有写入权限。

## 安全最佳实践

1. **使用只读模式** - 除非绝对必要，否则保持默认的只读模式。

2. **创建专用数据库用户** - 为 Claude 创建具有最小必要权限的专用用户：
   ```sql
   -- MySQL 示例
   CREATE USER 'claude_readonly'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT SELECT ON mydb.* TO 'claude_readonly'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **避免明文存储密码** - 使用环境变量或安全的凭据管理。

4. **限制网络访问** - 配置数据库仅接受来自 localhost 或受信任 IP 的连接。

5. **定期审计** - 定期检查查询日志以确保适当使用。

## 资源

- [Claude Desktop 下载](https://claude.ai/download)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
- [MCP 协议文档](https://modelcontextprotocol.io/)
- [API 参考](../http-api/API_REFERENCE.zh-CN.md)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Anthropic 支持: https://support.anthropic.com/
