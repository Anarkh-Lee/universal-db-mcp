# GoldenDB 数据库使用指南

## 📖 关于 GoldenDB

GoldenDB 是中兴通讯自主研发的企业级分布式关系型数据库，完全兼容 MySQL 协议。GoldenDB 采用分布式架构，支持水平扩展、分布式事务和高可用性，广泛应用于电信、金融等行业。

### 主要特点

- **MySQL 兼容**：完全兼容 MySQL 5.7/8.0 协议和语法
- **分布式架构**：支持水平扩展和分布式事务
- **高可用**：支持主备切换和自动故障转移
- **高性能**：优化的查询引擎，支持高并发
- **电信级可靠性**：满足电信级可靠性要求
- **国产化**：支持国产操作系统和芯片

## 🚀 快速开始

### 1. 安装 GoldenDB

#### 在 Linux 上安装

```bash
# 下载 GoldenDB 安装包（从官网或中兴获取）
# 解压安装包
tar -xzf goldendb-xxx.tar.gz

# 进入安装目录
cd goldendb-xxx

# 执行安装脚本
./install.sh

# 初始化数据库
./bin/mysqld --initialize-insecure

# 启动数据库
./bin/mysqld_safe &
```

#### 使用 Docker

```bash
# 拉取 GoldenDB 镜像（如果有官方镜像）
docker pull goldendb/goldendb:latest

# 启动 GoldenDB 容器
docker run -d --name goldendb-server \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=your_password \
  goldendb/goldendb:latest
```

### 2. 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### 基础配置（只读模式）

```json
{
  "mcpServers": {
    "goldendb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "goldendb",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
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
    "goldendb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--permission-mode", "full",
        "--type", "goldendb",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "mydb"
      ]
    }
  }
}
```

#### 连接 GoldenDB 分布式集群

```json
{
  "mcpServers": {
    "goldendb-cluster": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "goldendb",
        "--host", "goldendb-cluster.example.com",
        "--port", "3306",
        "--user", "your_username",
        "--password", "your_password",
        "--database", "production"
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
你：帮我查看 GoldenDB 数据库的所有表
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

## 🔧 GoldenDB 特性支持

### 1. 分布式事务

GoldenDB 支持分布式事务：

```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### 2. 分库分表

GoldenDB 支持自动分库分表：

```sql
-- 创建分片表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    amount DECIMAL(10, 2),
    created_at DATETIME
) SHARD_KEY(user_id);
```

### 3. 读写分离

GoldenDB 支持读写分离架构：

```sql
-- 写操作（使用主节点）
INSERT INTO orders (user_id, amount) VALUES (1, 100);

-- 读操作（可以使用只读节点）
SELECT * FROM orders WHERE user_id = 1;
```

### 4. 高可用

GoldenDB 支持主备切换和自动故障转移。

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

### 5. 合理设计分片键

- 选择分布均匀的列作为分片键
- 避免热点数据
- 考虑查询模式

## 🔒 安全建议

### 1. 使用只读模式

默认情况下，MCP 连接器运行在只读模式：

```json
{
  "args": [
    "universal-db-mcp",
    "--type", "goldendb",
    "--host", "localhost",
    "--port", "3306",
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

GoldenDB 支持 SSL/TLS 加密连接，保护数据传输安全。

### 4. 限制网络访问

- 使用防火墙限制 GoldenDB 端口（3306）的访问
- 仅允许可信 IP 地址连接
- 在生产环境中使用 VPN 或专线

## 🐛 常见问题

### 1. 连接失败

**问题**：无法连接到 GoldenDB 数据库

**解决方案**：
- 检查 GoldenDB 服务是否正在运行
- 检查端口是否正确（默认 3306）
- 检查防火墙设置
- 验证用户名和密码

### 2. 连接断开

**问题**：长时间空闲后出现 `Can't add new command when connection is in closed state`

**说明**：MCP 服务已内置连接池 + TCP Keep-Alive + 断线自动重试机制，正常情况下不会出现此问题。如果仍然出现，请检查网络环境是否存在强制断开空闲连接的策略。

### 3. 查询超时

**问题**：大查询执行超时

**解决方案**：
- 增加超时时间
- 优化查询，添加合适的索引
- 使用 LIMIT 限制返回结果数量
- 考虑使用分区表

### 3. 字符编码问题

**问题**：中文显示乱码

**解决方案**：
- 确保数据库使用 UTF-8 编码：
  ```sql
  CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### 4. 分布式查询性能

**问题**：跨分片查询性能差

**解决方案**：
- 优化分片键设计
- 避免跨分片 JOIN
- 使用全局表存储小表
- 考虑数据冗余

## 📚 参考资源

- [中兴通讯官网](https://www.zte.com.cn/)
- [GoldenDB 产品介绍](https://www.zte.com.cn/china/products/database/)
- [MySQL 官方文档](https://dev.mysql.com/doc/)

## 🆚 GoldenDB vs MySQL

| 特性 | GoldenDB | MySQL |
|------|----------|-------|
| 架构 | 分布式架构 | 单机架构 |
| 水平扩展 | ✅ 原生支持 | ❌ 需要分库分表 |
| 分布式事务 | ✅ 原生支持 | ❌ 不支持 |
| 高可用 | ✅ 自动故障转移 | ⚠️ 需要额外配置 |
| 协议兼容 | ✅ MySQL 5.7/8.0 | - |
| 国产化 | ✅ 支持 | ❌ 不支持 |
| 成本 | ⚠️ 商业授权 | ✅ 开源免费 |

## 💡 最佳实践

### 1. 分片设计

- 选择合适的分片键
- 保证数据分布均匀
- 避免热点数据
- 考虑业务查询模式

### 2. 查询优化

- 避免 SELECT *，只查询需要的列
- 使用 LIMIT 限制返回结果
- 合理使用索引
- 避免跨分片查询

### 3. 事务管理

- 合理使用分布式事务
- 避免长事务
- 注意事务隔离级别
- 处理分布式死锁

### 4. 监控和维护

- 监控集群状态
- 关注分片数据分布
- 定期检查慢查询
- 定期备份数据

### 5. 高可用配置

- 配置主备节点
- 启用自动故障转移
- 定期演练故障切换
- 监控节点健康状态

## 🎯 适用场景

### 适合使用 GoldenDB 的场景

- ✅ 电信行业应用
- ✅ 金融交易系统
- ✅ 大规模分布式应用
- ✅ 需要水平扩展的业务
- ✅ 高并发读写场景
- ✅ 国产化替代需求

### 不适合使用 GoldenDB 的场景

- ❌ 小型单机应用
- ❌ 预算非常有限
- ❌ 数据量很小的应用
- ❌ 不需要分布式特性

---

**提示**：GoldenDB 是中兴通讯的分布式数据库，特别适合电信、金融等行业的大规模应用场景。如果您需要分布式架构和商业支持，GoldenDB 是一个很好的选择。
