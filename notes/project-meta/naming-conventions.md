# 项目命名规范

统一的命名规范让项目更易读、易维护。本文档覆盖前后端主流技术栈。

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

## �️ 数据库

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

## 参考资料

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [PEP 8 - Python Style Guide](https://peps.python.org/pep-0008/)
- [BEM Naming Convention](https://getbem.com/naming/)
- [Google 文件命名规范](https://developers.google.com/style/filenames)
