# 高级配置

Antigravity 的进阶配置选项，用于自定义 Agent 行为和工作流程。

---

## 一、配置文件结构

```
project-root/
├── .agent/
│   ├── settings.json        # 项目配置
│   ├── rules/               # 规则文件
│   │   ├── coding-style.md
│   │   └── testing.md
│   └── workflows/           # 工作流文件
│       ├── generate-tests.md
│       └── code-review.md
├── .mcp.json                # MCP 配置
└── ...
```

---

## 二、Settings 配置

### 2.1 开发模式配置

```json
{
  "developmentMode": "agent-assisted",
  "terminalAutoExecution": "auto",
  "reviewPolicy": "auto",
  "jsExecutionPolicy": "auto"
}
```

**开发模式选项：**

| 模式     | 值               | 说明           |
| -------- | ---------------- | -------------- |
| 自动驾驶 | `agent-driven`   | 完全自主       |
| 审核模式 | `review-driven`  | 每步确认       |
| 辅助模式 | `agent-assisted` | 推荐，平衡控制 |
| 自定义   | `custom`         | 精细控制       |

### 2.2 终端命令执行策略

```json
{
  "terminalAutoExecution": "auto"
}
```

| 策略  | 值      | 说明                         |
| ----- | ------- | ---------------------------- |
| 关闭  | `off`   | 不自动执行，除非在允许列表   |
| 自动  | `auto`  | Agent 自行判断，必要时询问   |
| Turbo | `turbo` | 全部自动执行，除非在禁止列表 |

### 2.3 允许/禁止列表

```json
{
  "terminalAutoExecution": {
    "allow": [
      "npm run dev",
      "npm run test",
      "npm run build",
      "git status",
      "git diff"
    ],
    "deny": ["rm -rf", "sudo *", "curl * | sh"]
  }
}
```

---

## 三、Rules（规则）

Rules 定义 Agent 应遵循的行为准则。

### 3.1 创建规则文件

在 `.agent/rules/` 目录创建 `.md` 文件：

```markdown
# .agent/rules/coding-style.md

## 代码风格规则

- 使用 TypeScript，禁止使用 any
- 函数必须有 JSDoc 注释
- 使用 async/await 而非 Promise.then
- 组件使用函数式风格
```

### 3.2 规则激活模式

```markdown
---
activation: always # 始终激活
---

# 规则内容...
```

**激活模式选项：**

| 模式                 | 说明           |
| -------------------- | -------------- |
| `always`             | 始终生效       |
| `manual`             | 手动触发       |
| `auto`               | Agent 自动判断 |
| `glob: src/**/*.tsx` | 匹配特定文件   |

### 3.3 规则示例

**测试规则：**

```markdown
# .agent/rules/testing.md

---

## activation: glob:\*.test.ts

## 测试规则

- 使用 Vitest 框架
- 每个函数至少 3 个测试用例
- 包含边界条件测试
- Mock 外部依赖
```

**文档规则：**

```markdown
# .agent/rules/documentation.md

---

## activation: manual

## 文档规则

- 所有公共 API 必须有文档
- 包含代码示例
- 说明参数和返回值
```

---

## 四、Workflows（工作流）

Workflows 是可复用的任务模板。

### 4.1 创建工作流

在 `.agent/workflows/` 目录创建 `.md` 文件：

```markdown
# .agent/workflows/generate-tests.md

## 生成单元测试

为指定文件生成完整的单元测试套件。

### 步骤

1. 分析目标文件的所有导出函数
2. 为每个函数生成测试用例
3. 包含正常情况和边界条件
4. 运行测试确保通过

### 输出

- 测试文件: `*.test.ts`
- 覆盖率报告
```

### 4.2 调用工作流

在对话中引用：

```
使用 @.agent/workflows/generate-tests.md 为 src/utils/ 生成测试
```

### 4.3 工作流示例

**代码审查工作流：**

```markdown
# .agent/workflows/code-review.md

## 代码审查

对最近的更改进行全面审查。

### 检查项

- [ ] 类型安全
- [ ] 错误处理
- [ ] 性能问题
- [ ] 安全漏洞
- [ ] 代码风格
- [ ] 测试覆盖

### 输出

生成审查报告，列出问题和建议。
```

**新功能工作流：**

```markdown
# .agent/workflows/new-feature.md

## 新功能开发流程

### 输入

- 功能描述
- 相关文件

### 步骤

1. 创建 implementation_plan.md
2. 等待用户审核
3. 创建必要的目录结构
4. 实现核心逻辑
5. 添加单元测试
6. 运行并验证
7. 生成 walkthrough.md

### 输出

- 功能代码
- 测试代码
- 文档
```

---

## 五、MCP 配置

Model Context Protocol (MCP) 用于集成外部工具。

### 5.1 配置文件

在项目根目录创建 `.mcp.json`：

```json
{
  "servers": {
    "figma": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-figma"],
      "env": {
        "FIGMA_API_KEY": "${FIGMA_API_KEY}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

### 5.2 常用 MCP 服务

| 服务     | 用途        |
| -------- | ----------- |
| figma    | 设计稿导入  |
| postgres | 数据库交互  |
| github   | GitHub 集成 |
| slack    | Slack 通知  |
| sentry   | 错误监控    |

### 5.3 在规则中使用 MCP

```markdown
# .agent/rules/figma-import.md

---

## activation: manual

## Figma 导入规则

使用 Figma MCP 服务：

1. 获取设计稿组件
2. 生成对应的 React 组件
3. 使用项目的设计系统
```

---

## 六、模型选择

### 6.1 默认模型配置

```json
{
  "defaultModel": "gemini-3-pro",
  "taskModels": {
    "planning": "gemini-3-pro",
    "coding": "gemini-3-pro",
    "review": "claude-sonnet-4.5",
    "testing": "gemini-3-flash"
  }
}
```

### 6.2 任务级模型指定

在提示中指定：

```
【使用 Claude Opus 4.5】
分析这个复杂的算法问题
```

### 6.3 模型选择建议

| 任务类型 | 推荐模型                   |
| -------- | -------------------------- |
| 复杂规划 | Gemini 3 Pro / Claude Opus |
| 快速编码 | Gemini 3 Flash             |
| 深度分析 | Gemini 3 Deep Think        |
| 代码审查 | Claude Sonnet              |

---

## 七、安全配置

### 7.1 敏感文件保护

```json
{
  "protectedPaths": [".env", ".env.*", "secrets/**", "*.pem", "*.key"]
}
```

### 7.2 网络限制

```json
{
  "network": {
    "allowedDomains": ["localhost", "*.google.com"],
    "blockedDomains": ["*.suspicious.com"]
  }
}
```

### 7.3 操作审计

```json
{
  "audit": {
    "enabled": true,
    "logLevel": "detailed",
    "logPath": ".agent/logs/"
  }
}
```

---

## 八、快捷键配置

```json
{
  "keybindings": {
    "openAgentManager": "Cmd+Shift+A",
    "sendPrompt": "Cmd+Enter",
    "cycleDevelopmentMode": "Shift+Tab",
    "cancelOperation": "Escape",
    "acceptSuggestion": "Cmd+."
  }
}
```

---

## 九、主题与外观

### 9.1 主题选择

```json
{
  "theme": "dark", // "light" | "dark" | "system"
  "accentColor": "blue"
}
```

### 9.2 从 VS Code 导入

首次启动时可选择导入 VS Code 配置：

- 主题
- 快捷键
- 扩展设置

---

## 十、调试与日志

### 10.1 启用详细日志

```json
{
  "debug": {
    "enabled": true,
    "verbosity": "verbose",
    "showAgentThoughts": true
  }
}
```

### 10.2 查看 Agent 思维过程

在 Agent Manager 中启用 "Show Thought Process" 选项，查看 Agent 的推理链。
