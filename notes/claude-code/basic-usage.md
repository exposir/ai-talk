# 基础使用

## 安装

```bash
npm install -g @anthropic-ai/claude-code
```

## 启动方式

```bash
# 交互模式
claude

# 直接提问
claude "如何创建 React 组件"

# 管道输入
cat file.py | claude "解释这段代码"

# 非交互模式（输出后退出）
claude -p "解释这个项目"

# 继续上次对话
claude -c

# 恢复指定会话
claude -r "session-name"
claude --resume abc123
```

## 完整 CLI 参数

### 常用参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `-c, --continue` | 继续最近的对话 | `claude -c` |
| `-r, --resume` | 恢复指定会话 | `claude -r "auth-refactor"` |
| `-p, --print` | 非交互模式 | `claude -p "query"` |
| `--model` | 指定模型 | `claude --model sonnet` |
| `-v, --version` | 显示版本 | `claude -v` |
| `--verbose` | 详细日志 | `claude --verbose` |

### 高级参数

| 参数 | 说明 |
|------|------|
| `--add-dir` | 添加额外工作目录 |
| `--agent` | 指定子代理 |
| `--agents` | 定义自定义子代理（JSON） |
| `--allowedTools` | 免授权工具列表 |
| `--disallowedTools` | 禁用工具列表 |
| `--append-system-prompt` | 追加系统提示词 |
| `--system-prompt` | 替换系统提示词 |
| `--system-prompt-file` | 从文件加载系统提示词 |
| `--dangerously-skip-permissions` | 跳过权限确认（慎用） |
| `--max-turns` | 限制代理轮次 |
| `--mcp-config` | 加载 MCP 配置 |
| `--permission-mode` | 权限模式（plan/default） |
| `--output-format` | 输出格式（text/json/stream-json） |
| `--input-format` | 输入格式（text/stream-json） |
| `--json-schema` | JSON Schema 输出验证 |
| `--tools` | 指定可用工具 |
| `--session-id` | 使用指定会话 ID |
| `--fork-session` | 恢复时创建新会话 |
| `--debug` | 调试模式 |
| `--ide` | 自动连接 IDE |
| `--chrome` | 启用 Chrome 集成 |
| `--fallback-model` | 过载时的备用模型 |

### 子命令

```bash
claude update          # 更新到最新版本
claude mcp list        # 列出 MCP 服务器
claude mcp add         # 添加 MCP 服务器
claude mcp remove      # 移除 MCP 服务器
claude config list     # 列出配置
claude config set      # 设置配置
```

## 基本交互

### 提问与对话

直接输入问题即可开始对话，Claude 会根据上下文理解你的需求。

### 快捷前缀

| 前缀 | 功能 | 示例 |
|------|------|------|
| `/` | 斜杠命令 | `/help` |
| `!` | 直接执行 Bash | `! npm test` |
| `@` | 引用文件 | `@src/index.ts` |
| `#` | 添加到记忆 | `# 使用 pnpm 作为包管理器` |

### 文件操作

```
# 读取文件
请帮我看看 src/index.ts 的代码

# 编辑文件
把 handleClick 函数改成异步的

# 创建文件
创建一个 utils/helper.ts 工具函数
```

### 执行命令

Claude 可以执行 shell 命令，首次执行需要授权：

```
运行测试
安装 lodash 依赖
查看 git 状态
```

## 权限管理

### 权限模式

| 模式 | 说明 |
|------|------|
| `default` | 首次使用提示授权 |
| `acceptEdits` | 自动接受文件编辑 |
| `plan` | 只分析不执行 |
| `bypassPermissions` | 跳过所有提示（需安全环境） |

切换模式：`Shift+Tab` 或 `Alt+M`

### 权限选项

- **Allow once** - 仅本次允许
- **Allow for session** - 本次会话允许
- **Allow always** - 始终允许（写入配置）
- **Deny** - 拒绝

## 上下文管理

### 添加文件到上下文

```bash
# 启动时指定
claude src/

# 对话中引用
@src/components/Button.tsx
```

### 添加工作目录

```bash
claude --add-dir ../libs ../shared
```

或使用斜杠命令：`/add-dir ../libs`

### 使用图片

- 直接拖拽图片到终端
- `Ctrl+V`（macOS/Linux）或 `Alt+V`（Windows）粘贴截图

## 会话管理

```bash
# 继续上次会话
claude -c

# 恢复指定会话
claude -r "session-name"

# 重命名会话
/rename my-feature

# 导出对话
/export conversation.md
```

## 可用工具

| 工具 | 说明 | 需授权 |
|------|------|--------|
| `Read` | 读取文件 | 否 |
| `Write` | 创建/覆盖文件 | 是 |
| `Edit` | 编辑文件 | 是 |
| `Bash` | 执行命令 | 是 |
| `Glob` | 文件模式匹配 | 否 |
| `Grep` | 搜索文件内容 | 否 |
| `WebFetch` | 获取 URL 内容 | 是 |
| `WebSearch` | 网络搜索 | 是 |
| `Task` | 运行子代理 | 否 |
| `NotebookEdit` | 编辑 Jupyter | 是 |

## 退出

- 输入 `/exit` 或 `quit`
- 按 `Ctrl+C` 两次
- 按 `Ctrl+D`
