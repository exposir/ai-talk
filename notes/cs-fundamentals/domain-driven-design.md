<!--
- [INPUT]: 依赖 Eric Evans《领域驱动设计》、Vaughn Vernon《实现领域驱动设计》
- [OUTPUT]: 输出 DDD 核心概念、战术/战略设计模式、架构哲学
- [POS]: cs-fundamentals 的架构设计笔记，与 state-machine.md 互补（状态机常用于聚合状态建模）
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

### 工厂 (Factory)

封装复杂聚合的创建逻辑。

```typescript
class OrderFactory {
  constructor(
    private pricingService: PricingService,
    private inventoryChecker: InventoryChecker
  ) {}

  createOrder(customer: CustomerId, items: CartItem[]): Order {
    // 创建逻辑可能涉及多个校验和计算
    this.inventoryChecker.ensureAvailable(items);
    const pricedItems = this.pricingService.calculate(items);
    return new Order(OrderId.generate(), customer, pricedItems);
  }
}
// 理由：当聚合创建逻辑复杂时，不应污染聚合根的构造函数
```

### 应用服务 (Application Service)

用例的编排层，**不包含业务逻辑**，只负责协调领域对象。

```typescript
class PlaceOrderUseCase {
  constructor(
    private orderFactory: OrderFactory,
    private orderRepo: OrderRepository,
    private eventPublisher: EventPublisher
  ) {}

  execute(cmd: PlaceOrderCommand): OrderId {
    // 1. 调用工厂创建聚合
    const order = this.orderFactory.createOrder(cmd.customerId, cmd.items);

    // 2. 执行领域行为
    order.place();

    // 3. 持久化
    this.orderRepo.save(order);

    // 4. 发布领域事件
    this.eventPublisher.publishAll(order.domainEvents);

    return order.id;
  }
}
// 应用服务 = 事务边界 + 用例编排，业务规则在领域对象中
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

## 进阶架构模式

### CQRS (Command Query Responsibility Segregation)

**命令与查询职责分离**：写操作和读操作使用不同的模型。

```
┌─────────────────────────────────────────────────────┐
│                      客户端                          │
└──────────────────┬──────────────────┬───────────────┘
                   │                  │
              Command             Query
                   ▼                  ▼
         ┌─────────────────┐  ┌─────────────────┐
         │   写模型 (领域)   │  │   读模型 (投影)   │
         │   - 聚合        │  │   - 扁平化 DTO   │
         │   - 业务规则     │  │   - 针对查询优化  │
         └────────┬────────┘  └────────▲────────┘
                  │                    │
                  └────── 同步/事件 ────┘
```

**理由**：
- 读写比例悬殊（通常 10:1 甚至 100:1），分离后可独立优化
- 写模型专注业务不变量，读模型专注查询性能
- 代价是数据一致性变为最终一致性

### Event Sourcing (事件溯源)

**不存储状态，只存储状态变化的事件序列。**

```typescript
// 传统方式：存储当前状态
{ id: "order-1", status: "shipped", total: 100 }

// 事件溯源：存储事件流
[
  { type: "OrderCreated", orderId: "order-1", items: [...] },
  { type: "OrderPaid", orderId: "order-1", amount: 100 },
  { type: "OrderShipped", orderId: "order-1", trackingNo: "..." }
]

// 当前状态 = 事件流的折叠 (reduce)
const currentState = events.reduce(applyEvent, initialState);
```

**理由**：
- 完整审计日志，天然支持时间旅行调试
- 可从事件重建任意时刻的状态
- 与领域事件天然契合
- 代价是查询复杂、存储增长、需要快照优化

**何时使用**：审计要求严格、需要历史回溯、事件驱动架构

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

## 前端 DDD 实战

> 传统观点认为 DDD 是后端专属，但复杂前端应用同样面临领域复杂性问题。

### 前端为什么需要 DDD？

```
传统前端架构的痛点：

┌─────────────────────────────────────────────────┐
│                   组件层                         │
│  Button, Modal, Form, Table...                  │
├─────────────────────────────────────────────────┤
│                   状态管理                       │
│  巨大的 store，混杂 UI 状态和业务状态            │
├─────────────────────────────────────────────────┤
│                   API 层                         │
│  直接把后端 DTO 当作前端模型使用                 │
└─────────────────────────────────────────────────┘

问题：业务逻辑散落在组件、store、工具函数中，无处安放
```

### 前端分层架构

```
┌─────────────────────────────────────────────────┐
│              UI 层 (React/Vue 组件)              │
│  - 纯展示逻辑                                    │
│  - 调用 Application Service                     │
├─────────────────────────────────────────────────┤
│              Application 层                      │
│  - 用例编排 (useCase)                           │
│  - 状态管理 (Zustand/Pinia)                     │
├─────────────────────────────────────────────────┤
│              Domain 层                           │
│  - 实体、值对象、领域服务                        │
│  - 业务规则 (纯函数，框架无关)                   │
├─────────────────────────────────────────────────┤
│              Infrastructure 层                   │
│  - API 客户端、LocalStorage、第三方 SDK          │
└─────────────────────────────────────────────────┘
```

### 实战：值对象封装业务规则

```typescript
// ❌ 原始值散落各处，校验逻辑重复
const email = 'user@example.com';
if (!email.includes('@')) throw new Error('Invalid email');

// ✅ 值对象封装
class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    if (!value.includes('@') || value.length > 254) {
      throw new InvalidEmailError(value);
    }
    return new Email(value.toLowerCase().trim());
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// 使用
const email = Email.create(userInput); // 创建即校验，类型即文档
```

### 实战：前端聚合管理复杂表单

```typescript
// 购物车聚合：封装业务不变量
class Cart {
  private items: CartItem[] = [];
  private readonly MAX_ITEMS = 99;

  addItem(product: Product, quantity: number): void {
    if (this.items.length >= this.MAX_ITEMS) {
      throw new CartFullError();
    }

    const existing = this.items.find(i => i.productId === product.id);
    if (existing) {
      existing.increaseQuantity(quantity);
    } else {
      this.items.push(new CartItem(product, quantity));
    }
  }

  get totalPrice(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.zero('CNY')
    );
  }

  // 领域事件：通知 UI 更新
  private events: DomainEvent[] = [];
}

// React Hook 消费聚合
function useCart() {
  const [cart] = useState(() => new Cart());

  const addToCart = (product: Product, qty: number) => {
    try {
      cart.addItem(product, qty);
      // 触发重渲染...
    } catch (e) {
      if (e instanceof CartFullError) {
        toast.error('购物车已满');
      }
    }
  };

  return { cart, addToCart, total: cart.totalPrice };
}
```

### 实战：防腐层隔离后端 DTO

```typescript
// Infrastructure 层：API 返回的原始结构
interface OrderDTO {
  order_id: string;
  created_at: string; // ISO string
  line_items: { sku: string; qty: number; price_cents: number }[];
  status_code: number;
}

// Domain 层：前端领域模型
class Order {
  constructor(
    readonly id: OrderId,
    readonly createdAt: Date,
    readonly items: OrderItem[],
    readonly status: OrderStatus
  ) {}

  get canCancel(): boolean {
    return this.status === OrderStatus.PENDING;
  }
}

// 防腐层：DTO → Domain 转换
class OrderMapper {
  static toDomain(dto: OrderDTO): Order {
    return new Order(
      new OrderId(dto.order_id),
      new Date(dto.created_at),
      dto.line_items.map(item => new OrderItem(
        item.sku,
        item.qty,
        Money.fromCents(item.price_cents, 'CNY')
      )),
      OrderStatus.fromCode(dto.status_code)
    );
  }
}

// API 层使用
async function fetchOrder(id: string): Promise<Order> {
  const dto = await api.get<OrderDTO>(`/orders/${id}`);
  return OrderMapper.toDomain(dto); // 转换后返回领域对象
}
```

### 微前端中的限界上下文

```
┌─────────────────────────────────────────────────────────────┐
│                        主应用 (Shell)                        │
├──────────────────┬──────────────────┬───────────────────────┤
│   订单微前端      │   商品微前端      │    用户微前端          │
│  ┌────────────┐  │  ┌────────────┐  │  ┌────────────────┐   │
│  │ Order      │  │  │ Product    │  │  │ User           │   │
│  │ OrderItem  │  │  │ Category   │  │  │ Address        │   │
│  │ Payment    │  │  │ Inventory  │  │  │ Preference     │   │
│  └────────────┘  │  └────────────┘  │  └────────────────┘   │
│                  │                  │                       │
│  独立的领域模型   │  独立的领域模型   │  独立的领域模型        │
└──────────────────┴──────────────────┴───────────────────────┘

通信方式：
- 自定义事件 (CustomEvent)
- 共享状态总线
- URL 参数传递
```

### 前端 DDD 适用场景

| 场景 | 是否适用 |
| --- | --- |
| 复杂表单（多步骤、条件联动） | ✅ 聚合封装状态和规则 |
| 金融/电商核心业务 | ✅ 值对象确保数据正确性 |
| 多团队协作的大型 SPA | ✅ 限界上下文划分边界 |
| 简单展示型页面 | ❌ 过度设计 |
| 后端驱动的 CRUD 管理台 | ⚠️ 看复杂度 |

### 推荐技术栈组合

| 层级 | React 生态 | Vue 生态 |
| --- | --- | --- |
| 状态管理 | Zustand / Jotai | Pinia |
| 数据获取 | TanStack Query | VueQuery |
| 表单验证 | Zod + react-hook-form | Zod + VeeValidate |
| 领域模型 | 纯 TypeScript Class | 纯 TypeScript Class |

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
