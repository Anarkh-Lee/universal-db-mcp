# Witsy Integration Guide

This guide shows how to integrate Universal Database MCP Server with Witsy.

## Overview

[Witsy](https://witsy.app/) is a desktop AI assistant. It supports MCP, allowing you to query databases from the chat interface.

## Prerequisites

- Witsy installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to Witsy's MCP configuration:

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

Ask Witsy about your database:

```
What tables are in the database?
Show me the schema of the users table
```

## Resources

- [Witsy Website](https://witsy.app/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
