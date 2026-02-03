# JetBrains IDE Integration Guide

This guide shows how to integrate Universal Database MCP Server with JetBrains IDEs.

## Overview

JetBrains IDEs (IntelliJ IDEA, PyCharm, WebStorm, GoLand, PhpStorm, Rider, CLion, RubyMine, Android Studio, etc.) support MCP (Model Context Protocol) integration starting from version 2025.1. This allows you to connect AI Assistant directly to your databases for intelligent code assistance, query generation, and data analysis.

**Supported IDEs:**
- IntelliJ IDEA (Ultimate & Community)
- PyCharm (Professional & Community)
- WebStorm
- GoLand
- PhpStorm
- Rider
- CLion
- RubyMine
- DataGrip
- Android Studio

**Key Benefits:**
- Query databases directly from AI Assistant chat
- Get AI-powered SQL query generation and optimization
- Explore database schema without leaving the IDE
- Generate data models and ORM code based on actual database structure
- Debug and analyze database queries with AI assistance

## Prerequisites

- JetBrains IDE version **2025.1 or later**
- AI Assistant plugin enabled (bundled with JetBrains IDEs)
- Node.js 18+ installed
- Database instance (MySQL, PostgreSQL, SQLite, etc.)

## Configuration

JetBrains IDEs use a JSON-based configuration for MCP servers, accessible through the IDE settings.

### Step 1: Open MCP Settings

1. Open your JetBrains IDE
2. Go to **Settings/Preferences** (`Ctrl+Alt+S` on Windows/Linux, `Cmd+,` on macOS)
3. Navigate to **Tools > AI Assistant > Model Context Protocol**

### Step 2: Add MCP Server

1. Click the **+** button or **Add** to create a new MCP server configuration
2. Enter the server configuration in JSON format

### Step 3: Configure the Server

Add the Universal Database MCP Server configuration:

```json
{
  "servers": [
    {
      "name": "universal-db-mcp",
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

### Step 4: Apply and Restart

1. Click **Apply** and then **OK**
2. Restart the IDE for changes to take effect

## Configuration Examples

### MySQL

```json
{
  "servers": [
    {
      "name": "mysql-db",
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

### PostgreSQL

```json
{
  "servers": [
    {
      "name": "postgres-db",
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
  ]
}
```

### SQLite

```json
{
  "servers": [
    {
      "name": "sqlite-db",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/your/database.db"
      ]
    }
  ]
}
```

### SQL Server

```json
{
  "servers": [
    {
      "name": "sqlserver-db",
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
  ]
}
```

### Oracle

```json
{
  "servers": [
    {
      "name": "oracle-db",
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
  ]
}
```

### MongoDB

```json
{
  "servers": [
    {
      "name": "mongodb",
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
  ]
}
```

### Redis

```json
{
  "servers": [
    {
      "name": "redis",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "your_password"
      ]
    }
  ]
}
```

### DM (Dameng Database)

```json
{
  "servers": [
    {
      "name": "dm-db",
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
  ]
}
```

### KingbaseES

```json
{
  "servers": [
    {
      "name": "kingbase-db",
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
  ]
}
```

### Multiple Databases

You can configure multiple database connections:

```json
{
  "servers": [
    {
      "name": "mysql-production",
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
    {
      "name": "mysql-development",
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
    {
      "name": "postgres-analytics",
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
  ]
}
```

### Enable Write Operations

By default, write operations are disabled for safety. To enable them:

```json
{
  "servers": [
    {
      "name": "mysql-db-writable",
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
  ]
}
```

> **Warning**: Enabling write operations allows the AI to execute INSERT, UPDATE, DELETE, and other modifying queries. Use with caution, especially in production environments.

## Available Tools

Once configured, the following MCP tools will be available in AI Assistant:

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries against the database |
| `get_schema` | Get database schema information (tables, columns, types) |
| `get_table_info` | Get detailed information about a specific table |
| `clear_cache` | Clear the schema cache |

## Usage Examples

### Example 1: Explore Database Schema

In AI Assistant chat, you can ask:

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

### Example 3: Generate Entity Classes

Ask the AI to generate code based on your database schema:

```
Generate a Java entity class for the users table with JPA annotations
```

The AI will analyze your table structure and generate:

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and setters...
}
```

### Example 4: Write Complex Queries

Get help writing complex queries:

```
Write a query to find the top 5 customers by total order value with their contact information
```

The AI will analyze your schema and generate:

```sql
SELECT
  c.id,
  c.name,
  c.email,
  SUM(o.total_amount) as total_value
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
ORDER BY total_value DESC
LIMIT 5
```

### Example 5: Debug and Optimize Queries

Share a problematic query and ask for help:

```
This query is slow, can you help optimize it?

SELECT * FROM users u
WHERE u.id IN (SELECT user_id FROM orders WHERE created_at > '2024-01-01')
```

The AI will analyze and suggest optimizations:

```sql
SELECT u.*
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.created_at > '2024-01-01'
GROUP BY u.id
```

### Example 6: Generate Repository Code

Ask the AI to generate data access code:

```
Generate a Spring Data JPA repository for the products table with custom query methods
```

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
- **Never commit** configuration with real credentials to version control
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
- Leverage AI Assistant for code generation based on actual schema

### 4. IDE Integration

- Use JetBrains Database Tools alongside MCP for visual database management
- Combine AI Assistant suggestions with IDE's built-in SQL support
- Take advantage of IDE's code completion for generated code

## Troubleshooting

### Issue: MCP Server Not Appearing

**Symptoms**: AI Assistant doesn't recognize the database tools

**Solutions**:
1. Verify IDE version is 2025.1 or later
2. Check that AI Assistant plugin is enabled
3. Verify the JSON configuration syntax is valid
4. Restart the IDE after making configuration changes
5. Check **Help > Show Log in Explorer/Finder** for error messages

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

### Issue: npx Command Not Found

**Symptoms**: Error indicating npx is not recognized

**Solutions**:
1. Install Node.js (version 18 or later)
2. Ensure Node.js bin directory is in your system PATH
3. Try using the full path to npx:
   - Windows: `C:\Program Files\nodejs\npx.cmd`
   - macOS/Linux: `/usr/local/bin/npx`
4. On Windows, you may need to restart after installing Node.js
5. Alternatively, install globally and use direct command:
   ```bash
   npm install -g universal-db-mcp
   ```
   Then use `universal-db-mcp` instead of `npx universal-db-mcp` in the configuration

### Issue: Slow Response

**Symptoms**: AI Assistant takes a long time to respond to database queries

**Solutions**:
1. Add appropriate indexes to your database tables
2. Use `LIMIT` clauses to restrict result sets
3. Optimize complex queries
4. Consider using a read replica for analytics queries

### Viewing Logs

To view MCP-related logs:

1. Go to **Help > Show Log in Explorer/Finder**
2. Open the `idea.log` file
3. Search for "MCP" or "universal-db-mcp" related messages

## Advanced Configuration

### Using Environment Variables

For better security, you can use environment variables. Set them in your system before launching the IDE:

**Windows (PowerShell):**
```powershell
$env:DB_PASSWORD = "your_secure_password"
```

**Windows (Command Prompt):**
```cmd
set DB_PASSWORD=your_secure_password
```

**macOS/Linux:**
```bash
export DB_PASSWORD="your_secure_password"
```

### Using with Docker

If your database runs in Docker, ensure the container is accessible:

```json
{
  "servers": [
    {
      "name": "docker-mysql",
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
  ]
}
```

> **Note**: Use `127.0.0.1` instead of `localhost` when connecting to Docker containers on some systems.

### Project-Specific Configuration

For project-specific database configurations, you can:

1. Create a `.idea/mcp.json` file in your project root (if supported by your IDE version)
2. Or use different IDE configurations for different projects via **File > Manage IDE Settings > Settings Repository**

## Resources

- [JetBrains AI Assistant Documentation](https://www.jetbrains.com/help/idea/ai-assistant.html)
- [IntelliJ IDEA Documentation](https://www.jetbrains.com/help/idea/)
- [PyCharm Documentation](https://www.jetbrains.com/help/pycharm/)
- [WebStorm Documentation](https://www.jetbrains.com/help/webstorm/)
- [Universal Database MCP Server Documentation](../README.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- JetBrains Support: https://www.jetbrains.com/support/
- JetBrains Community Forum: https://intellij-support.jetbrains.com/
