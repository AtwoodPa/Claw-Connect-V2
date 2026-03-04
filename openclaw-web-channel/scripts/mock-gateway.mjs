import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const HOST = process.env.MOCK_HOST ?? '127.0.0.1';
const PORT = Number(process.env.MOCK_PORT ?? 3000);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*', credentials: true }));

const sessions = new Map();

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    connections: sessions.size,
    mode: 'mock-gateway'
  });
});

app.get('/config', (_req, res) => {
  res.json({
    features: {
      streaming: true,
      fileUpload: true,
      markdown: true
    },
    limits: {
      maxMessageLength: 4000,
      maxConnections: 1000,
      maxFileSize: 50 * 1024 * 1024
    }
  });
});

app.post('/auth', (req, res) => {
  const userId = req.body?.userId || 'mock-user';
  res.json({
    token: `mock-token-${userId}`,
    type: 'Bearer',
    expiresIn: 3600
  });
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function safeSend(ws, payload) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function streamResponse(ws, messageId, prompt) {
  const text = `Mock AI: 收到你的消息「${prompt}」。\n\n这是一个本地开发流式回复，用于前端预览。`;
  const chunks = text.match(/.{1,8}/g) || [text];

  let index = 0;
  const timer = setInterval(() => {
    if (index >= chunks.length) {
      clearInterval(timer);
      safeSend(ws, { type: 'stream_end', messageId });
      return;
    }

    safeSend(ws, {
      type: 'chunk',
      messageId,
      content: chunks[index],
      index
    });

    index += 1;
  }, 80);

  return timer;
}

wss.on('connection', (ws) => {
  const clientId = randomUUID();
  const sessionId = randomUUID();
  const activeTimers = new Map();

  sessions.set(clientId, { ws, sessionId, activeTimers });

  safeSend(ws, {
    type: 'connected',
    clientId,
    sessionId,
    timestamp: Date.now()
  });

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      safeSend(ws, {
        type: 'error',
        error: { code: 'MSG_002', message: 'Invalid message format' }
      });
      return;
    }

    if (data.type === 'auth') {
      safeSend(ws, {
        type: 'auth_success',
        userId: 'mock-user',
        timestamp: Date.now()
      });
      return;
    }

    if (data.type === 'ping') {
      safeSend(ws, {
        type: 'pong',
        timestamp: Date.now()
      });
      return;
    }

    if (data.type === 'stop') {
      const mid = data.payload?.messageId;
      const timer = activeTimers.get(mid);
      if (timer) {
        clearInterval(timer);
        activeTimers.delete(mid);
      }
      safeSend(ws, {
        type: 'stopped',
        messageId: mid
      });
      return;
    }

    if (data.type === 'chat') {
      const messageId = data.payload?.messageId || randomUUID();
      const content = String(data.payload?.content || '').trim();

      safeSend(ws, {
        type: 'message_received',
        messageId
      });

      const timer = streamResponse(ws, messageId, content || '空消息');
      activeTimers.set(messageId, timer);
      return;
    }

    safeSend(ws, {
      type: 'error',
      error: { code: 'MSG_002', message: 'Unsupported message type' }
    });
  });

  ws.on('close', () => {
    for (const timer of activeTimers.values()) {
      clearInterval(timer);
    }
    sessions.delete(clientId);
  });

  ws.on('error', () => {
    for (const timer of activeTimers.values()) {
      clearInterval(timer);
    }
    sessions.delete(clientId);
  });
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`[mock-gateway] listening on http://${HOST}:${PORT}\n`);
});
