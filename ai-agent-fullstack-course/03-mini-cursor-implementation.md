<!--
- [INPUT]: 依赖 Chapter 2 的 Tool 概念
- [OUTPUT]: 对外提供第三章课程内容：实现 Mini Cursor 自动化项目生成
- [POS]: ai-agent-fullstack-course 的第三章
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 第三章：实现 Mini Cursor：大模型自动调用 Tool 执行命令

> "既然从 0 到 1 创建项目如此繁琐，为什么不让 AI 替我们敲键盘？"

## 1. 目标：复刻 Cursor 的核心魔法

在上一章，我们学会了让 Agent
"看"（读取文件）。这一章，我们不仅要让它"写"，还要让它"跑"起来。

我们的目标是实现一个 **Mini Cursor**，只需一句指令：

> "创建一个 React + Vite 的 TodoList 项目，并自动把服务跑起来。"

Agent 需要自动完成以下一系列动作，完全无需人类干预：

1.  `run_command`: 执行 `npm create vite@latest` (或者更简单的脚手架命令) ->
    **生成骨架**
2.  `write_file`: 修改 `App.jsx` -> **写入业务逻辑**
3.  `write_file`: 修改 `App.css` -> **写入样式**
4.  `run_command`: 执行 `npm install` -> **安装依赖**
5.  `run_command`: 执行 `npm run dev` -> **启动服务**

## 2. 核心架构图

```mermaid
graph TD
    User[用户: "创建一个项目..."] --> LLM[LLM 大脑]
    LLM --> Decision{决定下一步?}

    Decision -- 调用工具 --> ToolRunner[Tool 执行器]

    ToolRunner -- write_file --> FS[文件系统]
    ToolRunner -- run_command --> Terminal[终端命令]

    FS --> Output[操作结果]
    Terminal --> Output

    Output --> LLM
    LLM --> Decision
```

这是一个经典的 **ReAct (Reasoning + Acting)**
循环：思考 -> 行动 -> 观察结果 -> 再思考。

## 3. 关键 Tool 实现 (Node.js)

我们将使用 Node.js 的 `child_process` 和 `fs` 模块来实现这些超能力。

### 3.1 终端命令工具 (The Magic Wand)

这是最强大但也最危险的工具。它让 LLM 拥有了 Shell 的能力。

```javascript
import { exec } from 'child_process';
import { util } from 'util';
const execAsync = util.promisify(exec);

const runCommandTool = {
  name: 'run_command',
  description: 'Execute a shell command via child_process.',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: "The command to execute (e.g., 'npm install', 'ls -la')",
      },
    },
    required: ['command'],
  },
  func: async ({ command }) => {
    console.log(`[MiniCursor] Running: ${command}`);
    try {
      const { stdout, stderr } = await execAsync(command);
      return stdout || stderr;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
};
```

### 3.2 文件写入工具 (The Builder)

```javascript
import fs from 'fs/promises';
import path from 'path';

const writeFileTool = {
  name: 'write_file',
  description:
    "Write content to a file. Creates directories if they don't exist.",
  parameters: {
    type: 'object',
    properties: {
      filePath: { type: 'string' },
      content: { type: 'string' },
    },
    required: ['filePath', 'content'],
  },
  func: async ({ filePath, content }) => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
    return `Successfully wrote to ${filePath}`;
  },
};
```

## 4. LangChain 整合

有了 Tool，我们如何把它们装进 Agent？

```javascript
import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';

// 1. 初始化模型
const llm = new ChatOpenAI({ modelName: 'gpt-4-turbo', temperature: 0 });

// 2. 准备工具箱
const tools = [runCommandTool, writeFileTool, readFileTool]; // 记得加上上一章的读文件

// 3. 创建 Agent
// LangChain 会自动将 tools 转换为 OpenAI 的 function calling 格式
const agent = await createOpenAIFunctionsAgent({
  llm,
  tools,
  prompt: your_prompt_template,
});

const executor = new AgentExecutor({
  agent,
  tools,
});

// 4. 见证奇迹
await executor.invoke({
  input:
    "在当前目录创建一个名为 'demo-app' 的 React 项目结构，并写入一个简单的 Hello World App.jsx，最后跑通过 npm install 安装依赖。",
});
```

## 5. 总结

通过给 LLM 赋予 `run_command` 和 `write_file`
的能力，我们实际上已经构建了一个简易版的 Cursor 后端核心。

它不再是一个只会聊天的 Chatbot，而是一个能**干活**的 Engineer。

**下节预告**：这就完美了吗？不。

- 如果命令执行报错了怎么办？
- 如果无限循环了怎么办？
- 如果它把系统文件删了怎么办？我们需要引入更高级的循环控制和状态管理 ——
  **LangGraph**.
