# Telegram 客户端架构深度解析

> 深入剖析 Telegram '极致速度' 背后的工程实现

## 1. 工程哲学：Native First

在 React Native、Flutter 等跨平台框架盛行的今天，Telegram 始终坚持 **'Native
First'（原生优先）** 的工程哲学。

**为什么不选择跨平台框架？**

- 考量维度：**启动速度**；Native 实现的优势：毫秒级冷启动；跨平台框架的痛点：需要加载 JS
  Bundle 或 Dart VM
- 考量维度：**滚动性能**；Native 实现的优势：60fps /
  120fps 丝般顺滑；跨平台框架的痛点：复杂列表容易掉帧
- 考量维度：**内存占用**；Native 实现的优势：极低（C++ 核心优化）；跨平台框架的痛点：较高，易触发 OOM
- 考量维度：**UI 细节**；Native 实现的优势：完美贴合平台规范（iOS 模糊、Android 涟漪）；跨平台框架的痛点：难以做到像素级还原
- 考量维度：**电池续航**；Native 实现的优势：高效利用硬件特性；跨平台框架的痛点：CPU 占用较高

Telegram 团队认为，**只有榨干每个平台的原生特性，才能提供极致的用户体验**。

---

## 2. 官方客户端架构详解

Telegram 的不同平台客户端并非简单的 '换皮'，而是针对该平台特性重新设计的工程艺术品。

### 🍎 iOS (The Flagship) — 源码级深度解析

> **📖 深度解析**：[iOS 前端架构深度解析](./ios-architecture.md) - 事无巨细地分析 AsyncDisplayKit 定制、SwiftSignalKit、Postbox 存储、MtProtoKit 等实现

iOS 版通常被视为 Telegram 的旗舰体验，其流畅度业界闻名。整个项目超过
**200 万行代码**，包含 **200+ 个子模块**，是 iOS 工程的教科书级实现。

| 属性         | 值                                                   |
| ------------ | ---------------------------------------------------- |
| **代码规模** | 200 万+ 行，200+ 子模块                              |
| **语言组成** | Swift (~70%) + Objective-C/C++ (~24%)                |
| **UI 框架**  | 深度定制的 AsyncDisplayKit (仅保留 35%)              |
| **响应式**   | SwiftSignalKit (自研，~2000 行 vs RxSwift ~20000 行) |
| **网络层**   | MtProtoKit (自实现，非 TDLib)                        |
| **数据库**   | Postbox + SQLite + SQLCipher                         |
| **构建系统** | Bazel (分布式缓存、可复现构建)                       |

**核心架构**：

```text
┌─────────────────────────────────────────────────────────────┐
│                    TelegramUI (界面层)                       │
├─────────────────────────────────────────────────────────────┤
│  TelegramCore │ SwiftSignalKit │ Postbox │ Display (Texture)│
├─────────────────────────────────────────────────────────────┤
│                    MtProtoKit (网络层)                       │
├─────────────────────────────────────────────────────────────┤
│              SQLCipher │ Lottie │ WebRTC │ FFmpeg           │
└─────────────────────────────────────────────────────────────┘
```

**关键技术亮点**：

- **AsyncDisplayKit 定制** - 移除 65% 原始代码，只保留核心 Node 系统
- **异步渲染** - 布局计算、图片解码全部在后台线程
- **TextNode** - 基于 CoreText 的自定义文本渲染
- **PushKit VoIP** - 利用 VoIP 推送实现后台消息接收

> **🔗 源码**：[Telegram iOS](https://github.com/nicedayc/nicedayc) ｜
> [MTProto 协议文档](https://core.telegram.org/mtproto)

---

### 🤖 Android (Official vs X) — 源码级深度解析

> **📖 深度解析**：[Android 前端架构深度解析](./android-architecture.md) - 事无巨细地分析自定义 View/Canvas 手绘、JNI 原生层、动画系统、性能分级等实现

Android 生态存在著名的 **'双客户端'** 策略：**官方版** (DrKLO/Telegram) 和
**Telegram X** (TGX-Android/Telegram-X)，展示了两种截然不同的架构思路。

---

**双客户端策略对比**：

| 维度         | 官方版 (DrKLO)             | Telegram X       |
| ------------ | -------------------------- | ---------------- |
| **架构**     | 自实现网络层 + 自定义 View | TDLib + 标准组件 |
| **语言**     | Java (~94%) + C++ (JNI)    | Java + Kotlin    |
| **性能**     | ⚡ 极致优化                | 良好             |
| **代码风格** | 巨型类、Canvas 手绘        | 模块化、更现代   |

**官方版核心特点**：

- **自定义 View 体系** - ChatMessageCell ~15000 行，完全手绘消息气泡
- **JNI 原生层** - tgnet (C++ 网络)、tgcalls (WebRTC 通话)
- **RecyclerListView** - 自定义 RecyclerView 实现
- **设备性能分级** - LOW/AVERAGE/HIGH 动态调整动画
- **可复现构建** - 支持验证 APK 与源码一致性

> **🔗 源码**：[Telegram Android (官方)](https://github.com/DrKLO/Telegram) ｜
> [Telegram X](https://github.com/TGX-Android/Telegram-X)

---

### 🌐 Web (K & Z) — 源码级深度解析

> **📖 深度解析**：
>
> - [Web Z 前端架构深度解析](./web-z-architecture.md) -
>   Teact 框架、GramJS、状态管理、虚拟滚动等
> - [Web K 前端架构深度解析](./web-k-architecture.md) - 无框架 DOM、自实现 MTProto、AES-IGE 加密等

Telegram Web 是 **WebAssembly (WASM)** 和现代 Web API 的教科书级实现。

**双版本对比**：

| 特性         | Web Z (A)            | Web K                |
| ------------ | -------------------- | -------------------- |
| **访问地址** | `web.telegram.org/a` | `web.telegram.org/k` |
| **框架**     | Teact (自研，~3KB)   | 原生 TypeScript      |
| **MTProto**  | GramJS (定制版)      | 完全自实现           |
| **开发者**   | Ajaxy (比赛冠军)     | morethanwords        |
| **特点**     | 更现代 UI、更多动画  | 更轻量、加载更快     |

**共同技术亮点**：

- **WASM 加速** - AES-IGE 加密、RLottie 动画、Opus 音频
- **Web Workers** - MTProto/加密/媒体处理移出主线程
- **虚拟滚动** - 只渲染可见消息，DOM 节点复用
- **IndexedDB** - 消息/媒体/用户数据本地持久化
- **完整 PWA** - 离线支持、推送通知、桌面安装

> **🔗 源码**：[Web Z (telegram-tt)](https://github.com/nicedayc/nicedayc) ｜
> [Web K (tweb)](https://github.com/nicedayc/nicedayc)

---

---

## 3. Desktop (tdesktop) — C++/Qt 跨平台客户端

Telegram Desktop 是 Telegram 在 Windows、macOS、Linux 上的统一客户端，代号
**tdesktop**。

---

### 3.1 技术栈

| 组件         | 技术选型                   |
| ------------ | -------------------------- |
| **编程语言** | C++ (~97.5%)               |
| **UI 框架**  | Qt 6 / Qt 5.15 (LGPL)      |
| **构建系统** | CMake                      |
| **加密**     | OpenSSL                    |
| **媒体处理** | FFmpeg                     |
| **音频**     | OpenAL Soft + Opus         |
| **通话**     | WebRTC                     |
| **崩溃报告** | Google Breakpad / Crashpad |

---

### 3.2 项目结构

```text
tdesktop/
├── Telegram/
│   ├── SourceFiles/
│   │   ├── core/                 # 核心基础设施
│   │   ├── data/                 # 数据模型
│   │   ├── mtproto/              # MTProto 协议实现
│   │   ├── storage/              # 本地存储
│   │   ├── ui/                   # UI 组件
│   │   ├── window/               # 窗口管理
│   │   ├── history/              # 聊天历史
│   │   ├── calls/                # 语音/视频通话
│   │   └── main/                 # 入口点
│   └── Resources/                # 资源文件
├── cmake/                        # CMake 配置
└── Telegram/lib_*/               # 内部库
```

---

### 3.3 Qt 框架使用

```cpp
// Telegram/SourceFiles/ui/widgets/buttons.cpp
// 自定义按钮组件示例

class RippleButton : public RpWidget {
public:
    void paintEvent(QPaintEvent *e) override {
        QPainter p(this);

        // 绘制背景
        p.fillRect(rect(), _backgroundColor);

        // 绘制涟漪动画（Material Design 风格）
        if (_ripple) {
            _ripple->paint(p, 0, 0, width());
        }

        // 绘制图标和文本
        paintIcon(p);
        paintText(p);
    }

private:
    std::unique_ptr<RippleAnimation> _ripple;
    QColor _backgroundColor;
};
```

---

### 3.4 macOS 原生适配

tdesktop 在 macOS 上使用 **原生 UIKit 组件** 而非 Qt，以获得更好的系统集成：

- 原生触控板手势
- 系统菜单栏集成
- Spotlight 搜索集成
- iCloud 文档同步

---

### 3.5 与移动端的差异

| 特性         | Desktop                | iOS/Android                 |
| ------------ | ---------------------- | --------------------------- |
| **协议实现** | 直接实现 MTProto       | iOS 自实现 / Android 自实现 |
| **UI 框架**  | Qt                     | Texture / 自定义 View       |
| **多账户**   | 完整支持（切换标签页） | 完整支持                    |
| **后台运行** | 常驻系统托盘           | 受系统限制                  |

---

> **🔗 源码参考**：
>
> - [Telegram Desktop (tdesktop)](https://github.com/telegramdesktop/tdesktop)
> - [构建指南](https://github.com/nicedayc/nicedayc/blob/dev/docs/building-cmake.md)

---

## 4. TDLib：通用客户端引擎

**TDLib (Telegram Database Library)**
是 Telegram 开放给第三方开发者的 "核武器"。它将复杂的 MTProto 协议、本地存储、网络同步封装成一个跨平台黑盒。

---

### 4.1 架构图解

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

---

### 4.2 核心设计：Actor Model

TDLib 的高性能源于其内部实现的 **Actor 并发模型**：

1. **无锁并发**：每个 Actor 独立执行，拥有私有状态，**绝不共享内存**
2. **避免死锁**：消除共享状态和锁竞争
3. **高吞吐量**：适合处理大量并发网络请求

---

### 4.3 跨平台支持

TDLib 支持几乎所有主流平台：

| 平台               | 支持状态    |
| ------------------ | ----------- |
| **Android**        | ✅ 原生 JNI |
| **iOS / macOS**    | ✅ 原生     |
| **Windows**        | ✅          |
| **Linux**          | ✅          |
| **Web (WASM)**     | ✅ 实验性   |
| **watchOS / tvOS** | ✅          |

---

### 4.4 语言绑定

TDLib 提供多种接口方式：

```text
┌─────────────────────────────────────────────────────────┐
│                    TDLib Core (C++)                      │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Native    │  │    JSON     │  │    .NET     │
│   C++ API   │  │  Interface  │  │  C++/CLI    │
└─────────────┘  └──────┬──────┘  └─────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ Python  │   │  Swift  │   │ Kotlin  │
    │ pytdlib │   │TDLibKit │   │  ktd    │
    └─────────┘   └─────────┘   └─────────┘
```

**JSON 接口**（推荐大多数场景）：

```json
// 发送请求
{
  "@type": "sendMessage",
  "chat_id": 123456789,
  "input_message_content": {
    "@type": "inputMessageText",
    "text": {
      "@type": "formattedText",
      "text": "Hello, World!"
    }
  },
  "@extra": "request_id_001"  // 用于匹配响应
}

// 接收响应
{
  "@type": "message",
  "id": 987654321,
  "chat_id": 123456789,
  "@extra": "request_id_001"
}
```

---

### 4.5 各语言集成示例

**Python (pytdlib / aiotdlib)**:

```python
from aiotdlib import Client

async def main():
    async with Client(api_id=API_ID, api_hash=API_HASH) as client:
        # 发送消息
        await client.send_message(
            chat_id=123456789,
            text="Hello from Python!"
        )

        # 监听新消息
        async for update in client.updates():
            if update.type == "updateNewMessage":
                print(f"New message: {update.message.text}")
```

**Swift (TDLibKit)**:

```swift
import TDLibKit

let client = TDLibClient()

// 发送消息
try await client.sendMessage(
    chatId: 123456789,
    inputMessageContent: .inputMessageText(
        .init(text: FormattedText(text: "Hello from Swift!"))
    )
)

// 监听更新
for await update in client.updates {
    if case .updateNewMessage(let message) = update {
        print("New message: \(message.content)")
    }
}
```

**Kotlin (ktd / libtd-ktx)**:

```kotlin
import kotlinx.coroutines.flow.collect

val client = TelegramClient(apiId, apiHash)

// 发送消息
client.sendMessage(
    chatId = 123456789,
    inputMessageContent = InputMessageText(
        text = FormattedText(text = "Hello from Kotlin!")
    )
)

// 使用 Flow 监听更新
client.updates.collect { update ->
    when (update) {
        is UpdateNewMessage -> println("New: ${update.message}")
    }
}
```

---

### 4.6 多账户支持

TDLib 原生支持多账户：

```cpp
// 每个账户使用独立的 TDLib 实例和数据目录

TdClient account1("./data/account_1");
TdClient account2("./data/account_2");
TdClient account3("./data/account_3");

// 并行处理更新
account1.receive();  // 独立的事件循环
account2.receive();
account3.receive();
```

---

### 4.7 知名第三方客户端

基于 TDLib 构建的优秀客户端：

| 客户端         | 平台          | 特点                             |
| -------------- | ------------- | -------------------------------- |
| **Unigram**    | Windows (UWP) | 微软应用商店最佳 Telegram 客户端 |
| **Telegram X** | Android       | 官方实验性客户端                 |
| **64Gram**     | Desktop       | 功能增强版 tdesktop              |
| **Nekogram**   | Android       | 隐私增强版                       |
| **Kotatogram** | Desktop       | 自定义功能丰富                   |

---

> **🔗 官方文档**：
>
> - [TDLib 核心概念](https://core.telegram.org/tdlib)
> - [TDLib GitHub](https://github.com/tdlib/td)
> - [TDLib JSON 接口](https://core.telegram.org/tdlib/docs/td__json__client_8h.html)

---

## 5. macOS 客户端架构

Telegram macOS 有**两个不同的客户端**：

1. **Telegram for macOS** (TelegramSwift) - 纯 Swift 原生实现
2. **Telegram Desktop** (tdesktop) - 跨平台 Qt/C++ 版本

本节聚焦 **TelegramSwift**，这是 macOS 平台的旗舰体验。

---

### 5.1 技术栈

| 组件         | 技术选型                                                       |
| ------------ | -------------------------------------------------------------- |
| **编程语言** | Swift (~60%) + Objective-C (~30%) + C++ (~10%)                 |
| **UI 框架**  | AppKit + 自定义视图                                            |
| **网络层**   | 自实现 MTProto                                                 |
| **数据库**   | SQLite + SQLCipher                                             |
| **动画**     | Core Animation + Lottie                                        |
| **仓库**     | [overtake/TelegramSwift](https://github.com/nicedayc/nicedayc) |

---

### 5.2 与 iOS 代码共享

TelegramSwift 与 iOS 版本共享**核心业务逻辑**，但 UI 层完全独立：

```text
共享代码                           平台独立
┌─────────────────────────┐       ┌─────────────────────────┐
│  MTProtoKit             │       │  iOS: UIKit + Texture   │
│  SwiftSignalKit         │       │  macOS: AppKit + 自定义  │
│  Postbox (数据存储)     │       │                         │
│  TelegramCore           │       │  完全不同的 UI 实现      │
└─────────────────────────┘       └─────────────────────────┘
```

**共享模块**：

- `MTProtoKit` - 网络协议
- `SwiftSignalKit` - 响应式编程
- `Postbox` - 本地数据存储
- `TelegramCore` - 核心业务逻辑

---

### 5.3 窗口管理

macOS 版采用**多窗口架构**，充分利用桌面端特性：

```swift
// 窗口类型
enum WindowType {
    case main           // 主聊天窗口
    case popup          // 弹出式聊天
    case mediaViewer    // 媒体查看器
    case voiceChat      // 语音聊天悬浮窗
    case settings       // 设置窗口
}

// 窗口控制器
class TelegramWindowController: NSWindowController {
    var windowType: WindowType

    override func windowDidLoad() {
        // 设置窗口样式
        window?.titlebarAppearsTransparent = true
        window?.styleMask.insert(.fullSizeContentView)

        // 启用 macOS 原生特性
        window?.isMovableByWindowBackground = true
        window?.toolbar?.showsBaselineSeparator = false
    }
}
```

---

### 5.4 macOS 特有功能

| 功能          | 实现方式                       |
| ------------- | ------------------------------ |
| **Touch Bar** | `NSTouchBar` 快捷操作          |
| **画中画**    | `PIPViewController` 视频悬浮   |
| **快速预览**  | Quick Look 文件预览            |
| **分享扩展**  | Share Extension                |
| **通知中心**  | `UserNotifications` + 快速回复 |
| **Spotlight** | Core Spotlight 搜索集成        |
| **Handoff**   | 与 iOS 设备无缝切换            |

---

### 5.5 消息列表实现

```swift
// macOS 使用 NSTableView 而非 UITableView
class ChatListView: NSTableView {
    // 自定义 Cell 绘制
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)

        // 绘制选中状态
        if isRowSelected(selectedRow) {
            NSColor.selectedContentBackgroundColor.setFill()
            dirtyRect.fill()
        }
    }
}

// 消息气泡
class MessageBubbleView: NSView {
    var message: Message?

    override func draw(_ dirtyRect: NSRect) {
        guard let context = NSGraphicsContext.current?.cgContext else { return }

        // 绘制气泡背景
        let bubblePath = NSBezierPath(roundedRect: bounds,
                                       xRadius: 12,
                                       yRadius: 12)

        if message?.isOutgoing == true {
            NSColor(hex: 0xEFFDDE).setFill()
        } else {
            NSColor.white.setFill()
        }

        bubblePath.fill()

        // 绘制文本
        message?.text?.draw(in: textRect, withAttributes: textAttributes)
    }
}
```

---

> **🔗 源码参考**：
>
> - [TelegramSwift (macOS)](https://github.com/nicedayc/nicedayc)

---

## 6. Desktop 客户端深入解析

在第 3 节基础上，深入分析 tdesktop 的实现细节。

---

### 6.1 自定义样式系统

tdesktop 使用**自研的样式描述语言**，而非 Qt 样式表：

```cpp
// Telegram/SourceFiles/ui/style/style_core.h
// 样式定义文件 (.style)

// 颜色定义
windowBg: #ffffff;
windowFg: #000000;
windowBgOver: #f4f4f5;
windowSubTextFg: #8a8a8a;

// 组件样式
historyToEnd: IconButton {
    width: 52px;
    height: 52px;
    icon: icon {{ "history_down", historyToEndFg }};
    iconOver: icon {{ "history_down", historyToEndFgOver }};
    ripple: RippleAnimation(windowBgRipple);
}
```

**样式编译流程**：

```text
.style 文件 → codegen_style 工具 → C++ 头文件
```

```cpp
// 生成的 C++ 代码
namespace st {
    extern const style::IconButton historyToEnd;
    extern const style::color windowBg;
    // ...
}
```

---

### 6.2 消息气泡绘制

```cpp
// Telegram/SourceFiles/history/view/history_view_message.cpp

void Message::paintBubble(Painter &p, const QRect &rect) {
    const auto bubble = this->bubble();
    if (!bubble) return;

    // 获取气泡路径
    auto path = bubble->path();

    // 设置填充色
    if (isOutgoing()) {
        p.setBrush(st::msgOutBg);
    } else {
        p.setBrush(st::msgInBg);
    }

    // 绘制气泡
    p.setPen(Qt::NoPen);
    p.drawPath(path);

    // 绘制阴影
    if (hasReply() || hasForward()) {
        paintReplyInfo(p, rect);
    }

    // 绘制内容
    paintContent(p, rect);

    // 绘制时间和状态
    paintInfo(p, rect);
}

// 气泡尾巴计算
QPath Message::bubbleTailPath() const {
    QPath path;

    if (isOutgoing()) {
        // 右侧尾巴
        path.moveTo(bubbleRight, bubbleBottom - tailHeight);
        path.lineTo(bubbleRight + tailWidth, bubbleBottom);
        path.lineTo(bubbleRight, bubbleBottom);
    } else {
        // 左侧尾巴
        path.moveTo(bubbleLeft, bubbleBottom - tailHeight);
        path.lineTo(bubbleLeft - tailWidth, bubbleBottom);
        path.lineTo(bubbleLeft, bubbleBottom);
    }

    return path;
}
```

---

### 6.3 主题系统

```cpp
// Telegram/SourceFiles/window/themes/window_theme.cpp

class Theme {
public:
    // 加载主题文件
    static bool Load(const QString &path) {
        QFile file(path);
        if (!file.open(QIODevice::ReadOnly)) {
            return false;
        }

        // 解析颜色定义
        while (!file.atEnd()) {
            auto line = file.readLine();
            auto parts = line.split(':');

            if (parts.size() == 2) {
                auto name = parts[0].trimmed();
                auto value = parseColor(parts[1].trimmed());
                _colors[name] = value;
            }
        }

        applyColors();
        return true;
    }

    // 应用颜色到全局样式
    static void applyColors() {
        st::windowBg = _colors["windowBg"];
        st::windowFg = _colors["windowFg"];
        // ... 更多颜色

        // 通知所有窗口重绘
        for (auto window : App::windows()) {
            window->update();
        }
    }

private:
    static QMap<QString, QColor> _colors;
};
```

---

### 6.4 动画引擎

```cpp
// Telegram/SourceFiles/ui/effects/animations.cpp

class Animation {
public:
    // 启动动画
    void start(float64 from, float64 to, crl::time duration) {
        _from = from;
        _to = to;
        _duration = duration;
        _startTime = crl::now();
        _running = true;

        // 注册到动画管理器
        AnimationManager::instance()->add(this);
    }

    // 更新动画值
    void update(crl::time now) {
        if (!_running) return;

        auto elapsed = now - _startTime;
        auto progress = std::min(1.0, double(elapsed) / _duration);

        // 应用缓动函数
        auto eased = ease(_easing, progress);
        _current = _from + (_to - _from) * eased;

        if (progress >= 1.0) {
            _running = false;
            if (_callback) {
                _callback();
            }
        }
    }

private:
    float64 _from, _to, _current;
    crl::time _duration, _startTime;
    bool _running = false;
    EasingType _easing = EasingType::OutCubic;
};

// 缓动函数
float64 ease(EasingType type, float64 t) {
    switch (type) {
        case EasingType::Linear:
            return t;
        case EasingType::OutCubic:
            return 1.0 - std::pow(1.0 - t, 3);
        case EasingType::InOutCubic:
            return t < 0.5
                ? 4 * t * t * t
                : 1 - std::pow(-2 * t + 2, 3) / 2;
        // ...
    }
}
```

---

## 7. 多客户端同步机制

Telegram 最核心的特性之一是**无缝多设备同步**。

---

### 7.1 云端同步架构

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Telegram Cloud                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   分布式消息存储                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │ Shard 1 │ │ Shard 2 │ │ Shard 3 │ │ Shard N │       │   │
│  │  │ DC1     │ │ DC2     │ │ DC4     │ │ DC5     │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ▲                                    │
│                            │ Session Token                      │
└────────────────────────────┼────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌─────▼─────┐        ┌────▼────┐
   │  Phone  │         │  Desktop  │        │   Web   │
   │ Session │         │  Session  │        │ Session │
   └─────────┘         └───────────┘        └─────────┘
```

---

### 7.2 Session 管理

```typescript
// Session 结构
interface Session {
  id: string; // Session ID
  authKey: Uint8Array; // 2048-bit Authorization Key
  dcId: number; // 主数据中心 ID
  userId: number; // 用户 ID
  deviceModel: string; // 设备型号
  platform: string; // 平台 (iOS/Android/Desktop/Web)
  appVersion: string; // 应用版本
  systemVersion: string; // 系统版本
  ip: string; // IP 地址
  region: string; // 地理位置
  dateCreated: number; // 创建时间
  dateActive: number; // 最后活跃时间
}

// 获取所有活跃会话
async function getActiveSessions(): Promise<Session[]> {
  return await api.call('account.getAuthorizations');
}

// 终止指定会话
async function terminateSession(sessionId: string): Promise<void> {
  await api.call('account.resetAuthorization', { hash: sessionId });
}

// 终止所有其他会话
async function terminateAllOtherSessions(): Promise<void> {
  await api.call('auth.resetAuthorizations');
}
```

---

### 7.3 消息同步协议

**同步流程**：

```text
新设备登录
    │
    ▼
① 获取 difference (增量同步)
    │
    ├─ updates.getDifference(pts, qts, date)
    │
    ▼
② 服务器返回
    │
    ├─ new_messages[]      ← 新消息
    ├─ new_encrypted_messages[]  ← 加密消息
    ├─ other_updates[]     ← 其他更新（已读状态等）
    ├─ chats[]             ← 聊天信息
    ├─ users[]             ← 用户信息
    └─ state (pts, qts, date, seq)  ← 新状态
    │
    ▼
③ 客户端应用更新
    │
    ├─ 存入本地数据库
    ├─ 更新 UI
    └─ 保存新 state
    │
    ▼
④ 监听实时更新
    │
    └─ Updates 推送流
```

**关键概念**：

| 概念     | 说明                              |
| -------- | --------------------------------- |
| **pts**  | Persistent Timestamp - 消息序列号 |
| **qts**  | 加密消息序列号                    |
| **date** | 最后更新时间戳                    |
| **seq**  | 更新序列号                        |

---

### 7.4 实时更新处理

```typescript
// 更新处理器
class UpdatesManager {
  private pts: number = 0;
  private qts: number = 0;
  private date: number = 0;

  // 处理更新
  async processUpdates(updates: Updates): Promise<void> {
    // 检查序列号
    if (updates.pts && updates.pts !== this.pts + updates.ptsCount) {
      // 序列号不连续，需要获取 difference
      await this.getDifference();
      return;
    }

    // 处理不同类型的更新
    for (const update of updates.updates) {
      await this.processUpdate(update);
    }

    // 更新状态
    this.pts = updates.pts || this.pts;
    this.date = updates.date || this.date;

    // 持久化状态
    await this.saveState();
  }

  // 处理单个更新
  private async processUpdate(update: Update): Promise<void> {
    switch (update._) {
      case 'updateNewMessage':
        await this.messagesManager.addMessage(update.message);
        break;

      case 'updateMessageID':
        await this.messagesManager.updateLocalId(update.random_id, update.id);
        break;

      case 'updateReadHistoryInbox':
        await this.dialogsManager.updateReadInbox(update.peer, update.max_id);
        break;

      case 'updateReadHistoryOutbox':
        await this.dialogsManager.updateReadOutbox(update.peer, update.max_id);
        break;

      case 'updateUserStatus':
        await this.usersManager.updateStatus(update.user_id, update.status);
        break;

      // ... 更多更新类型
    }
  }

  // 获取增量更新
  private async getDifference(): Promise<void> {
    const diff = await api.call('updates.getDifference', {
      pts: this.pts,
      qts: this.qts,
      date: this.date,
    });

    if (diff._ === 'updates.difference') {
      // 应用所有更新
      for (const message of diff.new_messages) {
        await this.messagesManager.addMessage(message);
      }

      for (const update of diff.other_updates) {
        await this.processUpdate(update);
      }

      // 更新状态
      this.pts = diff.state.pts;
      this.qts = diff.state.qts;
      this.date = diff.state.date;
    }
  }
}
```

---

### 7.5 离线消息处理

```typescript
// 离线期间的消息处理
class OfflineManager {
  private pendingMessages: Message[] = [];

  // 检测网络状态
  onNetworkChange(online: boolean): void {
    if (online) {
      this.syncOfflineMessages();
    }
  }

  // 同步离线消息
  async syncOfflineMessages(): Promise<void> {
    // 1. 获取服务器最新状态
    await updatesManager.getDifference();

    // 2. 发送本地待发送消息
    for (const msg of this.pendingMessages) {
      try {
        await this.sendMessage(msg);
      } catch (error) {
        if (error.code === 'MESSAGE_ALREADY_SENT') {
          // 消息已被其他设备发送
          this.removePending(msg);
        }
      }
    }

    // 3. 同步已读状态
    await this.syncReadState();
  }

  // 本地队列消息
  queueMessage(message: Message): void {
    message.status = 'pending';
    this.pendingMessages.push(message);

    // 持久化到本地存储
    storage.savePendingMessages(this.pendingMessages);
  }
}
```

---

### 7.6 Secret Chat 的特殊处理

Secret Chat **不参与多设备同步**：

```text
┌─────────────┐                    ┌─────────────┐
│  Device A   │◀──── E2E ────────▶│  Device B   │
│  (发起方)   │                    │  (接收方)   │
└─────────────┘                    └─────────────┘
       │                                  │
       │                                  │
       │    ┌─────────────────────┐      │
       │    │   Telegram Cloud    │      │
       └───▶│   不存储密钥        │◀─────┘
            │   只转发密文        │
            └─────────────────────┘
```

**限制**：

- 只能在发起设备上查看
- 换设备后历史消息不可恢复
- 不支持云端备份

---

### 7.7 本地搜索引擎

Telegram 的搜索速度极快，依赖于 **FTS5 全文搜索**。

```sql
-- 创建 FTS5 虚拟表
CREATE VIRTUAL TABLE messages_fts USING fts5(
    text,
    content='messages',
    content_rowid='rowid',
    tokenize='unicode61'
);

-- 搜索消息
SELECT m.* FROM messages m
JOIN messages_fts fts ON m.rowid = fts.rowid
WHERE messages_fts MATCH 'search query'
ORDER BY m.date DESC
LIMIT 50;
```

**索引策略**：

```typescript
// 消息索引
class SearchIndex {
  // 索引消息
  async indexMessage(message: Message): Promise<void> {
    if (!message.text) return;

    // 分词
    const tokens = this.tokenize(message.text);

    // 写入 FTS 表
    await db.exec(
      `
            INSERT INTO messages_fts(rowid, text)
            VALUES (?, ?)
        `,
      [message.id, message.text],
    );
  }

  // 搜索
  async search(query: string, options: SearchOptions): Promise<Message[]> {
    const { peerId, limit = 50, offset = 0 } = options;

    let sql = `
            SELECT m.* FROM messages m
            JOIN messages_fts fts ON m.rowid = fts.rowid
            WHERE messages_fts MATCH ?
        `;

    if (peerId) {
      sql += ` AND m.peer_id = ${peerId}`;
    }

    sql += ` ORDER BY m.date DESC LIMIT ${limit} OFFSET ${offset}`;

    return await db.query(sql, [query]);
  }

  // 中文分词（需要额外处理）
  private tokenize(text: string): string[] {
    // 使用 ICU 分词或自定义分词器
    return text.split(/\s+/);
  }
}
```

---

> **🔗 相关文档**：
>
> - [Telegram Updates](https://core.telegram.org/api/updates)
> - [Authorization](https://core.telegram.org/api/auth)

---

## 8. 总结：Telegram 的工程启示

### 8.1 核心设计原则

1. **掌控核心技术栈**：不惜维护定制版框架（iOS Texture、Web
   Teact），确保极致体验
2. **性能至上**：将计算密集型任务（加密、布局、媒体）从主线程剥离到 C++ / WASM /
   Workers
3. **开放与透明**：开源客户端代码 + 可复现构建，建立安全信任
4. **Native First**：拒绝跨平台框架，为每个平台深度优化

---

### 8.2 跨平台策略对比

```text
┌─────────────────────────────────────────────────────────────┐
│                    Telegram 技术栈全景                       │
├─────────────┬───────────────────────────────────────────────┤
│   iOS       │ Swift/ObjC + 定制 Texture + MtProtoKit        │
├─────────────┼───────────────────────────────────────────────┤
│   macOS     │ Swift + AppKit + 共享核心模块                 │
├─────────────┼───────────────────────────────────────────────┤
│   Android   │ Java + 自定义 View + JNI (tgnet/voip)         │
├─────────────┼───────────────────────────────────────────────┤
│   Desktop   │ C++ + Qt + 直接实现 MTProto                   │
├─────────────┼───────────────────────────────────────────────┤
│   Web Z     │ TypeScript + Teact + GramJS                   │
├─────────────┼───────────────────────────────────────────────┤
│   Web K     │ TypeScript + 原生 DOM + 自实现 MTProto        │
├─────────────┼───────────────────────────────────────────────┤
│  第三方      │ 任意语言 + TDLib (JSON/Native)                │
└─────────────┴───────────────────────────────────────────────┘
```

---

### 8.3 与竞品架构对比

| 维度           | Telegram       | WhatsApp             | Signal          |
| -------------- | -------------- | -------------------- | --------------- |
| **开源客户端** | ✅ 全部开源    | ❌ 闭源              | ✅ 全部开源     |
| **协议层**     | MTProto (自研) | 基于 Signal Protocol | Signal Protocol |
| **跨平台策略** | Native First   | React Native (部分)  | Native          |
| **第三方 SDK** | TDLib          | ❌ 无                | libsignal       |
| **可复现构建** | ✅ 支持        | ❌ 不支持            | ✅ 支持         |
| **E2E 加密**   | 仅 Secret Chat | 默认启用             | 默认启用        |

---

### 8.4 对开发者的启示

1. **不要过度依赖第三方**：Telegram 自研 UI 框架、协议层、响应式库，获得了完全控制权
2. **性能是功能**：极致的滚动流畅度和启动速度本身就是核心竞争力
3. **开源建立信任**：在隐私敏感领域，开源是最好的安全审计
4. **模块化设计**：200+ 子模块的 iOS 项目证明了良好架构的重要性
5. **渐进式复杂度**：TDLib 对新手友好，但高级用户可以深入定制

---

## 参考文献与链接

- **官方资源**
  - Telegram Apps Source Code <https://telegram.org/apps#source-code>
  - Reproducible Builds for Android
    <https://core.telegram.org/reproducible-builds>
  - TDLib - Telegram Database Library <https://core.telegram.org/tdlib>

- **技术分析**
  - AsyncDisplayKit (Texture) 官方文档 <https://texturegroup.org/>
  - Telegram iOS 架构分析 (Hubo.dev)
    <https://hubo.dev/blog/telegram-ios-architecture/>
  - Citizen Lab 对微信安全性的分析 (作为对比参考)
    <https://citizenlab.ca/2020/05/wechat-surveillance-explained/>
