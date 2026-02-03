# ChatMCP Integration Guide

This guide shows how to integrate Universal Database MCP Server with ChatMCP.

## Overview

[ChatMCP](https://github.com/daodao97/chatmcp) is an MCP-focused chat UI. It's designed specifically for testing and using MCP servers.

## Prerequisites

- ChatMCP installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to ChatMCP's configuration:

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

## Usage

Ask ChatMCP about your database:

```
What tables are in the database?
Show me the schema of the users table
```

## Resources

- [ChatMCP GitHub](https://github.com/daodao97/chatmcp)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
