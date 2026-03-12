# 连接稳定性增强（v2.11.0）

本文档记录 v2.11.0 版本中对数据库连接管理的全面升级，彻底解决长时间运行场景下的 `Can't add new command when connection is in closed state` 等连接断开问题。

## 背景

MCP 服务作为长驻进程运行，数据库连接可能因以下原因断开：

- 服务端 `wait_timeout` / `idle_in_transaction_session_timeout` 超时
- 网络中间件（防火墙、NAT、负载均衡）清理空闲连接
- 服务端主动重启或故障切换
- 网络瞬断（`ECONNRESET`、`EPIPE`、`ETIMEDOUT`）

旧版本使用单连接模式，连接断开后所有操作直接失败，用户需要手动重启服务。

## 改动概览

本次升级涉及 **12 个网络数据库适配器**，核心改动包含三个层面：

| 改动 | 说明 |
|------|------|
| 连接池化 | 单连接（`Client`）升级为连接池（`Pool`），自动管理连接生命周期 |
| TCP Keep-Alive / 心跳 | 防止空闲连接被超时关闭 |
| 断线自动重试（`withRetry`） | 检测到连接错误后自动重试，对调用方透明 |

## 各适配器实现方案

### MySQL 系列（mysql2 驱动）

**涉及适配器**：MySQL、TiDB、OceanBase、PolarDB、GoldenDB

**改动**：`mysql.createConnection()` → `mysql.createPool()`

```typescript
// 旧版：单连接
this.connection = await mysql.createConnection({ ... });

// 新版：连接池
this.pool = mysql.createPool({
  host, port, user, password, database,
  // 连接池配置
  waitForConnections: true,
  connectionLimit: 3,
  maxIdle: 1,
  idleTimeout: 60000,
  // TCP Keep-Alive
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
});
```

**连接错误识别**：

```typescript
private isConnectionError(error: unknown): boolean {
  const msg = String((error as any)?.message || '');
  return /closed state|ECONNRESET|EPIPE|ETIMEDOUT|PROTOCOL_CONNECTION_LOST|Connection lost|ECONNREFUSED/.test(msg);
}
```

### PostgreSQL 系列（pg 驱动）

**涉及适配器**：PostgreSQL、KingbaseES、GaussDB、Vastbase、HighGo

**改动**：`new Client()` → `new Pool()`

```typescript
// 旧版：单连接
this.client = new Client({ ... });
await this.client.connect();

// 新版：连接池
this.pool = new Pool({
  host, port, user, password, database,
  max: 3,
  idleTimeoutMillis: 60000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 30000,
});
```

**查询方式变化**：

```typescript
// 旧版：直接使用 client
const result = await this.client.query(sql);

// 新版：pool 自动获取/释放连接
const result = await this.pool.query(sql);
```

**连接错误识别**：

```typescript
private isConnectionError(error: unknown): boolean {
  const msg = String((error as any)?.message || '');
  const code = String((error as any)?.code || '');
  return /Connection terminated|ECONNRESET|EPIPE|ETIMEDOUT|ECONNREFUSED|57P01|57P03|08003|08006/.test(msg + code);
}
```

### Oracle（oracledb 驱动）

**改动**：`oracledb.getConnection()` → `oracledb.createPool()`

```typescript
// 旧版：单连接
this.connection = await oracledb.getConnection({ ... });

// 新版：连接池
this.pool = await oracledb.createPool({
  user, password, connectString,
  poolMin: 1,
  poolMax: 3,
  poolPingInterval: 30,  // 每 30 秒自动检测连接健康
});
```

**查询方式变化**：通过 `withConnection` 辅助方法管理连接获取/释放。

```typescript
private async withConnection<T>(fn: (conn: oracledb.Connection) => Promise<T>): Promise<T> {
  const connection = await this.pool!.getConnection();
  try { return await fn(connection); } finally { await connection.close(); }
}
```

**连接错误识别**：包含 oracledb 特定错误码（NJS-003、NJS-500、ORA-03113、ORA-03114 等）。

### 达梦（dmdb 驱动）

**特殊方案**：dmdb 驱动不支持连接池，改用心跳保活 + 断线重连。

```typescript
// 心跳保活：每 30 秒执行 SELECT 1 FROM DUAL
private startHeartbeat(): void {
  this.heartbeatTimer = setInterval(async () => {
    try {
      if (this.connection) { await this.connection.execute('SELECT 1 FROM DUAL', []); }
    } catch {
      await this.reconnect();
    }
  }, 30000);
}

// 断线重连
private async reconnect(): Promise<void> {
  if (this.connection) { try { await this.connection.close(); } catch {} this.connection = null; }
  const DM = await loadDMDB();
  this.connection = await DM.getConnection(this.connectionConfig);
}
```

## 通用重试机制（withRetry）

所有适配器统一使用 `withRetry` 包装器，对调用方完全透明：

```typescript
private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (this.isConnectionError(error)) {
      // 连接池会自动提供新连接，直接重试
      return await fn();
    }
    throw error;
  }
}
```

**使用方式**：在所有数据库操作中包裹 `withRetry`：

```typescript
async query(sql: string): Promise<QueryResult> {
  return this.withRetry(async () => {
    const [rows] = await this.pool!.query(sql);
    return { rows: rows as Record<string, unknown>[] };
  });
}
```

## 不需要修改的适配器

以下适配器已有内置连接管理机制，无需改动：

| 适配器 | 原因 |
|--------|------|
| SQL Server（mssql） | 驱动内置连接池 |
| Redis（ioredis） | 内置自动重连机制 |
| MongoDB（mongodb） | 内置连接池和故障恢复 |
| SQLite（better-sqlite3） | 本地文件访问，无网络连接 |
| ClickHouse（@clickhouse/client） | HTTP 协议，每次请求独立连接 |

## 连接池参数说明

### MySQL 系列

| 参数 | 值 | 说明 |
|------|----|------|
| `connectionLimit` | 3 | 最大连接数（MCP 场景并发低，3 个足够） |
| `maxIdle` | 1 | 最大空闲连接数 |
| `idleTimeout` | 60000 | 空闲连接超时时间（60 秒） |
| `enableKeepAlive` | true | 启用 TCP Keep-Alive |
| `keepAliveInitialDelay` | 30000 | Keep-Alive 初始延迟（30 秒） |

### PostgreSQL 系列

| 参数 | 值 | 说明 |
|------|----|------|
| `max` | 3 | 最大连接数 |
| `idleTimeoutMillis` | 60000 | 空闲连接超时时间（60 秒） |
| `keepAlive` | true | 启用 TCP Keep-Alive |
| `keepAliveInitialDelayMillis` | 30000 | Keep-Alive 初始延迟（30 秒） |

### Oracle

| 参数 | 值 | 说明 |
|------|----|------|
| `poolMin` | 1 | 最小连接数 |
| `poolMax` | 3 | 最大连接数 |
| `poolPingInterval` | 30 | 连接健康检测间隔（30 秒） |

### 达梦

| 参数 | 值 | 说明 |
|------|----|------|
| 心跳间隔 | 30000ms | 每 30 秒执行 `SELECT 1 FROM DUAL` |

## 文件变更清单

### 适配器代码（src/adapters/）

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `mysql.ts` | 连接池化 | `createConnection` → `createPool` + `withRetry` |
| `tidb.ts` | 连接池化 | 同 MySQL |
| `oceanbase.ts` | 连接池化 | 同 MySQL |
| `polardb.ts` | 连接池化 | 同 MySQL |
| `goldendb.ts` | 连接池化 | 同 MySQL |
| `postgres.ts` | 连接池化 | `Client` → `Pool` + `withRetry` |
| `kingbase.ts` | 连接池化 | 同 PostgreSQL |
| `gaussdb.ts` | 连接池化 | 同 PostgreSQL |
| `vastbase.ts` | 连接池化 | 同 PostgreSQL |
| `highgo.ts` | 连接池化 | 同 PostgreSQL |
| `oracle.ts` | 连接池化 | `getConnection` → `createPool` + `withConnection` + `withRetry` |
| `dm.ts` | 心跳保活 | 新增 `heartbeat` + `reconnect` + `withRetry` |

### 文档（docs/）

| 文件 | 改动 |
|------|------|
| `docs/databases/mysql.md` | 新增"连接稳定性"章节 |
| `docs/databases/postgresql.md` | 新增"连接稳定性"章节 |
| `docs/databases/oracle.md` | 新增"连接稳定性"章节 |
| `docs/databases/dameng.md` | 新增"连接稳定性"章节 |
| `docs/databases/kingbase.md` | 新增"连接稳定性"章节 |
| `docs/databases/gaussdb.md` | 新增"连接稳定性"章节 |
| `docs/databases/oceanbase.md` | 新增"连接稳定性"章节 |
| `docs/databases/tidb.md` | 新增"连接断开"故障排查条目 |
| `docs/databases/polardb.md` | 新增"连接断开"故障排查条目 |
| `docs/databases/goldendb.md` | 新增"连接断开"故障排查条目 |
| `docs/databases/vastbase.md` | 新增"连接断开"故障排查条目 |
| `docs/databases/highgo.md` | 新增"连接断开"故障排查条目 |
| `docs/development/architecture.md` | 适配器分类表新增"连接管理"列 |

### 其他

| 文件 | 改动 |
|------|------|
| `CHANGELOG.md` | 新增 v2.11.0 版本记录 |
| `README.md` | 新增 Connection Stability 特性说明 |
| `README.zh-CN.md` | 新增"连接稳定性"特性说明 |
