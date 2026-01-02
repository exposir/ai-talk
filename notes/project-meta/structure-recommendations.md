# 目录结构调整建议

## 核心原则

1. **不要过度设计** - 目录结构应该跟着内容走，不是先建空架子
2. **扁平优于嵌套** - 文件少的时候不需要太多层级
3. **删除空目录** - 空目录只会制造困惑

## 当前结构

```
ai-talk/
├── .env.example
├── .gitignore
├── .prettierrc
├── package.json
├── README.md
├── docs/
│   ├── project_analysis.md
│   └── architecture/
│       ├── cost_analysis.md
│       ├── design_2025_enhanced.md
│       ├── design_2025_v1.md
│       ├── evaluation.md
│       └── usage_guide.md
├── examples/        # 空目录
├── prompts/         # 空目录
└── src/
    └── scripts/     # 空目录
```

## 推荐结构

```
ai-talk/
├── README.md
├── docs/
│   ├── architecture/          # 保持现有，核心内容
│   │   ├── design_2025_v1.md
│   │   ├── design_2025_enhanced.md
│   │   ├── usage_guide.md
│   │   ├── cost_analysis.md
│   │   └── evaluation.md
│   └── notes/                 # 学习笔记、分析等杂项
│       └── project_analysis.md
├── prompts/                   # 有内容再保留，否则删除
├── examples/                  # 有内容再保留，否则删除
├── .gitignore
├── .prettierrc
└── package.json
```

## 具体调整操作

| 操作 | 原因 |
|------|------|
| 删除 `src/` | 这是文档项目，不是代码项目，`src/` 没有意义 |
| 删除空的 `prompts/` `examples/` | 空目录没有价值，等有内容再创建 |
| 移动 `project_analysis.md` | 放到 `docs/notes/` 或直接放 `docs/` 下 |
| 保留 `package.json` | 用于 Prettier 格式化，有实际用途 |
| 删除 `.env.example` | 纯文档项目不需要环境变量 |

## 执行命令

```bash
# 1. 删除空目录和不需要的文件
rm -rf src/
rm -rf prompts/
rm -rf examples/
rm .env.example

# 2. 创建 notes 目录并移动文件
mkdir -p docs/notes
mv docs/project_analysis.md docs/notes/
```

## 为什么这样设计

- 现在核心内容就是 `docs/architecture/` 下的 5 个文件
- 结构应该**反映现实**，而不是**规划未来**
- 等真正有提示词、示例时，再加目录也不迟
- 保持简单，降低维护成本
