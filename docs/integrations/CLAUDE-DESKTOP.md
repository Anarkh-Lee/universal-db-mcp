# Claude Desktop Integration Guide

This guide shows how to integrate Universal Database MCP Server with Claude Desktop, Anthropic's official desktop application.

## Overview

[Claude Desktop](https://claude.ai/download) is Anthropic's official desktop application for Claude AI. It provides a native desktop experience with full MCP (Model Context Protocol) support, allowing Claude to interact with external tools and data sources directly.

By integrating Universal Database MCP Server with Claude Desktop, you can:

- Query databases using natural language
- Explore database schemas conversationally
- Generate and execute SQL queries automatically
- Analyze data without writing code

**Key Benefits:**
- **Native MCP Support** - Claude Desktop has built-in MCP protocol support via stdio transport
- **Local Execution** - MCP servers run locally, ensuring data security
- **Seamless Experience** - No additional setup required beyond configuration
- **Multi-Database Support** - Connect to 17+ database types

## Prerequisites

Before you begin, ensure you have:

- **Claude Desktop** installed ([Download here](https://claude.ai/download))
  - macOS: Version 1.0.0 or later
  - Windows: Version 1.0.0 or later
- **Node.js** version 20.0.0 or later ([Download here](https://nodejs.org/))
- **Database** instance accessible from your machine
- **Database credentials** with appropriate permissions

### Verify Node.js Installation

```bash
node --version
# Should output v20.0.0 or higher
```

## Configuration

### Configuration File Location

Claude Desktop uses a JSON configuration file to manage MCP servers:

| Platform | Configuration File Path |
|----------|------------------------|
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |

> **Note**: If the file doesn't exist, create it manually.

### Basic Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-database": {
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

### Configuration Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--type` | Yes | Database type (see supported types below) |
| `--host` | Yes* | Database host address |
| `--port` | No | Database port (uses default if not specified) |
| `--user` | Yes* | Database username |
| `--password` | Yes* | Database password |
| `--database` | Yes* | Database name |
| `--file-path` | Yes* | SQLite database file path (for sqlite type only) |
| `--danger-allow-write` | No | Enable write operations (default: read-only) |
| `--oracle-client-path` | No | Oracle Instant Client path (for Oracle 11g and earlier) |

*Required fields depend on database type

### Supported Database Types

| Database | Type Value | Default Port |
|----------|------------|--------------|
| MySQL | `mysql` | 3306 |
| PostgreSQL | `postgres` | 5432 |
| Redis | `redis` | 6379 |
| Oracle | `oracle` | 1521 |
| SQL Server | `sqlserver` | 1433 |
| MongoDB | `mongodb` | 27017 |
| SQLite | `sqlite` | - |
| Dameng (达梦) | `dm` | 5236 |
| KingbaseES | `kingbase` | 54321 |
| GaussDB | `gaussdb` | 5432 |
| OceanBase | `oceanbase` | 2881 |
| TiDB | `tidb` | 4000 |
| ClickHouse | `clickhouse` | 8123 |
| PolarDB | `polardb` | 3306 |
| Vastbase | `vastbase` | 5432 |
| HighGo | `highgo` | 5866 |
| GoldenDB | `goldendb` | 3306 |

## Configuration Examples

### MySQL

```json
{
  "mcpServers": {
    "mysql-production": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "mysql_password",
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
    "postgres-analytics": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "postgres_password",
        "--database", "analytics"
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

### SQL Server

```json
{
  "mcpServers": {
    "sqlserver-erp": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "localhost",
        "--port", "1433",
        "--user", "sa",
        "--password", "sqlserver_password",
        "--database", "erp_system"
      ]
    }
  }
}
```

### Oracle

```json
{
  "mcpServers": {
    "oracle-finance": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "oracle_password",
        "--database", "ORCL"
      ]
    }
  }
}
```

### Oracle 11g (Legacy)

For Oracle 11g and earlier versions, you need to specify the Oracle Instant Client path:

```json
{
  "mcpServers": {
    "oracle11g-legacy": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "oracle_password",
        "--database", "ORCL",
        "--oracle-client-path", "/opt/oracle/instantclient_19_8"
      ]
    }
  }
}
```

### MongoDB

```json
{
  "mcpServers": {
    "mongodb-logs": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "admin",
        "--password", "mongodb_password",
        "--database", "logs"
      ]
    }
  }
}
```

### Redis

```json
{
  "mcpServers": {
    "redis-cache": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "redis_password"
      ]
    }
  }
}
```

### Dameng (达梦数据库)

```json
{
  "mcpServers": {
    "dameng-gov": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "dm",
        "--host", "localhost",
        "--port", "5236",
        "--user", "SYSDBA",
        "--password", "dameng_password",
        "--database", "DAMENG"
      ]
    }
  }
}
```

### KingbaseES (人大金仓)

```json
{
  "mcpServers": {
    "kingbase-enterprise": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "kingbase",
        "--host", "localhost",
        "--port", "54321",
        "--user", "system",
        "--password", "kingbase_password",
        "--database", "mydb"
      ]
    }
  }
}
```

### Multiple Databases

You can configure multiple databases simultaneously:

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
        "--password", "mysql_password",
        "--database", "users_db"
      ]
    },
    "postgres-orders": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "postgres_password",
        "--database", "orders_db"
      ]
    },
    "redis-cache": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "redis_password"
      ]
    }
  }
}
```

## Usage Examples

After configuring and restarting Claude Desktop, you can interact with your database using natural language.

### Schema Exploration

**You:** "What tables are in the database?"

**Claude:** Let me check the database schema for you.

```
Available tables:
- users (12 columns)
- orders (8 columns)
- products (10 columns)
- categories (4 columns)
- order_items (6 columns)
```

---

**You:** "Show me the structure of the users table"

**Claude:** Here's the structure of the users table:

| Column | Type | Nullable | Key |
|--------|------|----------|-----|
| id | INT | NO | PRIMARY |
| email | VARCHAR(255) | NO | UNIQUE |
| name | VARCHAR(100) | YES | |
| created_at | TIMESTAMP | NO | |
| status | ENUM | YES | |

### Data Queries

**You:** "How many users signed up this month?"

**Claude:** Let me query that for you.

```sql
SELECT COUNT(*) as new_users
FROM users
WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
```

Result: **247 new users** signed up this month.

---

**You:** "Show me the top 5 customers by total order value"

**Claude:** I'll analyze the order data for you.

```sql
SELECT
  u.name,
  u.email,
  SUM(o.total_amount) as total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id
ORDER BY total_spent DESC
LIMIT 5
```

| Name | Email | Total Spent |
|------|-------|-------------|
| Alice Johnson | alice@example.com | $12,450.00 |
| Bob Smith | bob@example.com | $9,230.50 |
| Carol White | carol@example.com | $7,890.25 |
| David Brown | david@example.com | $6,540.00 |
| Eve Davis | eve@example.com | $5,120.75 |

### Complex Analysis

**You:** "What's the average order value by product category for the last quarter?"

**Claude:** Let me analyze the sales data by category.

```sql
SELECT
  c.name as category,
  COUNT(DISTINCT o.id) as order_count,
  AVG(oi.quantity * oi.unit_price) as avg_order_value
FROM categories c
JOIN products p ON c.id = p.category_id
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
GROUP BY c.id
ORDER BY avg_order_value DESC
```

| Category | Orders | Avg Order Value |
|----------|--------|-----------------|
| Electronics | 1,234 | $245.50 |
| Clothing | 2,456 | $89.25 |
| Books | 890 | $32.10 |
| Home & Garden | 567 | $156.80 |

### Redis Operations

**You:** "What keys are stored in Redis?"

**Claude:** Let me scan the Redis keys.

```
Found 156 keys:
- session:* (89 keys)
- cache:* (45 keys)
- rate_limit:* (22 keys)
```

---

**You:** "Get the value of key 'config:app_settings'"

**Claude:** Here's the value:

```json
{
  "theme": "dark",
  "language": "en",
  "notifications": true
}
```

## Advanced Configuration

### Read-Only Mode (Default)

By default, Universal DB MCP runs in read-only mode, blocking all write operations (INSERT, UPDATE, DELETE, DROP, etc.). This is the recommended setting for safety.

```json
{
  "mcpServers": {
    "my-database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--user", "readonly_user",
        "--password", "password",
        "--database", "mydb"
      ]
    }
  }
}
```

### Write Mode (Use with Caution)

To enable write operations, add the `--danger-allow-write` flag:

```json
{
  "mcpServers": {
    "my-database-writable": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--user", "admin",
        "--password", "password",
        "--database", "mydb",
        "--danger-allow-write"
      ]
    }
  }
}
```

> **Warning**: Enabling write mode allows Claude to execute INSERT, UPDATE, DELETE, and other data-modifying operations. Use this only in development environments or when absolutely necessary.

### Environment Variables

You can also use environment variables in your configuration:

**macOS/Linux:**
```json
{
  "mcpServers": {
    "my-database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--user", "root",
        "--password", "${DB_PASSWORD}",
        "--database", "mydb"
      ],
      "env": {
        "DB_PASSWORD": "your_password"
      }
    }
  }
}
```

### Using Global Installation

If you've installed universal-db-mcp globally, you can use it directly:

```bash
npm install -g universal-db-mcp
```

```json
{
  "mcpServers": {
    "my-database": {
      "command": "universal-db-mcp",
      "args": [
        "--type", "mysql",
        "--host", "localhost",
        "--user", "root",
        "--password", "password",
        "--database", "mydb"
      ]
    }
  }
}
```

## Available MCP Tools

Once configured, Claude Desktop will have access to the following tools:

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries against the database |
| `get_schema` | Get complete database schema information |
| `get_table_info` | Get detailed information about a specific table |
| `clear_cache` | Clear the schema cache |

## Troubleshooting

### Issue: Claude Desktop doesn't recognize the MCP server

**Symptoms:** Claude doesn't respond to database queries or shows no tools available.

**Solutions:**
1. **Restart Claude Desktop** - After modifying the configuration file, you must restart Claude Desktop completely (quit and reopen).
2. **Verify configuration file location** - Ensure the file is in the correct location:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
3. **Check JSON syntax** - Validate your JSON configuration using a JSON validator.
4. **Check Node.js installation** - Ensure Node.js v20+ is installed and accessible from the command line.

### Issue: Connection failed

**Symptoms:** Error messages about database connection failures.

**Solutions:**
1. **Verify credentials** - Double-check username, password, host, and port.
2. **Test database connectivity** - Try connecting with a database client first.
3. **Check firewall** - Ensure the database port is accessible.
4. **Verify database is running** - Confirm the database service is active.

### Issue: Permission denied

**Symptoms:** Queries fail with permission errors.

**Solutions:**
1. **Check user permissions** - Ensure the database user has SELECT permissions.
2. **Verify database access** - Confirm the user can access the specified database.
3. **Check table permissions** - Some tables may have restricted access.

### Issue: Slow queries

**Symptoms:** Queries take a long time to execute.

**Solutions:**
1. **Add indexes** - Ensure frequently queried columns are indexed.
2. **Limit result sets** - Ask Claude to limit results (e.g., "show top 10").
3. **Optimize queries** - Complex queries may need optimization.
4. **Check network latency** - Remote databases may have higher latency.

### Issue: Write operations blocked

**Symptoms:** INSERT, UPDATE, DELETE operations fail.

**Solutions:**
1. **Check mode** - By default, write operations are blocked.
2. **Enable write mode** - Add `--danger-allow-write` flag if needed.
3. **Verify user permissions** - Ensure the database user has write permissions.

### Viewing Logs

To debug issues, you can check Claude Desktop logs:

**macOS:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows:**
```powershell
Get-Content "$env:APPDATA\Claude\logs\mcp*.log" -Wait
```

## Security Best Practices

1. **Use read-only mode** - Keep the default read-only mode unless write access is absolutely necessary.

2. **Create dedicated database users** - Create a specific user for Claude with minimal required permissions:
   ```sql
   -- MySQL example
   CREATE USER 'claude_readonly'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT SELECT ON mydb.* TO 'claude_readonly'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Avoid storing passwords in plain text** - Use environment variables or secure credential management.

4. **Limit network access** - Configure database to only accept connections from localhost or trusted IPs.

5. **Regular auditing** - Review query logs periodically to ensure appropriate usage.

6. **Use VPN for remote databases** - When connecting to remote databases, use VPN or SSH tunnels.

## Resources

- [Claude Desktop Download](https://claude.ai/download)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Database Configuration Guide](../getting-started/configuration.md)
- [Security Guide](../guides/security.md)
- [Troubleshooting Guide](../operations/troubleshooting.md)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Anthropic Support: https://support.anthropic.com/
