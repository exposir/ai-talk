## 附录 A、技术方案与实施纲要 (可直接用于开发)

### 方案概述

- **定位**：以统一心智模型覆盖本地/异步/协作状态
- **核心能力**：细粒度响应 + 可预测调度 + 可观测协议
- **跨框架**：核心无框架依赖，适配层对接 React/Vue

### 核心模块与职责

| 模块 | 责任 | 关键接口 |
| :--- | :--- | :------- |
| **Core** | 原语、依赖图、订阅 | `atom/computed/batch/effect` |
| **Async** | 缓存/去重/取消 | `atomAsync` |
| **Machine** | 逻辑流与状态转移 | `machine` |
| **Sync** | 协作与合并 | `atomSync` |
| **DevTools** | 事件与快照 | `TraceEvent/TraceExport` |
| **Adapters** | 框架订阅适配 | `useAtom/useAtomRef` |

### 调度与一致性细则

- **批次快照**：同批次内读到批次起点状态
- **更新顺序**：写入 -> computed -> effect -> 通知
- **异步规则**：同 key 去重；过期响应丢弃
- **协作合并**：CRDT 合并，不保证 LWW

### DevTools 事件模型

```typescript
type TraceExport = {
  protocolVersion: string;
  events: TraceEvent[];
  snapshots: TraceSnapshot[];
};
```

**落地要求**：
- 事件必须可序列化
- 支持最小采样模式 `minimal`
- 导出内容包含版本字段

---


## 附录 B、实现路线图 (工程级细化)

> 本节为唯一路线图来源，主文仅引用，不再重复维护。

### Phase 1: Core MVP (Week 1-4)

- [ ] atom/computed/batch/effect 原型
- [ ] 依赖图追踪与订阅机制
- [ ] TraceEvent 采集（write/effect）
- [ ] 单元测试：循环依赖、batch 合并
- [ ] React 最小 Hook 适配器（useAtom）
- [ ] Demo：计数器 + batch 渲染合并

**验收标准**：atom/computed 基准性能不低于 Jotai 80%

### Phase 2: Async MVP (Week 5-8)

- [ ] atomAsync 去重/取消/staleTime
- [ ] error/status 原子
- [ ] Demo：请求 + 取消 + 重试
- [ ] Benchmark：并发 100 请求
- [ ] 完善 React 适配器与 Suspense 集成

**验收标准**：取消语义正确，无过期写入

### Phase 3: Machine MVP (Week 9-12)

- [ ] machine 状态机执行器
- [ ] entry/exit 语义 + FIFO 事件处理
- [ ] effect 生命周期定义
- [ ] Demo：登录状态机
- [ ] 状态机与 atom 集成验证

**验收标准**：状态机与 atom 无冲突副作用

### Phase 4: DevTools + 文档 (Week 13-16)

- [ ] DevTools 面板原型（时间线回放）
- [ ] 性能采样模式
- [ ] 完整 API 文档
- [ ] Vue ref 适配器

**验收标准**：DevTools 可序列化回放

### Phase 5: Sync PoC (Week 17-20) - 可选/v1.1

- [ ] atomSync 原型
- [ ] CRDT 合并 PoC（小规模）
- [ ] TraceEvent 同步回放
- [ ] Demo：协作文档小样

**验收标准**：5 人以下协作无冲突丢失

> ⚠️ **重要**：CRDT 协作层风险最高，建议作为 v1.1 独立发布，不阻塞 v1.0

---


## 附录 C、架构图 (工程落地视角)

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

---


## 附录 D、里程碑与验收标准 (工程版)

### M0 (Week 4) - Core 可用

- atom/computed/batch/effect 可运行
- TraceEvent 采集 write/effect
- React 最小 Hook 适配器可用
- Demo：计数器 + batch 渲染合并

**Kill Criteria**：若 atom/computed 性能不及 Jotai 80%，重新评估技术选型

### M1 (Week 8) - Async 可用

- atomAsync 可运行，缓存/取消/去重正确
- effect 生命周期与 error 模型稳定
- Demo：请求 + 取消 + 重试

**Kill Criteria**：若取消语义无法实现，收缩为只做 Core

### M2 (Week 12) - Machine 可用

- machine + atom 集成可运行
- Demo：登录流程状态机
- 状态机事件序列可追踪

**Kill Criteria**：若状态机与 atom 产生不可预测副作用，降级为可选扩展

### M3 (Week 16) - v1.0 发布

- DevTools 面板可回放
- 完整 API 文档
- React/Vue 适配器可用
- 性能基准报告

### M4 (Week 20+) - v1.1 协作层（可选）

- atomSync PoC 可选启用
- CRDT 合并验证

**Kill Criteria**：若 Yjs 集成包体积超 50KB 或 5 人协作性能严重劣化，推迟到 v2

---


## 附录 E、产出物模板 (工程级)

### 模板 A：阶段交付说明

```
阶段:
范围:
完成项:
未完成项:
风险:
下一步:
```

### 模板 B：API 变更记录

```
版本:
变更类型: 新增 / 修改 / 删除
API 名称:
变更说明:
迁移指引:
风险:
```

### 模板 C：Benchmark 报告

```
环境:
场景:
数据规模:
均值:
P95:
内存差:
结论:
```

### 模板 D：Demo 验收报告

```
Demo:
验收项:
结果:
失败原因:
修复计划:
```

### 模板 E：发布清单

```
版本:
核心 API:
文档:
测试:
兼容性:
已知问题:
```
