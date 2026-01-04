# 项目规范与最佳实践

本项目为文档型知识库，规范以可执行、可维护为目标。以下内容作为长期
约定，新增或改动文档时需遵守。

## 1. 命名与目录

- 目录与 Markdown 文件使用 `kebab-case`。
- 目录入口统一使用 `README.md`（大写），作为 GitHub 可读入口。
- `README.md` 是唯一允许的大写文件名；其余文件保持小写与短横线。

## 2. VitePress 路由规范

- VitePress `srcDir` 固定指向 `notes/`，页面均从该目录生成。
- 目录入口使用 `README.md` 时，导航与侧边栏链接写成 `/dir/README`。
- 如需支持目录根路径 `/dir/`，可新增轻量 `index.md` 跳转页，或
  配置 `rewrites` 进行映射。

## 3. 索引与链接维护

- 新增或重命名文档必须同步更新 `notes/guide/index.md` 与 `README.md`。
- 重要入口页（`README.md`）应在 `notes/guide/index.md` 中有清晰链接。

## 4. Markdown 与排版

- Markdown 按 80 字符换行，遵循 `.prettierrc`。
- 代码块必须标注语言，标题层级清晰。

## 5. 内容与结构范围

- 本仓库是文档项目，避免新增应用代码或运行时配置文件。
- 结构应保持与 `AGENTS.md` 一致：文档主内容在 `notes/`。
