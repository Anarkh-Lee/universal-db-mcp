# Devin Integration Guide

This guide shows how to integrate Universal Database MCP Server with Devin.

## Overview

[Devin](https://devin.ai/) is an AI software engineer. It supports MCP, allowing it to query databases while working on your codebase.

## Prerequisites

- Devin access
- Node.js 20.0.0 or later
- Database instance

## Configuration

Configure MCP server in Devin's settings:

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

Ask Devin about your database:

```
What tables are in the database?
Create a function to query users from the database
Generate TypeScript interfaces for all tables
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Resources

- [Devin Documentation](https://devin.ai/docs)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
