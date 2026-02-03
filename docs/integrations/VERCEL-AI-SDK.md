# Vercel AI SDK Integration Guide

This guide shows how to integrate Universal Database MCP Server with Vercel AI SDK.

## Overview

[Vercel AI SDK](https://sdk.vercel.ai/) is a toolkit for building AI-powered applications. It supports MCP, allowing you to use database tools in your AI applications.

## Prerequisites

- Node.js 18+
- Vercel AI SDK installed
- Database instance

## Installation

```bash
npm install ai @ai-sdk/openai
```

## Configuration

```typescript
import { createMCPClient } from 'ai/mcp';

const mcpClient = createMCPClient({
  command: 'npx',
  args: [
    'universal-db-mcp',
    '--type', 'mysql',
    '--host', 'localhost',
    '--port', '3306',
    '--user', 'root',
    '--password', 'your_password',
    '--database', 'your_database'
  ]
});

const tools = await mcpClient.getTools();
```

## Usage

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4'),
  tools,
  prompt: 'What tables are in the database?'
});

console.log(result.text);
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
