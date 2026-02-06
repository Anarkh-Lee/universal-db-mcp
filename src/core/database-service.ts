/**
 * Database Service
 * Core business logic for database operations
 * Shared between MCP and HTTP modes
 */

import type { DbAdapter, DbConfig, QueryResult, SchemaInfo, TableInfo } from '../types/adapter.js';
import { validateQuery } from '../utils/safety.js';
import { SchemaEnhancer, SchemaEnhancerConfig } from '../utils/schema-enhancer.js';

/**
 * Schema 缓存配置
 */
export interface SchemaCacheConfig {
  /** 缓存过期时间（毫秒），默认 5 分钟 */
  ttl: number;
  /** 是否启用缓存，默认 true */
  enabled: boolean;
}

/**
 * Schema 增强配置（导出供外部使用）
 */
export type { SchemaEnhancerConfig };

/**
 * Schema 缓存统计信息
 */
export interface SchemaCacheStats {
  /** 缓存是否有效 */
  isCached: boolean;
  /** 缓存时间 */
  cachedAt: Date | null;
  /** 缓存过期时间 */
  expiresAt: Date | null;
  /** 缓存命中次数 */
  hitCount: number;
  /** 缓存未命中次数 */
  missCount: number;
}

/**
 * 默认缓存配置
 */
const DEFAULT_CACHE_CONFIG: SchemaCacheConfig = {
  ttl: 5 * 60 * 1000, // 5 分钟
  enabled: true,
};

/**
 * Database Service Class
 * Encapsulates all database operations with validation and error handling
 */
export class DatabaseService {
  private adapter: DbAdapter;
  private config: DbConfig;

  // Schema 缓存相关
  private schemaCache: SchemaInfo | null = null;
  private schemaCacheTime: number = 0;
  private cacheConfig: SchemaCacheConfig;
  private cacheHitCount: number = 0;
  private cacheMissCount: number = 0;

  // Schema 增强器
  private schemaEnhancer: SchemaEnhancer;

  constructor(
    adapter: DbAdapter,
    config: DbConfig,
    cacheConfig?: Partial<SchemaCacheConfig>,
    enhancerConfig?: Partial<SchemaEnhancerConfig>
  ) {
    this.adapter = adapter;
    this.config = config;
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...cacheConfig };
    this.schemaEnhancer = new SchemaEnhancer(enhancerConfig);
  }

  /**
   * Execute a query with validation
   */
  async executeQuery(query: string, params?: unknown[]): Promise<QueryResult> {
    // Validate query safety
    this.validateQuery(query);

    // Execute query
    const result = await this.adapter.executeQuery(query, params);

    return result;
  }

  /**
   * Get complete database schema
   * @param forceRefresh - 是否强制刷新缓存，忽略现有缓存
   */
  async getSchema(forceRefresh: boolean = false): Promise<SchemaInfo> {
    const now = Date.now();

    // 检查是否可以使用缓存
    if (
      !forceRefresh &&
      this.cacheConfig.enabled &&
      this.schemaCache &&
      (now - this.schemaCacheTime) < this.cacheConfig.ttl
    ) {
      this.cacheHitCount++;
      console.error(`📦 Schema 缓存命中 (命中率: ${this.getCacheHitRate()}%)`);
      return this.schemaCache;
    }

    // 缓存未命中或已过期，重新获取
    this.cacheMissCount++;
    console.error(`🔄 正在获取数据库 Schema${forceRefresh ? ' (强制刷新)' : this.schemaCache ? ' (缓存已过期)' : ' (首次加载)'}...`);

    const startTime = Date.now();
    const schema = await this.adapter.getSchema();
    const elapsed = Date.now() - startTime;

    // 增强 Schema 信息（隐式关系推断、关系类型细化）
    const enhancedSchema = this.enhanceSchema(schema);

    // 更新缓存
    if (this.cacheConfig.enabled) {
      this.schemaCache = enhancedSchema;
      this.schemaCacheTime = now;

      // 统计增强信息
      const explicitRelCount = schema.relationships?.length || 0;
      const totalRelCount = enhancedSchema.relationships?.length || 0;
      const inferredRelCount = totalRelCount - explicitRelCount;

      console.error(`✅ Schema 已缓存 (获取耗时: ${elapsed}ms, 表数量: ${enhancedSchema.tables.length}, 显式关系: ${explicitRelCount}, 推断关系: ${inferredRelCount}, 缓存有效期: ${this.cacheConfig.ttl / 1000}秒)`);
    }

    return enhancedSchema;
  }

  /**
   * 增强 Schema 信息
   * - 为现有外键关系添加 source 标记
   * - 推断隐式关系
   * - 细化关系类型
   */
  private enhanceSchema(schema: SchemaInfo): SchemaInfo {
    // 对于 NoSQL 数据库（Redis、MongoDB），不进行关系增强
    if (schema.databaseType === 'redis' || schema.databaseType === 'mongodb') {
      return schema;
    }

    // 增强关系信息
    const existingRelationships = schema.relationships || [];
    const enhancedRelationships = this.schemaEnhancer.enhanceRelationships(
      schema.tables,
      existingRelationships
    );

    return {
      ...schema,
      relationships: enhancedRelationships.length > 0 ? enhancedRelationships : undefined,
    };
  }

  /**
   * Get information about a specific table
   * @param tableName - 表名
   * @param forceRefresh - 是否强制刷新缓存
   */
  async getTableInfo(tableName: string, forceRefresh: boolean = false): Promise<TableInfo> {
    const schema = await this.getSchema(forceRefresh);

    // 支持大小写不敏感的表名匹配
    const table = schema.tables.find(t =>
      t.name === tableName ||
      t.name.toLowerCase() === tableName.toLowerCase()
    );

    if (!table) {
      throw new Error(`表 "${tableName}" 不存在`);
    }

    return table;
  }

  /**
   * List all tables in the database
   * @param forceRefresh - 是否强制刷新缓存
   */
  async listTables(forceRefresh: boolean = false): Promise<string[]> {
    const schema = await this.getSchema(forceRefresh);
    return schema.tables.map(t => t.name);
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try a simple query to test connection
      await this.adapter.executeQuery('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清除 Schema 缓存
   */
  clearSchemaCache(): void {
    this.schemaCache = null;
    this.schemaCacheTime = 0;
    console.error('🗑️ Schema 缓存已清除');
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): SchemaCacheStats {
    const now = Date.now();
    const isCached = this.schemaCache !== null && (now - this.schemaCacheTime) < this.cacheConfig.ttl;

    return {
      isCached,
      cachedAt: this.schemaCacheTime > 0 ? new Date(this.schemaCacheTime) : null,
      expiresAt: this.schemaCacheTime > 0 ? new Date(this.schemaCacheTime + this.cacheConfig.ttl) : null,
      hitCount: this.cacheHitCount,
      missCount: this.cacheMissCount,
    };
  }

  /**
   * 获取缓存命中率
   */
  getCacheHitRate(): string {
    const total = this.cacheHitCount + this.cacheMissCount;
    if (total === 0) return '0.00';
    return ((this.cacheHitCount / total) * 100).toFixed(2);
  }

  /**
   * 更新缓存配置
   */
  updateCacheConfig(config: Partial<SchemaCacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
    console.error(`⚙️ 缓存配置已更新: TTL=${this.cacheConfig.ttl}ms, 启用=${this.cacheConfig.enabled}`);
  }

  /**
   * 更新 Schema 增强配置
   */
  updateEnhancerConfig(config: Partial<SchemaEnhancerConfig>): void {
    this.schemaEnhancer.updateConfig(config);
    // 清除缓存以便下次获取时应用新配置
    this.clearSchemaCache();
    console.error(`⚙️ Schema 增强配置已更新`);
  }

  /**
   * 获取 Schema 增强配置
   */
  getEnhancerConfig(): SchemaEnhancerConfig {
    return this.schemaEnhancer.getConfig();
  }

  /**
   * Validate query against write permissions
   */
  private validateQuery(query: string): void {
    validateQuery(query, this.config.allowWrite ?? false);
  }

  /**
   * Get the underlying adapter
   */
  getAdapter(): DbAdapter {
    return this.adapter;
  }

  /**
   * Get the configuration
   */
  getConfig(): DbConfig {
    return this.config;
  }
}
