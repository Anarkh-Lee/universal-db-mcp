# Notion 集成指南

本指南展示如何将 Universal Database MCP Server 与 Notion 集成。

## 概述

[Notion](https://notion.so/) 是一个生产力和笔记应用。通过 Notion 的 AI 功能和 MCP 支持，您可以直接从 Notion 工作区查询数据库。

## 前置要求

- 启用了 AI 功能的 Notion 账号
- 部署了 HTTP 模式的 Universal Database MCP Server
- 数据库实例（MySQL、PostgreSQL 等）

## 配置

### 步骤 1：部署 HTTP API 服务器

以 HTTP 模式部署 Universal Database MCP Server，支持 SSE/Streamable HTTP：

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=notion-secret-key \
  universal-db-mcp:latest
```

### 步骤 2：配置 Notion MCP 连接

1. 打开 Notion 设置
2. 导航到"Connections"或"AI Settings"
3. 添加 MCP 服务器连接：
   - URL: `https://your-server.com/mcp`
   - 认证: API Key

### 步骤 3：配置数据库请求头

连接时，在请求头中包含数据库配置：

```
X-DB-Type: mysql
X-DB-Host: localhost
X-DB-Port: 3306
X-DB-User: root
X-DB-Password: your_password
X-DB-Database: your_database
```

## 使用方法

配置完成后，您可以使用 Notion AI 查询数据库：

```
@AI 我的数据库里有哪些表？

@AI 显示 users 表的结构

@AI 这个月有多少订单？

@AI 找出收入前 10 的客户
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息 |
| `get_table_info` | 获取详细的表信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 最佳实践

1. 使用只读数据库用户
2. 使用 API 密钥保护 MCP 服务器
3. 生产环境使用 HTTPS
4. 限制查询结果以防止大响应

## 资源

- [Notion 文档](https://notion.so/help)
- [API 参考](../http-api/API_REFERENCE.zh-CN.md)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
