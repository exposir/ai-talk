<!--
- [INPUT]: 依赖 Unix 哲学, macOS 系统特性
- [OUTPUT]: 对外提供 macOS 命令行优势的深度解析
- [POS]: notes/tools-and-apis 的参考文档
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 第 0 章: 为什么要用 macOS 做 AI 开发？

> 这是一个很好的技术话题。macOS 在命令行体验上确实有一些结构性优势，主要源于其底层架构和生态系统。

对于需要频繁使用命令行的开发者来说，macOS 的"原生"体验减少了大量摩擦。以下从四个深度维度来详细解析：

## 1. 内核与血统：POSIX 标准的天然优势

这是最根本的原因。macOS 的内核 Darwin 基于 BSD
Unix，是经过认证的 POSIX 兼容系统。

### 文件系统与路径逻辑

- **macOS (Unix)**: 使用正斜杠 `/` 分隔路径（例如
  `/usr/local/bin`）。这是全球服务器（Linux）通用的标准。
- **Windows**: 历史上使用反斜杠 `\`（例如
  `C:\Windows\System32`），并且有盘符（`C:`, `D:`）的概念。

**痛苦点**：当你在 Windows 上写代码或脚本时，经常需要处理路径转义的问题。虽然现在的语言库能处理，但在跨平台脚本编写时，Windows 往往是那个“特殊情况”，需要额外的
`if (isWindows)` 代码块。

### 原生工具链（Out of the box）

macOS 预装了大量标准的 Unix 工具，如 `ssh`, `git` (通常预装或极易获取), `vim`,
`grep`, `awk`, `sed`, `tar` 等。

**场景**：想要连接服务器？Mac 直接打开终端输入 `ssh user@ip` 即可。在 Windows
10 之前，你必须下载 PuTTY 这样的第三方软件；虽然现在的 Windows
PowerShell 支持 ssh，但这种“原生感”是 Mac 这一二十年来积累下来的肌肉记忆。

## 2. 生态一致性：开发环境即生产环境

绝大多数现代互联网公司的服务器运行的是 Linux（CentOS, Ubuntu, Debian 等）。

### 环境一致性

macOS 的命令行环境与 Linux 高度相似（90% 以上的通用性）。这意味着你在 Mac 本地编写的 Shell 脚本、配置的 Nginx、运行的 Docker 命令，推送到 Linux 服务器时，几乎不需要修改就能运行。

**Windows 的断层**：在 Windows 上（即使有 WSL），你依然会感觉到文件权限（`chmod`）、行尾符（`CRLF`
vs `LF`）等微小但致命的差异带来的困扰。

## 3. 包管理的降维打击：Homebrew

如果说 Unix 内核是地基，那么 Homebrew 就是 Mac 命令行体验的皇冠。

### Homebrew vs. Windows 安装方式

- **Mac**: 想要安装 Redis？终端输入
  `brew install redis`。想安装 Chrome？`brew install --cask google-chrome`。它统一管理依赖，安装路径清晰，卸载干净。
- **Windows**: 传统的 Windows 安装软件需要下载 `.exe`
  -> 双击 -> 下一步 -> 下一步。虽然 Windows 现在有了 Winget 和 Chocolatey，但在包的数量、社区维护的活跃度以及解决依赖冲突的能力上，Homebrew 依然是统治级别的存在。

## 4. 终端体验与 Shell 的现代化

### Shell 的选择

macOS 现在默认使用 **Zsh**（配合 Oh My
Zsh 极其强大），此前是 Bash。这些是经过几十年考验的高效交互工具。

Windows 默认是 CMD（功能极弱）或 PowerShell。PowerShell 虽然强大（基于对象，而非基于文本流），但它的语法非常冗长（例如
`Get-ChildItem` vs `ls`），且与 Linux/Mac 的习惯完全不同，学习曲线陡峭。

### 终端模拟器（Terminal Emulator）

- **Mac**: 拥有
  **iTerm2**，这被认为是地表最强的终端模拟器之一（分屏、搜索、自动补全、触发器等）。
- **Windows**: 长期以来只有那个黑框框
  `conhost.exe`，体验极差。虽然微软近年来推出了非常优秀的 Windows
  Terminal，极大地缩小了差距，但 iTerm2 + Zsh 的组合依然是很多开发者的心头好。

## 客观视角：Windows 的反击 (WSL 2)

为了保持客观，必须提到 WSL 2 (Windows Subsystem for
Linux)。微软意识到了上述所有问题，于是他们并没有重写 Windows 内核，而是直接在 Windows 里塞进了一个完整的 Linux 内核。

**WSL 2 的优点**：你可以在 Windows 上运行真正的 Ubuntu。`ls`, `grep`, `apt-get`
都能用。

**依然存在的问题**：

- **割裂感**：它是“系统中的系统”。文件跨系统访问（Windows 访问 WSL 文件，或反之）虽然可行，但存在性能损耗（IO 读写慢）。
- **网络复杂性**：WSL
  2 有时会遇到 IP 地址变动、端口映射等网络配置问题，不如 Mac 的原生网络栈来得直接。

## 总结

Mac 之所以比 Windows 更适合命令行，是因为：

**Mac 是将漂亮的图形界面（GUI）无缝构建在坚固的 Unix（CLI）地基之上；而 Windows 则是试图在图形界面旁搭一个 CLI 的棚子（虽然后来把棚子升级成了豪华集装箱 WSL
2）。**

对于开发者而言，使用 Mac 意味着更少的折腾（配置环境）、更统一的逻辑（与服务器一致）以及更顺滑的工具链（Homebrew/Zsh）。
