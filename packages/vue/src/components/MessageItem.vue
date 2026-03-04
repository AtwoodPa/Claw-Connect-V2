<template>
  <article
    class="oc-message-item"
    :class="[message.role, { streaming: isStreaming }]"
    @contextmenu.prevent="showContextMenu"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div v-if="message.role !== 'system'" class="oc-message-avatar">{{ avatarText }}</div>

    <div class="oc-message-content">
      <header class="oc-message-header">
        <span>{{ roleName }}</span>
        <time>{{ formatTime(message.timestamp, locale) }}</time>
        <span v-if="showStatus" class="oc-message-status" :class="statusClass">{{ statusLabel }}</span>
      </header>

      <div class="oc-message-body">
        <div v-if="message.images?.length" class="oc-message-images">
          <img
            v-for="(img, idx) in message.images"
            :key="idx"
            :src="img.thumbnail || img.url"
            class="oc-message-image"
            @click="$emit('preview-image', img.url)"
          />
        </div>

        <div v-if="message.content" class="oc-message-text" v-html="renderedContent" />
        <span v-if="isStreaming" class="oc-cursor">▋</span>
      </div>

      <footer class="oc-message-actions">
        <button type="button" @click="copyMessage">{{ copyLabel }}</button>
        <button v-if="message.role === 'assistant'" type="button" @click="$emit('regenerate')">{{ t('message.regenerate') }}</button>
      </footer>
    </div>

    <div v-if="menuVisible" class="oc-context-mask" @click="menuVisible = false" @keyup.esc="menuVisible = false" />
    <menu v-if="menuVisible" class="oc-context-menu" :style="menuStyle">
      <button type="button" @click="handleMenu('copy')">{{ t('message.copy') }}</button>
      <button v-if="hasCodeBlock" type="button" @click="handleMenu('copy-code')">Copy Code</button>
      <button type="button" @click="handleMenu('quote')">{{ t('message.quote') }}</button>
      <button v-if="message.role === 'user'" type="button" class="danger" @click="handleMenu('delete')">{{ t('message.delete') }}</button>
    </menu>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Message } from '../types/index.js';
import { formatTime } from '../utils/format.js';
import { extractCodeBlocks, renderMarkdown } from '../utils/markdown.js';
import { useI18n } from '../composables/useI18n.js';

const props = withDefaults(
  defineProps<{
    message: Message;
    isStreaming?: boolean;
  }>(),
  {
    isStreaming: false
  }
);

const emit = defineEmits<{
  copy: [text: string];
  'preview-image': [url: string];
  regenerate: [];
  quote: [message: Message];
  delete: [id: string];
}>();

const { t, locale } = useI18n();

const menuVisible = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const copied = ref(false);
let touchTimer: number | null = null;

const renderedContent = computed(() => renderMarkdown(props.message.content, { highlight: true }));
const hasCodeBlock = computed(() => extractCodeBlocks(props.message.content).length > 0);
const copyLabel = computed(() => (copied.value ? t('message.copied') : t('message.copy')));
const showStatus = computed(() => props.message.role === 'user' && Boolean(props.message.status));
const statusClass = computed(() => `is-${props.message.status ?? 'sent'}`);
const statusLabel = computed(() => {
  switch (props.message.status) {
    case 'pending':
      return t('message.status.pending');
    case 'accepted':
      return t('message.status.accepted');
    case 'processing':
      return t('message.status.processing');
    case 'streaming':
      return t('message.status.streaming');
    case 'delivered':
      return t('message.status.delivered');
    case 'failed':
      return t('message.status.failed');
    case 'aborted':
      return t('message.status.aborted');
    default:
      return t('message.status.sent');
  }
});

const roleName = computed(() => {
  if (props.message.role === 'user') {
    return t('message.you');
  }
  if (props.message.role === 'assistant') {
    return t('message.assistant');
  }
  return t('message.system');
});

const avatarText = computed(() => {
  if (props.message.role === 'assistant') {
    return 'AI';
  }
  if (props.message.role === 'user') {
    return 'U';
  }
  return 'S';
});

const menuStyle = computed(() => ({
  left: `${menuX.value}px`,
  top: `${menuY.value}px`
}));

function setMenuPosition(clientX: number, clientY: number): void {
  const menuWidth = 160;
  const menuHeight = 180;
  const maxX = Math.max(10, window.innerWidth - menuWidth - 10);
  const maxY = Math.max(10, window.innerHeight - menuHeight - 10);

  menuX.value = Math.min(Math.max(10, clientX), maxX);
  menuY.value = Math.min(Math.max(10, clientY), maxY);
}

function showContextMenu(event: MouseEvent): void {
  setMenuPosition(event.clientX, event.clientY);
  menuVisible.value = true;
}

function handleTouchStart(event: TouchEvent): void {
  touchTimer = window.setTimeout(() => {
    const touch = event.touches[0];
    setMenuPosition(touch.clientX, touch.clientY);
    menuVisible.value = true;
  }, 500);
}

function handleTouchEnd(): void {
  if (!touchTimer) {
    return;
  }
  window.clearTimeout(touchTimer);
  touchTimer = null;
}

async function copyMessage(): Promise<void> {
  await navigator.clipboard.writeText(props.message.content);
  copied.value = true;
  emit('copy', props.message.content);
  window.setTimeout(() => {
    copied.value = false;
  }, 2000);
}

async function handleMenu(action: 'copy' | 'copy-code' | 'quote' | 'delete'): Promise<void> {
  if (action === 'copy') {
    await copyMessage();
  }

  if (action === 'copy-code') {
    const blocks = extractCodeBlocks(props.message.content);
    await navigator.clipboard.writeText(blocks.join('\n\n'));
  }

  if (action === 'quote') {
    emit('quote', props.message);
  }

  if (action === 'delete') {
    emit('delete', props.message.id);
  }

  menuVisible.value = false;
}
</script>

<style scoped>
.oc-message-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  position: relative;
}

.oc-message-item.user {
  flex-direction: row-reverse;
}

.oc-message-item.system {
  justify-content: center;
}

.oc-message-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  letter-spacing: 0.04em;
  background: color-mix(in srgb, var(--oc-color-primary) 20%, transparent);
  color: var(--oc-color-primary);
  border: 1px solid color-mix(in srgb, var(--oc-color-primary) 26%, transparent);
}

.oc-message-content {
  max-width: min(90%, 720px);
  display: grid;
  gap: 6px;
}

.oc-message-header {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--oc-color-muted);
  font-size: 12px;
}

.oc-message-item.user .oc-message-header {
  justify-content: flex-end;
}

.oc-message-body {
  border-radius: var(--oc-radius);
  border: 1px solid var(--oc-color-border);
  background: var(--oc-color-assistant-bubble);
  padding: 11px 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  box-shadow: var(--oc-shadow-sm);
}

.oc-message-item.user .oc-message-body {
  background: var(--oc-color-user-bubble);
  color: var(--oc-color-user-text);
  border-color: transparent;
}

.oc-message-item.system .oc-message-body {
  background: transparent;
  border: 0;
  color: var(--oc-color-system-text);
  box-shadow: none;
}

.oc-message-status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 11px;
  border: 1px solid color-mix(in srgb, var(--oc-color-border) 78%, transparent);
  color: var(--oc-color-muted);
  background: color-mix(in srgb, var(--oc-color-panel) 88%, transparent);
}

.oc-message-status.is-streaming,
.oc-message-status.is-processing {
  color: #0f766e;
  border-color: color-mix(in srgb, #0f766e 24%, transparent);
}

.oc-message-status.is-delivered,
.oc-message-status.is-sent {
  color: #116149;
  border-color: color-mix(in srgb, #116149 20%, transparent);
}

.oc-message-status.is-failed {
  color: #b91c1c;
  border-color: color-mix(in srgb, #b91c1c 24%, transparent);
}

.oc-message-status.is-aborted {
  color: #92400e;
  border-color: color-mix(in srgb, #92400e 28%, transparent);
}

.oc-message-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.oc-message-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid color-mix(in srgb, var(--oc-color-border) 80%, transparent);
}

.oc-message-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  opacity: 0;
  transform: translateY(-3px);
  transition: opacity var(--oc-transition), transform var(--oc-transition);
}

.oc-message-item:hover .oc-message-actions {
  opacity: 1;
  transform: translateY(0);
}

.oc-message-actions button {
  border: 1px solid var(--oc-color-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--oc-color-panel) 72%, transparent);
  color: var(--oc-color-muted);
  cursor: pointer;
  font-size: 11px;
  padding: 3px 8px;
}

.oc-message-actions button:hover {
  border-color: color-mix(in srgb, var(--oc-color-primary) 40%, transparent);
  color: var(--oc-color-primary-strong);
}

.oc-cursor {
  display: inline-block;
  margin-left: 2px;
  animation: oc-blink 1s step-end infinite;
}

.oc-context-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.oc-context-menu {
  position: fixed;
  z-index: 60;
  display: grid;
  min-width: 160px;
  border: 1px solid var(--oc-color-border);
  background: var(--oc-color-panel);
  border-radius: 10px;
  padding: 5px;
  gap: 4px;
  box-shadow: var(--oc-shadow-md);
}

.oc-context-menu button {
  text-align: left;
  border: 0;
  background: transparent;
  color: var(--oc-color-text);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
}

.oc-context-menu button:hover {
  background: color-mix(in srgb, var(--oc-color-primary) 12%, transparent);
}

.oc-context-menu button.danger {
  color: #dc2626;
}

:deep(pre) {
  padding: 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--oc-color-panel) 55%, black 8%);
  overflow-x: auto;
}

@media (max-width: 900px) {
  .oc-message-actions {
    opacity: 1;
    transform: none;
  }
}

@keyframes oc-blink {
  50% {
    opacity: 0;
  }
}
</style>
