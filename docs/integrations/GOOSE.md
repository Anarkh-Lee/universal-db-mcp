# Goose Integration Guide

This guide shows how to integrate Universal Database MCP Server with Goose.

## Overview

[Goose](https://github.com/block/goose) is Block's AI coding agent. It supports MCP, allowing you to query databases while coding.

## Prerequisites

- Goose installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to `~/.config/goose/config.yaml`:

```yaml
mcpServers:
  database:
    command: npx
    args:
      - universal-db-mcp
      - --type
      - mysql
      - --host
      - localhost
      - --port
      - "3306"
      - --user
      - root
      - --password
      - your_password
      - --database
      - your_database
```

## Usage

```bash
goose chat
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

- [Goose GitHub](https://github.com/block/goose)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
