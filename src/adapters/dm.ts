/**
 * 达梦数据库适配器
 * 达梦数据库高度兼容 Oracle，使用类似的 API 和系统视图
 *
 * dmdb 驱动会作为可选依赖自动安装
 *
 * 性能优化：使用批量查询获取 Schema 信息，避免 N+1 查询问题
 */

import type {
  DbAdapter,
  QueryResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  IndexInfo,
} from '../types/adapter.js';
import { isWriteOperation as checkWriteOperation } from '../utils/safety.js';

// 动态导入 dmdb，因为它是可选依赖
let dmdb: any = null;

async function loadDMDB() {
  if (dmdb) {
    return dmdb;
  }

  try {
    // @ts-ignore - dmdb 是可选依赖，可能未安装
    const module = await import('dmdb');
    dmdb = module.default || module;
    return dmdb;
  } catch (error) {
    throw new Error(
      '达梦数据库驱动未安装。\n' +
      '请运行以下命令安装：npm install dmdb\n' +
      '或者全局安装：npm install -g dmdb'
    );
  }
}

export class DMAdapter implements DbAdapter {
  private connection: any = null;
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
   * 连接到达梦数据库
   */
  async connect(): Promise<void> {
    try {
      const DM = await loadDMDB();

      // 达梦数据库连接配置
      const connectionConfig = {
        host: this.config.host,
        port: this.config.port || 5236, // 达梦默认端口
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        // 禁用消息加密以避免 OpenSSL 3.0 兼容性问题
        // 如果需要加密连接，请确保达梦数据库服务器配置了兼容的加密算法
        cipherPath: '',
        loginEncrypt: false,
      };

      this.connection = await DM.getConnection(connectionConfig);

      // 测试连接
      await this.connection.execute('SELECT 1 FROM DUAL', []);
    } catch (error: any) {
      // 翻译常见错误
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('用户名') || errorMessage.includes('密码')) {
        throw new Error('达梦数据库连接失败: 用户名或密码无效');
      } else if (errorMessage.includes('连接') || errorMessage.includes('网络')) {
        throw new Error('达梦数据库连接失败: 无法连接到数据库服务器，请检查主机地址和端口');
      }

      throw new Error(`达梦数据库连接失败: ${errorMessage}`);
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
      // 执行查询
      const result = await this.connection.execute(query, params || [], {
        autoCommit: false,
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
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('表') || errorMessage.includes('视图')) {
        throw new Error('查询执行失败: 表或视图不存在');
      } else if (errorMessage.includes('约束')) {
        throw new Error('查询执行失败: 违反唯一约束');
      }

      throw new Error(`查询执行失败: ${errorMessage}`);
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
      // 获取达梦数据库版本
      const versionResult = await this.connection.execute(
        `SELECT BANNER FROM V$VERSION WHERE ROWNUM = 1`,
        []
      );
      const version = versionResult.rows?.[0]
        ? Object.values(versionResult.rows[0])[0] as string
        : 'unknown';

      // 获取当前用户
      const userResult = await this.connection.execute('SELECT USER FROM DUAL', []);
      const databaseName = userResult.rows?.[0]
        ? Object.values(userResult.rows[0])[0] as string
        : 'unknown';

      // 批量获取所有表的列信息
      const allColumnsResult = await this.connection.execute(
        `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION,
                DATA_SCALE, NULLABLE, DATA_DEFAULT, COLUMN_ID
         FROM USER_TAB_COLUMNS
         ORDER BY TABLE_NAME, COLUMN_ID`,
        []
      );

      // 批量获取所有列注释
      const allCommentsResult = await this.connection.execute(
        `SELECT TABLE_NAME, COLUMN_NAME, COMMENTS
         FROM USER_COL_COMMENTS
         WHERE COMMENTS IS NOT NULL`,
        []
      );

      // 批量获取所有主键信息
      const allPrimaryKeysResult = await this.connection.execute(
        `SELECT cons.TABLE_NAME, cols.COLUMN_NAME, cols.POSITION
         FROM USER_CONSTRAINTS cons
         JOIN USER_CONS_COLUMNS cols
           ON cons.CONSTRAINT_NAME = cols.CONSTRAINT_NAME
         WHERE cons.CONSTRAINT_TYPE = 'P'
         ORDER BY cons.TABLE_NAME, cols.POSITION`,
        []
      );

      // 批量获取所有索引信息
      const allIndexesResult = await this.connection.execute(
        `SELECT i.TABLE_NAME, i.INDEX_NAME, i.UNIQUENESS, ic.COLUMN_NAME, ic.COLUMN_POSITION
         FROM USER_INDEXES i
         JOIN USER_IND_COLUMNS ic
           ON i.INDEX_NAME = ic.INDEX_NAME
         WHERE i.INDEX_TYPE != 'LOB'
         ORDER BY i.TABLE_NAME, i.INDEX_NAME, ic.COLUMN_POSITION`,
        []
      );

      // 批量获取所有表的行数估算
      const allStatsResult = await this.connection.execute(
        `SELECT TABLE_NAME, NUM_ROWS
         FROM USER_TABLES
         WHERE TEMPORARY = 'N'`,
        []
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

      if (!columnsByTable.has(tableName)) {
        columnsByTable.set(tableName, []);
      }

      columnsByTable.get(tableName)!.push({
        name: col.COLUMN_NAME.toLowerCase(),
        type: this.formatDMType(
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
      if (!commentsByTable.has(tableName)) {
        commentsByTable.set(tableName, new Map());
      }
      commentsByTable.get(tableName)!.set(
        comment.COLUMN_NAME.toLowerCase(),
        comment.COMMENTS
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
      if (!primaryKeysByTable.has(tableName)) {
        primaryKeysByTable.set(tableName, []);
      }
      primaryKeysByTable.get(tableName)!.push(pk.COLUMN_NAME.toLowerCase());
    }

    // 按表名分组索引信息
    const indexesByTable = new Map<string, Map<string, { columns: string[]; unique: boolean }>>();

    for (const idx of allIndexes) {
      const tableName = idx.TABLE_NAME;
      const indexName = idx.INDEX_NAME;

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

      tableIndexes.get(indexName)!.columns.push(idx.COLUMN_NAME.toLowerCase());
    }

    // 按表名分组行数统计
    const rowsByTable = new Map<string, number>();
    for (const stat of allStats) {
      rowsByTable.set(stat.TABLE_NAME, stat.NUM_ROWS || 0);
    }

    // 组装表信息
    const tableInfos: TableInfo[] = [];

    for (const [tableName, columns] of columnsByTable.entries()) {
      // 只包含在 allStats 中的表（排除临时表等）
      if (!rowsByTable.has(tableName)) {
        continue;
      }

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
      databaseType: 'dm',
      databaseName,
      tables: tableInfos,
      version,
    };
  }

  /**
   * 格式化达梦数据类型
   */
  private formatDMType(
    dataType: string,
    length?: number,
    precision?: number,
    scale?: number
  ): string {
    switch (dataType) {
      case 'NUMBER':
      case 'NUMERIC':
      case 'DECIMAL':
        if (precision !== null && precision !== undefined) {
          if (scale !== null && scale !== undefined && scale > 0) {
            return `${dataType}(${precision},${scale})`;
          }
          return `${dataType}(${precision})`;
        }
        return dataType;

      case 'VARCHAR':
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

    // 添加达梦特定的写操作检测（类似 Oracle）
    const trimmedQuery = query.trim().toUpperCase();

    // MERGE 语句（达梦支持）
    if (trimmedQuery.startsWith('MERGE')) {
      return true;
    }

    // PL/SQL 块（达梦兼容 Oracle PL/SQL）
    if (trimmedQuery.startsWith('BEGIN') || trimmedQuery.startsWith('DECLARE')) {
      return true;
    }

    // CALL 存储过程
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
