# Claude.ai 集成指南

本指南展示如何将 Universal Database MCP Server 与 Claude.ai 网页界面集成。

## 概述

[Claude.ai](https://claude.ai/) 是 Anthropic 的 Claude 网页界面。它通过 SSE/Streamable HTTP 支持 MCP，允许您从网页界面查询数据库。

## 前置要求

- 启用了 MCP 功能的 Claude.ai 账号
- 以 HTTP 模式部署的 Universal Database MCP Server
- 数据库实例

## 配置

### 步骤 1：部署 HTTP API 服务器

以 HTTP 模式部署 Universal Database MCP Server，并开放公网访问：

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=claude-ai-key \
  universal-db-mcp:latest
```

### 步骤 2：配置 Claude.ai

1. 打开 Claude.ai
2. 转到 Settings > Integrations
3. 添加 MCP Server：
   - URL: `https://your-server.com/mcp`
   - 配置数据库请求头

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

配置完成后，您可以向 Claude 询问关于数据库的问题：

```
数据库里有哪些表？
显示 users 表的结构
这个月有多少订单？
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 最佳实践

1. 生产环境使用 HTTPS
2. 使用只读数据库用户
3. 使用 API 密钥保护 MCP 服务器
4. 限制查询结果以防止大响应

## 资源

- [Claude.ai](https://claude.ai/)
- [API 参考](../http-api/API_REFERENCE.zh-CN.md)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
