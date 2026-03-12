# TiDB 数据库使用指南

## 📖 关于 TiDB

TiDB 是 PingCAP 公司开发的开源分布式 NewSQL 数据库，支持水平扩展、分布式事务和高可用性。TiDB 兼容 MySQL 5.7 协议和生态，可以无缝替换 MySQL。

### 主要特点

- **MySQL 兼容**：兼容 MySQL 5.7 协议和语法
- **水平扩展**：支持在线水平扩展，无需停机
- **分布式事务**：支持 ACID 事务，保证数据一致性
- **高可用**：自动故障转移，无单点故障
- **HTAP**：同时支持 OLTP 和 OLAP 工作负载

## 🚀 快速开始

### 1. 安装 TiDB

#### 使用 TiUP（推荐）

```bash
# 安装 TiUP
curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh

# 启动本地测试集群
tiup playground
```

#### 使用 Docker

```bash
# 拉取 TiDB 镜像
docker pull pingcap/tidb:latest

# 启动 TiDB 容器
docker run -d --name tidb-server \
  -p 4000:4000 \
  -p 10080:10080 \
  pingcap/tidb:latest
```

### 2. 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### 基础配置（只读模式）

```json
{
  "mcpServers": {
    "tidb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "tidb",
        "--host", "localhost",
        "--port", "4000",
        "--user", "root",
        "--password", "",
        "--database", "test"
      ]
    }
  }
}
```

#### 启用写入模式（开发环境）

```json
{
  "mcpServers": {
    "tidb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--permission-mode", "full",
        "--type", "tidb",
        "--host", "localhost",
        "--port", "4000",
        "--user", "root",
        "--password", "",
        "--database", "test"
      ]
    }
  }
}
```

#### 连接 TiDB Cloud

```json
{
  "mcpServers": {
    "tidb-cloud": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "tidb",
        "--host", "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
        "--port", "4000",
        "--user", "your_username",
        "--password", "your_password",
        "--database", "test"
      ]
    }
  }
}
```

### 3. 重启 Claude Desktop

配置完成后，重启 Claude Desktop 使配置生效。

## 💡 使用示例

### 查询数据库结构

```
你：帮我查看 TiDB 数据库的所有表
```

Claude 会自动调用 `get_schema` 工具获取数据库结构。

### 查询数据

```
你：查询 users 表中的所有用户
```

Claude 会生成并执行：
```sql
SELECT * FROM users;
```

### 聚合查询

```
你：统计每个部门的员工数量
```

Claude 会生成并执行：
```sql
SELECT department, COUNT(*) as employee_count
FROM employees
GROUP BY department;
```

### 复杂查询

```
你：找出最近 30 天内消费金额超过 1000 元的用户，按消费金额降序排列
```

Claude 会生成并执行：
```sql
SELECT u.id, u.name, SUM(o.amount) as total_amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.name
HAVING total_amount > 1000
ORDER BY total_amount DESC;
```

### 写入操作（需要 --permission-mode readwrite 或 full）

```
你：在 users 表中插入一条新用户记录，姓名为张三，邮箱为 zhangsan@example.com
```

Claude 会生成并执行：
```sql
INSERT INTO users (name, email) VALUES ('张三', 'zhangsan@example.com');
```

## 🔧 TiDB 特性支持

### 1. 分布式事务

TiDB 支持完整的 ACID 事务：

```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### 2. 分区表

TiDB 支持 Range、Hash、List 分区：

```sql
CREATE TABLE employees (
    id INT NOT NULL,
    fname VARCHAR(30),
    lname VARCHAR(30),
    hired DATE NOT NULL DEFAULT '1970-01-01',
    separated DATE NOT NULL DEFAULT '9999-12-31',
    job_code INT NOT NULL,
    store_id INT NOT NULL
)
PARTITION BY RANGE (YEAR(separated)) (
    PARTITION p0 VALUES LESS THAN (1991),
    PARTITION p1 VALUES LESS THAN (1996),
    PARTITION p2 VALUES LESS THAN (2001),
    PARTITION p3 VALUES LESS THAN MAXVALUE
);
```

### 3. 列式存储（TiFlash）

TiDB 支持行列混合存储，可以为表添加 TiFlash 副本以加速 OLAP 查询：

```sql
-- 为表添加 TiFlash 副本
ALTER TABLE table_name SET TIFLASH REPLICA 1;

-- 查询会自动使用 TiFlash
SELECT COUNT(*) FROM large_table WHERE date > '2024-01-01';
```

### 4. 全文索引

TiDB 支持全文索引（需要 TiDB 6.6+）：

```sql
CREATE TABLE articles (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    body TEXT,
    FULLTEXT INDEX ft_index (title, body)
);

-- 全文搜索
SELECT * FROM articles WHERE MATCH(title, body) AGAINST('TiDB 分布式数据库');
```

## 📊 性能优化建议

### 1. 使用 EXPLAIN 分析查询

```sql
EXPLAIN SELECT * FROM users WHERE age > 18;
```

### 2. 创建合适的索引

```sql
-- 单列索引
CREATE INDEX idx_age ON users(age);

-- 复合索引
CREATE INDEX idx_name_age ON users(name, age);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);
```

### 3. 使用 ANALYZE 更新统计信息

```sql
ANALYZE TABLE users;
```

### 4. 批量插入优化

```sql
-- 使用批量插入而不是单条插入
INSERT INTO users (name, email) VALUES
    ('user1', 'user1@example.com'),
    ('user2', 'user2@example.com'),
    ('user3', 'user3@example.com');
```

## 🔒 安全建议

### 1. 使用只读模式

默认情况下，MCP 连接器运行在只读模式，这是最安全的方式：

```json
{
  "args": [
    "universal-db-mcp",
    "--type", "tidb",
    "--host", "localhost",
    "--port", "4000",
    "--user", "readonly_user",
    "--password", "password",
    "--database", "production"
  ]
}
```

### 2. 创建只读用户

```sql
-- 创建只读用户
CREATE USER 'readonly_user'@'%' IDENTIFIED BY 'password';

-- 授予只读权限
GRANT SELECT ON database_name.* TO 'readonly_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;
```

### 3. 使用 SSL/TLS 连接

TiDB 支持 SSL/TLS 加密连接，保护数据传输安全。

### 4. 限制网络访问

- 使用防火墙限制 TiDB 端口（4000）的访问
- 仅允许可信 IP 地址连接
- 在生产环境中使用 VPN 或专线

## 🐛 常见问题

### 1. 连接失败

**问题**：无法连接到 TiDB 数据库

**解决方案**：
- 检查 TiDB 服务是否正在运行：`tiup status`
- 检查端口是否正确（默认 4000）
- 检查防火墙设置
- 验证用户名和密码

### 2. 连接断开

**问题**：长时间空闲后出现 `Can't add new command when connection is in closed state`

**说明**：MCP 服务已内置连接池 + TCP Keep-Alive + 断线自动重试机制，正常情况下不会出现此问题。如果仍然出现，请检查网络环境是否存在强制断开空闲连接的策略。

### 3. 查询超时

**问题**：大查询执行超时

**解决方案**：
- 增加超时时间：`SET SESSION tidb_query_timeout = 600;`
- 优化查询，添加合适的索引
- 使用 LIMIT 限制返回结果数量

### 3. 字符编码问题

**问题**：中文显示乱码

**解决方案**：
- 确保数据库使用 UTF-8 编码：
  ```sql
  CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### 4. 与 MySQL 的差异

**问题**：某些 MySQL 语法在 TiDB 中不支持

**解决方案**：
- 查看 [TiDB 与 MySQL 兼容性对比](https://docs.pingcap.com/zh/tidb/stable/mysql-compatibility)
- 使用 TiDB 支持的替代语法
- 避免使用触发器、存储过程等 TiDB 不支持的特性

## 📚 参考资源

- [TiDB 官方文档](https://docs.pingcap.com/zh/tidb/stable)
- [TiDB 快速上手](https://docs.pingcap.com/zh/tidb/stable/quick-start-with-tidb)
- [TiDB Cloud](https://tidbcloud.com/)
- [TiDB GitHub](https://github.com/pingcap/tidb)
- [TiDB 社区](https://asktug.com/)

## 🆚 TiDB vs MySQL

| 特性 | TiDB | MySQL |
|------|------|-------|
| 水平扩展 | ✅ 原生支持 | ❌ 需要分库分表 |
| 分布式事务 | ✅ 原生支持 | ❌ 不支持 |
| 高可用 | ✅ 自动故障转移 | ⚠️ 需要额外配置 |
| HTAP | ✅ 支持 | ❌ 不支持 |
| 协议兼容 | ✅ MySQL 5.7 | - |
| 触发器 | ❌ 不支持 | ✅ 支持 |
| 存储过程 | ❌ 不支持 | ✅ 支持 |
| 外键 | ⚠️ 部分支持 | ✅ 支持 |

## 💡 最佳实践

### 1. 表设计

- 使用自增主键或 UUID
- 避免使用过大的主键
- 合理设计分区策略
- 使用合适的数据类型

### 2. 查询优化

- 避免 SELECT *，只查询需要的列
- 使用 LIMIT 限制返回结果
- 合理使用索引
- 避免在 WHERE 子句中使用函数

### 3. 监控和维护

- 定期运行 ANALYZE TABLE 更新统计信息
- 监控慢查询日志
- 使用 TiDB Dashboard 监控集群状态
- 定期备份数据

### 4. 开发建议

- 在开发环境测试所有查询
- 使用参数化查询防止 SQL 注入
- 合理使用事务，避免长事务
- 注意 TiDB 与 MySQL 的差异

---

**提示**：如果遇到问题，可以在 [TiDB 社区](https://asktug.com/) 寻求帮助，或查看 [官方文档](https://docs.pingcap.com/zh/tidb/stable)。
