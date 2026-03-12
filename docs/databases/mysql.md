# MySQL 使用指南

## 配置示例

### Claude Desktop 配置

```json
{
  "mcpServers": {
    "mysql-db": {
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

### 启用写入模式

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
        "--user", "dev_user",
        "--password", "dev_password",
        "--database", "dev_database",
        "--permission-mode", "full"
      ]
    }
  }
}
```

## 连接参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--host` | 数据库主机地址 | localhost |
| `--port` | 数据库端口 | 3306 |
| `--user` | 用户名 | - |
| `--password` | 密码 | - |
| `--database` | 数据库名 | - |

## 使用示例

### 查看表结构

```
用户: 帮我查看 users 表的结构

Claude 会自动:
1. 调用 get_table_info 工具
2. 返回表的列信息、主键、索引等
```

### 执行查询

```
用户: 统计最近 7 天注册的用户数量

Claude 会自动:
1. 理解需求
2. 生成 SQL: SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
3. 执行查询并返回结果
```

### 复杂查询

```
用户: 找出消费金额最高的 10 个用户

Claude 会自动:
1. 查看相关表结构
2. 生成 JOIN 查询
3. 执行并返回结果
```

## 安全建议

### 创建只读用户

```sql
-- 创建只读用户
CREATE USER 'mcp_readonly'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT ON mydb.* TO 'mcp_readonly'@'%';
FLUSH PRIVILEGES;
```

### 限制访问权限

```sql
-- 只允许特定 IP 访问
CREATE USER 'mcp_readonly'@'192.168.1.%' IDENTIFIED BY 'secure_password';
GRANT SELECT ON mydb.* TO 'mcp_readonly'@'192.168.1.%';
```

## 支持的版本

- MySQL 5.7+
- MySQL 8.0+
- MariaDB 10.x+

## 注意事项

1. **字符集** - 建议使用 utf8mb4 字符集
2. **时区** - 注意服务器时区设置
3. **连接数** - 注意 max_connections 限制
4. **SSL** - 生产环境建议启用 SSL 连接

## 连接稳定性

MCP 服务内置了完善的连接管理机制，无需额外配置：

- **连接池** - 使用 mysql2 连接池（最大 3 个连接），自动管理连接生命周期
- **TCP Keep-Alive** - 启用 TCP 保活机制（30 秒初始延迟），防止连接被服务端 `wait_timeout` 关闭
- **断线自动重试** - 检测到连接断开（如 `Connection in closed state`、`ECONNRESET`）时自动重试
- 已彻底解决 `Can't add new command when connection is in closed state` 问题

## 常见问题

### 连接超时

检查防火墙和安全组设置，确保端口 3306 可访问。

### 权限不足

确保用户有足够的权限访问目标数据库和表。

### 字符编码问题

确保数据库、表和连接都使用 utf8mb4 编码。
