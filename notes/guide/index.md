# 文档目录

个人 AI 学习笔记项目，记录 LLM 应用架构设计与开发实践。

---

## 🤖 AI 编程助手

### Claude Code

Anthropic 终端 AI 编程助手完整使用指南。

- [概述](../claude-code/README.md)
- [基础使用](../claude-code/basic-usage.md)
- [斜杠命令](../claude-code/slash-commands.md)
- [快捷键](../claude-code/shortcuts.md)
- [设置](../claude-code/settings.md)
- [MCP 协议](../claude-code/mcp.md)
- [Hooks](../claude-code/hooks.md)
- [Workflows](../claude-code/workflows.md)
- [IDE 集成](../claude-code/ide-integrations.md)
- [前端架构](../claude-code/frontend-architecture.md)
- [最佳实践](../claude-code/best-practices.md)
- [社区实践](../claude-code/community-practices.md)

### Antigravity

Google Agent-First IDE 使用指南。

- [概述](../antigravity/README.md)
- [总览](../antigravity/overview.md)
- [快速开始](../antigravity/getting-started.md)
- [开发模式](../antigravity/development-modes.md)
- [Artifacts](../antigravity/artifacts.md)
- [浏览器代理](../antigravity/browser-agent.md)
- [代理管理器](../antigravity/agent-manager.md)
- [高级配置](../antigravity/advanced-config.md)
- [快捷键](../antigravity/shortcuts.md)
- [定价与用量](../antigravity/pricing-usage.md)
- [最佳实践](../antigravity/best-practices.md)

---

## 🏗️ 架构设计

LLM 应用双引擎分层架构设计。

- [概述](../architecture/README.md)
- [架构设计 2025 v1](../architecture/design-2025-v1.md)
- [架构设计 2025 增强版](../architecture/design-2025-enhanced.md)
- [使用指南](../architecture/usage-guide.md)
- [成本分析](../architecture/cost-analysis.md)
- [评估](../architecture/evaluation.md)

---

## 🧩 前端工程

- [奇点：下一代状态管理系统](../frontend/singularity/README.md)

---

## 📚 工程案例研究

优秀项目的技术实现和工程经验学习。

### Telegram

小团队高效能的典范 - 30 人团队支撑 9 亿+ 用户。

- [概述](../case-studies/telegram/README.md) - 学习框架和资源
- [MTProto 协议](../case-studies/telegram/protocol.md) - 移动优先加密协议设计 🚧
- [客户端架构](../case-studies/telegram/client-architecture.md) -
  TDLib 跨平台复用 🚧
- [服务端架构](../case-studies/telegram/server-architecture.md) - 架构推测与实现 🚧
- [安全模型](../case-studies/telegram/security.md) - 加密与威胁模型 🚧
- [性能优化](../case-studies/telegram/optimization.md) - 核心优化策略 🚧
- [工程经验](../case-studies/telegram/lessons.md) - 小团队做大产品的秘诀 🚧

---

## 📚 AI 基础

AI 模型、工具和技术的完整指南。

- [AI 模型汇总](../ai-fundamentals/ai-models.md) - 业内最新 LLM 和多模态模型
- [本地部署指南](../ai-fundamentals/local-deployment.md) - Ollama、LM
  Studio 等工具 🚧
- [API 快速入门](../ai-fundamentals/api-quickstart.md) - 各家 API 调用方法 🚧
- [Prompt 工程技巧](../ai-fundamentals/prompt-engineering.md) - 提示词优化技术 🚧
- [多模态模型详解](../ai-fundamentals/multimodal-models.md) - 图像/语音/视频模型 🚧
- [Agent 与工具调用](../ai-fundamentals/agents-and-tools.md) -
  LangChain、MCP 协议 🚧
- [AI 术语表](../ai-fundamentals/glossary.md) - 常见术语解释 🚧

---

## 📰 新闻与观察

按天汇总 AI/LLM 相关新闻并进行趋势分析。

- [每日新闻总结与分析](../news/daily-news.md)

---

## 🧠 LLM 原理与架构

深入理解大语言模型的核心原理。

- [概述](../llm-internals/README.md) - LLM 原理导览
- [Transformer 架构](../llm-internals/transformer-architecture.md) - 注意力机制详解 🚧
- [位置编码](../llm-internals/positional-encoding.md) - RoPE、ALiBi 等 🚧
- [注意力变体](../llm-internals/attention-variants.md) - MQA、GQA、Flash
  Attention 🚧
- [预训练](../llm-internals/pre-training.md) - 语言建模与数据 🚧
- [微调技术](../llm-internals/fine-tuning.md) - LoRA、QLoRA 等 🚧
- [对齐技术](../llm-internals/alignment.md) - RLHF、DPO 🚧
- [GPT 系列](../llm-internals/gpt-series.md) - GPT 架构演进 🚧
- [开源模型](../llm-internals/open-source-models.md) - LLaMA、Mistral、Qwen 🚧
- [MoE 架构](../llm-internals/mixture-of-experts.md) - 混合专家模型 🚧
- [必读论文](../llm-internals/essential-papers.md) - 里程碑论文列表 🚧
- [Scaling Laws](../llm-internals/scaling-laws.md) - 规模定律 🚧
- [推理优化](../llm-internals/inference-optimization.md) - KV Cache、量化 🚧
- [长上下文](../llm-internals/long-context.md) - 上下文扩展技术 🚧

---

## 🔧 工具与 API

- [AI 开发工具汇总](../tools-and-apis/ai-coding-tools.md) -
  AI 编程助手与开发工具

---

## 📁 项目规划

- [GEB 分形文档系统协议解读](./geb-protocol-explained.md)
- [命名规范](../project-meta/naming-conventions.md) - 项目、目录、文件命名最佳实践
- [项目规范与最佳实践](../project-meta/project-standards.md) - 项目统一规范与执行要点
- [项目分析](../project-meta/project-analysis.md)
- [项目结构优化](../project-meta/project-structure-optimization.md)
- [文档项目结构优化](../project-meta/structure-optimization-for-documentation-project.md)
- [结构建议](../project-meta/structure-recommendations.md)

---

## 📖 书籍与规范笔记

技术书籍阅读笔记和语言规范学习。

### JavaScript 规范

- [ECMA-262 第 16 版 (2025)](../book/ecma-262.md) -
  JavaScript 官方语言规范完整目录与核心解析
  - Scope / Conformance / Normative References
  - Overview (宿主环境、原型系统、严格模式)
  - 数据类型与抽象操作
  - 2025 新特性速览

### JavaScript 书籍

- [你不知道的 JavaScript](../book/you-dont-know-js.md) - Kyle
  Simpson 经典深入系列

---

## 🎨 创作与思考

关于内容创作、思维模型的深度思考与实践指南。

- [破局：从“参数焦虑”到“第一性原理”的创作指南](../essays/vertical-video-guide.md)
