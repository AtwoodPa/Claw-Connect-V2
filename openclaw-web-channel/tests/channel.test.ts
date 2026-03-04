import { describe, expect, it } from 'vitest';
import { createWebChannel } from '../src/channel.js';
import { setChannelBridge } from '../src/bridge.js';
import type { PluginConfig } from '../src/config.js';
import type { Logger } from 'openclaw/plugin-sdk';

const logger: Logger = {
  child: () => logger,
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined
};

const config: PluginConfig = {
  port: 3000,
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
    maxFileSize: 1024
  },
  accounts: {
    default: {
      enabled: true,
      apiKey: 'abc'
    }
  }
};

describe('createWebChannel', () => {
  it('returns default account', () => {
    const plugin = createWebChannel(config, logger);
    expect(plugin.config.listAccountIds({})).toEqual(['default']);
  });

  it('fails when bridge is unavailable', async () => {
    setChannelBridge(null);
    const plugin = createWebChannel(config, logger);
    const result = await plugin.outbound.sendText({
      text: 'hello',
      channel: 'session-1',
      account: {}
    });

    expect(result.ok).toBe(false);
    expect(result.retryable).toBe(true);
  });

  it('sends outbound text when bridge is available', async () => {
    const sentPayloads: unknown[] = [];
    setChannelBridge({
      isRunning: () => true,
      getConnectionCount: () => 1,
      sendToSession: (_sessionId, payload) => {
        sentPayloads.push(payload);
        return true;
      }
    });

    const plugin = createWebChannel(config, logger);
    const result = await plugin.outbound.sendText({
      text: 'hello',
      channel: 'session-1',
      account: {}
    });

    expect(result.ok).toBe(true);
    expect(sentPayloads).toHaveLength(1);
  });
});
