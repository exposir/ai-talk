## 十二、奇点技术规格

> 导读：将规格变成可执行规范的核心章节。

### 12.1 术语与定义

- **State Node**：可订阅、可组合的状态单元（atom/computed/async/sync）。
- **Batch**：在单一批次中合并多次写入并统一通知。
- **TraceEvent**：可观测事件流记录。


### 12.2 核心 API 规范 (Core)

```typescript
type Atom<T> = {
  id: string;
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(listener: () => void): () => void;
};

type ReadonlyAtom<T> = Pick<Atom<T>, 'id' | 'get' | 'subscribe'>;

type Computed<T> = {
  id: string;
  get(): T;
  subscribe(listener: () => void): () => void;
};

type BatchFn = (fn: () => void) => void;

type Effect = {
  dispose(): void;
};

export function atom<T>(initial: T): Atom<T>;
export function computed<T>(read: () => T): Computed<T>;
export function batch(fn: () => void): void;
export function effect(fn: () => void): Effect;
export function fromStore<T>(
  getState: () => T,
  subscribe: (fn: () => void) => () => void,
): ReadonlyAtom<T>;
export function fromHook<T>(useStore: () => T): ReadonlyAtom<T>;
```

**语义说明**：
- `atom.set` 在批次中合并通知，批次结束后统一触发。
- `computed` 只读，依赖追踪在 `get()` 时建立。
- `effect` 在依赖变化时重新执行，并允许显式 `dispose()`。

**API 明细**：

**`atom<T>(initial: T): Atom<T>`**
- **用途**：创建可读写的原子状态。
- **参数**：`initial` 初始值，允许任意可序列化或不可序列化对象。
- **返回**：`Atom<T>`，提供 `get/set/subscribe`。
- **错误**：无显式错误；不建议在 `computed` 中调用 `set`。
- **示例**：

```typescript
const count = atom(0);
count.set((n) => n + 1);
```

**`computed<T>(read: () => T): Computed<T>`**
- **用途**：创建只读派生状态。
- **参数**：`read` 读取函数，依赖通过 `get()` 自动追踪。
- **返回**：`Computed<T>`，提供 `get/subscribe`。
- **错误**：若发生循环依赖，抛出错误并中止本次计算。
- **示例**：

```typescript
const total = computed(() => price.get() * (1 + tax.get()));
```

**`batch(fn: () => void): void`**
- **用途**：合并批量更新，减少通知与渲染。
- **语义**：嵌套 batch 合并为单一批次；批次结束统一通知。
- **示例**：

```typescript
batch(() => {
  a.set(1);
  b.set(2);
});
```

**`effect(fn: () => void): Effect`**
- **用途**：创建副作用，依赖变化时重新执行。
- **返回**：`Effect`，提供 `dispose()` 解除订阅。
- **注意**：effect 内部若产生同步错误，将记录到 TraceEvent。
- **示例**：

```typescript
const e = effect(() => console.log(total.get()));
e.dispose();
```

**`fromStore<T>(getState, subscribe): ReadonlyAtom<T>`**
- **用途**：将外部 store 以只读方式桥接为 Atom。
- **参数**：
  - `getState`：读取外部状态快照。
  - `subscribe`：订阅外部变化。
- **返回**：只读 `ReadonlyAtom<T>`，不支持 `set`。
- **注意**：仅供迁移与共存场景使用。

**`fromHook<T>(useStore): ReadonlyAtom<T>`**
- **用途**：将 Hook 风格 store 桥接为 Atom。
- **注意**：仅支持只读订阅，避免双写。

### 12.3 Async API 规范 (Core)

```typescript
type AsyncOptions<T> = {
  key: string;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: (attempt: number) => number;
  optimistic?: boolean;
};

type AsyncAtom<T> = Atom<T | undefined> & {
  status: Atom<'idle' | 'loading' | 'success' | 'error'>;
  error: Atom<Error | null>;
  refresh(): Promise<void>;
};

export function atomAsync<T>(
  fetcher: () => Promise<T>,
  options: AsyncOptions<T>,
): AsyncAtom<T>;
```

**语义说明**：
- `key` 必须显式传入，用于去重与缓存。
- `refresh` 触发一次请求，若并发请求同 key，则合并。
- `optimistic` 时允许先写入本地值，失败后回滚。

**API 明细**：

**`atomAsync<T>(fetcher, options): AsyncAtom<T>`**
- **用途**：创建带缓存与取消语义的异步状态。
- **参数**：
  - `fetcher`：返回 Promise 的请求函数。
  - `options.key`：缓存键，必须显式提供。
  - `options.staleTime`：缓存新鲜期，单位毫秒。
  - `options.cacheTime`：无订阅后保留时间。
  - `options.retry`：失败重试次数。
  - `options.retryDelay`：重试退避策略。
  - `options.optimistic`：是否启用乐观更新。
- **返回**：`AsyncAtom<T>`，包含 `status/error/refresh`。
- **错误**：
  - `fetcher` 抛错时写入 `error` atom。
  - 并发过期响应会被丢弃，不覆盖新值。
- **示例**：

```typescript
const user = atomAsync(fetchUser, {
  key: 'user:1',
  staleTime: 5_000,
  retry: 2,
});

user.refresh();
```

**细化语义**：
- **状态流转**：`idle -> loading -> success/error`，`refresh` 触发 `loading`。
- **去重**：同 `key` 在 `loading` 状态下复用同一请求。
- **缓存淘汰**：无订阅达到 `cacheTime` 后清理。
- **乐观更新**：失败时回滚到上一次 `success` 值。

### 12.4 Store 级能力 (Core)

```typescript
type Store = {
  atom<T>(initial: T): Atom<T>;
  computed<T>(read: () => T): Computed<T>;
  batch(fn: () => void): void;
  effect(fn: () => void): Effect;
  snapshot(): Record<string, unknown>;
};

export function createStore(): Store;
```

**语义说明**：
- `createStore` 用于 SSR 请求级隔离。
- `snapshot` 提供可观测快照给 DevTools 与调试。

**API 明细**：

**`createStore(): Store`**
- **用途**：创建独立的 Store，用于多实例或 SSR。
- **返回**：`Store`，包含 `atom/computed/batch/effect`。
- **注意**：每个 Store 的节点相互隔离。

**`Store.snapshot(): Record<string, unknown>`**
- **用途**：导出当前状态快照给调试/审计。
- **注意**：默认仅导出可序列化字段。

**细化说明**：
- **一致性**：同一批次内快照为批次起点状态。
- **隔离**：不同 Store 之间快照不共享。

### 12.5 框架适配器 API (React/Vue)

```typescript
// React
export function useAtom<T>(node: Atom<T> | Computed<T>): T;
export function useAtomValue<T>(node: Atom<T> | Computed<T>): T;
export function useSetAtom<T>(node: Atom<T>): Atom<T>['set'];

// Vue
export function useAtomRef<T>(node: Atom<T> | Computed<T>): { value: T };
```

**语义说明**：
- 适配器只负责订阅与更新，不改变核心语义。
- React 适配器使用 `useSyncExternalStore` 保证并发安全。

**API 明细 (React)**：

**`useAtom<T>(node): T`**
- **用途**：订阅 atom/computed 并触发组件更新。
- **注意**：依赖变化触发重渲染，遵守 batch 语义。

**`useAtomValue<T>(node): T`**
- **用途**：只读订阅，不暴露 set。

**`useSetAtom<T>(node): (next) => void`**
- **用途**：获取写入函数，便于拆分读写。

**API 明细 (Vue)**：

**`useAtomRef<T>(node): Ref<T>`**
- **用途**：返回 Vue `ref`，保持响应式。

### 12.6 DevTools 事件格式 (Core)

```typescript
type TraceExport = {
  protocolVersion: string;
  events: TraceEvent[];
  snapshots: TraceSnapshot[];
};

type TraceEvent = {
  id: string;
  ts: number;
  type: 'read' | 'write' | 'effect' | 'async' | 'sync';
  nodeId: string;
  payload?: unknown;
  batchId?: string;
  error?: string;
};

type TraceSnapshot = {
  nodes: Record<string, unknown>;
  edges: Array<{ from: string; to: string }>;
};
```

**语义说明**：
- `type` 用于区分读/写/副作用/异步/协作事件。
- `batchId` 用于关联同一批次内的变更。
- `payload` 应保持可序列化；敏感字段可脱敏。

**事件示例**：

```json
{
  "id": "evt_001",
  "ts": 1713000000000,
  "type": "write",
  "nodeId": "atom:count",
  "payload": { "prev": 1, "next": 2 },
  "batchId": "batch_01"
}
```

**快照要求**：
- `nodes` 只包含可序列化值。
- `edges` 代表依赖图方向：`from -> to`。

### 12.7 一致性与边界案例 (Core)

- **嵌套 batch**：只形成一个顶层批次，内部不额外触发通知。
- **循环依赖**：检测到循环时抛出错误并中止本次计算。
- **异常恢复**：`computed` 抛错会标记 error 状态，下一次依赖变化时重试。
- **并发写入**：同一批次内写入按最后一次为准。
- **异步过期**：旧请求返回时若 key 已刷新，结果丢弃。

**调度顺序**：
1) 执行同步写入，记录变更。
2) 结束批次后计算依赖图。
3) 触发 computed 更新与 effect 执行。

**边界行为**：
- computed 内不得进行写入，否则抛出错误。
- effect 的同步异常写入 TraceEvent，并不阻断后续更新。
 - effect 默认同步执行；如需异步调度，需由适配层显式引入。

### 12.8 最小实现结构 (Core)

```
packages/
  singularity-core/
    src/
      atom.ts
      computed.ts
      batch.ts
      effect.ts
      store.ts
      async.ts
      devtools.ts
      index.ts
```

**模块职责**：
- `atom.ts`：原子节点与订阅机制
- `computed.ts`：依赖追踪与派生计算
- `batch.ts`：批处理与调度队列
- `effect.ts`：副作用注册与清理
- `store.ts`：多实例与 SSR 隔离
- `async.ts`：缓存/取消/重试逻辑
- `devtools.ts`：事件采集与快照导出

### 12.9 兼容性与稳定性承诺

- **API 稳定**：核心 API 进入 1.0 后仅通过主版本变更。
- **行为稳定**：一致性语义与调度规则不得在次版本改变。
- **可观测性**：TraceEvent 字段保证向后兼容。

---
