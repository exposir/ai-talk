# 术语与常见问题

> Singularity 相关术语解释与常见问题解答。

---

## 一、术语表

| 术语         | 解释                       |
| :----------- | :------------------------- |
| **Atom**     | 最小的可追踪状态单元       |
| **Computed** | 派生状态，自动追踪依赖     |
| **Effect**   | 副作用，依赖变化时自动执行 |
| **Batch**    | 批量更新，合并多次变更     |
| **History**  | 状态变化历史记录           |
| **Signal**   | 细粒度响应式原语           |

---

## 二、常见问题

### Q1: 为什么不用 Zustand/Jotai？

**A**:
Singularity 的核心差异是**内置追踪**。Zustand/Jotai 需要额外配置才能追踪状态变化，而 Singularity 开箱即用。

### Q2: 和 Redux 有什么区别？

**A**:
Redux 功能强大但复杂（Action/Reducer），Singularity 保持简单（一行代码创建状态），同时提供追踪能力。

### Q3: 生产环境追踪会影响性能吗？

**A**: 不会。生产模式下追踪功能完全禁用：

```typescript
if (process.env.NODE_ENV !== 'production') {
  // 只在开发模式记录
}
```

### Q4: 服务端状态怎么管理？

**A**: 使用 React Query。Singularity 专注于客户端状态，与 React Query 完美配合。

### Q5: 需要复杂状态机怎么办？

**A**: 使用 XState。Singularity 不做状态机，专注核心能力。

### Q6: history() 会导致内存泄漏吗？

**A**: 不会。历史记录限制 100 条，超出自动丢弃旧记录。

---

## 三、最佳实践

### ✅ 推荐

```typescript
// 简单状态
const count = atom(0);

// 派生状态
const double = computed(() => count.get() * 2);

// 组件使用
function App() {
  const value = useAtom(count);
  return <div>{value}</div>;
}
```

### ❌ 避免

```typescript
// 不要在 computed 中修改状态
const bad = computed(() => {
  count.set(1); // ❌ 错误
  return count.get();
});

// 不要存储大对象（如 DOM 节点）
const node = atom(document.body); // ❌ 不推荐
```

---

_术语与 QA v2.0 - 2026-01-08_
