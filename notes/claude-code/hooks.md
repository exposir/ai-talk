<!--
- [INPUT]: 依赖 notes/claude-code/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 钩子系统 (Hooks) 文档
- [POS]: 位于 notes/claude-code 模块的 钩子系统 (Hooks) 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 钩子系统 (Hooks)

Hooks 允许在特定事件发生时执行自定义脚本或 LLM 提示。

## 钩子事件完整列表

| 事件 | 触发时机 | 支持 Matcher |
|------|----------|--------------|
| `PreToolUse` | 工具调用前 | 是 |
| `PostToolUse` | 工具调用后 | 是 |
| `PermissionRequest` | 请求权限时 | 是 |
| `Notification` | 发送通知时 | 是 |
| `UserPromptSubmit` | 用户提交输入时 | 否 |
| `Stop` | 主代理完成时 | 否 |
| `SubagentStop` | 子代理完成时 | 否 |
| `PreCompact` | 压缩上下文前 | 是（manual/auto） |
| `SessionStart` | 会话开始/恢复时 | 是（startup/resume/clear/compact） |
| `SessionEnd` | 会话结束时 | 否 |

## 配置结构

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "bash-command",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

## 配置位置

- `~/.claude/settings.json` - 全局钩子
- `.claude/settings.json` - 项目钩子
- `.claude/settings.local.json` - 本地钩子（不提交）

## Matcher 规则

| 模式 | 说明 | 示例 |
|------|------|------|
| 精确匹配 | 匹配指定工具 | `Write` |
| 正则表达式 | 匹配多个工具 | `Edit\|Write` |
| 通配符 | 匹配所有 | `*` |
| 空字符串 | 匹配所有 | `""` |
| MCP 工具 | 匹配 MCP | `mcp__github__.*` |

## 钩子类型

### 命令钩子 (Command)

执行 Bash 命令：

```json
{
  "type": "command",
  "command": "/path/to/script.sh",
  "timeout": 60
}
```

### 提示钩子 (Prompt)

让 Claude 执行额外指令：

```json
{
  "type": "prompt",
  "prompt": "检查代码是否有安全漏洞",
  "timeout": 30
}
```

## 钩子输入

脚本通过 stdin 接收 JSON 数据：

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  },
  "tool_use_id": "xyz789"
}
```

### 各事件特有字段

| 事件 | 特有字段 |
|------|----------|
| `PreToolUse` | `tool_name`, `tool_input`, `tool_use_id` |
| `PostToolUse` | `tool_name`, `tool_input`, `tool_response`, `tool_use_id` |
| `PermissionRequest` | `message`, `notification_type` |
| `UserPromptSubmit` | `prompt` |
| `Stop/SubagentStop` | `stop_hook_active` |
| `PreCompact` | `trigger`, `custom_instructions` |
| `SessionStart` | `source` (startup/resume/clear/compact) |
| `SessionEnd` | `reason` (clear/logout/prompt_input_exit/other) |

## 钩子输出

### 退出码

| 退出码 | 行为 |
|--------|------|
| 0 | 成功，处理 stdout |
| 2 | 阻止操作，显示 stderr |
| 其他 | 非阻塞错误，继续执行 |

### JSON 输出格式

```json
{
  "decision": "approve|block|allow|deny|ask",
  "reason": "说明原因",
  "continue": true,
  "stopReason": "停止原因（continue=false 时）",
  "suppressOutput": false,
  "systemMessage": "警告信息",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "updatedInput": {},
    "additionalContext": "额外上下文"
  }
}
```

## 各事件决策控制

### PreToolUse

```json
{
  "decision": "allow",      // 绕过权限系统
  "decision": "deny",       // 阻止工具调用
  "decision": "ask",        // 询问用户确认
  "hookSpecificOutput": {
    "updatedInput": {       // 修改工具输入
      "command": "npm run test:safe"
    }
  }
}
```

### PermissionRequest

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "allow",
    "updatedInput": {},
    "message": "拒绝原因",
    "interrupt": true       // deny 时是否中断
  }
}
```

### PostToolUse

```json
{
  "decision": "block",      // 向 Claude 反馈问题
  "reason": "检测到问题",
  "hookSpecificOutput": {
    "additionalContext": "额外信息"
  }
}
```

### UserPromptSubmit

```json
{
  "decision": "block",      // 阻止提交
  "reason": "包含敏感信息",
  "hookSpecificOutput": {
    "additionalContext": "添加到上下文的信息"
  }
}
```

### Stop / SubagentStop

```json
{
  "decision": "block",      // 阻止停止，继续执行
  "reason": "任务未完成"
}
```

## 示例

### 阻止危险命令

```bash
#!/bin/bash
# pre-bash-hook.sh

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command')

if echo "$command" | grep -qE 'rm -rf|sudo|:(){ :|:& };:'; then
  echo '{"decision": "deny", "reason": "危险命令已被阻止"}'
  exit 0
fi

echo '{"decision": "allow"}'
```

配置：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/pre-bash-hook.sh"
          }
        ]
      }
    ]
  }
}
```

### 自动格式化代码

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_PROJECT_DIR\""
          }
        ]
      }
    ]
  }
}
```

### 日志记录

```bash
#!/bin/bash
# log-tool-usage.sh

input=$(cat)
echo "$input" >> ~/.claude/tool-usage.log
echo '{"decision": "allow"}'
```

### 会话启动时加载环境

```bash
#!/bin/bash
# session-start.sh

# 设置环境变量
cat > "$CLAUDE_ENV_FILE" << EOF
NODE_ENV=development
DEBUG=true
EOF

echo '{"decision": "allow"}'
```

配置：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

### 提示钩子示例

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "在回答前，先检查用户的请求是否涉及安全敏感操作"
          }
        ]
      }
    ]
  }
}
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `$CLAUDE_PROJECT_DIR` | 项目根目录（绝对路径） |
| `$CLAUDE_ENV_FILE` | SessionStart 钩子的环境文件路径 |
| `${CLAUDE_PLUGIN_ROOT}` | 插件根目录（插件钩子） |

## 调试钩子

```bash
# 启用调试模式
claude --debug "hooks"

# 查看钩子配置
/hooks
```

## 安全注意事项

- 钩子以 Claude Code 权限运行
- 避免在钩子中暴露敏感信息
- 谨慎处理用户输入，防止注入
- 设置合理的超时时间
