# Claude Code 使用指南

本目录收集 Claude Code 的完整使用说明和最佳实践。

## 目录

### 参考文档

| 文件                                                   | 说明                         |
| ------------------------------------------------------ | ---------------------------- |
| [basic-usage.md](./basic-usage.md)                     | 基础使用、CLI 参数、可用工具 |
| [slash-commands.md](./slash-commands.md)               | 完整斜杠命令列表、自定义命令 |
| [hooks.md](./hooks.md)                                 | 钩子系统、事件类型、配置示例 |
| [mcp.md](./mcp.md)                                     | MCP 服务器安装与配置         |
| [settings.md](./settings.md)                           | 配置文件、权限、环境变量     |
| [shortcuts.md](./shortcuts.md)                         | 快捷键速查、Vim 模式         |
| [workflows.md](./workflows.md)                         | 常用工作流和最佳实践         |
| [best-practices.md](./best-practices.md)               | 官方最佳实践                 |
| [community-practices.md](./community-practices.md)     | 业内实战经验                 |
| [frontend-architecture.md](./frontend-architecture.md) | 大型前端项目架构最佳实践     |

### 个人笔记

| 文件                   | 说明                 |
| ---------------------- | -------------------- |
| [notes.md](./notes.md) | 使用心得、技巧、踩坑 |

## 快速开始

```bash
# 安装
npm install -g @anthropic-ai/claude-code

# 启动
claude

# 初始化项目
/init
```

## 常用命令速查

### CLI 命令

```bash
claude                    # 启动交互模式
claude "问题"             # 直接提问
claude -c                 # 继续上次对话
claude -r "session"       # 恢复指定会话
claude -p "query"         # 非交互模式
claude update             # 更新版本
claude mcp list           # 列出 MCP 服务器
```

### 斜杠命令

| 命令       | 说明       |
| ---------- | ---------- |
| `/help`    | 帮助信息   |
| `/init`    | 初始化项目 |
| `/clear`   | 清空对话   |
| `/compact` | 压缩上下文 |
| `/model`   | 切换模型   |
| `/memory`  | 编辑记忆   |
| `/config`  | 打开配置   |
| `/resume`  | 恢复会话   |
| `/review`  | 代码审查   |
| `/doctor`  | 健康检查   |

### 快捷前缀

| 前缀 | 功能      | 示例                |
| ---- | --------- | ------------------- |
| `/`  | 斜杠命令  | `/help`             |
| `!`  | 执行 Bash | `! npm test`        |
| `@`  | 引用文件  | `@src/index.ts`     |
| `#`  | 添加记忆  | `# 使用 TypeScript` |

### 快捷键

| 快捷键        | 功能         |
| ------------- | ------------ |
| `Ctrl+C`      | 中断操作     |
| `Ctrl+R`      | 搜索历史     |
| `Shift+Tab`   | 切换权限模式 |
| `Esc` + `Esc` | 回退更改     |

## 配置文件

| 位置                          | 范围               |
| ----------------------------- | ------------------ |
| `~/.claude/settings.json`     | 全局配置           |
| `.claude/settings.json`       | 项目配置           |
| `.claude/settings.local.json` | 本地配置（不提交） |
| `CLAUDE.md`                   | 项目记忆           |

## 官方资源

- [官方文档](https://docs.anthropic.com/en/docs/claude-code)
- [GitHub 仓库](https://github.com/anthropics/claude-code)
- [MCP 服务器列表](https://github.com/anthropics/mcp-servers)
