# 数据库支持

Universal DB MCP 支持 17 种数据库，涵盖关系型、NoSQL、分布式和国产数据库。

## 支持的数据库

| 数据库 | 类型参数 | 默认端口 | 驱动 | 状态 |
|--------|---------|---------|------|------|
| [MySQL](./mysql.md) | `mysql` | 3306 | mysql2 | ✅ |
| [PostgreSQL](./postgresql.md) | `postgres` | 5432 | pg | ✅ |
| [Redis](./redis.md) | `redis` | 6379 | ioredis | ✅ |
| [Oracle](./oracle.md) | `oracle` | 1521 | oracledb | ✅ |
| [SQL Server](./sqlserver.md) | `sqlserver` | 1433 | mssql | ✅ |
| [MongoDB](./mongodb.md) | `mongodb` | 27017 | mongodb | ✅ |
| [SQLite](./sqlite.md) | `sqlite` | - | better-sqlite3 | ✅ |
| [达梦](./dameng.md) | `dm` | 5236 | dmdb | ✅ |
| [KingbaseES](./kingbase.md) | `kingbase` | 54321 | pg | ✅ |
| [GaussDB](./gaussdb.md) | `gaussdb` | 5432 | pg | ✅ |
| [OceanBase](./oceanbase.md) | `oceanbase` | 2881 | mysql2 | ✅ |
| [TiDB](./tidb.md) | `tidb` | 4000 | mysql2 | ✅ |
| [ClickHouse](./clickhouse.md) | `clickhouse` | 8123 | @clickhouse/client | ✅ |
| [PolarDB](./polardb.md) | `polardb` | 3306 | mysql2 | ✅ |
| [Vastbase](./vastbase.md) | `vastbase` | 5432 | pg | ✅ |
| [HighGo](./highgo.md) | `highgo` | 5866 | pg | ✅ |
| [GoldenDB](./goldendb.md) | `goldendb` | 3306 | mysql2 | ✅ |

## 数据库分类

### 关系型数据库

- **MySQL** - 最流行的开源关系型数据库
- **PostgreSQL** - 功能强大的开源对象关系型数据库
- **Oracle** - 企业级商业数据库
- **SQL Server** - 微软的企业级数据库
- **SQLite** - 轻量级嵌入式数据库

### NoSQL 数据库

- **Redis** - 高性能键值存储
- **MongoDB** - 文档型数据库

### 分布式数据库

- **TiDB** - 分布式 NewSQL 数据库，兼容 MySQL
- **OceanBase** - 蚂蚁金服分布式数据库
- **PolarDB** - 阿里云云原生数据库
- **ClickHouse** - 列式 OLAP 数据库

### 国产数据库

- **达梦（DM）** - 国产关系型数据库
- **KingbaseES** - 人大金仓数据库
- **GaussDB/OpenGauss** - 华为高斯数据库
- **Vastbase** - 海量数据数据库
- **HighGo** - 瀚高数据库
- **GoldenDB** - 中兴分布式数据库

## 兼容性说明

### MySQL 兼容

以下数据库兼容 MySQL 协议，使用相同的驱动：

- TiDB（兼容 MySQL 5.7）
- OceanBase（兼容 MySQL）
- PolarDB（兼容 MySQL 5.6/5.7/8.0）
- GoldenDB（兼容 MySQL 5.7/8.0）

### PostgreSQL 兼容

以下数据库兼容 PostgreSQL 协议，使用相同的驱动：

- KingbaseES
- GaussDB/OpenGauss
- Vastbase
- HighGo

## 驱动依赖

大多数驱动会自动安装。以下是特殊情况：

### 达梦数据库

```bash
npm install -g dmdb
```

### SQLite

需要编译环境。Windows 上需要安装 Visual Studio Build Tools。

### Oracle

需要 Oracle Instant Client。请参考 [Oracle 官方文档](https://oracle.github.io/node-oracledb/INSTALL.html)。

## 功能支持

| 功能 | 关系型 | Redis | MongoDB | ClickHouse |
|------|--------|-------|---------|------------|
| 获取 Schema | ✅ | ✅ | ✅ | ✅ |
| 外键关系 | ✅ | - | - | - |
| 执行查询 | ✅ | ✅ | ✅ | ✅ |
| 写入操作 | ✅ | ✅ | ✅ | ✅ |
| 参数化查询 | ✅ | - | ✅ | ✅ |
| 事务支持 | ✅ | - | ✅ | - |

## 下一步

选择你使用的数据库，查看详细配置指南：

- [MySQL](./mysql.md)
- [PostgreSQL](./postgresql.md)
- [Redis](./redis.md)
- [MongoDB](./mongodb.md)
- [更多数据库...](#支持的数据库)
