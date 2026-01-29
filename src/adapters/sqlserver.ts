/**
 * SQL Server 数据库适配器
 * 使用 mssql 驱动实现 DbAdapter 接口
 * 支持 SQL Server 2012+ 和 Azure SQL Database
 *
 * 性能优化：使用批量查询获取 Schema 信息，避免 N+1 查询问题
 */

import sql from 'mssql';
import type {
  DbAdapter,
  QueryResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  IndexInfo,
} from '../types/adapter.js';
import { isWriteOperation as checkWriteOperation } from '../utils/safety.js';

export class SQLServerAdapter implements DbAdapter {
  private pool: sql.ConnectionPool | null = null;
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
   * 连接到 SQL Server 数据库
   */
  async connect(): Promise<void> {
    try {
      // 检测是否为 Azure SQL Database
      const isAzure = this.config.host.includes('.database.windows.net');

      const poolConfig: sql.config = {
        server: this.config.host,
        port: this.config.port || 1433,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        options: {
          encrypt: isAzure,  // Azure SQL 需要加密
          trustServerCertificate: !isAzure,  // 仅本地开发信任证书
          enableArithAbort: true,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000,
        },
      };

      this.pool = await sql.connect(poolConfig);

      // 测试连接
      await this.pool.request().query('SELECT 1');
    } catch (error: any) {
      // 翻译常见错误
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (error.number === 18456) {
        throw new Error('SQL Server 连接失败: 身份验证失败，请检查用户名和密码');
      } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ETIMEDOUT')) {
        throw new Error('SQL Server 连接失败: 无法连接到数据库服务器，请检查主机地址和端口');
      } else if (errorMessage.includes('database') && errorMessage.includes('does not exist')) {
        throw new Error('SQL Server 连接失败: 数据库不存在');
      }

      throw new Error(`SQL Server 连接失败: ${errorMessage}`);
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close();  // 正确关闭连接池，排空所有连接
      } catch (error) {
        console.error('关闭连接池时出错:', error);
      }
      this.pool = null;
    }
  }

  /**
   * 执行 SQL 查询
   */
  async executeQuery(query: string, params?: unknown[]): Promise<QueryResult> {
    if (!this.pool) {
      throw new Error('数据库未连接');
    }

    const startTime = Date.now();

    try {
      const request = this.pool.request();

      // 处理参数 - SQL Server 使用 @param0, @param1 语法
      if (params && params.length > 0) {
        params.forEach((param, index) => {
          request.input(`param${index}`, param);
        });

        // 替换 ? 占位符为 @param0, @param1, ...
        let paramIndex = 0;
        query = query.replace(/\?/g, () => `@param${paramIndex++}`);
      }

      const result = await request.query(query);
      const executionTime = Date.now() - startTime;

      // 处理 SELECT 查询
      if (result.recordset && result.recordset.length > 0) {
        return {
          rows: result.recordset,
          executionTime,
          metadata: {
            columnCount: Object.keys(result.recordset[0]).length,
          },
        };
      }

      // 处理 DML 操作 (INSERT/UPDATE/DELETE)
      if (result.rowsAffected && result.rowsAffected.length > 0) {
        const affectedRows = result.rowsAffected.reduce((sum, count) => sum + count, 0);
        return {
          rows: [],
          affectedRows,
          executionTime,
        };
      }

      // 其他操作或空结果
      return {
        rows: [],
        executionTime,
      };
    } catch (error: any) {
      // 翻译常见 SQL Server 错误
      if (error.number === 208) {
        throw new Error('查询执行失败: 表或视图不存在');
      } else if (error.number === 2627 || error.number === 2601) {
        throw new Error('查询执行失败: 违反唯一约束');
      } else if (error.number === 547) {
        throw new Error('查询执行失败: 违反外键约束');
      } else if (error.number === 18456) {
        throw new Error('查询执行失败: 身份验证失败');
      }

      throw new Error(`查询执行失败: ${error.message || String(error)}`);
    }
  }

  /**
   * 获取数据库结构信息（批量查询优化版本）
   */
  async getSchema(): Promise<SchemaInfo> {
    if (!this.pool) {
      throw new Error('数据库未连接');
    }

    try {
      // 获取 SQL Server 版本
      const versionResult = await this.pool.request().query('SELECT @@VERSION AS version');
      const version = versionResult.recordset?.[0]?.version || 'unknown';

      // 获取数据库名
      const dbNameResult = await this.pool.request().query('SELECT DB_NAME() AS database_name');
      const databaseName = dbNameResult.recordset?.[0]?.database_name || 'unknown';

      // 批量获取所有表的列信息
      const allColumnsResult = await this.pool.request().query(`
        SELECT
          c.TABLE_NAME,
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.CHARACTER_MAXIMUM_LENGTH,
          c.NUMERIC_PRECISION,
          c.NUMERIC_SCALE,
          c.IS_NULLABLE,
          c.COLUMN_DEFAULT,
          c.ORDINAL_POSITION
        FROM INFORMATION_SCHEMA.COLUMNS c
        JOIN INFORMATION_SCHEMA.TABLES t
          ON c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME
        WHERE t.TABLE_TYPE = 'BASE TABLE'
          AND t.TABLE_SCHEMA NOT IN ('sys', 'INFORMATION_SCHEMA')
          AND t.TABLE_SCHEMA = SCHEMA_NAME()
        ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION
      `);

      // 批量获取所有表的主键信息
      const allPrimaryKeysResult = await this.pool.request().query(`
        SELECT
          tc.TABLE_NAME,
          c.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE c
          ON tc.CONSTRAINT_NAME = c.CONSTRAINT_NAME
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
          AND tc.TABLE_SCHEMA = SCHEMA_NAME()
        ORDER BY tc.TABLE_NAME
      `);

      // 批量获取所有表的索引信息
      const allIndexesResult = await this.pool.request().query(`
        SELECT
          t.name AS table_name,
          i.name AS index_name,
          c.name AS column_name,
          i.is_unique
        FROM sys.indexes i
        INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        INNER JOIN sys.tables t ON i.object_id = t.object_id
        WHERE i.is_primary_key = 0
          AND i.type > 0
          AND t.schema_id = SCHEMA_ID()
        ORDER BY t.name, i.name, ic.key_ordinal
      `);

      // 批量获取所有表的行数估算
      const allStatsResult = await this.pool.request().query(`
        SELECT
          t.name AS table_name,
          SUM(p.rows) AS row_count
        FROM sys.partitions p
        JOIN sys.tables t ON p.object_id = t.object_id
        WHERE t.schema_id = SCHEMA_ID()
          AND p.index_id IN (0, 1)
        GROUP BY t.name
      `);

      return this.assembleSchema(
        databaseName,
        version,
        allColumnsResult.recordset || [],
        allPrimaryKeysResult.recordset || [],
        allIndexesResult.recordset || [],
        allStatsResult.recordset || []
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
      const tableName = col.TABLE_NAME;

      if (!columnsByTable.has(tableName)) {
        columnsByTable.set(tableName, []);
      }

      columnsByTable.get(tableName)!.push({
        name: col.COLUMN_NAME.toLowerCase(),
        type: this.formatSQLServerType(
          col.DATA_TYPE,
          col.CHARACTER_MAXIMUM_LENGTH,
          col.NUMERIC_PRECISION,
          col.NUMERIC_SCALE
        ),
        nullable: col.IS_NULLABLE === 'YES',
        defaultValue: col.COLUMN_DEFAULT?.trim() || undefined,
      });
    }

    const primaryKeysByTable = new Map<string, string[]>();
    for (const pk of allPrimaryKeys) {
      const tableName = pk.TABLE_NAME;
      if (!primaryKeysByTable.has(tableName)) {
        primaryKeysByTable.set(tableName, []);
      }
      primaryKeysByTable.get(tableName)!.push(pk.COLUMN_NAME.toLowerCase());
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

      tableIndexes.get(indexName)!.columns.push(idx.column_name.toLowerCase());
    }

    const rowsByTable = new Map<string, number>();
    for (const stat of allStats) {
      rowsByTable.set(stat.table_name, stat.row_count || 0);
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
        name: tableName.toLowerCase(),
        columns,
        primaryKeys: primaryKeysByTable.get(tableName) || [],
        indexes: indexInfos,
        estimatedRows: rowsByTable.get(tableName) || 0,
      });
    }

    tableInfos.sort((a, b) => a.name.localeCompare(b.name));

    return {
      databaseType: 'sqlserver',
      databaseName,
      tables: tableInfos,
      version,
    };
  }

  /**
   * 格式化 SQL Server 数据类型
   */
  private formatSQLServerType(
    dataType: string,
    length?: number,
    precision?: number,
    scale?: number
  ): string {
    switch (dataType.toUpperCase()) {
      case 'NVARCHAR':
      case 'VARCHAR':
      case 'NCHAR':
      case 'CHAR':
        if (length === -1) return `${dataType}(MAX)`;
        if (length) return `${dataType}(${length})`;
        return dataType;

      case 'DECIMAL':
      case 'NUMERIC':
        if (precision && scale !== undefined && scale !== null) {
          return `${dataType}(${precision},${scale})`;
        }
        if (precision) return `${dataType}(${precision})`;
        return dataType;

      case 'DATETIME2':
      case 'DATETIMEOFFSET':
      case 'TIME':
        if (scale !== undefined && scale !== null) {
          return `${dataType}(${scale})`;
        }
        return dataType;

      case 'VARBINARY':
      case 'BINARY':
        if (length === -1) return `${dataType}(MAX)`;
        if (length) return `${dataType}(${length})`;
        return dataType;

      default:
        return dataType;
    }
  }

  /**
   * 检查是否为写操作
   */
  isWriteOperation(query: string): boolean {
    // 首先使用通用的写操作检测
    if (checkWriteOperation(query)) {
      return true;
    }

    // SQL Server 特定的写操作检测
    const trimmedQuery = query.trim().toUpperCase();

    // MERGE 语句（SQL Server 的 upsert 操作）
    if (trimmedQuery.startsWith('MERGE')) {
      return true;
    }

    // 存储过程执行
    if (trimmedQuery.startsWith('EXEC') || trimmedQuery.startsWith('EXECUTE')) {
      return true;
    }

    // 事务控制语句
    if (trimmedQuery.startsWith('BEGIN TRANSACTION') ||
        trimmedQuery.startsWith('BEGIN TRAN') ||
        trimmedQuery.startsWith('COMMIT') ||
        trimmedQuery.startsWith('ROLLBACK')) {
      return true;
    }

    return false;
  }
}
