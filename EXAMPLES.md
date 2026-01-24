# 使用示例

本文档提供 MCP 数据库万能连接器的详细使用示例。

## 📋 目录

- [MySQL 使用示例](#mysql-使用示例)
- [PostgreSQL 使用示例](#postgresql-使用示例)
- [Redis 使用示例](#redis-使用示例)
- [Oracle 使用示例](#oracle-使用示例)
- [达梦 使用示例](#达梦-使用示例)
- [SQL Server 使用示例](#sql-server-使用示例)
- [MongoDB 使用示例](#mongodb-使用示例)
- [Claude Desktop 配置示例](#claude-desktop-配置示例)
- [常见使用场景](#常见使用场景)

---

## MySQL 使用示例

### 基础配置（只读模式）

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
        "--database", "myapp_db"
      ]
    }
  }
}
```

### 启用写入模式（谨慎使用）

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
        "--danger-allow-write"
      ]
    }
  }
}
```

### 与 Claude 对话示例

**用户**: 帮我查看 users 表的结构

**Claude 会自动**:
1. 调用 `get_table_info` 工具
2. 返回表的列信息、主键、索引等

**用户**: 统计最近 7 天注册的用户数量

**Claude 会自动**:
1. 理解需求
2. 生成 SQL: `SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
3. 调用 `execute_query` 工具执行
4. 返回结果

---

## PostgreSQL 使用示例

### 基础配置

```json
{
  "mcpServers": {
    "postgres-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "your_password",
        "--database", "myapp"
      ]
    }
  }
}
```

### 连接远程数据库

```json
{
  "mcpServers": {
    "postgres-prod": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "db.example.com",
        "--port", "5432",
        "--user", "readonly_user",
        "--password", "secure_password",
        "--database", "production"
      ]
    }
  }
}
```

### 与 Claude 对话示例

**用户**: 找出订单金额最高的 10 个客户

**Claude 会自动**:
1. 调用 `get_schema` 了解表结构
2. 生成复杂的 JOIN 查询
3. 执行并返回结果

---

## Redis 使用示例

### 基础配置（无密码）

```json
{
  "mcpServers": {
    "redis-cache": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379"
      ]
    }
  }
}
```

### 带密码和数据库选择

```json
{
  "mcpServers": {
    "redis-session": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "redis_password",
        "--database", "1"
      ]
    }
  }
}
```

### 与 Claude 对话示例

**用户**: 查看所有以 "user:" 开头的键

**Claude 会执行**: `KEYS user:*`

**用户**: 获取 user:1001 的信息

**Claude 会执行**: `GET user:1001` 或 `HGETALL user:1001`（根据数据类型）

---

## Oracle 使用示例

### 基础配置（只读模式）

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "your_password",
        "--database", "XEPDB1"
      ]
    }
  }
}
```

### 使用 Service Name 连接

```json
{
  "mcpServers": {
    "oracle-prod": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "oracle-server.example.com",
        "--port", "1521",
        "--user", "app_user",
        "--password", "secure_password",
        "--database", "ORCL"
      ]
    }
  }
}
```

### 启用写入模式（谨慎使用）

```json
{
  "mcpServers": {
    "oracle-dev": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "dev_user",
        "--password", "dev_password",
        "--database", "DEVDB",
        "--danger-allow-write"
      ]
    }
  }
}
```

### 与 Claude 对话示例

**用户**: 帮我查看 EMPLOYEES 表的结构

**Claude 会自动**:
1. 调用 `get_table_info` 工具
2. 返回表的列信息、主键、索引等
3. 注意：Oracle 表名通常为大写

**用户**: 查询工资最高的 10 名员工

**Claude 会自动**:
1. 理解需求
2. 生成 SQL: `SELECT * FROM EMPLOYEES ORDER BY SALARY DESC FETCH FIRST 10 ROWS ONLY`
3. 调用 `execute_query` 工具执行
4. 返回结果

**用户**: 统计每个部门的员工数量

**Claude 会自动**:
1. 查看表结构
2. 生成 SQL: `SELECT DEPARTMENT_ID, COUNT(*) as EMP_COUNT FROM EMPLOYEES GROUP BY DEPARTMENT_ID`
3. 执行并返回结果



## 达梦 使用示例

### 基础配置（只读模式）

```json
{
  "mcpServers": {
    "dm-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "dm",
        "--host", "localhost",
        "--port", "5236",
        "--user", "SYSDBA",
        "--password", "SYSDBA",
        "--database", "DAMENG"
      ]
    }
  }
}
```

**注意**: 达梦数据库驱动 `dmdb` 会作为可选依赖自动安装。如果安装失败，请手动运行：

```bash
npm install -g dmdb
```

### 连接远程达梦数据库

```json
{
  "mcpServers": {
    "dm-prod": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "dm",
        "--host", "dm-server.example.com",
        "--port", "5236",
        "--user", "app_user",
        "--password", "secure_password",
        "--database", "PRODUCTION"
      ]
    }
  }
}
```

### 与 Claude 对话示例

**用户**: 查看数据库中的所有表

**Claude 会自动**:

1. 调用 `get_schema` 工具
2. 返回所有表的列表和基本信息

**用户**: 查询部门表中的所有记录

**Claude 会自动**:

1. 生成 SQL: `SELECT * FROM DEPT`
2. 执行查询并返回结果

**用户**: 统计每个部门的员工数量

**Claude 会自动**:

1. 理解需求
2. 生成 SQL: `SELECT DEPT_ID, COUNT(*) as EMP_COUNT FROM EMPLOYEES GROUP BY DEPT_ID`
3. 执行并返回结果

---

## SQL Server 使用示例

### 基础配置（只读模式）

```json
{
  "mcpServers": {
    "sqlserver-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "localhost",
        "--port", "1433",
        "--user", "sa",
        "--password", "YourPassword123",
        "--database", "master"
      ]
    }
  }
}
```

**提示**: 也可以使用 `--type mssql` 作为别名。

### 启用写入模式

```json
{
  "mcpServers": {
    "sqlserver-write": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "localhost",
        "--port", "1433",
        "--user", "sa",
        "--password", "YourPassword123",
        "--database", "MyDatabase",
        "--danger-allow-write"
      ]
    }
  }
}
```

### 连接 Azure SQL Database

```json
{
  "mcpServers": {
    "azure-sql": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "myserver.database.windows.net",
        "--port", "1433",
        "--user", "myadmin",
        "--password", "MyPassword123!",
        "--database", "mydatabase"
      ]
    }
  }
}
```

**注意**: 连接 Azure SQL Database 时会自动启用加密连接。

### 与 Claude 对话示例

**用户**: 查看数据库中有哪些表？

**Claude 会自动**:

1. 调用 `get_schema` 工具
2. 执行查询: `SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`
3. 返回表列表

**用户**: 查看 Users 表的结构

**Claude 会自动**:

1. 调用 `get_table_info` 工具
2. 返回列信息、主键、索引等详细信息

**用户**: 统计每个部门的员工数量

**Claude 会自动**:

1. 理解需求
2. 生成 SQL: `SELECT DepartmentID, COUNT(*) as EmployeeCount FROM Employees GROUP BY DepartmentID ORDER BY EmployeeCount DESC`
3. 执行并返回结果

**用户**: 查找最近一周创建的订单

**Claude 会自动**:

1. 生成 SQL: `SELECT * FROM Orders WHERE CreatedDate >= DATEADD(day, -7, GETDATE()) ORDER BY CreatedDate DESC`
2. 执行并返回结果

### 注意事项

1. **默认端口**: SQL Server 默认端口为 1433
2. **身份验证**: 支持 SQL Server 身份验证（用户名/密码）
3. **加密连接**: 连接 Azure SQL 时会自动启用加密，本地 SQL Server 默认不加密
4. **数据库名**: 必须指定数据库名（如 master、tempdb 或自定义数据库）
5. **权限**: 确保用户有足够的权限访问系统视图（INFORMATION_SCHEMA）
6. **参数化查询**: 支持 `?` 占位符,会自动转换为 SQL Server 的 `@param0` 语法

---

## MongoDB 使用示例

### 基础配置（只读模式）

```json
{
  "mcpServers": {
    "mongodb-db": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "admin",
        "--password", "your_password",
        "--database", "myapp"
      ]
    }
  }
}
```

### 无认证连接（开发环境）

```json
{
  "mcpServers": {
    "mongodb-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--database", "test"
      ]
    }
  }
}
```

### 启用写入模式

```json
{
  "mcpServers": {
    "mongodb-write": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "dev_user",
        "--password", "dev_password",
        "--database", "development",
        "--danger-allow-write"
      ]
    }
  }
}
```

### 连接 MongoDB Atlas

```json
{
  "mcpServers": {
    "mongodb-atlas": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "cluster0.xxxxx.mongodb.net",
        "--port", "27017",
        "--user", "myuser",
        "--password", "mypassword",
        "--database", "production"
      ]
    }
  }
}
```

### 查询格式

MongoDB 适配器支持两种查询格式：

#### 1. JSON 格式（推荐）

```json
{
  "collection": "users",
  "operation": "find",
  "query": {"age": {"$gt": 18}},
  "options": {"limit": 10}
}
```

#### 2. 简化格式

```javascript
db.users.find({"age": {"$gt": 18}})
```

### 与 Claude 对话示例

**用户**: 查看数据库中有哪些集合？

**Claude 会自动**:
1. 调用 `get_schema` 工具
2. 返回所有集合的列表和基本信息
3. 显示每个集合的文档数量和推断的字段结构

**用户**: 查询 users 集合中年龄大于 18 的用户

**Claude 会自动**:
1. 生成查询: `{"collection": "users", "operation": "find", "query": {"age": {"$gt": 18}}}`
2. 执行并返回结果

**用户**: 统计每个城市的用户数量

**Claude 会自动**:
1. 理解需求
2. 生成聚合查询:
```json
{
  "collection": "users",
  "operation": "aggregate",
  "pipeline": [
    {"$group": {"_id": "$city", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
  ]
}
```
3. 执行并返回结果

**用户**: 查找最近创建的 10 个订单

**Claude 会自动**:
1. 生成查询:
```json
{
  "collection": "orders",
  "operation": "find",
  "query": {},
  "options": {"sort": {"createdAt": -1}, "limit": 10}
}
```
2. 执行并返回结果

### 支持的操作

#### 查询操作（只读模式）
- `find` - 查询文档
- `findOne` - 查询单个文档
- `count` / `countDocuments` - 统计文档数量
- `distinct` - 获取字段的不同值
- `aggregate` - 聚合管道查询

#### 写入操作（需要 --danger-allow-write）
- `insert` / `insertOne` - 插入单个文档
- `insertMany` - 插入多个文档
- `update` / `updateOne` - 更新单个文档
- `updateMany` - 更新多个文档
- `delete` / `deleteOne` - 删除单个文档
- `deleteMany` - 删除多个文档

### 注意事项

1. **默认端口**: MongoDB 默认端口为 27017
2. **认证**: 支持用户名/密码认证，默认认证数据库为 admin
3. **集合结构**: MongoDB 是无模式数据库，Schema 信息通过采样文档推断
4. **ObjectId**: 查询结果中的 ObjectId 会自动转换为字符串
5. **查询语法**: 使用 MongoDB 原生查询语法，不是 SQL
6. **聚合管道**: 支持完整的聚合管道功能

---

## Claude Desktop 配置示例

### 同时连接多个数据库

你可以在 Claude Desktop 中同时配置多个数据库连接：

```json
{
  "mcpServers": {
    "mysql-prod": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "prod-db.example.com",
        "--port", "3306",
        "--user", "readonly",
        "--password", "prod_password",
        "--database", "production"
      ]
    },
    "postgres-analytics": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "analytics.example.com",
        "--port", "5432",
        "--user", "analyst",
        "--password", "analytics_password",
        "--database", "warehouse"
      ]
    },
    "redis-cache": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "cache.example.com",
        "--port", "6379",
        "--password", "cache_password"
      ]
    },
    "oracle-warehouse": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "oracle.example.com",
        "--port", "1521",
        "--user", "warehouse_user",
        "--password", "warehouse_password",
        "--database", "DWH"
      ]
    }
  }
}
```

重启 Claude Desktop 后，你可以在对话中指定使用哪个数据库：

- "在 MySQL 生产库中查询..."
- "从 PostgreSQL 分析库获取..."
- "检查 Redis 缓存中的..."
- "在 Oracle 数据仓库中统计..."

---

## 常见使用场景

### 1. 数据分析

**场景**: 快速分析业务数据

```
用户: 帮我分析最近一个月的销售趋势

Claude 会:
1. 查看 orders 表结构
2. 按日期分组统计订单金额
3. 生成趋势分析报告
```

### 2. 问题排查

**场景**: 排查生产问题

```
用户: 为什么用户 ID 12345 无法登录？

Claude 会:
1. 查询 users 表找到该用户
2. 检查 login_logs 表的最近记录
3. 分析可能的原因（账号状态、密码错误次数等）
```

### 3. 数据迁移准备

**场景**: 了解数据库结构以准备迁移

```
用户: 帮我生成所有表的结构文档

Claude 会:
1. 调用 get_schema 获取完整结构
2. 整理成 Markdown 格式的文档
3. 包含表名、列定义、索引、外键等信息
```

### 4. 性能优化建议

**场景**: 优化慢查询

```
用户: 这个查询很慢，帮我优化：SELECT * FROM orders WHERE user_id = 123

Claude 会:
1. 查看 orders 表的索引情况
2. 建议添加索引或修改查询
3. 解释优化原理
```

### 5. Redis 缓存管理

**场景**: 管理缓存数据

```
用户: 清理所有过期的会话缓存

Claude 会:
1. 查找所有 session: 开头的键
2. 检查 TTL
3. 在写入模式下执行清理（需要 --danger-allow-write）
```

---

## 安全提示

### ✅ 推荐做法

1. **生产环境只读**: 生产数据库永远不要启用 `--danger-allow-write`
2. **使用专用账号**: 为 MCP 创建权限受限的数据库账号
3. **网络隔离**: 通过 VPN 或跳板机访问生产数据库
4. **审计日志**: 定期检查 Claude Desktop 的操作日志

### ❌ 避免做法

1. 不要在生产环境启用写入模式
2. 不要使用 root 或 admin 账号
3. 不要在公共网络直接连接数据库
4. 不要在配置文件中明文存储密码（考虑使用环境变量）

---

## 故障排查

### 连接失败

**错误**: `数据库连接失败`

**解决方案**:
1. 检查数据库服务是否运行
2. 验证主机地址和端口
3. 确认用户名和密码正确
4. 检查防火墙规则

### 权限不足

**错误**: `Access denied` 或 `permission denied`

**解决方案**:
1. 确认数据库用户有足够权限
2. MySQL: `GRANT SELECT ON database.* TO 'user'@'host';`
3. PostgreSQL: `GRANT SELECT ON ALL TABLES IN SCHEMA public TO user;`

### 写操作被拒绝

**错误**: `操作被拒绝：当前处于只读安全模式`

**解决方案**:
- 这是安全特性，如需写入，添加 `--danger-allow-write` 参数
- 仅在开发环境使用！

---

## 更多帮助

- 查看 [README.md](./README.md) 了解项目概述
- 查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何贡献
- 提交 Issue: https://github.com/yourusername/universal-db-mcp/issues
