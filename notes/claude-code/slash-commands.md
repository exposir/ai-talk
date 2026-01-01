# 斜杠命令

## 内置命令完整列表

### 会话管理

| 命令 | 说明 |
|------|------|
| `/clear` | 清空对话历史 |
| `/compact [instructions]` | 压缩对话上下文（可指定重点） |
| `/resume [session]` | 恢复指定会话 |
| `/rename <name>` | 重命名当前会话 |
| `/export [filename]` | 导出对话到文件或剪贴板 |
| `/rewind` | 回退对话和/或代码更改 |
| `/exit` | 退出 Claude Code |

### 配置与设置

| 命令 | 说明 |
|------|------|
| `/config` | 打开设置界面（Config 标签） |
| `/status` | 打开设置界面（Status 标签） |
| `/model` | 选择或切换模型 |
| `/permissions` | 查看/管理权限 |
| `/memory` | 编辑 CLAUDE.md 记忆文件 |
| `/output-style [style]` | 设置输出风格 |
| `/vim` | 切换 vim 编辑模式 |
| `/privacy-settings` | 查看/更新隐私设置 |

### 项目与开发

| 命令 | 说明 |
|------|------|
| `/init` | 初始化项目 CLAUDE.md |
| `/add-dir` | 添加额外工作目录 |
| `/review` | 请求代码审查 |
| `/security-review` | 安全审查待提交的更改 |
| `/pr-comments` | 查看 PR 评论 |
| `/install-github-app` | 设置 Claude GitHub Actions |

### MCP 与插件

| 命令 | 说明 |
|------|------|
| `/mcp` | 管理 MCP 服务器连接和 OAuth |
| `/plugin` | 管理 Claude Code 插件 |
| `/agents` | 管理自定义子代理 |
| `/hooks` | 管理钩子配置 |

### 系统与帮助

| 命令 | 说明 |
|------|------|
| `/help` | 显示帮助信息 |
| `/doctor` | 检查安装健康状态 |
| `/bug` | 报告 Bug（发送至 Anthropic） |
| `/release-notes` | 查看发布说明 |
| `/terminal-setup` | 安装 Shift+Enter 快捷键 |
| `/statusline` | 设置状态栏 UI |
| `/ide` | 管理 IDE 集成 |

### 统计与信息

| 命令 | 说明 |
|------|------|
| `/cost` | 显示 Token 使用统计 |
| `/usage` | 显示订阅计划用量 |
| `/stats` | 显示每日使用和连续使用天数 |
| `/context` | 可视化当前上下文使用 |
| `/todos` | 列出当前 TODO 项 |
| `/bashes` | 列出和管理后台任务 |
| `/tasks` | 查看后台任务 |

### 账户管理

| 命令 | 说明 |
|------|------|
| `/login` | 切换 Anthropic 账户 |
| `/logout` | 登出账户 |

### 沙箱

| 命令 | 说明 |
|------|------|
| `/sandbox` | 启用隔离的沙箱 Bash 环境 |

## 自定义斜杠命令

### 项目级命令

在项目根目录创建 `.claude/commands/` 目录：

```
.claude/
└── commands/
    ├── deploy.md
    ├── fix-issue.md
    └── review-pr.md
```

使用方式：`/project:deploy`

### 个人命令

在 `~/.claude/commands/` 创建全局命令：

```
~/.claude/
└── commands/
    └── my-workflow.md
```

使用方式：`/user:my-workflow`

### 命令参数

**单一参数（$ARGUMENTS）：**

```markdown
# fix-issue.md
修复 issue #$ARGUMENTS：
1. 分析问题原因
2. 实现修复方案
3. 添加测试用例
```

使用：`/project:fix-issue 123`

**多参数（$1, $2, ...）：**

```markdown
# compare.md
比较 $1 和 $2 两个文件的差异，重点关注 $3 相关的变更
```

使用：`/project:compare file1.ts file2.ts "性能"`

### Frontmatter 配置

```yaml
---
allowed-tools: "Bash(git add:*), Bash(git status:*)"
argument-hint: "[pr-number] [priority] [assignee]"
description: "Review pull request"
model: "claude-3-5-haiku-20241022"
disable-model-invocation: false
---

# 命令内容...
```

### 在命令中执行 Bash

使用 `!` 前缀执行命令并嵌入结果：

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*)
---

当前 git 状态: !`git status`
当前 git diff: !`git diff HEAD`

请根据以上信息生成 commit message。
```

### 引用文件

使用 `@` 引用项目文件：

```markdown
检查 @src/utils/helpers.js 的实现
对比 @src/old.js 和 @src/new.js 的差异
```

## MCP 命令

安装 MCP 服务器后，其提供的 prompts 会自动变成斜杠命令：

```
/mcp__<server-name>__<prompt-name> [arguments]
```

示例：
```
/mcp__github__list_prs
/mcp__github__pr_review 456
/mcp__jira__create_issue "Bug 标题" high
```

## 插件命令

插件可以提供自定义命令：

```
/plugin-name:command-name
/command-name  # 如果没有命名冲突
```
