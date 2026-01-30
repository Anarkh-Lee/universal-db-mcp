/**
 * HTTP API Type Definitions
 * Types specific to HTTP API mode
 */

import type { DbConfig } from './adapter.js';

/**
 * HTTP Server Configuration
 */
export interface HttpConfig {
  port: number;
  host: string;
  apiKeys: string[];
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  logging: LoggingConfig;
  session: SessionConfig;
}

/**
 * CORS Configuration
 */
export interface CorsConfig {
  origins: string | string[];
  credentials: boolean;
}

/**
 * Rate Limiting Configuration
 */
export interface RateLimitConfig {
  max: number;
  window: string;
}

/**
 * Logging Configuration
 */
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  pretty: boolean;
}

/**
 * Session Configuration
 */
export interface SessionConfig {
  timeout: number;
  cleanupInterval: number;
}

/**
 * Application Configuration
 */
export interface AppConfig {
  mode: 'mcp' | 'http';
  database?: DbConfig;
  http?: HttpConfig;
}

/**
 * Connect Request
 */
export interface ConnectRequest {
  type: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  filePath?: string;
  authSource?: string;
  allowWrite?: boolean;
  /** Oracle Instant Client 路径（启用 Thick 模式以支持 11g） */
  oracleClientPath?: string;
}

/**
 * Connect Response
 */
export interface ConnectResponse {
  sessionId: string;
  databaseType: string;
  connected: boolean;
}

/**
 * Disconnect Request
 */
export interface DisconnectRequest {
  sessionId: string;
}

/**
 * Disconnect Response
 */
export interface DisconnectResponse {
  disconnected: boolean;
}

/**
 * Query Request
 */
export interface QueryRequest {
  sessionId: string;
  query: string;
  params?: unknown[];
}

/**
 * Execute Request (for write operations)
 */
export interface ExecuteRequest {
  sessionId: string;
  query: string;
  params?: unknown[];
}

/**
 * Tables Request
 */
export interface TablesRequest {
  sessionId: string;
}

/**
 * Tables Response
 */
export interface TablesResponse {
  tables: string[];
}

/**
 * Schema Request
 */
export interface SchemaRequest {
  sessionId: string;
  tableName?: string;
}

/**
 * API Error
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Response Metadata
 */
export interface ResponseMetadata {
  executionTime?: number;
  timestamp: string;
  requestId: string;
}

/**
 * Generic API Response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

/**
 * Health Response
 */
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
}

/**
 * Info Response
 */
export interface InfoResponse {
  name: string;
  version: string;
  mode: string;
  supportedDatabases: string[];
}

/**
 * Session
 */
export interface Session {
  id: string;
  adapter: any;
  config: DbConfig;
  createdAt: Date;
  lastAccessedAt: Date;
}

/**
 * HTTP Query Result (rows as JSON string for Coze compatibility)
 */
export interface HttpQueryResult {
  /** 查询返回的行数据（JSON字符串格式） */
  rows: string;
  /** 受影响的行数（用于 INSERT/UPDATE/DELETE） */
  affectedRows?: number;
  /** 执行时间（毫秒） */
  executionTime?: number;
  /** 额外的元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * Fastify Request with API Key
 */
export interface AuthenticatedRequest {
  apiKey?: string;
}
