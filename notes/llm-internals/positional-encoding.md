# 位置编码

让 Transformer 理解序列顺序的关键技术。

---

## 📝 章节大纲

### 1. 为什么需要位置编码

- 自注意力的置换不变性
- 序列顺序信息的重要性

### 2. 绝对位置编码

- 正弦位置编码 (Sinusoidal)
- 可学习位置编码 (Learned)

### 3. 相对位置编码

- Relative Position Bias
- T5 的相对位置编码

### 4. 旋转位置编码 (RoPE)

- 原理与数学推导
- 在 LLaMA、Qwen 中的应用

### 5. ALiBi

- 无需训练的位置推广
- 长度外推能力

### 6. 对比与选择

| 方法       | 外推能力 | 计算开销 | 典型模型         |
| ---------- | -------- | -------- | ---------------- |
| Sinusoidal | 差       | 低       | 原始 Transformer |
| RoPE       | 中       | 低       | LLaMA, Qwen      |
| ALiBi      | 好       | 低       | BLOOM            |

---

## 📚 参考资料

- [ ] RoFormer: Enhanced Transformer with Rotary Position Embedding
- [ ] ALiBi: Train Short, Test Long
