# 快捷键与操作

Antigravity 完整的快捷键和操作指南。

---

## 全局快捷键

### Agent 控制

| 快捷键        | 功能                    |
| ------------- | ----------------------- |
| `Cmd+Shift+A` | 打开/关闭 Agent Manager |
| `Cmd+Enter`   | 发送提示词              |
| `Shift+Tab`   | 循环切换开发模式        |
| `Escape`      | 取消当前操作/关闭面板   |
| `Cmd+.`       | 停止当前 Agent          |
| `Cmd+P`       | 暂停/恢复 Agent         |

### 提示词输入

| 快捷键            | 功能                  |
| ----------------- | --------------------- |
| `Enter`           | 发送单行提示          |
| `Shift+Enter`     | 换行（多行输入）      |
| `Cmd+Shift+Enter` | 发送并使用 Deep Think |
| `↑`               | 上一条提示历史        |
| `↓`               | 下一条提示历史        |
| `Tab`             | 自动补全文件引用      |

---

## 编辑器快捷键

### 代码编辑

| 快捷键        | 功能                        |
| ------------- | --------------------------- |
| `Tab`         | 接受 AI 补全                |
| `Cmd+Shift+K` | 使用 AI 修改选中代码        |
| `Cmd+L`       | 在 Agent 对话中引用选中代码 |
| `Cmd+I`       | 内联 AI 编辑                |

### 导航

| 快捷键        | 功能         |
| ------------- | ------------ |
| `Cmd+P`       | 快速打开文件 |
| `Cmd+Shift+P` | 命令面板     |
| `Cmd+G`       | 跳转到行     |
| `Cmd+Shift+O` | 跳转到符号   |

### 多光标

| 快捷键           | 功能             |
| ---------------- | ---------------- |
| `Cmd+D`          | 选中下一个相同词 |
| `Cmd+Shift+L`    | 选中所有相同词   |
| `Option+Click`   | 添加光标         |
| `Cmd+Option+↑/↓` | 上/下添加光标    |

---

## Agent Manager 快捷键

| 快捷键        | 功能                |
| ------------- | ------------------- |
| `Cmd+N`       | 新建任务            |
| `Cmd+1-9`     | 切换到第 N 个 Agent |
| `Cmd+W`       | 关闭当前 Agent 线程 |
| `Cmd+Shift+C` | 添加评论            |
| `Cmd+Shift+S` | 切换思维过程面板    |

---

## 浏览器快捷键

| 快捷键        | 功能                |
| ------------- | ------------------- |
| `Cmd+Shift+B` | 打开/关闭浏览器面板 |
| `Cmd+R`       | 刷新页面            |
| `F12`         | 开发者工具          |
| `Cmd+Shift+T` | 截图                |
| `Cmd+Shift+R` | 开始/停止录屏       |

---

## 文件引用语法

### @ 引用

在提示词中使用 `@` 引用文件：

```
@src/components/Button.tsx   # 单个文件
@src/components/             # 目录
@src/**/*.tsx                # Glob 模式
@README.md                   # 根目录文件
```

### 特殊引用

```
@selection                   # 当前选中的代码
@file                        # 当前编辑的文件
@terminal                    # 终端输出
@diff                        # 最近的变更 diff
```

---

## 提示词前缀

| 前缀   | 功能       | 示例                       |
| ------ | ---------- | -------------------------- |
| 无前缀 | 正常对话   | `创建登录表单`             |
| `!`    | 执行命令   | `! npm run test`           |
| `?`    | 快速问答   | `? 这个错误什么意思`       |
| `/`    | 工作流命令 | `/generate-tests`          |
| `#`    | 添加记忆   | `# 使用 TypeScript strict` |

---

## 开发模式切换

使用 `Shift+Tab` 循环切换：

```
Agent-driven → Review-driven → Agent-assisted → Agent-driven
```

或在提示词中指定：

```
【Agent-driven】创建基础项目结构
【Review-driven】重构数据库连接
【Agent-assisted】添加新功能
```

---

## 模型切换

### 命令方式

```
/model gemini-3-pro
/model claude-sonnet-4.5
/model gemini-3-deep-think
```

### 提示词方式

```
【使用 Deep Think】分析这个算法的时间复杂度
【使用 Claude Opus】审查这段代码的安全性
```

---

## Artifacts 操作

| 操作          | 方法                        |
| ------------- | --------------------------- |
| 查看 Artifact | 点击 Artifacts 面板中的文件 |
| 编辑 Artifact | 双击或 `Cmd+Click`          |
| 添加评论      | 选中文本 → `Cmd+Shift+C`    |
| 请求更新      | 在评论中 @agent             |
| 导出 Artifact | 右键 → Export               |

---

## 常用命令

### 任务管理

```
/new        # 新建任务
/clear      # 清空当前对话
/history    # 查看历史任务
/resume     # 恢复上次任务
```

### Agent 控制

```
/stop       # 停止 Agent
/pause      # 暂停 Agent
/resume     # 恢复 Agent
/retry      # 重试上次操作
```

### 上下文管理

```
/compact    # 压缩上下文
/forget     # 忘记特定内容
/remember   # 添加到记忆
```

### 调试

```
/debug      # 进入调试模式
/logs       # 查看日志
/report     # 生成问题报告
```

---

## 手势操作（触控板）

| 手势     | 功能               |
| -------- | ------------------ |
| 三指左滑 | 返回上一个 Agent   |
| 三指右滑 | 前进到下一个 Agent |
| 捏合缩放 | 调整编辑器缩放     |

---

## 自定义快捷键

在 Settings → Keyboard Shortcuts 中自定义：

```json
{
  "keybindings": [
    {
      "key": "cmd+shift+t",
      "command": "antigravity.runTests"
    },
    {
      "key": "cmd+shift+f",
      "command": "antigravity.formatWithAI"
    }
  ]
}
```

---

## 快捷键速查表

```
┌─────────────────────────────────────────────────────┐
│                 Antigravity 快捷键                   │
├─────────────────────────────────────────────────────┤
│  Agent                                               │
│  Cmd+Shift+A    Agent Manager                       │
│  Cmd+Enter      发送提示                            │
│  Shift+Tab      切换模式                            │
│  Cmd+.          停止 Agent                          │
├─────────────────────────────────────────────────────┤
│  编辑器                                              │
│  Tab            接受补全                            │
│  Cmd+Shift+K    AI 修改代码                         │
│  Cmd+L          引用到对话                          │
├─────────────────────────────────────────────────────┤
│  导航                                                │
│  Cmd+P          快速打开                            │
│  Cmd+Shift+P    命令面板                            │
│  Cmd+Shift+O    跳转符号                            │
├─────────────────────────────────────────────────────┤
│  浏览器                                              │
│  Cmd+Shift+B    浏览器面板                          │
│  Cmd+Shift+T    截图                                │
│  F12            开发者工具                          │
└─────────────────────────────────────────────────────┘
```
