## 二十、Demo 骨架与验收脚本

> 导读：Demo 与验收脚本是验证入口。

### 20.1 Demo 目录结构

```
apps/
  playground/
    src/
      demos/
        m0-counter.tsx
        m1-auth-machine.tsx
        m2-collab-doc.tsx
```

### 20.2 验收脚本模板

```typescript
export function assertBatching(result: { renders: number }) {
  if (result.renders > 1) {
    throw new Error('batch failed');
  }
}
```

### 20.3 验收标准

- **M0**：计数器与派生正常更新
- **M1**：状态机与异步取消正确
- **M2**：协作事件可回放

---


## 二十一、API 示例用例集

> 导读：提供典型用法示例，便于理解 API。

### 21.1 基本原子与派生

```typescript
const count = atom(0);
const double = computed(() => count.get() * 2);

effect(() => {
  console.log('double', double.get());
});
```

### 21.2 批处理更新

```typescript
batch(() => {
  count.set(1);
  count.set(2);
});
```

### 21.3 异步请求与取消

```typescript
const user = atomAsync(fetchUser, { key: 'user:1', staleTime: 5_000 });
user.refresh();
```

### 21.4 状态机驱动 UI

```typescript
const auth = machine({
  initial: 'idle',
  states: {
    idle: { on: { LOGIN: 'loading' } },
    loading: { on: { SUCCESS: 'authed', FAILURE: 'error' } },
    authed: { on: { LOGOUT: 'idle' } },
    error: { on: { RETRY: 'loading' } },
  },
});
```

### 21.5 Async 状态与 UI

```typescript
const user = atomAsync(fetchUser, { key: 'user:1' });
effect(() => {
  console.log(user.status.get(), user.get());
});
```

### 21.6 SSR 与多 Store

```typescript
const store = createStore();
const local = store.atom(0);
store.batch(() => local.set(1));
```

### 21.7 协作状态示例

```typescript
const doc = atomSync({ title: '' }, { id: 'doc:1', offline: true });
await doc.connect();
doc.set({ title: 'Hello' });
```

---


## 二十二、边界测试清单

> 导读：列出需要覆盖的边界测试用例。

- **循环依赖**：computed 互相依赖时应抛错
- **嵌套 batch**：多层 batch 只触发一次渲染
- **并发刷新**：同 key 的 async 应去重
- **过期写入**：旧请求响应不覆盖新值
- **协作断连**：断网后可继续编辑，恢复后合并

### 22.1 测试策略

- **单元测试**：核心原语与依赖图
- **集成测试**：异步/状态机/协作组合
- **回归测试**：已修复 bug 的固定用例

---


## 二十三、发布验收清单

> 导读：发布前的验收检查表。

- **功能**：M0/M1 demo 可运行，API 行为稳定
- **性能**：达到基线指标，P95 可控
- **可观测性**：时间线与快照可导出
- **稳定性**：错误模型可预期，异常可恢复
- **兼容性**：React 适配器通过基础用例

### 23.1 发布门槛

- **API 文档完整**：所有核心 API 有示例与边界说明
- **基准报告**：附带 benchmark 结果与环境
- **变更记录**：CHANGELOG 覆盖本版本变化

---


## 二十四、版本迁移策略细则

> 导读：版本迁移策略模板与原则。

### 24.1 破坏性变更策略

- **主版本**：允许破坏性变更，必须提供迁移指南
- **次版本**：仅新增 API，保持向后兼容
- **修订版本**：修复 bug，不改变行为

### 24.2 迁移指南格式

- **背景**：为何改动
- **影响面**：哪些 API 受影响
- **替代方案**：旧到新的映射
- **风险**：可能的行为变化

### 24.3 迁移示例模板

```text
原 API: atomAsync(fetcher, { key })
新 API: atomAsync(fetcher, { key, staleTime })
迁移说明: 默认 staleTime 从 0 变为 5000
```

---

