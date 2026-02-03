# LangChain Integration Guide

This guide shows how to integrate Universal Database MCP Server with LangChain.

## Overview

[LangChain](https://langchain.com/) is a popular framework for building LLM applications. It supports MCP, allowing you to use database tools in your LangChain agents.

## Prerequisites

- Python 3.9+ or Node.js 18+
- LangChain installed
- Universal Database MCP Server
- Database instance

## Installation

```bash
pip install langchain langchain-mcp
```

## Configuration

### Python Example

```python
from langchain_mcp import MCPToolkit
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_openai import ChatOpenAI

# Create MCP toolkit
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

# Get tools
tools = toolkit.get_tools()

# Create agent
llm = ChatOpenAI(model="gpt-4")
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

# Run query
result = agent_executor.invoke({
    "input": "What tables are in the database?"
})
print(result["output"])
```

### Node.js Example

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
    input: 'What tables are in the database?'
  });

  console.log(result.output);
}

main();
```

## Available Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Use Cases

1. **RAG with Database**: Combine document retrieval with database queries
2. **Data Analysis Agents**: Build agents that analyze database data
3. **Chatbots**: Create chatbots that can answer questions about your data
4. **Automated Reports**: Generate reports from database queries

## Best Practices

1. Use read-only database users
2. Implement query validation
3. Add rate limiting
4. Cache schema information

## Resources

- [LangChain Documentation](https://python.langchain.com/docs/)
- [LangChain MCP Integration](https://python.langchain.com/docs/integrations/tools/mcp)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
