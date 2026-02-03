# OpenAI Agents SDK 集成指南

本指南展示如何将 Universal Database MCP Server 与 OpenAI Agents SDK 集成。

## 概述

[OpenAI Agents SDK](https://platform.openai.com/) 是 OpenAI 的代理框架。它通过 SSE/Streamable HTTP 支持 MCP，允许您在代理中使用数据库工具。

## 前置要求

- OpenAI API 密钥
- 以 HTTP 模式部署的 Universal Database MCP Server
- 数据库实例

## 配置

### 步骤 1：部署 HTTP API 服务器

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=openai-agent-key \
  universal-db-mcp:latest
```

### 步骤 2：配置代理

```python
from openai import OpenAI

client = OpenAI()

# 将 MCP 服务器配置为工具
tools = [
    {
        "type": "mcp",
        "mcp": {
            "url": "https://your-server.com/mcp",
            "headers": {
                "X-DB-Type": "mysql",
                "X-DB-Host": "localhost",
                "X-DB-Port": "3306",
                "X-DB-User": "root",
                "X-DB-Password": "password",
                "X-DB-Database": "mydb"
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "数据库里有哪些表？"}],
    tools=tools
)
```

## 资源

- [OpenAI Platform](https://platform.openai.com/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
