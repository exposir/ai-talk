<!--
- [INPUT]: 依赖 无
- [OUTPUT]: 输出 前端架构可视化学习工具设计文档
- [POS]: 位于 notes/architecture 模块的 前端架构可视化学习工具设计文档
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 前端架构师知识体系 & 可视化学习工具

## 产品定位

**可拖拽的架构图学习工具** - 面向高级前端开发者和架构师，通过可交互的架构图、时序图、流程图等可视化方式，自主探索和理解系统架构知识。

**核心特点**：

- 静态可交互架构图（非动画演示）
- 拖拽、缩放、平移自由探索
- 点击节点查看详细说明
- 面向有经验的开发者

---

## 一、教学方案

### 1.1 核心教学理念

```
┌─────────────────────────────────────────────────────────────┐
│                    自主探索式学习                            │
│                                                             │
│    ┌─────────┐     ┌─────────┐     ┌─────────┐            │
│    │  浏览   │ ──→ │  交互   │ ──→ │  理解   │            │
│    │ 架构图  │     │ 点击节点 │     │ 场景案例 │            │
│    └─────────┘     └─────────┘     └─────────┘            │
│         ↑                                   │              │
│         └───────────────────────────────────┘              │
│                    关联到其他架构                           │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 每个知识点的展示结构

```
┌─────────────────────────────────────────────────────────────┐
│  知识点：Redux 架构                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1️⃣ 可交互架构图（可拖拽、缩放）                             │
│  ┌─────────────────────────────────────────┐               │
│  │  [View] ──dispatch──→ [Action]          │  ← 可拖拽     │
│  │                          ↓              │               │
│  │  [State] ←── [Reducer] ←─┘              │  ← 点击查看   │
│  │     ↓                                   │     详情      │
│  │  [View] (重新渲染)                       │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  2️⃣ 节点详情（点击节点弹出）                                 │
│  ┌─────────────────────────────────────────┐               │
│  │ Reducer                                  │               │
│  │ • 纯函数，接收 state 和 action           │               │
│  │ • 返回新的 state                         │               │
│  │ • 不能有副作用                           │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  3️⃣ 场景说明                                                │
│  ✅ 适用：大型企业应用、需要严格规范                          │
│  ❌ 不适用：简单应用、原型验证                                │
│                                                             │
│  4️⃣ 真实案例                                                │
│  📌 Discord：Redux + Normalizr 处理海量消息                  │
│                                                             │
│  5️⃣ 关联知识（可点击跳转）                                   │
│  → Flux 架构 | MobX | Zustand | 状态机                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 可视化图表类型

| 图表类型       | 用途                 | 示例               | 交互方式           |
| -------------- | -------------------- | ------------------ | ------------------ |
| **架构拓扑图** | 组件、服务、模块关系 | 微服务架构、微前端 | 拖拽节点、点击详情 |
| **时序图**     | 请求/响应时间顺序    | API 调用链         | 点击步骤查看说明   |
| **流程图**     | 业务流程、决策分支   | 构建流程、CI/CD    | 点击节点查看详情   |
| **分层图**     | 架构分层、依赖方向   | 整洁架构、DDD      | 点击层查看职责     |
| **数据流图**   | 数据流动方向         | Redux、响应式      | 拖拽、点击详情     |
| **代码结构图** | 目录结构、模块依赖   | Monorepo           | 展开/折叠          |
| **对比图**     | 并排对比两种方案     | SSR vs SSG         | 左右滑动对比       |

### 1.4 交互设计

**架构图交互**：

- 🖱️ **拖拽节点**：调整布局，理解组件位置关系
- 🔍 **缩放**：鼠标滚轮放大缩小
- ✋ **平移**：拖拽空白区域移动画布
- 👆 **点击节点**：右侧弹出详情面板
- 🔗 **点击连线**：显示连接说明（如"同步调用"、"异步消息"）

**详情面板内容**：

```
┌─────────────────────────────────┐
│ API Gateway                      │
├─────────────────────────────────┤
│ 📝 说明                          │
│ 统一入口，负责路由分发、         │
│ 认证鉴权、限流熔断               │
│                                 │
│ 🔧 职责                          │
│ • 请求路由                       │
│ • 认证授权                       │
│ • 限流熔断                       │
│ • 日志监控                       │
│                                 │
│ 📌 典型实现                      │
│ Kong, Nginx, Spring Gateway     │
│                                 │
│ 🔗 相关知识                      │
│ → 微服务架构 | BFF 模式          │
└─────────────────────────────────┘
```

### 1.5 学习路径设计

```
┌─────────────────────────────────────────────────────────────┐
│                    学习路径                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🛤️ 路径一：系统学习                                         │
│  ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐         │
│  │框架 │ → │状态 │ → │设计 │ → │工程 │ → │大型 │         │
│  │原理 │   │管理 │   │模式 │   │架构 │   │项目 │         │
│  └─────┘   └─────┘   └─────┘   └─────┘   └─────┘         │
│                                                             │
│  🛤️ 路径二：专题深入                                         │
│  • 微前端专题：Why → 方案对比 → 架构设计 → 案例              │
│  • DDD 专题：概念 → 分层 → 实战模式 → 案例                   │
│  • 性能专题：渲染 → 加载 → SSR → 监控                        │
│                                                             │
│  🛤️ 路径三：自由探索                                         │
│  浏览知识图谱，点击感兴趣的节点                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.6 知识图谱

全局知识图谱，可拖拽、可点击：

```
                        ┌─────────────┐
                        │  前端架构   │
                        └──────┬──────┘
           ┌───────────────────┼───────────────────┐
           ↓                   ↓                   ↓
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ 框架原理  │        │ 状态管理  │        │ 架构模式  │
    └────┬─────┘        └────┬─────┘        └────┬─────┘
         │                   │                   │
    ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
    ↓         ↓         ↓         ↓         ↓         ↓
 [React]  [Vue]    [Redux]  [MobX]    [DDD]   [Clean]
```

- 点击节点：进入知识点详情
- 拖拽节点：调整布局
- 颜色区分：不同模块不同颜色

---

## 二、版本规划

### V1：基础展示版

**核心功能**：

1. **可交互架构图**
   - React Flow 渲染架构图
   - 拖拽、缩放、平移
   - 点击节点显示详情面板

2. **内容组织**
   - 9 大模块分类浏览
   - 每个知识点：架构图 + 节点详情 + 场景 + 案例
   - 知识图谱展示全局关系

3. **基础功能**
   - 暗色/亮色主题
   - 学习进度记录（本地存储）

### V2：AI 增强版

**在 V1 基础上增加**：

1. **AI 问答** - 针对当前架构图提问
2. **AI 架构分析** - 上传描述，获取建议
3. **AI 对比** - 输入场景，推荐架构
4. **智能推荐** - 根据历史推荐下一步学习

---

## 三、知识体系大纲

### 模块 1：框架架构原理

- React 架构（虚拟DOM、Fiber、Hooks、并发模式、RSC）
- Vue 架构（响应式、编译器、渲染器、Composition API）
- 现代框架对比（编译时vs运行时、Signals、Islands）

**超大型项目意义**：

> 理解框架底层原理是架构决策的基础。300万行项目需要考虑：
>
> - **React**：适合复杂交互、需要细粒度控制的场景，生态成熟
> - **Vue**：适合快速迭代、团队学习成本敏感的场景
> - **选型关键**：团队技术栈、招聘市场、性能需求、生态支持

---

### 模块 2：状态管理架构

- Flux/Redux 架构
- 轻量级状态管理（Zustand）
- 原子化状态（Jotai/Recoil）
- 响应式状态（MobX）
- 状态机（XState）
- 服务端状态（React Query/SWR）

**超大型项目意义**：

> 状态管理是大型项目的核心挑战，直接影响代码可维护性：
>
> - **Redux**：规范严格，适合需要强约束、时间旅行调试的场景
> - **Zustand**：轻量灵活，适合模块化拆分，各子应用独立 store
> - **MobX**：自动追踪依赖，适合数据密集型（CRM/ERP）
> - **XState**：复杂流程状态机，防止非法状态（支付、审批流程）
> - **React Query**：服务端状态必选，解决缓存、去重、同步问题
> - **选型关键**：状态复杂度、团队规范需求、调试需求

---

### 模块 3：DDD 前端实践

- 领域模型、实体、值对象、聚合
- 前端 DDD 分层
- Repository、Use Case、CQRS

**超大型项目意义**：

> DDD 是管理业务复杂度的核心方法论：
>
> - **限界上下文**：划分团队边界，每个团队负责独立的业务域
> - **领域模型**：业务规则集中管理，避免逻辑散落各处
> - **CQRS**：读写分离优化性能，适合高并发查询场景
> - **选型关键**：业务复杂度高时必选，简单 CRUD 不需要

---

### 模块 4：整洁架构 & 依赖管理

- 整洁架构（同心圆）
- 六边形架构（Ports & Adapters）
- 依赖反转、依赖注入

**超大型项目意义**：

> 架构分层是控制依赖、保证可测试性的关键：
>
> - **整洁架构**：业务逻辑与框架解耦，方便技术栈迁移
> - **依赖注入**：便于 Mock 测试、并行开发
> - **六边形架构**：多端复用核心逻辑（Web/Mobile/Desktop）
> - **选型关键**：需要长期维护、多端支持、高测试覆盖时选用

---

### 模块 5：微前端架构

- Module Federation、qiankun、Micro App
- JS 沙箱、CSS 隔离、应用通信

**超大型项目意义**：

> 微前端是超大型项目的标配架构：
>
> - **独立部署**：各团队独立发布，互不阻塞
> - **技术栈无关**：遗留系统渐进式迁移
> - **故障隔离**：单个子应用崩溃不影响整体
> - **Module Federation**：依赖共享，运行时集成（推荐新项目）
> - **qiankun**：成熟稳定，沙箱完善（推荐有遗留系统）
> - **选型关键**：团队规模 > 5人、需要独立部署时选用

---

### 模块 6：设计模式

- 创建型（单例、工厂、建造者）
- 结构型（适配器、装饰器、代理、组合）
- 行为型（观察者、策略、命令、状态）

**超大型项目意义**：

> 设计模式是代码复用、解耦的基础工具：
>
> - **单例**：全局服务（API Client、Logger、配置管理）
> - **工厂**：动态创建组件、插件系统
> - **策略**：可插拔的算法/规则（验证、计算、渲染策略）
> - **命令**：撤销重做、操作录制、宏命令
> - **观察者**：事件系统、跨模块通信
> - **选型关键**：识别场景，按需使用，避免过度设计

---

### 模块 7：工程化架构

- Monorepo（pnpm、Turborepo、Nx）
- 构建工具（Webpack、Vite、Rollup）

**超大型项目意义**：

> 工程化决定开发效率和构建速度：
>
> - **Monorepo**：代码共享、原子提交、统一版本管理
> - **pnpm + Turborepo**：依赖提升、增量构建、远程缓存
> - **Nx**：依赖图分析、affected 构建、代码生成器
> - **构建优化**：300万行项目构建从 40 分钟优化到 5 分钟
> - **选型关键**：多包项目必选 Monorepo，团队 > 10人推荐 Nx

---

### 模块 8：性能架构

- 渲染性能、加载性能
- SSR/SSG/ISR
- 缓存策略

**超大型项目意义**：

> 性能是用户体验和业务指标的核心：
>
> - **性能预算**：设定 LCP < 2.5s、INP < 200ms 等指标
> - **代码分割**：按路由、按功能分割，首屏 JS 减少 50%+
> - **SSR/SSG**：SEO 需求、首屏性能要求高时必选
> - **监控告警**：Core Web Vitals 监控、性能劣化自动告警
> - **选型关键**：C 端产品性能优先级高，B 端可适当放宽

---

### 模块 9：超大型项目架构

- 架构分层、代码组织
- 构建与发布、灰度部署
- 性能监控、降级容错

**超大型项目意义**：

> 综合运用以上所有知识，构建可持续演进的系统：
>
> - **Feature-Sliced Design**：统一的代码组织规范
> - **CODEOWNERS**：明确代码所有权，减少协作冲突
> - **灰度发布**：1% → 10% → 100%，降低发布风险
> - **降级容错**：错误边界、兜底方案、熔断机制
> - **架构治理**：依赖检查、API 规范、自动化门禁

---

## 四、技术栈

### 4.1 技术栈总览

| 类别       | 技术选择      | 版本    | 说明                     |
| ---------- | ------------- | ------- | ------------------------ |
| 框架       | React         | ^18.3.x | Hooks + 函数组件         |
| 语言       | TypeScript    | ^5.x    | 类型安全                 |
| 构建       | Vite          | ^5.x    | 极速 HMR                 |
| **架构图** | @xyflow/react | ^12.x   | 节点拖拽、缩放、点击交互 |
| 路由       | React Router  | ^6.x    | 声明式路由               |
| 状态管理   | Zustand       | ^4.x    | 轻量，持久化             |
| 样式       | Tailwind CSS  | ^3.x    | 原子化 CSS               |
| 图标       | Lucide React  | ^0.x    | 轻量图标库               |
| 数据存储   | LocalStorage  | -       | 学习进度持久化           |
| V2 AI      | Claude API    | -       | 问答、分析（后续）       |

### 4.2 核心依赖详解

#### React 18 + TypeScript

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.6.2"
}
```

**选型理由**：

- React 18 支持并发渲染，适合复杂交互场景
- TypeScript 提供类型安全，减少运行时错误
- 生态成熟，组件库丰富

**替代方案**：Vue 3（如果团队更熟悉 Vue）

---

#### Vite

```json
{
  "vite": "^5.4.x",
  "@vitejs/plugin-react": "^4.3.x"
}
```

**选型理由**：

- 开发启动极快（< 1s）
- 原生 ESM，HMR 即时生效
- 生产构建使用 Rollup，产物优化好

**替代方案**：Next.js（如需 SSR）、Webpack（传统项目）

---

#### @xyflow/react (React Flow)

```json
{
  "@xyflow/react": "^12.3.x"
}
```

**选型理由**：

- 专为节点图设计，功能完善
- 内置拖拽、缩放、平移、连线
- 自定义节点和边非常灵活
- TypeScript 支持好
- 维护活跃，文档详细

**核心功能**：| 功能 | 说明 | |------|------|
| 自定义节点 | 可使用任意 React 组件作为节点 |
| 自定义边 | 支持自定义路径、样式、标签 | | 拖拽 | 节点拖拽、画布平移 |
| 缩放 | 鼠标滚轮或按钮控制 | | 小地图 | MiniMap 组件，俯瞰全局 | | 控制栏 |
Controls 组件，缩放/居中按钮 | | 背景 | Background 组件，网格/点阵背景 |

**替代方案**：

- D3.js（更底层，需自己实现交互）
- Cytoscape.js（图论分析强，但定制性差）
- JointJS（商业友好，但学习曲线高）

---

#### React Router v6

```json
{
  "react-router-dom": "^6.28.x"
}
```

**选型理由**：

- React 官方推荐路由方案
- v6 API 更简洁（useNavigate, useParams）
- 支持嵌套路由、懒加载

**路由结构**：

```
/                     → 首页
/module/:moduleId     → 模块列表
/arch/:archId         → 架构详情
/graph                → 知识图谱
/settings             → 设置
```

---

#### Zustand

```json
{
  "zustand": "^4.5.x"
}
```

**选型理由**：

- 极简 API，无 Provider 包裹
- 体积小（< 2KB gzip）
- 内置 persist 中间件，支持 LocalStorage
- 性能优秀，自动细粒度更新

**Store 结构**：

```typescript
interface AppStore {
  // 主题
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // 浏览历史（持久化）
  viewHistory: string[];
  addToHistory: (archId: string) => void;
  clearHistory: () => void;

  // UI 状态（不持久化）
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}
```

**替代方案**：

- Jotai（原子化，适合细粒度状态）
- Redux Toolkit（需要严格规范时）

---

#### Tailwind CSS

```json
{
  "tailwindcss": "^3.4.x",
  "postcss": "^8.x",
  "autoprefixer": "^10.x"
}
```

**选型理由**：

- 原子化 CSS，开发效率高
- 无需命名烦恼
- 支持暗色模式（`dark:` 前缀）
- 构建时自动 purge，体积小

**配置要点**：

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // 使用 class 策略切换主题
  theme: {
    extend: {
      colors: {
        // 自定义色板
      },
    },
  },
};
```

**替代方案**：

- CSS Modules（传统方案）
- styled-components（CSS-in-JS）
- UnoCSS（更快的原子化方案）

---

#### Lucide React

```json
{
  "lucide-react": "^0.460.x"
}
```

**选型理由**：

- Feather 图标的 fork，持续维护
- 体积小，按需导入
- 风格统一，适合工具类产品
- 支持自定义 size、color、strokeWidth

**使用示例**：

```tsx
import { Settings, Moon, Sun, ChevronRight } from 'lucide-react';

<Sun className="w-5 h-5" />;
```

**替代方案**：

- @heroicons/react（Tailwind 官方图标）
- react-icons（图标集合，但体积大）

---

### 4.3 开发工具链

| 工具     | 版本      | 用途                 |
| -------- | --------- | -------------------- |
| Node.js  | ^20.x LTS | 运行环境             |
| pnpm     | ^8.x      | 包管理（推荐）或 npm |
| ESLint   | ^8.x      | 代码检查             |
| Prettier | ^3.x      | 代码格式化           |

**推荐 VS Code 插件**：

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (可选)

---

### 4.4 package.json 完整依赖

```json
{
  "name": "arch-learning-tool",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "@xyflow/react": "^12.3.0",
    "zustand": "^4.5.5",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}
```

---

### 4.5 V2 AI 功能技术栈（后续）

| 类别     | 技术选择              | 说明           |
| -------- | --------------------- | -------------- |
| AI API   | Claude API / OpenAI   | 架构问答、分析 |
| 流式响应 | Server-Sent Events    | 打字机效果     |
| 后端     | Vercel Edge Functions | 代理 API 调用  |
| Markdown | react-markdown        | 渲染 AI 回复   |
| 代码高亮 | Prism.js / Shiki      | 代码块语法高亮 |

---

## 五、功能模块

### 1. 首页

- 9 大模块入口卡片
- 知识图谱入口
- 最近浏览记录

### 2. 架构图查看器（核心）

- 架构图渲染（React Flow）
- 拖拽、缩放、平移
- 点击节点 → 右侧详情面板
- 点击连线 → 显示连接说明
- 底部：场景说明 + 真实案例
- 关联知识点链接

### 3. 知识图谱

- 全局知识关系图
- 可拖拽调整
- 点击跳转详情

### 4. 设置

- 主题切换
- 清除浏览记录

---

## 六、实现步骤

### 阶段一：项目基础

1. Vite + React + TypeScript 初始化
2. 安装依赖（React Flow、Tailwind、Zustand）
3. 创建目录结构
4. 布局组件（Header、Sidebar、Content）

### 阶段二：架构图查看器

1. React Flow 集成
2. 自定义节点类型（Service、Database、Gateway、Component 等）
3. 自定义边类型（同步、异步、依赖）
4. 节点详情面板组件
5. 连线说明弹窗

### 阶段三：内容数据

1. 设计架构数据结构（节点、边、详情、场景）
2. 创建各模块架构数据（每模块 2-3 个）
3. 编写节点详情、场景说明、案例

### 阶段四：知识图谱

1. React Flow 渲染知识图谱
2. 节点分类着色
3. 点击跳转

### 阶段五：细节完善

1. 浏览进度存储（LocalStorage）
2. 主题切换
3. 响应式适配

### 阶段六：V2 AI 功能（后续）

1. 接入 LLM API
2. 问答组件
3. 架构分析功能

---

## 七、项目结构

```
arch-learning-tool/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── layout/              # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── viewer/              # 架构图查看器
│   │   │   ├── ArchitectureCanvas.tsx   # 主画布
│   │   │   ├── NodeDetailPanel.tsx      # 节点详情面板
│   │   │   ├── EdgeTooltip.tsx          # 连线说明
│   │   │   └── SceneInfo.tsx            # 场景说明
│   │   ├── nodes/               # 自定义节点
│   │   │   ├── ServiceNode.tsx
│   │   │   ├── DatabaseNode.tsx
│   │   │   ├── GatewayNode.tsx
│   │   │   ├── ComponentNode.tsx
│   │   │   └── LayerNode.tsx
│   │   └── common/              # 通用组件
│   │       ├── Card.tsx
│   │       └── Modal.tsx
│   ├── pages/
│   │   ├── Home.tsx             # 首页
│   │   ├── ModuleList.tsx       # 模块列表
│   │   ├── ArchitectureView.tsx # 架构详情页
│   │   └── KnowledgeGraph.tsx   # 知识图谱页
│   ├── data/                    # 架构数据
│   │   ├── index.ts             # 统一导出
│   │   ├── frameworks/          # 框架架构
│   │   │   ├── react-fiber.ts
│   │   │   ├── vue-reactivity.ts
│   │   │   └── ...
│   │   ├── state-management/    # 状态管理
│   │   │   ├── redux.ts
│   │   │   ├── mobx.ts
│   │   │   └── ...
│   │   └── ...                  # 其他模块
│   ├── hooks/
│   │   └── useProgress.ts       # 浏览进度
│   ├── store/
│   │   └── progressStore.ts     # Zustand store
│   ├── types/
│   │   └── architecture.ts      # 类型定义
│   └── styles/
├── package.json
└── vite.config.ts
```

---

## 八、数据结构设计

```typescript
// types/architecture.ts

interface ArchitectureData {
  id: string;
  name: string;
  module: string; // 所属模块
  description: string; // 简短描述

  // React Flow 数据
  nodes: ArchNode[];
  edges: ArchEdge[];

  // 场景说明
  scenarios: {
    suitable: string[]; // 适用场景
    unsuitable: string[]; // 不适用场景
  };

  // 真实案例
  cases: {
    company: string;
    description: string;
  }[];

  // 关联知识
  relatedIds: string[];
}

interface ArchNode {
  id: string;
  type: 'service' | 'database' | 'gateway' | 'component' | 'layer' | 'client';
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    responsibilities?: string[];
    technologies?: string[];
    relatedLinks?: { label: string; id: string }[];
  };
}

interface ArchEdge {
  id: string;
  source: string;
  target: string;
  type?: 'sync' | 'async' | 'dependency';
  label?: string;
  data?: {
    description: string;
  };
}
```

---

## 九、验证方式

1. `npm run dev` 启动开发服务器
2. 浏览首页，查看 9 大模块入口
3. 进入任意架构图，验证：
   - 图形正确渲染
   - 拖拽节点正常
   - 缩放平移正常
   - 点击节点显示详情面板
   - 点击连线显示说明
4. 查看知识图谱，点击节点可跳转
5. 刷新页面，浏览记录保留
6. `npm run build` 生产构建成功

---

## 十、详细开发计划

### 项目路径

```
/Users/menglingyu/My/arch-learning-tool/
```

---

### Sprint 1：项目初始化与基础框架

#### 任务 1.1：项目初始化

```bash
# 执行命令
cd /Users/menglingyu/My
npm create vite@latest arch-learning-tool -- --template react-ts
cd arch-learning-tool
npm install
```

#### 任务 1.2：安装核心依赖

```bash
# React Flow - 架构图核心
npm install @xyflow/react

# Tailwind CSS - 样式
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Zustand - 状态管理
npm install zustand

# React Router - 路由
npm install react-router-dom

# 图标库
npm install lucide-react
```

#### 任务 1.3：配置 Tailwind

**文件**: `tailwind.config.js`

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          /* 自定义主色 */
        },
        surface: {
          /* 表面色 */
        },
      },
    },
  },
  plugins: [],
};
```

#### 任务 1.4：创建目录结构

```
src/
├── components/
│   ├── layout/
│   ├── viewer/
│   ├── nodes/
│   └── common/
├── pages/
├── data/
├── hooks/
├── store/
├── types/
└── styles/
```

**验收标准**：

- [ ] `npm run dev` 能正常启动
- [ ] Tailwind 样式生效
- [ ] 目录结构创建完成

---

### Sprint 2：类型定义与布局组件

#### 任务 2.1：类型定义

**文件**: `src/types/architecture.ts`

```typescript
// 模块定义
export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  architectures: string[]; // 架构ID列表
}

// 架构数据
export interface ArchitectureData {
  id: string;
  name: string;
  moduleId: string;
  description: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  scenarios: {
    suitable: string[];
    unsuitable: string[];
  };
  cases: {
    company: string;
    description: string;
  }[];
  significance: string; // 超大型项目意义
  relatedIds: string[];
}

// 节点类型
export type NodeType =
  | 'service'
  | 'database'
  | 'gateway'
  | 'component'
  | 'layer'
  | 'client'
  | 'store'
  | 'action';

// 架构节点
export interface ArchNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    responsibilities?: string[];
    technologies?: string[];
    codeExample?: string;
    relatedLinks?: { label: string; id: string }[];
  };
}

// 边类型
export type EdgeType = 'sync' | 'async' | 'dependency' | 'dataflow';

// 架构边
export interface ArchEdge {
  id: string;
  source: string;
  target: string;
  type?: EdgeType;
  label?: string;
  animated?: boolean;
  data?: {
    description: string;
  };
}
```

#### 任务 2.2：布局组件

**文件**: `src/components/layout/Layout.tsx`

- 顶部 Header：Logo + 导航 + 主题切换
- 左侧 Sidebar：模块导航列表
- 主内容区：页面渲染

**文件**: `src/components/layout/Header.tsx`

```typescript
// 包含：
// - Logo
// - 导航链接（首页、知识图谱）
// - 主题切换按钮
// - 搜索入口（V2）
```

**文件**: `src/components/layout/Sidebar.tsx`

```typescript
// 包含：
// - 9大模块列表
// - 当前模块高亮
// - 折叠/展开功能
```

**验收标准**：

- [ ] 布局组件渲染正常
- [ ] 响应式适配（移动端 Sidebar 可折叠）
- [ ] 主题切换功能正常

---

### Sprint 3：自定义节点组件

#### 任务 3.1：基础节点样式

**文件**: `src/components/nodes/BaseNode.tsx`

- 通用节点容器
- 选中状态样式
- 连接点（handles）位置

#### 任务 3.2：各类型节点

| 文件                | 用途        | 样式特征     |
| ------------------- | ----------- | ------------ |
| `ServiceNode.tsx`   | 服务/微服务 | 蓝色圆角矩形 |
| `DatabaseNode.tsx`  | 数据库      | 绿色圆柱形   |
| `GatewayNode.tsx`   | API网关     | 橙色六边形   |
| `ComponentNode.tsx` | UI组件      | 紫色矩形     |
| `LayerNode.tsx`     | 架构层      | 大矩形容器   |
| `ClientNode.tsx`    | 客户端      | 灰色圆形     |
| `StoreNode.tsx`     | 状态存储    | 青色矩形     |
| `ActionNode.tsx`    | 动作/事件   | 黄色菱形     |

#### 任务 3.3：自定义边

**文件**: `src/components/edges/CustomEdge.tsx`

- 同步调用：实线箭头
- 异步消息：虚线箭头
- 依赖关系：点线
- 数据流：带动画的线

**验收标准**：

- [ ] 所有节点类型渲染正常
- [ ] 节点可拖拽
- [ ] 边的样式区分明显

---

### Sprint 4：架构图查看器核心

#### 任务 4.1：主画布组件

**文件**: `src/components/viewer/ArchitectureCanvas.tsx`

```typescript
// 核心功能：
// 1. React Flow 画布初始化
// 2. 加载架构数据（nodes, edges）
// 3. 注册自定义节点类型
// 4. 处理节点点击事件 → 打开详情面板
// 5. 处理边点击事件 → 显示连接说明
// 6. 支持缩放、平移、拖拽
// 7. 小地图（MiniMap）
// 8. 控制栏（缩放按钮）
```

#### 任务 4.2：节点详情面板

**文件**: `src/components/viewer/NodeDetailPanel.tsx`

```typescript
// 右侧滑出面板，显示：
// - 节点名称和类型图标
// - 描述说明
// - 职责列表
// - 技术实现
// - 代码示例（可选）
// - 相关知识链接
```

#### 任务 4.3：场景信息组件

**文件**: `src/components/viewer/SceneInfo.tsx`

```typescript
// 底部区域，显示：
// - 适用场景（绿色标签）
// - 不适用场景（红色标签）
// - 真实案例卡片
// - 超大型项目意义
```

#### 任务 4.4：边说明弹窗

**文件**: `src/components/viewer/EdgeTooltip.tsx`

- 点击边时显示
- 显示连接类型和说明

**验收标准**：

- [ ] 架构图渲染正常
- [ ] 节点拖拽、画布缩放正常
- [ ] 点击节点显示详情面板
- [ ] 点击边显示说明
- [ ] 场景信息展示正常

---

### Sprint 5：架构数据创建

#### 任务 5.1：模块数据

**文件**: `src/data/modules.ts`

- 9 大模块的元数据

#### 任务 5.2：框架架构数据

**文件**: `src/data/frameworks/`

- `react-fiber.ts` - React Fiber 架构
- `vue-reactivity.ts` - Vue 响应式系统
- `modern-frameworks.ts` - 现代框架对比

#### 任务 5.3：状态管理数据

**文件**: `src/data/state-management/`

- `redux.ts` - Redux 单向数据流
- `zustand.ts` - Zustand 架构
- `mobx.ts` - MobX 响应式
- `xstate.ts` - XState 状态机
- `react-query.ts` - React Query 服务端状态

#### 任务 5.4：其他模块数据

按照相同模式创建：

- `src/data/ddd/` - DDD 相关
- `src/data/clean-architecture/` - 整洁架构
- `src/data/micro-frontend/` - 微前端
- `src/data/design-patterns/` - 设计模式
- `src/data/engineering/` - 工程化
- `src/data/performance/` - 性能架构
- `src/data/large-scale/` - 超大型项目

**验收标准**：

- [ ] 每个模块至少 2 个架构数据
- [ ] 节点位置合理，图形清晰
- [ ] 每个节点有详细说明

---

### Sprint 6：页面与路由

#### 任务 6.1：路由配置

**文件**: `src/App.tsx`

```typescript
// 路由结构：
// /                    → 首页
// /module/:moduleId    → 模块列表页
// /arch/:archId        → 架构详情页
// /graph               → 知识图谱页
// /settings            → 设置页
```

#### 任务 6.2：首页

**文件**: `src/pages/Home.tsx`

- 9 大模块入口卡片（网格布局）
- 每个卡片：图标 + 名称 + 简介 + 知识点数量
- 知识图谱入口
- 最近浏览记录

#### 任务 6.3：模块列表页

**文件**: `src/pages/ModuleList.tsx`

- 模块标题和描述
- 该模块下所有架构卡片
- 点击进入架构详情

#### 任务 6.4：架构详情页

**文件**: `src/pages/ArchitectureView.tsx`

- 集成 ArchitectureCanvas
- 集成 NodeDetailPanel
- 集成 SceneInfo
- 面包屑导航
- 关联知识链接

#### 任务 6.5：知识图谱页

**文件**: `src/pages/KnowledgeGraph.tsx`

- 全局知识关系图
- 模块颜色区分
- 点击节点跳转详情

**验收标准**：

- [ ] 所有页面路由正常
- [ ] 页面间跳转正常
- [ ] 面包屑导航正确

---

### Sprint 7：状态管理与持久化

#### 任务 7.1：Zustand Store

**文件**: `src/store/index.ts`

```typescript
interface AppState {
  // 主题
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // 浏览历史
  viewHistory: string[]; // 架构ID列表
  addToHistory: (archId: string) => void;
  clearHistory: () => void;

  // 当前选中节点
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // 侧边栏状态
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}
```

#### 任务 7.2：持久化配置

使用 `zustand/middleware` 的 `persist` 中间件：

- 持久化：theme, viewHistory
- 不持久化：selectedNodeId, sidebarCollapsed

#### 任务 7.3：浏览进度 Hook

**文件**: `src/hooks/useProgress.ts`

- 记录已浏览的架构
- 计算模块完成百分比

**验收标准**：

- [ ] 主题切换后刷新保持
- [ ] 浏览历史正确记录
- [ ] 刷新页面状态保留

---

### Sprint 8：样式与主题

#### 任务 8.1：全局样式

**文件**: `src/styles/index.css`

- Tailwind 基础导入
- 自定义 CSS 变量
- 滚动条样式
- 过渡动画

#### 任务 8.2：主题配置

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --accent: #3b82f6;
}

.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border: #334155;
  --accent: #60a5fa;
}
```

#### 任务 8.3：React Flow 主题

- 自定义节点背景色
- 自定义边颜色
- 控制栏样式

**验收标准**：

- [ ] 亮色/暗色主题切换正常
- [ ] 所有组件主题适配
- [ ] React Flow 主题适配

---

### Sprint 9：细节完善与优化

#### 任务 9.1：响应式适配

- 移动端 Sidebar 抽屉式
- 详情面板全屏模式
- 卡片布局自适应

#### 任务 9.2：交互优化

- 节点 hover 效果
- 加载状态
- 空状态提示
- 键盘快捷键（Esc 关闭面板）

#### 任务 9.3：性能优化

- 架构数据懒加载
- React.memo 优化节点渲染
- 虚拟化长列表（如有需要）

**验收标准**：

- [ ] 移动端可正常使用
- [ ] 交互流畅无卡顿
- [ ] Lighthouse 性能分数 > 90

---

### Sprint 10：测试与部署

#### 任务 10.1：功能测试

- 遍历所有架构图
- 测试所有交互
- 跨浏览器测试

#### 任务 10.2：构建优化

```bash
npm run build
```

- 检查构建产物大小
- 配置代码分割

#### 任务 10.3：部署准备

- 配置 base path（如需要）
- 生成静态文件
- 可部署到 Vercel / Netlify / GitHub Pages

**验收标准**：

- [ ] `npm run build` 成功
- [ ] 构建产物大小合理（< 500KB gzip）
- [ ] 部署后功能正常

---

## 十一、关键文件清单

| 优先级 | 文件路径                                       | 说明         |
| ------ | ---------------------------------------------- | ------------ |
| P0     | `src/types/architecture.ts`                    | 核心类型定义 |
| P0     | `src/components/viewer/ArchitectureCanvas.tsx` | 架构图画布   |
| P0     | `src/components/nodes/*.tsx`                   | 自定义节点   |
| P0     | `src/data/state-management/redux.ts`           | 示例架构数据 |
| P1     | `src/components/viewer/NodeDetailPanel.tsx`    | 节点详情     |
| P1     | `src/components/layout/*.tsx`                  | 布局组件     |
| P1     | `src/pages/*.tsx`                              | 页面组件     |
| P1     | `src/store/index.ts`                           | 状态管理     |
| P2     | `src/data/**/*.ts`                             | 所有架构数据 |
| P2     | `src/styles/*.css`                             | 样式文件     |

---

## 十二、开发顺序建议

```
1. 项目初始化 + 依赖安装
   ↓
2. 类型定义
   ↓
3. 自定义节点组件（先做 2-3 个核心节点）
   ↓
4. ArchitectureCanvas 核心画布
   ↓
5. 创建一个完整的架构数据（如 Redux）
   ↓
6. 验证：架构图能正常渲染和交互
   ↓
7. NodeDetailPanel 详情面板
   ↓
8. 布局组件 + 路由
   ↓
9. 首页 + 模块列表页
   ↓
10. 补充更多架构数据
    ↓
11. 知识图谱
    ↓
12. 主题切换 + 持久化
    ↓
13. 细节完善
```

---

## 十三、预估工作量

| Sprint    | 内容         | 复杂度       |
| --------- | ------------ | ------------ |
| Sprint 1  | 项目初始化   | 低           |
| Sprint 2  | 类型 + 布局  | 低           |
| Sprint 3  | 自定义节点   | 中           |
| Sprint 4  | 架构图查看器 | 高           |
| Sprint 5  | 架构数据     | 中（内容多） |
| Sprint 6  | 页面路由     | 中           |
| Sprint 7  | 状态管理     | 低           |
| Sprint 8  | 样式主题     | 低           |
| Sprint 9  | 细节优化     | 中           |
| Sprint 10 | 测试部署     | 低           |
