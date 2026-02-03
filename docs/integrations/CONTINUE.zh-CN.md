# Continue 集成指南

本指南展示如何将 Universal Database MCP Server 与 Continue 集成。

## 概述

[Continue](https://continue.dev/) 是一个开源的 AI 代码助手，可在 VS Code 和 JetBrains IDE 中运行。它支持 MCP，允许您连接数据库并使用自然语言查询。

**主要优势：**
- 开源且可定制
- 原生支持 MCP
- 支持多种 LLM 提供商
- 支持 VS Code 和 JetBrains

## 前置要求

- 在 VS Code 或 JetBrains 中安装了 Continue 扩展
- Node.js 20.0.0 或更高版本
- 可从您的机器访问的数据库实例

## 配置

### 配置文件位置

Continue 使用以下位置的配置文件：
- **所有平台：** `~/.continue/config.json`

### 基本配置

将 MCP 服务器添加到 `config.json`：

```json
{
  "mcpServers": [
    {
      "name": "database",
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
  ]
}
```

## 配置示例

### MySQL

```json
{
  "mcpServers": [
    {
      "name": "mysql-dev",
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
  ]
}
```

### PostgreSQL

```json
{
  "mcpServers": [
    {
      "name": "postgres-dev",
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
  ]
}
```

### 多数据库配置

```json
{
  "mcpServers": [
    {
      "name": "mysql-users",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "password",
        "--database", "users_db"
      ]
    },
    {
      "name": "postgres-analytics",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "password",
        "--database", "analytics"
      ]
    }
  ]
}
```

## 使用方法

### 使用 MCP 工具

1. 打开 Continue 聊天面板
2. 使用 `/tools` 命令查看可用工具
3. 询问关于数据库的问题：

```
数据库里有哪些表？

显示 users 表的结构

为 orders 表生成 TypeScript 接口

找出这周注册的所有用户
```

### 常见工作流

**Schema 探索：**
```
列出所有表及其列
表之间有什么关系？
显示 products 表的索引
```

**代码生成：**
```
为 users 表创建一个 repository 类
生成添加新列的 SQL 迁移
编写一个带分页的获取用户订单的函数
```

**数据分析：**
```
这个月有多少订单？
平均订单金额是多少？
找出销量前 10 的产品
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
2. 不要将凭据提交到版本控制
3. 使用环境变量存储敏感数据
4. 除非必要，否则禁用写入模式

### 性能

1. 使用具体查询而不是 SELECT *
2. 添加 LIMIT 防止大结果集
3. 缓存 Schema 信息

## 故障排除

### MCP 服务器未找到

**症状：** Continue 不显示数据库工具

**解决方案：**
1. 验证 config.json 语法是否有效
2. 检查文件是否在 `~/.continue/config.json`
3. 确保 Node.js 20+ 已安装
4. 重启 VS Code/IDE

### 连接失败

**症状：** 数据库连接错误

**解决方案：**
1. 验证数据库正在运行
2. 检查凭据是否正确
3. 确保网络连接正常
4. 先用数据库客户端测试

## 资源

- [Continue 文档](https://continue.dev/docs)
- [Continue GitHub](https://github.com/continuedev/continue)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- Continue Discord: https://discord.gg/continue
