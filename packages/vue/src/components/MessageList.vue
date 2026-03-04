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

    <div v-if="loading && !streaming" class="oc-loading">...</div>

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
  padding: 18px;
  display: grid;
  align-content: start;
  gap: 14px;
  background:
    radial-gradient(circle at 78% 3%, color-mix(in srgb, var(--oc-color-primary) 18%, transparent), transparent 24%),
    radial-gradient(circle at 20% 96%, color-mix(in srgb, var(--oc-color-primary) 10%, transparent), transparent 26%),
    linear-gradient(180deg, color-mix(in srgb, var(--oc-color-bg) 78%, white 22%), var(--oc-color-bg));
}

.oc-message-stack {
  display: grid;
  gap: 14px;
}

.oc-empty-state {
  margin: 28px auto;
  text-align: center;
  color: var(--oc-color-muted);
  background: color-mix(in srgb, var(--oc-color-panel) 86%, transparent);
  border: 1px solid var(--oc-color-border);
  border-radius: var(--oc-radius);
  padding: 18px;
  max-width: 420px;
  box-shadow: var(--oc-shadow-sm);
}

.oc-empty-state h3 {
  margin: 0;
  font-size: 16px;
  color: var(--oc-color-text);
}

.oc-empty-state p {
  margin: 8px 0 0;
  font-size: 13px;
}

.oc-empty-state code {
  font-size: 12px;
  background: color-mix(in srgb, var(--oc-color-primary-soft) 70%, transparent);
  padding: 2px 6px;
  border-radius: 999px;
}

.oc-loading {
  color: var(--oc-color-muted);
  padding: 0 8px 10px;
}

.oc-scroll-btn {
  position: sticky;
  bottom: 18px;
  margin-left: auto;
  min-width: 74px;
  height: 34px;
  border-radius: 999px;
  border: 0;
  cursor: pointer;
  color: #fff;
  background: var(--oc-color-primary);
  box-shadow: 0 12px 20px color-mix(in srgb, var(--oc-color-primary) 45%, transparent);
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
</style>
