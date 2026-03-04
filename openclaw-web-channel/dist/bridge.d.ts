export interface ChannelBridge {
    sendToSession(sessionId: string, payload: unknown): boolean;
    getConnectionCount(): number;
    isRunning(): boolean;
}
export declare function setChannelBridge(next: ChannelBridge | null): void;
export declare function getChannelBridge(): ChannelBridge | null;
