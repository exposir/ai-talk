<!--
- [INPUT]: 依赖 notes/llm-internals/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 Transformer 架构 文档
- [POS]: 位于 notes/llm-internals 模块的 Transformer 架构 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Transformer 架构

Transformer 模型的核心原理和组件详解。

---

## 📝 章节大纲

### 1. 背景与动机

- RNN/LSTM 的局限性
- 并行化需求
- 长距离依赖问题

### 2. 整体架构

- 编码器-解码器结构
- 仅解码器架构 (GPT)
- 仅编码器架构 (BERT)

### 3. 核心组件

- 自注意力机制 (Self-Attention)
- 多头注意力 (Multi-Head Attention)
- 前馈神经网络 (FFN)
- 残差连接与层归一化

### 4. 数学公式

```
Attention(Q, K, V) = softmax(QK^T / √d_k)V
```

### 5. 实现细节

- Pre-Norm vs Post-Norm
- 激活函数选择 (ReLU, GELU, SwiGLU)

---

## 📚 参考资料

- [ ] Attention Is All You Need (2017)
- [ ] The Illustrated Transformer
