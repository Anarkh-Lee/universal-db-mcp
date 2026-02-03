# ChatGPT Integration Guide

This guide shows how to integrate Universal Database MCP Server with ChatGPT using MCP Connectors.

## Overview

ChatGPT supports remote MCP servers through MCP Connectors, enabling direct integration with Universal Database MCP Server via SSE or Streamable HTTP protocols. This allows ChatGPT to query and analyze your database data using natural language.

## Prerequisites

- Universal Database MCP Server deployed with HTTP mode
- ChatGPT Plus, Team, or Enterprise subscription (MCP Connectors require paid plans)
- Database instance (MySQL, PostgreSQL, etc.)
- Publicly accessible server URL (for ChatGPT to connect)

## Setup Steps

### Step 1: Deploy HTTP Server

Deploy Universal Database MCP Server in HTTP mode with a publicly accessible URL:

```bash
# Using npm
export MODE=http
export HTTP_PORT=3000
export API_KEYS=your-secret-api-key
npx universal-db-mcp

# Or using Docker
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=your-secret-api-key \
  universal-db-mcp:latest
```

For production, deploy to a cloud platform (Railway, Render, Fly.io, AWS, etc.). See [Deployment Guide](../http-api/DEPLOYMENT.md).

> **Important**: ChatGPT requires a publicly accessible HTTPS URL. Local servers (localhost) will not work.

### Step 2: Verify Server Deployment

Test your server is accessible:

```bash
# Test health endpoint
curl https://your-server-url/health

# Test MCP endpoint (should return method not allowed for GET without proper headers)
curl https://your-server-url/mcp
```

### Step 3: Add MCP Connector in ChatGPT

1. Open [ChatGPT](https://chat.openai.com/)
2. Click on your profile icon in the bottom-left corner
3. Select **Settings**
4. Navigate to **Connectors** or **MCP Connectors**
5. Click **Add Connector** or **Add MCP Server**

### Step 4: Configure MCP Connector

#### Option A: Streamable HTTP Endpoint (Recommended)

**Server URL**:
```
https://your-server-url/mcp
```

**Headers Configuration**:
```
X-API-Key: your-secret-api-key
X-DB-Type: mysql
X-DB-Host: your-database-host
X-DB-Port: 3306
X-DB-User: your-username
X-DB-Password: your-password
X-DB-Database: your-database-name
```

#### Option B: SSE Endpoint

**Server URL**:
```
https://your-server-url/sse?type=mysql&host=your-database-host&port=3306&user=your-username&password=your-password&database=your-database-name
```

**Headers Configuration**:
```
X-API-Key: your-secret-api-key
```

> **Note**: SSE endpoint passes database configuration via URL parameters, while Streamable HTTP uses headers.

### Step 5: Save and Test Connection

1. Click **Save** or **Connect**
2. ChatGPT will attempt to connect to your MCP server
3. If successful, the connector will show as "Connected"

## Available MCP Tools

Once connected, the following tools become available in ChatGPT:

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries against the database |
| `get_schema` | Get database schema information |
| `get_table_info` | Get detailed information about a specific table |
| `clear_cache` | Clear the schema cache |

## Header Reference

### Authentication Header

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes* | API key for authentication (if API_KEYS is configured on server) |

### Database Configuration Headers (for Streamable HTTP)

| Header | Required | Description |
|--------|----------|-------------|
| `X-DB-Type` | Yes | Database type: mysql, postgres, redis, oracle, dm, sqlserver, mongodb, sqlite, kingbase, gaussdb, oceanbase, tidb, clickhouse, polardb, vastbase, highgo, goldendb |
| `X-DB-Host` | Yes* | Database host address |
| `X-DB-Port` | No | Database port (uses default if not specified) |
| `X-DB-User` | Yes* | Database username |
| `X-DB-Password` | Yes* | Database password |
| `X-DB-Database` | Yes* | Database name |
| `X-DB-FilePath` | Yes* | SQLite file path (for sqlite type only) |
| `X-DB-Allow-Write` | No | Enable write operations (default: false) |
| `X-DB-Oracle-Client-Path` | No | Oracle Instant Client path (for Oracle 11g) |

*Required fields depend on database type

## URL Parameters (for SSE Endpoint)

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Database type |
| `host` | Yes* | Database host |
| `port` | No | Database port |
| `user` | Yes* | Database username |
| `password` | Yes* | Database password |
| `database` | Yes* | Database name |
| `filePath` | Yes* | SQLite file path (for sqlite type) |
| `allowWrite` | No | Enable write operations (default: false) |

## Configuration Examples

### MySQL

**Streamable HTTP Headers**:
```
X-API-Key: your-api-key
X-DB-Type: mysql
X-DB-Host: mysql.example.com
X-DB-Port: 3306
X-DB-User: app_user
X-DB-Password: secure_password
X-DB-Database: production_db
```

**SSE URL**:
```
https://your-server/sse?type=mysql&host=mysql.example.com&port=3306&user=app_user&password=secure_password&database=production_db
```

### PostgreSQL

**Streamable HTTP Headers**:
```
X-API-Key: your-api-key
X-DB-Type: postgres
X-DB-Host: postgres.example.com
X-DB-Port: 5432
X-DB-User: postgres_user
X-DB-Password: secure_password
X-DB-Database: analytics_db
```

**SSE URL**:
```
https://your-server/sse?type=postgres&host=postgres.example.com&port=5432&user=postgres_user&password=secure_password&database=analytics_db
```

### SQLite

**Streamable HTTP Headers**:
```
X-API-Key: your-api-key
X-DB-Type: sqlite
X-DB-FilePath: /path/to/database.db
```

**SSE URL**:
```
https://your-server/sse?type=sqlite&filePath=/path/to/database.db
```

### Redis

**Streamable HTTP Headers**:
```
X-API-Key: your-api-key
X-DB-Type: redis
X-DB-Host: redis.example.com
X-DB-Port: 6379
X-DB-Password: redis_password
```

## Usage Examples

Once the MCP Connector is configured, you can interact with your database using natural language in ChatGPT:

### Example 1: Explore Database Schema

```
User: What tables are in my database?

ChatGPT: [Uses get_schema tool]
Your database contains the following tables:
- users (id, name, email, created_at)
- orders (id, user_id, total, status, created_at)
- products (id, name, price, category, stock)
```

### Example 2: Simple Query

```
User: Show me the first 10 users

ChatGPT: [Uses execute_query tool with "SELECT * FROM users LIMIT 10"]
Here are the first 10 users:
| ID | Name | Email | Created At |
|----|------|-------|------------|
| 1 | Alice | alice@example.com | 2026-01-15 |
| 2 | Bob | bob@example.com | 2026-01-16 |
...
```

### Example 3: Aggregation Query

```
User: How many orders were placed last month and what was the total revenue?

ChatGPT: [Uses execute_query tool]
Last month's order statistics:
- Total orders: 1,234
- Total revenue: $125,430.50
- Average order value: $101.65
```

### Example 4: Complex Analysis

```
User: Which products have the highest sales volume this quarter?

ChatGPT: [Analyzes schema, generates appropriate SQL, executes query]
Top 5 products by sales volume this quarter:
1. Widget Pro - 523 units ($26,150)
2. Gadget Plus - 412 units ($20,600)
3. Super Tool - 389 units ($19,450)
...
```

## Advanced Configuration

### Enable Write Operations

To allow INSERT, UPDATE, DELETE operations:

**Streamable HTTP**:
```
X-DB-Allow-Write: true
```

**SSE URL**:
```
https://your-server/sse?type=mysql&host=...&allowWrite=true
```

> **Warning**: Enable write operations with caution. Ensure proper access controls are in place.

### Multiple Database Connections

You can add multiple MCP Connectors in ChatGPT, each connecting to a different database:

1. Add first connector: "Production MySQL"
2. Add second connector: "Analytics PostgreSQL"
3. Add third connector: "Cache Redis"

ChatGPT will intelligently select the appropriate connector based on your queries.

## Security Best Practices

### 1. Use HTTPS

Always deploy your MCP server with HTTPS enabled. ChatGPT requires secure connections.

### 2. Strong API Keys

- Generate strong, random API keys
- Rotate keys periodically
- Never share keys in public repositories

### 3. Database User Permissions

- Create dedicated database users for ChatGPT access
- Grant only necessary permissions (preferably read-only)
- Avoid using root/admin credentials

### 4. Network Security

- Use firewall rules to restrict access
- Consider VPN or private networking for sensitive databases
- Monitor access logs regularly

### 5. Data Sensitivity

- Be aware that queries and results pass through ChatGPT
- Avoid connecting to databases with highly sensitive data (PII, financial records)
- Consider data masking for sensitive columns

## Troubleshooting

### Issue: Connection Failed

**Symptoms**: ChatGPT cannot connect to MCP server

**Solutions**:
1. Verify server URL is publicly accessible (not localhost)
2. Ensure HTTPS is properly configured
3. Check API key is correct
4. Verify server is running and healthy
5. Check firewall allows incoming connections

### Issue: Authentication Error

**Symptoms**: "Unauthorized" or "Invalid API Key" error

**Solutions**:
1. Verify X-API-Key header is correctly set
2. Ensure API key matches server configuration
3. Check for extra spaces or characters in the key

### Issue: Database Connection Error

**Symptoms**: Server connects but database queries fail

**Solutions**:
1. Verify database credentials are correct
2. Check database host is accessible from server
3. Ensure database port is open
4. Verify database name exists

### Issue: Query Timeout

**Symptoms**: Queries take too long or timeout

**Solutions**:
1. Optimize SQL queries
2. Add database indexes
3. Increase server timeout settings
4. Use LIMIT for large result sets

### Issue: SSL/TLS Errors

**Symptoms**: Certificate or SSL-related errors

**Solutions**:
1. Ensure valid SSL certificate is installed
2. Check certificate is not expired
3. Verify certificate chain is complete

## Limitations

- ChatGPT MCP Connectors require a paid subscription
- Server must be publicly accessible via HTTPS
- Some complex queries may require multiple interactions
- Large result sets may be truncated
- Real-time streaming of results may vary

## Resources

- [ChatGPT Documentation](https://help.openai.com/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [API Reference](../http-api/API_REFERENCE.md)
- [Deployment Guide](../http-api/DEPLOYMENT.md)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- OpenAI Help Center: https://help.openai.com/
