# Mattermost 集成指南

本指南展示如何将 Universal Database MCP Server 与 Mattermost 集成。

## 概述

[Mattermost](https://mattermost.com/) 是一个开源的消息平台。您可以通过调用 REST API 的机器人集成 Universal Database MCP Server。

## 前置要求

- Mattermost 服务器
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
  -e API_KEYS=mattermost-bot-key \
  universal-db-mcp:latest
```

### 步骤 2：创建 Mattermost 机器人

1. 转到 System Console > Integrations > Bot Accounts
2. 创建新的机器人
3. 复制机器人令牌

### 步骤 3：创建机器人服务器

创建一个处理 Mattermost 命令并调用 MCP REST API 的机器人服务器（类似于 Slack 集成）。

## 使用方法

```
/db-connect mysql localhost 3306 root password mydb
/db-query SELECT * FROM users LIMIT 5
/db-schema users
/db-disconnect
```

## 资源

- [Mattermost 文档](https://docs.mattermost.com/)
- [API 参考](../http-api/API_REFERENCE.zh-CN.md)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
