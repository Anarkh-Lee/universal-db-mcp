# MCP Inspector 集成指南

本指南展示如何使用 MCP Inspector 调试和测试 Universal Database MCP Server。

## 概述

[MCP Inspector](https://github.com/modelcontextprotocol/inspector) 是 MCP 服务器的官方调试工具。它允许您测试和检查 MCP 服务器功能。

## 前置要求

- Node.js 20.0.0 或更高版本
- 数据库实例

## 安装

```bash
npx @modelcontextprotocol/inspector
```

## 使用方法

### 使用数据库服务器启动 Inspector

```bash
npx @modelcontextprotocol/inspector npx universal-db-mcp \
  --type mysql \
  --host localhost \
  --port 3306 \
  --user root \
  --password your_password \
  --database your_database
```

### 使用 Inspector UI

1. 打开终端中显示的 Inspector URL（通常是 http://localhost:5173）
2. 在"Tools"标签中查看可用工具
3. 点击工具进行测试
4. 在"Logs"标签中查看服务器日志

### 测试工具

**测试 execute_query：**
```json
{
  "query": "SELECT * FROM users LIMIT 5"
}
```

**测试 get_schema：**
```json
{}
```

**测试 get_table_info：**
```json
{
  "tableName": "users"
}
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 调试技巧

1. 检查服务器日志中的错误
2. 验证工具输入 Schema
3. 先用简单查询测试
4. 监控响应时间

## 资源

- [MCP Inspector GitHub](https://github.com/modelcontextprotocol/inspector)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
