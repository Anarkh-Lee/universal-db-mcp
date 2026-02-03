# Slack 集成指南

本指南展示如何通过 MCP Bot 将 Universal Database MCP Server 与 Slack 集成。

## 概述

Slack 是一个团队协作平台。通过 MCP Bot 集成 Universal Database MCP Server，您可以让团队成员直接在 Slack 频道中使用 REST API 查询和分析数据库数据。

## 前置要求

- 部署了 HTTP API 模式的 Universal Database MCP Server
- 具有管理员权限的 Slack 工作区
- 数据库实例（MySQL、PostgreSQL 等）

## 设置步骤

### 步骤 1: 部署 HTTP API 服务器

以 HTTP 模式部署 Universal Database MCP Server：

```bash
# 使用 npm
export MODE=http
export HTTP_PORT=3000
export API_KEYS=slack-bot-secret-key
export CORS_ORIGINS=*
npx universal-db-mcp

# 或使用 Docker
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=slack-bot-secret-key \
  -e CORS_ORIGINS=* \
  universal-db-mcp:latest
```

> **注意**：确保您的服务器可从互联网或 Slack Bot 的托管环境访问。

### 步骤 2: 创建 Slack App

1. 访问 [Slack API](https://api.slack.com/apps)
2. 点击"Create New App"
3. 选择"From scratch"
4. 输入 App 名称（例如："Database MCP Bot"）
5. 选择您的工作区
6. 点击"Create App"

### 步骤 3: 配置 Bot 权限

1. 在应用设置中，转到"OAuth & Permissions"
2. 在"Scopes" > "Bot Token Scopes"下，添加：
   - `app_mentions:read` - 读取 bot 的提及
   - `chat:write` - 发送消息
   - `commands` - 添加斜杠命令
   - `im:history` - 读取私信历史
   - `im:read` - 查看私信
   - `im:write` - 发送私信

3. 点击"Install to Workspace"
4. 复制"Bot User OAuth Token"（以 `xoxb-` 开头）

### 步骤 4: 配置斜杠命令

1. 在应用设置中转到"Slash Commands"
2. 点击"Create New Command"
3. 配置命令：

#### 命令 1: /db-connect

**命令**: `/db-connect`
**请求 URL**: `https://your-bot-server.com/slack/connect`
**简短描述**: 连接到数据库
**使用提示**: `[type] [host] [port] [user] [password] [database]`

#### 命令 2: /db-query

**命令**: `/db-query`
**请求 URL**: `https://your-bot-server.com/slack/query`
**简短描述**: 执行 SQL 查询
**使用提示**: `[SQL 查询]`

#### 命令 3: /db-schema

**命令**: `/db-schema`
**请求 URL**: `https://your-bot-server.com/slack/schema`
**简短描述**: 获取数据库结构
**使用提示**: `[表名（可选）]`

#### 命令 4: /db-disconnect

**命令**: `/db-disconnect`
**请求 URL**: `https://your-bot-server.com/slack/disconnect`
**简短描述**: 断开数据库连接

### 步骤 5: 创建 Slack Bot 服务器

创建一个处理 Slack 命令并调用 MCP REST API 的 bot 服务器。

**Node.js Bot 服务器示例**：

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const MCP_API_URL = 'http://localhost:3000';
const MCP_API_KEY = 'slack-bot-secret-key';

// 为每个 Slack 用户存储会话
const userSessions = new Map();

// 连接数据库
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
        text: `成功连接到 ${type} 数据库！`
      });
    } else {
      res.json({
        response_type: 'ephemeral',
        text: `连接失败: ${response.data.error.message}`
      });
    }
  } catch (error) {
    res.json({
      response_type: 'ephemeral',
      text: `错误: ${error.message}`
    });
  }
});

// 执行查询
app.post('/slack/query', async (req, res) => {
  const { user_id, text } = req.body;
  const sessionId = userSessions.get(user_id);

  if (!sessionId) {
    return res.json({
      response_type: 'ephemeral',
      text: '未连接。请先使用 /db-connect。'
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
        text: `查询执行成功！\n\`\`\`${formattedResult}\`\`\``
      });
    } else {
      res.json({
        response_type: 'ephemeral',
        text: `查询失败: ${response.data.error.message}`
      });
    }
  } catch (error) {
    res.json({
      response_type: 'ephemeral',
      text: `错误: ${error.message}`
    });
  }
});

// 获取结构
app.post('/slack/schema', async (req, res) => {
  const { user_id, text } = req.body;
  const sessionId = userSessions.get(user_id);

  if (!sessionId) {
    return res.json({
      response_type: 'ephemeral',
      text: '未连接。请先使用 /db-connect。'
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
        text: `数据库结构:\n\`\`\`${schema}\`\`\``
      });
    } else {
      res.json({
        response_type: 'ephemeral',
        text: `获取结构失败: ${response.data.error.message}`
      });
    }
  } catch (error) {
    res.json({
      response_type: 'ephemeral',
      text: `错误: ${error.message}`
    });
  }
});

// 断开连接
app.post('/slack/disconnect', async (req, res) => {
  const { user_id } = req.body;
  const sessionId = userSessions.get(user_id);

  if (!sessionId) {
    return res.json({
      response_type: 'ephemeral',
      text: '未连接。'
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
      text: '已成功断开连接。'
    });
  } catch (error) {
    res.json({
      response_type: 'ephemeral',
      text: `错误: ${error.message}`
    });
  }
});

function formatQueryResult(rows) {
  if (!rows || rows.length === 0) return '无结果';

  const headers = Object.keys(rows[0]);
  const headerRow = headers.join(' | ');
  const separator = headers.map(() => '---').join(' | ');
  const dataRows = rows.slice(0, 10).map(row =>
    headers.map(h => String(row[h] ?? '')).join(' | ')
  ).join('\n');

  let result = `${headerRow}\n${separator}\n${dataRows}`;
  if (rows.length > 10) {
    result += `\n... 还有 ${rows.length - 10} 行`;
  }
  return result;
}

app.listen(3001, () => {
  console.log('Slack Bot 服务器运行在端口 3001');
});
```

## REST API 端点

MCP Server 为 Slack Bot 集成提供以下 REST API 端点：

### POST /api/connect

连接到数据库。

**请求**:
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

**响应**:
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

执行 SQL 查询。

**请求**:
```json
{
  "sessionId": "abc123",
  "query": "SELECT * FROM users LIMIT 10"
}
```

**响应**:
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

获取数据库结构信息。

**请求**:
```
GET /api/schema?sessionId=abc123
GET /api/schema/users?sessionId=abc123
```

**响应**:
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

断开数据库连接。

**请求**:
```json
{
  "sessionId": "abc123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "disconnected": true
  }
}
```

## 使用示例

### 示例 1: 基本查询工作流

```
用户: /db-connect mysql db.example.com 3306 admin password mydb
Bot: 成功连接到 mysql 数据库！

用户: /db-schema
Bot: 数据库结构:
     tables: users, orders, products

用户: /db-query SELECT * FROM users LIMIT 5
Bot: 查询执行成功！
     id | name  | email
     ---|-------|-------------------
     1  | 张三  | zhang@example.com
     2  | 李四  | li@example.com
     ...

用户: /db-disconnect
Bot: 已成功断开连接。
```

### 示例 2: 数据分析

```
用户: /db-connect postgres analytics.example.com 5432 analyst pass analytics_db
Bot: 成功连接到 postgres 数据库！

用户: /db-query SELECT COUNT(*) as total_orders, SUM(amount) as revenue FROM orders WHERE created_at >= '2024-01-01'
Bot: 查询执行成功！
     total_orders | revenue
     -------------|----------
     1234         | 56789.00

用户: /db-query SELECT product_name, COUNT(*) as sales FROM order_items GROUP BY product_name ORDER BY sales DESC LIMIT 5
Bot: 查询执行成功！
     product_name | sales
     -------------|------
     产品 A       | 500
     产品 B       | 350
     ...
```

### 示例 3: 结构探索

```
用户: /db-schema users
Bot: 数据库结构:
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

## 高级功能

### 使用 Block Kit 的交互式消息

使用 Slack Block Kit 增强 bot 响应：

```javascript
app.post('/slack/query', async (req, res) => {
  // ... 查询执行 ...

  res.json({
    response_type: 'in_channel',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '查询结果'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*查询:* \`${text}\``
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
            text: `执行时间: ${executionTime}ms | 行数: ${rowCount}`
          }
        ]
      }
    ]
  });
});
```

### 定时报告

向 Slack 频道发送定时数据库报告：

```javascript
const cron = require('node-cron');

// 每天早上 9 点的报告
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
    text: '每日销售报告',
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

### 告警通知

向 Slack 发送数据库告警：

```javascript
async function checkDatabaseAlerts() {
  const sessionId = await connectToDatabase();

  // 检查异常
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
      text: `:warning: 检测到高错误率: 过去一小时有 ${errorCount} 个错误！`
    }, {
      headers: {
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  }

  await disconnectFromDatabase(sessionId);
}

// 每 5 分钟检查一次
setInterval(checkDatabaseAlerts, 5 * 60 * 1000);
```

## 最佳实践

### 1. 安全性

- 安全存储数据库凭据（使用环境变量或密钥管理器）
- 对查询操作使用只读数据库用户
- 执行前验证和清理 SQL 查询
- 对敏感环境实施查询白名单
- 对敏感数据使用临时消息

### 2. 性能

- 为查询添加 LIMIT 以防止大结果集
- 实现查询超时
- 缓存频繁访问的结构信息
- 对高流量 bot 使用连接池

### 3. 用户体验

- 提供清晰的错误消息
- 以可读的表格格式化查询结果
- 显示执行时间和行数
- 对大结果实现分页
- 使用 Slack Block Kit 进行丰富的格式化

### 4. 错误处理

- 优雅地处理连接超时
- 对瞬时故障实现重试逻辑
- 记录错误以便调试
- 用可操作的消息通知用户失败

## 故障排除

### 问题：连接超时

**症状**：Bot 无法连接到数据库

**解决方案**：
1. 验证数据库主机可从 bot 服务器访问
2. 检查防火墙规则
3. 增加连接超时时间
4. 验证数据库凭据

### 问题：查询超时

**症状**：查询耗时过长并超时

**解决方案**：
1. 为查询添加 LIMIT
2. 优化 SQL 查询
3. 为频繁查询的列添加索引
4. 增加查询超时设置

### 问题：大结果集

**症状**：Bot 崩溃或 Slack 消息过长

**解决方案**：
1. 将结果限制为 10-20 行
2. 实现分页
3. 对大型导出使用文件上传
4. 汇总数据而不是显示所有行

### 问题：会话过期

**症状**：查询失败，提示会话未找到

**解决方案**：
1. 实现自动重连
2. 增加 MCP 服务器上的会话超时时间
3. 持久化存储会话状态
4. 提示用户重新连接

## 资源

- [Slack API 文档](https://api.slack.com/)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [API 参考](../http-api/API_REFERENCE.zh-CN.md)
- [部署指南](../http-api/DEPLOYMENT.zh-CN.md)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Slack 社区: https://slack.com/community
