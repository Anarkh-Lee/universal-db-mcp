# OpenAI Agents SDK Integration Guide

This guide shows how to integrate Universal Database MCP Server with OpenAI Agents SDK.

## Overview

[OpenAI Agents SDK](https://platform.openai.com/) is OpenAI's agent framework. It supports MCP via SSE/Streamable HTTP, allowing you to use database tools in your agents.

## Prerequisites

- OpenAI API key
- Universal Database MCP Server deployed in HTTP mode
- Database instance

## Configuration

### Step 1: Deploy HTTP API Server

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=openai-agent-key \
  universal-db-mcp:latest
```

### Step 2: Configure Agent

```python
from openai import OpenAI

client = OpenAI()

# Configure MCP server as a tool
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
    messages=[{"role": "user", "content": "What tables are in the database?"}],
    tools=tools
)
```

## Resources

- [OpenAI Platform](https://platform.openai.com/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
