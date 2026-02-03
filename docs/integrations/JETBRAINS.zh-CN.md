# JetBrains IDE 集成指南

本指南展示如何将 Universal Database MCP Server 与 JetBrains IDE 集成。

## 概述

JetBrains IDE（IntelliJ IDEA、PyCharm、WebStorm、GoLand、PhpStorm、Rider、CLion、RubyMine、Android Studio 等）从 2025.1 版本开始支持 MCP（Model Context Protocol）集成。这使您可以将 AI Assistant 直接连接到数据库，实现智能代码辅助、查询生成和数据分析。

**支持的 IDE：**
- IntelliJ IDEA（Ultimate 和 Community 版本）
- PyCharm（Professional 和 Community 版本）
- WebStorm
- GoLand
- PhpStorm
- Rider
- CLion
- RubyMine
- DataGrip
- Android Studio

**主要优势：**
- 直接从 AI Assistant 聊天中查询数据库
- 获得 AI 驱动的 SQL 查询生成和优化
- 无需离开 IDE 即可探索数据库结构
- 基于实际数据库结构生成数据模型和 ORM 代码
- 借助 AI 帮助调试和分析数据库查询

## 前置要求

- JetBrains IDE 版本 **2025.1 或更高**
- AI Assistant 插件已启用（JetBrains IDE 内置）
- 已安装 Node.js 18+
- 数据库实例（MySQL、PostgreSQL、SQLite 等）

## 配置

JetBrains IDE 使用基于 JSON 的配置来管理 MCP 服务器，可通过 IDE 设置访问。

### 步骤 1：打开 MCP 设置

1. 打开您的 JetBrains IDE
2. 进入 **Settings/Preferences**（Windows/Linux 上按 `Ctrl+Alt+S`，macOS 上按 `Cmd+,`）
3. 导航到 **Tools > AI Assistant > Model Context Protocol**

### 步骤 2：添加 MCP 服务器

1. 点击 **+** 按钮或 **Add** 创建新的 MCP 服务器配置
2. 以 JSON 格式输入服务器配置

### 步骤 3：配置服务器

添加 Universal Database MCP Server 配置：

```json
{
  "servers": [
    {
      "name": "universal-db-mcp",
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
  ]
}
```

### 步骤 4：应用并重启

1. 点击 **Apply** 然后点击 **OK**
2. 重启 IDE 使更改生效

## 配置示例

### MySQL

```json
{
  "servers": [
    {
      "name": "mysql-db",
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
  ]
}
```

### PostgreSQL

```json
{
  "servers": [
    {
      "name": "postgres-db",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "localhost",
        "--port", "5432",
        "--user", "postgres",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  ]
}
```

### SQLite

```json
{
  "servers": [
    {
      "name": "sqlite-db",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlite",
        "--file-path", "/path/to/your/database.db"
      ]
    }
  ]
}
```

### SQL Server

```json
{
  "servers": [
    {
      "name": "sqlserver-db",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "sqlserver",
        "--host", "localhost",
        "--port", "1433",
        "--user", "sa",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  ]
}
```

### Oracle

```json
{
  "servers": [
    {
      "name": "oracle-db",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "your_password",
        "--database", "ORCL"
      ]
    }
  ]
}
```

### MongoDB

```json
{
  "servers": [
    {
      "name": "mongodb",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mongodb",
        "--host", "localhost",
        "--port", "27017",
        "--user", "admin",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  ]
}
```

### Redis

```json
{
  "servers": [
    {
      "name": "redis",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "redis",
        "--host", "localhost",
        "--port", "6379",
        "--password", "your_password"
      ]
    }
  ]
}
```

### 达梦数据库

```json
{
  "servers": [
    {
      "name": "dm-db",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "dm",
        "--host", "localhost",
        "--port", "5236",
        "--user", "SYSDBA",
        "--password", "your_password",
        "--database", "DAMENG"
      ]
    }
  ]
}
```

### 人大金仓

```json
{
  "servers": [
    {
      "name": "kingbase-db",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "kingbase",
        "--host", "localhost",
        "--port", "54321",
        "--user", "system",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  ]
}
```

### 多数据库配置

您可以配置多个数据库连接：

```json
{
  "servers": [
    {
      "name": "mysql-production",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "prod-db.example.com",
        "--port", "3306",
        "--user", "readonly_user",
        "--password", "prod_password",
        "--database", "production_db"
      ]
    },
    {
      "name": "mysql-development",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "dev_password",
        "--database", "development_db"
      ]
    },
    {
      "name": "postgres-analytics",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "postgres",
        "--host", "analytics-db.example.com",
        "--port", "5432",
        "--user", "analyst",
        "--password", "analytics_password",
        "--database", "analytics"
      ]
    }
  ]
}
```

### 启用写操作

默认情况下，为安全起见禁用写操作。要启用写操作：

```json
{
  "servers": [
    {
      "name": "mysql-db-writable",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database",
        "--allow-write", "true"
      ]
    }
  ]
}
```

> **警告**：启用写操作允许 AI 执行 INSERT、UPDATE、DELETE 和其他修改查询。请谨慎使用，尤其是在生产环境中。

## 可用工具

配置完成后，以下 MCP 工具将在 AI Assistant 中可用：

| 工具 | 描述 |
|------|------|
| `execute_query` | 对数据库执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息（表、列、类型） |
| `get_table_info` | 获取特定表的详细信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 使用示例

### 示例 1：探索数据库结构

在 AI Assistant 聊天中，您可以询问：

```
我的数据库中有哪些表？
```

AI 将使用 `get_schema` 工具检索并显示您的数据库结构。

### 示例 2：查询数据

让 AI 查询您的数据：

```
显示 orders 表中最近的 10 条订单
```

AI 将生成并执行适当的 SQL 查询：

```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10
```

### 示例 3：生成实体类

让 AI 基于数据库结构生成代码：

```
为 users 表生成一个带有 JPA 注解的 Java 实体类
```

AI 将分析您的表结构并生成：

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and setters...
}
```

### 示例 4：编写复杂查询

获取编写复杂查询的帮助：

```
编写一个查询，找出按总订单金额排名前 5 的客户及其联系信息
```

AI 将分析您的结构并生成：

```sql
SELECT
  c.id,
  c.name,
  c.email,
  SUM(o.total_amount) as total_value
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
ORDER BY total_value DESC
LIMIT 5
```

### 示例 5：调试和优化查询

分享有问题的查询并寻求帮助：

```
这个查询很慢，你能帮我优化吗？

SELECT * FROM users u
WHERE u.id IN (SELECT user_id FROM orders WHERE created_at > '2024-01-01')
```

AI 将分析并建议优化方案：

```sql
SELECT u.*
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.created_at > '2024-01-01'
GROUP BY u.id
```

### 示例 6：生成 Repository 代码

让 AI 生成数据访问代码：

```
为 products 表生成一个 Spring Data JPA Repository，包含自定义查询方法
```

## 命令行参数

| 参数 | 必填 | 描述 |
|------|------|------|
| `--type` | 是 | 数据库类型：mysql、postgres、sqlite、sqlserver、oracle、mongodb、redis、dm、kingbase、gaussdb、oceanbase、tidb、clickhouse、polardb、vastbase、highgo、goldendb |
| `--host` | 是* | 数据库主机 |
| `--port` | 否 | 数据库端口（不指定则使用默认端口） |
| `--user` | 是* | 数据库用户名 |
| `--password` | 是* | 数据库密码 |
| `--database` | 是* | 数据库名称 |
| `--file-path` | 是* | SQLite 文件路径（仅 sqlite 类型） |
| `--allow-write` | 否 | 启用写操作（默认：false） |
| `--oracle-client-path` | 否 | Oracle Instant Client 路径（用于 Oracle 11g） |

*必填字段取决于数据库类型

## 最佳实践

### 1. 安全性

- **使用只读数据库用户**访问生产数据库
- **切勿将**包含真实凭据的配置提交到版本控制
- **尽可能使用环境变量**存储敏感数据
- **限制数据库权限**仅授予必要的权限

### 2. 性能

- 使用具体查询而非 `SELECT *`
- 添加 `LIMIT` 子句以防止大结果集
- 考虑使用只读副本进行大量查询

### 3. 开发工作流

- 为开发和生产配置单独的连接
- 为多个数据库连接使用描述性名称
- 除非特别需要，否则保持禁用写操作
- 利用 AI Assistant 基于实际结构生成代码

### 4. IDE 集成

- 将 JetBrains 数据库工具与 MCP 结合使用，实现可视化数据库管理
- 将 AI Assistant 建议与 IDE 内置的 SQL 支持结合使用
- 利用 IDE 的代码补全功能处理生成的代码

## 故障排除

### 问题：MCP 服务器未显示

**症状**：AI Assistant 无法识别数据库工具

**解决方案**：
1. 验证 IDE 版本是 2025.1 或更高
2. 检查 AI Assistant 插件是否已启用
3. 验证 JSON 配置语法是否有效
4. 更改配置后重启 IDE
5. 检查 **Help > Show Log in Explorer/Finder** 查看错误消息

### 问题：连接被拒绝

**症状**：关于连接被拒绝的错误消息

**解决方案**：
1. 验证数据库主机和端口是否正确
2. 检查数据库服务器是否正在运行
3. 确保防火墙允许连接到数据库端口
4. 验证到数据库主机的网络连接

### 问题：认证失败

**症状**：关于无效凭据的错误消息

**解决方案**：
1. 仔细检查用户名和密码
2. 验证用户是否有权访问指定的数据库
3. 检查数据库是否需要 SSL/TLS 连接
4. 确保用户可以从您的 IP 地址连接

### 问题：权限被拒绝

**症状**：查询因权限错误而失败

**解决方案**：
1. 验证数据库用户是否具有 SELECT 权限
2. 检查特定表是否需要额外权限
3. 对于写操作，确保设置了 `--allow-write` 且用户具有写权限

### 问题：找不到 npx 命令

**症状**：错误提示 npx 未被识别

**解决方案**：
1. 安装 Node.js（版本 18 或更高）
2. 确保 Node.js bin 目录在系统 PATH 中
3. 尝试使用 npx 的完整路径：
   - Windows：`C:\Program Files\nodejs\npx.cmd`
   - macOS/Linux：`/usr/local/bin/npx`
4. 在 Windows 上，安装 Node.js 后可能需要重启
5. 或者，全局安装后使用直接命令：
   ```bash
   npm install -g universal-db-mcp
   ```
   然后在配置中使用 `universal-db-mcp` 代替 `npx universal-db-mcp`

### 问题：响应缓慢

**症状**：AI Assistant 响应数据库查询需要很长时间

**解决方案**：
1. 为数据库表添加适当的索引
2. 使用 `LIMIT` 子句限制结果集
3. 优化复杂查询
4. 考虑使用只读副本进行分析查询

### 查看日志

要查看 MCP 相关日志：

1. 进入 **Help > Show Log in Explorer/Finder**
2. 打开 `idea.log` 文件
3. 搜索 "MCP" 或 "universal-db-mcp" 相关消息

## 高级配置

### 使用环境变量

为了更好的安全性，您可以使用环境变量。在启动 IDE 之前在系统中设置它们：

**Windows (PowerShell)：**
```powershell
$env:DB_PASSWORD = "your_secure_password"
```

**Windows (命令提示符)：**
```cmd
set DB_PASSWORD=your_secure_password
```

**macOS/Linux：**
```bash
export DB_PASSWORD="your_secure_password"
```

### 与 Docker 配合使用

如果您的数据库在 Docker 中运行，确保容器可访问：

```json
{
  "servers": [
    {
      "name": "docker-mysql",
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "127.0.0.1",
        "--port", "3306",
        "--user", "root",
        "--password", "root_password",
        "--database", "app_db"
      ]
    }
  ]
}
```

> **注意**：在某些系统上连接 Docker 容器时，使用 `127.0.0.1` 而非 `localhost`。

### 项目特定配置

对于项目特定的数据库配置，您可以：

1. 在项目根目录创建 `.idea/mcp.json` 文件（如果您的 IDE 版本支持）
2. 或通过 **File > Manage IDE Settings > Settings Repository** 为不同项目使用不同的 IDE 配置

## 资源

- [JetBrains AI Assistant 文档](https://www.jetbrains.com/help/idea/ai-assistant.html)
- [IntelliJ IDEA 文档](https://www.jetbrains.com/help/idea/)
- [PyCharm 文档](https://www.jetbrains.com/help/pycharm/)
- [WebStorm 文档](https://www.jetbrains.com/help/webstorm/)
- [Universal Database MCP Server 文档](../README.zh-CN.md)
- [MCP 协议规范](https://modelcontextprotocol.io/)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- JetBrains 支持: https://www.jetbrains.com/support/
- JetBrains 社区论坛: https://intellij-support.jetbrains.com/
