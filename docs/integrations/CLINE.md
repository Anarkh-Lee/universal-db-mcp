# Cline Integration Guide

This guide shows how to integrate Universal Database MCP Server with Cline.

## Overview

Cline is an AI-powered coding assistant extension for VS Code that supports MCP stdio mode. It is an autonomous AI coding agent that can help you write, debug, and understand code. By integrating Universal Database MCP Server, you can enable Cline to directly query and analyze your database data, making it easier to work with database-related tasks.

**Key Benefits:**
- Query databases directly from Cline's AI chat
- Get AI assistance for SQL query writing
- Explore database schema without leaving VS Code
- Debug and optimize database queries with AI help
- Autonomous task execution with database access

## Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) installed
- [Cline Extension](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) installed
- Node.js 18+ installed
- Database instance (MySQL, PostgreSQL, SQLite, etc.)

## Configuration

Cline uses MCP stdio mode for tool integration. Configuration is done through a JSON file.

### Configuration File Location

| Platform | Path |
|----------|------|
| macOS | `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| Linux | `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| Windows | `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` |

### Step 1: Install Cline Extension

1. Open VS Code Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
2. Search for "Cline"
3. Install the Cline extension
4. Reload VS Code if prompted

### Step 2: Open MCP Settings

You can access MCP settings in two ways:

**Method A: Via Cline Panel**
1. Open Cline panel in VS Code
2. Click the MCP Servers icon (server icon) in the top toolbar
3. Click "Configure MCP Servers" or edit the settings directly

**Method B: Via Settings File**
1. Navigate to the configuration file location for your platform
2. Create or edit the `cline_mcp_settings.json` file

### Step 3: Add MCP Server Configuration

Add the Universal Database MCP Server configuration to your settings file:

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

### Step 4: Restart Cline

After saving the configuration file, restart the Cline extension or reload VS Code for the changes to take effect.

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

### Using Environment Variables

For better security, you can use environment variables in your configuration:

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
        "--password", "${DB_PASSWORD}",
        "--database", "myapp"
      ],
      "env": {
        "DB_PASSWORD": "your_password"
      }
    }
  }
}
```

## Available Tools

Once configured, the following MCP tools will be available in Cline:

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries against the database |
| `get_schema` | Get database schema information (tables, columns, types) |
| `get_table_info` | Get detailed information about a specific table |
| `clear_cache` | Clear the schema cache |

## Usage Examples

### Example 1: Explore Database Schema

In Cline's chat, you can ask:

```
What tables are in my database?
```

Cline will use the `get_schema` tool to retrieve and display your database structure.

### Example 2: Query Data

Ask Cline to query your data:

```
Show me the last 10 orders from the orders table
```

Cline will generate and execute the appropriate SQL query:

```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10
```

### Example 3: Write SQL Queries

Get help writing complex queries:

```
Write a query to find the top 5 customers by total order value
```

Cline will analyze your schema and generate:

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

Cline will analyze and suggest optimizations.

### Example 5: Generate Code

Ask Cline to generate database-related code:

```
Generate a TypeScript function to insert a new user into the users table
```

Cline will examine your schema and generate appropriate code.

### Example 6: Autonomous Database Tasks

Cline can perform complex multi-step database tasks:

```
Analyze the orders table, identify any data quality issues, and suggest improvements to the schema
```

Cline will autonomously query the database, analyze the results, and provide recommendations.

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
- **Never commit** configuration files with real credentials to version control
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

**Symptoms**: Cline doesn't recognize the database tools

**Solutions**:
1. Verify the configuration file is in the correct location
2. Check JSON syntax is valid (no trailing commas, proper quotes)
3. Restart VS Code after making configuration changes
4. Ensure Node.js is installed and accessible from PATH
5. Check the MCP Servers panel in Cline for connection status

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

### Viewing Logs

To view Cline logs for debugging:
1. Open VS Code Output panel (`Ctrl+Shift+U` or `Cmd+Shift+U`)
2. Select "Cline" from the dropdown
3. Look for MCP-related messages

## Advanced Configuration

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

### Disabling a Server

You can temporarily disable a server without removing its configuration:

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
      ],
      "disabled": true
    }
  }
}
```

## Resources

- [Cline Extension](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev)
- [Cline GitHub Repository](https://github.com/cline/cline)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Universal Database MCP Server Documentation](../README.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Cline Issues: https://github.com/cline/cline/issues
