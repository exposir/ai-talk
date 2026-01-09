<!--
- [INPUT]: 依赖 notes/llm-internals/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 推理优化 文档
- [POS]: 位于 notes/llm-internals 模块的 推理优化 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 推理优化

提高 LLM 推理效率的关键技术。

---

## 📝 章节大纲

### 1. KV Cache

- 原理：缓存注意力计算
- 内存占用分析
- 优化策略

### 2. 量化

- INT8/INT4 量化
- GPTQ、AWQ、GGUF
- 精度与速度权衡

### 3. 投机解码

- 小模型草稿 + 大模型验证
- 加速原理
- 实现方法

### 4. 批处理优化

- Continuous Batching
- PagedAttention (vLLM)
- Dynamic Batching

### 5. 其他技术

- 模型蒸馏
- 剪枝
- 算子融合

### 6. 工具生态

- vLLM
- TensorRT-LLM
- llama.cpp

---

## 📚 参考资料

- [ ] Efficient Memory Management for LLM Serving (PagedAttention)
- [ ] GPTQ: Accurate Quantization for Generative Pre-trained Transformers
