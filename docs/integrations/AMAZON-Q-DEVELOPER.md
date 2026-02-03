# Amazon Q Developer Integration Guide

This guide shows how to integrate Universal Database MCP Server with Amazon Q Developer.

## Overview

[Amazon Q Developer](https://aws.amazon.com/q/developer/) is AWS's AI coding assistant. It supports MCP, allowing you to query databases while coding.

## Prerequisites

- Amazon Q Developer installed in VS Code or JetBrains
- AWS account
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to Amazon Q's MCP configuration:

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

Ask Amazon Q about your database:

```
What tables are in the database?
Show me the schema of the users table
Generate code to query the orders table
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Resources

- [Amazon Q Developer Documentation](https://docs.aws.amazon.com/amazonq/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
