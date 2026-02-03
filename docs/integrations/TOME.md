# Tome Integration Guide

This guide shows how to integrate Universal Database MCP Server with Tome.

## Overview

[Tome](https://github.com/runebook/tome) is a macOS app for local LLMs. It supports MCP, allowing you to query databases from the chat interface.

## Prerequisites

- macOS
- Tome installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to Tome's MCP configuration:

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

Ask Tome about your database:

```
What tables are in the database?
Show me the schema of the users table
```

## Resources

- [Tome GitHub](https://github.com/runebook/tome)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
