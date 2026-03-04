import { randomUUID } from 'node:crypto';
import { getChannelBridge } from './bridge.js';
import { createAssistantMessage } from './utils/formatter.js';
function readAccounts(config) {
    const channels = config && typeof config === 'object' && 'channels' in config
        ? config.channels
        : undefined;
    return channels?.['web-channel']?.accounts ?? {};
}
export function createWebChannel(config, logger) {
    return {
        id: 'web-channel',
        meta: {
            id: 'web-channel',
            label: 'Web Channel',
            selectionLabel: 'Web (Browser)',
            docsPath: '/channels/web-channel',
            blurb: 'WebSocket/HTTP channel for browser-based chat interfaces',
            aliases: ['web', 'browser']
        },
        capabilities: {
            chatTypes: ['direct', 'group'],
            supportsAttachments: true,
            supportsStreaming: true,
            supportsReactions: false,
            supportsThreading: true
        },
        config: {
            listAccountIds(cfg) {
                const fromRuntime = readAccounts(cfg);
                const ids = Object.keys(fromRuntime).length > 0 ? Object.keys(fromRuntime) : Object.keys(config.accounts ?? {});
                return ids.length > 0 ? ids : ['default'];
            },
            resolveAccount(cfg, accountId) {
                const id = accountId ?? 'default';
                const runtimeAccounts = readAccounts(cfg);
                const allAccounts = Object.keys(runtimeAccounts).length > 0 ? runtimeAccounts : config.accounts ?? {};
                const account = allAccounts[id];
                if (!account) {
                    throw new Error(`Account ${id} not found`);
                }
                return {
                    accountId: id,
                    ...account,
                    port: config.port,
                    host: config.host
                };
            }
        },
        outbound: {
            deliveryMode: 'direct',
            async sendText({ text, channel, context }) {
                const bridge = getChannelBridge();
                if (!bridge || !bridge.isRunning()) {
                    return {
                        ok: false,
                        error: 'Server not running',
                        retryable: true
                    };
                }
                const isChunk = typeof context?.['streamChunkIndex'] === 'number';
                const payload = isChunk
                    ? {
                        type: 'chunk',
                        messageId: String(context?.['messageId'] ?? randomUUID()),
                        content: text,
                        index: Number(context?.['streamChunkIndex'])
                    }
                    : createAssistantMessage(text, typeof context?.['threadId'] === 'string' ? context['threadId'] : undefined);
                const sent = bridge.sendToSession(channel, payload);
                if (!sent) {
                    logger.warn(`Failed to deliver outbound message to session ${channel}`);
                    return {
                        ok: false,
                        error: 'Client disconnected',
                        retryable: true
                    };
                }
                if (isChunk && context?.['isLastChunk']) {
                    bridge.sendToSession(channel, {
                        type: 'stream_end',
                        messageId: String(context?.['messageId'] ?? '')
                    });
                }
                return { ok: true };
            },
            async sendFile({ file, channel }) {
                const bridge = getChannelBridge();
                if (!bridge || !bridge.isRunning()) {
                    return {
                        ok: false,
                        error: 'Server not running',
                        retryable: true
                    };
                }
                const sent = bridge.sendToSession(channel, {
                    type: 'file',
                    id: randomUUID(),
                    fileName: file.name,
                    fileUrl: file.url,
                    mimeType: file.mimeType,
                    size: file.size,
                    timestamp: Date.now()
                });
                if (!sent) {
                    return {
                        ok: false,
                        error: 'Client disconnected',
                        retryable: true
                    };
                }
                return { ok: true };
            }
        },
        status: {
            async probe() {
                const bridge = getChannelBridge();
                const running = bridge?.isRunning() ?? false;
                return {
                    ok: running,
                    status: running ? 'connected' : 'disconnected',
                    details: {
                        port: config.port,
                        host: config.host,
                        connections: bridge?.getConnectionCount() ?? 0
                    }
                };
            }
        }
    };
}
//# sourceMappingURL=channel.js.map