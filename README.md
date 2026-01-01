# AI Talk (AI 对话学习项目)

欢迎来到 **AI Talk**
项目！这个仓库旨在帮助你学习 AI 概念，并构建一个与 AI 模型交互的聊天界面。

## 📂 目录结构 (Directory Structure)

项目目录结构概览：

- **`docs/`**: 存放你的学习笔记、研究论文和参考资料。
- **`src/`**: 源代码的主目录。
  - **`src/scripts/`**: 用于测试 API 连接或运行以此实验的简单脚本。
- **`prompts/`**: 用于保存有趣的系统提示词 (System Prompts)、用户提示词 (User
  Prompts) 以及提示词工程实验。
- **`examples/`**: 保存对话日志、示例输出或截图。
- **`.env.example`**: 环境变量的模板文件（用于安全地配置 API 密钥等）。

## 🚀 快速开始 (Getting Started)

### 前置要求

- 已安装 [Node.js](https://nodejs.org/)
- 拥有 OpenAI API Key (或其他服务商的 Key)

### 安装设置

1. **克隆仓库** (如果尚未克隆):

   ```bash
   git clone <repository-url>
   cd ai-talk
   ```

2. **安装依赖**:

   ```bash
   npm install
   ```

3. **配置环境变量**: 复制示例环境文件:
   ```bash
   cp .env.example .env
   ```
   打开 `.env` 并填入你的 API Key:
   ```env
   OPENAI_API_KEY=sk-...
   ```

## 📝 使用方法

_即将推出：关于如何运行聊天界面和脚本的说明。_

## 🗺️ 路线图 (Roadmap)

- [x] 初始化项目结构
- [ ] 实现基础聊天脚本
- [ ] 添加 Web 界面
- [ ] 探索不同的 AI 模型
