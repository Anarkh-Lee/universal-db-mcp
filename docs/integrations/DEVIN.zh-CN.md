# Devin 集成指南

本指南展示如何将 Universal Database MCP Server 与 Devin 集成。

## 概述

[Devin](https://devin.ai/) 是一个 AI 软件工程师。它支持 MCP，允许它在处理代码库时查询数据库。

## 前置要求

- Devin 访问权限
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

在 Devin 设置中配置 MCP 服务器：

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

向 Devin 询问关于数据库的问题：

```
数据库里有哪些表？
创建一个从数据库查询用户的函数
为所有表生成 TypeScript 接口
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 资源

- [Devin 文档](https://devin.ai/docs)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
