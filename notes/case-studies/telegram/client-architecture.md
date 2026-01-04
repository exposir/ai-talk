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

#### 2.1.1 代码结构与模块化

**语言组成**：Swift (~70%) + Objective-C/C++ (~24%) + 其他 (~6%)

**五大模块分类**：

```text
Telegram-iOS/
├── submodules/
│   ├── App/              # 核心应用功能
│   │   ├── TelegramCore/     # 核心业务逻辑
│   │   ├── TelegramUI/       # UI 组件库
│   │   ├── Display/          # 自定义 Node 系统
│   │   ├── ItemListUI/       # 列表 UI 组件
│   │   ├── AccountContext/   # 账户上下文管理
│   │   └── ...               # 100+ 其他模块
│   ├── VoIP/             # 语音/视频通话
│   │   ├── libtgvoip/        # 底层 VoIP 库 (C++)
│   │   └── CallKit/          # iOS 系统通话集成
│   ├── Watch/            # Apple Watch 应用
│   ├── TON/              # Telegram Open Network (实验性)
│   └── 3rd-party/        # 第三方依赖
│       ├── AsyncDisplayKit/  # 定制版 Texture
│       ├── SQLCipher/        # 加密数据库
│       ├── Lottie/           # 动画库
│       └── ...
```

---

#### 2.1.2 构建系统：Bazel

Telegram iOS 使用
**Bazel**（Google 的开源构建工具）管理整个项目，早期曾使用 Buck（Facebook 的构建系统）。

**选择 Bazel 的原因**：

1. **增量构建**：只重新编译变更的模块，大型项目构建时间从 10+ 分钟缩短到秒级
2. **依赖管理**：自动解析 200+ 模块间的复杂依赖关系
3. **可复现构建**：确保开源代码编译结果与 App Store 版本完全一致
4. **跨平台支持**：支持 macOS、iOS、watchOS 多目标编译

**构建流程**：

```bash
# 1. 生成 Xcode 项目（用于开发调试）
python3 build-system/Make/Make.py \
    --cacheDir="$HOME/telegram-bazel-cache" \
    generateProject \
    --configurationPath=path/to/configuration

# 2. 构建 IPA（发布包）
python3 build-system/Make/Make.py \
    --cacheDir="$HOME/telegram-bazel-cache" \
    build \
    --configuration=release_arm64
```

> **📌 关键文件**：
>
> - `build-system/Make/Make.py` — 主构建脚本
> - `WORKSPACE` — Bazel 工作区配置
> - `BUILD` 文件 — 各模块的构建规则

---

#### 2.1.3 网络层：MTProtoKit

Telegram iOS **并未使用 TDLib**，而是维护了一套完全独立的 Objective-C 网络层
`MtProtoKit`，专为 iOS 的后台机制和网络特性深度优化。

**核心架构**：

```text
┌─────────────────────────────────────────────────────────┐
│                    TelegramCore                         │
│              (业务逻辑 + API 封装)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    MtProtoKit                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  MTProto 2.0 协议实现                            │   │
│  │  • AES-256-IGE 加密                             │   │
│  │  • SHA-256 消息认证                             │   │
│  │  • RSA-2048 密钥交换                            │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  传输层                                          │   │
│  │  • TCP (主要) / HTTP / WebSocket                │   │
│  │  • 自动 DC 迁移                                 │   │
│  │  • 网络状态监测 + 重连策略                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**iOS 专属优化**：

| 特性           | 实现方式                                         |
| -------------- | ------------------------------------------------ |
| **后台保活**   | 利用 PushKit VoIP 推送接收后台数据（非仅通话）   |
| **实时位置**   | 后台位置更新通过 VoIP 推送触发，而非传统位置服务 |
| **未读计数**   | 通过 VoIP 推送隐式更新，无需唤醒主 App           |
| **多 DC 连接** | 同时维护到多个数据中心的连接，智能切换           |

> **🔗 源码路径**：`submodules/MtProtoKit/Sources/`

---

#### 2.1.4 UI 框架：深度定制的 AsyncDisplayKit

Telegram 对 AsyncDisplayKit（现名 Texture）进行了**激进的定制**，移除了约
**65%** 的原始代码。

**定制策略**：

| 原版功能                           | Telegram 处理                  |
| ---------------------------------- | ------------------------------ |
| `ASTableNode` / `ASCollectionNode` | ❌ 移除，使用自研 `ListView`   |
| Flexbox + Yoga 布局引擎            | ❌ 移除，采用手动布局          |
| `ASNetworkImageNode`               | ❌ 移除，因 MTProto 下载不兼容 |
| `ASViewController`                 | ❌ 移除，自研 `ViewController` |
| 核心 Node 系统                     | ✅ 保留并扩展                  |

**自研 Node 体系**（分布在 `Display`、`TelegramUI`、`ItemListUI` 等模块）：

```swift
// 核心抽象 —— 所有 UI 组件的基类
class ASDisplayNode {
    var view: UIView { get }           // 惰性创建 UIView
    var layer: CALayer { get }

    // 关键方法：异步布局计算
    func asyncLayout() -> (CGSize) -> (CGSize, () -> Void) {
        // 返回一个闭包，可在后台线程执行布局计算
        // 第二个闭包在主线程应用布局结果
    }
}

// Telegram 扩展的专用 Node
├── TextNode                    // 富文本渲染 (基于 CoreText)
├── ImmediateTextNode           // 快速文本渲染
├── ImageNode                   // 图片显示
├── AnimatedStickerNode         // Lottie 动画贴纸
├── MediaPlayNode               // 视频帧渲染
├── WebEmbedPlayerNode          // 内嵌网页播放器
├── ChatMessageBubbleItemNode   // 聊天气泡容器
└── ... (数百个自定义 Node)
```

**手动布局示例**：

```swift
// TelegramUI/ChatMessageBubbleItemNode.swift 中的布局逻辑
static func asyncLayout(_ item: ChatMessageItem)
    -> (CGFloat, CGFloat) -> (CGSize, (ListViewItemUpdateAnimation) -> Void) {

    // 第一阶段：后台线程计算
    return { width, height in
        let messageWidth = width - 80  // 手动计算边距
        let textLayout = TextNode.asyncLayout(item.text)(messageWidth)
        let bubbleHeight = textLayout.size.height + 24

        // 第二阶段：主线程应用
        return (CGSize(width: width, height: bubbleHeight), { animation in
            self.textNode.frame = CGRect(x: 12, y: 8,
                                          width: textLayout.size.width,
                                          height: textLayout.size.height)
        })
    }
}
```

---

#### 2.1.5 响应式编程：SSignalKit / SwiftSignalKit

Telegram 完全**避开了 RxSwift / Combine**，自研了轻量级响应式框架。

**演进历史**：

- `MTSignal` → Objective-C 版本，用于 MtProtoKit
- `SSignalKit` → Objective-C 增强版
- `SwiftSignalKit` → Swift 移植版，现为主力

**核心概念**：

```swift
// Signal —— 代表一个异步值序列
public final class Signal<T, E> {
    public func start(next: @escaping (T) -> Void,
                      error: @escaping (E) -> Void,
                      completed: @escaping () -> Void) -> Disposable
}

// Promise —— 可写入的单值信号
public final class Promise<T> {
    public var signal: Signal<T, NoError>
    public func set(_ signal: Signal<T, NoError>)
}

// 实际使用示例 —— 获取聊天列表
func fetchChatList() -> Signal<[Chat], MTRpcError> {
    return network.request(Api.messages.getDialogs(...))
        |> mapToSignal { dialogs -> Signal<[Chat], MTRpcError> in
            return processDialogs(dialogs)
        }
        |> deliverOnMainQueue
}

// UI 绑定
self.chatListDisposable = fetchChatList().start(next: { [weak self] chats in
    self?.updateChatList(chats)
}, error: { error in
    // 处理错误
})
```

**为何自研？**

1. **零依赖**：不受第三方库版本和 API 变更影响
2. **极致轻量**：核心代码约 2000 行，RxSwift 约 20000 行
3. **完全控制**：可针对 Telegram 特定场景深度优化

---

#### 2.1.6 数据存储：Postbox + SQLite

**存储架构**：

```text
Container/
└── telegram-data/                    # Group Container (共享给 App Extension)
    └── account-{id}/
        └── postbox/
            └── db/
                └── db_sqlite         # 主数据库 (SQLCipher 加密)
```

**技术栈**：

| 组件             | 用途                          |
| ---------------- | ----------------------------- |
| **SQLite**       | 核心存储引擎                  |
| **SQLCipher**    | 数据库全盘加密                |
| **FTS5**         | 全文搜索（消息搜索功能）      |
| **自定义序列化** | TL (Type Language) 二进制格式 |

**Postbox 核心模块**：

```swift
// submodules/Postbox/Sources/Postbox.swift
public final class Postbox {
    // 消息存储
    public func messageHistory(peerId: PeerId) -> Signal<[Message], NoError>

    // 事务操作
    public func transaction<T>(_ f: @escaping (Transaction) -> T) -> Signal<T, NoError>

    // 实时监听变更
    public func messageHistoryObserver(peerId: PeerId) -> Signal<MessageHistoryUpdate, NoError>
}
```

**数据共享**：

- 主 App、Widget、Share Extension、Watch App 通过 **App Group Container**
  共享同一数据库
- 使用 Darwin notify 机制在进程间同步数据变更

---

#### 2.1.7 消息列表渲染：ListView + ChatMessageBubbleContentNode

聊天列表是 Telegram 性能的核心战场。在 iPhone 6s (iOS 13.5) 上实测可保持 **58+
FPS**。

**核心组件层次**：

```text
ChatHistoryListNode (ListView 子类)
└── ChatMessageBubbleItemNode (气泡容器)
    └── ChatMessageBubbleContentNode (内容节点)
        ├── ChatMessageTextBubbleContentNode        # 纯文本
        ├── ChatMessageMediaBubbleContentNode       # 图片/视频
        ├── ChatMessageFileBubbleContentNode        # 文件附件
        ├── ChatMessageWebpageBubbleContentNode     # 链接预览
        ├── ChatMessageAnimatedStickerContentNode   # 动画贴纸
        ├── ChatMessageVoiceContentNode             # 语音消息
        └── ... (更多内容类型)
```

**列表倒置技巧**：

```swift
// ListView 通过 CATransform3D 旋转 180°
listView.transform = CATransform3DMakeRotation(CGFloat.pi, 1, 0, 0)

// 每个 Cell 再反向旋转 180°
cell.transform = CATransform3DMakeRotation(CGFloat.pi, 1, 0, 0)

// 效果：滚动方向自然，新消息从底部出现
```

**性能优化策略**：

1. **完全异步渲染**：文本 (CoreText)、图片解码、布局计算全部在后台线程
2. **预计算缓存**：`asyncLayout` 返回的布局结果可缓存复用
3. **渐进式加载**：快速滚动时显示占位符，停止后加载真实内容
4. **智能复用**：Node 层级的 Cell 复用，比 UITableViewCell 更轻量

---

#### 2.1.8 UIKit 重新实现

Telegram 对系统 UIKit 组件的行为不满意，**从零重写了多个核心控制器**：

```swift
// 自研控制器 vs 系统控制器
NavigationController      // 替代 UINavigationController
TabBarController          // 替代 UITabBarController
AlertController           // 替代 UIAlertController
ActionSheetController     // 替代 UIAlertController (ActionSheet)
ContextMenuController     // 替代 UIContextMenuInteraction
```

**重写原因**：

- 系统控制器在不同 iOS 版本行为不一致
- 无法完全控制动画曲线和时长
- 系统组件的手势冲突难以解决
- 需要支持复杂的自定义转场

---

> **🔗 源码参考**：
>
> - [Telegram-iOS GitHub](https://github.com/TelegramMessenger/Telegram-iOS)
> - [Texture 官方文档](https://texturegroup.org/)
> - [MTProto 协议文档](https://core.telegram.org/mtproto)

### 🤖 Android (Official vs X) — 源码级深度解析

> **📖 深度解析**：[Android 前端架构深度解析](./android-architecture.md) - 事无巨细地分析自定义 View/Canvas 手绘、JNI 原生层、动画系统、性能分级等实现

Android 生态存在著名的 **'双客户端'** 策略：**官方版** (DrKLO/Telegram) 和
**Telegram X** (TGX-Android/Telegram-X)，展示了两种截然不同的架构思路。

---

#### 2.2.1 官方版 (Telegram for Android)

**定位**：稳定、兼容性最广、功能最全，是 Telegram 的主力 Android 客户端。

**语言组成**：Java (~94%) + C++ (JNI, ~5%) + 其他 (~1%)

##### 2.2.1.1 项目结构

```text
Telegram/  (DrKLO/Telegram)
├── TMessagesProj/
│   ├── jni/                      # C++ 原生代码
│   │   ├── tgnet/                    # MTProto 网络层
│   │   ├── voip/                     # VoIP 通话引擎
│   │   ├── image.cpp                 # 图片处理
│   │   ├── video.cpp                 # 视频处理
│   │   └── ffmpeg/                   # FFmpeg 集成
│   └── src/main/java/org/telegram/
│       ├── messenger/                # 核心业务逻辑
│       │   ├── MessageObject.java        # 消息数据模型
│       │   ├── MessagesController.java   # 消息管理器
│       │   ├── ConnectionsManager.java   # 连接管理
│       │   └── NotificationCenter.java   # 事件总线
│       ├── ui/                       # UI 层
│       │   ├── ChatActivity.java         # 聊天界面
│       │   ├── DialogsActivity.java      # 会话列表
│       │   ├── Cells/                    # 自定义 Cell 组件
│       │   └── Components/               # 自定义 UI 组件
│       └── tgnet/                    # Java 层网络封装
```

---

##### 2.2.1.2 UI 哲学：极致的自定义 View

Telegram
Android 的 UI 层采用了**极端的自定义策略**：几乎所有复杂组件都**直接继承 View 并重写
`onDraw()`**，使用 `Canvas` API 手动绘制。

**为什么不用标准 Android 组件？**

| 标准方案       | Telegram 做法              | 理由                              |
| -------------- | -------------------------- | --------------------------------- |
| `TextView`     | 自定义 `Canvas.drawText()` | 精确控制文本渲染、支持复杂富文本  |
| `ImageView`    | 自定义绘制 + 异步解码      | 控制内存、支持渐进式加载          |
| `RecyclerView` | 自研 `RecyclerListView`    | 更精细的滚动/动画控制             |
| XML 布局       | Java 代码动态布局          | 运行时灵活调整、减少 inflate 开销 |

**核心绘制示例**：

```java
// org/telegram/ui/Cells/ChatMessageCell.java
// 消息气泡的绘制逻辑（简化版）
@Override
protected void onDraw(Canvas canvas) {
    // 1. 绘制气泡背景
    canvas.drawPath(bubblePath, bubblePaint);

    // 2. 绘制头像（圆形裁剪）
    if (avatarImage != null) {
        avatarImage.draw(canvas);
    }

    // 3. 绘制消息文本
    if (textLayout != null) {
        canvas.save();
        canvas.translate(textX, textY);
        textLayout.draw(canvas);  // StaticLayout 文本
        canvas.restore();
    }

    // 4. 绘制时间戳
    canvas.drawText(timeString, timeX, timeY, timePaint);

    // 5. 绘制双勾（已读状态）
    if (isRead) {
        canvas.drawPath(checkPath, checkPaint);
    }
}
```

**自研 RecyclerListView**：

```java
// org/telegram/ui/Components/RecyclerListView.java
public class RecyclerListView extends RecyclerView {
    // 扩展功能：
    // 1. 内置点击/长按事件处理
    // 2. 快速滚动指示器
    // 3. 空状态视图支持
    // 4. 节头吸顶效果
    // 5. 滑动删除/置顶手势

    public interface OnItemClickListener {
        void onItemClick(View view, int position);
    }

    public interface OnItemLongClickListener {
        boolean onItemClick(View view, int position);
    }
}
```

---

##### 2.2.1.3 JNI 原生层：性能关键路径

Telegram 将所有**性能敏感**的操作下沉到 C++ 层，通过 JNI 调用：

```text
┌─────────────────────────────────────────────────────┐
│                   Java Layer                         │
│  ConnectionsManager.java ←→ MessagesController.java │
└──────────────────────┬──────────────────────────────┘
                       │ JNI
┌──────────────────────▼──────────────────────────────┐
│                   C++ Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   tgnet     │  │   voip      │  │  ffmpeg     │  │
│  │ (MTProto)   │  │ (libtgvoip) │  │ (媒体处理)   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

**tgnet 模块**（C++ MTProto 实现）：

```cpp
// jni/tgnet/ConnectionsManager.cpp
void ConnectionsManager::sendRequest(TLObject *request, ...) {
    // 1. 序列化 TL 对象
    NativeByteBuffer *buffer = request->serialize();

    // 2. 加密（AES-256-IGE）
    encryptBuffer(buffer, authKey);

    // 3. 发送到服务器
    connection->sendData(buffer);
}
```

**VoIP 模块**（语音/视频通话）：

```cpp
// jni/voip/VoIPController.cpp
class VoIPController {
    // 音频处理链
    AudioInput* audioInput;        // 麦克风输入
    EchoCanceller* echoCanceller;  // 回声消除 (WebRTC AEC)
    NoiseSuppressor* noiseSuppressor;  // 噪声抑制
    OpusEncoder* encoder;          // Opus 编码

    // 网络层
    JitterBuffer* jitterBuffer;    // 抖动缓冲
    PacketReassembler* reassembler;
};
```

**性能收益**：

- **网络请求**：C++ 直接操作 socket，避免 Java GC 影响
- **加密运算**：AES-NI 指令集加速，比 Java 快 10x+
- **媒体处理**：FFmpeg 硬件解码支持

---

##### 2.2.1.4 动画系统：CubicBezierInterpolator

Telegram 的流畅动画源于自研的时间插值器系统：

```java
// org/telegram/ui/Components/CubicBezierInterpolator.java
public class CubicBezierInterpolator implements Interpolator {

    // 预定义的常用曲线
    public static final CubicBezierInterpolator EASE_OUT =
        new CubicBezierInterpolator(0, 0, 0.58, 1.0);
    public static final CubicBezierInterpolator EASE_OUT_QUINT =
        new CubicBezierInterpolator(0.23, 1, 0.32, 1);
    public static final CubicBezierInterpolator DEFAULT =
        new CubicBezierInterpolator(0.25, 0.1, 0.25, 1.0);

    private final double cx, bx, ax;
    private final double cy, by, ay;

    @Override
    public float getInterpolation(float t) {
        return (float) solve(t, 1e-6);  // 贝塞尔曲线求解
    }
}
```

**实际动画应用**：

```java
// 消息发送动画示例
ValueAnimator animator = ValueAnimator.ofFloat(0, 1);
animator.setInterpolator(CubicBezierInterpolator.EASE_OUT_QUINT);
animator.setDuration(350);
animator.addUpdateListener(animation -> {
    float progress = (float) animation.getAnimatedValue();
    messageCell.setTranslationY(startY + (endY - startY) * progress);
    messageCell.setAlpha(progress);
});
animator.start();
```

---

##### 2.2.1.5 设备性能分级

Telegram 根据设备能力动态调整 UI 复杂度：

```java
// org/telegram/messenger/SharedConfig.java
public class SharedConfig {
    public static final int PERFORMANCE_CLASS_LOW = 0;
    public static final int PERFORMANCE_CLASS_AVERAGE = 1;
    public static final int PERFORMANCE_CLASS_HIGH = 2;

    public static int getDevicePerformanceClass() {
        int cpuCount = Runtime.getRuntime().availableProcessors();
        int memoryClass = getMemoryClass();

        if (cpuCount <= 2 || memoryClass <= 100) {
            return PERFORMANCE_CLASS_LOW;
        } else if (cpuCount <= 4 || memoryClass <= 160) {
            return PERFORMANCE_CLASS_AVERAGE;
        } else {
            return PERFORMANCE_CLASS_HIGH;
        }
    }
}
```

**分级策略**：

| 性能等级    | 动画 | 模糊效果 | 阴影 | 粒子效果 |
| ----------- | ---- | -------- | ---- | -------- |
| **LOW**     | 简化 | 禁用     | 简单 | 禁用     |
| **AVERAGE** | 标准 | 低质量   | 标准 | 减少     |
| **HIGH**    | 完整 | 高质量   | 实时 | 完整     |

---

##### 2.2.1.6 可复现构建 (Reproducible Builds)

Telegram 是少数支持可复现构建的主流 App，用户可验证 Google
Play 版本与开源代码一致：

```bash
# 使用 Docker 构建（官方推荐）
docker build -t telegram-build .
docker run --rm -v $(pwd)/output:/output telegram-build

# 对比 APK
python3 apkdiff.py \
    official_telegram.apk \
    self_built_telegram.apk

# 输出：仅签名不同，代码完全一致
# Differences found only in: META-INF/
```

---

#### 2.2.2 Telegram X (Challegram)

**定位**：实验性客户端，探索 TDLib 在 Android 上的最佳实践。

**内部代号**：`Challegram`（从包名 `org.thunderdog.challegram` 可见）

**语言组成**：Java (~95.5%) + Kotlin (~2.2%) + C++ (~2.3%)

##### 2.2.2.1 架构对比

```text
┌─────────────────────────────────────────────────────────────┐
│                    官方版 vs Telegram X                      │
├─────────────────────────────┬───────────────────────────────┤
│       官方版 (DrKLO)         │        Telegram X             │
├─────────────────────────────┼───────────────────────────────┤
│  Java 直接实现 MTProto      │  依赖 TDLib (C++) 处理所有协议 │
│  自定义 View 手动绘制        │  更多使用标准 Android 组件     │
│  完全控制每个细节            │  专注于 UI/UX 创新            │
│  更大的 APK 体积             │  更小的纯 Java 代码量          │
│  更复杂的维护                │  协议更新由 TDLib 统一处理     │
└─────────────────────────────┴───────────────────────────────┘
```

##### 2.2.2.2 TDLib 集成方式

```java
// Telegram X 与 TDLib 的交互
// 使用预编译的 Java 包装层

import org.drinkless.td.libcore.telegram.TdApi;
import org.drinkless.td.libcore.telegram.Client;

public class TelegramManager {
    private Client client;

    public void initialize() {
        client = Client.create(
            this::handleUpdate,   // 接收服务器推送
            this::handleException,
            this::handleException
        );
    }

    // 发送消息
    public void sendMessage(long chatId, String text) {
        TdApi.SendMessage request = new TdApi.SendMessage();
        request.chatId = chatId;
        request.inputMessageContent = new TdApi.InputMessageText(
            new TdApi.FormattedText(text, null), false, false
        );

        client.send(request, result -> {
            if (result instanceof TdApi.Message) {
                // 发送成功
            }
        });
    }

    // 处理服务器推送
    private void handleUpdate(TdApi.Object update) {
        if (update instanceof TdApi.UpdateNewMessage) {
            // 新消息到达
        } else if (update instanceof TdApi.UpdateChatReadInbox) {
            // 已读状态更新
        }
        // ... 更多事件类型
    }
}
```

##### 2.2.2.3 Telegram X 的 UI 特色

| 特性             | 实现方式                            |
| ---------------- | ----------------------------------- |
| **即时主题切换** | 无需重启，实时应用颜色变更          |
| **更流畅的手势** | 自定义 `GestureDetector` + 弹性动画 |
| **实验性功能**   | 功能开关系统，A/B 测试新特性        |
| **更激进的动画** | 使用更多 Spring/Physics 动画        |

---

#### 2.2.3 官方版 vs X：选择指南

| 考量因素             | 官方版     | Telegram X   |
| -------------------- | ---------- | ------------ |
| **稳定性**           | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐     |
| **功能完整度**       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐     |
| **动画流畅度**       | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐   |
| **内存占用**         | 较高       | 较低         |
| **更新频率**         | 最快       | 滞后         |
| **第三方客户端参考** | 复杂       | 简单 (TDLib) |

---

> **🔗 源码参考**：
>
> - [Telegram Android (官方)](https://github.com/DrKLO/Telegram)
> - [Telegram X](https://github.com/TGX-Android/Telegram-X)
> - [TDLib](https://github.com/tdlib/td)
> - [Reproducible Builds 指南](https://core.telegram.org/reproducible-builds)

### 🌐 Web (K & Z) — 源码级深度解析

Telegram Web 不仅仅是网页应用，更是 **WebAssembly (WASM)** 和现代 Web
API 的教科书级实现。由于历史原因（2019 年 Lightweight Client
Contest），存在两个独立开发的官方版本。

---

#### 2.3.1 版本概览

| 特性         | Web Z (A)                    | Web K                |
| ------------ | ---------------------------- | -------------------- |
| **访问地址** | `web.telegram.org/a` 或 `/z` | `web.telegram.org/k` |
| **框架**     | Teact (自研)                 | 原生 TypeScript      |
| **MTProto**  | GramJS (定制版)              | 自实现               |
| **代码量**   | ~68% TypeScript              | ~95% TypeScript      |
| **开发者**   | Ajaxy (比赛冠军)             | morethanwords        |
| **特点**     | 更现代的 UI、更多动画        | 更轻量、加载更快     |

---

#### 2.3.2 Web Z (Telegram Web A) 架构

**仓库**：`Ajaxy/telegram-tt` / `TelegramOrg/Telegram-web-z`

> **📖 深度解析**：[Web Z 前端架构深度解析](./web-z-architecture.md) - 事无巨细地分析 Teact 框架、状态管理、Web
> Worker、虚拟滚动等实现

##### 2.3.2.1 Teact：自研的 React 替代品

Teact 是专为 Telegram Web 开发的**零依赖**、**高性能**
UI 框架，重新实现了 React 的核心范式。

**为什么不用 React？**

| React 的问题             | Teact 的解决方案     |
| ------------------------ | -------------------- |
| 包体积大 (~45KB gzipped) | 极致轻量 (~3KB)      |
| 兼容性代码多             | 只保留现代浏览器支持 |
| 调度器开销               | 简化的同步渲染       |
| 合成事件系统             | 直接使用原生事件     |

**Teact 核心 API**：

```typescript
// src/lib/teact/teact.ts
// Teact 实现了与 React 几乎相同的 API

// 函数式组件
const ChatMessage: FC<Props> = ({ message, isOwn }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    // 处理点击
  }, []);

  return (
    <div
      className={buildClassName('message', isOwn && 'own')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <MessageContent message={message} />
      {isHovered && <MessageActions />}
    </div>
  );
};

// Hooks 支持
export {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
};
```

**Teact 的独特优化**：

```typescript
// 细粒度响应式更新
// 使用 signals 模式避免不必要的重渲染

import { createSignal } from '../util/signals';

const [getUnreadCount, setUnreadCount] = createSignal(0);

// 组件只在 signal 变化时更新
const Badge: FC = () => {
  const count = useSignal(getUnreadCount);
  return count > 0 ? <span className="badge">{count}</span> : null;
};
```

##### 2.3.2.2 GramJS：MTProto JavaScript 实现

Web Z 使用定制版的 **GramJS** 处理与 Telegram 服务器的通信。

```typescript
// src/api/gramjs/gramjsBuilders.ts
// GramJS 配置和初始化

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const client = new TelegramClient(
  new StringSession(savedSession),
  API_ID,
  API_HASH,
  {
    connectionRetries: 5,
    useWSS: true, // WebSocket Secure
  },
);

// 发送消息
async function sendMessage(chatId: string, text: string) {
  await client.sendMessage(chatId, { message: text });
}

// 接收更新
client.addEventHandler((update) => {
  if (update instanceof Api.UpdateNewMessage) {
    handleNewMessage(update.message);
  }
});
```

**GramJS 的核心特性**：

- 基于 **Telethon** (Python) 移植
- 支持 **MTProto 2.0** 协议
- **自动 DC 迁移**（跨数据中心切换）
- **会话持久化** (StringSession / localStorage)

##### 2.3.2.3 项目结构

```text
telegram-tt/  (Web Z)
├── src/
│   ├── api/
│   │   ├── gramjs/           # GramJS MTProto 实现
│   │   │   ├── apiBuilders/      # API 请求构建器
│   │   │   ├── methods/          # 高级 API 方法
│   │   │   └── gramjsBuilders.ts
│   │   └── types/            # TypeScript 类型定义
│   ├── components/           # UI 组件
│   │   ├── common/               # 通用组件
│   │   ├── middle/               # 聊天区域
│   │   ├── left/                 # 左侧面板
│   │   └── right/                # 右侧面板
│   ├── lib/
│   │   ├── teact/            # Teact 框架核心
│   │   ├── rlottie/          # RLottie WASM 绑定
│   │   └── webp/             # WebP WASM 解码器
│   ├── global/               # 全局状态管理
│   ├── hooks/                # 自定义 Hooks
│   └── util/                 # 工具函数
├── public/
│   ├── rlottie/              # RLottie WASM 文件
│   └── opus/                 # Opus WASM 编码器
└── webpack.config.ts
```

---

#### 2.3.3 Web K 架构

**仓库**：`morethanwords/tweb` / `TelegramOrg/Telegram-web-k`

> **📖 深度解析**：[Web K 前端架构深度解析](./web-k-architecture.md) - 事无巨细地分析无框架 DOM 操作、自实现 MTProto、IndexedDB 存储等实现

##### 2.3.3.1 零框架依赖

Web K 采用**纯 TypeScript + 原生 DOM API**，不依赖任何 UI 框架。

```typescript
// src/components/chat/bubbles.ts
// 直接操作 DOM 的消息渲染

export default class ChatBubbles {
  private container: HTMLElement;
  private bubbleGroups: Map<number, BubbleGroup> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public renderMessage(message: Message) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    // 根据消息类型渲染不同内容
    if (message.media) {
      this.renderMedia(bubble, message.media);
    } else {
      this.renderText(bubble, message.message);
    }

    // 添加时间戳和状态
    this.appendMeta(bubble, message);

    this.container.appendChild(bubble);
  }

  private renderText(bubble: HTMLElement, text: string) {
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = this.parseEntities(text);
    bubble.appendChild(content);
  }
}
```

##### 2.3.3.2 自实现 MTProto

Web K 完全**从零实现** MTProto 协议，不依赖 GramJS：

```typescript
// src/lib/mtproto/mtproto.ts
// MTProto 核心实现

export class MTProto {
  private networker: Networker;
  private authorizer: Authorizer;

  async invokeApi<T>(method: string, params: object): Promise<T> {
    // 1. 构建 TL 对象
    const serialized = TLSerialization.serialize(method, params);

    // 2. 加密（AES-256-IGE）
    const encrypted = await this.encrypt(serialized);

    // 3. 通过 WebSocket 发送
    const response = await this.networker.send(encrypted);

    // 4. 解密并反序列化
    const decrypted = await this.decrypt(response);
    return TLDeserialization.deserialize<T>(decrypted);
  }

  private async encrypt(data: Uint8Array): Promise<Uint8Array> {
    // 使用 WASM 加速的 AES-IGE
    return cryptoWorker.aesEncryptIge(data, this.authKey, this.msgKey);
  }
}
```

##### 2.3.3.3 Web Workers 架构

Web K 大量使用 **Web Workers** 将计算密集型任务移出主线程：

```text
┌─────────────────────────────────────────────────────┐
│                   Main Thread                        │
│  UI 渲染 + 事件处理 + DOM 操作                       │
└──────────────────────┬──────────────────────────────┘
                       │ postMessage
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ MTProto     │ │ Crypto      │ │ Media       │
│ Worker      │ │ Worker      │ │ Worker      │
│             │ │             │ │             │
│ • 序列化    │ │ • AES-IGE   │ │ • 图片解码   │
│ • 反序列化  │ │ • SHA-256   │ │ • 视频处理   │
│ • 压缩      │ │ • RSA       │ │ • 音频编码   │
└─────────────┘ └─────────────┘ └─────────────┘
                       │
                       ▼ WASM
              ┌─────────────────┐
              │ WebAssembly     │
              │ • rlottie.wasm  │
              │ • opus.wasm     │
              │ • crypto.wasm   │
              └─────────────────┘
```

---

#### 2.3.4 WebAssembly 深度应用

两个 Web 版本都大量使用 WASM 来突破 JavaScript 的性能瓶颈。

##### 2.3.4.1 加密模块

```typescript
// 加密操作使用 WASM 加速
// 对于 AES-IGE（Telegram 特有的加密模式），WASM 比纯 JS 快 10x+

// src/lib/crypto/crypto.worker.ts
import init, { aes_ige_encrypt, aes_ige_decrypt } from './crypto.wasm';

await init(); // 初始化 WASM 模块

export function aesEncryptIge(
  data: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
): Uint8Array {
  return aes_ige_encrypt(data, key, iv);
}

// 性能对比
// 纯 JS: ~5ms / 1KB
// WASM:  ~0.5ms / 1KB
// Web Crypto API (AES-CBC): ~0.1ms / 1KB (但不支持 IGE 模式)
```

##### 2.3.4.2 RLottie 动画渲染

Telegram 的动画贴纸使用 **Lottie 格式**，通过 **RLottie** (C++ → WASM) 渲染：

```typescript
// src/lib/rlottie/rlottie.ts
// RLottie WASM 绑定

class RLottiePlayer {
  private worker: Worker;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, animationData: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.worker = new Worker('rlottie.worker.js');

    // 发送动画数据到 Worker
    this.worker.postMessage({
      type: 'init',
      data: animationData,
      width: canvas.width,
      height: canvas.height,
    });
  }

  play() {
    this.worker.onmessage = (e) => {
      if (e.data.type === 'frame') {
        // 将 WASM 渲染的帧绘制到 Canvas
        const imageData = new ImageData(
          new Uint8ClampedArray(e.data.buffer),
          this.canvas.width,
          this.canvas.height,
        );
        this.ctx.putImageData(imageData, 0, 0);
      }
    };

    this.worker.postMessage({ type: 'play' });
  }
}
```

**RLottie 渲染流程**：

```text
Lottie JSON → RLottie WASM (C++ 渲染) → RGBA Buffer → Canvas
```

##### 2.3.4.3 Opus 音频编码

语音消息录制使用 **Opus** 编码器（WASM 编译）：

```typescript
// 语音消息录制
const recorder = new OpusMediaRecorder(stream, {
  mimeType: 'audio/ogg; codecs=opus',
});

// WASM Opus 编码器配置
// 比特率: 32kbps (语音最佳)
// 采样率: 48000Hz
// 通道数: 1 (单声道)
```

---

#### 2.3.5 PWA 功能

两个 Web 版本都是完整的 **Progressive Web App**：

| 功能           | 实现方式                                |
| -------------- | --------------------------------------- |
| **离线支持**   | Service Worker 缓存静态资源             |
| **推送通知**   | Web Push API + Firebase Cloud Messaging |
| **安装到桌面** | `manifest.json` + beforeinstallprompt   |
| **后台同步**   | Background Sync API                     |
| **分享目标**   | Web Share Target API                    |

```json
// manifest.json
{
  "name": "Telegram Web",
  "short_name": "Telegram",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2481cc",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192" },
    { "src": "icon-512.png", "sizes": "512x512" }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [{ "name": "file", "accept": ["image/*", "video/*"] }]
    }
  }
}
```

---

#### 2.3.6 性能优化策略

| 策略                 | 实现细节                           |
| -------------------- | ---------------------------------- |
| **虚拟滚动**         | 只渲染可见区域的消息，DOM 节点复用 |
| **图片懒加载**       | IntersectionObserver + 占位符      |
| **WASM 预加载**      | 关键 WASM 模块在空闲时预加载       |
| **代码分割**         | 动态 import() 按需加载功能模块     |
| **IndexedDB 缓存**   | 消息、媒体、用户数据本地持久化     |
| **WebSocket 连接池** | 复用连接，减少握手开销             |

**虚拟滚动实现**：

```typescript
// 虚拟滚动核心逻辑
class VirtualScroll {
  private items: Message[];
  private itemHeight = 50; // 预估高度
  private buffer = 5; // 上下缓冲区

  getVisibleRange(scrollTop: number, viewportHeight: number) {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / this.itemHeight) - this.buffer,
    );
    const endIndex = Math.min(
      this.items.length,
      Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + this.buffer,
    );

    return { startIndex, endIndex };
  }

  // 只渲染可见范围内的消息
  render(range: { startIndex: number; endIndex: number }) {
    const fragment = document.createDocumentFragment();

    for (let i = range.startIndex; i < range.endIndex; i++) {
      fragment.appendChild(this.renderMessage(this.items[i]));
    }

    // 使用 transform 定位，避免重排
    this.container.style.transform = `translateY(${range.startIndex * this.itemHeight}px)`;
    this.container.innerHTML = '';
    this.container.appendChild(fragment);
  }
}
```

---

#### 2.3.7 Web Z vs Web K：选择指南

| 考量因素         | Web Z                  | Web K    |
| ---------------- | ---------------------- | -------- |
| **首次加载速度** | 较慢（Teact + GramJS） | ⚡ 更快  |
| **动画流畅度**   | ⭐⭐⭐⭐⭐             | ⭐⭐⭐⭐ |
| **功能完整度**   | ⭐⭐⭐⭐⭐             | ⭐⭐⭐⭐ |
| **内存占用**     | 较高                   | 较低     |
| **移动端体验**   | 更好                   | 良好     |
| **开发友好度**   | React 式 (Teact)       | 原生 DOM |

---

> **🔗 源码参考**：
>
> - [Web Z (Telegram-tt)](https://github.com/Ajaxy/telegram-tt)
> - [Web K (tweb)](https://github.com/morethanwords/tweb)
> - [GramJS](https://github.com/nicedayc/nicedayc)
> - [RLottie](https://github.com/nicedayc/nicedayc)

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
