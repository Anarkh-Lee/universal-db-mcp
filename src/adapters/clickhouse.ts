/**
 * ClickHouse 数据库适配器
 * 使用 @clickhouse/client 驱动实现 DbAdapter 接口
 * ClickHouse 是高性能列式 OLAP 数据库
 */

import { createClient, ClickHouseClient } from '@clickhouse/client';
import type {
  DbAdapter,
  QueryResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  IndexInfo,
} from '../types/adapter.js';
import { isWriteOperation as checkWriteOperation } from '../utils/safety.js';

export class ClickHouseAdapter implements DbAdapter {
  private client: ClickHouseClient | null = null;
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
   * 连接到 ClickHouse 数据库
   */
  async connect(): Promise<void> {
    try {
      this.client = createClient({
        host: `http://${this.config.host}:${this.config.port}`,
        username: this.config.user || 'default',
        password: this.config.password,
        database: this.config.database || 'default',
      });

      // 测试连接
      await this.client.ping();
    } catch (error) {
      throw new Error(
        `ClickHouse 连接失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
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
      // ClickHouse 使用命名参数或位置参数
      const result = await this.client.query({
        query,
        query_params: params ? this.convertParams(params) : undefined,
        format: 'JSONEachRow',
      });

      const data = await result.json();
      const rows = Array.isArray(data) ? data as Record<string, unknown>[] : [];
      const executionTime = Date.now() - startTime;

      // 检查是否为写操作
      const isWrite = this.isWriteOperation(query);

      return {
        rows: rows || [],
        affectedRows: isWrite ? rows?.length || 0 : undefined,
        executionTime,
        metadata: {
          query_id: result.query_id,
        },
      };
    } catch (error) {
      throw new Error(
        `查询执行失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 转换参数为 ClickHouse 格式
   */
  private convertParams(params: unknown[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    params.forEach((param, index) => {
      result[`param${index + 1}`] = param;
    });
    return result;
  }

  /**
   * 获取数据库结构信息
   */
  async getSchema(): Promise<SchemaInfo> {
    if (!this.client) {
      throw new Error('数据库未连接');
    }

    try {
      // 获取数据库版本
      const versionResult = await this.client.query({
        query: 'SELECT version() as version',
        format: 'JSONEachRow',
      });
      const versionData = await versionResult.json() as Array<{ version: string }>;
      const version = (Array.isArray(versionData) && versionData.length > 0) ? versionData[0]?.version : 'unknown';

      // 获取当前数据库名
      const databaseName = this.config.database || 'default';

      // 获取所有表
      const tablesResult = await this.client.query({
        query: `
          SELECT name
          FROM system.tables
          WHERE database = {database:String}
            AND engine NOT IN ('View', 'MaterializedView')
          ORDER BY name
        `,
        query_params: {
          database: databaseName,
        },
        format: 'JSONEachRow',
      });

      const tablesData = await tablesResult.json() as Array<{ name: string }>;
      const tables = Array.isArray(tablesData) ? tablesData : [];
      const tableInfos: TableInfo[] = [];

      for (const table of tables) {
        const tableInfo = await this.getTableInfo(table?.name);
        tableInfos.push(tableInfo);
      }

      return {
        databaseType: 'clickhouse',
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
    if (!this.client) {
      throw new Error('数据库未连接');
    }

    const databaseName = this.config.database || 'default';

    // 获取列信息
    const columnsResult = await this.client.query({
      query: `
        SELECT
          name,
          type,
          default_kind,
          default_expression,
          comment
        FROM system.columns
        WHERE database = {database:String}
          AND table = {table:String}
        ORDER BY position
      `,
      query_params: {
        database: databaseName,
        table: tableName,
      },
      format: 'JSONEachRow',
    });

    const columnsData = await columnsResult.json() as Array<{
      name: string;
      type: string;
      default_kind: string;
      default_expression: string;
      comment: string;
    }>;
    const columns = Array.isArray(columnsData) ? columnsData : [];

    const columnInfos: ColumnInfo[] = columns.map((col) => ({
      name: col?.name,
      type: col?.type,
      nullable: col?.type?.includes('Nullable') || false,
      defaultValue: col?.default_expression || undefined,
      comment: col?.comment || undefined,
    }));

    // 获取主键信息
    const primaryKeyResult = await this.client.query({
      query: `
        SELECT primary_key
        FROM system.tables
        WHERE database = {database:String}
          AND name = {table:String}
      `,
      query_params: {
        database: databaseName,
        table: tableName,
      },
      format: 'JSONEachRow',
    });

    const pkData = await primaryKeyResult.json() as Array<{ primary_key: string }>;
    const primaryKeyStr = (Array.isArray(pkData) && pkData.length > 0) ? pkData[0]?.primary_key : '';
    const primaryKeys = primaryKeyStr
      ? primaryKeyStr.split(',').map((k: string) => k.trim())
      : [];

    // 获取索引信息（ClickHouse 的索引称为 data skipping indexes）
    const indexesResult = await this.client.query({
      query: `
        SELECT
          name,
          expr,
          type
        FROM system.data_skipping_indices
        WHERE database = {database:String}
          AND table = {table:String}
      `,
      query_params: {
        database: databaseName,
        table: tableName,
      },
      format: 'JSONEachRow',
    });

    const indexesData = await indexesResult.json() as Array<{
      name: string;
      expr: string;
      type: string;
    }>;
    const indexes = Array.isArray(indexesData) ? indexesData : [];

    const indexInfos: IndexInfo[] = indexes.map((idx) => ({
      name: idx?.name,
      columns: [idx?.expr], // ClickHouse 索引表达式
      unique: false, // ClickHouse 索引不保证唯一性
    }));

    // 获取表行数估算和表注释
    const countResult = await this.client.query({
      query: `
        SELECT total_rows, comment
        FROM system.tables
        WHERE database = {database:String}
          AND name = {table:String}
      `,
      query_params: {
        database: databaseName,
        table: tableName,
      },
      format: 'JSONEachRow',
    });

    const countData = await countResult.json() as Array<{ total_rows: string; comment: string }>;
    const estimatedRows = (Array.isArray(countData) && countData.length > 0)
      ? parseInt(countData[0]?.total_rows || '0', 10)
      : 0;
    const tableComment = (Array.isArray(countData) && countData.length > 0)
      ? countData[0]?.comment || undefined
      : undefined;

    return {
      name: tableName,
      comment: tableComment,
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
