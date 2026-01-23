#!/usr/bin/env node

/**
 * 测试脚本 - 验证各个适配器的基本功能
 * 注意：此脚本仅用于开发测试，不会包含在最终发布中
 */

import { MySQLAdapter } from './adapters/mysql.js';
import { PostgreSQLAdapter } from './adapters/postgres.js';
import { RedisAdapter } from './adapters/redis.js';

async function testMySQL() {
  console.log('\n=== 测试 MySQL 适配器 ===\n');

  const adapter = new MySQLAdapter({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'test',
  });

  try {
    console.log('1. 连接数据库...');
    await adapter.connect();
    console.log('✅ 连接成功');

    console.log('\n2. 获取数据库结构...');
    const schema = await adapter.getSchema();
    console.log(`✅ 数据库: ${schema.databaseName}`);
    console.log(`✅ 版本: ${schema.version}`);
    console.log(`✅ 表数量: ${schema.tables.length}`);

    if (schema.tables.length > 0) {
      console.log(`\n3. 查看第一个表: ${schema.tables[0].name}`);
      console.log(`   列数: ${schema.tables[0].columns.length}`);
      console.log(`   主键: ${schema.tables[0].primaryKeys.join(', ')}`);
    }

    console.log('\n4. 执行简单查询...');
    const result = await adapter.executeQuery('SELECT 1 as test');
    console.log(`✅ 查询成功，返回 ${result.rows.length} 行`);
    console.log(`   执行时间: ${result.executionTime}ms`);

    console.log('\n5. 测试写操作检测...');
    console.log(`   SELECT 是写操作? ${adapter.isWriteOperation('SELECT * FROM users')}`);
    console.log(`   DELETE 是写操作? ${adapter.isWriteOperation('DELETE FROM users')}`);

    await adapter.disconnect();
    console.log('\n✅ MySQL 测试完成');
  } catch (error) {
    console.error('❌ MySQL 测试失败:', error instanceof Error ? error.message : String(error));
  }
}

async function testPostgreSQL() {
  console.log('\n=== 测试 PostgreSQL 适配器 ===\n');

  const adapter = new PostgreSQLAdapter({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'test',
  });

  try {
    console.log('1. 连接数据库...');
    await adapter.connect();
    console.log('✅ 连接成功');

    console.log('\n2. 获取数据库结构...');
    const schema = await adapter.getSchema();
    console.log(`✅ 数据库: ${schema.databaseName}`);
    console.log(`✅ 版本: ${schema.version}`);
    console.log(`✅ 表数量: ${schema.tables.length}`);

    console.log('\n3. 执行简单查询...');
    const result = await adapter.executeQuery('SELECT 1 as test');
    console.log(`✅ 查询成功，返回 ${result.rows.length} 行`);
    console.log(`   执行时间: ${result.executionTime}ms`);

    await adapter.disconnect();
    console.log('\n✅ PostgreSQL 测试完成');
  } catch (error) {
    console.error('❌ PostgreSQL 测试失败:', error instanceof Error ? error.message : String(error));
  }
}

async function testRedis() {
  console.log('\n=== 测试 Redis 适配器 ===\n');

  const adapter = new RedisAdapter({
    host: 'localhost',
    port: 6379,
  });

  try {
    console.log('1. 连接数据库...');
    await adapter.connect();
    console.log('✅ 连接成功');

    console.log('\n2. 获取数据库信息...');
    const schema = await adapter.getSchema();
    console.log(`✅ 数据库: ${schema.databaseName}`);
    console.log(`✅ 版本: ${schema.version}`);
    console.log(`✅ 键类型数量: ${schema.tables.length}`);

    console.log('\n3. 执行 PING 命令...');
    const result = await adapter.executeQuery('PING');
    console.log(`✅ 命令成功，结果:`, result.rows);

    console.log('\n4. 测试写操作检测...');
    console.log(`   GET 是写操作? ${adapter.isWriteOperation('GET mykey')}`);
    console.log(`   SET 是写操作? ${adapter.isWriteOperation('SET mykey value')}`);
    console.log(`   DEL 是写操作? ${adapter.isWriteOperation('DEL mykey')}`);

    await adapter.disconnect();
    console.log('\n✅ Redis 测试完成');
  } catch (error) {
    console.error('❌ Redis 测试失败:', error instanceof Error ? error.message : String(error));
  }
}

// 主函数
async function main() {
  console.log('🧪 MCP 数据库万能连接器 - 适配器测试\n');
  console.log('注意：此测试需要本地运行相应的数据库服务\n');

  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('mysql')) {
    await testMySQL();
  }

  if (args.length === 0 || args.includes('postgres')) {
    await testPostgreSQL();
  }

  if (args.length === 0 || args.includes('redis')) {
    await testRedis();
  }

  console.log('\n✅ 所有测试完成\n');
}

main().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
