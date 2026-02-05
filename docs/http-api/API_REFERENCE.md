# HTTP API Reference

## Overview

Universal Database MCP Server HTTP API provides RESTful endpoints and MCP protocol endpoints for database operations. This API supports 17 database types and includes features like session management, API key authentication, rate limiting, and CORS support.

**Base URL**: `http://localhost:3000` (configurable via `HTTP_PORT` environment variable)

**API Version**: 1.0.0

## Authentication

All endpoints (except `/api/health` and `/api/info`) require API key authentication, including REST API and MCP SSE/Streamable HTTP endpoints.

> **Note**: If `API_KEYS` environment variable is not configured, authentication is skipped (development mode).

### Methods

**Option 1: X-API-Key Header**
```http
X-API-Key: your-secret-key
```

**Option 2: Authorization Bearer Token**
```http
Authorization: Bearer your-secret-key
```

### Configuration

Set API keys via environment variable:
```bash
API_KEYS=key1,key2,key3
```

### Error Responses

**401 Unauthorized** - Missing API key
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key required. Provide X-API-Key header or Authorization: Bearer <key>"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

**403 Forbidden** - Invalid API key
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Invalid API key"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

## Rate Limiting

Default: 100 requests per minute per API key (or IP if no API key)

**Configuration**:
```bash
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m  # 1m, 1h, 1d
```

**Rate Limit Exceeded Response** (429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

## Endpoints

### MCP Protocol Endpoints

MCP (Model Context Protocol) endpoints allow AI platforms like Dify to connect to databases directly via the MCP protocol.

#### SSE Endpoints (Legacy)

##### GET /sse

Establish an SSE connection. Database configuration is passed via URL parameters.

**URL Parameters**:
| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Database type |
| `host` | Yes* | Database host |
| `port` | No | Database port |
| `user` | Yes* | Username |
| `password` | Yes* | Password |
| `database` | Yes* | Database name |
| `filePath` | Yes* | SQLite file path |
| `allowWrite` | No | Enable write operations (default: false) |

*Required fields depend on database type

**Request Example**:
```bash
curl "http://localhost:3000/sse?type=mysql&host=localhost&port=3306&user=root&password=secret&database=mydb" \
  -H "X-API-Key: your-secret-key"
```

##### POST /sse/message

Send a message to an SSE session.

**Query Parameters**:
- `sessionId` (string, required): SSE session ID

**Request Example**:
```bash
curl -X POST "http://localhost:3000/sse/message?sessionId=your-session-id" \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

#### Streamable HTTP Endpoints (MCP 2025 Spec, Recommended)

##### POST /mcp

MCP Streamable HTTP endpoint. Database configuration is passed via headers.

**Header Parameters**:
| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes* | API key (or use Authorization Bearer) |
| `X-DB-Type` | Yes | Database type |
| `X-DB-Host` | Yes* | Database host |
| `X-DB-Port` | No | Database port |
| `X-DB-User` | Yes* | Username |
| `X-DB-Password` | Yes* | Password |
| `X-DB-Database` | Yes* | Database name |
| `X-DB-FilePath` | Yes* | SQLite file path |
| `X-DB-Allow-Write` | No | Enable write operations (default: false) |
| `mcp-session-id` | No | Session ID for subsequent requests |

*Required fields depend on database type; authentication required if API_KEYS is configured

**Initialize Request Example**:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -H "X-DB-Type: mysql" \
  -H "X-DB-Host: localhost" \
  -H "X-DB-Port: 3306" \
  -H "X-DB-User: root" \
  -H "X-DB-Password: secret" \
  -H "X-DB-Database: mydb" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}'
```

**Subsequent Request Example** (with session ID):
```bash
curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: your-session-id" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}'
```

##### GET /mcp

Get SSE stream for Streamable HTTP.

**Headers**:
- `mcp-session-id` (string, required): Session ID
- `X-API-Key` (string, required*): API key

##### DELETE /mcp

Close an MCP session.

**Query Parameters or Headers**:
- `sessionId` or `mcp-session-id`: Session ID

**Request Example**:
```bash
curl -X DELETE "http://localhost:3000/mcp?sessionId=your-session-id" \
  -H "X-API-Key: your-secret-key"
```

#### MCP Tools

The following tools are available after connecting via MCP protocol:

| Tool Name | Description |
|-----------|-------------|
| `execute_query` | Execute SQL queries or database commands |
| `get_schema` | Get database schema information |
| `get_table_info` | Get detailed information about a specific table |
| `clear_cache` | Clear schema cache |

### REST API Endpoints

### Health & Info

#### GET /api/health

Health check endpoint (no authentication required).

**Request**:
```bash
curl http://localhost:3000/api/health
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600.5,
    "timestamp": "2026-01-27T12:00:00.000Z"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### GET /api/info

Service information endpoint (no authentication required).

**Request**:
```bash
curl http://localhost:3000/api/info
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "name": "universal-db-mcp",
    "version": "1.0.0",
    "mode": "http",
    "supportedDatabases": [
      "mysql", "postgres", "redis", "oracle", "dm",
      "sqlserver", "mongodb", "sqlite", "kingbase",
      "gaussdb", "oceanbase", "tidb", "clickhouse",
      "polardb", "vastbase", "highgo", "goldendb"
    ]
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

### Connection Management

#### POST /api/connect

Connect to a database and create a session.

**Request Body**:
```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "your_password",
  "database": "mydb",
  "allowWrite": false
}
```

**Parameters**:
- `type` (string, required): Database type (mysql, postgres, redis, oracle, dm, sqlserver, mongodb, sqlite, kingbase, gaussdb, oceanbase, tidb, clickhouse, polardb, vastbase, highgo, goldendb)
- `host` (string, required for non-SQLite): Database host
- `port` (number, required for non-SQLite): Database port
- `user` (string, optional): Username
- `password` (string, optional): Password
- `database` (string, optional): Database name
- `filePath` (string, required for SQLite): SQLite database file path
- `authSource` (string, optional for MongoDB): Authentication database (default: admin)
- `allowWrite` (boolean, optional): Enable write operations (default: false)

**Request Example**:
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "password",
    "database": "testdb"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessionId": "V1StGXR8_Z5jdHi6B-myT",
    "databaseType": "mysql",
    "connected": true
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

**Error Response** (500):
```json
{
  "success": false,
  "error": {
    "code": "CONNECTION_FAILED",
    "message": "Access denied for user 'root'@'localhost'"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### POST /api/disconnect

Disconnect from a database and close the session.

**Request Body**:
```json
{
  "sessionId": "V1StGXR8_Z5jdHi6B-myT"
}
```

**Request Example**:
```bash
curl -X POST http://localhost:3000/api/disconnect \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "V1StGXR8_Z5jdHi6B-myT"}'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "disconnected": true
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

### Query Execution

#### POST /api/query

Execute a read query (SELECT, SHOW, DESCRIBE, etc.).

**Request Body**:
```json
{
  "sessionId": "V1StGXR8_Z5jdHi6B-myT",
  "query": "SELECT * FROM users WHERE id = ?",
  "params": [1]
}
```

**Parameters**:
- `sessionId` (string, required): Session ID from `/api/connect`
- `query` (string, required): SQL query or database command
- `params` (array, optional): Query parameters for parameterized queries

**Request Example**:
```bash
curl -X POST http://localhost:3000/api/query \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "V1StGXR8_Z5jdHi6B-myT",
    "query": "SELECT * FROM users LIMIT 10"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "rows": [
      {"id": 1, "name": "Alice", "email": "alice@example.com"},
      {"id": 2, "name": "Bob", "email": "bob@example.com"}
    ],
    "executionTime": 15,
    "metadata": {
      "fieldCount": 3
    }
  },
  "metadata": {
    "executionTime": 15,
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

**Error Response - Write Operation Blocked** (500):
```json
{
  "success": false,
  "error": {
    "code": "QUERY_FAILED",
    "message": "❌ 操作被拒绝：当前处于只读安全模式"
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### POST /api/execute

Execute a write operation (INSERT, UPDATE, DELETE, etc.). Requires `allowWrite: true` in connection config.

**Request Body**:
```json
{
  "sessionId": "V1StGXR8_Z5jdHi6B-myT",
  "query": "INSERT INTO users (name, email) VALUES (?, ?)",
  "params": ["Charlie", "charlie@example.com"]
}
```

**Request Example**:
```bash
curl -X POST http://localhost:3000/api/execute \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "V1StGXR8_Z5jdHi6B-myT",
    "query": "UPDATE users SET name = ? WHERE id = ?",
    "params": ["Alice Smith", 1]
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "rows": [],
    "affectedRows": 1,
    "executionTime": 8
  },
  "metadata": {
    "executionTime": 8,
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

### Schema Information

#### GET /api/tables

List all tables in the database.

**Query Parameters**:
- `sessionId` (string, required): Session ID from `/api/connect`

**Request Example**:
```bash
curl "http://localhost:3000/api/tables?sessionId=V1StGXR8_Z5jdHi6B-myT" \
  -H "X-API-Key: your-secret-key"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tables": ["users", "orders", "products", "categories"]
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### GET /api/schema

Get complete database schema.

**Query Parameters**:
- `sessionId` (string, required): Session ID from `/api/connect`

**Request Example**:
```bash
curl "http://localhost:3000/api/schema?sessionId=V1StGXR8_Z5jdHi6B-myT" \
  -H "X-API-Key: your-secret-key"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "type": "mysql",
    "name": "testdb",
    "version": "8.0.32",
    "tables": [
      {
        "name": "orders",
        "columns": [
          {
            "name": "id",
            "type": "int",
            "nullable": false,
            "default": null,
            "comment": "Order ID"
          },
          {
            "name": "user_id",
            "type": "int",
            "nullable": false,
            "default": null,
            "comment": "User ID"
          }
        ],
        "primaryKey": ["id"],
        "indexes": [
          {
            "name": "PRIMARY",
            "columns": ["id"],
            "unique": true
          }
        ],
        "foreignKeys": [
          {
            "name": "fk_orders_user",
            "columns": ["user_id"],
            "referencedTable": "users",
            "referencedColumns": ["id"],
            "onDelete": "CASCADE",
            "onUpdate": "NO ACTION"
          }
        ],
        "estimatedRows": 5000
      },
      {
        "name": "users",
        "columns": [
          {
            "name": "id",
            "type": "int",
            "nullable": false,
            "default": null,
            "comment": "User ID"
          },
          {
            "name": "name",
            "type": "varchar(255)",
            "nullable": false,
            "default": null,
            "comment": "User name"
          }
        ],
        "primaryKey": ["id"],
        "indexes": [
          {
            "name": "PRIMARY",
            "columns": ["id"],
            "unique": true
          }
        ],
        "estimatedRows": 1000
      }
    ],
    "relationships": [
      {
        "fromTable": "orders",
        "fromColumns": ["user_id"],
        "toTable": "users",
        "toColumns": ["id"],
        "type": "many-to-one",
        "constraintName": "fk_orders_user"
      }
    ]
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

#### GET /api/schema/:table

Get information about a specific table.

**Path Parameters**:
- `table` (string, required): Table name

**Query Parameters**:
- `sessionId` (string, required): Session ID from `/api/connect`

**Request Example**:
```bash
curl "http://localhost:3000/api/schema/users?sessionId=V1StGXR8_Z5jdHi6B-myT" \
  -H "X-API-Key: your-secret-key"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "name": "orders",
    "columns": [
      {
        "name": "id",
        "type": "int",
        "nullable": false,
        "default": null,
        "comment": "Order ID"
      },
      {
        "name": "user_id",
        "type": "int",
        "nullable": false,
        "default": null,
        "comment": "User ID"
      },
      {
        "name": "amount",
        "type": "decimal(10,2)",
        "nullable": false,
        "default": null,
        "comment": "Order amount"
      }
    ],
    "primaryKey": ["id"],
    "indexes": [
      {
        "name": "PRIMARY",
        "columns": ["id"],
        "unique": true
      },
      {
        "name": "idx_user_id",
        "columns": ["user_id"],
        "unique": false
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_orders_user",
        "columns": ["user_id"],
        "referencedTable": "users",
        "referencedColumns": ["id"],
        "onDelete": "CASCADE",
        "onUpdate": "NO ACTION"
      }
    ],
    "estimatedRows": 5000
  },
  "metadata": {
    "timestamp": "2026-01-27T12:00:00.000Z",
    "requestId": "abc123"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing API key |
| `FORBIDDEN` | 403 | Invalid API key |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `CONNECTION_FAILED` | 500 | Failed to connect to database |
| `DISCONNECTION_FAILED` | 500 | Failed to disconnect from database |
| `QUERY_FAILED` | 500 | Failed to execute query |
| `EXECUTE_FAILED` | 500 | Failed to execute operation |
| `LIST_TABLES_FAILED` | 500 | Failed to list tables |
| `GET_SCHEMA_FAILED` | 500 | Failed to get schema |
| `GET_TABLE_INFO_FAILED` | 500 | Failed to get table information |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Session Management

### Session Lifecycle

1. **Create**: Call `/api/connect` to create a session
2. **Use**: Use the `sessionId` in subsequent API calls
3. **Close**: Call `/api/disconnect` to close the session

### Session Timeout

Sessions automatically expire after inactivity (default: 1 hour).

**Configuration**:
```bash
SESSION_TIMEOUT=3600000  # 1 hour in milliseconds
SESSION_CLEANUP_INTERVAL=300000  # 5 minutes
```

### Session Cleanup

Expired sessions are automatically cleaned up every 5 minutes (configurable).

## Database-Specific Examples

### MySQL
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "password",
    "database": "mydb"
  }'
```

### PostgreSQL
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "password",
    "database": "mydb"
  }'
```

### Redis
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "redis",
    "host": "localhost",
    "port": 6379,
    "password": "password"
  }'
```

### MongoDB
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mongodb",
    "host": "localhost",
    "port": 27017,
    "user": "admin",
    "password": "password",
    "database": "mydb",
    "authSource": "admin"
  }'
```

### SQLite
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sqlite",
    "filePath": "/path/to/database.db",
    "allowWrite": false
  }'
```

## Best Practices

### Security

1. **Use Strong API Keys**: Generate cryptographically secure random keys
2. **Enable HTTPS**: Use reverse proxy (nginx, Caddy) for HTTPS in production
3. **Restrict CORS**: Set specific origins instead of `*`
4. **Read-Only by Default**: Only enable `allowWrite` when necessary
5. **Close Sessions**: Always call `/api/disconnect` when done

### Performance

1. **Reuse Sessions**: Keep sessions alive for multiple queries
2. **Use Parameterized Queries**: Prevent SQL injection and improve performance
3. **Limit Result Sets**: Use `LIMIT` clauses for large tables
4. **Monitor Rate Limits**: Implement exponential backoff for rate limit errors

### Error Handling

1. **Check `success` Field**: Always check the `success` field in responses
2. **Handle Rate Limits**: Implement retry logic with backoff
3. **Session Expiry**: Reconnect if session expires
4. **Log Request IDs**: Use `requestId` from metadata for debugging

## Complete Workflow Example

```bash
# 1. Connect to database
RESPONSE=$(curl -s -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "password",
    "database": "testdb"
  }')

# 2. Extract session ID
SESSION_ID=$(echo $RESPONSE | jq -r '.data.sessionId')

# 3. List tables
curl "http://localhost:3000/api/tables?sessionId=$SESSION_ID" \
  -H "X-API-Key: your-key"

# 4. Get table schema
curl "http://localhost:3000/api/schema/users?sessionId=$SESSION_ID" \
  -H "X-API-Key: your-key"

# 5. Execute query
curl -X POST http://localhost:3000/api/query \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"query\": \"SELECT * FROM users LIMIT 10\"
  }"

# 6. Disconnect
curl -X POST http://localhost:3000/api/disconnect \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\"}"
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Documentation: https://github.com/Anarkh-Lee/universal-db-mcp#readme
