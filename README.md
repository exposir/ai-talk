# AI Talk

个人 AI 学习笔记项目，记录 LLM 应用架构设计与开发实践。

## 📖 文档站点

- **在线文档**: https://exposir.github.io/ai-talk/
- **完整目录**: [查看全部文档](./notes/index.md)

---

## 🚀 快速导航

### AI 编程助手

| 工具               | 说明                   | 文档                             |
| ------------------ | ---------------------- | -------------------------------- |
| 📘 **Claude Code** | Anthropic 终端 AI 助手 | [完整指南](./notes/claude-code/) |
| 📗 **Antigravity** | Google Agent-First IDE | [完整指南](./notes/antigravity/) |

### AI 资源

| 主题            | 说明                      | 文档                                                  |
| --------------- | ------------------------- | ----------------------------------------------------- |
| 🤖 **AI 模型**  | 业内最新 LLM 和多模态模型 | [模型汇总](./notes/ai-fundamentals/ai-models.md)      |
| 🔧 **开发工具** | AI 编程助手与开发工具     | [工具汇总](./notes/tools-and-apis/ai-coding-tools.md) |
| 🏗️ **架构设计** | LLM 应用双引擎分层架构    | [架构笔记](./notes/architecture/)                     |

---

## 📁 项目结构

```
ai-talk/
├── notes/                    # 学习笔记
│   ├── index.md              # 📑 文档目录
│   ├── claude-code/          # Claude Code 指南
│   ├── antigravity/          # Antigravity 指南
│   ├── architecture/         # 架构设计
│   ├── ai-fundamentals/      # AI 基础知识
│   ├── tools-and-apis/       # 工具与 API
│   └── project-meta/         # 项目规划
├── docs/                     # VitePress 配置
├── library/                  # 论文、教程、参考资料
├── prompts/                  # Prompt 模板收集
└── sessions/                 # 对话记录存档
```

---

## 🏗️ 架构设计

学习和设计中的 LLM 应用架构（双引擎分层）：

```mermaid
flowchart TB
    subgraph Control["Control Plane"]
        RT[Risk Tagger] --> PE[Policy Engine]
        PE --> R[Router]
        R --> EF[Evidence Firewall]
    end

    subgraph Engines["Dual Engine"]
        S1["System 1 快车道"]
        S2["System 2 慢车道"]
    end

    subgraph Data["Data Plane"]
        CB[Context Builder] --> AL[Agent Loop]
        AL --> TG[Tool Gateway]
        TG --> OH[Output Handler]
        OH --> VR[Validator/Retry]
        VR --> TE[Tracing/Eval]
    end

    Control --> Engines
    Engines --> Data
```

详见 [架构设计笔记](./notes/architecture/)

---

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动文档站点
npm run docs:dev

# 构建生产版本
npm run docs:build
```

---

## 📄 License

MIT
