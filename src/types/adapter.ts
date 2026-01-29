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
   * @param tableNames - 可选，指定要获取的表名列表。如果不传，则获取所有表。
   * @returns 数据库的表结构、索引等元数据
   */
  getSchema(tableNames?: string[]): Promise<SchemaInfo>;

  /**
   * 检查查询是否为写操作
   * @param query - 待检查的查询语句
   * @returns 如果是写操作返回 true
   */
  isWriteOperation(query: string): boolean;

  // ========== 可选的扩展方法 ==========

  /**
   * 批量执行多条查询（可选）
   * @param queries - 查询语句数组
   * @returns 批量执行结果
   */
  batchExecute?(queries: string[]): Promise<BatchResult>;

  /**
   * 开始事务（可选）
   */
  beginTransaction?(): Promise<void>;

  /**
   * 提交事务（可选）
   */
  commit?(): Promise<void>;

  /**
   * 回滚事务（可选）
   */
  rollback?(): Promise<void>;

  /**
   * 执行查询返回单条记录（可选）
   * @param query - SQL 查询语句
   * @param params - 查询参数
   * @returns 单条记录或 null
   */
  querySingle?(query: string, params?: unknown[]): Promise<Record<string, unknown> | null>;

  /**
   * 获取标量值（可选）
   * @param query - SQL 查询语句
   * @param params - 查询参数
   * @returns 标量值
   */
  getScalar?(query: string, params?: unknown[]): Promise<unknown>;
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
 * 批量执行结果接口
 */
export interface BatchResult {
  /** 各查询的执行结果 */
  results: QueryResult[];
  /** 总受影响行数 */
  totalAffectedRows: number;
  /** 执行出错的查询 */
  errors: Array<{
    /** 查询索引 */
    index: number;
    /** 错误信息 */
    error: string;
    /** 原始查询 */
    query: string;
  }>;
  /** 总执行时间（毫秒） */
  totalExecutionTime: number;
}

/**
 * 数据库结构信息
 */
export interface SchemaInfo {
  /** 数据库类型 */
  databaseType: 'mysql' | 'postgres' | 'redis' | 'oracle' | 'dm' | 'sqlserver' | 'mongodb' | 'sqlite' | 'kingbase' | 'gaussdb' | 'oceanbase' | 'tidb' | 'clickhouse' | 'polardb' | 'goldendb' | 'highgo' | 'vastbase';
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

import type { SSHConfig } from './ssh.js';

/**
 * 数据库连接配置
 */
export interface DbConfig {
  type: 'mysql' | 'postgres' | 'redis' | 'oracle' | 'dm' | 'sqlserver' | 'mongodb' | 'sqlite' | 'kingbase' | 'gaussdb' | 'oceanbase' | 'tidb' | 'clickhouse' | 'polardb' | 'goldendb' | 'highgo' | 'vastbase';
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  /** SQLite 数据库文件路径 */
  filePath?: string;
  /** 是否允许写操作（默认 false，只读模式） */
  allowWrite?: boolean;
  /** SSH 隧道配置 */
  ssh?: SSHConfig;
}
