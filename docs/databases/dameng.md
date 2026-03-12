# 达梦数据库使用指南

## 简介

universal-db-mcp 现已支持达梦数据库（DM7/DM8）！达梦数据库驱动 `dmdb` 会作为可选依赖自动安装。

## 安装

### 方法 1: 全局安装（推荐）

```bash
npm install -g universal-db-mcp
```

达梦驱动 `dmdb` 会自动尝试安装。如果安装失败，请手动安装：

```bash
npm install -g dmdb
```

### 方法 2: 本地项目安装

```bash
mkdir my-db-project
cd my-db-project
npm init -y
npm install universal-db-mcp
```

## Claude Desktop 配置

编辑 Claude Desktop 配置文件：
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

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

### 连接远程数据库

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
        "--user", "readonly_user",
        "--password", "secure_password",
        "--database", "PRODUCTION"
      ]
    }
  }
}
```

### 启用写入模式（谨慎使用）

```json
{
  "mcpServers": {
    "dm-dev": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "dm",
        "--host", "localhost",
        "--port", "5236",
        "--user", "dev_user",
        "--password", "dev_password",
        "--database", "DEVDB",
        "--permission-mode", "full"
      ]
    }
  }
}
```

## 使用示例

### 查看数据库结构

**用户**: 帮我查看数据库中的所有表

**Claude 会自动**:
1. 调用 `get_schema` 工具
2. 返回所有表的列表、列信息、主键、索引等

### 查询数据

**用户**: 查询 EMPLOYEES 表中部门编号为 10 的所有员工

**Claude 会自动**:
1. 理解需求
2. 生成 SQL: `SELECT * FROM EMPLOYEES WHERE DEPT_ID = 10`
3. 执行查询并返回结果

### 统计分析

**用户**: 统计每个部门的员工数量

**Claude 会自动**:
1. 生成 SQL: `SELECT DEPT_ID, COUNT(*) as EMP_COUNT FROM EMPLOYEES GROUP BY DEPT_ID`
2. 执行并返回结果

### 查看表结构

**用户**: 查看 EMPLOYEES 表的详细结构

**Claude 会自动**:
1. 调用 `get_table_info` 工具
2. 返回列定义、数据类型、主键、索引等详细信息

## 注意事项

### 1. 驱动安装

- `dmdb` 驱动会作为可选依赖自动安装
- 如果自动安装失败，请手动运行：`npm install -g dmdb`
- 驱动版本：1.0.46190（会自动使用最新版本）

### 2. 默认端口

- 达梦数据库默认端口：5236
- 如果使用其他端口，请在配置中指定

### 3. 大小写敏感

- 达梦数据库默认将表名和列名存储为大写
- 查询结果会自动转换为小写以保持一致性
- 在 SQL 中使用表名时建议使用大写或双引号

### 4. 兼容性

- 达梦数据库高度兼容 Oracle
- 支持 Oracle 风格的 SQL 语法
- 支持 PL/SQL 存储过程

### 5. 安全模式

- 默认为只读模式，阻止所有写操作
- 需要写入时使用 `--permission-mode readwrite` 或 `--permission-mode full`
- 生产环境强烈建议使用只读模式

## 连接稳定性

MCP 服务内置了完善的连接管理机制，无需额外配置：

- **心跳保活** - 每 30 秒发送心跳（`SELECT 1 FROM DUAL`），防止连接被服务端超时关闭
- **断线自动重连** - 检测到连接断开时自动重建连接并重试操作
- **错误检测** - 自动识别 `ECONNRESET`、`EPIPE`、`ETIMEDOUT` 等连接断开错误

## 故障排查

### 问题 1: 驱动未安装

**错误**: `达梦数据库驱动未安装`

**解决方案**:
```bash
npm install -g dmdb
```

### 问题 2: 连接失败

**错误**: `达梦数据库连接失败: 无法连接到数据库服务器`

**解决方案**:
1. 检查达梦数据库服务是否运行
2. 验证主机地址和端口是否正确
3. 检查防火墙设置
4. 确认网络连接正常

### 问题 3: 用户名或密码错误

**错误**: `达梦数据库连接失败: 用户名或密码无效`

**解决方案**:
1. 确认用户名和密码正确
2. 检查用户是否有连接权限
3. 确认数据库名称正确

### 问题 4: 表或视图不存在

**错误**: `查询执行失败: 表或视图不存在`

**解决方案**:
1. 确认表名拼写正确（注意大小写）
2. 检查当前用户是否有访问该表的权限
3. 使用 `get_schema` 工具查看所有可用的表

## 更多帮助

- 查看 [README.md](./README.md) 了解项目概述
- 查看 [EXAMPLES.md](./EXAMPLES.md) 了解更多使用示例
- 提交 Issue: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- 达梦官网: https://www.dameng.com/
