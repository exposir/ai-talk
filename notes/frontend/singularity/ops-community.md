## 二十五、架构决策记录 (ADR) 模板

> 导读：ADR 模板用于记录关键决策。

```text
ADR-0001: 使用 Signal 作为核心响应式原语
状态: 提案 / 通过 / 拒绝
上下文: ...
决策: ...
影响: ...
备选方案: ...
```

**使用规则**：
- 每个重大决策必须有 ADR。
- ADR 与版本发布绑定。

---


## 二十六、安全与合规

> 导读：安全与合规的最低要求。

### 26.1 数据与日志

- **最小采集**：默认不记录敏感数据
- **可脱敏**：TraceEvent 支持字段脱敏策略
- **可清理**：支持手动清空与过期清理

### 26.2 协作合规

- **审计需求**：支持日志导出与回放
- **访问控制**：协作层由上层应用负责鉴权

### 26.3 安全边界

- **不执行远端代码**：只同步数据
- **最小权限**：由应用决定协作可写范围

---


## 二十七、跨平台与运行时兼容性

> 导读：跨平台运行环境与支持范围。

- **浏览器**：现代浏览器，降级到 `setTimeout` 调度
- **SSR**：Node.js 环境隔离 store
- **移动端**：React Native 通过适配层支持

### 27.1 不支持范围

- 老旧浏览器无 Proxy/WeakMap 支持
- 非 JS 运行时

---


## 二十八、生态与社区路线图

> 导读：生态与社区发展的方向。

### 28.1 生态扩展方向

- **官方适配器**：React/Vue/Svelte/Solid
- **数据层适配**：GraphQL/REST 客户端桥接
- **状态机可视化**：可编辑的状态图工具

### 28.2 社区参与

- **RFC 流程**：重大变更走 RFC
- **插件机制**：社区可扩展 DevTools 与适配层

---


## 二十九、学习路径与培训材料

> 导读：学习路径与培训素材方向。

- **入门**：1 小时上手教程
- **进阶**：状态机与协作专题
- **架构**：大型项目的分域治理案例

---


## 三十、奇点项目 Todo List (我的执行计划)

> 导读：执行计划与阶段划分。

### 30.1 规格收敛

- **整理 API**：补全 `atomAsync/atomSync/machine` 的签名与语义边界
- **补足边界**：循环依赖、异常恢复、嵌套 batch 的明确规则
- **冻结范围**：为 M0/M1 设定不可变更的最小范围

### 30.2 核心原型

- **实现核心**：`atom/computed/batch/effect` + 订阅系统
- **可观测性**：TraceEvent 采集与快照导出
- **异步层**：`atomAsync` 缓存/取消/去重
- **状态机**：`machine` 最小实现 + 与 atom 绑定

### 30.3 适配与验证

- **React 适配器**：`useAtom/useAtomValue/useSetAtom`
- **Vue 适配器**：`useAtomRef`
- **Demo**：M0/M1 真实场景示例 + 验收脚本
- **基准**：跑通最小 benchmark，记录均值与 P95

### 30.4 协作与扩展

- **协作原型**：`atomSync` + CRDT 合并 PoC
- **DevTools**：时间线面板原型
- **文档**：API 参考、调试与性能指南

---


## 三十一、工程级文档骨架

> 导读：面向真实用户与落地工程的文档结构。

### 31.1 快速上手

- **安装**：包结构与最小依赖说明
- **Hello World**：atom/computed/batch 最小示例
- **5 分钟 Demo**：计数器 + 派生 + batch
- **错误演示**：常见误用与修正

**安装 (示例)**：

```bash
npm i @singularity/core @singularity/react
```

**Hello World**：

```typescript
import { atom, computed, effect } from '@singularity/core';

const count = atom(0);
const double = computed(() => count.get() * 2);

effect(() => {
  console.log('double', double.get());
});

count.set(1);
```

**5 分钟 Demo (React)**：

```tsx
import { atom, computed, batch } from '@singularity/core';
import { useAtom } from '@singularity/react';

const count = atom(0);
const double = computed(() => count.get() * 2);

export function Counter() {
  const value = useAtom(count);
  const doubled = useAtom(double);

  return (
    <div>
      <button
        onClick={() => {
          batch(() => {
            count.set((n) => n + 1);
            count.set((n) => n + 1);
          });
        }}
      >
        +2
      </button>
      <div>count: {value}</div>
      <div>double: {doubled}</div>
    </div>
  );
}
```

**错误演示**：

```typescript
// Bad: computed 中执行 set 会导致循环
const bad = computed(() => {
  count.set(1);
  return count.get();
});
```

```text
建议: computed 中只读，不执行写入操作。
```

### 31.2 入门教程 (Hands-on)

- **第 1 章**：状态原语与订阅
- **第 2 章**：computed 与依赖图
- **第 3 章**：batch 与渲染合并
- **第 4 章**：effect 与清理

**第 1 章：状态原语与订阅**  
目标：理解 atom 与 subscribe 的最小使用方式。

```typescript
const a = atom(0);
const unsub = a.subscribe(() => console.log(a.get()));
a.set(1);
unsub();
```

**第 2 章：computed 与依赖图**  
目标：理解派生值与依赖追踪。

```typescript
const price = atom(100);
const tax = atom(0.1);
const total = computed(() => price.get() * (1 + tax.get()));
```

**第 3 章：batch 与渲染合并**  
目标：理解批处理如何合并通知。

```typescript
batch(() => {
  price.set(120);
  tax.set(0.2);
});
```

**第 4 章：effect 与清理**  
目标：理解 effect 生命周期。

```typescript
const e = effect(() => {
  console.log('total', total.get());
});
e.dispose();
```

### 31.3 API 参考

- **Core**：`atom/computed/batch/effect`
- **Async**：`atomAsync` 选项与缓存语义
- **Machine**：`machine` 配置与事件语义
- **Sync**：`atomSync` 协作连接与状态
- **Store**：`createStore/snapshot` 与 SSR 约束
- **Adapters**：React/Vue Hooks 与订阅语义

### 31.4 API 参考模板

```
函数名：
签名：
参数：
返回：
错误：
示例：
注意事项：
```

### 31.5 核心概念

- State Node 与依赖图
- 一致性语义与调度规则
- 可观测协议与时间线

**State Node**  
State Node 是奇点的统一抽象，包含 atom/computed/async/sync 四类节点。  
原则：可订阅、可组合、可观察。

**一致性语义**  
同一批次读取的是批次开始时的快照；写入在批次结束时统一通知。

**可观测协议**  
所有读写与异步事件进入 TraceEvent 流，可被 DevTools 解析。

### 31.6 实践指南

- 小型项目最佳实践
- 超大型项目分域治理
- 异步与协作场景模式

**小型项目**  
只使用 atom/computed/batch，避免引入状态机与协作层。

**超大型项目**  
按域拆分 Store，采用统一命名规范与审计时间线。

**异步与协作**  
async 与 sync 只在需要时引入，避免过早复杂化。

### 31.7 性能与调试

- Benchmark 口径与结果模板
- DevTools 使用与排错
- 性能退化定位清单

**Benchmark 模板**  
记录设备、浏览器、操作次数、均值与 P95。

**排错清单**  
1) 是否有 computed 中的写入  
2) 是否存在过度订阅  
3) 是否存在未释放的 effect

### 31.8 迁移与集成

- 与 Redux/Zustand/Jotai 共存
- GraphQL/REST 数据层协作
- 旧系统只读桥接示例

**只读桥接示例**：

```typescript
const legacy = fromStore(getState, subscribe);
const total = computed(() => legacy.get().total);
```

### 31.9 故障排查与 FAQ

- 常见误用与修复
- 性能退化与定位流程
- 诊断清单与自查步骤

**常见问题**  
Q: 为什么 computed 不更新？  
A: 确认 computed 内部读取了 atom 的 get。

Q: 为什么批处理没生效？  
A: 确认更新发生在 batch 内部。

---

