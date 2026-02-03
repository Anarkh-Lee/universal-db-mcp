# HyperChat 集成指南

本指南展示如何将 Universal Database MCP Server 与 HyperChat 集成。

## 概述

[HyperChat](https://github.com/BigSweetPotatoStudio/HyperChat) 是一个多平台聊天应用。它支持 MCP，允许您从聊天界面查询数据库。

## 前置要求

- 已安装 HyperChat
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

添加到 HyperChat 的 MCP 配置：

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

向 HyperChat 询问关于数据库的问题：

```
数据库里有哪些表？
显示 users 表的结构
```

## 资源

- [HyperChat GitHub](https://github.com/BigSweetPotatoStudio/HyperChat)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
