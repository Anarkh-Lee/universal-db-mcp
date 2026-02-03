# Continue Integration Guide

This guide shows how to integrate Universal Database MCP Server with Continue, the open-source AI code assistant.

## Overview

[Continue](https://continue.dev/) is an open-source AI code assistant that runs in VS Code and JetBrains IDEs. It supports MCP, allowing you to connect to databases and query them using natural language.

**Key Benefits:**
- Open-source and customizable
- Native MCP support
- Works with multiple LLM providers
- VS Code and JetBrains support

## Prerequisites

- Continue extension installed in VS Code or JetBrains
- Node.js 20.0.0 or later
- Database instance accessible from your machine

## Configuration

### Configuration File Location

Continue uses a configuration file at:
- **All platforms:** `~/.continue/config.json`

### Basic Configuration

Add the MCP server to your `config.json`:

```json
{
  "mcpServers": [
    {
      "name": "database",
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
  ]
}
```

## Configuration Examples

### MySQL

```json
{
  "mcpServers": [
    {
      "name": "mysql-dev",
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
  ]
}
```

### PostgreSQL

```json
{
  "mcpServers": [
    {
      "name": "postgres-dev",
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
  ]
}
```

### Multiple Databases

```json
{
  "mcpServers": [
    {
      "name": "mysql-users",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "password",
        "--database", "users_db"
      ]
    },
    {
      "name": "postgres-analytics",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "password",
        "--database", "analytics"
      ]
    }
  ]
}
```

## Usage

### Using MCP Tools

1. Open Continue chat panel
2. Use the `/tools` command to see available tools
3. Ask questions about your database:

```
What tables are in the database?

Show me the schema of the users table

Generate a TypeScript interface for the orders table

Find all users who signed up this week
```

### Common Workflows

**Schema Exploration:**
```
List all tables and their columns
What are the relationships between tables?
Show me the indexes on the products table
```

**Code Generation:**
```
Create a repository class for the users table
Generate SQL migrations for adding a new column
Write a function to get user orders with pagination
```

**Data Analysis:**
```
How many orders were placed this month?
What's the average order value?
Find the top 10 products by sales
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
2. Never commit credentials to version control
3. Use environment variables for sensitive data
4. Keep write mode disabled unless necessary

### Performance

1. Use specific queries instead of SELECT *
2. Add LIMIT to prevent large result sets
3. Cache schema information

## Troubleshooting

### MCP Server Not Found

**Symptoms:** Continue doesn't show database tools

**Solutions:**
1. Verify config.json syntax is valid
2. Check the file is at `~/.continue/config.json`
3. Ensure Node.js 20+ is installed
4. Restart VS Code/IDE

### Connection Failed

**Symptoms:** Database connection errors

**Solutions:**
1. Verify database is running
2. Check credentials are correct
3. Ensure network connectivity
4. Test with database client first

## Resources

- [Continue Documentation](https://continue.dev/docs)
- [Continue GitHub](https://github.com/continuedev/continue)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Continue Discord: https://discord.gg/continue
