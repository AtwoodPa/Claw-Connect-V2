import { randomUUID } from 'node:crypto';
export function createWebClient(ws, accountId = 'default') {
    return {
        id: randomUUID(),
        ws,
        sessionId: randomUUID(),
        accountId,
        isAuthenticated: false,
        connectedAt: Date.now(),
        lastPongAt: Date.now()
    };
}
export function createConnectedPayload(client) {
    return {
        type: 'connected',
        clientId: client.id,
        sessionId: client.sessionId,
        timestamp: Date.now()
    };
}
export function createServerClosingPayload(reason = 'server shutdown') {
    return {
        type: 'server_closing',
        reason
    };
}
//# sourceMappingURL=connection.js.map