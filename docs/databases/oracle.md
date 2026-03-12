# Oracle 使用指南

## 版本支持

| 模式 | 支持版本 | 是否需要 Oracle Client |
|------|----------|----------------------|
| Thin 模式（默认） | 12.1+ | 不需要 |
| Thick 模式 | 11.2+ | 需要 |

- **Thin 模式**：默认模式，纯 JavaScript 实现，无需安装任何客户端，但只支持 Oracle 12.1 及以上版本
- **Thick 模式**：需要安装 Oracle Instant Client，但可以连接 Oracle 11g 等老版本

## 配置示例

### 基础配置（Thin 模式，12c+）

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
        "--database", "ORCL"
      ]
    }
  }
}
```

### 连接 Oracle 11g（Thick 模式）

Oracle 11g 需要使用 Thick 模式，添加 `--oracle-client-path` 参数：

```json
{
  "mcpServers": {
    "oracle-11g": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "oracle",
        "--host", "localhost",
        "--port", "1521",
        "--user", "system",
        "--password", "your_password",
        "--database", "ORCL",
        "--oracle-client-path", "/opt/oracle/instantclient_19_8"
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
        "--database", "XEPDB1"
      ]
    }
  }
}
```

### HTTP API 模式

```bash
curl -X POST http://localhost:3000/api/connect \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "oracle",
    "host": "localhost",
    "port": 1521,
    "user": "system",
    "password": "your_password",
    "database": "ORCL",
    "oracleClientPath": "/opt/oracle/instantclient_19_8"
  }'
```

## 连接参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--host` | 数据库主机地址 | localhost |
| `--port` | 数据库端口 | 1521 |
| `--user` | 用户名 | - |
| `--password` | 密码 | - |
| `--database` | Service Name 或 SID | - |
| `--oracle-client-path` | Oracle Instant Client 路径（启用 Thick 模式） | - |

## Oracle Instant Client 安装指南

> 注意：只有连接 Oracle 11g 或需要使用 Thick 模式的高级功能时才需要安装。

### macOS

```bash
# 方式一：使用 Homebrew
brew install instantclient-basic

# 方式二：手动安装
# 1. 从 Oracle 官网下载 Instant Client
# 2. 解压到 /opt/oracle/instantclient_19_8
# 3. 配置时使用 --oracle-client-path "/opt/oracle/instantclient_19_8"
```

### Linux

```bash
# 1. 下载 Instant Client Basic 包
# https://www.oracle.com/database/technologies/instant-client/downloads.html

# 2. 解压到指定目录
mkdir -p /opt/oracle
unzip instantclient-basic-linux.x64-19.8.0.0.0dbru.zip -d /opt/oracle

# 3. 安装依赖（如果需要）
sudo apt-get install libaio1  # Debian/Ubuntu
sudo yum install libaio       # RHEL/CentOS

# 4. 配置时使用
# --oracle-client-path "/opt/oracle/instantclient_19_8"
```

### Windows

```powershell
# 1. 下载 Instant Client Basic 包
# https://www.oracle.com/database/technologies/instant-client/downloads.html

# 2. 解压到 C:\oracle\instantclient_19_8

# 3. 配置时使用
# --oracle-client-path "C:\\oracle\\instantclient_19_8"
```

## 使用示例

### 查看表结构

```
用户: 帮我查看 EMPLOYEES 表的结构

Claude 会自动:
1. 调用 get_table_info 工具
2. 返回表的列信息、主键、索引等
注意：Oracle 表名通常为大写
```

### 执行查询

```
用户: 查询工资最高的 10 名员工

Claude 会自动:
1. 生成 SQL: SELECT * FROM EMPLOYEES ORDER BY SALARY DESC FETCH FIRST 10 ROWS ONLY
2. 执行查询并返回结果
```

## 安全建议

### 创建只读用户

```sql
-- 创建只读用户
CREATE USER mcp_readonly IDENTIFIED BY secure_password;
GRANT CREATE SESSION TO mcp_readonly;
GRANT SELECT ANY TABLE TO mcp_readonly;

-- 或者授予特定表的权限
GRANT SELECT ON schema.table_name TO mcp_readonly;
```

## 注意事项

1. **表名大小写** - Oracle 默认表名为大写
2. **分页语法** - 12c+ 使用 `FETCH FIRST n ROWS ONLY`，11g 使用 `ROWNUM`
3. **日期格式** - 注意 NLS_DATE_FORMAT 设置
4. **字符集** - 建议使用 AL32UTF8
5. **Thick 模式** - 启用后会输出日志 `🔧 Oracle Thick 模式已启用`

## 连接稳定性

MCP 服务内置了完善的连接管理机制，无需额外配置：

- **连接池** - 使用 oracledb 连接池（最小 1、最大 3 个连接），自动管理连接生命周期
- **Pool Ping** - 每 30 秒自动检测连接健康状态（`poolPingInterval: 30`）
- **断线自动重试** - 检测到连接断开（如 `NJS-500`、`ORA-03114`）时自动重试

## 常见问题

### ORA-12541: TNS:no listener

检查 Oracle 监听器是否启动：
```bash
lsnrctl status
```

### ORA-01017: invalid username/password

确认用户名和密码正确，注意大小写。

### 连接 11g 失败

确保：
1. 已安装 Oracle Instant Client
2. 正确配置了 `--oracle-client-path` 参数
3. Client 版本与操作系统匹配

### Oracle Client 初始化失败

常见原因：
- 路径不正确
- 缺少依赖库（如 libaio）
- 32/64 位不匹配

查看详细错误信息以定位问题。
