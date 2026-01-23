# 部署指南

本文档介绍如何将 MCP 数据库万能连接器部署到不同环境。

## 📦 发布到 NPM

### 准备工作

1. **注册 NPM 账号**
   ```bash
   npm adduser
   ```

2. **更新 package.json**

   确保以下字段正确：
   ```json
   {
     "name": "universal-db-mcp",
     "version": "0.1.0",
     "description": "MCP 数据库万能连接器 - 让 Claude Desktop 直接连接你的数据库",
     "repository": {
       "type": "git",
       "url": "https://github.com/yourusername/universal-db-mcp.git"
     },
     "keywords": [
       "mcp",
       "model-context-protocol",
       "claude",
       "database",
       "mysql",
       "postgresql",
       "redis"
     ]
   }
   ```

3. **构建项目**
   ```bash
   npm run build
   ```

4. **测试本地安装**
   ```bash
   npm pack
   npm install -g ./universal-db-mcp-0.1.0.tgz
   universal-db-mcp --help
   ```

### 发布

```bash
# 发布到 NPM
npm publish

# 如果是第一次发布，可能需要验证邮箱
# 如果包名已被占用，需要修改 package.json 中的 name
```

### 版本管理

```bash
# 补丁版本（bug 修复）
npm version patch  # 0.1.0 -> 0.1.1

# 次要版本（新功能）
npm version minor  # 0.1.0 -> 0.2.0

# 主要版本（破坏性更改）
npm version major  # 0.1.0 -> 1.0.0

# 发布新版本
npm publish
```

---

## 🐳 Docker 部署

### 创建 Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 设置入口点
ENTRYPOINT ["node", "dist/index.js"]
```

### 构建镜像

```bash
docker build -t universal-db-mcp:latest .
```

### 运行容器

```bash
# MySQL 示例
docker run -it \
  universal-db-mcp:latest \
  --type mysql \
  --host host.docker.internal \
  --port 3306 \
  --user root \
  --password password \
  --database mydb

# 使用环境变量
docker run -it \
  -e DB_TYPE=mysql \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=mydb \
  universal-db-mcp:latest
```

---

## 🔧 本地开发部署

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/universal-db-mcp.git
cd universal-db-mcp

# 安装依赖
npm install

# 构建
npm run build

# 全局链接（用于开发）
npm link

# 现在可以直接使用
universal-db-mcp --help
```

### 开发模式

```bash
# 监听文件变化，自动重新编译
npm run dev
```

### 在 Claude Desktop 中使用本地版本

编辑 Claude Desktop 配置文件，使用本地路径：

```json
{
  "mcpServers": {
    "local-db": {
      "command": "node",
      "args": [
        "/path/to/universal-db-mcp/dist/index.js",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "password",
        "--database", "test"
      ]
    }
  }
}
```

---

## 🌐 企业内网部署

### 场景：通过跳板机访问数据库

1. **在跳板机上安装**
   ```bash
   ssh jumphost
   npm install -g universal-db-mcp
   ```

2. **配置 SSH 隧道**
   ```bash
   # 本地机器执行
   ssh -L 3306:db-server:3306 user@jumphost -N
   ```

3. **Claude Desktop 配置**
   ```json
   {
     "mcpServers": {
       "prod-db": {
         "command": "npx",
         "args": [
           "universal-db-mcp",
           "--type", "mysql",
           "--host", "localhost",
           "--port", "3306",
           "--user", "readonly",
           "--password", "secure_password",
           "--database", "production"
         ]
       }
     }
   }
   ```

### 场景：使用 VPN 连接

1. **连接企业 VPN**

2. **直接配置内网地址**
   ```json
   {
     "mcpServers": {
       "internal-db": {
         "command": "npx",
         "args": [
           "universal-db-mcp",
           "--type", "postgres",
           "--host", "10.0.1.100",
           "--port", "5432",
           "--user", "analyst",
           "--password", "password",
           "--database", "analytics"
         ]
       }
     }
   }
   ```

---

## 🔐 安全最佳实践

### 1. 使用专用数据库账号

**MySQL**:
```sql
-- 创建只读用户
CREATE USER 'mcp_readonly'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT ON mydb.* TO 'mcp_readonly'@'%';
FLUSH PRIVILEGES;
```

**PostgreSQL**:
```sql
-- 创建只读用户
CREATE USER mcp_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE mydb TO mcp_readonly;
GRANT USAGE ON SCHEMA public TO mcp_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mcp_readonly;
```

### 2. 使用环境变量存储密码

创建 `.env` 文件（不要提交到 Git）：
```bash
DB_PASSWORD=your_secure_password
```

修改 Claude Desktop 配置使用环境变量：
```json
{
  "mcpServers": {
    "secure-db": {
      "command": "bash",
      "args": [
        "-c",
        "source ~/.env && npx universal-db-mcp --type mysql --host localhost --port 3306 --user root --password $DB_PASSWORD --database mydb"
      ]
    }
  }
}
```

### 3. 网络隔离

- 使用防火墙限制数据库访问
- 仅允许特定 IP 连接
- 使用 SSL/TLS 加密连接

### 4. 审计日志

定期检查 Claude Desktop 的日志：

**macOS**: `~/Library/Logs/Claude/`
**Windows**: `%APPDATA%\Claude\logs\`

---

## 📊 监控和日志

### 启用详细日志

MCP 服务器的日志输出到 stderr，可以通过 Claude Desktop 查看。

### 自定义日志记录

如果需要更详细的日志，可以修改源码添加日志记录：

```typescript
// src/server.ts
console.error(`[${new Date().toISOString()}] 执行查询: ${query}`);
```

---

## 🚀 性能优化

### 1. 连接池（未来改进）

当前版本使用单一连接，未来可以添加连接池支持：

```typescript
// 使用 mysql2 连接池
const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  connectionLimit: 10,
});
```

### 2. 查询缓存

对于频繁查询的 schema 信息，可以添加缓存：

```typescript
private schemaCache: SchemaInfo | null = null;
private schemaCacheTime: number = 0;
private CACHE_TTL = 60000; // 1 分钟

async getSchema(): Promise<SchemaInfo> {
  const now = Date.now();
  if (this.schemaCache && now - this.schemaCacheTime < this.CACHE_TTL) {
    return this.schemaCache;
  }

  this.schemaCache = await this.fetchSchema();
  this.schemaCacheTime = now;
  return this.schemaCache;
}
```

---

## 🐛 故障排查

### 问题：Claude Desktop 无法连接

**检查步骤**:
1. 验证配置文件格式正确（JSON 语法）
2. 重启 Claude Desktop
3. 查看 Claude Desktop 日志
4. 手动测试命令：
   ```bash
   npx universal-db-mcp --type mysql --host localhost --port 3306 --user root --password password --database test
   ```

### 问题：数据库连接超时

**解决方案**:
1. 检查数据库服务是否运行
2. 验证网络连接
3. 检查防火墙规则
4. 增加连接超时时间（需要修改源码）

### 问题：权限错误

**解决方案**:
1. 确认数据库用户权限
2. 检查数据库访问控制列表
3. 验证用户名和密码

---

## 📚 更多资源

- [使用示例](./EXAMPLES.md)
- [贡献指南](./CONTRIBUTING.md)
- [GitHub Issues](https://github.com/yourusername/universal-db-mcp/issues)
- [Model Context Protocol 文档](https://modelcontextprotocol.io/)

---

## 🎉 部署成功！

完成部署后，你就可以在 Claude Desktop 中使用自然语言查询数据库了！

如有问题，欢迎提交 Issue 或参与讨论。
