<!--
- [INPUT]: 依赖 notes/claude-code/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 配置与设置 文档
- [POS]: 位于 notes/claude-code 模块的 配置与设置 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 配置与设置

## 配置文件位置

| 文件 | 范围 | 说明 |
|------|------|------|
| 系统 `managed-settings.json` | 企业 | IT 管理，最高优先级 |
| `~/.claude/settings.json` | 用户 | 个人全局配置 |
| `.claude/settings.json` | 项目 | 团队共享配置 |
| `.claude/settings.local.json` | 本地 | 个人项目配置，不提交 |

**优先级**：企业 > 命令行参数 > 本地 > 项目 > 用户

## 完整配置示例

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "outputStyle": "Explanatory",
  "alwaysThinkingEnabled": true,

  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(git:*)",
      "Read(~/.zshrc)"
    ],
    "ask": [
      "Bash(git push:*)"
    ],
    "deny": [
      "WebFetch",
      "Read(./.env)",
      "Read(./.env.*)"
    ],
    "additionalDirectories": ["../docs/"],
    "defaultMode": "default"
  },

  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker"],
    "network": {
      "allowUnixSockets": ["~/.ssh/agent-socket"],
      "allowLocalBinding": true,
      "httpProxyPort": 8080,
      "socksProxyPort": 8081
    }
  },

  "env": {
    "NODE_ENV": "development",
    "DEBUG": "true"
  },

  "attribution": {
    "commit": "Generated with AI\n\nCo-Authored-By: AI <ai@example.com>",
    "pr": ""
  },

  "hooks": {},
  "mcpServers": {},

  "cleanupPeriodDays": 30,
  "disableAllHooks": false
}
```

## 权限配置

### 权限规则格式

```
Tool 或 Tool(specifier)
```

### 权限模式

| 模式 | 说明 |
|------|------|
| `default` | 首次使用提示授权 |
| `acceptEdits` | 自动接受文件编辑 |
| `plan` | 只分析不执行 |
| `bypassPermissions` | 跳过所有提示 |

### Bash 权限

```json
{
  "allow": [
    "Bash",                    // 允许所有 Bash
    "Bash(npm run build)",     // 精确匹配
    "Bash(npm run test:*)",    // 前缀匹配
    "Bash(git:*)"              // git 所有命令
  ],
  "deny": [
    "Bash(rm -rf:*)",
    "Bash(sudo:*)"
  ]
}
```

### 文件权限

路径支持 gitignore 语法：

```json
{
  "allow": [
    "Read",                    // 允许所有读取
    "Read(~/.zshrc)",          // 家目录文件
    "Write(src/**)",           // 相对于配置文件
    "Edit(/docs/**)"           // 相对于配置文件
  ],
  "deny": [
    "Read(./.env)",
    "Read(./.env.*)",
    "Read(./secrets/**)",
    "Write(//etc/passwd)"      // 绝对路径
  ]
}
```

路径前缀：
- `//path` - 绝对路径
- `~/path` - 家目录
- `/path` 或 `./path` - 相对于配置文件

### WebFetch 权限

```json
{
  "allow": [
    "WebFetch(domain:example.com)",
    "WebFetch(domain:*.company.com)"
  ]
}
```

### MCP 权限

```json
{
  "allow": [
    "mcp__github",             // 所有 GitHub 工具
    "mcp__github__*",          // 通配符语法
    "mcp__postgres__query"     // 特定工具
  ],
  "deny": [
    "mcp__postgres__drop_table"
  ]
}
```

**优先级**：deny > ask > allow

## 模型配置

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "modelAliases": {
    "fast": "claude-3-5-haiku-20241022",
    "smart": "claude-sonnet-4-5-20250929",
    "best": "claude-opus-4-5-20251101"
  }
}
```

使用别名：`/model fast`

## 环境变量

```json
{
  "env": {
    "NODE_ENV": "development",
    "OPENAI_API_KEY": "${OPENAI_API_KEY}",
    "DEBUG": "true"
  }
}
```

支持 `${VAR}` 语法引用系统环境变量。

## 沙箱配置

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker", "podman"],
    "network": {
      "allowUnixSockets": ["~/.ssh/agent-socket"],
      "allowLocalBinding": true,
      "httpProxyPort": 8080,
      "socksProxyPort": 8081
    },
    "enableWeakerNestedSandbox": false
  }
}
```

## 排除文件

```json
{
  "excludeFiles": [
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "secrets/**",
    "credentials.json"
  ]
}
```

## 自定义提交信息

```json
{
  "attribution": {
    "commit": "🤖 Generated with Claude Code\n\nCo-Authored-By: Claude <noreply@anthropic.com>",
    "pr": "This PR was created with assistance from Claude Code."
  }
}
```

## 状态栏配置

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

## 文件建议

```json
{
  "fileSuggestion": {
    "type": "command",
    "command": "~/.claude/file-suggestion.sh"
  }
}
```

## 认证配置

```json
{
  "apiKeyHelper": "/bin/generate_api_key.sh",
  "otelHeadersHelper": "/bin/generate_otel_headers.sh",
  "awsAuthRefresh": "aws sso login --profile myprofile",
  "awsCredentialExport": "/bin/generate_aws_grant.sh",
  "forceLoginMethod": "claudeai",
  "forceLoginOrgUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

## 插件配置

```json
{
  "enabledPlugins": {
    "formatter@acme-tools": true,
    "analyzer@security": false
  },
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/plugins"
      }
    }
  }
}
```

## CLAUDE.md 记忆文件

项目根目录的 `CLAUDE.md` 文件会自动加载为项目记忆。

### 记忆层级

| 位置 | 范围 |
|------|------|
| `~/.claude/CLAUDE.md` | 全局记忆 |
| `项目/CLAUDE.md` | 项目记忆 |
| `项目/子目录/CLAUDE.md` | 目录记忆 |

### 快速添加记忆

在对话中使用 `#` 前缀：

```
# 使用 pnpm 作为包管理器
# 测试命令是 npm run test:unit
```

或使用 `/memory` 命令编辑。

## 命令行配置

```bash
# 查看配置
claude config list

# 设置配置
claude config set model claude-sonnet-4-5-20250929

# 重置配置
claude config reset
```

## 环境变量参考

### API 相关

| 变量 | 说明 |
|------|------|
| `ANTHROPIC_API_KEY` | API 密钥 |
| `ANTHROPIC_MODEL` | 模型名称 |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | 最大输出 token |
| `MAX_THINKING_TOKENS` | 扩展思考预算 |

### 提供商

| 变量 | 说明 |
|------|------|
| `CLAUDE_CODE_USE_BEDROCK` | 使用 Bedrock |
| `CLAUDE_CODE_USE_VERTEX` | 使用 Vertex AI |

### 功能开关

| 变量 | 说明 |
|------|------|
| `DISABLE_PROMPT_CACHING` | 禁用提示缓存 |
| `DISABLE_AUTOUPDATER` | 禁用自动更新 |
| `DISABLE_TELEMETRY` | 禁用遥测 |
| `DISABLE_ERROR_REPORTING` | 禁用错误报告 |

### Bash 相关

| 变量 | 说明 |
|------|------|
| `BASH_DEFAULT_TIMEOUT_MS` | 默认超时 |
| `BASH_MAX_TIMEOUT_MS` | 最大超时 |
| `BASH_MAX_OUTPUT_LENGTH` | 最大输出字符 |
