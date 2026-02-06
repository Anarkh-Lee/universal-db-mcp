# Text2SQL 准确性提升方案

本文档详细介绍 Universal DB MCP 为帮助 LLM 更好地理解数据库结构、提升 Text2SQL 准确性所做的技术方案。

## 目录

- [一、方案概览](#一方案概览)
- [二、Schema 信息完整性](#二schema-信息完整性)
- [三、表间关系理解](#三表间关系理解)
- [四、性能优化](#四性能优化)
- [五、数据库支持矩阵](#五数据库支持矩阵)
- [六、技术原理](#六技术原理)
- [七、版本演进](#七版本演进)
- [八、未来规划](#八未来规划)

---

## 一、方案概览

### 1.1 设计目标

帮助 LLM 生成准确的 SQL 查询，需要解决以下问题：

| 问题 | 解决方案 | 效果 |
|-----|---------|------|
| LLM 不知道有哪些表 | 提供完整的表列表 | 避免查询不存在的表 |
| LLM 不理解表的业务含义 | 提供表注释和列注释 | 生成语义正确的查询 |
| LLM 不知道如何 JOIN | 提供外键和关系信息 | 生成正确的关联查询 |
| LLM 不知道数据类型 | 提供精确的类型信息 | 生成类型安全的 SQL |
| Schema 获取太慢 | 批量查询 + 缓存 | 快速响应，提升体验 |

### 1.2 功能分层

```
┌─────────────────────────────────────────────────────────────┐
│                    第一层：基础 Schema 信息                   │
│  表名、列名、数据类型、主键、索引、预估行数                    │
│  （所有 17 个数据库支持）                                     │
├─────────────────────────────────────────────────────────────┤
│                    第二层：语义增强信息                        │
│  表注释、列注释                                               │
│  （14 个数据库支持，NoSQL 和 SQLite 除外）                    │
├─────────────────────────────────────────────────────────────┤
│                    第三层：关系理解                            │
│  显式外键、隐式关系推断、关系类型细化                          │
│  （14 个关系型数据库支持，NoSQL 除外）                        │
├─────────────────────────────────────────────────────────────┤
│                    第四层：性能优化                            │
│  批量查询、智能缓存                                           │
│  （所有 17 个数据库支持）                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、Schema 信息完整性

### 2.1 核心数据结构

#### SchemaInfo - 数据库级信息

```typescript
interface SchemaInfo {
  databaseType: string;           // 数据库类型（mysql, postgres, oracle...）
  databaseName: string;           // 数据库名称
  tables: TableInfo[];            // 所有表信息
  version?: string;               // 数据库版本
  relationships?: RelationshipInfo[];  // 全局关系视图
}
```

**LLM 收益**：了解数据库全貌，知道有哪些表可用。

#### TableInfo - 表级信息

```typescript
interface TableInfo {
  name: string;                   // 表名
  comment?: string;               // 表注释（业务含义）
  columns: ColumnInfo[];          // 列信息
  primaryKeys: string[];          // 主键列
  indexes?: IndexInfo[];          // 索引信息
  foreignKeys?: ForeignKeyInfo[]; // 外键约束
  estimatedRows?: number;         // 预估行数
}
```

**LLM 收益**：
- `comment`：理解表的业务用途（如"订单主表"）
- `primaryKeys`：知道用什么列做唯一标识
- `indexes`：优化查询条件，使用索引列
- `estimatedRows`：判断表大小，优化查询策略

#### ColumnInfo - 列级信息

```typescript
interface ColumnInfo {
  name: string;                   // 列名
  type: string;                   // 数据类型（含长度/精度）
  nullable: boolean;              // 是否可空
  defaultValue?: string;          // 默认值
  comment?: string;               // 列注释
}
```

**LLM 收益**：
- `type`：生成类型安全的 SQL（如日期格式、数值精度）
- `nullable`：判断是否需要 NULL 检查
- `comment`：理解列的业务含义

### 2.2 注释信息获取

#### 表注释

| 数据库 | 获取方式 | 支持情况 |
|-------|---------|---------|
| MySQL | `INFORMATION_SCHEMA.TABLES.TABLE_COMMENT` | ✅ |
| PostgreSQL | `obj_description(oid, 'pg_class')` | ✅ |
| Oracle | `ALL_TAB_COMMENTS.COMMENTS` | ✅ |
| SQL Server | `sys.extended_properties` (MS_Description) | ✅ |
| SQLite | 无原生支持 | ❌ |
| Redis/MongoDB | NoSQL，无表概念 | ❌ |
| TiDB | 同 MySQL | ✅ |
| 达梦 | `USER_TAB_COMMENTS.COMMENTS` | ✅ |
| KingbaseES | 同 PostgreSQL | ✅ |
| GaussDB | 同 PostgreSQL | ✅ |
| OceanBase | 同 MySQL | ✅ |
| PolarDB | 同 MySQL | ✅ |
| Vastbase | 同 PostgreSQL | ✅ |
| HighGo | 同 PostgreSQL | ✅ |
| GoldenDB | 同 MySQL | ✅ |
| ClickHouse | `system.tables.comment` | ✅ |

#### 列注释

所有支持表注释的数据库同样支持列注释，获取方式类似。

---

## 三、表间关系理解

### 3.1 显式外键关系

#### 数据结构

```typescript
interface ForeignKeyInfo {
  name: string;                   // 约束名称
  columns: string[];              // 本表外键列
  referencedTable: string;        // 引用的表
  referencedColumns: string[];    // 引用的列
  onDelete?: string;              // 删除规则
  onUpdate?: string;              // 更新规则
}
```

#### 获取方式

| 数据库 | 系统表/视图 |
|-------|-----------|
| MySQL | `INFORMATION_SCHEMA.KEY_COLUMN_USAGE` + `REFERENTIAL_CONSTRAINTS` |
| PostgreSQL | `pg_constraint` |
| Oracle | `ALL_CONSTRAINTS` + `ALL_CONS_COLUMNS` |
| SQL Server | `sys.foreign_keys` + `sys.foreign_key_columns` |
| SQLite | `PRAGMA foreign_key_list` |

**LLM 收益**：知道表之间的关联关系，生成正确的 JOIN 语句。

### 3.2 全局关系视图

#### 数据结构

```typescript
interface RelationshipInfo {
  fromTable: string;              // 源表
  fromColumns: string[];          // 源列
  toTable: string;                // 目标表
  toColumns: string[];            // 目标列
  type: 'one-to-one' | 'one-to-many' | 'many-to-one';
  constraintName?: string;        // 约束名（显式外键）
  source: 'foreign_key' | 'inferred';  // 关系来源
  confidence?: number;            // 置信度（推断关系）
}
```

**LLM 收益**：
- 一次性获取所有表间关系，无需逐表查看外键
- `type` 字段帮助理解关系方向
- `source` 字段区分显式外键和推断关系

### 3.3 隐式关系推断

#### 设计背景

很多数据库（尤其是老旧系统或从 NoSQL 迁移的系统）没有定义外键约束，但存在命名约定。

#### 推断规则

| 规则 | 列名模式 | 目标表 | 目标列 | 置信度 |
|-----|---------|-------|-------|-------|
| 1 | `xxx_id` | `xxxs` / `xxx` | `id` | 0.90-0.95 |
| 2 | `xxxId` (驼峰) | `xxxs` / `xxx` | `id` | 0.85-0.90 |
| 3 | `xxx_code` | `xxxs` / `xxx` | `code` | 0.90-0.95 |
| 4 | `xxx_no` | `xxxs` / `xxx` | `xxx_no` | 0.70-0.75 |

#### 安全规则

推断遵循"宁可漏掉，不可错推"原则：

1. **不覆盖显式外键**：已有外键的列不进行推断
2. **验证目标表存在**：只有目标表确实存在时才推断
3. **验证目标列存在**：确保目标表有对应的主键/唯一列
4. **跳过主键列**：主键通常不是外键
5. **精确匹配优先**：只做精确表名匹配，避免误匹配

#### 示例

```
数据库中的表：users, orders, products

orders 表的列：
- id (主键，跳过)
- user_id → 推断到 users.id (置信度 0.95)
- product_id → 推断到 products.id (置信度 0.95)
- status (不符合规则，跳过)
```

### 3.4 关系类型细化

#### 原理

通过检查外键列是否有唯一约束，区分 `one-to-one` 和 `many-to-one`：

```typescript
function determineRelationType(table: TableInfo, fkColumns: string[]) {
  // 检查外键列是否有唯一索引
  const hasUniqueConstraint = table.indexes?.some(idx =>
    idx.unique &&
    idx.columns.length === fkColumns.length &&
    idx.columns.every(c => fkColumns.includes(c))
  );

  return hasUniqueConstraint ? 'one-to-one' : 'many-to-one';
}
```

#### 示例

```sql
-- user_profiles.user_id 有唯一索引
CREATE TABLE user_profiles (
  id INT PRIMARY KEY,
  user_id INT UNIQUE,  -- 唯一约束
  bio TEXT
);

-- 推断结果：user_profiles → users 是 one-to-one 关系
```

**LLM 收益**：理解关系的基数，生成更准确的查询。

---

## 四、性能优化

### 4.1 批量查询优化

#### 问题

传统方式获取 Schema 需要 N+1 次查询：

```
1 次查询获取表列表
N 次查询获取每个表的列信息
N 次查询获取每个表的索引信息
N 次查询获取每个表的外键信息
...
```

对于 100 张表的数据库，需要 400+ 次查询。

#### 解决方案

使用批量查询，一次获取所有表的信息：

```sql
-- MySQL 示例：一次获取所有列信息
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, ...
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 一次获取所有索引信息
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE, ...
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

然后在内存中组装数据。

#### 性能提升

| 表数量 | 优化前 | 优化后 | 提升倍数 |
|--------|--------|--------|----------|
| 50 张表 | ~5 秒 | ~200 毫秒 | **25x** |
| 100 张表 | ~10 秒 | ~300 毫秒 | **33x** |
| 500 张表 | ~50 秒 | ~500 毫秒 | **100x** |

### 4.2 智能缓存

#### 缓存策略

```typescript
interface SchemaCacheConfig {
  enabled: boolean;    // 是否启用缓存（默认 true）
  ttl: number;         // 缓存过期时间（默认 5 分钟）
}
```

#### 功能特性

- **自动缓存**：首次获取 Schema 后自动缓存
- **TTL 过期**：缓存自动过期，保证数据新鲜度
- **强制刷新**：支持 `forceRefresh` 参数强制更新
- **命中率统计**：提供缓存命中率指标

#### 返回信息

```json
{
  "tables": [...],
  "_cacheInfo": {
    "cached": true,
    "cachedAt": "2024-01-20T10:30:00Z",
    "hitRate": "85.00%"
  }
}
```

**LLM 收益**：快速获取 Schema，提升交互体验。

---

## 五、数据库支持矩阵

### 5.1 功能支持表

| 数据库 | 基础 Schema | 表注释 | 列注释 | 外键 | 隐式推断 | 批量优化 | 缓存 |
|-------|:---------:|:-----:|:-----:|:---:|:------:|:------:|:---:|
| MySQL | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PostgreSQL | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Oracle | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SQL Server | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SQLite | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| TiDB | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 达梦 | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| KingbaseES | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GaussDB | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| OceanBase | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PolarDB | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vastbase | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| HighGo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GoldenDB | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ClickHouse | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Redis | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| MongoDB | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

**说明**：
- ✅ 完全支持
- ⚠️ 部分支持（达梦因兼容性问题不使用批量优化）
- ❌ 不支持（技术限制或不适用）

### 5.2 不支持原因

| 数据库 | 不支持功能 | 原因 |
|-------|----------|------|
| SQLite | 表注释 | SQLite 无原生表注释语法 |
| Redis | 注释/外键/推断 | NoSQL，无表结构概念 |
| MongoDB | 注释/外键/推断 | NoSQL，无表结构概念 |
| ClickHouse | 外键 | OLAP 数据库，不支持外键约束 |

---

## 六、技术原理

### 6.1 为什么这些功能提升 Text2SQL 准确性？

#### 1. 完整的 Schema 信息

**问题**：LLM 不知道数据库有哪些表和列。

**解决**：提供完整的表、列、类型信息。

**效果**：LLM 只会使用存在的表和列，避免生成无效 SQL。

#### 2. 表间关系视图

**问题**：LLM 不知道如何 JOIN 多个表。

**解决**：提供外键和关系信息。

**效果**：LLM 生成正确的 JOIN 条件，如 `orders.user_id = users.id`。

#### 3. 隐式关系推断

**问题**：很多数据库没有定义外键约束。

**解决**：基于命名约定推断关系。

**效果**：即使没有外键，LLM 也能理解表关联。

#### 4. 置信度评分

**问题**：推断的关系可能不准确。

**解决**：为推断关系标注置信度。

**效果**：LLM 可根据置信度判断关系可靠性。

#### 5. 注释信息

**问题**：LLM 不理解表和列的业务含义。

**解决**：提供表注释和列注释。

**效果**：LLM 理解"订单表"、"用户ID"等业务概念。

#### 6. 索引信息

**问题**：LLM 生成的查询可能性能差。

**解决**：提供索引信息。

**效果**：LLM 优先使用索引列作为查询条件。

#### 7. 行数估算

**问题**：LLM 不知道表的数据量。

**解决**：提供预估行数。

**效果**：LLM 可优化大表查询策略（如添加 LIMIT）。

#### 8. 数据类型精确

**问题**：LLM 可能生成类型不匹配的 SQL。

**解决**：提供精确的数据类型（含长度/精度）。

**效果**：LLM 生成类型安全的 SQL。

### 6.2 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                         LLM                                  │
│                          ↓                                   │
│                    MCP 协议调用                               │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│                    MCP Server                                │
│              (get_schema, execute_query, ...)                │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│                  DatabaseService                             │
│              (缓存管理, Schema 增强)                          │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│                  SchemaEnhancer                              │
│           (隐式关系推断, 关系类型细化)                         │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│                   DbAdapter                                  │
│         (MySQL, PostgreSQL, Oracle, ... 17种)                │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│                      数据库                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 七、版本演进

| 版本 | 功能 | Text2SQL 提升 |
|-----|------|--------------|
| v1.0.0 | 基础 Schema（表、列、类型、主键、索引） | 基准 |
| v2.1.0 | Schema 缓存机制 | 响应速度提升 |
| v2.2.0 | 批量查询优化（25-100x 性能提升） | 大型数据库可用 |
| v2.7.0 | 外键关系支持 | +15-20% |
| v2.8.0 | 表注释支持 | +10-15% |
| v2.8.0 | 隐式关系推断 | +15-20% |
| v2.8.0 | 关系类型细化 | +5% |

**综合预期**：Text2SQL 准确性提升 **35-50%**。

---

## 八、未来规划

以下是计划实现的功能，将进一步提升 LLM 对数据库的理解和 Text2SQL 准确性。

### 8.1 按需增强工具（P1 优先级）

#### 8.1.1 枚举值提取工具 `get_enum_values`

**为什么需要这个功能？**

很多数据库表中存在状态列（如 `status`、`type`、`category`），这些列的值是有限的枚举集合。LLM 在生成 SQL 时，如果不知道这些枚举值，可能会：
- 猜测错误的值（如用 `"completed"` 而实际是 `"done"`）
- 使用不存在的值（如用 `"success"` 而实际只有 `"paid"`）
- 无法理解用户的自然语言描述（如用户说"已完成"对应哪个值）

**如何带来收益？**

通过提供枚举列的所有可能值，LLM 可以：
1. 精确匹配用户意图到正确的枚举值
2. 在生成 SQL 时使用准确的 WHERE 条件
3. 理解业务状态流转（通过值的分布）

**完整示例**

```
场景：电商订单系统，orders 表有 status 列

用户问：查询所有已支付的订单

【没有枚举值工具时】
LLM 猜测：SELECT * FROM orders WHERE status = 'paid'
实际结果：可能错误，因为实际值可能是 'PAID' 或 'payment_completed'

【有枚举值工具时】
Step 1: LLM 调用 get_enum_values('orders', 'status')
Step 2: 返回 {
  values: ["pending", "payment_completed", "shipped", "delivered", "cancelled"],
  sampleCounts: {"pending": 1200, "payment_completed": 3500, ...}
}
Step 3: LLM 理解 "已支付" 对应 "payment_completed"
Step 4: 生成 SELECT * FROM orders WHERE status = 'payment_completed'
结果：准确匹配用户意图
```

**设计方案**：
```typescript
{
  name: 'get_enum_values',
  description: '获取指定列的所有可能值，适用于 status、type 等枚举列',
  inputSchema: {
    tableName: string,    // 表名
    columnName: string,   // 列名
    limit: number         // 最大返回数量（默认 50）
  }
}
```

**返回结构**：
```typescript
interface EnumValuesResult {
  tableName: string;
  columnName: string;
  values: string[];           // 所有唯一值
  totalCount: number;         // 唯一值总数
  isEnum: boolean;            // 是否适合作为枚举（count < limit）
  sampleCounts?: {            // 每个值的出现次数
    [value: string]: number;
  };
}
```

**预期收益**：Text2SQL 准确性 +10-15%

---

#### 8.1.2 示例数据工具 `get_sample_data`

**为什么需要这个功能？**

LLM 只看 Schema 信息（列名、类型）无法理解数据的实际格式，例如：
- 日期格式：是 `2024-01-20` 还是 `20240120` 还是 `Jan 20, 2024`？
- ID 格式：是纯数字 `12345` 还是带前缀 `ORD-12345`？
- 编码规则：产品编码是 `P001` 还是 `PROD-2024-001`？

这些格式差异会导致 LLM 生成错误的查询条件。

**如何带来收益？**

通过提供真实的示例数据（已脱敏），LLM 可以：
1. 理解数据的实际格式和模式
2. 生成格式正确的查询条件
3. 避免类型转换错误

**完整示例**

```
场景：订单表的 order_no 列

用户问：查询订单号 12345 的订单

【没有示例数据时】
LLM 猜测：SELECT * FROM orders WHERE order_no = '12345'
实际结果：查不到数据，因为实际格式是 'ORD-2024-12345'

【有示例数据工具时】
Step 1: LLM 调用 get_sample_data('orders', ['order_no', 'created_at'])
Step 2: 返回 {
  rows: [
    { order_no: "ORD-2024-00001", created_at: "2024-01-15 10:30:00" },
    { order_no: "ORD-2024-00002", created_at: "2024-01-15 11:45:00" },
    { order_no: "ORD-2024-00003", created_at: "2024-01-16 09:20:00" }
  ]
}
Step 3: LLM 理解 order_no 格式是 'ORD-YYYY-NNNNN'
Step 4: 生成 SELECT * FROM orders WHERE order_no = 'ORD-2024-12345'
        或 SELECT * FROM orders WHERE order_no LIKE '%12345%'
结果：正确查询到数据
```

**设计方案**：
```typescript
{
  name: 'get_sample_data',
  description: '获取指定表的示例数据（已脱敏）',
  inputSchema: {
    tableName: string,        // 表名
    columns?: string[],       // 要查看的列（可选）
    limit: number             // 返回行数（默认 3，最大 10）
  }
}
```

**内置脱敏规则**：
| 数据类型 | 脱敏方式 | 示例 |
|---------|---------|------|
| 手机号 | 中间 4 位隐藏 | `138****1234` |
| 邮箱 | 用户名部分隐藏 | `z***@example.com` |
| 身份证 | 中间 11 位隐藏 | `110***********1234` |
| 银行卡 | 只显示后 4 位 | `************1234` |
| 密码类 | 完全隐藏 | `******` |

**预期收益**：Text2SQL 准确性 +5-10%

---

### 8.2 高级功能（P2 优先级）

#### 8.2.1 列统计工具 `get_column_stats`

**为什么需要这个功能？**

LLM 在生成查询时，不了解数据的分布特征，可能导致：
- 对高基数列使用 `=` 而不是 `LIKE`（如姓名列）
- 对低基数列使用 `LIKE` 而不是 `=`（如状态列）
- 不知道某列是否有大量 NULL 值需要特殊处理
- 无法判断数值范围，生成不合理的范围查询

**如何带来收益？**

通过提供列的统计信息，LLM 可以：
1. 根据唯一值数量判断是否适合精确匹配
2. 根据 NULL 比例决定是否需要 `IS NOT NULL` 条件
3. 根据最大最小值生成合理的范围查询
4. 优化查询策略，提高查询效率

**完整示例**

```
场景：用户表的 email 列查询

用户问：查询邮箱包含 "gmail" 的用户

【没有列统计时】
LLM 可能生成：SELECT * FROM users WHERE email = 'gmail'
结果：查不到任何数据

【有列统计工具时】
Step 1: LLM 调用 get_column_stats('users', 'email')
Step 2: 返回 {
  distinctCount: 45000,      // 高基数，每个值几乎唯一
  nullCount: 500,            // 有一些空值
  nullPercentage: 1.1%
}
Step 3: LLM 理解 email 是高基数列，应该用模糊匹配
Step 4: 生成 SELECT * FROM users WHERE email LIKE '%gmail%'
结果：正确查询到所有 Gmail 用户
```

**设计方案**：
```typescript
{
  name: 'get_column_stats',
  description: '获取指定列的统计信息',
  inputSchema: {
    tableName: string,
    columnName: string
  }
}
```

**返回结构**：
```typescript
interface ColumnStatsResult {
  tableName: string;
  columnName: string;
  totalRows: number;          // 总行数
  distinctCount: number;      // 唯一值数量
  nullCount: number;          // 空值数量
  nullPercentage: number;     // 空值比例
  minValue?: string | number; // 最小值
  maxValue?: string | number; // 最大值
  avgLength?: number;         // 平均长度（字符串）
  avgValue?: number;          // 平均值（数值）
}
```

**预期收益**：Text2SQL 准确性 +3-5%

---

#### 8.2.2 业务术语映射 `get_business_glossary`

**为什么需要这个功能？**

用户使用自然语言提问时，常用业务术语而非数据库字段名：
- 用户说"客户"，数据库是 `users` 表
- 用户说"成交金额"，数据库是 `orders.total_amount`
- 用户说"有效订单"，实际是 `status NOT IN ('cancelled', 'refunded')`

LLM 可能无法准确将业务术语映射到正确的表和列。

**如何带来收益？**

通过提供业务术语词典，LLM 可以：
1. 准确理解用户的业务语言
2. 映射到正确的数据库对象
3. 应用预定义的业务规则

**完整示例**

```
场景：财务报表查询

用户问：统计本月有效订单的成交金额

【没有业务术语映射时】
LLM 猜测：SELECT SUM(amount) FROM orders WHERE ...
结果：可能用错列名（amount vs total_amount），漏掉有效订单条件

【有业务术语映射时】
Step 1: LLM 调用 get_business_glossary()
Step 2: 返回 {
  termMappings: [
    { terms: ["成交金额"], table: "orders", column: "total_amount" },
    { terms: ["有效订单"], table: "orders", condition: "status NOT IN ('cancelled', 'refunded')" }
  ]
}
Step 3: LLM 理解：
  - "成交金额" = orders.total_amount
  - "有效订单" = status NOT IN ('cancelled', 'refunded')
Step 4: 生成
  SELECT SUM(total_amount)
  FROM orders
  WHERE status NOT IN ('cancelled', 'refunded')
    AND created_at >= '2024-01-01'
结果：准确的业务查询
```

**配置文件** `config/business-glossary.json`：
```json
{
  "termMappings": [
    {
      "terms": ["客户", "买家", "用户"],
      "table": "users",
      "description": "系统注册用户"
    },
    {
      "terms": ["订单金额", "成交金额"],
      "table": "orders",
      "column": "total_amount"
    }
  ],
  "businessRules": [
    {
      "name": "有效订单",
      "condition": "status NOT IN ('cancelled', 'refunded')",
      "table": "orders"
    }
  ]
}
```

**预期收益**：Text2SQL 准确性 +5-10%（需人工配置）

---

### 8.3 隐式关系推断增强（P2 优先级）

#### 8.3.1 后缀匹配支持

**为什么需要这个功能？**

当前的隐式关系推断只支持精确表名匹配：
- `user_id` → 查找 `users` 或 `user` 表

但很多企业数据库使用表名前缀来区分模块：
- `hr_users`（人力资源模块）
- `crm_users`（客户关系模块）
- `training_departments`（培训模块）

这导致 `department_id` 无法推断到 `training_departments`。

**如何带来收益？**

通过后缀匹配，可以：
1. 支持带前缀的表名
2. 扩大隐式关系推断的覆盖范围
3. 帮助 LLM 理解更多表间关系

**完整示例**

```
场景：培训管理系统

表结构：
- training_departments (id, name)
- training_employees (id, name, department_id)

【当前行为】
department_id → 查找 departments / department → 找不到 → 不推断

【增强后】
department_id → 后缀匹配 *departments → 找到 training_departments → 推断关系
返回：{
  fromTable: "training_employees",
  fromColumns: ["department_id"],
  toTable: "training_departments",
  toColumns: ["id"],
  source: "inferred",
  confidence: 0.85  // 后缀匹配置信度略低
}

LLM 收益：理解 training_employees.department_id → training_departments.id
生成正确的 JOIN：
SELECT e.*, d.name as dept_name
FROM training_employees e
JOIN training_departments d ON e.department_id = d.id
```

**安全规则**：
- 只有唯一匹配时才推断（避免误导）
- 多个匹配时放弃推断
- 后缀匹配的置信度降低 0.05-0.10

---

#### 8.3.2 缩写识别

**为什么需要这个功能？**

很多数据库使用缩写命名外键列：
- `dept_id` 而不是 `department_id`
- `org_id` 而不是 `organization_id`
- `cat_id` 而不是 `category_id`

当前的推断规则无法识别这些缩写。

**如何带来收益？**

通过内置常见缩写映射，可以：
1. 识别缩写形式的外键列
2. 推断到正确的目标表
3. 进一步扩大关系推断覆盖范围

**完整示例**

```
场景：员工表使用缩写

表结构：
- departments (id, name)
- employees (id, name, dept_id)  // 使用缩写 dept

【当前行为】
dept_id → 查找 depts / dept → 找不到 → 不推断

【增强后】
dept_id → 识别 dept 是 department 的缩写
       → 查找 departments / department
       → 找到 departments
       → 推断关系
返回：{
  fromTable: "employees",
  fromColumns: ["dept_id"],
  toTable: "departments",
  toColumns: ["id"],
  source: "inferred",
  confidence: 0.75  // 缩写匹配置信度较低
}

LLM 收益：理解 employees.dept_id → departments.id
```

**常见缩写映射**：
| 缩写 | 完整形式 |
|-----|---------|
| `dept` | `department` |
| `org` | `organization` |
| `cat` | `category` |
| `prod` | `product` |
| `cust` | `customer` |

**置信度**：缩写匹配置信度 0.75-0.80（低于精确匹配，提示 LLM 谨慎使用）

---

### 8.4 实施路线图

```
┌─────────────────────────────────────────────────────────────┐
│                    P1 优先级（下一版本）                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  按需增强工具                                        │   │
│  │  - get_enum_values（枚举值提取）                     │   │
│  │  - get_sample_data（脱敏示例数据）                   │   │
│  │  预期收益：+15-25%                                   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    P2 优先级（后续版本）                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  高级功能                                            │   │
│  │  - get_column_stats（列统计信息）                    │   │
│  │  - get_business_glossary（业务术语映射）             │   │
│  │  - 隐式关系推断增强（后缀匹配、缩写识别）             │   │
│  │  预期收益：+10-20%                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 8.5 不采纳的方案

以下方案经评估后决定不实施：

| 方案 | 不采纳理由 |
|-----|----------|
| 业务领域标签 `businessDomain` | 无法自动获取，需人工为每个表配置，维护成本高 |
| 语义类型 `semanticType` | 通过列名推断准确性有限，LLM 本身具备推断能力 |
| 查询模板 `QueryTemplate` | LLM 本身具备 SQL 生成能力，模板需人工维护 |
| JOIN 提示 `JoinHint` | 有了关系信息后 LLM 可自行推断 JOIN 条件 |
| 分区键 `partitionKey` | 过于技术细节，对 Text2SQL 准确性帮助有限 |

---

## 附录：关键代码位置

| 功能 | 文件路径 |
|-----|---------|
| 类型定义 | `src/types/adapter.ts` |
| Schema 增强 | `src/utils/schema-enhancer.ts` |
| 数据库服务 | `src/core/database-service.ts` |
| MCP 服务器 | `src/mcp/mcp-server.ts` |
| MySQL 适配器 | `src/adapters/mysql.ts` |
| PostgreSQL 适配器 | `src/adapters/postgres.ts` |
| Oracle 适配器 | `src/adapters/oracle.ts` |
| 其他适配器 | `src/adapters/*.ts` |

---

*文档版本：v2.8.0*
*最后更新：2026-02-06*
