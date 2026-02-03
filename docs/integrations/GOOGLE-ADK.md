# Google ADK Integration Guide

This guide shows how to integrate Universal Database MCP Server with Google ADK.

## Overview

[Google ADK](https://cloud.google.com/) (Agent Development Kit) is Google's agent development toolkit. It supports MCP, allowing you to use database tools in your agents.

## Prerequisites

- Google Cloud account
- Google ADK installed
- Node.js 20.0.0 or later
- Database instance

## Configuration

Add to ADK configuration:

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": [
        "universal-db-mcp",
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "your_database"
      ]
    }
  }
}
```

## Usage

Use the database tools in your ADK agents to query data.

## Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
