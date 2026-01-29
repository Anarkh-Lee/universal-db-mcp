/**
 * MCP 数据库万能连接器 - 主服务器
 * 通过 Model Context Protocol 让 Claude Desktop 连接数据库
 * 
 * 增强功能：
 * - 多数据库配置支持
 * - 连接池管理
 * - 丰富的 MCP 工具
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { DbAdapter, DbConfig } from './types/adapter.js';
import { validateQuery, loadDdlWhitelist } from './utils/safety.js';
import { configService, connectionPool, sshTunnelService } from './services/index.js';

/**
 * 数据库 MCP 服务器类
 */
export class DatabaseMCPServer {
  private server: Server;
  private adapter: DbAdapter | null = null;
  private config: DbConfig;
  private useMultiDatabase: boolean = false;

  constructor(config: DbConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: 'universal-db-mcp',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * 启用多数据库模式
   */
  enableMultiDatabaseMode(): void {
    this.useMultiDatabase = true;
    // 加载 DDL 白名单
    const whitelist = configService.getDdlWhitelist();
    if (whitelist.length > 0) {
      loadDdlWhitelist(whitelist);
    }
  }

  /**
   * 获取当前适配器
   */
  private async getCurrentAdapter(): Promise<DbAdapter> {
    if (this.useMultiDatabase) {
      return connectionPool.getAdapter();
    }

    if (!this.adapter) {
      throw new Error('数据库未连接。请检查配置并重启服务。');
    }
    return this.adapter;
  }

  /**
   * 设置 MCP 协议处理器
   */
  private setupHandlers(): void {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [
        // ========== 查询工具 ==========
        {
          name: 'execute_query',
          description: '执行 SQL 查询或数据库命令。支持 SELECT、JOIN、聚合等查询操作。如果启用了写入模式，也可以执行 INSERT、UPDATE、DELETE 等操作。',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '要执行的 SQL 语句或数据库命令',
              },
              params: {
                type: 'array',
                description: '查询参数（可选，用于参数化查询防止 SQL 注入）',
                items: { type: 'string' },
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_schema',
          description: '获取数据库结构信息。建议在数据库表较多（超过 50 张）时使用 tableNames 参数进行过滤，以避免超时。',
          inputSchema: {
            type: 'object',
            properties: {
              tableNames: {
                type: 'array',
                description: '可选，指定要获取的表名列表（只获取这些表的元数据）。强烈建议在大规模数据库中使用。',
                items: { type: 'string' },
              },
            },
          },
        },
        {
          name: 'get_table_info',
          description: '获取指定表的详细信息，包括列定义、索引、预估行数等。用于深入了解某个表的结构。',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: {
                type: 'string',
                description: '表名',
              },
            },
            required: ['tableName'],
          },
        },
        // ========== 连接管理工具 ==========
        {
          name: 'list_databases',
          description: '列出所有已配置的数据库连接。返回连接名称、类型、描述等信息。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'switch_database',
          description: '切换到指定的数据库连接。需要提供连接名称。',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: '要切换到的数据库连接名称',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'get_current_database',
          description: '获取当前活动的数据库连接信息。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'test_connection',
          description: '测试当前数据库连接是否正常。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'health_check',
          description: '对所有已配置的数据库连接执行健康检查，返回响应时间和连接状态。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        // ========== 查询增强工具 ==========
        {
          name: 'query_single',
          description: '执行查询并返回单条记录。如果查询返回多条记录，只返回第一条。适用于获取单个实体或配置项。',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '要执行的 SQL 查询语句',
              },
              params: {
                type: 'array',
                description: '查询参数（可选）',
                items: { type: 'string' },
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_scalar',
          description: '执行查询并返回标量值（单个值）。适用于 COUNT、SUM、MAX、MIN 等聚合查询，或获取单个字段值。',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '要执行的 SQL 查询语句',
              },
              params: {
                type: 'array',
                description: '查询参数（可选）',
                items: { type: 'string' },
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'batch_execute',
          description: '批量执行多条 SQL 语句。注意：只有在启用写入模式时才能执行写操作。返回每条语句的执行结果和总体统计。',
          inputSchema: {
            type: 'object',
            properties: {
              queries: {
                type: 'array',
                description: '要执行的 SQL 语句数组',
                items: { type: 'string' },
              },
              stopOnError: {
                type: 'boolean',
                description: '遇到错误时是否停止执行后续语句（默认 false）',
              },
            },
            required: ['queries'],
          },
        },
        // ========== 事务管理工具 ==========
        {
          name: 'begin_transaction',
          description: '开始一个新的数据库事务。在提交或回滚之前的所有操作都在事务内执行。仅支持 MySQL 和 PostgreSQL。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'commit_transaction',
          description: '提交当前事务，使所有变更永久生效。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'rollback_transaction',
          description: '回滚当前事务，撤销所有未提交的变更。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },

        // ========== SSH 隧道工具 ==========
        {
          name: 'list_tunnels',
          description: '列出所有活动的 SSH 隧道。显示隧道的本地端口、远程主机和连接名称。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_tunnel_status',
          description: '获取指定连接的 SSH 隧道详情。',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: '数据库连接名称',
              },
            },
            required: ['name'],
          },
        },
      ];

      return { tools };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // ========== 查询工具 ==========
          case 'execute_query': {
            const { query, params } = args as { query: string; params?: unknown[] };
            const adapter = await this.getCurrentAdapter();
            const allowWrite = this.useMultiDatabase
              ? configService.isAllowWrite()
              : (this.config.allowWrite ?? false);

            // 安全检查
            validateQuery(query, allowWrite);

            console.error(`📊 执行查询: ${query.substring(0, 100)}...`);

            const result = await adapter.executeQuery(query, params);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'get_schema': {
            const { tableNames } = args as { tableNames?: string[] };
            console.error(`📋 获取数据库结构${tableNames ? ` (过滤: ${tableNames.length} 张表)` : ' (全量)'}...`);
            const adapter = await this.getCurrentAdapter();
            const schema = await adapter.getSchema(tableNames);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(schema, null, 2),
                },
              ],
            };
          }

          case 'get_table_info': {
            const { tableName } = args as { tableName: string };

            console.error(`📄 获取表信息: ${tableName}`);
            const adapter = await this.getCurrentAdapter();
            // 优化：只获取指定表的 Schema，避免全量查询
            const schema = await adapter.getSchema([tableName]);
            const table = schema.tables.find(t => t.name === tableName);

            if (!table) {
              throw new Error(`表 "${tableName}" 不存在`);
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(table, null, 2),
                },
              ],
            };
          }

          // ========== 连接管理工具 ==========
          case 'list_databases': {
            if (!this.useMultiDatabase) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      mode: 'single-database',
                      message: '当前为单数据库模式，使用 --config 参数启动以支持多数据库',
                      current: {
                        type: this.config.type,
                        host: this.config.host,
                        database: this.config.database,
                      },
                    }, null, 2),
                  },
                ],
              };
            }

            const databases = configService.listDatabases();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    mode: 'multi-database',
                    total: databases.length,
                    databases,
                  }, null, 2),
                },
              ],
            };
          }

          case 'switch_database': {
            const { name: dbName } = args as { name: string };

            if (!this.useMultiDatabase) {
              throw new Error('当前为单数据库模式，不支持切换数据库。请使用 --config 参数启动。');
            }

            const previousName = configService.getCurrentDatabaseName();
            const success = configService.switchDatabase(dbName);

            if (!success) {
              const available = configService.listDatabases().map(d => d.name).join(', ');
              throw new Error(`数据库连接 "${dbName}" 不存在。可用的连接: ${available}`);
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    previousDatabase: previousName,
                    currentDatabase: dbName,
                    message: `已切换到数据库: ${dbName}`,
                  }, null, 2),
                },
              ],
            };
          }

          case 'get_current_database': {
            if (!this.useMultiDatabase) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      mode: 'single-database',
                      type: this.config.type,
                      host: this.config.host,
                      port: this.config.port,
                      database: this.config.database,
                      allowWrite: this.config.allowWrite,
                    }, null, 2),
                  },
                ],
              };
            }

            const current = configService.getCurrentConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    mode: 'multi-database',
                    name: current.name,
                    type: current.type,
                    description: current.description,
                    host: current.host,
                    port: current.port,
                    database: current.database,
                    allowWrite: configService.isAllowWrite(),
                  }, null, 2),
                },
              ],
            };
          }

          case 'test_connection': {
            console.error('🔍 测试数据库连接...');
            const startTime = Date.now();

            try {
              const adapter = await this.getCurrentAdapter();

              // 根据数据库类型执行测试查询
              const dbType = this.useMultiDatabase
                ? configService.getCurrentConnection().type
                : this.config.type;

              let testQuery = 'SELECT 1';
              if (dbType === 'oracle') testQuery = 'SELECT 1 FROM DUAL';
              if (dbType === 'redis') testQuery = 'PING';
              if (dbType === 'mongodb') testQuery = '{"operation": "ping"}';

              await adapter.executeQuery(testQuery);
              const responseTime = Date.now() - startTime;

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      success: true,
                      connected: true,
                      responseTime: `${responseTime}ms`,
                      message: '数据库连接正常',
                    }, null, 2),
                  },
                ],
              };
            } catch (error) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      success: false,
                      connected: false,
                      error: error instanceof Error ? error.message : String(error),
                      message: '数据库连接失败',
                    }, null, 2),
                  },
                ],
                isError: true,
              };
            }
          }

          case 'health_check': {
            if (!this.useMultiDatabase) {
              // 单数据库模式：只检查当前连接
              const startTime = Date.now();
              try {
                const adapter = await this.getCurrentAdapter();
                await adapter.executeQuery('SELECT 1');

                return {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify({
                        mode: 'single-database',
                        results: [{
                          name: 'default',
                          type: this.config.type,
                          connected: true,
                          responseTime: Date.now() - startTime,
                        }],
                      }, null, 2),
                    },
                  ],
                };
              } catch (error) {
                return {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify({
                        mode: 'single-database',
                        results: [{
                          name: 'default',
                          type: this.config.type,
                          connected: false,
                          error: error instanceof Error ? error.message : String(error),
                        }],
                      }, null, 2),
                    },
                  ],
                };
              }
            }

            console.error('🏥 执行健康检查...');
            const results = await connectionPool.healthCheck();

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    mode: 'multi-database',
                    totalDatabases: results.length,
                    healthyCount: results.filter(r => r.connected).length,
                    results: results.map(r => ({
                      ...r,
                      responseTime: r.responseTime ? `${r.responseTime}ms` : undefined,
                    })),
                  }, null, 2),
                },
              ],
            };
          }

          // ========== 查询增强工具 ==========
          case 'query_single': {
            const { query, params } = args as { query: string; params?: unknown[] };
            const adapter = await this.getCurrentAdapter();
            const allowWrite = this.useMultiDatabase
              ? configService.isAllowWrite()
              : (this.config.allowWrite ?? false);

            // 安全检查
            validateQuery(query, allowWrite);

            console.error(`📊 执行单条查询: ${query.substring(0, 100)}...`);

            const result = await adapter.executeQuery(query, params);
            const singleRow = result.rows.length > 0 ? result.rows[0] : null;

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    found: singleRow !== null,
                    data: singleRow,
                    totalRows: result.rows.length,
                    executionTime: result.executionTime,
                  }, null, 2),
                },
              ],
            };
          }

          case 'get_scalar': {
            const { query, params } = args as { query: string; params?: unknown[] };
            const adapter = await this.getCurrentAdapter();
            const allowWrite = this.useMultiDatabase
              ? configService.isAllowWrite()
              : (this.config.allowWrite ?? false);

            // 安全检查
            validateQuery(query, allowWrite);

            console.error(`📊 获取标量值: ${query.substring(0, 100)}...`);

            const result = await adapter.executeQuery(query, params);

            // 获取第一行第一列的值
            let scalarValue: unknown = null;
            if (result.rows.length > 0) {
              const firstRow = result.rows[0];
              const keys = Object.keys(firstRow);
              if (keys.length > 0) {
                scalarValue = firstRow[keys[0]];
              }
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    value: scalarValue,
                    executionTime: result.executionTime,
                  }, null, 2),
                },
              ],
            };
          }

          case 'batch_execute': {
            const { queries, stopOnError = false } = args as {
              queries: string[];
              stopOnError?: boolean;
            };
            const adapter = await this.getCurrentAdapter();
            const allowWrite = this.useMultiDatabase
              ? configService.isAllowWrite()
              : (this.config.allowWrite ?? false);

            console.error(`📊 批量执行 ${queries.length} 条查询...`);

            const results: Array<{
              index: number;
              success: boolean;
              result?: { rows: number; affectedRows?: number };
              error?: string;
              query: string;
            }> = [];
            let totalAffectedRows = 0;
            let successCount = 0;
            let errorCount = 0;
            const startTime = Date.now();

            for (let i = 0; i < queries.length; i++) {
              const query = queries[i];

              try {
                // 安全检查
                validateQuery(query, allowWrite);

                const result = await adapter.executeQuery(query);
                totalAffectedRows += result.affectedRows ?? 0;
                successCount++;

                results.push({
                  index: i,
                  success: true,
                  result: {
                    rows: result.rows.length,
                    affectedRows: result.affectedRows,
                  },
                  query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
                });
              } catch (error) {
                errorCount++;
                const errorMessage = error instanceof Error ? error.message : String(error);

                results.push({
                  index: i,
                  success: false,
                  error: errorMessage,
                  query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
                });

                if (stopOnError) {
                  console.error(`⛔ 批量执行在第 ${i + 1} 条语句处停止`);
                  break;
                }
              }
            }

            const totalTime = Date.now() - startTime;

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    summary: {
                      totalQueries: queries.length,
                      successCount,
                      errorCount,
                      totalAffectedRows,
                      totalExecutionTime: `${totalTime}ms`,
                    },
                    results,
                  }, null, 2),
                },
              ],
            };
          }

          // ========== 事务管理工具 ==========
          case 'begin_transaction': {
            const adapter = await this.getCurrentAdapter();
            const allowWrite = this.useMultiDatabase
              ? configService.isAllowWrite()
              : (this.config.allowWrite ?? false);

            if (!allowWrite) {
              throw new Error('事务操作需要启用写入模式 (--danger-allow-write)');
            }

            if (!adapter.beginTransaction) {
              throw new Error('当前数据库类型不支持事务操作');
            }

            await adapter.beginTransaction();

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: '事务已开始',
                    hint: '请使用 commit_transaction 提交或 rollback_transaction 回滚',
                  }, null, 2),
                },
              ],
            };
          }

          case 'commit_transaction': {
            const adapter = await this.getCurrentAdapter();

            if (!adapter.commit) {
              throw new Error('当前数据库类型不支持事务操作');
            }

            await adapter.commit();

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: '事务已提交',
                  }, null, 2),
                },
              ],
            };
          }

          case 'rollback_transaction': {
            const adapter = await this.getCurrentAdapter();

            if (!adapter.rollback) {
              throw new Error('当前数据库类型不支持事务操作');
            }

            await adapter.rollback();

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: '事务已回滚',
                  }, null, 2),
                },
              ],
            };
          }

          // ========== SSH 隧道工具 ==========
          case 'list_tunnels': {
            const tunnels = sshTunnelService.getTunnels();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    total: tunnels.length,
                    tunnels: tunnels.map(t => ({
                      name: t.name,
                      localPort: t.localPort,
                      remoteHost: t.remoteHost,
                      remotePort: t.remotePort,
                    })),
                  }, null, 2),
                },
              ],
            };
          }

          case 'get_tunnel_status': {
            const { name: connectionName } = args as { name: string };
            const tunnels = sshTunnelService.getTunnels();
            const tunnel = tunnels.find(t => t.name === connectionName);

            if (!tunnel) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      isTunnelActive: false,
                      message: `连接 "${connectionName}" 没有活动的 SSH 隧道`,
                    }, null, 2),
                  },
                ],
              };
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    isTunnelActive: true,
                    name: tunnel.name,
                    localPort: tunnel.localPort,
                    remoteHost: tunnel.remoteHost,
                    remotePort: tunnel.remotePort,
                  }, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`未知工具: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ 错误: ${errorMessage}`);

        return {
          content: [
            {
              type: 'text',
              text: `执行失败: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * 设置数据库适配器（单数据库模式）
   */
  setAdapter(adapter: DbAdapter): void {
    this.adapter = adapter;
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    if (this.useMultiDatabase) {
      // 多数据库模式：预连接默认数据库
      console.error('🔌 正在连接默认数据库...');
      try {
        await connectionPool.getAdapter();
        console.error('✅ 默认数据库连接成功');
      } catch (error) {
        console.error('⚠️ 默认数据库连接失败 (将在首次查询时重试):', error instanceof Error ? error.message : String(error));
      }
    } else {
      // 单数据库模式
      if (!this.adapter) {
        throw new Error('必须先设置数据库适配器才能启动服务器');
      }

      console.error('🔌 正在连接数据库...');
      await this.adapter.connect();
      console.error('✅ 数据库连接成功');
    }

    // 显示安全模式状态
    const allowWrite = this.useMultiDatabase
      ? configService.isAllowWrite()
      : this.config.allowWrite;

    if (allowWrite) {
      console.error('⚠️  警告: 写入模式已启用，请谨慎操作！');
    } else {
      console.error('🛡️  安全模式: 只读模式（推荐）');
    }

    // 启动 MCP 服务器
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('🚀 MCP 服务器已启动，等待 Claude Desktop 连接...');
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    if (this.useMultiDatabase) {
      await connectionPool.closeAll();
    } else if (this.adapter) {
      await this.adapter.disconnect();
      console.error('👋 数据库连接已关闭');
    }
  }
}

