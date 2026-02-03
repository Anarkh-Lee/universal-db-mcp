# Spring AI Integration Guide

This guide shows how to integrate Universal Database MCP Server with Spring AI.

## Overview

[Spring AI](https://spring.io/projects/spring-ai) is a Java/Spring framework for AI applications. It supports MCP, allowing you to use database tools in your Spring applications.

## Prerequisites

- Java 17+
- Spring Boot 3.2+
- Maven or Gradle
- Database instance

## Installation

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

## Configuration

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

### Java Configuration

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

## Usage

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

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL queries |
| `get_schema` | Get database schema |
| `get_table_info` | Get table details |
| `clear_cache` | Clear schema cache |

## Best Practices

1. Use environment variables for credentials
2. Use read-only database users
3. Implement proper error handling
4. Use connection pooling

## Resources

- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)

## Support

For integration issues:
- GitHub Issues: https://github.com/Anarkh-Lee/universal-db-mcp/issues
