# ECMA-262 第 16 版 (2025) 规范目录

> ECMA-262 是 JavaScript 语言的官方标准规范。第 16 版于 2025 年 6 月发布，涵盖了从底层算法约定到高层内置对象的所有定义。
>
> [PDF 下载](https://ecma-international.org/wp-content/uploads/ECMA-262_16th_edition_june_2025.pdf)

---

## 一、规范基础与约定 (Chapters 1-5)

### 1. Scope (范围)

> **This Standard defines the ECMAScript general-purpose programming language.**
>
> 本标准定义了 ECMAScript 通用编程语言。

#### 核心要点

- **标准性质**：ECMA-262 是 ECMAScript 语言的**唯一权威规范**
- **语言定位**：定义了一种**通用编程语言** (general-purpose programming
  language)
- **适用范围**：
  - 语言的语法 (Syntax)
  - 语义 (Semantics)
  - 类型系统 (Type System)
  - 内置对象 (Built-in Objects)
  - 运行时行为 (Runtime Behavior)

#### 不在范围内

| 领域       | 说明                   | 相关标准            |
| ---------- | ---------------------- | ------------------- |
| 浏览器 DOM | Web API 和 DOM 操作    | WHATWG DOM Standard |
| 国际化     | 语言/地区适配          | ECMA-402 (Intl API) |
| 模块加载   | 具体的模块解析策略     | 宿主环境定义        |
| Web API    | fetch, localStorage 等 | WHATWG/W3C 标准     |

### 2. Conformance (符合性)

> 符合性定义了 ECMAScript 实现**必须满足的要求**。

#### 符合性实现必须 (MUST)

1. **完整支持规范内容**
   - 提供并支持本规范描述的所有类型、值、对象、属性、函数、程序语法和语义

2. **遵循 Unicode 标准**
   - 按照最新版本的 **Unicode Standard** 和 **ISO/IEC 10646** 解释源代码文本

3. **国际化 API 兼容**
   - 如果提供需要适配不同语言/文化习俗的 API，必须实现与本规范兼容的最新版
     **ECMA-402** (Intl API)

4. **禁止违规扩展**
   - 不得实现 **17.1 Forbidden Extensions** 中列出的任何禁止扩展

5. **不得重定义**
   - 不得重定义任何非 `implementation-defined`、`implementation-approximated` 或
     `host-defined` 的功能

#### 符合性实现可以 (MAY)

| 允许行为           | 说明                                                   |
| ------------------ | ------------------------------------------------------ |
| 扩展类型/对象/属性 | 可以提供规范未描述的**额外**类型、值、对象、属性和函数 |
| 扩展语法           | 可以支持规范未描述的程序和正则表达式语法               |
| 使用保留字         | 可以支持使用 **12.7.2** 中列出的"未来保留字"的程序语法 |

#### 规范性可选 (Normative Optional)

```
┌─────────────────────────────────────────────────────────────┐
│  Normative Optional                                         │
│  规范性可选条款可以选择实现或不实现，除非另有说明。         │
│  Web 浏览器通常需要实现所有规范性可选条款。(见 Annex B)     │
│  如果实现了任何规范性可选行为，必须实现该条款的全部内容。   │
└─────────────────────────────────────────────────────────────┘
```

#### 术语说明

| 术语                          | 含义                                          |
| ----------------------------- | --------------------------------------------- |
| `implementation-defined`      | 实现定义：由具体实现决定，但必须文档化        |
| `implementation-approximated` | 实现近似：允许实现决定精确行为                |
| `host-defined`                | 宿主定义：由宿主环境（如浏览器、Node.js）决定 |

### 3. Normative References (规范性引用)

> 以下引用文档对于本规范的应用是**不可或缺的**。

#### 必需的外部标准

| 标准                 | 说明                                                | 链接                                                                                          |
| -------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **IEEE 754-2019**    | IEEE 浮点数算术标准，定义了 `Number` 类型的底层表示 | [IEEE 754](https://ieeexplore.ieee.org/document/8766229)                                      |
| **Unicode Standard** | 最新版 Unicode 标准，定义字符编码和文本处理         | [unicode.org/versions/latest](https://unicode.org/versions/latest)                            |
| **ISO/IEC 10646**    | 通用多八位编码字符集 (UCS)，与 Unicode 保持同步     | ISO 标准                                                                                      |
| **ECMA-402**         | ECMAScript 国际化 API 规范 (`Intl` 对象)            | [ECMA-402](https://www.ecma-international.org/publications-and-standards/standards/ecma-402/) |
| **ECMA-404**         | JSON 数据交换格式                                   | [ECMA-404](https://www.ecma-international.org/publications-and-standards/standards/ecma-404/) |

#### 版本说明

- **有日期引用**：仅适用引用的特定版本
- **无日期引用**：适用被引用文档的最新版本（包括所有修订和勘误）

```
┌──────────────────────────────────────────────────────────────┐
│  ECMAScript 语言规范的底层依赖关系                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ECMA-262 (ECMAScript)                                      │
│       │                                                      │
│       ├── IEEE 754-2019 ──→ Number 类型的浮点数运算          │
│       ├── Unicode ────────→ 字符串处理、标识符规则           │
│       ├── ISO/IEC 10646 ──→ 字符编码                         │
│       ├── ECMA-402 ───────→ Intl 国际化 API                  │
│       └── ECMA-404 ───────→ JSON 格式定义                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4. Overview (概述)

> 本节包含 ECMAScript 语言的**非规范性概述**。

#### 4.1 Web Scripting

ECMAScript 最初被设计为 **Web 脚本语言**，用于：

| 环境                | 功能                                           |
| ------------------- | ---------------------------------------------- |
| **浏览器 (客户端)** | 操作 DOM、响应用户事件、处理表单、动态更新页面 |
| **服务器端**        | 处理请求、访问文件系统、管理数据               |

#### 4.2 Hosts and Implementations

```
┌─────────────────────────────────────────────────────────────┐
│                    ECMAScript 生态层次                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Host Environment (宿主环境)                         │   │
│  │  例: 浏览器 (Chrome, Firefox), Node.js, Deno        │   │
│  │                                                      │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │  Implementation (实现)                         │  │   │
│  │  │  例: V8, SpiderMonkey, JavaScriptCore         │  │   │
│  │  │                                                │  │   │
│  │  │  ┌─────────────────────────────────────────┐  │  │   │
│  │  │  │  ECMA-262 Core Specification            │  │  │   │
│  │  │  │  (语言核心规范)                          │  │  │   │
│  │  │  └─────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 术语                 | 定义                                                               |
| -------------------- | ------------------------------------------------------------------ |
| **Host (宿主)**      | 定义 Annex D 中列出的 host-defined 功能的外部规范 (如 WHATWG HTML) |
| **Host Hook**        | 由宿主定义的抽象操作，必须返回正常完成或抛出完成                   |
| **Host Environment** | 宿主定义的所有功能的具体选择，提供 I/O 等能力                      |
| **Implementation**   | 具体的实现产物 (如 V8 引擎)                                        |

#### 4.3 ECMAScript Overview

**类 Java 语法**：ECMAScript 的语法刻意模仿了 Java，但更为宽松，使得它易于作为脚本语言使用（例如变量无需类型声明）。

##### 4.3.1 Objects (对象)

ECMAScript 是**基于原型**的，而非基于类的语言：

```javascript
// 原型链示意
function CF() {} // 构造函数
CF.prototype.CFP1 = 1; // 原型属性

const cf1 = new CF();
cf1.q1 = 'a'; // 实例属性

// cf1 → CF.prototype → Object.prototype → null
```

**核心特性**：

- **对象本质**：对象是**属性的集合**，每个属性有决定其行为的特性 (attributes)。
- **动态性**：属性可以动态添加/删除。
- **继承机制**：通过原型链实现继承和共享属性。
- **原始值**：`Undefined`, `Null`, `Boolean`, `Number`, `BigInt`, `String`,
  `Symbol`。
- **内置生态**：定义了大量内置对象（如 `Math`, `JSON`, `Map`）和运算符。

##### 4.3.2 The Strict Variant (严格模式)

```javascript
'use strict'; // 启用严格模式
```

| 特性                  | 非严格模式        | 严格模式          |
| --------------------- | ----------------- | ----------------- |
| 未声明变量赋值        | 创建全局变量      | ❌ ReferenceError |
| `this` 在函数中       | `window`/`global` | `undefined`       |
| `delete` 不可删除属性 | 静默失败          | ❌ TypeError      |
| 重复参数名            | 允许              | ❌ SyntaxError    |
| `with` 语句           | 允许              | ❌ SyntaxError    |
| `eval` 创建变量       | 泄漏到外部        | 仅在 eval 内部    |

#### 4.4 Terms and Definitions (术语与定义)

规范定义了 **42 个核心术语** (4.4.1 -
4.4.42)，明确了语言的词汇表。为了完整性，以下列出所有术语及其精简定义：

| 序号 | 术语 (Terms)                    | 定义 (Definitions)                                               |
| :--- | :------------------------------ | :--------------------------------------------------------------- | --- |
| 1    | **implementation-approximated** | 实现近似：由外部定义但有理想化建议的功能                         |
| 2    | **implementation-defined**      | 实现定义：由具体实现决定细节，但必须文档化                       |
| 3    | **host-defined**                | 宿主定义：由宿主环境（如浏览器）决定                             |
| 4    | **type**                        | 数据值的集合 (见第 6 章)                                         |
| 5    | **primitive value**             | 原始值：Undefined, Null, Boolean, Number, BigInt, Symbol, String |
| 6    | **object**                      | 对象：属性的集合，具有单一原型                                   |
| 7    | **constructor**                 | 构造器：用于创建和初始化对象的函数对象                           |
| 8    | **prototype**                   | 原型：为其他对象提供共享属性的对象                               |
| 9    | **ordinary object**             | 普通对象：拥有所有默认内部方法行为的对象                         |
| 10   | **exotic object**               | 异质对象：某些内部方法行为与默认不同的对象 (如 Array, Proxy)     |
| 11   | **standard object**             | 标准对象：本规范定义了其语义的对象                               |
| 12   | **built-in object**             | 内置对象：实现提供的、程序开始前就存在的对象                     |
| 13   | **undefined value**             | 当变量未被赋值时使用的值                                         |
| 14   | **Undefined type**              | 只有一个值 `undefined` 的类型                                    |
| 15   | **null value**                  | 代表有意缺失任何对象值的值                                       |
| 16   | **Null type**                   | 只有一个值 `null` 的类型                                         |
| 17   | **Boolean value**               | `true` 或 `false`                                                |
| 18   | **Boolean type**                | 包含 `true` 和 `false` 的类型                                    |
| 19   | **Boolean object**              | 封装 Boolean 值的对象                                            |
| 20   | **String value**                | 零个或多个 16 位无符号整数值的有限有序序列                       |
| 21   | **String type**                 | 所有 String 值的集合                                             |
| 22   | **String object**               | 封装 String 值的对象                                             |
| 23   | **Number value**                | IEEE 754-2019 双精度浮点数                                       |
| 24   | **Number type**                 | 所有 Number 值的集合 (含 NaN, Infinity)                          |
| 25   | **Number object**               | 封装 Number 值的对象                                             |
| 26   | **Infinity**                    | 代表无穷大的 Number 值                                           |
| 27   | **NaN**                         | Not-a-Number (非数字) 的 Number 值                               |
| 28   | **BigInt value**                | 任意精度的整数                                                   |
| 29   | **BigInt type**                 | 所有 BigInt 值的集合                                             |
| 30   | **BigInt object**               | 封装 BigInt 值的对象                                             |
| 31   | **Symbol value**                | 唯一的、非字符串的 Object 属性键                                 |
| 32   | **Symbol type**                 | 所有 Symbol 值的集合                                             |
| 33   | **Symbol object**               | 封装 Symbol 值的对象                                             |
| 34   | **function**                    | 函数：可以作为子程序调用的对象                                   |
| 35   | **built-in function**           | 内置函数：由实现提供的函数                                       |
| 36   | **built-in constructor**        | 内置构造器：由实现提供的构造器                                   |
| 37   | **property**                    | 属性：键与值及属性特性 (attribute) 的关联                        |
| 38   | **method**                      | 方法：作为属性值的函数                                           |
| 39   | **built-in method**             | 内置方法：作为内置对象属性的内置函数                             |
| 40   | **attribute**                   | 特性：定义属性状态的内部值 (如 Writable)                         |
| 41   | **own property**                | 自有属性：直接包含在对象自身的属性                               |
| 42   | **inherited property**          | 继承属性：对象自身没有，涵盖原型链上的属性                       |     |

#### 4.5 Organization of This Specification (规范组织结构)

本规范的章节安排逻辑如下：

- **1-5 章 (基础)**：定义范围、一致性、引用标准、概述及记号约定。
- **6-9 章 (核心运行时)**：定义数据类型、抽象操作（类型转换等）、执行上下文、环境记录等底层机制。
- **10-15 章 (语言语法)**：从词法分析到表达式、语句，再到函数、类和模块的完整语法与语义定义。
- **16-28 章 (标准库)**：详细定义所有内置对象（Global, Map, Promise,
  Proxy 等）。
- **附录**：提供文法汇总、Web 浏览器兼容性扩展及历史修正信息。

### 5. Notational Conventions (记号约定)

#### 5.1 Syntactic and Lexical Grammars (语法与词法文法)

本规范使用 **上下文无关文法 (Context-Free Grammars)** 来定义语言结构。

- **Lexical Grammar (词法文法)**：定义如何将源文本转换为 **Tokens
  (输入元素)**。使用 `::` 作为产生式符号。
- **RegExp Grammar (正则文法)**：定义正则表达式模式的结构。也使用 `::`。
- **Numeric String Grammar
  (数字字符串文法)**：定义如何将 String 转换为 Numeric 值。使用 `:::`。
- **Syntactic Grammar (句法文法)**：定义 Tokens 如何组成句法结构（如 Statements,
  Expressions）。使用 `:`。

**文法符号说明**：

| 符号        | 含义             | 示例                                                      |
| :---------- | :--------------- | :-------------------------------------------------------- |
| **opt**     | 可选符号         | `VariableDeclaration : BindingIdentifier Initializer opt` |
| **[empty]** | 空产生式         | 表示此处不匹配任何终结符                                  |
| **{ }**     | 限制性子句       | `[no LineTerminator here]`                                |
| **one of**  | 从集合中选择一个 | `DecimalDigit :: one of 0 1 2 ... 9`                      |
| **but not** | 排除特定项       | `Identifier :: IdentifierName but not ReservedWord`       |

#### 5.2 Algorithm Conventions (算法约定)

规范使用算法步骤来描述语义。

- **Abstract Operations (抽象操作)**：规范内部定义的辅助函数（如 `ToNumber`,
  `GetValue`），非语言暴露接口。
- **Runtime Semantics (运行语义)**：代码执行时的行为（如 `Evaluation`）。
- **Static Semantics (静态语义)**：编译期检查（如 `Early Errors`,
  `VarDeclaredNames`）。

##### 5.2.3 Completion Records (完成记录)

用于表示控制流（如 return, break, throw）的内部数据结构：

| 字段         | 含义                                             |
| :----------- | :----------------------------------------------- |
| `[[Type]]`   | `normal`, `return`, `throw`, `break`, `continue` |
| `[[Value]]`  | 返回值或错误对象                                 |
| `[[Target]]` | 跳转的目标标签 (label)                           |

**简写符号**：

- **`? Operation()`**：相当于
  `ReturnIfAbrupt(Operation())`。如果操作抛出异常，则直接返回该异常（传播错误）。
- **`! Operation()`**：断言该操作永远不会返回异常（abrupt completion）。

---

## 二、核心数据类型与抽象操作 (Chapters 6-9)

### 6. ECMAScript Data Types and Values (数据类型与值)

- **6.1 语言类型**：`Undefined`, `Null`, `Boolean`, `String`, `Symbol`,
  `Numeric` (Number/BigInt), `Object`
- **6.2 规范类型**：`List`, `Record`, `Completion Record`, `Reference Record`,
  `Property Descriptor`, `Data Blocks`

### 7. Abstract Operations (抽象操作/内部算法)

| 类别               | 操作                                                              |
| ------------------ | ----------------------------------------------------------------- |
| **7.1 类型转换**   | `ToPrimitive`, `ToBoolean`, `ToNumber`, `ToString`, `ToObject` 等 |
| **7.2 测试与比较** | `IsCallable`, `IsConstructor`, `SameValue`, `IsStrictlyEqual` 等  |
| **7.3 对象操作**   | `Get`, `Set`, `DefineProperty`, `Call`, `Construct`, `GroupBy` 等 |
| **7.4 迭代器操作** | `IteratorNext`, `IteratorStep`, `IteratorClose` 等                |

### 8. Syntax-Directed Operations (语法导向操作)

作用域分析（`BoundNames`）、标签处理、函数名称推断。

### 9. Executable Code and Execution Contexts (执行环境)

- **9.1** 环境记录（Environment Records）：声明式、对象、函数、全局、模块环境
- **9.3** Realms (领域)
- **9.4** 执行上下文栈
- **9.5** 任务队列 (Jobs)

---

## 三、语言语法、声明与模块 (Chapters 10-15)

### 10. ECMAScript Language: Source Code (源代码)

### 11. Lexical Grammar (词法文法)

空白符、注释、标识符、保留字、各种字面量（数字、正则、字符串）。

### 12. Expressions (表达式)

对象/数组初始化、模板字面量、属性访问、算术/位/逻辑/赋值运算符。

### 13. Statements and Declarations (语句与声明)

`Block`, `Let/Const`, `If`, 循环语句 (`Do-While`, `For-In`, `For-Of`), `Switch`,
`Try-Catch`。

### 14. Functions and Classes (函数与类)

函数定义、箭头函数、方法定义、生成器 (Generator)、异步函数、类定义。

### 15. Scripts and Modules (脚本与模块)

Module 语义、Export/Import 声明、**JSON Modules** 🆕

---

## 四、标准内置对象库 (Chapters 16-28)

### 16. Error Handling and Language Extensions

### 17. Standard Built-in Objects (内置对象总则)

### 18. The Global Object (全局对象)

全局属性、全局函数。

### 19. Fundamental Objects (基础对象)

`Object`, `Function`, `Boolean`, `Symbol`, `Error`

### 20. Numbers and Dates (数字与日期)

`Number`, `BigInt`, `Math`, `Date`

### 21. Text Processing (文本处理)

`String`, `RegExp`

- 🆕 **RegExp.escape**

### 22. Indexed Collections (索引集合)

`Array`

- 🆕 **Float16Array**

### 23. Keyed Collections (键控集合)

`Map`, `Set`

- 🆕 **Set 组合操作**：并集、交集等

### 24. Structured Data (结构化数据)

`ArrayBuffer`, `DataView`, `Atomics`, `JSON`

### 25. Managing Memory (内存管理)

`WeakRef`, `FinalizationRegistry`

### 26. Control Abstraction (控制抽象)

- **26.1 Iteration**
  - 🆕 **Iterator Helpers**：`.map()`, `.filter()`, `.take()` 等
- **26.3 Promise**
  - 🆕 **Promise.try()**

### 27. Reflection (反射)

`Reflect`, `Proxy`

### 28. WebAssembly Integration (WASM 集成接口)

---

## 五、附录 (Annexes)

| 附录        | 类型   | 内容                                                                             |
| ----------- | ------ | -------------------------------------------------------------------------------- |
| **Annex A** | 资料性 | Grammar Summary：所有文法汇总                                                    |
| **Annex B** | 规范性 | Additional Features for Web Browsers：Web 浏览器兼容性附加特性（如 `__proto__`） |
| **Annex C** | 资料性 | The Strict Mode of ECMAScript：严格模式汇总                                      |
| **Annex D** | 资料性 | Host Layering Points：宿主环境挂载点                                             |
| **Annex E** | 资料性 | Corrections and Clarifications：历史版本修正说明                                 |

---

## 2025 新特性速览

| 特性             | 章节  | 说明                                           |
| ---------------- | ----- | ---------------------------------------------- |
| JSON Modules     | Ch.15 | 原生 JSON 模块导入支持                         |
| RegExp.escape    | Ch.21 | 正则表达式字符串转义方法                       |
| Float16Array     | Ch.22 | 16 位浮点数类型化数组                          |
| Set 组合操作     | Ch.23 | `union()`, `intersection()`, `difference()` 等 |
| Iterator Helpers | Ch.26 | `.map()`, `.filter()`, `.take()`, `.drop()` 等 |
| Promise.try      | Ch.26 | 同步/异步统一处理入口                          |

---

> [!NOTE] 本规范全文超过
> **800 页**，上述目录提取了所有 1-28 章的主标题及核心二级小节。每章内部还包含大量的
> **运行时语义 (Runtime Semantics)** 和 **静态语义 (Static Semantics)**
> 细节算法。
