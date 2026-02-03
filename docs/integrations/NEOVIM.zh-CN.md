# Neovim 集成指南

本指南展示如何将 Universal Database MCP Server 与 Neovim 集成。

## 概述

Neovim 是一款高度可扩展的、基于 Vim 的文本编辑器，通过其 Lua API 和插件生态系统支持现代功能。通过使用 MCPHub.nvim 插件，您可以将 Universal Database MCP Server 与 Neovim 集成，在编辑器中直接实现 AI 驱动的数据库交互。

**主要优势：**
- 直接从 Neovim 查询数据库
- 获得 AI 辅助编写 SQL 查询
- 无需离开编辑器即可探索数据库结构
- 与 Neovim 工作流无缝集成

## 前置要求

- 已安装 [Neovim](https://neovim.io/)（建议版本 0.8.0 或更高）
- 已安装 Node.js 18+
- 插件管理器（lazy.nvim、packer.nvim 或类似工具）
- 数据库实例（MySQL、PostgreSQL、SQLite 等）

## 插件安装

Neovim 通过 MCPHub.nvim 插件支持 MCP。以下是常用插件管理器的安装说明。

### 使用 lazy.nvim

将以下内容添加到您的 Neovim 配置中：

```lua
{
  "ravitemer/mcphub.nvim",
  dependencies = {
    "nvim-lua/plenary.nvim",
  },
  config = function()
    require("mcphub").setup({
      -- 配置在此处
    })
  end,
}
```

### 使用 packer.nvim

将以下内容添加到您的 Neovim 配置中：

```lua
use {
  "ravitemer/mcphub.nvim",
  requires = {
    "nvim-lua/plenary.nvim",
  },
  config = function()
    require("mcphub").setup({
      -- 配置在此处
    })
  end,
}
```

### 使用 vim-plug

将以下内容添加到您的 Neovim 配置中：

```vim
Plug 'nvim-lua/plenary.nvim'
Plug 'ravitemer/mcphub.nvim'
```

然后添加 Lua 配置：

```lua
lua << EOF
require("mcphub").setup({
  -- 配置在此处
})
EOF
```

## 配置

安装插件后，在 Neovim 设置中配置 MCP 服务器。

### 基本配置

```lua
require("mcphub").setup({
  servers = {
    ["universal-db-mcp"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

## 配置示例

### MySQL

```lua
require("mcphub").setup({
  servers = {
    ["mysql-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

### PostgreSQL

```lua
require("mcphub").setup({
  servers = {
    ["postgres-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

### SQLite

```lua
require("mcphub").setup({
  servers = {
    ["sqlite-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/your/database.db"
      }
    }
  }
})
```

### SQL Server

```lua
require("mcphub").setup({
  servers = {
    ["sqlserver-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "localhost",
        "--port", "1433",
        "--user", "sa",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

### Oracle

```lua
require("mcphub").setup({
  servers = {
    ["oracle-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "your_password",
        "--database", "ORCL"
      }
    }
  }
})
```

### MongoDB

```lua
require("mcphub").setup({
  servers = {
    ["mongodb"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "admin",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

### Redis

```lua
require("mcphub").setup({
  servers = {
    ["redis"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "your_password"
      }
    }
  }
})
```

### 达梦数据库

```lua
require("mcphub").setup({
  servers = {
    ["dm-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "dm",
        "--host", "localhost",
        "--port", "5236",
        "--user", "SYSDBA",
        "--password", "your_password",
        "--database", "DAMENG"
      }
    }
  }
})
```

### 人大金仓

```lua
require("mcphub").setup({
  servers = {
    ["kingbase-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "kingbase",
        "--host", "localhost",
        "--port", "54321",
        "--user", "system",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

### 多数据库配置

您可以配置多个数据库连接：

```lua
require("mcphub").setup({
  servers = {
    ["mysql-production"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "prod-db.example.com",
        "--port", "3306",
        "--user", "readonly_user",
        "--password", "prod_password",
        "--database", "production_db"
      }
    },
    ["mysql-development"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "dev_password",
        "--database", "development_db"
      }
    },
    ["postgres-analytics"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "analytics-db.example.com",
        "--port", "5432",
        "--user", "analyst",
        "--password", "analytics_password",
        "--database", "analytics"
      }
    }
  }
})
```

### 启用写操作

默认情况下，为安全起见禁用写操作。要启用写操作：

```lua
require("mcphub").setup({
  servers = {
    ["mysql-db-writable"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database",
        "--allow-write", "true"
      }
    }
  }
})
```

> **警告**：启用写操作允许 AI 执行 INSERT、UPDATE、DELETE 和其他修改查询。请谨慎使用，尤其是在生产环境中。

## 可用工具

配置完成后，以下 MCP 工具将可用：

| 工具 | 描述 |
|------|------|
| `execute_query` | 对数据库执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息（表、列、类型） |
| `get_table_info` | 获取特定表的详细信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 使用示例

### 示例 1: 探索数据库结构

使用 MCPHub 命令与数据库交互：

```
:MCPHub
```

然后询问 AI：

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
生成一个 Lua 函数，用于向 users 表插入新用户
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

### 问题：插件未加载

**症状**：MCPHub 命令不可用

**解决方案**：
1. 验证插件是否正确安装
2. 检查 plenary.nvim 依赖是否已安装
3. 运行 `:checkhealth mcphub` 诊断问题
4. 确保 Neovim 版本为 0.8.0 或更高

### 问题：MCP 服务器未连接

**症状**：无法通过 MCPHub 连接到数据库

**解决方案**：
1. 验证配置语法是否正确
2. 检查 Node.js 是否已安装并可从 PATH 访问
3. 确保 npx 命令可用
4. 更改配置后重启 Neovim

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
4. 在 Windows 上，安装 Node.js 后可能需要重启

## 高级配置

### 使用环境变量

为了更好的安全性，您可以在配置中使用环境变量：

```lua
require("mcphub").setup({
  servers = {
    ["mysql-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", os.getenv("DB_PASSWORD") or "default_password",
        "--database", "your_database"
      }
    }
  }
})
```

在启动 Neovim 之前设置环境变量：

**macOS/Linux：**
```bash
export DB_PASSWORD="your_secure_password"
```

**Windows (PowerShell)：**
```powershell
$env:DB_PASSWORD = "your_secure_password"
```

### 与其他插件集成

MCPHub.nvim 可以与其他 Neovim 插件配合使用以增强功能：

- **nvim-cmp**：用于 AI 驱动的补全
- **telescope.nvim**：用于模糊查找数据库对象
- **which-key.nvim**：用于快捷键发现

## 资源

- [Neovim 官方网站](https://neovim.io/)
- [MCPHub.nvim GitHub 仓库](https://github.com/ravitemer/mcphub.nvim)
- [Universal Database MCP Server 文档](../README.zh-CN.md)
- [MCP 协议规范](https://modelcontextprotocol.io/)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Neovim 社区: https://neovim.io/community/
