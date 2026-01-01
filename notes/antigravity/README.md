# Google Antigravity 使用指南

Google Antigravity 是由 Google DeepMind 开发的 **Agent-First**
AI 编程助手，基于 Gemini 3 Pro 模型。

## 目录

### 参考文档

| 文件                                           | 说明               |
| ---------------------------------------------- | ------------------ |
| [overview.md](./overview.md)                   | 产品概览、核心特性 |
| [getting-started.md](./getting-started.md)     | 快速开始、安装配置 |
| [development-modes.md](./development-modes.md) | 开发模式详解       |
| [artifacts.md](./artifacts.md)                 | Artifacts 系统     |
| [browser-agent.md](./browser-agent.md)         | 浏览器子代理       |
| [best-practices.md](./best-practices.md)       | 最佳实践           |

### 个人笔记

| 文件                   | 说明           |
| ---------------------- | -------------- |
| [notes.md](./notes.md) | 使用心得、技巧 |

## 快速开始

```bash
# 1. 下载安装 Antigravity
# 访问 antigravity.google 下载

# 2. 首次启动
# 链接 Google 账号，选择偏好设置

# 3. 创建项目
# 打开 Agent Manager，选择文件夹，点击 "New Task"

# 4. 输入提示词
# 用自然语言描述你的需求
```

## 核心概念速览

### 开发模式

| 模式                  | 说明                | 适用场景         |
| --------------------- | ------------------- | ---------------- |
| **Agent-driven**      | AI 自动执行所有操作 | 快速原型         |
| **Review-driven**     | 每步需要确认        | 敏感操作         |
| **Agent-assisted** ⭐ | 用户控制 + AI 辅助  | 日常开发（推荐） |

### Artifacts 类型

| 类型                     | 用途         |
| ------------------------ | ------------ |
| `task.md`                | 任务清单追踪 |
| `implementation_plan.md` | 实现计划     |
| `walkthrough.md`         | 完成后总结   |

### 常用功能

| 功能                | 说明               |
| ------------------- | ------------------ |
| **Deep Think**      | 复杂问题增强推理   |
| **Browser Agent**   | 自动化网页交互测试 |
| **Multi-workspace** | 多项目并行管理     |

## 与 Claude Code 对比

| 特性      | Antigravity  | Claude Code  |
| --------- | ------------ | ------------ |
| 模型      | Gemini 3 Pro | Claude 3.5/4 |
| 界面      | GUI 编辑器   | 终端 CLI     |
| 浏览器    | 内置         | 外部         |
| Artifacts | 原生支持     | 文件系统     |
| 定价      | 免费预览     | API 计费     |

## 官方资源

- [官方网站](https://antigravity.google)
- [帮助文档](https://antigravityide.help)
- [Google Blog](https://blog.google)
