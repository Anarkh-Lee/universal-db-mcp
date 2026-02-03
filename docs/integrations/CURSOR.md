# Cursor IDE Integration Guide

This guide shows how to integrate Universal Database MCP Server with Cursor IDE.

## Overview

Cursor is an AI-powered code editor built on VS Code, designed to enhance developer productivity with intelligent code completion, chat, and AI-assisted coding features. By integrating Universal Database MCP Server, you can enable Cursor's AI to directly query and analyze your database data, making it easier to write database-related code, debug queries, and understand your data schema.

**Key Benefits:**
- Query databases directly from Cursor's AI chat
- Get AI assistance for SQL query writing
- Explore database schema without leaving the editor
- Debug and optimize database queries with AI help

## Prerequisites

- [Cursor IDE](https://cursor.sh/) installed (version 0.43.0 or later recommended)
- Node.js 18+ installed
- Database instance (MySQL, PostgreSQL, SQLite, etc.)

## Configuration

Cursor uses MCP stdio mode for tool integration. Configuration is done through a JSON file.

### Configuration File Location

| Platform | Path |
|----------|------|
| macOS | `~/.cursor/mcp.json` |
| Linux | `~/.cursor/mcp.json` |
| Windows | `%USERPROFILE%\.cursor\mcp.json` |

### Step 1: Create Configuration File

Create or edit the `mcp.json` file at the appropriate location for your platform.

### Step 2: Add MCP Server Configuration

Add the Universal Database MCP Server configuration to your `mcp.json` file:

#### Basic Configuration

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

### Step 3: Restart Cursor

After saving the configuration file, restart Cursor IDE for the changes to take effect.

## Configuration Examples

### MySQL

```json
{
  "mcpServers": {
    "mysql-db": {
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

### PostgreSQL

```json
{
  "mcpServers": {
    "postgres-db": {
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

### SQLite

```json
{
  "mcpServers": {
    "sqlite-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/your/database.db"
      ]
    }
  }
}
```

### SQL Server

```json
{
  "mcpServers": {
    "sqlserver-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "localhost",
        "--port", "1433",
        "--user", "sa",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

### Oracle

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "your_password",
        "--database", "ORCL"
      ]
    }
  }
}
```

### MongoDB

```json
{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "admin",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

### Redis

```json
{
  "mcpServers": {
    "redis": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "your_password"
      ]
    }
  }
}
```

### Multiple Databases

You can configure multiple database connections:

```json
{
  "mcpServers": {
    "mysql-production": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "prod-db.example.com",
        "--port", "3306",
        "--user", "readonly_user",
        "--password", "prod_password",
        "--database", "production_db"
      ]
    },
    "mysql-development": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "dev_password",
        "--database", "development_db"
      ]
    },
    "postgres-analytics": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "analytics-db.example.com",
        "--port", "5432",
        "--user", "analyst",
        "--password", "analytics_password",
        "--database", "analytics"
      ]
    }
  }
}
```

### Enable Write Operations

By default, write operations are disabled for safety. To enable them:

```json
{
  "mcpServers": {
    "mysql-db-writable": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database",
        "--allow-write", "true"
      ]
    }
  }
}
```

> **Warning**: Enabling write operations allows the AI to execute INSERT, UPDATE, DELETE, and other modifying queries. Use with caution, especially in production environments.

## Available Tools

Once configured, the following MCP tools will be available in Cursor:

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries against the database |
| `get_schema` | Get database schema information (tables, columns, types) |
| `get_table_info` | Get detailed information about a specific table |
| `clear_cache` | Clear the schema cache |

## Usage Examples

### Example 1: Explore Database Schema

In Cursor's AI chat, you can ask:

```
What tables are in my database?
```

The AI will use the `get_schema` tool to retrieve and display your database structure.

### Example 2: Query Data

Ask the AI to query your data:

```
Show me the last 10 orders from the orders table
```

The AI will generate and execute the appropriate SQL query:

```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10
```

### Example 3: Write SQL Queries

Get help writing complex queries:

```
Write a query to find the top 5 customers by total order value
```

The AI will analyze your schema and generate:

```sql
SELECT
  c.id,
  c.name,
  SUM(o.total_amount) as total_value
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_value DESC
LIMIT 5
```

### Example 4: Debug Queries

Share a problematic query and ask for help:

```
This query is slow, can you help optimize it?

SELECT * FROM users u
WHERE u.id IN (SELECT user_id FROM orders WHERE created_at > '2024-01-01')
```

The AI will analyze and suggest optimizations.

### Example 5: Generate Code

Ask the AI to generate database-related code:

```
Generate a TypeScript function to insert a new user into the users table
```

The AI will examine your schema and generate appropriate code.

## Command Line Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--type` | Yes | Database type: mysql, postgres, sqlite, sqlserver, oracle, mongodb, redis, dm, kingbase, gaussdb, oceanbase, tidb, clickhouse, polardb, vastbase, highgo, goldendb |
| `--host` | Yes* | Database host |
| `--port` | No | Database port (uses default if not specified) |
| `--user` | Yes* | Database username |
| `--password` | Yes* | Database password |
| `--database` | Yes* | Database name |
| `--file-path` | Yes* | SQLite file path (for sqlite type only) |
| `--allow-write` | No | Enable write operations (default: false) |
| `--oracle-client-path` | No | Oracle Instant Client path (for Oracle 11g) |

*Required fields depend on database type

## Best Practices

### 1. Security

- **Use read-only database users** for production databases
- **Never commit** `mcp.json` with real credentials to version control
- **Use environment variables** for sensitive data when possible
- **Limit database permissions** to only what's necessary

### 2. Performance

- Use specific queries instead of `SELECT *`
- Add `LIMIT` clauses to prevent large result sets
- Consider using a read replica for heavy queries

### 3. Development Workflow

- Configure separate connections for development and production
- Use descriptive names for multiple database connections
- Keep write operations disabled unless specifically needed

## Troubleshooting

### Issue: MCP Server Not Connecting

**Symptoms**: Cursor doesn't recognize the database tools

**Solutions**:
1. Verify the `mcp.json` file is in the correct location
2. Check JSON syntax is valid (no trailing commas, proper quotes)
3. Restart Cursor after making configuration changes
4. Ensure Node.js is installed and accessible from PATH

### Issue: Connection Refused

**Symptoms**: Error message about connection being refused

**Solutions**:
1. Verify database host and port are correct
2. Check if the database server is running
3. Ensure firewall allows connections to the database port
4. Verify network connectivity to the database host

### Issue: Authentication Failed

**Symptoms**: Error message about invalid credentials

**Solutions**:
1. Double-check username and password
2. Verify the user has permission to access the specified database
3. Check if the database requires SSL/TLS connection
4. Ensure the user can connect from your IP address

### Issue: Permission Denied

**Symptoms**: Queries fail with permission errors

**Solutions**:
1. Verify the database user has SELECT permissions
2. Check if specific tables require additional permissions
3. For write operations, ensure `--allow-write` is set and user has write permissions

### Issue: Slow Queries

**Symptoms**: Queries take a long time to execute

**Solutions**:
1. Add appropriate indexes to your database tables
2. Use `LIMIT` clauses to restrict result sets
3. Optimize complex queries
4. Consider using a read replica

### Issue: npx Command Not Found

**Symptoms**: Error indicating npx is not recognized

**Solutions**:
1. Install Node.js (version 18 or later)
2. Ensure Node.js bin directory is in your system PATH
3. Try using the full path to npx
4. On Windows, you may need to restart after installing Node.js

## Advanced Configuration

### Using Environment Variables

For better security, you can reference environment variables in your configuration. First, set the environment variables:

**macOS/Linux:**
```bash
export DB_PASSWORD="your_secure_password"
```

**Windows (PowerShell):**
```powershell
$env:DB_PASSWORD = "your_secure_password"
```

Then use a wrapper script that reads these variables.

### Using with Docker

If your database runs in Docker, ensure the container is accessible:

```json
{
  "mcpServers": {
    "docker-mysql": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "127.0.0.1",
        "--port", "3306",
        "--user", "root",
        "--password", "root_password",
        "--database", "app_db"
      ]
    }
  }
}
```

> **Note**: Use `127.0.0.1` instead of `localhost` when connecting to Docker containers on some systems.

## Resources

- [Cursor IDE Official Website](https://cursor.sh/)
- [Cursor Documentation](https://docs.cursor.com/)
- [Universal Database MCP Server Documentation](../README.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Cursor Community: https://forum.cursor.com/
