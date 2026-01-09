<!--
- [INPUT]: 依赖 notes/claude-code/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 Claude Code 大型前端项目最佳实践 文档
- [POS]: 位于 notes/claude-code 模块的 Claude Code 大型前端项目最佳实践 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Claude Code 大型前端项目最佳实践

使用 Claude Code 设计和开发大型前端项目的**社区验证**实战指南。

**核心目标：最小化手动代码修改，让 Claude 完成 90%+ 的编码工作。**

---

## 核心心智模型

> **把 Claude Code 当作一个需要明确指令的高效团队，而不是代码补全工具。**

社区验证的关键认知：

| 传统思维           | Claude Code 思维           |
| ------------------ | -------------------------- |
| 写代码让 AI 补全   | 描述需求让 AI 生成完整模块 |
| 手动修改 AI 输出   | 通过更精确的提示词重新生成 |
| 一次会话完成所有事 | 分功能/分职责多会话协作    |
| 边写边调试         | 先测试后生成，TDD 模式     |

---

## 一、项目配置架构

### 1.1 CLAUDE.md 分层策略

社区经验：**大型项目需要多层配置**，避免单一配置文件过于庞大。

```
project-root/
├── CLAUDE.md                    # 项目级：技术栈、架构模式、全局规范
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   └── CLAUDE.md        # 功能级：认证模块特定规范
│   │   └── payment/
│   │       └── CLAUDE.md        # 功能级：支付模块特定规范
│   └── shared/
│       └── CLAUDE.md            # 共享层：组件库规范
└── .claude/
    ├── settings.json            # 权限配置
    └── rules/                   # 规则文件
        ├── react.md
        ├── typescript.md
        └── testing.md
```

### 1.2 项目级 CLAUDE.md 模板

```markdown
# [项目名称]

## 技术栈

- Framework: Next.js 14 (App Router)
- Language: TypeScript 5.x (strict)
- Styling: TailwindCSS + CSS Variables
- State: Zustand + React Query
- Testing: Vitest + Playwright

## 架构模式

采用 Feature-Sliced Design (FSD)，严格分层：

- app/ → 路由和页面组装
- features/ → 业务功能模块
- entities/ → 业务实体
- shared/ → 可复用基础设施

## 代码生成规则

生成任何代码必须：

1. 100% TypeScript，禁止 any
2. 所有组件必须有对应的 .test.tsx
3. 使用现有的 shared/ui 组件，不重复造轮子
4. 遵循现有代码风格，查看 @src/shared/ui 作为参考

## 常用命令

pnpm dev / pnpm test / pnpm build

## 文件命名

- 组件: PascalCase.tsx
- Hook: useCamelCase.ts
- 工具: camelCase.ts
- 测试: \*.test.tsx
```

### 1.3 功能级 CLAUDE.md 示例

```markdown
# Auth Feature

## 职责范围

用户认证相关：登录、注册、密码重置、Session 管理

## 依赖

- @shared/ui (Button, Input, Form)
- @shared/api (httpClient)
- @entities/user

## API 端点

POST /api/auth/login POST /api/auth/register POST /api/auth/reset-password

## 特殊规则

- 所有表单使用 react-hook-form + zod
- 错误信息必须国际化
- 登录状态使用 zustand persist
```

---

## 二、上下文工程（关键！）

社区反馈最多的问题：**Claude 生成的代码不符合项目风格**。

根因：上下文提供不足或不精确。

### 2.1 精确上下文提供法

```bash
# ❌ 模糊请求 - 高概率需要手动修改
> 创建一个登录表单

# ✅ 精确请求 - 几乎无需修改
> 创建登录表单组件 LoginForm：
>
> 参考现有组件风格：
> @src/shared/ui/Form/Form.tsx
> @src/shared/ui/Input/Input.tsx
> @src/shared/ui/Button/Button.tsx
>
> 要求：
> - 使用 react-hook-form + zod 验证
> - 字段：email (email格式), password (最少8位)
> - 提交调用 @src/features/auth/api/login.ts
> - 错误显示在对应字段下方
> - Loading 状态禁用按钮
> - 包含单元测试文件
>
> 放置位置: src/features/auth/ui/LoginForm/
```

### 2.2 上下文引用优先级

```bash
# 1. 引用相似组件（最重要）
@src/features/user/ui/ProfileForm/  # 让 Claude 学习现有风格

# 2. 引用共享组件
@src/shared/ui/  # 确保使用统一组件库

# 3. 引用类型定义
@src/entities/user/types.ts  # 确保类型一致

# 4. 引用 API 层
@src/features/auth/api/  # 确保正确调用 API
```

### 2.3 会话管理策略

社区验证：**长会话是代码质量下降的主因**。

```bash
# 规则一：一个功能一个会话
claude --resume auth-login       # 登录功能
claude --resume auth-register    # 注册功能（新会话）

# 规则二：定期压缩
/compact  # 当上下文过长时压缩

# 规则三：任务完成后立即提交
git add . && git commit -m "feat: login form"
/clear  # 开始新任务前清空
```

---

## 三、架构设计工作流

### 3.1 Plan Mode 优先

社区经验：**先让 Claude 规划，再让它实现，成功率提升 3 倍**。

```bash
# Step 1: 进入规划模式
claude --permission-mode plan

# Step 2: 让 Claude 分析并规划
> 我需要实现一个电商购物车功能，包含：
> - 添加/删除商品
> - 修改数量
> - 优惠券
> - 结算
>
> 请根据现有项目结构 @src/ 规划：
> 1. 需要创建哪些文件
> 2. 数据结构设计
> 3. 状态管理方案
> 4. 组件拆分
>
> 不要生成代码，只输出规划。

# Step 3: 审核规划后切换到执行模式
Shift+Tab  # 切换到 Auto-Accept
> 按照上面的规划，开始创建文件结构和基础代码
```

### 3.2 分阶段生成

```bash
# Phase 1: 类型定义（基础层）
> 根据规划，先创建购物车相关的 TypeScript 类型定义
> 放在 @entities/cart/types.ts

# Phase 2: 状态管理
> 基于刚才的类型，创建购物车 Zustand store
> 参考现有 store: @entities/user/model/store.ts

# Phase 3: API 层
> 创建购物车 API 服务，使用项目的 httpClient
> 参考: @shared/api/client.ts

# Phase 4: UI 组件
> 创建购物车组件，消费刚才创建的 store 和 API
> 参考现有列表组件: @features/product/ui/ProductList/
```

---

## 四、减少手动修改的关键技术

### 4.1 Skills 系统

Claude Code 的 Skills 可以注入专业知识，提升生成质量。

创建 `.claude/skills/frontend-design.md`:

```markdown
# Frontend Design Skill

## 视觉设计原则

- 使用项目的颜色变量，不硬编码颜色
- 间距使用 TailwindCSS 的标准单位 (4, 8, 16, 24, 32)
- 圆角保持一致性 (rounded-md 或 rounded-lg)
- 阴影层级：普通元素 shadow-sm，悬浮 shadow-md，模态框 shadow-xl

## 动画规范

- 使用 transition-all duration-200 ease-in-out
- 微交互：hover 时 scale-105
- 加载状态：使用 animate-pulse 或 animate-spin

## 响应式断点

- sm: 640px
- md: 768px
- lg: 1024px
- 移动优先：默认样式为移动端
```

使用：

```bash
> 使用 @.claude/skills/frontend-design.md 创建产品卡片组件
```

### 4.2 测试驱动开发 (TDD)

社区验证的高效模式：**先写测试，让 Claude 实现**。

```bash
# Step 1: 让 Claude 先生成测试
> 为购物车的"添加商品"功能编写测试用例
> 覆盖：正常添加、重复添加、数量超限

# Step 2: 运行测试确保失败
pnpm test cart.test.ts

# Step 3: 让 Claude 实现功能
> 现在实现 addToCart 函数，让刚才的测试全部通过

# Step 4: 验证
pnpm test cart.test.ts
```

### 4.3 截图驱动开发

```bash
# 提供设计稿截图
> 根据这个设计截图实现组件：
> [粘贴截图]
>
> 要求：
> - 像素级还原布局
> - 使用项目的 TailwindCSS 配置
> - 响应式适配
> - 使用 @shared/ui 的现有组件
```

### 4.4 重构而非重写

当生成的代码不完美时：

```bash
# ❌ 错误做法：手动修改
# ✅ 正确做法：让 Claude 重构

> 重构刚才生成的 LoginForm：
> - 将表单验证逻辑提取到 useLoginForm hook
> - 将错误处理逻辑统一化
> - 保持所有功能和 API 接口不变
```

---

## 五、Multi-Claude 协作模式

### 5.1 分工并行开发

```bash
# Terminal 1: 架构 Claude
claude --resume arch-session
> 设计购物车模块架构

# Terminal 2: 组件 Claude
claude --resume ui-session
> 实现 CartItem 组件（基于架构 Claude 的设计）

# Terminal 3: 测试 Claude
claude --resume test-session
> 为 CartItem 编写测试用例
```

### 5.2 Git Worktree 隔离

```bash
# 主功能分支
git worktree add ../feature-cart -b feature/cart
cd ../feature-cart && claude --resume cart-main

# 并行处理另一个功能
git worktree add ../feature-checkout -b feature/checkout
cd ../feature-checkout && claude --resume checkout-main
```

### 5.3 验证 Claude

开一个专门用于验证的会话：

```bash
claude --resume code-review
> 审查 @src/features/cart/ 的所有代码：
> 1. 类型安全检查
> 2. 性能问题
> 3. 最佳实践遵循度
> 4. 测试覆盖率
> 5. 可能的 bug
```

---

## 六、常见场景快速指令

### 新增页面

```bash
> 创建订单列表页面 /orders：
> 参考现有页面结构: @src/app/products/page.tsx
> 使用: @features/order/api @shared/ui/Table
> 功能: 分页、筛选、排序
> 包含: loading 状态、空状态、错误处理
```

### 新增 API 集成

```bash
> 添加获取订单列表 API:
> 端点: GET /api/orders?page=&limit=&status=
> 参考现有 API: @src/features/product/api/
> 使用 React Query 封装 hook
> 添加类型定义和单元测试
```

### 组件变体扩展

```bash
> 为 Button 组件添加新变体:
> 现有组件: @src/shared/ui/Button/
> 添加: variant="ghost" 和 variant="link"
> 保持现有 API 兼容
> 更新 Storybook stories
```

### 代码迁移

```bash
> 将 Class 组件迁移为函数组件:
> 目标文件: @src/legacy/OldDashboard.jsx
> 要求:
> - 保持所有功能不变
> - 转换为 TypeScript
> - 使用 hooks 替代生命周期
> - 添加单元测试
```

---

## 七、质量保证循环

### 7.1 生成后自动验证

创建 `.claude/commands/validate.md`:

```markdown
执行以下验证：

1. pnpm typecheck - TypeScript 检查
2. pnpm lint - ESLint 检查
3. pnpm test --changed - 运行相关测试
4. 报告所有问题
5. 如果有问题，自动修复
```

使用：`/validate`

### 7.2 提交前检查

```bash
> 检查我的更改是否可以提交:
> git diff --staged
>
> 验证:
> - 代码风格一致
> - 无遗留 console.log
> - 无硬编码值
> - 测试通过
> - 无类型错误
```

---

## 八、常见陷阱与解决方案

| 陷阱                   | 解决方案                               |
| ---------------------- | -------------------------------------- |
| 生成的代码风格不一致   | 提供现有代码作为参考上下文             |
| 组件不使用现有设计系统 | 在 CLAUDE.md 强调，并 @ 引用 shared/ui |
| 会话太长导致混乱       | 每个功能新建会话，频繁 /compact        |
| 生成后需要大量修改     | 提示词不够精确，增加约束条件           |
| 测试覆盖不足           | 采用 TDD 模式，先测试后实现            |
| UI 太过 generic        | 使用 Skills 注入设计规范               |

---

## 核心原则总结

1. **配置先行** - 完善的 CLAUDE.md 分层配置
2. **上下文精确** - 始终 @ 引用相关现有代码
3. **Plan 优先** - 先规划后执行
4. **分阶段生成** - 类型 → API → Store → UI
5. **TDD 模式** - 先测试后实现
6. **短会话** - 每个功能独立会话
7. **不手动改** - 有问题让 Claude 重构

---

## 九、常见问题 (Q&A)

### Q1: 什么是 Tesla 及 FSD 架构？

**1. "Tesla" 技术栈**

"Tesla" 在此语境下并非官方标准术语，而是指代本文档推荐的**高性能、现代化、强类型**的前端技术组合（类比 Tesla 汽车的高性能与现代化）。它通常包含以下核心要素：

| 字母 | 技术                             | 说明                                                        |
| ---- | -------------------------------- | ----------------------------------------------------------- |
| T    | **TypeScript**                   | 极其严格的类型系统 (Strict Mode)，大型项目的基石            |
| E    | **Ecosystem**                    | React + Next.js (App Router) 现代生态框架                   |
| S    | **State (Zustand/Atomic State)** | 摒弃繁重的 Redux，使用轻量级、原子化的 Zustand 进行状态管理 |
| L    | **Layered (FSD)**                | 严格的分层架构设计 (Feature-Sliced Design)                  |
| A    | **Automation**                   | TDD + CI，强调自动化测试 (Vitest) 和类型检查                |

> **Note**:
> React 是这套技术栈的核心 UI 库，Next.js 作为元框架 (Meta-framework) 构建于 React 之上，提供路由、SSR、API
> Routes 等能力。

这个组合的目标是让前端项目像精密制造的汽车一样，模块化、高性能且易于维护。

**2. FSD (Feature-Sliced Design) 架构**

FSD 是目前前端社区公认的解决大型应用复杂度的主流架构标准。

- **核心思想**：通过**分层 (Layers)** 和 **切片 (Slices)**
  来解耦代码，严格控制依赖方向（只能从上层引用下层）。
- **分层结构** (从下到上)：
  1.  `shared`: 共享的基础设施（UI 库、API 客户端、通用工具）。不包含任何业务逻辑。
  2.  `entities`: 业务实体（User, Product,
      Order）。只包含核心数据模型和简单的展示组件。
  3.  `features`: 用户功能交互（AuthByPhone, AddToCart,
      LikeProduct）。包含具体的业务逻辑。
  4.  `widgets`: 组合层（Header,
      ProductDetailCard）。将实体和功能组合成独立模块。
  5.  `pages`: 页面层（HomePage, CartPage）。路由组件，负责组装 Widgets。
  6.  `app`: 全局配置（Styles, Providers, Routing）。

### Q2: Ecosystem 具体包含什么？为什么 State 单独列出？

虽然广义的 "React Ecosystem" 包含状态管理，但在 **TESLA** 架构中特意做出了区分：

1.  **E (Ecosystem) 侧重于基础设施**：
    - 指代 **React + Next.js (App Router)**。
    - 解决应用的**骨架问题**：路由、渲染模式 (SSR/RSC)、文件结构、构建工具。

2.  **S (State) 侧重于数据流策略**：
    - 指代 **Zustand + React Query**。
    - 解决数据的**流转问题**。
    - **拆分原因**：为了强调**"轻量化状态管理"**这一核心架构主张。特意将 State 单独列出，是为了凸显从 Redux 等重型方案转向 Atomic
      State (原子化状态) 的现代化决策。

### Q3: 深入说说 State 的含义与最佳实践

在 **TESLA** 架构中，**S (State)**
代表了一种**去中心化、原子化**的状态管理哲学，核心包含三层含义：

1.  **拒绝巨型 Store (No Giant Store)**
    - 传统 Redux 模式倾向于将所有应用状态集中在一个巨大的 Store 树中。
    - **现代实践**：使用 Zustand 将状态拆分为多个独立的、功能单一的小 Store（Atomic
      Stores）。例如 `useAuthStore` 仅管理用户身份，`useCartStore`
      仅管理购物车。这使得模块解耦，更易于迁移和测试。

2.  **服务端状态 vs 客户端状态 (Server vs Client State)**
    - **服务端状态**（API 数据）：完全交给 **React
      Query**。API 返回的数据被视为"缓存"而非"应用状态"。严禁手动 fetch 数据后 set 到 store 的冗余操作。
    - **客户端状态**（UI/交互）：交给
      **Zustand**。仅用于管理纯前端的交互状态（如侧边栏开关、模态框显示、未提交的复杂表单）。

3.  **URL as State (URL 即状态)**
    - 最高优先级的状态位置。
    - 鼓励将筛选条件、分页页码、搜索关键词等状态直接同步到 URL Search
      Params。这样页面可分享、刷新不丢失状态，且天然支持浏览器的后退/前进功能。

### Q4: 在企业级项目中，仅靠 TESLA 中的 S (Zustand + React Query) 真的够用吗？

**完完全全足够，且大多时候优于传统方案。**

1.  **复杂度减法**: 90% 的"复杂状态"本质是**服务端数据同步**问题（Loading,
    Error, Cache, Retry）。React Query 完美抽离了这部分复杂度。
2.  **性能优势**: Zustand 基于 Selector 的细粒度更新机制，天然比 Context
    API 更高效，无需昂贵的 `memo` 优化。
3.  **架构隔离**: 传统的大型 Global Redux
    Store 往往演变成难以维护的"垃圾场"。TESLA 提倡的 **Atomic Stores + FSD**
    强制将状态隔离在 Service/Feature 内部，物理上杜绝了耦合。

> **例外情况**：对于极度复杂的**时序逻辑**或**有限状态机**（如即时通讯核心、游戏逻辑），建议引入
> **XState** 管理逻辑核心，配合 Zustand 绑定 UI。

### Q5: 深入解析：为什么说 XState 是"失落的控制层"？

**XState 不仅仅是一个库，它是对前端"状态驱动"开发模式的降维打击。**

> **资源卡片**
>
> - **GitHub**: [statelyai/xstate](https://github.com/statelyai/xstate) (26k+
>   Stars)
> - **定义**: 基于 W3C
>   SCXML 标准实现的有限状态机 (FSM) 和状态图 (Statecharts) 库，用于编写"防弹"的逻辑核心。
> - **核心价值**: Make Impossible States Impossible
>   (让不可能的状态在数学上不可能发生)。

大多数前端开发者习惯于 **"Bottom-up Data Modeling"**（自底向上的数据建模）：

> "我有 `isLoading`, `data`, `error`
> 三个变量，我通过组合它们的 true/false 来推导当前页面应该显示什么。"

**问题在于**：变量的组合是指数级增长的。3个布尔值有 8 种组合，但有效状态可能只有 4 种。那剩下的 4 种"不可能状态"（例如：`isLoading: true`
且 `error: true`）就是 Bug 的温床。

**XState 带来的是 "Top-down Behavioral Modeling"（自顶向下的行为建模）：**

1.  **明确的有限状态机 (FSM)**
    - 系统在任何时刻只能处于**一个**确定的状态（如 `idle`, `loading`, `success`,
      `failure`）。
    - 状态的流转是**确定性**的：只有 `FETCH` 事件能触发 `idle` -> `loading`。在
      `loading` 状态下再次触发 `FETCH` 会被**数学级**地无视，无需写
      `if (loading) return`。

2.  **状态图 (Statecharts - W3C SCXML 标准)**
    - 解决了传统 FSM 的状态爆炸问题。
    - **Hierarchical States (层级状态)**：像目录一样管理状态（例如 `Payment`
      状态下包含 `Verifying`, `Processing` 子状态）。
    - **Parallel States (并行状态)**：同时管理正交的逻辑（例如：上传组件同时处于
      `Uploading` 和 `BatteryLow` 状态）。

3.  **可视化即代码 (Visualization as Code)**
    - 你的代码就是流程图。复制 XState 配置到可视化工具，它能直接生成产品经理都能看懂的交互图。这是 Redux 永远做不到的。

**何时必须使用？** 当逻辑复杂度超过了人脑能维持心智模型的阈值时：

- **复杂异步流程**：例如视频会议的连接过程（信令 -> 握手 -> 媒体流 -> 重连 -> 降级）。
- **关键任务系统**：例如支付收银台，绝对不能允许用户在"扣款中"状态触发"取消订单"。

在 TESLA 架构中，我们将 Zustand 视为**"数据中心"**，将 XState 视为**"控制中心"**。只有极少数核心业务需要"控制中心"。

### Q6: XState 是状态管理的终极形态吗？

**是"逻辑建模"的终极，但不是"数据存储"的终极。**

如果你试图用 XState 管理一个包含 1000 条商品的大列表，那简直是灾难（代码极其冗长，且性能不如直接读写变量）。但如果你用它来管理这个列表的"加载 -> 筛选 -> 翻页 -> 报错重试"流程，那它是神器。

**真正的终极形态是"动静分离" (Hybrid Architecture)：**

| 维度                      | 职责 (Responsibility)                | 最佳工具        | 比喻          |
| :------------------------ | :----------------------------------- | :-------------- | :------------ |
| **控制流 (Control Flow)** | 决定"现在可以做什么"、"下一步去哪里" | **XState**      | 大脑 (Brain)  |
| **数据流 (Data Flow)**    | 存储"现在有什么"、"值是多少"         | **Zustand**     | 肌肉 (Muscle) |
| **外部同步 (Sync)**       | 保持"与服务器一致"                   | **React Query** | 感官 (Senses) |

**TESLA 架构的态度**：不做"一刀切"的所谓终极选择。我们默认使用 **Zustand + React
Query**（覆盖 95% 场景），只在逻辑复杂度"溢出"时，引入 **XState**
作为精密逻辑的外挂心脏。这才是工程上的终极实用主义。

### Q7: 真正的"魔法"：什么是 Yjs (CRDTs)？

你指的"最牛逼"、"通用"且支持"实时文本协作"的方案，一定是 **Yjs**（基于 **CRDT**
算法）。

**它不是普通的状态管理，它是"多人协作的物理引擎"。**

1.  **解决什么终极难题？**
    - 当 A 用户输入 "Hello" 且断网，B 用户输入 "World"，A 联网后，如何保证两人看到的最终结果完全一致，且不冲突？
    - 这就是 **Conflict-free Replicated Data Types (无冲突复制数据类型)**。

2.  **为什么说它通用？**
    - **框架无关**：它可以绑定到 React, Vue, Svelte。
    - **编辑器无关**：它是 **Prosemirror, Monaco, Quill, Slate**
      等富文本/代码编辑器的协作标准。
    - **传输无关**：你可以通过 WebSocket, WebRTC,甚至 IPFS 同步它。

3.  **在架构中的位置**
    - 如果你的应用需要**多人实时编辑**（如 Google
      Docs 用到的 OT 算法的现代替代品），Yjs 是唯一真神。
    - 你可以通过 `y-webrtc` 或 `Liveblocks` 轻松接入。
    - **SyncedStore**
      是一个基于 Yjs 的 React 库，用起来和 MobX/Valtio 一样简单，但背后全是 CRDT 魔法。

### Q8: 盘点所有 React 能用的状态管理方案

### Q8: 盘点所有 React 能用的状态管理方案 (终极全集)

既然你要"所有"，那我们就把 React 历史长河里的遗珠都挖出来。这里不仅仅是"能用"，更是前端状态管理演进的活化石。

#### 第一梯队：现代主流 (The Mainstream)

| 门派            | 代表作                  | 核心理念     | 一句话点评                                       |
| :-------------- | :---------------------- | :----------- | :----------------------------------------------- |
| **Flux 简化派** | **Zustand**             | 极简 Flux    | 目前最均衡的选择，闭眼入。                       |
| **Atomic 派**   | **Jotai**               | 原子化       | 下一代高性能应用的首选，React 理念的极致与继承。 |
| **Server 派**   | **React Query**         | 异步状态管理 | 必装。它不是选项，是标准。                       |
| **Gen 2 Redux** | **Redux Toolkit (RTK)** | 官方改进版   | 如果非要用 Redux，请一定用 RTK。                 |

#### 第二梯队：特色鲜明 (The Specialized)

| 门派           | 代表作                                | 核心理念       | 一句话点评                                                 |
| :------------- | :------------------------------------ | :------------- | :--------------------------------------------------------- |
| **Proxy 派**   | **Valtio**                            | 可变代理       | 像 Vue 一样写 React，快就一个字。                          |
| **OOP 强类型** | **MobX** / **MobX-State-Tree**        | 响应式编程     | MST 是结构化数据的神，适合超复杂且深度嵌套的数据模型。     |
| **FSM 派**     | **XState**                            | 状态机         | 精密仪器，处理复杂交互逻辑的核武器。                       |
| **Signal 派**  | **Preact Signals** / **Legend-State** | 细粒度更新     | 追求极致性能，绕过 React VDOM Diff 的黑魔法。              |
| **CRDT 派**    | **Yjs** / **Automerge**               | 分布式冲突合并 | 实时协作领域的垄断者。                                     |
| **Graph 派**   | **Apollo Client** / **Relay**         | 归一化缓存     | 如果你用 GraphQL，那它们本身就是一个巨大的 State Manager。 |

#### 第三梯队：实力遗珠 (The Underrated)

| 门派             | 代表作                                 | 描述                                                                  |
| :--------------- | :------------------------------------- | :-------------------------------------------------------------------- |
| **硬核计算派**   | **Effector**                           | 东欧神兽。类型完美，性能极高，但 API 繁琐。国内少见，但绝对是实力派。 |
| **微型派**       | **Nano Stores**                        | 无依赖，几百字节。主打框架无关 (React/Vue/Svelte 通用)，微前端首选。  |
| **性能代理派**   | **Hookstate**                          | 声称比 Context 快 N 倍。基于 Proxy 的极简 API。                       |
| **RxJS 派**      | **Akita** / **Elf**                    | 基于 Observable 的流式状态管理，Angular 难民的避风港。                |
| **全能派**       | **Overmind**                           | 试图融合 Statechart + Flux + Proxy 的野心之作。                       |
| **Redux 包装派** | **Rematch** / **Kea** / **Easy Peasy** | 在 RTK 出来之前的过渡方案，Kea 在 PostHog 团队用得风生水起。          |
| **DI 容器派**    | **Unstated Next** / **Constatet**      | React Context 的极简封装，主打依赖注入。                              |

#### 第四梯队：领域专用 (The Domain Specific)

这些库本质上也是状态管理，但专精于特定领域，**覆盖了 80% 的日常状态需求**：

- **表单状态 (Forms)**: **React Hook Form** (性能之王), **Formik** (老牌).
- **路由状态 (Router)**: **TanStack Router**, **React Router (Loaders)**.
  URL 是唯一真理。
- **表格状态 (Tables)**: **TanStack Table** (Headless UI).
- **本地数据库 (Local DB)**: **RxDB**, **PouchDB**. 离线优先应用的终极状态方案。

#### 第五梯队：历史尘埃 (The Legacy)

- **Recoil**: Facebook 曾寄予厚望的原子化方案，现已**烂尾停更**。勿念。
- **Redux (Legacy)**: 写 switch-case 的原始 Redux。**快跑**。
- **Flux (Library)**: Facebook 古早库，已进博物馆。

### Q9: 不懂就问，为什么 RxJS 没有"拥有姓名"？

其实它是**隐形王者**。在上面的列表里，RxJS 是作为一个**底层元语 (Primitive)**
存在的，而不是一个开箱即用的 React 状态库。

1.  **它在哪里？**
    - **Akita / Elf**: 这两个库完全基于 RxJS 构建。
    - **Observable-hooks**: 这是在 React 中直接使用 RxJS 最流行的胶水层。

2.  **为什么不推荐直接用 RxJS 做 State？**
    - **维度不同**: React 是**拉 (Pull)**
      模式（组件渲染时去读数据），RxJS 是**推 (Push)**
      模式（数据变了推给组件）。
    - **胶水层地狱**: 你需要手动管理 `Subscription`
      的销毁（防止内存泄漏），虽然有 `useEffect`，但代码量极大且容易写错。
    - **心智负担**: Operator 实在太多了（switchMap, exhaustMap,
      concatMap...）。除了 Angular 开发者，很少有 React 团队能全员 hold 住 RxJS。

**结论**: 如果你是 RxJS 大神，请直接用
**Elf**；如果不是，请远离，否则你的代码只有你自己能看懂。

### Q10: XState vs RxJS：为什么一个是"王者"，另一个不是？

简单来说：**XState 是一个"成品"，RxJS 是一个"原材料"。**

| 维度           | XState                                 | RxJS                                     |
| :------------- | :------------------------------------- | :--------------------------------------- |
| **是什么**     | 精密手表 (成品)                        | 齿轮、弹簧 (零件)                        |
| **心智模型**   | 强制性的 (States, Transitions, Guards) | 完全自由，自己定规则                     |
| **React 适配** | 官方 `@xstate/react`，无缝融合         | 必须手动管理 Subscription                |
| **可视化**     | 代码即流程图，可直接生成交互图         | 用 Marble Diagram 勉强调试，无法对应业务 |
| **出错时**     | 编译期就能发现"不可能的状态转换"       | 运行时才知道 Stream 写错了               |
| **谁能用**     | 任何前端开发者（只需要理解 FSM 概念）  | 几乎只有 Angular 背景的人能精通          |

**核心区别**：

- **XState 解决的是"业务逻辑正确性"问题**。它的 Statechart 是一种**数学上可证明的模型**。
- **RxJS 解决的是"数据流组合"问题**。它是一种**极其强大但无约束的工具**。

**为什么 XState 更能称为"王者"？**
因为它提供了一条**从问题到解决方案的完整道路**：

1.  画出状态图 -> 2. 翻译成代码 -> 3. 代码可以反过来生成图 -> 4. 图可以直接拿给产品经理对

而 RxJS 没有这个闭环。你可以用它做任何事，但它不会**阻止你做错事**。

#### 底层原理对比

1.  **XState 的底层：Statecharts (状态图)**
    - **理论来源**：1987 年 David Harel 发表的论文《Statecharts: A Visual
      Formalism for Complex
      Systems》。这是一个**计算机科学的经典理论**，被广泛应用于航空航天、医疗设备等关键系统。
    - **核心概念**：
      - **有限状态 (Finite States)**：系统只能处于有限个已定义的状态之一。
      - **确定性转换 (Deterministic
        Transitions)**：给定当前状态和事件，下一个状态是唯一确定的。
      - **层级与并行 (Hierarchy &
        Parallelism)**：状态可以嵌套（子状态机），也可以正交并行（多个独立状态机同时运行）。
    - **标准化**：W3C 的 SCXML (State Chart
      XML) 标准。XState 是该标准在 JavaScript 领域的实现。
    - **数学保证**：因为是形式化模型，可以用数学方法**证明**系统不会进入非法状态。

2.  **RxJS 的底层：Reactive Extensions (Rx)**
    - **理论来源**：2009 年微软 Erik Meijer 团队发明的 Reactive Extensions
      (Rx)，最初是 .NET 库。它的思想源于**函数式响应式编程 (FRP)**
      和**观察者模式 (Observer Pattern)**。
    - **核心概念**：
      - **Observable (可观察对象)**：一个随时间推送值的异步数据流。
      - **Operators (操作符)**：对流进行变换、过滤、组合的纯函数（如 `map`,
        `filter`, `merge`, `switchMap`）。
      - **Subscription
        (订阅)**：连接 Observable 和 Observer 的纽带。必须手动管理其生命周期。
    - **核心理念**："一切皆流" (Everything is a
      Stream)。点击事件是流，HTTP 响应是流，WebSocket 消息是流。你用操作符像管道一样处理它们。
    - **无约束**：RxJS 不强制任何结构。你可以用它构建任何模式，但也可能写出"意大利面条"式的流。

**总结**：XState 是**形式化方法**在前端的应用（严谨、可证明）；RxJS 是**函数式编程**在异步领域的应用（灵活、强大但需自律）。

#### 实现原理对比

1.  **XState 的实现原理**

    ```
    [Machine Config] --> [createMachine()] --> [Machine Definition]
                                                       |
                                                       v
    [Event] --> [interpret(machine)] --> [Service (Interpreter)]
                                                       |
                                                       v
                                            [Transition Resolution]
                                                       |
                                                       v
                                              [New State + Context]
    ```

    - **配置即代码**：开发者用 JSON-like 配置对象描述状态机（states,
      transitions, guards, actions）。
    - **解释器模式 (Interpreter Pattern)**：`interpret()`
      创建一个"服务"实例，它持有当前状态，并监听事件。
    - **纯函数转换**：`machine.transition(currentState, event)`
      是纯函数，返回新状态。无副作用。
    - **Context 存储扩展状态**：除了离散状态（idle/loading），还可以存储连续数据（如
      `count: 5`），通过 `assign()` 更新。
    - **Actor 模型**：XState
      v5 引入了完整的 Actor 模型，每个状态机是一个 Actor，可以 spawn 子 Actor。

2.  **RxJS 的实现原理**
    ```
    [Producer (数据源)] --> [Observable] --> [pipe(operators)] --> [Observer (消费者)]
                                                                          |
                                                                          v
                                                                   [Subscription]
    ```

    - **惰性求值 (Lazy Evaluation)**：Observable 在 `subscribe()`
      被调用之前什么都不做。这是和 Promise 的核心区别（Promise 一旦创建就立即执行）。
    - **Cold vs Hot**：
      - **Cold Observable**：每次订阅都会创建一个新的数据源（如 HTTP 请求）。
      - **Hot Observable**：多个订阅者共享同一个数据源（如 WebSocket,
        DOM 事件）。
    - **Operator 链式管道**：`pipe(op1, op2, op3)`
      本质是函数组合。每个 operator 接收一个 Observable，返回一个新的 Observable。
    - **Scheduler 调度器**：控制事件在什么时间、什么上下文执行（同步、异步、动画帧等）。
    - **背压 (Backpressure)**：当生产者速度超过消费者时，RxJS 提供策略（如
      `throttle`, `debounce`, `buffer`）来处理。

---

## 参考资源

- [Claude Code 官方文档](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code Best Practices](https://docs.anthropic.com/en/docs/claude-code/best-practices)
- [Feature-Sliced Design](https://feature-sliced.design/)
