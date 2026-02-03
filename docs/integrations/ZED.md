# Zed Editor Integration Guide

This guide shows how to integrate Universal Database MCP Server with Zed Editor.

## Overview

Zed is a high-performance, open-source code editor built in Rust, designed for speed and collaboration. Zed natively supports the Model Context Protocol (MCP), allowing seamless integration with AI assistants and database tools. By integrating Universal Database MCP Server, you can query and analyze database data directly within Zed using its built-in AI features.

**Key Benefits:**
- Native MCP support with zero additional extensions required
- Lightning-fast performance for database queries
- Query databases directly from Zed's AI assistant
- Explore database schema without leaving the editor
- Get AI assistance for SQL query writing and optimization

## Prerequisites

- [Zed Editor](https://zed.dev/) installed (version 0.131.0 or later recommended)
- Node.js 18+ installed
- Database instance (MySQL, PostgreSQL, SQLite, etc.)

## Configuration

Zed uses MCP stdio mode for context server integration. Configuration is done through the `settings.json` file.

### Configuration File Location

| Platform | Path |
|----------|------|
| macOS | `~/.config/zed/settings.json` |
| Linux | `~/.config/zed/settings.json` |

> **Note**: Zed is currently available for macOS and Linux. Windows support is in development.

### Step 1: Open Zed Settings

1. Open Zed Editor
2. Press `Cmd+,` (macOS) or `Ctrl+,` (Linux) to open Settings
3. Click "Open settings.json" in the bottom right corner of the settings panel

Alternatively, you can directly edit the file at `~/.config/zed/settings.json`.

### Step 2: Add MCP Server Configuration

Add the Universal Database MCP Server configuration to your `settings.json` file using the `context_servers` key:

#### Basic Configuration

```json
{
  "context_servers": {
    "universal-db-mcp": {
      "command": {
        "path": "npx",
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
}
```

### Step 3: Restart Zed

After saving the configuration file, restart Zed Editor for the changes to take effect. You can also use `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Linux) and search for "Reload" to reload the configuration.

## Configuration Examples

### MySQL

```json
{
  "context_servers": {
    "mysql-db": {
      "command": {
        "path": "npx",
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
}
```

### PostgreSQL

```json
{
  "context_servers": {
    "postgres-db": {
      "command": {
        "path": "npx",
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
}
```

### SQLite

```json
{
  "context_servers": {
    "sqlite-db": {
      "command": {
        "path": "npx",
        "args": [
          "universal-db-mcp",
          "--type", "sqlite",
          "--file-path", "/path/to/your/database.db"
        ]
      }
    }
  }
}
```

### SQL Server

```json
{
  "context_servers": {
    "sqlserver-db": {
      "command": {
        "path": "npx",
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
}
```

### Oracle

```json
{
  "context_servers": {
    "oracle-db": {
      "command": {
        "path": "npx",
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
}
```

### MongoDB

```json
{
  "context_servers": {
    "mongodb": {
      "command": {
        "path": "npx",
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
}
```

### Redis

```json
{
  "context_servers": {
    "redis": {
      "command": {
        "path": "npx",
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
}
```

### Multiple Databases

You can configure multiple database connections:

```json
{
  "context_servers": {
    "mysql-production": {
      "command": {
        "path": "npx",
        "args": [
          "universal-db-mcp",
          "--type", "mysql",
          "--host", "prod-db.example.com",
          "--port", "3306",
          "--user", "readonly_user",
          "--password", "prod_password",
          "--database", "production_db"
        ]
      }
    },
    "mysql-development": {
      "command": {
        "path": "npx",
        "args": [
          "universal-db-mcp",
          "--type", "mysql",
          "--host", "localhost",
          "--port", "3306",
          "--user", "root",
          "--password", "dev_password",
          "--database", "development_db"
        ]
      }
    },
    "postgres-analytics": {
      "command": {
        "path": "npx",
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
}
```

### Enable Write Operations

By default, write operations are disabled for safety. To enable them:

```json
{
  "context_servers": {
    "mysql-db-writable": {
      "command": {
        "path": "npx",
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
}
```

> **Warning**: Enabling write operations allows the AI to execute INSERT, UPDATE, DELETE, and other modifying queries. Use with caution, especially in production environments.

### Using Environment Variables

For better security, you can use environment variables in your configuration:

```json
{
  "context_servers": {
    "mysql-db": {
      "command": {
        "path": "npx",
        "args": [
          "universal-db-mcp",
          "--type", "mysql",
          "--host", "localhost",
          "--port", "3306",
          "--user", "root",
          "--password", "your_password",
          "--database", "your_database"
        ],
        "env": {
          "NODE_ENV": "production"
        }
      }
    }
  }
}
```

## Available Tools

Once configured, the following MCP tools will be available in Zed:

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries against the database |
| `get_schema` | Get database schema information (tables, columns, types) |
| `get_table_info` | Get detailed information about a specific table |
| `clear_cache` | Clear the schema cache |

## Usage Examples

### Example 1: Explore Database Schema

In Zed's AI assistant panel, you can ask:

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
- **Never commit** `settings.json` with real credentials to version control
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

**Symptoms**: Zed doesn't recognize the database tools

**Solutions**:
1. Verify the `settings.json` file is in the correct location (`~/.config/zed/settings.json`)
2. Check JSON syntax is valid (no trailing commas, proper quotes)
3. Restart Zed after making configuration changes
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
3. Try using the full path to npx (e.g., `/usr/local/bin/npx`)
4. Verify installation with `which npx` or `npx --version`

### Issue: Context Server Not Starting

**Symptoms**: Zed shows error about context server failing to start

**Solutions**:
1. Check Zed's log files for detailed error messages
2. Verify the command path is correct (use `which npx` to find the full path)
3. Test the MCP server manually in terminal:
   ```bash
   npx universal-db-mcp --type mysql --host localhost --port 3306 --user root --password your_password --database your_database
   ```
4. Ensure all required arguments are provided

## Advanced Configuration

### Using with Docker

If your database runs in Docker, ensure the container is accessible:

```json
{
  "context_servers": {
    "docker-mysql": {
      "command": {
        "path": "npx",
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
}
```

> **Note**: Use `127.0.0.1` instead of `localhost` when connecting to Docker containers on some systems.

### Full Settings Example

Here's a complete `settings.json` example with database MCP server alongside other Zed settings:

```json
{
  "theme": "One Dark",
  "buffer_font_size": 14,
  "format_on_save": "on",
  "context_servers": {
    "mysql-db": {
      "command": {
        "path": "npx",
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
}
```

## Resources

- [Zed Editor Official Website](https://zed.dev/)
- [Zed Documentation](https://zed.dev/docs)
- [Zed Context Servers Documentation](https://zed.dev/docs/context-servers)
- [Universal Database MCP Server Documentation](../README.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Zed Community: https://zed.dev/community
- Zed Discord: https://discord.gg/zed-community
