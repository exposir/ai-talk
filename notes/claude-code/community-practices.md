# 业内实践经验

来自社区和资深用户的实战经验总结。

## 核心心智模型

> 把 Claude Code 当作一个记忆力超强、速度极快的实习生——需要明确指导和监督，但给对指令后能以超人速度工作。

## 工作流程

### 探索 → 计划 → 编码 → 提交

1. 先让 Claude 阅读相关文件，不写代码
2. 要求详细计划，使用 extended thinking
3. 实现方案
4. 提交并记录

### Plan Mode 是关键

**如果只记住一条，就是这条：多花时间规划。**

- `Shift+Tab` 两次进入 Plan Mode
- Plan Mode 下 Claude 变成"架构师模式"，只分析不改文件
- 让 Claude 先给出 3+ 种方案，从最简单的开始

### Spec → To-Do → Code

```
1. 让 Claude 创建规格说明（需求、技术栈、设计、里程碑）
2. 让 Claude 创建详细待办清单
3. 逐个完成待办事项
```

这样你始终在审核 Claude 的计划，而不是被动接受。

## 上下文管理

### 频繁使用 /clear

- 每开始新任务就清空聊天
- 不需要旧历史消耗 token
- 不需要 Claude 运行压缩来总结旧对话

### 一个会话一个功能

- 把会话范围限定在一个项目或功能
- 功能完成后立即 `/clear`
- 如果功能太大，让 Claude 拆分成项目计划存到 markdown

### 使用 scratchpad 文件

让 Claude 把计划写到临时 markdown 文件，而不是只在对话中规划。

## 提示词技巧

### 要具体

```
❌ "给 foo.py 加测试"
✅ "给 foo.py 写测试用例，覆盖用户登出的边界情况，避免使用 mock"
```

### 触发深度思考

- 使用 "think" 触发 extended thinking
- 复杂问题用 "think ultra hard" 或 "ultrathink"

### 明确工作流偏好

```
"我们用测试驱动开发"
"先看这个文件的实现模式"
"参考 xxx 的代码风格"
```

### 提供上下文

```
❌ "为什么 ExecutionFactory 的 API 这么奇怪？"
✅ "看一下 ExecutionFactory 的 git 历史，总结它的 API 是怎么演变的"
```

## 图片工作流

Claude 擅长处理图片和图表：

### 截图作为反馈

1. 让 Claude 构建界面
2. 在浏览器打开
3. 截图（macOS: `Cmd+Ctrl+Shift+4`）
4. 粘贴到 Claude（`Ctrl+V`，不是 `Cmd+V`）
5. 提供反馈："这个按钮应该是蓝色的"

### 提供设计稿

- 拖拽图片到终端
- 或直接粘贴截图
- 可以用 Puppeteer MCP 自动截图

## 终端技巧

### 停止和跳转

- `Escape` 停止 Claude（不是 `Ctrl+C`，那会退出）
- `Escape` 两次显示历史消息列表，可以跳回修改

### 换行

`Shift+Enter` 默认不工作，用 `/terminal-setup` 修复

### 并行运行

- 多个终端标签页同时运行多个 Claude 实例
- 各自处理不同任务
- Claude 也可以自己启动子实例（显示 "Task(...)"）

## 权限处理

### 跳过权限询问

最烦的是 Claude 总问权限。解决方案：

```bash
claude --dangerously-skip-permissions
```

**注意**：只在信任的环境中使用。

### 预批准常用命令

在 settings.json 中配置，避免反复确认。

## CLAUDE.md 技巧

### 像训练实习生一样

当 Claude 犯错时，让它更新 CLAUDE.md 记住不要再犯。

### 没有固定格式

CLAUDE.md 没有要求的格式——关键是写清楚对项目重要的内容。

### 用 # 快速更新

输入以 `#` 开头的内容，Claude 会自动更新 CLAUDE.md。

## 高级技巧

### 多 Claude 协作

- 一个 Claude 写代码，另一个 Review
- 用 git worktree 同时在不同功能分支运行多个实例

### 大规模迁移

"Fanning out" 模式处理大量文件（如批量重构几千个文件）。

### GitHub 集成

```bash
/install-github-app
```

让 Claude 自动 Review PR。Claude 常能发现人类漏掉的逻辑错误和安全问题。

### Headless 模式

```bash
claude -p "<prompt>" --json
```

用于 CI/CD 和自动化，配合 `--allowedTools` 控制权限。

### MCP 扩展

配置 `.mcp.json` 添加 Puppeteer、Sentry 等服务器，团队共享。

## 常见陷阱

1. **让 Claude 直接开始编码** → 应该先规划
2. **会话太长不清理** → 定期 `/clear`
3. **CLAUDE.md 内容太多** → 迭代优化，保持相关
4. **不检查 Claude 的输出** → 始终 review 每一行
5. **一次改动太大** → 增量构建，完成一个里程碑再进行下一个

## 来源

- [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices) - Anthropic 工程博客
- [How I use Claude Code](https://www.builder.io/blog/claude-code) - Builder.io
- [20 Tips to Master Claude Code](https://creatoreconomy.so/p/20-tips-to-master-claude-code-in-35-min-build-an-app) - Peter Yang
- [Claude Code Best Practices and Pro Tips](https://htdocs.dev/posts/claude-code-best-practices-and-pro-tips/)
