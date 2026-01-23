#!/usr/bin/env node

/**
 * MCP 数据库万能连接器 - 入口文件
 */

import { Command } from 'commander';
import { DatabaseMCPServer } from './server.js';
import type { DbAdapter, DbConfig } from './types/adapter.js';
import { MySQLAdapter } from './adapters/mysql.js';
import { PostgreSQLAdapter } from './adapters/postgres.js';
import { RedisAdapter } from './adapters/redis.js';

const program = new Command();

program
  .name('universal-db-mcp')
  .description('MCP 数据库万能连接器 - 让 Claude Desktop 直接连接你的数据库')
  .version('0.1.0')
  .requiredOption('--type <type>', '数据库类型 (mysql|postgres|redis)')
  .requiredOption('--host <host>', '数据库主机地址')
  .requiredOption('--port <port>', '数据库端口', parseInt)
  .option('--user <user>', '用户名')
  .option('--password <password>', '密码')
  .option('--database <database>', '数据库名称')
  .option('--danger-allow-write', '启用写入模式（危险！默认为只读模式）', false)
  .action(async (options) => {
    try {
      // 验证数据库类型
      if (!['mysql', 'postgres', 'redis'].includes(options.type)) {
        console.error('❌ 错误: 不支持的数据库类型。支持的类型: mysql, postgres, redis');
        process.exit(1);
      }

      // 构建配置
      const config: DbConfig = {
        type: options.type as 'mysql' | 'postgres' | 'redis',
        host: options.host,
        port: options.port,
        user: options.user,
        password: options.password,
        database: options.database,
        allowWrite: options.dangerAllowWrite,
      };

      console.error('🔧 配置信息:');
      console.error(`   数据库类型: ${config.type}`);
      console.error(`   主机地址: ${config.host}:${config.port}`);
      console.error(`   数据库名: ${config.database || '(默认)'}`);
      console.error(`   安全模式: ${config.allowWrite ? '❌ 写入已启用' : '✅ 只读模式'}`);
      console.error('');

      // 创建服务器
      const server = new DatabaseMCPServer(config);

      // 根据数据库类型创建适配器
      let adapter: DbAdapter;

      switch (config.type) {
        case 'mysql':
          adapter = new MySQLAdapter({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
          });
          break;

        case 'postgres':
          adapter = new PostgreSQLAdapter({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
          });
          break;

        case 'redis':
          adapter = new RedisAdapter({
            host: config.host,
            port: config.port,
            password: config.password,
            database: config.database,
          });
          break;

        default:
          throw new Error(`不支持的数据库类型: ${config.type}`);
      }

      // 设置适配器并启动服务器
      server.setAdapter(adapter);
      await server.start();

      // 优雅退出处理
      process.on('SIGINT', async () => {
        console.error('\n⏹️  收到退出信号，正在关闭服务器...');
        await server.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        console.error('\n⏹️  收到终止信号，正在关闭服务器...');
        await server.stop();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ 启动失败:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
