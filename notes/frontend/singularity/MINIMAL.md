# Singularity: 声明式状态约束引擎

> **核心哲学**：「状态不仅要管理，还要约束」

---

## 一、定位

### 我们是什么

**Singularity 是一个带声明式约束的状态管理库。**

```typescript
// 其他库：状态可以是任意值
const count = atom(0);
count.set(-999); // ✅ 允许

// Singularity：状态有边界
const count = atom(0, { min: 0, max: 100 });
count.set(-999); // → 自动变成 0
count.set(999); // → 自动变成 100
```

### 我们不是什么

- ❌ 不是 Jotai 替代品（我们有约束，它没有）
- ❌ 不是 XState 替代品（FSM 太重，我们更轻）
- ❌ 不是表单库（React Hook Form 更专业）

### 与竞品的关系

| 库          | 核心能力      | 关系                              |
| :---------- | :------------ | :-------------------------------- |
| Zustand     | 存取状态      | 配合使用                          |
| Jotai       | 原子化 + 派生 | 配合使用                          |
| XState      | 状态机        | 互补（复杂用 XState，简单用我们） |
| React Query | 服务端缓存    | 完全不冲突                        |

---

## 二、核心 API

### 基础层（与 Jotai 类似）

```typescript
import { atom, computed, effect } from '@aspect/singularity';

const name = atom('Alice');
const greeting = computed(() => `Hello, ${name.get()}`);
effect(() => console.log(greeting.get()));
```

### 约束层（核心差异化）

#### 1. 边界约束 `min` / `max`

```typescript
// 数值边界
const count = atom(0, { min: 0, max: 100 });

count.set(150); // → 100 (自动裁剪)
count.set(-10); // → 0   (自动裁剪)

// 动态边界
const maxPrice = atom(1000);
const price = atom(500, {
  max: () => maxPrice.get(), // 边界可以是响应式的
});
```

#### 2. 校验约束 `validate`

```typescript
const email = atom('', {
  validate: (v) => /\S+@\S+\.\S+/.test(v),
  onInvalid: (v) => '', // 无效时回退到空字符串
});

email.set('invalid'); // → ''
email.set('a@b.com'); // → 'a@b.com'
```

#### 3. 转换约束 `transform`

```typescript
const username = atom('', {
  transform: (v) => v.toLowerCase().trim(),
});

username.set('  ALICE  '); // → 'alice'
```

#### 4. 依赖约束 `when`

```typescript
const startDate = atom(new Date('2026-01-01'));
const endDate = atom(new Date('2026-01-10'));

// 当开始日期变化时，确保结束日期大于开始日期
constrain(endDate, {
  when: () => endDate.get() <= startDate.get(),
  then: () => new Date(startDate.get().getTime() + 86400000), // +1 天
});
```

---

## 三、使用场景

### 场景 1：表单输入约束

```typescript
const age = atom(0, { min: 0, max: 150 });
const email = atom('', { validate: (v) => isEmail(v) });
const password = atom('', { validate: (v) => v.length >= 8 });

const canSubmit = computed(() => email.isValid() && password.isValid());
```

### 场景 2：购物车数量

```typescript
const quantity = atom(1, { min: 1, max: 99 });
const price = atom(100);

const total = computed(() => quantity.get() * price.get());
```

### 场景 3：日期范围选择

```typescript
const start = atom(new Date());
const end = atom(new Date(), {
  min: () => start.get(), // 结束日期不能早于开始
});
```

---

## 四、与 React 集成

```typescript
import { useAtom, useAtomValue } from '@aspect/singularity/react';

function AgeInput() {
  const age = useAtom(ageAtom);
  const isValid = useAtomValue(ageAtom.valid); // 约束是否满足

  return (
    <input
      type="number"
      value={age}
      onChange={(e) => ageAtom.set(Number(e.target.value))}
      className={isValid ? '' : 'error'}
    />
  );
}
```

---

## 五、技术亮点

### 1. 约束是响应式的

```typescript
const max = atom(100);
const value = atom(50, { max: () => max.get() });

value.set(80); // ✅ 80
max.set(60); // 此时 value 自动变成 60！
```

### 2. 约束可组合

```typescript
const value = atom(0, {
  min: 0,
  max: 100,
  transform: (v) => Math.round(v), // 先取整
  validate: (v) => v % 10 === 0, // 必须是 10 的倍数
  onInvalid: (v) => Math.round(v / 10) * 10, // 自动修正
});

value.set(33.7); // → 30 (取整33 → 不是10倍数 → 修正为30)
```

### 3. TypeScript 类型推断

```typescript
const count = atom(0, { min: 0, max: 100 });
//    ^? Atom<number> with constraints

count.set('hello'); // ❌ 类型错误
```

---

## 六、包体积

| 模块                                     | 体积       |
| :--------------------------------------- | :--------- |
| core (atom/computed/effect)              | ~2KB       |
| constraints (min/max/validate/transform) | ~1KB       |
| react (useAtom/useAtomValue)             | ~0.5KB     |
| **Total**                                | **~3.5KB** |

---

## 七、路线图

| Phase | 周期     | 内容                               |
| :---- | :------- | :--------------------------------- |
| 1     | Week 1-2 | 基础层：atom/computed/effect       |
| 2     | Week 3-4 | 约束层：min/max/validate/transform |
| 3     | Week 5   | React 集成 + 文档                  |
| 4     | Week 6   | 发布 v0.1.0                        |

---

## 八、口号

> **「状态管理，边界清晰」**

或

> **「约束即文档」**

---

_设计文档 v2.0 - 2026-01-08_
