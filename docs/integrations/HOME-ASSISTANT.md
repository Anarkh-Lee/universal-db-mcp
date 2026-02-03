# Home Assistant Integration Guide

This guide shows how to integrate Universal Database MCP Server with Home Assistant.

## Overview

[Home Assistant](https://www.home-assistant.io/) is an open-source home automation platform. With MCP support, you can query databases to enhance your smart home automations.

## Prerequisites

- Home Assistant installed
- Universal Database MCP Server deployed
- Node.js 20.0.0 or later
- Database instance

## Configuration

### Step 1: Install MCP Integration

Add the MCP integration to Home Assistant through HACS or manual installation.

### Step 2: Configure MCP Server

Add to your Home Assistant configuration:

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

### Step 3: Restart Home Assistant

Restart Home Assistant to apply the configuration.

## Usage

Use the MCP tools in automations or through the AI assistant:

```yaml
automation:
  - alias: "Daily Database Report"
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

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema information |
| `get_table_info` | Get detailed table information |
| `clear_cache` | Clear schema cache |

## Use Cases

1. **Sensor Data Analysis**: Query historical sensor data
2. **Energy Monitoring**: Analyze energy consumption patterns
3. **Device Statistics**: Track device usage over time
4. **Custom Dashboards**: Pull data for Lovelace dashboards

## Best Practices

1. Use read-only database users
2. Limit query frequency to prevent overload
3. Cache results when possible
4. Use parameterized queries

## Resources

- [Home Assistant Documentation](https://www.home-assistant.io/docs/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
