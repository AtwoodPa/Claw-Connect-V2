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
  grid-template-columns: 300px 1fr;
  gap: 20px;
  padding: 20px;
  background:
    radial-gradient(circle at 15% 20%, rgba(15, 118, 110, 0.18), transparent 40%),
    radial-gradient(circle at 80% 90%, rgba(15, 118, 110, 0.14), transparent 30%),
    #e5efee;
  font-family: 'Sora', 'Avenir Next', 'PingFang SC', sans-serif;
}

.playground-panel {
  border: 1px solid rgba(18, 77, 73, 0.2);
  border-radius: 18px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 30px rgba(6, 41, 39, 0.12);
  color: #163533;
}

.playground-panel h1 {
  margin: 0;
  font-size: 24px;
}

.playground-panel p {
  color: #2f5551;
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
  border: 1px solid rgba(18, 77, 73, 0.15);
  border-radius: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.58);
}

.playground-chat {
  min-width: 0;
}

.playground-tip {
  font-size: 12px;
}

.playground-tip code {
  background: #dff2ef;
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
