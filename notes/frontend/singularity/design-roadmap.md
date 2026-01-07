## 四、“奇点”状态管理系统设计构想

> 本文将这一面向未来的状态管理系统命名为“奇点”(Singularity)。
> 导读：给出设计原则、架构分层与 API 设计。

### 4.1 设计原则

1. **统一抽象**：设计通用「State Node」原语，可表达原子、派生、异步、协作状态
2. **逻辑分离**：把"数据"与"状态机"作为两个正交维度
3. **渐进增强**：简单场景极简 API，复杂场景可插拔扩展
4. **可观测性优先**：所有状态变更可序列化、可回放

### 4.2 技术选型

- **响应式核心**：基于 Signal 的细粒度订阅
- **逻辑层**：借鉴 XState 的 Statechart，但更轻量
- **协作层**：可选集成 Yjs
- **TypeScript**：类型推断驱动的 API 设计

### 4.2.1 方案对比与取舍

| 方案               | 优势                   | 代价/风险                    | 取舍结论                   |
| :----------------- | :--------------------- | :--------------------------- | :------------------------- |
| **Signal**         | 细粒度更新、性能可预测 | 需要适配 React 等框架调度    | 作为核心响应式原语         |
| **Proxy**          | 写法自然、侵入性低     | 隐式依赖难追踪、调试成本高   | 仅作为可选语法糖           |
| **Observable**     | 异步建模能力强         | 心智负担大、组件集成需胶水层 | 用于异步层，不作为核心状态 |
| **Immutable Tree** | 可预测、利于时间旅行   | 性能与心智成本高             | 用于 DevTools，而非强约束  |

### 4.2.2 竞争优势与必然权衡

- **明显更强**：统一心智模型、逻辑/数据解耦、协作原生、可观测协议
- **可预期劣势**：初期生态不成熟、迁移需要桥接层、概念边界更复杂
- **性能不承诺压倒性领先**：目标是稳定可预测，而非绝对跑分第一

### 4.2.3 与主流方案对比矩阵

| 方案              | 统一心智模型 | 可观测性 | 逻辑/数据解耦 | 协作原生 | 迁移成本 |
| :---------------- | :----------: | :------: | :-----------: | :------: | :------: |
| **Redux Toolkit** |      ◐       |    ●     |       ◐       |    ✕     |    ◐     |
| **Zustand**       |      ◐       |    ◐     |       ✕       |    ✕     |    ●     |
| **Jotai**         |      ◐       |    ◐     |       ✕       |    ✕     |    ◐     |
| **XState**        |      ✕       |    ●     |       ●       |    ✕     |    ◐     |
| **React Query**   |      ✕       |    ●     |       ✕       |    ✕     |    ◐     |
| **Yjs**           |      ✕       |    ◐     |       ✕       |    ●     |    ✕     |
| **奇点**          |      ●       |    ●     |       ●       |    ●     |    ◐     |

> 图例：● 强，◐ 中，✕ 弱。迁移成本越低越好。

### 4.3 API 设计 (MVP)

```typescript
// 梦想中的 API
import { atom, machine, atomAsync, atomSync } from 'singularity';

// 1. 原子状态 (like Jotai)
const countAtom = atom(0);

// 2. 声明式状态机 (like XState, 但更简洁)
const authMachine = machine({
  initial: 'idle',
  states: {
    idle: { on: { LOGIN: 'loading' } },
    loading: { on: { SUCCESS: 'authenticated', FAILURE: 'error' } },
    authenticated: { on: { LOGOUT: 'idle' } },
    error: { on: { RETRY: 'loading' } },
  },
});

// 3. 服务端状态 (like React Query, 但统一 API)
const userAtom = atomAsync(fetchUser, { key: 'user:1' });

// 4. 协作状态 (CRDT built-in)
const docAtom = atomSync({ title: '', content: '' }, { id: 'doc:1' });
```

### 4.4 架构分层

```
┌─────────────────────────────────────────────────────────┐
│                    Framework Adapters                    │
│              (React / Vue / Svelte / Solid)             │
├─────────────────────────────────────────────────────────┤
│                     State Layer                          │
│   ┌─────────────┬─────────────┬─────────────────────┐  │
│   │  Atom Core  │  Machine    │  Sync (CRDT)        │  │
│   │  (Signal)   │  (FSM)      │  (Yjs Integration)  │  │
│   └─────────────┴─────────────┴─────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   Scheduler & Effects                    │
│            (Batching, Async, Subscriptions)             │
├─────────────────────────────────────────────────────────┤
│                    DevTools Protocol                     │
│         (Time Travel, State Inspector, Logging)         │
└─────────────────────────────────────────────────────────┘
```

### 4.5 迁移策略

- **兼容层**：提供对 Redux/Zustand/Jotai 的读取适配
- **分域迁移**：从非核心模块开始替换，支持并行运行
- **共存期**：提供桥接工具，允许旧状态与新状态互操作

#### 迁移示例 (Redux -> State Node)

```typescript
// legacy store
const legacyStore = configureStore({ reducer });

// bridge: read-only snapshot to State Node
const legacyState = fromStore(() => legacyStore.getState(), legacyStore.subscribe);
```

---


## 五、实施路线图

> 导读：将实现拆成阶段，便于里程碑管理与风险控制。

