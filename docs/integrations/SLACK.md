# Slack Integration Guide

This guide shows how to integrate Universal Database MCP Server with Slack through an MCP Bot.

## Overview

Slack is a team collaboration platform. By integrating Universal Database MCP Server via an MCP Bot, you can enable your team to query and analyze database data directly from Slack channels using REST API.

## Prerequisites

- Universal Database MCP Server deployed with HTTP API mode
- Slack workspace with admin permissions
- Database instance (MySQL, PostgreSQL, etc.)

## Setup Steps

### Step 1: Deploy HTTP API Server

Deploy Universal Database MCP Server in HTTP mode:

```bash
# Using npm
export MODE=http
export HTTP_PORT=3000
export API_KEYS=slack-bot-secret-key
export CORS_ORIGINS=*
npx universal-db-mcp

# Or using Docker
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=slack-bot-secret-key \
  -e CORS_ORIGINS=* \
  universal-db-mcp:latest
```

> **Note**: Ensure your server is accessible from the internet or your Slack Bot's hosting environment.

### Step 2: Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App"
3. Select "From scratch"
4. Enter App Name (e.g., "Database MCP Bot")
5. Select your workspace
6. Click "Create App"

### Step 3: Configure Bot Permissions

1. In the app settings, go to "OAuth & Permissions"
2. Under "Scopes" > "Bot Token Scopes", add:
   - `app_mentions:read` - Read mentions of the bot
   - `chat:write` - Send messages
   - `commands` - Add slash commands
   - `im:history` - Read direct messages
   - `im:read` - View direct messages
   - `im:write` - Send direct messages

3. Click "Install to Workspace"
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### Step 4: Configure Slash Commands

1. Go to "Slash Commands" in app settings
2. Click "Create New Command"
3. Configure commands:

#### Command 1: /db-connect

**Command**: `/db-connect`
**Request URL**: `https://your-bot-server.com/slack/connect`
**Short Description**: Connect to a database
**Usage Hint**: `[type] [host] [port] [user] [password] [database]`

#### Command 2: /db-query

**Command**: `/db-query`
**Request URL**: `https://your-bot-server.com/slack/query`
**Short Description**: Execute SQL query
**Usage Hint**: `[SQL query]`

#### Command 3: /db-schema

**Command**: `/db-schema`
**Request URL**: `https://your-bot-server.com/slack/schema`
**Short Description**: Get database schema
**Usage Hint**: `[table_name (optional)]`

#### Command 4: /db-disconnect

**Command**: `/db-disconnect`
**Request URL**: `https://your-bot-server.com/slack/disconnect`
**Short Description**: Disconnect from database

### Step 5: Create Slack Bot Server

Create a bot server that handles Slack commands and calls the MCP REST API.

**Example Node.js Bot Server**:

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const MCP_API_URL = 'http://localhost:3000';
const MCP_API_KEY = 'slack-bot-secret-key';

// Store sessions per Slack user
const userSessions = new Map();

// Connect to database
app.post('/slack/connect', async (req, res) => {
  const { user_id, text } = req.body;
  const [type, host, port, user, password, database] = text.split(' ');

  try {
    const response = await axios.post(`${MCP_API_URL}/api/connect`, {
      type,
      host,
      port: parseInt(port),
      user,
      password,
      database
    }, {
      headers: { 'X-API-Key': MCP_API_KEY }
    });

    if (response.data.success) {
      userSessions.set(user_id, response.data.data.sessionId);
      res.json({
        response_type: 'ephemeral',
        text: `Connected to ${type} database successfully!`
      });
    } else {
      res.json({
        response_type: 'ephemeral',
        text: `Connection failed: ${response.data.error.message}`
      });
    }
  } catch (error) {
    res.json({
      response_type: 'ephemeral',
      text: `Error: ${error.message}`
    });
  }
});

// Execute query
app.post('/slack/query', async (req, res) => {
  const { user_id, text } = req.body;
  const sessionId = userSessions.get(user_id);

  if (!sessionId) {
    return res.json({
      response_type: 'ephemeral',
      text: 'Not connected. Use /db-connect first.'
    });
  }

  try {
    const response = await axios.post(`${MCP_API_URL}/api/query`, {
      sessionId,
      query: text
    }, {
      headers: { 'X-API-Key': MCP_API_KEY }
    });

    if (response.data.success) {
      const rows = response.data.data.rows;
      const formattedResult = formatQueryResult(rows);
      res.json({
        response_type: 'in_channel',
        text: `Query executed successfully!\n\`\`\`${formattedResult}\`\`\``
      });
    } else {
      res.json({
        response_type: 'ephemeral',
        text: `Query failed: ${response.data.error.message}`
      });
    }
  } catch (error) {
    res.json({
      response_type: 'ephemeral',
      text: `Error: ${error.message}`
    });
  }
});

// Get schema
app.post('/slack/schema', async (req, res) => {
  const { user_id, text } = req.body;
  const sessionId = userSessions.get(user_id);

  if (!sessionId) {
    return res.json({
      response_type: 'ephemeral',
      text: 'Not connected. Use /db-connect first.'
    });
  }

  try {
    const url = text
      ? `${MCP_API_URL}/api/schema/${text}?sessionId=${sessionId}`
      : `${MCP_API_URL}/api/schema?sessionId=${sessionId}`;

    const response = await axios.get(url, {
      headers: { 'X-API-Key': MCP_API_KEY }
    });

    if (response.data.success) {
      const schema = JSON.stringify(response.data.data, null, 2);
      res.json({
        response_type: 'ephemeral',
        text: `Database Schema:\n\`\`\`${schema}\`\`\``
      });
    } else {
      res.json({
        response_type: 'ephemeral',
        text: `Failed to get schema: ${response.data.error.message}`
      });
    }
  } catch (error) {
    res.json({
      response_type: 'ephemeral',
      text: `Error: ${error.message}`
    });
  }
});

// Disconnect
app.post('/slack/disconnect', async (req, res) => {
  const { user_id } = req.body;
  const sessionId = userSessions.get(user_id);

  if (!sessionId) {
    return res.json({
      response_type: 'ephemeral',
      text: 'Not connected.'
    });
  }

  try {
    await axios.post(`${MCP_API_URL}/api/disconnect`, {
      sessionId
    }, {
      headers: { 'X-API-Key': MCP_API_KEY }
    });

    userSessions.delete(user_id);
    res.json({
      response_type: 'ephemeral',
      text: 'Disconnected successfully.'
    });
  } catch (error) {
    res.json({
      response_type: 'ephemeral',
      text: `Error: ${error.message}`
    });
  }
});

function formatQueryResult(rows) {
  if (!rows || rows.length === 0) return 'No results';

  const headers = Object.keys(rows[0]);
  const headerRow = headers.join(' | ');
  const separator = headers.map(() => '---').join(' | ');
  const dataRows = rows.slice(0, 10).map(row =>
    headers.map(h => String(row[h] ?? '')).join(' | ')
  ).join('\n');

  let result = `${headerRow}\n${separator}\n${dataRows}`;
  if (rows.length > 10) {
    result += `\n... and ${rows.length - 10} more rows`;
  }
  return result;
}

app.listen(3001, () => {
  console.log('Slack Bot Server running on port 3001');
});
```

## REST API Endpoints

The MCP Server provides the following REST API endpoints for Slack Bot integration:

### POST /api/connect

Connect to a database.

**Request**:
```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "password",
  "database": "mydb"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123",
    "databaseType": "mysql",
    "connected": true
  }
}
```

### POST /api/query

Execute a SQL query.

**Request**:
```json
{
  "sessionId": "abc123",
  "query": "SELECT * FROM users LIMIT 10"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "rows": [...],
    "rowCount": 10,
    "executionTime": 15
  }
}
```

### GET /api/schema

Get database schema information.

**Request**:
```
GET /api/schema?sessionId=abc123
GET /api/schema/users?sessionId=abc123
```

**Response**:
```json
{
  "success": true,
  "data": {
    "tables": ["users", "orders", "products"],
    "schema": {...}
  }
}
```

### POST /api/disconnect

Disconnect from database.

**Request**:
```json
{
  "sessionId": "abc123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "disconnected": true
  }
}
```

## Usage Examples

### Example 1: Basic Query Workflow

```
User: /db-connect mysql db.example.com 3306 admin password mydb
Bot: Connected to mysql database successfully!

User: /db-schema
Bot: Database Schema:
     tables: users, orders, products

User: /db-query SELECT * FROM users LIMIT 5
Bot: Query executed successfully!
     id | name  | email
     ---|-------|-------------------
     1  | Alice | alice@example.com
     2  | Bob   | bob@example.com
     ...

User: /db-disconnect
Bot: Disconnected successfully.
```

### Example 2: Data Analysis

```
User: /db-connect postgres analytics.example.com 5432 analyst pass analytics_db
Bot: Connected to postgres database successfully!

User: /db-query SELECT COUNT(*) as total_orders, SUM(amount) as revenue FROM orders WHERE created_at >= '2024-01-01'
Bot: Query executed successfully!
     total_orders | revenue
     -------------|----------
     1234         | 56789.00

User: /db-query SELECT product_name, COUNT(*) as sales FROM order_items GROUP BY product_name ORDER BY sales DESC LIMIT 5
Bot: Query executed successfully!
     product_name | sales
     -------------|------
     Widget A     | 500
     Widget B     | 350
     ...
```

### Example 3: Schema Exploration

```
User: /db-schema users
Bot: Database Schema:
     {
       "table": "users",
       "columns": [
         {"name": "id", "type": "int", "nullable": false},
         {"name": "name", "type": "varchar(255)", "nullable": false},
         {"name": "email", "type": "varchar(255)", "nullable": false},
         {"name": "created_at", "type": "timestamp", "nullable": true}
       ],
       "primaryKey": "id",
       "indexes": ["idx_email"]
     }
```

## Advanced Features

### Interactive Messages with Block Kit

Enhance bot responses with Slack Block Kit:

```javascript
app.post('/slack/query', async (req, res) => {
  // ... query execution ...

  res.json({
    response_type: 'in_channel',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Query Results'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Query:* \`${text}\``
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${formattedResult}\`\`\``
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Execution time: ${executionTime}ms | Rows: ${rowCount}`
          }
        ]
      }
    ]
  });
});
```

### Modal Dialogs for Complex Queries

Use Slack modals for complex query input:

```javascript
app.post('/slack/query-modal', async (req, res) => {
  const { trigger_id } = req.body;

  await axios.post('https://slack.com/api/views.open', {
    trigger_id,
    view: {
      type: 'modal',
      callback_id: 'query_modal',
      title: {
        type: 'plain_text',
        text: 'Execute Query'
      },
      blocks: [
        {
          type: 'input',
          block_id: 'query_block',
          element: {
            type: 'plain_text_input',
            action_id: 'query_input',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'Enter your SQL query...'
            }
          },
          label: {
            type: 'plain_text',
            text: 'SQL Query'
          }
        }
      ],
      submit: {
        type: 'plain_text',
        text: 'Execute'
      }
    }
  }, {
    headers: {
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  res.status(200).send();
});
```

### Scheduled Reports

Send scheduled database reports to Slack channels:

```javascript
const cron = require('node-cron');

// Daily report at 9 AM
cron.schedule('0 9 * * *', async () => {
  const sessionId = await connectToDatabase();

  const result = await axios.post(`${MCP_API_URL}/api/query`, {
    sessionId,
    query: `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(amount) as revenue
      FROM orders
      WHERE created_at >= CURDATE() - INTERVAL 7 DAY
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `
  }, {
    headers: { 'X-API-Key': MCP_API_KEY }
  });

  await axios.post('https://slack.com/api/chat.postMessage', {
    channel: '#daily-reports',
    text: 'Daily Sales Report',
    blocks: formatReportBlocks(result.data.data.rows)
  }, {
    headers: {
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  await disconnectFromDatabase(sessionId);
});
```

### Alert Notifications

Send database alerts to Slack:

```javascript
async function checkDatabaseAlerts() {
  const sessionId = await connectToDatabase();

  // Check for anomalies
  const result = await axios.post(`${MCP_API_URL}/api/query`, {
    sessionId,
    query: `
      SELECT COUNT(*) as error_count
      FROM logs
      WHERE level = 'ERROR'
      AND created_at >= NOW() - INTERVAL 1 HOUR
    `
  }, {
    headers: { 'X-API-Key': MCP_API_KEY }
  });

  const errorCount = result.data.data.rows[0].error_count;

  if (errorCount > 100) {
    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: '#alerts',
      text: `:warning: High error rate detected: ${errorCount} errors in the last hour!`
    }, {
      headers: {
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  }

  await disconnectFromDatabase(sessionId);
}

// Check every 5 minutes
setInterval(checkDatabaseAlerts, 5 * 60 * 1000);
```

## Best Practices

### 1. Security

- Store database credentials securely (use environment variables or secrets manager)
- Use read-only database users for query operations
- Validate and sanitize SQL queries before execution
- Implement query whitelisting for sensitive environments
- Use ephemeral messages for sensitive data

### 2. Performance

- Add LIMIT to queries to prevent large result sets
- Implement query timeout
- Cache frequently accessed schema information
- Use connection pooling for high-traffic bots

### 3. User Experience

- Provide clear error messages
- Format query results in readable tables
- Show execution time and row count
- Implement pagination for large results
- Use Slack Block Kit for rich formatting

### 4. Error Handling

- Handle connection timeouts gracefully
- Implement retry logic for transient failures
- Log errors for debugging
- Notify users of failures with actionable messages

## Troubleshooting

### Issue: Connection Timeout

**Symptoms**: Bot fails to connect to database

**Solutions**:
1. Verify database host is accessible from bot server
2. Check firewall rules
3. Increase connection timeout
4. Verify database credentials

### Issue: Query Timeout

**Symptoms**: Queries take too long and timeout

**Solutions**:
1. Add LIMIT to queries
2. Optimize SQL queries
3. Add indexes to frequently queried columns
4. Increase query timeout setting

### Issue: Large Result Sets

**Symptoms**: Bot crashes or Slack message too long

**Solutions**:
1. Limit results to 10-20 rows
2. Implement pagination
3. Use file upload for large exports
4. Summarize data instead of showing all rows

### Issue: Session Expired

**Symptoms**: Queries fail with session not found

**Solutions**:
1. Implement automatic reconnection
2. Increase session timeout on MCP server
3. Store session state persistently
4. Prompt user to reconnect

## Resources

- [Slack API Documentation](https://api.slack.com/)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [API Reference](../http-api/API_REFERENCE.md)
- [Deployment Guide](../http-api/DEPLOYMENT.md)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Slack Community: https://slack.com/community
