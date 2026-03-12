# GaussDB / OpenGauss 使用指南

## 配置示例

### Claude Desktop 配置

```json
{
  "mcpServers": {
    "gaussdb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "gaussdb",
        "--host", "localhost",
        "--port", "5432",
        "--user", "gaussdb",
        "--password", "your_password",
        "--database", "postgres"
      ]
    }
  }
}
```

### 连接华为云 GaussDB

```json
{
  "mcpServers": {
    "gaussdb-cloud": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "gaussdb",
        "--host", "gaussdb.cn-north-4.myhuaweicloud.com",
        "--port", "5432",
        "--user", "dbuser",
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
| `--port` | 数据库端口 | 5432 |
| `--user` | 用户名 | - |
| `--password` | 密码 | - |
| `--database` | 数据库名 | - |

## 类型参数

可以使用以下类型参数：
- `--type gaussdb`
- `--type opengauss`

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
用户: 统计每个类别的产品数量

Claude 会自动:
1. 生成 SQL: SELECT category, COUNT(*) as count FROM products GROUP BY category
2. 执行并返回结果
```

## 兼容性

GaussDB/OpenGauss 基于 PostgreSQL 开发，兼容 PostgreSQL 协议和大部分 SQL 语法。

## 支持的版本

- GaussDB 100/200/300 系列
- OpenGauss 2.x / 3.x / 5.x

## 特色功能

- **列存储** - 支持列存储表
- **分区表** - 增强的分区表功能
- **并行查询** - 更强的并行查询能力
- **AI 能力** - 内置 AI 引擎（部分版本）

## 注意事项

1. **默认端口** - 与 PostgreSQL 相同（5432）
2. **Schema** - 默认查询 public schema
3. **参数化查询** - 支持 $1, $2, ... 占位符
4. **驱动** - 使用 PostgreSQL 的 pg 驱动

## 连接稳定性

MCP 服务内置了完善的连接管理机制，无需额外配置：

- **连接池** - 使用 pg 连接池（最大 3 个连接），自动管理连接生命周期
- **TCP Keep-Alive** - 启用 TCP 保活机制（30 秒初始延迟），防止连接被服务端超时关闭
- **断线自动重试** - 检测到连接断开（如 `Connection terminated`、`ECONNRESET`）时自动重试
