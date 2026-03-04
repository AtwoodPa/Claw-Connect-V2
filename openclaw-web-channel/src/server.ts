import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import type { AddressInfo } from 'node:net';
import { WebSocketServer, type WebSocket } from 'ws';
import type { OpenClawPluginApi } from 'openclaw/plugin-sdk';
import type { PluginConfig } from './config.js';
import type { IncomingChatMessage, IncomingWsMessage, WebClient } from './types.js';
import { connectionRegistry } from './connection-registry.js';
import { createWebClient, createConnectedPayload, createServerClosingPayload } from './handlers/connection.js';
import { parseIncomingMessage } from './handlers/message.js';
import { generateToken, verifyToken } from './utils/auth.js';
import { createErrorPayload, sanitizeText } from './utils/formatter.js';
import { isUploadTypeAllowed, storeBase64File } from './handlers/file.js';
import { OpenClawGatewayCliClient, type GatewayClient } from './gateway-client.js';

interface WebChannelServerOptions {
  gatewayClient?: GatewayClient;
}

type MessageStatus = 'accepted' | 'processing' | 'streaming' | 'delivered' | 'failed' | 'aborted';
type CompletedMessageStatus = 'delivered' | 'failed' | 'aborted';

interface CachedMessageResult {
  status: CompletedMessageStatus;
  sessionKey: string;
  content: string;
  timestamp: number;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
    action: string;
  };
}

function splitIntoChunks(content: string, size = 180): string[] {
  if (!content) {
    return [];
  }

  const chunks: string[] = [];
  for (let start = 0; start < content.length; start += size) {
    chunks.push(content.slice(start, start + size));
  }
  return chunks;
}

function shouldTreatAsAbort(errorMessage: string): boolean {
  const normalized = errorMessage.toLowerCase();
  return normalized.includes('abort') || normalized.includes('cancelled') || normalized.includes('canceled');
}

function parsePositiveInt(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : Number.NaN;
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.floor(numeric)));
}

export class WebChannelServer {
  private readonly app = express();
  private readonly server: Server;
  private readonly wss: WebSocketServer;
  private readonly startedAt = Date.now();
  private heartbeatTimer: NodeJS.Timeout | null = null;

  private readonly inflightMessageIds = new Set<string>();
  private readonly inflightSessionKeys = new Map<string, string>();
  private readonly abortedMessageIds = new Set<string>();
  private readonly completedResponses = new Map<string, CachedMessageResult>();

  private readonly gatewayClient: GatewayClient;

  constructor(
    private readonly config: PluginConfig,
    private readonly api: OpenClawPluginApi,
    options?: WebChannelServerOptions
  ) {
    this.gatewayClient = options?.gatewayClient ?? new OpenClawGatewayCliClient(api.logger);

    this.app.use(express.json({ limit: `${config.limits.maxFileSize}b` }));
    this.app.use(
      cors({
        origin: config.cors?.origins ?? '*',
        credentials: config.cors?.credentials ?? true
      })
    );

    this.setupRoutes();

    this.server = createServer(this.app);
    this.wss = new WebSocketServer({
      server: this.server,
      path: '/ws',
      maxPayload: config.limits.maxFileSize
    });

    this.setupWebSocket();
  }

  private setupRoutes(): void {
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: Date.now(),
        connections: connectionRegistry.count(),
        inflightMessages: this.inflightMessageIds.size,
        uptime: Math.floor((Date.now() - this.startedAt) / 1000)
      });
    });

    this.app.get('/config', (_req: Request, res: Response) => {
      res.json({
        features: {
          streaming: true,
          fileUpload: true,
          markdown: true,
          messageStatus: true,
          historySync: true,
          retry: true
        },
        limits: {
          maxMessageLength: this.config.limits.maxMessageLength,
          maxConnections: this.config.limits.maxConnections,
          maxFileSize: this.config.limits.maxFileSize
        }
      });
    });

    this.app.get('/sessions/:sessionId/history', async (req: Request, res: Response) => {
      const sessionId = String(req.params.sessionId ?? '').trim();
      if (!sessionId) {
        res.status(400).json(createErrorPayload('HIST_001', 'sessionId is required'));
        return;
      }

      const limit = parsePositiveInt(req.query.limit, 100, 1, 300);
      const sessionKey = this.resolveGatewaySessionKeyFromSessionId(sessionId);

      try {
        const history = await this.gatewayClient.loadHistory({
          sessionKey,
          limit
        });

        res.json({
          sessionId,
          sessionKey,
          messages: history.messages,
          total: history.messages.length
        });
      } catch (error) {
        this.api.logger.error('Failed to load session history', {
          sessionId,
          sessionKey,
          error
        });

        res.status(500).json(
          createErrorPayload('HIST_002', 'Failed to load history', {
            sessionId,
            recoverable: true,
            action: 'retry'
          })
        );
      }
    });

    this.app.post('/auth', (req: Request, res: Response) => {
      const { apiKey, accountId = 'default', userId = 'web-user' } = req.body as {
        apiKey?: string;
        accountId?: string;
        userId?: string;
      };

      const account = this.config.accounts?.[accountId];
      const validApiKey = account?.apiKey;

      if (this.config.auth.type === 'apikey') {
        if (!apiKey || !validApiKey || apiKey !== validApiKey) {
          res.status(401).json(createErrorPayload('AUTH_003', 'Invalid API key'));
          return;
        }
      }

      const token = generateToken(
        {
          sub: userId,
          session: randomUUID(),
          accountId
        },
        this.config.auth.secret,
        this.config.auth.expiration
      );

      res.json({
        token,
        type: 'Bearer',
        expiresIn: this.config.auth.expiration
      });
    });

    this.app.post('/upload', async (req: Request, res: Response) => {
      const body = req.body as {
        fileName?: string;
        mimeType?: string;
        base64?: string;
      };

      if (!body.fileName || !body.mimeType || !body.base64) {
        res.status(400).json(createErrorPayload('FILE_003', 'fileName, mimeType and base64 are required'));
        return;
      }

      if (!isUploadTypeAllowed(body.mimeType)) {
        res.status(400).json(createErrorPayload('FILE_002', 'Unsupported file type'));
        return;
      }

      try {
        const uploadsDir = join(process.cwd(), '.openclaw-web-channel', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const { filename, size } = await storeBase64File({
          uploadsDir,
          fileName: body.fileName,
          mimeType: body.mimeType,
          base64: body.base64
        });

        if (size > this.config.limits.maxFileSize) {
          res.status(413).json(createErrorPayload('FILE_001', 'File exceeds max file size'));
          return;
        }

        res.json({
          url: `/uploads/${filename}`,
          filename,
          size,
          mimeType: body.mimeType
        });
      } catch (error) {
        this.api.logger.error('Upload failed', { error });
        res.status(500).json(createErrorPayload('FILE_003', 'Upload failed'));
      }
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      if (connectionRegistry.count() >= this.config.limits.maxConnections) {
        ws.send(JSON.stringify(createErrorPayload('CONN_001', 'Connection limit exceeded')));
        ws.close();
        return;
      }

      const client = createWebClient(ws);
      connectionRegistry.add(client);

      ws.send(JSON.stringify(createConnectedPayload(client)));
      this.api.logger.info(`New WebSocket connection: ${client.id}`);

      ws.on('pong', () => {
        client.lastPongAt = Date.now();
      });

      ws.on('message', async (raw) => {
        await this.handleSocketMessage(client, raw.toString());
      });

      ws.on('close', () => {
        connectionRegistry.remove(client.id);
        this.api.logger.info(`Connection closed: ${client.id}`);
      });

      ws.on('error', (error: Error) => {
        this.api.logger.error(`WebSocket error (${client.id})`, { error: error.message });
      });
    });
  }

  private sendMessageStatus(
    client: WebClient,
    messageId: string,
    status: MessageStatus,
    extra?: {
      reason?: string;
      recoverable?: boolean;
      action?: string;
      cached?: boolean;
    }
  ): void {
    client.ws.send(
      JSON.stringify({
        type: 'message_status',
        messageId,
        status,
        timestamp: Date.now(),
        ...(extra ?? {})
      })
    );
  }

  private rememberCompletedResponse(messageId: string, entry: CachedMessageResult): void {
    this.completedResponses.set(messageId, entry);

    const maxCacheSize = 300;
    while (this.completedResponses.size > maxCacheSize) {
      const oldestKey = this.completedResponses.keys().next().value as string | undefined;
      if (!oldestKey) {
        break;
      }
      this.completedResponses.delete(oldestKey);
    }
  }

  private async replayCachedResponse(client: WebClient, messageId: string, cached: CachedMessageResult): Promise<void> {
    if (cached.status === 'delivered') {
      const chunks = splitIntoChunks(cached.content);
      if (chunks.length > 0) {
        this.sendMessageStatus(client, messageId, 'streaming', { cached: true, reason: 'duplicate_cached' });
      }

      chunks.forEach((content, index) => {
        client.ws.send(
          JSON.stringify({
            type: 'chunk',
            messageId,
            content,
            index
          })
        );
      });

      client.ws.send(
        JSON.stringify({
          type: 'stream_end',
          messageId,
          cached: true
        })
      );
      this.sendMessageStatus(client, messageId, 'delivered', { cached: true, reason: 'duplicate_cached' });
      return;
    }

    if (cached.status === 'aborted') {
      this.sendMessageStatus(client, messageId, 'aborted', {
        cached: true,
        reason: 'duplicate_cached',
        recoverable: true,
        action: 'retry'
      });
      client.ws.send(
        JSON.stringify({
          type: 'stream_end',
          messageId,
          error: true,
          aborted: true,
          cached: true
        })
      );
      return;
    }

    const fallbackError = {
      code: 'MSG_004',
      message: 'Failed to process message',
      recoverable: true,
      action: 'retry'
    };
    const error = cached.error ?? fallbackError;

    client.ws.send(
      JSON.stringify(
        createErrorPayload(error.code, error.message, {
          messageId,
          recoverable: error.recoverable,
          action: error.action,
          cached: true
        })
      )
    );

    this.sendMessageStatus(client, messageId, 'failed', {
      cached: true,
      reason: 'duplicate_cached',
      recoverable: error.recoverable,
      action: error.action
    });

    client.ws.send(
      JSON.stringify({
        type: 'stream_end',
        messageId,
        error: true,
        cached: true
      })
    );
  }

  private async handleSocketMessage(client: WebClient, raw: string): Promise<void> {
    let message: IncomingWsMessage;

    try {
      message = parseIncomingMessage(raw);
    } catch {
      client.ws.send(JSON.stringify(createErrorPayload('MSG_002', 'Invalid message format')));
      return;
    }

    switch (message.type) {
      case 'auth': {
        try {
          const claims = verifyToken(message.payload.token, this.config.auth.secret);
          client.isAuthenticated = true;
          client.userId = claims.sub;
          client.ws.send(
            JSON.stringify({
              type: 'auth_success',
              userId: client.userId,
              timestamp: Date.now()
            })
          );
        } catch {
          client.ws.send(JSON.stringify(createErrorPayload('AUTH_003', 'Invalid token')));
          client.ws.send(
            JSON.stringify({
              type: 'auth_failed',
              error: 'Invalid token'
            })
          );
          client.ws.close();
        }
        break;
      }

      case 'chat': {
        await this.handleChatMessage(client, message);
        break;
      }

      case 'stop': {
        const messageId = message.payload.messageId;
        const sessionKey = this.inflightSessionKeys.get(messageId);

        if (sessionKey) {
          this.abortedMessageIds.add(messageId);
          await this.gatewayClient.abortRun({
            runId: messageId,
            sessionKey
          });

          this.sendMessageStatus(client, messageId, 'aborted', {
            reason: 'stopped_by_user',
            recoverable: true,
            action: 'retry'
          });
        }

        client.ws.send(
          JSON.stringify({
            type: 'stopped',
            messageId,
            noop: !sessionKey
          })
        );
        break;
      }

      case 'ping': {
        client.ws.send(
          JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
          })
        );
        break;
      }

      default:
        client.ws.send(JSON.stringify(createErrorPayload('MSG_002', 'Unsupported message type')));
    }
  }

  private resolveGatewaySessionKey(sessionOrId: string, fallbackSessionId: string): string {
    const rawSession = (sessionOrId || fallbackSessionId || 'default').trim();
    if (rawSession.startsWith('agent:')) {
      return rawSession;
    }

    const sanitized = rawSession.replace(/[^a-zA-Z0-9:_-]/g, '-');
    const suffix = sanitized || fallbackSessionId;
    return `agent:main:web-${suffix}`;
  }

  private resolveGatewaySessionKeyForClient(client: WebClient, providedSessionId?: string): string {
    return this.resolveGatewaySessionKey(providedSessionId ?? client.sessionId, client.sessionId);
  }

  private resolveGatewaySessionKeyFromSessionId(sessionId: string): string {
    return this.resolveGatewaySessionKey(sessionId, sessionId);
  }

  private async handleChatMessage(client: WebClient, message: IncomingChatMessage): Promise<void> {
    if (!client.isAuthenticated && !this.config.auth.allowAnonymous) {
      client.ws.send(JSON.stringify(createErrorPayload('MSG_001', 'Not authenticated')));
      return;
    }

    const cleanContent = sanitizeText(message.payload.content).trim();
    if (cleanContent.length === 0) {
      client.ws.send(JSON.stringify(createErrorPayload('MSG_002', 'Message content is empty')));
      return;
    }

    if (cleanContent.length > this.config.limits.maxMessageLength) {
      client.ws.send(JSON.stringify(createErrorPayload('MSG_003', 'Message content exceeds max length')));
      return;
    }

    const messageId = message.payload.messageId;
    const cached = this.completedResponses.get(messageId);

    if (cached) {
      client.ws.send(
        JSON.stringify({
          type: 'message_received',
          messageId,
          duplicate: true
        })
      );
      await this.replayCachedResponse(client, messageId, cached);
      return;
    }

    if (this.inflightMessageIds.has(messageId)) {
      client.ws.send(
        JSON.stringify({
          type: 'message_received',
          messageId,
          duplicate: true
        })
      );
      this.sendMessageStatus(client, messageId, 'processing', {
        reason: 'duplicate_inflight'
      });
      return;
    }

    const gatewaySessionKey = this.resolveGatewaySessionKeyForClient(client, message.payload.sessionId);
    this.inflightMessageIds.add(messageId);
    this.inflightSessionKeys.set(messageId, gatewaySessionKey);

    client.ws.send(
      JSON.stringify({
        type: 'message_received',
        messageId
      })
    );
    this.sendMessageStatus(client, messageId, 'accepted');
    this.sendMessageStatus(client, messageId, 'processing');

    try {
      const gatewayResult = await this.gatewayClient.runAgent({
        runId: messageId,
        sessionKey: gatewaySessionKey,
        message: cleanContent
      });

      const content = sanitizeText(gatewayResult.text).trim();
      const chunks = splitIntoChunks(content);

      if (chunks.length > 0) {
        this.sendMessageStatus(client, messageId, 'streaming');
      }

      chunks.forEach((chunk, index) => {
        client.ws.send(
          JSON.stringify({
            type: 'chunk',
            messageId,
            content: chunk,
            index
          })
        );
      });

      client.ws.send(
        JSON.stringify({
          type: 'stream_end',
          messageId
        })
      );
      this.sendMessageStatus(client, messageId, 'delivered');

      this.rememberCompletedResponse(messageId, {
        status: 'delivered',
        sessionKey: gatewaySessionKey,
        content,
        timestamp: Date.now()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const aborted = this.abortedMessageIds.has(messageId) || shouldTreatAsAbort(errorMessage);

      if (aborted) {
        this.sendMessageStatus(client, messageId, 'aborted', {
          reason: 'stopped_by_user',
          recoverable: true,
          action: 'retry'
        });

        client.ws.send(
          JSON.stringify({
            type: 'stream_end',
            messageId,
            error: true,
            aborted: true
          })
        );

        this.rememberCompletedResponse(messageId, {
          status: 'aborted',
          sessionKey: gatewaySessionKey,
          content: '',
          timestamp: Date.now()
        });
      } else {
        const lowerError = errorMessage.toLowerCase();
        const recoverable =
          !lowerError.includes('invalid token') &&
          !lowerError.includes('not authenticated') &&
          !lowerError.includes('unauthorized');
        const action = recoverable ? 'retry' : 'relogin';

        this.api.logger.error('Failed to process message', {
          messageId,
          sessionKey: gatewaySessionKey,
          error
        });

        client.ws.send(
          JSON.stringify(
            createErrorPayload('MSG_004', 'Failed to process message', {
              messageId,
              reason: errorMessage,
              recoverable,
              action
            })
          )
        );

        this.sendMessageStatus(client, messageId, 'failed', {
          reason: errorMessage,
          recoverable,
          action
        });

        client.ws.send(
          JSON.stringify({
            type: 'stream_end',
            messageId,
            error: true
          })
        );

        this.rememberCompletedResponse(messageId, {
          status: 'failed',
          sessionKey: gatewaySessionKey,
          content: '',
          timestamp: Date.now(),
          error: {
            code: 'MSG_004',
            message: 'Failed to process message',
            recoverable,
            action
          }
        });
      }
    } finally {
      this.inflightMessageIds.delete(messageId);
      this.inflightSessionKeys.delete(messageId);
      this.abortedMessageIds.delete(messageId);
    }
  }

  async start(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(this.config.port, this.config.host, () => {
        this.server.off('error', reject);
        resolve();
      });
    });

    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      for (const client of connectionRegistry.list()) {
        if (now - client.lastPongAt > 90_000) {
          client.ws.terminate();
          connectionRegistry.remove(client.id);
          continue;
        }
        client.ws.ping();
      }
    }, 30_000);

    this.api.logger.info(`Web Channel server started on ${this.config.host}:${this.config.port}`);
  }

  async stop(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    for (const client of connectionRegistry.list()) {
      client.ws.send(JSON.stringify(createServerClosingPayload()));
      client.ws.close();
    }

    await new Promise<void>((resolve) => {
      this.wss.close(() => {
        this.server.close(() => resolve());
      });
    });

    connectionRegistry.clear();
    this.inflightMessageIds.clear();
    this.inflightSessionKeys.clear();
    this.abortedMessageIds.clear();
    this.completedResponses.clear();
  }

  isRunning(): boolean {
    return this.server.listening;
  }

  getAddress(): AddressInfo | null {
    const address = this.server.address();
    return address && typeof address !== 'string' ? address : null;
  }

  getStatus(): { running: boolean; connections: number; port: number; host: string } {
    return {
      running: this.isRunning(),
      connections: connectionRegistry.count(),
      port: this.config.port,
      host: this.config.host
    };
  }

  getConnection(sessionId: string): WebSocket | undefined {
    return connectionRegistry.getBySessionId(sessionId)?.ws;
  }

  getConnectionCount(): number {
    return connectionRegistry.count();
  }

  sendToSession(sessionId: string, payload: unknown): boolean {
    const connection = this.getConnection(sessionId);
    if (!connection || connection.readyState !== connection.OPEN) {
      return false;
    }

    connection.send(JSON.stringify(payload));
    return true;
  }
}
