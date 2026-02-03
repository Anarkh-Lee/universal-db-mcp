# Amazon Q Developer 集成指南

本指南展示如何将 Universal Database MCP Server 与 Amazon Q Developer 集成。

## 概述

[Amazon Q Developer](https://aws.amazon.com/q/developer/) 是 AWS 的 AI 编码助手。它支持 MCP，允许您在编码时查询数据库。

## 前置要求

- 在 VS Code 或 JetBrains 中安装了 Amazon Q Developer
- AWS 账号
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

添加到 Amazon Q 的 MCP 配置：

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

向 Amazon Q 询问关于数据库的问题：

```
数据库里有哪些表？
显示 users 表的结构
生成查询 orders 表的代码
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 资源

- [Amazon Q Developer 文档](https://docs.aws.amazon.com/amazonq/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
