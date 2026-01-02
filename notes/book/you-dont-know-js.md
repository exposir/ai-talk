# 你不知道的 JavaScript

> "对于你不了解的东西，你无法真正拥有它。" —— Kyle Simpson

《You Don't Know
JS》系列丛书的核心知识点整理，分为上卷（作用域/闭包、this/原型）、中卷（类型/语法、异步/性能）、下卷（ES6+）。

---

## 一、作用域与闭包 ⭐⭐⭐

**核心观点**：JavaScript 是一门编译语言，所有的"坑"在代码执行前的几微秒就已埋下。

### 1.1 幕后三巨头 ⭐⭐

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

### 1.2 LHS 与 RHS 查询 ⭐⭐

| 类型                      | 含义                              | 找不到时的行为           |
| ------------------------- | --------------------------------- | ------------------------ |
| **LHS** (Left-hand Side)  | 找变量容器以便赋值，如 `a = 2`    | 非严格模式：创建全局变量 |
| **RHS** (Right-hand Side) | 找变量的源值，如 `console.log(a)` | 抛出 `ReferenceError`    |

### 1.3 词法作用域 ⭐⭐⭐

- **定义**：作用域由代码**书写位置**决定（静态）
- **遮蔽效应**：查找会在找到第一个匹配标识符时停止，内部变量遮蔽外部同名变量
- **欺骗词法**：`eval()` 和 `with` 可动态修改作用域，但会导致引擎无法优化性能

### 1.4 变量提升 (Hoisting) ⭐⭐⭐

```javascript
a = 2;
var a;
console.log(a); // 输出 2，而非 undefined
```

**规则**：

- 变量声明提升，赋值不提升
- 函数声明优先级高于变量声明

### 1.5 闭包 ⭐⭐⭐

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

### 1.6 模块模式 ⭐⭐⭐

利用闭包实现私有变量和公共 API：

#### IIFE 模块模式

```javascript
const MyModule = (function () {
  // 私有变量
  let privateVar = 0;

  // 私有函数
  function privateMethod() {
    return privateVar++;
  }

  // 公共 API
  return {
    increment: function () {
      return privateMethod();
    },
    getValue: function () {
      return privateVar;
    },
  };
})();

MyModule.increment(); // 0
MyModule.getValue(); // 1
```

#### ES6 模块

```javascript
// module.js
let privateVar = 0;
export function increment() {
  return privateVar++;
}
export function getValue() {
  return privateVar;
}

// main.js
import { increment, getValue } from './module.js';
```

---

## 二、this 与原型 ⭐⭐⭐

**核心观点**：`this` 是动态的（看调用位置），与作用域（看定义位置）形成对比。

### 2.1 this 绑定规则 ⭐⭐⭐

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

### 2.2 对象属性 ⭐⭐

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

#### 对象不可变性 ⭐⭐

| 方法                            | 效果                                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| `Object.preventExtensions(obj)` | 禁止添加新属性                                                      |
| `Object.seal(obj)`              | 禁止添加/删除属性（相当于 preventExtensions + configurable: false） |
| `Object.freeze(obj)`            | 完全冻结（相当于 seal + writable: false）                           |

```javascript
const obj = { a: 1 };
Object.freeze(obj);
obj.a = 2; // 静默失败（严格模式报错）
obj.b = 3; // 静默失败
console.log(obj.a); // 1
```

### 2.3 原型链 ⭐⭐⭐

> **核心观点**：JavaScript 没有真正的"类"，原型链的本质是**委托**而非**复制**。

| 传统类语言           | JavaScript                   |
| -------------------- | ---------------------------- |
| 继承 = 复制          | 原型 = 委托                  |
| 修改类不影响已有实例 | 修改原型立即影响所有关联对象 |

**ES6 `class` 是语法糖**：底层依然是原型链接，不是真正的类继承。

### 2.4 OLOO 模式 ⭐⭐

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

## 三、类型与语法 ⭐⭐⭐

**核心观点**：强制类型转换不是设计缺陷，而是核心特性。觉得它坑，是因为拒绝理解它。

### 3.1 七种内置类型 ⭐⭐

`null`、`undefined`、`boolean`、`number`、`string`、`symbol`、`object`

- `typeof null === "object"` 是历史遗留 Bug
- **变量没有类型，值才有类型**

### 3.2 原生函数与封装对象 ⭐⭐

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

### 3.3 抽象操作 ⭐⭐⭐

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

### 3.4 `==` vs `===` ⭐⭐⭐

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

### 3.5 语法细节 ⭐⭐

- **短路逻辑**：`a && b` 返回的不是布尔值，而是 `a` 或 `b` 的值
- **连等号陷阱**：`var a = b = 42;` 中 `b` 会变成全局变量

#### ASI (自动分号插入) ⭐⭐

JS 会在某些情况下自动插入分号：

```javascript
// 危险情况
return;
{
  a: 1;
}
// 被解析为: return; { a: 1 }; 返回 undefined！

// 正确写法
return {
  a: 1,
};
```

**规则**：换行符后如果遇到 `)`、`]`、`}`，或者是
`return`、`throw`、`break`、`continue` 后的换行，会自动插入分号。

---

## 四、异步与性能 ⭐⭐⭐

**核心观点**：异步的本质不是让程序更快，而是处理"现在"与"将来"之间的鸿沟。

### 4.1 事件循环 (Event Loop) ⭐⭐⭐

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

### 4.2 回调的信任问题 ⭐⭐⭐

**回调地狱的本质**：不是嵌套深，而是**控制反转** (Inversion of Control)。

你把程序执行权交给了第三方，无法保证：

- 不会被多次调用
- 不会不被调用
- 不会吞掉错误

### 4.3 Promise ⭐⭐⭐

> **比喻**：Promise 是"取餐号"，代表一个未来会拿到的值。

**解决信任问题**：

1. **不可变性**：状态一旦确定就不可更改
2. **错误传播**：异常沿链条传递，不会被吞掉
3. **控制权回归**：由你决定何时执行 `.then()`

#### Promise 组合方法 ⭐⭐⭐

```javascript
// Promise.all - 全部成功才成功，一个失败就失败
Promise.all([p1, p2, p3])
  .then(([r1, r2, r3]) => console.log('全部完成'))
  .catch((err) => console.log('有一个失败'));

// Promise.race - 第一个完成的决定结果
Promise.race([p1, p2]).then((first) => console.log('最快的结果'));

// Promise.allSettled - 等待全部完成，无论成功失败
Promise.allSettled([p1, p2]).then((results) =>
  results.forEach((r) => console.log(r.status)),
);

// Promise.any - 第一个成功的，全部失败才失败
Promise.any([p1, p2]).then((first) => console.log('第一个成功的'));
```

### 4.4 Generator ⭐⭐

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

### 4.5 Web Workers ⭐⭐

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

### 4.6 微任务 vs 宏任务 ⭐⭐⭐

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

## 五、ES6+ 与元编程 ⭐⭐⭐

**核心观点**：ES6 是范式转变，赋予开发者"修改语言底层行为"的能力。

### 5.1 let/const 与 TDZ ⭐⭐⭐

#### 暂时性死区 (Temporal Dead Zone)

```javascript
console.log(a); // ReferenceError: Cannot access 'a' before initialization
let a = 1;

// 对比 var
console.log(b); // undefined（已提升）
var b = 2;
```

**TDZ 规则**：`let`/`const` 声明的变量在声明之前的区域称为 TDZ，访问会报错。

### 5.2 解构与展开运算符 ⭐⭐⭐

#### 解构赋值

```javascript
// 对象解构
const { a, b: renamed, c = 'default' } = obj;

// 数组解构
const [first, , third] = arr;

// 嵌套解构
const {
  user: { name },
} = response;
```

#### 展开/剩余运算符

```javascript
// 展开数组
const arr = [1, 2, 3];
console.log(...arr); // 1 2 3
const merged = [...arr1, ...arr2];

// 展开对象
const merged = { ...obj1, ...obj2 };

// 剩余参数
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

### 5.3 Symbol：语言底层的钩子 ⭐⭐

| Well-known Symbol    | 作用                       |
| -------------------- | -------------------------- |
| `Symbol.iterator`    | 使对象可被 `for...of` 遍历 |
| `Symbol.toPrimitive` | 自定义类型转换行为         |
| `Symbol.hasInstance` | 重定义 `instanceof` 逻辑   |

### 5.4 Proxy & Reflect ⭐⭐⭐

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

### 5.5 新数据结构 ⭐⭐

#### Map vs Object

```javascript
const map = new Map();
map.set('key', 'value');
map.set({}, 'object key'); // 可以用对象作为键
map.get('key'); // 'value'
map.size; // 2
```

| 特性   | Object              | Map        |
| ------ | ------------------- | ---------- |
| 键类型 | 只能是字符串/Symbol | 任意类型   |
| 键顺序 | 无保证              | 插入顺序   |
| 大小   | 手动计算            | `map.size` |
| 迭代   | 需转换              | 直接迭代   |

#### Set

```javascript
const set = new Set([1, 2, 2, 3]);
console.log([...set]); // [1, 2, 3]（自动去重）
set.has(2); // true
```

#### WeakMap/WeakSet

- 键必须是对象
- 弱引用，不阻止垃圾回收
- 常用于私有数据存储

### 5.6 迭代器协议 ⭐⭐

- **Iterator**：规定数据如何被"消费"
- **Iterable**：定义 `Symbol.iterator` 使任何数据结构可被遍历

### 5.7 async/await ⭐⭐⭐

**提醒**：虽然语法像同步，但底层依然是 Promise，不要忘记异步机制。

```javascript
// 并行执行（推荐）
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// 串行执行（较慢）
const a = await fetchA();
const b = await fetchB();
```

---

## 总结

| 篇章     | 核心主题     | 关键词                                  | 重要性 |
| -------- | ------------ | --------------------------------------- | ------ |
| **上卷** | 作用域与闭包 | 词法作用域、提升、闭包、模块模式        | ⭐⭐⭐ |
| **上卷** | this 与原型  | 四种绑定、原型委托、OLOO                | ⭐⭐⭐ |
| **中卷** | 类型与语法   | 抽象操作、强制转换、`==`、ASI           | ⭐⭐⭐ |
| **中卷** | 异步与性能   | Event Loop、Promise、微任务/宏任务      | ⭐⭐⭐ |
| **下卷** | ES6+         | let/const、解构、Symbol、Proxy、Map/Set | ⭐⭐⭐ |
