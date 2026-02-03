# LangChain 集成指南

本指南展示如何将 Universal Database MCP Server 与 LangChain 集成。

## 概述

[LangChain](https://langchain.com/) 是一个流行的 LLM 应用开发框架。它支持 MCP，允许您在 LangChain 代理中使用数据库工具。

## 前置要求

- Python 3.9+ 或 Node.js 18+
- 已安装 LangChain
- Universal Database MCP Server
- 数据库实例

## 安装

```bash
pip install langchain langchain-mcp
```

## 配置

### Python 示例

```python
from langchain_mcp import MCPToolkit
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_openai import ChatOpenAI

# 创建 MCP 工具包
toolkit = MCPToolkit(
    server_command="npx",
    server_args=[
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
    ]
)

# 获取工具
tools = toolkit.get_tools()

# 创建代理
llm = ChatOpenAI(model="gpt-4")
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

# 运行查询
result = agent_executor.invoke({
    "input": "数据库里有哪些表？"
})
print(result["output"])
```

### Node.js 示例

```javascript
const { MCPToolkit } = require('langchain/tools/mcp');
const { ChatOpenAI } = require('@langchain/openai');
const { createToolCallingAgent, AgentExecutor } = require('langchain/agents');

async function main() {
  const toolkit = new MCPToolkit({
    serverCommand: 'npx',
    serverArgs: [
      'universal-db-mcp',
      '--type', 'mysql',
      '--host', 'localhost',
      '--port', '3306',
      '--user', 'root',
      '--password', 'your_password',
      '--database', 'your_database'
    ]
  });

  const tools = await toolkit.getTools();
  const llm = new ChatOpenAI({ model: 'gpt-4' });

  const agent = createToolCallingAgent({ llm, tools, prompt });
  const executor = new AgentExecutor({ agent, tools });

  const result = await executor.invoke({
    input: '数据库里有哪些表？'
  });

  console.log(result.output);
}

main();
```

## 可用工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 使用场景

1. **RAG 与数据库结合**：将文档检索与数据库查询结合
2. **数据分析代理**：构建分析数据库数据的代理
3. **聊天机器人**：创建能回答数据问题的聊天机器人
4. **自动化报告**：从数据库查询生成报告

## 最佳实践

1. 使用只读数据库用户
2. 实现查询验证
3. 添加速率限制
4. 缓存 Schema 信息

## 资源

- [LangChain 文档](https://python.langchain.com/docs/)
- [LangChain MCP 集成](https://python.langchain.com/docs/integrations/tools/mcp)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
