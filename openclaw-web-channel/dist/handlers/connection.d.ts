import type { WebSocket } from 'ws';
import type { WebClient } from '../types.js';
export declare function createWebClient(ws: WebSocket, accountId?: string): WebClient;
export declare function createConnectedPayload(client: WebClient): Record<string, unknown>;
export declare function createServerClosingPayload(reason?: string): Record<string, unknown>;
