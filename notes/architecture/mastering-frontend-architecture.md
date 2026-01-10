# 前端架构师进阶学习路线 (Mastering Frontend Architecture)

<!--
- [INPUT]: 依赖 无
- [OUTPUT]: 输出 前端架构进阶学习路线
- [POS]: 位于 notes/architecture 模块的 前端架构进阶学习路线
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

本文档基于 `frontend-arch-visual-tool.md`
提炼而成，旨在为有志于成为前端架构师的开发者提供一条清晰、结构化的进阶路径。

## 📍 学习阶段总览

| 阶段            | 核心目标                                       | 关键词                                  |
| :-------------- | :--------------------------------------------- | :-------------------------------------- |
| **P1 深入原理** | 掌握框架与状态管理的底层逻辑，知其然知其所以然 | React Fiber, VDOM, Recoil, Redux        |
| **P2 架构模式** | 跳出单一框架，掌握普适性的软件架构设计方法论   | DDD, Clean Arch, Design Patterns        |
| **P3 工程基建** | 驾驭大规模代码库，构建高效的开发与交付体系     | Monorepo, CI/CD, Build Tools            |
| **P4 系统设计** | 应对复杂业务与高性能挑战，具备宏观架构能力     | Micro-frontends, Performance, Stability |

---

## 🎯 P1: 深入原理 (Deep Dive)

### 1.1 现代框架原理 (Framework Internals)

目标：不再把框架当黑盒，理解设计权衡。

- [ ] **React**
  - [ ] 掌握 Virtual DOM 与 Diff 算法的演进
  - [ ] 深入理解 **Fiber 架构**：时间切片、优先级调度、双缓存
  - [ ] 掌握 **Hooks 实现原理**：链表结构、闭包陷阱、依赖收集
  - [ ] 理解 **并发模式 (Concurrent Mode)** 与 Suspense
  - [ ] 探索 React Server Components (RSC) 的运行机制
- [ ] **Vue**
  - [ ] 掌握 **响应式系统**：Proxy vs Object.defineProperty
  - [ ] 理解编译器优化：静态提升、Block Tree、Patch Flags
  - [ ] 深入 Composition API 的设计哲学
- [ ] **现代框架对比**
  - [ ] 运行时 (React) vs 编译时 (Svelte/Vue) 的权衡
  - [ ] 细粒度更新 (Signals - SolidJS/Preact/Qwik)

### 1.2 状态管理架构 (State Management Analysis)

目标：根据业务场景选择最合适的状态管理方案，而非盲从主流。

- [ ] **Flux 体系**
  - [ ] 深入 **Redux**：单一数据源、纯函数 Reducer、中间件机制
  - [ ] 理解 **Command** 模式与 **Event Sourcing** 思想在 Redux 中的体现
- [ ] **原子化状态**
  - [ ] 掌握 **Recoil/Jotai**：自下而上的状态派生，解决 Context 渲染穿透
- [ ] **响应式/代理**
  - [ ] 掌握 **MobX/Valtio**：可变数据与自动依赖追踪
- [ ] **状态机**
  - [ ] 学习 **XState**：处理复杂流程（支付、审批），防止非法状态转换
- [ ] **服务端状态**
  - [ ] 掌握 **React Query/SWR**：缓存策略、去重、竞态处理、乐观更新

---

## 🏗️ P2: 架构模式 (Architecture Patterns)

### 2.1 领域驱动设计 (Domain-Driven Design, DDD)

目标：解决业务逻辑复杂、代码混乱的问题，实现业务与 UI 解耦。

- [ ] **核心概念**
  - [ ] 限界上下文 (Bounded Context)：划分团队与业务边界
  - [ ] 实体 (Entity) vs 值对象 (Value Object)
  - [ ] 聚合 (Aggregate) 与 聚合根
- [ ] **前端实践**
  - [ ] 领域层 (Domain Layer)：纯粹的业务逻辑（Hooks/Classes）
  - [ ] 基础设施层 (Infra Layer)：API 请求、本地存储隔离
  - [ ] 应用层 (App Layer)：连接 UI 与 Domain
  - [ ] **实战**：尝试在一个复杂模块中剥离 UI 组件中的 `useEffect` 和逻辑

### 2.2 整洁架构 (Clean Architecture)

目标：构建可测试、易维护、框架无关的应用。

- [ ] **分层架构**
  - [ ] 依赖规则 (Dependency Rule)：依赖只能指向内部 (Core)
  - [ ] 实体层 → 用例层 → 适配器层 → 框架层
- [ ] **关键技术**
  - [ ] **依赖倒置 (DIP)** &
        **依赖注入 (DI)**：InversifyJS 或简单的 Context 注入
  - [ ] 端口与适配器 (Ports & Adapters / Hexagonal)
  - [ ] ViewModel 模式：隔离视图与数据模型

### 2.3 设计模式 (Design Patterns)

目标：识别通用问题，运用经典解法。

- [ ] **创建型**：单例 (Logger, Config)、工厂 (Component Factory)
- [ ] **结构型**：代理 (Proxy State)、适配器 (API Adapter)、装饰器 (HOC)
- [ ] **行为型**：观察者 (Event Bus)、策略 (Form Validation)、命令 (Undo/Redo)

---

## ⚙️ P3: 工程基建 (Engineering Infrastructure)

### 3.1 单一代码仓库 (Monorepo)

目标：管理数百万行代码的依赖与协作。

- [ ] **工具链**
  - [ ] **pnpm workspace**：硬链接节省磁盘，严格的依赖管理
  - [ ] **Turborepo**：任务编排、远程缓存、增量构建
  - [ ] **Nx**：深度依赖图分析、受影响 (Affected) 测试/构建
- [ ] **最佳实践**
  - [ ] 代码共享：UI 库、Utils 库、Config 库的拆分
  - [ ] 版本控制：Changesets 自动发版
  - [ ] 权限管理：CODEOWNERS 机制

### 3.2 构建工具 (Build Systems)

目标：极速的开发体验与优化的生产产物。

- [ ] **Vite**
  - [ ] 原理：ESM Dev Server, Pre-bundling, Rollup Build
  - [ ] 插件开发：编写自定义 Vite 插件
- [ ] **Webpack (Legacy & Deep)**
  - [ ] Module Federation 原理
  - [ ] Loader 与 Plugin 机制
- [ ] **Rspack / Turbopack**
  - [ ] 了解 Rust 构建工具带来的性能变革

---

## 🚀 P4: 系统设计与优化 (System Design & Optimization)

### 4.1 微前端架构 (Micro-frontends)

目标：解耦巨石应用，实现独立部署与技术栈无关。

- [ ] **主流方案**
  - [ ] **qiankun (基座模式)**：HTML Entry,沙箱隔离 (Snapshot/Proxy)
  - [ ] **Module Federation (去中心化)**：运行时依赖共享
  - [ ] **Micro App (Web Components)**
- [ ] **核心挑战**
  - [ ] JS 沙箱与 CSS 隔离机制
  - [ ] 应用间通信 (Event Bus, Props)
  - [ ] 公共依赖复用与版本冲突解决

### 4.2 性能架构 (Performance Architecture)

目标：极致的用户体验。

- [ ] **加载性能**
  - [ ] 路由懒加载与组件拆分 (Code Splitting)
  - [ ] 资源预加载 (Preload/Prefetch)
  - [ ] HTTP/2 与 HTTP/3 特性利用
- [ ] **渲染性能**
  - [ ] 避免重排重绘 (Reflow/Repaint)
  - [ ] Web Worker 耗时计算卸载
  - [ ] 虚拟列表 (Virtual List) 处理长列表
- [ ] **核心指标 (Core Web Vitals)**
  - [ ] LCP (最大内容绘制)
  - [ ] INP (交互延迟)
  - [ ] CLS (布局偏移)

### 4.3 稳定性与监控 (Stability & Monitoring)

目标：先于用户发现问题。

- [ ] **错误监控**：Sentry 部署、SourceMap 管理
- [ ] **埋点系统**：行为追踪路径
- [ ] **灰度发布**：A/B Testing, Feature Flags
- [ ] **降级容错**：Error Boundary, Service Worker 离线降级

---

## 📚 推荐阅读资源

1. **书籍**
   - _Clean Code / Clean Architecture_ (Robert C. Martin)
   - _Domain-Driven Design_ (Eric Evans)
   - _Refactoring_ (Martin Fowler)
2. **经典文章/文档**
   - React 官方文档 (Thinking in React)
   - patterns.dev (前端设计模式)
   - martinfowler.com (微前端、架构模式)

---

> **建议**：架构能力的提升不在于记忆知识点，而在于**实践与权衡**。请在实际项目中尝试引入上述 1-2 个概念（如在一个模块中尝试 DDD 分层，或优化构建流程），并在实践中不断修正理解。
