# Cline 集成指南

本指南展示如何将 Universal Database MCP Server 与 Cline 集成。

## 概述

Cline 是一款支持 MCP stdio 模式的 VS Code AI 编程助手扩展。它是一个自主 AI 编码代理，可以帮助您编写、调试和理解代码。通过集成 Universal Database MCP Server，您可以让 Cline 直接查询和分析数据库数据，从而更轻松地处理数据库相关任务。

**主要优势：**
- 直接从 Cline 的 AI 聊天中查询数据库
- 获得 AI 辅助编写 SQL 查询
- 无需离开 VS Code 即可探索数据库结构
- 借助 AI 帮助调试和优化数据库查询
- 具有数据库访问能力的自主任务执行

## 前置要求

- 已安装 [Visual Studio Code](https://code.visualstudio.com/)
- 已安装 [Cline 扩展](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev)
- 已安装 Node.js 18+
- 数据库实例（MySQL、PostgreSQL、SQLite 等）

## 配置

Cline 使用 MCP stdio 模式进行工具集成。配置通过 JSON 文件完成。

### 配置文件位置

| 平台 | 路径 |
|------|------|
| macOS | `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| Linux | `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| Windows | `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` |

### 步骤 1: 安装 Cline 扩展

1. 打开 VS Code 扩展面板（`Ctrl+Shift+X` 或 `Cmd+Shift+X`）
2. 搜索 "Cline"
3. 安装 Cline 扩展
4. 如有提示，重新加载 VS Code

### 步骤 2: 打开 MCP 设置

您可以通过两种方式访问 MCP 设置：

**方法 A：通过 Cline 面板**
1. 在 VS Code 中打开 Cline 面板
2. 点击顶部工具栏中的 MCP Servers 图标（服务器图标）
3. 点击 "Configure MCP Servers" 或直接编辑设置

**方法 B：通过设置文件**
1. 导航到您平台对应的配置文件位置
2. 创建或编辑 `cline_mcp_settings.json` 文件

### 步骤 3: 添加 MCP 服务器配置

将 Universal Database MCP Server 配置添加到您的设置文件中：

#### 基本配置

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

### 步骤 4: 重启 Cline

保存配置文件后，重启 Cline 扩展或重新加载 VS Code 以使更改生效。

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

### 使用环境变量

为了更好的安全性，您可以在配置中使用环境变量：

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
        "--password", "${DB_PASSWORD}",
        "--database", "myapp"
      ],
      "env": {
        "DB_PASSWORD": "your_password"
      }
    }
  }
}
```

## 可用工具

配置完成后，以下 MCP 工具将在 Cline 中可用：

| 工具 | 描述 |
|------|------|
| `execute_query` | 对数据库执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息（表、列、类型） |
| `get_table_info` | 获取特定表的详细信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 使用示例

### 示例 1: 探索数据库结构

在 Cline 的聊天中，您可以询问：

```
我的数据库中有哪些表？
```

Cline 将使用 `get_schema` 工具检索并显示您的数据库结构。

### 示例 2: 查询数据

让 Cline 查询您的数据：

```
显示 orders 表中最近的 10 条订单
```

Cline 将生成并执行适当的 SQL 查询：

```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10
```

### 示例 3: 编写 SQL 查询

获取编写复杂查询的帮助：

```
编写一个查询，找出按总订单金额排名前 5 的客户
```

Cline 将分析您的结构并生成：

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

### 示例 4: 调试查询

分享有问题的查询并寻求帮助：

```
这个查询很慢，你能帮我优化吗？

SELECT * FROM users u
WHERE u.id IN (SELECT user_id FROM orders WHERE created_at > '2024-01-01')
```

Cline 将分析并建议优化方案。

### 示例 5: 生成代码

让 Cline 生成数据库相关代码：

```
生成一个 TypeScript 函数，用于向 users 表插入新用户
```

Cline 将检查您的结构并生成适当的代码。

### 示例 6: 自主数据库任务

Cline 可以执行复杂的多步骤数据库任务：

```
分析 orders 表，识别任何数据质量问题，并建议改进 schema
```

Cline 将自主查询数据库、分析结果并提供建议。

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
- **切勿将**包含真实凭据的配置文件提交到版本控制
- **尽可能使用环境变量**存储敏感数据
- **限制数据库权限**仅授予必要的权限

### 2. 性能

- 使用具体查询而非 `SELECT *`
- 添加 `LIMIT` 子句以防止大结果集
- 考虑使用只读副本进行大量查询

### 3. 开发工作流

- 为开发和生产配置单独的连接
- 为多个数据库连接使用描述性名称
- 除非特别需要，否则保持禁用写操作

## 故障排除

### 问题：MCP 服务器未连接

**症状**：Cline 无法识别数据库工具

**解决方案**：
1. 验证配置文件位于正确位置
2. 检查 JSON 语法是否有效（无尾随逗号、正确的引号）
3. 更改配置后重启 VS Code
4. 确保 Node.js 已安装并可从 PATH 访问
5. 检查 Cline 中的 MCP Servers 面板以查看连接状态

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

### 问题：查询缓慢

**症状**：查询执行时间过长

**解决方案**：
1. 为数据库表添加适当的索引
2. 使用 `LIMIT` 子句限制结果集
3. 优化复杂查询
4. 考虑使用只读副本

### 问题：找不到 npx 命令

**症状**：错误提示 npx 未被识别

**解决方案**：
1. 安装 Node.js（版本 18 或更高）
2. 确保 Node.js bin 目录在系统 PATH 中
3. 尝试使用 npx 的完整路径
4. 在 Windows 上，安装 Node.js 后可能需要重启

### 查看日志

要查看 Cline 日志进行调试：
1. 打开 VS Code 输出面板（`Ctrl+Shift+U` 或 `Cmd+Shift+U`）
2. 从下拉菜单中选择 "Cline"
3. 查找 MCP 相关消息

## 高级配置

### 与 Docker 配合使用

如果您的数据库在 Docker 中运行，确保容器可访问：

```json
{
  "mcpServers": {
    "docker-mysql": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "127.0.0.1",
        "--port", "3306",
        "--user", "root",
        "--password", "root_password",
        "--database", "app_db"
      ]
    }
  }
}
```

> **注意**：在某些系统上连接 Docker 容器时，使用 `127.0.0.1` 而非 `localhost`。

### 禁用服务器

您可以在不删除配置的情况下临时禁用服务器：

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
      ],
      "disabled": true
    }
  }
}
```

## 资源

- [Cline 扩展](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev)
- [Cline GitHub 仓库](https://github.com/cline/cline)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Universal Database MCP Server 文档](../README.zh-CN.md)
- [MCP 协议规范](https://modelcontextprotocol.io/)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Cline Issues: https://github.com/cline/cline/issues
