import { describe, it, expect, vi } from 'vitest';
import { DatabaseService } from '../../src/core/database-service.js';
import type { DbAdapter, DbConfig, QueryResult, SchemaInfo } from '../../src/types/adapter.js';

function createAdapterStub(queryResult: QueryResult, schema?: SchemaInfo): DbAdapter {
  return {
    connect: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    executeQuery: vi.fn(async () => queryResult),
    getSchema: vi.fn(async () => schema ?? {
      databaseType: 'mysql',
      databaseName: 'test',
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'bigint', nullable: false },
            { name: 'metadata', type: 'json', nullable: true },
          ],
          primaryKeys: ['id'],
        },
      ],
    }),
    isWriteOperation: vi.fn(() => false),
  };
}

describe('DatabaseService', () => {
  const config: DbConfig = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
  };

  it('should normalize bigint and BSON Long-like values in executeQuery results', async () => {
    const bsonLongLike = {
      _bsontype: 'Long',
      toString: () => '9223372036854775807',
    };

    const service = new DatabaseService(createAdapterStub({
      rows: [
        {
          id: 9007199254740993n,
          mongoLong: bsonLongLike,
          nested: {
            longValue: bsonLongLike,
            bigintValue: 42n,
          },
          list: [9007199254740995n, bsonLongLike, { deep: 7n }],
        },
      ],
      metadata: {
        insertId: 9007199254740994n,
      },
    }), config);

    const result = await service.executeQuery('SELECT * FROM users');

    expect(result).toEqual({
      rows: [
        {
          id: '9007199254740993',
          mongoLong: '9223372036854775807',
          nested: {
            longValue: '9223372036854775807',
            bigintValue: '42',
          },
          list: ['9007199254740995', '9223372036854775807', { deep: '7' }],
        },
      ],
      metadata: {
        insertId: '9007199254740994',
      },
    });
  });

  it('should normalize enum values before returning', async () => {
    const bsonLongLike = {
      _bsontype: 'Long',
      toString: () => '9223372036854775807',
    };

    const service = new DatabaseService(createAdapterStub({
      rows: [
        { value: bsonLongLike },
        { value: 9007199254740993n },
      ],
    }), config);

    const result = await service.getEnumValues('users', 'id');

    expect(result.values).toEqual(['9223372036854775807', '9007199254740993']);
  });

  it('should normalize sample data before masking', async () => {
    const service = new DatabaseService(createAdapterStub({
      rows: [
        {
          id: -9007199254740993n,
          metadata: {
            longValue: -9007199254740995n,
          },
        },
      ],
    }), config);

    const result = await service.getSampleData('users', ['id', 'metadata']);

    expect(result.rows).toEqual([
      {
        id: '-9007199254740993',
        metadata: {
          longValue: '-9007199254740995',
        },
      },
    ]);
  });
});
