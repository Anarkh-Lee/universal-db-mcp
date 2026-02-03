# Amazon Bedrock Agents 集成指南

本指南展示如何将 Universal Database MCP Server 与 Amazon Bedrock Agents 集成。

## 概述

[Amazon Bedrock Agents](https://aws.amazon.com/bedrock/) 是 AWS 的 AI 代理服务。它通过 SSE/Streamable HTTP 支持 MCP，允许您在代理中使用数据库工具。

## 前置要求

- AWS 账号
- 以 HTTP 模式部署的 Universal Database MCP Server
- 数据库实例

## 配置

### 步骤 1：部署 HTTP API 服务器

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=bedrock-agent-key \
  universal-db-mcp:latest
```

### 步骤 2：配置 Bedrock Agent

在 AWS 控制台中配置 Bedrock Agent 使用 MCP 服务器作为工具。

## 资源

- [Amazon Bedrock 文档](https://docs.aws.amazon.com/bedrock/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
