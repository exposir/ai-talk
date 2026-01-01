# Claude Code 大型前端项目最佳实践

使用 Claude
Code 设计和开发大型前端项目的实战指南，目标：**最小化手动代码修改**。

## 核心理念

> **让 Claude 成为你的代码生成器，而不是代码补全工具。**

- 🎯 **架构先行**：先让 Claude 设计，再让它实现
- 📐 **约束驱动**：用规则文件约束输出质量
- 🔄 **迭代优化**：通过反馈循环持续改进
- 📦 **模块化思维**：拆分任务，逐个击破

## 一、项目初始化配置

### 1.1 CLAUDE.md 模板（大型前端项目）

```markdown
# Project: [项目名称]

## Tech Stack

- Framework: React 18 / Vue 3 / Next.js 14
- Language: TypeScript (strict mode)
- Styling: TailwindCSS / CSS Modules
- State: Zustand / Pinia / Redux Toolkit
- Testing: Vitest + Testing Library

## Architecture Pattern

采用 Feature-Sliced Design (FSD) 架构

## Code Standards

- 组件使用函数式 + Hooks
- 禁止 any 类型
- 所有导出必须有 JSDoc
- 组件文件结构：Component.tsx + Component.test.tsx + index.ts

## Commands

npm run dev # 开发服务器 npm run build # 生产构建  
npm run test # 运行测试 npm run lint # 代码检查

## Directory Structure

src/
app/ # 应用入口、路由、全局配置 features/ # 业务功能模块 shared/ # 共享组件、hooks、工具 entities/ # 业务实体 widgets/ # 组合组件

## Generation Rules

生成代码时必须：

1. 包含完整类型定义
2. 包含基础单元测试
3. 包含 Storybook story（如适用）
4. 遵循既有代码风格
```

### 1.2 规则文件结构

```
.claude/rules/
├── components.md       # 组件生成规则
├── api.md              # API 层规则
├── testing.md          # 测试规则
├── styling.md          # 样式规则
└── state.md            # 状态管理规则
```

### 1.3 组件生成规则示例

```markdown
---
paths: src/**/*.tsx
---

# Component Rules

## 文件结构

每个组件目录包含：

- ComponentName.tsx # 组件实现
- ComponentName.test.tsx # 单元测试
- ComponentName.stories.tsx # Storybook（可选）
- index.ts # 导出

## 组件模板

\`\`\`tsx interface Props { // 明确的 Props 定义 }

export function ComponentName({ ...props }: Props) { // 实现 } \`\`\`

## 必须包含

- Props 接口定义
- displayName（用于 DevTools）
- 基础无障碍属性
```

## 二、架构设计工作流

### 2.1 架构生成流程

```bash
# Step 1: 让 Claude 分析需求并设计架构
claude --permission-mode plan
> 分析这个需求文档，设计前端架构，包括：
> 1. 目录结构
> 2. 核心模块划分
> 3. 数据流设计
> 4. API 层设计
> @requirements.md

# Step 2: 审核后生成骨架
> 按照上述架构，生成项目骨架代码，只包含目录和空文件
```

### 2.2 Feature 模块生成

```bash
# 一次生成完整 feature
> 创建用户认证模块，包含：
> - 登录/注册/忘记密码页面
> - auth store 状态管理
> - API 服务层
> - 表单验证 hooks
> - 单元测试
> 遵循 @.claude/rules/components.md
```

### 2.3 组件批量生成

```bash
# 生成设计系统组件
> 根据这个设计稿，生成以下组件：
> Button, Input, Select, Modal, Toast
> 每个组件包含：
> - 所有变体（size, variant, state）
> - TypeScript 类型
> - Storybook stories
> - 单元测试
> @design-tokens.json
```

## 三、代码生成策略

### 3.1 分层生成原则

```
1. 类型层 (types/)      → 先生成接口和类型
2. API 层 (api/)        → 生成数据获取逻辑
3. Store 层 (stores/)   → 生成状态管理
4. 组件层 (components/) → 生成 UI 组件
5. 页面层 (pages/)      → 组装页面
```

### 3.2 增量生成模式

```bash
# 不要一次生成整个功能，分步进行

# Step 1: 生成类型
> 为订单模块创建 TypeScript 类型定义

# Step 2: 基于类型生成 API
> 基于 Order 类型，创建订单 API 服务

# Step 3: 生成 Store
> 创建订单状态管理，使用刚才的 API 服务

# Step 4: 生成组件
> 创建订单列表组件，消费订单 store
```

### 3.3 模板驱动生成

在 `.claude/templates/` 创建模板：

```markdown
# .claude/templates/feature.md

创建新 feature 时使用此模板结构：

src/features/[name]/ ├── api/ │ └── [name].api.ts ├── model/ │ ├── types.ts │
└── [name].store.ts ├── ui/ │ ├── [Name]Page.tsx │ └── components/ ├── lib/ │
└── hooks/ └── index.ts
```

使用：

```bash
> 按照 @.claude/templates/feature.md 创建支付功能模块
```

## 四、减少手动修改的技巧

### 4.1 精确的上下文提供

```bash
# ❌ 模糊请求
> 帮我写个表单

# ✅ 精确请求
> 创建登录表单组件：
> - 使用 react-hook-form
> - 包含邮箱和密码字段
> - 使用 zod 验证
> - 样式使用 @shared/ui/form 组件
> - 错误状态显示在字段下方
> - 提交后调用 @features/auth/api/login
> @src/shared/ui/form/  # 提供现有组件参考
```

### 4.2 截图驱动开发

```bash
# 提供设计截图
> 根据这个截图实现组件
> - 保持像素级还原
> - 使用项目现有的颜色变量
> - 移动端优先响应式
> [粘贴截图]
```

### 4.3 测试驱动生成

```bash
# 先写测试，再让 Claude 实现
> 这是我的测试用例，帮我实现通过这些测试的组件
> @Button.test.tsx
```

### 4.4 重构而非重写

```bash
# 保留逻辑，优化代码
> 重构这个组件：
> - 保持所有功能不变
> - 提取自定义 hooks
> - 添加 TypeScript 类型
> - 不要改变 API 接口
> @UserProfile.tsx
```

## 五、大型项目工作流

### 5.1 多会话协作

```bash
# 会话 1: 架构设计
claude --resume architecture
> 设计新功能架构

# 会话 2: 组件开发
claude --resume components
> 实现 UI 组件

# 会话 3: 集成测试
claude --resume testing
> 编写集成测试
```

### 5.2 Git Worktree 并行开发

```bash
# 主分支 - 稳定开发
git worktree add ../feature-payment -b feature/payment
cd ../feature-payment
claude  # 独立的 Claude 会话

# 同时在另一个功能分支工作
git worktree add ../feature-notification -b feature/notification
cd ../feature-notification
claude  # 另一个独立会话
```

### 5.3 代码审查集成

```bash
# PR 前自动检查
> 审查我的更改：
> 1. 检查类型安全
> 2. 检查测试覆盖
> 3. 检查性能问题
> 4. 检查无障碍
> git diff main...HEAD
```

## 六、常见场景模板

### 6.1 新增 API 接口

```bash
> 添加获取用户订单列表 API：
> - 端点: GET /api/orders
> - 参数: page, limit, status
> - 响应类型参考: @types/order.ts
> - 使用项目的 @shared/api/client.ts
> - 添加 React Query hook
> - 添加单元测试
```

### 6.2 新增页面

```bash
> 创建订单详情页面：
> - 路由: /orders/:id
> - 使用 @features/orders/api 获取数据
> - 布局参考 @app/layouts/DetailLayout
> - 包含加载状态和错误处理
> - 移动端适配
```

### 6.3 迁移旧代码

```bash
> 将这个 Class 组件迁移到函数组件：
> - 保持所有 props 接口不变
> - 将 state 转换为 useState
> - 将生命周期转换为 useEffect
> - 添加 TypeScript 类型
> - 添加单元测试
> @OldComponent.jsx
```

## 七、质量保证

### 7.1 自动验证脚本

在 `.claude/commands/` 创建：

```markdown
# .claude/commands/validate.md

验证当前更改：

1. npm run typecheck
2. npm run lint
3. npm run test --changed
4. 报告任何问题
```

### 7.2 生成后检查清单

```markdown
# .claude/commands/review.md

检查生成的代码：

- [ ] 类型完整，无 any
- [ ] 有单元测试
- [ ] 有错误处理
- [ ] 有加载状态
- [ ] 移动端适配
- [ ] 无障碍属性
```

## 八、提示词库

### 快速命令

| 命令                               | 用途                      |
| ---------------------------------- | ------------------------- |
| `创建 [name] 组件，参考 @existing` | 基于现有组件创建新组件    |
| `为 @file 添加完整类型`            | 给 JS 文件添加 TypeScript |
| `为 @file 添加单元测试`            | 生成测试文件              |
| `重构 @file 提取 hooks`            | 抽取可复用逻辑            |
| `优化 @file 性能`                  | 性能优化建议              |

---

## 总结

使用 Claude Code 开发大型前端项目的核心原则：

1. **配置先行** - 完善的 CLAUDE.md 和规则文件
2. **架构驱动** - 先设计后实现
3. **精确上下文** - 提供足够参考材料
4. **增量生成** - 分层分步骤生成
5. **模板复用** - 建立项目专属模板库
6. **持续验证** - 生成后自动检查
