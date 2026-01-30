/**
 * Connection Routes
 * Database connection and disconnection endpoints
 */

import type { FastifyInstance } from 'fastify';
import type {
  ConnectRequest,
  ConnectResponse,
  DisconnectRequest,
  DisconnectResponse,
  ApiResponse,
} from '../../types/http.js';
import { ConnectionManager } from '../../core/connection-manager.js';

export async function setupConnectionRoutes(
  fastify: FastifyInstance,
  connectionManager: ConnectionManager
): Promise<void> {
  /**
   * POST /api/connect
   * Connect to a database
   */
  fastify.post<{
    Body: ConnectRequest;
    Reply: ApiResponse<ConnectResponse>;
  }>('/api/connect', {
    schema: {
      body: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { type: 'string' },
          host: { type: 'string' },
          port: { type: 'number' },
          user: { type: 'string' },
          password: { type: 'string' },
          database: { type: 'string' },
          filePath: { type: 'string' },
          authSource: { type: 'string' },
          allowWrite: { type: 'boolean', default: false },
          oracleClientPath: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const config = request.body;

      // Connect to database
      const sessionId = await connectionManager.connect(config as any);

      return {
        success: true,
        data: {
          sessionId,
          databaseType: config.type,
          connected: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: {
          code: 'CONNECTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to connect to database',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      };
    }
  });

  /**
   * POST /api/disconnect
   * Disconnect from a database
   */
  fastify.post<{
    Body: DisconnectRequest;
    Reply: ApiResponse<DisconnectResponse>;
  }>('/api/disconnect', {
    schema: {
      body: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { sessionId } = request.body;

      // Disconnect from database
      await connectionManager.disconnect(sessionId);

      return {
        success: true,
        data: {
          disconnected: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: {
          code: 'DISCONNECTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to disconnect from database',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      };
    }
  });
}
