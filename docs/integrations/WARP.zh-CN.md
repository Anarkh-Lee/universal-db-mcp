# Warp 集成指南

本指南展示如何将 Universal Database MCP Server 与 Warp 终端集成。

## 概述

[Warp](https://www.warp.dev/) 是一个支持 MCP 的 AI 驱动终端。您可以直接从终端使用自然语言查询数据库。

## 前置要求

- 已安装 Warp（[下载地址](https://www.warp.dev/)）
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

### 步骤 1：打开 Warp 设置

1. 启动 Warp
2. 打开设置（Cmd + ,）
3. 导航到"AI" > "MCP Servers"

### 步骤 2：添加 MCP 服务器

添加以下配置：

```json
{
  "mcpServers": {
    "database": {
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

## 使用方法

使用 Warp AI 查询数据库：

```bash
# 按 Ctrl+` 打开 Warp AI
> 数据库里有哪些表？
> 显示 users 表的结构
> 今天有多少订单？
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 最佳实践

1. 使用只读数据库用户
2. 保护好凭据安全
3. 使用具体查询

## 资源

- [Warp 文档](https://docs.warp.dev/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
