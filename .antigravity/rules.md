# CLAUDE.md

<!--
本文件是 Claude Code 的专用项目指引，包含文档写作规范与工作流程。保持条目清晰、
可操作，避免加入与文档项目无关的应用开发要求。
-->

本文件为 Claude Code 提供项目指导。

## 项目定位

**AI Talk 是一个 AI 学习笔记项目**，记录 LLM 应用架构设计与开发实践。这是文档型知识库，而非应用开发项目。

**核心内容**：
- LLM 应用架构设计（双引擎分层架构）
- AI 编程工具使用指南（Claude Code、Antigravity）
- AI 基础知识和 LLM 内部原理
- Prompt 工程和 Agent 开发
- 论文笔记和实践经验

## 项目结构

```
notes/                    # 核心学习笔记
├── architecture/         # LLM 应用架构设计
├── claude-code/          # Claude Code 使用指南
├── antigravity/          # Antigravity 使用指南
├── ai-fundamentals/      # AI 基础知识
├── llm-internals/        # LLM 内部原理
├── tools-and-apis/       # AI 工具和 API
├── book/                 # 书籍笔记
└── guide/                # 通用指南

docs/                     # VitePress 配置
library/                  # 论文、教程、参考资料
prompts/                  # Prompt 模板
sessions/                 # 对话记录
```

## 文档编写规范

### Markdown 格式

- **宽度**: 80 字符（Prettier 配置）
- **引号**: 单引号
- **Prose wrap**: always
- **代码块**: 必须指定语言标签

### 内容风格

1. **结构化**: 使用清晰的标题层级
2. **实用性**: 优先记录可操作的知识和经验
3. **完整性**: 待完善内容标注 `🚧 **待完善**`
4. **引用**: 重要观点提供来源链接

### 架构笔记特点

参考 `notes/architecture/design-2025-v1.md`：
- 强调 2025 年最新技术水位（DeepSeek-R1/o3 时代）
- 双引擎架构：System 1（快思考）+ System 2（慢思考）
- 包含具体技术栈和实战建议
- 使用代码示例和配置清单

## 常用命令

```bash
# 开发
npm install              # 安装依赖
npm run docs:dev         # 启动 VitePress 文档站
npm run docs:build       # 构建文档

# 格式化
npx prettier --write .   # 格式化所有文件
npx prettier --check .   # 检查格式
```

## Claude Code 工作指南

### 处理笔记时

1. **保持一致性**: 参考同目录下已有文档的结构和风格
2. **渐进式完善**: 优先完善标注 `🚧 待完善` 的内容
3. **添加实例**: 理论概念配合代码示例或配置清单
4. **更新索引**: 修改文档后同步更新 `notes/guide/index.md` 和 `README.md`

### 处理架构设计时

参考 `notes/architecture/design-2025-v1.md` 风格：
- 清晰的层级划分（接入层、路由层、编排层等）
- 技术选型表格（模块、技术栈、KPI）
- 实战建议和避坑指南
- 代码示例和配置模板

### 处理工具指南时

参考 `notes/claude-code/` 和 `notes/antigravity/`：
- README.md 作为目录索引
- 按功能模块拆分文档
- 包含官方文档参考和社区实践
- 提供快捷键速查和常见问题

### 不要做的事

- ❌ 不要创建实际的应用代码（除非是示例）
- ❌ 不要添加 `.env` 等配置文件（这是文档项目）
- ❌ 不要假设这是一个开发中的应用
- ❌ 不要过度工程化（保持文档简洁）

## VitePress 配置

项目使用 VitePress 生成静态文档站点：
- 配置文件: `docs/.vitepress/config.mts`
- 主题配置: `docs/.vitepress/theme/`
- 部署目标: GitHub Pages

修改文档结构时需同步更新 VitePress 导航配置。

## 技术术语

- **System 1/2**: 双引擎架构中的快/慢思考路径
- **Semantic Router**: 语义路由器，基于向量的意图分类
- **Prompt Caching**: KV Cache，缓存系统提示词
- **MCP**: Model Context Protocol
- **Extended Thinking**: 扩展思考模式（Claude）
- **Vibe Coding**: 通过描述"感觉"让 AI 生成代码

## 项目特色

1. **前沿性**: 关注 2025 年最新 AI 技术（DeepSeek-R1、o3、Claude 3.5）
2. **实战性**: 架构设计包含落地模块清单和 KPI
3. **系统性**: 从基础知识到架构设计的完整体系
4. **工具性**: 详细的 AI 编程工具使用指南

## 协作建议

当被要求优化或补充文档时：
1. 先阅读相关目录下的现有文档
2. 理解已有的写作风格和结构
3. 保持术语和格式的一致性
4. 提供可验证的信息和来源
