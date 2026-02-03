# Msty Integration Guide

This guide shows how to integrate Universal Database MCP Server with Msty.

## Overview

[Msty](https://msty.app/) is a desktop AI chat application. It supports MCP, allowing you to query databases from the chat interface.

## Prerequisites

- Msty installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to Msty's MCP configuration:

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

Ask Msty about your database:

```
What tables are in the database?
Show me the schema of the users table
How many orders were placed today?
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Resources

- [Msty Website](https://msty.app/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
