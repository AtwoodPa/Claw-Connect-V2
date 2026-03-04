export interface GatewayRunRequest {
    sessionKey: string;
    message: string;
    runId: string;
    timeoutMs?: number;
}
export interface GatewayRunResult {
    runId: string;
    text: string;
    raw: Record<string, unknown>;
}
export interface GatewayHistoryRequest {
    sessionKey: string;
    limit?: number;
    timeoutMs?: number;
}
export interface GatewayHistoryMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}
export interface GatewayHistoryResult {
    sessionKey: string;
    messages: GatewayHistoryMessage[];
    raw: Record<string, unknown>;
}
export interface GatewayClient {
    runAgent(request: GatewayRunRequest): Promise<GatewayRunResult>;
    abortRun(params: {
        sessionKey: string;
        runId: string;
    }): Promise<void>;
    loadHistory(request: GatewayHistoryRequest): Promise<GatewayHistoryResult>;
}
interface LoggerLike {
    warn(message: string, meta?: unknown): void;
    debug?(message: string, meta?: unknown): void;
}
export declare class OpenClawGatewayCliClient implements GatewayClient {
    private readonly logger;
    constructor(logger: LoggerLike);
    runAgent(request: GatewayRunRequest): Promise<GatewayRunResult>;
    abortRun(params: {
        sessionKey: string;
        runId: string;
    }): Promise<void>;
    loadHistory(request: GatewayHistoryRequest): Promise<GatewayHistoryResult>;
    private callGateway;
    private runCommand;
}
export {};
