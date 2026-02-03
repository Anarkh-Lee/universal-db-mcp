# Notion Integration Guide

This guide shows how to integrate Universal Database MCP Server with Notion.

## Overview

[Notion](https://notion.so/) is a productivity and note-taking application. Through Notion's AI features and MCP support, you can query databases directly from your Notion workspace.

## Prerequisites

- Notion account with AI features enabled
- Universal Database MCP Server deployed with HTTP mode
- Database instance (MySQL, PostgreSQL, etc.)

## Configuration

### Step 1: Deploy HTTP API Server

Deploy Universal Database MCP Server in HTTP mode with SSE/Streamable HTTP support:

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=notion-secret-key \
  universal-db-mcp:latest
```

### Step 2: Configure Notion MCP Connection

1. Open Notion Settings
2. Navigate to "Connections" or "AI Settings"
3. Add MCP Server connection:
   - URL: `https://your-server.com/mcp`
   - Authentication: API Key

### Step 3: Configure Database Headers

When connecting, include database configuration in headers:

```
X-DB-Type: mysql
X-DB-Host: localhost
X-DB-Port: 3306
X-DB-User: root
X-DB-Password: your_password
X-DB-Database: your_database
```

## Usage

Once configured, you can use Notion AI to query your database:

```
@AI What tables are in my database?

@AI Show me the schema of the users table

@AI How many orders were placed this month?

@AI Find the top 10 customers by revenue
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema information |
| `get_table_info` | Get detailed table information |
| `clear_cache` | Clear schema cache |

## Best Practices

1. Use read-only database users
2. Keep your MCP server secure with API keys
3. Use HTTPS for production deployments
4. Limit query results to prevent large responses

## Resources

- [Notion Documentation](https://notion.so/help)
- [API Reference](../http-api/API_REFERENCE.md)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
