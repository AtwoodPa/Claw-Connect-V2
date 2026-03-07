<template>
  <div class="playground-root">
    <aside class="playground-panel">
      <h1>OpenClaw Vue Chat</h1>
      <p>Real-time AI chat UI playground with streaming, markdown, i18n and theme switching.</p>

      <ul>
        <li><strong>Gateway:</strong> {{ chatInitConfig.gatewayUrl }}</li>
        <li><strong>Locale:</strong> {{ chatInitConfig.locale }}</li>
        <li><strong>Theme:</strong> {{ chatInitConfig.theme.mode }}</li>
        <li><strong>Reconnect:</strong> {{ chatInitConfig.options.reconnectMax }} times</li>
      </ul>

      <p class="playground-tip">Shortcuts: <code>Cmd/Ctrl + B</code> toggle sidebar · <code>Cmd/Ctrl + Shift + L</code> toggle theme</p>
    </aside>

    <main class="playground-chat">
      <ChatContainer
        :init-config="chatInitConfig"
        @connect="connected = true"
        @disconnect="connected = false"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChatContainer } from '../index.js';
import { chatInitConfig } from './chat-init.js';

const connected = ref(false);
</script>

<style scoped>
.playground-root {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 18px;
  padding: 18px;
  background:
    radial-gradient(circle at 8% 12%, rgba(59, 130, 246, 0.2), transparent 40%),
    radial-gradient(circle at 90% 92%, rgba(99, 102, 241, 0.16), transparent 34%),
    #eff4ff;
  font-family: 'Space Grotesk', 'Sora', 'Avenir Next', 'PingFang SC', sans-serif;
}

.playground-panel {
  border: 1px solid rgba(37, 99, 235, 0.16);
  border-radius: 22px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(14px);
  box-shadow: 0 24px 36px rgba(15, 23, 42, 0.12);
  color: #10213d;
}

.playground-panel h1 {
  margin: 0;
  font-size: 24px;
}

.playground-panel p {
  color: #334a71;
  line-height: 1.6;
}

.playground-panel ul {
  margin: 16px 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
  font-size: 13px;
}

.playground-panel li {
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.64);
}

.playground-chat {
  min-width: 0;
}

.playground-tip {
  font-size: 12px;
}

.playground-tip code {
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 999px;
}

@media (max-width: 1080px) {
  .playground-root {
    grid-template-columns: 1fr;
  }

  .playground-panel {
    order: 2;
  }
}
</style>
