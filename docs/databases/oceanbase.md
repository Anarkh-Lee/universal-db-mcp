# OceanBase 使用指南

## 配置示例

### Claude Desktop 配置

```json
{
  "mcpServers": {
    "oceanbase-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oceanbase",
        "--host", "localhost",
        "--port", "2881",
        "--user", "root@test",
        "--password", "your_password",
        "--database", "test"
      ]
    }
  }
}
```

### 连接阿里云 OceanBase

```json
{
  "mcpServers": {
    "oceanbase-cloud": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oceanbase",
        "--host", "oceanbase.cn-hangzhou.aliyuncs.com",
        "--port", "2883",
        "--user", "dbuser@tenant",
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
| `--port` | 数据库端口 | 2881 |
| `--user` | 用户名（格式：用户名@租户名） | - |
| `--password` | 密码 | - |
| `--database` | 数据库名 | - |

## 端口说明

- **2881** - 直连端口（直接连接 OBServer）
- **2883** - 代理端口（通过 OBProxy 连接）

## 用户名格式

OceanBase 使用 `用户名@租户名` 格式：

- `root@test` - test 租户的 root 用户
- `user@sys` - sys 租户的 user 用户

## 使用示例

### 查看表结构

```
用户: 查看数据库中有哪些表

Claude 会自动:
1. 调用 get_schema 工具
2. 执行 SHOW TABLES 查询
3. 返回表列表
```

### 执行查询

```
用户: 统计每个用户的订单数量

Claude 会自动:
1. 生成 SQL: SELECT user_id, COUNT(*) as order_count FROM orders GROUP BY user_id
2. 执行并返回结果
```

## 兼容性

OceanBase 兼容 MySQL 协议，支持大部分 MySQL 语法。

## 支持的版本

- OceanBase 3.x
- OceanBase 4.x

## 特色功能

- **分布式事务** - 支持跨节点的分布式事务
- **多租户** - 支持多租户隔离
- **高可用** - 自动故障转移和数据恢复
- **弹性扩展** - 支持在线扩容和缩容
- **HTAP** - 同时支持 OLTP 和 OLAP 场景

## 注意事项

1. **用户名格式** - 必须包含租户名
2. **端口选择** - 生产环境建议使用 OBProxy
3. **SQL 语法** - 使用 MySQL 语法

## 连接稳定性

MCP 服务内置了完善的连接管理机制，无需额外配置：

- **连接池** - 使用 mysql2 连接池（最大 3 个连接），自动管理连接生命周期
- **TCP Keep-Alive** - 启用 TCP 保活机制（30 秒初始延迟），防止连接被服务端超时关闭
- **断线自动重试** - 检测到连接断开时自动重试
