/**
 * HighGo 数据库适配器
 * 使用 pg 驱动实现 DbAdapter 接口
 * HighGo（瀚高）基于 PostgreSQL 开发，兼容 PostgreSQL 协议
 *
 * 性能优化：使用批量查询获取 Schema 信息，避免 N+1 查询问题
 */

import pg from 'pg';
import type {
  DbAdapter,
  QueryResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  IndexInfo,
} from '../types/adapter.js';
import { isWriteOperation as checkWriteOperation } from '../utils/safety.js';

const { Client } = pg;

export class HighGoAdapter implements DbAdapter {
  private client: pg.Client | null = null;
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
   * 连接到 HighGo 数据库
   */
  async connect(): Promise<void> {
    try {
      this.client = new Client({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
      });

      await this.client.connect();

      // 测试连接
      await this.client.query('SELECT 1');
    } catch (error) {
      throw new Error(
        `HighGo 连接失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }

  /**
   * 执行 SQL 查询
   */
  async executeQuery(query: string, params?: unknown[]): Promise<QueryResult> {
    if (!this.client) {
      throw new Error('数据库未连接');
    }

    const startTime = Date.now();

    try {
      const result = await this.client.query(query, params);
      const executionTime = Date.now() - startTime;

      return {
        rows: result.rows,
        affectedRows: result.rowCount || 0,
        executionTime,
        metadata: {
          command: result.command,
          fields: result.fields?.map(f => ({
            name: f.name,
            dataTypeID: f.dataTypeID,
          })),
        },
      };
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
    if (!this.client) {
      throw new Error('数据库未连接');
    }

    try {
      // 获取数据库版本
      const versionResult = await this.client.query('SELECT version() as version');
      const version = versionResult.rows[0]?.version || 'unknown';

      // 获取当前数据库名
      const databaseName = this.config.database || 'highgo';

      // 批量获取所有表的列信息
      const allColumnsResult = await this.client.query(`
        SELECT
          c.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          c.character_maximum_length,
          c.numeric_precision,
          c.numeric_scale,
          c.ordinal_position
        FROM information_schema.columns c
        JOIN information_schema.tables t
          ON c.table_schema = t.table_schema AND c.table_name = t.table_name
        WHERE c.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
        ORDER BY c.table_name, c.ordinal_position
      `);

      // 批量获取所有表的主键信息
      const allPrimaryKeysResult = await this.client.query(`
        SELECT
          t.relname as table_name,
          a.attname as column_name
        FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE i.indisprimary
          AND n.nspname = 'public'
        ORDER BY t.relname, a.attnum
      `);

      // 批量获取所有表的索引信息
      const allIndexesResult = await this.client.query(`
        SELECT
          t.relname as table_name,
          i.relname as index_name,
          a.attname as column_name,
          ix.indisunique as is_unique
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE t.relkind = 'r'
          AND n.nspname = 'public'
          AND NOT ix.indisprimary
        ORDER BY t.relname, i.relname, a.attnum
      `);

      // 批量获取所有表的行数估算
      const allStatsResult = await this.client.query(`
        SELECT
          c.relname as table_name,
          c.reltuples::bigint as estimated_rows
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'r'
          AND n.nspname = 'public'
      `);

      return this.assembleSchema(
        databaseName,
        version,
        allColumnsResult.rows,
        allPrimaryKeysResult.rows,
        allIndexesResult.rows,
        allStatsResult.rows
      );
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
    allColumns: any[],
    allPrimaryKeys: any[],
    allIndexes: any[],
    allStats: any[]
  ): SchemaInfo {
    const columnsByTable = new Map<string, ColumnInfo[]>();

    for (const col of allColumns) {
      const tableName = col.table_name;

      if (!columnsByTable.has(tableName)) {
        columnsByTable.set(tableName, []);
      }

      let dataType = col.data_type;
      if (col.character_maximum_length) {
        dataType += `(${col.character_maximum_length})`;
      } else if (col.numeric_precision) {
        dataType += `(${col.numeric_precision}${col.numeric_scale ? `,${col.numeric_scale}` : ''})`;
      }

      columnsByTable.get(tableName)!.push({
        name: col.column_name,
        type: dataType,
        nullable: col.is_nullable === 'YES',
        defaultValue: col.column_default || undefined,
      });
    }

    const primaryKeysByTable = new Map<string, string[]>();
    for (const pk of allPrimaryKeys) {
      const tableName = pk.table_name;
      if (!primaryKeysByTable.has(tableName)) {
        primaryKeysByTable.set(tableName, []);
      }
      primaryKeysByTable.get(tableName)!.push(pk.column_name);
    }

    const indexesByTable = new Map<string, Map<string, { columns: string[]; unique: boolean }>>();

    for (const idx of allIndexes) {
      const tableName = idx.table_name;
      const indexName = idx.index_name;

      if (!indexesByTable.has(tableName)) {
        indexesByTable.set(tableName, new Map());
      }

      const tableIndexes = indexesByTable.get(tableName)!;

      if (!tableIndexes.has(indexName)) {
        tableIndexes.set(indexName, {
          columns: [],
          unique: idx.is_unique,
        });
      }

      tableIndexes.get(indexName)!.columns.push(idx.column_name);
    }

    const rowsByTable = new Map<string, number>();
    for (const stat of allStats) {
      rowsByTable.set(stat.table_name, Number(stat.estimated_rows) || 0);
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

      tableInfos.push({
        name: tableName,
        columns,
        primaryKeys: primaryKeysByTable.get(tableName) || [],
        indexes: indexInfos,
        estimatedRows: rowsByTable.get(tableName) || 0,
      });
    }

    tableInfos.sort((a, b) => a.name.localeCompare(b.name));

    return {
      databaseType: 'highgo',
      databaseName,
      tables: tableInfos,
      version,
    };
  }

  /**
   * 检查是否为写操作
   */
  isWriteOperation(query: string): boolean {
    return checkWriteOperation(query);
  }
}
