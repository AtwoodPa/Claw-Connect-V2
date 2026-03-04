import { afterEach, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import { WebChannelServer } from '../src/server.js';
import type { PluginConfig } from '../src/config.js';
import type { OpenClawPluginApi } from 'openclaw/plugin-sdk';
import { generateToken } from '../src/utils/auth.js';
import type { GatewayClient, GatewayRunResult } from '../src/gateway-client.js';

const config: PluginConfig = {
  port: 0,
  host: '127.0.0.1',
  auth: {
    type: 'jwt',
    secret: 'test-secret',
    expiration: 3600,
    allowAnonymous: false
  },
  limits: {
    maxConnections: 100,
    maxMessageLength: 4000,
    maxFileSize: 50 * 1024 * 1024
  },
  accounts: {
    default: { enabled: true }
  }
};

const api: OpenClawPluginApi = {
  id: 'web-channel',
  pluginConfig: config,
  logger: {
    child: () => api.logger,
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined
  },
  registerChannel: () => undefined,
  registerService: () => undefined
};

function createGatewayMock(result?: GatewayRunResult): GatewayClient {
  return {
    runAgent: async () =>
      result ?? {
        runId: 'mid-1',
        text: 'hello world',
        raw: {
          runId: 'mid-1',
          status: 'ok'
        }
      },
    abortRun: async () => undefined,
    loadHistory: async () => ({
      sessionKey: 'agent:main:web-default',
      messages: [],
      raw: {}
    })
  };
}

let server: WebChannelServer | null = null;

afterEach(async () => {
  if (server) {
    await server.stop();
    server = null;
  }
});

describe('WebChannelServer', () => {
  it('serves /health endpoint', async () => {
    server = new WebChannelServer(config, api, { gatewayClient: createGatewayMock() });
    await server.start();

    const address = server.getAddress();
    expect(address).not.toBeNull();

    const res = await fetch(`http://${address?.address}:${address?.port}/health`);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('healthy');
  });

  it('authenticates and streams chunks', async () => {
    server = new WebChannelServer(config, api, { gatewayClient: createGatewayMock() });
    await server.start();
    const address = server.getAddress();
    expect(address).not.toBeNull();

    const token = generateToken({ sub: 'user-1' }, config.auth.secret, 3600);

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://${address?.address}:${address?.port}/ws`);
      const received: string[] = [];

      ws.on('message', (raw) => {
        const payload = JSON.parse(raw.toString()) as { type: string; sessionId?: string };
        received.push(payload.type);

        if (payload.type === 'connected') {
          ws.send(JSON.stringify({ type: 'auth', payload: { token } }));
          return;
        }

        if (payload.type === 'auth_success') {
          ws.send(
            JSON.stringify({
              type: 'chat',
              payload: {
                content: 'test',
                sessionId: payload.sessionId ?? 'unknown',
                messageId: 'mid-1'
              }
            })
          );
          return;
        }

        if (payload.type === 'stream_end') {
          expect(received).toContain('message_received');
          expect(received).toContain('message_status');
          expect(received).toContain('chunk');
          ws.close();
          resolve();
        }
      });

      ws.on('error', (error) => {
        reject(error);
      });
    });
  });
});
