# Roo Code Integration Guide

This guide shows how to integrate Universal Database MCP Server with Roo Code.

## Overview

[Roo Code](https://github.com/roovet/roo-code) is a fork of Cline, an autonomous coding agent for VS Code. It supports MCP, allowing you to query databases while coding.

## Prerequisites

- VS Code installed
- Roo Code extension installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

### Step 1: Open Roo Code Settings

1. Open VS Code
2. Click on Roo Code icon in sidebar
3. Open Settings

### Step 2: Configure MCP Server

Add to MCP Servers configuration:

```json
{
  "mcpServers": {
    "database": {
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

## Usage

Ask Roo Code about your database:

```
What tables are in the database?
Show me the schema of the users table
Generate a TypeScript interface for the orders table
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Resources

- [Roo Code GitHub](https://github.com/roovet/roo-code)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
