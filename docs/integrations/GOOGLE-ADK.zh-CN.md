# Google ADK 集成指南

本指南展示如何将 Universal Database MCP Server 与 Google ADK 集成。

## 概述

[Google ADK](https://cloud.google.com/) (Agent Development Kit) 是 Google 的代理开发工具包。它支持 MCP，允许您在代理中使用数据库工具。

## 前置要求

- Google Cloud 账号
- 已安装 Google ADK
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

添加到 ADK 配置：

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

在 ADK 代理中使用数据库工具查询数据。

## 资源

- [Google Cloud 文档](https://cloud.google.com/docs)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
