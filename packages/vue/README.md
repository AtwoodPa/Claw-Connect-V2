# @openclaw/web-channel-vue

Vue 3 聊天组件库，适配 OpenClaw Web Channel。

## 安装

```bash
npm install @openclaw/web-channel-vue
```

## 组件

- `ChatContainer`
- `MessageList`
- `MessageItem`
- `ChatInput`
- `SessionList`

## 功能

- WebSocket 实时通信与自动重连
- 流式输出展示
- 消息投递状态展示（accepted/processing/delivered/failed 等）
- 历史消息同步（连接/切会话/上拉加载）
- Markdown 渲染与代码高亮
- 主题切换（亮色/暗色/跟随系统）
- 中英国际化

## 初始化配置

```ts
import { createChatInitConfigFromEnv } from '@openclaw/web-channel-vue';

const initConfig = createChatInitConfigFromEnv();
```

`.env` 可参考 `.env.example`。
