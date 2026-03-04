export type MessageRole = 'user' | 'assistant' | 'system';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';
export type MessageStatus =
  | 'pending'
  | 'accepted'
  | 'processing'
  | 'streaming'
  | 'delivered'
  | 'failed'
  | 'aborted'
  | 'sent'
  | 'error';

export interface MessageImage {
  url: string;
  thumbnail?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  images?: MessageImage[];
  quoteId?: string;
  status?: MessageStatus;
  statusReason?: string;
}

export interface Session {
  id: string;
  title: string;
  updatedAt: number;
  lastMessage: string;
  messageCount: number;
  agentId: string;
  pinned?: boolean;
}

export interface ChatOptions {
  autoScroll?: boolean;
  enableTypingIndicator?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  maxMessageLength?: number;
  reconnectMax?: number;
  reconnectDelay?: number;
}

export interface ChatInitConfig {
  gatewayUrl: string;
  token?: string;
  sessionId?: string;
  userId?: string;
  defaultAgentId: string;
  agents: AgentOption[];
  locale: string;
  theme: ThemeConfig;
  options: Required<ChatOptions>;
}

export interface AgentOption {
  id: string;
  name: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
}

export interface QueuedMessage {
  content: string;
  images?: File[];
}

export interface WsConnectedEvent {
  type: 'connected';
  clientId: string;
  sessionId: string;
  timestamp: number;
}

export interface WsAuthSuccessEvent {
  type: 'auth_success';
  userId: string;
  timestamp: number;
}

export interface WsAuthFailedEvent {
  type: 'auth_failed';
  error: string;
}

export interface WsMessageReceivedEvent {
  type: 'message_received';
  messageId: string;
  duplicate?: boolean;
}

export interface WsAssistantMessageEvent {
  type: 'message';
  id: string;
  role: 'assistant';
  content: string;
  timestamp: number;
  threadId?: string;
}

export interface WsChunkEvent {
  type: 'chunk';
  messageId: string;
  content: string;
  index: number;
}

export interface WsStreamEndEvent {
  type: 'stream_end';
  messageId: string;
  error?: boolean;
  aborted?: boolean;
  cached?: boolean;
}

export interface WsStoppedEvent {
  type: 'stopped';
  messageId: string;
  noop?: boolean;
}

export interface WsMessageStatusEvent {
  type: 'message_status';
  messageId: string;
  status: 'accepted' | 'processing' | 'streaming' | 'delivered' | 'failed' | 'aborted';
  timestamp: number;
  reason?: string;
  recoverable?: boolean;
  action?: string;
  cached?: boolean;
}

export interface WsErrorEvent {
  type: 'error';
  error?: {
    code?: string;
    message?: string;
    recoverable?: boolean;
    action?: string;
    reason?: string;
    messageId?: string;
    details?: {
      recoverable?: boolean;
      action?: string;
      reason?: string;
      messageId?: string;
      cached?: boolean;
    };
  };
}

export interface WsPongEvent {
  type: 'pong';
  timestamp: number;
}

export interface WsServerClosingEvent {
  type: 'server_closing';
  reason?: string;
}

export interface SessionHistoryPayload {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface SessionHistoryResponse {
  sessionId: string;
  agentId?: string;
  sessionKey: string;
  total: number;
  messages: SessionHistoryPayload[];
}

export interface AgentListResponse {
  agents: AgentOption[];
  defaultAgentId?: string;
}

export type WsServerMessage =
  | WsConnectedEvent
  | WsAuthSuccessEvent
  | WsAuthFailedEvent
  | WsMessageReceivedEvent
  | WsAssistantMessageEvent
  | WsChunkEvent
  | WsStreamEndEvent
  | WsStoppedEvent
  | WsMessageStatusEvent
  | WsErrorEvent
  | WsPongEvent
  | WsServerClosingEvent;

export type WsClientMessage =
  | {
      type: 'auth';
      payload: { token: string };
    }
  | {
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
  | {
      type: 'stop';
      payload: { messageId: string };
    }
  | {
      type: 'ping';
      payload?: Record<string, never>;
    };
