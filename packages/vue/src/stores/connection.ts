import { defineStore } from 'pinia';
import type { ConnectionStatus } from '../types/index.js';

interface ConnectionState {
  status: ConnectionStatus;
  reconnectCount: number;
  lastError: string | null;
  latency: number;
}

export const useConnectionStore = defineStore('connection', {
  state: (): ConnectionState => ({
    status: 'disconnected',
    reconnectCount: 0,
    lastError: null,
    latency: 0
  }),
  actions: {
    setStatus(status: ConnectionStatus, error?: string): void {
      this.status = status;
      this.lastError = error ?? null;
    },
    incrementReconnect(): void {
      this.reconnectCount += 1;
    },
    resetReconnect(): void {
      this.reconnectCount = 0;
    },
    setLatency(ms: number): void {
      this.latency = ms;
    }
  }
});
