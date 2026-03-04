import type { WebClient } from './types.js';
declare class ConnectionRegistry {
    private readonly byClientId;
    private readonly bySessionId;
    add(client: WebClient): void;
    remove(clientId: string): void;
    getByClientId(clientId: string): WebClient | undefined;
    getBySessionId(sessionId: string): WebClient | undefined;
    list(): WebClient[];
    count(): number;
    clear(): void;
}
export declare const connectionRegistry: ConnectionRegistry;
export {};
