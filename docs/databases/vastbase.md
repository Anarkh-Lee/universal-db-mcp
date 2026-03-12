# Vastbase 数据库使用指南

## 📖 关于 Vastbase

Vastbase 是北京海量数据技术股份有限公司自主研发的企业级关系型数据库管理系统。Vastbase 基于 PostgreSQL 开发，完全兼容 PostgreSQL 协议，支持国产化替代，广泛应用于政府、金融、电信等行业。

### 主要特点

- **PostgreSQL 兼容**：完全兼容 PostgreSQL 协议和语法
- **国产自主**：支持国产操作系统和芯片
- **企业级特性**：高可用、分布式、数据加密
- **高性能**：优化的查询引擎和存储引擎
- **安全可靠**：完善的审计和权限管理

## 🚀 快速开始

### 1. 安装 Vastbase

#### 在 Linux 上安装

```bash
# 下载 Vastbase 安装包（从官网获取）
# 解压安装包
tar -xzf vastbase-xxx.tar.gz

# 进入安装目录
cd vastbase-xxx

# 执行安装脚本
./install.sh

# 初始化数据库
vastbase-initdb -D /path/to/data

# 启动数据库
vastbase-ctl start -D /path/to/data
```

#### 使用 Docker

```bash
# 拉取 Vastbase 镜像（如果有官方镜像）
docker pull vastbase/vastbase:latest

# 启动 Vastbase 容器
docker run -d --name vastbase-server \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=your_password \
  vastbase/vastbase:latest
```

### 2. 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### 基础配置（只读模式）

```json
{
  "mcpServers": {
    "vastbase-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "vastbase",
        "--host", "localhost",
        "--port", "5432",
        "--user", "vastbase",
        "--password", "your_password",
        "--database", "postgres"
      ]
    }
  }
}
```

#### 启用写入模式（开发环境）

```json
{
  "mcpServers": {
    "vastbase-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--permission-mode", "full",
        "--type", "vastbase",
        "--host", "localhost",
        "--port", "5432",
        "--user", "vastbase",
        "--password", "your_password",
        "--database", "mydb"
      ]
    }
  }
}
```

#### 连接 Vastbase 集群

```json
{
  "mcpServers": {
    "vastbase-cluster": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "vastbase",
        "--host", "vastbase-cluster.example.com",
        "--port", "5432",
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
你：帮我查看 Vastbase 数据库的所有表
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
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.name
HAVING SUM(o.amount) > 1000
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

## 🔧 Vastbase 特性支持

### 1. PostgreSQL 兼容性

Vastbase 完全兼容 PostgreSQL 协议：

```sql
-- 标准 PostgreSQL 语法
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50),
    salary NUMERIC(10, 2),
    hire_date DATE
);

-- 创建索引
CREATE INDEX idx_department ON employees(department);

-- 查询
SELECT * FROM employees WHERE department = 'IT';
```

### 2. 分区表

Vastbase 支持表分区：

```sql
-- 创建分区表
CREATE TABLE orders (
    id SERIAL,
    user_id INTEGER,
    amount NUMERIC(10, 2),
    created_at DATE
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE orders_2024_01 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_2024_02 PARTITION OF orders
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### 3. 事务支持

Vastbase 支持完整的 ACID 事务：

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### 4. JSON 支持

Vastbase 支持 JSON 和 JSONB 数据类型：

```sql
-- 创建包含 JSON 的表
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    attributes JSONB
);

-- 插入 JSON 数据
INSERT INTO products (name, attributes) VALUES
    ('Product A', '{"color": "red", "size": "large"}');

-- 查询 JSON 数据
SELECT * FROM products WHERE attributes->>'color' = 'red';
```

## 📊 性能优化建议

### 1. 使用 EXPLAIN 分析查询

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE age > 18;
```

### 2. 创建合适的索引

```sql
-- 单列索引
CREATE INDEX idx_age ON users(age);

-- 复合索引
CREATE INDEX idx_name_age ON users(name, age);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
```

### 3. 使用 ANALYZE 更新统计信息

```sql
ANALYZE users;
ANALYZE;  -- 分析所有表
```

### 4. 定期执行 VACUUM

```sql
VACUUM users;
VACUUM FULL;  -- 完全清理
VACUUM ANALYZE;  -- 清理并更新统计信息
```

### 5. 批量插入优化

```sql
-- 使用批量插入
INSERT INTO users (name, email) VALUES
    ('user1', 'user1@example.com'),
    ('user2', 'user2@example.com'),
    ('user3', 'user3@example.com');

-- 使用 COPY 命令（更快）
COPY users (name, email) FROM '/path/to/data.csv' CSV;
```

## 🔒 安全建议

### 1. 使用只读模式

默认情况下，MCP 连接器运行在只读模式：

```json
{
  "args": [
    "universal-db-mcp",
    "--type", "vastbase",
    "--host", "localhost",
    "--port", "5432",
    "--user", "readonly_user",
    "--password", "password",
    "--database", "production"
  ]
}
```

### 2. 创建只读用户

```sql
-- 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'password';

-- 授予只读权限
GRANT CONNECT ON DATABASE mydb TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO readonly_user;
```

### 3. 使用 SSL/TLS 连接

Vastbase 支持 SSL/TLS 加密连接：

```sql
-- 在 postgresql.conf 中启用 SSL
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

### 4. 限制网络访问

在 `pg_hba.conf` 中配置访问控制：

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             all             192.168.1.0/24          md5
host    all             all             ::1/128                 md5
```

### 5. 启用审计日志

```sql
-- 启用审计日志
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- 重新加载配置
SELECT pg_reload_conf();
```

## 🐛 常见问题

### 1. 连接失败

**问题**：无法连接到 Vastbase 数据库

**解决方案**：
- 检查 Vastbase 服务是否正在运行
- 检查端口是否正确（默认 5432）
- 检查防火墙设置
- 验证用户名和密码
- 检查 `pg_hba.conf` 配置

### 2. 连接断开

**问题**：长时间空闲后出现 `Connection terminated unexpectedly`

**说明**：MCP 服务已内置连接池 + TCP Keep-Alive + 断线自动重试机制，正常情况下不会出现此问题。如果仍然出现，请检查网络环境是否存在强制断开空闲连接的策略。

### 3. 查询超时

**问题**：大查询执行超时

**解决方案**：
- 增加超时时间：`SET statement_timeout = '600s';`
- 优化查询，添加合适的索引
- 使用 LIMIT 限制返回结果数量
- 考虑使用分区表

### 3. 字符编码问题

**问题**：中文显示乱码

**解决方案**：
- 确保数据库使用 UTF-8 编码：
  ```sql
  CREATE DATABASE mydb WITH ENCODING 'UTF8';
  ```

### 4. 性能问题

**问题**：查询性能慢

**解决方案**：
- 使用 EXPLAIN ANALYZE 分析查询
- 创建合适的索引
- 定期执行 VACUUM 和 ANALYZE
- 优化查询语句
- 考虑使用物化视图

## 📚 参考资源

- [Vastbase 官方网站](http://www.vastdata.com.cn/)
- [Vastbase 产品文档](http://www.vastdata.com.cn/product/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [海量数据技术支持](http://www.vastdata.com.cn/support/)

## 🆚 Vastbase vs PostgreSQL

| 特性 | Vastbase | PostgreSQL |
|------|----------|------------|
| 协议兼容 | ✅ 完全兼容 | - |
| 国产化 | ✅ 支持 | ❌ 不支持 |
| 企业支持 | ✅ 商业支持 | ⚠️ 社区支持 |
| 高可用 | ✅ 内置支持 | ⚠️ 需要额外配置 |
| 数据加密 | ✅ TDE 支持 | ⚠️ 有限支持 |
| 审计日志 | ✅ 完善 | ⚠️ 基础 |
| 成本 | ⚠️ 商业授权 | ✅ 开源免费 |

## 💡 最佳实践

### 1. 数据库设计

- 使用合适的数据类型
- 合理设计主键和外键
- 使用分区表处理大数据量
- 避免过度规范化

### 2. 查询优化

- 避免 SELECT *，只查询需要的列
- 使用 LIMIT 限制返回结果
- 合理使用索引
- 避免在 WHERE 子句中使用函数

### 3. 连接管理

- 使用连接池（如 pgBouncer）
- 合理设置连接数
- 使用长连接减少连接开销
- 定期检查连接健康状态

### 4. 监控和维护

- 监控数据库性能指标
- 定期执行 VACUUM
- 更新统计信息（ANALYZE）
- 定期备份数据
- 监控慢查询日志

### 5. 安全管理

- 使用强密码
- 限制网络访问
- 启用 SSL 连接
- 定期审计日志
- 遵循最小权限原则

## 🎯 适用场景

### 适合使用 Vastbase 的场景

- ✅ 国产化替代需求
- ✅ 政府、金融、电信行业
- ✅ 需要商业支持的企业
- ✅ 对安全性要求高的场景
- ✅ 需要完善审计功能
- ✅ PostgreSQL 迁移

### 不适合使用 Vastbase 的场景

- ❌ 预算非常有限
- ❌ 小型个人项目
- ❌ 不需要商业支持
- ❌ 对国产化无要求

## 🌟 Vastbase 特色功能

### 1. 国产化支持

- 支持国产操作系统（麒麟、统信等）
- 支持国产芯片（鲲鹏、飞腾等）
- 完全自主可控

### 2. 企业级高可用

- 主备切换
- 自动故障转移
- 数据同步复制

### 3. 数据加密

- 透明数据加密（TDE）
- 列级加密
- 传输加密

### 4. 审计日志

- 完善的审计日志
- 操作记录追溯
- 合规性支持

### 5. 性能优化

- 查询优化器增强
- 并行查询支持
- 智能索引推荐

---

**提示**：Vastbase 是国产数据库的优秀代表，特别适合有国产化替代需求的企业和政府机构。如果您需要商业支持和完善的企业级特性，Vastbase 是一个很好的选择。
