# Singularity 状态管理库

> **天生简单，天生可追踪**

Singularity 是一个极简的 React 状态管理库，结合了 Zustand 的简单性、Redux 的可追踪性和 Jotai 的细粒度更新。

---

## 核心理念

> **「状态不是数据集合，而是可验证的变化史」**

每一次状态变化都有迹可循，每一个 bug 都能追溯到源头。

---

## 为什么选择 Singularity？

| 需求       | Zustand | Redux     | Jotai | **Singularity** |
| :--------- | :------ | :-------- | :---- | :-------------- |
| 极致简单   | ✅      | ❌ 复杂   | ✅    | ✅ **更简单**   |
| 可追踪     | ❌ 无   | ✅ 需配置 | ❌ 无 | ✅ **开箱即用** |
| 细粒度更新 | ❌      | ❌        | ✅    | ✅              |
| 体积       | 2.8KB   | 16KB      | 3.5KB | **~4KB**        |

**Singularity = Zustand 的简单 + Redux 的追踪 + Jotai 的细粒度**

---

## 快速开始

### 安装

```bash
npm install @singularity/core @singularity/react
```

### 基本用法

```typescript
import { atom } from '@singularity/core';
import { useAtom } from '@singularity/react';

// 1. 创建状态（一行代码）
const count = atom(0);

// 2. 在组件中使用
function Counter() {
  const value = useAtom(count);
  return (
    <button onClick={() => count.set(v => v + 1)}>
      Count: {value}
    </button>
  );
}

// 3. 查看变化历史（开发模式）
console.log(count.history());
// [{ from: 0, to: 1, time: '2026-01-08T16:00:00Z' }]
```

**就这么简单。**

---

## 核心 API

| API             | 用途           | 示例                                             |
| :-------------- | :------------- | :----------------------------------------------- |
| `atom(value)`   | 创建可追踪状态 | `const count = atom(0)`                          |
| `computed(fn)`  | 创建派生状态   | `const double = computed(() => count.get() * 2)` |
| `effect(fn)`    | 响应变化       | `effect(() => console.log(count.get()))`         |
| `batch(fn)`     | 批量更新       | `batch(() => { a.set(1); b.set(2) })`            |
| `useAtom(atom)` | React Hook     | `const value = useAtom(count)`                   |

**5 个 API，覆盖 90% 场景。**

---

## 内置追踪

```typescript
const user = atom({ name: 'Alice', age: 25 });

user.set((prev) => ({ ...prev, age: 26 }));
user.set((prev) => ({ ...prev, name: 'Bob' }));

// 查看完整变化历史
console.log(user.history());
// [
//   { from: { name: 'Alice', age: 25 }, to: { name: 'Alice', age: 26 }, time: '...' },
//   { from: { name: 'Alice', age: 26 }, to: { name: 'Bob', age: 26 }, time: '...' },
// ]

// 回到任意时刻
user.restore(0); // 恢复到第一个状态
```

**不需要 Redux DevTools，不需要任何配置。**

---

## 与其他库配合

```typescript
// 客户端状态 → Singularity
const theme = atom('dark');
const sidebar = atom(true);

// 服务端状态 → React Query
const { data: user } = useQuery({ queryKey: ['user'] });

// 复杂状态机 → XState
const [state, send] = useMachine(authMachine);
```

**Singularity 专注客户端状态，与其他库和谐共处。**

---

## 文档目录

### 入门

- [核心概念](./problems-vision.md)
- [API 规格](./specs-core.md)

### 进阶

- [设计与路线图](./design-roadmap.md)
- [开发实施文档](./IMPLEMENTATION.md)

### 参考

- [术语与 QA](./terminology-qa.md)
- [性能与调试](./performance-devtools.md)
- [现有库调研](./landscape.md)

---

## 项目状态

| 模块                              | 状态      | 说明      |
| :-------------------------------- | :-------- | :-------- |
| Core (atom/computed/effect/batch) | 🚧 开发中 | v0.1 目标 |
| TraceEvent (可追踪)               | 🚧 开发中 | v0.1 目标 |
| React 适配器                      | 🚧 开发中 | v0.1 目标 |
| Vue 适配器                        | ⏳ 计划中 | v1.0 目标 |
| DevTools UI                       | ⏳ 计划中 | v1.0 目标 |

---

## 贡献

欢迎 PR 和 Issue！

---

## License

MIT
