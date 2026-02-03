# Roo Code 集成指南

本指南展示如何将 Universal Database MCP Server 与 Roo Code 集成。

## 概述

[Roo Code](https://github.com/roovet/roo-code) 是 Cline 的一个分支，是 VS Code 的自主编码代理。它支持 MCP，允许您在编码时查询数据库。

## 前置要求

- 已安装 VS Code
- 已安装 Roo Code 扩展
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

### 步骤 1：打开 Roo Code 设置

1. 打开 VS Code
2. 点击侧边栏中的 Roo Code 图标
3. 打开设置

### 步骤 2：配置 MCP 服务器

添加到 MCP Servers 配置：

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

## 使用方法

向 Roo Code 询问关于数据库的问题：

```
数据库里有哪些表？
显示 users 表的结构
为 orders 表生成 TypeScript 接口
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 资源

- [Roo Code GitHub](https://github.com/roovet/roo-code)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
