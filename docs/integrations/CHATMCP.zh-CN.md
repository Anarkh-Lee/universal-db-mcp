# ChatMCP 集成指南

本指南展示如何将 Universal Database MCP Server 与 ChatMCP 集成。

## 概述

[ChatMCP](https://github.com/daodao97/chatmcp) 是一个专注于 MCP 的聊天 UI。它专门设计用于测试和使用 MCP 服务器。

## 前置要求

- 已安装 ChatMCP
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

添加到 ChatMCP 的配置：

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

向 ChatMCP 询问关于数据库的问题：

```
数据库里有哪些表？
显示 users 表的结构
```

## 资源

- [ChatMCP GitHub](https://github.com/daodao97/chatmcp)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
