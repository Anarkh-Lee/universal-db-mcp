# Tome 集成指南

本指南展示如何将 Universal Database MCP Server 与 Tome 集成。

## 概述

[Tome](https://github.com/runebook/tome) 是一个用于本地 LLM 的 macOS 应用。它支持 MCP，允许您从聊天界面查询数据库。

## 前置要求

- macOS
- 已安装 Tome
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

添加到 Tome 的 MCP 配置：

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

向 Tome 询问关于数据库的问题：

```
数据库里有哪些表？
显示 users 表的结构
```

## 资源

- [Tome GitHub](https://github.com/runebook/tome)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
