# Spring AI 集成指南

本指南展示如何将 Universal Database MCP Server 与 Spring AI 集成。

## 概述

[Spring AI](https://spring.io/projects/spring-ai) 是一个用于 AI 应用的 Java/Spring 框架。它支持 MCP，允许您在 Spring 应用中使用数据库工具。

## 前置要求

- Java 17+
- Spring Boot 3.2+
- Maven 或 Gradle
- 数据库实例

## 安装

### Maven

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'org.springframework.ai:spring-ai-mcp:1.0.0'
```

## 配置

### application.yml

```yaml
spring:
  ai:
    mcp:
      servers:
        database:
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
            - ${DB_PASSWORD}
            - --database
            - mydb
```

### Java 配置

```java
@Configuration
public class McpConfig {

    @Bean
    public McpClient mcpClient() {
        return McpClient.builder()
            .command("npx")
            .args("universal-db-mcp",
                  "--type", "mysql",
                  "--host", "localhost",
                  "--port", "3306",
                  "--user", "root",
                  "--password", "password",
                  "--database", "mydb")
            .build();
    }
}
```

## 使用方法

```java
@Service
public class DatabaseService {

    private final McpClient mcpClient;

    public DatabaseService(McpClient mcpClient) {
        this.mcpClient = mcpClient;
    }

    public String queryDatabase(String query) {
        return mcpClient.callTool("execute_query",
            Map.of("query", query));
    }

    public String getSchema() {
        return mcpClient.callTool("get_schema", Map.of());
    }
}
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `execute_query` | 执行 SQL 查询 |
| `get_schema` | 获取数据库结构 |
| `get_table_info` | 获取表详情 |
| `clear_cache` | 清除 Schema 缓存 |

## 最佳实践

1. 使用环境变量存储凭据
2. 使用只读数据库用户
3. 实现适当的错误处理
4. 使用连接池

## 资源

- [Spring AI 文档](https://docs.spring.io/spring-ai/reference/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## 支持

如有集成问题：
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
