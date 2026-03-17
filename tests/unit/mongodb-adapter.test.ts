import { describe, it, expect } from 'vitest';
import { MongoDBAdapter } from '../../src/adapters/mongodb.js';

describe('MongoDBAdapter', () => {
  it('should format BSON Long values in nested arrays and objects', () => {
    const adapter = new MongoDBAdapter({
      host: 'localhost',
      port: 27017,
      database: 'test',
    });

    const bsonLongLike = {
      _bsontype: 'Long',
      toString: () => '9223372036854775807',
    };

    const formatted = (adapter as any).formatDocument({
      topLevel: bsonLongLike,
      nested: {
        value: bsonLongLike,
      },
      list: [bsonLongLike, { value: bsonLongLike }, 'ok'],
    });

    expect(formatted).toEqual({
      topLevel: '9223372036854775807',
      nested: {
        value: '9223372036854775807',
      },
      list: ['9223372036854775807', { value: '9223372036854775807' }, 'ok'],
    });
  });
});
