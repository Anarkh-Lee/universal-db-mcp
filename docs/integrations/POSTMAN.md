# Postman Integration Guide

This guide shows how to test Universal Database MCP Server REST API with Postman.

## Overview

[Postman](https://postman.com/) is a popular API testing platform. You can use it to test the REST API endpoints of Universal Database MCP Server.

## Prerequisites

- Postman installed ([Download here](https://postman.com/downloads/))
- Universal Database MCP Server deployed in HTTP mode
- Database instance

## Setup

### Step 1: Deploy HTTP API Server

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=postman-test-key \
  universal-db-mcp:latest
```

### Step 2: Create Postman Collection

1. Open Postman
2. Create a new Collection: "Universal DB MCP"
3. Add environment variable: `API_KEY` = `postman-test-key`

### Step 3: Configure Authentication

In Collection settings, add:
- Header: `X-API-Key`
- Value: `{{API_KEY}}`

## API Endpoints

### Connect to Database

**POST** `/api/connect`

```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "your_password",
  "database": "your_database"
}
```

### Execute Query

**POST** `/api/query`

```json
{
  "sessionId": "{{sessionId}}",
  "query": "SELECT * FROM users LIMIT 10"
}
```

### Get Schema

**GET** `/api/schema?sessionId={{sessionId}}`

### Get Table Info

**GET** `/api/schema/users?sessionId={{sessionId}}`

### Disconnect

**POST** `/api/disconnect`

```json
{
  "sessionId": "{{sessionId}}"
}
```

## Testing Workflow

1. **Connect**: Call `/api/connect`, save `sessionId`
2. **Query**: Use `sessionId` to execute queries
3. **Explore**: Get schema and table info
4. **Disconnect**: Close the session

## Resources

- [Postman Documentation](https://learning.postman.com/)
- [API Reference](../http-api/API_REFERENCE.md)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
