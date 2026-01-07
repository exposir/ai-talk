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

### Phase 1: Core MVP (Week 1-2)

- [ ] atom/computed/batch/effect 原型
- [ ] 依赖图追踪与订阅机制
- [ ] TraceEvent 采集（write/effect）
- [ ] 单元测试：循环依赖、batch 合并

### Phase 2: Machine MVP (Week 3-4)

- [ ] machine 状态机执行器
- [ ] entry/exit 语义 + FIFO 事件处理
- [ ] effect 生命周期定义
- [ ] Demo：登录状态机

### Phase 3: Async MVP (Week 5-6)

- [ ] atomAsync 去重/取消/staleTime
- [ ] error/status 原子
- [ ] Demo：请求 + 取消 + 重试
- [ ] Benchmark：并发 100 请求

### Phase 4: Sync PoC (Week 7-8)

- [ ] atomSync 原型
- [ ] CRDT 合并 PoC（小规模）
- [ ] TraceEvent 同步回放
- [ ] Demo：协作文档小样

### Phase 5: Adapters + DevTools (Week 9-10)

- [ ] React 最小 Hook 适配器
- [ ] Vue ref 适配器
- [ ] DevTools 面板原型
- [ ] 性能采样模式

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

### M0 (Week 2)

- atom/computed/batch 可运行
- TraceEvent 采集 write/effect
- Demo：计数器 + batch 渲染合并

### M1 (Week 6)

- machine + atomAsync 可运行
- effect 生命周期与 error 模型稳定
- Demo：登录流程 + 异步取消

### M2 (Week 10)

- atomSync PoC 可选启用
- React 适配器最小版本可用
- DevTools 面板可回放

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
