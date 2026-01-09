<!--
- [INPUT]: 依赖 notes/architecture/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 2025 双引擎（Dual-Engine）通用助手架构设计 文档
- [POS]: 位于 notes/architecture 模块的 2025 双引擎（Dual-Engine）通用助手架构设计 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 2025 双引擎（Dual-Engine）通用助手架构设计

这是一个基于 **2025 年 Q1** 技术水位（DeepSeek-R1/OpenAI
o3 时代）重新设计的**“双引擎（Dual-Engine）”通用助手架构**。

这版架构的核心改进在于：抛弃了“一套逻辑处理所有请求”的旧思维，转为**“快思考（System
1）”与“慢思考（System
2）”分流处理**，并引入**语义路由**和**上下文缓存**来解决成本与延迟问题。

这是目前工程落地中，兼顾**极速响应**与**深度逻辑**的“最好版本”。

---

## 2025 旗舰版通用助手架构图谱

_(此处建议插入架构图)_

---

## 核心架构详解

### 1. 接入与防御层 (Omni-Ingress & Shield)

_不再只是简单的“正则清洗”，而是基于小模型的“语义防火墙”。_

- **多模态规范化：**
  统一处理 Audio/Image/Text。图片通过 VLM（视觉模型）转为结构化描述，避免后续 Token 消耗过大。
- **语义防火墙 (Semantic Firewall)：**
  使用微调过的轻量模型（如 DeBERTa 或专用 Guard model）进行**毫秒级**检测。
- **拦截目标：** 越狱攻击 (Jailbreak)、提示词注入 (Prompt
  Injection)、PII 敏感信息。
- _优势：_ 比用 LLM 检查便宜 100 倍，且不会被“指令覆盖”。

### 2. 智能路由层 (The Semantic Gateway)

_这是系统的核心“调度室”。不再让 LLM 去做简单的分类，而是用向量匹配。_

- **L0：语义缓存 (Semantic Cache)：**
  - 计算用户 Query 的向量。如果与历史高频问答库相似度 > 0.95，直接返回缓存答案。
  - _效果：_ 常见问题延迟 < 50ms，成本为 0。

- **L1：语义路由器 (Semantic Router)：**
  - 使用动态向量索引定义意图（如“写代码”、“查天气”、“闲聊”）。
  - **判定逻辑：**
    - **简单/实时任务** -> 路由至 **快车道 (System 1)**
    - **复杂/推理任务** -> 路由至 **慢车道 (System 2)**

- **代码示例：**

```python
# 伪代码：基于向量的零样本路由
route = router.guide(query, ["fast_chat", "complex_reasoning", "tool_use"])
```

### 3. 上下文工程层 (Dynamic Context Engine)

_重点从“压缩”转向“缓存”。_

- **Prompt Caching (KV Cache)：**
  - 将系统提示词（System Prompt）、长文档、工具定义（Tools
    Definition）固定在 Cache 中。
  - _收益：_ 首字延迟（TTFT）降低 80%，长 Context 输入成本降低 90%。

- **混合检索 (Hybrid RAG)：**
  - **Fact RAG：** 传统的向量检索，查具体数据。
  - **GraphRAG (知识图谱)：**
    针对“总结全库观点”或“跨文档关联”的请求，检索实体关系而非文本片段。
  - _2025 新标准：_ 必须包含 **HyDE
    (假设性文档嵌入)**，先生成虚拟答案再检索，提升召回率。

### 4. 双轨编排层 (The Dual-Track Orchestrator)

这是本架构的**灵魂所在**，将任务按“脑力需求”分流：

**A. 快车道 (System 1 Track) —— 唯快不破**

- **适用场景：** 客服查询、简单文案、即时工具调用。
- **模型选择：** GPT-4o-mini / Claude 3.5 Haiku / Gemini Flash。
- **核心机制：并行工具调用 (Parallel Function Calling)**。
  - _旧模式：_ 查天气 -> 等结果 -> 查机票 -> 等结果。
  - _新模式：_ 一次性分析出需要查“天气”和“机票”，**同时**发出请求。

**B. 慢车道 (System 2 Track) —— 深度推理**

- **适用场景：** 复杂代码重构、数学证明、长链路规划、疑难杂症分析。
- **模型选择：** OpenAI o1/o3 / DeepSeek-R1。
- **核心机制：思维链内化 (Internal CoT)**。
  - **禁止 ReAct：** 不要在 Prompt 里教它“Thinking: ... Action:
    ...”，这会干扰 o1 类模型的原生推理。
  - **只给目标：** 直接给最终目标和工具，让模型自己在隐空间（Latent
    Space）里推演。

### 5. 生成与校验层 (Stream & Guard)

_从“事后校验”进化为“流式阻断”。_

- **原生结构化输出 (Native Structured Outputs)：**
  - 强制模型输出严格符合 JSON Schema。不再依赖 Prompt 里的 "Please return
    JSON"。
  - _效果：_ 格式错误率归零。

- **流式护栏 (Streaming Guardrails)：**
  - 在 Token 生成的同时，异步运行审核模型。
  - 一旦检测到违规（如生成了一半的敏感词），直接掐断流并替换为“抱歉，我无法继续...”，而不是等生成完一段才屏蔽。

---

## 2025 版“落地模块清单”

| 模块             | 推荐技术栈/策略                                   | 核心指标 (KPI)           |
| ---------------- | ------------------------------------------------- | ------------------------ |
| **Ingress**      | **DeBERTa-v3-small** (做分类/安检)                | 拦截率 / 误杀率          |
| **Router**       | **Semantic Router** (Python库) + 向量数据库       | 路由准确率 > 95%         |
| **Context**      | **Redis** (语义缓存) + **Prompt Caching** (API侧) | 缓存命中率 (Cost saving) |
| **Orchestrator** | **LangGraph** 或 **Temporal** (状态机管理)        | 任务完成率 / 步骤数      |
| **RAG**          | **Elasticsearch** (混合检索) + **GraphRAG**       | 检索相关性 (MRR)         |
| **Output**       | **Pydantic** (数据验证) + **Instructor** (库)     | JSON 解析成功率 = 100%   |

---

## 经得起检验的 3 个实战建议

1. **不要迷信“大一统”模型：**
   任何试图用一个 Prompt 解决所有问题的架构都会失败。**路由（Router）决定生死**。把 80% 的简单流量分给便宜的小模型，省下的钱让大模型在 20% 的难点上“火力全开”。

2. **工具定义的质量 > 提示词的质量：** 在 Agent 开发中，花时间优化
   `tool_description`（工具描述）比优化 `system_prompt`
   收益更高。模型是靠看描述来决定怎么用工具的。

3. **拥抱“错误”：** 慢车道（System
   2）必须包含**“自我纠错”**机制。如果代码运行报错，把错误日志原样扔回给模型，让它自己修，通常一次就能修好。
