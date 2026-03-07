<template>
  <section ref="containerRef" class="oc-message-list" role="log" aria-live="polite" @scroll="handleScroll">
    <div v-if="messages.length === 0" class="oc-empty-state">
      <h3>{{ t('chat.empty') }}</h3>
      <p>Try: <code>/help</code> · <code>/new</code> · <code>/think</code></p>
    </div>

    <TransitionGroup name="oc-message" tag="div" class="oc-message-stack" appear>
      <MessageItem
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        :is-streaming="streaming && msg.id === streamingMessageId"
        @copy="$emit('copy', $event)"
        @preview-image="$emit('preview-image', $event)"
        @regenerate="$emit('regenerate', msg.id)"
        @quote="$emit('quote', $event)"
        @delete="$emit('delete', $event)"
      />
    </TransitionGroup>

    <div v-if="loading && !streaming" class="oc-loading">
      <span />
      <span />
      <span />
    </div>

    <button v-if="showScrollBottom" type="button" class="oc-scroll-btn" @click="scrollToBottom('smooth')">
      ↓ New
    </button>
  </section>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import MessageItem from './MessageItem.vue';
import type { Message } from '../types/index.js';
import { useI18n } from '../composables/useI18n.js';

const props = withDefaults(
  defineProps<{
    messages: Message[];
    streaming?: boolean;
    streamingMessageId?: string;
    loading?: boolean;
  }>(),
  {
    streaming: false,
    streamingMessageId: '',
    loading: false
  }
);

const emit = defineEmits<{
  'scroll-top': [];
  copy: [text: string];
  'preview-image': [url: string];
  regenerate: [id: string];
  quote: [message: Message];
  delete: [id: string];
}>();

const { t } = useI18n();
const containerRef = ref<HTMLElement | null>(null);
const showScrollBottom = ref(false);

function isNearBottom(): boolean {
  const el = containerRef.value;
  if (!el) {
    return true;
  }

  const threshold = 120;
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
}

function scrollToBottom(behavior: ScrollBehavior = 'auto'): void {
  const el = containerRef.value;
  if (!el) {
    return;
  }

  el.scrollTo({ top: el.scrollHeight, behavior });
  showScrollBottom.value = false;
}

function handleScroll(): void {
  const el = containerRef.value;
  if (!el) {
    return;
  }

  if (el.scrollTop <= 0) {
    emit('scroll-top');
  }

  showScrollBottom.value = !isNearBottom();
}

watch(
  () => props.messages.length,
  async () => {
    const shouldStick = isNearBottom();
    await nextTick();
    if (shouldStick) {
      scrollToBottom();
    }
  }
);

watch(
  () => props.messages.at(-1)?.content,
  async () => {
    const shouldStick = isNearBottom();
    await nextTick();
    if (props.streaming && shouldStick) {
      scrollToBottom();
    }
  }
);

defineExpose({
  scrollToBottom
});
</script>

<style scoped>
.oc-message-list {
  position: relative;
  overflow-y: auto;
  padding: 18px 20px 24px;
  display: grid;
  align-content: start;
  gap: 16px;
  background:
    radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--oc-color-primary) 18%, transparent), transparent 28%),
    radial-gradient(circle at 10% 100%, color-mix(in srgb, var(--oc-color-accent) 14%, transparent), transparent 34%),
    linear-gradient(180deg, color-mix(in srgb, var(--oc-color-bg) 84%, var(--oc-color-panel) 16%), var(--oc-color-bg));
}

.oc-message-stack {
  display: grid;
  gap: 16px;
}

.oc-empty-state {
  margin: 30px auto;
  text-align: center;
  color: var(--oc-color-muted);
  background: color-mix(in srgb, var(--oc-color-panel) 78%, transparent);
  border: 1px solid color-mix(in srgb, var(--oc-color-border) 84%, transparent);
  border-radius: var(--oc-radius);
  padding: 20px;
  max-width: 460px;
  box-shadow: var(--oc-shadow-sm);
}

.oc-empty-state h3 {
  margin: 0;
  font-size: 17px;
  color: var(--oc-color-text);
}

.oc-empty-state p {
  margin: 10px 0 0;
  font-size: 13px;
}

.oc-empty-state code {
  font-size: 12px;
  background: color-mix(in srgb, var(--oc-color-primary-soft) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--oc-color-primary) 18%, transparent);
  padding: 2px 7px;
  border-radius: 999px;
}

.oc-loading {
  color: var(--oc-color-muted);
  padding: 0 8px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.oc-loading span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--oc-color-primary) 52%, transparent);
  animation: oc-bounce 1.1s ease-in-out infinite;
}

.oc-loading span:nth-child(2) {
  animation-delay: 120ms;
}

.oc-loading span:nth-child(3) {
  animation-delay: 240ms;
}

.oc-scroll-btn {
  position: fixed;
  bottom: 18px;
  right: 24px;
  min-width: 86px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--oc-color-primary) 28%, transparent);
  cursor: pointer;
  color: #eef4ff;
  background: linear-gradient(135deg, var(--oc-color-primary), color-mix(in srgb, var(--oc-color-primary) 58%, #312e81));
  box-shadow: 0 18px 28px color-mix(in srgb, var(--oc-color-primary) 42%, transparent);
  z-index: 30;
}

.oc-message-enter-active,
.oc-message-leave-active {
  transition: all var(--oc-transition);
}

.oc-message-enter-from,
.oc-message-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.oc-message-move {
  transition: transform var(--oc-transition);
}

@keyframes oc-bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

@media (max-width: 900px) {
  .oc-message-list {
    padding: 14px 12px 18px;
  }

  .oc-scroll-btn {
    right: 14px;
    bottom: 14px;
  }
}
</style>
