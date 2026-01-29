/**
 * 连接池服务 - 管理数据库适配器的创建和复用
 * 借鉴 DatabaseMcpServer 的 SqlSugarScope 设计
 */

import type { DbAdapter } from '../types/adapter.js';
import { configService, type DatabaseConnection } from './config-service.js';
import { sshTunnelService } from './ssh-tunnel.js';
import { MySQLAdapter } from '../adapters/mysql.js';
import { PostgreSQLAdapter } from '../adapters/postgres.js';
import { RedisAdapter } from '../adapters/redis.js';
import { OracleAdapter } from '../adapters/oracle.js';
import { DMAdapter } from '../adapters/dm.js';
import { SQLServerAdapter } from '../adapters/sqlserver.js';
import { MongoDBAdapter } from '../adapters/mongodb.js';
import { SQLiteAdapter } from '../adapters/sqlite.js';
import { KingbaseAdapter } from '../adapters/kingbase.js';
import { GaussDBAdapter } from '../adapters/gaussdb.js';
import { OceanBaseAdapter } from '../adapters/oceanbase.js';
import { TiDBAdapter } from '../adapters/tidb.js';
import { ClickHouseAdapter } from '../adapters/clickhouse.js';
import { PolarDBAdapter } from '../adapters/polardb.js';
import { GoldenDBAdapter } from '../adapters/goldendb.js';
import { HighGoAdapter } from '../adapters/highgo.js';
import { VastbaseAdapter } from '../adapters/vastbase.js';

/**
 * 健康状态接口
 */
export interface HealthStatus {
    /** 连接名称 */
    name: string;
    /** 数据库类型 */
    type: string;
    /** 是否已连接 */
    connected: boolean;
    /** 响应时间（毫秒） */
    responseTime: number;
    /** 最后检查时间 */
    lastChecked: Date;
    /** 错误信息（如果有） */
    error?: string;
}

/**
 * 连接池服务类
 * 管理数据库适配器的生命周期，支持复用和健康检查
 */
export class ConnectionPoolService {
    private pools: Map<string, DbAdapter> = new Map();
    private connecting: Map<string, Promise<DbAdapter>> = new Map();

    /**
     * 获取或创建数据库适配器
     * 使用连接池复用已创建的适配器
     * @param connectionName 连接名称（可选，默认使用当前活动连接）
     * @returns 数据库适配器实例
     */
    async getAdapter(connectionName?: string): Promise<DbAdapter> {
        const name = connectionName ?? configService.getCurrentDatabaseName();

        if (!name) {
            throw new Error('未配置任何数据库连接');
        }

        // 检查是否已有可用的适配器
        const existing = this.pools.get(name);
        if (existing) {
            console.error(`🔄 复用连接池中的适配器: ${name}`);
            return existing;
        }

        // 检查是否正在创建中（避免并发创建）
        const connecting = this.connecting.get(name);
        if (connecting) {
            console.error(`⏳ 等待连接创建完成: ${name}`);
            return connecting;
        }

        // 创建新的适配器
        const createPromise = this.createAndConnect(name);
        this.connecting.set(name, createPromise);

        try {
            const adapter = await createPromise;
            this.pools.set(name, adapter);
            console.error(`✅ 适配器已创建并加入连接池: ${name}`);
            return adapter;
        } finally {
            this.connecting.delete(name);
        }
    }

    /**
     * 创建并连接适配器
     */
    private async createAndConnect(connectionName: string): Promise<DbAdapter> {
        const connection = configService.getConnection(connectionName);
        let adapterConfig = connection;

        // 如果启用了 SSH 隧道，先建立隧道
        if (connection.ssh && connection.ssh.enabled) {
            try {
                console.error(`🔒 正在建立 SSH 隧道: ${connectionName} -> ${connection.ssh.host}`);
                const localPort = await sshTunnelService.createTunnel(
                    connectionName,
                    connection.ssh,
                    connection.host || 'localhost',
                    connection.port || 3306 // 使用默认端口作为后备
                );

                // 创建一个使用本地端口的配置副本
                adapterConfig = {
                    ...connection,
                    host: '127.0.0.1',
                    port: localPort,
                };
                console.error(`✅ SSH 隧道已建立，本地端口: ${localPort}`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new Error(`SSH 隧道建立失败: ${errorMessage}`);
            }
        }

        const adapter = this.createAdapter(adapterConfig);

        console.error(`🔌 正在连接数据库: ${connectionName} (${connection.type})`);
        try {
            await adapter.connect();
            console.error(`✅ 数据库连接成功: ${connectionName}`);
            return adapter;
        } catch (error) {
            // 如果数据库连接失败，且使用了 SSH，清理隧道
            if (connection.ssh && connection.ssh.enabled) {
                await sshTunnelService.closeTunnel(connectionName);
            }
            throw error;
        }
    }

    /**
     * 根据连接配置创建适配器实例
     */
    private createAdapter(connection: DatabaseConnection): DbAdapter {
        const allowWrite = configService.isAllowWrite();

        switch (connection.type) {
            case 'mysql':
                return new MySQLAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'postgres':
                return new PostgreSQLAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'redis':
                return new RedisAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    password: connection.password,
                    database: connection.database,
                });

            case 'oracle':
                return new OracleAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'dm':
                return new DMAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'sqlserver':
                return new SQLServerAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'mongodb':
                return new MongoDBAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                    authSource: connection.authSource,
                });

            case 'sqlite':
                return new SQLiteAdapter({
                    filePath: connection.filePath!,
                    readonly: !allowWrite,
                });

            case 'kingbase':
                return new KingbaseAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'gaussdb':
                return new GaussDBAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'oceanbase':
                return new OceanBaseAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'tidb':
                return new TiDBAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'clickhouse':
                return new ClickHouseAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'polardb':
                return new PolarDBAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'goldendb':
                return new GoldenDBAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'highgo':
                return new HighGoAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            case 'vastbase':
                return new VastbaseAdapter({
                    host: connection.host!,
                    port: connection.port!,
                    user: connection.user,
                    password: connection.password,
                    database: connection.database,
                });

            default:
                throw new Error(`不支持的数据库类型: ${connection.type}`);
        }
    }

    /**
     * 关闭指定连接
     * @param connectionName 连接名称
     */
    async closeConnection(connectionName: string): Promise<void> {
        const adapter = this.pools.get(connectionName);
        if (adapter) {
            await adapter.disconnect();
            this.pools.delete(connectionName);

            // 关闭关联的 SSH 隧道（如果有）
            await sshTunnelService.closeTunnel(connectionName);

            console.error(`👋 已关闭连接: ${connectionName}`);
        }
    }

    /**
     * 关闭所有连接
     */
    async closeAll(): Promise<void> {
        console.error(`🔒 正在关闭所有数据库连接 (${this.pools.size} 个)...`);

        const closePromises = Array.from(this.pools.entries()).map(async ([name, adapter]) => {
            try {
                await adapter.disconnect();
                console.error(`  ✅ 已关闭: ${name}`);
            } catch (error) {
                console.error(`  ❌ 关闭失败: ${name}`, error);
            }
        });

        await Promise.all(closePromises);
        this.pools.clear();
        console.error('👋 所有连接已关闭');
    }

    /**
     * 对所有已连接的数据库执行健康检查
     * @returns 健康状态列表
     */
    async healthCheck(): Promise<HealthStatus[]> {
        const results: HealthStatus[] = [];
        const databases = configService.listDatabases();

        for (const db of databases) {
            const status: HealthStatus = {
                name: db.name,
                type: db.type,
                connected: false,
                responseTime: 0,
                lastChecked: new Date(),
            };

            try {
                const startTime = Date.now();

                // 获取或创建适配器
                const adapter = await this.getAdapter(db.name);

                // 执行简单查询测试连接
                await this.testConnection(adapter, db.type);

                status.connected = true;
                status.responseTime = Date.now() - startTime;
            } catch (error) {
                status.connected = false;
                status.error = error instanceof Error ? error.message : String(error);
            }

            results.push(status);
        }

        return results;
    }

    /**
     * 测试单个连接
     */
    private async testConnection(adapter: DbAdapter, dbType: string): Promise<void> {
        // 根据数据库类型选择测试查询
        let testQuery: string;

        switch (dbType) {
            case 'redis':
                testQuery = 'PING';
                break;
            case 'mongodb':
                testQuery = '{"operation": "ping"}';
                break;
            case 'oracle':
                testQuery = 'SELECT 1 FROM DUAL';
                break;
            default:
                testQuery = 'SELECT 1';
        }

        await adapter.executeQuery(testQuery);
    }

    /**
     * 带重试的连接测试
     * @param connectionName 连接名称
     * @param maxRetries 最大重试次数
     * @param baseDelayMs 基础延迟毫秒数
     * @returns 健康状态
     */
    async testConnectionWithRetry(
        connectionName: string,
        maxRetries: number = 3,
        baseDelayMs: number = 1000
    ): Promise<HealthStatus> {
        const db = configService.getConnection(connectionName);
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const status: HealthStatus = {
                name: connectionName,
                type: db.type,
                connected: false,
                responseTime: 0,
                lastChecked: new Date(),
            };

            try {
                const startTime = Date.now();

                // 强制重新创建连接
                await this.closeConnection(connectionName);
                const adapter = await this.getAdapter(connectionName);
                await this.testConnection(adapter, db.type);

                status.connected = true;
                status.responseTime = Date.now() - startTime;

                console.error(`✅ 连接测试成功: ${connectionName} (尝试 ${attempt + 1}/${maxRetries})`);
                return status;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`⚠️ 连接测试失败: ${connectionName} (尝试 ${attempt + 1}/${maxRetries}): ${lastError.message}`);

                // 指数退避
                if (attempt < maxRetries - 1) {
                    const delay = baseDelayMs * Math.pow(2, attempt);
                    console.error(`  ⏳ ${delay}ms 后重试...`);
                    await this.sleep(delay);
                }
            }
        }

        return {
            name: connectionName,
            type: db.type,
            connected: false,
            responseTime: 0,
            lastChecked: new Date(),
            error: lastError?.message ?? '连接失败',
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取连接池状态
     */
    getPoolStatus(): { name: string; connected: boolean }[] {
        return Array.from(this.pools.entries()).map(([name]) => ({
            name,
            connected: true,
        }));
    }
}

// 导出单例
export const connectionPool = new ConnectionPoolService();
