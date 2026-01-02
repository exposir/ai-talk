# 开源模型

主流开源大语言模型架构分析。

---

## 📝 章节大纲

### 1. LLaMA 系列

- LLaMA 1: RoPE, SwiGLU, RMSNorm
- LLaMA 2: GQA, 扩展上下文
- LLaMA 3: 更大规模

### 2. Mistral

- Sliding Window Attention
- 高效架构设计
- Mixtral (MoE 版本)

### 3. Qwen 系列

- Qwen 1/1.5/2/2.5/3
- 多模态扩展
- 中文优化

### 4. DeepSeek

- DeepSeek-V2/V3
- MLA (Multi-head Latent Attention)
- MoE 架构

### 5. 其他模型

- Gemma (Google)
- Phi (Microsoft)
- Yi (01.AI)

### 6. 架构对比

| 模型    | 注意力    | 位置编码 | 激活函数 | 归一化  |
| ------- | --------- | -------- | -------- | ------- |
| LLaMA   | GQA       | RoPE     | SwiGLU   | RMSNorm |
| Mistral | GQA + SWA | RoPE     | SwiGLU   | RMSNorm |
| Qwen    | GQA       | RoPE     | SwiGLU   | RMSNorm |

---

## 📚 参考资料

- [ ] LLaMA: Open and Efficient Foundation Language Models
- [ ] Mistral 7B
- [ ] Qwen Technical Report
