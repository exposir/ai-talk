<!--
- [INPUT]: 依赖 notes/llm-internals/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 长上下文 文档
- [POS]: 位于 notes/llm-internals 模块的 长上下文 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 长上下文

扩展 LLM 上下文窗口的技术。

---

## 📝 章节大纲

### 1. 长上下文的挑战

- 注意力复杂度 O(n²)
- 内存限制
- 位置编码外推

### 2. 位置编码扩展

- RoPE 插值
- YaRN
- 动态 NTK

### 3. 注意力优化

- Sliding Window
- Dilated Attention
- Ring Attention

### 4. 压缩方法

- Landmark Attention
- StreamingLLM
- LongRoPE

### 5. 检索增强

- RAG 结合长上下文
- 混合方案

### 6. 评估方法

- Needle in a Haystack
- Long-range Benchmark

---

## 📚 参考资料

- [ ] Extending Context Window of LLMs via Positional Interpolation
- [ ] YaRN: Efficient Context Window Extension
- [ ] StreamingLLM: Efficient Streaming LLMs with Attention Sinks
