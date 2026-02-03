# Discord 集成指南

本指南展示如何通过机器人将 Universal Database MCP Server 与 Discord 集成。

## 概述

Discord 是一个流行的通讯平台。通过创建一个连接到 Universal Database MCP Server REST API 的 Discord 机器人，您可以直接从 Discord 频道进行数据库查询。

## 前置要求

- 部署了 HTTP API 模式的 Universal Database MCP Server
- 具有机器人创建权限的 Discord 账号
- Node.js 20.0.0 或更高版本
- 数据库实例（MySQL、PostgreSQL 等）

## 设置步骤

### 步骤 1：部署 HTTP API 服务器

以 HTTP 模式部署 Universal Database MCP Server：

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=discord-bot-secret-key \
  -e CORS_ORIGINS=* \
  universal-db-mcp:latest
```

### 步骤 2：创建 Discord 应用

1. 访问 [Discord 开发者门户](https://discord.com/developers/applications)
2. 点击"New Application"
3. 输入应用名称（例如："Database Bot"）
4. 转到"Bot"部分
5. 点击"Add Bot"
6. 复制机器人令牌

### 步骤 3：配置机器人权限

1. 转到"OAuth2" > "URL Generator"
2. 选择范围：`bot`、`applications.commands`
3. 选择机器人权限：
   - Send Messages
   - Read Message History
   - Use Slash Commands
4. 复制生成的 URL 并邀请机器人到您的服务器

### 步骤 4：创建机器人服务器

```javascript
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const MCP_API_URL = 'http://localhost:3000';
const MCP_API_KEY = 'discord-bot-secret-key';
const DISCORD_TOKEN = 'your-discord-bot-token';
const CLIENT_ID = 'your-client-id';

// 为每个用户存储会话
const userSessions = new Map();

// 注册斜杠命令
const commands = [
  new SlashCommandBuilder()
    .setName('db-connect')
    .setDescription('连接到数据库')
    .addStringOption(opt => opt.setName('type').setDescription('数据库类型').setRequired(true))
    .addStringOption(opt => opt.setName('host').setDescription('主机').setRequired(true))
    .addIntegerOption(opt => opt.setName('port').setDescription('端口').setRequired(true))
    .addStringOption(opt => opt.setName('user').setDescription('用户名').setRequired(true))
    .addStringOption(opt => opt.setName('password').setDescription('密码').setRequired(true))
    .addStringOption(opt => opt.setName('database').setDescription('数据库名').setRequired(true)),
  new SlashCommandBuilder()
    .setName('db-query')
    .setDescription('执行 SQL 查询')
    .addStringOption(opt => opt.setName('sql').setDescription('SQL 查询').setRequired(true)),
  new SlashCommandBuilder()
    .setName('db-schema')
    .setDescription('获取数据库结构')
    .addStringOption(opt => opt.setName('table').setDescription('表名（可选）')),
  new SlashCommandBuilder()
    .setName('db-disconnect')
    .setDescription('断开数据库连接')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// 注册命令
(async () => {
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id;

  if (interaction.commandName === 'db-connect') {
    await interaction.deferReply({ ephemeral: true });

    try {
      const response = await axios.post(`${MCP_API_URL}/api/connect`, {
        type: interaction.options.getString('type'),
        host: interaction.options.getString('host'),
        port: interaction.options.getInteger('port'),
        user: interaction.options.getString('user'),
        password: interaction.options.getString('password'),
        database: interaction.options.getString('database')
      }, {
        headers: { 'X-API-Key': MCP_API_KEY }
      });

      if (response.data.success) {
        userSessions.set(userId, response.data.data.sessionId);
        await interaction.editReply('成功连接到数据库！');
      } else {
        await interaction.editReply(`连接失败: ${response.data.error.message}`);
      }
    } catch (error) {
      await interaction.editReply(`错误: ${error.message}`);
    }
  }

  if (interaction.commandName === 'db-query') {
    const sessionId = userSessions.get(userId);
    if (!sessionId) {
      return interaction.reply({ content: '未连接。请先使用 /db-connect。', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      const response = await axios.post(`${MCP_API_URL}/api/query`, {
        sessionId,
        query: interaction.options.getString('sql')
      }, {
        headers: { 'X-API-Key': MCP_API_KEY }
      });

      if (response.data.success) {
        const rows = response.data.data.rows;
        const result = formatResult(rows);
        await interaction.editReply(`\`\`\`\n${result}\n\`\`\``);
      } else {
        await interaction.editReply(`查询失败: ${response.data.error.message}`);
      }
    } catch (error) {
      await interaction.editReply(`错误: ${error.message}`);
    }
  }

  if (interaction.commandName === 'db-schema') {
    const sessionId = userSessions.get(userId);
    if (!sessionId) {
      return interaction.reply({ content: '未连接。请先使用 /db-connect。', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const table = interaction.options.getString('table');
      const url = table
        ? `${MCP_API_URL}/api/schema/${table}?sessionId=${sessionId}`
        : `${MCP_API_URL}/api/schema?sessionId=${sessionId}`;

      const response = await axios.get(url, {
        headers: { 'X-API-Key': MCP_API_KEY }
      });

      if (response.data.success) {
        const schema = JSON.stringify(response.data.data, null, 2);
        await interaction.editReply(`\`\`\`json\n${schema.slice(0, 1900)}\n\`\`\``);
      } else {
        await interaction.editReply(`失败: ${response.data.error.message}`);
      }
    } catch (error) {
      await interaction.editReply(`错误: ${error.message}`);
    }
  }

  if (interaction.commandName === 'db-disconnect') {
    const sessionId = userSessions.get(userId);
    if (!sessionId) {
      return interaction.reply({ content: '未连接。', ephemeral: true });
    }

    try {
      await axios.post(`${MCP_API_URL}/api/disconnect`, { sessionId }, {
        headers: { 'X-API-Key': MCP_API_KEY }
      });
      userSessions.delete(userId);
      await interaction.reply({ content: '已成功断开连接。', ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: `错误: ${error.message}`, ephemeral: true });
    }
  }
});

function formatResult(rows) {
  if (!rows || rows.length === 0) return '无结果';
  const headers = Object.keys(rows[0]);
  const headerRow = headers.join(' | ');
  const separator = headers.map(() => '---').join(' | ');
  const dataRows = rows.slice(0, 10).map(row =>
    headers.map(h => String(row[h] ?? '')).join(' | ')
  ).join('\n');
  let result = `${headerRow}\n${separator}\n${dataRows}`;
  if (rows.length > 10) result += `\n... 还有 ${rows.length - 10} 行`;
  return result;
}

client.login(DISCORD_TOKEN);
```

## 使用示例

```
/db-connect type:mysql host:localhost port:3306 user:root password:xxx database:mydb
Bot: 成功连接到数据库！

/db-query sql:SELECT * FROM users LIMIT 5
Bot:
id | name  | email
---|-------|-------------------
1  | 张三  | zhang@example.com
2  | 李四  | li@example.com

/db-schema table:users
Bot: {
  "table": "users",
  "columns": [...]
}

/db-disconnect
Bot: 已成功断开连接。
```

## 最佳实践

1. **安全性**：对敏感数据使用临时回复
2. **权限**：将机器人命令限制在特定频道/角色
3. **速率限制**：实现速率限制以防止滥用
4. **错误处理**：提供清晰的错误消息

## 资源

- [Discord.js 文档](https://discord.js.org/)
- [Discord 开发者门户](https://discord.com/developers)
- [API 参考](../http-api/API_REFERENCE.zh-CN.md)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
