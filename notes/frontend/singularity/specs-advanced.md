## 十三、状态机与协作层规格

> 导读：补充状态机与协作层的具体接口。

### 13.1 状态机 API 规范 (Machine)

```typescript
type MachineConfig<TState extends string, TEvent extends string> = {
  id?: string;
  initial: TState;
  states: {
    [K in TState]: {
      on?: Partial<Record<TEvent, TState>>;
      entry?: Array<() => void>;
      exit?: Array<() => void>;
    };
  };
};

type Machine<TState extends string, TEvent extends string> = {
  state: Atom<TState>;
  send(event: TEvent): void;
};

export function machine<TState extends string, TEvent extends string>(
  config: MachineConfig<TState, TEvent>,
): Machine<TState, TEvent>;
```

**语义说明**：
- `send` 触发状态转换，若无匹配转换则忽略。
- `entry/exit` 在状态切换时执行，遵守 batch 语义。

**API 明细**：

**`machine(config): Machine`**
- **用途**：声明业务流程与有限状态转换。
- **参数**：
  - `config.initial`：初始状态，必须在 `states` 中存在。
  - `config.states`：状态定义与转移规则。
  - `entry/exit`：状态进入/退出回调，建议只做副作用触发，不做写入。
- **返回**：`Machine`，包含 `state` atom 与 `send`。
- **错误**：
  - 初始状态非法时抛出错误。
  - entry/exit 发生异常会写入 TraceEvent。

**状态转换顺序**：
1) 执行当前状态 `exit`
2) 切换到目标状态
3) 执行目标状态 `entry`

**限制**：
- 不支持层级/并行状态（保持轻量）。
- 状态机不管理业务数据，数据由 atom 承载。
- `entry/exit` 内不建议直接写入 atom；如需写入，建议通过 effect 解耦。

**事件处理顺序**：
- `send` 以 FIFO 处理，同一批次内事件按调用顺序执行。

**细化语义**：
- 同一状态内重复 `send` 相同事件允许再次触发转换。
- 无匹配转换事件将被忽略，不抛错。

### 13.2 状态机与数据解耦 (Machine + Atom)

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

const token = atom<string | null>(null);

effect(() => {
  if (auth.state.get() === 'authed') {
    token.set('token');
  }
});
```

**最佳实践**：
- 状态机负责流程，atom 负责数据。
- 复杂副作用由 effect 管理，避免在 entry/exit 中直接写入。

### 13.3 协作层 API 规范 (Sync)

> ⚠️ **高风险模块**：atomSync 是整个项目风险最高的部分，建议作为 v1.1 独立发布。
> 在 v1.0 阶段，优先确保 Core + Async + Machine 的稳定性。

```typescript
type SyncOptions = {
  id: string;
  merge?: 'crdt';
  offline?: boolean;
};

type SyncAtom<T> = Atom<T> & {
  connect(): Promise<void>;
  disconnect(): void;
  status: Atom<'idle' | 'syncing' | 'error'>;
};

export function atomSync<T>(initial: T, options: SyncOptions): SyncAtom<T>;
```

**语义说明**：
- `connect` 建立协作连接，`disconnect` 保留本地可写。
- `offline` 为 true 时允许离线编辑，恢复后合并。

**风险评估**：
- **包体积**：Yjs 约 30-40KB (gzipped)，需控制总体积
- **复杂度**：CRDT 合并语义复杂，调试困难
- **性能**：多人协作场景下的性能验证需要充分测试

**验收条件**（v1.1 发布前）：
- 5 人以下协作无冲突丢失
- 离线编辑恢复后数据一致
- 包体积增量不超过 50KB

**API 明细**：

**`atomSync<T>(initial, options): SyncAtom<T>`**
- **用途**：创建协作状态节点，提供 CRDT 合并语义。
- **参数**：
  - `options.id`：协作文档唯一标识。
  - `options.merge`：合并策略，当前为 `crdt`。
  - `options.offline`：离线写入开关。
- **返回**：`SyncAtom<T>`，支持连接管理与状态。
- **错误**：连接失败写入 `status=error`，本地写入不受影响。

**状态流转**：
`idle -> syncing -> idle`，异常进入 `error`。

**连接语义**：
- `connect`/`disconnect` 可重复调用，应为幂等。
- `disconnect` 不清空本地状态，仅停止同步。

**数据约束**：
- 推荐 JSON 可序列化结构。
- 不建议存放函数/DOM/循环引用。

**合并语义**：
- 同一字段冲突由 CRDT 规则合并，不保证最后写入优先。
- 协作事件进入 TraceEvent，可用于回放与审计。

### 13.4 协作冲突与合并策略

- **字段级合并**：同一字段冲突按 CRDT 规则合并。
- **时间线可回放**：所有协作事件进入 TraceEvent 流。
- **离线优先**：本地写入不阻塞，恢复连接时自动同步。

**一致性保证**：
- **最终一致**：同步完成后副本一致。
- **局部可用**：离线状态下允许本地写入与回放。

### 13.5 协作安全与权限边界

- **鉴权**：由上层应用实现，协作层不内置鉴权逻辑。
- **最小暴露**：只同步状态，不传输执行逻辑。

---


## 十四、类型系统与规范约束

> 导读：说明类型约束与泛型边界。

### 14.1 Atom/Computed 泛型约束

```typescript
type ReadonlyAtom<T> = Pick<Atom<T>, 'id' | 'get' | 'subscribe'>;
type WritableAtom<T> = Atom<T>;
```

**语义说明**：
- 公开 API 中区分只读与可写，避免误用。

### 14.2 事件类型约束

```typescript
type EventMap = Record<string, unknown>;
type EventKey<T extends EventMap> = keyof T & string;
```

**语义说明**：
- 状态机 `send` 只接受已声明事件。

### 14.3 类型推断目标

- **零显式类型**：常见场景无需手写泛型参数。
- **边界可控**：复杂对象在 `atom` 中仍保持类型收敛。
- **事件安全**：状态机事件在编译期限定。

### 14.4 示例：类型推断与约束

```typescript
const user = atom({ id: 'u1', name: 'Ada' });
const name = computed(() => user.get().name);

type AuthEvents = { LOGIN: { id: string }; LOGOUT: {} };
type AuthEventKey = EventKey<AuthEvents>;
```

---


## 十五、兼容层与共存策略

> 导读：说明与旧系统共存的最小策略。

### 15.1 兼容层 API

```typescript
export const compat = {
  redux: <T>(getState: () => T, subscribe: (fn: () => void) => () => void) =>
    fromStore(getState, subscribe),
  zustand: <T>(useStore: () => T) => fromHook(useStore),
};
```

### 15.2 共存边界

- 兼容层只读，不直接写入旧系统。
- 变更流进入新系统，旧系统仅提供快照。

### 15.3 迁移路径建议

- **新模块优先**：新功能使用奇点，旧模块保持不变。
- **边界清晰**：通过适配层暴露只读接口。
- **性能评估**：先评估订阅规模与更新频率。

### 15.4 兼容性风险

- **双写风险**：避免新旧系统同时写入同一状态。
- **语义差异**：旧系统的副作用模型可能不一致。

---


## 十六、调度与错误处理细则

> 导读：调度与错误规则是行为一致性的依据。

### 16.1 批处理与调度规则

- **单一批次**：嵌套 batch 合并为一个顶层批次
- **提交时机**：批次结束后统一提交通知
- **优先级**：同步写入优先于异步回写

### 16.1.1 调度阶段

1) **采集**：记录写入与依赖。
2) **计算**：计算派生与副作用。
3) **通知**：统一触发订阅更新。

**细化顺序**：
- 先计算 computed，再执行 effect，再通知订阅者。

### 16.2 异步取消与回放规则

- **取消语义**：新请求触发时取消旧请求，并标记为 `canceled`
- **回放一致性**：异步结果进入时间线时带上关联 batchId
- **过期写入**：若 key 已刷新，旧响应丢弃

### 16.3 错误传播规则

- **同步错误**：向调用者抛出，进入 TraceEvent
- **异步错误**：写入 error atom，不阻断后续刷新
- **协作错误**：通过事件流告警，不阻塞本地编辑

### 16.4 错误分类

- **逻辑错误**：循环依赖、非法写入。
- **运行时错误**：用户代码抛错。
- **网络错误**：异步请求失败。


---

