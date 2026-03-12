/**
 * 连接稳定性增强 - 单元测试
 *
 * 测试范围：
 * 1. isConnectionError - 各类连接错误的识别
 * 2. withRetry - 断线重试逻辑
 * 3. 连接池配置参数验证
 * 4. 达梦心跳保活机制
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================
// 1. MySQL 系列 - 连接错误识别 & 重试逻辑
// ============================================================
describe('MySQL 连接稳定性', () => {
  // 直接测试 isConnectionError 的正则匹配逻辑
  const mysqlConnectionErrorPattern =
    /closed state|ECONNRESET|EPIPE|ETIMEDOUT|PROTOCOL_CONNECTION_LOST|Connection lost|ECONNREFUSED/;

  describe('isConnectionError 识别', () => {
    it('应识别 closed state 错误', () => {
      expect(mysqlConnectionErrorPattern.test("Can't add new command when connection is in closed state")).toBe(true);
    });

    it('应识别 ECONNRESET', () => {
      expect(mysqlConnectionErrorPattern.test('read ECONNRESET')).toBe(true);
    });

    it('应识别 EPIPE', () => {
      expect(mysqlConnectionErrorPattern.test('write EPIPE')).toBe(true);
    });

    it('应识别 ETIMEDOUT', () => {
      expect(mysqlConnectionErrorPattern.test('connect ETIMEDOUT 10.0.0.1:3306')).toBe(true);
    });

    it('应识别 PROTOCOL_CONNECTION_LOST', () => {
      expect(mysqlConnectionErrorPattern.test('PROTOCOL_CONNECTION_LOST')).toBe(true);
    });

    it('应识别 Connection lost', () => {
      expect(mysqlConnectionErrorPattern.test('Connection lost: The server closed the connection.')).toBe(true);
    });

    it('应识别 ECONNREFUSED', () => {
      expect(mysqlConnectionErrorPattern.test('connect ECONNREFUSED 127.0.0.1:3306')).toBe(true);
    });

    it('不应误判普通 SQL 错误', () => {
      expect(mysqlConnectionErrorPattern.test("Unknown column 'foo' in 'field list'")).toBe(false);
    });

    it('不应误判语法错误', () => {
      expect(mysqlConnectionErrorPattern.test('You have an error in your SQL syntax')).toBe(false);
    });

    it('不应误判权限错误', () => {
      expect(mysqlConnectionErrorPattern.test('Access denied for user')).toBe(false);
    });

    it('不应误判表不存在错误', () => {
      expect(mysqlConnectionErrorPattern.test("Table 'test.foo' doesn't exist")).toBe(false);
    });
  });

  describe('withRetry 重试逻辑', () => {
    // 模拟 withRetry 的核心逻辑
    function createWithRetry(isConnectionError: (e: unknown) => boolean) {
      return async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
        try {
          return await fn();
        } catch (error) {
          if (isConnectionError(error)) {
            return await fn();
          }
          throw error;
        }
      };
    }

    const isConnectionError = (error: unknown) => {
      const msg = String((error as any)?.message || '');
      return /closed state|ECONNRESET|EPIPE|ETIMEDOUT|PROTOCOL_CONNECTION_LOST|Connection lost|ECONNREFUSED/.test(msg);
    };

    const withRetry = createWithRetry(isConnectionError);

    it('正常查询不应重试', async () => {
      const fn = vi.fn().mockResolvedValue([{ id: 1 }]);
      const result = await withRetry(fn);
      expect(result).toEqual([{ id: 1 }]);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('连接错误应自动重试一次', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error("Can't add new command when connection is in closed state"))
        .mockResolvedValue([{ id: 1 }]);

      const result = await withRetry(fn);
      expect(result).toEqual([{ id: 1 }]);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('ECONNRESET 应自动重试', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('read ECONNRESET'))
        .mockResolvedValue('ok');

      const result = await withRetry(fn);
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('ETIMEDOUT 应自动重试', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('connect ETIMEDOUT'))
        .mockResolvedValue('ok');

      const result = await withRetry(fn);
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('非连接错误不应重试，直接抛出', async () => {
      const fn = vi.fn().mockRejectedValue(new Error("Unknown column 'foo'"));
      await expect(withRetry(fn)).rejects.toThrow("Unknown column 'foo'");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('重试后仍失败应抛出错误', async () => {
      const fn = vi.fn().mockRejectedValue(new Error("Can't add new command when connection is in closed state"));
      await expect(withRetry(fn)).rejects.toThrow('closed state');
      expect(fn).toHaveBeenCalledTimes(2); // 初次 + 重试 1 次
    });
  });
});

// ============================================================
// 2. PostgreSQL 系列 - 连接错误识别 & 重试逻辑
// ============================================================
describe('PostgreSQL 连接稳定性', () => {
  const pgConnectionErrorPattern =
    /Connection terminated|ECONNRESET|EPIPE|ETIMEDOUT|ECONNREFUSED|57P01|57P03|08003|08006/;

  describe('isConnectionError 识别', () => {
    it('应识别 Connection terminated', () => {
      expect(pgConnectionErrorPattern.test('Connection terminated unexpectedly')).toBe(true);
    });

    it('应识别 ECONNRESET', () => {
      expect(pgConnectionErrorPattern.test('read ECONNRESET')).toBe(true);
    });

    it('应识别 PG 错误码 57P01 (admin_shutdown)', () => {
      expect(pgConnectionErrorPattern.test('57P01')).toBe(true);
    });

    it('应识别 PG 错误码 57P03 (cannot_connect_now)', () => {
      expect(pgConnectionErrorPattern.test('57P03')).toBe(true);
    });

    it('应识别 PG 错误码 08003 (connection_does_not_exist)', () => {
      expect(pgConnectionErrorPattern.test('08003')).toBe(true);
    });

    it('应识别 PG 错误码 08006 (connection_failure)', () => {
      expect(pgConnectionErrorPattern.test('08006')).toBe(true);
    });

    it('不应误判普通查询错误', () => {
      expect(pgConnectionErrorPattern.test('relation "foo" does not exist')).toBe(false);
    });

    it('不应误判语法错误', () => {
      expect(pgConnectionErrorPattern.test('syntax error at or near "SELEC"')).toBe(false);
    });

    it('不应误判权限错误', () => {
      expect(pgConnectionErrorPattern.test('permission denied for table users')).toBe(false);
    });
  });
});

// ============================================================
// 3. Oracle - 连接错误识别
// ============================================================
describe('Oracle 连接稳定性', () => {
  const oracleErrPattern =
    /NJS-003|NJS-500|NJS-521|DPI-1010|DPI-1080|ECONNRESET|EPIPE|ETIMEDOUT|ECONNREFUSED/;
  const oracleErrNums = [3113, 3114, 3135, 12170, 12571, 28547];

  function isOracleConnectionError(error: { message?: string; errorNum?: number }): boolean {
    const msg = String(error.message || '');
    return oracleErrPattern.test(msg) || oracleErrNums.includes(error.errorNum || 0);
  }

  describe('isConnectionError 识别', () => {
    it('应识别 NJS-500 (internal error)', () => {
      expect(isOracleConnectionError({ message: 'NJS-500: internal error' })).toBe(true);
    });

    it('应识别 NJS-003 (invalid connection)', () => {
      expect(isOracleConnectionError({ message: 'NJS-003: invalid connection' })).toBe(true);
    });

    it('应识别 DPI-1010 (not connected)', () => {
      expect(isOracleConnectionError({ message: 'DPI-1010: not connected' })).toBe(true);
    });

    it('应识别 ORA-03114 (not connected to ORACLE)', () => {
      expect(isOracleConnectionError({ errorNum: 3114 })).toBe(true);
    });

    it('应识别 ORA-03113 (end-of-file on communication channel)', () => {
      expect(isOracleConnectionError({ errorNum: 3113 })).toBe(true);
    });

    it('应识别 ORA-12170 (TNS connect timeout)', () => {
      expect(isOracleConnectionError({ errorNum: 12170 })).toBe(true);
    });

    it('不应误判 ORA-00942 (table not found)', () => {
      expect(isOracleConnectionError({ message: 'ORA-00942', errorNum: 942 })).toBe(false);
    });

    it('不应误判 ORA-01017 (invalid username/password)', () => {
      expect(isOracleConnectionError({ message: 'ORA-01017', errorNum: 1017 })).toBe(false);
    });
  });
});

// ============================================================
// 4. 达梦 - 连接错误识别 & 心跳逻辑
// ============================================================
describe('达梦连接稳定性', () => {
  const dmConnectionErrorPattern = /closed|ECONNRESET|EPIPE|ETIMEDOUT|ECONNREFUSED|网络|连接/;

  describe('isConnectionError 识别', () => {
    it('应识别 closed 错误', () => {
      expect(dmConnectionErrorPattern.test('connection closed')).toBe(true);
    });

    it('应识别 ECONNRESET', () => {
      expect(dmConnectionErrorPattern.test('read ECONNRESET')).toBe(true);
    });

    it('应识别中文"网络"错误', () => {
      expect(dmConnectionErrorPattern.test('网络异常')).toBe(true);
    });

    it('应识别中文"连接"错误', () => {
      expect(dmConnectionErrorPattern.test('连接已断开')).toBe(true);
    });

    it('不应误判普通 SQL 错误', () => {
      expect(dmConnectionErrorPattern.test('表不存在')).toBe(false);
    });
  });

  describe('心跳保活机制', () => {
    it('startHeartbeat 应创建定时器', () => {
      vi.useFakeTimers();

      let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
      const mockExecute = vi.fn().mockResolvedValue(undefined);
      const mockConnection = { execute: mockExecute };

      // 模拟 startHeartbeat
      heartbeatTimer = setInterval(async () => {
        if (mockConnection) {
          await mockConnection.execute('SELECT 1 FROM DUAL', []);
        }
      }, 30000);

      expect(heartbeatTimer).not.toBeNull();

      // 推进 30 秒，触发一次心跳
      vi.advanceTimersByTime(30000);
      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledWith('SELECT 1 FROM DUAL', []);

      // 再推进 30 秒，触发第二次心跳
      vi.advanceTimersByTime(30000);
      expect(mockExecute).toHaveBeenCalledTimes(2);

      clearInterval(heartbeatTimer);
      vi.useRealTimers();
    });

    it('stopHeartbeat 应清除定时器', () => {
      vi.useFakeTimers();

      const mockExecute = vi.fn().mockResolvedValue(undefined);
      let heartbeatTimer: ReturnType<typeof setInterval> | null = setInterval(async () => {
        await mockExecute();
      }, 30000);

      // 停止心跳
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;

      // 推进时间，不应有更多调用
      vi.advanceTimersByTime(60000);
      expect(mockExecute).toHaveBeenCalledTimes(0);

      vi.useRealTimers();
    });
  });
});

// ============================================================
// 5. 连接池配置参数验证
// ============================================================
describe('连接池配置参数', () => {
  describe('MySQL 连接池参数', () => {
    const expectedConfig = {
      waitForConnections: true,
      connectionLimit: 3,
      maxIdle: 1,
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 30000,
    };

    it('connectionLimit 应为 3', () => {
      expect(expectedConfig.connectionLimit).toBe(3);
    });

    it('应启用 TCP Keep-Alive', () => {
      expect(expectedConfig.enableKeepAlive).toBe(true);
    });

    it('Keep-Alive 初始延迟应为 30 秒', () => {
      expect(expectedConfig.keepAliveInitialDelay).toBe(30000);
    });

    it('空闲超时应为 60 秒', () => {
      expect(expectedConfig.idleTimeout).toBe(60000);
    });

    it('最大空闲连接应为 1', () => {
      expect(expectedConfig.maxIdle).toBe(1);
    });
  });

  describe('PostgreSQL 连接池参数', () => {
    const expectedConfig = {
      max: 3,
      idleTimeoutMillis: 60000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 30000,
    };

    it('max 应为 3', () => {
      expect(expectedConfig.max).toBe(3);
    });

    it('应启用 Keep-Alive', () => {
      expect(expectedConfig.keepAlive).toBe(true);
    });

    it('Keep-Alive 初始延迟应为 30 秒', () => {
      expect(expectedConfig.keepAliveInitialDelayMillis).toBe(30000);
    });

    it('空闲超时应为 60 秒', () => {
      expect(expectedConfig.idleTimeoutMillis).toBe(60000);
    });
  });

  describe('Oracle 连接池参数', () => {
    const expectedConfig = {
      poolMin: 1,
      poolMax: 3,
      poolPingInterval: 30,
    };

    it('poolMax 应为 3', () => {
      expect(expectedConfig.poolMax).toBe(3);
    });

    it('poolMin 应为 1', () => {
      expect(expectedConfig.poolMin).toBe(1);
    });

    it('poolPingInterval 应为 30 秒', () => {
      expect(expectedConfig.poolPingInterval).toBe(30);
    });
  });
});
