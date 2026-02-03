# Ollama Integration Guide

This guide shows how to integrate Universal Database MCP Server with Ollama for local LLM database queries.

## Overview

[Ollama](https://ollama.ai/) is a tool for running large language models locally. While Ollama itself doesn't have native MCP support, you can use it with MCP-compatible clients like Oterm, MCPHost, or custom applications.

**Key Benefits:**
- Run LLMs completely locally
- Privacy-focused - data never leaves your machine
- Works with various open-source models
- Combine with MCP clients for database access

## Prerequisites

- Ollama installed ([Download here](https://ollama.ai/))
- An MCP-compatible client (Oterm, MCPHost, etc.)
- Node.js 20.0.0 or later
- Database instance accessible from your machine

## Integration Methods

### Method 1: Using Oterm

[Oterm](https://github.com/ggozad/oterm) is a terminal-based Ollama client with MCP support.

**Installation:**
```bash
pip install oterm
```

**Configuration:**
Create `~/.config/oterm/config.json`:

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

**Usage:**
```bash
oterm
# Then ask questions about your database
```

### Method 2: Using MCPHost

[MCPHost](https://github.com/mark3labs/mcphost) is a CLI tool for chatting with LLMs using MCP.

**Installation:**
```bash
go install github.com/mark3labs/mcphost@latest
```

**Configuration:**
Create `~/.mcphost/config.json`:

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  },
  "llm": {
    "provider": "ollama",
    "model": "llama3.2"
  }
}
```

**Usage:**
```bash
mcphost chat
# Then ask questions about your database
```

### Method 3: Custom Application

Build a custom application using Ollama's API with MCP:

```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const ollama = require('ollama');

async function main() {
  // Start MCP server
  const transport = new StdioClientTransport({
    command: 'npx',
    args: [
      'universal-db-mcp',
      '--type', 'mysql',
      '--host', 'localhost',
      '--port', '3306',
      '--user', 'root',
      '--password', 'password',
      '--database', 'mydb'
    ]
  });

  const client = new Client({ name: 'ollama-client', version: '1.0.0' });
  await client.connect(transport);

  // Get available tools
  const tools = await client.listTools();

  // Chat with Ollama using tools
  const response = await ollama.chat({
    model: 'llama3.2',
    messages: [{ role: 'user', content: 'What tables are in the database?' }],
    tools: tools.tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema
      }
    }))
  });

  console.log(response.message.content);
}

main();
```

## Configuration Examples

### MySQL

```json
{
  "mcpServers": {
    "mysql-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "password",
        "--database", "myapp"
      ]
    }
  }
}
```

### PostgreSQL

```json
{
  "mcpServers": {
    "postgres-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "password",
        "--database", "myapp"
      ]
    }
  }
}
```

### SQLite

```json
{
  "mcpServers": {
    "sqlite-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/database.db"
      ]
    }
  }
}
```

## Recommended Models

For database queries, these Ollama models work well:

| Model | Size | Best For |
|-------|------|----------|
| llama3.2 | 3B | General queries, fast responses |
| llama3.1 | 8B | Complex queries, better reasoning |
| codellama | 7B | SQL generation, code tasks |
| mistral | 7B | Balanced performance |
| mixtral | 47B | Complex analysis (requires more RAM) |

**Pull a model:**
```bash
ollama pull llama3.2
```

## Usage Examples

### Basic Queries

```
What tables are in the database?

Show me the schema of the users table

How many users signed up this week?

Find the top 10 products by sales
```

### SQL Generation

```
Write a query to find users who haven't ordered in 30 days

Generate SQL to calculate monthly revenue by category

Create a query to find duplicate email addresses
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema information |
| `get_table_info` | Get detailed table information |
| `clear_cache` | Clear schema cache |

## Best Practices

### Security

1. Use read-only database users
2. Keep credentials secure
3. Run everything locally for privacy
4. Disable write mode unless necessary

### Performance

1. Use smaller models for simple queries
2. Use larger models for complex analysis
3. Add LIMIT to prevent large result sets
4. Cache schema information

## Troubleshooting

### Ollama Not Responding

**Symptoms:** No response from Ollama

**Solutions:**
1. Ensure Ollama is running: `ollama serve`
2. Check model is downloaded: `ollama list`
3. Verify system has enough RAM

### MCP Server Not Found

**Symptoms:** Tools not available

**Solutions:**
1. Verify MCP configuration is correct
2. Ensure Node.js 20+ is installed
3. Check the MCP client supports tools

### Slow Responses

**Symptoms:** Queries take too long

**Solutions:**
1. Use a smaller model
2. Ensure GPU acceleration is enabled
3. Reduce context length
4. Use simpler queries

## Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Oterm GitHub](https://github.com/ggozad/oterm)
- [MCPHost GitHub](https://github.com/mark3labs/mcphost)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Ollama Discord: https://discord.gg/ollama
