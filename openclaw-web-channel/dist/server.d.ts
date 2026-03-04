import type { AddressInfo } from 'node:net';
import { type WebSocket } from 'ws';
import type { OpenClawPluginApi } from 'openclaw/plugin-sdk';
import type { PluginConfig } from './config.js';
import { type GatewayClient } from './gateway-client.js';
interface WebChannelServerOptions {
    gatewayClient?: GatewayClient;
}
export declare class WebChannelServer {
    private readonly config;
    private readonly api;
    private readonly app;
    private readonly server;
    private readonly wss;
    private readonly startedAt;
    private heartbeatTimer;
    private readonly inflightMessageIds;
    private readonly inflightSessionKeys;
    private readonly abortedMessageIds;
    private readonly completedResponses;
    private readonly gatewayClient;
    constructor(config: PluginConfig, api: OpenClawPluginApi, options?: WebChannelServerOptions);
    private setupRoutes;
    private setupWebSocket;
    private sendMessageStatus;
    private rememberCompletedResponse;
    private replayCachedResponse;
    private handleSocketMessage;
    private resolveGatewaySessionKey;
    private resolveGatewaySessionKeyForClient;
    private resolveGatewaySessionKeyFromSessionId;
    private handleChatMessage;
    start(): Promise<void>;
    stop(): Promise<void>;
    isRunning(): boolean;
    getAddress(): AddressInfo | null;
    getStatus(): {
        running: boolean;
        connections: number;
        port: number;
        host: string;
    };
    getConnection(sessionId: string): WebSocket | undefined;
    getConnectionCount(): number;
    sendToSession(sessionId: string, payload: unknown): boolean;
}
export {};
