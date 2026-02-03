# Zed 编辑器集成指南

本指南展示如何将 Universal Database MCP Server 与 Zed 编辑器集成。

## 概述

Zed 是一款使用 Rust 构建的高性能开源代码编辑器，专为速度和协作而设计。Zed 原生支持模型上下文协议（MCP），可与 AI 助手和数据库工具无缝集成。通过集成 Universal Database MCP Server，您可以使用 Zed 内置的 AI 功能直接查询和分析数据库数据。

**主要优势：**
- 原生 MCP 支持，无需安装额外扩展
- 闪电般快速的数据库查询性能
- 直接从 Zed 的 AI 助手查询数据库
- 无需离开编辑器即可探索数据库结构
- 获得 AI 辅助编写和优化 SQL 查询

## 前置要求

- 已安装 [Zed 编辑器](https://zed.dev/)（建议版本 0.131.0 或更高）
- 已安装 Node.js 18+
- 数据库实例（MySQL、PostgreSQL、SQLite 等）

## 配置

Zed 使用 MCP stdio 模式进行上下文服务器集成。配置通过 `settings.json` 文件完成。

### 配置文件位置

| 平台 | 路径 |
|------|------|
| macOS | `~/.config/zed/settings.json` |
| Linux | `~/.config/zed/settings.json` |

> **注意**：Zed 目前支持 macOS 和 Linux。Windows 支持正在开发中。

### 步骤 1: 打开 Zed 设置

1. 打开 Zed 编辑器
2. 按 `Cmd+,`（macOS）或 `Ctrl+,`（Linux）打开设置
3. 点击设置面板右下角的 "Open settings.json"

或者，您可以直接编辑 `~/.config/zed/settings.json` 文件。

### 步骤 2: 添加 MCP 服务器配置

使用 `context_servers` 键将 Universal Database MCP Server 配置添加到您的 `settings.json` 文件中：

#### 基本配置

```json
{
  "context_servers": {
    "universal-db-mcp": {
      "command": {
        "path": "npx",
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
}
```

### 步骤 3: 重启 Zed

保存配置文件后，重启 Zed 编辑器以使更改生效。您也可以使用 `Cmd+Shift+P`（macOS）或 `Ctrl+Shift+P`（Linux）并搜索 "Reload" 来重新加载配置。

## 配置示例

### MySQL

```json
{
  "context_servers": {
    "mysql-db": {
      "command": {
        "path": "npx",
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
}
```

### PostgreSQL

```json
{
  "context_servers": {
    "postgres-db": {
      "command": {
        "path": "npx",
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
}
```

### SQLite

```json
{
  "context_servers": {
    "sqlite-db": {
      "command": {
        "path": "npx",
        "args": [
          "universal-db-mcp",
          "--type", "sqlite",
          "--file-path", "/path/to/your/database.db"
        ]
      }
    }
  }
}
```

### SQL Server

```json
{
  "context_servers": {
    "sqlserver-db": {
      "command": {
        "path": "npx",
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
}
```

### Oracle

```json
{
  "context_servers": {
    "oracle-db": {
      "command": {
        "path": "npx",
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
}
```

### MongoDB

```json
{
  "context_servers": {
    "mongodb": {
      "command": {
        "path": "npx",
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
}
```

### Redis

```json
{
  "context_servers": {
    "redis": {
      "command": {
        "path": "npx",
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
}
```

### 达梦数据库

```json
{
  "context_servers": {
    "dm-db": {
      "command": {
        "path": "npx",
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
}
```

### 人大金仓

```json
{
  "context_servers": {
    "kingbase-db": {
      "command": {
        "path": "npx",
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
}
```

### 多数据库配置

您可以配置多个数据库连接：

```json
{
  "context_servers": {
    "mysql-production": {
      "command": {
        "path": "npx",
        "args": [
          "universal-db-mcp",
          "--type", "mysql",
          "--host", "prod-db.example.com",
          "--port", "3306",
          "--user", "readonly_user",
          "--password", "prod_password",
          "--database", "production_db"
        ]
      }
    },
    "mysql-development": {
      "command": {
        "path": "npx",
        "args": [
          "universal-db-mcp",
          "--type", "mysql",
          "--host", "localhost",
          "--port", "3306",
          "--user", "root",
          "--password", "dev_password",
          "--database", "development_db"
        ]
      }
    },
    "postgres-analytics": {
      "command": {
        "path": "npx",
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
}
```

### 启用写操作

默认情况下，为安全起见禁用写操作。要启用写操作：

```json
{
  "context_servers": {
    "mysql-db-writable": {
      "command": {
        "path": "npx",
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
}
```

> **警告**：启用写操作允许 AI 执行 INSERT、UPDATE、DELETE 和其他修改查询。请谨慎使用，尤其是在生产环境中。

### 使用环境变量

为了更好的安全性，您可以在配置中使用环境变量：

```json
{
  "context_servers": {
    "mysql-db": {
      "command": {
        "path": "npx",
        "args": [
          "universal-db-mcp",
          "--type", "mysql",
          "--host", "localhost",
          "--port", "3306",
          "--user", "root",
          "--password", "your_password",
          "--database", "your_database"
        ],
        "env": {
          "NODE_ENV": "production"
        }
      }
    }
  }
}
```

## 可用工具

配置完成后，以下 MCP 工具将在 Zed 中可用：

| 工具 | 描述 |
|------|------|
| `execute_query` | 对数据库执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息（表、列、类型） |
| `get_table_info` | 获取特定表的详细信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 使用示例

### 示例 1: 探索数据库结构

在 Zed 的 AI 助手面板中，您可以询问：

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

### 示例 4: 调试查询

分享有问题的查询并寻求帮助：

```
这个查询很慢，你能帮我优化吗？

SELECT * FROM users u
WHERE u.id IN (SELECT user_id FROM orders WHERE created_at > '2024-01-01')
```

AI 将分析并建议优化方案。

### 示例 5: 生成代码

让 AI 生成数据库相关代码：

```
生成一个 TypeScript 函数，用于向 users 表插入新用户
```

AI 将检查您的结构并生成适当的代码。

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
- **切勿将**包含真实凭据的 `settings.json` 提交到版本控制
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

**症状**：Zed 无法识别数据库工具

**解决方案**：
1. 验证 `settings.json` 文件位于正确位置（`~/.config/zed/settings.json`）
2. 检查 JSON 语法是否有效（无尾随逗号、正确的引号）
3. 更改配置后重启 Zed
4. 确保 Node.js 已安装并可从 PATH 访问

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
3. 尝试使用 npx 的完整路径（例如 `/usr/local/bin/npx`）
4. 使用 `which npx` 或 `npx --version` 验证安装

### 问题：上下文服务器无法启动

**症状**：Zed 显示上下文服务器启动失败的错误

**解决方案**：
1. 检查 Zed 的日志文件以获取详细错误信息
2. 验证命令路径是否正确（使用 `which npx` 查找完整路径）
3. 在终端中手动测试 MCP 服务器：
   ```bash
   npx universal-db-mcp --type mysql --host localhost --port 3306 --user root --password your_password --database your_database
   ```
4. 确保提供了所有必需的参数

## 高级配置

### 与 Docker 配合使用

如果您的数据库在 Docker 中运行，确保容器可访问：

```json
{
  "context_servers": {
    "docker-mysql": {
      "command": {
        "path": "npx",
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
}
```

> **注意**：在某些系统上连接 Docker 容器时，使用 `127.0.0.1` 而非 `localhost`。

### 完整设置示例

以下是一个完整的 `settings.json` 示例，包含数据库 MCP 服务器以及其他 Zed 设置：

```json
{
  "theme": "One Dark",
  "buffer_font_size": 14,
  "format_on_save": "on",
  "context_servers": {
    "mysql-db": {
      "command": {
        "path": "npx",
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
}
```

## 资源

- [Zed 编辑器官方网站](https://zed.dev/)
- [Zed 文档](https://zed.dev/docs)
- [Zed 上下文服务器文档](https://zed.dev/docs/context-servers)
- [Universal Database MCP Server 文档](../README.zh-CN.md)
- [MCP 协议规范](https://modelcontextprotocol.io/)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Zed 社区: https://zed.dev/community
- Zed Discord: https://discord.gg/zed-community
