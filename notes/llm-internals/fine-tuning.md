<!--
- [INPUT]: 依赖 notes/llm-internals/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 微调技术 文档
- [POS]: 位于 notes/llm-internals 模块的 微调技术 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 微调技术

在预训练基础上进行任务适配。

---

## 📝 章节大纲

### 1. 监督微调 (SFT)

- 指令数据构建
- 训练策略
- 灾难性遗忘

### 2. LoRA

- 低秩适配原理
- 秩选择与目标模块
- 合并与部署

### 3. QLoRA

- 4-bit 量化 + LoRA
- 内存效率

### 4. 其他 PEFT 方法

- Adapter
- Prefix Tuning
- Prompt Tuning

### 5. 全参数微调

- 何时使用
- 与 PEFT 对比

### 6. 实践指南

- 超参数选择
- 数据量需求
- 评估方法

---

## 📚 参考资料

- [ ] LoRA: Low-Rank Adaptation of Large Language Models
- [ ] QLoRA: Efficient Finetuning of Quantized LLMs
