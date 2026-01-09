<!--
- [INPUT]: 依赖 notes/project-meta/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 项目命名规范 文档
- [POS]: 位于 notes/project-meta 模块的 项目命名规范 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 项目命名规范

统一的命名规范让项目更易读、易维护。本文档覆盖前后端主流技术栈。

## 📝 核心原则

> [!NOTE] **默认使用 `kebab-case`（连字符）**，除非特定语言/框架有其他约定。
>
> - Web 项目、文档、URL、Git 仓库 → 使用 `-`
> - Python、数据库、环境变量 → 使用 `_`
> - 遵循目标平台的规范，而非一刀切

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

### 常见目录结构

```
src/
├── components/          # React/Vue 组件
├── pages/              # 页面组件
├── hooks/              # React Hooks
├── utils/              # 工具函数
├── services/           # API 服务
├── styles/             # 样式文件
├── types/              # TypeScript 类型
├── assets/             # 静态资源
│   ├── images/
│   ├── fonts/
│   └── icons/
└── lib/                # 第三方库封装
```

---

## 📄 文件命名

### 通用规则

```
✅ 推荐：kebab-case（小写字母 + 连字符）
```

| 规则             | 示例                                          |
| ---------------- | --------------------------------------------- |
| 全小写           | `best-practices.md`, `getting-started.md`     |
| 多词用连字符连接 | `ai-coding-tools.md`, `slash-commands.md`     |
| 避免下划线       | ❌ `cost_analysis.md` → ✅ `cost-analysis.md` |
| 避免空格         | ❌ `cost analysis.md` → ✅ `cost-analysis.md` |
| 特殊文件保持约定 | `README.md`, `LICENSE`, `CHANGELOG.md`        |

---

## 🟦 TypeScript / JavaScript

### 文件命名

| 类型        | 命名规范                     | 示例                                 |
| ----------- | ---------------------------- | ------------------------------------ |
| 普通模块    | kebab-case                   | `user-service.ts`, `api-client.ts`   |
| React 组件  | PascalCase                   | `UserProfile.tsx`, `NavBar.tsx`      |
| React Hooks | camelCase + use 前缀         | `useAuth.ts`, `useFetch.ts`          |
| 工具函数    | kebab-case                   | `date-utils.ts`, `string-helpers.ts` |
| 常量文件    | kebab-case                   | `constants.ts`, `config.ts`          |
| 类型定义    | kebab-case 或 PascalCase     | `types.ts`, `User.types.ts`          |
| 测试文件    | 原文件名 + `.test` / `.spec` | `user-service.test.ts`               |
| 故事文件    | 组件名 + `.stories`          | `Button.stories.tsx`                 |

### 变量 / 函数命名

| 类型       | 规范                    | 示例                                   |
| ---------- | ----------------------- | -------------------------------------- |
| 变量       | camelCase               | `userName`, `isLoading`, `itemCount`   |
| 函数       | camelCase               | `getUserInfo()`, `handleClick()`       |
| 常量       | SCREAMING_SNAKE_CASE    | `MAX_RETRY`, `API_BASE_URL`            |
| 布尔值     | is/has/can/should 前缀  | `isActive`, `hasPermission`, `canEdit` |
| 私有属性   | \_ 前缀（已不推荐）或 # | `#privateField`                        |
| 事件处理器 | handle/on 前缀          | `handleSubmit`, `onClick`              |
| 异步函数   | 动词开头                | `fetchUser()`, `loadData()`            |

### 类 / 接口 / 类型命名

| 类型     | 规范                               | 示例                        |
| -------- | ---------------------------------- | --------------------------- |
| 类       | PascalCase                         | `UserService`, `HttpClient` |
| 接口     | PascalCase（不加 I 前缀）          | `User`, `ApiResponse`       |
| 类型别名 | PascalCase                         | `UserId`, `RequestConfig`   |
| 枚举     | PascalCase                         | `UserStatus`, `HttpMethod`  |
| 枚举成员 | SCREAMING_SNAKE_CASE 或 PascalCase | `PENDING`, `Active`         |
| 泛型参数 | 单字母大写或描述性名称             | `T`, `TData`, `TResponse`   |

### 文件示例

```typescript
// ✅ user-service.ts
export class UserService {
  private readonly API_BASE_URL = '/api/users';

  async fetchUserById(userId: string): Promise<User> {
    // ...
  }
}

// ✅ useAuth.ts
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // ...
}

// ✅ UserProfile.tsx
export function UserProfile({ userId }: UserProfileProps) {
  // ...
}
```

---

## ⚛️ React / Vue 组件

### 文件命名

| 框架             | 规范                     | 示例                              |
| ---------------- | ------------------------ | --------------------------------- |
| React 组件       | PascalCase               | `UserCard.tsx`, `LoginForm.tsx`   |
| React 页面       | PascalCase 或 kebab-case | `HomePage.tsx` 或 `home-page.tsx` |
| Vue 组件         | PascalCase               | `UserCard.vue`, `NavBar.vue`      |
| Vue 页面（Nuxt） | kebab-case               | `user-profile.vue`, `index.vue`   |

### 组件命名规范

```tsx
// ✅ 好的组件命名
<UserProfile />
<NavigationBar />
<SubmitButton />
<ProductListItem />

// ❌ 避免的命名
<User />           // 太模糊
<Btn />            // 缩写不清晰
<MyComponent />    // 无意义前缀
```

### Props 命名

| 类型       | 规范            | 示例                              |
| ---------- | --------------- | --------------------------------- |
| 普通 Props | camelCase       | `userName`, `itemCount`           |
| 事件回调   | on + 事件名     | `onClick`, `onSubmit`, `onChange` |
| 布尔 Props | is/has/can 前缀 | `isDisabled`, `hasError`          |
| 渲染函数   | render 前缀     | `renderHeader`, `renderItem`      |

---

## 🎨 CSS / SCSS / Less

### 文件命名

| 类型        | 规范                   | 示例                                  |
| ----------- | ---------------------- | ------------------------------------- |
| 全局样式    | kebab-case             | `global.css`, `variables.scss`        |
| 组件样式    | 与组件同名             | `UserCard.module.css`, `nav-bar.scss` |
| CSS Modules | kebab-case + `.module` | `button.module.css`                   |
| 工具类      | kebab-case             | `utilities.css`, `mixins.scss`        |
| 变量文件    | \_ 前缀（SCSS 约定）   | `_variables.scss`, `_mixins.scss`     |

### 类名命名

推荐使用 **BEM** (Block Element Modifier) 命名法：

```css
/* Block */
.card {
}

/* Element（用 __ 连接） */
.card__header {
}
.card__body {
}
.card__footer {
}

/* Modifier（用 -- 连接） */
.card--featured {
}
.card--disabled {
}
.card__header--large {
}
```

### 其他命名规范

| 类型       | 规范                 | 示例                                      |
| ---------- | -------------------- | ----------------------------------------- |
| 类名       | kebab-case           | `.nav-bar`, `.btn-primary`                |
| ID         | kebab-case           | `#main-content`, `#user-form`             |
| CSS 变量   | kebab-case + -- 前缀 | `--primary-color`, `--font-size-lg`       |
| SCSS 变量  | kebab-case + $ 前缀  | `$primary-color`, `$spacing-unit`         |
| SCSS Mixin | kebab-case           | `@mixin flex-center`, `@mixin responsive` |

### 示例

```scss
// _variables.scss
$primary-color: #3b82f6;
$font-size-base: 16px;
$spacing-unit: 8px;

// button.module.scss
.button {
  padding: $spacing-unit * 2;

  &--primary {
    background: $primary-color;
  }

  &--large {
    font-size: $font-size-base * 1.25;
  }

  &__icon {
    margin-right: $spacing-unit;
  }
}
```

---

## 🐍 Python

> [!IMPORTANT] Python 使用 `snake_case`（下划线），这是 PEP 8 规范要求。连字符
> `-` 在 Python 中是非法的模块名。

### 文件命名

| 类型       | 规范        | 示例                                |
| ---------- | ----------- | ----------------------------------- |
| 模块       | snake_case  | `user_service.py`, `data_utils.py`  |
| 包（目录） | snake_case  | `data_processing/`, `api_handlers/` |
| 测试文件   | test\_ 前缀 | `test_user_service.py`              |

### 变量 / 函数命名

| 类型     | 规范                 | 示例                                   |
| -------- | -------------------- | -------------------------------------- |
| 变量     | snake_case           | `user_name`, `is_active`               |
| 函数     | snake_case           | `get_user_info()`, `calculate_total()` |
| 常量     | SCREAMING_SNAKE_CASE | `MAX_CONNECTIONS`, `API_KEY`           |
| 类       | PascalCase           | `UserService`, `DataProcessor`         |
| 私有属性 | \_ 前缀              | `_private_method()`, `_internal_state` |
| 魔术方法 | \_\_ 前后缀          | `__init__`, `__str__`                  |

---

## 🗄️ 数据库

> [!IMPORTANT] 数据库使用
> `snake_case`（下划线），因为 SQL 中连字符需要引号包裹，操作不便。

### 表命名

| 规范                 | 示例                                       |
| -------------------- | ------------------------------------------ |
| snake_case，复数形式 | `users`, `order_items`, `user_permissions` |
| 关联表用 \_ 连接     | `user_roles`, `product_categories`         |

### 字段命名

| 类型     | 规范            | 示例                       |
| -------- | --------------- | -------------------------- |
| 普通字段 | snake_case      | `first_name`, `created_at` |
| 主键     | `id`            | `id`                       |
| 外键     | 表名单数 + \_id | `user_id`, `order_id`      |
| 布尔字段 | is\_ 前缀       | `is_active`, `is_deleted`  |
| 时间戳   | \_at 后缀       | `created_at`, `updated_at` |

---

## 🌐 API 路由

### REST API

```
✅ 推荐：kebab-case，复数名词
```

| 方法   | 路由                    | 描述         |
| ------ | ----------------------- | ------------ |
| GET    | `/api/users`            | 获取用户列表 |
| GET    | `/api/users/:id`        | 获取单个用户 |
| POST   | `/api/users`            | 创建用户     |
| PUT    | `/api/users/:id`        | 更新用户     |
| DELETE | `/api/users/:id`        | 删除用户     |
| GET    | `/api/user-profiles`    | 多词用连字符 |
| GET    | `/api/orders/:id/items` | 嵌套资源     |

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

## ❓ 附录：常见问题

### 为什么推荐连字符 `-` 而不是下划线 `_`？

#### 1. URL 友好性

连字符在 URL 中是标准的单词分隔符，无需编码：

```
✅ https://example.com/ai-models/getting-started
❌ https://example.com/ai_models/getting_started  # 下划线在链接中可能被遮挡
❌ https://example.com/ai%20models/getting%20started  # 空格需要编码
```

#### 2. SEO 优化

搜索引擎对分隔符的处理方式不同：

| 分隔符     | 搜索引擎解析       | 示例                                 |
| ---------- | ------------------ | ------------------------------------ |
| 连字符 `-` | 视为**单词分隔符** | `ai-models` → "ai" + "models" 两个词 |
| 下划线 `_` | 视为**连接符**     | `ai_models` → "ai_models" 一个词     |

> [!TIP] Google 官方建议在 URL 中使用连字符而非下划线。参见
> [Google URL 结构指南](https://developers.google.com/search/docs/crawling-indexing/url-structure)。

#### 3. 可读性与可访问性

```
✅ project-documentation  # 连字符作为视觉分隔，最自然
⚠️ project_documentation  # 下划线在链接装饰下可能被遮挡
❌ projectDocumentation   # 驼峰大小写敏感，URL 中易出错
```

#### 4. 跨平台兼容性

- ✅ 所有操作系统（Windows/macOS/Linux）都支持连字符
- ✅ 终端命令行中无需转义
- ✅ 不与编程语言保留字符冲突

#### 5. 生态系统约定

| 平台/生态   | 约定       | 示例                         |
| ----------- | ---------- | ---------------------------- |
| GitHub 仓库 | kebab-case | `vue-router`, `next-auth`    |
| npm 包名    | kebab-case | `react-dom`, `lodash-es`     |
| 文档站点    | kebab-case | VitePress, Docusaurus        |
| Docker 镜像 | kebab-case | `node:alpine`, `postgres-15` |

---

### 哪些场景必须使用下划线？

下划线在以下场景是**首选或必须**的：

| 场景             | 原因                       | 示例                             |
| ---------------- | -------------------------- | -------------------------------- |
| Python 模块/变量 | PEP 8 规范，`-` 是非法字符 | `user_service.py`                |
| 环境变量         | 行业标准                   | `DATABASE_URL`, `API_KEY`        |
| 数据库表/字段    | SQL 中 `-` 需要引号        | `user_profiles`, `created_at`    |
| Sass 私有文件    | 框架约定，表示 partial     | `_variables.scss`                |
| Python 包初始化  | 语言要求                   | `__init__.py`                    |
| BEM CSS 类名     | 命名法规范                 | `.card__header`, `.btn--primary` |
| 某些测试框架     | 框架约定                   | `test_user_login.py`             |
| Next.js 私有目录 | 框架约定，不生成路由       | `_components/`                   |

---

### 📊 分隔符速查表

| 场景                  | 推荐分隔符             | 备注        |
| --------------------- | ---------------------- | ----------- |
| **URL / 文件路径**    | `kebab-case`           | SEO、可读性 |
| **Git 仓库 / npm 包** | `kebab-case`           | 生态约定    |
| **Markdown 文档**     | `kebab-case`           | URL 友好    |
| **Python 模块**       | `snake_case`           | PEP 8 规范  |
| **环境变量**          | `SCREAMING_SNAKE_CASE` | 行业标准    |
| **数据库**            | `snake_case`           | SQL 兼容性  |
| **JavaScript 变量**   | `camelCase`            | 语言惯例    |
| **React/Vue 组件**    | `PascalCase`           | 框架约定    |
| **CSS 类名**          | `kebab-case` 或 BEM    | 可读性      |

---

## 📚 参考资料

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [PEP 8 - Python Style Guide](https://peps.python.org/pep-0008/)
- [BEM Naming Convention](https://getbem.com/naming/)
- [Google 文件命名规范](https://developers.google.com/style/filenames)
- [Google URL 结构指南](https://developers.google.com/search/docs/crawling-indexing/url-structure)
