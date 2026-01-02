# 项目命名规范

统一的命名规范让项目更易读、易维护。

---

## 📁 目录命名

```
✅ 推荐：kebab-case（小写字母 + 连字符）
```

| 规则             | 示例                                    |
| ---------------- | --------------------------------------- |
| 全小写           | `claude-code/`, `ai-fundamentals/`      |
| 多词用连字符连接 | `tools-and-apis/`, `project-meta/`      |
| 避免下划线       | ❌ `project_meta/` → ✅ `project-meta/` |
| 避免驼峰         | ❌ `ClaudeCode/` → ✅ `claude-code/`    |

---

## 📄 文件命名

```
✅ 推荐：kebab-case.md（小写字母 + 连字符）
```

| 规则             | 示例                                          |
| ---------------- | --------------------------------------------- |
| 全小写           | `best-practices.md`, `getting-started.md`     |
| 多词用连字符连接 | `ai-coding-tools.md`, `slash-commands.md`     |
| 避免下划线       | ❌ `cost_analysis.md` → ✅ `cost-analysis.md` |
| 避免空格         | ❌ `cost analysis.md` → ✅ `cost-analysis.md` |
| 特殊文件保持约定 | `README.md`, `LICENSE`, `CHANGELOG.md`        |

---

## 🏗️ 项目/仓库命名

```
✅ 推荐：kebab-case（小写字母 + 连字符）
```

| 规则        | 示例                                 |
| ----------- | ------------------------------------ |
| GitHub 仓库 | `ai-talk`, `next-auth`, `vue-router` |
| npm 包名    | `@scope/package-name`                |
| 避免下划线  | ❌ `ai_talk` → ✅ `ai-talk`          |

---

## 🔤 变量/函数命名（代码）

| 语言                  | 规范                 | 示例                         |
| --------------------- | -------------------- | ---------------------------- |
| JavaScript/TypeScript | camelCase            | `getUserInfo`, `isActive`    |
| Python                | snake_case           | `get_user_info`, `is_active` |
| CSS 类名              | kebab-case           | `.nav-bar`, `.btn-primary`   |
| 常量                  | SCREAMING_SNAKE_CASE | `MAX_RETRY`, `API_BASE_URL`  |
| React 组件            | PascalCase           | `UserProfile`, `NavBar`      |

---

## 📋 当前项目待修复

以下文件命名不符合规范（使用了下划线）：

| 当前文件名                                       | 建议修改为                                       |
| ------------------------------------------------ | ------------------------------------------------ |
| `architecture/cost_analysis.md`                  | `architecture/cost-analysis.md`                  |
| `architecture/design_2025_enhanced.md`           | `architecture/design-2025-enhanced.md`           |
| `architecture/design_2025_v1.md`                 | `architecture/design-2025-v1.md`                 |
| `architecture/usage_guide.md`                    | `architecture/usage-guide.md`                    |
| `project-meta/project_analysis.md`               | `project-meta/project-analysis.md`               |
| `project-meta/project_structure_optimization.md` | `project-meta/project-structure-optimization.md` |
| `project-meta/structure_recommendations.md`      | `project-meta/structure-recommendations.md`      |

---

## 🛠️ 重命名命令

```bash
# architecture 目录
mv notes/architecture/cost_analysis.md notes/architecture/cost-analysis.md
mv notes/architecture/design_2025_enhanced.md notes/architecture/design-2025-enhanced.md
mv notes/architecture/design_2025_v1.md notes/architecture/design-2025-v1.md
mv notes/architecture/usage_guide.md notes/architecture/usage-guide.md

# project-meta 目录
mv notes/project-meta/project_analysis.md notes/project-meta/project-analysis.md
mv notes/project-meta/project_structure_optimization.md notes/project-meta/project-structure-optimization.md
mv notes/project-meta/structure_recommendations.md notes/project-meta/structure-recommendations.md
```

---

## 📚 参考

- [Google 文件命名规范](https://developers.google.com/style/filenames)
- [kebab-case vs snake_case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case)
- npm 包命名：仅允许小写字母、数字、连字符
