# Warp Integration Guide

This guide shows how to integrate Universal Database MCP Server with Warp terminal.

## Overview

[Warp](https://www.warp.dev/) is an AI-powered terminal with MCP support. You can query databases directly from your terminal using natural language.

## Prerequisites

- Warp installed ([Download here](https://www.warp.dev/))
- Node.js 20.0.0 or later
- Database instance

## Configuration

### Step 1: Open Warp Settings

1. Launch Warp
2. Open Settings (Cmd + ,)
3. Navigate to "AI" > "MCP Servers"

### Step 2: Add MCP Server

Add the following configuration:

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

Use Warp AI to query your database:

```bash
# Press Ctrl+` to open Warp AI
> What tables are in the database?
> Show me the schema of the users table
> How many orders were placed today?
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Best Practices

1. Use read-only database users
2. Keep credentials secure
3. Use specific queries

## Resources

- [Warp Documentation](https://docs.warp.dev/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
