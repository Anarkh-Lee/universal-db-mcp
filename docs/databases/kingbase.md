# KingbaseES 使用指南

## 配置示例

### Claude Desktop 配置

```json
{
  "mcpServers": {
    "kingbase-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "kingbase",
        "--host", "localhost",
        "--port", "54321",
        "--user", "system",
        "--password", "your_password",
        "--database", "test"
      ]
    }
  }
}
```

### 连接远程 KingbaseES

```json
{
  "mcpServers": {
    "kingbase-prod": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "kingbase",
        "--host", "kingbase.example.com",
        "--port", "54321",
        "--user", "readonly_user",
        "--password", "secure_password",
        "--database", "production"
      ]
    }
  }
}
```

## 连接参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--host` | 数据库主机地址 | localhost |
| `--port` | 数据库端口 | 54321 |
| `--user` | 用户名 | - |
| `--password` | 密码 | - |
| `--database` | 数据库名 | - |

## 使用示例

### 查看表结构

```
用户: 查看数据库中有哪些表

Claude 会自动:
1. 调用 get_schema 工具
2. 查询 public schema 下的所有表
3. 返回表列表
```

### 执行查询

```
用户: 统计每个部门的员工数量

Claude 会自动:
1. 生成 SQL: SELECT department_id, COUNT(*) as count FROM employees GROUP BY department_id
2. 执行并返回结果
```

## 兼容性

KingbaseES 基于 PostgreSQL 开发，兼容 PostgreSQL 协议和 SQL 语法。

## 支持的版本

- KingbaseES V8
- KingbaseES V9

## 常见使用场景

### 国产化数据库迁移

从 PostgreSQL 迁移到 KingbaseES：

```
用户: 帮我分析现有表结构，准备迁移到 KingbaseES

Claude 会:
1. 获取完整的 Schema 信息
2. 分析表结构、索引、约束
3. 提供迁移建议
```

## 注意事项

1. **默认端口** - 54321（与 PostgreSQL 不同）
2. **Schema** - 默认查询 public schema
3. **参数化查询** - 支持 $1, $2, ... 占位符
4. **驱动** - 使用 PostgreSQL 的 pg 驱动
5. **国产化** - 适用于国产化替代场景

## 连接稳定性

MCP 服务内置了完善的连接管理机制，无需额外配置：

- **连接池** - 使用 pg 连接池（最大 3 个连接），自动管理连接生命周期
- **TCP Keep-Alive** - 启用 TCP 保活机制（30 秒初始延迟），防止连接被服务端超时关闭
- **断线自动重试** - 检测到连接断开（如 `Connection terminated`、`ECONNRESET`）时自动重试
