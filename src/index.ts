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
import { OracleAdapter } from './adapters/oracle.js';
import { DMAdapter } from './adapters/dm.js';
import { SQLServerAdapter } from './adapters/sqlserver.js';
import { MongoDBAdapter } from './adapters/mongodb.js';
import { SQLiteAdapter } from './adapters/sqlite.js';
import { KingbaseAdapter } from './adapters/kingbase.js';

const program = new Command();

program
  .name('universal-db-mcp')
  .description('MCP 数据库万能连接器 - 让 Claude Desktop 直接连接你的数据库')
  .version('0.1.0')
  .requiredOption('--type <type>', '数据库类型 (mysql|postgres|redis|oracle|dm|sqlserver|mssql|mongodb|sqlite|kingbase)')
  .option('--host <host>', '数据库主机地址')
  .option('--port <port>', '数据库端口', parseInt)
  .option('--user <user>', '用户名')
  .option('--password <password>', '密码')
  .option('--database <database>', '数据库名称')
  .option('--file <file>', 'SQLite 数据库文件路径')
  .option('--auth-source <authSource>', 'MongoDB 认证数据库（默认为 admin）')
  .option('--danger-allow-write', '启用写入模式（危险！默认为只读模式）', false)
  .action(async (options) => {
    try {
      // 验证数据库类型
      if (!['mysql', 'postgres', 'redis', 'oracle', 'dm', 'sqlserver', 'mssql', 'mongodb', 'sqlite', 'kingbase'].includes(options.type)) {
        console.error('❌ 错误: 不支持的数据库类型。支持的类型: mysql, postgres, redis, oracle, dm, sqlserver (或 mssql), mongodb, sqlite, kingbase');
        process.exit(1);
      }

      // 规范化 SQL Server 别名
      let dbType = options.type;
      if (dbType === 'mssql') {
        dbType = 'sqlserver';
      }

      // SQLite 特殊处理：需要文件路径而不是 host/port
      if (dbType === 'sqlite') {
        if (!options.file) {
          console.error('❌ 错误: SQLite 数据库需要指定 --file 参数');
          process.exit(1);
        }
      } else {
        // 其他数据库需要 host 和 port
        if (!options.host || !options.port) {
          console.error('❌ 错误: 需要指定 --host 和 --port 参数');
          process.exit(1);
        }
      }

      // 构建配置
      const config: DbConfig = {
        type: dbType as 'mysql' | 'postgres' | 'redis' | 'oracle' | 'dm' | 'sqlserver' | 'mongodb' | 'sqlite' | 'kingbase',
        host: options.host,
        port: options.port,
        user: options.user,
        password: options.password,
        database: options.database,
        filePath: options.file,
        allowWrite: options.dangerAllowWrite,
      };

      console.error('🔧 配置信息:');
      console.error(`   数据库类型: ${config.type}`);
      if (config.type === 'sqlite') {
        console.error(`   数据库文件: ${config.filePath}`);
      } else {
        console.error(`   主机地址: ${config.host}:${config.port}`);
        console.error(`   数据库名: ${config.database || '(默认)'}`);
      }
      console.error(`   安全模式: ${config.allowWrite ? '❌ 写入已启用' : '✅ 只读模式'}`);
      console.error('');

      // 创建服务器
      const server = new DatabaseMCPServer(config);

      // 根据数据库类型创建适配器
      let adapter: DbAdapter;

      switch (config.type) {
        case 'mysql':
          adapter = new MySQLAdapter({
            host: config.host!,
            port: config.port!,
            user: config.user,
            password: config.password,
            database: config.database,
          });
          break;

        case 'postgres':
          adapter = new PostgreSQLAdapter({
            host: config.host!,
            port: config.port!,
            user: config.user,
            password: config.password,
            database: config.database,
          });
          break;

        case 'redis':
          adapter = new RedisAdapter({
            host: config.host!,
            port: config.port!,
            password: config.password,
            database: config.database,
          });
          break;

        case 'oracle':
          adapter = new OracleAdapter({
            host: config.host!,
            port: config.port!,
            user: config.user,
            password: config.password,
            database: config.database,
          });
          break;

        case 'dm':
          adapter = new DMAdapter({
            host: config.host!,
            port: config.port!,
            user: config.user,
            password: config.password,
            database: config.database,
          });
          break;

        case 'sqlserver':
          adapter = new SQLServerAdapter({
            host: config.host!,
            port: config.port!,
            user: config.user,
            password: config.password,
            database: config.database,
          });
          break;

        case 'mongodb':
          adapter = new MongoDBAdapter({
            host: config.host!,
            port: config.port!,
            user: config.user,
            password: config.password,
            database: config.database,
            authSource: options.authSource,
          });
          break;

        case 'sqlite':
          adapter = new SQLiteAdapter({
            filePath: config.filePath!,
            readonly: !config.allowWrite,
          });
          break;

        case 'kingbase':
          adapter = new KingbaseAdapter({
            host: config.host!,
            port: config.port!,
            user: config.user,
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
