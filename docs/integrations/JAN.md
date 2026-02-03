# Jan Integration Guide

This guide shows how to integrate Universal Database MCP Server with Jan, the open-source ChatGPT alternative.

## Overview

[Jan](https://jan.ai/) is an open-source, offline-first ChatGPT alternative that runs local LLMs. It supports MCP, allowing you to connect to databases and query them using natural language.

**Key Benefits:**
- Open-source and privacy-focused
- Runs completely offline
- Native MCP support
- Works with various local LLMs

## Prerequisites

- Jan installed ([Download here](https://jan.ai/))
- Node.js 20.0.0 or later
- Database instance accessible from your machine

## Configuration

### Step 1: Open Jan Settings

1. Launch Jan
2. Click the gear icon to open Settings
3. Navigate to "Extensions" or "MCP Servers"

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

## Configuration Examples

### MySQL

```json
{
  "mcpServers": {
    "mysql-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "password",
        "--database", "myapp"
      ]
    }
  }
}
```

### PostgreSQL

```json
{
  "mcpServers": {
    "postgres-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "password",
        "--database", "myapp"
      ]
    }
  }
}
```

### SQLite

```json
{
  "mcpServers": {
    "sqlite-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/database.db"
      ]
    }
  }
}
```

## Usage

### Querying Your Database

Once configured, you can ask Jan about your database:

```
What tables are in the database?

Show me the schema of the users table

How many users signed up this week?

Find the top 10 products by sales
```

### Common Workflows

**Schema Exploration:**
```
List all tables and their columns
What are the relationships between tables?
Show me the indexes on the products table
```

**Data Analysis:**
```
What's the total revenue this month?
How many active users do we have?
Show me orders from the last 7 days
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema information |
| `get_table_info` | Get detailed table information |
| `clear_cache` | Clear schema cache |

## Best Practices

### Security

1. Use read-only database users
2. Keep credentials secure
3. Use local databases when possible
4. Disable write mode unless necessary

### Performance

1. Use specific queries instead of SELECT *
2. Add LIMIT to prevent large result sets
3. Choose appropriate local LLM for your hardware

## Troubleshooting

### MCP Server Not Found

**Symptoms:** Jan doesn't show database tools

**Solutions:**
1. Verify MCP configuration is correct
2. Ensure Node.js 20+ is installed
3. Restart Jan after configuration changes

### Connection Failed

**Symptoms:** Database connection errors

**Solutions:**
1. Verify database is running
2. Check credentials are correct
3. Ensure network connectivity
4. Test with database client first

## Resources

- [Jan Documentation](https://jan.ai/docs)
- [Jan GitHub](https://github.com/janhq/jan)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Jan Discord: https://discord.gg/jan
