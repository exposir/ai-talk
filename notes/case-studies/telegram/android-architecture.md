# Telegram Android 前端架构深度解析

> 事无巨细地剖析 Telegram Android 的工程实现，适合 Android 开发者深度学习

**📚 相关文档**：

- [← 返回 Telegram 客户端架构总览](./client-architecture.md)
- [← iOS 架构深度解析](./ios-architecture.md)

---

## 概述

Telegram
Android 是**业界性能标杆**，以极致的流畅度和轻量级著称。其代码风格独特——**大量自定义 View、手动 Canvas 绘制、几乎不使用 XML 布局**。

| 属性         | 值                                                        |
| ------------ | --------------------------------------------------------- |
| **仓库**     | [nicedayc/nicedayc](https://github.com/nicedayc/nicedayc) |
| **语言组成** | Java (~94%) + C++ (JNI, ~5%) + Kotlin (~1%)               |
| **UI 框架**  | 自定义 View + Canvas 手绘                                 |
| **网络层**   | tgnet (C++ JNI)                                           |
| **VoIP**     | tgcalls (WebRTC)                                          |
| **数据库**   | SQLite                                                    |
| **构建系统** | Gradle + NDK                                              |

---

## 官方版 vs Telegram X

| 维度         | 官方版 (DrKLO)             | Telegram X       |
| ------------ | -------------------------- | ---------------- |
| **架构**     | 自实现网络层 + 自定义 View | TDLib + 标准组件 |
| **语言**     | Java 为主                  | Kotlin 为主      |
| **性能**     | ⚡ 极致优化                | 良好             |
| **代码风格** | 巨型类、手动绘制           | 模块化、更现代   |
| **维护者**   | DrKLO (Nikolay Kudashov)   | 官方团队         |

本文聚焦**官方版 (DrKLO/Telegram)**。

---

## 1. 项目结构

```text
Telegram/  (DrKLO/Telegram)
├── TMessagesProj/
│   ├── jni/                          # C++ 原生代码
│   │   ├── tgnet/                        # MTProto 网络层 (C++)
│   │   │   ├── Connection.cpp
│   │   │   ├── Datacenter.cpp
│   │   │   ├── MTProtoScheme.cpp
│   │   │   └── NativeByteBuffer.cpp
│   │   ├── voip/                         # VoIP 通话引擎
│   │   │   ├── tgcalls/                      # WebRTC 封装
│   │   │   └── webrtc/                       # WebRTC 源码
│   │   ├── ffmpeg/                       # 媒体编解码
│   │   ├── rlottie/                      # Lottie 动画 (C++)
│   │   └── CMakeLists.txt
│   │
│   ├── src/main/java/org/telegram/
│   │   ├── messenger/                    # 核心业务逻辑
│   │   │   ├── MessagesController.java       # 消息管理
│   │   │   ├── MessagesStorage.java          # 消息存储
│   │   │   ├── ConnectionsManager.java       # 网络连接
│   │   │   ├── UserConfig.java               # 用户配置
│   │   │   ├── NotificationsController.java  # 通知管理
│   │   │   └── MediaController.java          # 媒体管理
│   │   │
│   │   ├── tgnet/                        # Java 层网络接口
│   │   │   ├── TLRPC.java                    # TL 类型定义
│   │   │   ├── NativeByteBuffer.java         # JNI 字节缓冲
│   │   │   └── ConnectionsManager.java       # JNI 桥接
│   │   │
│   │   └── ui/                           # UI 层
│   │       ├── ActionBar/                    # 顶部导航栏
│   │       │   ├── ActionBar.java
│   │       │   ├── ActionBarLayout.java
│   │       │   └── BaseFragment.java
│   │       ├── Cells/                        # 列表 Cell
│   │       │   ├── ChatMessageCell.java          # 消息气泡 (核心)
│   │       │   ├── DialogCell.java               # 会话列表项
│   │       │   └── ProfileSearchCell.java
│   │       ├── Components/                   # 自定义组件
│   │       │   ├── RecyclerListView.java         # 自定义 RecyclerView
│   │       │   ├── ChatActivityEnterView.java    # 输入框
│   │       │   ├── ChatAttachAlert.java          # 附件选择
│   │       │   └── AvatarDrawable.java           # 头像绘制
│   │       └── ChatActivity.java             # 聊天界面
│   │
│   └── src/main/res/                     # 资源文件 (极少)
│       └── values/
│           └── strings.xml
│
├── gradle/
└── build.gradle
```

---

## 2. 自定义 View 体系

### 2.1 核心理念：一切皆手绘

Telegram Android **几乎不使用 XML 布局**，所有复杂 UI 都通过**重写 `onDraw()` +
Canvas API** 手动绘制。

```java
// org/telegram/ui/Cells/ChatMessageCell.java
// 这是一个 ~15000 行的巨型类，处理所有消息类型的渲染

public class ChatMessageCell extends BaseCell {
    // 各种 Paint 对象（复用以提升性能）
    private static TextPaint textPaint;
    private static Paint urlPaint;
    private static Paint replyLinePaint;

    // 消息数据
    private MessageObject currentMessageObject;

    // 布局缓存
    private StaticLayout textLayout;
    private int textX, textY;
    private int backgroundWidth, backgroundHeight;

    @Override
    protected void onDraw(Canvas canvas) {
        if (currentMessageObject == null) {
            return;
        }

        // 1. 绘制气泡背景
        drawBackground(canvas);

        // 2. 绘制回复预览
        if (hasReply) {
            drawReplyInfo(canvas);
        }

        // 3. 绘制转发信息
        if (hasForward) {
            drawForwardInfo(canvas);
        }

        // 4. 绘制消息文本
        drawText(canvas);

        // 5. 绘制媒体内容
        if (hasMedia) {
            drawMedia(canvas);
        }

        // 6. 绘制时间和状态
        drawTimeAndStatus(canvas);

        // 7. 绘制选中状态
        if (isSelected) {
            drawCheckbox(canvas);
        }
    }

    private void drawBackground(Canvas canvas) {
        int left, top, right, bottom;

        if (currentMessageObject.isOutOwner()) {
            // 发出的消息 - 右对齐
            left = layoutWidth - backgroundWidth - dp(8);
            currentBackgroundDrawable = Theme.chat_msgOutDrawable;
        } else {
            // 收到的消息 - 左对齐
            left = dp(8);
            currentBackgroundDrawable = Theme.chat_msgInDrawable;
        }

        top = dp(1);
        right = left + backgroundWidth;
        bottom = top + backgroundHeight;

        currentBackgroundDrawable.setBounds(left, top, right, bottom);
        currentBackgroundDrawable.draw(canvas);
    }

    private void drawText(Canvas canvas) {
        if (textLayout == null) {
            return;
        }

        canvas.save();
        canvas.translate(textX, textY);
        textLayout.draw(canvas);
        canvas.restore();
    }
}
```

### 2.2 为什么选择手绘

| 标准方式      | Telegram 做法  | 优势              |
| ------------- | -------------- | ----------------- |
| XML 布局      | Java 代码创建  | 避免 inflate 开销 |
| View 层次     | 单一 View 绘制 | 减少 View 树遍历  |
| 系统组件      | Canvas 手绘    | 完全控制渲染      |
| 多个 TextView | StaticLayout   | 减少对象创建      |

### 2.3 DialogCell 实现

```java
// org/telegram/ui/Cells/DialogCell.java
// 会话列表项 - 同样使用手绘

public class DialogCell extends BaseCell {

    private TLRPC.Dialog currentDialog;

    // 布局缓存
    private StaticLayout nameLayout;
    private StaticLayout messageLayout;
    private StaticLayout timeLayout;

    // 头像
    private AvatarDrawable avatarDrawable;
    private ImageReceiver avatarImage;

    // 位置信息
    private int nameLeft, nameTop;
    private int messageLeft, messageTop;
    private int timeLeft, timeTop;
    private int avatarLeft, avatarTop;
    private int unreadCountLeft, unreadCountTop;

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // 固定高度，避免多次测量
        setMeasuredDimension(
            MeasureSpec.getSize(widthMeasureSpec),
            dp(72)  // 固定 72dp 高度
        );
    }

    @Override
    protected void onDraw(Canvas canvas) {
        if (currentDialog == null) {
            return;
        }

        // 1. 绘制头像
        avatarImage.draw(canvas);

        // 2. 绘制名称
        canvas.save();
        canvas.translate(nameLeft, nameTop);
        nameLayout.draw(canvas);
        canvas.restore();

        // 3. 绘制最后一条消息
        canvas.save();
        canvas.translate(messageLeft, messageTop);
        messageLayout.draw(canvas);
        canvas.restore();

        // 4. 绘制时间
        canvas.save();
        canvas.translate(timeLeft, timeTop);
        timeLayout.draw(canvas);
        canvas.restore();

        // 5. 绘制未读数
        if (unreadCount > 0) {
            drawUnreadCounter(canvas);
        }

        // 6. 绘制置顶图标
        if (isPinned) {
            drawPinIcon(canvas);
        }
    }

    private void drawUnreadCounter(Canvas canvas) {
        String text = String.valueOf(unreadCount);
        int textWidth = (int) Math.ceil(Theme.dialogs_countTextPaint.measureText(text));
        int countWidth = Math.max(dp(20), textWidth + dp(12));

        // 绘制圆形背景
        rect.set(
            unreadCountLeft,
            unreadCountTop,
            unreadCountLeft + countWidth,
            unreadCountTop + dp(20)
        );
        canvas.drawRoundRect(rect, dp(10), dp(10), Theme.dialogs_countPaint);

        // 绘制数字
        canvas.drawText(
            text,
            unreadCountLeft + (countWidth - textWidth) / 2,
            unreadCountTop + dp(15),
            Theme.dialogs_countTextPaint
        );
    }
}
```

---

## 3. RecyclerListView 定制

### 3.1 核心实现

```java
// org/telegram/ui/Components/RecyclerListView.java

public class RecyclerListView extends RecyclerView {

    // 点击事件委托
    private OnItemClickListener onItemClickListener;
    private OnItemLongClickListener onItemLongClickListener;

    // 滚动监听
    private OnScrollListener scrollListener;

    // 选中状态
    private View currentSelectedView;
    private int currentSelectedPosition = -1;

    // 动画
    private ItemAnimator itemAnimator;

    public RecyclerListView(Context context) {
        super(context);

        // 禁用默认动画（使用自定义动画）
        setItemAnimator(null);

        // 设置点击事件
        setOnTouchListener(new RecyclerListViewTouchListener());
    }

    // 自定义 ViewHolder 缓存
    @Override
    public void setAdapter(Adapter adapter) {
        super.setAdapter(adapter);

        // 预创建 ViewHolder
        if (adapter != null) {
            for (int i = 0; i < adapter.getItemViewTypeCount(); i++) {
                getRecycledViewPool().setMaxRecycledViews(i, 10);
            }
        }
    }

    // 平滑滚动到指定位置
    public void smoothScrollToPosition(int position, int offset) {
        LinearLayoutManager layoutManager = (LinearLayoutManager) getLayoutManager();
        if (layoutManager == null) {
            return;
        }

        LinearSmoothScroller scroller = new LinearSmoothScroller(getContext()) {
            @Override
            protected int getVerticalSnapPreference() {
                return SNAP_TO_START;
            }

            @Override
            protected float calculateSpeedPerPixel(DisplayMetrics displayMetrics) {
                return 50f / displayMetrics.densityDpi;  // 自定义滚动速度
            }
        };

        scroller.setTargetPosition(position);
        layoutManager.startSmoothScroll(scroller);
    }

    // 处理点击事件
    private class RecyclerListViewTouchListener implements OnTouchListener {
        private float startX, startY;
        private boolean pressed;

        @Override
        public boolean onTouch(View v, MotionEvent event) {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    startX = event.getX();
                    startY = event.getY();
                    pressed = true;

                    // 查找点击的 View
                    View view = findChildViewUnder(startX, startY);
                    if (view != null) {
                        currentSelectedView = view;
                        currentSelectedPosition = getChildAdapterPosition(view);

                        // 显示点击反馈
                        view.setPressed(true);
                    }
                    break;

                case MotionEvent.ACTION_UP:
                    if (pressed && currentSelectedView != null) {
                        currentSelectedView.setPressed(false);

                        if (onItemClickListener != null) {
                            onItemClickListener.onItemClick(
                                currentSelectedView,
                                currentSelectedPosition
                            );
                        }
                    }
                    pressed = false;
                    break;

                case MotionEvent.ACTION_CANCEL:
                    if (currentSelectedView != null) {
                        currentSelectedView.setPressed(false);
                    }
                    pressed = false;
                    break;
            }
            return false;
        }
    }
}
```

### 3.2 多类型 Adapter

```java
// 聊天消息 Adapter
public class ChatAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    // 消息类型
    private static final int VIEW_TYPE_MESSAGE_TEXT = 0;
    private static final int VIEW_TYPE_MESSAGE_PHOTO = 1;
    private static final int VIEW_TYPE_MESSAGE_VIDEO = 2;
    private static final int VIEW_TYPE_MESSAGE_VOICE = 3;
    private static final int VIEW_TYPE_MESSAGE_STICKER = 4;
    private static final int VIEW_TYPE_DATE_HEADER = 5;
    private static final int VIEW_TYPE_UNREAD_MESSAGES = 6;

    private ArrayList<MessageObject> messages;

    @Override
    public int getItemViewType(int position) {
        MessageObject messageObject = messages.get(position);

        if (messageObject.type == MessageObject.TYPE_DATE) {
            return VIEW_TYPE_DATE_HEADER;
        }

        if (messageObject.isSticker()) {
            return VIEW_TYPE_MESSAGE_STICKER;
        }

        if (messageObject.isVideo()) {
            return VIEW_TYPE_MESSAGE_VIDEO;
        }

        if (messageObject.isPhoto()) {
            return VIEW_TYPE_MESSAGE_PHOTO;
        }

        if (messageObject.isVoice()) {
            return VIEW_TYPE_MESSAGE_VOICE;
        }

        return VIEW_TYPE_MESSAGE_TEXT;
    }

    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view;

        switch (viewType) {
            case VIEW_TYPE_MESSAGE_TEXT:
            case VIEW_TYPE_MESSAGE_PHOTO:
            case VIEW_TYPE_MESSAGE_VIDEO:
            case VIEW_TYPE_MESSAGE_VOICE:
                // 所有消息类型共用 ChatMessageCell
                view = new ChatMessageCell(parent.getContext());
                break;

            case VIEW_TYPE_MESSAGE_STICKER:
                view = new ChatMessageCell(parent.getContext());
                ((ChatMessageCell) view).setAllowAssistant(true);
                break;

            case VIEW_TYPE_DATE_HEADER:
                view = new ChatActionCell(parent.getContext());
                break;

            default:
                view = new ChatMessageCell(parent.getContext());
        }

        view.setLayoutParams(new RecyclerView.LayoutParams(
            RecyclerView.LayoutParams.MATCH_PARENT,
            RecyclerView.LayoutParams.WRAP_CONTENT
        ));

        return new RecyclerListView.Holder(view);
    }

    @Override
    public void onBindViewHolder(RecyclerView.ViewHolder holder, int position) {
        MessageObject messageObject = messages.get(position);

        if (holder.itemView instanceof ChatMessageCell) {
            ChatMessageCell cell = (ChatMessageCell) holder.itemView;
            cell.setMessageObject(
                messageObject,
                messages,
                position == messages.size() - 1,  // 是否最后一条
                position == 0  // 是否第一条
            );
        }
    }
}
```

---

## 4. 动画系统

### 4.1 CubicBezierInterpolator

```java
// org/telegram/ui/Components/CubicBezierInterpolator.java

public class CubicBezierInterpolator implements Interpolator {

    // 预定义的常用曲线
    public static final CubicBezierInterpolator EASE_OUT =
        new CubicBezierInterpolator(0.25, 0.1, 0.25, 1);
    public static final CubicBezierInterpolator EASE_OUT_QUINT =
        new CubicBezierInterpolator(0.22, 1, 0.36, 1);
    public static final CubicBezierInterpolator EASE_IN_OUT_QUAD =
        new CubicBezierInterpolator(0.455, 0.03, 0.515, 0.955);
    public static final CubicBezierInterpolator DEFAULT =
        new CubicBezierInterpolator(0.25, 0.1, 0.25, 1);

    // 控制点
    private final float x1, y1, x2, y2;

    public CubicBezierInterpolator(double x1, double y1, double x2, double y2) {
        this.x1 = (float) x1;
        this.y1 = (float) y1;
        this.x2 = (float) x2;
        this.y2 = (float) y2;
    }

    @Override
    public float getInterpolation(float t) {
        // 使用牛顿法求解贝塞尔曲线
        float x = t;
        for (int i = 0; i < 5; i++) {
            float z = sampleCurveX(x) - t;
            if (Math.abs(z) < 1e-5) {
                break;
            }
            x -= z / sampleCurveDerivativeX(x);
        }
        return sampleCurveY(x);
    }

    private float sampleCurveX(float t) {
        return ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t + 3 * x1) * t;
    }

    private float sampleCurveY(float t) {
        return ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t + 3 * y1) * t;
    }

    private float sampleCurveDerivativeX(float t) {
        return (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + 3 * x1;
    }
}
```

### 4.2 动画工具类

```java
// org/telegram/messenger/AndroidUtilities.java

public class AndroidUtilities {

    // 通用动画参数
    public static final int ANIMATION_DURATION = 200;

    // ValueAnimator 封装
    public static void animateView(View view, float fromX, float toX,
                                   float fromY, float toY,
                                   float fromAlpha, float toAlpha,
                                   int duration, Runnable onEnd) {

        ValueAnimator animator = ValueAnimator.ofFloat(0, 1);
        animator.setDuration(duration);
        animator.setInterpolator(CubicBezierInterpolator.EASE_OUT_QUINT);

        animator.addUpdateListener(animation -> {
            float progress = (float) animation.getAnimatedValue();

            view.setTranslationX(fromX + (toX - fromX) * progress);
            view.setTranslationY(fromY + (toY - fromY) * progress);
            view.setAlpha(fromAlpha + (toAlpha - fromAlpha) * progress);
        });

        animator.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                if (onEnd != null) {
                    onEnd.run();
                }
            }
        });

        animator.start();
    }

    // 弹性动画
    public static void springAnimation(View view, float targetValue, Runnable onEnd) {
        SpringAnimation springAnimation = new SpringAnimation(view,
            DynamicAnimation.TRANSLATION_Y, targetValue);

        SpringForce springForce = new SpringForce(targetValue)
            .setDampingRatio(SpringForce.DAMPING_RATIO_MEDIUM_BOUNCY)
            .setStiffness(SpringForce.STIFFNESS_MEDIUM);

        springAnimation.setSpring(springForce);

        if (onEnd != null) {
            springAnimation.addEndListener((animation, canceled, value, velocity) -> {
                onEnd.run();
            });
        }

        springAnimation.start();
    }
}
```

---

## 5. JNI 原生层

### 5.1 架构图

```text
┌─────────────────────────────────────────────────────────────┐
│                       Java Layer                             │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │MessagesCtrl │  │  MediaCtrl  │  │NotificationsCtrl    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼───────────────────┼─────────────┘
          │                │                   │
          │  JNI Bridge    │                   │
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Native Layer (C++)                      │
│                                                              │
│  ┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │     tgnet       │  │   tgcalls   │  │    rlottie      │ │
│  │  (MTProto)      │  │  (WebRTC)   │  │   (动画)        │ │
│  └────────┬────────┘  └──────┬──────┘  └────────┬────────┘ │
│           │                  │                   │          │
│  ┌────────▼───────────────────▼───────────────────▼───────┐ │
│  │                    OpenSSL / BoringSSL                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 tgnet 网络层

```cpp
// TMessagesProj/jni/tgnet/Connection.cpp

class Connection {
public:
    Connection(Datacenter* datacenter, ConnectionType type);

    void connect();
    void disconnect();
    void sendData(NativeByteBuffer* buffer);

private:
    Datacenter* datacenter;
    ConnectionType connectionType;
    int socket;
    SSL* ssl;

    // 连接状态
    ConnectionState currentState;

    // 读写缓冲区
    NativeByteBuffer* writebuffer;
    NativeByteBuffer* readBuffer;

    void onConnected() {
        currentState = ConnectionState::Connected;

        // 开始 TLS 握手
        if (connectionType == ConnectionType::Generic) {
            startTLS();
        }
    }

    void startTLS() {
        ssl = SSL_new(sslContext);
        SSL_set_fd(ssl, socket);
        SSL_connect(ssl);
    }

    void onDataReceived(NativeByteBuffer* buffer) {
        // 解密数据
        if (ssl != nullptr) {
            decryptData(buffer);
        }

        // 传递给 Datacenter 处理
        datacenter->onDataReceived(buffer);
    }
};
```

### 5.3 JNI 桥接

```java
// org/telegram/tgnet/ConnectionsManager.java

public class ConnectionsManager {

    // Native 方法声明
    public static native void native_setProxySettings(
        int instanceNum, String address, int port,
        String username, String password, String secret
    );

    public static native int native_getCurrentTime(int instanceNum);

    public static native long native_sendRequest(
        int instanceNum,
        int object,
        RequestDelegateInternal onComplete,
        QuickAckDelegate onQuickAck,
        WriteToSocketDelegate onWriteToSocket,
        int flags, int datacenterId, int connectionType,
        boolean immediate, int requestToken
    );

    public static native void native_cancelRequest(
        int instanceNum,
        int token,
        boolean notifyServer
    );

    // 初始化 Native 层
    static {
        try {
            System.loadLibrary("tgnet");
        } catch (Exception e) {
            Log.e("ConnectionsManager", "Failed to load tgnet library");
        }
    }

    // 发送请求的 Java 封装
    public int sendRequest(TLObject object, RequestDelegate completionBlock,
                          int flags, int connectionType) {
        int requestToken = lastRequestToken.getAndIncrement();

        native_sendRequest(
            currentNetworkType,
            object.getObjectSize(),
            (response, errorCode, errorText, networkType) -> {
                if (completionBlock != null) {
                    TLObject result = parseResponse(response);
                    TLRPC.TL_error error = null;
                    if (errorCode != 0) {
                        error = new TLRPC.TL_error();
                        error.code = errorCode;
                        error.text = errorText;
                    }
                    completionBlock.run(result, error);
                }
            },
            null, null, flags, 0, connectionType, true, requestToken
        );

        return requestToken;
    }
}
```

### 5.4 C++ 层实现

```cpp
// TMessagesProj/jni/tgnet/NativeLoader.cpp

extern "C" {

JNIEXPORT jlong JNICALL Java_org_telegram_tgnet_ConnectionsManager_native_1sendRequest(
    JNIEnv *env, jclass clazz,
    jint instanceNum, jint object_size,
    jobject onComplete, jobject onQuickAck, jobject onWriteToSocket,
    jint flags, jint datacenterId, jint connectionType,
    jboolean immediate, jint requestToken
) {
    // 获取 ConnectionsManager 实例
    ConnectionsManager* manager = ConnectionsManager::getInstance(instanceNum);

    // 创建回调
    auto callback = [env, onComplete](TLObject* response, TL_error* error) {
        // 调用 Java 回调
        jclass delegateClass = env->GetObjectClass(onComplete);
        jmethodID method = env->GetMethodID(delegateClass, "run", "(IIII)V");
        env->CallVoidMethod(onComplete, method,
            response != nullptr ? response->getSize() : 0,
            error != nullptr ? error->code : 0,
            error != nullptr ? env->NewStringUTF(error->text.c_str()) : nullptr,
            0
        );
    };

    // 发送请求
    return manager->sendRequest(
        object_size, callback, flags, datacenterId, connectionType, immediate
    );
}

}
```

---

## 6. 设备性能分级

### 6.1 性能检测

```java
// org/telegram/messenger/SharedConfig.java

public class SharedConfig {

    public static final int PERFORMANCE_CLASS_LOW = 0;
    public static final int PERFORMANCE_CLASS_AVERAGE = 1;
    public static final int PERFORMANCE_CLASS_HIGH = 2;

    public static int devicePerformanceClass;

    public static void detectDevicePerformanceClass() {
        // CPU 核心数
        int cpuCount = Runtime.getRuntime().availableProcessors();

        // 内存大小
        ActivityManager activityManager = (ActivityManager)
            ApplicationLoader.applicationContext
            .getSystemService(Context.ACTIVITY_SERVICE);
        ActivityManager.MemoryInfo memInfo = new ActivityManager.MemoryInfo();
        activityManager.getMemoryInfo(memInfo);
        long totalMemory = memInfo.totalMem;

        // 性能分级
        if (cpuCount <= 2 || totalMemory <= 2L * 1024 * 1024 * 1024) {
            devicePerformanceClass = PERFORMANCE_CLASS_LOW;
        } else if (cpuCount <= 4 || totalMemory <= 4L * 1024 * 1024 * 1024) {
            devicePerformanceClass = PERFORMANCE_CLASS_AVERAGE;
        } else {
            devicePerformanceClass = PERFORMANCE_CLASS_HIGH;
        }
    }

    // 根据性能等级调整参数
    public static int getMaxAnimationDuration() {
        switch (devicePerformanceClass) {
            case PERFORMANCE_CLASS_LOW:
                return 150;
            case PERFORMANCE_CLASS_AVERAGE:
                return 220;
            case PERFORMANCE_CLASS_HIGH:
            default:
                return 300;
        }
    }

    public static boolean canUseBlur() {
        return devicePerformanceClass >= PERFORMANCE_CLASS_AVERAGE;
    }

    public static int getImageQuality() {
        switch (devicePerformanceClass) {
            case PERFORMANCE_CLASS_LOW:
                return 60;
            case PERFORMANCE_CLASS_AVERAGE:
                return 80;
            case PERFORMANCE_CLASS_HIGH:
            default:
                return 100;
        }
    }
}
```

### 6.2 动态降级

```java
// 根据性能动态调整 UI 行为
public class ChatActivity extends BaseFragment {

    private void updateChatListSettings() {
        if (SharedConfig.devicePerformanceClass == SharedConfig.PERFORMANCE_CLASS_LOW) {
            // 低端设备：禁用部分效果
            chatListView.setItemAnimator(null);
            chatListView.setScrollingTouchSlop(RecyclerView.TOUCH_SLOP_PAGING);
            disableBlurBackground = true;

        } else if (SharedConfig.devicePerformanceClass == SharedConfig.PERFORMANCE_CLASS_AVERAGE) {
            // 中端设备：简化动画
            chatListView.setItemAnimator(new SimpleItemAnimator());
            enablePartialBlur = true;

        } else {
            // 高端设备：启用所有效果
            chatListView.setItemAnimator(new ChatListItemAnimator());
            enableFullBlur = true;
            enableParticleEffects = true;
        }
    }
}
```

---

## 7. 可复现构建

### 7.1 签名验证

```text
Telegram 支持可复现构建，用户可以验证 APK 是否与源码一致：

1. 从 GitHub 克隆源码
2. 使用相同的 Gradle 版本构建
3. 对比 APK 的 SHA-256 哈希
```

### 7.2 构建配置

```groovy
// build.gradle

android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"

    defaultConfig {
        applicationId "org.telegram.messenger"
        minSdkVersion 19
        targetSdkVersion 33

        // 禁用随机化以实现可复现
        versionCode RELEASE_VERSION_CODE
        versionName RELEASE_VERSION_NAME
    }

    // 禁用构建时间戳
    compileOptions {
        coreLibraryDesugaringEnabled false
    }

    // 固定 NDK 版本
    ndkVersion "21.4.7075529"

    externalNativeBuild {
        cmake {
            path "jni/CMakeLists.txt"
            version "3.18.1"
        }
    }
}
```

---

## 8. 性能优化技巧

### 8.1 View 复用

```java
// 消息 Cell 复用优化
public class ChatMessageCell extends BaseCell {

    // 静态 Paint 对象（跨实例共享）
    private static TextPaint textPaint;
    private static Paint urlPaint;

    static {
        textPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setTextSize(dp(16));

        urlPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        urlPaint.setColor(Theme.getColor(Theme.key_chat_linkSelectBackground));
    }

    // 复用时重置状态
    public void prepareForReuse() {
        currentMessageObject = null;
        textLayout = null;
        imageReceiver.onDetachedFromWindow();
    }
}
```

### 8.2 图片加载

```java
// org/telegram/messenger/ImageReceiver.java

public class ImageReceiver {

    // 多级缓存
    private static LruCache<String, BitmapDrawable> memoryCache;
    private static DiskLruCache diskCache;

    public void setImage(ImageLocation location, String filter) {
        // 1. 检查内存缓存
        String key = generateKey(location, filter);
        BitmapDrawable cached = memoryCache.get(key);
        if (cached != null) {
            setImageBitmap(cached);
            return;
        }

        // 2. 检查磁盘缓存
        Bitmap diskCached = loadFromDisk(key);
        if (diskCached != null) {
            BitmapDrawable drawable = new BitmapDrawable(diskCached);
            memoryCache.put(key, drawable);
            setImageBitmap(drawable);
            return;
        }

        // 3. 网络加载
        loadFromNetwork(location, filter, (bitmap) -> {
            // 存入缓存
            memoryCache.put(key, new BitmapDrawable(bitmap));
            saveToDisk(key, bitmap);

            // 显示
            setImageBitmap(new BitmapDrawable(bitmap));
        });
    }
}
```

### 8.3 文本测量缓存

```java
// 缓存文本测量结果
public class MessageObject {

    // 布局缓存
    private StaticLayout textLayout;
    private int textWidth;
    private int textHeight;
    private boolean layoutCalculated = false;

    public void calculateLayout(int maxWidth) {
        if (layoutCalculated && textWidth == maxWidth) {
            return;  // 使用缓存
        }

        if (messageText != null && messageText.length() > 0) {
            textLayout = new StaticLayout(
                messageText,
                Theme.chat_msgTextPaint,
                maxWidth,
                Layout.Alignment.ALIGN_NORMAL,
                1.0f, 0.0f, false
            );

            textWidth = maxWidth;
            textHeight = textLayout.getHeight();
            layoutCalculated = true;
        }
    }
}
```

---

## 9. 源码学习路径

1. **入门**：从 `ApplicationLoader.java` 开始，理解应用初始化
2. **UI 核心**：研究 `ChatMessageCell.java`，理解手绘 UI 模式
3. **列表**：分析 `RecyclerListView.java`，学习自定义 RecyclerView
4. **网络**：阅读 `ConnectionsManager.java` 和 `tgnet/`，理解 JNI 桥接
5. **存储**：查看 `MessagesStorage.java`，学习消息存储
6. **动画**：研究 `CubicBezierInterpolator.java`，学习动画系统

---

> **🔗 源码参考**：
>
> - [Telegram Android (DrKLO)](https://github.com/nicedayc/nicedayc)
> - [Telegram X](https://github.com/nicedayc)
> - [TDLib (第三方客户端)](https://github.com/tdlib/td)
> - [可复现构建指南](https://core.telegram.org/reproducible-builds)
