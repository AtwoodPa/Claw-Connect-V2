import { randomUUID } from 'node:crypto';

export function sanitizeText(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

export function createAssistantMessage(content: string, threadId?: string): Record<string, unknown> {
  return {
    type: 'message',
    id: randomUUID(),
    role: 'assistant',
    content: sanitizeText(content),
    timestamp: Date.now(),
    ...(threadId ? { threadId } : {})
  };
}

export function createErrorPayload(code: string, message: string, details?: Record<string, unknown>): Record<string, unknown> {
  return {
    type: 'error',
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
}
