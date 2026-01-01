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

## 参考资源

- [Claude Code 官方文档](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code Best Practices](https://docs.anthropic.com/en/docs/claude-code/best-practices)
- [Feature-Sliced Design](https://feature-sliced.design/)
