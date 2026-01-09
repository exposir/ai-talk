<!--
- [INPUT]: 依赖 notes/llm-internals/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 MoE 架构 文档
- [POS]: 位于 notes/llm-internals 模块的 MoE 架构 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# MoE 架构

混合专家模型的原理与实现。

---

## 📝 章节大纲

### 1. MoE 基础

- 稀疏激活原理
- 专家与路由器
- 计算效率优势

### 2. 路由机制

- Top-K 路由
- 负载均衡
- 辅助损失

### 3. 典型实现

- Switch Transformer
- Mixtral 8x7B
- DeepSeek-MoE

### 4. 训练挑战

- 专家坍缩
- 路由不稳定
- 通信开销

### 5. 推理优化

- Expert Parallelism
- 专家缓存
- 动态加载

### 6. 与 Dense 模型对比

| 方面     | Dense | MoE |
| -------- | ----- | --- |
| 计算效率 | 低    | 高  |
| 参数效率 | 高    | 中  |
| 训练难度 | 低    | 高  |
| 内存需求 | 低    | 高  |

---

## 📚 参考资料

- [ ] Switch Transformers: Scaling to Trillion Parameter Models
- [ ] Mixtral of Experts
- [ ] DeepSeekMoE: Towards Ultimate Expert Specialization
