<template>
  <aside class="oc-session-list" :class="{ hidden: !visible }">
    <header class="oc-session-header">
      <div>
        <strong>{{ t('session.title') }}</strong>
        <p>Context library</p>
      </div>
      <div class="oc-session-header-actions">
        <button type="button" class="oc-session-btn" @click="emit('new')">{{ t('session.new') }}</button>
      </div>
    </header>

    <div class="oc-session-search-wrap">
      <input v-model="searchQuery" type="text" placeholder="Search sessions..." class="oc-session-search" />
    </div>

    <div v-if="filteredSessions.length === 0" class="oc-session-empty">{{ t('session.empty') }}</div>

    <ul v-else class="oc-session-items">
      <li
        v-for="session in filteredSessions"
        :key="session.id"
        class="oc-session-item"
        :class="{ active: session.id === currentId }"
        @click="handleSelect(session.id)"
      >
        <div class="oc-session-main">
          <span class="oc-session-title">
            <span v-if="session.pinned" class="oc-pin">📌</span>
            {{ session.title }}
          </span>
          <span class="oc-session-time">{{ formatSessionTime(session.updatedAt, locale) }}</span>
        </div>

        <div class="oc-session-sub">
          <span class="oc-session-preview">{{ session.lastMessage || '...' }}</span>
          <span v-if="session.messageCount > 0" class="oc-session-count">{{ session.messageCount > 99 ? '99+' : session.messageCount }}</span>
        </div>

        <div class="oc-session-actions">
          <button type="button" @click.stop="emit('reset', session.id)">{{ t('session.clear') }}</button>
          <button type="button" @click.stop="emit('delete', session.id)">{{ t('session.delete') }}</button>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '../composables/useI18n.js';
import { formatSessionTime } from '../utils/format.js';
import type { Session } from '../types/index.js';

const props = withDefaults(
  defineProps<{
    sessions: Session[];
    currentId: string;
    visible?: boolean;
  }>(),
  {
    visible: true
  }
);

const emit = defineEmits<{
  'update:visible': [value: boolean];
  select: [id: string];
  delete: [id: string];
  reset: [id: string];
  new: [];
}>();

const { t, locale } = useI18n();
const searchQuery = ref('');

const filteredSessions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const sorted = [...props.sessions].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) {
      return a.pinned ? -1 : 1;
    }
    return b.updatedAt - a.updatedAt;
  });

  if (!query) {
    return sorted;
  }

  return sorted.filter((session) => {
    return session.title.toLowerCase().includes(query) || session.lastMessage.toLowerCase().includes(query);
  });
});

function handleSelect(id: string): void {
  emit('select', id);
  if (window.innerWidth < 900) {
    emit('update:visible', false);
  }
}
</script>

<style scoped>
.oc-session-list {
  width: 288px;
  background: linear-gradient(180deg, var(--oc-color-panel), var(--oc-color-panel-elevated));
  border-right: 1px solid var(--oc-color-border);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.oc-session-list.hidden {
  display: none;
}

.oc-session-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 14px 10px;
  border-bottom: 1px solid var(--oc-color-border);
}

.oc-session-header p {
  margin: 4px 0 0;
  color: var(--oc-color-muted);
  font-size: 12px;
}

.oc-session-btn {
  border: 0;
  border-radius: 999px;
  background: var(--oc-color-primary);
  color: white;
  padding: 6px 10px;
  cursor: pointer;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--oc-color-primary) 35%, transparent);
}

.oc-session-search-wrap {
  padding: 10px 12px;
  border-bottom: 1px solid var(--oc-color-border);
}

.oc-session-search {
  width: 100%;
  border: 1px solid var(--oc-color-border);
  border-radius: 10px;
  background: transparent;
  color: var(--oc-color-text);
  padding: 8px 10px;
  outline: none;
}

.oc-session-search:focus {
  border-color: var(--oc-color-primary);
}

.oc-session-items {
  margin: 0;
  padding: 10px;
  list-style: none;
  display: grid;
  gap: 10px;
  overflow-y: auto;
}

.oc-session-item {
  border: 1px solid var(--oc-color-border);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  background: color-mix(in srgb, var(--oc-color-panel) 74%, transparent);
  transition: transform var(--oc-transition), border-color var(--oc-transition), background var(--oc-transition);
}

.oc-session-item:hover {
  transform: translateY(-1px);
}

.oc-session-item.active {
  border-color: var(--oc-color-primary);
  background: color-mix(in srgb, var(--oc-color-primary-soft) 54%, transparent);
}

.oc-session-main,
.oc-session-sub {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.oc-session-title {
  font-weight: 600;
  max-width: 150px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.oc-pin {
  font-size: 12px;
}

.oc-session-time,
.oc-session-preview {
  color: var(--oc-color-muted);
  font-size: 12px;
}

.oc-session-preview {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.oc-session-count {
  display: inline-flex;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background: var(--oc-color-primary);
  color: white;
  font-size: 11px;
  padding: 0 6px;
}

.oc-session-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.oc-session-actions button {
  border: 0;
  background: transparent;
  color: var(--oc-color-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

.oc-session-actions button:hover {
  color: var(--oc-color-text);
}

.oc-session-empty {
  color: var(--oc-color-muted);
  font-size: 13px;
  padding: 16px;
}

@media (max-width: 900px) {
  .oc-session-list {
    position: absolute;
    z-index: 20;
    inset: 64px auto 0 0;
    height: calc(100% - 64px);
    box-shadow: var(--oc-shadow-md);
  }
}
</style>
