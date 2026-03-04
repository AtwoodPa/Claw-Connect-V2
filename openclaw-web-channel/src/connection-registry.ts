import type { WebClient } from './types.js';

class ConnectionRegistry {
  private readonly byClientId = new Map<string, WebClient>();
  private readonly bySessionId = new Map<string, WebClient>();

  add(client: WebClient): void {
    this.byClientId.set(client.id, client);
    this.bySessionId.set(client.sessionId, client);
  }

  remove(clientId: string): void {
    const client = this.byClientId.get(clientId);
    if (!client) {
      return;
    }
    this.byClientId.delete(clientId);
    this.bySessionId.delete(client.sessionId);
  }

  getByClientId(clientId: string): WebClient | undefined {
    return this.byClientId.get(clientId);
  }

  getBySessionId(sessionId: string): WebClient | undefined {
    return this.bySessionId.get(sessionId);
  }

  list(): WebClient[] {
    return Array.from(this.byClientId.values());
  }

  count(): number {
    return this.byClientId.size;
  }

  clear(): void {
    this.byClientId.clear();
    this.bySessionId.clear();
  }
}

export const connectionRegistry = new ConnectionRegistry();
