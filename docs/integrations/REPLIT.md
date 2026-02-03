# Replit Integration Guide

This guide shows how to integrate Universal Database MCP Server with Replit.

## Overview

[Replit](https://replit.com/) is an online IDE with AI agent capabilities. It supports MCP, allowing you to query databases directly from your Replit workspace.

## Prerequisites

- Replit account
- Database instance accessible from Replit

## Configuration

### Step 1: Create Replit Project

1. Create a new Repl
2. Add `.replit` configuration for MCP

### Step 2: Configure MCP Server

Add to your project's MCP configuration:

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "your-db-host",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

### Step 3: Use Replit AI Agent

Ask the AI agent about your database:

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

## Best Practices

1. Use environment secrets for credentials
2. Use read-only database users
3. Ensure database is accessible from Replit

## Resources

- [Replit Documentation](https://docs.replit.com/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
