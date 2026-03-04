import { randomUUID } from 'node:crypto';
import type { WebSocket } from 'ws';
import type { WebClient } from '../types.js';

export function createWebClient(ws: WebSocket, accountId = 'default'): WebClient {
  return {
    id: randomUUID(),
    ws,
    sessionId: randomUUID(),
    accountId,
    isAuthenticated: false,
    connectedAt: Date.now(),
    lastPongAt: Date.now()
  };
}

export function createConnectedPayload(client: WebClient): Record<string, unknown> {
  return {
    type: 'connected',
    clientId: client.id,
    sessionId: client.sessionId,
    timestamp: Date.now()
  };
}

export function createServerClosingPayload(reason = 'server shutdown'): Record<string, unknown> {
  return {
    type: 'server_closing',
    reason
  };
}
