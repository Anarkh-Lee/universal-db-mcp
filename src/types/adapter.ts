/**
 * 数据库适配器接口
 * 所有数据库实现都必须遵循此接口，确保统一的调用方式
 */

export interface DbAdapter {
  /**
   * 连接到数据库
   * @throws 连接失败时抛出错误
   */
  connect(): Promise<void>;

  /**
   * 断开数据库连接
   */
  disconnect(): Promise<void>;

  /**
   * 执行查询语句
   * @param query - SQL 查询语句、Redis 命令或 MongoDB 查询
   * @param params - 查询参数（用于防止 SQL 注入）
   * @returns 查询结果
   */
  executeQuery(query: string, params?: unknown[]): Promise<QueryResult>;

  /**
   * 获取数据库结构信息
   * @returns 数据库的表结构、索引等元数据
   */
  getSchema(): Promise<SchemaInfo>;

  /**
   * 检查查询是否为写操作
   * @param query - 待检查的查询语句
   * @returns 如果是写操作返回 true
   */
  isWriteOperation(query: string): boolean;
}

/**
 * 查询结果接口
 */
export interface QueryResult {
  /** 查询返回的行数据 */
  rows: Record<string, unknown>[];
  /** 受影响的行数（用于 INSERT/UPDATE/DELETE） */
  affectedRows?: number;
  /** 执行时间（毫秒） */
  executionTime?: number;
  /** 额外的元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 数据库结构信息
 */
export interface SchemaInfo {
  /** 数据库类型 */
  databaseType: 'mysql' | 'postgres' | 'redis' | 'oracle' | 'dm' | 'sqlserver' | 'mongodb' | 'sqlite' | 'kingbase' | 'gaussdb' | 'oceanbase' | 'tidb' | 'clickhouse' | 'polardb' | 'vastbase' | 'highgo' | 'goldendb';
  /** 数据库名称 */
  databaseName: string;
  /** 表信息列表 */
  tables: TableInfo[];
  /** 数据库版本 */
  version?: string;
  /** 表间关系（全局视图，方便 LLM 理解表关联） */
  relationships?: RelationshipInfo[];
}

/**
 * 表结构信息
 */
export interface TableInfo {
  /** 表名 */
  name: string;
  /** 表注释/描述 */
  comment?: string;
  /** 列信息 */
  columns: ColumnInfo[];
  /** 主键列名 */
  primaryKeys: string[];
  /** 索引信息 */
  indexes?: IndexInfo[];
  /** 外键信息 */
  foreignKeys?: ForeignKeyInfo[];
  /** 预估行数 */
  estimatedRows?: number;
}

/**
 * 列信息
 */
export interface ColumnInfo {
  /** 列名 */
  name: string;
  /** 数据类型 */
  type: string;
  /** 是否可为空 */
  nullable: boolean;
  /** 默认值 */
  defaultValue?: string;
  /** 注释说明 */
  comment?: string;
}

/**
 * 索引信息
 */
export interface IndexInfo {
  /** 索引名称 */
  name: string;
  /** 索引列 */
  columns: string[];
  /** 是否唯一索引 */
  unique: boolean;
}

/**
 * 外键信息
 */
export interface ForeignKeyInfo {
  /** 外键约束名称 */
  name: string;
  /** 本表的外键列 */
  columns: string[];
  /** 引用的表名 */
  referencedTable: string;
  /** 引用的列名 */
  referencedColumns: string[];
  /** 删除时的动作 (CASCADE, SET NULL, NO ACTION, RESTRICT) */
  onDelete?: string;
  /** 更新时的动作 (CASCADE, SET NULL, NO ACTION, RESTRICT) */
  onUpdate?: string;
}

/**
 * 表间关系信息（全局视图）
 */
export interface RelationshipInfo {
  /** 源表名 */
  fromTable: string;
  /** 源表的外键列 */
  fromColumns: string[];
  /** 目标表名 */
  toTable: string;
  /** 目标表的被引用列 */
  toColumns: string[];
  /** 关系类型 */
  type: 'one-to-one' | 'one-to-many' | 'many-to-one';
  /** 外键约束名称 */
  constraintName?: string;
  /** 关系来源：foreign_key=显式外键约束, inferred=基于命名规则推断 */
  source?: 'foreign_key' | 'inferred';
  /** 推断置信度 (0-1)，仅当 source='inferred' 时有效 */
  confidence?: number;
}

/**
 * 数据库连接配置
 */
export interface DbConfig {
  type: 'mysql' | 'postgres' | 'redis' | 'oracle' | 'dm' | 'sqlserver' | 'mongodb' | 'sqlite' | 'kingbase' | 'gaussdb' | 'oceanbase' | 'tidb' | 'clickhouse' | 'polardb' | 'vastbase' | 'highgo' | 'goldendb';
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  /** SQLite 数据库文件路径 */
  filePath?: string;
  /** 是否允许写操作（默认 false，只读模式） */
  allowWrite?: boolean;
  /** Oracle Instant Client 路径（启用 Thick 模式以支持 11g） */
  oracleClientPath?: string;
}
