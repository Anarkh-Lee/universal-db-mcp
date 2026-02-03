# MindPal 集成指南

本指南展示如何将 Universal Database MCP Server 与 MindPal 集成。

## 概述

[MindPal](https://mindpal.io/) 是一个无代码 AI 代理构建器。它通过 SSE/Streamable HTTP 支持 MCP，允许您从 AI 代理查询数据库。

## 前置要求

- MindPal 账号
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
  -e API_KEYS=mindpal-secret-key \
  universal-db-mcp:latest
```

### 步骤 2：配置 MindPal

1. 打开 MindPal
2. 导航到 Integrations
3. 添加 MCP Server：
   - URL: `https://your-server.com/mcp`
   - Headers: 包含数据库配置

## 使用方法

在 MindPal 代理中使用数据库工具查询数据。

## 资源

- [MindPal 网站](https://mindpal.io/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
