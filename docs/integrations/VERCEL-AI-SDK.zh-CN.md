# Vercel AI SDK 集成指南

本指南展示如何将 Universal Database MCP Server 与 Vercel AI SDK 集成。

## 概述

[Vercel AI SDK](https://sdk.vercel.ai/) 是一个用于构建 AI 应用的工具包。它支持 MCP，允许您在 AI 应用中使用数据库工具。

## 前置要求

- Node.js 18+
- 已安装 Vercel AI SDK
- 数据库实例

## 安装

```bash
npm install ai @ai-sdk/openai
```

## 配置

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

## 使用方法

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4'),
  tools,
  prompt: '数据库里有哪些表？'
});

console.log(result.text);
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 资源

- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
