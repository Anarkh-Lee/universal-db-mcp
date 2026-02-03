# Claude Code Integration Guide

This guide shows how to integrate Universal Database MCP Server with Claude Code, Anthropic's agentic coding tool.

## Overview

[Claude Code](https://claude.ai/code) is Anthropic's terminal-based AI coding assistant that runs directly in your command line. It has native MCP support, allowing you to connect to databases and query them using natural language while coding.

**Key Benefits:**
- Native MCP support via stdio transport
- Terminal-based workflow integration
- Direct database access during coding sessions
- Seamless natural language queries

## Prerequisites

- Claude Code installed and authenticated
- Node.js 20.0.0 or later
- Database instance accessible from your machine

## Configuration

### Method 1: Project-Level Configuration

Create a `.mcp.json` file in your project root:

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

### Method 2: Global Configuration

Add to your Claude Code settings file:

**macOS/Linux:** `~/.claude/settings.json`
**Windows:** `%USERPROFILE%\.claude\settings.json`

```json
{
  "mcpServers": {
    "my-database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
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
    "mysql-dev": {
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
    "postgres-dev": {
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
        "--file-path", "./data/app.db"
      ]
    }
  }
}
```

### Multiple Databases

```json
{
  "mcpServers": {
    "mysql-users": {
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
    "postgres-analytics": {
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
  }
}
```

## Usage Examples

### During Coding Sessions

```bash
# Start Claude Code in your project
claude

# Ask about your database
> What tables are in the database?

# Query data while coding
> Show me the schema of the users table

# Generate code based on database structure
> Create a TypeScript interface for the orders table

# Debug data issues
> Find all orders with null customer_id
```

### Common Workflows

**1. Understanding Database Structure**
```
> List all tables and their relationships
> Show me the foreign keys in the orders table
> What indexes exist on the products table?
```

**2. Data Exploration**
```
> How many users signed up this week?
> What's the average order value?
> Show me the top 10 products by sales
```

**3. Code Generation**
```
> Generate a SQL migration to add an email_verified column to users
> Create a Node.js function to fetch user orders
> Write a query to get monthly revenue by product category
```

**4. Debugging**
```
> Find duplicate email addresses in the users table
> Show me orders that reference non-existent products
> Check for orphaned records in order_items
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

1. **Use read-only mode** (default) for safety
2. **Create dedicated database users** with minimal permissions
3. **Never commit credentials** to version control
4. **Use environment variables** for sensitive data

### Performance

1. **Use specific queries** instead of SELECT *
2. **Add LIMIT** to prevent large result sets
3. **Cache schema** information (enabled by default)

### Workflow

1. **Start with schema exploration** to understand the database
2. **Use natural language** for complex queries
3. **Verify generated SQL** before running in production
4. **Keep database connections** project-specific

## Troubleshooting

### MCP Server Not Found

**Symptoms:** Claude Code doesn't recognize database commands

**Solutions:**
1. Verify `.mcp.json` is in project root
2. Check JSON syntax is valid
3. Ensure Node.js 20+ is installed
4. Restart Claude Code

### Connection Failed

**Symptoms:** Database connection errors

**Solutions:**
1. Verify database is running
2. Check credentials are correct
3. Ensure network connectivity
4. Test with database client first

### Permission Denied

**Symptoms:** Query execution fails

**Solutions:**
1. Check database user permissions
2. Verify database name is correct
3. Ensure user can access from localhost

## Resources

- [Claude Code Documentation](https://claude.ai/code/docs)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
