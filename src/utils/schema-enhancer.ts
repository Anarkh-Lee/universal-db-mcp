/**
 * Schema 增强工具
 * 提供隐式关系推断、关系类型细化等功能
 * 用于提升 LLM 对数据库结构的理解，提高 Text2SQL 准确性
 */

import type { TableInfo, RelationshipInfo } from '../types/adapter.js';

/**
 * Schema 增强配置
 */
export interface SchemaEnhancerConfig {
  /** 是否启用隐式关系推断，默认 true */
  enableInferredRelationships: boolean;
  /** 是否启用关系类型细化，默认 true */
  enableRelationshipTypeRefinement: boolean;
  /** 推断关系的最小置信度阈值，低于此值的推断将被过滤，默认 0.7 */
  minConfidenceThreshold: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: SchemaEnhancerConfig = {
  enableInferredRelationships: true,
  enableRelationshipTypeRefinement: true,
  minConfidenceThreshold: 0.7,
};

/**
 * Schema 增强器类
 */
export class SchemaEnhancer {
  private config: SchemaEnhancerConfig;

  constructor(config?: Partial<SchemaEnhancerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 增强关系信息
   * 1. 为现有外键关系添加 source='foreign_key' 标记
   * 2. 推断隐式关系并添加 source='inferred' 标记
   * 3. 细化关系类型（区分 one-to-one 和 many-to-one）
   */
  enhanceRelationships(
    tables: TableInfo[],
    existingRelationships: RelationshipInfo[]
  ): RelationshipInfo[] {
    // 1. 标记现有外键关系
    const markedRelationships: RelationshipInfo[] = existingRelationships.map(rel => ({
      ...rel,
      source: 'foreign_key' as const,
      confidence: 1.0,
    }));

    // 2. 推断隐式关系
    let allRelationships: RelationshipInfo[] = [...markedRelationships];
    if (this.config.enableInferredRelationships) {
      const inferredRelationships = this.inferRelationships(tables, markedRelationships);
      allRelationships = [...markedRelationships, ...inferredRelationships];
    }

    // 3. 细化关系类型
    if (this.config.enableRelationshipTypeRefinement) {
      allRelationships = this.refineRelationshipTypes(tables, allRelationships);
    }

    return allRelationships;
  }

  /**
   * 推断隐式关系
   * 基于列命名规则推断表间关系，支持以下模式：
   * - xxx_id → xxxs.id 或 xxx.id
   * - xxxId → xxxs.id 或 xxx.id (驼峰命名)
   * - xxx_code → xxxs.code 或 xxx.code
   */
  private inferRelationships(
    tables: TableInfo[],
    existingRelationships: RelationshipInfo[]
  ): RelationshipInfo[] {
    const inferred: RelationshipInfo[] = [];

    // 构建表名集合（小写）用于快速查找
    const tableNameSet = new Set(tables.map(t => t.name.toLowerCase()));

    // 构建表名到表信息的映射
    const tableMap = new Map(tables.map(t => [t.name.toLowerCase(), t]));

    // 构建已有关系的集合，避免重复推断
    const existingPairs = new Set(
      existingRelationships.map(r => `${r.fromTable.toLowerCase()}.${r.fromColumns[0].toLowerCase()}`)
    );

    for (const table of tables) {
      const tableName = table.name.toLowerCase();

      for (const column of table.columns) {
        const columnName = column.name.toLowerCase();

        // 跳过已有外键的列
        if (existingPairs.has(`${tableName}.${columnName}`)) {
          continue;
        }

        // 跳过主键列（主键通常不是外键）
        if (table.primaryKeys.map(pk => pk.toLowerCase()).includes(columnName)) {
          continue;
        }

        // 尝试推断关系
        const inferredRelation = this.tryInferRelation(
          tableName,
          columnName,
          tableNameSet,
          tableMap
        );

        if (inferredRelation && (inferredRelation.confidence ?? 0) >= this.config.minConfidenceThreshold) {
          inferred.push(inferredRelation);
        }
      }
    }

    return inferred;
  }

  /**
   * 尝试为单个列推断关系
   */
  private tryInferRelation(
    tableName: string,
    columnName: string,
    tableNameSet: Set<string>,
    tableMap: Map<string, TableInfo>
  ): RelationshipInfo | null {
    // 规则1: xxx_id → xxxs.id 或 xxx.id
    if (columnName.endsWith('_id') && columnName !== 'id') {
      const baseName = columnName.slice(0, -3); // 去掉 _id
      return this.findTargetTable(tableName, columnName, baseName, 'id', tableNameSet, tableMap);
    }

    // 规则2: xxxId → xxxs.id 或 xxx.id (驼峰命名)
    const camelCaseMatch = columnName.match(/^(.+)Id$/);
    if (camelCaseMatch && columnName !== 'id') {
      const baseName = camelCaseMatch[1].toLowerCase();
      const relation = this.findTargetTable(tableName, columnName, baseName, 'id', tableNameSet, tableMap);
      if (relation) {
        // 驼峰命名的置信度稍低
        relation.confidence = Math.max(0, (relation.confidence || 0) - 0.05);
      }
      return relation;
    }

    // 规则3: xxx_code → xxxs.code 或 xxx.code
    if (columnName.endsWith('_code') && columnName !== 'code') {
      const baseName = columnName.slice(0, -5); // 去掉 _code
      return this.findTargetTable(tableName, columnName, baseName, 'code', tableNameSet, tableMap);
    }

    // 规则4: xxx_no → xxxs.xxx_no 或 xxx.xxx_no
    if (columnName.endsWith('_no') && columnName !== 'no') {
      const baseName = columnName.slice(0, -3); // 去掉 _no
      // 对于 _no 后缀，目标列名通常是完整的列名
      return this.findTargetTable(tableName, columnName, baseName, columnName, tableNameSet, tableMap, 0.75);
    }

    return null;
  }

  /**
   * 查找目标表
   */
  private findTargetTable(
    fromTable: string,
    fromColumn: string,
    baseName: string,
    targetColumn: string,
    tableNameSet: Set<string>,
    tableMap: Map<string, TableInfo>,
    baseConfidence: number = 0.95
  ): RelationshipInfo | null {
    // 尝试匹配的表名变体（按优先级排序）
    const candidates = [
      { name: baseName + 's', confidence: baseConfidence },      // 复数形式 users
      { name: baseName + 'es', confidence: baseConfidence },     // 复数形式 boxes
      { name: baseName, confidence: baseConfidence - 0.05 },     // 单数形式 user
      { name: baseName + '_info', confidence: baseConfidence - 0.10 },  // xxx_info 形式
      { name: baseName + '_list', confidence: baseConfidence - 0.10 },  // xxx_list 形式
    ];

    for (const candidate of candidates) {
      if (tableNameSet.has(candidate.name) && candidate.name !== fromTable) {
        const targetTable = tableMap.get(candidate.name);
        if (targetTable) {
          // 验证目标表有对应的列
          const hasTargetColumn = targetTable.columns.some(
            col => col.name.toLowerCase() === targetColumn.toLowerCase()
          );
          // 或者目标列是主键
          const isTargetPrimaryKey = targetTable.primaryKeys
            .map(pk => pk.toLowerCase())
            .includes(targetColumn.toLowerCase());

          if (hasTargetColumn || isTargetPrimaryKey) {
            return {
              fromTable,
              fromColumns: [fromColumn],
              toTable: candidate.name,
              toColumns: [targetColumn],
              type: 'many-to-one',
              source: 'inferred',
              confidence: candidate.confidence,
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * 细化关系类型
   * 通过检查外键列是否有唯一约束来区分 one-to-one 和 many-to-one
   */
  private refineRelationshipTypes(
    tables: TableInfo[],
    relationships: RelationshipInfo[]
  ): RelationshipInfo[] {
    // 构建表名到表信息的映射
    const tableMap = new Map(tables.map(t => [t.name.toLowerCase(), t]));

    return relationships.map(rel => {
      const fromTable = tableMap.get(rel.fromTable.toLowerCase());
      if (!fromTable) {
        return rel;
      }

      // 检查外键列是否有唯一约束
      const isOneToOne = this.hasUniqueConstraint(fromTable, rel.fromColumns);

      return {
        ...rel,
        type: isOneToOne ? 'one-to-one' : rel.type,
      };
    });
  }

  /**
   * 检查列是否有唯一约束
   */
  private hasUniqueConstraint(table: TableInfo, columns: string[]): boolean {
    if (!table.indexes || columns.length === 0) {
      return false;
    }

    const normalizedColumns = columns.map(c => c.toLowerCase()).sort();

    // 检查是否有唯一索引覆盖这些列
    return table.indexes.some(idx => {
      if (!idx.unique) {
        return false;
      }

      const indexColumns = idx.columns.map(c => c.toLowerCase()).sort();

      // 索引列必须完全匹配外键列
      return (
        indexColumns.length === normalizedColumns.length &&
        indexColumns.every((col, i) => col === normalizedColumns[i])
      );
    });
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SchemaEnhancerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): SchemaEnhancerConfig {
    return { ...this.config };
  }
}

/**
 * 创建默认的 Schema 增强器实例
 */
export function createSchemaEnhancer(config?: Partial<SchemaEnhancerConfig>): SchemaEnhancer {
  return new SchemaEnhancer(config);
}
