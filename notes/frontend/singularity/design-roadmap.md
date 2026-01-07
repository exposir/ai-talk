## 四、“奇点”状态管理系统设计构想

> 本文将这一面向未来的状态管理系统命名为“奇点”(Singularity)。
> 导读：给出设计原则、架构分层与 API 设计。

### 4.1 设计原则

1. **统一抽象**：设计通用「State Node」原语，可表达原子、派生、异步、协作状态
2. **逻辑分离**：把"数据"与"状态机"作为两个正交维度
3. **渐进增强**：简单场景极简 API，复杂场景可插拔扩展
4. **可观测性优先**：所有状态变更可序列化、可回放

### 4.1.1 思想与流派定位

- **思想基底**：统一心智模型、逻辑/数据解耦、可观测优先
- **流派融合**：Signal 细粒度响应 + FSM 流程表达 + CRDT 协作原生
- **差异化**：不是单一范式，而是用一致性语义把多范式收敛到同一原语

**备注**：
- **Signal 细粒度响应**：状态更新只影响订阅该依赖的节点与组件，避免全局重渲染。
- **FSM 流程表达**：用有限状态机显式定义合法状态与转换，减少“不可能状态”。
- **CRDT 协作原生**：协作作为第一等能力，冲突由 CRDT 规则合并而非业务层手工处理，但默认关闭、按需启用。

### 4.1.2 哲学与设计观

奇点的核心哲学是：**状态不是数据集合，而是可验证的变化史**。这意味着设计并不是把“值”放到一个地方，而是构造一套**可以被解释、被审计、被复现**的变化规则。具体体现在四个层面：

1) **可解释性优先于自由度**  
   开发者可以随意写状态，但系统必须能解释“为什么变成这样”。这要求变更路径可追踪（TraceEvent）与逻辑分支可枚举（FSM），否则大型系统只会变成无法推理的“暗箱”。

2) **因果闭环优先于局部便利**  
   许多状态库只关心“能更新”，而忽略“更新因何而起”。奇点要求变更具有因果链条：事件 -> 状态转换 -> 依赖派生 -> 订阅通知。这是确保大规模协作与排错的前提。

3) **一致性语义优先于 API 手感**  
   API 可以很短，但语义必须严格。奇点宁愿牺牲一些表面简洁，也要保证批次、异步取消、协作合并的规则在任何规模下都能成立。

4) **演进性优先于一次性完美**  
   设计必须允许渐进引入复杂度：小项目只用 atom/computed，大项目再引入 machine/async/sync。哲学上承认系统“分层成长”，而非强迫一开始就理解全部。

这套哲学的目标是：**让系统复杂度可视化、可控制、可进化**。不是追求短期的 API 惊艳，而是长期的工程可持续性。
此外，“可观测优先”不是理念口号，而是硬性设计约束，必须体现在 TraceEvent 与调度语义中。

### 4.2 技术选型

- **响应式核心**：基于 Signal 的细粒度订阅
- **逻辑层**：借鉴 XState 的 Statechart，但更轻量
  - **协作层**：按需集成 Yjs 适配器，默认关闭
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

### 4.5 React 并发模式兼容性

> ⚠️ **关键挑战**：Signal 与 React Concurrent Mode 的兼容性是项目成败的关键。

#### 问题分析

Signal 的核心是"细粒度更新"，绕过 React 的 VDOM Diff。但 React 18+ 的并发特性依赖调度器控制，Signal 直接更新可能导致：

- **Tearing（撕裂）**：并发渲染中读到不一致的状态
- **Suspense 边界失效**：异步状态与 Suspense 集成困难
- **Transition 优先级被绕过**：`useTransition` 无法正常工作

#### 解决方案：强制使用 `useSyncExternalStore`

```typescript
import { useSyncExternalStore } from 'react';

export function useAtom<T>(atom: Atom<T>): T {
  return useSyncExternalStore(
    atom.subscribe, // 订阅函数
    atom.get,       // 客户端快照
    atom.get,       // 服务端快照 (SSR)
  );
}
```

**优势**：
- 与 React Concurrent Mode 完全兼容
- 自动处理 tearing 问题
- 服务端渲染安全

**代价**：
- 回退到同步渲染（de-opt from time-slicing）
- 需要通过 Selector 优化弥补性能损耗

#### 兼容性矩阵

| React 特性           | useAtom (安全模式) | 备注                     |
| :------------------- | :----------------: | :----------------------- |
| Concurrent Rendering |         ✅         | 通过 useSES 保证         |
| Suspense             |         ✅         | atomAsync 需特殊处理     |
| useTransition        |         ✅         | 需配合 Selector          |
| SSR/RSC              |         ✅         | Store 隔离保证           |

#### Selector 优化（必须）

为弥补同步渲染带来的性能损耗，强制使用细粒度 Selector：

```typescript
// ❌ 不推荐：订阅整个大对象
const store = useAtom(bigStore);

// ✅ 推荐：只订阅需要的切片
const count = useAtom(bigStore, (s) => s.count);
```

核心库应内置 Selector 的浅比较 (Shallow Compare) 逻辑。

### 4.6 迁移策略

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

### 5.1 版本规划概览

| 版本   | 周期      | 核心能力                          | 风险等级 |
| :----- | :-------- | :-------------------------------- | :------- |
| v0.1   | Week 1-4  | atom/computed/batch/effect + React| 低       |
| v0.2   | Week 5-8  | atomAsync (缓存/取消)             | 中       |
| v0.3   | Week 9-12 | machine (状态机)                  | 低       |
| v1.0   | Week 13-16| DevTools + 完整文档               | 中       |
| v1.1   | Week 17+  | atomSync (CRDT 协作) - **可选**   | **高**   |

> ⚠️ **关键决策**：CRDT 协作层（atomSync）风险最高，建议作为 v1.1 独立发布，不阻塞 v1.0。

### 5.2 API 分层策略

```
Level 0 (必学)：atom, computed, batch        → 覆盖 80% 场景
Level 1 (按需)：effect, atomAsync            → 异步与副作用
Level 2 (进阶)：machine                       → 复杂业务流程
Level 3 (专业)：atomSync, createStore        → 协作与 SSR
```

**设计原则**：新用户只需理解 Level 0 即可完成大多数小项目，进阶功能"按需解锁"。

### 5.3 详细路线图

具体实施细节与验收标准见附录：

- [实现路线图 (工程级细化)](./appendices.md#附录-b-实现路线图-工程级细化)
- [里程碑与验收标准](./appendices.md#附录-d-里程碑与验收标准-工程版)

### 5.4 Kill Criteria（项目终止条件）

> 明确"何时应该放弃或收缩范围"，避免无限拖延。

| 检查点 | Kill Criteria                                      | 后续动作             |
| :----- | :------------------------------------------------- | :------------------- |
| M0     | atom/computed 性能不及 Jotai 80%                   | 重新评估技术选型     |
| M0     | React 适配器与 Concurrent Mode 无法兼容            | 切换到 useSES 方案   |
| M1     | atomAsync 无法实现取消旧请求语义                   | 收缩为只做 Core      |
| M2     | 状态机与 atom 产生不可预测副作用                   | 降级为可选扩展       |
| M4     | Yjs 集成包体积超 50KB                              | CRDT 推迟到 v2       |
| M4     | 5 人以上协作性能严重劣化                           | CRDT 推迟到 v2       |
| 全局   | v0.2 后试点反馈"比 Zustand 更复杂"                | 重新评估项目定位     |
| 全局   | TanStack Store 发布且覆盖 80%+ 目标                | 评估是否继续         |
