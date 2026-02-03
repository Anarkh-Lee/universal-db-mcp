# MCPHost Integration Guide

This guide shows how to integrate Universal Database MCP Server with MCPHost.

## Overview

[MCPHost](https://github.com/mark3labs/mcphost) is a CLI tool for chatting with LLMs using MCP. It allows you to query databases from the command line.

## Prerequisites

- MCPHost installed (`go install github.com/mark3labs/mcphost@latest`)
- Node.js 20.0.0 or later
- Database instance

## Configuration

Create `~/.mcphost/config.json`:

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

## Usage

```bash
mcphost chat
> What tables are in the database?
> Show me the schema of the users table
```

## Resources

- [MCPHost GitHub](https://github.com/mark3labs/mcphost)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
