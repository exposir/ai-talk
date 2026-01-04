# Telegram 客户端架构深度解析

> 深入剖析 Telegram "极致速度" 背后的工程实现

## 1. 工程哲学：Native First

在 React Native、Flutter 等跨平台框架盛行的今天，Telegram 始终坚持 **"Native
First"（原生优先）** 的工程哲学。

**为什么不选择跨平台框架？**

| 考量维度     | Native 实现的优势                          | 跨平台框架的痛点              |
| ------------ | ------------------------------------------ | ----------------------------- |
| **启动速度** | 毫秒级冷启动                               | 需要加载 JS Bundle 或 Dart VM |
| **滚动性能** | 60fps / 120fps 丝般顺滑                    | 复杂列表容易掉帧              |
| **内存占用** | 极低（C++ 核心优化）                       | 较高，易触发 OOM              |
| **UI 细节**  | 完美贴合平台规范（iOS 模糊、Android 涟漪） | 难以做到像素级还原            |
| **电池续航** | 高效利用硬件特性                           | CPU 占用较高                  |

Telegram 团队认为，**只有榨干每个平台的原生特性，才能提供极致的用户体验**。

---

## 2. 官方客户端架构详解

Telegram 的不同平台客户端并非简单的 "换皮"，而是针对该平台特性重新设计的工程艺术品。

### 🍎 iOS (The Flagship)

iOS 版通常被视为 Telegram 的旗舰体验，其流畅度业界闻名。

- **语言**：Objective-C（核心历史代码）+ Swift（新功能）
- **核心组件**：
  - **MTProtoKit**：完全重写的 Objective-C 网络层，非 TDLib。专为 iOS 的后台机制和网络特性优化。
  - **AsyncDisplayKit (Texture)**：这是 Telegram iOS **流畅滚动的秘密武器**。
    - **原理**：将繁重的 UI 布局和渲染操作（如文本计算、图片解码）移出主线程。
    - **效果**：即使在包含大量图片、视频和复杂布局的聊天列表中，也能保持绝对的 60/120fps。
  - **RLMRealm /
    SQLite**：本地数据存储（早期使用 Realm，后转向更底层的 SQLite 优化）。

> **亮点**：Telegram
> iOS 的 Sticker 渲染引擎极为高效，支持 60fps 的 WebM/TGS 格式动画。

### 🤖 Android (Official vs X)

Android 生态存在著名的 "双客户端" 策略：

#### 官方版 (Telegram for Android)

- **定位**：稳定、兼容性好、功能最全。
- **架构**：
  - **语言**：Java (主要) + C++ (JNI)。
  - **核心**：直接实现 MTProto 或使用部分 C++ 共享库，但 UI 层大量使用自定义 View 而非标准 Android 控件。
  - **通知**：拥有极其健壮的 Notification
    Service，保证在各种魔改 ROM 上也能收到消息。

#### Telegram X

- **定位**：实验性、更现代、动画更多。
- **架构**：**基于 TDLib**。
- **意义**：证明了 TDLib 的可行性，验证了全新的动画交互设计（如手势滑动、夜间模式切换动画）。

### 🖥️ Desktop (Qt)

- **语言**：C++
- **UI 框架**：Qt (即 QtWidgets)，但进行了深度定制。
- **特点**：
  - 极小的内存占用（相比 Electron 应用）。
  - 编译速度极快。
  - **自定义渲染**：气泡、贴纸等并非标准 Qt 控件，而是自行绘制。

### 🌐 Web (K & Z)

Telegram Web 不仅仅是网页，更是 **WebAssembly (WASM)** 的教科书级应用。

- **Web Z (Z 版本)**：
  - **框架**：**Teact** (自研的类 React 框架，更轻量) + TypeScript。
  - **协议**：自定义 MTProto JS 实现。
- **Web K (K 版本)**：
  - **框架**：原生 TypeScript，无重型框架依赖。
- **WASM 的应用**：
  - **加密解密**：AES-IGE、SHA-256 计算在 WASM 中运行，速度接近原生。
  - **媒体处理**：Opus 音频编码、RLottie 动画渲染。

---

## 3. TDLib：通用客户端引擎

**TDLib (Telegram Database Library)**
是 Telegram 开放给第三方开发者的"核武器"。它将复杂的 MTProto 协议、本地存储、网络同步封装成了一个黑盒。

### 架构图解

```
┌───────────────────────────────────────────────┐
│              Third-Party Client UI            │
│         (Swift / Kotlin / JS / Python)        │
└──────────────────────┬────────────────────────┘
                       │ JSON / TL-Object
          ┌────────────▼─────────────┐
          │      TDLib (C++)         │
          │ ┌──────────────────────┐ │
          │ │     Client Actor     │ │  ← 核心状态机
          │ └──────────┬───────────┘ │
          │            │             │
          │ ┌───────┐  │  ┌────────┐ │
          │ │NetQuery│  │ │SQLite3 │ │  ← 本地数据库
          │ └────┬──┘  │  └────┬───┘ │
          └──────┼─────┼───────┼─────┘
                 │     │       │
        MTProto  ▼     ▼       ▼
    ┌───────────────────────────────────────┐
    │           Telegram Cloud              │
    └───────────────────────────────────────┘
```

### 核心特性

1.  **跨平台**：C++ 编写，可编译到 iOS, Android, Windows, macOS, Linux, Web
    (WASM).
2.  **异步 Actor 模型**：
    - 内部使用 Actor pattern，保证线程安全和高并发。
    - 外部接口通过 `send` (发请求) 和 `receive`
      (收更新) 进行交互，类似 Redux 的单向数据流。
3.  **自包含数据库**：内置优化过的 SQLite，自动处理消息缓存、联系人同步、搜索索引。开发者无需关心数据怎么存，只管读。
4.  **弱网优化**：内置 MTProto 的所有黑科技（多 DC 连接、请求合并、断点续传）。

### 为什么官方 iOS 不用 TDLib？

虽然 TDLib 极其强大，但官方 iOS 客户端（开发早于 TDLib 成熟期）拥有自己维护多年的
`MTProtoKit`。且对于旗舰级产品，团队更倾向于全栈控制（Full Stack
Control）以压榨每一分性能，避免通用库带来的额外抽象开销。

---

## 4. 总结：性能优化的启示

Telegram 的架构给开发者的最大启示是：

1.  **不要害怕造轮子**：为了极致性能，Telegram 重写了 UI 框架（AsyncDisplayKit）、网络层（MTProto）、甚至 Web 框架（Teact）。
2.  **抽象层下沉**：将复杂的业务逻辑和数据处理下沉到 C++
    (TDLib/Core)，UI 层只负责渲染，既保证了性能又利于多端复用。
3.  **拥抱新技术**：WASM、Swift、Kotlin，Telegram 总是第一时间在生产环境大规模应用前沿技术。

---

## 参考资料

- [Telegram iOS 源码](https://github.com/TelegramMessenger/Telegram-iOS)
- [TDLib 官方文档](https://core.telegram.org/tdlib)
- [Telegram Web Z 源码](https://github.com/Ajaxy/telegram-tt)
- [AsyncDisplayKit (Texture)](https://texturegroup.org/)
