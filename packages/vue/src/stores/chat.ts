import { defineStore } from 'pinia';
import type { Message } from '../types/index.js';

interface ChatState {
  messages: Record<string, Message[]>;
  currentSessionId: string;
  streamingMessageId: string | null;
}

function normalizeMessages(messages: Message[]): Message[] {
  const byId = new Map<string, Message>();

  for (const item of messages) {
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, { ...item });
      continue;
    }

    const content = item.content.length >= existing.content.length ? item.content : existing.content;
    const timestamp = Math.max(existing.timestamp, item.timestamp);

    byId.set(item.id, {
      ...existing,
      ...item,
      content,
      timestamp,
      status: item.status ?? existing.status,
      statusReason: item.statusReason ?? existing.statusReason,
      images: item.images ?? existing.images
    });
  }

  return [...byId.values()].sort((a, b) => a.timestamp - b.timestamp);
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    messages: {},
    currentSessionId: 'default',
    streamingMessageId: null
  }),
  getters: {
    currentMessages(state): Message[] {
      return state.messages[state.currentSessionId] ?? [];
    },
    hasMessages(state): boolean {
      return (state.messages[state.currentSessionId] ?? []).length > 0;
    },
    lastMessage(state): Message | undefined {
      const current = state.messages[state.currentSessionId] ?? [];
      return current[current.length - 1];
    }
  },
  actions: {
    ensureSession(sessionId: string): void {
      if (!this.messages[sessionId]) {
        this.messages[sessionId] = [];
      }
    },
    setCurrentSession(sessionId: string): void {
      this.ensureSession(sessionId);
      this.currentSessionId = sessionId;
    },
    addMessage(sessionId: string, message: Message): void {
      this.ensureSession(sessionId);
      this.messages[sessionId].push(message);
    },
    setSessionMessages(sessionId: string, messages: Message[]): void {
      this.ensureSession(sessionId);
      this.messages[sessionId] = normalizeMessages(messages);
    },
    mergeMessages(sessionId: string, messages: Message[]): void {
      this.ensureSession(sessionId);
      this.messages[sessionId] = normalizeMessages([...(this.messages[sessionId] ?? []), ...messages]);
    },
    updateMessage(sessionId: string, messageId: string, updates: Partial<Message>): void {
      const target = (this.messages[sessionId] ?? []).find((item) => item.id === messageId);
      if (!target) {
        return;
      }

      Object.assign(target, updates);
    },
    deleteMessage(sessionId: string, messageId: string): void {
      this.messages[sessionId] = (this.messages[sessionId] ?? []).filter((item) => item.id !== messageId);
    },
    clearMessages(sessionId: string): void {
      this.messages[sessionId] = [];
    },
    setStreaming(sessionId: string, messageId: string | null): void {
      this.ensureSession(sessionId);
      this.streamingMessageId = messageId;
    },
    appendStreamContent(sessionId: string, messageId: string, chunk: string): void {
      this.ensureSession(sessionId);
      const target = this.messages[sessionId].find((item) => item.id === messageId);
      if (!target) {
        this.messages[sessionId].push({
          id: messageId,
          role: 'assistant',
          content: chunk,
          timestamp: Date.now(),
          status: 'delivered'
        });
        return;
      }

      target.content += chunk;
    },
    getMessage(sessionId: string, messageId: string): Message | undefined {
      return (this.messages[sessionId] ?? []).find((item) => item.id === messageId);
    }
  }
});
