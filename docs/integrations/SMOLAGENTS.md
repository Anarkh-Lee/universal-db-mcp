# Smolagents Integration Guide

This guide shows how to integrate Universal Database MCP Server with Smolagents.

## Overview

[Smolagents](https://github.com/huggingface/smolagents) is Hugging Face's agent library. It supports MCP, allowing you to use database tools in your agents.

## Prerequisites

- Python 3.9+
- Smolagents installed
- Node.js 20.0.0 or later
- Database instance

## Installation

```bash
pip install smolagents
```

## Configuration

```python
from smolagents import MCPClient, Agent

mcp_client = MCPClient(
    command="npx",
    args=[
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
    ]
)

tools = mcp_client.get_tools()
agent = Agent(tools=tools)

result = agent.run("What tables are in the database?")
print(result)
```

## Resources

- [Smolagents GitHub](https://github.com/huggingface/smolagents)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
