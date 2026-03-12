# PolarDB 数据库使用指南

## 📖 关于 PolarDB

PolarDB 是阿里云自研的云原生关系型数据库，采用存储计算分离、软硬一体化设计。PolarDB 有三个版本：PolarDB for MySQL、PolarDB for PostgreSQL 和 PolarDB for Oracle。本指南主要介绍 PolarDB for MySQL 版本。

### 主要特点

- **云原生架构**：存储与计算分离，资源独立扩展
- **完全兼容 MySQL**：兼容 MySQL 5.6/5.7/8.0 协议和语法
- **一写多读**：支持一个主节点和最多 15 个只读节点
- **秒级弹性**：计算节点秒级扩展，无需停机
- **高性能**：读性能最高可达百万 QPS
- **高可用**：RPO=0，RTO<60秒

## 🚀 快速开始

### 1. 创建 PolarDB 实例

#### 通过阿里云控制台

1. 登录阿里云控制台
2. 进入 PolarDB 控制台
3. 点击"创建实例"
4. 选择版本（MySQL 5.6/5.7/8.0）
5. 配置规格和存储
6. 设置网络和安全组
7. 创建实例

#### 获取连接地址

PolarDB 提供三种连接地址：

- **主地址（Primary Endpoint）**：支持读写操作
- **集群地址（Cluster Endpoint）**：自动读写分离
- **只读地址（Read-only Endpoint）**：只支持读操作

### 2. 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### 基础配置（只读模式）

```json
{
  "mcpServers": {
    "polardb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "polardb",
        "--host", "pc-xxxxx.mysql.polardb.rds.aliyuncs.com",
        "--port", "3306",
        "--user", "your_username",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

#### 启用写入模式（开发环境）

```json
{
  "mcpServers": {
    "polardb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--permission-mode", "full",
        "--type", "polardb",
        "--host", "pc-xxxxx.mysql.polardb.rds.aliyuncs.com",
        "--port", "3306",
        "--user", "your_username",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

#### 读写分离配置（推荐）

```json
{
  "mcpServers": {
    "polardb-primary": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--permission-mode", "full",
        "--type", "polardb",
        "--host", "pc-xxxxx.mysql.polardb.rds.aliyuncs.com",
        "--port", "3306",
        "--user", "your_username",
        "--password", "your_password",
        "--database", "your_database"
      ]
    },
    "polardb-readonly": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "polardb",
        "--host", "pc-xxxxx-ro.mysql.polardb.rds.aliyuncs.com",
        "--port", "3306",
        "--user", "readonly_user",
        "--password", "readonly_password",
        "--database", "your_database"
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
你：帮我查看 PolarDB 数据库的所有表
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

## 🔧 PolarDB 特性支持

### 1. 读写分离

PolarDB 支持一写多读架构：

```sql
-- 写操作（使用主地址）
INSERT INTO orders (user_id, amount) VALUES (1, 100);

-- 读操作（使用只读地址）
SELECT * FROM orders WHERE user_id = 1;
```

### 2. 并行查询

PolarDB 支持并行查询加速大表扫描：

```sql
-- 启用并行查询
SET max_parallel_degree = 4;

-- 执行大表查询
SELECT COUNT(*) FROM large_table WHERE date > '2024-01-01';
```

### 3. 全局一致性

PolarDB 支持分布式事务：

```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### 4. 热备份

PolarDB 支持在线备份，不影响业务：

```sql
-- 查看备份列表（通过阿里云控制台）
-- 恢复到指定时间点（通过阿里云控制台）
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

### 5. 读写分离

- 写操作使用主地址
- 读操作使用只读地址或集群地址
- 分析查询使用只读节点

## 🔒 安全建议

### 1. 使用只读模式

默认情况下，MCP 连接器运行在只读模式：

```json
{
  "args": [
    "universal-db-mcp",
    "--type", "polardb",
    "--host", "pc-xxxxx-ro.mysql.polardb.rds.aliyuncs.com",
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

PolarDB 支持 SSL/TLS 加密连接，保护数据传输安全。

### 4. 设置白名单

- 在阿里云控制台设置 IP 白名单
- 仅允许可信 IP 地址连接
- 使用 VPC 网络隔离

### 5. 使用 RAM 账号

- 使用阿里云 RAM 账号管理权限
- 遵循最小权限原则
- 定期审计访问日志

## 🐛 常见问题

### 1. 连接失败

**问题**：无法连接到 PolarDB 数据库

**解决方案**：
- 检查 PolarDB 实例是否正在运行
- 检查 IP 白名单设置
- 验证用户名和密码
- 检查网络连接（VPC/公网）

### 2. 连接断开

**问题**：长时间空闲后出现 `Can't add new command when connection is in closed state`

**说明**：MCP 服务已内置连接池 + TCP Keep-Alive + 断线自动重试机制，正常情况下不会出现此问题。如果仍然出现，请检查网络环境是否存在强制断开空闲连接的策略。

### 3. 查询超时

**问题**：大查询执行超时

**解决方案**：
- 增加超时时间
- 优化查询，添加合适的索引
- 使用 LIMIT 限制返回结果数量
- 使用只读节点执行分析查询

### 3. 字符编码问题

**问题**：中文显示乱码

**解决方案**：
- 确保数据库使用 UTF-8 编码：
  ```sql
  CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### 4. 读写分离延迟

**问题**：只读节点数据延迟

**解决方案**：
- PolarDB 的复制延迟通常在毫秒级
- 如需强一致性，使用主地址
- 监控复制延迟指标

## 📚 参考资源

- [PolarDB 官方文档](https://help.aliyun.com/product/58609.html)
- [PolarDB 快速入门](https://help.aliyun.com/document_detail/58764.html)
- [PolarDB 最佳实践](https://help.aliyun.com/document_detail/118089.html)
- [阿里云控制台](https://polardb.console.aliyun.com/)

## 🆚 PolarDB vs MySQL

| 特性 | PolarDB | MySQL |
|------|---------|-------|
| 架构 | 存储计算分离 | 传统架构 |
| 扩展性 | ✅ 秒级弹性扩展 | ❌ 需要停机 |
| 读性能 | ✅ 最高百万 QPS | ⚠️ 受限于单机 |
| 高可用 | ✅ RPO=0, RTO<60s | ⚠️ 需要额外配置 |
| 存储容量 | ✅ 最高 100TB | ⚠️ 受限于磁盘 |
| 协议兼容 | ✅ 完全兼容 | - |
| 成本 | ⚠️ 按需付费 | ✅ 开源免费 |

## 💡 最佳实践

### 1. 架构设计

- 使用读写分离架构
- 写操作使用主地址
- 读操作使用只读地址
- 分析查询使用只读节点

### 2. 查询优化

- 避免 SELECT *，只查询需要的列
- 使用 LIMIT 限制返回结果
- 合理使用索引
- 避免在 WHERE 子句中使用函数

### 3. 连接管理

- 使用连接池
- 合理设置连接池大小
- 使用长连接减少连接开销
- 定期检查连接健康状态

### 4. 监控和维护

- 监控 CPU、内存、IOPS
- 设置慢查询告警
- 关注连接数使用情况
- 定期查看性能洞察
- 定期备份数据

### 5. 成本优化

- 使用 Serverless 版本按需付费
- 合理配置计算规格
- 使用存储包降低成本
- 定期清理无用数据

## 🎯 适用场景

### 适合使用 PolarDB 的场景

- ✅ 云原生应用
- ✅ 高并发读写场景
- ✅ 需要弹性扩展的业务
- ✅ 对高可用有要求的业务
- ✅ 大数据量存储
- ✅ 读写分离场景

### 不适合使用 PolarDB 的场景

- ❌ 本地部署需求
- ❌ 预算非常有限
- ❌ 数据量很小的应用
- ❌ 对云服务有顾虑

## 🌟 PolarDB 特色功能

### 1. 存储计算分离

- 存储和计算资源独立扩展
- 存储容量自动扩展
- 计算节点秒级扩展

### 2. 一写多读

- 支持一个主节点
- 最多 15 个只读节点
- 自动负载均衡

### 3. 全局一致性

- 分布式事务支持
- 强一致性保证
- 跨节点数据一致

### 4. 并行查询

- 自动并行查询优化
- 加速大表扫描
- 提升分析性能

### 5. 热备份

- 在线备份不影响业务
- 秒级恢复
- 支持时间点恢复

---

**提示**：PolarDB 是阿里云的云原生数据库，提供了强大的性能和弹性能力。如果您的应用部署在阿里云上，PolarDB 是一个很好的选择。
