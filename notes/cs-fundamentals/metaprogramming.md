<!--
- [INPUT]: 依赖 notes/cs-fundamentals/CLAUDE.md 的模块定位与索引
- [OUTPUT]: 输出 元编程 (Metaprogramming) 文档
- [POS]: 位于 notes/cs-fundamentals 模块的 元编程 (Metaprogramming) 笔记
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 元编程 (Metaprogramming)

## 什么是元编程？

### 一句话定义

> **元编程是编写"操作代码的代码"——让程序能够读取、生成、分析或修改自身或其他程序。**

"元"(Meta) 意为"关于...的"，所以元编程就是"关于编程的编程"。

### 直观理解

普通编程与元编程的区别：

```
普通编程：写代码 → 操作数据
元编程：  写代码 → 操作代码
```

一个生活类比：

```
普通工人：使用工具制造产品
元编程师：制造能制造产品的工具（或制造能制造工具的工具）
```

### 核心特征

| 特征           | 说明                     |
| -------------- | ------------------------ |
| **代码即数据** | 程序可以被当作数据来处理 |
| **自我修改**   | 程序可以在运行时改变自己 |
| **代码生成**   | 程序可以生成其他程序     |
| **抽象提升**   | 在更高层次上操作代码结构 |

---

## 历史起源

### LISP 的诞生 (1958)

**约翰·麦卡锡 (John McCarthy)**
在 MIT 发明了 LISP，这是元编程历史上最重要的里程碑。

LISP 的革命性设计：

```lisp
; LISP 中代码和数据使用相同的表示（S-表达式）
; 这是一个列表（数据）
'(1 2 3)

; 这也是一个列表（代码）
'(+ 1 2)

; 可以用 eval 执行"数据"
(eval '(+ 1 2))  ; → 3

; 可以用程序构造并执行代码
(eval (list '+ 1 2))  ; → 3
```

**同像性 (Homoiconicity)**：代码和数据使用相同的结构表示，这使得元编程变得自然而优雅。

### 宏系统的演进

**1960s - LISP 宏**

LISP 引入了宏 (Macro)，允许在编译时进行代码转换：

```lisp
; 定义一个简单的宏
(defmacro when (condition &body body)
  `(if ,condition
       (progn ,@body)))

; 使用宏
(when (> x 0)
  (print "positive")
  (return x))

; 实际展开为
(if (> x 0)
    (progn
      (print "positive")
      (return x)))
```

**1970s - Scheme 卫生宏**

Scheme 引入了**卫生宏 (Hygienic Macros)**，解决了变量捕获问题：

```scheme
; 卫生宏确保宏展开不会意外捕获变量
(define-syntax swap!
  (syntax-rules ()
    ((swap! a b)
     (let ((temp a))
       (set! a b)
       (set! b temp)))))
```

**1980s-90s - C++ 模板元编程**

1994年，Erwin Unruh 意外发现 C++ 模板系统是图灵完备的：

```cpp
// 编译期计算阶乘（1994年的发现）
template<int N>
struct Factorial {
    static const int value = N * Factorial<N-1>::value;
};

template<>
struct Factorial<0> {
    static const int value = 1;
};

// 编译时计算，运行时直接使用结果
int x = Factorial<5>::value;  // 120
```

这开启了 C++ 模板元编程 (TMP) 的时代。

### 反射的发展

**1980s - Smalltalk 反射**

Smalltalk 是第一个拥有完整反射能力的语言：

- 运行时查询类结构
- 动态创建类和方法
- 修改现有类的行为

**1995 - Java 反射 API**

Java 提供了受限但实用的反射机制：

```java
// 运行时获取类信息
Class<?> clazz = obj.getClass();
Method[] methods = clazz.getMethods();

// 动态调用方法
Method method = clazz.getMethod("sayHello", String.class);
method.invoke(obj, "World");
```

**2000s - 动态语言的崛起**

Ruby、Python 等语言将元编程能力推向极致：

```ruby
# Ruby 的 method_missing —— 处理不存在的方法调用
class DynamicFinder
  def method_missing(name, *args)
    if name.to_s.start_with?('find_by_')
      field = name.to_s.sub('find_by_', '')
      puts "查找 #{field} = #{args.first}"
    end
  end
end

finder = DynamicFinder.new
finder.find_by_name("Alice")  # 输出: 查找 name = Alice
finder.find_by_age(25)        # 输出: 查找 age = 25
```

---

## 元编程的分类

### 按执行时机

```
┌─────────────────────────────────────────────────────────┐
│                      元编程                              │
├────────────────────────┬────────────────────────────────┤
│     编译时元编程        │         运行时元编程            │
│  (Static/Compile-time) │     (Dynamic/Runtime)          │
├────────────────────────┼────────────────────────────────┤
│  • C++ 模板            │  • 反射 (Reflection)           │
│  • Rust 宏             │  • eval()                      │
│  • 泛型 (Generics)     │  • 动态代理                     │
│  • 条件编译            │  • 热加载                       │
└────────────────────────┴────────────────────────────────┘
```

### 按操作对象

| 类型             | 操作对象     | 示例                                |
| ---------------- | ------------ | ----------------------------------- |
| **语法元编程**   | 语法树 (AST) | LISP 宏, Rust 过程宏                |
| **类型元编程**   | 类型系统     | TypeScript 类型体操, Haskell 类型族 |
| **反射元编程**   | 运行时结构   | Java 反射, Python inspect           |
| **字符串元编程** | 源代码字符串 | eval(), 代码生成器                  |

---

## 核心技术

### 1. 宏 (Macros)

宏在编译前进行代码转换：

```
源代码 → 宏展开 → 展开后代码 → 编译 → 可执行文件
```

**文本宏 vs 语法宏**

| 类型       | 代表       | 特点                   |
| ---------- | ---------- | ---------------------- |
| **文本宏** | C 预处理器 | 简单文本替换，容易出错 |
| **语法宏** | LISP, Rust | 操作语法树，类型安全   |

**C 预处理器的陷阱**

```c
#define SQUARE(x) x * x

// 看起来正确，但...
int a = SQUARE(1 + 2);   // 展开为: 1 + 2 * 1 + 2 = 5 (预期 9)

// 需要加括号
#define SQUARE_SAFE(x) ((x) * (x))
```

**Rust 过程宏示例**

```rust
// 派生宏 —— 自动实现 trait
#[derive(Debug, Clone, Serialize)]
struct User {
    name: String,
    age: u32,
}

// 属性宏 —— 修改函数行为
#[tokio::main]
async fn main() {
    // 宏将普通 main 转换为异步运行时入口
}

// 函数式宏 —— 自定义语法
let sql = sqlx::query!("SELECT * FROM users WHERE id = $1", user_id);
```

### 2. 反射 (Reflection)

反射允许程序在运行时检查和修改自身结构：

**内省 (Introspection)**：只读查询

```python
# Python 内省示例
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Hello, {self.name}"

user = User("Alice", 30)

# 获取所有属性
print(dir(user))

# 获取类型
print(type(user).__name__)  # User

# 检查方法
print(hasattr(user, 'greet'))  # True

# 获取源代码
import inspect
print(inspect.getsource(User.greet))
```

**修改 (Modification)**：运行时改变结构

```python
# 动态添加方法
def new_method(self):
    return f"Age: {self.age}"

User.show_age = new_method
print(user.show_age())  # Age: 30

# 动态创建类
DynamicClass = type('DynamicClass', (object,), {
    'value': 42,
    'get_value': lambda self: self.value
})

obj = DynamicClass()
print(obj.get_value())  # 42
```

### 3. 代码生成 (Code Generation)

在编译时或构建时生成代码：

**模板代码生成**

```javascript
// 简单的代码生成器
function generateAccessors(properties) {
  return properties
    .map(
      (prop) => `
    get ${prop}() {
      return this._${prop};
    }
    set ${prop}(value) {
      this._${prop} = value;
    }
  `,
    )
    .join('\n');
}

const code = generateAccessors(['name', 'age', 'email']);
// 生成 getter/setter 代码
```

**AST 代码生成**

```javascript
// 使用 Babel 进行 AST 转换
const babel = require('@babel/core');

const inputCode = 'const x = 1 + 2;';
const result = babel.transformSync(inputCode, {
  plugins: [
    {
      visitor: {
        BinaryExpression(path) {
          // 编译时计算常量表达式
          if (path.node.operator === '+') {
            const left = path.node.left.value;
            const right = path.node.right.value;
            if (typeof left === 'number' && typeof right === 'number') {
              path.replaceWith({ type: 'NumericLiteral', value: left + right });
            }
          }
        },
      },
    },
  ],
});

console.log(result.code); // const x = 3;
```

### 4. 领域特定语言 (DSL)

元编程可以创建嵌入式 DSL：

```ruby
# Ruby DSL 示例 - 构建 HTML
html = HTML.build do
  html do
    head do
      title "My Page"
    end
    body do
      h1 "Welcome"
      p "Hello, World!"
    end
  end
end
```

```kotlin
// Kotlin DSL 示例 - Gradle 构建脚本
dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    testImplementation("junit:junit:4.13")
}

tasks.register("hello") {
    doLast {
        println("Hello from Gradle!")
    }
}
```

---

## 各语言的元编程能力

### 能力对比

| 语言            | 宏  | 反射 | 类型元编程 | 运行时修改 |
| --------------- | :-: | :--: | :--------: | :--------: |
| **LISP/Scheme** | ★★★ | ★★★  |     ★      |    ★★★     |
| **Ruby**        |  ★  | ★★★  |     ★      |    ★★★     |
| **Python**      |  ★  | ★★★  |     ★★     |    ★★★     |
| **JavaScript**  |  ★  | ★★★  |     —      |    ★★★     |
| **Rust**        | ★★★ |  ★   |     ★★     |     ✗      |
| **C++**         | ★★★ |  ✗   |    ★★★     |     ✗      |
| **TypeScript**  |  ★  |  ★★  |    ★★★     |     ★★     |
| **Haskell**     | ★★  |  ★   |    ★★★     |     ✗      |
| **Java**        |  ★  |  ★★  |     ★      |     ★      |
| **Go**          |  ✗  |  ★★  |     ✗      |     ✗      |

### 典型能力展示

**LISP - 宏的极致**

```lisp
; 创建新的控制结构
(defmacro unless (condition &body body)
  `(if (not ,condition)
       (progn ,@body)))

(unless (> age 18)
  (print "未成年"))
```

**Ruby - 动态性的极致**

```ruby
# 打开类并修改
class String
  def shout
    self.upcase + "!"
  end
end

"hello".shout  # "HELLO!"

# 元类编程
class Module
  def attr_checked(name, &validation)
    define_method("#{name}=") do |value|
      raise "Invalid!" unless validation.call(value)
      instance_variable_set("@#{name}", value)
    end

    define_method(name) do
      instance_variable_get("@#{name}")
    end
  end
end

class Person
  attr_checked :age do |v|
    v >= 0 && v < 150
  end
end
```

**TypeScript - 类型元编程**

```typescript
// 类型级别的编程
type IsString<T> = T extends string ? true : false;
type A = IsString<'hello'>; // true
type B = IsString<42>; // false

// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 递归类型操作
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // "onClick"
```

**C++ - 模板元编程**

```cpp
// 编译期类型选择
template<bool Condition, typename Then, typename Else>
struct If;

template<typename Then, typename Else>
struct If<true, Then, Else> { using type = Then; };

template<typename Then, typename Else>
struct If<false, Then, Else> { using type = Else; };

// 使用
using Result = If<(sizeof(int) > 2), int, long>::type;

// C++17 constexpr if
template<typename T>
auto getValue(T t) {
    if constexpr (std::is_pointer_v<T>)
        return *t;
    else
        return t;
}
```

---

## 经典应用场景

### 1. ORM (对象关系映射)

```python
# ActiveRecord 模式 —— 通过元编程推断数据库结构
class User(Model):
    # 自动生成 CRUD 方法、验证、关联
    pass

user = User.find_by(name="Alice")
user.posts.create(title="Hello")
```

### 2. 依赖注入框架

```java
// Spring 通过反射实现依赖注入
@Service
public class UserService {
    @Autowired  // 运行时注入依赖
    private UserRepository repository;
}
```

### 3. 序列化/反序列化

```rust
// Serde 使用过程宏自动生成代码
#[derive(Serialize, Deserialize)]
struct User {
    name: String,
    age: u32,
}

// 宏自动生成 to_json/from_json 实现
let json = serde_json::to_string(&user)?;
let user: User = serde_json::from_str(&json)?;
```

### 4. 测试框架

```python
# pytest 使用内省发现测试
def test_addition():
    assert 1 + 1 == 2

def test_subtraction():
    assert 3 - 1 == 2

# 框架自动发现所有 test_ 开头的函数
```

### 5. 调试与监控

```javascript
// 使用 Proxy 实现自动日志
const createLogged = (obj) =>
  new Proxy(obj, {
    get(target, prop) {
      console.log(`读取属性: ${prop}`);
      return target[prop];
    },
    set(target, prop, value) {
      console.log(`设置属性: ${prop} = ${value}`);
      target[prop] = value;
      return true;
    },
  });

const user = createLogged({ name: 'Alice' });
user.name; // 输出: 读取属性: name
user.age = 30; // 输出: 设置属性: age = 30
```

---

## 优势与风险

### 优势

| 优势         | 说明                     |
| ------------ | ------------------------ |
| **消除重复** | 自动生成样板代码         |
| **提高抽象** | 创建更高层次的抽象       |
| **灵活性**   | 运行时适应不同需求       |
| **表达力**   | 创建领域特定语言         |
| **性能**     | 编译时计算，零运行时开销 |

### 风险

| 风险           | 说明                    |
| -------------- | ----------------------- |
| **可读性下降** | 隐藏的魔法难以理解      |
| **调试困难**   | 错误信息可能令人困惑    |
| **编译时间**   | 复杂宏/模板增加编译时间 |
| **安全性**     | 动态执行可能引入漏洞    |
| **维护成本**   | 需要更深的语言理解      |

### 最佳实践

```
元编程黄金法则：
┌─────────────────────────────────────────────────────┐
│  只在重复代码模式明确且稳定时使用元编程            │
│  优先选择更简单的抽象方式（函数、类、接口）        │
│  提供清晰的文档和错误信息                          │
│  确保生成的代码易于调试                            │
└─────────────────────────────────────────────────────┘
```

---

## 现代发展趋势

### 编译时元编程的复兴

- **Rust 过程宏**：安全、强类型的宏系统
- **Zig comptime**：编译时执行任意代码
- **C++ constexpr/consteval**：编译时常量计算

```zig
// Zig 的 comptime —— 优雅的编译时元编程
fn fibonacci(comptime n: u32) u32 {
    if (n < 2) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 编译时计算
const fib_10 = fibonacci(10);  // 编译时求值为 55
```

### 类型系统的进化

- **TypeScript 类型体操**：图灵完备的类型系统
- **Dependent Types**：值依赖类型（Idris, Agda）
- **Effect Systems**：追踪副作用的类型

### AI 辅助代码生成

- **GitHub Copilot**：基于上下文生成代码
- **大语言模型**：自然语言到代码的转换
- 新形式的"元编程"：用自然语言描述程序

---

## 相关概念

- **[图灵机](./turing-machine.md)**：元编程能力的理论基础
- **[编译原理](./compiler-theory.md)**：宏展开与代码生成的基础
- **[类型系统](./type-systems.md)**：类型元编程的载体
- **[设计模式](./design-patterns.md)**：元编程可以消除某些模式的样板代码

---

## 延伸阅读

1. **《SICP》** - Abelson & Sussman - LISP 元编程的经典教材
2. **《Ruby 元编程》** - Paolo Perrotta - Ruby 动态特性的深入指南
3. **《C++ 模板元编程》** - David Abrahams - C++ TMP 权威指南
4. **《Types and Programming Languages》** - Benjamin Pierce - 类型系统理论
