# Claude Code 集成指南

本指南展示如何将 Universal Database MCP Server 与 Claude Code 集成。

## 概述

[Claude Code](https://claude.ai/code) 是 Anthropic 的终端 AI 编程助手，直接在命令行中运行。它原生支持 MCP，允许您在编码时连接数据库并使用自然语言查询。

**主要优势：**
- 通过 stdio 传输原生支持 MCP
- 终端工作流集成
- 编码会话中直接访问数据库
- 无缝自然语言查询

## 前置要求

- Claude Code 已安装并认证
- Node.js 20.0.0 或更高版本
- 可从您的机器访问的数据库实例

## 配置

### 方式 1：项目级配置

在项目根目录创建 `.mcp.json` 文件：

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

### 方式 2：全局配置

添加到 Claude Code 设置文件：

**macOS/Linux:** `~/.claude/settings.json`
**Windows:** `%USERPROFILE%\.claude\settings.json`

```json
{
  "mcpServers": {
    "my-database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
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
    "mysql-dev": {
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
    "postgres-dev": {
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
        "--file-path", "./data/app.db"
      ]
    }
  }
}
```

### 多数据库配置

```json
{
  "mcpServers": {
    "mysql-users": {
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
    "postgres-analytics": {
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
  }
}
```

## 使用示例

### 编码会话中使用

```bash
# 在项目中启动 Claude Code
claude

# 询问数据库
> 数据库里有哪些表？

# 编码时查询数据
> 显示 users 表的结构

# 基于数据库结构生成代码
> 为 orders 表创建 TypeScript 接口

# 调试数据问题
> 找出所有 customer_id 为空的订单
```

### 常见工作流

**1. 了解数据库结构**
```
> 列出所有表及其关系
> 显示 orders 表的外键
> products 表有哪些索引？
```

**2. 数据探索**
```
> 这周有多少用户注册？
> 平均订单金额是多少？
> 显示销量前 10 的产品
```

**3. 代码生成**
```
> 生成 SQL 迁移脚本，为 users 表添加 email_verified 列
> 创建一个 Node.js 函数来获取用户订单
> 编写按产品类别统计月收入的查询
```

**4. 调试**
```
> 找出 users 表中重复的邮箱地址
> 显示引用了不存在产品的订单
> 检查 order_items 中的孤立记录
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

1. **使用只读模式**（默认）以确保安全
2. **创建专用数据库用户**，授予最小权限
3. **不要提交凭据**到版本控制
4. **使用环境变量**存储敏感数据

### 性能

1. **使用具体查询**而不是 SELECT *
2. **添加 LIMIT** 防止大结果集
3. **缓存 Schema** 信息（默认启用）

### 工作流

1. **从探索 Schema 开始**了解数据库
2. **使用自然语言**进行复杂查询
3. **验证生成的 SQL** 后再在生产环境运行
4. **保持数据库连接**项目特定

## 故障排除

### MCP 服务器未找到

**症状：** Claude Code 不识别数据库命令

**解决方案：**
1. 验证 `.mcp.json` 在项目根目录
2. 检查 JSON 语法是否有效
3. 确保 Node.js 20+ 已安装
4. 重启 Claude Code

### 连接失败

**症状：** 数据库连接错误

**解决方案：**
1. 验证数据库正在运行
2. 检查凭据是否正确
3. 确保网络连接正常
4. 先用数据库客户端测试

### 权限被拒绝

**症状：** 查询执行失败

**解决方案：**
1. 检查数据库用户权限
2. 验证数据库名称正确
3. 确保用户可以从 localhost 访问

## 资源

- [Claude Code 文档](https://claude.ai/code/docs)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
- [MCP 协议规范](https://modelcontextprotocol.io/)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
