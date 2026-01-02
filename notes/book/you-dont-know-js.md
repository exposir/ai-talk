# 你不知道的 JavaScript

> "对于你不了解的东西，你无法真正拥有它。" —— Kyle Simpson

《You Don't Know
JS》系列丛书的核心知识点整理，分为上卷（作用域/闭包、this/原型）、中卷（类型/语法、异步/性能）、下卷（ES6+）。

---

## 一、作用域与闭包

**核心观点**：JavaScript 是一门编译语言，所有的"坑"在代码执行前的几微秒就已埋下。

### 1.1 幕后三巨头

| 角色                  | 职责                                           |
| --------------------- | ---------------------------------------------- |
| **引擎 (Engine)**     | 总指挥，负责程序的整个编译执行过程             |
| **编译器 (Compiler)** | 负责分词、解析和代码生成                       |
| **作用域 (Scope)**    | 维护变量的"户籍账本"，规定代码对变量的访问权限 |

#### `var a = 2;` 发生了什么？

```
编译期：编译器问作用域"见过 a 吗？" → 没有则声明新变量
执行期：引擎问作用域"能找到 a 吗？" → 找到则赋值 2
```

### 1.2 LHS 与 RHS 查询

| 类型                      | 含义                              | 找不到时的行为           |
| ------------------------- | --------------------------------- | ------------------------ |
| **LHS** (Left-hand Side)  | 找变量容器以便赋值，如 `a = 2`    | 非严格模式：创建全局变量 |
| **RHS** (Right-hand Side) | 找变量的源值，如 `console.log(a)` | 抛出 `ReferenceError`    |

### 1.3 词法作用域

- **定义**：作用域由代码**书写位置**决定（静态）
- **遮蔽效应**：查找会在找到第一个匹配标识符时停止，内部变量遮蔽外部同名变量
- **欺骗词法**：`eval()` 和 `with` 可动态修改作用域，但会导致引擎无法优化性能

### 1.4 变量提升 (Hoisting)

```javascript
a = 2;
var a;
console.log(a); // 输出 2，而非 undefined
```

**规则**：

- 变量声明提升，赋值不提升
- 函数声明优先级高于变量声明

### 1.5 闭包

> **定义**：当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用域之外执行。

**本质**：闭包阻止垃圾回收机制销毁其依赖的词法作用域。

#### 经典陷阱：循环中的闭包

```javascript
// 问题：全部输出 6
for (var i = 1; i <= 5; i++) {
  setTimeout(() => console.log(i), i * 1000);
}

// 解决：使用 let（每次迭代创建新的块级作用域）
for (let i = 1; i <= 5; i++) {
  setTimeout(() => console.log(i), i * 1000);
}
```

---

## 二、this 与原型

**核心观点**：`this` 是动态的（看调用位置），与作用域（看定义位置）形成对比。

### 2.1 this 绑定规则

**优先级由低到高：**

| 规则         | 场景              | `this` 指向                               |
| ------------ | ----------------- | ----------------------------------------- |
| **默认绑定** | `foo()`           | 非严格模式 `window`，严格模式 `undefined` |
| **隐式绑定** | `obj.foo()`       | `obj`                                     |
| **显式绑定** | `call/apply/bind` | 指定的对象                                |
| **new 绑定** | `new Foo()`       | 新创建的空对象                            |

**隐式丢失陷阱**：

```javascript
var bar = obj.foo; // bar 只是函数引用
bar(); // 退化为默认绑定
```

**箭头函数**：不适用以上规则，`this` 继承自外层词法作用域。

### 2.2 对象属性

#### 属性描述符

通过 `Object.defineProperty` 控制属性行为：

```javascript
Object.defineProperty(obj, 'a', {
  value: 2,
  writable: false, // 不可修改
  configurable: false, // 不可删除/重新配置
  enumerable: true, // 可被 for...in 枚举
});
```

| 描述符         | 作用                                        |
| -------------- | ------------------------------------------- |
| `writable`     | 是否可修改值                                |
| `configurable` | 是否可删除属性或重新配置描述符              |
| `enumerable`   | 是否出现在 `for...in` 和 `Object.keys()` 中 |

#### Getter/Setter

定义"伪属性"，在读取/赋值时触发函数：

```javascript
const obj = {
  get a() {
    return this._a * 2;
  },
  set a(val) {
    this._a = val;
  },
};
obj.a = 5; // 调用 setter
console.log(obj.a); // 10，调用 getter
```

### 2.3 原型链

> **核心观点**：JavaScript 没有真正的"类"，原型链的本质是**委托**而非**复制**。

| 传统类语言           | JavaScript                   |
| -------------------- | ---------------------------- |
| 继承 = 复制          | 原型 = 委托                  |
| 修改类不影响已有实例 | 修改原型立即影响所有关联对象 |

**ES6 `class` 是语法糖**：底层依然是原型链接，不是真正的类继承。

### 2.4 OLOO 模式

**Objects Linked to Other Objects**：直接利用对象委托，避开
`prototype`/`new`/`constructor` 的复杂性。

```javascript
const Task = {
  setID(ID) {
    this.id = ID;
  },
  outputID() {
    console.log(this.id);
  },
};

const XYZ = Object.create(Task); // XYZ 委托 Task
XYZ.prepareTask = function (ID, Label) {
  this.setID(ID); // 委托调用
  this.label = Label;
};
```

---

## 三、类型与语法

**核心观点**：强制类型转换不是设计缺陷，而是核心特性。觉得它坑，是因为拒绝理解它。

### 3.1 七种内置类型

`null`、`undefined`、`boolean`、`number`、`string`、`symbol`、`object`

- `typeof null === "object"` 是历史遗留 Bug
- **变量没有类型，值才有类型**

### 3.2 原生函数与封装对象

原生函数：`String()`、`Number()`、`Boolean()`、`Array()`、`Object()`、`Function()`、`RegExp()`、`Date()`、`Error()`、`Symbol()`

#### `[[Class]]` 内部属性

```javascript
Object.prototype.toString.call([1, 2]); // "[object Array]"
Object.prototype.toString.call(/regex/); // "[object RegExp]"
Object.prototype.toString.call(null); // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"
```

#### 封装与拆封 (Boxing/Unboxing)

```javascript
// 自动封装：原始值调用方法时，JS 自动封装成对象
'abc'.length; // JS 内部: new String("abc").length → 3

// 拆封：获取封装对象的原始值
const s = new String('abc');
s.valueOf(); // "abc"
```

> **最佳实践**：不要直接创建封装对象（如 `new String("abc")`），让 JS 自动处理。

### 3.3 抽象操作

| 操作            | 说明                                                      |
| --------------- | --------------------------------------------------------- |
| **ToString**    | 非字符串 → 字符串                                         |
| **ToNumber**    | `true`→`1`, `false`→`0`, `undefined`→`NaN`, `null`→`0`    |
| **ToBoolean**   | Falsy 值：`undefined`, `null`, `false`, `±0`, `NaN`, `""` |
| **ToPrimitive** | 对象 → 原始值，先 `valueOf()` 再 `toString()`             |

#### JSON.stringify 的特殊处理

```javascript
JSON.stringify(undefined); // undefined（无输出）
JSON.stringify(function () {}); // undefined（无输出）
JSON.stringify([1, undefined, 2]); // "[1,null,2]"（数组中变 null）
JSON.stringify({ a: undefined, b: 1 }); // "{\"b\":1}"（对象中被忽略）
```

**自定义序列化**：定义 `toJSON()` 方法控制对象如何被序列化。

### 3.4 `==` vs `===`

**常见误解**：`==` 检查值，`===` 检查值和类型。

**真相**：两者都检查类型，区别是 `==` 允许强制类型转换，`===` 不允许。

**实用技巧**：

```javascript
// 优雅地判断 null 或 undefined
if (a == null) {
  /* 相当于 a === null || a === undefined */
}
```

**避坑原则**：不要在 `==` 一侧使用 `true/false` 或 `[]/""/0`。

### 3.5 语法细节

- **短路逻辑**：`a && b` 返回的不是布尔值，而是 `a` 或 `b` 的值
- **连等号陷阱**：`var a = b = 42;` 中 `b` 会变成全局变量

---

## 四、异步与性能

**核心观点**：异步的本质不是让程序更快，而是处理"现在"与"将来"之间的鸿沟。

### 4.1 事件循环 (Event Loop)

```
┌─────────────────────────────┐
│      JS 引擎 (单线程)        │
│                             │
│  ┌─────────────────────┐    │
│  │    执行当前任务      │    │
│  └──────────┬──────────┘    │
│             │               │
│             ▼               │
│  ┌─────────────────────┐    │
│  │  检查任务队列        │◄───── 宿主环境将异步回调放入队列
│  └─────────────────────┘    │
└─────────────────────────────┘
```

**核心结论**：JS 的异步不是真正的并行，而是"分块执行"。

### 4.2 回调的信任问题

**回调地狱的本质**：不是嵌套深，而是**控制反转** (Inversion of Control)。

你把程序执行权交给了第三方，无法保证：

- 不会被多次调用
- 不会不被调用
- 不会吞掉错误

### 4.3 Promise

> **比喻**：Promise 是"取餐号"，代表一个未来会拿到的值。

**解决信任问题**：

1. **不可变性**：状态一旦确定就不可更改
2. **错误传播**：异常沿链条传递，不会被吞掉
3. **控制权回归**：由你决定何时执行 `.then()`

### 4.4 Generator

让异步代码看起来像同步：

```javascript
function* main() {
  try {
    const result = yield request('http://api.example.com');
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}
```

**终极组合**：Generator（流程控制）+ Promise（异步交付）= `async/await` 的前身

### 4.5 Web Workers

在独立线程中运行 JS，处理耗时计算而不阻塞 UI：

```javascript
// 主线程
const worker = new Worker('worker.js');
worker.postMessage({ data: 'heavy task' });
worker.onmessage = (e) => console.log(e.data);

// worker.js
onmessage = (e) => {
  const result = heavyComputation(e.data);
  postMessage(result);
};
```

**限制**：无法访问 DOM，与主线程通过消息传递通信。

### 4.6 微任务 vs 宏任务

| 类型       | 示例                               | 优先级 |
| ---------- | ---------------------------------- | ------ |
| **微任务** | `Promise.then`, `MutationObserver` | 高     |
| **宏任务** | `setTimeout`, `setInterval`, I/O   | 低     |

```javascript
console.log('1'); // 同步
setTimeout(() => console.log('2'), 0); // 宏任务
Promise.resolve().then(() => console.log('3')); // 微任务
console.log('4'); // 同步
// 输出顺序: 1 → 4 → 3 → 2
```

---

## 五、ES6+ 与元编程

**核心观点**：ES6 是范式转变，赋予开发者"修改语言底层行为"的能力。

### 5.1 语法进化

| 特性           | 核心价值                             |
| -------------- | ------------------------------------ |
| **解构赋值**   | 模式匹配，强制思考数据结构           |
| **箭头函数**   | 取消 `this` 动态绑定，回归词法作用域 |
| **模板字面量** | 标签模板是元编程字符串处理机制       |

### 5.2 Symbol：语言底层的钩子

| Well-known Symbol    | 作用                       |
| -------------------- | -------------------------- |
| `Symbol.iterator`    | 使对象可被 `for...of` 遍历 |
| `Symbol.toPrimitive` | 自定义类型转换行为         |
| `Symbol.hasInstance` | 重定义 `instanceof` 逻辑   |

### 5.3 Proxy & Reflect

**Proxy**：在目标对象前架设拦截层，可拦截 `get`/`set`/`deleteProperty`/`apply`
等操作。

```javascript
const handler = {
  get(target, prop) {
    console.log(`读取 ${prop}`);
    return Reflect.get(target, prop);
  },
};
const proxy = new Proxy({}, handler);
```

**实战意义**：Vue 3 响应式系统的核心。

**Reflect**：标准化底层操作，与 Proxy 配合使用。

### 5.4 迭代器协议

- **Iterator**：规定数据如何被"消费"
- **Iterable**：定义 `Symbol.iterator` 使任何数据结构可被遍历

### 5.5 async/await

**提醒**：虽然语法像同步，但底层依然是 Promise，不要忘记异步机制。

---

## 总结

| 篇章     | 核心主题     | 关键词                         |
| -------- | ------------ | ------------------------------ |
| **上卷** | 作用域与闭包 | 词法作用域、提升、闭包         |
| **上卷** | this 与原型  | 四种绑定、原型委托、OLOO       |
| **中卷** | 类型与语法   | 抽象操作、强制转换、`==`       |
| **中卷** | 异步与性能   | Event Loop、Promise、Generator |
| **下卷** | ES6+         | Symbol、Proxy、元编程          |
