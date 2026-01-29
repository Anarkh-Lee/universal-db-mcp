/**
 * Oracle 数据库适配器
 * 使用 oracledb 驱动实现 DbAdapter 接口
 *
 * 性能优化：使用批量查询获取 Schema 信息，避免 N+1 查询问题
 */

import oracledb from 'oracledb';
import type {
  DbAdapter,
  QueryResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  IndexInfo,
} from '../types/adapter.js';
import { isWriteOperation as checkWriteOperation } from '../utils/safety.js';

export class OracleAdapter implements DbAdapter {
  private connection: oracledb.Connection | null = null;
  private config: {
    host: string;
    port: number;
    user?: string;
    password?: string;
    database?: string;
    serviceName?: string;
    sid?: string;
    connectString?: string;
  };

  constructor(config: {
    host: string;
    port: number;
    user?: string;
    password?: string;
    database?: string;
    serviceName?: string;
    sid?: string;
    connectString?: string;
  }) {
    this.config = config;
    // 配置 oracledb 全局设置
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.fetchAsString = [oracledb.CLOB];
  }

  /**
   * 构建 Oracle 连接字符串
   */
  private buildConnectionString(): string {
    // 优先级: connectString > serviceName > sid > database
    if (this.config.connectString) {
      return this.config.connectString;
    }

    const host = this.config.host;
    const port = this.config.port || 1521;
    const service = this.config.serviceName || this.config.sid || this.config.database;

    if (!service) {
      throw new Error('必须提供 database、serviceName 或 sid');
    }

    // 构建 Easy Connect 字符串
    return `${host}:${port}/${service}`;
  }

  /**
   * 连接到 Oracle 数据库
   */
  async connect(): Promise<void> {
    try {
      const connectionString = this.buildConnectionString();

      this.connection = await oracledb.getConnection({
        user: this.config.user,
        password: this.config.password,
        connectString: connectionString,
      });

      // 测试连接
      await this.connection.execute('SELECT 1 FROM DUAL');
    } catch (error: any) {
      // 翻译常见的 Oracle 错误
      if (error.errorNum === 1017) {
        throw new Error('Oracle 连接失败: 用户名或密码无效');
      } else if (error.errorNum === 12154) {
        throw new Error('Oracle 连接失败: 无法解析连接标识符，请检查 TNS 配置');
      } else if (error.errorNum === 12541) {
        throw new Error('Oracle 连接失败: TNS 无监听程序');
      }
      throw new Error(
        `Oracle 连接失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.close();
      } catch (error) {
        // 忽略关闭连接时的错误
      }
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
      // Oracle 不需要末尾的分号，移除它以避免 ORA-00933 错误
      let cleanQuery = query.trim();
      if (cleanQuery.endsWith(';')) {
        cleanQuery = cleanQuery.slice(0, -1).trim();
      }

      // 执行查询，autoCommit 设置为 false（只读安全）
      const result = await this.connection.execute(cleanQuery, params || [], {
        autoCommit: false,
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      const executionTime = Date.now() - startTime;

      // 处理查询结果
      if (result.rows && result.rows.length > 0) {
        // SELECT 查询 - 将列名转换为小写
        const rows = result.rows.map((row: any) => {
          const lowerCaseRow: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(row)) {
            lowerCaseRow[key.toLowerCase()] = value;
          }
          return lowerCaseRow;
        });

        return {
          rows,
          executionTime,
          metadata: {
            columnCount: result.metaData?.length || 0,
          },
        };
      } else if (result.rowsAffected !== undefined && result.rowsAffected > 0) {
        // DML 操作 (INSERT/UPDATE/DELETE)
        return {
          rows: [],
          affectedRows: result.rowsAffected,
          executionTime,
        };
      } else {
        // 其他操作或空结果
        return {
          rows: [],
          executionTime,
        };
      }
    } catch (error: any) {
      // 翻译常见的 Oracle 错误
      if (error.errorNum === 942) {
        throw new Error('查询执行失败: 表或视图不存在');
      } else if (error.errorNum === 1) {
        throw new Error('查询执行失败: 违反唯一约束');
      }
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
      // 获取 Oracle 版本
      const versionResult = await this.connection.execute(
        `SELECT banner FROM v$version WHERE banner LIKE 'Oracle%'`
      );
      const version = versionResult.rows?.[0]
        ? Object.values(versionResult.rows[0])[0] as string
        : 'unknown';

      // 获取当前用户
      const userResult = await this.connection.execute('SELECT USER FROM DUAL');
      const databaseName = userResult.rows?.[0]
        ? Object.values(userResult.rows[0])[0] as string
        : 'unknown';

      // 批量获取所有表的列信息
      const allColumnsResult = await this.connection.execute(
        `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION,
                DATA_SCALE, NULLABLE, DATA_DEFAULT, COLUMN_ID
         FROM ALL_TAB_COLUMNS
         WHERE OWNER = USER
         ORDER BY TABLE_NAME, COLUMN_ID`
      );

      // 批量获取所有列注释
      const allCommentsResult = await this.connection.execute(
        `SELECT TABLE_NAME, COLUMN_NAME, COMMENTS
         FROM ALL_COL_COMMENTS
         WHERE OWNER = USER
           AND COMMENTS IS NOT NULL`
      );

      // 批量获取所有主键信息
      const allPrimaryKeysResult = await this.connection.execute(
        `SELECT cons.TABLE_NAME, cols.COLUMN_NAME, cols.POSITION
         FROM ALL_CONSTRAINTS cons
         JOIN ALL_CONS_COLUMNS cols
           ON cons.CONSTRAINT_NAME = cols.CONSTRAINT_NAME
           AND cons.OWNER = cols.OWNER
         WHERE cons.CONSTRAINT_TYPE = 'P'
           AND cons.OWNER = USER
         ORDER BY cons.TABLE_NAME, cols.POSITION`
      );

      // 批量获取所有索引信息
      const allIndexesResult = await this.connection.execute(
        `SELECT i.TABLE_NAME, i.INDEX_NAME, i.UNIQUENESS, ic.COLUMN_NAME, ic.COLUMN_POSITION
         FROM ALL_INDEXES i
         JOIN ALL_IND_COLUMNS ic
           ON i.INDEX_NAME = ic.INDEX_NAME
           AND i.OWNER = ic.INDEX_OWNER
         WHERE i.OWNER = USER
           AND i.INDEX_TYPE != 'LOB'
         ORDER BY i.TABLE_NAME, i.INDEX_NAME, ic.COLUMN_POSITION`
      );

      // 批量获取所有表的行数估算
      const allStatsResult = await this.connection.execute(
        `SELECT TABLE_NAME, NUM_ROWS
         FROM ALL_TABLES
         WHERE OWNER = USER
           AND TEMPORARY = 'N'`
      );

      return this.assembleSchema(
        databaseName,
        version,
        allColumnsResult.rows || [],
        allCommentsResult.rows || [],
        allPrimaryKeysResult.rows || [],
        allIndexesResult.rows || [],
        allStatsResult.rows || []
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
    allComments: any[],
    allPrimaryKeys: any[],
    allIndexes: any[],
    allStats: any[]
  ): SchemaInfo {
    // 按表名分组列信息
    const columnsByTable = new Map<string, ColumnInfo[]>();

    for (const col of allColumns) {
      const tableName = col.TABLE_NAME;
      const columnName = col.COLUMN_NAME;

      // 跳过无效数据
      if (!tableName || !columnName) {
        continue;
      }

      if (!columnsByTable.has(tableName)) {
        columnsByTable.set(tableName, []);
      }

      columnsByTable.get(tableName)!.push({
        name: columnName.toLowerCase(),
        type: this.formatOracleType(
          col.DATA_TYPE,
          col.DATA_LENGTH,
          col.DATA_PRECISION,
          col.DATA_SCALE
        ),
        nullable: col.NULLABLE === 'Y',
        defaultValue: col.DATA_DEFAULT?.trim() || undefined,
      });
    }

    // 按表名分组列注释
    const commentsByTable = new Map<string, Map<string, string>>();
    for (const comment of allComments) {
      const tableName = comment.TABLE_NAME;
      const columnName = comment.COLUMN_NAME;
      const comments = comment.COMMENTS;

      // 跳过无效数据
      if (!tableName || !columnName || !comments) {
        continue;
      }

      if (!commentsByTable.has(tableName)) {
        commentsByTable.set(tableName, new Map());
      }
      commentsByTable.get(tableName)!.set(
        columnName.toLowerCase(),
        comments
      );
    }

    // 将注释添加到列信息中
    for (const [tableName, columns] of columnsByTable.entries()) {
      const tableComments = commentsByTable.get(tableName);
      if (tableComments) {
        for (const col of columns) {
          if (tableComments.has(col.name)) {
            col.comment = tableComments.get(col.name);
          }
        }
      }
    }

    // 按表名分组主键信息
    const primaryKeysByTable = new Map<string, string[]>();
    for (const pk of allPrimaryKeys) {
      const tableName = pk.TABLE_NAME;
      const columnName = pk.COLUMN_NAME;

      // 跳过无效数据
      if (!tableName || !columnName) {
        continue;
      }

      if (!primaryKeysByTable.has(tableName)) {
        primaryKeysByTable.set(tableName, []);
      }
      primaryKeysByTable.get(tableName)!.push(columnName.toLowerCase());
    }

    // 按表名分组索引信息
    const indexesByTable = new Map<string, Map<string, { columns: string[]; unique: boolean }>>();

    for (const idx of allIndexes) {
      const tableName = idx.TABLE_NAME;
      const indexName = idx.INDEX_NAME;
      const columnName = idx.COLUMN_NAME;

      // 跳过无效数据
      if (!tableName || !indexName || !columnName) {
        continue;
      }

      // 跳过主键索引
      if (indexName.includes('PK_') || indexName.includes('SYS_')) {
        continue;
      }

      if (!indexesByTable.has(tableName)) {
        indexesByTable.set(tableName, new Map());
      }

      const tableIndexes = indexesByTable.get(tableName)!;

      if (!tableIndexes.has(indexName)) {
        tableIndexes.set(indexName, {
          columns: [],
          unique: idx.UNIQUENESS === 'UNIQUE',
        });
      }

      tableIndexes.get(indexName)!.columns.push(columnName.toLowerCase());
    }

    // 按表名分组行数统计
    const rowsByTable = new Map<string, number>();
    for (const stat of allStats) {
      const tableName = stat.TABLE_NAME;
      if (tableName) {
        rowsByTable.set(tableName, stat.NUM_ROWS || 0);
      }
    }

    // 组装表信息（基于列信息构建，不依赖 ALL_TABLES 的结果）
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

    // 按表名排序
    tableInfos.sort((a, b) => a.name.localeCompare(b.name));

    return {
      databaseType: 'oracle',
      databaseName,
      tables: tableInfos,
      version,
    };
  }

  /**
   * 格式化 Oracle 数据类型
   */
  private formatOracleType(
    dataType: string | undefined | null,
    length?: number,
    precision?: number,
    scale?: number
  ): string {
    // 处理空值
    if (!dataType) {
      return 'UNKNOWN';
    }

    switch (dataType) {
      case 'NUMBER':
        if (precision !== null && precision !== undefined) {
          if (scale !== null && scale !== undefined && scale > 0) {
            return `NUMBER(${precision},${scale})`;
          }
          return `NUMBER(${precision})`;
        }
        return 'NUMBER';

      case 'VARCHAR2':
      case 'CHAR':
        if (length) {
          return `${dataType}(${length})`;
        }
        return dataType;

      case 'TIMESTAMP':
        if (scale !== null && scale !== undefined) {
          return `TIMESTAMP(${scale})`;
        }
        return 'TIMESTAMP';

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

    // 添加 Oracle 特定的写操作检测
    const trimmedQuery = query.trim().toUpperCase();

    // MERGE 语句（Oracle 的 upsert 操作）
    if (trimmedQuery.startsWith('MERGE')) {
      return true;
    }

    // PL/SQL 块（可能包含写操作）
    if (trimmedQuery.startsWith('BEGIN') || trimmedQuery.startsWith('DECLARE')) {
      return true;
    }

    // CALL 存储过程（可能包含写操作）
    if (trimmedQuery.startsWith('CALL')) {
      return true;
    }

    // 事务控制语句
    if (trimmedQuery.startsWith('COMMIT') || trimmedQuery.startsWith('ROLLBACK')) {
      return true;
    }

    return false;
  }
}
