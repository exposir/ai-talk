---

# 模块 1：框架架构原理 (Framework Architecture Principles)

> **模块导读**：本模块深入现代前端框架的底层运行机制。作为架构师，不应仅停留在 API 使用层面，而需理解框架的
> **Reconciler（协调器）**、**Renderer（渲染器）** 以及 **Reactivity（响应式）**
> 模型。这将决定你在面对性能瓶颈时的优化手段，以及技术选型的深度依据。

---

## 1. React 架构体系

### 1.1 核心概念：Fiber 架构

React 16+ 引入的核心架构，将同步的递归渲染改为异步的可中断渲染。

- **架构节点 (Nodes)**：
- **Scheduler (调度器)**：计算任务优先级，requestIdleCallback 的 polyfill。
- **Reconciler
  (协调器)**：找出 UI 变化的组件（Diff 算法），构建 Fiber 树。此阶段可中断。
- **Renderer (渲染器)**：将变化同步到宿主环境（ReactDOM, React
  Native）。此阶段不可中断。
- **Fiber Node**：虚拟 DOM 的升级版，本质是链表结构，包含 `return`, `child`,
  `sibling` 指针。

- **数据流向 (Flow)**： `Trigger Update` → `Scheduler (Priority)` →
  `Reconciler (Render Phase/Loop)` → `Commit Phase` → `DOM Update`
- **架构师视点 (Deep Dive)**：
- **双缓存树 (Double Buffering)**：内存中同时存在 `current` 树和
  `workInProgress` 树。更新在 WIP 树上进行，完成后直接指针互换，避免页面闪烁。
- **代数效应 (Algebraic
  Effects)**：Hooks 的实现基础，允许函数在执行过程中暂停并恢复（如
  `Suspense`）。

### 1.2 核心概念：Hooks 实现原理

- **架构节点**：
- **Dispatcher**：根据挂载(Mount)或更新(Update)阶段分发不同的 Hook 实现。
- **MemoizedState**：链表结构，存储 Hook 的状态。

- **关键机制**：
- **链表顺序**：Hooks 必须在循环/条件语句外调用，因为 React 完全依赖**调用顺序**来映射 State 和 Component。
- **闭包陷阱**：`useEffect` 或 `useCallback`
  捕获了旧的 Props/State，导致逻辑错误。需正确管理依赖数组。

### 1.3 前沿：React Server Components (RSC)

- **架构变化**：
- **Client Components**：传统的 React 组件，在浏览器运行。
- **Server
  Components**：在服务端运行，直接访问 DB/FS，序列化为 JSON 发送给前端，**无 Bundle 体积**。

- **交互流程**： `Browser Request` → `Server: Render RSC to JSON` →
  `Browser: Stream & Parse` → `Reconcile with Client Tree`

---

## 2. Vue 架构体系 (Vue 3)

### 2.1 核心概念：响应式系统 (Reactivity)

- **架构节点**：
- **Proxy**：拦截对象读写操作（替代 Vue 2 的 `Object.defineProperty`）。
- **Dep (Dependency)**：依赖收集器，使用 `Set` 存储副作用。
- **Effect**：副作用函数（如组件渲染函数、computed、watch）。

- **数据流向**：
- **Track (读)**：`Get Property` → `Track()` → `Dep.add(Effect)`
- **Trigger (写)**：`Set Property` → `Trigger()` → `Dep.forEach(run Effect)`

### 2.2 核心概念：编译时优化 (Compiler Optimization)

Vue 的独特优势在于它是一个“编译时 + 运行时”的框架。

- **架构节点**：
- **Compiler**：将 Template 编译为 Render Function。
- **PatchFlags**：编译时生成的标记（如 `TEXT`, `CLASS`,
  `PROPS`），标记哪些部分是动态的。
- **Block Tree**：配合 PatchFlags，Diff 算法只比对动态节点，忽略静态节点。

- **架构师视点**：
- **静态提升 (Static
  Hoisting)**：静态节点被提升到渲染函数之外，只创建一次，后续复用。
- **基于形状的优化**：相比 React 的全量 Diff，Vue 通过编译时信息将 Diff 复杂度从 O(n) 降低到 O(n
  dynamic)。

---

## 3. 现代架构模式对比

### 3.1 运行时 vs 编译时 (Runtime vs Compile-time)

- **重运行时 (React)**：
- **特点**：极度灵活，JS 即 View。
- **代价**：浏览器需要下载并执行大量运行时代码（Scheduler, Diff
  Algo），初始化负荷大。

- **重编译时 (Svelte/Solid)**：
- **特点**：No Virtual DOM。在构建阶段将代码转换为直接操作 DOM 的命令。
- **优势**：极小的 Bundle 体积，极快的更新速度。

### 3.2 信号机制 (Signals)

- **代表**：SolidJS, Preact Signals, Vue Ref, Angular Signals。
- **原理**：细粒度的响应式更新。
- **对比 React**：
- **React**：State 变化 → 组件重执行 → Diff → 更新 DOM。
- **Signals**：Signal 变化 → 直接更新绑定的 DOM 节点（组件不重执行）。

- **趋势**：React 依然坚持 Pull 模型，而其他框架都在转向 Push (Signals) 模型。

### 3.3 岛屿架构 (Islands Architecture)

- **代表**：Astro, Fresh。
- **核心理念**：默认输出纯 HTML（0 KB
  JS），只对需要交互的组件（岛屿）进行“注水”（Hydration）。
- **架构价值**：极大地优化了首屏性能（FCP/LCP），适合内容型网站（博客、文档、营销页）。

---

## 4. 超大型项目选型指南 (Strategic Guide)

> **场景设定**：300万行代码，200+ 开发者，生命周期 5 年+。

### 4.1 选型决策矩阵

| 维度         | React                 | Vue                   | 架构师建议                                                        |
| ------------ | --------------------- | --------------------- | ----------------------------------------------------------------- |
| **灵活性**   | ⭐⭐⭐⭐⭐ (极高)     | ⭐⭐⭐ (中等)         | 需要高度定制化架构（如自研渲染引擎、复杂表单设计器）选 React。    |
| **规范性**   | ⭐⭐ (依赖团队规范)   | ⭐⭐⭐⭐ (框架强制)   | 团队水平参差不齐、人员流动大，Vue 的模版语法能保证下限。          |
| **生态系统** | ⭐⭐⭐⭐⭐ (统治级)   | ⭐⭐⭐⭐ (丰富)       | 需要使用特定的企业级库（如某些复杂的 Grid/Chart）时，React 优先。 |
| **TS 支持**  | ⭐⭐⭐⭐⭐ (原生亲和) | ⭐⭐⭐⭐ (Volar 加持) | 300万行项目必须全量 TS。React 的 JSX 类型推导更自然。             |
| **性能上限** | 需要手动优化 (Memo)   | 自动优化 (Compiler)   | React 容易写出性能瓶颈，需要设立严格的 Code Review 和性能监控。   |

### 4.2 架构治理策略

1. **框架锁定与收敛**：

- 严禁一个项目中混用多种框架（微前端除外）。
- 锁定大版本，建立统一的 `UI Kit` 封装底层组件，隔离框架 API 变动风险。

2. **性能预算 (Performance Budget)**：

- 大型 React 项目必须实施：
- **严格的 Memoization 策略**。
- **Context 拆分**：避免一个 Context 包含过多不相关数据导致全量重渲染。

3. **开发者体验 (DX)**：

- React 项目推荐使用 **RSC** 或 **Next.js** 架构，利用服务端能力减轻客户端负担。
- Vue 项目利用 **Composition API**
  提取复用逻辑（Composables），避免 Mixins 导致的代码黑洞。

---

### [Next Step]

**Would you like me to proceed to "Module 2: State Management Architecture"?**
(This will cover Redux, Zustand, MobX, Context, and Server State strategies for
large-scale apps.)
