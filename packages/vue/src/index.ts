import type { App } from 'vue';
import { createPinia } from 'pinia';
import ChatContainer from './components/ChatContainer.vue';
import MessageList from './components/MessageList.vue';
import MessageItem from './components/MessageItem.vue';
import ChatInput from './components/ChatInput.vue';
import SessionList from './components/SessionList.vue';
import { i18n } from './composables/useI18n.js';
import './styles/index.css';

export * from './types/index.js';
export * from './composables/useChat.js';
export * from './composables/useWebSocket.js';
export * from './composables/useTheme.js';
export * from './composables/useI18n.js';
export * from './config/init.js';

export { ChatContainer, MessageList, MessageItem, ChatInput, SessionList };

const components = [ChatContainer, MessageList, MessageItem, ChatInput, SessionList];

function install(app: App): void {
  const hasPinia = Boolean((app as App & { _context?: { provides?: Record<string, unknown> } })._context?.provides?.pinia);
  if (!hasPinia) {
    app.use(createPinia());
  }

  app.use(i18n);

  for (const component of components) {
    app.component(component.name ?? 'OpenClawComponent', component);
  }
}

export default {
  install
};
