<!--
- [INPUT]: 依赖 notes/antigravity/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 Artifacts 系统 文档
- [POS]: 位于 notes/antigravity 模块的 Artifacts 系统 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Artifacts 系统

Artifacts 是 Antigravity
Agent 与用户沟通的核心机制，用于记录计划、追踪进度、展示成果。

---

## 核心 Artifacts

### 1. task.md（任务清单）

追踪任务进度的实时清单。

**格式示例：**

```markdown
# 待办事项应用开发

## 任务列表

- [x] 初始化项目结构
- [x] 创建基础组件
- [/] 实现添加任务功能 ← 进行中
- [ ] 实现删除功能
- [ ] 添加本地存储
- [ ] 响应式样式
```

**状态说明：**

| 标记  | 含义   |
| ----- | ------ |
| `[ ]` | 待完成 |
| `[/]` | 进行中 |
| `[x]` | 已完成 |

---

### 2. implementation_plan.md（实现计划）

在开始编码前，Agent 会生成详细的实现计划。

**格式示例：**

```markdown
# 待办事项应用实现计划

## 目标

创建一个功能完整的 React 待办事项应用

## 技术选型

- React 18 + TypeScript
- TailwindCSS
- localStorage

## 文件结构

src/ ├── components/ │ ├── TodoList.tsx │ ├── TodoItem.tsx │ └── AddTodo.tsx ├──
hooks/ │ └── useTodos.ts └── App.tsx

## 实现步骤

### Phase 1: 基础结构

- 初始化 Vite + React 项目
- 配置 TailwindCSS

### Phase 2: 核心功能

- 实现 useTodos hook
- 创建 TodoList 组件

### Phase 3: 持久化

- 添加 localStorage 支持
```

**用途：**

- 用户审核后再执行
- 作为开发路线图
- 便于讨论和修改

---

### 3. walkthrough.md（完成报告）

任务完成后生成的总结文档。

**格式示例：**

```markdown
# 完成报告

## 实现内容

### 功能

- ✅ 添加任务
- ✅ 删除任务
- ✅ 标记完成
- ✅ 本地持久化

### 创建的文件

- src/components/TodoList.tsx
- src/components/TodoItem.tsx
- src/hooks/useTodos.ts

### 运行方式

npm run dev

## 截图

![应用截图](./screenshots/todo-app.png)

## 后续建议

- 可添加任务编辑功能
- 可添加分类功能
```

---

## 媒体 Artifacts

### 截图

Agent 可以自动截取浏览器状态：

```markdown
![登录页面](./screenshots/login.png)
```

### 录屏

操作过程自动录制：

```markdown
![操作演示](./recordings/demo.webp)
```

---

## Artifacts 工作流

```
任务开始
    ↓
创建 task.md（任务清单）
    ↓
生成 implementation_plan.md
    ↓
用户审核 → 批准 / 修改
    ↓
执行开发（更新 task.md 状态）
    ↓
测试和验证
    ↓
生成 walkthrough.md
    ↓
任务完成
```

---

## 用户交互

### 审核计划

当 Agent 生成 implementation_plan.md 后：

```
Agent: 我已创建实现计划，请审核。
用户: 看起来不错，但请使用 Zustand 替代 Context
Agent: 好的，我会更新计划...
```

### 查看进度

随时查看 task.md 了解当前进度。

### 请求报告

```
请生成这次修改的 walkthrough
```

---

## 自定义 Artifacts

### 添加自定义清单

```
在 implementation_plan 中添加：
- API 端点设计
- 数据库 Schema
- 测试计划
```

### 跳过 Artifacts

对于简单任务：

```
【跳过 implementation_plan】
添加一个返回顶部按钮
```

---

## 最佳实践

1. **认真审核计划**：在 Agent 执行前确保计划正确
2. **保存 Walkthrough**：便于后续回顾和知识传承
3. **使用截图**：让视觉一目了然
4. **更新 Task**：保持任务状态同步
