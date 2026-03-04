export declare function sanitizeText(input: string): string;
export declare function createAssistantMessage(content: string, threadId?: string): Record<string, unknown>;
export declare function createErrorPayload(code: string, message: string, details?: Record<string, unknown>): Record<string, unknown>;
