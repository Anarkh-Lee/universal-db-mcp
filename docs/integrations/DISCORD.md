# Discord Integration Guide

This guide shows how to integrate Universal Database MCP Server with Discord through a bot.

## Overview

Discord is a popular communication platform. By creating a Discord bot that connects to Universal Database MCP Server via REST API, you can enable database queries directly from Discord channels.

## Prerequisites

- Universal Database MCP Server deployed with HTTP API mode
- Discord account with bot creation permissions
- Node.js 20.0.0 or later
- Database instance (MySQL, PostgreSQL, etc.)

## Setup Steps

### Step 1: Deploy HTTP API Server

Deploy Universal Database MCP Server in HTTP mode:

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

### Step 2: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Enter application name (e.g., "Database Bot")
4. Go to "Bot" section
5. Click "Add Bot"
6. Copy the bot token

### Step 3: Configure Bot Permissions

1. Go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Read Message History
   - Use Slash Commands
4. Copy the generated URL and invite bot to your server

### Step 4: Create Bot Server

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

// Store sessions per user
const userSessions = new Map();

// Register slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('db-connect')
    .setDescription('Connect to a database')
    .addStringOption(opt => opt.setName('type').setDescription('Database type').setRequired(true))
    .addStringOption(opt => opt.setName('host').setDescription('Host').setRequired(true))
    .addIntegerOption(opt => opt.setName('port').setDescription('Port').setRequired(true))
    .addStringOption(opt => opt.setName('user').setDescription('Username').setRequired(true))
    .addStringOption(opt => opt.setName('password').setDescription('Password').setRequired(true))
    .addStringOption(opt => opt.setName('database').setDescription('Database name').setRequired(true)),
  new SlashCommandBuilder()
    .setName('db-query')
    .setDescription('Execute SQL query')
    .addStringOption(opt => opt.setName('sql').setDescription('SQL query').setRequired(true)),
  new SlashCommandBuilder()
    .setName('db-schema')
    .setDescription('Get database schema')
    .addStringOption(opt => opt.setName('table').setDescription('Table name (optional)')),
  new SlashCommandBuilder()
    .setName('db-disconnect')
    .setDescription('Disconnect from database')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// Register commands
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
        await interaction.editReply('Connected to database successfully!');
      } else {
        await interaction.editReply(`Connection failed: ${response.data.error.message}`);
      }
    } catch (error) {
      await interaction.editReply(`Error: ${error.message}`);
    }
  }

  if (interaction.commandName === 'db-query') {
    const sessionId = userSessions.get(userId);
    if (!sessionId) {
      return interaction.reply({ content: 'Not connected. Use /db-connect first.', ephemeral: true });
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
        await interaction.editReply(`Query failed: ${response.data.error.message}`);
      }
    } catch (error) {
      await interaction.editReply(`Error: ${error.message}`);
    }
  }

  if (interaction.commandName === 'db-schema') {
    const sessionId = userSessions.get(userId);
    if (!sessionId) {
      return interaction.reply({ content: 'Not connected. Use /db-connect first.', ephemeral: true });
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
        await interaction.editReply(`Failed: ${response.data.error.message}`);
      }
    } catch (error) {
      await interaction.editReply(`Error: ${error.message}`);
    }
  }

  if (interaction.commandName === 'db-disconnect') {
    const sessionId = userSessions.get(userId);
    if (!sessionId) {
      return interaction.reply({ content: 'Not connected.', ephemeral: true });
    }

    try {
      await axios.post(`${MCP_API_URL}/api/disconnect`, { sessionId }, {
        headers: { 'X-API-Key': MCP_API_KEY }
      });
      userSessions.delete(userId);
      await interaction.reply({ content: 'Disconnected successfully.', ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
    }
  }
});

function formatResult(rows) {
  if (!rows || rows.length === 0) return 'No results';
  const headers = Object.keys(rows[0]);
  const headerRow = headers.join(' | ');
  const separator = headers.map(() => '---').join(' | ');
  const dataRows = rows.slice(0, 10).map(row =>
    headers.map(h => String(row[h] ?? '')).join(' | ')
  ).join('\n');
  let result = `${headerRow}\n${separator}\n${dataRows}`;
  if (rows.length > 10) result += `\n... and ${rows.length - 10} more rows`;
  return result;
}

client.login(DISCORD_TOKEN);
```

## Usage Examples

```
/db-connect type:mysql host:localhost port:3306 user:root password:xxx database:mydb
Bot: Connected to database successfully!

/db-query sql:SELECT * FROM users LIMIT 5
Bot:
id | name  | email
---|-------|-------------------
1  | Alice | alice@example.com
2  | Bob   | bob@example.com

/db-schema table:users
Bot: {
  "table": "users",
  "columns": [...]
}

/db-disconnect
Bot: Disconnected successfully.
```

## Best Practices

1. **Security**: Use ephemeral replies for sensitive data
2. **Permissions**: Restrict bot commands to specific channels/roles
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Error Handling**: Provide clear error messages

## Resources

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers)
- [API Reference](../http-api/API_REFERENCE.md)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
