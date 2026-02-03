# Universal-DB-MCP 华为云 Flexus 服务器部署指南

> 本文档详细介绍如何在华为云 Flexus 服务器（Ubuntu 22.04 Server 64bit）上部署 Universal-DB-MCP 服务。

## 目录

- [项目概述](#项目概述)
- [部署方案对比](#部署方案对比)
- [推荐方案：Docker Compose 部署](#推荐方案docker-compose-部署)
- [备选方案一：PM2 部署](#备选方案一pm2-部署)
- [备选方案二：systemd 部署](#备选方案二systemd-部署)
- [安全配置](#安全配置)
- [Nginx 反向代理配置](#nginx-反向代理配置)
- [SSL 证书配置](#ssl-证书配置)
- [监控与日志](#监控与日志)
- [常见问题排查](#常见问题排查)
- [维护与更新](#维护与更新)

---

## 项目概述

### 什么是 Universal-DB-MCP

Universal-DB-MCP 是一个通用数据库连接器，支持双模式运行：

- **MCP 模式**：通过 stdio 协议与 Claude Desktop 通信，让 AI 直接查询数据库
- **HTTP API 模式**：提供 RESTful API，可集成到 Coze、n8n、Dify 等第三方平台

### 支持的数据库

| 类型 | 数据库 |
|------|--------|
| 关系型 | MySQL、PostgreSQL、Oracle、SQL Server、SQLite |
| 国产数据库 | 达梦(DM)、人大金仓(KingbaseES)、华为高斯(GaussDB)、海量数据(Vastbase)、瀚高(HighGo)、中兴(GoldenDB) |
| 分布式 | OceanBase、TiDB、PolarDB |
| NoSQL | MongoDB、Redis |
| OLAP | ClickHouse |

### 系统要求

- **Node.js**: >= 20.0.0
- **内存**: >= 512MB（推荐 1GB+）
- **磁盘**: >= 1GB 可用空间
- **网络**: 需要访问目标数据库

---

## 部署方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Docker Compose** | 环境隔离、易于管理、一键部署 | 需要安装 Docker | **推荐**，生产环境首选 |
| **PM2** | 进程管理完善、支持集群 | 需要管理 Node.js 版本 | 熟悉 Node.js 的团队 |
| **systemd** | 系统级服务、开机自启 | 配置相对复杂 | 追求极致性能 |

**最佳实践推荐**：Docker Compose 部署，配合 Nginx 反向代理和 Let's Encrypt SSL 证书。

---

## 推荐方案：Docker Compose 部署

### 步骤 1：服务器初始化

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget git vim htop
```

### 步骤 2：安装 Docker

```bash
# 安装 Docker 官方 GPG 密钥
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 将当前用户添加到 docker 组（免 sudo）
sudo usermod -aG docker $USER

# 重新登录或执行以下命令使组变更生效
newgrp docker

# 验证安装
docker --version
docker compose version
```

### 步骤 3：克隆项目

```bash
# 创建应用目录
sudo mkdir -p /opt/apps
sudo chown $USER:$USER /opt/apps
cd /opt/apps

# 克隆项目
git clone https://github.com/Anarkh-Lee/universal-db-mcp.git
cd universal-db-mcp
```

### 步骤 4：配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

**生产环境 .env 配置示例**：

```bash
# ============================================
# Server Mode
# ============================================
MODE=http

# ============================================
# HTTP Server Configuration
# ============================================
HTTP_PORT=3000
HTTP_HOST=0.0.0.0

# ============================================
# API Keys (重要：使用强密钥！)
# ============================================
# 生成强密钥命令: openssl rand -hex 32
API_KEYS=your-strong-api-key-here

# ============================================
# CORS Configuration
# ============================================
# 生产环境建议指定具体域名
CORS_ORIGINS=https://your-domain.com
CORS_CREDENTIALS=false

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m

# ============================================
# Logging
# ============================================
LOG_LEVEL=info
LOG_PRETTY=false

# ============================================
# Session Management
# ============================================
SESSION_TIMEOUT=3600000
SESSION_CLEANUP_INTERVAL=300000
```

### 步骤 5：创建 Docker Compose 配置

在项目根目录创建或修改 `docker-compose.prod.yml`：

```bash
vim docker-compose.prod.yml
```

```yaml
version: '3.8'

services:
  universal-db-mcp:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: universal-db-mcp
    restart: always
    ports:
      - "127.0.0.1:3000:3000"  # 仅本地访问，通过 Nginx 代理
    environment:
      - MODE=http
      - HTTP_PORT=3000
      - HTTP_HOST=0.0.0.0
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

networks:
  default:
    name: universal-db-mcp-network
```

### 步骤 6：构建并启动服务

```bash
# 构建镜像
docker compose -f docker-compose.prod.yml build

# 启动服务（后台运行）
docker compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f
```

### 步骤 7：验证服务

```bash
# 健康检查
curl http://localhost:3000/api/health

# 预期返回
# {"status":"ok","timestamp":"2024-xx-xxTxx:xx:xx.xxxZ"}

# 服务信息
curl http://localhost:3000/api/info
```

### 更新 Universal DB MCP 版本

**更新步骤** 

```
# 1. 进入项目目录
cd /opt/universal-db-mcp

# 2. 停止当前服务
docker compose down

# 3. 重新构建镜像（会拉取最新 npm 包）
docker compose build --no-cache

# 4. 启动服务
docker compose up -d

# 5. 验证服务正常
docker compose ps
curl http://localhost:3001/api/health
```

**一条命令完成更新** 

```
cd /opt/universal-db-mcp && docker compose down && docker compose build --no-cache && docker compose up -d
```

**查看更新后的版本**

```
# 进入容器查看版本
docker exec universal-db-mcp npm list -g universal-db-mcp
```

**更新后验证**

```
# 检查容器状态
docker compose ps

# 检查日志是否正常
docker compose logs --tail 50

# 测试 API
curl http://localhost:3001/api/health
curl https://universal-db-mcp.anarkh.site/api/health
```

**查看日志**

```
# 进入项目目录
cd /opt/universal-db-mcp

# 查看实时日志（持续输出）
docker compose logs -f

# 查看最近 100 行
docker compose logs --tail 100

# 查看最近 1 小时的日志
docker compose logs --since 1h

# 查看最近 30 分钟的日志
docker compose logs --since 30m
```

---

## 备选方案一：PM2 部署

### 步骤 1：安装 Node.js 20

```bash
# 使用 NodeSource 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证版本
node --version  # 应显示 v20.x.x
npm --version
```

### 步骤 2：安装 PM2

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 验证安装
pm2 --version
```

### 步骤 3：克隆并构建项目

```bash
# 创建应用目录
sudo mkdir -p /opt/apps
sudo chown $USER:$USER /opt/apps
cd /opt/apps

# 克隆项目
git clone https://github.com/Anarkh-Lee/universal-db-mcp.git
cd universal-db-mcp

# 安装依赖
npm ci

# 构建项目
npm run build

# 配置环境变量
cp .env.example .env
vim .env  # 按照上文配置
```

### 步骤 4：创建 PM2 配置文件

```bash
vim ecosystem.config.cjs
```

```javascript
module.exports = {
  apps: [{
    name: 'universal-db-mcp',
    script: 'dist/index.js',
    cwd: '/opt/apps/universal-db-mcp',
    instances: 1,  // 单实例，如需集群可改为 'max' 或具体数字
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      MODE: 'http'
    },
    env_file: '.env',
    max_memory_restart: '500M',
    error_file: '/var/log/universal-db-mcp/error.log',
    out_file: '/var/log/universal-db-mcp/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    restart_delay: 5000
  }]
};
```

### 步骤 5：创建日志目录并启动

```bash
# 创建日志目录
sudo mkdir -p /var/log/universal-db-mcp
sudo chown $USER:$USER /var/log/universal-db-mcp

# 启动服务
pm2 start ecosystem.config.cjs

# 查看状态
pm2 status

# 查看日志
pm2 logs universal-db-mcp

# 设置开机自启
pm2 startup
pm2 save
```

### PM2 常用命令

```bash
# 重启服务
pm2 restart universal-db-mcp

# 停止服务
pm2 stop universal-db-mcp

# 删除服务
pm2 delete universal-db-mcp

# 查看详细信息
pm2 show universal-db-mcp

# 监控面板
pm2 monit
```

---

## 备选方案二：systemd 部署

### 步骤 1：安装 Node.js 20

```bash
# 使用 NodeSource 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证版本
node --version
```

### 步骤 2：克隆并构建项目

```bash
# 创建应用目录
sudo mkdir -p /opt/apps
cd /opt/apps

# 克隆项目
sudo git clone https://github.com/Anarkh-Lee/universal-db-mcp.git
cd universal-db-mcp

# 安装依赖并构建
sudo npm ci
sudo npm run build

# 配置环境变量
sudo cp .env.example .env
sudo vim .env  # 按照上文配置
```

### 步骤 3：创建系统用户

```bash
# 创建专用用户（无登录权限）
sudo useradd --system --no-create-home --shell /bin/false universal-db-mcp

# 设置目录权限
sudo chown -R universal-db-mcp:universal-db-mcp /opt/apps/universal-db-mcp
```

### 步骤 4：创建 systemd 服务文件

```bash
sudo vim /etc/systemd/system/universal-db-mcp.service
```

```ini
[Unit]
Description=Universal DB MCP Server
Documentation=https://github.com/Anarkh-Lee/universal-db-mcp
After=network.target

[Service]
Type=simple
User=universal-db-mcp
Group=universal-db-mcp
WorkingDirectory=/opt/apps/universal-db-mcp
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
StartLimitInterval=60
StartLimitBurst=3

# 环境变量
Environment=NODE_ENV=production
Environment=MODE=http
EnvironmentFile=/opt/apps/universal-db-mcp/.env

# 安全加固
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/opt/apps/universal-db-mcp

# 资源限制
MemoryMax=512M
CPUQuota=80%

# 日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=universal-db-mcp

[Install]
WantedBy=multi-user.target
```

### 步骤 5：启动服务

```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start universal-db-mcp

# 设置开机自启
sudo systemctl enable universal-db-mcp

# 查看状态
sudo systemctl status universal-db-mcp

# 查看日志
sudo journalctl -u universal-db-mcp -f
```

### systemd 常用命令

```bash
# 重启服务
sudo systemctl restart universal-db-mcp

# 停止服务
sudo systemctl stop universal-db-mcp

# 禁用开机自启
sudo systemctl disable universal-db-mcp

# 查看最近日志
sudo journalctl -u universal-db-mcp --since "1 hour ago"
```

---

## 安全配置

### 1. 防火墙配置（UFW）

```bash
# 安装 UFW（如未安装）
sudo apt install -y ufw

# 允许 SSH
sudo ufw allow ssh

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 不要直接开放 3000 端口（通过 Nginx 代理）
# sudo ufw allow 3000/tcp  # 不推荐

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status verbose
```

### 2. 华为云安全组配置

在华为云控制台配置安全组规则：

| 方向 | 协议 | 端口 | 源地址 | 说明 |
|------|------|------|--------|------|
| 入方向 | TCP | 22 | 你的IP/32 | SSH 访问 |
| 入方向 | TCP | 80 | 0.0.0.0/0 | HTTP |
| 入方向 | TCP | 443 | 0.0.0.0/0 | HTTPS |

### 3. API Key 安全

```bash
# 生成强 API Key
openssl rand -hex 32

# 示例输出：a1b2c3d4e5f6...（64位十六进制字符串）
```

**重要提示**：
- 不要在代码中硬编码 API Key
- 定期轮换 API Key
- 使用环境变量或密钥管理服务存储

### 4. 数据库连接安全

- 使用 VPC 内网连接数据库
- 数据库用户使用最小权限原则
- 启用 SSL/TLS 加密连接
- 定期审计数据库访问日志

---

## Nginx 反向代理配置

### 步骤 1：安装 Nginx

```bash
sudo apt install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 步骤 2：创建 Nginx 配置

```bash
sudo vim /etc/nginx/sites-available/universal-db-mcp
```

```nginx
# 上游服务器
upstream universal_db_mcp {
    server 127.0.0.1:3000;
    keepalive 32;
}

# HTTP 重定向到 HTTPS（配置 SSL 后启用）
# server {
#     listen 80;
#     server_name your-domain.com;
#     return 301 https://$server_name$request_uri;
# }

# 主服务器配置
server {
    listen 80;
    # listen 443 ssl http2;  # 配置 SSL 后启用
    server_name your-domain.com;  # 替换为你的域名或 IP

    # SSL 配置（配置证书后启用）
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    # ssl_prefer_server_ciphers off;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 日志
    access_log /var/log/nginx/universal-db-mcp.access.log;
    error_log /var/log/nginx/universal-db-mcp.error.log;

    # 请求体大小限制
    client_max_body_size 10M;

    # API 代理
    location /api/ {
        proxy_pass http://universal_db_mcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    # 健康检查（无需认证）
    location = /api/health {
        proxy_pass http://universal_db_mcp;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # 根路径返回服务信息
    location = / {
        return 200 '{"service":"universal-db-mcp","status":"running"}';
        add_header Content-Type application/json;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

### 步骤 3：启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/universal-db-mcp /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

---

## SSL 证书配置

### 使用 Let's Encrypt（推荐）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书（替换为你的域名）
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 证书自动续期

Certbot 会自动创建定时任务，可以通过以下命令查看：

```bash
sudo systemctl status certbot.timer
```

---

## 监控与日志

### 1. 日志查看

**Docker 部署**：
```bash
# 实时日志
docker compose -f docker-compose.prod.yml logs -f

# 最近 100 行
docker compose -f docker-compose.prod.yml logs --tail 100
```

**PM2 部署**：
```bash
# 实时日志
pm2 logs universal-db-mcp

# 日志文件位置
cat /var/log/universal-db-mcp/out.log
cat /var/log/universal-db-mcp/error.log
```

**systemd 部署**：
```bash
# 实时日志
sudo journalctl -u universal-db-mcp -f

# 最近 1 小时
sudo journalctl -u universal-db-mcp --since "1 hour ago"
```

### 2. 健康检查脚本

创建健康检查脚本 `/opt/scripts/health-check.sh`：

```bash
#!/bin/bash

HEALTH_URL="http://localhost:3000/api/health"
WEBHOOK_URL="your-webhook-url"  # 可选：告警通知

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$response" != "200" ]; then
    echo "[$(date)] Health check failed! HTTP status: $response"
    # 可选：发送告警
    # curl -X POST -H "Content-Type: application/json" -d '{"text":"Universal-DB-MCP health check failed!"}' $WEBHOOK_URL
    exit 1
fi

echo "[$(date)] Health check passed"
exit 0
```

```bash
# 设置执行权限
chmod +x /opt/scripts/health-check.sh

# 添加到 crontab（每 5 分钟检查一次）
crontab -e
# 添加以下行：
# */5 * * * * /opt/scripts/health-check.sh >> /var/log/health-check.log 2>&1
```

### 3. 资源监控

```bash
# 安装 htop
sudo apt install -y htop

# 查看 Docker 容器资源使用
docker stats universal-db-mcp

# 查看系统资源
htop
```

---

## 常见问题排查

### 1. 服务无法启动

```bash
# 检查端口占用
sudo lsof -i :3000
sudo netstat -tlnp | grep 3000

# 检查 Docker 日志
docker compose -f docker-compose.prod.yml logs

# 检查环境变量
docker compose -f docker-compose.prod.yml config
```

### 2. 无法连接数据库

```bash
# 检查网络连通性
ping your-database-host
telnet your-database-host 3306

# 检查防火墙
sudo ufw status

# 检查华为云安全组规则
```

### 3. API 返回 401 Unauthorized

- 检查 API Key 是否正确配置
- 检查请求头是否包含 `X-API-Key` 或 `Authorization: Bearer <key>`
- 检查 .env 文件中的 `API_KEYS` 配置

### 4. 内存不足

```bash
# 查看内存使用
free -h

# 创建 swap 文件（如果内存不足）
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用 swap
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 5. Docker 构建失败

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建（不使用缓存）
docker compose -f docker-compose.prod.yml build --no-cache
```

---

## 维护与更新

### 更新应用

**Docker 部署**：
```bash
cd /opt/apps/universal-db-mcp

# 拉取最新代码
git pull origin main

# 重新构建并启动
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

**PM2 部署**：
```bash
cd /opt/apps/universal-db-mcp

# 拉取最新代码
git pull origin main

# 重新安装依赖并构建
npm ci
npm run build

# 重启服务
pm2 restart universal-db-mcp
```

**systemd 部署**：
```bash
cd /opt/apps/universal-db-mcp

# 停止服务
sudo systemctl stop universal-db-mcp

# 拉取最新代码
sudo git pull origin main

# 重新安装依赖并构建
sudo npm ci
sudo npm run build

# 设置权限
sudo chown -R universal-db-mcp:universal-db-mcp /opt/apps/universal-db-mcp

# 启动服务
sudo systemctl start universal-db-mcp
```

### 备份配置

```bash
# 备份环境变量
cp /opt/apps/universal-db-mcp/.env /opt/backups/universal-db-mcp/.env.$(date +%Y%m%d)

# 备份 Nginx 配置
sudo cp /etc/nginx/sites-available/universal-db-mcp /opt/backups/nginx/universal-db-mcp.$(date +%Y%m%d)
```

### 日志轮转

创建 `/etc/logrotate.d/universal-db-mcp`：

```
/var/log/universal-db-mcp/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 universal-db-mcp universal-db-mcp
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 快速部署命令汇总

### Docker Compose 一键部署

```bash
# 完整部署脚本
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git

# 安装 Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# 克隆项目
sudo mkdir -p /opt/apps && sudo chown $USER:$USER /opt/apps
cd /opt/apps
git clone https://github.com/Anarkh-Lee/universal-db-mcp.git
cd universal-db-mcp

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置 API_KEYS 等

# 启动服务
docker compose -f docker-compose.prod.yml up -d

# 验证
curl http://localhost:3000/api/health
```

---

## 联系与支持

- **项目地址**：https://github.com/Anarkh-Lee/universal-db-mcp
- **问题反馈**：https://github.com/Anarkh-Lee/universal-db-mcp/issues
- **文档**：查看项目 `docs/` 目录

---

*文档版本：1.0.0*