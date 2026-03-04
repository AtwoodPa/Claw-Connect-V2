import type { WebSocket } from 'ws';

export type AuthType = 'jwt' | 'apikey';

export interface AccountConfig {
  enabled: boolean;
  webhookUrl?: string;
  apiKey?: string;
}

export interface PluginConfig {
  port: number;
  host: string;
  cors?: {
    origins?: string[];
    credentials: boolean;
  };
  auth: {
    type: AuthType;
    secret: string;
    expiration: number;
    allowAnonymous: boolean;
  };
  limits: {
    maxConnections: number;
    maxMessageLength: number;
    maxFileSize: number;
  };
  accounts?: Record<string, AccountConfig>;
}

export interface WebClient {
  id: string;
  ws: WebSocket;
  userId?: string;
  sessionId: string;
  accountId: string;
  isAuthenticated: boolean;
  connectedAt: number;
  lastPongAt: number;
}

export interface IncomingAuthMessage {
  type: 'auth';
  payload: {
    token: string;
    deviceInfo?: Record<string, unknown>;
  };
}

export interface IncomingChatMessage {
  type: 'chat';
  payload: {
    content: string;
    sessionId: string;
    messageId: string;
    agentId?: string;
    threadId?: string;
    attachments?: string[];
  };
}

export interface IncomingStopMessage {
  type: 'stop';
  payload: {
    messageId: string;
  };
}

export interface IncomingPingMessage {
  type: 'ping';
  payload?: Record<string, never>;
}

export type IncomingWsMessage =
  | IncomingAuthMessage
  | IncomingChatMessage
  | IncomingStopMessage
  | IncomingPingMessage;

export interface StreamChunk {
  type: 'chunk';
  messageId: string;
  content: string;
  index: number;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: number;
  connections: number;
  uptime: number;
}
