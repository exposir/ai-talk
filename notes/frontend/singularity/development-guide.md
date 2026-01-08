# 开发实施文档

> 本文档是 Singularity 的**唯一开发指南**，阅读后可直接开始编码。

---

## 一、项目概述

### 1.1 定位

**Singularity** = Zustand 的简单 + Redux 的追踪 + Jotai 的细粒度

### 1.2 为什么从底层设计？

| 问题                | 能用插件解决吗？ | 原因                            |
| :------------------ | :--------------- | :------------------------------ |
| 给 Zustand 加追踪   | ✅ 能            | 中间件已存在                    |
| 给 Jotai 加追踪     | ✅ 能            | devtools 已存在                 |
| 给 Zustand 加细粒度 | ❌ **不能**      | 架构决定（单 store + selector） |
| 给 Jotai 简化 API   | ❌ **不能**      | 原子组合是核心设计哲学          |

> Zustand 的「非细粒度」是架构问题，Jotai 的「API 复杂」是设计哲学。三合一组合必须从底层重新设计。

### 1.3 目标指标

| 指标     | 目标        |
| :------- | :---------- |
| API 数量 | ≤ 5 个      |
| 学习时间 | ≤ 5 分钟    |
| 包体积   | ≤ 4KB       |
| 性能     | ≥ Jotai 80% |

### 1.2 包结构

```
packages/
├── core/                 # @singularity/core (~3KB)
│   ├── src/
│   │   ├── atom.ts       # 原子状态
│   │   ├── computed.ts   # 派生状态
│   │   ├── effect.ts     # 副作用
│   │   ├── batch.ts      # 批处理
│   │   ├── trace.ts      # 追踪层
│   │   └── index.ts
│   └── __tests__/
│
└── react/                # @singularity/react (~1KB)
    ├── src/
    │   ├── useAtom.ts
    │   ├── useAtomValue.ts
    │   └── index.ts
    └── __tests__/
```

---

## 二、开发环境

### 2.1 初始化

```bash
mkdir singularity && cd singularity
pnpm init

# 创建 pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
EOF

# 创建目录结构
mkdir -p packages/core/src packages/core/__tests__
mkdir -p packages/react/src packages/react/__tests__

# 安装依赖
pnpm add -D typescript tsup vitest -w
```

### 2.2 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true
  }
}
```

### 2.3 包配置

```json
// packages/core/package.json
{
  "name": "@singularity/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "test": "vitest"
  }
}
```

---

## 三、核心实现

### 3.1 atom.ts

```typescript
import { trackDependency } from './trace';
import { isBatching, schedulePendingUpdate } from './batch';

type Listener = () => void;

interface HistoryEntry<T> {
  from: T;
  to: T;
  time: number;
}

let atomId = 0;

export function atom<T>(initial: T) {
  const id = `atom:${++atomId}`;
  let value = initial;
  const listeners = new Set<Listener>();
  const history: HistoryEntry<T>[] = [];

  const notify = () => {
    listeners.forEach((fn) => fn());
  };

  return {
    id,

    get() {
      trackDependency(this);
      return value;
    },

    set(next: T | ((prev: T) => T)) {
      const newValue =
        typeof next === 'function' ? (next as (prev: T) => T)(value) : next;

      if (Object.is(value, newValue)) return;

      // 开发模式：记录历史
      if (process.env.NODE_ENV !== 'production') {
        history.push({ from: value, to: newValue, time: Date.now() });
        if (history.length > 100) history.shift(); // 限制长度
      }

      value = newValue;

      if (isBatching()) {
        schedulePendingUpdate(notify);
      } else {
        notify();
      }
    },

    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    history() {
      return [...history];
    },

    restore(index: number) {
      if (history[index]) {
        this.set(history[index].from);
      }
    },
  };
}

export type Atom<T> = ReturnType<typeof atom<T>>;
```

### 3.2 computed.ts

```typescript
import { Tracker, startTracking, stopTracking, trackDependency } from './trace';

let computedId = 0;

export function computed<T>(read: () => T) {
  const id = `computed:${++computedId}`;
  let cachedValue: T;
  let dirty = true;
  const listeners = new Set<() => void>();

  const markDirty = () => {
    if (!dirty) {
      dirty = true;
      listeners.forEach((fn) => fn());
    }
  };

  // 创建 Tracker，依赖变化时触发 markDirty
  const tracker = new Tracker(markDirty);

  return {
    id,

    get() {
      trackDependency(this);

      if (dirty) {
        // 清理旧的依赖订阅，避免内存泄漏
        tracker.cleanup();

        startTracking(tracker);
        try {
          cachedValue = read();
        } finally {
          stopTracking();
        }
        dirty = false;
      }

      return cachedValue;
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export type Computed<T> = ReturnType<typeof computed<T>>;
```

### 3.3 effect.ts

```typescript
import { Tracker, startTracking, stopTracking } from './trace';

let effectId = 0;

export function effect(fn: () => void | (() => void)) {
  const id = `effect:${++effectId}`;
  let cleanup: (() => void) | void;
  let isDisposed = false;

  const run = () => {
    if (isDisposed) return;

    // 清理用户的 cleanup 函数
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }

    // 清理旧的依赖订阅
    tracker.cleanup();

    startTracking(tracker);
    try {
      cleanup = fn();
    } finally {
      stopTracking();
    }
  };

  // 创建 Tracker，依赖变化时触发 run
  const tracker = new Tracker(run);

  // 立即执行一次
  run();

  return {
    dispose() {
      isDisposed = true;
      tracker.cleanup(); // 清理所有订阅
      if (cleanup) cleanup();
    },
  };
}

export type Effect = ReturnType<typeof effect>;
```

### 3.4 batch.ts

```typescript
let batchDepth = 0;
const pendingUpdates = new Set<() => void>();

export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const updates = [...pendingUpdates];
      pendingUpdates.clear();
      updates.forEach((update) => update());
    }
  }
}

export function isBatching(): boolean {
  return batchDepth > 0;
}

export function schedulePendingUpdate(fn: () => void): void {
  pendingUpdates.add(fn);
}
```

### 3.6 index.ts（导出文件）

```typescript
// packages/core/src/index.ts
export { atom, type Atom } from './atom';
export { computed, type Computed } from './computed';
export { effect, type Effect } from './effect';
export { batch } from './batch';

// packages/react/src/index.ts
export { useAtom } from './useAtom';
export { useAtomValue } from './useAtomValue';
```

### 3.5 trace.ts（依赖追踪）

```typescript
type Unsubscribe = () => void;
type OnInvalidate = () => void;

// 当前正在追踪的 Tracker
let currentTracker: Tracker | null = null;

/**
 * Tracker 管理依赖订阅的生命周期
 * 每次重新计算前清理旧订阅，避免内存泄漏
 */
export class Tracker {
  private subscriptions: Unsubscribe[] = [];
  private onInvalidate: OnInvalidate;

  constructor(onInvalidate: OnInvalidate) {
    this.onInvalidate = onInvalidate;
  }

  // 记录一个新的订阅
  track(unsubscribe: Unsubscribe): void {
    this.subscriptions.push(unsubscribe);
  }

  // 触发失效回调
  invalidate(): void {
    this.onInvalidate();
  }

  // 清理所有旧订阅
  cleanup(): void {
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions = [];
  }
}

export function startTracking(tracker: Tracker): void {
  currentTracker = tracker;
}

export function stopTracking(): void {
  currentTracker = null;
}

export function trackDependency(node: any): void {
  if (currentTracker) {
    const tracker = currentTracker;
    // 订阅依赖变化，变化时触发失效回调
    const unsubscribe = node.subscribe(() => {
      tracker.invalidate();
    });
    tracker.track(unsubscribe);
  }
}
```

---

## 四、React 适配器

### 4.1 useAtom.ts

```typescript
import { useSyncExternalStore, useCallback, useRef } from 'react';
import type { Atom, Computed } from '@singularity/core';

export function useAtom<T>(atom: Atom<T> | Computed<T>): T;
export function useAtom<T, R>(atom: Atom<T>, selector: (value: T) => R): R;
export function useAtom<T, R>(
  atom: Atom<T> | Computed<T>,
  selector?: (value: T) => R,
): T | R {
  // 稳定 selector 引用，避免每次渲染创建新函数
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const getSnapshot = useCallback(
    () => {
      const value = atom.get();
      return selectorRef.current ? selectorRef.current(value) : value;
    },
    [atom], // selector 通过 ref 引用，不需要作为依赖
  );

  return useSyncExternalStore(
    atom.subscribe,
    getSnapshot,
    getSnapshot, // SSR
  );
}
```

### 4.2 useAtomValue.ts

```typescript
import { useSyncExternalStore } from 'react';
import type { Atom, Computed } from '@singularity/core';

export function useAtomValue<T>(atom: Atom<T> | Computed<T>): T {
  return useSyncExternalStore(atom.subscribe, atom.get, atom.get);
}
```

---

## 五、开发任务

### Phase 1：Core (Week 1-3)

- [ ] atom 实现 + 历史记录
- [ ] computed 实现 + 依赖追踪
- [ ] effect 实现 + 清理函数
- [ ] batch 实现 + 嵌套支持
- [ ] 单元测试 100% 覆盖

### Phase 2：React (Week 4-5)

- [ ] useAtom 实现
- [ ] useAtomValue 实现
- [ ] SSR 支持验证
- [ ] React 18 并发模式测试

### Phase 3：发布 (Week 6)

- [ ] npm 发布
- [ ] 文档完善
- [ ] Demo 项目

---

## 六、测试用例

### 6.1 atom 测试

```typescript
import { describe, it, expect } from 'vitest';
import { atom } from '../src/atom';

describe('atom', () => {
  it('should get and set value', () => {
    const count = atom(0);
    expect(count.get()).toBe(0);
    count.set(1);
    expect(count.get()).toBe(1);
  });

  it('should support functional update', () => {
    const count = atom(0);
    count.set((prev) => prev + 1);
    expect(count.get()).toBe(1);
  });

  it('should notify subscribers', () => {
    const count = atom(0);
    let called = 0;
    count.subscribe(() => called++);
    count.set(1);
    expect(called).toBe(1);
  });

  it('should record history in dev mode', () => {
    const count = atom(0);
    count.set(1);
    count.set(2);
    expect(count.history()).toHaveLength(2);
  });
});
```

### 6.2 computed 测试

```typescript
describe('computed', () => {
  it('should compute derived value', () => {
    const a = atom(1);
    const b = atom(2);
    const sum = computed(() => a.get() + b.get());
    expect(sum.get()).toBe(3);
  });

  it('should update when dependencies change', () => {
    const a = atom(1);
    const double = computed(() => a.get() * 2);
    expect(double.get()).toBe(2);
    a.set(5);
    expect(double.get()).toBe(10);
  });
});
```

### 6.3 batch 测试

```typescript
describe('batch', () => {
  it('should batch updates', () => {
    const a = atom(0);
    const b = atom(0);
    let calls = 0;

    const sum = computed(() => {
      calls++;
      return a.get() + b.get();
    });

    sum.get(); // 初始计算
    calls = 0;

    batch(() => {
      a.set(1);
      b.set(2);
    });

    sum.get();
    expect(calls).toBe(1); // 只计算一次
  });
});
```

---

## 七、性能基准

```typescript
// benchmark.ts
import { atom, computed } from '@singularity/core';

const iterations = 10000;

// 测试 atom 读写
console.time('atom read/write');
const count = atom(0);
for (let i = 0; i < iterations; i++) {
  count.set(i);
  count.get();
}
console.timeEnd('atom read/write');

// 测试 computed
console.time('computed');
const a = atom(0);
const b = computed(() => a.get() * 2);
for (let i = 0; i < iterations; i++) {
  a.set(i);
  b.get();
}
console.timeEnd('computed');
```

**目标**：不低于 Jotai 80% 性能

---

_实施文档 v2.0 - 2026-01-08_
