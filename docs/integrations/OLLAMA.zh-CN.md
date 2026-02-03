# Ollama 集成指南

本指南展示如何将 Universal Database MCP Server 与 Ollama 集成，实现本地 LLM 数据库查询。

## 概述

[Ollama](https://ollama.ai/) 是一个在本地运行大型语言模型的工具。虽然 Ollama 本身没有原生 MCP 支持，但您可以通过 MCP 兼容的客户端（如 Oterm、MCPHost 或自定义应用）来使用它。

**主要优势：**
- 完全在本地运行 LLM
- 注重隐私 - 数据永不离开您的机器
- 支持多种开源模型
- 结合 MCP 客户端访问数据库

## 前置要求

- 已安装 Ollama（[下载地址](https://ollama.ai/)）
- MCP 兼容的客户端（Oterm、MCPHost 等）
- Node.js 20.0.0 或更高版本
- 可从您的机器访问的数据库实例

## 集成方式

### 方式 1：使用 Oterm

[Oterm](https://github.com/ggozad/oterm) 是一个支持 MCP 的终端 Ollama 客户端。

**安装：**
```bash
pip install oterm
```

**配置：**
创建 `~/.config/oterm/config.json`：

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

**使用：**
```bash
oterm
# 然后询问关于数据库的问题
```

### 方式 2：使用 MCPHost

[MCPHost](https://github.com/mark3labs/mcphost) 是一个使用 MCP 与 LLM 聊天的 CLI 工具。

**安装：**
```bash
go install github.com/mark3labs/mcphost@latest
```

**配置：**
创建 `~/.mcphost/config.json`：

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

**使用：**
```bash
mcphost chat
# 然后询问关于数据库的问题
```

### 方式 3：自定义应用

使用 Ollama API 和 MCP 构建自定义应用：

```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const ollama = require('ollama');

async function main() {
  // 启动 MCP 服务器
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

  // 获取可用工具
  const tools = await client.listTools();

  // 使用工具与 Ollama 聊天
  const response = await ollama.chat({
    model: 'llama3.2',
    messages: [{ role: 'user', content: '数据库里有哪些表？' }],
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

## 配置示例

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

## 推荐模型

对于数据库查询，这些 Ollama 模型效果较好：

| 模型 | 大小 | 最适合 |
|------|------|--------|
| llama3.2 | 3B | 一般查询，快速响应 |
| llama3.1 | 8B | 复杂查询，更好的推理 |
| codellama | 7B | SQL 生成，代码任务 |
| mistral | 7B | 平衡性能 |
| mixtral | 47B | 复杂分析（需要更多内存） |

**拉取模型：**
```bash
ollama pull llama3.2
```

## 使用示例

### 基本查询

```
数据库里有哪些表？

显示 users 表的结构

这周有多少用户注册？

找出销量前 10 的产品
```

### SQL 生成

```
编写一个查询，找出 30 天内没有下单的用户

生成按类别计算月收入的 SQL

创建一个查找重复邮箱地址的查询
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息 |
| `get_table_info` | 获取详细的表信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 最佳实践

### 安全性

1. 使用只读数据库用户
2. 保护好凭据安全
3. 本地运行一切以保护隐私
4. 除非必要，否则禁用写入模式

### 性能

1. 简单查询使用较小的模型
2. 复杂分析使用较大的模型
3. 添加 LIMIT 防止大结果集
4. 缓存 Schema 信息

## 故障排除

### Ollama 无响应

**症状：** Ollama 没有响应

**解决方案：**
1. 确保 Ollama 正在运行：`ollama serve`
2. 检查模型已下载：`ollama list`
3. 验证系统有足够的内存

### MCP 服务器未找到

**症状：** 工具不可用

**解决方案：**
1. 验证 MCP 配置是否正确
2. 确保 Node.js 20+ 已安装
3. 检查 MCP 客户端是否支持工具

### 响应缓慢

**症状：** 查询耗时过长

**解决方案：**
1. 使用较小的模型
2. 确保启用了 GPU 加速
3. 减少上下文长度
4. 使用更简单的查询

## 资源

- [Ollama 文档](https://ollama.ai/docs)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Oterm GitHub](https://github.com/ggozad/oterm)
- [MCPHost GitHub](https://github.com/mark3labs/mcphost)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Ollama Discord: https://discord.gg/ollama
