# Jan 集成指南

本指南展示如何将 Universal Database MCP Server 与 Jan 集成。

## 概述

[Jan](https://jan.ai/) 是一个开源的、离线优先的 ChatGPT 替代品，可运行本地 LLM。它支持 MCP，允许您连接数据库并使用自然语言查询。

**主要优势：**
- 开源且注重隐私
- 完全离线运行
- 原生支持 MCP
- 支持多种本地 LLM

## 前置要求

- 已安装 Jan（[下载地址](https://jan.ai/)）
- Node.js 20.0.0 或更高版本
- 可从您的机器访问的数据库实例

## 配置

### 步骤 1：打开 Jan 设置

1. 启动 Jan
2. 点击齿轮图标打开设置
3. 导航到"Extensions"或"MCP Servers"

### 步骤 2：添加 MCP 服务器

添加以下配置：

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

## 配置示例

### MySQL

```json
{
  "mcpServers": {
    "mysql-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "password",
        "--database", "myapp"
      ]
    }
  }
}
```

### PostgreSQL

```json
{
  "mcpServers": {
    "postgres-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "password",
        "--database", "myapp"
      ]
    }
  }
}
```

### SQLite

```json
{
  "mcpServers": {
    "sqlite-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/database.db"
      ]
    }
  }
}
```

## 使用方法

### 查询数据库

配置完成后，您可以向 Jan 询问关于数据库的问题：

```
数据库里有哪些表？

显示 users 表的结构

这周有多少用户注册？

找出销量前 10 的产品
```

### 常见工作流

**Schema 探索：**
```
列出所有表及其列
表之间有什么关系？
显示 products 表的索引
```

**数据分析：**
```
这个月的总收入是多少？
我们有多少活跃用户？
显示最近 7 天的订单
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息 |
| `get_table_info` | 获取详细的表信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 最佳实践

### 安全性

1. 使用只读数据库用户
2. 保护好凭据安全
3. 尽可能使用本地数据库
4. 除非必要，否则禁用写入模式

### 性能

1. 使用具体查询而不是 SELECT *
2. 添加 LIMIT 防止大结果集
3. 根据硬件选择合适的本地 LLM

## 故障排除

### MCP 服务器未找到

**症状：** Jan 不显示数据库工具

**解决方案：**
1. 验证 MCP 配置是否正确
2. 确保 Node.js 20+ 已安装
3. 配置更改后重启 Jan

### 连接失败

**症状：** 数据库连接错误

**解决方案：**
1. 验证数据库正在运行
2. 检查凭据是否正确
3. 确保网络连接正常
4. 先用数据库客户端测试

## 资源

- [Jan 文档](https://jan.ai/docs)
- [Jan GitHub](https://github.com/janhq/jan)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Jan Discord: https://discord.gg/jan
