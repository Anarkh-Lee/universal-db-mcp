# 5ire 集成指南

本指南展示如何将 Universal Database MCP Server 与 5ire 集成。

## 概述

[5ire](https://github.com/5ire-tech/5ire) 是一个跨平台 AI 聊天应用。它支持 MCP，允许您从聊天界面查询数据库。

## 前置要求

- 已安装 5ire
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

添加到 5ire 的 MCP 配置：

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

向 5ire 询问关于数据库的问题：

```
数据库里有哪些表？
显示 users 表的结构
```

## 资源

- [5ire GitHub](https://github.com/5ire-tech/5ire)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
