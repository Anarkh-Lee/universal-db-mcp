# Gemini CLI Integration Guide

This guide shows how to integrate Universal Database MCP Server with Gemini CLI.

## Overview

[Gemini CLI](https://github.com/google-gemini/gemini-cli) is Google's command-line AI tool. It supports MCP, allowing you to query databases from the terminal.

## Prerequisites

- Gemini CLI installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to Gemini CLI configuration:

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

```bash
gemini chat
> What tables are in the database?
> Show me the schema of the users table
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Resources

- [Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
