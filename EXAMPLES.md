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
- [SQLite 使用示例](#sqlite-使用示例)
- [KingbaseES 使用示例](#kingbasees-使用示例)
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
        "--database", "myapp",
        "--auth-source", "admin"  
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

## SQLite 使用示例

### 基础配置（只读模式）

```json
{
  "mcpServers": {
    "sqlite-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file", "/path/to/your/database.db"
      ]
    }
  }
}
```

### Windows 路径示例

```json
{
  "mcpServers": {
    "sqlite-app": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file", "C:\\Users\\YourName\\Documents\\myapp.db"
      ]
    }
  }
}
```

**注意**: Windows 路径中的反斜杠需要转义（使用 `\\`）。

### macOS/Linux 路径示例

```json
{
  "mcpServers": {
    "sqlite-notes": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file", "/Users/YourName/Documents/notes.db"
      ]
    }
  }
}
```

### 启用写入模式

```json
{
  "mcpServers": {
    "sqlite-dev": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file", "/path/to/dev.db",
        "--danger-allow-write"
      ]
    }
  }
}
```

### 与 Claude 对话示例

**用户**: 查看数据库中有哪些表？

**Claude 会自动**:
1. 调用 `get_schema` 工具
2. 执行查询: `SELECT name FROM sqlite_master WHERE type='table'`
3. 返回表列表

**用户**: 查看 users 表的结构

**Claude 会自动**:
1. 调用 `get_table_info` 工具
2. 执行 `PRAGMA table_info(users)`
3. 返回列信息、主键、索引等详细信息

**用户**: 统计每个分类的文章数量

**Claude 会自动**:
1. 理解需求
2. 生成 SQL: `SELECT category, COUNT(*) as count FROM articles GROUP BY category ORDER BY count DESC`
3. 执行并返回结果

**用户**: 查找最近创建的 10 条记录

**Claude 会自动**:
1. 生成 SQL: `SELECT * FROM posts ORDER BY created_at DESC LIMIT 10`
2. 执行并返回结果

### 常见使用场景

#### 1. 分析本地应用数据库

许多桌面应用使用 SQLite 存储数据（如浏览器历史、笔记应用等）：

```
用户: 帮我分析 Chrome 浏览器的历史记录

Claude 会:
1. 连接到 Chrome 的 History 数据库文件
2. 查询 urls 和 visits 表
3. 生成访问统计和分析报告
```

#### 2. 开发和测试

SQLite 非常适合本地开发和测试：

```
用户: 创建一个测试用户并查询

Claude 会（在写入模式下）:
1. INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com')
2. SELECT * FROM users WHERE email = 'test@example.com'
```

#### 3. 数据导出和备份

```
用户: 导出所有用户数据为 JSON 格式

Claude 会:
1. SELECT * FROM users
2. 将结果格式化为 JSON
3. 提供下载或复制
```

### 注意事项

1. **文件路径**: 必须使用绝对路径，不支持相对路径
2. **文件权限**: 确保 Claude Desktop 有权限读取/写入数据库文件
3. **并发访问**: SQLite 支持多读单写，注意并发访问限制
4. **数据库锁**: 如果数据库被其他程序占用，可能会遇到锁定错误
5. **自动创建**: 如果指定的文件不存在，会自动创建新数据库
6. **备份建议**: 在启用写入模式前，建议先备份数据库文件

### 支持的 SQLite 特性

- ✅ 标准 SQL 查询（SELECT、INSERT、UPDATE、DELETE）
- ✅ 事务支持
- ✅ 索引和主键
- ✅ 外键约束（需要启用）
- ✅ PRAGMA 命令
- ✅ 全文搜索（FTS）
- ✅ JSON 扩展（SQLite 3.38+）

### 性能提示

1. **索引优化**: 为常用查询字段创建索引
2. **批量操作**: 使用事务包装批量 INSERT/UPDATE
3. **PRAGMA 优化**: 可以使用 PRAGMA 命令调整性能参数
4. **VACUUM**: 定期执行 VACUUM 优化数据库文件大小

---

## KingbaseES 使用示例

### 基础配置（只读模式）

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

### 启用写入模式

```json
{
  "mcpServers": {
    "kingbase-write": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "kingbase",
        "--host", "localhost",
        "--port", "54321",
        "--user", "system",
        "--password", "your_password",
        "--database", "mydb",
        "--danger-allow-write"
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

### 与 Claude 对话示例

**用户**: 查看数据库中有哪些表？

**Claude 会自动**:
1. 调用 `get_schema` 工具
2. 执行查询获取 public schema 下的所有表
3. 返回表列表

**用户**: 查看 users 表的结构

**Claude 会自动**:
1. 调用 `get_table_info` 工具
2. 返回列信息、主键、索引等详细信息

**用户**: 统计每个部门的员工数量

**Claude 会自动**:
1. 理解需求
2. 生成 SQL: `SELECT department_id, COUNT(*) as count FROM employees GROUP BY department_id ORDER BY count DESC`
3. 执行并返回结果

**用户**: 查找最近一周创建的订单

**Claude 会自动**:
1. 生成 SQL: `SELECT * FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' ORDER BY created_at DESC`
2. 执行并返回结果

### 注意事项

1. **默认端口**: KingbaseES 默认端口为 54321
2. **兼容性**: 基于 PostgreSQL 开发，兼容 PostgreSQL 协议和 SQL 语法
3. **驱动**: 使用 PostgreSQL 的 `pg` 驱动
4. **Schema**: 默认查询 public schema 下的表
5. **参数化查询**: 支持 `$1, $2, ...` 占位符
6. **国产化**: 适用于国产化替代场景

### 支持的 KingbaseES 版本

- ✅ KingbaseES V8
- ✅ KingbaseES V9
- ✅ 其他兼容 PostgreSQL 协议的版本

### 常见使用场景

#### 1. 国产化数据库迁移

从 PostgreSQL 迁移到 KingbaseES：

```
用户: 帮我分析现有表结构，准备迁移到 KingbaseES

Claude 会:
1. 获取完整的 Schema 信息
2. 分析表结构、索引、约束
3. 提供迁移建议
```

#### 2. 数据分析和报表

```
用户: 统计最近一个月的销售数据

Claude 会:
1. 理解需求
2. 生成复杂的聚合查询
3. 返回分析结果
```

#### 3. 开发和测试

```
用户: 在测试环境创建测试数据

Claude 会（在写入模式下）:
1. 生成 INSERT 语句
2. 执行并验证结果
```

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
    },
    "sqlite-local": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file", "/Users/yourname/data/local.db"
      ]
    },
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

重启 Claude Desktop 后，你可以在对话中指定使用哪个数据库：

- "在 MySQL 生产库中查询..."
- "从 PostgreSQL 分析库获取..."
- "检查 Redis 缓存中的..."
- "在 Oracle 数据仓库中统计..."
- "从 SQLite 本地数据库查询..."
- "在 KingbaseES 数据库中查询..."

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
