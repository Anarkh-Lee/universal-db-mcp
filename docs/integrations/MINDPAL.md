# MindPal Integration Guide

This guide shows how to integrate Universal Database MCP Server with MindPal.

## Overview

[MindPal](https://mindpal.io/) is a no-code AI agent builder. It supports MCP via SSE/Streamable HTTP, allowing you to query databases from your AI agents.

## Prerequisites

- MindPal account
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
  -e API_KEYS=mindpal-secret-key \
  universal-db-mcp:latest
```

### Step 2: Configure MindPal

1. Open MindPal
2. Navigate to Integrations
3. Add MCP Server:
   - URL: `https://your-server.com/mcp`
   - Headers: Include database configuration

## Usage

Use the database tools in your MindPal agents to query data.

## Resources

- [MindPal Website](https://mindpal.io/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
