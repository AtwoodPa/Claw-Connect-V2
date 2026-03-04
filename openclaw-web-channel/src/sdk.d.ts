declare module 'openclaw/plugin-sdk' {
  export interface Logger {
    child(name: string): Logger;
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
  }

  export interface PluginContext {
    call?(method: string, params: unknown): Promise<unknown>;
  }

  export interface ChannelOutboundResult {
    ok: boolean;
    error?: string;
    retryable?: boolean;
  }

  export interface ChannelPlugin {
    id: string;
    meta: Record<string, unknown>;
    capabilities: Record<string, unknown>;
    config: {
      listAccountIds(cfg: unknown): string[];
      resolveAccount(cfg: unknown, accountId?: string): Record<string, unknown>;
    };
    outbound: {
      deliveryMode: 'direct' | 'queue';
      sendText(params: {
        text: string;
        channel: string;
        account: Record<string, unknown>;
        context?: Record<string, unknown>;
      }): Promise<ChannelOutboundResult>;
      sendFile?(params: {
        file: { name: string; url: string; mimeType?: string; size?: number };
        channel: string;
      }): Promise<ChannelOutboundResult>;
    };
    status?: {
      probe(account: unknown): Promise<{
        ok: boolean;
        status: 'connected' | 'disconnected';
        details?: Record<string, unknown>;
      }>;
    };
  }

  export interface OpenClawPluginApi {
    id: string;
    logger: Logger;
    pluginConfig: Record<string, unknown>;
    registerChannel(registration: { plugin: ChannelPlugin }): void;
    registerService(service: {
      id: string;
      start(ctx: PluginContext): Promise<void>;
      stop(): Promise<void>;
    }): void;
    registerHttpRoute?(route: {
      method: string;
      path: string;
      handler: (req: { body: unknown }, res: { json: (body: unknown) => void }) => Promise<void> | void;
    }): void;
    registerCli?(registrar: (ctx: { program: { command: (name: string) => { description: (desc: string) => { action: (handler: () => void) => void } } } }) => void): void;
  }
}
