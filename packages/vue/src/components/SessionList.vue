<template>
  <aside class="oc-session-list" :class="{ hidden: !visible }">
    <header class="oc-session-header">
      <div class="oc-session-heading">
        <strong>{{ t('session.title') }}</strong>
        <p>{{ filteredSessions.length }} sessions</p>
      </div>
      <div class="oc-session-header-actions">
        <button type="button" class="oc-session-btn" @click="emit('new')">＋</button>
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
          <div class="oc-session-meta">
            <span class="oc-session-agent">{{ resolveAgentLabel(session.agentId) }}</span>
            <span class="oc-session-time">{{ formatSessionTime(session.updatedAt, locale) }}</span>
          </div>
        </div>

        <div class="oc-session-sub">
          <span class="oc-session-preview">{{ session.lastMessage || '...' }}</span>
          <span v-if="session.messageCount > 0" class="oc-session-count">{{ session.messageCount > 99 ? '99+' : session.messageCount }}</span>
        </div>

        <div class="oc-session-actions">
          <button type="button" title="Clear" @click.stop="emit('reset', session.id)">↺</button>
          <button type="button" title="Delete" @click.stop="emit('delete', session.id)">✕</button>
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
    agentLabels?: Record<string, string>;
    visible?: boolean;
  }>(),
  {
    agentLabels: () => ({}),
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

function resolveAgentLabel(agentId: string): string {
  if (props.agentLabels[agentId]) {
    return props.agentLabels[agentId];
  }
  return agentId;
}
</script>

<style scoped>
.oc-session-list {
  width: 300px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--oc-color-panel) 88%, transparent), color-mix(in srgb, var(--oc-color-panel-elevated) 92%, transparent));
  border-right: 1px solid color-mix(in srgb, var(--oc-color-border) 84%, transparent);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.oc-session-list.hidden {
  display: none;
}

.oc-session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--oc-color-border) 84%, transparent);
}

.oc-session-heading {
  display: grid;
  gap: 4px;
}

.oc-session-header p {
  margin: 0;
  color: var(--oc-color-muted);
  font-size: 12px;
}

.oc-session-btn {
  border: 1px solid color-mix(in srgb, var(--oc-color-border) 84%, transparent);
  border-radius: 12px;
  width: 34px;
  height: 34px;
  background: color-mix(in srgb, var(--oc-color-panel-elevated) 85%, transparent);
  color: var(--oc-color-text);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.oc-session-btn:hover {
  border-color: color-mix(in srgb, var(--oc-color-primary) 44%, transparent);
  background: color-mix(in srgb, var(--oc-color-primary-soft) 64%, transparent);
}

.oc-session-search-wrap {
  padding: 10px 12px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--oc-color-border) 82%, transparent);
}

.oc-session-search {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--oc-color-border) 88%, transparent);
  border-radius: 11px;
  background: color-mix(in srgb, var(--oc-color-panel-elevated) 84%, transparent);
  color: var(--oc-color-text);
  padding: 9px 11px;
  outline: none;
}

.oc-session-search:focus {
  border-color: color-mix(in srgb, var(--oc-color-primary) 54%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--oc-color-primary) 14%, transparent);
}

.oc-session-items {
  margin: 0;
  padding: 10px 10px 12px;
  list-style: none;
  display: grid;
  gap: 8px;
  overflow-y: auto;
}

.oc-session-item {
  border: 1px solid color-mix(in srgb, var(--oc-color-border) 76%, transparent);
  border-radius: 14px;
  padding: 11px;
  cursor: pointer;
  background: color-mix(in srgb, var(--oc-color-panel) 75%, transparent);
  transition: transform var(--oc-transition), border-color var(--oc-transition), background var(--oc-transition), box-shadow var(--oc-transition);
}

.oc-session-item:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--oc-color-primary) 26%, transparent);
  box-shadow: var(--oc-shadow-sm);
}

.oc-session-item.active {
  border-color: color-mix(in srgb, var(--oc-color-primary) 52%, transparent);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--oc-color-primary-soft) 68%, transparent),
    color-mix(in srgb, var(--oc-color-panel) 86%, transparent)
  );
}

.oc-session-main,
.oc-session-sub {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.oc-session-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.oc-session-agent {
  border: 1px solid color-mix(in srgb, var(--oc-color-border) 76%, transparent);
  color: var(--oc-color-muted);
  font-size: 10px;
  border-radius: 999px;
  padding: 0 7px;
  line-height: 18px;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.oc-session-title {
  font-weight: 600;
  max-width: 170px;
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
  min-width: 22px;
  height: 22px;
  border-radius: 11px;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--oc-color-primary) 20%, transparent);
  color: var(--oc-color-primary);
  font-size: 11px;
  font-weight: 700;
  padding: 0 7px;
}

.oc-session-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 9px;
  opacity: 0;
  transform: translateY(2px);
  transition: opacity var(--oc-transition), transform var(--oc-transition);
}

.oc-session-item:hover .oc-session-actions,
.oc-session-item.active .oc-session-actions {
  opacity: 1;
  transform: translateY(0);
}

.oc-session-actions button {
  border: 1px solid color-mix(in srgb, var(--oc-color-border) 84%, transparent);
  background: color-mix(in srgb, var(--oc-color-panel-elevated) 84%, transparent);
  color: var(--oc-color-muted);
  border-radius: 8px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

.oc-session-actions button:hover {
  border-color: color-mix(in srgb, var(--oc-color-primary) 42%, transparent);
  color: var(--oc-color-primary-strong);
}

.oc-session-empty {
  color: var(--oc-color-muted);
  font-size: 13px;
  padding: 16px;
  margin: 12px;
  border: 1px dashed color-mix(in srgb, var(--oc-color-border) 84%, transparent);
  border-radius: 14px;
}

@media (max-width: 900px) {
  .oc-session-list {
    width: min(82vw, 300px);
  }
}
</style>
