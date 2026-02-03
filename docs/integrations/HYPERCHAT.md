# HyperChat Integration Guide

This guide shows how to integrate Universal Database MCP Server with HyperChat.

## Overview

[HyperChat](https://github.com/BigSweetPotatoStudio/HyperChat) is a multi-platform chat application. It supports MCP, allowing you to query databases from the chat interface.

## Prerequisites

- HyperChat installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to HyperChat's MCP configuration:

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

Ask HyperChat about your database:

```
What tables are in the database?
Show me the schema of the users table
```

## Resources

- [HyperChat GitHub](https://github.com/BigSweetPotatoStudio/HyperChat)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
