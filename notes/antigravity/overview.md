# Antigravity 概览

Google Antigravity 是 Google DeepMind 推出的下一代 AI 编程平台，采用
**Agent-First** 设计理念。

## 核心定位

> **从 AI 辅助 → AI 自主执行**

传统 AI 编程工具（如 Copilot）专注于代码补全，而 Antigravity 的 Agent 可以：

- **理解** 自然语言需求
- **规划** 实现方案
- **生成** 完整代码
- **测试** 并调试
- **迭代** 直到完成

## 核心组件

### 1. 代码编辑器

- 内置 Tab 自动补全
- Agent 侧边栏
- 代码 Diff 预览
- 多文件编辑

### 2. Agent Manager

- 创建和管理 AI Agent
- 多工作区支持
- 任务编排
- 进度跟踪

### 3. 集成浏览器

- Agent 可自动操作浏览器
- 用于测试 Web 应用
- 网页研究和数据获取
- 截图和录屏

## 技术架构

```
┌─────────────────────────────────────────┐
│            Antigravity IDE              │
├──────────┬──────────┬──────────────────┤
│  Editor  │  Agent   │     Browser      │
│          │ Manager  │                  │
├──────────┴──────────┴──────────────────┤
│              Gemini 3 Pro              │
│         (Code Reasoning Engine)         │
└─────────────────────────────────────────┘
```

## 与其他工具对比

| 特性   | Antigravity | Claude Code | Cursor    | Copilot  |
| ------ | ----------- | ----------- | --------- | -------- |
| 类型   | Agent-First | Agent       | AI Editor | 补全     |
| 模型   | Gemini 3    | Claude      | 多模型    | GPT      |
| 自主性 | 高          | 高          | 中        | 低       |
| 界面   | GUI         | CLI         | GUI       | IDE 插件 |
| 浏览器 | 内置        | 无          | 无        | 无       |
| 定价   | 免费预览    | API         | 订阅      | 订阅     |

## 适用场景

### ✅ 最适合

- 快速原型开发
- 全栈应用构建
- 代码重构和迁移
- 学习新技术栈

### ⚠️ 需要注意

- 大型遗留项目（上下文限制）
- 高安全性要求项目
- 需要离线工作

## 官方资源

- [主页](https://antigravity.google)
- [帮助中心](https://antigravityide.help)
- [博客](https://blog.google)
