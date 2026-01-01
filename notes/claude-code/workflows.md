# 常用工作流

## 项目初始化

```bash
# 进入项目目录
cd my-project

# 启动 Claude Code
claude

# 初始化项目配置
/init
```

这会创建 `CLAUDE.md` 文件，记录项目信息供后续使用。

## 理解新代码库

```
# 1. 获取项目概览
这个项目是做什么的？主要技术栈是什么？

# 2. 了解架构
项目的目录结构和架构是怎样的？

# 3. 找关键入口
主入口文件在哪里？请求是怎么处理的？

# 4. 理解特定模块
解释一下 src/core/scheduler.ts 是怎么工作的
```

## 修复 Bug

```
# 1. 描述问题
用户登录后页面空白，控制台报错 "Cannot read property 'name' of undefined"

# 2. 让 Claude 分析
帮我找到这个 bug 的原因

# 3. 修复并测试
修复这个问题，然后运行相关测试
```

## 添加新功能

使用 Plan 模式进行复杂功能开发：

```
# 1. 进入 Plan 模式
/plan  或 Shift+Tab 切换

# 2. 描述需求
实现用户头像上传功能，支持裁剪和压缩

# 3. Claude 分析并生成计划
# 确认计划后开始实现

# 4. 退出 Plan 模式开始编码
```

## 代码重构

```
# 1. 指定范围
重构 src/utils/helpers.ts，这个文件太大了

# 2. 提出要求
按功能拆分成多个文件，保持向后兼容

# 3. 验证
运行测试确保没有破坏现有功能
```

## 编写测试

```
# 1. 指定目标
为 src/services/auth.ts 编写单元测试

# 2. 覆盖场景
覆盖正常登录、密码错误、账号锁定等场景

# 3. 运行验证
运行测试并确保通过
```

## Git 操作

### 提交更改

```
# 查看状态
! git status

# 让 Claude 提交
帮我提交这些更改，commit message 用英文
```

### 创建 PR

```
# 创建 PR
创建一个 PR 到 main 分支，描述这次改动

# 或使用斜杠命令
/pr-comments  # 查看 PR 评论
```

### 处理冲突

```
帮我解决合并冲突
```

## 代码审查

```
# 审查特定 PR
/review 123

# 审查本地更改
审查我暂存的更改，检查潜在问题

# 安全审查
/security-review
```

## 调试问题

```
# 1. 提供错误信息
运行 npm start 报错：[粘贴错误信息]

# 2. 让 Claude 诊断
这个错误是什么原因？怎么解决？

# 3. 应用修复
按你说的修复试试
```

## 多文件操作

```
# 批量修改
把所有组件文件中的 React.FC 改成普通函数声明

# 重命名
把 getUserInfo 函数重命名为 fetchUserProfile，更新所有调用处

# 批量添加
给所有 API 函数添加错误处理
```

## 使用子代理

Claude Code 内置专门的子代理处理特定任务：

```
# 代码探索
帮我找到处理用户认证的代码

# 复杂任务规划
规划一下如何实现多租户支持
```

## 会话管理

```bash
# 继续上次会话
claude -c

# 恢复指定会话
claude -r "feature-auth"

# 重命名当前会话
/rename feature-auth

# 导出对话
/export conversation.md

# 压缩上下文
/compact 保留关于 API 设计的讨论

# 回退更改
/rewind
```

## 使用 MCP 工具

```
# GitHub 操作（需要配置 GitHub MCP）
列出我的 PR
创建一个 issue：修复登录 bug

# 数据库查询（需要配置 Postgres MCP）
查询最近 10 个用户的注册信息
```

## 批处理模式

用于 CI/CD 或脚本：

```bash
# 非交互式执行
claude -p "检查代码风格问题" --max-turns 3

# 管道输入
cat error.log | claude -p "分析这个错误"

# JSON 输出
claude -p "列出所有 TODO" --output-format json
```

## 自定义工作流

创建 `.claude/commands/` 下的自定义命令：

```markdown
# .claude/commands/review-pr.md
---
allowed-tools: Bash(git:*)
argument-hint: "[pr-number]"
---

审查 PR #$ARGUMENTS：

当前分支状态：!`git status`
变更内容：!`git diff main...HEAD`

请检查：
1. 代码质量和风格
2. 潜在的 bug
3. 性能问题
4. 安全隐患
```

使用：`/project:review-pr 123`

## 并行工作

使用 Git worktrees 运行多个 Claude 实例：

```bash
# 创建 worktree
git worktree add ../my-project-feature feature-branch

# 在新 worktree 中启动 Claude
cd ../my-project-feature
claude
```

## 添加项目记忆

```
# 快速添加（使用 # 前缀）
# 使用 pnpm 作为包管理器
# 测试命令是 pnpm test:unit
# 部署使用 Vercel

# 或编辑 CLAUDE.md
/memory
```
