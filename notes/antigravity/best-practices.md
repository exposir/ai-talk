# Antigravity 最佳实践

高效使用 Antigravity 的社区验证经验和进阶技巧。

---

## 核心心智模型

> **Antigravity 是你的 AI 开发团队，不是代码补全工具。**

| 传统思维           | Antigravity 思维   |
| ------------------ | ------------------ |
| 写代码等 AI 补全   | 描述需求让 AI 生成 |
| 手动修改 AI 输出   | 通过反馈让 AI 重写 |
| 一个任务从头做到尾 | 多 Agent 并行分工  |
| 边写边调试         | 先规划后执行       |

---

## 一、任务规划

### 1.1 Planning Mode 优先

**复杂任务必须先规划：**

```
【Planning Mode】
分析需求，创建 implementation_plan.md，不要开始编码：

需要实现用户认证系统，包含：
- 登录/注册/找回密码
- JWT Token 管理
- 权限控制
```

### 1.2 分解大任务

**❌ 任务过大：**

```
创建一个完整的电商网站
```

**✅ 合理粒度：**

```
Phase 1: 商品列表页面（分页、筛选）
Phase 2: 商品详情页面
Phase 3: 购物车功能
Phase 4: 结算流程
```

### 1.3 利用 Artifacts 追踪

始终让 Agent 维护 `task.md`：

- `[ ]` 待完成
- `[/]` 进行中
- `[x]` 已完成

---

## 二、提示词工程

### 2.1 提供充分上下文

```
参考现有代码风格创建新组件：
@src/components/Button.tsx
@src/components/Card.tsx
@src/hooks/useProduct.ts

新建: ProductDetail 组件
- 包含图片轮播
- 规格选择
- 加入购物车按钮
```

### 2.2 具体明确的需求

**❌ 模糊：**

```
改进这个页面
```

**✅ 具体：**

```
优化首页性能：
1. 图片懒加载（Intersection Observer）
2. 组件代码分割（React.lazy）
3. 首屏 JS < 100KB
4. LCP < 2.5s
```

### 2.3 指定约束条件

```
重构用户模块：
约束：
- 保持所有 API 接口不变
- 不修改数据库结构
- 需要向后兼容 v1 客户端
- 测试覆盖率 > 80%
```

### 2.4 使用 Deep Think

复杂问题启用深度思考：

```
【Deep Think】
分析这个系统的性能瓶颈，给出优化方案：
- 当前 P99 延迟 500ms
- 并发用户 10000
- 需要降低到 100ms 以内
```

---

## 三、开发模式策略

### 3.1 模式选择指南

| 场景         | 推荐模式       | 原因             |
| ------------ | -------------- | ---------------- |
| 新项目搭建   | Agent-driven   | 快速生成基础结构 |
| 功能开发     | Agent-assisted | 平衡效率与控制   |
| 敏感代码修改 | Review-driven  | 确保每步正确     |
| 学习理解     | Review-driven  | 观察 Agent 决策  |
| 代码审查     | Review-driven  | 逐步验证问题     |

### 3.2 动态切换

```
# 开始用 Agent-driven 生成基础结构
【Agent-driven】创建项目骨架和基础配置

# 切换到 Agent-assisted 开发功能
【Agent-assisted】实现用户登录功能

# 敏感操作切换到 Review-driven
【Review-driven】修改数据库迁移脚本
```

### 3.3 Turbo 模式

对于可信任的命令启用自动执行：

```json
{
  "terminalAutoExecution": {
    "allow": [
      "npm run *",
      "pnpm *",
      "git status",
      "git diff",
      "git add .",
      "git commit -m *"
    ]
  }
}
```

---

## 四、Multi-Agent 策略

### 4.1 并行开发

```
Workspace: e-commerce

Agent 1: 前端页面开发
Agent 2: 后端 API 开发
Agent 3: 数据库设计
```

### 4.2 职责分离

```
Agent 1 (Main): 实现核心功能
    ├── Agent 2: 编写单元测试
    ├── Agent 3: 生成文档
    └── Agent 4: 代码审查
```

### 4.3 流水线模式

```
Agent 1: 设计架构 → 输出 implementation_plan.md
    ↓
Agent 2: 实现代码 → 输出代码文件
    ↓
Agent 3: 编写测试 → 输出测试文件
    ↓
Agent 4: 审查并修复 → 输出 review-report.md
```

---

## 五、浏览器测试

### 5.1 开发中实时测试

```
运行开发服务器并测试：
1. npm run dev
2. 打开浏览器访问 localhost:3000
3. 测试以下流程：
   - 点击登录按钮
   - 填写测试账号
   - 验证跳转到首页
4. 截图保存每步结果
```

### 5.2 响应式验证

```
检查响应式布局：
分辨率列表：
- 1920x1080 (Desktop)
- 1366x768 (Laptop)
- 768x1024 (Tablet Portrait)
- 375x667 (iPhone SE)
- 414x896 (iPhone 11)

每个分辨率截图保存到 screenshots/
```

### 5.3 E2E 测试生成

```
根据刚才的手动测试，生成 Playwright E2E 测试代码
```

---

## 六、版本控制

### 6.1 频繁小提交

让 Agent 在每个阶段提交：

```
每完成一个功能点就提交：
- feat: 实现登录表单 UI
- feat: 添加表单验证
- feat: 集成登录 API
- test: 添加登录功能测试
```

### 6.2 分支策略

```
创建功能分支：
1. git checkout -b feature/user-auth
2. 在分支上开发
3. 完成后创建 PR
```

### 6.3 保持可回滚

```
每次大修改前先提交当前状态：
git add . && git commit -m "checkpoint: before refactor"

如果出错：
git reset --hard HEAD~1
```

---

## 七、代码质量

### 7.1 要求测试

```
创建 UserService：
- 包含完整单元测试
- 测试覆盖正常情况 + 边界条件 + 错误处理
- 使用 Vitest + Testing Library
```

### 7.2 类型安全

```
使用 TypeScript strict 模式：
- 禁止 any 类型
- 所有函数必须有返回类型
- Props 必须有完整接口定义
```

### 7.3 代码审查 Agent

开一个专门的审查 Agent：

```
【Review-driven】
审查 @src/features/auth/ 的所有代码：
检查项：
- [ ] 类型安全
- [ ] 错误处理
- [ ] 性能问题
- [ ] 安全漏洞
- [ ] 代码风格
- [ ] 测试覆盖
```

---

## 八、Rules 和 Workflows

### 8.1 创建项目规则

```markdown
# .agent/rules/coding-style.md

---

## activation: always

## 代码风格

- 使用 TypeScript strict
- 组件使用函数式
- 使用 async/await，禁止 .then()
- 导出必须有 JSDoc
```

### 8.2 创建复用工作流

```markdown
# .agent/workflows/new-feature.md

## 新功能开发流程

1. 创建 implementation_plan.md
2. 用户审核通过后继续
3. 创建目录结构
4. 实现核心逻辑
5. 添加单元测试
6. 运行测试验证
7. 生成 walkthrough.md
```

### 8.3 调用工作流

```
使用 @.agent/workflows/new-feature.md
开发用户通知功能
```

---

## 九、效率提升技巧

### 9.1 模板化常用任务

创建 `.agent/templates/` 目录：

```markdown
# .agent/templates/react-component.md

创建 React 组件：

- 函数式组件 + TypeScript
- Props 接口定义
- 使用项目的 UI 组件库
- 包含单元测试
- 包含 Storybook story
```

### 9.2 快捷键熟练

| 优先级 | 快捷键        | 功能          |
| ------ | ------------- | ------------- |
| ⭐⭐⭐ | `Cmd+Shift+A` | Agent Manager |
| ⭐⭐⭐ | `Cmd+Enter`   | 发送提示      |
| ⭐⭐⭐ | `Shift+Tab`   | 切换模式      |
| ⭐⭐   | `Tab`         | 接受补全      |
| ⭐⭐   | `Cmd+L`       | 引用到对话    |

### 9.3 异步反馈

执行过程中提供反馈：

```
Agent 正在生成代码...

[添加评论] 这里应该使用 useMemo 优化
[添加评论] 请使用相对路径导入
```

---

## 十、常见问题处理

### 10.1 Agent 陷入循环

```
1. 点击 Stop 停止当前任务
2. 分析问题原因
3. 重新描述需求，提供更多上下文
```

### 10.2 生成代码风格不一致

```
1. 创建 coding-style.md 规则
2. 在提示词中 @ 引用现有代码
3. 明确说明"参考现有风格"
```

### 10.3 上下文丢失

```
1. 使用 /compact 压缩上下文
2. 在 CLAUDE.md 中记录关键决策
3. 将大项目拆分为多个工作区
```

### 10.4 测试不通过

```
1. 让 Agent 分析失败原因
2. 提供错误日志作为上下文
3. 让 Agent 修复并重试
```

---

## 十一、核心原则总结

| 原则           | 说明             |
| -------------- | ---------------- |
| **规划优先**   | 复杂任务先 Plan  |
| **分而治之**   | 大任务拆小任务   |
| **上下文充分** | 提供足够参考     |
| **频繁验证**   | 小步快跑         |
| **版本控制**   | 始终用 Git       |
| **质量保证**   | 要求测试         |
| **及时反馈**   | 发现问题立即评论 |

---

## 十二、推荐工作流

```
1. 新任务 → Planning Mode 创建计划
2. 审核 implementation_plan.md
3. 切换到 Agent-assisted 开发
4. 每个功能点：编码 → 测试 → 提交
5. 使用浏览器验证 UI
6. 代码审查 Agent 检查
7. 生成 walkthrough.md
8. 合并代码
```
