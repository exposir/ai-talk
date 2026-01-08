# Singularity 开发实施文档

> 本文档是 Singularity 状态管理库的**唯一开发指南**，包含所有开发所需的技术规范、任务分解和验收标准。
> 阅读本文档后，开发者应能立即开始编码工作。

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术架构](#2-技术架构)
3. [开发环境搭建](#3-开发环境搭建)
4. [API 规范详解](#4-api-规范详解)
5. [开发任务分解](#5-开发任务分解)
6. [测试与验收标准](#6-测试与验收标准)
7. [代码规范](#7-代码规范)
8. [常见问题](#8-常见问题)

---

## 1. 项目概述

### 1.1 项目定位

**Singularity（奇点）** 是一个面向现代前端的状态管理库，核心目标是：

- **统一心智模型**：用一套 API 覆盖本地状态、服务端缓存、状态机
- **细粒度响应式**：基于 Signal 的精确依赖追踪
- **可观测性优先**：所有状态变更可追踪、可回放
- **框架无关**：核心与框架适配器分离

### 1.2 版本规划

| 版本 | 周期 | 核心能力 | 状态 |
|:-----|:-----|:---------|:-----|
| **v0.1** | Week 1-4 | atom/computed/batch/effect + React 适配器 | 🚧 开发中 |
| **v0.2** | Week 5-8 | atomAsync (缓存/取消/去重) | ⏳ 计划中 |
| **v0.3** | Week 9-12 | machine (状态机) | ⏳ 计划中 |
| **v1.0** | Week 13-16 | DevTools + 完整文档 | ⏳ 计划中 |
| **v1.1** | Week 17+ | atomSync (CRDT 协作) - 可选 | ⚠️ 高风险 |

### 1.3 包结构

```
packages/
├── core/                 # @singularity/core - 核心原语
│   ├── src/
│   │   ├── atom.ts       # 原子状态
│   │   ├── computed.ts   # 派生状态
│   │   ├── batch.ts      # 批处理
│   │   ├── effect.ts     # 副作用
│   │   ├── store.ts      # 多实例 Store
│   │   ├── async.ts      # 异步状态 (v0.2)
│   │   ├── machine.ts    # 状态机 (v0.3)
│   │   ├── devtools.ts   # 可观测协议
│   │   └── index.ts      # 导出入口
│   ├── __tests__/        # 单元测试
│   └── package.json
│
├── react/                # @singularity/react - React 适配器
│   ├── src/
│   │   ├── useAtom.ts
│   │   ├── useAtomValue.ts
│   │   ├── useSetAtom.ts
│   │   └── index.ts
│   ├── __tests__/
│   └── package.json
│
├── vue/                  # @singularity/vue - Vue 适配器 (v1.0)
│
└── devtools/             # @singularity/devtools - 开发者工具 (v1.0)
```

### 1.4 技术栈

| 类别 | 技术选型 | 版本要求 |
|:-----|:---------|:---------|
| 语言 | TypeScript | ^5.0 |
| 构建 | tsup / Vite | 最新 |
| 测试 | Vitest | ^1.0 |
| 包管理 | pnpm workspace | ^8.0 |
| 代码规范 | ESLint + Prettier | - |
| React | React 18+ | ^18.0 |

---

## 2. 技术架构

### 2.1 架构分层图

```
┌─────────────────────────────────────────────────────────────┐
│                    Framework Adapters                        │
│                  (@singularity/react, vue)                   │
│    ┌─────────────────────────────────────────────────────┐  │
│    │  useAtom  │  useAtomValue  │  useSetAtom  │  ...    │  │
│    └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      State Layer                             │
│                    (@singularity/core)                       │
│    ┌──────────┬──────────┬──────────┬──────────────────┐   │
│    │   Atom   │ Computed │  Async   │     Machine      │   │
│    │ (Signal) │ (Derived)│ (Cache)  │      (FSM)       │   │
│    └──────────┴──────────┴──────────┴──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Scheduler & Effects                        │
│    ┌──────────────────────────────────────────────────────┐ │
│    │  Batch Queue  │  Dependency Graph  │  Subscriptions  │ │
│    └──────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    DevTools Protocol                         │
│    ┌──────────────────────────────────────────────────────┐ │
│    │  TraceEvent  │  Snapshot  │  Time Travel  │  Export  │ │
│    └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心数据结构

#### 2.2.1 依赖图 (Dependency Graph)

```typescript
// 节点类型
type NodeType = 'atom' | 'computed' | 'effect';

// 节点结构
interface Node<T = unknown> {
  id: string;
  type: NodeType;
  value: T;
  version: number;           // 版本号，用于脏检查
  dependencies: Set<Node>;   // 我依赖谁
  dependents: Set<Node>;     // 谁依赖我
  listeners: Set<() => void>; // 订阅者
}

// 全局依赖图
class DependencyGraph {
  private nodes: Map<string, Node> = new Map();
  private currentComputing: Node | null = null; // 当前正在计算的节点

  // 追踪依赖
  track(node: Node): void;

  // 触发更新
  trigger(node: Node): void;

  // 拓扑排序更新
  propagate(startNode: Node): void;
}
```

#### 2.2.2 批处理队列 (Batch Queue)

```typescript
interface BatchContext {
  depth: number;              // 嵌套深度
  pendingUpdates: Set<Node>;  // 待更新节点
  pendingEffects: Array<() => void>; // 待执行副作用
}

// 全局批处理上下文
let batchContext: BatchContext | null = null;

function batch(fn: () => void): void {
  const isOuterBatch = batchContext === null;

  if (isOuterBatch) {
    batchContext = { depth: 0, pendingUpdates: new Set(), pendingEffects: [] };
  }

  batchContext!.depth++;

  try {
    fn();
  } finally {
    batchContext!.depth--;

    if (batchContext!.depth === 0 && isOuterBatch) {
      // 批次结束，统一处理更新
      flushUpdates(batchContext!);
      batchContext = null;
    }
  }
}
```

### 2.3 关键设计决策

#### 2.3.1 为什么选择 Signal 而不是 Proxy？

| 方案 | 优势 | 劣势 | 决策 |
|:-----|:-----|:-----|:-----|
| **Signal** | 显式依赖追踪、性能可预测 | 需要 `.get()` 语法 | ✅ 采用 |
| **Proxy** | 写法自然 | 隐式依赖难追踪、调试困难 | ❌ 不采用 |

#### 2.3.2 React 并发模式兼容性

**问题**：Signal 直接更新可能导致 React Concurrent Mode 下的 Tearing（撕裂）。

**解决方案**：强制使用 `useSyncExternalStore`

```typescript
// ✅ 正确实现
import { useSyncExternalStore } from 'react';

export function useAtom<T>(atom: Atom<T>): T {
  return useSyncExternalStore(
    atom.subscribe,
    atom.get,
    atom.get, // SSR 快照
  );
}

// ❌ 错误实现 - 会导致 tearing
export function useAtomWrong<T>(atom: Atom<T>): T {
  const [, forceUpdate] = useState({});
  useEffect(() => atom.subscribe(() => forceUpdate({})), [atom]);
  return atom.get();
}
```

---

## 3. 开发环境搭建

### 3.1 初始化项目

```bash
# 1. 创建项目目录
mkdir singularity && cd singularity

# 2. 初始化 pnpm workspace
pnpm init

# 3. 创建 pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
EOF

# 4. 创建 packages 目录结构
mkdir -p packages/core/src packages/core/__tests__
mkdir -p packages/react/src packages/react/__tests__

# 5. 安装开发依赖
pnpm add -D typescript tsup vitest @types/node -w
pnpm add -D eslint prettier @typescript-eslint/parser -w
```

### 3.2 TypeScript 配置

```json
// tsconfig.json (根目录)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "exclude": ["node_modules", "dist"]
}
```

### 3.3 Core 包配置

```json
// packages/core/package.json
{
  "name": "@singularity/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --dts --watch",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 3.4 React 包配置

```json
// packages/react/package.json
{
  "name": "@singularity/react",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "peerDependencies": {
    "@singularity/core": "workspace:*",
    "react": "^18.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.0.0",
    "react": "^18.0.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 4. API 规范详解

### 4.1 Core API - atom

#### 类型定义

```typescript
/**
 * Atom - 可读写的原子状态
 */
export interface Atom<T> {
  /** 唯一标识符 */
  readonly id: string;

  /** 获取当前值 */
  get(): T;

  /** 设置新值 */
  set(next: T | ((prev: T) => T)): void;

  /** 订阅变化 */
  subscribe(listener: () => void): () => void;
}

/**
 * 创建原子状态
 * @param initial - 初始值
 * @returns Atom<T>
 */
export function atom<T>(initial: T): Atom<T>;
```

#### 实现要求

```typescript
// packages/core/src/atom.ts

let atomIdCounter = 0;

export function atom<T>(initial: T): Atom<T> {
  const id = `atom:${++atomIdCounter}`;
  let value = initial;
  let version = 0;
  const listeners = new Set<() => void>();

  const atomInstance: Atom<T> = {
    id,

    get() {
      // 1. 如果在 computed 计算中，追踪依赖
      trackDependency(atomInstance);
      return value;
    },

    set(next) {
      const nextValue = typeof next === 'function'
        ? (next as (prev: T) => T)(value)
        : next;

      // 2. 值未变化则跳过
      if (Object.is(value, nextValue)) return;

      value = nextValue;
      version++;

      // 3. 记录 TraceEvent
      emitTraceEvent({
        type: 'write',
        nodeId: id,
        payload: { prev: value, next: nextValue },
      });

      // 4. 如果在 batch 中，延迟通知
      if (isBatching()) {
        schedulePendingUpdate(atomInstance);
      } else {
        // 5. 立即通知订阅者
        notifyListeners(listeners);
      }
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return atomInstance;
}
```

#### 使用示例

```typescript
import { atom } from '@singularity/core';

// 基础用法
const count = atom(0);
console.log(count.get()); // 0

count.set(1);
console.log(count.get()); // 1

// 函数式更新
count.set(prev => prev + 1);
console.log(count.get()); // 2

// 订阅变化
const unsubscribe = count.subscribe(() => {
  console.log('count changed:', count.get());
});

count.set(10); // 输出: count changed: 10
unsubscribe();
```

---

### 4.2 Core API - computed

#### 类型定义

```typescript
/**
 * Computed - 只读的派生状态
 */
export interface Computed<T> {
  /** 唯一标识符 */
  readonly id: string;

  /** 获取计算值（惰性计算） */
  get(): T;

  /** 订阅变化 */
  subscribe(listener: () => void): () => void;
}

/**
 * 创建派生状态
 * @param read - 计算函数，内部通过 .get() 自动追踪依赖
 * @returns Computed<T>
 */
export function computed<T>(read: () => T): Computed<T>;
```

#### 实现要求

```typescript
// packages/core/src/computed.ts

let computedIdCounter = 0;

export function computed<T>(read: () => T): Computed<T> {
  const id = `computed:${++computedIdCounter}`;
  let cachedValue: T;
  let dirty = true;
  let version = 0;
  const listeners = new Set<() => void>();
  const dependencies = new Set<Atom<unknown> | Computed<unknown>>();

  const computedInstance: Computed<T> = {
    id,

    get() {
      // 1. 追踪依赖（如果在另一个 computed 中）
      trackDependency(computedInstance);

      // 2. 脏检查，需要重新计算
      if (dirty) {
        // 3. 清除旧依赖
        dependencies.clear();

        // 4. 开始追踪新依赖
        startTracking(computedInstance, dependencies);

        try {
          cachedValue = read();
        } catch (error) {
          // 5. 记录错误到 TraceEvent
          emitTraceEvent({
            type: 'effect',
            nodeId: id,
            error: String(error),
          });
          throw error;
        } finally {
          stopTracking();
        }

        dirty = false;
        version++;
      }

      return cachedValue;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  // 6. 当依赖变化时，标记为脏
  const markDirty = () => {
    if (!dirty) {
      dirty = true;
      notifyListeners(listeners);
    }
  };

  return computedInstance;
}
```

#### 循环依赖检测

```typescript
// 追踪栈，用于检测循环依赖
const computingStack: Computed<unknown>[] = [];

function startTracking(node: Computed<unknown>, deps: Set<unknown>) {
  // 检测循环依赖
  if (computingStack.includes(node)) {
    const cycle = [...computingStack, node].map(n => n.id).join(' -> ');
    throw new Error(`Circular dependency detected: ${cycle}`);
  }
  computingStack.push(node);
}

function stopTracking() {
  computingStack.pop();
}
```

#### 使用示例

```typescript
import { atom, computed } from '@singularity/core';

const price = atom(100);
const quantity = atom(2);
const tax = atom(0.1);

// 自动追踪 price, quantity, tax 三个依赖
const total = computed(() => {
  const subtotal = price.get() * quantity.get();
  return subtotal * (1 + tax.get());
});

console.log(total.get()); // 220

price.set(200);
console.log(total.get()); // 440 (自动重新计算)

// 订阅变化
total.subscribe(() => {
  console.log('total changed:', total.get());
});
```

---

### 4.3 Core API - batch

#### 类型定义

```typescript
/**
 * 批量更新，合并多次写入为一次通知
 * @param fn - 批量操作函数
 */
export function batch(fn: () => void): void;
```

#### 实现要求

```typescript
// packages/core/src/batch.ts

interface BatchContext {
  depth: number;
  pendingNodes: Set<Atom<unknown> | Computed<unknown>>;
  batchId: string;
}

let batchContext: BatchContext | null = null;
let batchIdCounter = 0;

export function batch(fn: () => void): void {
  const isOuterBatch = batchContext === null;

  if (isOuterBatch) {
    batchContext = {
      depth: 0,
      pendingNodes: new Set(),
      batchId: `batch:${++batchIdCounter}`,
    };
  }

  batchContext!.depth++;

  try {
    fn();
  } finally {
    batchContext!.depth--;

    // 只在最外层 batch 结束时刷新
    if (batchContext!.depth === 0 && isOuterBatch) {
      const { pendingNodes, batchId } = batchContext!;
      batchContext = null;

      // 1. 拓扑排序
      const sortedNodes = topologicalSort(pendingNodes);

      // 2. 依次更新 computed
      for (const node of sortedNodes) {
        if (isComputed(node)) {
          node.get(); // 触发重新计算
        }
      }

      // 3. 通知所有订阅者
      const notifiedListeners = new Set<() => void>();
      for (const node of pendingNodes) {
        for (const listener of node.listeners) {
          if (!notifiedListeners.has(listener)) {
            notifiedListeners.add(listener);
            listener();
          }
        }
      }

      // 4. 记录 TraceEvent
      emitTraceEvent({
        type: 'write',
        nodeId: 'batch',
        batchId,
        payload: { nodeCount: pendingNodes.size },
      });
    }
  }
}

export function isBatching(): boolean {
  return batchContext !== null;
}

export function schedulePendingUpdate(node: Atom<unknown> | Computed<unknown>): void {
  if (batchContext) {
    batchContext.pendingNodes.add(node);
  }
}
```

#### 使用示例

```typescript
import { atom, computed, batch } from '@singularity/core';

const a = atom(1);
const b = atom(2);
const sum = computed(() => a.get() + b.get());

let renderCount = 0;
sum.subscribe(() => {
  renderCount++;
  console.log('sum:', sum.get());
});

// 不使用 batch：触发 2 次更新
a.set(10); // 输出: sum: 12
b.set(20); // 输出: sum: 30

// 使用 batch：只触发 1 次更新
batch(() => {
  a.set(100);
  b.set(200);
}); // 输出: sum: 300 (只触发一次)

// 嵌套 batch：仍然只触发 1 次
batch(() => {
  a.set(1);
  batch(() => {
    b.set(2);
  });
}); // 输出: sum: 3 (只触发一次)
```

---

### 4.4 Core API - effect

#### 类型定义

```typescript
/**
 * Effect - 副作用对象
 */
export interface Effect {
  /** 手动销毁副作用 */
  dispose(): void;
}

/**
 * 创建副作用，依赖变化时自动重新执行
 * @param fn - 副作用函数
 * @returns Effect
 */
export function effect(fn: () => void | (() => void)): Effect;
```

#### 实现要求

```typescript
// packages/core/src/effect.ts

let effectIdCounter = 0;

export function effect(fn: () => void | (() => void)): Effect {
  const id = `effect:${++effectIdCounter}`;
  let cleanup: (() => void) | void;
  let isDisposed = false;
  const dependencies = new Set<Atom<unknown> | Computed<unknown>>();
  const unsubscribers: Array<() => void> = [];

  const run = () => {
    if (isDisposed) return;

    // 1. 执行上一次的清理函数
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }

    // 2. 清除旧订阅
    unsubscribers.forEach(unsub => unsub());
    unsubscribers.length = 0;
    dependencies.clear();

    // 3. 追踪依赖并执行
    startTracking(null, dependencies);

    try {
      cleanup = fn();

      emitTraceEvent({
        type: 'effect',
        nodeId: id,
      });
    } catch (error) {
      emitTraceEvent({
        type: 'effect',
        nodeId: id,
        error: String(error),
      });
      console.error(`Effect ${id} error:`, error);
    } finally {
      stopTracking();
    }

    // 4. 订阅所有依赖
    for (const dep of dependencies) {
      unsubscribers.push(dep.subscribe(run));
    }
  };

  // 5. 立即执行一次
  run();

  return {
    dispose() {
      if (isDisposed) return;
      isDisposed = true;

      if (cleanup) {
        cleanup();
      }

      unsubscribers.forEach(unsub => unsub());
      unsubscribers.length = 0;
      dependencies.clear();
    },
  };
}
```

#### 使用示例

```typescript
import { atom, effect } from '@singularity/core';

const count = atom(0);

// 基础用法
const e1 = effect(() => {
  console.log('count is:', count.get());
});

count.set(1); // 输出: count is: 1
count.set(2); // 输出: count is: 2

// 带清理函数
const e2 = effect(() => {
  const timer = setInterval(() => {
    console.log('tick:', count.get());
  }, 1000);

  // 返回清理函数
  return () => {
    clearInterval(timer);
    console.log('timer cleared');
  };
});

// 手动销毁
e1.dispose();
e2.dispose(); // 输出: timer cleared
```

---

### 4.5 React API - useAtom

#### 类型定义

```typescript
/**
 * 订阅 atom/computed 并触发组件更新
 * @param node - Atom 或 Computed
 * @returns 当前值
 */
export function useAtom<T>(node: Atom<T> | Computed<T>): T;

/**
 * 带 Selector 的订阅（性能优化）
 * @param node - Atom
 * @param selector - 选择器函数
 * @returns 选择后的值
 */
export function useAtom<T, R>(
  node: Atom<T>,
  selector: (state: T) => R,
): R;
```

#### 实现要求

```typescript
// packages/react/src/useAtom.ts

import { useSyncExternalStore, useCallback, useRef } from 'react';
import type { Atom, Computed } from '@singularity/core';

// 浅比较
function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!Object.is((a as any)[key], (b as any)[key])) return false;
  }

  return true;
}

export function useAtom<T>(node: Atom<T> | Computed<T>): T;
export function useAtom<T, R>(node: Atom<T>, selector: (state: T) => R): R;
export function useAtom<T, R>(
  node: Atom<T> | Computed<T>,
  selector?: (state: T) => R,
): T | R {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const getSnapshot = useCallback(() => {
    const value = node.get();
    if (selectorRef.current) {
      return selectorRef.current(value as T);
    }
    return value;
  }, [node]);

  // 使用 useSyncExternalStore 保证并发安全
  return useSyncExternalStore(
    node.subscribe,
    getSnapshot,
    getSnapshot, // SSR 快照
  );
}
```

#### 使用示例

```tsx
import { atom, computed } from '@singularity/core';
import { useAtom } from '@singularity/react';

const count = atom(0);
const double = computed(() => count.get() * 2);

function Counter() {
  const value = useAtom(count);
  const doubled = useAtom(double);

  return (
    <div>
      <p>Count: {value}</p>
      <p>Double: {doubled}</p>
      <button onClick={() => count.set(v => v + 1)}>
        Increment
      </button>
    </div>
  );
}

// 使用 Selector 优化（只订阅部分状态）
const user = atom({ name: 'Alice', age: 30, email: 'alice@example.com' });

function UserName() {
  // 只有 name 变化时才重渲染
  const name = useAtom(user, u => u.name);
  return <p>Name: {name}</p>;
}
```

---

### 4.6 DevTools API - TraceEvent

#### 类型定义

```typescript
/**
 * 可观测事件
 */
export interface TraceEvent {
  id: string;
  ts: number;
  type: 'read' | 'write' | 'effect' | 'async' | 'sync';
  nodeId: string;
  payload?: unknown;
  batchId?: string;
  error?: string;
}

/**
 * 状态快照
 */
export interface TraceSnapshot {
  nodes: Record<string, unknown>;
  edges: Array<{ from: string; to: string }>;
}

/**
 * 导出格式
 */
export interface TraceExport {
  protocolVersion: string;
  events: TraceEvent[];
  snapshots: TraceSnapshot[];
}
```

#### 实现要求

```typescript
// packages/core/src/devtools.ts

const PROTOCOL_VERSION = '1.0.0';
const MAX_EVENTS = 1000;

let events: TraceEvent[] = [];
let eventIdCounter = 0;
let enabled = process.env.NODE_ENV !== 'production';

export function emitTraceEvent(
  event: Omit<TraceEvent, 'id' | 'ts'>,
): void {
  if (!enabled) return;

  const traceEvent: TraceEvent = {
    ...event,
    id: `evt:${++eventIdCounter}`,
    ts: Date.now(),
  };

  events.push(traceEvent);

  // 限制事件数量
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }

  // 通知 DevTools
  if (typeof window !== 'undefined' && (window as any).__SINGULARITY_DEVTOOLS__) {
    (window as any).__SINGULARITY_DEVTOOLS__.onEvent(traceEvent);
  }
}

export function getSnapshot(): TraceSnapshot {
  // 实现状态快照导出
  return {
    nodes: {},
    edges: [],
  };
}

export function exportTrace(): TraceExport {
  return {
    protocolVersion: PROTOCOL_VERSION,
    events: [...events],
    snapshots: [getSnapshot()],
  };
}

export function clearTrace(): void {
  events = [];
}

export function setTraceEnabled(value: boolean): void {
  enabled = value;
}
```

---

## 5. 开发任务分解

### 5.1 Phase 1: Core MVP (Week 1-4)

#### Week 1: 项目搭建 + atom 实现

| 任务 | 负责人 | 预估工时 | 产出物 |
|:-----|:-------|:---------|:-------|
| 初始化 monorepo 项目结构 | - | 2h | pnpm workspace |
| 配置 TypeScript + ESLint + Prettier | - | 2h | 配置文件 |
| 配置 Vitest 测试框架 | - | 1h | vitest.config.ts |
| 实现 atom 核心逻辑 | - | 4h | atom.ts |
| 实现 atom 订阅机制 | - | 2h | - |
| 编写 atom 单元测试 | - | 3h | atom.test.ts |

**验收标准**：
- [ ] `atom.get()` 返回当前值
- [ ] `atom.set()` 更新值并通知订阅者
- [ ] `atom.set(fn)` 支持函数式更新
- [ ] `atom.subscribe()` 返回取消订阅函数
- [ ] 值未变化时不触发通知（Object.is 比较）

#### Week 2: computed + 依赖追踪

| 任务 | 负责人 | 预估工时 | 产出物 |
|:-----|:-------|:---------|:-------|
| 实现依赖图数据结构 | - | 3h | graph.ts |
| 实现依赖追踪机制 | - | 4h | tracking.ts |
| 实现 computed 核心逻辑 | - | 4h | computed.ts |
| 实现脏检查与惰性计算 | - | 2h | - |
| 实现循环依赖检测 | - | 2h | - |
| 编写 computed 单元测试 | - | 3h | computed.test.ts |

**验收标准**：
- [ ] `computed.get()` 返回计算值
- [ ] 依赖变化时自动重新计算
- [ ] 依赖未变化时返回缓存值
- [ ] 检测并抛出循环依赖错误
- [ ] 支持嵌套 computed

#### Week 3: batch + effect

| 任务 | 负责人 | 预估工时 | 产出物 |
|:-----|:-------|:---------|:-------|
| 实现 batch 批处理逻辑 | - | 3h | batch.ts |
| 实现嵌套 batch 合并 | - | 2h | - |
| 实现 effect 副作用 | - | 4h | effect.ts |
| 实现 effect 清理函数 | - | 2h | - |
| 实现 DevTools 事件采集 | - | 3h | devtools.ts |
| 编写 batch/effect 测试 | - | 4h | batch.test.ts, effect.test.ts |

**验收标准**：
- [ ] batch 内多次更新只触发一次通知
- [ ] 嵌套 batch 合并为单一批次
- [ ] effect 依赖变化时自动重新执行
- [ ] effect.dispose() 正确清理
- [ ] effect 返回的清理函数被调用
- [ ] TraceEvent 正确记录 write/effect 事件

#### Week 4: React 适配器 + Demo

| 任务 | 负责人 | 预估工时 | 产出物 |
|:-----|:-------|:---------|:-------|
| 实现 useAtom Hook | - | 3h | useAtom.ts |
| 实现 useAtomValue Hook | - | 1h | useAtomValue.ts |
| 实现 useSetAtom Hook | - | 1h | useSetAtom.ts |
| 实现 Selector 浅比较 | - | 2h | - |
| 创建 Demo 应用（计数器） | - | 3h | demo/ |
| 编写 React 集成测试 | - | 4h | react.test.tsx |
| **性能基准测试** | - | 4h | benchmark/ |

**验收标准**：
- [ ] useAtom 正确订阅并更新组件
- [ ] 使用 useSyncExternalStore 实现
- [ ] Selector 版本只在选择值变化时更新
- [ ] Demo 计数器 + batch 渲染合并正常
- [ ] **性能不低于 Jotai 80%**

---

### 5.2 Phase 2: Async MVP (Week 5-8)

#### Week 5-6: atomAsync 核心

| 任务 | 负责人 | 预估工时 | 产出物 |
|:-----|:-------|:---------|:-------|
| 设计 AsyncAtom 类型 | - | 2h | types.ts |
| 实现 atomAsync 基础逻辑 | - | 6h | async.ts |
| 实现缓存机制 (staleTime/cacheTime) | - | 4h | cache.ts |
| 实现请求去重 (dedupe) | - | 3h | - |
| 实现请求取消 (AbortController) | - | 4h | - |
| 编写单元测试 | - | 4h | async.test.ts |

#### Week 7-8: 重试 + Suspense

| 任务 | 负责人 | 预估工时 | 产出物 |
|:-----|:-------|:---------|:-------|
| 实现重试机制 | - | 3h | - |
| 实现乐观更新 | - | 4h | - |
| 实现 Suspense 集成 | - | 6h | suspense.ts |
| Demo: 请求 + 取消 + 重试 | - | 4h | demo/ |
| 并发 100 请求基准测试 | - | 4h | benchmark/ |

**验收标准**：
- [ ] 同 key 并发请求自动去重
- [ ] 新请求取消旧请求
- [ ] 过期响应不覆盖新值
- [ ] staleTime 内返回缓存
- [ ] 支持 Suspense

---

### 5.3 Phase 3: Machine MVP (Week 9-12)

#### Week 9-10: 状态机核心

| 任务 | 负责人 | 预估工时 | 产出物 |
|:-----|:-------|:---------|:-------|
| 设计 Machine 类型 | - | 2h | types.ts |
| 实现 machine 核心逻辑 | - | 6h | machine.ts |
| 实现状态转换 | - | 4h | - |
| 实现 entry/exit 回调 | - | 3h | - |
| 编写单元测试 | - | 4h | machine.test.ts |

#### Week 11-12: 与 atom 集成

| 任务 | 负责人 | 预估工时 | 产出物 |
|:-----|:-------|:---------|:-------|
| 实现 machine.state atom | - | 3h | - |
| 实现 effect 联动 | - | 4h | - |
| Demo: 登录状态机 | - | 4h | demo/ |
| 集成测试 | - | 4h | integration.test.ts |

**验收标准**：
- [ ] send() 触发正确的状态转换
- [ ] 无匹配转换时忽略事件
- [ ] entry/exit 在正确时机执行
- [ ] machine.state 是一个 Atom
- [ ] 可通过 effect 响应状态变化

---

### 5.4 Phase 4: DevTools + 文档 (Week 13-16)

| 任务 | 负责人 | 预估工时 | 产出物 |
|:-----|:-------|:---------|:-------|
| DevTools 面板 UI | - | 8h | devtools/ |
| 时间线回放功能 | - | 6h | - |
| 状态快照导出 | - | 4h | - |
| API 文档编写 | - | 8h | docs/ |
| Vue 适配器 | - | 6h | vue/ |
| 性能基准报告 | - | 4h | benchmark/ |

---

## 6. 测试与验收标准

### 6.1 单元测试用例清单

#### atom.test.ts

```typescript
describe('atom', () => {
  describe('get/set', () => {
    it('should return initial value', () => {
      const count = atom(0);
      expect(count.get()).toBe(0);
    });

    it('should update value with set()', () => {
      const count = atom(0);
      count.set(1);
      expect(count.get()).toBe(1);
    });

    it('should support functional update', () => {
      const count = atom(0);
      count.set(prev => prev + 1);
      expect(count.get()).toBe(1);
    });

    it('should not notify when value unchanged', () => {
      const count = atom(0);
      const listener = vi.fn();
      count.subscribe(listener);
      count.set(0);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on change', () => {
      const count = atom(0);
      const listener = vi.fn();
      count.subscribe(listener);
      count.set(1);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      const count = atom(0);
      const listener = vi.fn();
      const unsubscribe = count.subscribe(listener);
      unsubscribe();
      count.set(1);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
```

#### computed.test.ts

```typescript
describe('computed', () => {
  it('should compute derived value', () => {
    const a = atom(1);
    const b = atom(2);
    const sum = computed(() => a.get() + b.get());
    expect(sum.get()).toBe(3);
  });

  it('should recompute when dependency changes', () => {
    const a = atom(1);
    const double = computed(() => a.get() * 2);
    expect(double.get()).toBe(2);
    a.set(2);
    expect(double.get()).toBe(4);
  });

  it('should use cached value when dependencies unchanged', () => {
    const computeFn = vi.fn(() => 42);
    const c = computed(computeFn);
    c.get();
    c.get();
    c.get();
    expect(computeFn).toHaveBeenCalledTimes(1);
  });

  it('should detect circular dependency', () => {
    // @ts-expect-error - 故意创建循环依赖
    const a: Computed<number> = computed(() => b.get() + 1);
    const b = computed(() => a.get() + 1);
    expect(() => a.get()).toThrow(/circular/i);
  });

  it('should support nested computed', () => {
    const a = atom(1);
    const b = computed(() => a.get() * 2);
    const c = computed(() => b.get() * 3);
    expect(c.get()).toBe(6);
    a.set(2);
    expect(c.get()).toBe(12);
  });
});
```

#### batch.test.ts

```typescript
describe('batch', () => {
  it('should batch multiple updates', () => {
    const a = atom(0);
    const b = atom(0);
    const sum = computed(() => a.get() + b.get());
    const listener = vi.fn();
    sum.subscribe(listener);

    batch(() => {
      a.set(1);
      b.set(2);
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(sum.get()).toBe(3);
  });

  it('should merge nested batches', () => {
    const count = atom(0);
    const listener = vi.fn();
    count.subscribe(listener);

    batch(() => {
      count.set(1);
      batch(() => {
        count.set(2);
      });
      count.set(3);
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(count.get()).toBe(3);
  });
});
```

#### effect.test.ts

```typescript
describe('effect', () => {
  it('should run immediately', () => {
    const count = atom(0);
    const effectFn = vi.fn();
    effect(() => {
      effectFn(count.get());
    });
    expect(effectFn).toHaveBeenCalledWith(0);
  });

  it('should re-run when dependency changes', () => {
    const count = atom(0);
    const effectFn = vi.fn();
    effect(() => {
      effectFn(count.get());
    });
    count.set(1);
    expect(effectFn).toHaveBeenCalledWith(1);
  });

  it('should call cleanup function', () => {
    const count = atom(0);
    const cleanup = vi.fn();
    effect(() => {
      count.get();
      return cleanup;
    });
    count.set(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should dispose correctly', () => {
    const count = atom(0);
    const effectFn = vi.fn();
    const e = effect(() => {
      effectFn(count.get());
    });
    e.dispose();
    count.set(1);
    expect(effectFn).toHaveBeenCalledTimes(1); // 只有初始执行
  });
});
```

### 6.2 性能基准测试

```typescript
// benchmark/core.bench.ts

import { bench, describe } from 'vitest';
import { atom, computed, batch } from '@singularity/core';
import { atom as jotaiAtom } from 'jotai/vanilla';

describe('atom performance', () => {
  bench('singularity: 1000 writes', () => {
    const a = atom(0);
    for (let i = 0; i < 1000; i++) {
      a.set(i);
    }
  });

  bench('jotai: 1000 writes', () => {
    const store = createStore();
    const a = jotaiAtom(0);
    for (let i = 0; i < 1000; i++) {
      store.set(a, i);
    }
  });
});

describe('computed performance', () => {
  bench('singularity: 1000 reads with 10 deps', () => {
    const atoms = Array.from({ length: 10 }, (_, i) => atom(i));
    const sum = computed(() => atoms.reduce((acc, a) => acc + a.get(), 0));
    for (let i = 0; i < 1000; i++) {
      sum.get();
    }
  });
});

describe('batch performance', () => {
  bench('singularity: batch 100 updates', () => {
    const atoms = Array.from({ length: 100 }, () => atom(0));
    batch(() => {
      atoms.forEach((a, i) => a.set(i));
    });
  });
});
```

### 6.3 验收检查清单

#### M0 (Week 4) 验收

- [ ] **功能完整性**
  - [ ] atom 基础功能正常
  - [ ] computed 依赖追踪正确
  - [ ] batch 合并更新正常
  - [ ] effect 生命周期正确
  - [ ] React useAtom 工作正常

- [ ] **测试覆盖**
  - [ ] 单元测试覆盖率 > 80%
  - [ ] 所有边界案例有测试

- [ ] **性能达标**
  - [ ] atom/computed 性能不低于 Jotai 80%
  - [ ] 基准测试报告生成

- [ ] **Demo 可用**
  - [ ] 计数器 Demo 正常运行
  - [ ] batch 渲染合并可验证

#### M1 (Week 8) 验收

- [ ] atomAsync 缓存/取消/去重正确
- [ ] Suspense 集成正常
- [ ] 并发 100 请求无泄漏

#### M2 (Week 12) 验收

- [ ] machine 状态转换正确
- [ ] entry/exit 时机正确
- [ ] 与 atom 集成无冲突

#### M3 (Week 16) 验收

- [ ] DevTools 面板可用
- [ ] 时间线回放正常
- [ ] API 文档完整

---

## 7. 代码规范

### 7.1 文件命名

```
kebab-case.ts       # 模块文件
PascalCase.tsx      # React 组件
*.test.ts           # 测试文件
*.bench.ts          # 基准测试
```

### 7.2 导出规范

```typescript
// ✅ 正确：具名导出
export function atom<T>(initial: T): Atom<T>;
export type { Atom, Computed, Effect };

// ❌ 错误：默认导出
export default function atom() {}
```

### 7.3 类型规范

```typescript
// ✅ 正确：接口定义公共 API
export interface Atom<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
}

// ✅ 正确：类型别名用于联合类型
export type NodeType = 'atom' | 'computed' | 'effect';

// ❌ 错误：使用 any
function process(data: any) {}

// ✅ 正确：使用 unknown
function process(data: unknown) {}
```

### 7.4 注释规范

```typescript
/**
 * 创建原子状态
 *
 * @param initial - 初始值
 * @returns Atom 实例
 *
 * @example
 * ```ts
 * const count = atom(0);
 * count.set(1);
 * ```
 */
export function atom<T>(initial: T): Atom<T>;
```

---

## 8. 常见问题

### 8.1 为什么 computed 中不能调用 set？

```typescript
// ❌ 错误：会导致无限循环
const bad = computed(() => {
  count.set(count.get() + 1); // 不要这样做！
  return count.get();
});

// ✅ 正确：使用 effect 处理副作用
effect(() => {
  if (count.get() > 10) {
    anotherAtom.set('overflow');
  }
});
```

### 8.2 为什么 useAtom 必须用 useSyncExternalStore？

使用 `useState` + `useEffect` 订阅外部状态在 React 18 Concurrent Mode 下会导致 **Tearing（撕裂）**——同一次渲染中读到不一致的状态。

`useSyncExternalStore` 是 React 18 官方提供的解决方案，它会：
1. 在渲染期间同步读取外部状态
2. 自动处理并发更新的一致性
3. 支持 SSR

### 8.3 如何调试依赖追踪问题？

```typescript
import { exportTrace } from '@singularity/core';

// 导出所有事件
const trace = exportTrace();
console.log(trace.events);

// 查看依赖图
console.log(trace.snapshots[0].edges);
```

### 8.4 batch 中的更新顺序重要吗？

不重要。batch 结束时会进行**拓扑排序**，按依赖关系顺序更新。

```typescript
batch(() => {
  // 这两个顺序不影响结果
  derived.get(); // 可能依赖 base
  base.set(1);   // 先写 base
});
// batch 结束时：base 更新 -> derived 重算 -> 通知订阅者
```

---

## 附录

### A. 参考资料

- [Jotai 源码](https://github.com/pmndrs/jotai)
- [Zustand 源码](https://github.com/pmndrs/zustand)
- [useSyncExternalStore RFC](https://github.com/reactwg/react-18/discussions/86)
- [Signal 细粒度响应式](https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf)

### B. 更新日志

| 日期 | 版本 | 变更内容 |
|:-----|:-----|:---------|
| 2026-01-08 | 1.0.0 | 初始版本 |

---

_本文档由 Claude 生成，最后更新于 2026-01-08_
