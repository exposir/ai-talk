<!--
- [INPUT]: 依赖 Chapter 1 的 Agent 概念
- [OUTPUT]: 对外提供第二章课程内容：Tool 原理与文件系统操作
- [POS]: ai-agent-fullstack-course 的第二章
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 第二章：从 Tool 开始：让大模型长出"手脚"

> "光有大脑是不够的，你得有手去改变世界。" —— Agent 开发第一定律

## 1. 为什么大模型需要 Tool？

试想一个场景：你作为一个前端开发，想创建一个 `React + Vite` 的 TodoList 项目。

### 场景 A：与普通 ChatGPT 对话

**你**: "帮我创建一个 React TodoList 项目。" **ChatGPT**:
"好的，首先打开终端运行 `npm create vite@latest...`，然后修改 `App.jsx` 如下..."

**结果**：它只能**告诉**你怎么做，不能**帮**你做。你还是得自己打开 VS
Code，自己敲命令，自己复制粘贴代码。

### 场景 B：使用 Cursor / AI Agent

**你**: "帮我创建一个 React TodoList 项目。" **Agent**: (默默工作)

1.  _调用终端工具_: 执行 `pnpm create vite`
2.  _调用文件写工具_: 写入 `App.jsx`, `App.css`
3.  _调用终端工具_: 执行 `pnpm install && pnpm dev`

**结果**：你的电脑上凭空多出了一个运行中的项目。

**本质区别**：

- **普通 LLM**: Text In -> Text Out (纯信息处理)
- **Agent**: Text In -> **Action** -> Result (副作用与物理世界交互)

这个 "Action" 的能力，就是由 **Tool (工具)** 赋予的。

## 2. Tool 的本质是什么？

在代码层面，Tool 其实就是**一个普通的函数**，只是我们把它"描述"给了大模型听。

一个最基础的 Tool 长这样（以 Node.js 为例）：

```typescript
// 1. 定义函数逻辑（手脚）
async function writeToFile({ filePath, content }) {
  await fs.promises.writeFile(filePath, content);
  return `Successfully wrote to ${filePath}`;
}

// 2. 定义函数描述（说明书）
const toolSchema = {
  name: 'write_to_file',
  description: 'Write content to a file at the specified path.',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'The absolute path of the file',
      },
      content: { type: 'string', description: 'The content to write' },
    },
    required: ['filePath', 'content'],
  },
};
```

当 LLM 想要写文件时，它不会直接运行代码（它也不会运行），而是返回一个 JSON：

```json
{
  "tool_call": "write_to_file",
  "arguments": {
    "filePath": "/Users/me/project/App.jsx",
    "content": "import React from 'react'..."
  }
}
```

Agent 框架（如 LangChain）捕获这个 JSON，替 LLM 执行 `writeToFile`
函数，并将结果返回给 LLM。

## 3. 核心工具集：文件系统操作

要实现类似 Cursor 或 Manus 的自动化编程能力，我们至少需要给 Agent 扩展以下核心工具：

### 3.1 文件读写能力

- **read_file**: 读取文件内容。Agent 需要"看"代码才能修改代码。
- **write_file**: 创建或覆盖文件。这是写代码的核心动作。
- **list_dir**: 查看目录结构。Agent 需要知道当前目录下有哪些文件，类似于 `ls`
  命令。

### 3.2 命令行执行能力

- **run_command**: 执行 Shell 命令。例如 `npm install`, `git init`, `mkdir`。

> **安全警示**：给 AI `run_command` 的权限是非常危险的（rm -rf
> / 警告）。在生产环境中，该工具通常需要配合 **Human-in-the-loop (人类确认)**
> 机制，即在执行高危命令前请求用户批准。

## 4. 实战预告

在接下来的课程中，我们将使用 Node.js 手写这些工具，并把它们挂载到一个 LangChain
Agent 上。

我们将亲手实现：

1.  定义 `FileWriteTool` 和 `ShellCommandTool`。
2.  初始化大模型并绑定这些工具。
3.  对 Agent 说："在当前目录创建一个 `hello-agent.js`，里面打印 hello
    world，然后运行它。"
4.  看着 Agent 自动完成这一切。

这将是你迈向 Full Stack Agent Developer 的第一步。
