# Postman 集成指南

本指南展示如何使用 Postman 测试 Universal Database MCP Server REST API。

## 概述

[Postman](https://postman.com/) 是一个流行的 API 测试平台。您可以使用它来测试 Universal Database MCP Server 的 REST API 端点。

## 前置要求

- 已安装 Postman（[下载地址](https://postman.com/downloads/)）
- 以 HTTP 模式部署的 Universal Database MCP Server
- 数据库实例

## 设置

### 步骤 1：部署 HTTP API 服务器

```bash
docker run -d \
  --name universal-db-mcp \
  -p 3000:3000 \
  -e MODE=http \
  -e HTTP_PORT=3000 \
  -e API_KEYS=postman-test-key \
  universal-db-mcp:latest
```

### 步骤 2：创建 Postman Collection

1. 打开 Postman
2. 创建新的 Collection："Universal DB MCP"
3. 添加环境变量：`API_KEY` = `postman-test-key`

### 步骤 3：配置认证

在 Collection 设置中添加：
- Header: `X-API-Key`
- Value: `{{API_KEY}}`

## API 端点

### 连接数据库

**POST** `/api/connect`

```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "your_password",
  "database": "your_database"
}
```

### 执行查询

**POST** `/api/query`

```json
{
  "sessionId": "{{sessionId}}",
  "query": "SELECT * FROM users LIMIT 10"
}
```

### 获取结构

**GET** `/api/schema?sessionId={{sessionId}}`

### 获取表信息

**GET** `/api/schema/users?sessionId={{sessionId}}`

### 断开连接

**POST** `/api/disconnect`

```json
{
  "sessionId": "{{sessionId}}"
}
```

## 测试工作流

1. **连接**：调用 `/api/connect`，保存 `sessionId`
2. **查询**：使用 `sessionId` 执行查询
3. **探索**：获取结构和表信息
4. **断开**：关闭会话

## 资源

- [Postman 文档](https://learning.postman.com/)
- [API 参考](../http-api/API_REFERENCE.zh-CN.md)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
