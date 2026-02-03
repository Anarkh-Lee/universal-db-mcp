# MCPHost 集成指南

本指南展示如何将 Universal Database MCP Server 与 MCPHost 集成。

## 概述

[MCPHost](https://github.com/mark3labs/mcphost) 是一个使用 MCP 与 LLM 聊天的 CLI 工具。它允许您从命令行查询数据库。

## 前置要求

- 已安装 MCPHost（`go install github.com/mark3labs/mcphost@latest`）
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

创建 `~/.mcphost/config.json`：

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
  },
  "llm": {
    "provider": "openai",
    "model": "gpt-4"
  }
}
```

## 使用方法

```bash
mcphost chat
> 数据库里有哪些表？
> 显示 users 表的结构
```

## 资源

- [MCPHost GitHub](https://github.com/mark3labs/mcphost)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
