export interface ChannelBridge {
  sendToSession(sessionId: string, payload: unknown): boolean;
  getConnectionCount(): number;
  isRunning(): boolean;
}

let bridge: ChannelBridge | null = null;

export function setChannelBridge(next: ChannelBridge | null): void {
  bridge = next;
}

export function getChannelBridge(): ChannelBridge | null {
  return bridge;
}
