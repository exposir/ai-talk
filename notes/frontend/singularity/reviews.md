# 第三方评论与分析

> 本文件用于收集和整理对 Singularity 项目的第三方评论、分析和反馈。

---

## 评论 #1: AI 深度分析报告

**评论者**: Gemini AI Assistant  
**日期**: 2026-01-08  
**类型**: 综合分析

---

### 一、项目概览

**Singularity（奇点）**
是一个雄心勃勃的前端状态管理库设计文档，旨在解决当前前端生态中状态管理方案"范式割裂"的核心痛点。

| 维度         | 描述                                             |
| :----------- | :----------------------------------------------- |
| **愿景**     | 用统一心智模型覆盖本地/服务端/协作状态           |
| **核心卖点** | Signal 细粒度响应 + FSM 流程表达 + CRDT 协作原生 |
| **设计哲学** | 状态不是数据集合，而是可验证的变化史             |

---

### 二、文档结构分析

项目包含 **13 个文档文件**，组织清晰，覆盖从调研到实施的完整链条：

```
singularity/
├── README.md                 # 入口与目录
├── landscape.md              # 现有库全景扫描 (679行，最详尽)
├── problems-vision.md        # 问题诊断与愿景
├── design-roadmap.md         # 设计原则与路线图
├── terminology-qa.md         # 术语定义与问答
├── api-governance.md         # API 语义与版本策略
├── specs-core.md             # 核心 API 规格
├── specs-advanced.md         # 状态机与协作层规格
├── performance-devtools.md   # 性能与开发者工具
├── validation-release.md     # 验证与发布
├── ops-community.md          # 运维与社区
├── appendices.md             # 附录与工程模板
└── references.md             # 参考资源
```

---

### 三、核心问题诊断（亮点）

文档精准抓住了当前状态管理的**六大痛点**：

#### 1. 范式割裂 (Paradigm Fragmentation)

> Zustand 管本地、React Query 管服务端、XState 管逻辑、Yjs 管协作——需要"组合拳"

#### 2. 抽象层级混乱

| 库          | 问题                 |
| :---------- | :------------------- |
| Redux       | 抽象太重，概念繁多   |
| Context API | 抽象太轻，性能灾难   |
| Signal      | 抽象太底层，黑魔法   |
| MobX        | 抽象太隐式，调试困难 |

#### 3. 服务端/客户端状态二元对立

> "这个数据是服务端的还是客户端的？我该 `useQuery` 还是 `useState`？"

#### 4. 逻辑与数据的强耦合

#### 5. 时间旅行的代价（不可变数据约束）

#### 6. 多人协作是 afterthought

---

### 四、技术方案评估

#### 4.1 核心架构

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

#### 4.2 API 设计评价

**目标 API 示例：**

```typescript
// 1. 原子状态 (like Jotai)
const countAtom = atom(0);

// 2. 状态机 (like XState，但更简洁)
const authMachine = machine({
  initial: 'idle',
  states: { idle: { on: { LOGIN: 'loading' } }, ... }
});

// 3. 服务端状态 (like React Query)
const userAtom = atomAsync(fetchUser, { key: 'user:1' });

// 4. 协作状态 (CRDT built-in)
const docAtom = atomSync({ title: '', content: '' }, { id: 'doc:1' });
```

> **评价**：API 设计务实，采用渐进增强策略 (`atom` → `atomAsync` →
> `atomSync`)，协作能力默认关闭、按需启用。

---

### 五、优势与创新点

- ✅ **统一心智模型**：用 `State Node` 统一原语覆盖所有场景
- ✅ **可观测性优先**：内建 `TraceEvent` 协议，状态变更可序列化、可回放、可审计
- ✅ **逻辑与数据解耦**：状态机只管流程，atom 只管数据，通过 effect 连接
- ✅ **完整的技术规格**：从 API 签名、语义边界、错误处理到边界案例都有明确定义

---

### 六、潜在风险与挑战

| 风险                | 描述                           | 建议                             |
| :------------------ | :----------------------------- | :------------------------------- |
| ⚠️ 时间表过于乐观   | 10 周完成全部功能几乎不可能    | M0 周期翻倍，CRDT 作为 v1.1 目标 |
| ⚠️ 统一心智模型悖论 | 抽象足够通用时复杂度逼近 Redux | 明确"不统一什么"                 |
| ⚠️ Signal vs React  | 与并发特性的兼容性存疑         | 需专门讨论 React 适配挑战        |
| ⚠️ 缺少失败条件     | 只定义成功路径                 | 增加 Kill Criteria 章节          |

---

#### 6.1 风险详解与解决方案

##### ⚠️ 风险 1：时间表过于乐观

**问题分析**：

- 10 周从零实现 Core + Machine + Async + Sync + React Adapter +
  DevTools 几乎不可能
- 每一层都有隐藏的复杂度，尤其是 CRDT 协作层和 DevTools 时间旅行
- 缺少测试、文档、边界案例处理的时间预留

**解决方案**：

```
┌─────────────────────────────────────────────────────────────────┐
│                    分阶段发布策略                                 │
├─────────────────────────────────────────────────────────────────┤
│  v0.1 (Week 4-6)     │ atom/computed/batch/effect + React Hook  │
│  v0.2 (Week 8-10)    │ atomAsync + 缓存/取消语义                 │
│  v0.3 (Week 12-14)   │ machine + effect 生命周期                 │
│  v1.0 (Week 18-20)   │ DevTools 面板 + 完整文档                  │
│  v1.1 (Week 24+)     │ atomSync + CRDT 协作 (独立发布)           │
└─────────────────────────────────────────────────────────────────┘
```

**具体措施**：

1. **MVP 优先**：v0.1 只做 `atom/computed/batch`，不做任何高级功能
2. **功能门控**：使用 feature flag 隔离未完成功能
3. **缓冲区**：每个里程碑预留 30% 的时间应对意外复杂度
4. **并行开发**：DevTools 可在核心稳定后由独立贡献者推进

---

##### ⚠️ 风险 2：统一心智模型的悖论

**问题分析**：

- 历史教训：Redux 试图统一一切，结果 Action/Reducer/Middleware/Selector/Thunk 概念爆炸
- 抽象越通用，概念开销越大，最终失去"简单"的初衷
- "万能抽象"往往意味着"万能复杂"

**解决方案**：

**明确"不统一什么"——划定边界**：

| 场景           |    是否纳入奇点    | 理由                     |
| :------------- | :----------------: | :----------------------- |
| 全局/模块状态  |      ✅ 核心       | 主战场                   |
| 服务端缓存状态 |    ✅ atomAsync    | 统一心智模型的关键       |
| 协作状态       | ✅ atomSync (可选) | 按需启用，不强制         |
| **表单状态**   |     ❌ 不纳入      | React Hook Form 已足够好 |
| **动画状态**   |     ❌ 不纳入      | Framer Motion 专业领域   |
| **路由状态**   |     ❌ 不纳入      | TanStack Router 已解决   |
| **表格状态**   |     ❌ 不纳入      | TanStack Table 专业领域  |

**设计原则**：

```typescript
// ✅ 好的边界：奇点管"数据流"，不管"领域特化"
const formState = useForm(); // 用 React Hook Form
const tableState = useTable(); // 用 TanStack Table
const appState = atom({ user: null }); // 用奇点

// ❌ 不要试图：
const form = atom({ fields: {}, errors: {}, touched: {} }); // 重复造轮子
```

**API 分层策略**：

```
Level 0 (必学)：atom, computed, batch        → 覆盖 80% 场景
Level 1 (按需)：effect, atomAsync            → 异步与副作用
Level 2 (进阶)：machine                       → 复杂业务流程
Level 3 (专业)：atomSync, createStore        → 协作与 SSR
```

---

##### ⚠️ 风险 3：Signal vs React 调和机制

**问题分析**：

- Signal 的核心是"细粒度更新"，绕过 React 的 VDOM Diff
- 但 React 18+ 的并发特性 (`useTransition`, `Suspense`,
  `useDeferredValue`) 依赖调度器控制
- Signal 直接更新可能导致：
  - 并发渲染中的 tearing（撕裂）问题
  - Suspense 边界失效
  - Transition 优先级被绕过

**解决方案**：

**方案 A：拥抱 `useSyncExternalStore`（推荐）**

```typescript
// React 18 官方推荐的外部状态订阅方式
import { useSyncExternalStore } from 'react';

export function useAtom<T>(atom: Atom<T>): T {
  return useSyncExternalStore(
    atom.subscribe, // 订阅函数
    atom.get, // 客户端快照
    atom.get, // 服务端快照 (SSR)
  );
}
```

**优势**：

- 与 React Concurrent Mode 完全兼容
- 自动处理 tearing 问题
- 服务端渲染安全

**方案 B：提供可选的"激进模式"**

```typescript
// 对于不需要并发特性的场景，提供更高性能的直接绑定
import { useAtomFast } from '@singularity/react/fast';

// ⚠️ 文档警告：此模式不保证与 Suspense/Transition 兼容
const value = useAtomFast(atom);
```

**兼容性矩阵**：

| React 特性           | useAtom (安全模式) | useAtomFast (激进模式) |
| :------------------- | :----------------: | :--------------------: |
| Concurrent Rendering |         ✅         |    ⚠️ 可能 tearing     |
| Suspense             |         ✅         |    ⚠️ 边界可能失效     |
| useTransition        |         ✅         |    ❌ 优先级被绕过     |
| SSR/RSC              |         ✅         |           ✅           |
| 性能                 |        良好        |          极致          |

---

##### ⚠️ 风险 4：缺少失败条件定义

**问题分析**：

- 路线图只定义了"怎样算成功"，没有定义"何时该放弃"
- 没有 Kill Criteria 会导致项目无限拖延或过度投入

**解决方案**：

**制定明确的 Kill Criteria（项目终止条件）**：

```markdown
## Kill Criteria 检查点

### M0 (Week 4) 检查点

如果以下任一条件成立，重新评估项目：

- [ ] atom/computed 基准性能不及 Jotai 的 80%
- [ ] 依赖追踪机制存在无法解决的循环依赖 bug
- [ ] React 适配器与 Concurrent Mode 无法兼容

### M1 (Week 10) 检查点

如果以下任一条件成立，考虑收缩范围：

- [ ] atomAsync 无法实现"取消旧请求"语义
- [ ] 状态机与 atom 的集成产生不可预测的副作用
- [ ] DevTools 事件协议无法序列化复杂状态

### M2 (Week 16) 检查点 - CRDT 专项

如果以下任一条件成立，将 CRDT 推迟到 v2：

- [ ] Yjs 集成导致包体积超过 50KB
- [ ] 离线合并产生不可恢复的数据冲突
- [ ] 协作性能在 5 人以上场景劣化严重

### 项目级 Kill Criteria

如果以下任一条件成立，停止项目：

- [ ] v0.2 后试点项目反馈"比 Zustand 更复杂"
- [ ] 社区已有方案（如 TanStack Store）覆盖 80%+ 目标
- [ ] 核心维护者精力不足以持续 6 个月
```

**决策流程图**：

```
               ┌─────────────┐
               │  里程碑到达  │
               └──────┬──────┘
                      ▼
            ┌─────────────────┐
            │  检查 Kill Criteria │
            └────────┬────────┘
                     ▼
         ┌───────────┴───────────┐
         │                       │
    全部通过                  有失败项
         │                       │
         ▼                       ▼
   ┌───────────┐         ┌────────────────┐
   │ 继续推进  │         │ 召开评审会议    │
   └───────────┘         └───────┬────────┘
                                 ▼
                    ┌────────────┴────────────┐
                    │                         │
               可修复/可规避              不可解决
                    │                         │
                    ▼                         ▼
             ┌───────────┐            ┌────────────┐
             │ 调整继续  │            │ 收缩/终止  │
             └───────────┘            └────────────┘
```

---

#### 6.2 风险缓解检查清单

| 风险         | 缓解措施                         | 负责人     | 检查时间      |
| :----------- | :------------------------------- | :--------- | :------------ |
| 时间表乐观   | 分阶段发布，每阶段留 30% 缓冲    | 项目负责人 | 每周          |
| 心智模型膨胀 | 维护"不统一列表"，API 分层教学   | 架构师     | 每次 API 变更 |
| React 兼容性 | 强制使用 useSyncExternalStore    | 开发者     | 代码审查      |
| 缺少失败条件 | 维护 Kill Criteria，里程碑后评审 | 项目负责人 | 每个里程碑    |

---

### 七、竞品对比矩阵

| 方案          | 统一心智模型 | 可观测性 | 逻辑/数据解耦 | 协作原生 | 迁移成本 |
| :------------ | :----------: | :------: | :-----------: | :------: | :------: |
| Redux Toolkit |      ◐       |    ●     |       ◐       |    ✕     |    ◐     |
| Zustand       |      ◐       |    ◐     |       ✕       |    ✕     |    ●     |
| Jotai         |      ◐       |    ◐     |       ✕       |    ✕     |    ◐     |
| XState        |      ✕       |    ●     |       ●       |    ✕     |    ◐     |
| React Query   |      ✕       |    ●     |       ✕       |    ✕     |    ◐     |
| Yjs           |      ✕       |    ◐     |       ✕       |    ●     |    ✕     |
| **奇点**      |      ●       |    ●     |       ●       |    ●     |    ◐     |

> 图例：● 强，◐ 中，✕ 弱

---

### 八、实施路线图评估

| 里程碑 | 原计划  | 建议调整       | 理由                    |
| :----- | :------ | :------------- | :---------------------- |
| **M0** | Week 2  | Week 4         | 可观测性比预期复杂      |
| **M1** | Week 6  | Week 10        | 异步取消语义需充分测试  |
| **M2** | Week 10 | Week 16 / v1.1 | CRDT 应作为独立版本发布 |

---

### 九、文档质量评估

| 维度         |    评分    | 评价                         |
| :----------- | :--------: | :--------------------------- |
| **完整性**   | ⭐⭐⭐⭐⭐ | 几乎涵盖所有主流和小众方案   |
| **深度**     |  ⭐⭐⭐⭐  | 每个库都有核心原理代码示例   |
| **前瞻性**   | ⭐⭐⭐⭐⭐ | "奇点构想"部分有独到见解     |
| **实用性**   |  ⭐⭐⭐⭐  | 快速选择指南、迁移策略务实   |
| **可执行性** |   ⭐⭐⭐   | 路线图较乐观，需更多风险缓冲 |

---

### 十、执行建议

1. **砍掉 50% 的范围**：先做好 `atom` + `computed` + React 适配器
2. **CRDT 作为 v2 目标**：不要在 v1 里冒险
3. **找一个真实项目试点**：用实际反馈驱动迭代
4. **增加竞品跟踪**：Legend-State / TanStack Store 的进展可能改变决策
5. **定义失败条件**：明确何时应该放弃或转向

---

### 十一、结论

**Singularity（奇点）**
是一份**高质量的技术设计文档**，问题诊断精准，方案设计有理有据。其核心价值在于尝试用统一的抽象解决前端状态管理长期存在的"拼凑之痛"。

如果能够分阶段落地、先验证核心原语的稳定性、在真实项目中迭代 API 设计，这个项目有潜力成为前端状态管理领域的重要贡献。

---

## 评论 #2: Antigravity 快速分析简报

**评论者**: Antigravity (Google DeepMind)  
**日期**: 2026-01-08  
**类型**: 快速总结与核心洞察

---

### 1. 项目本质与定位

这是一个**纯设计阶段**的项目（Whitepaper /
RFC），目前包含 13 个文档文件，没有实际的源代码实现。它的核心目标是**统一前端状态管理的心智模型**，试图终结当前状态管理领域的“战国时代”。

- **项目名**：Singularity (奇点)
- **愿景**：用一个统一的抽象原语（State
  Node）同时解决本地状态、服务端缓存、复杂逻辑流（FSM）和多人协作（CRDT）的问题。

### 2. 核心痛点诊断 (Why)

文档 `problems-vision.md` 和 `landscape.md`
非常精准地指出了当前生态的**结构性问题**：

- **范式割裂**：开发者需要同时掌握 Redux (Flux)、React Query
  (服务端状态)、Context (依赖注入)、Zustand (原子化) 等多套逻辑。
- **抽象混乱**：有的太重（Redux），有的太黑盒（MobX），有的太底层（Signal）。
- **二元对立**：服务端状态 vs 客户端状态的割裂。
- **协作困难**：多人实时协作（CRDT）通常是独立的孤岛，无法与主流状态库平滑融合。

### 3. 提出的解决方案 (How)

`design-roadmap.md` 和 `specs-*.md` 提出了一套**分层架构**：

#### 3.1 核心原语：State Node

项目试图用一套统一的 API 覆盖所有场景：

- **`atom<T>`**：基础状态（类似 Jotai/Signal），支持细粒度订阅。
- **`computed<T>`**：派生状态，自动依赖追踪。
- **`machine`**：轻量级有限状态机（类似 XState），用于管理复杂业务逻辑流，实现**数据与逻辑解耦**。
- **`atomAsync`**：内置 React Query 风格的缓存、去重、乐观更新能力。
- **`atomSync`**：按需集成的 CRDT（Yjs）协作状态，解决冲突合并。

#### 3.2 关键技术决策

- **响应式基座**：选择 **Signal** 作为底层机制（高性能、细粒度），而非 React
  Context 或 Redux Selector。
- **可观测性优先**：设计了标准化的 `TraceEvent`
  协议，意味着从第一天起就考虑了 Time Travel 和审计日志。
- **框架无关**：核心层独立，通过适配器（Adapter）支持 React/Vue 等。

### 4. 深度评价

#### ✅ 亮点

1.  **全景视野极佳**：`landscape.md`
    是我见过的最详尽的状态管理生态调研之一，对各个库的优劣分析非常透彻。
2.  **API 设计务实**：它没有试图创造全新的怪异语法，而是借鉴了 Jotai 的原子化 +
    XState 的状态机 + React Query 的异步管理，试图将它们的精华融合。
3.  **渐进式复杂度**：设计允许用户只用最简单的 `atom`，需要时再引入 `machine` 或
    `sync`，避免了“起步即天坑”的问题。

#### ⚠️ 潜在风险与挑战

1.  **“统一”的代价**：历史证明，试图统一一切的库往往会变得极其臃肿（The
    "Super-Framework"
    trap）。如何在支持 CRDT 和 FSM 的同时保持核心库轻量（Tree-shakable）是最大的工程挑战。
2.  **React 并发兼容性**：基于 Signal 的方案在 React Concurrent Mode（尤其是
    `useTransition`,
    `Suspense`）下往往面临 Tearing（撕裂）风险。文档中虽然提到了
    `useSyncExternalStore`，但这部分的实现细节将决定项目的成败。
3.  **实施难度**：路线图（Roadmap）只有 10 周的设计，要完成核心库、DevTools、CRDT 集成和 React 适配，这是极其乐观的估计。

### 5. 总结

**Singularity 是一个极具野心的架构蓝图。**
它不像是一个简单的轮子，而像是对过去 10 年前端状态管理经验的一次**系统性重构与反思**。如果能按设计落地，它将极大地降低构建复杂（尤其是协作型、重逻辑型）应用的门槛。

目前它处于**极其完善的理论论证阶段**，非常适合作为构建大型前端架构的参考标准。

---

### 6. 深度解决方案建议 (Deep Dive Solutions)

针对上述 4.2 节提到的风险，提出具体的架构级解法：

#### 6.1 针对“超级框架陷阱”的模块化策略

为了避免成为下一个臃肿的 "Angular"，必须采用严格的 **Kernel-Extension** 架构：

- **Kernel (Core)**: 仅包含 `atom`, `computed`, `batch`,
  `subscribe`。目标体积控制在 **2KB (gzipped)** 以内。
- **Extensions (独立包)**:
  - **Logic**: State Machine
    (`machine`) 作为一个独立的高阶函数实现，不侵入 core。
  - **Async**: `atomAsync` 通过类似 `atomWithQuery`
    的组合模式实现，而非内置于 core。
  - **Sync**: `atomSync` 单独依赖
    `yjs`，确保不使用协作功能的用户无需承担 CRDT 的打体积。
- **工程化风控**: 在 CI 流水线中建立 Bundle Size
  Budget，core 包超过 3KB 直接阻断发布。

#### 6.2 针对 React 并发模式 (Tearing) 的终极解法

Signal 在 React 中最大的挑战是与 Concurrent Mode 的兼容性：

- **强制 `useSyncExternalStore`**: 这是 React
  18+ 唯一官方认可的外部状态订阅方式。
  - _代价_: 它会迫使组件在状态更新时回退到同步渲染 (De-opt from time-slicing)。
  - _收益_: 彻底消除 UI 撕裂 (Tearing) 和僵尸子组件问题。
- **Selector 优化 (关键优化点)**: 为了弥补同步渲染带来的性能损耗，必须强制用户使用细粒度 Selector。
  - ❌ `useAtom(store)` -> 组件订阅整个大对象
  - ✅ `useAtom(store, s => s.count)` -> 组件只订阅切片
  - 核心库应内置 Selector 的浅比较 (Shallow Compare) 逻辑。

#### 6.3 针对“实施难度”的最小可行性路径 (MVP Strategy)

不要试图一次性造出 XState + React Query + Yjs 的集合体。建议的迭代路径：

- **M1 (Week 1-4) - "Better Zustand"**:
  - 只实现 `atom` + `computed` + React Adapter。
  - **验收标准**: 在 10,000 个动态节点的场景下，更新性能优于 Zustand 20%。
- **M2 (Week 5-8) - "Async Ready"**:
  - 实现 `atomAsync`。
  - **攻坚重点**: 解决 `Suspense` 集成中的 Race Condition 和 Waterfall 问题。
- **M3 (Week 9+) - "Logic & Sync"**:
  - 这才开始引入 `machine` 和
    `sync`。这两个是高级特性，绝大多数 CRUD 应用不需要，不应阻塞 v1.0 发布。

---

---

## 评论 #3: Claude 综合评估报告

**评论者**: Claude (Anthropic)
**日期**: 2026-01-08
**类型**: 可行性分析与文档修订

---

### 一、项目可行性结论

**总体判断：技术上可行，但需大幅收缩范围**

| 模块 | 可行性 | 风险等级 | 建议 |
|:-----|:-------|:---------|:-----|
| **Core** (atom/computed/batch/effect) | ✅ 高 | 低 | 优先实现，Week 1-4 |
| **React 适配器** | ✅ 中 | 中 | 强制 useSyncExternalStore |
| **Async** (atomAsync) | ✅ 中 | 中 | Week 5-8，注意取消语义 |
| **Machine** (状态机) | ✅ 高 | 低 | Week 9-12，借鉴 XState |
| **DevTools** | ✅ 中 | 中 | Week 13-16，可简化 |
| **Sync** (CRDT) | ⚠️ 低 | **高** | **推迟到 v1.1** |

---

### 二、发现的文档问题与修复

| 问题 | 文件 | 修复内容 |
|:-----|:-----|:---------|
| 重复内容 | performance-devtools.md | 删除 17.1 节重复段落 |
| 时间表不现实 | appendices.md | 从 10 周扩展到 20 周 |
| 缺少 Kill Criteria | design-roadmap.md, appendices.md | 添加项目终止条件 |
| React 并发兼容性讨论不足 | design-roadmap.md, specs-core.md | 添加详细解决方案 |
| "统一心智模型"边界模糊 | problems-vision.md | 添加"不统一边界"章节 |
| 缺少项目状态 | README.md | 添加状态表格和风险提示 |
| CRDT 风险未充分说明 | specs-advanced.md | 标注高风险，添加验收条件 |
| QA 不完整 | terminology-qa.md | 添加 3 个关键问题 |

---

### 三、关键技术风险分析

#### 3.1 React 并发模式兼容性（最大风险）

**问题**：Signal 细粒度更新与 React Concurrent Mode 存在天然冲突

**解决方案**：强制使用 `useSyncExternalStore`

```typescript
export function useAtom<T>(atom: Atom<T>): T {
  return useSyncExternalStore(
    atom.subscribe,
    atom.get,
    atom.get, // SSR
  );
}
```

**代价**：回退到同步渲染，需通过 Selector 优化弥补

**验证时机**：M0 阶段必须验证，若失败需切换方案

#### 3.2 CRDT 协作层（高风险）

| 风险点 | 具体表现 | 缓解措施 |
|:-------|:---------|:---------|
| 包体积 | Yjs 约 30-40KB | 独立包，按需引入 |
| 复杂度 | 合并语义难调试 | 充分单元测试 |
| 性能 | 多人场景劣化 | 限制 5 人以下 |

**决策**：推迟到 v1.1 独立发布，不阻塞 v1.0

#### 3.3 竞品威胁

- **TanStack Store**：Tanner Linsley 即将发布，需持续跟踪
- **Legend-State**：Signal 性能标杆，需对标
- **Jotai**：原子化方案成熟，性能基线参考

---

### 四、时间表调整

| 原计划 | 调整后 | 变化 | 理由 |
|:-------|:-------|:-----|:-----|
| M0 Week 2 | M0 Week 4 | +2 周 | 可观测性比预期复杂 |
| M1 Week 6 | M1 Week 8 | +2 周 | 异步取消语义需充分测试 |
| M2 Week 10 | M2 Week 12 | +2 周 | 状态机集成验证 |
| 全部 Week 10 | v1.0 Week 16 | +6 周 | 原计划严重不现实 |
| CRDT 在 v1.0 | CRDT 在 v1.1 | 独立 | 风险太高 |

---

### 五、Kill Criteria 汇总

| 检查点 | 终止条件 | 后续动作 |
|:-------|:---------|:---------|
| M0 | atom/computed 性能不及 Jotai 80% | 重新评估技术选型 |
| M0 | React 适配器与 Concurrent Mode 无法兼容 | 切换到纯 useSES |
| M1 | atomAsync 无法实现取消旧请求语义 | 收缩为只做 Core |
| M2 | 状态机与 atom 产生不可预测副作用 | 降级为可选扩展 |
| M4 | Yjs 集成包体积超 50KB | CRDT 推迟到 v2 |
| M4 | 5 人以上协作性能严重劣化 | CRDT 推迟到 v2 |
| 全局 | v0.2 后试点反馈"比 Zustand 更复杂" | 重新评估项目定位 |
| 全局 | TanStack Store 覆盖 80%+ 目标 | 评估是否继续 |

---

### 六、执行建议

1. **Week 1-4：Core MVP**
   - 实现 atom/computed/batch/effect
   - React useAtom (useSyncExternalStore)
   - 建立基准测试框架
   - **验证 React 并发兼容性**

2. **Week 5-8：Async MVP**
   - 实现 atomAsync
   - 缓存/取消/去重语义
   - Suspense 集成

3. **Week 9-12：Machine MVP**
   - 轻量状态机
   - entry/exit 生命周期
   - 与 atom 集成

4. **Week 13-16：v1.0 发布**
   - DevTools 原型
   - 完整文档
   - 性能报告

5. **Week 17+：v1.1 可选**
   - CRDT 协作层 PoC
   - 仅在验证通过后发布

---

### 七、结论

Singularity 是一个**有价值但需要务实执行**的项目。

**优势**：
- 问题诊断精准，方案设计合理
- 统一心智模型的方向正确
- 渐进增强的 API 设计务实

**风险**：
- 原时间表严重不现实
- React 并发兼容性需验证
- CRDT 协作层复杂度高

**建议**：
- 砍掉 CRDT，专注 Core + Async + Machine
- 在真实项目中验证
- 持续跟踪竞品动态

**最终判断**：**可以开始写代码**，从 `atom/computed/batch` 最小实现开始。

---

_（如有其他第三方评论，请在下方追加）_
