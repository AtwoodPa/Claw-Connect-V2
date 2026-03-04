class ConnectionRegistry {
    byClientId = new Map();
    bySessionId = new Map();
    add(client) {
        this.byClientId.set(client.id, client);
        this.bySessionId.set(client.sessionId, client);
    }
    remove(clientId) {
        const client = this.byClientId.get(clientId);
        if (!client) {
            return;
        }
        this.byClientId.delete(clientId);
        this.bySessionId.delete(client.sessionId);
    }
    getByClientId(clientId) {
        return this.byClientId.get(clientId);
    }
    getBySessionId(sessionId) {
        return this.bySessionId.get(sessionId);
    }
    list() {
        return Array.from(this.byClientId.values());
    }
    count() {
        return this.byClientId.size;
    }
    clear() {
        this.byClientId.clear();
        this.bySessionId.clear();
    }
}
export const connectionRegistry = new ConnectionRegistry();
//# sourceMappingURL=connection-registry.js.map