# MCP Inspector Integration Guide

This guide shows how to use Universal Database MCP Server with MCP Inspector for debugging and testing.

## Overview

[MCP Inspector](https://github.com/modelcontextprotocol/inspector) is the official debugging tool for MCP servers. It allows you to test and inspect MCP server functionality.

## Prerequisites

- Node.js 20.0.0 or later
- Database instance

## Installation

```bash
npx @modelcontextprotocol/inspector
```

## Usage

### Start Inspector with Database Server

```bash
npx @modelcontextprotocol/inspector npx universal-db-mcp \
  --type mysql \
  --host localhost \
  --port 3306 \
  --user root \
  --password your_password \
  --database your_database
```

### Using the Inspector UI

1. Open the Inspector URL shown in terminal (usually http://localhost:5173)
2. View available tools in the "Tools" tab
3. Test tools by clicking on them
4. View server logs in the "Logs" tab

### Testing Tools

**Test execute_query:**
```json
{
  "query": "SELECT * FROM users LIMIT 5"
}
```

**Test get_schema:**
```json
{}
```

**Test get_table_info:**
```json
{
  "tableName": "users"
}
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Debugging Tips

1. Check server logs for errors
2. Verify tool input schemas
3. Test with simple queries first
4. Monitor response times

## Resources

- [MCP Inspector GitHub](https://github.com/modelcontextprotocol/inspector)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
