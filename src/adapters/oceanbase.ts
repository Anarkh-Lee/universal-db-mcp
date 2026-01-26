/**
 * OceanBase 数据库适配器
 * 使用 mysql2 驱动实现 DbAdapter 接口
 * OceanBase 兼容 MySQL 协议
 */

import mysql from 'mysql2/promise';
import type {
  DbAdapter,
  QueryResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  IndexInfo,
} from '../types/adapter.js';
import { isWriteOperation as checkWriteOperation } from '../utils/safety.js';

export class OceanBaseAdapter implements DbAdapter {
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
   * 连接到 OceanBase 数据库
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
        `OceanBase 连接失败: ${error instanceof Error ? error.message : String(error)}`
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
   * 获取数据库结构信息
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

      // 获取所有表
      const [tables] = await this.connection.query(
        'SHOW TABLES'
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      const tableInfos: TableInfo[] = [];

      for (const tableRow of tables) {
        const tableName = Object.values(tableRow)[0] as string;
        const tableInfo = await this.getTableInfo(tableName);
        tableInfos.push(tableInfo);
      }

      return {
        databaseType: 'oceanbase',
        databaseName,
        tables: tableInfos,
        version,
      };
    } catch (error) {
      throw new Error(
        `获取数据库结构失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 获取单个表的详细信息
   */
  private async getTableInfo(tableName: string): Promise<TableInfo> {
    if (!this.connection) {
      throw new Error('数据库未连接');
    }

    // 获取列信息
    const [columns] = await this.connection.query(
      'SHOW FULL COLUMNS FROM ??',
      [tableName]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    const columnInfos: ColumnInfo[] = columns.map((col) => ({
      name: col.Field,
      type: col.Type,
      nullable: col.Null === 'YES',
      defaultValue: col.Default,
      comment: col.Comment || undefined,
    }));

    // 获取主键
    const primaryKeys = columns
      .filter((col) => col.Key === 'PRI')
      .map((col) => col.Field);

    // 获取索引信息
    const [indexes] = await this.connection.query(
      'SHOW INDEX FROM ??',
      [tableName]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    const indexMap = new Map<string, { columns: string[]; unique: boolean }>();

    for (const idx of indexes) {
      const indexName = idx.Key_name;
      if (indexName === 'PRIMARY') continue; // 跳过主键索引

      if (!indexMap.has(indexName)) {
        indexMap.set(indexName, {
          columns: [],
          unique: idx.Non_unique === 0,
        });
      }

      indexMap.get(indexName)!.columns.push(idx.Column_name);
    }

    const indexInfos: IndexInfo[] = Array.from(indexMap.entries()).map(
      ([name, info]) => ({
        name,
        columns: info.columns,
        unique: info.unique,
      })
    );

    // 获取表行数估算
    const [statusRows] = await this.connection.query(
      'SHOW TABLE STATUS WHERE Name = ?',
      [tableName]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    const estimatedRows = statusRows[0]?.Rows || 0;

    return {
      name: tableName,
      columns: columnInfos,
      primaryKeys,
      indexes: indexInfos,
      estimatedRows,
    };
  }

  /**
   * 检查是否为写操作
   */
  isWriteOperation(query: string): boolean {
    return checkWriteOperation(query);
  }
}
