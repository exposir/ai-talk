# Telegram 客户端架构深度解析

> 深入剖析 Telegram '极致速度' 背后的工程实现

## 1. 工程哲学：Native First

在 React Native、Flutter 等跨平台框架盛行的今天，Telegram 始终坚持 **'Native First'（原生优先）** 的工程哲学。

**为什么不选择跨平台框架？**

- 考量维度：**启动速度**；Native 实现的优势：毫秒级冷启动；跨平台框架的痛点：需要加载 JS Bundle 或 Dart VM
- 考量维度：**滚动性能**；Native 实现的优势：60fps / 120fps 丝般顺滑；跨平台框架的痛点：复杂列表容易掉帧
- 考量维度：**内存占用**；Native 实现的优势：极低（C++ 核心优化）；跨平台框架的痛点：较高，易触发 OOM
- 考量维度：**UI 细节**；Native 实现的优势：完美贴合平台规范（iOS 模糊、Android 涟漪）；跨平台框架的痛点：难以做到像素级还原
- 考量维度：**电池续航**；Native 实现的优势：高效利用硬件特性；跨平台框架的痛点：CPU 占用较高

Telegram 团队认为，**只有榨干每个平台的原生特性，才能提供极致的用户体验**。

---

## 2. 官方客户端架构详解

Telegram 的不同平台客户端并非简单的 '换皮'，而是针对该平台特性重新设计的工程艺术品。

### 🍎 iOS (The Flagship)

iOS 版通常被视为 Telegram 的旗舰体验，其流畅度业界闻名。

- **语言**：Objective-C（核心历史代码）+ Swift（新功能）
- **核心组件**：
  - **MTProtoKit**：完全重写的 Objective-C 网络层，非 TDLib。专为 iOS 的后台机制和网络特性优化。
  - **AsyncDisplayKit (Texture) 的魔改版**：
    - Telegram 并未直接使用官方 Texture，而是维护了一个**深度定制的分支**。
    - **核心精简**：只保留了核心的 Node 系统（约 35% 代码），去除了 Flexbox 布局引擎、Yoga 引擎和 ASTableNode
      等重量级组件。
    - **手动布局**：为了极致性能，Telegram 摒弃了自动布局，大量使用手动计算 Frame
      的方式，配合 `asyncLayout` 方法在后台线程预计算布局。
    - **列表倒置**：聊天列表通过旋转 180° 的 `ListView` 实现，由底向上排列，确保新消息自然出现在底部。
  - **渲染优化**：大量的文本计算、图片解码都在后台线程完成，主线程仅负责提交渲染指令。

> **🔗 源码参考**：
> - Telegram-iOS GitHub
>   <https://github.com/TelegramMessenger/Telegram-iOS>
> - Texture 官方文档
>   <https://texturegroup.org/>

### 🤖 Android (Official vs X)

Android 生态存在著名的 '双客户端' 策略，展示了两种不同的架构思路。

#### 官方版 (Telegram for Android)

- **定位**：稳定、兼容性好、功能最全。
- **架构**：
  - **语言**：Java (主要) + C++ (JNI)。
  - **核心**：直接实现 MTProto，UI 层大量使用自定义 View。
  - **可复现构建 (Reproducible Builds)**：
    - Telegram 是少数支持 Android 可复现构建的主流 App。
    - 用户可以使用 Docker 环境，基于公开源码编译出与 Google Play 一模一样的 APK。
    - 验证工具：`apkdiff.py` 可对比自编译包与官方包的二进制差异（通常仅签名不同）。

#### Telegram X

- **定位**：实验性、更现代、动画更多。
- **架构**：**基于 TDLib**。
- **设计目标**：验证 TDLib 在 Android 上的性能，并尝试通过 C++ 共享更多逻辑。
- **交互**：拥有更流畅的手势操作和即时夜间模式切换。

> **🔗 源码参考**：
> - Telegram Android
>   <https://github.com/DrKLO/Telegram>
> - Reproducible Builds 指南
>   <https://core.telegram.org/reproducible-builds>

### 🌐 Web (K & Z)

Telegram Web 不仅仅是网页，更是 **WebAssembly (WASM)** 的教科书级应用。由于历史原因（Lightweight Client
Contest），存在两个官方版本。

- **Web Z (Z 版本)**：
  - **框架**：**Teact**（自研的类 React 框架，更轻量，去除了 React 的兼容性包袱） + TypeScript。
  - **协议**：自定义 MTProto JS 实现。
- **Web K (K 版本)**：
  - **框架**：原生 TypeScript，无重型框架依赖，架构更接近 'Vanilla JS'。
- **WASM 的深度应用**：
  - **加密解密**：AES-IGE、SHA-256 等高频加密操作编译为 WASM 模块，性能接近原生代码。
  - **媒体处理**：Opus 音频编码器、RLottie 动画渲染器均运行在 WASM 中，解决了 JS 处理二进制数据的性能瓶颈。

> **🔗 源码参考**：
> - Web Z 源码
>   <https://github.com/Ajaxy/telegram-tt>
> - Web K 源码
>   <https://github.com/morethanwords/tweb>

---

## 3. TDLib：通用客户端引擎

**TDLib (Telegram Database Library)** 是 Telegram 开放给第三方开发者的'核武器'。它将复杂的 MTProto
协议、本地存储、网络同步封装成了一个黑盒。

### 架构图解

```text
┌───────────────────────────────────────────────┐
│              Third-Party Client UI            │
│         (Swift / Kotlin / JS / Python)        │
└──────────────────────┬────────────────────────┘
                       │ JSON / TL-Object Interface
          ┌────────────▼─────────────┐
          │      TDLib (C++)         │
          │ ┌──────────────────────┐ │
          │ │    Actor Model       │ │  ← 核心并发模型
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

### 核心设计：Actor Model

TDLib 的高性能源于其内部实现的 **Actor 并发模型**：

1.  **无锁并发**：每个 Actor 都是独立的执行单元，拥有私有状态。Actor 之间**绝不共享内存**，只通过消息传递交互。
2.  **避免死锁**：由于消除了共享状态和锁竞争，TDLib 几乎彻底杜绝了多线程编程中常见的死锁问题。
3.  **高吞吐量**：这种模型非常适合处理大量的并发网络请求（如同时加载成百上千个聊天会话）。

### 开发者接口

TDLib 对外暴露极其简单的接口，类似于 Redux 的单向数据流：

- **`send(function)`**：发送请求（如 `sendMessage`, `getChats`）。
- **`receive()`**：轮询获取更新（Updates），所有数据变更（新消息、用户上线）都通过此接口异步推送。

> **🔗 官方文档**：
> - TDLib 核心概念
>   <https://core.telegram.org/tdlib>
> - GitHub 仓库
>   <https://github.com/tdlib/td>

---

## 4. 总结：Telegram 的工程启示

1.  **掌控核心技术栈**：为了极致体验，不惜维护定制版的 UI 框架（iOS Texture 改版）和 Web
    框架（Teact）。
2.  **性能至上**：将繁重的计算（加密、布局、媒体处理）从主线程剥离，利用 C++ / WASM /
    Background Threads 解决。
3.  **开放与透明**：通过开源客户端代码和支持可复现构建，建立了极高的安全信任度。

---

## 参考文献与链接

- **官方资源**
  - Telegram Apps Source Code
    <https://telegram.org/apps#source-code>
  - Reproducible Builds for Android
    <https://core.telegram.org/reproducible-builds>
  - TDLib - Telegram Database Library
    <https://core.telegram.org/tdlib>

- **技术分析**
  - AsyncDisplayKit (Texture) 官方文档
    <https://texturegroup.org/>
  - Telegram iOS 架构分析 (Hubo.dev)
    <https://hubo.dev/blog/telegram-ios-architecture/>
  - Citizen Lab 对微信安全性的分析 (作为对比参考)
    <https://citizenlab.ca/2020/05/wechat-surveillance-explained/>
