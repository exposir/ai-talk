<!--
- [INPUT]: 依赖 notes/cs-fundamentals/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出本文件内容
- [POS]: 位于 notes/cs-fundamentals 模块 的文档
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 领域驱动设计 (DDD)

> Domain-Driven Design，由 Eric
> Evans 在 2003 年《领域驱动设计：软件核心复杂性应对之道》中提出。

## 本质层：DDD 解决什么问题？

**核心矛盾**：软件的复杂性来自业务领域，而非技术本身。

传统开发的致命伤：

- 开发者用技术语言思考，业务专家用领域语言表达
- 沟通鸿沟导致需求失真，代码逐渐与业务脱节
- 最终：软件变成技术人员的自嗨产品，无法真正解决业务问题

**DDD 的答案**：让代码直接反映业务领域，消除翻译损耗。

---

## 核心概念

### 1. 统一语言 (Ubiquitous Language)

**最重要的概念，没有之一。**

```
❌ 错误示范：
业务专家：「用户下单后要冻结库存」
开发人员：「我写个 updateStatus() 方法」

✅ 正确做法：
代码中直接使用 freezeInventory()，而非 updateStatus()
业务术语 = 代码命名 = 文档用语 = 会议用语
```

### 2. 领域模型 (Domain Model)

业务逻辑的代码化身，**不是数据库表的映射**。

```typescript
// ❌ 贫血模型（Anti-pattern）
class Order {
  id: string;
  status: string;
  items: Item[];
  // 纯数据容器，逻辑在 Service 里
}

// ✅ 充血模型（DDD 推荐）
class Order {
  private status: OrderStatus;
  private items: OrderItem[];

  place(): void {
    if (this.items.length === 0) {
      throw new EmptyOrderError();
    }
    this.status = OrderStatus.PLACED;
    this.recordEvent(new OrderPlacedEvent(this));
  }

  cancel(): void {
    if (!this.status.canCancel()) {
      throw new OrderCannotBeCancelledError();
    }
    this.status = OrderStatus.CANCELLED;
  }
}
```

### 3. 限界上下文 (Bounded Context)

**一个词在不同上下文有不同含义，必须明确边界。**

```
「账户」在不同上下文中的含义：

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   用户上下文     │  │   交易上下文     │  │   风控上下文     │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ 账户 = 登录凭证  │  │ 账户 = 资金账户  │  │ 账户 = 风险主体  │
│ - 用户名        │  │ - 余额          │  │ - 风险等级       │
│ - 密码          │  │ - 交易记录      │  │ - 黑名单状态     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**每个限界上下文内部保持模型一致性，上下文之间通过明确的接口通信。**

---

## 战术设计模式

### 实体 (Entity)

有唯一标识，跨时间追踪。

```typescript
class User {
  readonly id: UserId; // 身份标识
  name: string; // 可变属性
}
// 两个 User 相等 ⟺ id 相等
```

### 值对象 (Value Object)

无唯一标识，完全由属性定义。

```typescript
class Money {
  readonly amount: number;
  readonly currency: string;

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError();
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}
// 两个 Money 相等 ⟺ amount 和 currency 都相等
```

### 聚合 (Aggregate)

一组相关对象的边界，保证一致性。

```typescript
class Order {
  // 聚合根
  private items: OrderItem[]; // 聚合内部对象

  addItem(product: ProductId, quantity: number): void {
    // 所有修改必须通过聚合根
    this.items.push(new OrderItem(product, quantity));
  }
}
// 外部只能通过 Order 操作 OrderItem，不能直接访问
```

### 领域事件 (Domain Event)

记录领域中发生的重要事情。

```typescript
class OrderPlacedEvent {
  readonly orderId: OrderId;
  readonly occurredAt: Date;
  readonly items: OrderItemSnapshot[];
}

// 事件驱动：下单后触发库存扣减、发送通知等
```

### 仓储 (Repository)

聚合的持久化接口，隐藏存储细节。

```typescript
interface OrderRepository {
  save(order: Order): void;
  findById(id: OrderId): Order | null;
  // 注意：返回的是领域对象，不是数据库行
}
```

---

## 战略设计

### 上下文映射 (Context Map)

描述限界上下文之间的关系：

| 关系模式         | 含义                     | 示例                     |
| ---------------- | ------------------------ | ------------------------ |
| **共享内核**     | 两个上下文共享一部分模型 | 用户模型在多个服务中复用 |
| **客户-供应商**  | 上游决定接口，下游适配   | 核心业务 → 报表系统      |
| **防腐层 (ACL)** | 隔离外部系统的污染       | 对接第三方支付           |
| **开放主机服务** | 提供标准化 API           | 平台开放能力             |

```
┌──────────────┐    防腐层    ┌──────────────┐
│  订单上下文   │◄───────────►│  支付网关     │
│  (核心领域)   │    ACL      │  (第三方)     │
└──────────────┘             └──────────────┘
```

---

## 哲学层：DDD 的认知论

### 1. 软件是对现实世界的建模

代码不是凭空创造的技术产物，而是**业务领域的镜像**。好的代码读起来像业务规则的描述：

```typescript
// 读这段代码，你能理解业务规则
order.place();
inventory.freeze(order.items);
payment.charge(order.total);
notification.sendConfirmation(order.customer);
```

### 2. 持续演化而非一次设计

领域知识是**迭代获取**的。第一版模型一定是错的，关键是：

- 频繁与业务专家对话
- 让模型随认知深化而重构
- 接受"错误"是学习的必经之路

### 3. 分治复杂性

大系统 = 多个限界上下文 × 清晰的边界 × 明确的协作关系

**复杂性不会消失，只会转移。**
DDD 的目标是把复杂性放到正确的位置——领域模型中，而非分散在整个代码库。

---

## 何时使用 DDD？

| 场景                         | 是否适用            |
| ---------------------------- | ------------------- |
| 业务逻辑复杂、规则多变       | ✅ 强烈推荐         |
| CRUD 为主的简单应用          | ❌ 过度设计         |
| 技术驱动型项目（如框架开发） | ❌ 不适用           |
| 团队有领域专家参与           | ✅ 效果最佳         |
| 团队 < 3 人的小项目          | ⚠️ 看情况，可能太重 |

---

## 推荐阅读

1. **《领域驱动设计》** - Eric Evans（蓝皮书，原著）
2. **《实现领域驱动设计》** - Vaughn Vernon（红皮书，实战指南）
3. **《领域驱动设计精粹》** - Vaughn Vernon（入门级，100 页快速理解）

---

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
