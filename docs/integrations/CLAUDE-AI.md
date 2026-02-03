# Claude.ai Integration Guide

This guide shows how to integrate Universal Database MCP Server with Claude.ai web interface.

## Overview

[Claude.ai](https://claude.ai/) is Anthropic's web interface for Claude. It supports MCP via SSE/Streamable HTTP, allowing you to query databases from the web interface.

## Prerequisites

- Claude.ai account with MCP feature enabled
- Universal Database MCP Server deployed in HTTP mode
- Database instance

## Configuration

### Step 1: Deploy HTTP API Server

Deploy Universal Database MCP Server in HTTP mode with public access:

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=claude-ai-key \
  universal-db-mcp:latest
```

### Step 2: Configure Claude.ai

1. Open Claude.ai
2. Go to Settings > Integrations
3. Add MCP Server:
   - URL: `https://your-server.com/mcp`
   - Configure database headers

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

Once configured, you can ask Claude about your database:

```
What tables are in the database?
Show me the schema of the users table
How many orders were placed this month?
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Best Practices

1. Use HTTPS for production deployments
2. Use read-only database users
3. Protect your MCP server with API keys
4. Limit query results to prevent large responses

## Resources

- [Claude.ai](https://claude.ai/)
- [API Reference](../http-api/API_REFERENCE.md)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
