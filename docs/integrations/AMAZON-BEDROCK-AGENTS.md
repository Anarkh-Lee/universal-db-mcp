# Amazon Bedrock Agents Integration Guide

This guide shows how to integrate Universal Database MCP Server with Amazon Bedrock Agents.

## Overview

[Amazon Bedrock Agents](https://aws.amazon.com/bedrock/) is AWS's AI agent service. It supports MCP via SSE/Streamable HTTP, allowing you to use database tools in your agents.

## Prerequisites

- AWS account
- Universal Database MCP Server deployed in HTTP mode
- Database instance

## Configuration

### Step 1: Deploy HTTP API Server

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=bedrock-agent-key \
  universal-db-mcp:latest
```

### Step 2: Configure Bedrock Agent

Configure your Bedrock Agent in the AWS Console to use the MCP server as a tool.

## Resources

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
