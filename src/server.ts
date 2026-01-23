#!/usr/bin/env node

/**
 * MCP 数据库万能连接器 - 主服务器
 * 通过 Model Context Protocol 让 Claude Desktop 连接数据库
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { DbAdapter, DbConfig } from './types/adapter.js';
import { validateQuery } from './utils/safety.js';

/**
 * 数据库 MCP 服务器类
 */
export class DatabaseMCPServer {
  private server: Server;
  private adapter: DbAdapter | null = null;
  private config: DbConfig;

  constructor(config: DbConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: 'universal-db-mcp',
        version: '0.1.0',
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
   * 设置 MCP 协议处理器
   */
  private setupHandlers(): void {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
                  items: {
                    type: 'string',
                  },
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_schema',
            description: '获取数据库结构信息，包括所有表名、列名、数据类型、主键、索引等元数据。在执行查询前调用此工具可以帮助理解数据库结构。',
            inputSchema: {
              type: 'object',
              properties: {},
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
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // 确保适配器已连接
        if (!this.adapter) {
          throw new Error('数据库未连接。请检查配置并重启服务。');
        }

        switch (name) {
          case 'execute_query': {
            const { query, params } = args as { query: string; params?: unknown[] };

            // 安全检查
            validateQuery(query, this.config.allowWrite ?? false);

            console.error(`📊 执行查询: ${query.substring(0, 100)}...`);

            const result = await this.adapter.executeQuery(query, params);

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
            console.error('📋 获取数据库结构...');

            const schema = await this.adapter.getSchema();

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

            const schema = await this.adapter.getSchema();
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
   * 设置数据库适配器
   */
  setAdapter(adapter: DbAdapter): void {
    this.adapter = adapter;
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    if (!this.adapter) {
      throw new Error('必须先设置数据库适配器才能启动服务器');
    }

    // 连接数据库
    console.error('🔌 正在连接数据库...');
    await this.adapter.connect();
    console.error('✅ 数据库连接成功');

    // 显示安全模式状态
    if (this.config.allowWrite) {
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
    if (this.adapter) {
      await this.adapter.disconnect();
      console.error('👋 数据库连接已关闭');
    }
  }
}
