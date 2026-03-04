import { defineStore } from 'pinia';
import type { Session } from '../types/index.js';

function createSessionItem(title: string, id?: string, agentId = 'main'): Session {
  const sessionId = id ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);
  return {
    id: sessionId,
    title,
    updatedAt: Date.now(),
    lastMessage: '',
    messageCount: 0,
    agentId,
    pinned: false
  };
}

interface SessionState {
  sessions: Session[];
  currentId: string;
  searchQuery: string;
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => {
    const initial = createSessionItem('新会话', 'default', 'main');
    return {
      sessions: [initial],
      currentId: initial.id,
      searchQuery: ''
    };
  },
  getters: {
    sortedSessions(state): Session[] {
      return [...state.sessions].sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) {
          return a.pinned ? -1 : 1;
        }
        return b.updatedAt - a.updatedAt;
      });
    },
    currentSession(state): Session | undefined {
      return state.sessions.find((item) => item.id === state.currentId);
    },
    pinnedSessions(state): Session[] {
      return state.sessions.filter((item) => item.pinned);
    },
    filteredSessions(state): Session[] {
      const query = state.searchQuery.trim().toLowerCase();
      if (!query) {
        return state.sessions;
      }

      return state.sessions.filter((item) => item.title.toLowerCase().includes(query));
    }
  },
  actions: {
    createSession(title = '新会话', id?: string, agentId = 'main'): Session {
      const session = createSessionItem(title, id, agentId);
      this.sessions.unshift(session);
      this.currentId = session.id;
      return session;
    },
    selectSession(id: string): void {
      if (!this.sessions.some((item) => item.id === id)) {
        return;
      }
      this.currentId = id;
    },
    deleteSession(id: string): void {
      this.sessions = this.sessions.filter((item) => item.id !== id);
      if (this.sessions.length === 0) {
        const created = this.createSession('新会话');
        this.currentId = created.id;
        return;
      }
      if (this.currentId === id) {
        this.currentId = this.sessions[0].id;
      }
    },
    updateTitle(id: string, title: string): void {
      const target = this.sessions.find((item) => item.id === id);
      if (!target) {
        return;
      }
      target.title = title.slice(0, 50);
      target.updatedAt = Date.now();
    },
    updateAgent(id: string, agentId: string): void {
      const target = this.sessions.find((item) => item.id === id);
      if (!target) {
        return;
      }

      const normalized = (agentId || 'main').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'main';
      target.agentId = normalized;
      target.updatedAt = Date.now();
      this.reorderSessions();
    },
    pinSession(id: string, pinned: boolean): void {
      const target = this.sessions.find((item) => item.id === id);
      if (!target) {
        return;
      }
      target.pinned = pinned;
      this.reorderSessions();
    },
    resetSession(id: string): void {
      const target = this.sessions.find((item) => item.id === id);
      if (!target) {
        return;
      }
      target.lastMessage = '';
      target.messageCount = 0;
      target.updatedAt = Date.now();
    },
    touchSession(id: string, lastMessage: string): void {
      const target = this.sessions.find((item) => item.id === id);
      if (!target) {
        return;
      }
      target.lastMessage = lastMessage;
      target.messageCount += 1;
      target.updatedAt = Date.now();
      this.reorderSessions();
    },
    syncSessionSnapshot(
      id: string,
      payload: {
        lastMessage?: string;
        messageCount?: number;
        updatedAt?: number;
      }
    ): void {
      const target = this.sessions.find((item) => item.id === id);
      if (!target) {
        return;
      }

      if (typeof payload.lastMessage === 'string') {
        target.lastMessage = payload.lastMessage;
      }

      if (typeof payload.messageCount === 'number') {
        target.messageCount = Math.max(0, Math.floor(payload.messageCount));
      }

      if (typeof payload.updatedAt === 'number' && Number.isFinite(payload.updatedAt)) {
        target.updatedAt = payload.updatedAt;
      }

      this.reorderSessions();
    },
    reorderSessions(): void {
      this.sessions = [...this.sortedSessions];
    }
  }
});
