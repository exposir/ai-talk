# Telegram Web Z (telegram-tt) 前端架构深度解析

> 事无巨细地剖析 Telegram Web Z 的前端工程实现，适合前端开发者深度学习

## 概述

**Web Z** (也称 Web A / telegram-tt) 是 Telegram 在 2019 年 Lightweight Client
Contest 中获得**第一名**的作品，现已成为官方 Web 客户端之一。

| 属性         | 值                                                        |
| ------------ | --------------------------------------------------------- |
| **访问地址** | `web.telegram.org/a` 或 `/z`                              |
| **仓库**     | [Ajaxy/telegram-tt](https://github.com/Ajaxy/telegram-tt) |
| **开发者**   | Ajaxy                                                     |
| **核心框架** | Teact (自研)                                              |
| **语言组成** | TypeScript (~68%), SCSS, Rust (WASM)                      |
| **协议实现** | GramJS (定制版)                                           |

---

## 1. 项目结构

```text
telegram-tt/
├── src/
│   ├── api/                      # API 层
│   │   ├── gramjs/                   # GramJS MTProto 实现
│   │   │   ├── apiBuilders/              # API 请求构建器
│   │   │   ├── methods/                  # 高级封装方法
│   │   │   │   ├── auth.ts                   # 认证相关
│   │   │   │   ├── chats.ts                  # 聊天操作
│   │   │   │   ├── messages.ts               # 消息操作
│   │   │   │   └── users.ts                  # 用户操作
│   │   │   ├── gramjsBuilders.ts         # GramJS 配置
│   │   │   └── worker/                   # Web Worker 入口
│   │   │       └── provider.ts
│   │   └── types/                    # TypeScript 类型定义
│   │
│   ├── components/               # UI 组件 (Teact JSX)
│   │   ├── common/                   # 通用组件
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Modal.tsx
│   │   ├── left/                     # 左侧面板 (会话列表)
│   │   │   ├── LeftColumn.tsx
│   │   │   ├── ChatList.tsx
│   │   │   └── search/
│   │   ├── middle/                   # 中间区域 (聊天内容)
│   │   │   ├── MiddleColumn.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── message/
│   │   │   │   ├── Message.tsx
│   │   │   │   ├── MessageContent.tsx
│   │   │   │   └── MessageMeta.tsx
│   │   │   └── composer/
│   │   │       └── Composer.tsx
│   │   ├── right/                    # 右侧面板 (详情)
│   │   │   └── RightColumn.tsx
│   │   └── ui/                       # 基础 UI 元素
│   │
│   ├── global/                   # 全局状态管理
│   │   ├── actions/                  # Actions 定义
│   │   │   ├── api/                      # API 相关 actions
│   │   │   └── ui/                       # UI 相关 actions
│   │   ├── reducers/                 # Reducers
│   │   ├── selectors/                # Selectors (派生状态)
│   │   ├── initialState.ts           # 初始状态
│   │   └── index.ts                  # 状态管理入口
│   │
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useFlag.ts
│   │   ├── usePrevious.ts
│   │   ├── useIntersectionObserver.ts
│   │   └── useVirtualBackdrop.ts
│   │
│   ├── lib/                      # 核心库
│   │   ├── teact/                    # Teact 框架核心
│   │   │   ├── teact.ts                  # 核心 API
│   │   │   ├── teactn.ts                 # 带状态连接
│   │   │   └── reconciliation.ts         # 调和算法
│   │   ├── rlottie/                  # RLottie WASM 绑定
│   │   ├── webp/                     # WebP WASM 解码
│   │   └── gramjs/                   # GramJS 核心
│   │
│   ├── util/                     # 工具函数
│   │   ├── buildClassName.ts
│   │   ├── fastSmoothScroll.ts
│   │   ├── schedulers.ts
│   │   └── signals.ts
│   │
│   ├── styles/                   # 全局样式
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── index.scss
│   │
│   └── index.tsx                 # 应用入口
│
├── public/
│   ├── rlottie/                  # WASM 文件
│   │   └── rlottie-wasm.wasm
│   └── opus/                     # Opus 编码器
│
├── webpack.config.ts             # Webpack 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json
```

---

## 2. Teact 框架深度剖析

Teact 是 Telegram 专为 Web
Z 开发的**零依赖**轻量级 UI 框架，重新实现了 React 的核心范式。

### 2.1 为什么自研框架？

| React 痛点                 | Teact 解决方案        |
| -------------------------- | --------------------- |
| 包体积大 (~45KB gzipped)   | 极致轻量 (~3KB)       |
| 兼容 IE11 等旧浏览器的代码 | 只支持现代浏览器      |
| 合成事件系统开销           | 直接使用原生 DOM 事件 |
| Fiber 调度器复杂性         | 简化的同步渲染        |
| 需要 ReactDOM              | Teact 自包含          |

### 2.2 核心 API 实现

```typescript
// src/lib/teact/teact.ts
// Teact 的核心导出，API 与 React 几乎一致

export {
  // 组件类型
  FC,

  // Hooks
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer,
  useLayoutEffect,

  // 工具函数
  memo,
  Fragment,
  createElement,
};
```

### 2.3 Virtual DOM 结构

```typescript
// VNode (Virtual Node) 的数据结构
interface VirtualElement {
  type: string | Function; // 标签名或组件函数
  props: {
    children?: VirtualElement[];
    [key: string]: any;
  };
  key?: string | number;

  // 内部状态
  $el?: Element; // 真实 DOM 引用
  $children?: VirtualElement[];
  $componentInstance?: ComponentInstance;
}

// 组件实例
interface ComponentInstance {
  state: any[]; // useState 的状态数组
  effects: Effect[]; // useEffect 的副作用
  refs: any[]; // useRef 的引用
  isMounted: boolean;
}
```

### 2.4 Hooks 实现原理

Teact 的 Hooks 实现遵循 React 的**调用顺序规则**：

```typescript
// useState 的简化实现
let currentComponent: ComponentInstance | null = null;
let hookIndex = 0;

export function useState<T>(initialValue: T): [T, (v: T) => void] {
  const component = currentComponent!;
  const index = hookIndex++;

  // 首次渲染时初始化
  if (component.state[index] === undefined) {
    component.state[index] = initialValue;
  }

  const setState = (newValue: T) => {
    if (component.state[index] !== newValue) {
      component.state[index] = newValue;
      scheduleUpdate(component); // 触发重渲染
    }
  };

  return [component.state[index], setState];
}

// useEffect 的简化实现
export function useEffect(effect: () => void | (() => void), deps?: any[]) {
  const component = currentComponent!;
  const index = hookIndex++;

  const prevEffect = component.effects[index];
  const hasChanged =
    !prevEffect || !deps || deps.some((dep, i) => dep !== prevEffect.deps?.[i]);

  if (hasChanged) {
    // 清理上一次的副作用
    prevEffect?.cleanup?.();

    // 调度新的副作用（异步执行）
    queueMicrotask(() => {
      const cleanup = effect();
      component.effects[index] = { deps, cleanup };
    });
  }
}
```

### 2.5 调和算法 (Reconciliation)

Teact 使用简化的 Diff 算法：

```typescript
// src/lib/teact/reconciliation.ts

function reconcileChildren(
  parentEl: Element,
  prevChildren: VNode[],
  nextChildren: VNode[],
) {
  const maxLength = Math.max(prevChildren.length, nextChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const prev = prevChildren[i];
    const next = nextChildren[i];

    if (!next) {
      // 删除多余节点
      unmount(prev);
    } else if (!prev) {
      // 新增节点
      mount(next, parentEl);
    } else if (prev.type !== next.type) {
      // 类型不同，替换
      replace(prev, next, parentEl);
    } else if (prev.key !== next.key) {
      // Key 不同，替换
      replace(prev, next, parentEl);
    } else {
      // 更新现有节点
      patch(prev, next);
    }
  }
}

function patch(prev: VNode, next: VNode) {
  // 复用 DOM 节点
  next.$el = prev.$el;

  // 更新属性
  updateProps(prev.$el, prev.props, next.props);

  // 递归更新子节点
  if (typeof next.type === 'string') {
    reconcileChildren(next.$el, prev.props.children, next.props.children);
  }
}
```

### 2.6 memo 优化

```typescript
// memo 实现 - 浅比较 props 跳过重渲染
export function memo<P>(
  Component: FC<P>,
  areEqual?: (prev: P, next: P) => boolean,
): FC<P> {
  const compare = areEqual || shallowEqual;

  return function MemoizedComponent(props: P) {
    const prevProps = useRef<P>();
    const prevResult = useRef<VNode>();

    if (prevProps.current && compare(prevProps.current, props)) {
      return prevResult.current!;
    }

    prevProps.current = props;
    prevResult.current = Component(props);
    return prevResult.current;
  };
}

function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => a[key] === b[key]);
}
```

---

## 3. 全局状态管理

Telegram Web Z 使用自研的**类 Redux**状态管理系统，但更轻量。

### 3.1 架构概览

```text
┌─────────────────────────────────────────────────────────┐
│                     GlobalState                          │
│  {                                                       │
│    users: Map<userId, User>,                            │
│    chats: Map<chatId, Chat>,                            │
│    messages: Map<chatId, Message[]>,                    │
│    currentUserId: string,                               │
│    activeChatId: string,                                │
│    ...                                                   │
│  }                                                       │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Actions   │ │  Reducers   │ │  Selectors  │
│             │ │             │ │             │
│ • sendMsg   │ │ • messages  │ │ • getChat   │
│ • loadChats │ │ • chats     │ │ • getUser   │
│ • openChat  │ │ • ui        │ │ • getMsgs   │
└─────────────┘ └─────────────┘ └─────────────┘
```

### 3.2 核心 API

```typescript
// src/global/index.ts

// 获取全局状态
export function getGlobal(): GlobalState {
  return globalState;
}

// 更新全局状态
export function setGlobal(newState: GlobalState): void {
  globalState = newState;
  notifyListeners();  // 通知所有订阅者
}

// 部分更新（类似 immer）
export function updateGlobal(updater: (state: GlobalState) => GlobalState): void {
  setGlobal(updater(getGlobal()));
}

// 连接组件到状态
export function withGlobal<P, S>(
  mapStateToProps: (global: GlobalState, ownProps: P) => S
) {
  return (Component: FC<P & S>) => {
    return function ConnectedComponent(props: P) {
      const [mappedState, setMappedState] = useState(() =>
        mapStateToProps(getGlobal(), props)
      );

      useEffect(() => {
        return subscribeToGlobal(() => {
          const newState = mapStateToProps(getGlobal(), props);
          if (!shallowEqual(mappedState, newState)) {
            setMappedState(newState);
          }
        });
      }, [props]);

      return <Component {...props} {...mappedState} />;
    };
  };
}
```

### 3.3 Actions 定义

```typescript
// src/global/actions/api/messages.ts

export async function sendMessage({
  chatId,
  text,
  replyToMessageId,
}: {
  chatId: string;
  text: string;
  replyToMessageId?: number;
}) {
  const global = getGlobal();

  // 1. 乐观更新 - 立即显示消息（本地临时ID）
  const localMessage = createLocalMessage(chatId, text);
  updateGlobal((state) => ({
    ...state,
    messages: {
      ...state.messages,
      [chatId]: [...(state.messages[chatId] || []), localMessage],
    },
  }));

  // 2. 发送到服务器
  try {
    const result = await callApi('sendMessage', {
      chat: buildInputPeer(chatId),
      message: text,
      replyTo: replyToMessageId,
    });

    // 3. 用服务器返回的真实消息替换本地消息
    updateGlobal((state) => {
      const messages = state.messages[chatId].map((msg) =>
        msg.id === localMessage.id ? result : msg,
      );
      return { ...state, messages: { ...state.messages, [chatId]: messages } };
    });
  } catch (error) {
    // 4. 失败时标记消息为发送失败
    markMessageFailed(localMessage.id);
  }
}
```

### 3.4 Selectors（派生状态）

```typescript
// src/global/selectors/messages.ts

// 使用 memoization 避免重复计算
export const selectChatMessages = memoize(
  (global: GlobalState, chatId: string): Message[] => {
    return global.messages[chatId] || [];
  },
);

export const selectVisibleMessages = memoize(
  (
    global: GlobalState,
    chatId: string,
    viewportTop: number,
    viewportBottom: number,
  ): Message[] => {
    const messages = selectChatMessages(global, chatId);

    // 只返回可见区域内的消息
    return messages.filter((msg) => {
      const top = msg.offsetTop;
      const bottom = top + msg.height;
      return bottom > viewportTop && top < viewportBottom;
    });
  },
);
```

---

## 4. Web Worker 架构

GramJS（MTProto 实现）运行在独立的 Web Worker 中，避免阻塞主线程。

### 4.1 架构图

```text
┌────────────────────────────────────────────────────────┐
│                     Main Thread                         │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Teact    │  │   Global    │  │     UI      │    │
│  │  Component  │  │    State    │  │  Rendering  │    │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘    │
│         │                │                              │
│         │  callApi()     │                              │
│         ▼                ▼                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │              API Bridge (src/api/gramjs/)          │ │
│  │                                                     │ │
│  │  const result = await callApi('sendMessage', {     │ │
│  │    chat: ...,                                       │ │
│  │    message: text,                                   │ │
│  │  });                                                │ │
│  └──────────────────────┬────────────────────────────┘ │
└─────────────────────────┼──────────────────────────────┘
                          │ postMessage()
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API Worker                            │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │                    GramJS                          │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  TelegramClient                              │  │  │
│  │  │  • MTProto 2.0 协议                          │  │  │
│  │  │  • AES-256-IGE 加密                          │  │  │
│  │  │  • WebSocket 连接                            │  │  │
│  │  │  • 自动重连机制                              │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Worker 通信协议

```typescript
// 主线程 → Worker
interface ApiRequest {
  type: 'callMethod';
  messageId: number; // 用于匹配响应
  name: string; // API 方法名
  args: any[]; // 参数
}

// Worker → 主线程
interface ApiResponse {
  type: 'methodResponse';
  messageId: number;
  result?: any;
  error?: string;
}

interface ApiUpdate {
  type: 'update';
  update: TelegramUpdate; // 服务器推送的更新
}
```

### 4.3 callApi 实现

```typescript
// src/api/gramjs/provider.ts

const pendingRequests = new Map<
  number,
  {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }
>();

let messageIdCounter = 0;

export function callApi<T>(name: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const messageId = ++messageIdCounter;

    pendingRequests.set(messageId, { resolve, reject });

    worker.postMessage({
      type: 'callMethod',
      messageId,
      name,
      args,
    });
  });
}

// 监听 Worker 响应
worker.onmessage = (event: MessageEvent) => {
  const { data } = event;

  if (data.type === 'methodResponse') {
    const pending = pendingRequests.get(data.messageId);
    if (pending) {
      pendingRequests.delete(data.messageId);
      if (data.error) {
        pending.reject(new Error(data.error));
      } else {
        pending.resolve(data.result);
      }
    }
  } else if (data.type === 'update') {
    // 处理服务器推送的更新
    handleUpdate(data.update);
  }
};
```

### 4.4 Worker 端实现

```typescript
// src/api/gramjs/worker/index.ts

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

let client: TelegramClient | null = null;

self.onmessage = async (event: MessageEvent<ApiRequest>) => {
  const { type, messageId, name, args } = event.data;

  if (type === 'callMethod') {
    try {
      const method = methods[name];
      if (!method) {
        throw new Error(`Unknown method: ${name}`);
      }

      const result = await method(client!, ...args);

      self.postMessage({
        type: 'methodResponse',
        messageId,
        result,
      });
    } catch (error) {
      self.postMessage({
        type: 'methodResponse',
        messageId,
        error: error.message,
      });
    }
  }
};

// 监听服务器更新
client.addEventHandler((update) => {
  self.postMessage({
    type: 'update',
    update: serializeUpdate(update),
  });
});
```

---

## 5. 消息列表虚拟滚动

聊天消息列表是 Telegram 的核心，Web Z 实现了高性能的虚拟滚动。

### 5.1 核心组件结构

```typescript
// src/components/middle/MessageList.tsx

const MessageList: FC<Props> = ({ chatId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportOffset, setViewportOffset] = useState({ top: 0, bottom: 0 });

  // 只获取可见区域的消息
  const visibleMessages = useSelector((global) =>
    selectVisibleMessages(global, chatId, viewportOffset.top, viewportOffset.bottom)
  );

  // 监听滚动
  const handleScroll = useCallback(() => {
    const container = containerRef.current!;
    setViewportOffset({
      top: container.scrollTop,
      bottom: container.scrollTop + container.clientHeight,
    });
  }, []);

  // 使用 IntersectionObserver 懒加载
  useIntersectionObserver(containerRef, handleIntersection);

  return (
    <div
      ref={containerRef}
      className="MessageList"
      onScroll={handleScroll}
    >
      {/* 顶部占位符 - 表示上方未渲染的消息 */}
      <div style={{ height: topPlaceholderHeight }} />

      {/* 只渲染可见消息 */}
      {visibleMessages.map(message => (
        <Message
          key={message.id}
          message={message}
        />
      ))}

      {/* 底部占位符 */}
      <div style={{ height: bottomPlaceholderHeight }} />
    </div>
  );
};
```

### 5.2 消息高度计算

```typescript
// 消息高度预估和缓存
const messageHeightCache = new Map<number, number>();

function estimateMessageHeight(message: Message): number {
  // 先检查缓存
  if (messageHeightCache.has(message.id)) {
    return messageHeightCache.get(message.id)!;
  }

  // 根据内容类型估算
  let height = 40; // 基础高度（头像、边距等）

  if (message.text) {
    // 估算文本行数
    const lines = Math.ceil(message.text.length / 40);
    height += lines * 20;
  }

  if (message.photo) {
    height += message.photo.height * (300 / message.photo.width);
  }

  if (message.video) {
    height += 200;
  }

  return height;
}

// 渲染后记录真实高度
function onMessageRendered(messageId: number, element: HTMLElement) {
  const realHeight = element.getBoundingClientRect().height;
  messageHeightCache.set(messageId, realHeight);
}
```

### 5.3 滚动位置保持

```typescript
// 加载旧消息时保持滚动位置
function loadOlderMessages() {
  const container = containerRef.current!;
  const scrollHeightBefore = container.scrollHeight;

  // 加载更多消息
  await loadMessages({ offsetId: firstMessageId, limit: 50 });

  // 恢复滚动位置
  requestAnimationFrame(() => {
    const scrollHeightDiff = container.scrollHeight - scrollHeightBefore;
    container.scrollTop += scrollHeightDiff;
  });
}
```

---

## 6. SCSS 样式系统

### 6.1 CSS 变量定义

```scss
// src/styles/_variables.scss

:root {
  // 颜色系统
  --color-primary: #3390ec;
  --color-primary-shade: #2b7cd3;
  --color-success: #4fae4e;
  --color-error: #e53935;
  --color-warning: #ffa726;

  // 背景色
  --color-background: #ffffff;
  --color-background-secondary: #f4f4f5;
  --color-background-own-message: #eeffde;

  // 文字颜色
  --color-text: #000000;
  --color-text-secondary: #707579;
  --color-text-meta: #9e9e9e;

  // 尺寸
  --border-radius-messages: 0.75rem;
  --border-radius-cards: 0.5rem;

  // 动画
  --transition-standard: 0.15s ease-out;

  // 阴影
  --shadow-popup: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.12);
}

// 暗色主题
html.theme-dark {
  --color-primary: #8774e1;
  --color-background: #212121;
  --color-background-secondary: #181818;
  --color-text: #ffffff;
}
```

### 6.2 Mixins

```scss
// src/styles/_mixins.scss

// 文本截断
@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 多行截断
@mixin line-clamp($lines) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 点击效果
@mixin clickable {
  cursor: pointer;
  user-select: none;

  &:active {
    transform: scale(0.98);
  }
}

// 触摸反馈 (移动端)
@mixin touch-ripple {
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: currentColor;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:active::after {
    opacity: 0.05;
  }
}
```

### 6.3 组件样式示例

```scss
// src/components/middle/message/Message.module.scss

.Message {
  display: flex;
  padding: 0.25rem 0.5rem;

  &.own {
    flex-direction: row-reverse;

    .bubble {
      background: var(--color-background-own-message);
    }
  }

  .avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .bubble {
    max-width: 30rem;
    padding: 0.375rem 0.5rem;
    border-radius: var(--border-radius-messages);
    background: var(--color-background-secondary);

    // 消息尾巴
    &::before {
      content: '';
      position: absolute;
      // ... 三角形尾巴样式
    }
  }

  .content {
    .text {
      word-break: break-word;
      white-space: pre-wrap;
    }

    .media {
      max-width: 100%;
      border-radius: 0.5rem;
    }
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--color-text-meta);

    .time {
      @include text-ellipsis;
    }

    .status {
      display: flex;

      // 双勾动画
      .check {
        &:nth-child(2) {
          margin-left: -0.25rem;
          animation: checkAppear 0.2s ease-out;
        }
      }
    }
  }
}

@keyframes checkAppear {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## 7. Webpack 构建配置

### 7.1 核心配置

```typescript
// webpack.config.ts

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

const isDev = process.env.NODE_ENV === 'development';

const config: webpack.Configuration = {
  entry: './src/index.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
    publicPath: '/',
    clean: true,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  module: {
    rules: [
      // TypeScript
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      // SCSS Modules
      {
        test: /\.module\.scss$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: isDev ? '[name]__[local]' : '[hash:base64:8]',
              },
            },
          },
          'sass-loader',
        ],
      },

      // 全局 SCSS
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },

      // WebAssembly
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      },

      // Worker
      {
        test: /\.worker\.ts$/,
        use: {
          loader: 'worker-loader',
          options: { inline: 'no-fallback' },
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),

    !isDev &&
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ].filter(Boolean),

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        gramjs: {
          test: /[\\/]lib[\\/]gramjs[\\/]/,
          name: 'gramjs',
          priority: 20,
        },
        teact: {
          test: /[\\/]lib[\\/]teact[\\/]/,
          name: 'teact',
          priority: 20,
        },
      },
    },

    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
  },

  devServer: {
    port: 1234,
    hot: true,
    historyApiFallback: true,
  },
};

export default config;
```

### 7.2 代码分割策略

```typescript
// 路由级懒加载
const Settings = lazy(() => import('./components/settings/Settings'));
const MediaViewer = lazy(() => import('./components/media/MediaViewer'));

// 功能级懒加载
async function loadEmojiData() {
  const { default: emojiData } = await import('./lib/emoji/data');
  return emojiData;
}

// WASM 模块懒加载
async function initRLottie() {
  const rlottieModule = await import('./lib/rlottie/rlottie.wasm');
  await rlottieModule.default();
}
```

---

## 8. 性能优化技巧

### 8.1 调度器设计

```typescript
// src/util/schedulers.ts

// 使用 requestIdleCallback 执行低优先级任务
export function onIdle(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 100);
  }
}

// 使用 requestAnimationFrame 执行视觉更新
export function onNextFrame(callback: () => void): void {
  requestAnimationFrame(callback);
}

// 防抖
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ms: number,
): T {
  let timeoutId: number;

  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), ms);
  }) as T;
}

// 节流
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  ms: number,
): T {
  let lastCall = 0;

  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}
```

### 8.2 图片懒加载

```typescript
// src/hooks/useIntersectionObserver.ts

export function useIntersectionObserver(
  ref: RefObject<HTMLElement>,
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach(callback),
      {
        rootMargin: '100px', // 提前 100px 开始加载
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, callback, options]);
}

// 使用示例
const LazyImage: FC<{ src: string }> = ({ src }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useIntersectionObserver(ref, (entry) => {
    if (entry.isIntersecting) {
      setIsVisible(true);
    }
  });

  return (
    <div ref={ref} className="LazyImage">
      {isVisible ? (
        <img src={src} alt="" />
      ) : (
        <div className="placeholder" />
      )}
    </div>
  );
};
```

### 8.3 快速平滑滚动

```typescript
// src/util/fastSmoothScroll.ts

export function fastSmoothScroll(
  container: HTMLElement,
  element: HTMLElement,
  position: 'start' | 'center' | 'end' = 'center',
) {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  let targetTop: number;

  switch (position) {
    case 'start':
      targetTop = element.offsetTop;
      break;
    case 'center':
      targetTop =
        element.offsetTop -
        container.clientHeight / 2 +
        element.clientHeight / 2;
      break;
    case 'end':
      targetTop =
        element.offsetTop - container.clientHeight + element.clientHeight;
      break;
  }

  // 使用 CSS scroll-behavior 或 JS 平滑滚动
  if ('scrollBehavior' in document.documentElement.style) {
    container.scrollTo({ top: targetTop, behavior: 'smooth' });
  } else {
    animateScroll(container, targetTop, 300);
  }
}

function animateScroll(
  element: HTMLElement,
  targetTop: number,
  duration: number,
) {
  const startTop = element.scrollTop;
  const diff = targetTop - startTop;
  const startTime = performance.now();

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuad(progress);

    element.scrollTop = startTop + diff * eased;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}
```

---

## 9. 关键设计模式总结

| 模式              | 应用场景         | 优势               |
| ----------------- | ---------------- | ------------------ |
| **自研框架**      | Teact 替代 React | 极致轻量、完全控制 |
| **Web Worker**    | MTProto 协议处理 | 不阻塞主线程       |
| **虚拟滚动**      | 消息列表         | 支持无限消息       |
| **乐观更新**      | 发消息           | 即时反馈           |
| **CSS Variables** | 主题系统         | 运行时切换         |
| **代码分割**      | 路由/功能        | 减小首屏加载       |
| **WASM**          | 加密/动画        | 接近原生性能       |

---

## 10. 源码学习路径

1. **入门**：从 `src/index.tsx` 开始，理解应用入口
2. **框架**：深入 `src/lib/teact/`，理解 Teact 实现
3. **状态**：研究 `src/global/`，理解状态管理
4. **通信**：分析 `src/api/gramjs/worker/`，理解 Worker 架构
5. **组件**：阅读 `src/components/middle/MessageList.tsx`，理解虚拟滚动
6. **样式**：查看 `src/styles/`，学习 SCSS 组织方式

---

> **🔗 源码参考**：
>
> - [telegram-tt (Web Z)](https://github.com/Ajaxy/telegram-tt)
> - [Teact 框架](https://github.com/nicedayc/nicedayc)
