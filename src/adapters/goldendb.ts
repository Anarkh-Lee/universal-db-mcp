/**
 * GoldenDB 数据库适配器
 * 使用 mysql2 驱动实现 DbAdapter 接口
 * GoldenDB 兼容 MySQL 协议
 *
 * 性能优化：使用批量查询获取 Schema 信息，避免 N+1 查询问题
 */

import mysql from 'mysql2/promise';
import type {
  DbAdapter,
  QueryResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  IndexInfo,
  ForeignKeyInfo,
  RelationshipInfo,
} from '../types/adapter.js';
import { isWriteOperation as checkWriteOperation } from '../utils/safety.js';

export class GoldenDBAdapter implements DbAdapter {
  private connection: mysql.Connection | null = null;
  private config: {
    host: string;
    port: number;
    user?: string;
    password?: string;
    database?: string;
  };

  constructor(config: {
    host: string;
    port: number;
    user?: string;
    password?: string;
    database?: string;
  }) {
    this.config = config;
  }

  /**
   * 连接到 GoldenDB 数据库
   */
  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        multipleStatements: false,
      });

      // 测试连接
      await this.connection.ping();
    } catch (error) {
      throw new Error(
        `GoldenDB 连接失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  /**
   * 执行 SQL 查询
   */
  async executeQuery(query: string, params?: unknown[]): Promise<QueryResult> {
    if (!this.connection) {
      throw new Error('数据库未连接');
    }

    const startTime = Date.now();

    try {
      const [rows, fields] = await this.connection.execute(query, params);
      const executionTime = Date.now() - startTime;

      // 处理不同类型的查询结果
      if (Array.isArray(rows)) {
        return {
          rows: rows as Record<string, unknown>[],
          executionTime,
          metadata: {
            fieldCount: fields?.length || 0,
          },
        };
      } else {
        // INSERT/UPDATE/DELETE 等操作
        const result = rows as mysql.ResultSetHeader;
        return {
          rows: [],
          affectedRows: result.affectedRows,
          executionTime,
          metadata: {
            insertId: result.insertId,
            changedRows: result.changedRows,
          },
        };
      }
    } catch (error) {
      throw new Error(
        `查询执行失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 获取数据库结构信息（批量查询优化版本）
   */
  async getSchema(): Promise<SchemaInfo> {
    if (!this.connection) {
      throw new Error('数据库未连接');
    }

    try {
      // 获取数据库版本
      const [versionRows] = await this.connection.query('SELECT VERSION() as version');
      const version = (versionRows as any[])[0]?.version || 'unknown';

      // 获取当前数据库名
      const [dbRows] = await this.connection.query('SELECT DATABASE() as db');
      const databaseName = (dbRows as any[])[0]?.db || this.config.database || 'unknown';

      // 批量获取所有表的列信息
      const [allColumns] = await this.connection.query(`
        SELECT
          TABLE_NAME,
          COLUMN_NAME,
          COLUMN_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMN_KEY,
          COLUMN_COMMENT,
          ORDINAL_POSITION
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME, ORDINAL_POSITION
      `) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      // 批量获取所有表的索引信息
      const [allIndexes] = await this.connection.query(`
        SELECT
          TABLE_NAME,
          INDEX_NAME,
          COLUMN_NAME,
          NON_UNIQUE,
          SEQ_IN_INDEX
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
      `) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      // 批量获取所有表的行数估算和表注释
      const [allStats] = await this.connection.query(`
        SELECT
          TABLE_NAME,
          TABLE_ROWS,
          TABLE_COMMENT
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_TYPE = 'BASE TABLE'
      `) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      // 批量获取所有外键信息
      let allForeignKeys: mysql.RowDataPacket[] = [];
      try {
        const [fkRows] = await this.connection.query(`
          SELECT
            kcu.TABLE_NAME,
            kcu.CONSTRAINT_NAME,
            kcu.COLUMN_NAME,
            kcu.REFERENCED_TABLE_NAME,
            kcu.REFERENCED_COLUMN_NAME,
            kcu.ORDINAL_POSITION,
            rc.DELETE_RULE,
            rc.UPDATE_RULE
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
            ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
            AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
          WHERE kcu.TABLE_SCHEMA = DATABASE()
            AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
          ORDER BY kcu.TABLE_NAME, kcu.CONSTRAINT_NAME, kcu.ORDINAL_POSITION
        `) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
        allForeignKeys = fkRows;
      } catch (error) {
        // 外键查询失败时忽略，返回空数组
        console.error('获取外键信息失败，跳过:', error instanceof Error ? error.message : String(error));
      }

      // 在内存中组装数据
      return this.assembleSchema(databaseName, version, allColumns, allIndexes, allStats, allForeignKeys);
    } catch (error) {
      throw new Error(
        `获取数据库结构失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 组装 Schema 信息
   */
  private assembleSchema(
    databaseName: string,
    version: string,
    allColumns: mysql.RowDataPacket[],
    allIndexes: mysql.RowDataPacket[],
    allStats: mysql.RowDataPacket[],
    allForeignKeys: mysql.RowDataPacket[]
  ): SchemaInfo {
    const columnsByTable = new Map<string, ColumnInfo[]>();
    const primaryKeysByTable = new Map<string, string[]>();

    for (const col of allColumns) {
      const tableName = col.TABLE_NAME;

      if (!columnsByTable.has(tableName)) {
        columnsByTable.set(tableName, []);
        primaryKeysByTable.set(tableName, []);
      }

      columnsByTable.get(tableName)!.push({
        name: col.COLUMN_NAME,
        type: col.COLUMN_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        defaultValue: col.COLUMN_DEFAULT,
        comment: col.COLUMN_COMMENT || undefined,
      });

      if (col.COLUMN_KEY === 'PRI') {
        primaryKeysByTable.get(tableName)!.push(col.COLUMN_NAME);
      }
    }

    const indexesByTable = new Map<string, Map<string, { columns: string[]; unique: boolean }>>();

    for (const idx of allIndexes) {
      const tableName = idx.TABLE_NAME;
      const indexName = idx.INDEX_NAME;

      if (indexName === 'PRIMARY') continue;

      if (!indexesByTable.has(tableName)) {
        indexesByTable.set(tableName, new Map());
      }

      const tableIndexes = indexesByTable.get(tableName)!;

      if (!tableIndexes.has(indexName)) {
        tableIndexes.set(indexName, {
          columns: [],
          unique: idx.NON_UNIQUE === 0,
        });
      }

      tableIndexes.get(indexName)!.columns.push(idx.COLUMN_NAME);
    }

    const rowsByTable = new Map<string, number>();
    const commentsByTable = new Map<string, string>();
    for (const stat of allStats) {
      rowsByTable.set(stat.TABLE_NAME, stat.TABLE_ROWS || 0);
      if (stat.TABLE_COMMENT) {
        commentsByTable.set(stat.TABLE_NAME, stat.TABLE_COMMENT);
      }
    }

    // 按表名分组外键信息
    const foreignKeysByTable = new Map<string, Map<string, { columns: string[]; referencedTable: string; referencedColumns: string[]; onDelete?: string; onUpdate?: string }>>();
    const relationships: RelationshipInfo[] = [];

    for (const fk of allForeignKeys) {
      const tableName = fk.TABLE_NAME;
      const constraintName = fk.CONSTRAINT_NAME;

      if (!foreignKeysByTable.has(tableName)) {
        foreignKeysByTable.set(tableName, new Map());
      }

      const tableForeignKeys = foreignKeysByTable.get(tableName)!;

      if (!tableForeignKeys.has(constraintName)) {
        tableForeignKeys.set(constraintName, {
          columns: [],
          referencedTable: fk.REFERENCED_TABLE_NAME,
          referencedColumns: [],
          onDelete: fk.DELETE_RULE,
          onUpdate: fk.UPDATE_RULE,
        });
      }

      const fkInfo = tableForeignKeys.get(constraintName)!;
      fkInfo.columns.push(fk.COLUMN_NAME);
      fkInfo.referencedColumns.push(fk.REFERENCED_COLUMN_NAME);
    }

    // 生成全局关系视图
    for (const [tableName, tableForeignKeys] of foreignKeysByTable.entries()) {
      for (const [constraintName, fkInfo] of tableForeignKeys.entries()) {
        relationships.push({
          fromTable: tableName,
          fromColumns: fkInfo.columns,
          toTable: fkInfo.referencedTable,
          toColumns: fkInfo.referencedColumns,
          type: 'many-to-one',
          constraintName,
        });
      }
    }

    const tableInfos: TableInfo[] = [];

    for (const [tableName, columns] of columnsByTable.entries()) {
      const tableIndexes = indexesByTable.get(tableName);
      const indexInfos: IndexInfo[] = [];

      if (tableIndexes) {
        for (const [indexName, indexData] of tableIndexes.entries()) {
          indexInfos.push({
            name: indexName,
            columns: indexData.columns,
            unique: indexData.unique,
          });
        }
      }

      // 组装外键信息
      const tableForeignKeys = foreignKeysByTable.get(tableName);
      const foreignKeyInfos: ForeignKeyInfo[] = [];

      if (tableForeignKeys) {
        for (const [constraintName, fkData] of tableForeignKeys.entries()) {
          foreignKeyInfos.push({
            name: constraintName,
            columns: fkData.columns,
            referencedTable: fkData.referencedTable,
            referencedColumns: fkData.referencedColumns,
            onDelete: fkData.onDelete,
            onUpdate: fkData.onUpdate,
          });
        }
      }

      tableInfos.push({
        name: tableName,
        comment: commentsByTable.get(tableName) || undefined,
        columns,
        primaryKeys: primaryKeysByTable.get(tableName) || [],
        indexes: indexInfos,
        foreignKeys: foreignKeyInfos.length > 0 ? foreignKeyInfos : undefined,
        estimatedRows: rowsByTable.get(tableName) || 0,
      });
    }

    tableInfos.sort((a, b) => a.name.localeCompare(b.name));

    return {
      databaseType: 'goldendb',
      databaseName,
      tables: tableInfos,
      version,
      relationships: relationships.length > 0 ? relationships : undefined,
    };
  }

  /**
   * 检查是否为写操作
   */
  isWriteOperation(query: string): boolean {
    return checkWriteOperation(query);
  }
}
