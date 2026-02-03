# GitHub Copilot 集成指南

本指南展示如何将 Universal Database MCP Server 与 GitHub Copilot 集成。

## 概述

[GitHub Copilot](https://github.com/features/copilot) 是 GitHub 的 AI 编程助手。通过 VS Code 和 JetBrains IDE 中的 Agent Mode 功能，Copilot 可以使用 MCP 服务器与外部工具（包括数据库）交互。

**主要优势：**
- Agent Mode 原生支持 MCP
- 与 VS Code 和 JetBrains 无缝集成
- 编码时使用自然语言查询数据库
- 基于数据库结构的上下文感知代码建议

## 前置要求

- GitHub Copilot 订阅（Individual、Business 或 Enterprise）
- 安装了 Copilot 扩展的 VS Code 或 JetBrains IDE
- Node.js 20.0.0 或更高版本
- 可从您的机器访问的数据库实例

## 配置

### VS Code 配置

1. 打开 VS Code 设置（Cmd/Ctrl + ,）
2. 搜索 "github.copilot.chat.experimental.mcpServers"
3. 点击"在 settings.json 中编辑"
4. 添加 MCP 服务器配置：

```json
{
  "github.copilot.chat.experimental.mcpServers": {
    "universal-db-mcp": {
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

### JetBrains 配置

1. 打开设置/首选项
2. 导航到 Tools > GitHub Copilot > MCP Servers
3. 添加新的 MCP 服务器配置

## 配置示例

### MySQL

```json
{
  "github.copilot.chat.experimental.mcpServers": {
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
  "github.copilot.chat.experimental.mcpServers": {
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
  "github.copilot.chat.experimental.mcpServers": {
    "sqlite-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "${workspaceFolder}/data/app.db"
      ]
    }
  }
}
```

## 使用方法

### 使用 Agent Mode

1. 打开 Copilot Chat（Cmd/Ctrl + Shift + I）
2. 点击 agent 图标切换到 Agent Mode
3. 询问关于数据库的问题：

```
@workspace 数据库里有哪些表？

@workspace 显示 users 表的结构

@workspace 为 orders 表生成 TypeScript 接口

@workspace 找出所有没有下过订单的用户
```

### 常见工作流

**Schema 探索：**
```
@workspace 列出所有表及其列
@workspace users 和 orders 之间有什么关系？
@workspace 显示 products 表的索引
```

**代码生成：**
```
@workspace 为 users 表创建一个 repository 类
@workspace 生成添加新列的 SQL 迁移
@workspace 编写一个带分页的获取用户订单的函数
```

**数据分析：**
```
@workspace 这个月有多少订单？
@workspace 按客户细分的平均订单金额是多少？
@workspace 找出收入前 10 的产品
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
3. 使用 VS Code 的密钥存储来保存密码
4. 除非必要，否则禁用写入模式

### 性能

1. 使用具体查询而不是 SELECT *
2. 添加 LIMIT 防止大结果集
3. 让 Copilot 缓存 Schema 信息

### 工作流

1. 从探索数据库结构开始
2. 使用自然语言进行复杂查询
3. 执行前检查生成的 SQL
4. 结合 Copilot 的代码建议

## 故障排除

### MCP 服务器不可用

**症状：** Copilot 不显示数据库工具

**解决方案：**
1. 确保 Agent Mode 已启用
2. 检查设置中的 MCP 服务器配置
3. 验证 Node.js 20+ 已安装
4. 重启 VS Code/IDE

### 连接失败

**症状：** 数据库连接错误

**解决方案：**
1. 验证数据库正在运行
2. 检查凭据是否正确
3. 确保网络连接正常
4. 先用数据库客户端测试

### Agent Mode 不可用

**症状：** 无法切换到 Agent Mode

**解决方案：**
1. 将 Copilot 扩展更新到最新版本
2. 检查您的 Copilot 订阅是否包含 Agent Mode
3. 在设置中启用实验性功能

## 资源

- [GitHub Copilot 文档](https://docs.github.com/en/copilot)
- [Copilot Agent Mode](https://docs.github.com/en/copilot/using-github-copilot/using-extensions-to-integrate-external-tools-with-copilot-chat)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- GitHub Copilot 支持: https://support.github.com/
