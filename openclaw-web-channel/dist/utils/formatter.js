import { randomUUID } from 'node:crypto';
export function sanitizeText(input) {
    return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}
export function createAssistantMessage(content, threadId) {
    return {
        type: 'message',
        id: randomUUID(),
        role: 'assistant',
        content: sanitizeText(content),
        timestamp: Date.now(),
        ...(threadId ? { threadId } : {})
    };
}
export function createErrorPayload(code, message, details) {
    return {
        type: 'error',
        error: {
            code,
            message,
            ...(details ? { details } : {})
        }
    };
}
//# sourceMappingURL=formatter.js.map