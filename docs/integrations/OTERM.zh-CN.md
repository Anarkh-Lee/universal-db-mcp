# Oterm 集成指南

本指南展示如何将 Universal Database MCP Server 与 Oterm 集成。

## 概述

[Oterm](https://github.com/ggozad/oterm) 是一个支持 MCP 的终端 Ollama 客户端。它允许您在与本地 LLM 聊天时查询数据库。

## 前置要求

- 已安装 Oterm（`pip install oterm`）
- 已安装并运行 Ollama
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

创建 `~/.config/oterm/config.json`：

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

```bash
oterm
> 数据库里有哪些表？
> 显示 users 表的结构
```

## 资源

- [Oterm GitHub](https://github.com/ggozad/oterm)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
