/**
 * MongoDB 数据库适配器
 * 使用 mongodb 驱动实现 DbAdapter 接口
 *
 * 注意：MongoDB 是 NoSQL 文档数据库，没有固定的表结构
 * 本适配器提供集合操作和文档查询功能
 */

import { MongoClient, Db, Document } from 'mongodb';
import type {
  DbAdapter,
  QueryResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
} from '../types/adapter.js';

export class MongoDBAdapter implements DbAdapter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: {
    host: string;
    port: number;
    user?: string;
    password?: string;
    database?: string;
    authSource?: string;
  };

  constructor(config: {
    host: string;
    port: number;
    user?: string;
    password?: string;
    database?: string;
    authSource?: string;
  }) {
    this.config = config;
  }

  /**
   * 连接到 MongoDB 数据库
   */
  async connect(): Promise<void> {
    try {
      // 构建连接字符串
      let uri = 'mongodb://';

      if (this.config.user && this.config.password) {
        uri += `${encodeURIComponent(this.config.user)}:${encodeURIComponent(this.config.password)}@`;
      }

      uri += `${this.config.host}:${this.config.port}`;

      if (this.config.database) {
        uri += `/${this.config.database}`;
      }

      // 添加认证源参数
      const authSource = this.config.authSource || this.config.database || 'admin';
      if (this.config.user) {
        uri += `?authSource=${authSource}`;
      }

      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });

      await this.client.connect();

      // 选择数据库
      const dbName = this.config.database || 'test';
      this.db = this.client.db(dbName);

      // 测试连接
      await this.db.admin().ping();
    } catch (error) {
      throw new Error(
        `MongoDB 连接失败: ${error instanceof Error ? error.message : String(error)}`
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
      this.db = null;
    }
  }

  /**
   * 执行 MongoDB 查询
   *
   * 支持的查询格式：
   * 1. JSON 格式的 MongoDB 查询：
   *    {"collection": "users", "operation": "find", "query": {"age": {"$gt": 18}}}
   * 2. 简化的命令格式：
   *    db.users.find({"age": {"$gt": 18}})
   * 3. 聚合管道：
   *    {"collection": "users", "operation": "aggregate", "pipeline": [...]}
   */
  async executeQuery(query: string, _params?: unknown[]): Promise<QueryResult> {
    if (!this.db) {
      throw new Error('数据库未连接');
    }

    const startTime = Date.now();

    try {
      // 解析查询
      const parsedQuery = this.parseQuery(query);

      // 执行操作
      const result = await this.executeOperation(parsedQuery);
      const executionTime = Date.now() - startTime;

      return {
        rows: result,
        executionTime,
        metadata: {
          collection: parsedQuery.collection,
          operation: parsedQuery.operation,
          resultCount: result.length,
        },
      };
    } catch (error) {
      throw new Error(
        `MongoDB 查询执行失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 解析查询字符串
   */
  private parseQuery(query: string): {
    collection: string;
    operation: string;
    query?: Document;
    update?: Document;
    pipeline?: Document[];
    options?: Document;
  } {
    const trimmed = query.trim();

    // 尝试解析 JSON 格式
    if (trimmed.startsWith('{')) {
      try {
        return JSON.parse(trimmed);
      } catch (error) {
        throw new Error('无效的 JSON 查询格式');
      }
    }

    // 解析 db.collection.operation() 格式
    const match = trimmed.match(/db\.(\w+)\.(\w+)\((.*)\)/s);
    if (match) {
      const [, collection, operation, argsStr] = match;

      let args: Document = {};
      if (argsStr.trim()) {
        try {
          args = JSON.parse(argsStr);
        } catch (error) {
          throw new Error('无效的查询参数格式');
        }
      }

      return {
        collection,
        operation,
        query: args,
      };
    }

    throw new Error('不支持的查询格式。请使用 JSON 格式或 db.collection.operation() 格式');
  }

  /**
   * 执行 MongoDB 操作
   */
  private async executeOperation(parsed: {
    collection: string;
    operation: string;
    query?: Document;
    update?: Document;
    pipeline?: Document[];
    options?: Document;
  }): Promise<Document[]> {
    if (!this.db) {
      throw new Error('数据库未连接');
    }

    const collection = this.db.collection(parsed.collection);
    const operation = parsed.operation.toLowerCase();

    switch (operation) {
      case 'find': {
        const cursor = collection.find(parsed.query || {}, parsed.options);
        const results = await cursor.toArray();
        return results.map(doc => this.formatDocument(doc));
      }

      case 'findone': {
        const result = await collection.findOne(parsed.query || {}, parsed.options);
        return result ? [this.formatDocument(result)] : [];
      }

      case 'count':
      case 'countdocuments': {
        const count = await collection.countDocuments(parsed.query || {});
        return [{ count }];
      }

      case 'distinct': {
        if (!parsed.options?.field) {
          throw new Error('distinct 操作需要指定 field 参数');
        }
        const values = await collection.distinct(parsed.options.field, parsed.query || {});
        return values.map((value, index) => ({ index, value }));
      }

      case 'aggregate': {
        if (!parsed.pipeline) {
          throw new Error('aggregate 操作需要指定 pipeline 参数');
        }
        const cursor = collection.aggregate(parsed.pipeline);
        const results = await cursor.toArray();
        return results.map(doc => this.formatDocument(doc));
      }

      case 'insert':
      case 'insertone': {
        if (!parsed.query) {
          throw new Error('insert 操作需要指定文档数据');
        }
        const result = await collection.insertOne(parsed.query);
        return [{ insertedId: result.insertedId.toString(), acknowledged: result.acknowledged }];
      }

      case 'insertmany': {
        if (!parsed.query || !Array.isArray(parsed.query)) {
          throw new Error('insertMany 操作需要指定文档数组');
        }
        const result = await collection.insertMany(parsed.query);
        return [{
          insertedCount: result.insertedCount,
          insertedIds: Object.values(result.insertedIds).map(id => id.toString()),
          acknowledged: result.acknowledged
        }];
      }

      case 'update':
      case 'updateone': {
        if (!parsed.query || !parsed.update) {
          throw new Error('update 操作需要指定 query 和 update 参数');
        }
        const result = await collection.updateOne(parsed.query, parsed.update);
        return [{
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          acknowledged: result.acknowledged,
        }];
      }

      case 'updatemany': {
        if (!parsed.query || !parsed.update) {
          throw new Error('updateMany 操作需要指定 query 和 update 参数');
        }
        const result = await collection.updateMany(parsed.query, parsed.update);
        return [{
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          acknowledged: result.acknowledged,
        }];
      }

      case 'delete':
      case 'deleteone': {
        if (!parsed.query) {
          throw new Error('delete 操作需要指定查询条件');
        }
        const result = await collection.deleteOne(parsed.query);
        return [{
          deletedCount: result.deletedCount,
          acknowledged: result.acknowledged,
        }];
      }

      case 'deletemany': {
        if (!parsed.query) {
          throw new Error('deleteMany 操作需要指定查询条件');
        }
        const result = await collection.deleteMany(parsed.query);
        return [{
          deletedCount: result.deletedCount,
          acknowledged: result.acknowledged,
        }];
      }

      default:
        throw new Error(`不支持的操作: ${operation}`);
    }
  }

  /**
   * 格式化 MongoDB 文档（将 ObjectId 转换为字符串）
   */
  private formatDocument(doc: Document): Document {
    const formatted: Document = {};

    for (const [key, value] of Object.entries(doc)) {
      if (value && typeof value === 'object' && '_bsontype' in value) {
        // 处理 BSON 类型（如 ObjectId）
        formatted[key] = value.toString();
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // 递归处理嵌套对象
        formatted[key] = this.formatDocument(value);
      } else if (Array.isArray(value)) {
        // 处理数组
        formatted[key] = value.map(item =>
          item && typeof item === 'object' ? this.formatDocument(item) : item
        );
      } else {
        formatted[key] = value;
      }
    }

    return formatted;
  }

  /**
   * 获取 MongoDB 数据库信息
   *
   * MongoDB 没有固定的表结构，这里通过采样文档来推断集合的字段
   */
  async getSchema(): Promise<SchemaInfo> {
    if (!this.db) {
      throw new Error('数据库未连接');
    }

    try {
      // 获取 MongoDB 版本
      const serverInfo = await this.db.admin().serverInfo();
      const version = serverInfo.version || 'unknown';

      // 获取数据库名称
      const databaseName = this.db.databaseName;

      // 获取所有集合
      const collections = await this.db.listCollections().toArray();

      const tables: TableInfo[] = [];

      for (const collInfo of collections) {
        const collectionName = collInfo.name;

        // 跳过系统集合
        if (collectionName.startsWith('system.')) {
          continue;
        }

        const collection = this.db.collection(collectionName);

        // 获取集合统计信息
        let estimatedRows = 0;
        try {
          const stats = await this.db.command({ collStats: collectionName });
          estimatedRows = stats.count || 0;
        } catch (error) {
          // 如果获取统计失败，使用 countDocuments
          estimatedRows = await collection.countDocuments();
        }

        // 采样文档以推断字段结构（最多采样 100 个文档）
        const sampleDocs = await collection.find().limit(100).toArray();

        // 分析字段
        const fieldMap = new Map<string, { types: Set<string>; nullable: boolean }>();

        for (const doc of sampleDocs) {
          for (const [key, value] of Object.entries(doc)) {
            if (!fieldMap.has(key)) {
              fieldMap.set(key, { types: new Set(), nullable: false });
            }

            const fieldInfo = fieldMap.get(key)!;

            if (value === null || value === undefined) {
              fieldInfo.nullable = true;
            } else {
              const type = this.getMongoType(value);
              fieldInfo.types.add(type);
            }
          }
        }

        // 转换为 ColumnInfo
        const columns: ColumnInfo[] = Array.from(fieldMap.entries()).map(
          ([name, info]) => ({
            name,
            type: Array.from(info.types).join(' | ') || 'unknown',
            nullable: info.nullable || sampleDocs.length < estimatedRows,
          })
        );

        // MongoDB 的 _id 字段通常是主键
        const primaryKeys = columns.some(col => col.name === '_id') ? ['_id'] : [];

        tables.push({
          name: collectionName,
          columns,
          primaryKeys,
          estimatedRows,
        });
      }

      return {
        databaseType: 'mongodb',
        databaseName,
        tables,
        version,
      };
    } catch (error) {
      throw new Error(
        `获取 MongoDB 信息失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 获取 MongoDB 值的类型
   */
  private getMongoType(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (typeof value === 'object' && '_bsontype' in (value as any)) {
      return (value as any)._bsontype.toLowerCase();
    }
    if (typeof value === 'object') return 'object';
    return typeof value;
  }

  /**
   * 检查是否为写操作
   *
   * MongoDB 写操作包括：insert, update, delete, drop 等
   */
  isWriteOperation(query: string): boolean {
    // 检查 JSON 格式的操作
    if (query.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(query);
        const operation = parsed.operation?.toLowerCase() || '';
        return this.isWriteOperationName(operation);
      } catch {
        return false;
      }
    }

    // 检查 db.collection.operation() 格式
    const match = query.match(/db\.\w+\.(\w+)\(/);
    if (match) {
      const operation = match[1].toLowerCase();
      return this.isWriteOperationName(operation);
    }

    return false;
  }

  /**
   * 检查操作名称是否为写操作
   */
  private isWriteOperationName(operation: string): boolean {
    const writeOperations = [
      'insert', 'insertone', 'insertmany',
      'update', 'updateone', 'updatemany',
      'replace', 'replaceone',
      'delete', 'deleteone', 'deletemany',
      'remove', 'removeone', 'removemany',
      'drop', 'dropcollection', 'dropdatabase',
      'create', 'createcollection', 'createindex',
      'rename', 'renamecollection',
    ];

    return writeOperations.includes(operation);
  }
}
