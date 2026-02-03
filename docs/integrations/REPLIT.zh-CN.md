# Replit 集成指南

本指南展示如何将 Universal Database MCP Server 与 Replit 集成。

## 概述

[Replit](https://replit.com/) 是一个具有 AI 代理功能的在线 IDE。它支持 MCP，允许您直接从 Replit 工作区查询数据库。

## 前置要求

- Replit 账号
- 可从 Replit 访问的数据库实例

## 配置

### 步骤 1：创建 Replit 项目

1. 创建新的 Repl
2. 添加 MCP 的 `.replit` 配置

### 步骤 2：配置 MCP 服务器

添加到项目的 MCP 配置：

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "your-db-host",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

### 步骤 3：使用 Replit AI 代理

向 AI 代理询问关于数据库的问题：

```
数据库里有哪些表？
显示 users 表的结构
今天有多少订单？
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 最佳实践

1. 使用环境密钥存储凭据
2. 使用只读数据库用户
3. 确保数据库可从 Replit 访问

## 资源

- [Replit 文档](https://docs.replit.com/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
