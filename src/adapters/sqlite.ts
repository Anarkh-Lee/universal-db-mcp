/**
 * SQLite 数据库适配器
 * 使用 better-sqlite3 驱动实现 DbAdapter 接口
 */

import Database from 'better-sqlite3';
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

export class SQLiteAdapter implements DbAdapter {
  private db: Database.Database | null = null;
  private config: {
    filePath: string;
    readonly?: boolean;
  };

  constructor(config: {
    filePath: string;
    readonly?: boolean;
  }) {
    this.config = config;
  }

  /**
   * 连接到 SQLite 数据库
   */
  async connect(): Promise<void> {
    try {
      this.db = new Database(this.config.filePath, {
        readonly: this.config.readonly,
        fileMustExist: false, // 如果文件不存在则创建
      });

      // 启用外键约束
      this.db.pragma('foreign_keys = ON');
    } catch (error) {
      throw new Error(
        `SQLite 连接失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * 执行 SQL 查询
   */
  async executeQuery(query: string, params?: unknown[]): Promise<QueryResult> {
    if (!this.db) {
      throw new Error('数据库未连接');
    }

    const startTime = Date.now();

    try {
      // 清理查询语句
      const trimmedQuery = query.trim().toUpperCase();

      // 判断是否为查询操作
      if (trimmedQuery.startsWith('SELECT') || trimmedQuery.startsWith('PRAGMA')) {
        // SELECT 查询
        const stmt = this.db.prepare(query);
        const rows = params ? stmt.all(...params) : stmt.all();
        const executionTime = Date.now() - startTime;

        return {
          rows: rows as Record<string, unknown>[],
          executionTime,
          metadata: {
            rowCount: rows.length,
          },
        };
      } else {
        // INSERT/UPDATE/DELETE 等操作
        const stmt = this.db.prepare(query);
        const info = params ? stmt.run(...params) : stmt.run();
        const executionTime = Date.now() - startTime;

        return {
          rows: [],
          affectedRows: info.changes,
          executionTime,
          metadata: {
            lastInsertRowid: info.lastInsertRowid,
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
    if (!this.db) {
      throw new Error('数据库未连接');
    }

    try {
      // 获取 SQLite 版本
      const versionRow = this.db.prepare('SELECT sqlite_version() as version').get() as { version: string };
      const version = versionRow.version;

      // 获取数据库文件名作为数据库名
      const databaseName = this.config.filePath.split(/[\\/]/).pop() || 'unknown';

      // 获取所有表（排除 sqlite 内部表）
      const tables = this.db
        .prepare(
          `SELECT name FROM sqlite_master
           WHERE type='table' AND name NOT LIKE 'sqlite_%'
           ORDER BY name`
        )
        .all() as { name: string }[];

      const tableInfos: TableInfo[] = [];
      const relationships: RelationshipInfo[] = [];

      for (const table of tables) {
        const { tableInfo, tableForeignKeys } = await this.getTableInfo(table.name);
        tableInfos.push(tableInfo);

        // 收集全局关系
        for (const fk of tableForeignKeys) {
          relationships.push({
            fromTable: table.name,
            fromColumns: fk.columns,
            toTable: fk.referencedTable,
            toColumns: fk.referencedColumns,
            type: 'many-to-one',
            constraintName: fk.name,
          });
        }
      }

      return {
        databaseType: 'sqlite',
        databaseName,
        tables: tableInfos,
        version,
        relationships: relationships.length > 0 ? relationships : undefined,
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
  private async getTableInfo(tableName: string): Promise<{ tableInfo: TableInfo; tableForeignKeys: ForeignKeyInfo[] }> {
    if (!this.db) {
      throw new Error('数据库未连接');
    }

    // 获取列信息
    const columns = this.db
      .prepare(`PRAGMA table_info(${tableName})`)
      .all() as Array<{
        cid: number;
        name: string;
        type: string;
        notnull: number;
        dflt_value: string | null;
        pk: number;
      }>;

    const columnInfos: ColumnInfo[] = columns.map((col) => ({
      name: col.name,
      type: col.type,
      nullable: col.notnull === 0,
      defaultValue: col.dflt_value || undefined,
    }));

    // 获取主键
    const primaryKeys = columns
      .filter((col) => col.pk > 0)
      .sort((a, b) => a.pk - b.pk)
      .map((col) => col.name);

    // 获取索引信息
    const indexes = this.db
      .prepare(`PRAGMA index_list(${tableName})`)
      .all() as Array<{
        seq: number;
        name: string;
        unique: number;
        origin: string;
        partial: number;
      }>;

    const indexInfos: IndexInfo[] = [];

    for (const idx of indexes) {
      // 跳过自动创建的主键索引
      if (idx.origin === 'pk') continue;

      // 获取索引的列信息
      const indexColumns = this.db
        .prepare(`PRAGMA index_info(${idx.name})`)
        .all() as Array<{
          seqno: number;
          cid: number;
          name: string;
        }>;

      indexInfos.push({
        name: idx.name,
        columns: indexColumns.map((col) => col.name),
        unique: idx.unique === 1,
      });
    }

    // 获取外键信息
    const foreignKeys = this.db
      .prepare(`PRAGMA foreign_key_list(${tableName})`)
      .all() as Array<{
        id: number;
        seq: number;
        table: string;
        from: string;
        to: string;
        on_update: string;
        on_delete: string;
        match: string;
      }>;

    // 按外键 ID 分组（一个外键可能包含多列）
    const fkMap = new Map<number, { columns: string[]; referencedTable: string; referencedColumns: string[]; onDelete?: string; onUpdate?: string }>();

    for (const fk of foreignKeys) {
      if (!fkMap.has(fk.id)) {
        fkMap.set(fk.id, {
          columns: [],
          referencedTable: fk.table,
          referencedColumns: [],
          onDelete: fk.on_delete !== 'NO ACTION' ? fk.on_delete : undefined,
          onUpdate: fk.on_update !== 'NO ACTION' ? fk.on_update : undefined,
        });
      }
      const fkInfo = fkMap.get(fk.id)!;
      fkInfo.columns.push(fk.from);
      fkInfo.referencedColumns.push(fk.to);
    }

    const foreignKeyInfos: ForeignKeyInfo[] = [];
    for (const [id, fkData] of fkMap.entries()) {
      foreignKeyInfos.push({
        name: `fk_${tableName}_${id}`,
        columns: fkData.columns,
        referencedTable: fkData.referencedTable,
        referencedColumns: fkData.referencedColumns,
        onDelete: fkData.onDelete,
        onUpdate: fkData.onUpdate,
      });
    }

    // 获取表行数
    const countRow = this.db
      .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
      .get() as { count: number };
    const estimatedRows = countRow.count;

    return {
      tableInfo: {
        name: tableName,
        columns: columnInfos,
        primaryKeys,
        indexes: indexInfos,
        foreignKeys: foreignKeyInfos.length > 0 ? foreignKeyInfos : undefined,
        estimatedRows,
      },
      tableForeignKeys: foreignKeyInfos,
    };
  }

  /**
   * 检查是否为写操作
   */
  isWriteOperation(query: string): boolean {
    return checkWriteOperation(query);
  }
}
