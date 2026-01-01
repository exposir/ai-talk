# Claude Code 最佳实践

基于官方文档整理的最佳实践和经验总结。

## 项目初始化

### CLAUDE.md 配置

项目根目录的 `CLAUDE.md` 是最重要的配置文件：

```markdown
# CLAUDE.md

## 项目概述
简要描述项目用途和技术栈

## 常用命令
npm install / npm test / npm run build

## 编码规范
- 使用的框架和库
- 代码风格要求
- 架构模式

## 目录结构
说明关键目录用途
```

### 模块化规则

使用 `.claude/rules/` 按主题组织规则：

```
.claude/rules/
├── node-conventions.md     # Node.js 规范
├── api-design.md           # API 设计
└── testing.md              # 测试规范
```

规则文件支持 frontmatter 指定作用范围：

```markdown
---
paths: src/**/*.js
---

# Node.js 规则
- 使用 async/await
- 遵循 Prettier 配置
```

## 提示词技巧

### 文件引用

```bash
@src/utils/auth.js          # 引用单文件
@src/components/            # 引用目录结构
```

### 有效提示

- **具体**：说明具体需要什么
- **上下文**：提供相关代码和错误信息
- **约束**：指定限制条件（如保持向后兼容）

### Extended Thinking

对复杂任务启用思考模式：

```bash
ultrathink: design a caching layer for our API
```

适用场景：架构决策、复杂 bug 分析、多步实现计划

## 上下文管理

### Memory 层级

| 类型 | 位置 | 范围 |
|------|------|------|
| 项目级 | `./CLAUDE.md` | 团队共享 |
| 项目规则 | `./.claude/rules/*.md` | 按主题 |
| 个人级 | `~/.claude/CLAUDE.md` | 跨项目 |
| 本地级 | `./CLAUDE.local.md` | 个人本地 |

### 会话管理

```bash
/rename auth-refactor       # 命名当前会话
claude --continue           # 继续最近会话
claude --resume name        # 按名称恢复
/compact                    # 压缩上下文
```

### 快速添加记忆

```bash
# 使用 # 前缀
# 记住：API 密钥在 .env 中
```

## 工作流优化

### 权限模式

`Shift+Tab` 循环切换：
- **Normal**: 每次询问权限
- **Auto-Accept**: 自动接受编辑
- **Plan Mode**: 只分析不执行

### Plan Mode

用于安全的代码分析：

```bash
claude --permission-mode plan
```

### 并行任务

使用 Git Worktrees：

```bash
git worktree add ../feature-a -b feature-a
cd ../feature-a && claude
```

### 自定义命令

创建 `.claude/commands/` 目录：

```bash
# .claude/commands/optimize.md
Analyze performance and suggest optimizations:
```

使用：`/optimize`

## 常见问题处理

### 权限问题

预批准常用命令：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(npm test:*)"
    ]
  }
}
```

### 敏感文件保护

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

### 性能优化

- 定期使用 `/compact` 压缩会话
- 在 CLAUDE.md 中提供上下文减少搜索
- 简单任务使用 `--model haiku`

### 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `Shift+Tab` | 切换权限模式 |
| `Ctrl+O` | 切换详细模式 |
| `Ctrl+R` | 搜索命令历史 |
| `Esc Esc` | 回退更改 |

## 安全实践

- 在权限中排除敏感文件
- 使用 Plan Mode 进行危险操作前分析
- 审查所有建议的修改
- 使用 `/cost` 监控使用情况

## 参考资源

- [官方文档](https://docs.anthropic.com/en/docs/claude-code)
- [常见工作流](https://docs.anthropic.com/en/docs/claude-code/common-workflows)
- [Memory 管理](https://docs.anthropic.com/en/docs/claude-code/memory)
