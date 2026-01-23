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
   * @param query - SQL 查询语句或 Redis 命令
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
  databaseType: 'mysql' | 'postgres' | 'redis';
  /** 数据库名称 */
  databaseName: string;
  /** 表信息列表 */
  tables: TableInfo[];
  /** 数据库版本 */
  version?: string;
}

/**
 * 表结构信息
 */
export interface TableInfo {
  /** 表名 */
  name: string;
  /** 列信息 */
  columns: ColumnInfo[];
  /** 主键列名 */
  primaryKeys: string[];
  /** 索引信息 */
  indexes?: IndexInfo[];
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
 * 数据库连接配置
 */
export interface DbConfig {
  type: 'mysql' | 'postgres' | 'redis';
  host: string;
  port: number;
  user?: string;
  password?: string;
  database?: string;
  /** 是否允许写操作（默认 false，只读模式） */
  allowWrite?: boolean;
}
