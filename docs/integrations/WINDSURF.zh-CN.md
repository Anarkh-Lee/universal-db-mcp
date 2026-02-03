# Windsurf IDE 集成指南

本指南展示如何将 Universal Database MCP Server 与 Windsurf IDE (Codeium) 集成。

## 概述

Windsurf 是 Codeium 推出的 AI 驱动的 IDE，具有 Cascade 智能代理，能够理解上下文、执行多步骤任务，并通过模型上下文协议（MCP）与外部工具交互。通过集成 Universal Database MCP Server，您可以让 Cascade 在开发环境中直接查询和分析数据库数据。

**主要特性：**
- 通过 stdio 模式原生支持 MCP
- Cascade AI 代理实现智能数据库交互
- 与开发工作流无缝集成
- 支持多种数据库类型

## 前置要求

- 已安装 [Windsurf IDE](https://codeium.com/windsurf)
- 已安装 Node.js 18+
- 数据库实例（MySQL、PostgreSQL、SQLite 等）
- 基本了解 MCP 配置

## 设置步骤

### 步骤 1: 定位配置文件

Windsurf 的 MCP 配置存储在以下位置：

| 平台 | 配置路径 |
|------|---------|
| Windows | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` |
| macOS | `~/.codeium/windsurf/mcp_config.json` |
| Linux | `~/.codeium/windsurf/mcp_config.json` |

如果文件不存在，请手动创建。

### 步骤 2: 配置 MCP 服务器

编辑 `mcp_config.json` 文件，添加 Universal Database MCP Server：

#### 基本配置（MySQL）

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

#### PostgreSQL 配置

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### SQLite 配置

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### SQL Server 配置

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### Oracle 配置

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### MongoDB 配置

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### Redis 配置

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

### 步骤 3: 启用写操作（可选）

默认情况下，MCP 服务器以只读模式运行。要启用写操作，请添加 `--allow-write` 参数：

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
        "--database", "your_database",
        "--allow-write"
      ]
    }
  }
}
```

> **警告**：启用写操作允许 AI 修改您的数据库。请谨慎使用，尤其是在生产环境中。

### 步骤 4: 重启 Windsurf

保存配置文件后，重启 Windsurf IDE 以加载 MCP 服务器。

### 步骤 5: 验证连接

1. 打开 Windsurf IDE
2. 打开 Cascade 面板（通常在右侧）
3. 让 Cascade 列出数据库表：
   ```
   列出数据库中的所有表
   ```
4. 如果配置正确，Cascade 将使用 MCP 工具查询您的数据库

## 配置选项

### 命令行参数

| 参数 | 必需 | 描述 |
|------|------|------|
| `--type` | 是 | 数据库类型：mysql、postgres、sqlite、sqlserver、oracle、mongodb、redis、dm、kingbase、gaussdb、oceanbase、tidb、clickhouse、polardb、vastbase、highgo、goldendb |
| `--host` | 是* | 数据库主机地址 |
| `--port` | 否 | 数据库端口（未指定时使用默认值） |
| `--user` | 是* | 数据库用户名 |
| `--password` | 是* | 数据库密码 |
| `--database` | 是* | 数据库名称 |
| `--file-path` | 是* | SQLite 数据库文件路径（仅用于 sqlite 类型） |
| `--allow-write` | 否 | 启用写操作（默认：false） |
| `--oracle-client-path` | 否 | Oracle Instant Client 路径（用于 Oracle 11g 及更早版本） |

*必需字段取决于数据库类型

### 默认端口

| 数据库 | 默认端口 |
|--------|---------|
| MySQL | 3306 |
| PostgreSQL | 5432 |
| SQL Server | 1433 |
| Oracle | 1521 |
| MongoDB | 27017 |
| Redis | 6379 |
| ClickHouse | 8123 |

## 可用的 MCP 工具

配置完成后，Cascade 可以使用以下工具：

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询并返回结果 |
| `get_schema` | 获取数据库架构信息 |
| `get_table_info` | 获取详细的表结构 |
| `clear_cache` | 清除架构缓存 |

## 使用示例

### 示例 1: 探索数据库架构

```
用户：我的数据库中有哪些表？

Cascade：[使用 get_schema 工具]
         您的数据库包含以下表：
         - users（id、name、email、created_at）
         - orders（id、user_id、total、status、created_at）
         - products（id、name、price、stock）
```

### 示例 2: 查询数据

```
用户：显示订单数量最多的前 5 名用户

Cascade：[使用 execute_query 工具]
         以下是订单数量最多的前 5 名用户：

         | 用户    | 邮箱               | 订单数 |
         |---------|-------------------|--------|
         | Alice   | alice@example.com | 45     |
         | Bob     | bob@example.com   | 38     |
         | Charlie | charlie@test.com  | 32     |
         | Diana   | diana@example.com | 28     |
         | Eve     | eve@test.com      | 25     |
```

### 示例 3: 分析数据

```
用户：最近 6 个月每月的总收入是多少？

Cascade：[使用 execute_query 工具]
         最近 6 个月的收入分析：

         | 月份    | 收入       |
         |---------|------------|
         | 2026-01 | ¥125,430   |
         | 2025-12 | ¥142,850   |
         | 2025-11 | ¥98,320    |
         | 2025-10 | ¥115,670   |
         | 2025-09 | ¥108,940   |
         | 2025-08 | ¥95,280    |
```

### 示例 4: 获取表结构

```
用户：users 表的结构是什么？

Cascade：[使用 get_table_info 工具]
         users 表具有以下结构：

         | 列名       | 类型         | 可空 | 键      |
         |------------|--------------|------|---------|
         | id         | int          | 否   | PRIMARY |
         | name       | varchar(255) | 否   |         |
         | email      | varchar(255) | 否   | UNIQUE  |
         | password   | varchar(255) | 否   |         |
         | created_at | datetime     | 是   |         |
         | updated_at | datetime     | 是   |         |
```

### 示例 5: 写操作（如果已启用）

```
用户：插入一个新用户，姓名为"张三"，邮箱为"zhangsan@example.com"

Cascade：[使用 execute_query 工具执行 INSERT]
         成功插入新用户：
         - 姓名：张三
         - 邮箱：zhangsan@example.com
         - ID：156
```

## 多数据库配置

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
        "--user", "readonly",
        "--password", "prod_password",
        "--database", "production"
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
        "--database", "development",
        "--allow-write"
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

## 最佳实践

### 1. 安全性

- 对生产数据库**使用只读模式**
- **创建专用数据库用户**，授予最小权限
- **切勿将** `mcp_config.json` 中的密码提交到版本控制
- 尽可能**使用环境变量**存储敏感数据

### 2. 性能

- 为经常查询的列添加适当的索引
- 对大表使用 LIMIT 子句
- 考虑对高频查询使用连接池

### 3. 开发工作流

- 为开发和生产使用不同的配置
- 仅在开发环境中启用写操作
- 当架构更改时定期清除缓存

## 故障排除

### 问题：MCP 服务器未启动

**症状**：Cascade 无法访问数据库工具

**解决方案**：
1. 验证 Node.js 已安装：`node --version`
2. 检查配置文件语法（有效的 JSON）
3. 确保文件路径正确
4. 检查 Windsurf 日志中的错误

### 问题：连接失败

**症状**："连接被拒绝"或超时错误

**解决方案**：
1. 验证数据库正在运行
2. 检查主机、端口和凭据
3. 确保防火墙允许连接
4. 先使用数据库客户端测试连接

### 问题：认证失败

**症状**："访问被拒绝"错误

**解决方案**：
1. 验证用户名和密码
2. 检查用户权限
3. 确保用户可以从您的主机连接
4. 对于 MySQL，检查 `mysql.user` 表

### 问题：权限不足

**症状**：无法执行某些查询

**解决方案**：
1. 检查数据库用户权限
2. 对于写操作，确保设置了 `--allow-write`
3. 验证用户具有 SELECT/INSERT/UPDATE/DELETE 权限

### 问题：查询缓慢

**症状**：查询耗时过长

**解决方案**：
1. 为查询的列添加索引
2. 对大结果集使用 LIMIT
3. 优化 SQL 查询
4. 检查数据库服务器性能

### 问题：配置未加载

**症状**：配置更改未生效

**解决方案**：
1. 完全重启 Windsurf IDE
2. 验证 JSON 语法有效
3. 检查文件是否保存在正确位置
4. 查看 Windsurf 日志中的错误消息

## 环境变量

您可以在配置中使用环境变量以提高安全性：

### Windows (PowerShell)

```powershell
$env:DB_PASSWORD = "your_password"
```

### macOS/Linux

```bash
export DB_PASSWORD="your_password"
```

然后在配置中引用（如果您的 shell 支持）：

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
        "--password", "${DB_PASSWORD}",
        "--database", "your_database"
      ]
    }
  }
}
```

## 资源

- [Windsurf IDE](https://codeium.com/windsurf)
- [Codeium 文档](https://codeium.com/docs)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [Universal Database MCP Server](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Codeium 社区: https://discord.gg/codeium
