/**
 * 安全检查工具
 * 用于防止误操作删库等危险行为
 */

/**
 * 危险的 SQL 关键字列表
 * 这些操作会修改或删除数据
 */
const DANGEROUS_KEYWORDS = [
  'DELETE',
  'DROP',
  'TRUNCATE',
  'UPDATE',
  'INSERT',
  'ALTER',
  'CREATE',
  'RENAME',
  'REPLACE',
] as const;

/**
 * 检查 SQL 语句是否包含写操作
 * @param query - 待检查的 SQL 语句
 * @returns 如果包含写操作返回 true
 */
export function isWriteOperation(query: string): boolean {
  const upperQuery = query.trim().toUpperCase();

  return DANGEROUS_KEYWORDS.some(keyword => {
    // 检查是否以该关键字开头（忽略前导空格和注释）
    const pattern = new RegExp(`^(\\s|--.*|/\\*.*?\\*/)*${keyword}\\b`, 'i');
    return pattern.test(upperQuery);
  });
}

/**
 * 验证查询是否允许执行
 * @param query - 待执行的查询
 * @param allowWrite - 是否允许写操作
 * @throws 如果查询被拒绝，抛出带有中文提示的错误
 */
export function validateQuery(query: string, allowWrite: boolean): void {
  if (!allowWrite && isWriteOperation(query)) {
    throw new Error(
      '❌ 操作被拒绝：当前处于只读安全模式。\n' +
      '检测到危险操作（DELETE/UPDATE/DROP/TRUNCATE 等）。\n' +
      '如需执行写入操作，请在启动时添加 --danger-allow-write 参数。\n' +
      '⚠️  警告：启用写入模式后，AI 可以修改你的数据库，请谨慎使用！'
    );
  }
}

/**
 * 获取查询中的危险关键字（用于日志记录）
 * @param query - SQL 查询语句
 * @returns 找到的危险关键字数组
 */
export function getDangerousKeywords(query: string): string[] {
  const upperQuery = query.trim().toUpperCase();
  return DANGEROUS_KEYWORDS.filter(keyword =>
    upperQuery.includes(keyword)
  );
}
