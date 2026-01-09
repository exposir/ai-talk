<!--
- [INPUT]: 依赖 notes/claude-code/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 IDE 集成 文档
- [POS]: 位于 notes/claude-code 模块的 IDE 集成 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# IDE 集成

## VS Code 扩展

### 安装

1. 打开 VS Code
2. 扩展市场搜索 "Claude Code"
3. 安装 Anthropic 官方扩展

或命令行安装：
```bash
code --install-extension anthropic.claude-code
```

### 功能

- 侧边栏 Claude 面板
- 代码选中后直接询问
- 内联代码建议
- 终端集成

### 使用

- `Cmd/Ctrl + Shift + P` → "Claude: Ask"
- 选中代码 → 右键 → "Ask Claude"
- 侧边栏直接对话

## JetBrains IDE

支持 IntelliJ IDEA、WebStorm、PyCharm 等。

### 安装

1. Settings → Plugins
2. 搜索 "Claude Code"
3. 安装并重启

### 配置

Settings → Tools → Claude Code：
- API Key 配置
- 模型选择
- 快捷键绑定

## 终端配置

### 主题

Claude Code 支持终端主题：

```bash
claude config set theme dark
```

### 行为配置

```bash
# 启用 vim 模式
/vim

# 配置通知
claude config set notifications true
```

### 多行输入

- `Shift + Enter` - 换行
- `Ctrl + Enter` - 提交（vim 模式）

### 大文本输入

对于长文本，使用管道或文件：

```bash
# 管道
cat prompt.txt | claude

# 文件参数
claude --file prompt.txt
```

## 远程开发

### SSH 远程

VS Code Remote SSH 环境下正常工作，需在远程机器安装 Claude Code。

### WSL

Windows WSL 用户需在 WSL 内安装：

```bash
# 在 WSL 中
npm install -g @anthropic-ai/claude-code
```

### Dev Containers

在 `.devcontainer/devcontainer.json` 中添加：

```json
{
  "features": {
    "ghcr.io/anthropics/claude-code:latest": {}
  }
}
```

## 故障排除

### VS Code 扩展不工作

1. 检查扩展是否启用
2. 重新加载窗口：`Cmd/Ctrl + Shift + P` → "Reload Window"
3. 检查输出面板的错误日志

### JetBrains 插件问题

1. 清除缓存：File → Invalidate Caches
2. 更新到最新版本
3. 检查 IDE 兼容性

### 终端显示异常

```bash
# 重置终端配置
claude config reset terminal

# 检查终端类型
echo $TERM
```
