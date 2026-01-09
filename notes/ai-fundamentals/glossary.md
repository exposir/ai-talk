<!--
- [INPUT]: 依赖 notes/ai-fundamentals/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 AI 术语表 文档
- [POS]: 位于 notes/ai-fundamentals 模块的 AI 术语表 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# AI 术语表

> 常见 AI/LLM 术语解释

---

## 模型架构

| 术语            | 全称                 | 解释                           |
| --------------- | -------------------- | ------------------------------ |
| **LLM**         | Large Language Model | 大语言模型                     |
| **MoE**         | Mixture of Experts   | 混合专家架构，只激活部分参数   |
| **Transformer** | -                    | 基于注意力机制的神经网络架构   |
| **Attention**   | -                    | 注意力机制，让模型关注重要信息 |

---

## 训练方法

| 术语             | 全称                                       | 解释                         |
| ---------------- | ------------------------------------------ | ---------------------------- |
| **Pre-training** | -                                          | 预训练，在大规模语料上学习   |
| **SFT**          | Supervised Fine-Tuning                     | 监督微调，用标注数据调整模型 |
| **RLHF**         | Reinforcement Learning from Human Feedback | 人类反馈强化学习             |
| **DPO**          | Direct Preference Optimization             | 直接偏好优化，RLHF 替代方案  |
| **LoRA**         | Low-Rank Adaptation                        | 低秩适配，高效微调方法       |

---

## 推理与部署

| 术语               | 全称 | 解释                             |
| ------------------ | ---- | -------------------------------- |
| **Inference**      | -    | 推理，模型生成输出的过程         |
| **Quantization**   | -    | 量化，压缩模型减少资源占用       |
| **Context Window** | -    | 上下文窗口，模型能处理的最大长度 |
| **Token**          | -    | 令牌，模型处理文本的基本单位     |
| **Temperature**    | -    | 温度，控制输出随机性             |

---

## 评估指标

| 术语          | 全称                                     | 解释                   |
| ------------- | ---------------------------------------- | ---------------------- |
| **MMLU**      | Massive Multitask Language Understanding | 多任务语言理解测试     |
| **HumanEval** | -                                        | 代码生成能力测试       |
| **GPQA**      | Graduate-Level Google-Proof QA           | 研究生级别推理测试     |
| **Elo**       | -                                        | 类似国际象棋的评分系统 |

---

## 安全与对齐

| 术语              | 全称 | 解释                           |
| ----------------- | ---- | ------------------------------ |
| **Alignment**     | -    | 对齐，让模型行为符合人类价值观 |
| **Alignment Tax** | -    | 对齐税，为安全牺牲的能力       |
| **Jailbreak**     | -    | 越狱，绕过模型安全限制         |
| **Hallucination** | -    | 幻觉，模型生成虚假信息         |
