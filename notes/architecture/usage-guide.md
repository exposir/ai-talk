<!--
- [INPUT]: 依赖 notes/architecture/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 2025 双引擎架构接入与使用指南 文档
- [POS]: 位于 notes/architecture 模块的 2025 架构接入与使用指南 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 2025 双引擎架构接入与使用指南 (Integration & Usage Guide)

本指南定义了**控制平面 (Control Plane)**
与客户端之间的交互契约。所有请求必须严格遵循此 Envelope 结构以确保安全性与语义路由的正确执行。

## 1. 统一接入协议 (The Envelope)

为了实现“指令与数据”的物理隔离，API 不接受单一字符串输入，必须使用结构化 JSON。

```json
// POST /v1/agent/invoke
{
  "request_id": "req_12345abc",
  "auth_context": {
    "user_id": "u_999",
    "tenant_id": "t_001",
    "scopes": ["read:weather", "write:code"]
  },
  "instruction_segments": [
    {
      "type": "text",
      "content": "帮我分析这份财报的关键风险点，并对比去年的数据。"
    }
  ],
  "data_segments": [
    {
      "type": "file_ref",
      "mime_type": "application/pdf",
      "content": "s3://bucket/2024_report.pdf",
      "description": "2024年财报"
    },
    {
      "type": "text_block",
      "content": "2023年净利润为5000万美元...",
      "source_url": "https://example.com/2023-report"
    }
  ],
  "policy_overrides": {
    "max_cost_usd": 0.5,
    "force_router": "system_2" // 可选：强制走慢车道
  }
}
```

---

## 2. 调用模式 (Usage Patterns)

### 场景 A：快车道 (System 1) - 几毫秒的响应

适用于：客服问答、天气查询、简单数据提取。

- **特征**：Router 识别为 "Simple"，不触发复杂推理。
- **Response**:
  ```json
  {
    "status": "completed",
    "router_decision": "system_1",
    "content": "根据 2024 财报，关键风险点在于...",
    "usage": { "total_tokens": 450, "cost": 0.00015 }
  }
  ```

### 场景 B：慢车道 (System 2) - 深度思考

适用于：代码重构、复杂逻辑推演、长文档生成。

- **特征**：Router 识别为 "Complex"，系统自动注入 `thinking_process`。
- **Streaming Response** (Server-Sent Events):

  ```
  event: thought
  data: {"step": "analyzing_pdf", "status": "processing"}

  event: thought
  data: {"step": "comparing_data", "details": "Found mismatch in Q3"}

  event: content_delta
  data: "经过深入对比，发现主要风险..."
  ```

---

## 3. Python SDK 集成示例

```python
from dual_engine import AgentClient

client = AgentClient(api_key="sk-...")

# 1. 准备不可信数据 (Data)
report_data = client.upload_file("./2024_report.pdf")

# 2. 发送指令 (Instruction)
response = client.invoke(
    instruction="分析这份报告的风险",
    data=[report_data],
    policy={"temperature": 0.2} # 严谨模式
)

# 3. 处理结果 (含路由信息)
if response.router_mode == "system_2":
    print(f"深度思考耗时: {response.latency_ms}ms")
    print(f"思维链: {response.thoughts}")

print(f"最终答案: {response.content}")
```

---

## 4. 最佳实践 (Best Practices)

1.  **不要拼接 Prompt**：永远不要把用户的问题拼接成 "You are a helpful
    assistant... User asking: {query}"。请使用 `instruction_segments`。
2.  **显式声明数据源**：如果用户粘贴了一段文本，请放入 `data_segments` 而不是
    `instruction`，这能有效防止 Prompt Injection。
3.  **使用 Request ID**：在 Trace 系统中通过 `request_id` 串联 Ingress -> Router
    -> Agent -> Tool Gateway 的全链路日志。
