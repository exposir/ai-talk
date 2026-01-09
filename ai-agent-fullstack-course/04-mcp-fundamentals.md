<!--
- [INPUT]: 依赖 Node.js 环境, @modelcontextprotocol/sdk
- [OUTPUT]: 讲解 MCP 协议的核心概念与跨进程工具调用原理
- [POS]: ai-agent-fullstack-course 的第 4 章
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 第 4 章: MCP (Model Context Protocol) - 可跨进程调用的 Tool

> 本章将解决 Tool 的语言限制问题，引入 MCP 协议实现跨语言、跨进程的工具调用标准。

## 1. 回顾：Tool 的本质

在前面的章节中，我们实现了一些基础 Tool，比如读取文件、执行命令等。其核心逻辑如下：

```javascript
// 伪代码示例
const readFileTool = tool(
  async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log(
        `【工具调用】read_file("${filePath}") - 成功读取 ${content.length} 字节`,
      );
      return `文件内容:\n${content}`;
    } catch (error) {
      return `读取失败: ${error.message}`;
    }
  },
  {
    name: 'read_file',
    description: '读取指定路径的文件内容',
    schema: z.object({
      filePath: z.string().describe('文件路径'),
    }),
  },
);
```

只要声明了 Tool 的名字、描述和参数格式，大模型（LLM）就能在发现需要使用工具时，自动解析出参数并传入调用，最后将执行结果封装成
`ToolMessage` 返回给 Chat。

例如，在上一节实现的 Mini
Cursor 中，我们就是提供了读写文件、执行命令的 Tool，大模型通过自动调用这些 Tool 实现了 React 项目的自动创建与依赖安装。

## 2. 现有 Tool 的局限性

目前我们的 Agent 是用 Node.js 编写的，定义的 Tool 也是直接运行在 Node.js 进程中的函数。

**问题来了**：如果你有一套非常优秀的工具库是使用 **Java、Python 或 Rust**
编写的，想让你的 Node.js Agent 使用，该怎么办？

### 方案 A：子进程调用 (Stdio)

通过 Node.js 的 `child_process`
启动其他语言的二进制程序，利用标准输入输出 (Stdio) 进行通信。

```
[User] -> [Prompt] -> [LLM]
                        |
                    tool_calls
                        |
        [Node.js Agent] <===(Stdio)===> [Java/Rust 进程]
```

这就是本地跨进程调用的基础原型。

### 方案 B：HTTP 服务 (Remote)

将工具逻辑封装成一个 Web 服务，Agent 通过 HTTP 请求与之交互。

```
[User] -> [Prompt] -> [LLM]
                        |
                    tool_calls
                        |
        [Node.js Agent] <===(HTTP)===> [远程服务进程]
```

## 3. 为何需要 MCP？

虽然上述两种方案都能解决问题，但如果每个开发者都定义自己的通信格式、API 接口和参数规范，接入此生态将变得异常困难。

我们需要一个**统一的通信协议**，这就好比 USB 协议统一了外设接口一样。

**MCP (Model Context Protocol)** 正是为此诞生。

- **定义**：一个标准化的协议，用于连接 AI 模型与数据源/工具。
- **全称**：Model Context Protocol (模型上下文协议)。
- **核心价值**：给 Model 扩展 Context（上下文），让它能"连接"更多外部能力。
- **背景**：由 Anthropic 发起，于 2024 年底移交给 Linux 基金会维护，成为了一个**行业通用、中立**的协议。

## 4. MCP 架构与工作流

MCP 最大的特点是**标准化了跨进程工具调用**。

### 通信模式

1.  **本地 (Local)**: 使用 Stdio 通信，适用于本地 CLI 工具或桌面应用扩展。
2.  **远程 (Remote)**: 使用 SSE (Server-Sent Events) /
    HTTP 通信，适用于云端服务。

### 角色分工

```mermaid
graph LR
    Client[MCP Client (AI Agent)] <--> Protocol[MCP Protocol] <--> Server[MCP Server]

    subgraph "Server 端能力"
        T[Tools]
        R[Resources]
        P[Prompts]
    end

    Server --- T
    Server --- R
    Server --- P
```

- **MCP
  Server**: 提供工具 (Tools)、资源 (Resources) 或提示词 (Prompts) 的服务端。即便是 Python 写的数据分析工具，只要实现了 MCP
  Server 协议，就能被任何 MCP Client 调用。
- **MCP Client**: 也就是我们的 AI
  Agent（User 端）。它负责维护与 Server 的连接，将 Server 暴露的能力注册为自己的 Tools。

**在 LangChain 中**：即使是 MCP，对于 LLM 来说依然是 Tool。我们在 Agent (MCP
Client) 内部不仅可以调用本地 JS Tool，还可以通过 MCP Client "代理"调用外部的 MCP
Server Tool。

## 5. 下一步：实战 MCP

这是 MCP 的理论基础。接下来的实战中，我们将基于 `tool-test` 项目引入 MCP SDK：

```bash
pnpm install @modelcontextprotocol/sdk
```

通过实战一个 MCP
Server，你将彻底理解如何打破语言边界，让 Agent 拥有无限的工具扩展能力。
