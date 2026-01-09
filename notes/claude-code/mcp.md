<!--
- [INPUT]: 依赖 notes/claude-code/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 MCP 服务器 文档
- [POS]: 位于 notes/claude-code 模块的 MCP 服务器 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# MCP 服务器

MCP (Model Context Protocol) 允许扩展 Claude 的能力，连接外部工具和数据源。

## 安装方式

### HTTP 服务器（推荐）

```bash
claude mcp add --transport http <name> <url>

# 示例
claude mcp add --transport http notion https://mcp.notion.com/mcp
claude mcp add --transport http api https://api.example.com/mcp \
  --header "Authorization: Bearer token"
```

### SSE 服务器（已弃用）

```bash
claude mcp add --transport sse <name> <url>

# 示例
claude mcp add --transport sse asana https://mcp.asana.com/sse
```

### Stdio 服务器（本地）

```bash
claude mcp add --transport stdio <name> [args...]

# 示例
claude mcp add --transport stdio github -- npx -y @anthropic-ai/mcp-server-github
claude mcp add --transport stdio postgres -- npx -y @anthropic-ai/mcp-server-postgres

# 带环境变量
claude mcp add --transport stdio airtable \
  --env AIRTABLE_API_KEY=YOUR_KEY \
  -- npx -y airtable-mcp-server
```

**注意：** `--` 用于分隔 Claude 参数和要执行的命令。

## 管理命令

```bash
claude mcp list              # 列出所有服务器
claude mcp get <name>        # 查看服务器详情
claude mcp remove <name>     # 移除服务器
/mcp                         # 在 Claude Code 中检查状态
```

## 安装范围

| 范围 | 配置位置 | 共享 | 用途 |
|------|----------|------|------|
| **local** | `~/.claude.json`（项目路径） | 否 | 私有、敏感配置 |
| **project** | `.mcp.json`（项目根） | 是（Git） | 团队共享工具 |
| **user** | `~/.claude.json` | 否（所有项目） | 个人通用工具 |

```bash
claude mcp add --scope local   # 项目私有（默认）
claude mcp add --scope project # 团队共享
claude mcp add --scope user    # 全局可用
```

优先级：local > project > user

## 配置文件格式

### .mcp.json（项目级）

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL:-postgresql://localhost/dev}"
      }
    }
  }
}
```

### HTTP/SSE 配置

```json
{
  "mcpServers": {
    "remote-api": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    },
    "sse-server": {
      "type": "sse",
      "url": "https://mcp.example.com/sse"
    }
  }
}
```

## 环境变量语法

```json
{
  "env": {
    "API_KEY": "${API_KEY}",
    "BASE_URL": "${API_BASE_URL:-https://api.example.com}",
    "DEBUG": "${DEBUG:-false}"
  }
}
```

- `${VAR}` - 展开变量
- `${VAR:-default}` - 如果未设置则使用默认值

## 常用 MCP 服务器

| 服务器 | 功能 |
|--------|------|
| `@anthropic-ai/mcp-server-github` | GitHub 操作 |
| `@anthropic-ai/mcp-server-postgres` | PostgreSQL 查询 |
| `@anthropic-ai/mcp-server-sqlite` | SQLite 数据库 |
| `@anthropic-ai/mcp-server-filesystem` | 文件系统访问 |
| `@anthropic-ai/mcp-server-memory` | 持久化记忆 |

## 使用 MCP 工具

安装后，MCP 提供的工具自动可用：

```
# GitHub MCP 示例
创建一个 issue：修复登录页面样式问题

# PostgreSQL MCP 示例
查询 users 表中最近注册的 10 个用户
```

## MCP 资源

MCP 服务器可以暴露资源供 Claude 访问：

```
@mcp:github:repo/owner/name
@mcp:postgres:table/users
```

## MCP 斜杠命令

MCP 服务器的 prompts 自动成为斜杠命令：

```
/mcp__github__list_prs
/mcp__github__pr_review 456
```

## 权限配置

在 settings.json 中配置 MCP 工具权限：

```json
{
  "permissions": {
    "allow": [
      "mcp__github__*",
      "mcp__postgres__query"
    ],
    "deny": [
      "mcp__postgres__drop_table"
    ]
  }
}
```

## 超时配置

通过环境变量配置：

| 变量 | 说明 | 默认 |
|------|------|------|
| `MCP_TIMEOUT` | 服务器启动超时（ms） | - |
| `MCP_TOOL_TIMEOUT` | 工具执行超时（ms） | - |
| `MAX_MCP_OUTPUT_TOKENS` | 最大输出 token | 25000 |

## 企业配置

### 方式一：托管配置（独占控制）

部署到：
- macOS: `/Library/Application Support/ClaudeCode/managed-mcp.json`
- Linux/WSL: `/etc/claude-code/managed-mcp.json`
- Windows: `C:\Program Files\ClaudeCode\managed-mcp.json`

### 方式二：策略控制（允许/拒绝列表）

在 `managed-settings.json` 中：

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverCommand": ["npx", "-y", "approved-server"] },
    { "serverUrl": "https://mcp.company.com/*" }
  ],
  "deniedMcpServers": [
    { "serverName": "dangerous-server" }
  ]
}
```

## settings.json 中的 MCP 配置

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["memory", "github"],
  "disabledMcpjsonServers": ["filesystem"]
}
```

## 调试

```bash
# 检查 MCP 状态
/mcp

# 详细日志
claude --debug "mcp"
```
