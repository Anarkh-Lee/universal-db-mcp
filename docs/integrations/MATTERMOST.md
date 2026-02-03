# Mattermost Integration Guide

This guide shows how to integrate Universal Database MCP Server with Mattermost.

## Overview

[Mattermost](https://mattermost.com/) is an open-source messaging platform. You can integrate Universal Database MCP Server via a bot that calls the REST API.

## Prerequisites

- Mattermost server
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
  -e API_KEYS=mattermost-bot-key \
  universal-db-mcp:latest
```

### Step 2: Create Mattermost Bot

1. Go to System Console > Integrations > Bot Accounts
2. Create a new bot
3. Copy the bot token

### Step 3: Create Bot Server

Create a bot server that handles Mattermost commands and calls the MCP REST API (similar to Slack integration).

## Usage

```
/db-connect mysql localhost 3306 root password mydb
/db-query SELECT * FROM users LIMIT 5
/db-schema users
/db-disconnect
```

## Resources

- [Mattermost Documentation](https://docs.mattermost.com/)
- [API Reference](../http-api/API_REFERENCE.md)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
