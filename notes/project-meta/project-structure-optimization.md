<!--
- [INPUT]: 依赖 notes/project-meta/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 文档项目结构优化分析 文档
- [POS]: 位于 notes/project-meta 模块的 文档项目结构优化分析 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 文档项目结构优化分析

收到，既然这是一个文档为主的项目（知识库或教程），之前的代码工程化建议就不完全适用了。以下是针对**文档型项目**的优化建议，旨在提高内容的可读性、可维护性和扩展性。

## 优化核心理念

1.  **内容层级清晰**：让读者和维护者都能快速找到所需信息。
2.  **资产管理有序**：图片、附件等资源统一管理。
3.  **易于发布/预览**：为将来可能的静态网站生成（如 VitePress, GitBook,
    Obsidian）做准备。

## 目录结构建议

### 1. 扁平化 vs 层级化

目前 `docs/` 下已有 `architecture`，建议确立**一级分类**。

- 建议将根目录下的 `prompts` 和 `examples` 统一收纳进
  `docs`，或者保持在根目录但作为独立板块。
- 如果是知识库，建议按“主题”分文件夹；如果是教程，建议按“章节”分文件夹。

### 2. 统一资源管理 (`assets`)

文档中肯定会包含图片或图表。

- ❌ 避免图片散落在各个文档同级目录下。
- ✅ 建议创建 `docs/assets` 或 `images` 目录，并按章节子目录存放。

### 3. 根目录清理

保持根目录由“元数据”组成。

- `README.md`: 项目的总入口、简介、导航图。
- `LICENSE`: 版权说明。
- `package.json`: 即使不是 App，也可以保留，用于安装文档工具（如 prettier,
  markdownlint）或静态站点生成器。

## 建议的结构树

```text
ai-talk/
├── README.md               # 项目主页/目录索引
├── docs/                   # 核心文档内容
│   ├── index.md            # 文档首页 (可选，用于生成器)
│   ├── guide/              # 指南/教程类
│   │   ├── intro.md
│   │   └── usage.md
│   ├── architecture/       # 架构/原理类
│   │   └── analysis.md
│   ├── prompts/            # 提示词库 (原根目录 prompts)
│   │   └── ...
│   └── examples/           # 示例/Demo (原根目录 examples)
│       └── ...
├── assets/                 # 静态资源 (图片、PDF)
│   └── architecture/       # 按模块分类的资源
├── .gitignore              # 忽略系统文件
└── package.json            # (可选) 用于管理 lint 工具或文档生成脚本
```

## 进阶建议：文档即网站

如果未来希望别人能以网页形式阅读，而不是直接看 Markdown 源码，建议引入轻量级静态生成器：

- **VitePress / VuePress**: 适合技术文档，配置简单。
- **Docusaurus**: Facebook 出品，功能强大。
- **Obsidian**: 如果是个人知识库，保持当前纯 Markdown 结构即可，配合 Obsidian 使用体验极佳。

## 当前行动计划

1.  **归档整理**: 将散落在根目录的内容性文件（如 `prompts`, `examples`）移动到
    `docs/` 下的对应分类中，或在 `README` 中建立清晰的链接索引。
2.  **建立索引**: 完善 `README.md`，使其成为整个知识库的地图。
