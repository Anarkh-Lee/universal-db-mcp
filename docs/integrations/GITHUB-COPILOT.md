# GitHub Copilot Integration Guide

This guide shows how to integrate Universal Database MCP Server with GitHub Copilot.

## Overview

[GitHub Copilot](https://github.com/features/copilot) is GitHub's AI coding assistant. With the Agent Mode feature in VS Code and JetBrains IDEs, Copilot can use MCP servers to interact with external tools including databases.

**Key Benefits:**
- Native MCP support in Agent Mode
- Seamless integration with VS Code and JetBrains
- Natural language database queries while coding
- Context-aware code suggestions based on database schema

## Prerequisites

- GitHub Copilot subscription (Individual, Business, or Enterprise)
- VS Code or JetBrains IDE with Copilot extension
- Node.js 20.0.0 or later
- Database instance accessible from your machine

## Configuration

### VS Code Configuration

1. Open VS Code Settings (Cmd/Ctrl + ,)
2. Search for "github.copilot.chat.experimental.mcpServers"
3. Click "Edit in settings.json"
4. Add the MCP server configuration:

```json
{
  "github.copilot.chat.experimental.mcpServers": {
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

### JetBrains Configuration

1. Open Settings/Preferences
2. Navigate to Tools > GitHub Copilot > MCP Servers
3. Add a new MCP server with the configuration

## Configuration Examples

### MySQL

```json
{
  "github.copilot.chat.experimental.mcpServers": {
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
  "github.copilot.chat.experimental.mcpServers": {
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
  "github.copilot.chat.experimental.mcpServers": {
    "sqlite-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "${workspaceFolder}/data/app.db"
      ]
    }
  }
}
```

## Usage

### Using Agent Mode

1. Open Copilot Chat (Cmd/Ctrl + Shift + I)
2. Switch to Agent Mode by clicking the agent icon
3. Ask questions about your database:

```
@workspace What tables are in the database?

@workspace Show me the schema of the users table

@workspace Generate a TypeScript interface for the orders table

@workspace Find all users who haven't placed an order
```

### Common Workflows

**Schema Exploration:**
```
@workspace List all tables and their columns
@workspace What are the relationships between users and orders?
@workspace Show me the indexes on the products table
```

**Code Generation:**
```
@workspace Create a repository class for the users table
@workspace Generate SQL migrations for adding a new column
@workspace Write a function to get user orders with pagination
```

**Data Analysis:**
```
@workspace How many orders were placed this month?
@workspace What's the average order value by customer segment?
@workspace Find the top 10 products by revenue
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

1. Use read-only database users
2. Never commit credentials to version control
3. Use VS Code's secret storage for passwords
4. Keep write mode disabled unless necessary

### Performance

1. Use specific queries instead of SELECT *
2. Add LIMIT to prevent large result sets
3. Let Copilot cache schema information

### Workflow

1. Start by exploring the database schema
2. Use natural language for complex queries
3. Review generated SQL before execution
4. Combine with Copilot's code suggestions

## Troubleshooting

### MCP Server Not Available

**Symptoms:** Copilot doesn't show database tools

**Solutions:**
1. Ensure Agent Mode is enabled
2. Check the MCP server configuration in settings
3. Verify Node.js 20+ is installed
4. Restart VS Code/IDE

### Connection Failed

**Symptoms:** Database connection errors

**Solutions:**
1. Verify database is running
2. Check credentials are correct
3. Ensure network connectivity
4. Test with database client first

### Agent Mode Not Available

**Symptoms:** Can't switch to Agent Mode

**Solutions:**
1. Update Copilot extension to latest version
2. Check your Copilot subscription includes Agent Mode
3. Enable experimental features in settings

## Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Copilot Agent Mode](https://docs.github.com/en/copilot/using-github-copilot/using-extensions-to-integrate-external-tools-with-copilot-chat)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- GitHub Copilot Support: https://support.github.com/
