# Emacs 集成指南

本指南展示如何通过 mcp.el 包将 Universal Database MCP Server 与 Emacs 集成。

## 概述

Emacs 是一款功能强大、可扩展的文本编辑器，通过 mcp.el 包支持 MCP 集成。通过集成 Universal Database MCP Server，您可以使用 AI 助手直接在 Emacs 中查询和分析数据库数据。

**主要优势：**
- 直接从 Emacs 查询数据库
- 获得 AI 辅助编写 SQL 查询
- 无需离开编辑器即可探索数据库结构
- 借助 AI 帮助调试和优化数据库查询

## 前置要求

- 已安装 [Emacs](https://www.gnu.org/software/emacs/) 27.1 或更高版本
- 已安装 Node.js 18+
- 数据库实例（MySQL、PostgreSQL、SQLite 等）
- 已安装 mcp.el 包

---

## 步骤 1：安装 mcp.el 包

### 使用 use-package（推荐）

将以下内容添加到您的 Emacs 配置文件（`~/.emacs.d/init.el` 或 `~/.emacs`）：

```elisp
(use-package mcp
  :ensure t)
```

### 使用 package.el

1. 如果尚未配置，将 MELPA 添加到您的包存档：

```elisp
(require 'package)
(add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/") t)
(package-initialize)
```

2. 安装包：

```
M-x package-refresh-contents
M-x package-install RET mcp RET
```

### 手动安装

1. 克隆 mcp.el 仓库：

```bash
git clone https://github.com/lizqwerscott/mcp.el.git ~/.emacs.d/site-lisp/mcp.el
```

2. 添加到您的配置：

```elisp
(add-to-list 'load-path "~/.emacs.d/site-lisp/mcp.el")
(require 'mcp)
```

---

## 步骤 2：配置 MCP 服务器

将 Universal Database MCP Server 配置添加到您的 Emacs 配置文件。

### 基本配置

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("universal-db-mcp"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "your_password" "--database" "your_database")))))
```

---

## 配置示例

### MySQL

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("mysql-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "your_password" "--database" "your_database")))))
```

### PostgreSQL

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("postgres-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "postgres" "--host" "localhost" "--port" "5432" "--user" "postgres" "--password" "your_password" "--database" "your_database")))))
```

### SQLite

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("sqlite-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "sqlite" "--file-path" "/path/to/your/database.db")))))
```

### SQL Server

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("sqlserver-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "sqlserver" "--host" "localhost" "--port" "1433" "--user" "sa" "--password" "your_password" "--database" "your_database")))))
```

### Oracle

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("oracle-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "oracle" "--host" "localhost" "--port" "1521" "--user" "system" "--password" "your_password" "--database" "ORCL")))))
```

### MongoDB

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("mongodb"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mongodb" "--host" "localhost" "--port" "27017" "--user" "admin" "--password" "your_password" "--database" "your_database")))))
```

### Redis

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("redis"
           :command "npx"
           :args ("universal-db-mcp" "--type" "redis" "--host" "localhost" "--port" "6379" "--password" "your_password")))))
```

### 达梦数据库

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("dm-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "dm" "--host" "localhost" "--port" "5236" "--user" "SYSDBA" "--password" "your_password" "--database" "DAMENG")))))
```

### 人大金仓

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("kingbase-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "kingbase" "--host" "localhost" "--port" "54321" "--user" "system" "--password" "your_password" "--database" "your_database")))))
```

### 多数据库配置

您可以配置多个数据库连接：

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("mysql-production"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "prod-db.example.com" "--port" "3306" "--user" "readonly_user" "--password" "prod_password" "--database" "production_db"))
          ("mysql-development"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "dev_password" "--database" "development_db"))
          ("postgres-analytics"
           :command "npx"
           :args ("universal-db-mcp" "--type" "postgres" "--host" "analytics-db.example.com" "--port" "5432" "--user" "analyst" "--password" "analytics_password" "--database" "analytics")))))
```

### 启用写操作

默认情况下，为安全起见禁用写操作。要启用写操作：

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("mysql-db-writable"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "your_password" "--database" "your_database" "--allow-write" "true")))))
```

> **警告**：启用写操作允许 AI 执行 INSERT、UPDATE、DELETE 和其他修改查询。请谨慎使用，尤其是在生产环境中。

---

## 步骤 3：启动 MCP 服务器

配置完成后，启动 MCP 服务器：

```
M-x mcp-start-server
```

从列表中选择要启动的服务器。

---

## 可用工具

配置完成后，以下 MCP 工具将可用：

| 工具 | 描述 |
|------|------|
| `execute_query` | 对数据库执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息（表、列、类型） |
| `get_table_info` | 获取特定表的详细信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 使用示例

### 示例 1：探索数据库结构

使用 MCP 工具探索您的数据库：

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

### 示例 3：编写 SQL 查询

获取编写复杂查询的帮助：

```
编写一个查询，找出按总订单金额排名前 5 的客户
```

AI 将分析您的结构并生成：

```sql
SELECT
  c.id,
  c.name,
  SUM(o.total_amount) as total_value
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_value DESC
LIMIT 5
```

### 示例 4：调试查询

分享有问题的查询并寻求帮助：

```
这个查询很慢，你能帮我优化吗？

SELECT * FROM users u
WHERE u.id IN (SELECT user_id FROM orders WHERE created_at > '2024-01-01')
```

AI 将分析并建议优化方案。

### 示例 5：生成代码

让 AI 生成数据库相关代码：

```
生成一个 Elisp 函数，用于向 users 表插入新用户
```

AI 将检查您的结构并生成适当的代码。

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
- **切勿将**包含真实凭据的配置文件提交到版本控制
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

## 故障排除

### 问题：MCP 服务器无法启动

**症状**：MCP 服务器无法启动或连接

**解决方案**：
1. 验证 init 文件中的配置语法是否正确
2. 检查所有括号和引号是否正确配对
3. 更改配置后重启 Emacs
4. 确保 Node.js 已安装并可从 PATH 访问
5. 运行 `M-x mcp-start-server` 并检查 *Messages* 缓冲区中的错误

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
3. 将 Node.js 路径添加到 Emacs exec-path：

```elisp
(add-to-list 'exec-path "/usr/local/bin")
;; 或者在使用 Homebrew 的 macOS 上：
(add-to-list 'exec-path "/opt/homebrew/bin")
```

4. 在 Windows 上，安装 Node.js 后可能需要重启

### 问题：找不到包

**症状**：无法安装 mcp.el 包

**解决方案**：
1. 确保 MELPA 已添加到您的包存档
2. 运行 `M-x package-refresh-contents` 更新包列表
3. 尝试从 GitHub 手动安装

## 高级配置

### 使用环境变量

为了更好的安全性，您可以在配置中使用环境变量：

**Shell 配置：**
```bash
export DB_PASSWORD="your_secure_password"
```

**Emacs 配置：**
```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        `(("mysql-db"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" ,(getenv "DB_PASSWORD") "--database" "your_database")))))
```

注意使用反引号 (`) 而非单引号 (') 以启用 `(getenv "DB_PASSWORD")` 的求值。

### 与 gptel 集成

如果您在 Emacs 中使用 gptel 进行 AI 交互，可以集成 MCP 工具：

```elisp
(use-package gptel
  :ensure t
  :config
  ;; 配置 gptel 使用您首选的 AI 后端
  )

(use-package mcp
  :ensure t
  :after gptel
  :config
  (setq mcp-servers
        '(("universal-db-mcp"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "localhost" "--port" "3306" "--user" "root" "--password" "your_password" "--database" "your_database")))))
```

### 与 Docker 配合使用

如果您的数据库在 Docker 中运行，确保容器可访问：

```elisp
(use-package mcp
  :ensure t
  :config
  (setq mcp-servers
        '(("docker-mysql"
           :command "npx"
           :args ("universal-db-mcp" "--type" "mysql" "--host" "127.0.0.1" "--port" "3306" "--user" "root" "--password" "root_password" "--database" "app_db")))))
```

> **注意**：在某些系统上连接 Docker 容器时，使用 `127.0.0.1` 而非 `localhost`。

## 资源

- [GNU Emacs 官方网站](https://www.gnu.org/software/emacs/)
- [mcp.el GitHub 仓库](https://github.com/lizqwerscott/mcp.el)
- [MELPA 包存档](https://melpa.org/)
- [Universal Database MCP Server 文档](../README.zh-CN.md)
- [MCP 协议规范](https://modelcontextprotocol.io/)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
- mcp.el Issues: https://github.com/lizqwerscott/mcp.el/issues
