<template>
  <section class="openclaw-chat oc-chat-shell" :class="{ 'is-dark': isDark }">
    <div class="oc-bg-orb oc-bg-orb-a" />
    <div class="oc-bg-orb oc-bg-orb-b" />

    <header class="oc-chat-header">
      <div class="oc-chat-header-main">
        <button type="button" class="oc-mobile-menu" aria-label="Toggle sessions" @click="showSidebar = !showSidebar">☰</button>
        <div class="oc-title-block">
          <strong>{{ currentSession?.title || t('chat.title') }}</strong>
          <p>Web Channel · {{ statusText }}</p>
        </div>
      </div>

      <div class="oc-chat-header-actions">
        <label class="oc-agent-picker">
          <span>{{ t('chat.agent') }}</span>
          <select v-model="currentAgentId" @change="handleAgentChange">
            <option v-for="agent in availableAgents" :key="agent.id" :value="agent.id">{{ agent.name }}</option>
          </select>
        </label>
        <span class="oc-connection" :class="status">
          <span class="dot" />
          {{ statusText }}
        </span>
        <button type="button" @click="toggle">{{ isDark ? 'Light' : 'Dark' }}</button>
        <button type="button" @click="switchLocale">{{ locale === 'zh-CN' ? 'EN' : '中文' }}</button>
        <button type="button" class="primary" @click="handleNewSession">{{ t('chat.newSession') }}</button>
      </div>
    </header>

    <div class="oc-chat-body">
      <div v-if="showSidebar" class="oc-sidebar-mask" @click="showSidebar = false" />

      <SessionList
        v-model:visible="showSidebar"
        :sessions="sessions"
        :current-id="currentSessionId"
        :agent-labels="agentLabelMap"
        @select="handleSessionSelect"
        @delete="handleSessionDelete"
        @reset="handleSessionReset"
        @new="handleNewSession"
      />

      <main class="oc-chat-main">
        <MessageList
          ref="messageListRef"
          :messages="messages"
          :streaming="isStreaming"
          :streaming-message-id="streamingMessageId"
          :loading="isLoading || isHistoryLoading"
          @copy="handleCopy"
          @preview-image="handleImagePreview"
          @regenerate="handleRegenerate"
          @quote="handleQuote"
          @delete="handleDeleteMessage"
          @scroll-top="loadMoreHistory"
        />

        <Transition name="oc-fade">
          <div v-if="!isConnected" class="oc-offline">
            <span>{{ t('chat.disconnected') }}</span>
            <button type="button" @click="handleReconnect">{{ t('chat.reconnect') }}</button>
          </div>
        </Transition>

        <ChatInput
          v-model="inputMessage"
          :disabled="isLoading && !isStreaming"
          :uploading="false"
          :loading="isStreaming"
          :queued-count="queue.length"
          :max-length="resolvedInit.options.maxMessageLength"
          @send="handleSend"
          @upload="handleUpload"
          @command="handleCommand"
          @stop="stop"
        />
      </main>
    </div>

    <dialog v-if="previewVisible" class="oc-preview" open @click="previewVisible = false">
      <img :src="previewImage" alt="preview" />
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import ChatInput from './ChatInput.vue';
import MessageList from './MessageList.vue';
import SessionList from './SessionList.vue';
import { ensurePinia } from '../stores/pinia.js';
import { useChatStore } from '../stores/chat.js';
import { useSessionStore } from '../stores/session.js';
import { useChat } from '../composables/useChat.js';
import { useTheme } from '../composables/useTheme.js';
import { useI18n } from '../composables/useI18n.js';
import { createChatInitConfig } from '../config/init.js';
import type { AgentListResponse, AgentOption, ChatInitConfig, ChatOptions, Message, ThemeConfig } from '../types/index.js';

ensurePinia();

const props = withDefaults(
  defineProps<{
    gatewayUrl?: string;
    token?: string;
    sessionId?: string;
    userId?: string;
    defaultAgentId?: string;
    agents?: AgentOption[];
    theme?: ThemeConfig;
    locale?: string;
    options?: ChatOptions;
    initConfig?: Partial<ChatInitConfig>;
  }>(),
  {
    gatewayUrl: '',
    token: '',
    sessionId: '',
    userId: '',
    defaultAgentId: 'main',
    agents: () => [],
    locale: 'auto',
    options: () => ({}),
    initConfig: () => ({})
  }
);

const emit = defineEmits<{
  connect: [];
  disconnect: [{ code?: number; reason?: string }];
  error: [{ error: string }];
  message: [{ message: Message; sessionId: string }];
  'session-change': [{ sessionId: string }];
}>();

const resolvedInit = createChatInitConfig({
  ...props.initConfig,
  gatewayUrl: props.gatewayUrl || props.initConfig?.gatewayUrl,
  token: props.token || props.initConfig?.token,
  sessionId: props.sessionId || props.initConfig?.sessionId,
  userId: props.userId || props.initConfig?.userId,
  defaultAgentId: props.defaultAgentId || props.initConfig?.defaultAgentId,
  agents: props.agents?.length ? props.agents : props.initConfig?.agents,
  locale: props.locale !== 'auto' ? props.locale : props.initConfig?.locale,
  theme: props.theme ?? props.initConfig?.theme,
  options: {
    ...(props.initConfig?.options ?? {}),
    ...(props.options ?? {})
  }
});

const chatStore = useChatStore();
const sessionStore = useSessionStore();
const { sortedSessions: sessions, currentSession } = storeToRefs(sessionStore);

if (resolvedInit.sessionId && !sessionStore.sessions.some((item) => item.id === resolvedInit.sessionId)) {
  sessionStore.createSession('新会话', resolvedInit.sessionId, resolvedInit.defaultAgentId);
}
if (resolvedInit.sessionId) {
  sessionStore.selectSession(resolvedInit.sessionId);
}
if (!sessionStore.currentSession?.agentId) {
  sessionStore.updateAgent(sessionStore.currentId, resolvedInit.defaultAgentId);
}
chatStore.setCurrentSession(sessionStore.currentId);

const { t, locale, setLocale } = useI18n();
const { isDark, toggle } = useTheme(resolvedInit.theme.mode);
const availableAgents = ref<AgentOption[]>(
  resolvedInit.agents.length > 0
    ? resolvedInit.agents
    : [
        {
          id: resolvedInit.defaultAgentId,
          name: resolvedInit.defaultAgentId
        }
      ]
);

if (resolvedInit.locale && resolvedInit.locale !== 'auto') {
  setLocale(resolvedInit.locale);
}

const {
  messages,
  isStreaming,
  isLoading,
  isConnected,
  status,
  queue,
  send,
  stop,
  quote,
  retry,
  connect,
  reconnect,
  loadHistory,
  isHistoryLoading,
  historyError
} = useChat({
  gatewayUrl: resolvedInit.gatewayUrl,
  token: resolvedInit.token,
  sessionId: sessionStore.currentId,
  defaultAgentId: resolvedInit.defaultAgentId,
  reconnectDelay: resolvedInit.options.reconnectDelay,
  reconnectMax: resolvedInit.options.reconnectMax,
  maxMessageLength: resolvedInit.options.maxMessageLength
});

const inputMessage = ref('');
const showSidebar = ref(true);
const previewVisible = ref(false);
const previewImage = ref('');
const messageListRef = ref<InstanceType<typeof MessageList> | null>(null);
const currentAgentId = ref(sessionStore.currentSession?.agentId ?? resolvedInit.defaultAgentId);

const currentSessionId = computed(() => sessionStore.currentId);
const agentLabelMap = computed<Record<string, string>>(() =>
  Object.fromEntries(availableAgents.value.map((item) => [item.id, item.name]))
);
const streamingMessageId = computed(() => chatStore.streamingMessageId ?? '');
const statusText = computed(() => {
  if (status.value === 'connected') {
    return t('status.connected');
  }
  if (status.value === 'reconnecting') {
    return `${t('status.reconnecting')} (${queue.value.length})`;
  }
  return t('chat.disconnected');
});

function normalizeAgentId(agentId: string | undefined): string {
  const raw = (agentId ?? '').trim();
  return raw.replace(/[^a-zA-Z0-9_-]/g, '') || resolvedInit.defaultAgentId || 'main';
}

function buildApiBaseUrl(): string {
  return resolvedInit.gatewayUrl.endsWith('/') ? resolvedInit.gatewayUrl.slice(0, -1) : resolvedInit.gatewayUrl;
}

async function syncAgents(): Promise<void> {
  try {
    const response = await fetch(`${buildApiBaseUrl()}/agents`);
    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as AgentListResponse;
    if (!Array.isArray(payload.agents) || payload.agents.length === 0) {
      return;
    }

    availableAgents.value = payload.agents.map((item) => ({
      id: normalizeAgentId(item.id),
      name: item.name?.trim() || item.id
    }));
    const defaultFromServer = normalizeAgentId(payload.defaultAgentId);

    const current = currentAgentId.value;
    if (!availableAgents.value.some((item) => item.id === current)) {
      currentAgentId.value = defaultFromServer;
      sessionStore.updateAgent(sessionStore.currentId, defaultFromServer);
    }
  } catch {
    // Keep local configured agents when /agents is unavailable.
  }
}

function handleShortcut(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'l') {
    event.preventDefault();
    toggle();
    return;
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
    event.preventDefault();
    showSidebar.value = !showSidebar.value;
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleShortcut);
  try {
    await connect();
    await syncAgents();
    await loadHistory({ force: true });
    emit('connect');
  } catch (error) {
    emit('error', { error: error instanceof Error ? error.message : 'connect failed' });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut);
});

watch(
  () => sessionStore.currentId,
  (next, previous) => {
    if (next === previous) {
      return;
    }
    chatStore.setCurrentSession(next);

    const targetSession = sessionStore.currentSession;
    if (targetSession && !targetSession.agentId) {
      sessionStore.updateAgent(next, resolvedInit.defaultAgentId);
    }

    currentAgentId.value = sessionStore.currentSession?.agentId ?? resolvedInit.defaultAgentId;

    emit('session-change', { sessionId: next });
    void loadHistory({ sessionId: next, replace: true });
  }
);

watch(
  () => status.value,
  (next) => {
    if (next === 'error') {
      emit('error', { error: 'WebSocket connection error' });
    }
    if (next === 'disconnected') {
      emit('disconnect', { reason: 'socket closed' });
    }
  }
);

watch(
  () => historyError.value,
  (error) => {
    if (!error) {
      return;
    }
    emit('error', { error: `History sync failed: ${error}` });
  }
);

watch(
  () => messages.value.at(-1),
  (lastMessage) => {
    if (!lastMessage) {
      return;
    }
    emit('message', {
      message: lastMessage,
      sessionId: sessionStore.currentId
    });
  }
);

async function handleSend(content: string, files: File[]): Promise<void> {
  await send(content, files);
  inputMessage.value = '';
}

function handleUpload(_files: FileList): void {
  // 上传由接入方控制，可在这里替换成企业内对象存储流程。
}

function handleCommand(command: string, args: string): void {
  if (command === 'new') {
    handleNewSession();
    return;
  }

  if (command === 'clear') {
    handleSessionReset(sessionStore.currentId);
    return;
  }

  if (command === 'model') {
    inputMessage.value = `/model ${args}`.trim();
    return;
  }

  if (command === 'help') {
    chatStore.addMessage(sessionStore.currentId, {
      id: `${Date.now()}`,
      role: 'system',
      content: '/model, /think, /new, /clear, /help',
      timestamp: Date.now(),
      status: 'sent'
    });
  }
}

function handleSessionSelect(id: string): void {
  sessionStore.selectSession(id);
  chatStore.setCurrentSession(id);
}

function handleSessionDelete(id: string): void {
  sessionStore.deleteSession(id);
  chatStore.clearMessages(id);
}

function handleSessionReset(id: string): void {
  chatStore.clearMessages(id);
  chatStore.addMessage(id, {
    id: `${Date.now()}`,
    role: 'system',
    content: '历史已清空',
    timestamp: Date.now(),
    status: 'sent'
  });
  sessionStore.resetSession(id);
}

function handleNewSession(): void {
  const created = sessionStore.createSession(t('chat.newSession'), undefined, currentAgentId.value);
  chatStore.setCurrentSession(created.id);
  if (window.innerWidth < 900) {
    showSidebar.value = false;
  }
}

function handleCopy(_text: string): void {
  // 可接入埋点上报。
}

function handleImagePreview(url: string): void {
  previewImage.value = url;
  previewVisible.value = true;
}

function handleRegenerate(messageId: string): void {
  retry(messageId);
}

function handleQuote(message: Message): void {
  quote(message);
  inputMessage.value = `> ${message.content}\n`;
}

function handleDeleteMessage(id: string): void {
  chatStore.deleteMessage(sessionStore.currentId, id);
}

function loadMoreHistory(): void {
  void loadHistory({
    sessionId: sessionStore.currentId,
    append: true,
    force: true
  });
}

function handleAgentChange(): void {
  const selected = normalizeAgentId(currentAgentId.value);
  const currentSession = sessionStore.currentSession;
  if (!currentSession) {
    return;
  }

  if (currentSession.agentId === selected) {
    return;
  }

  sessionStore.updateAgent(currentSession.id, selected);
  chatStore.clearMessages(currentSession.id);
  void loadHistory({
    sessionId: currentSession.id,
    force: true,
    replace: true
  });
}

function switchLocale(): void {
  setLocale(locale.value === 'zh-CN' ? 'en' : 'zh-CN');
}

function handleReconnect(): void {
  reconnect();
}
</script>

<style scoped>
.oc-chat-shell {
  width: 100%;
  min-height: 640px;
  border-radius: 20px;
  border: 1px solid var(--oc-color-border);
  background: var(--oc-color-bg);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  position: relative;
  box-shadow: var(--oc-shadow-md);
}

.oc-bg-orb {
  position: absolute;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  filter: blur(54px);
  opacity: 0.28;
  pointer-events: none;
}

.oc-bg-orb-a {
  top: -180px;
  right: -120px;
  background: color-mix(in srgb, var(--oc-color-primary) 65%, transparent);
}

.oc-bg-orb-b {
  bottom: -180px;
  left: -120px;
  background: color-mix(in srgb, var(--oc-color-primary) 35%, transparent);
}

.oc-chat-header {
  height: 64px;
  border-bottom: 1px solid var(--oc-color-border);
  background: color-mix(in srgb, var(--oc-color-panel) 90%, transparent);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 14px;
  position: relative;
  z-index: 2;
}

.oc-chat-header-main,
.oc-chat-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.oc-title-block {
  display: grid;
}

.oc-title-block p {
  margin: 1px 0 0;
  color: var(--oc-color-muted);
  font-size: 11px;
}

.oc-chat-header-actions button,
.oc-mobile-menu {
  border: 1px solid var(--oc-color-border);
  background: color-mix(in srgb, var(--oc-color-panel) 70%, transparent);
  color: var(--oc-color-text);
  height: 32px;
  padding: 0 11px;
  border-radius: 999px;
  cursor: pointer;
}

.oc-chat-header-actions button:hover,
.oc-mobile-menu:hover {
  border-color: color-mix(in srgb, var(--oc-color-primary) 36%, transparent);
}

.oc-agent-picker {
  border: 1px solid var(--oc-color-border);
  background: color-mix(in srgb, var(--oc-color-panel) 70%, transparent);
  color: var(--oc-color-text);
  height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.oc-agent-picker span {
  color: var(--oc-color-muted);
  font-size: 11px;
}

.oc-agent-picker select {
  border: 0;
  background: transparent;
  color: var(--oc-color-text);
  outline: none;
  min-width: 90px;
  max-width: 180px;
  font-size: 12px;
}

.oc-chat-header-actions button.primary {
  background: var(--oc-color-primary);
  border-color: transparent;
  color: #fff;
}

.oc-mobile-menu {
  display: none;
}

.oc-chat-body {
  min-height: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  position: relative;
  z-index: 1;
}

.oc-chat-main {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 1fr auto auto;
}

.oc-sidebar-mask {
  display: none;
}

.oc-offline {
  display: flex;
  justify-content: center;
  gap: 8px;
  align-items: center;
  color: #dc2626;
  background: color-mix(in srgb, #dc2626 10%, transparent);
  border-top: 1px solid color-mix(in srgb, #dc2626 30%, transparent);
  padding: 8px;
}

.oc-offline button {
  border: 0;
  background: #dc2626;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.oc-connection {
  font-size: 12px;
  color: var(--oc-color-muted);
  border: 1px solid var(--oc-color-border);
  border-radius: 999px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
}

.oc-connection .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.oc-connection.connected {
  color: #0f9b5a;
}

.oc-connection.reconnecting {
  color: #d97706;
}

.oc-connection.error,
.oc-connection.disconnected {
  color: #dc2626;
}

.oc-preview {
  position: fixed;
  inset: 0;
  border: 0;
  background: rgba(0, 0, 0, 0.75);
  display: grid;
  place-items: center;
  z-index: 100;
  cursor: zoom-out;
}

.oc-preview img {
  max-width: 92vw;
  max-height: 92vh;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.oc-fade-enter-active,
.oc-fade-leave-active {
  transition: opacity var(--oc-transition), transform var(--oc-transition);
}

.oc-fade-enter-from,
.oc-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 900px) {
  .oc-chat-shell {
    min-height: 100dvh;
    border-radius: 0;
  }

  .oc-chat-body {
    grid-template-columns: 1fr;
  }

  .oc-mobile-menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .oc-sidebar-mask {
    display: block;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.28);
    z-index: 15;
  }

  .oc-chat-header-actions {
    gap: 4px;
  }

  .oc-chat-header-actions button:not(.primary) {
    display: none;
  }

  .oc-agent-picker {
    padding: 0 8px;
  }

  .oc-agent-picker span {
    display: none;
  }

  .oc-agent-picker select {
    min-width: 74px;
    max-width: 120px;
  }
}
</style>
