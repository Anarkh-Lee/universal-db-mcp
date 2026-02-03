# Smolagents 集成指南

本指南展示如何将 Universal Database MCP Server 与 Smolagents 集成。

## 概述

[Smolagents](https://github.com/huggingface/smolagents) 是 Hugging Face 的代理库。它支持 MCP，允许您在代理中使用数据库工具。

## 前置要求

- Python 3.9+
- 已安装 Smolagents
- Node.js 20.0.0 或更高版本
- 数据库实例

## 安装

```bash
pip install smolagents
```

## 配置

```python
from smolagents import MCPClient, Agent

mcp_client = MCPClient(
    command="npx",
    args=[
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
    ]
)

tools = mcp_client.get_tools()
agent = Agent(tools=tools)

result = agent.run("数据库里有哪些表？")
print(result)
```

## 资源

- [Smolagents GitHub](https://github.com/huggingface/smolagents)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
