# 性能与调试

> Singularity 的性能目标与调试能力。

---

## 一、性能目标

| 指标          | 目标                 |
| :------------ | :------------------- |
| 包体积        | 生产 ~3KB, 开发 ~4KB |
| atom 读写     | ≥ Jotai 80%          |
| computed 计算 | ≥ Jotai 80%          |
| 内存开销      | 历史限制 100 条      |

---

## 二、性能优化

### 2.1 生产模式零追踪开销

```typescript
if (process.env.NODE_ENV !== 'production') {
  // 只在开发模式记录历史
  history.push({ from, to, time: Date.now() });
}
```

### 2.2 批处理优化

```typescript
batch(() => {
  a.set(1);
  b.set(2);
  c.set(3);
}); // 只触发一次更新
```

### 2.3 惰性计算

```typescript
const expensive = computed(() => heavyCalculation());
// 只在 .get() 时计算，依赖不变时使用缓存
```

---

## 三、调试能力

### 3.1 内置历史追踪

```typescript
const count = atom(0);
count.set(1);
count.set(2);

console.log(count.history());
// [
//   { from: 0, to: 1, time: 1704700000000 },
//   { from: 1, to: 2, time: 1704700001000 },
// ]
```

### 3.2 状态恢复

```typescript
count.restore(0); // 恢复到第一个状态
```

### 3.3 DevTools（v1.0 计划）

- 时间线面板
- 状态快照
- 可视化回放

---

_性能与调试 v2.0 - 2026-01-08_
