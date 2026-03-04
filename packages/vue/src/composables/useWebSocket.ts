import { onUnmounted, ref } from 'vue';
import type { ConnectionStatus, WsClientMessage, WsServerMessage } from '../types/index.js';

interface UseWebSocketOptions {
  gatewayUrl: string;
  token?: string;
  reconnectMax?: number;
  reconnectDelay?: number;
  onMessage?: (message: WsServerMessage) => void;
  onConnect?: () => void;
  onDisconnect?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const ws = ref<WebSocket | null>(null);
  const status = ref<ConnectionStatus>('disconnected');
  const reconnectCount = ref(0);
  const lastError = ref<string | null>(null);

  let reconnectTimer: number | null = null;
  let heartbeatTimer: number | null = null;
  let manualClose = false;

  const maxReconnect = options.reconnectMax ?? 5;
  const baseDelay = options.reconnectDelay ?? 3000;

  function clearTimers(): void {
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (heartbeatTimer) {
      window.clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function toWsUrl(url: string): string {
    const raw = url.trim();
    if (!raw) {
      throw new Error('Gateway URL is empty');
    }

    const candidate = /^wss?:\/\//.test(raw) || /^https?:\/\//.test(raw) ? raw : `http://${raw}`;
    const parsed = new URL(candidate);

    parsed.protocol = parsed.protocol === 'https:' || parsed.protocol === 'wss:' ? 'wss:' : 'ws:';

    const pathname = parsed.pathname.replace(/\/+$/, '');
    parsed.pathname = pathname.endsWith('/ws') ? pathname || '/ws' : `${pathname || ''}/ws`;
    parsed.search = '';
    parsed.hash = '';

    return parsed.toString().replace(/\/$/, '');
  }

  function startHeartbeat(): void {
    heartbeatTimer = window.setInterval(() => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        send({ type: 'ping' });
      }
    }, 30000);
  }

  function scheduleReconnect(): void {
    if (reconnectCount.value >= maxReconnect) {
      status.value = 'error';
      return;
    }

    reconnectCount.value += 1;
    status.value = 'reconnecting';

    const delay = Math.min(baseDelay * reconnectCount.value, 15000);
    reconnectTimer = window.setTimeout(() => {
      void connect();
    }, delay);
  }

  async function connect(): Promise<void> {
    manualClose = false;
    clearTimers();

    try {
      const wsUrl = toWsUrl(options.gatewayUrl);
      ws.value = new WebSocket(wsUrl);
    } catch (error) {
      status.value = 'error';
      lastError.value = error instanceof Error ? error.message : String(error);
      scheduleReconnect();
      return;
    }

    ws.value.onopen = () => {
      status.value = 'connected';
      reconnectCount.value = 0;
      lastError.value = null;
      startHeartbeat();
      options.onConnect?.();

      if (options.token) {
        send({
          type: 'auth',
          payload: {
            token: options.token
          }
        });
      }
    };

    ws.value.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WsServerMessage;
        options.onMessage?.(parsed);
      } catch {
        status.value = 'error';
        lastError.value = 'Failed to parse websocket payload';
      }
    };

    ws.value.onerror = (event) => {
      status.value = 'error';
      options.onError?.(event);
    };

    ws.value.onclose = (event) => {
      clearTimers();
      options.onDisconnect?.(event);
      if (manualClose) {
        status.value = 'disconnected';
        return;
      }
      scheduleReconnect();
    };
  }

  function disconnect(): void {
    manualClose = true;
    clearTimers();
    if (ws.value) {
      ws.value.onclose = null;
      ws.value.close();
      ws.value = null;
    }
    status.value = 'disconnected';
  }

  function reconnect(): void {
    clearTimers();
    if (ws.value) {
      ws.value.onclose = null;
      ws.value.close();
      ws.value = null;
    }
    manualClose = false;
    void connect();
  }

  function send(payload: WsClientMessage): void {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    ws.value.send(JSON.stringify(payload));
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    ws,
    status,
    reconnectCount,
    lastError,
    connect,
    disconnect,
    reconnect,
    send
  };
}
