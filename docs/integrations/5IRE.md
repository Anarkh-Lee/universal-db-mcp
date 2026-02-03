# 5ire Integration Guide

This guide shows how to integrate Universal Database MCP Server with 5ire.

## Overview

[5ire](https://github.com/5ire-tech/5ire) is a cross-platform AI chat application. It supports MCP, allowing you to query databases from the chat interface.

## Prerequisites

- 5ire installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to 5ire's MCP configuration:

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

Ask 5ire about your database:

```
What tables are in the database?
Show me the schema of the users table
```

## Resources

- [5ire GitHub](https://github.com/5ire-tech/5ire)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
