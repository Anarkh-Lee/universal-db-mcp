# Neovim Integration Guide

This guide shows how to integrate Universal Database MCP Server with Neovim.

## Overview

Neovim is a highly extensible, Vim-based text editor that supports modern features through its Lua API and plugin ecosystem. By using the MCPHub.nvim plugin, you can integrate Universal Database MCP Server with Neovim, enabling AI-powered database interactions directly within your editor.

**Key Benefits:**
- Query databases directly from Neovim
- Get AI assistance for SQL query writing
- Explore database schema without leaving the editor
- Seamless integration with Neovim's workflow

## Prerequisites

- [Neovim](https://neovim.io/) installed (version 0.8.0 or later recommended)
- Node.js 18+ installed
- A plugin manager (lazy.nvim, packer.nvim, or similar)
- Database instance (MySQL, PostgreSQL, SQLite, etc.)

## Plugin Installation

Neovim supports MCP through the MCPHub.nvim plugin. Below are installation instructions for popular plugin managers.

### Using lazy.nvim

Add the following to your Neovim configuration:

```lua
{
  "ravitemer/mcphub.nvim",
  dependencies = {
    "nvim-lua/plenary.nvim",
  },
  config = function()
    require("mcphub").setup({
      -- Configuration goes here
    })
  end,
}
```

### Using packer.nvim

Add the following to your Neovim configuration:

```lua
use {
  "ravitemer/mcphub.nvim",
  requires = {
    "nvim-lua/plenary.nvim",
  },
  config = function()
    require("mcphub").setup({
      -- Configuration goes here
    })
  end,
}
```

### Using vim-plug

Add the following to your Neovim configuration:

```vim
Plug 'nvim-lua/plenary.nvim'
Plug 'ravitemer/mcphub.nvim'
```

Then add the Lua configuration:

```lua
lua << EOF
require("mcphub").setup({
  -- Configuration goes here
})
EOF
```

## Configuration

After installing the plugin, configure the MCP server in your Neovim setup.

### Basic Configuration

```lua
require("mcphub").setup({
  servers = {
    ["universal-db-mcp"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

## Configuration Examples

### MySQL

```lua
require("mcphub").setup({
  servers = {
    ["mysql-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

### PostgreSQL

```lua
require("mcphub").setup({
  servers = {
    ["postgres-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

### SQLite

```lua
require("mcphub").setup({
  servers = {
    ["sqlite-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/your/database.db"
      }
    }
  }
})
```

### SQL Server

```lua
require("mcphub").setup({
  servers = {
    ["sqlserver-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "localhost",
        "--port", "1433",
        "--user", "sa",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

### Oracle

```lua
require("mcphub").setup({
  servers = {
    ["oracle-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "your_password",
        "--database", "ORCL"
      }
    }
  }
})
```

### MongoDB

```lua
require("mcphub").setup({
  servers = {
    ["mongodb"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "admin",
        "--password", "your_password",
        "--database", "your_database"
      }
    }
  }
})
```

### Redis

```lua
require("mcphub").setup({
  servers = {
    ["redis"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "your_password"
      }
    }
  }
})
```

### Multiple Databases

You can configure multiple database connections:

```lua
require("mcphub").setup({
  servers = {
    ["mysql-production"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "prod-db.example.com",
        "--port", "3306",
        "--user", "readonly_user",
        "--password", "prod_password",
        "--database", "production_db"
      }
    },
    ["mysql-development"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "dev_password",
        "--database", "development_db"
      }
    },
    ["postgres-analytics"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "analytics-db.example.com",
        "--port", "5432",
        "--user", "analyst",
        "--password", "analytics_password",
        "--database", "analytics"
      }
    }
  }
})
```

### Enable Write Operations

By default, write operations are disabled for safety. To enable them:

```lua
require("mcphub").setup({
  servers = {
    ["mysql-db-writable"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database",
        "--allow-write", "true"
      }
    }
  }
})
```

> **Warning**: Enabling write operations allows the AI to execute INSERT, UPDATE, DELETE, and other modifying queries. Use with caution, especially in production environments.

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

Use the MCPHub commands to interact with your database:

```
:MCPHub
```

Then ask the AI:

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
Generate a Lua function to insert a new user into the users table
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

### Issue: Plugin Not Loading

**Symptoms**: MCPHub commands are not available

**Solutions**:
1. Verify the plugin is correctly installed
2. Check that plenary.nvim dependency is installed
3. Run `:checkhealth mcphub` to diagnose issues
4. Ensure your Neovim version is 0.8.0 or later

### Issue: MCP Server Not Connecting

**Symptoms**: Cannot connect to the database through MCPHub

**Solutions**:
1. Verify the configuration syntax is correct
2. Check that Node.js is installed and accessible from PATH
3. Ensure npx command is available
4. Restart Neovim after making configuration changes

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
3. Try using the full path to npx
4. On Windows, you may need to restart after installing Node.js

## Advanced Configuration

### Using Environment Variables

For better security, you can use environment variables in your configuration:

```lua
require("mcphub").setup({
  servers = {
    ["mysql-db"] = {
      command = "npx",
      args = {
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", os.getenv("DB_PASSWORD") or "default_password",
        "--database", "your_database"
      }
    }
  }
})
```

Set the environment variable before starting Neovim:

**macOS/Linux:**
```bash
export DB_PASSWORD="your_secure_password"
```

**Windows (PowerShell):**
```powershell
$env:DB_PASSWORD = "your_secure_password"
```

### Integration with Other Plugins

MCPHub.nvim can work alongside other Neovim plugins for enhanced functionality:

- **nvim-cmp**: For AI-powered completions
- **telescope.nvim**: For fuzzy finding database objects
- **which-key.nvim**: For keybinding discovery

## Resources

- [Neovim Official Website](https://neovim.io/)
- [MCPHub.nvim GitHub Repository](https://github.com/ravitemer/mcphub.nvim)
- [Universal Database MCP Server Documentation](../README.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Neovim Community: https://neovim.io/community/
