# 附录

> 路线图、模板与参考资料。

---

## 附录 A：实施路线图

### Phase 1: Core (Week 1-3)

- [ ] atom + 历史记录
- [ ] computed + 依赖追踪
- [ ] effect + 清理函数
- [ ] batch + 嵌套支持
- [ ] 单元测试

### Phase 2: React (Week 4-5)

- [ ] useAtom
- [ ] useAtomValue
- [ ] SSR 支持

### Phase 3: 发布 (Week 6)

- [ ] npm 发布
- [ ] 文档完善
- [ ] Demo 项目

---

## 附录 B：Kill Criteria

| 检查点 | 条件                    | 动作     |
| :----- | :---------------------- | :------- |
| Week 3 | 性能 < Jotai 80%        | 重新评估 |
| Week 5 | React 并发不兼容        | 切换方案 |
| Week 8 | 反馈「比 Zustand 复杂」 | 简化 API |

---

## 附录 C：代码模板

### atom 基本用法

```typescript
import { atom } from '@singularity/core';
import { useAtom } from '@singularity/react';

const count = atom(0);

function Counter() {
  const value = useAtom(count);
  return <button onClick={() => count.set(v => v + 1)}>{value}</button>;
}
```

### computed 用法

```typescript
const price = atom(100);
const quantity = atom(2);
const total = computed(() => price.get() * quantity.get());
```

### effect 用法

```typescript
effect(() => {
  console.log('Count changed:', count.get());
});
```

---

_附录 v2.0 - 2026-01-08_
