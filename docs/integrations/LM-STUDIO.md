# LM Studio Integration Guide

This guide shows how to integrate Universal Database MCP Server with LM Studio.

## Overview

LM Studio is a desktop application for running local large language models (LLMs) on your computer. Starting from version 0.3.17, LM Studio supports the MCP (Model Context Protocol), allowing you to extend its capabilities with external tools. By integrating Universal Database MCP Server, you can enable LM Studio to directly query and analyze your database data during conversations with local AI models.

**Key Benefits:**
- Query databases directly from LM Studio chat interface
- Run completely offline with local AI models
- Explore database schema through natural language
- Execute SQL queries and analyze results in conversations
- Full privacy - your data never leaves your machine

## Prerequisites

- [LM Studio](https://lmstudio.ai/) installed (version 0.3.17 or later required)
- Node.js 18+ installed
- Database instance (MySQL, PostgreSQL, SQLite, etc.)

## Configuration

LM Studio uses MCP stdio mode for tool integration. Configuration is done through the application settings.

### Step 1: Open LM Studio Settings

1. Launch LM Studio
2. Click on the settings icon (gear icon) in the sidebar or menu
3. Navigate to **Plugins > MCP Servers**

### Step 2: Add MCP Server Configuration

In the MCP server configuration section, add a new server with the following JSON configuration:

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

### Step 3: Save and Restart

After adding the configuration, save the settings and restart LM Studio for the changes to take effect.

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

### DM (Dameng Database)

```json
{
  "mcpServers": {
    "dm-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "dm",
        "--host", "localhost",
        "--port", "5236",
        "--user", "SYSDBA",
        "--password", "your_password",
        "--database", "DAMENG"
      ]
    }
  }
}
```

### KingbaseES

```json
{
  "mcpServers": {
    "kingbase-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "kingbase",
        "--host", "localhost",
        "--port", "54321",
        "--user", "system",
        "--password", "your_password",
        "--database", "your_database"
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

Once configured, the following MCP tools will be available in LM Studio:

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries against the database |
| `get_schema` | Get database schema information (tables, columns, types) |
| `get_table_info` | Get detailed information about a specific table |
| `clear_cache` | Clear the schema cache |

## Usage Examples

### Example 1: Explore Database Schema

In LM Studio chat, you can ask:

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

### Example 4: Data Analysis

Ask the AI to analyze your data:

```
Analyze the sales trends for the last 6 months
```

The AI will query the relevant tables and provide insights based on the data.

### Example 5: Generate Reports

Request data summaries:

```
Generate a summary of user registrations by month for 2024
```

The AI will create and execute the appropriate queries to generate the report.

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
- **Never share** configurations with real credentials
- **Use environment variables** for sensitive data when possible
- **Limit database permissions** to only what's necessary

### 2. Performance

- Use specific queries instead of `SELECT *`
- Add `LIMIT` clauses to prevent large result sets
- Consider using a read replica for heavy queries

### 3. Model Selection

- Choose models with good instruction-following capabilities for better tool usage
- Larger models generally perform better with complex database queries
- Test different models to find the best balance between speed and accuracy

### 4. Usage Tips

- Be specific in your queries to get better results
- Use natural language to describe what data you need
- Ask the AI to explain query results when needed

## Troubleshooting

### Issue: MCP Server Not Connecting

**Symptoms**: LM Studio doesn't recognize the database tools

**Solutions**:
1. Verify LM Studio version is 0.3.17 or later
2. Check that MCP server configuration is correctly entered in Plugins > MCP Servers
3. Verify JSON syntax is valid (no trailing commas, proper quotes)
4. Restart LM Studio after making configuration changes
5. Ensure Node.js is installed and accessible from PATH

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

### Issue: Model Not Using Tools

**Symptoms**: The AI model doesn't use the database tools even when asked

**Solutions**:
1. Ensure you're using a model that supports function calling/tool use
2. Try being more explicit in your prompts (e.g., "Use the database tool to...")
3. Check if the MCP server is properly connected in LM Studio settings
4. Try a different model that has better tool-use capabilities

## Resources

- [LM Studio Official Website](https://lmstudio.ai/)
- [LM Studio Documentation](https://lmstudio.ai/docs)
- [Universal Database MCP Server Documentation](../README.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- LM Studio Discord: https://discord.gg/lmstudio
