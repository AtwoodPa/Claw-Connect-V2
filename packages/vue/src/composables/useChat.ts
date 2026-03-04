import { computed, ref } from 'vue';
import type {
  Message,
  SessionHistoryResponse,
  WsChunkEvent,
  WsMessageStatusEvent,
  WsServerMessage
} from '../types/index.js';
import { useChatStore } from '../stores/chat.js';
import { useSessionStore } from '../stores/session.js';
import { useConnectionStore } from '../stores/connection.js';
import { useWebSocket } from './useWebSocket.js';
import { useMessageQueue } from '../utils/queue.js';

interface UseChatConfig {
  gatewayUrl: string;
  token?: string;
  sessionId?: string;
  reconnectMax?: number;
  reconnectDelay?: number;
  maxMessageLength?: number;
  historyLimit?: number;
  historyStep?: number;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function useChat(config: UseChatConfig) {
  const chatStore = useChatStore();
  const sessionStore = useSessionStore();
  const connectionStore = useConnectionStore();
  const { queue, enqueue, dequeue, remove } = useMessageQueue();

  const isStreaming = ref(false);
  const isLoading = ref(false);
  const isHistoryLoading = ref(false);
  const historyError = ref<string | null>(null);
  const quoteMessage = ref<Message | null>(null);
  const activeRequestId = ref<string | null>(null);
  const streamMessageId = ref<string | null>(null);
  const requestSessionIds = new Map<string, string>();
  const requestAssistantIds = new Map<string, string>();
  const loadedHistorySessions = new Set<string>();
  const historyLimitBySession = new Map<string, number>();

  const defaultHistoryLimit = Math.min(Math.max(config.historyLimit ?? 80, 20), 300);
  const historyStep = Math.min(Math.max(config.historyStep ?? 50, 20), 150);

  if (config.sessionId) {
    if (!sessionStore.sessions.some((item) => item.id === config.sessionId)) {
      sessionStore.createSession('新会话', config.sessionId);
    }
    sessionStore.selectSession(config.sessionId);
  }

  chatStore.setCurrentSession(sessionStore.currentId);

  function buildApiBaseUrl(): string {
    return config.gatewayUrl.endsWith('/') ? config.gatewayUrl.slice(0, -1) : config.gatewayUrl;
  }

  function resolveSessionId(messageId: string): string {
    return requestSessionIds.get(messageId) ?? sessionStore.currentId;
  }

  function setUserMessageStatus(messageId: string, updates: Partial<Message>): void {
    const sessionId = resolveSessionId(messageId);
    chatStore.updateMessage(sessionId, messageId, updates);
  }

  function handleChunk(event: WsChunkEvent): void {
    const sessionId = resolveSessionId(event.messageId);
    const assistantMessageId = requestAssistantIds.get(event.messageId) ?? `ai-${event.messageId}`;
    requestAssistantIds.set(event.messageId, assistantMessageId);
    streamMessageId.value = assistantMessageId;

    chatStore.setStreaming(sessionId, assistantMessageId);
    chatStore.appendStreamContent(sessionId, assistantMessageId, event.content);
    setUserMessageStatus(event.messageId, { status: 'streaming' });

    isLoading.value = false;
    isStreaming.value = true;
  }

  function handleMessageStatus(event: WsMessageStatusEvent): void {
    const statusReason = event.reason ? String(event.reason).slice(0, 200) : undefined;
    setUserMessageStatus(event.messageId, {
      status: event.status,
      statusReason
    });

    if (event.status === 'accepted' || event.status === 'processing') {
      isLoading.value = true;
      return;
    }

    if (event.status === 'streaming') {
      isLoading.value = false;
      isStreaming.value = true;
      return;
    }

    if ((event.status === 'failed' || event.status === 'aborted') && activeRequestId.value === event.messageId) {
      isLoading.value = false;
    }
  }

  function finalizeRequest(messageId: string): void {
    const sessionId = resolveSessionId(messageId);
    if (activeRequestId.value === messageId) {
      activeRequestId.value = null;
      streamMessageId.value = null;
      isLoading.value = false;
      isStreaming.value = false;
    }

    chatStore.setStreaming(sessionId, null);
    requestSessionIds.delete(messageId);
    requestAssistantIds.delete(messageId);

    const next = dequeue();
    if (next) {
      void doSend(next.content, next.images);
    }
  }

  async function loadHistory(params: {
    sessionId?: string;
    append?: boolean;
    force?: boolean;
    limit?: number;
  } = {}): Promise<void> {
    const sessionId = (params.sessionId ?? sessionStore.currentId).trim();
    if (!sessionId || isHistoryLoading.value) {
      return;
    }

    const currentLimit = historyLimitBySession.get(sessionId) ?? defaultHistoryLimit;
    const requestedLimit = params.limit ?? (params.append ? currentLimit + historyStep : currentLimit);
    const limit = Math.min(Math.max(requestedLimit, 20), 300);
    const hasLocalMessages = (chatStore.messages[sessionId] ?? []).length > 0;

    if (!params.force && !params.append && loadedHistorySessions.has(sessionId) && hasLocalMessages) {
      return;
    }

    historyLimitBySession.set(sessionId, limit);
    historyError.value = null;
    isHistoryLoading.value = true;

    try {
      const response = await fetch(`${buildApiBaseUrl()}/sessions/${encodeURIComponent(sessionId)}/history?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const history = (await response.json()) as SessionHistoryResponse;
      const messages = history.messages
        .filter((item) => typeof item.content === 'string' && item.content.trim().length > 0)
        .map((item): Message => ({
          id: item.id,
          role: item.role,
          content: item.content,
          timestamp: item.timestamp,
          status: item.role === 'user' ? 'delivered' : 'sent'
        }));

      chatStore.mergeMessages(sessionId, messages);

      const mergedMessageCount = chatStore.messages[sessionId]?.length ?? messages.length;
      const latest = [...messages].reverse().find((item) => item.role !== 'system') ?? messages[messages.length - 1];
      if (latest) {
        sessionStore.syncSessionSnapshot(sessionId, {
          lastMessage: latest.content,
          messageCount: mergedMessageCount,
          updatedAt: latest.timestamp
        });
      }

      loadedHistorySessions.add(sessionId);
    } catch (error) {
      historyError.value = error instanceof Error ? error.message : String(error);
    } finally {
      isHistoryLoading.value = false;
    }
  }

  function handleServerMessage(event: WsServerMessage): void {
    switch (event.type) {
      case 'connected': {
        connectionStore.setStatus('connected');
        break;
      }
      case 'auth_failed': {
        connectionStore.setStatus('error', event.error);
        isLoading.value = false;
        isStreaming.value = false;
        break;
      }
      case 'message_received': {
        setUserMessageStatus(event.messageId, {
          status: event.duplicate ? 'processing' : 'accepted'
        });
        isLoading.value = true;
        if (event.duplicate) {
          isStreaming.value = true;
        }
        break;
      }
      case 'message_status': {
        handleMessageStatus(event);
        break;
      }
      case 'chunk': {
        handleChunk(event);
        break;
      }
      case 'stream_end': {
        if (event.error) {
          const failedStatus = event.aborted ? 'aborted' : 'failed';
          setUserMessageStatus(event.messageId, { status: failedStatus });
        } else {
          setUserMessageStatus(event.messageId, { status: 'delivered' });
        }
        finalizeRequest(event.messageId);
        break;
      }
      case 'message': {
        const currentSessionId = sessionStore.currentId;
        chatStore.addMessage(currentSessionId, {
          id: event.id,
          role: 'assistant',
          content: event.content,
          timestamp: event.timestamp,
          status: 'delivered'
        });
        sessionStore.touchSession(currentSessionId, event.content);
        isLoading.value = false;
        isStreaming.value = false;
        break;
      }
      case 'stopped': {
        setUserMessageStatus(event.messageId, {
          status: 'aborted',
          statusReason: event.noop ? 'noop' : 'stopped_by_user'
        });
        finalizeRequest(event.messageId);
        break;
      }
      case 'error': {
        const errorDetails = event.error?.details;
        const errorMessage = event.error?.message ?? 'Unknown websocket error';
        const reason = event.error?.reason ?? errorDetails?.reason ?? errorMessage;
        const messageId = event.error?.messageId ?? errorDetails?.messageId;

        connectionStore.setStatus('error', errorMessage);
        if (messageId) {
          setUserMessageStatus(messageId, {
            status: 'failed',
            statusReason: reason
          });
          finalizeRequest(messageId);
        } else if (activeRequestId.value) {
          setUserMessageStatus(activeRequestId.value, {
            status: 'failed',
            statusReason: reason
          });
          finalizeRequest(activeRequestId.value);
        }
        isLoading.value = false;
        isStreaming.value = false;
        break;
      }
      case 'server_closing': {
        connectionStore.setStatus('disconnected', event.reason);
        break;
      }
      default:
        break;
    }
  }

  const webSocket = useWebSocket({
    gatewayUrl: config.gatewayUrl,
    token: config.token,
    reconnectMax: config.reconnectMax,
    reconnectDelay: config.reconnectDelay,
    onMessage: handleServerMessage,
    onConnect: () => {
      connectionStore.setStatus('connected');
      connectionStore.resetReconnect();
      if (!activeRequestId.value && !isStreaming.value) {
        const next = dequeue();
        if (next) {
          void doSend(next.content, next.images);
        }
      }
    },
    onDisconnect: () => {
      connectionStore.setStatus('disconnected');
      if (activeRequestId.value) {
        setUserMessageStatus(activeRequestId.value, {
          status: 'pending',
          statusReason: 'connection_lost'
        });
      }
    },
    onError: () => {
      connectionStore.setStatus('error', 'WebSocket error');
    }
  });

  async function doSend(content: string, images?: File[]): Promise<void> {
    const text = content.trim();
    if (!text) {
      return;
    }

    const maxLength = config.maxMessageLength ?? 4000;
    if (text.length > maxLength) {
      throw new Error(`Message exceeds max length: ${maxLength}`);
    }

    const currentSessionId = sessionStore.currentId;
    const requestId = createId();

    const imageItems = images?.map((file) => ({
      url: URL.createObjectURL(file)
    }));

    chatStore.addMessage(currentSessionId, {
      id: requestId,
      role: 'user',
      content: quoteMessage.value ? `> ${quoteMessage.value.content}\n\n${text}` : text,
      timestamp: Date.now(),
      images: imageItems,
      status: 'pending'
    });

    sessionStore.touchSession(currentSessionId, text);

    activeRequestId.value = requestId;
    streamMessageId.value = `ai-${requestId}`;
    requestSessionIds.set(requestId, currentSessionId);
    requestAssistantIds.set(requestId, streamMessageId.value);
    chatStore.setStreaming(currentSessionId, streamMessageId.value);

    isLoading.value = true;
    isStreaming.value = false;

    const attachments = imageItems?.map((item) => item.url);

    try {
      webSocket.send({
        type: 'chat',
        payload: {
          content: text,
          sessionId: currentSessionId,
          messageId: requestId,
          attachments
        }
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Failed to send message';
      setUserMessageStatus(requestId, {
        status: 'failed',
        statusReason: reason
      });
      finalizeRequest(requestId);
      connectionStore.setStatus('error', reason);
    }

    quoteMessage.value = null;
  }

  async function send(content: string, images?: File[]): Promise<void> {
    if (isLoading.value || isStreaming.value) {
      enqueue({ content, images });
      return;
    }

    await doSend(content, images);
  }

  function stop(): void {
    if (!activeRequestId.value) {
      return;
    }

    const messageId = activeRequestId.value;

    try {
      webSocket.send({
        type: 'stop',
        payload: {
          messageId
        }
      });
    } catch {
      // Keep local abort semantics even when socket is temporarily unavailable.
    }

    setUserMessageStatus(messageId, {
      status: 'aborted',
      statusReason: 'stopped_by_user'
    });
    finalizeRequest(messageId);
  }

  function quote(message: Message): void {
    quoteMessage.value = message;
  }

  function retry(messageId: string): void {
    const currentMessages = chatStore.currentMessages;
    const index = currentMessages.findIndex((item) => item.id === messageId);
    if (index === -1) {
      return;
    }

    let target = currentMessages[index];
    if (target.role !== 'user') {
      for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
        if (currentMessages[cursor].role === 'user') {
          target = currentMessages[cursor];
          break;
        }
      }
    }

    if (target.role !== 'user') {
      return;
    }

    void send(target.content);
  }

  function connect(): Promise<void> {
    return webSocket.connect();
  }

  function removeFromQueue(index: number): void {
    remove(index);
  }

  return {
    messages: computed(() => chatStore.currentMessages),
    isStreaming,
    isLoading,
    isConnected: computed(() => webSocket.status.value === 'connected'),
    status: computed(() => webSocket.status.value),
    reconnectCount: computed(() => webSocket.reconnectCount.value),
    queue,
    quoteMessage,
    send,
    stop,
    quote,
    retry,
    connect,
    loadHistory,
    disconnect: webSocket.disconnect,
    reconnect: webSocket.reconnect,
    removeFromQueue,
    isHistoryLoading,
    historyError
  };
}
