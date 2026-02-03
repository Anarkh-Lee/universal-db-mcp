# Home Assistant 集成指南

本指南展示如何将 Universal Database MCP Server 与 Home Assistant 集成。

## 概述

[Home Assistant](https://www.home-assistant.io/) 是一个开源的家庭自动化平台。通过 MCP 支持，您可以查询数据库来增强智能家居自动化。

## 前置要求

- 已安装 Home Assistant
- 已部署 Universal Database MCP Server
- Node.js 20.0.0 或更高版本
- 数据库实例

## 配置

### 步骤 1：安装 MCP 集成

通过 HACS 或手动安装将 MCP 集成添加到 Home Assistant。

### 步骤 2：配置 MCP 服务器

添加到 Home Assistant 配置：

```yaml
mcp:
  servers:
    - name: database
      command: npx
      args:
        - universal-db-mcp
        - --type
        - mysql
        - --host
        - localhost
        - --port
        - "3306"
        - --user
        - root
        - --password
        - your_password
        - --database
        - your_database
```

### 步骤 3：重启 Home Assistant

重启 Home Assistant 以应用配置。

## 使用方法

在自动化或通过 AI 助手使用 MCP 工具：

```yaml
automation:
  - alias: "每日数据库报告"
    trigger:
      - platform: time
        at: "09:00:00"
    action:
      - service: mcp.call_tool
        data:
          server: database
          tool: execute_query
          arguments:
            query: "SELECT COUNT(*) FROM sensor_data WHERE date = CURDATE()"
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构信息 |
| `get_table_info` | 获取详细的表信息 |
| `clear_cache` | 清除 Schema 缓存 |

## 使用场景

1. **传感器数据分析**：查询历史传感器数据
2. **能源监控**：分析能源消耗模式
3. **设备统计**：跟踪设备使用情况
4. **自定义仪表板**：为 Lovelace 仪表板拉取数据

## 最佳实践

1. 使用只读数据库用户
2. 限制查询频率以防止过载
3. 尽可能缓存结果
4. 使用参数化查询

## 资源

- [Home Assistant 文档](https://www.home-assistant.io/docs/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
