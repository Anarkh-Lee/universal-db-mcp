# Emacs Integration Guide

This guide shows how to integrate Universal Database MCP Server with Emacs using the mcp.el package.

## Overview

Emacs is a powerful, extensible text editor that supports MCP integration through the mcp.el package. By integrating Universal Database MCP Server, you can query and analyze database data directly within Emacs using AI assistants.

**Key Benefits:**
- Query databases directly from Emacs
- Get AI assistance for SQL query writing
- Explore database schema without leaving the editor
- Debug and optimize database queries with AI help

## Prerequisites

- [Emacs](https://www.gnu.org/software/emacs/) 27.1 or later installed
- Node.js 18+ installed
- Database instance (MySQL, PostgreSQL, SQLite, etc.)
- mcp.el package installed

---

## Step 1: Install mcp.el Package

### Using use-package (Recommended)

Add the following to your Emacs configuration file (`~/.emacs.d/init.el` or `~/.emacs`):

```elisp
(use-package mcp
  :ensure t)
```

### Using package.el

1. Add MELPA to your package archives if not already configured:

```elisp
(require 'package)
(add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/") t)
(package-initialize)
```

2. Install the package:

```
M-x package-refresh-contents
M-x package-install RET mcp RET
```

### Manual Installation

1. Clone the mcp.el repository:

```bash
git clone https://github.com/lizqwerscott/mcp.el.git ~/.emacs.d/site-lisp/mcp.el
```

2. Add to your configuration:

```elisp
(add-to-list 'load-path "~/.emacs.d/site-lisp/mcp.el")
(require 'mcp)
```

---

## Step 2: Configure MCP Server

Add the Universal Database MCP Server configuration to your Emacs configuration file.

### Basic Configuration

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("universal-db-mcp"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "your_password" "--database" "your_database")))))
```

---

## Configuration Examples

### MySQL

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("mysql-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "your_password" "--database" "your_database")))))
```

### PostgreSQL

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("postgres-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "postgres" "--host" "localhost" "--port" "5432" "--user" "postgres" "--password" "your_password" "--database" "your_database")))))
```

### SQLite

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("sqlite-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "sqlite" "--file-path" "/path/to/your/database.db")))))
```

### SQL Server

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("sqlserver-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "sqlserver" "--host" "localhost" "--port" "1433" "--user" "sa" "--password" "your_password" "--database" "your_database")))))
```

### Oracle

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("oracle-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "oracle" "--host" "localhost" "--port" "1521" "--user" "system" "--password" "your_password" "--database" "ORCL")))))
```

### MongoDB

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("mongodb"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mongodb" "--host" "localhost" "--port" "27017" "--user" "admin" "--password" "your_password" "--database" "your_database")))))
```

### Redis

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("redis"
           :command "npx"
           :args ("universal-db-mcp" "--type" "redis" "--host" "localhost" "--port" "6379" "--password" "your_password")))))
```

### Multiple Databases

You can configure multiple database connections:

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("mysql-production"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "prod-db.example.com" "--port" "3306" "--user" "readonly_user" "--password" "prod_password" "--database" "production_db"))
          ("mysql-development"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "dev_password" "--database" "development_db"))
          ("postgres-analytics"
           :command "npx"
           :args ("universal-db-mcp" "--type" "postgres" "--host" "analytics-db.example.com" "--port" "5432" "--user" "analyst" "--password" "analytics_password" "--database" "analytics")))))
```

### Enable Write Operations

By default, write operations are disabled for safety. To enable them:

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("mysql-db-writable"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "your_password" "--database" "your_database" "--allow-write" "true")))))
```

> **Warning**: Enabling write operations allows the AI to execute INSERT, UPDATE, DELETE, and other modifying queries. Use with caution, especially in production environments.

---

## Step 3: Start MCP Server

After configuring, start the MCP server:

```
M-x mcp-start-server
```

Select the server you want to start from the list.

---

## Available Tools

Once configured, the following MCP tools will be available:

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries against the database |
| `get_schema` | Get database schema information (tables, columns, types) |
| `get_table_info` | Get detailed information about a specific table |
| `clear_cache` | Clear the schema cache |

## Usage Examples

### Example 1: Explore Database Schema

Use the MCP tools to explore your database:

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
Generate an Elisp function to insert a new user into the users table
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

### Issue: MCP Server Not Starting

**Symptoms**: The MCP server fails to start or connect

**Solutions**:
1. Verify the configuration syntax is correct in your init file
2. Check that all parentheses and quotes are properly balanced
3. Restart Emacs after making configuration changes
4. Ensure Node.js is installed and accessible from PATH
5. Run `M-x mcp-start-server` and check the *Messages* buffer for errors

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
3. Add Node.js path to Emacs exec-path:

```elisp
(add-to-list 'exec-path "/usr/local/bin")
;; Or on macOS with Homebrew:
(add-to-list 'exec-path "/opt/homebrew/bin")
```

4. On Windows, you may need to restart after installing Node.js

### Issue: Package Not Found

**Symptoms**: mcp.el package cannot be installed

**Solutions**:
1. Ensure MELPA is added to your package archives
2. Run `M-x package-refresh-contents` to update package list
3. Try manual installation from GitHub

## Advanced Configuration

### Using Environment Variables

For better security, you can use environment variables in your configuration:

**Shell Configuration:**
```bash
export DB_PASSWORD="your_secure_password"
```

**Emacs Configuration:**
```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        `(("mysql-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" ,(getenv "DB_PASSWORD") "--database" "your_database")))))
```

Note the use of backtick (`) instead of single quote (') to enable evaluation of `(getenv "DB_PASSWORD")`.

### Integration with gptel

If you use gptel for AI interactions in Emacs, you can integrate MCP tools:

```elisp
(use-package gptel
  :ensure t
  :config
  ;; Configure gptel with your preferred AI backend
  )

(use-package mcp
  :ensure t
  :after gptel
  :config
  (setq mcp-servers
        '(("universal-db-mcp"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "your_password" "--database" "your_database")))))
```

### Using with Docker

If your database runs in Docker, ensure the container is accessible:

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("docker-mysql"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "127.0.0.1" "--port" "3306" "--user" "root" "--password" "root_password" "--database" "app_db")))))
```

> **Note**: Use `127.0.0.1` instead of `localhost` when connecting to Docker containers on some systems.

## Resources

- [GNU Emacs Official Website](https://www.gnu.org/software/emacs/)
- [mcp.el GitHub Repository](https://github.com/lizqwerscott/mcp.el)
- [MELPA Package Archive](https://melpa.org/)
- [Universal Database MCP Server Documentation](../README.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- mcp.el Issues: https://github.com/lizqwerscott/mcp.el/issues
