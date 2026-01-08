# Singularity 重新定位：更聚焦的方案

> 基于用户反馈，重新思考项目定位。不做"大而全"，而做"小而美"。

---

## 问题诊断：当前方案的致命缺陷

### 缺陷 1：试图替代所有库

```typescript
// 当前设计试图做这些：
atom()           // 替代 Zustand/Jotai
atomAsync()      // 替代 React Query
machine()        // 替代 XState
atomSync()       // 替代 Yjs

// 结果：每一个都不如专业库做得好
```

**问题**：没有明确的"杀手级特性"，只是"把现有库缝合在一起"。

---

### 缺陷 2：与 Jotai 太相似

| 特性 | Jotai | Singularity (当前) |
|:-----|:------|:-------------------|
| atom | ✅ | ✅ |
| computed | ✅ (派生 atom) | ✅ |
| effect | ❌ (通过 onMount) | ✅ |
| 细粒度更新 | ✅ | ✅ |
| 独特价值 | 原子化最佳实践 | ❓ 不明确 |

**问题**：与 Jotai 功能重叠 80%，但生态远不如它。

---

### 缺陷 3：缺少核心哲学

当前设计的哲学是什么？**"统一心智模型"** → 这不是哲学，这是目标。

**好的哲学示例**：
- Redux: "单一数据源 + 不可变更新 + 纯函数"
- XState: "状态机是数学，不是代码"
- React Query: "服务端状态是缓存，不是应用状态"
- Solid.js: "细粒度响应式优于 VDOM"

Singularity 的哲学是什么？**目前不清晰。**

---

## 重新定位：Singularity 2.0

### 核心洞察

**观察 1**: Zustand/Jotai 解决了"数据"问题
**观察 2**: XState 解决了"流程"问题
**观察 3**: 但它们的组合很别扭

```typescript
// 现状：数据和逻辑割裂
const store = create((set) => ({
  count: 0,
  status: 'idle',
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

// 业务逻辑散落在各处
useEffect(() => {
  if (count > 100) {
    setStatus('overflow');
  }
}, [count]);
```

**痛点**：
1. 业务规则散落在 useEffect 中
2. 逻辑难以测试和复用
3. 状态约束容易被忽略

---

### 新的核心哲学

> **状态 = 数据 + 规则 + 副作用**

- **数据层**: atom/computed (Signal)
- **规则层**: when/unless/guard (声明式约束)
- **副作用层**: effect (自动执行)

---

### 新的 API 设计

#### 1. 基础层 (不变)

```typescript
// 数据
const count = atom(0);
const double = computed(() => count.get() * 2);

// 副作用
effect(() => {
  console.log('count:', count.get());
});

// 批处理
batch(() => {
  count.set(10);
  count.set(20);
});
```

#### 2. 规则层 (核心创新)

```typescript
// when: 当条件满足时，执行动作
when(() => count.get() > 100, () => {
  count.set(100); // 自动限制上限
});

// unless: 除非条件满足，否则阻止操作
const safeSet = guard(count, {
  unless: (value) => value < 0 || value > 100,
  onReject: (value) => console.warn('Invalid value:', value),
});

safeSet(150); // 被拒绝，count 不变

// rule: 声明式约束
const validated = rule(count, {
  validate: (v) => v >= 0 && v <= 100,
  onInvalid: (v) => Math.max(0, Math.min(100, v)), // 自动修正
});

validated.set(150); // 自动变成 100
```

#### 3. 组合层 (优雅的组合)

```typescript
// 场景：表单验证
const email = atom('');
const password = atom('');

const isEmailValid = computed(() => /\S+@\S+\.\S+/.test(email.get()));
const isPasswordValid = computed(() => password.get().length >= 8);

const canSubmit = computed(() =>
  isEmailValid.get() && isPasswordValid.get()
);

// 规则：防止无效提交
const submit = guard(() => {
  console.log('Submitting...');
}, {
  unless: () => !canSubmit.get(),
  onReject: () => alert('Please fix errors'),
});

// 使用
submit(); // 如果表单无效，自动拒绝
```

---

### 与现有方案对比

| 特性 | Zustand | Jotai | XState | Singularity 2.0 |
|:-----|:--------|:------|:-------|:----------------|
| 细粒度更新 | ❌ | ✅ | ❌ | ✅ |
| 声明式规则 | ❌ | ❌ | ✅ (FSM) | ✅ (Rule) |
| 学习成本 | ⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| 包体积 | 1KB | 2KB | 15KB | **~3KB** |
| 核心哲学 | 极简 | 原子化 | 状态机 | **数据+规则** |

---

### 砍掉的部分

| 功能 | 理由 | 替代方案 |
|:-----|:-----|:---------|
| ❌ atomAsync | React Query 做得更好 | 用 React Query |
| ❌ atomSync (CRDT) | Yjs 做得更好 | 用 Yjs |
| ❌ 完整 FSM | XState 做得更好 | 简化为规则引擎 |
| ❌ DevTools (v1.0) | 不是核心竞争力 | v1.1 再考虑 |

---

### 保留的核心

| 功能 | 优先级 | 说明 |
|:-----|:-------|:-----|
| ✅ atom/computed | P0 | Signal 细粒度响应式 |
| ✅ batch | P0 | 性能优化 |
| ✅ effect | P0 | 副作用管理 |
| ✅ when/unless/guard | **P0** | **核心创新** |
| ✅ React 适配器 | P0 | useSyncExternalStore |
| ⚠️ Vue 适配器 | P1 | v1.0 后考虑 |

---

## 新的价值主张

### 一句话定位

> **Singularity: 带声明式规则的 Signal 状态库**

### 三个核心优势

1. **比 Zustand 更细粒度** - Signal 级别的精确更新
2. **比 Jotai 更有逻辑** - 声明式规则层
3. **比 XState 更轻量** - 3KB vs 15KB，学习成本低

---

## 使用场景对比

### ❌ 不适合的场景

```typescript
// 复杂状态机 → 用 XState
const auth = createMachine({ /* 10+ states */ });

// 服务端状态 → 用 React Query
const user = useQuery({ queryKey: ['user'] });

// 多人协作 → 用 Yjs
const doc = new Y.Doc();
```

### ✅ 适合的场景

```typescript
// 场景 1: 表单验证 + 业务规则
const form = {
  email: atom(''),
  age: atom(0),
};

when(() => form.age.get() < 18, () => {
  alert('Must be 18+');
});

// 场景 2: 带约束的计数器
const count = atom(0);
const bounded = guard(count, {
  unless: (v) => v < 0 || v > 100,
});

// 场景 3: 购物车逻辑
const cart = atom([]);
const total = computed(() =>
  cart.get().reduce((sum, item) => sum + item.price, 0)
);

when(() => total.get() > 1000, () => {
  applyDiscount(0.1);
});
```

---

## 技术实现简化

### 包结构（极简）

```
packages/
├── core/           # @singularity/core (~3KB)
│   ├── atom.ts
│   ├── computed.ts
│   ├── batch.ts
│   ├── effect.ts
│   ├── rule.ts     # when/unless/guard
│   └── index.ts
│
└── react/          # @singularity/react (~1KB)
    ├── useAtom.ts
    └── index.ts
```

### 路线图（4 周完成 v1.0）

| 周 | 任务 | 产出 |
|:---|:-----|:-----|
| Week 1 | atom/computed/batch | Core 基础 |
| Week 2 | when/unless/guard | 规则引擎 |
| Week 3 | React 适配器 + 测试 | 可用版本 |
| Week 4 | 文档 + Demo + 性能优化 | v1.0 发布 |

---

## 竞争分析（更诚实）

### 与 Jotai 对比

| 维度 | Jotai | Singularity 2.0 | 胜负 |
|:-----|:------|:----------------|:-----|
| 原子化 | ✅ | ✅ | 平 |
| 细粒度 | ✅ | ✅ | 平 |
| 生态 | ⭐⭐⭐⭐⭐ | ⭐ | **败** |
| 规则层 | ❌ | ✅ | **胜** |
| 学习成本 | ⭐⭐ | ⭐⭐ | 平 |
| 包体积 | 2KB | 3KB | 平 |

**结论**：如果你需要声明式规则，用 Singularity；否则用 Jotai。

---

### 与 Zustand 对比

| 维度 | Zustand | Singularity 2.0 | 胜负 |
|:-----|:--------|:----------------|:-----|
| 极简 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **败** |
| 细粒度 | ❌ | ✅ | **胜** |
| 规则层 | ❌ | ✅ | **胜** |
| 学习成本 | ⭐ | ⭐⭐ | **败** |
| 包体积 | 1KB | 3KB | **败** |

**结论**：如果你需要性能和规则，用 Singularity；否则用 Zustand。

---

## 最终判断

### 这个方案值得做吗？

| 问题 | 答案 | 理由 |
|:-----|:-----|:-----|
| 能否实现？ | ✅ **能** | 技术难度低，4 周可完成 |
| 面向未来？ | ✅ **能** | Signal 是趋势 |
| 性能优秀？ | ✅ **能** | 细粒度更新 + 3KB 体积 |
| 有人会用？ | ⚠️ **不确定** | 需要真实项目验证 |

### 成功的关键

**必须满足以下条件之一**，才值得做：

1. ✅ **你自己会在生产环境用** - 最重要
2. ⚠️ 有明确的企业内部需求
3. ⚠️ 社区有明确呼声

**如果以上都不满足，不如直接用 Jotai + React Query + XState 组合。**

---

## 行动建议

### 方案 A: 做极简版（推荐）

```
目标：4 周完成 v1.0
范围：atom + computed + when/unless + React
验证：在你自己的 1-2 个项目中使用
决策：如果 3 个月后觉得好用，继续；否则放弃
```

### 方案 B: 不做（务实）

```
理由：
- 现有库组合已经足够好
- 投入产出比不高
- 社区不缺状态管理库

替代方案：
- 小项目：Zustand
- 大项目：Jotai + React Query
- 复杂逻辑：+ XState
```

---

## 我的诚实建议

**如果你问我该不该做**：

1. **如果你自己有强烈的需求，做** - 自己用得爽是第一位的
2. **如果只是想做一个开源项目，不做** - 状态管理库已经太多了
3. **如果想学习底层原理，做 MVP** - 4 周做完就够了，不要追求完美

**关键判断标准**：

```
做这个库，是因为：
A. 我自己需要 ✅ → 做
B. 我想练手学习 ✅ → 做 MVP
C. 我想做一个流行的开源库 ❌ → 不做
```

---

## 新的定位总结

**Singularity 2.0**:
- **不是**: 大而全的状态管理方案
- **而是**: 带声明式规则的轻量 Signal 库
- **目标**: 解决 "数据 + 业务规则" 的组合问题
- **竞争**: 不与 React Query/XState/Yjs 竞争，专注核心价值
- **体积**: ~3KB (core) + ~1KB (react)
- **时间**: 4 周完成 v1.0

**一句话**: 如果你需要**细粒度更新 + 声明式规则**，用 Singularity；否则用 Zustand/Jotai。

---

_文档创建于 2026-01-08_
