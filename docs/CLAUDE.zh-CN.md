# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

AI
Talk 是一个 AI 对话学习项目，专注于构建 LLM 应用架构。目前处于早期规划/架构设计阶段，文档已完成，实现待开发。

**技术栈**：Node.js + OpenAI/Gemini API

## 常用命令

```bash
npm install             # 安装依赖
npm test                # 运行测试（尚未配置）
npx prettier --write .  # 格式化代码
```

## 代码风格

Prettier 配置：

- 行宽：80 字符
- 使用单引号
- 自动换行

## 架构设计

项目采用"双引擎"分层架构：

- **System 1（快车道）**：处理约 80% 的简单任务（问答、基础查询）
- **System 2（慢车道）**：处理约 20% 的复杂任务（代码分析、深度推理）

**控制平面组件**：

- 风险标记器 → 策略引擎 → 路由器 → 证据防火墙

**数据平面组件**：

- 上下文构建器 → Agent 循环 → 工具网关 → 输出处理器 → 验证/重试 → 追踪/评估

## 目录结构

- `notes/` - 学习笔记（架构设计、AI 基础、提示工程等）
- `library/` - 外部资源（论文、参考资料、教程）
- `prompts/` - Prompt 模板（`system/` 和 `user/` 子目录）
- `sessions/` - 对话记录，按日期归档（YYYY/MM/）

## 环境配置

复制 `.env.example` 到 `.env` 并配置 API 密钥：

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
