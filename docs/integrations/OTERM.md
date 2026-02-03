# Oterm Integration Guide

This guide shows how to integrate Universal Database MCP Server with Oterm.

## Overview

[Oterm](https://github.com/ggozad/oterm) is a terminal-based Ollama client with MCP support. It allows you to query databases while chatting with local LLMs.

## Prerequisites

- Oterm installed (`pip install oterm`)
- Ollama installed and running
- Node.js 20.0.0 or later
- Database instance

## Configuration

Create `~/.config/oterm/config.json`:

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

```bash
oterm
> What tables are in the database?
> Show me the schema of the users table
```

## Resources

- [Oterm GitHub](https://github.com/ggozad/oterm)
- [Universal DB MCP GitHub](https://github.com/Anarkh-Lee/universal-db-mcp)
