# Windsurf IDE Integration Guide

This guide shows how to integrate Universal Database MCP Server with Windsurf IDE (Codeium).

## Overview

Windsurf is Codeium's AI-powered IDE, featuring the Cascade intelligent agent that can understand context, execute multi-step tasks, and interact with external tools through the Model Context Protocol (MCP). By integrating Universal Database MCP Server, you can enable Cascade to query and analyze database data directly within your development environment.

**Key Features:**
- Native MCP support via stdio mode
- Cascade AI agent for intelligent database interactions
- Seamless integration with your development workflow
- Support for multiple database types

## Prerequisites

- [Windsurf IDE](https://codeium.com/windsurf) installed
- Node.js 18+ installed
- Database instance (MySQL, PostgreSQL, SQLite, etc.)
- Basic familiarity with MCP configuration

## Setup Steps

### Step 1: Locate Configuration File

Windsurf stores MCP configuration in the following location:

| Platform | Configuration Path |
|----------|-------------------|
| Windows | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` |
| macOS | `~/.codeium/windsurf/mcp_config.json` |
| Linux | `~/.codeium/windsurf/mcp_config.json` |

If the file doesn't exist, create it manually.

### Step 2: Configure MCP Server

Edit the `mcp_config.json` file to add Universal Database MCP Server:

#### Basic Configuration (MySQL)

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

#### PostgreSQL Configuration

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### SQLite Configuration

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### SQL Server Configuration

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### Oracle Configuration

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### MongoDB Configuration

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

#### Redis Configuration

```json
{
  "mcpServers": {
    "universal-db-mcp": {
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

### Step 3: Enable Write Operations (Optional)

By default, the MCP server operates in read-only mode. To enable write operations, add the `--allow-write` flag:

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
        "--database", "your_database",
        "--allow-write"
      ]
    }
  }
}
```

> **Warning**: Enabling write operations allows the AI to modify your database. Use with caution, especially in production environments.

### Step 4: Restart Windsurf

After saving the configuration file, restart Windsurf IDE to load the MCP server.

### Step 5: Verify Connection

1. Open Windsurf IDE
2. Open the Cascade panel (usually on the right side)
3. Ask Cascade to list database tables:
   ```
   List all tables in the database
   ```
4. If configured correctly, Cascade will use the MCP tools to query your database

## Configuration Options

### Command Line Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--type` | Yes | Database type: mysql, postgres, sqlite, sqlserver, oracle, mongodb, redis, dm, kingbase, gaussdb, oceanbase, tidb, clickhouse, polardb, vastbase, highgo, goldendb |
| `--host` | Yes* | Database host address |
| `--port` | No | Database port (uses default if not specified) |
| `--user` | Yes* | Database username |
| `--password` | Yes* | Database password |
| `--database` | Yes* | Database name |
| `--file-path` | Yes* | SQLite database file path (for sqlite type only) |
| `--allow-write` | No | Enable write operations (default: false) |
| `--oracle-client-path` | No | Oracle Instant Client path (for Oracle 11g and earlier) |

*Required fields depend on database type

### Default Ports

| Database | Default Port |
|----------|-------------|
| MySQL | 3306 |
| PostgreSQL | 5432 |
| SQL Server | 1433 |
| Oracle | 1521 |
| MongoDB | 27017 |
| Redis | 6379 |
| ClickHouse | 8123 |

## Available MCP Tools

Once configured, Cascade can use the following tools:

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries and return results |
| `get_schema` | Get database schema information |
| `get_table_info` | Get detailed table structure |
| `clear_cache` | Clear schema cache |

## Usage Examples

### Example 1: Explore Database Schema

```
User: What tables are in my database?

Cascade: [Uses get_schema tool]
         Your database contains the following tables:
         - users (id, name, email, created_at)
         - orders (id, user_id, total, status, created_at)
         - products (id, name, price, stock)
```

### Example 2: Query Data

```
User: Show me the top 5 users by order count

Cascade: [Uses execute_query tool]
         Here are the top 5 users by order count:

         | User       | Email              | Orders |
         |------------|-------------------|--------|
         | Alice      | alice@example.com | 45     |
         | Bob        | bob@example.com   | 38     |
         | Charlie    | charlie@test.com  | 32     |
         | Diana      | diana@example.com | 28     |
         | Eve        | eve@test.com      | 25     |
```

### Example 3: Analyze Data

```
User: What's the total revenue by month for the last 6 months?

Cascade: [Uses execute_query tool]
         Revenue analysis for the last 6 months:

         | Month    | Revenue    |
         |----------|------------|
         | 2026-01  | $125,430   |
         | 2025-12  | $142,850   |
         | 2025-11  | $98,320    |
         | 2025-10  | $115,670   |
         | 2025-09  | $108,940   |
         | 2025-08  | $95,280    |
```

### Example 4: Get Table Structure

```
User: What's the structure of the users table?

Cascade: [Uses get_table_info tool]
         The users table has the following structure:

         | Column     | Type         | Nullable | Key     |
         |------------|--------------|----------|---------|
         | id         | int          | NO       | PRIMARY |
         | name       | varchar(255) | NO       |         |
         | email      | varchar(255) | NO       | UNIQUE  |
         | password   | varchar(255) | NO       |         |
         | created_at | datetime     | YES      |         |
         | updated_at | datetime     | YES      |         |
```

### Example 5: Write Operations (if enabled)

```
User: Insert a new user with name "John" and email "john@example.com"

Cascade: [Uses execute_query tool with INSERT]
         Successfully inserted new user:
         - Name: John
         - Email: john@example.com
         - ID: 156
```

## Multiple Database Configuration

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
        "--user", "readonly",
        "--password", "prod_password",
        "--database", "production"
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
        "--database", "development",
        "--allow-write"
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

## Best Practices

### 1. Security

- **Use read-only mode** for production databases
- **Create dedicated database users** with minimal permissions
- **Never commit** `mcp_config.json` with passwords to version control
- **Use environment variables** for sensitive data when possible

### 2. Performance

- Add appropriate indexes to frequently queried columns
- Use LIMIT clauses for large tables
- Consider connection pooling for high-frequency queries

### 3. Development Workflow

- Use separate configurations for development and production
- Enable write operations only in development environments
- Regularly clear cache when schema changes

## Troubleshooting

### Issue: MCP Server Not Starting

**Symptoms**: Cascade cannot access database tools

**Solutions**:
1. Verify Node.js is installed: `node --version`
2. Check configuration file syntax (valid JSON)
3. Ensure file path is correct
4. Check Windsurf logs for errors

### Issue: Connection Failed

**Symptoms**: "Connection refused" or timeout errors

**Solutions**:
1. Verify database is running
2. Check host, port, and credentials
3. Ensure firewall allows connection
4. Test connection with database client first

### Issue: Authentication Failed

**Symptoms**: "Access denied" errors

**Solutions**:
1. Verify username and password
2. Check user permissions
3. Ensure user can connect from your host
4. For MySQL, check `mysql.user` table

### Issue: Permission Denied

**Symptoms**: Cannot execute certain queries

**Solutions**:
1. Check database user permissions
2. For write operations, ensure `--allow-write` is set
3. Verify user has SELECT/INSERT/UPDATE/DELETE grants

### Issue: Slow Queries

**Symptoms**: Queries take too long

**Solutions**:
1. Add indexes to queried columns
2. Use LIMIT for large result sets
3. Optimize SQL queries
4. Check database server performance

### Issue: Configuration Not Loading

**Symptoms**: Changes to config not taking effect

**Solutions**:
1. Restart Windsurf IDE completely
2. Verify JSON syntax is valid
3. Check file is saved in correct location
4. Look for error messages in Windsurf logs

## Environment Variables

You can use environment variables in your configuration for better security:

### Windows (PowerShell)

```powershell
$env:DB_PASSWORD = "your_password"
```

### macOS/Linux

```bash
export DB_PASSWORD="your_password"
```

Then reference in configuration (if supported by your shell):

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
        "--password", "${DB_PASSWORD}",
        "--database", "your_database"
      ]
    }
  }
}
```

## Resources

- [Windsurf IDE](https://codeium.com/windsurf)
- [Codeium Documentation](https://codeium.com/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Universal Database MCP Server](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Codeium Community: https://discord.gg/codeium
