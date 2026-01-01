# 2025 通用助手编排参考架构（强化版）

> 本架构基于“双引擎”分层思路，重点补齐了**信任边界、权限仲裁、证据防火墙、工具网关、输出安全处理、轨迹级评测闭环**等生产级安全与稳定性要素。

---

## 最佳版总览：把系统分成“控制平面”和“数据平面”

**关键前提**：LLM 天生很难在同一上下文里可靠区分“指令 vs 数据”，因此 prompt
injection 无法被“彻底修复”。更现实的是通过系统设计做“限权/隔离/审计/降级”。

### 数据流（推荐的最小闭环）

1. **Ingress（接入/规范化）**
2. **Risk Tagger（风险打标）** → Only tags & evidence, no direct rejection here.
3. **Policy Engine（策略与权限仲裁，控制平面核心）**
4. **Router（意图 + 工作流模板选择）**
5. **Context Builder（上下文工程：指令/证据/工具严格分区）**
6. **Agent Loop（有界工具环：Plan → Call → Observe）**
7. **Tool Gateway（工具网关：参数校验 + 完全仲裁 + 最小权限）**
8. **Answer Generator（输出模式选择）**
9. **Output Handling（输出安全处理：不信任模型输出）**
10. **Validator + One Retry（硬校验优先，失败一次低温重试）**
11. **Tracing + Eval Loop（轨迹日志 + 回归评测 + 线上监控）**

---

## 0) 补齐的三块核心防线

### A. 信任边界要系统化：Evidence Firewall（证据防火墙）

RAG/网页/工具返回都属于**不可信数据**，只能进入“证据槽位”，**永远不能变成新指令**。这是对抗 Prompt
Injection 与 RAG Poisoning 的核心。

### B. 工具必须“完全仲裁”：Complete Mediation + 最小权限

**模型永远不负责授权**。授权发生在 Tool Gateway
/ 下游系统，且强制最小权限、避免开放式工具（如 run shell / fetch url）。(OWASP
LLM06 Excessive Agency)

### C. 输出也不可信：LLM05 Improper Output Handling

模型输出如果未经验证/转义就进入浏览器、SQL、Shell、模板渲染，会带来 XSS/SSRF/提权/RCE 风险。

---

## 1) 最佳版架构模块详解

### 1. Ingress（输入接入层）

**目标**：把输入变成“结构化片段”，物理隔离“用户意图”和“用户数据”。 **做法**：

- 规范化处理（自然语言、代码块、表格、URL、附件）。
- 产出统一 Envelope：
  - `user_instruction_segments[]`
  - `user_data_segments[]`
  - `attachments[]`
  - `auth_scopes`, `sensitivity_level`

### 2. Risk Tagger（风险与合规初筛）

**输出**：`risk_labels[] + risk_score + rationale_evidence`
**标签建议**：注入风险、数据敏感 (PII)、高危动作、资源消耗风险。

### 3. Policy Engine（控制平面核心：风险 → 动作）

将 Risk + 租户配置 + 用户权限转化为**可执行约束**。 **典型输出 (Policy)**：

- `allowed_tools_allowlist`
- `max_tool_calls`, `max_wall_time_ms`
- `force_structured_output`
- `temperature_profile`
- `require_user_confirmation_for_actions[]`

### 4. Router（意图 + 工作流模板）

1. **Intent Classifier**
2. **Workflow Selector**（选择预定义模板，如 `qa_with_citations`,
   `doc_summarize`, `code_write_and_test`）。

### 5. Context Builder（上下文工程：三段式 + 强分隔）

1. **Instruction Context（可信）**：系统指令、拒绝策略。
2. **Tool Context（可信）**：工具清单、Schema。
3. **Knowledge/Evidence Context（不可信）**：全部包裹在 `EVIDENCE BLOCK`
   里，只允许引用。

### 6. Retrieval（RAG：检索流水线）

- **流程**：Query rewrite -> Hybrid retrieve -> Rerank -> Dedupe -> Repack。
- **增强**：Contextual Retrieval (Anthropic), 抗 RAG Poisoning (入库审计)。

### 7. Agent / Orchestrator（有界工具环）

**硬约束**：

- `max_steps` (e.g. 3-8)
- `total_wall_time_budget`
- 每一步携带 Policy。
- 每次调用经 Tool Gateway 校验。

### 8. Tool Gateway（工具网关）

**五大关键动作**：

1. **Schema 校验**。
2. **Complete Mediation**：授权在网关，模型无权决定。
3. **最小权限**：Scope 仅限本任务。
4. **高危动作强制审批**。
5. **速率与预算控制**。

### 9. Answer Generator

- 利用 `temperature_profile` 控制生成多样性。
- **Structured Outputs**：优先使用 JSON Schema。

### 10. Output Handling（输出安全处理）

- `render_safe_html/markdown`
- `sql_safe` (参数化)
- `command_safe` (白名单)

### 11. Validator + One Retry

- **硬校验**：Schema 完整性、引用真实性。
- **软校验**：LLM-as-a-judge 辅助。

### 12. Tracing + Eval Loop

**轨迹级评测**：评测每一步工具调用、检索命中、失败降级。利用 OpenAI Evals 框架。

---

## 2) Perf/Cost（Prompt Caching 工程化）

- **缓存命中要求**：前缀完全一致。
- **策略**：
  1. 固定前缀：系统指令 + 工具/输出 Schema。
  2. 证据/RAG 放后面。
  3. 检索缓存：同 Query + 同权限范围复用。

---

## 3) 落地“P0/P1”清单

### P0（核心必做）

- Policy Engine (Gating)
- Evidence Firewall (证据隔离)
- Tool Gateway (权限控制)
- Output Handling (输出清洗)
- 资源预算控制
- Structured Outputs

### P1（优化项）

- Contextual Retrieval + Rerank
- 抗 RAG Poisoning
- 轨迹级评测
- Prompt Caching 治理
