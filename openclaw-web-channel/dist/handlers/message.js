import { z } from 'zod';
const authSchema = z.object({
    type: z.literal('auth'),
    payload: z.object({
        token: z.string().min(1),
        deviceInfo: z.record(z.unknown()).optional()
    })
});
const chatSchema = z.object({
    type: z.literal('chat'),
    payload: z.object({
        content: z.string().min(1),
        sessionId: z.string().min(1),
        messageId: z.string().min(1),
        agentId: z.string().min(1).optional(),
        threadId: z.string().optional(),
        attachments: z.array(z.string().url()).optional()
    })
});
const stopSchema = z.object({
    type: z.literal('stop'),
    payload: z.object({
        messageId: z.string().min(1)
    })
});
const pingSchema = z.object({
    type: z.literal('ping'),
    payload: z.record(z.never()).optional()
});
const inboundSchema = z.union([authSchema, chatSchema, stopSchema, pingSchema]);
export function parseIncomingMessage(raw) {
    const parsed = JSON.parse(raw);
    return inboundSchema.parse(parsed);
}
//# sourceMappingURL=message.js.map