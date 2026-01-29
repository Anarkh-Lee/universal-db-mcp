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
      // 达梦兼容 Oracle，不需要末尾的分号，移除它以避免语法错误
      let cleanQuery = query.trim();
      if (cleanQuery.endsWith(';')) {
        cleanQuery = cleanQuery.slice(0, -1).trim();
      }

      // 执行查询
      const result = await this.connection.execute(cleanQuery, params || [], {
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
   *
   * 达梦数据库中：
   * - database 是数据库实例名（如 DAMENG）
   * - schema 是用户的命名空间（通常与用户名相同，如 SHOP）
   * - 表存储在 schema 下，不是 database 下
   *
   * 注意：dmdb 驱动返回的列名是数字索引（"0", "1", ...），不是列名！
   * 因此需要按索引位置访问数据。
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
        ? this.getValueByIndex(versionResult.rows[0], 0) as string
        : 'unknown';

      // 获取当前 schema（在达梦中，schema 通常与用户名相同）
      const schemaResult = await this.connection.execute(
        `SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') FROM DUAL`,
        []
      );
      const currentSchema = schemaResult.rows?.[0]
        ? this.getValueByIndex(schemaResult.rows[0], 0) as string
        : '';

      // 获取当前用户（作为备选）
      const userResult = await this.connection.execute('SELECT USER FROM DUAL', []);
      const currentUser = userResult.rows?.[0]
        ? this.getValueByIndex(userResult.rows[0], 0) as string
        : '';

      // schema 名称：优先使用当前 schema，其次使用当前用户，最后使用配置的用户名
      const schemaName = (currentSchema || currentUser || this.config.user || '').toUpperCase();
      const databaseName = schemaName || 'unknown';

      // 获取所有表的列信息
      // 列顺序: 0=TABLE_NAME, 1=COLUMN_NAME, 2=DATA_TYPE, 3=DATA_LENGTH,
      //        4=DATA_PRECISION, 5=DATA_SCALE, 6=NULLABLE, 7=DATA_DEFAULT, 8=COLUMN_ID
      const allColumnsResult = await this.connection.execute(
        `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION,
                DATA_SCALE, NULLABLE, DATA_DEFAULT, COLUMN_ID
         FROM USER_TAB_COLUMNS
         ORDER BY TABLE_NAME, COLUMN_ID`,
        []
      );

      // 获取所有列注释
      // 列顺序: 0=TABLE_NAME, 1=COLUMN_NAME, 2=COMMENTS
      const allCommentsResult = await this.connection.execute(
        `SELECT TABLE_NAME, COLUMN_NAME, COMMENTS
         FROM USER_COL_COMMENTS
         WHERE COMMENTS IS NOT NULL`,
        []
      );

      // 获取所有主键信息
      // 列顺序: 0=TABLE_NAME, 1=COLUMN_NAME, 2=POSITION
      const allPrimaryKeysResult = await this.connection.execute(
        `SELECT cons.TABLE_NAME, cols.COLUMN_NAME, cols.POSITION
         FROM USER_CONSTRAINTS cons
         JOIN USER_CONS_COLUMNS cols
           ON cons.CONSTRAINT_NAME = cols.CONSTRAINT_NAME
         WHERE cons.CONSTRAINT_TYPE = 'P'
         ORDER BY cons.TABLE_NAME, cols.POSITION`,
        []
      );

      // 获取所有索引信息
      // 列顺序: 0=TABLE_NAME, 1=INDEX_NAME, 2=UNIQUENESS, 3=COLUMN_NAME, 4=COLUMN_POSITION
      const allIndexesResult = await this.connection.execute(
        `SELECT i.TABLE_NAME, i.INDEX_NAME, i.UNIQUENESS, ic.COLUMN_NAME, ic.COLUMN_POSITION
         FROM USER_INDEXES i
         JOIN USER_IND_COLUMNS ic
           ON i.INDEX_NAME = ic.INDEX_NAME
         ORDER BY i.TABLE_NAME, i.INDEX_NAME, ic.COLUMN_POSITION`,
        []
      );

      // 获取所有表的行数估算
      // 列顺序: 0=TABLE_NAME, 1=NUM_ROWS
      const allStatsResult = await this.connection.execute(
        `SELECT TABLE_NAME, NUM_ROWS FROM USER_TABLES`,
        []
      );

      return this.assembleSchemaFromIndexedRows(
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
   * 按索引获取对象的值（dmdb 驱动返回的列名是数字索引）
   */
  private getValueByIndex(obj: any, index: number): unknown {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }
    // 尝试按数字索引访问
    if (obj[index] !== undefined) {
      return obj[index];
    }
    // 尝试按字符串索引访问
    if (obj[String(index)] !== undefined) {
      return obj[String(index)];
    }
    // 尝试按位置获取值
    const values = Object.values(obj);
    return values.length > index ? values[index] : undefined;
  }

  /**
   * 组装 Schema 信息（处理 dmdb 驱动返回的数字索引列名）
   */
  private assembleSchemaFromIndexedRows(
    databaseName: string,
    version: string,
    allColumns: any[],
    allComments: any[],
    allPrimaryKeys: any[],
    allIndexes: any[],
    allStats: any[]
  ): SchemaInfo {
    // 按表名分组列信息
    // 列顺序: 0=TABLE_NAME, 1=COLUMN_NAME, 2=DATA_TYPE, 3=DATA_LENGTH,
    //        4=DATA_PRECISION, 5=DATA_SCALE, 6=NULLABLE, 7=DATA_DEFAULT, 8=COLUMN_ID
    const columnsByTable = new Map<string, ColumnInfo[]>();

    for (const col of allColumns) {
      const tableName = this.getValueByIndex(col, 0) as string;
      const columnName = this.getValueByIndex(col, 1) as string;
      const dataType = this.getValueByIndex(col, 2);
      const dataLength = this.getValueByIndex(col, 3) as number;
      const dataPrecision = this.getValueByIndex(col, 4) as number;
      const dataScale = this.getValueByIndex(col, 5) as number;
      const nullable = this.getValueByIndex(col, 6) as string;
      const dataDefault = this.getValueByIndex(col, 7);

      // 跳过无效数据
      if (!tableName || !columnName) {
        continue;
      }

      if (!columnsByTable.has(tableName)) {
        columnsByTable.set(tableName, []);
      }

      columnsByTable.get(tableName)!.push({
        name: String(columnName).toLowerCase(),
        type: this.formatDMType(
          dataType as string | number | null | undefined,
          dataLength,
          dataPrecision,
          dataScale
        ),
        nullable: nullable === 'Y',
        defaultValue: dataDefault ? String(dataDefault).trim() : undefined,
      });
    }

    // 按表名分组列注释
    // 列顺序: 0=TABLE_NAME, 1=COLUMN_NAME, 2=COMMENTS
    const commentsByTable = new Map<string, Map<string, string>>();
    for (const comment of allComments) {
      const tableName = this.getValueByIndex(comment, 0) as string;
      const columnName = this.getValueByIndex(comment, 1) as string;
      const comments = this.getValueByIndex(comment, 2) as string;

      // 跳过无效数据
      if (!tableName || !columnName || !comments) {
        continue;
      }

      if (!commentsByTable.has(tableName)) {
        commentsByTable.set(tableName, new Map());
      }
      commentsByTable.get(tableName)!.set(
        String(columnName).toLowerCase(),
        String(comments)
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
    // 列顺序: 0=TABLE_NAME, 1=COLUMN_NAME, 2=POSITION
    const primaryKeysByTable = new Map<string, string[]>();
    for (const pk of allPrimaryKeys) {
      const tableName = this.getValueByIndex(pk, 0) as string;
      const columnName = this.getValueByIndex(pk, 1) as string;

      // 跳过无效数据
      if (!tableName || !columnName) {
        continue;
      }

      if (!primaryKeysByTable.has(tableName)) {
        primaryKeysByTable.set(tableName, []);
      }
      primaryKeysByTable.get(tableName)!.push(String(columnName).toLowerCase());
    }

    // 按表名分组索引信息
    // 列顺序: 0=TABLE_NAME, 1=INDEX_NAME, 2=UNIQUENESS, 3=COLUMN_NAME, 4=COLUMN_POSITION
    const indexesByTable = new Map<string, Map<string, { columns: string[]; unique: boolean }>>();

    for (const idx of allIndexes) {
      const tableName = this.getValueByIndex(idx, 0) as string;
      const indexName = this.getValueByIndex(idx, 1) as string;
      const uniqueness = this.getValueByIndex(idx, 2) as string;
      const columnName = this.getValueByIndex(idx, 3) as string;

      // 跳过无效数据
      if (!tableName || !indexName || !columnName) {
        continue;
      }

      // 跳过主键索引和系统索引
      const idxNameStr = String(indexName);
      if (idxNameStr.includes('PK_') || idxNameStr.startsWith('INDEX') || idxNameStr.includes('SYS_')) {
        continue;
      }

      if (!indexesByTable.has(tableName)) {
        indexesByTable.set(tableName, new Map());
      }

      const tableIndexes = indexesByTable.get(tableName)!;

      if (!tableIndexes.has(indexName)) {
        tableIndexes.set(indexName, {
          columns: [],
          unique: uniqueness === 'UNIQUE',
        });
      }

      tableIndexes.get(indexName)!.columns.push(String(columnName).toLowerCase());
    }

    // 按表名分组行数统计
    // 列顺序: 0=TABLE_NAME, 1=NUM_ROWS
    const rowsByTable = new Map<string, number>();
    for (const stat of allStats) {
      const tableName = this.getValueByIndex(stat, 0) as string;
      const numRows = this.getValueByIndex(stat, 1);
      if (tableName) {
        rowsByTable.set(tableName, Number(numRows) || 0);
      }
    }

    // 组装表信息
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
        name: String(tableName).toLowerCase(),
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
    dataType: string | number | undefined | null,
    length?: number,
    precision?: number,
    scale?: number
  ): string {
    // 处理空值
    if (dataType === null || dataType === undefined) {
      return 'UNKNOWN';
    }

    // 达梦的 TYPE$ 可能是数字类型代码，需要转换
    const typeMap: Record<number, string> = {
      0: 'CHAR',
      1: 'VARCHAR',
      2: 'VARCHAR2',
      3: 'BIT',
      4: 'TINYINT',
      5: 'SMALLINT',
      6: 'INT',
      7: 'BIGINT',
      8: 'DECIMAL',
      9: 'FLOAT',
      10: 'DOUBLE',
      11: 'BLOB',
      12: 'DATE',
      13: 'TIME',
      14: 'DATETIME',
      15: 'TIMESTAMP',
      17: 'BINARY',
      18: 'VARBINARY',
      19: 'CLOB',
      21: 'TEXT',
      22: 'IMAGE',
      23: 'BFILE',
    };

    let typeName: string;
    if (typeof dataType === 'number') {
      typeName = typeMap[dataType] || `TYPE_${dataType}`;
    } else {
      typeName = String(dataType);
    }

    // 添加长度/精度信息
    switch (typeName) {
      case 'DECIMAL':
      case 'NUMBER':
      case 'NUMERIC':
        if (precision && scale && scale > 0) {
          return `${typeName}(${precision},${scale})`;
        } else if (precision) {
          return `${typeName}(${precision})`;
        } else if (length) {
          return `${typeName}(${length})`;
        }
        return typeName;

      case 'VARCHAR':
      case 'VARCHAR2':
      case 'CHAR':
        if (length) {
          return `${typeName}(${length})`;
        }
        return typeName;

      default:
        return typeName;
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
