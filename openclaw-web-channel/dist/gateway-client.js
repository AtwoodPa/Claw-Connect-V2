import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
function parseJsonPayload(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        throw new Error('Gateway call returned empty output');
    }
    try {
        return JSON.parse(trimmed);
    }
    catch {
        const firstBrace = trimmed.indexOf('{');
        const lastBrace = trimmed.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace <= firstBrace) {
            throw new Error(`Failed to parse gateway response: ${trimmed.slice(0, 240)}`);
        }
        const candidate = trimmed.slice(firstBrace, lastBrace + 1);
        return JSON.parse(candidate);
    }
}
function extractAssistantText(payload) {
    const result = payload.result;
    if (!isObject(result)) {
        return '';
    }
    const rawPayloads = result.payloads;
    if (!Array.isArray(rawPayloads)) {
        return '';
    }
    const texts = rawPayloads
        .map((item) => {
        if (!isObject(item)) {
            return '';
        }
        return typeof item.text === 'string' ? item.text.trim() : '';
    })
        .filter((text) => text.length > 0);
    return texts.join('\n\n').trim();
}
function formatCommandFailure(method, result) {
    const stderr = result.stderr.trim();
    const stdout = result.stdout.trim();
    const detail = stderr || stdout || 'unknown command error';
    if (result.timedOut) {
        return `Gateway call timed out (${method}): ${detail}`;
    }
    return `Gateway call failed (${method}): ${detail}`;
}
function extractTextContent(value) {
    if (typeof value === 'string') {
        return value.trim();
    }
    if (Array.isArray(value)) {
        const chunks = value
            .map((item) => {
            if (!isObject(item)) {
                return '';
            }
            if (item.type === 'thinking') {
                return '';
            }
            if (typeof item.text === 'string') {
                return item.text.trim();
            }
            if (typeof item.content === 'string') {
                return item.content.trim();
            }
            return '';
        })
            .filter((text) => text.length > 0);
        return chunks.join('\n').trim();
    }
    if (isObject(value) && typeof value.text === 'string') {
        return value.text.trim();
    }
    return '';
}
function normalizeHistoryRole(value) {
    if (value === 'user' || value === 'assistant' || value === 'system') {
        return value;
    }
    return 'system';
}
function extractHistoryMessages(payload) {
    const rawMessages = payload.messages;
    if (!Array.isArray(rawMessages)) {
        return [];
    }
    const now = Date.now();
    return rawMessages
        .map((item, index) => {
        if (!isObject(item)) {
            return null;
        }
        const content = extractTextContent(item.content);
        if (!content) {
            return null;
        }
        const timestamp = typeof item.timestamp === 'number' && Number.isFinite(item.timestamp) ? item.timestamp : now;
        const idRaw = (typeof item.id === 'string' && item.id) ||
            (typeof item.messageId === 'string' && item.messageId) ||
            `history-${index}-${randomUUID()}`;
        return {
            id: idRaw,
            role: normalizeHistoryRole(item.role),
            content,
            timestamp
        };
    })
        .filter((entry) => entry !== null);
}
export class OpenClawGatewayCliClient {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async runAgent(request) {
        const payload = await this.callGateway('agent', {
            sessionKey: request.sessionKey,
            message: request.message,
            idempotencyKey: request.runId
        }, {
            expectFinal: true,
            timeoutMs: request.timeoutMs ?? 120_000
        });
        if (!isObject(payload)) {
            throw new Error('Gateway agent response is not an object');
        }
        const status = typeof payload.status === 'string' ? payload.status : 'unknown';
        if (status !== 'ok') {
            const summary = typeof payload.summary === 'string' ? payload.summary : `Unexpected gateway status: ${status}`;
            throw new Error(summary);
        }
        return {
            runId: request.runId,
            text: extractAssistantText(payload),
            raw: payload
        };
    }
    async abortRun(params) {
        try {
            await this.callGateway('chat.abort', {
                sessionKey: params.sessionKey,
                runId: params.runId
            }, {
                timeoutMs: 15_000
            });
        }
        catch (error) {
            this.logger.warn('Failed to abort gateway run', {
                sessionKey: params.sessionKey,
                runId: params.runId,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    async loadHistory(request) {
        const payload = await this.callGateway('chat.history', {
            sessionKey: request.sessionKey,
            limit: request.limit ?? 100
        }, {
            timeoutMs: request.timeoutMs ?? 20_000
        });
        if (!isObject(payload)) {
            throw new Error('Gateway history response is not an object');
        }
        return {
            sessionKey: request.sessionKey,
            messages: extractHistoryMessages(payload),
            raw: payload
        };
    }
    async callGateway(method, params, options = {}) {
        const timeoutMs = options.timeoutMs ?? 30_000;
        const args = ['gateway', 'call', method, '--json', '--params', JSON.stringify(params), '--timeout', String(timeoutMs)];
        if (options.expectFinal) {
            args.push('--expect-final');
        }
        this.logger.debug?.('Running gateway call', { method, timeoutMs });
        const result = await this.runCommand('openclaw', args, timeoutMs + 5_000);
        if (result.exitCode !== 0) {
            throw new Error(formatCommandFailure(method, result));
        }
        const combined = `${result.stdout}\n${result.stderr}`;
        return parseJsonPayload(combined);
    }
    async runCommand(command, args, timeoutMs) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                stdio: ['ignore', 'pipe', 'pipe']
            });
            let stdout = '';
            let stderr = '';
            let timedOut = false;
            const timeout = setTimeout(() => {
                timedOut = true;
                child.kill('SIGTERM');
                setTimeout(() => {
                    child.kill('SIGKILL');
                }, 1_000).unref();
            }, timeoutMs);
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', (chunk) => {
                stdout += chunk;
            });
            child.stderr.setEncoding('utf8');
            child.stderr.on('data', (chunk) => {
                stderr += chunk;
            });
            child.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
            child.on('close', (code) => {
                clearTimeout(timeout);
                resolve({
                    exitCode: typeof code === 'number' ? code : -1,
                    stdout,
                    stderr,
                    timedOut
                });
            });
        });
    }
}
//# sourceMappingURL=gateway-client.js.map