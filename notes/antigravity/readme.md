# Google Antigravity 使用指南

Google Antigravity 是由 Google DeepMind 于 2025 年 11 月推出的 **Agent-First**
AI 编程平台，基于 Gemini 3 Pro 模型。

## 目录

### 核心概念

| 文件                                           | 说明                         |
| ---------------------------------------------- | ---------------------------- |
| [overview.md](./overview.md)                   | 产品概览、核心特性、系统架构 |
| [getting-started.md](./getting-started.md)     | 安装配置、快速开始           |
| [development-modes.md](./development-modes.md) | 三种开发模式详解             |

### 核心功能

| 文件                                   | 说明                                   |
| -------------------------------------- | -------------------------------------- |
| [agent-manager.md](./agent-manager.md) | Agent Manager 详解、Multi-Agent 用法   |
| [artifacts.md](./artifacts.md)         | Artifacts 系统 (task/plan/walkthrough) |
| [browser-agent.md](./browser-agent.md) | 浏览器子代理、自动化测试               |

### 进阶配置

| 文件                                       | 说明                                 |
| ------------------------------------------ | ------------------------------------ |
| [advanced-config.md](./advanced-config.md) | Settings、Rules、Workflows、MCP 配置 |
| [shortcuts.md](./shortcuts.md)             | 完整快捷键与操作指南                 |
| [pricing-usage.md](./pricing-usage.md)     | 订阅计划、用量配额                   |
| [best-practices.md](./best-practices.md)   | 社区验证最佳实践                     |

### 个人笔记

| 文件                   | 说明               |
| ---------------------- | ------------------ |
| [notes.md](./notes.md) | 使用心得、技巧记录 |

---

## 快速开始

```bash
# 1. 下载安装
# 访问 antigravity.google/download

# 2. 首次启动
# 登录 Google 账号，选择偏好设置

# 3. 创建项目
# Agent Manager → 选择文件夹 → New Task

# 4. 输入提示词
创建一个 React + TypeScript 的 Todo 应用
```

---

## 核心概念

### 开发模式

| 模式                  | 说明           | 快捷切换    |
| --------------------- | -------------- | ----------- |
| **Agent-driven**      | 完全自主执行   | `Shift+Tab` |
| **Review-driven**     | 每步需确认     | `Shift+Tab` |
| **Agent-assisted** ⭐ | 推荐，平衡控制 | `Shift+Tab` |

### Artifacts 类型

| 类型                     | 用途         | 生成时机      |
| ------------------------ | ------------ | ------------- |
| `task.md`                | 任务进度追踪 | 任务开始      |
| `implementation_plan.md` | 实现计划     | Planning Mode |
| `walkthrough.md`         | 完成报告     | 任务完成      |

### 支持模型

| 模型                | 厂商      | 特点           |
| ------------------- | --------- | -------------- |
| Gemini 3 Pro        | Google    | 主力，复杂推理 |
| Gemini 3 Deep Think | Google    | 超深度思考     |
| Gemini 3 Flash      | Google    | 快速响应       |
| Claude Sonnet 4.5   | Anthropic | 平衡型         |
| Claude Opus 4.5     | Anthropic | 顶级推理       |

---

## 常用快捷键

| 快捷键        | 功能               |
| ------------- | ------------------ |
| `Cmd+Shift+A` | 打开 Agent Manager |
| `Cmd+Enter`   | 发送提示词         |
| `Shift+Tab`   | 切换开发模式       |
| `Cmd+.`       | 停止 Agent         |
| `Tab`         | 接受 AI 补全       |
| `Cmd+L`       | 引用代码到对话     |
| `Escape`      | 取消操作           |

---

## 提示词技巧

### 文件引用

```bash
@src/components/Button.tsx   # 引用单文件
@src/components/             # 引用目录
@selection                   # 当前选中
```

### 模式指定

```bash
【Agent-driven】创建项目骨架
【Review-driven】修改敏感配置
【Deep Think】分析复杂算法
```

### 工作流调用

```bash
/generate-tests              # 调用工作流
使用 @.agent/workflows/new-feature.md
```

---

## 配置文件

| 位置                    | 用途         |
| ----------------------- | ------------ |
| `.agent/settings.json`  | 项目配置     |
| `.agent/rules/*.md`     | 行为规则     |
| `.agent/workflows/*.md` | 可复用工作流 |
| `.mcp.json`             | MCP 集成配置 |

---

## Multi-Agent 用法

```
Workspace: my-project

Agent 1: 实现核心功能
Agent 2: 编写单元测试
Agent 3: 代码审查
```

---

## 与其他工具对比

| 特性     | Antigravity | Claude Code | Cursor    |
| -------- | ----------- | ----------- | --------- |
| 类型     | Agent-First | Agent CLI   | AI Editor |
| 多 Agent | ✅          | 有限        | ❌        |
| 浏览器   | ✅ 内置     | ❌          | ❌        |
| 多模型   | ✅ 6+       | Claude      | 多模型    |

---

## 官方资源

| 资源 | 链接                                                               |
| ---- | ------------------------------------------------------------------ |
| 主页 | [antigravity.google](https://antigravity.google)                   |
| 下载 | [antigravity.google/download](https://antigravity.google/download) |
| 帮助 | [antigravityide.help](https://antigravityide.help)                 |
| 博客 | [blog.google](https://blog.google)                                 |
