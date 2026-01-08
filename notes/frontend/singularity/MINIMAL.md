# Singularity: 极致易用的状态管理

> **核心哲学**：「状态应该像呼吸一样自然——你不需要思考它，但它永远在那里。」

---

## 一、我们的灵魂

### 为什么需要另一个状态管理库？

**现有库的痛点不在于功能，而在于「心智负担」**：

| 库          | 痛点                                                           |
| :---------- | :------------------------------------------------------------- |
| **Redux**   | 我只想存个值，为什么要写 action、reducer、selector、thunk...？ |
| **Zustand** | 简单，但状态更新时整个组件都重新渲染了                         |
| **Jotai**   | 原子依赖图？派生原子？我只想让两个组件共享数据                 |
| **MobX**    | 装饰器、observable、autorun... 太多魔法了                      |
| **XState**  | 我只是想管理几个状态，不需要有限状态机                         |

**Singularity 的哲学**：

> **「让正确的事情成为容易的事情」**

- 你想共享数据？一行代码
- 你想响应变化？一行代码
- 你想批量更新？一行代码
- 你想细粒度渲染？自动的

---

## 二、Singularity 的三个核心承诺

### 承诺 1：5 秒上手

```typescript
// 这就是全部了
import { atom } from '@aspect/singularity';

const count = atom(0);           // 创建
count.set(1);                    // 更新
console.log(count.get());        // 读取：1

// 在 React 中
function Counter() {
  const value = useAtom(count);  // 订阅
  return <button onClick={() => count.set(v => v + 1)}>{value}</button>;
}
```

**对比**：

| 操作     | Redux            | Zustand        | **Singularity** |
| :------- | :--------------- | :------------- | :-------------- |
| 创建状态 | 10+ 行           | 5 行           | **1 行**        |
| 更新状态 | dispatch(action) | store.setState | **atom.set()**  |
| 读取状态 | useSelector      | useStore       | **useAtom**     |

### 承诺 2：细粒度更新零配置

```typescript
const user = atom({ name: 'Alice', age: 25 });

// 组件 A：只订阅 name
function NameDisplay() {
  const name = useAtom(user, u => u.name);  // 只有 name 变化才重新渲染
  return <div>{name}</div>;
}

// 组件 B：只订阅 age
function AgeDisplay() {
  const age = useAtom(user, u => u.age);    // 只有 age 变化才重新渲染
  return <div>{age}</div>;
}

user.set(prev => ({ ...prev, name: 'Bob' }));
// ✅ NameDisplay 重新渲染
// ❌ AgeDisplay 不重新渲染（age 没变）
```

**这是 Zustand 做不到的**——Zustand 需要你手动优化 selector。
**这是 Singularity 自动的**——内置 shallow compare。

### 承诺 3：与现有工具和谐共处

```typescript
// ✅ 与 React Query 配合：服务端状态
const { data: user } = useQuery({ queryKey: ['user'] });

// ✅ 与 Singularity 配合：客户端状态
const uiState = atom({ sidebar: true, theme: 'dark' });

// ✅ 不冲突，各司其职
```

**我们不替代 React Query**——服务端状态缓存是另一个领域。
**我们专注客户端状态**——做好一件事。

---

## 三、完整 API 设计

### 核心 API（只有 4 个）

| API            | 用途     | 一句话解释                 |
| :------------- | :------- | :------------------------- |
| `atom(value)`  | 创建状态 | 最小的状态单元，可被订阅   |
| `computed(fn)` | 派生状态 | 自动追踪依赖，缓存计算结果 |
| `effect(fn)`   | 副作用   | 当依赖变化时自动执行       |
| `batch(fn)`    | 批量更新 | 多次更新合并为一次通知     |

### React API（只有 2 个）

| API                             | 用途     | 一句话解释                   |
| :------------------------------ | :------- | :--------------------------- |
| `useAtom(atom, selector?)`      | 订阅状态 | 带可选 selector 的细粒度订阅 |
| `useAtomValue(atom, selector?)` | 只读订阅 | 不需要 setter 时更轻量       |

---

### API 详解

#### 1. `atom` - 创建状态

```typescript
import { atom } from '@aspect/singularity';

// 基础用法
const count = atom(0);
const user = atom({ name: 'Alice', age: 25 });
const todos = atom<Todo[]>([]);

// 读取
count.get(); // 0
user.get().name; // 'Alice'

// 更新（支持函数式更新）
count.set(1);
count.set((prev) => prev + 1);
user.set((prev) => ({ ...prev, age: prev.age + 1 }));

// 订阅变化
const unsubscribe = count.subscribe((value) => {
  console.log('count changed:', value);
});

// 取消订阅
unsubscribe();
```

**设计原则**：

- API 与 `useState` 高度一致，零学习成本
- 支持任意类型，完美 TypeScript 推断
- `subscribe` 返回取消函数，符合 React Hooks 清理模式

#### 2. `computed` - 派生状态

```typescript
import { atom, computed } from '@aspect/singularity';

const firstName = atom('John');
const lastName = atom('Doe');

// 派生状态：自动追踪依赖
const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);

fullName.get(); // 'John Doe'

firstName.set('Jane');
fullName.get(); // 'Jane Doe' (自动更新)

// 可订阅，与 atom 使用方式一致
fullName.subscribe((name) => console.log('Name:', name));
```

**设计原则**：

- 惰性计算：只在被读取时计算
- 自动依赖收集：无需手动声明依赖
- 缓存结果：相同输入不重复计算

#### 3. `effect` - 副作用

```typescript
import { atom, effect } from '@aspect/singularity';

const isLoggedIn = atom(false);
const userId = atom<string | null>(null);

// 当登录状态变化时执行
effect(() => {
  if (isLoggedIn.get()) {
    analytics.track('login', { userId: userId.get() });
  }
});

// 返回清理函数（可选）
effect(() => {
  const ws = new WebSocket(`/chat/${userId.get()}`);

  return () => {
    ws.close(); // 依赖变化时自动清理
  };
});

// 取消 effect
const dispose = effect(() => {
  /* ... */
});
dispose(); // 停止监听
```

**设计原则**：

- 与 `useEffect` 理念一致，但不在 React 内
- 支持清理函数，自动处理资源释放
- 适合日志、分析、同步外部系统

#### 4. `batch` - 批量更新

```typescript
import { atom, batch, effect } from '@aspect/singularity';

const a = atom(0);
const b = atom(0);

effect(() => {
  console.log(`a=${a.get()}, b=${b.get()}`);
});

// 不用 batch：effect 会执行 2 次
a.set(1); // 打印: a=1, b=0
b.set(2); // 打印: a=1, b=2

// 用 batch：effect 只执行 1 次
batch(() => {
  a.set(10);
  b.set(20);
});
// 打印: a=10, b=20 (只一次)
```

**设计原则**：

- 解决多次更新导致的重复渲染
- 在 React 中，`useAtom` 内部已自动 batch
- 显式 `batch` 用于 React 外部场景

---

### React 集成

#### `useAtom` - 订阅状态

```typescript
import { useAtom } from '@aspect/singularity/react';

// 基础用法
function Counter() {
  const count = useAtom(countAtom);
  return <button onClick={() => countAtom.set(n => n + 1)}>{count}</button>;
}

// 带 selector（细粒度订阅）
function UserName() {
  const name = useAtom(userAtom, user => user.name);
  return <div>{name}</div>;  // 只有 name 变化才重新渲染
}

// 返回 [value, setter] 元组（可选）
function Counter2() {
  const [count, setCount] = useAtom(countAtom, { asTuple: true });
  return <button onClick={() => setCount(n => n + 1)}>{count}</button>;
}
```

**设计原则**：

- 默认返回值（符合大多数使用场景）
- 可选元组模式（兼容 useState 习惯）
- 内置 selector 支持，无需额外 API
- 自动 shallow compare，避免无效渲染

#### `useAtomValue` - 只读订阅

```typescript
import { useAtomValue } from '@aspect/singularity/react';

// 当你只需要读取，不需要更新时
function ReadOnlyDisplay() {
  const count = useAtomValue(countAtom);
  return <div>Count: {count}</div>;
}

// 对于 computed 推荐使用 useAtomValue
function FullNameDisplay() {
  const fullName = useAtomValue(fullNameComputed);
  return <div>{fullName}</div>;
}
```

---

## 四、差异化竞争力

### 我们 vs 竞品

| 特性         | Redux  | Zustand | Jotai   | **Singularity** |
| :----------- | :----- | :------ | :------ | :-------------- |
| 上手时间     | 1 天   | 10 分钟 | 30 分钟 | **5 分钟**      |
| 样板代码     | 很多   | 少      | 少      | **极少**        |
| 细粒度更新   | 手动   | 手动    | 自动    | **自动**        |
| 学习曲线     | 陡峭   | 平缓    | 中等    | **极平缓**      |
| TypeScript   | 需配置 | 好      | 好      | **极好**        |
| 包体积       | 16KB   | 1KB     | 2KB     | **~2KB**        |
| React 外使用 | 困难   | 可以    | 可以    | **原生支持**    |

### 我们的独特价值

#### 1. 「零概念」设计

```typescript
// Redux：需要理解 action, reducer, store, dispatch, selector, middleware...
// XState：需要理解 machine, state, event, guard, action, context...
// MobX：需要理解 observable, action, computed, reaction, autorun...

// Singularity：只需要理解「状态」
const state = atom(value); // 就这样
```

#### 2. 「即插即用」设计

```typescript
// 不需要 Provider
// 不需要 createStore
// 不需要 configureStore
// 不需要任何设置

// 直接用
import { atom } from '@aspect/singularity';
const count = atom(0);

// 在任何组件中
function AnyComponent() {
  const value = useAtom(count); // 直接工作
}
```

#### 3. 「渐进增强」设计

```typescript
// 简单场景：只用 atom
const count = atom(0);

// 需要派生？加 computed
const double = computed(() => count.get() * 2);

// 需要副作用？加 effect
effect(() => localStorage.setItem('count', count.get().toString()));

// 需要批量更新？加 batch
batch(() => {
  a.set(1);
  b.set(2);
});

// 每一步都是可选的，按需引入
```

---

## 五、目标用户

### ✅ 适合的场景

1. **新项目起步**：不想引入复杂的状态管理
2. **中小型应用**：不需要 Redux 的全家桶
3. **状态简单但需要跨组件共享**：购物车、用户信息、UI 状态
4. **对性能有要求**：需要细粒度更新但不想手动优化
5. **同时需要 React 外的状态**：Node.js、测试环境

### ❌ 不适合的场景（用其他工具）

| 场景                | 推荐工具         |
| :------------------ | :--------------- |
| 服务端状态/API 缓存 | TanStack Query   |
| 复杂业务状态机      | XState           |
| 多人实时协作        | Yjs + Liveblocks |
| 表单状态            | React Hook Form  |
| 超大型企业应用      | Redux Toolkit    |

---

## 六、技术实现概要

### 包结构

```
@aspect/singularity/
├── core          # 核心，~2KB
│   ├── atom      # 状态原子
│   ├── computed  # 派生状态
│   ├── effect    # 副作用
│   └── batch     # 批量更新
│
├── react         # React 绑定，~1KB
│   ├── useAtom
│   └── useAtomValue
│
└── devtools      # 开发工具，~3KB（可选）
    └── inspector
```

**总体积目标**：core + react ≤ 3KB gzipped

### 核心实现原理

```typescript
// 简化的核心实现思路（约 100 行）
type Listener<T> = (value: T) => void;

function createAtom<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener<T>>();

  return {
    get: () => value,
    set: (next: T | ((prev: T) => T)) => {
      const newValue =
        typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
      if (!Object.is(newValue, value)) {
        value = newValue;
        listeners.forEach((fn) => fn(value));
      }
    },
    subscribe: (fn: Listener<T>) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
```

### React 集成原理

```typescript
// 使用 useSyncExternalStore 保证并发安全
function useAtom<T, S = T>(atom: Atom<T>, selector?: (value: T) => S): S {
  const select = selector ?? ((v) => v as unknown as S);

  return useSyncExternalStore(
    atom.subscribe,
    () => select(atom.get()),
    () => select(atom.get()), // SSR
  );
}
```

---

## 七、实现路线图

### Phase 1：核心实现（Week 1-2）

| 任务          | 产出         | 验收标准      |
| :------------ | :----------- | :------------ |
| atom 实现     | 基础状态管理 | 100% 测试覆盖 |
| computed 实现 | 派生状态     | 依赖追踪正确  |
| effect 实现   | 副作用管理   | 清理函数工作  |
| batch 实现    | 批量更新     | 更新合并正确  |

### Phase 2：React 集成（Week 3）

| 任务         | 产出       | 验收标准      |
| :----------- | :--------- | :------------ |
| useAtom      | React hook | 并发模式兼容  |
| useAtomValue | 只读 hook  | selector 工作 |
| SSR 支持     | 服务端渲染 | Next.js 可用  |

### Phase 3：质量保证（Week 4）

| 任务     | 产出            | 验收标准         |
| :------- | :-------------- | :--------------- |
| 性能测试 | 基准测试报告    | 不低于 Jotai 80% |
| 体积检查 | Bundle 分析     | ≤ 3KB gzipped    |
| 完整文档 | API 文档 + 示例 | 示例可运行       |

### Phase 4：发布准备（Week 5）

| 任务      | 产出     | 验收标准   |
| :-------- | :------- | :--------- |
| Demo 应用 | 展示项目 | 可交互演示 |
| README    | 项目介绍 | 清晰易懂   |
| npm 发布  | v0.1.0   | 可安装使用 |

---

## 八、成功指标

### 必须达成（v0.1.0 发布条件）

- [ ] Core 包 ≤ 2KB gzipped
- [ ] React 包 ≤ 1KB gzipped
- [ ] 零依赖
- [ ] TypeScript 原生支持
- [ ] 100% 核心 API 测试覆盖
- [ ] React 18 并发模式兼容
- [ ] 完整 API 文档

### 期望达成（v1.0 目标）

- [ ] 自己的项目正式使用
- [ ] 10+ 外部项目使用
- [ ] GitHub 500+ stars
- [ ] 1 篇技术博客传播
- [ ] Next.js/Vite 示例项目

---

## 九、命名与品牌

### 库名：`@aspect/singularity`

**寓意**：

- **Singularity（奇点）**：状态管理的「奇点」，一切从这里开始
- **@aspect**：组织名，表示「视角」——我们提供一种新的状态管理视角

### 口号选择

> **「状态管理，本该如此简单」**

或

> **「让状态像呼吸一样自然」**

或

> **「一行代码，开始共享」**

---

## 十、总结

### Singularity 是什么

- **极致易用**的状态管理库
- **细粒度更新**，性能优异
- **零配置**，即插即用
- **与 React Query/XState 和谐共处**

### Singularity 不是什么

- ❌ 不是 Redux 替代品（不适合超大型应用）
- ❌ 不是 React Query 替代品（不管服务端状态）
- ❌ 不是 XState 替代品（不管复杂状态机）
- ❌ 不是全能选手（专注客户端状态）

### 一句话

> **Singularity：当你只想让两个组件共享数据时，你需要的全部。**

---

_设计文档 v1.0 - 2026-01-08_
