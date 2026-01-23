/**
 * Redis 数据库适配器
 * 使用 ioredis 驱动实现 DbAdapter 接口
 *
 * 注意：Redis 是 NoSQL 键值存储，没有传统的表结构
 * 本适配器提供基本的键值操作和信息查询功能
 */

import { Redis } from 'ioredis';
import type {
  DbAdapter,
  QueryResult,
  SchemaInfo,
  TableInfo,
  ColumnInfo,
} from '../types/adapter.js';

export class RedisAdapter implements DbAdapter {
  private client: Redis | null = null;
  private config: {
    host: string;
    port: number;
    password?: string;
    database?: string;
  };

  constructor(config: {
    host: string;
    port: number;
    password?: string;
    database?: string;
  }) {
    this.config = config;
  }

  /**
   * 连接到 Redis 数据库
   */
  async connect(): Promise<void> {
    try {
      this.client = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.database ? parseInt(this.config.database) : 0,
        retryStrategy: (times: number) => {
          if (times > 3) {
            return null; // 停止重试
          }
          return Math.min(times * 100, 2000);
        },
      });

      // 测试连接
      await this.client.ping();
    } catch (error) {
      throw new Error(
        `Redis 连接失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * 执行 Redis 命令
   *
   * 支持的命令格式示例：
   * - "GET mykey"
   * - "SET mykey myvalue"
   * - "HGETALL myhash"
   * - "KEYS pattern*"
   */
  async executeQuery(query: string, params?: unknown[]): Promise<QueryResult> {
    if (!this.client) {
      throw new Error('数据库未连接');
    }

    const startTime = Date.now();

    try {
      // 解析命令和参数
      const parts = query.trim().split(/\s+/);
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      // 如果提供了额外参数，追加到参数列表
      if (params && params.length > 0) {
        args.push(...params.map(p => String(p)));
      }

      // 执行 Redis 命令
      const result = await this.client.call(command, ...args);
      const executionTime = Date.now() - startTime;

      // 格式化结果
      const formattedResult = this.formatRedisResult(command, result);

      return {
        rows: formattedResult,
        executionTime,
        metadata: {
          command: command.toUpperCase(),
          rawResult: result,
        },
      };
    } catch (error) {
      throw new Error(
        `Redis 命令执行失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 格式化 Redis 命令结果为统一的行格式
   */
  private formatRedisResult(command: string, result: unknown): Record<string, unknown>[] {
    // 处理 null/undefined
    if (result === null || result === undefined) {
      return [{ result: null }];
    }

    // 处理数组结果（如 KEYS, MGET 等）
    if (Array.isArray(result)) {
      // 如果是 HGETALL 返回的数组，转换为键值对
      if (command === 'hgetall' && result.length % 2 === 0) {
        const obj: Record<string, unknown> = {};
        for (let i = 0; i < result.length; i += 2) {
          obj[result[i]] = result[i + 1];
        }
        return [obj];
      }

      // 其他数组结果，每个元素作为一行
      return result.map((item, index) => ({
        index,
        value: item,
      }));
    }

    // 处理简单值
    return [{ result }];
  }

  /**
   * 获取 Redis 数据库信息
   *
   * Redis 没有传统的表结构，这里返回数据库统计信息
   */
  async getSchema(): Promise<SchemaInfo> {
    if (!this.client) {
      throw new Error('数据库未连接');
    }

    try {
      // 获取 Redis 服务器信息
      const info = await this.client.info();
      const lines = info.split('\r\n');

      let version = 'unknown';

      for (const line of lines) {
        if (line.startsWith('redis_version:')) {
          version = line.split(':')[1];
        }
      }

      // 获取当前数据库编号
      const dbIndex = this.config.database || '0';

      // 获取键的样本（最多 100 个）
      const keys = await this.client.keys('*');
      const sampleKeys = keys.slice(0, 100);

      // 分析键的类型分布
      const typeMap = new Map<string, string[]>();

      for (const key of sampleKeys) {
        const type = await this.client.type(key);
        if (!typeMap.has(type)) {
          typeMap.set(type, []);
        }
        typeMap.get(type)!.push(key);
      }

      // 为每种类型创建一个"虚拟表"
      const tables: TableInfo[] = [];

      // 添加概览表
      tables.push({
        name: '_overview',
        columns: [
          { name: 'metric', type: 'string', nullable: false },
          { name: 'value', type: 'string', nullable: false },
        ],
        primaryKeys: [],
        estimatedRows: 5,
      });

      // 为每种数据类型添加表
      for (const [type, keyList] of typeMap.entries()) {
        const columns: ColumnInfo[] = [
          { name: 'key', type: 'string', nullable: false },
          { name: 'type', type: 'string', nullable: false },
        ];

        // 根据类型添加特定列
        switch (type) {
          case 'string':
            columns.push({ name: 'value', type: 'string', nullable: true });
            break;
          case 'list':
            columns.push({ name: 'length', type: 'number', nullable: false });
            break;
          case 'set':
            columns.push({ name: 'cardinality', type: 'number', nullable: false });
            break;
          case 'zset':
            columns.push({ name: 'cardinality', type: 'number', nullable: false });
            break;
          case 'hash':
            columns.push({ name: 'field_count', type: 'number', nullable: false });
            break;
        }

        tables.push({
          name: `keys_${type}`,
          columns,
          primaryKeys: ['key'],
          estimatedRows: keyList.length,
        });
      }

      return {
        databaseType: 'redis',
        databaseName: `db${dbIndex}`,
        tables,
        version,
      };
    } catch (error) {
      throw new Error(
        `获取 Redis 信息失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 检查是否为写操作
   *
   * Redis 写操作包括：SET, DEL, FLUSHDB, FLUSHALL 等
   */
  isWriteOperation(query: string): boolean {
    const upperQuery = query.trim().toUpperCase();
    const writeCommands = [
      'SET', 'SETEX', 'SETNX', 'MSET', 'MSETNX',
      'DEL', 'UNLINK',
      'FLUSHDB', 'FLUSHALL',
      'LPUSH', 'RPUSH', 'LPOP', 'RPOP', 'LSET', 'LREM',
      'SADD', 'SREM', 'SPOP',
      'ZADD', 'ZREM', 'ZPOPMIN', 'ZPOPMAX',
      'HSET', 'HMSET', 'HDEL',
      'INCR', 'DECR', 'INCRBY', 'DECRBY',
      'APPEND', 'SETRANGE',
      'EXPIRE', 'EXPIREAT', 'PERSIST',
      'RENAME', 'RENAMENX',
    ];

    const command = upperQuery.split(/\s+/)[0];
    return writeCommands.includes(command);
  }
}
