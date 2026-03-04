import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

interface GatewayCallOptions {
  expectFinal?: boolean;
  timeoutMs?: number;
}

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
  abortRun(params: { sessionKey: string; runId: string }): Promise<void>;
  loadHistory(request: GatewayHistoryRequest): Promise<GatewayHistoryResult>;
}

interface LoggerLike {
  warn(message: string, meta?: unknown): void;
  debug?(message: string, meta?: unknown): void;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseJsonPayload(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Gateway call returned empty output');
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace <= firstBrace) {
      throw new Error(`Failed to parse gateway response: ${trimmed.slice(0, 240)}`);
    }

    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    return JSON.parse(candidate);
  }
}

function extractAssistantText(payload: Record<string, unknown>): string {
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

function formatCommandFailure(method: string, result: CommandResult): string {
  const stderr = result.stderr.trim();
  const stdout = result.stdout.trim();
  const detail = stderr || stdout || 'unknown command error';

  if (result.timedOut) {
    return `Gateway call timed out (${method}): ${detail}`;
  }

  return `Gateway call failed (${method}): ${detail}`;
}

function extractTextContent(value: unknown): string {
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

function normalizeHistoryRole(value: unknown): 'user' | 'assistant' | 'system' {
  if (value === 'user' || value === 'assistant' || value === 'system') {
    return value;
  }

  return 'system';
}

function extractHistoryMessages(payload: Record<string, unknown>): GatewayHistoryMessage[] {
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
      const idRaw =
        (typeof item.id === 'string' && item.id) ||
        (typeof item.messageId === 'string' && item.messageId) ||
        `history-${index}-${randomUUID()}`;

      return {
        id: idRaw,
        role: normalizeHistoryRole(item.role),
        content,
        timestamp
      } satisfies GatewayHistoryMessage;
    })
    .filter((entry): entry is GatewayHistoryMessage => entry !== null);
}

export class OpenClawGatewayCliClient implements GatewayClient {
  constructor(private readonly logger: LoggerLike) {}

  async runAgent(request: GatewayRunRequest): Promise<GatewayRunResult> {
    const payload = await this.callGateway(
      'agent',
      {
        sessionKey: request.sessionKey,
        message: request.message,
        idempotencyKey: request.runId
      },
      {
        expectFinal: true,
        timeoutMs: request.timeoutMs ?? 120_000
      }
    );

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

  async abortRun(params: { sessionKey: string; runId: string }): Promise<void> {
    try {
      await this.callGateway(
        'chat.abort',
        {
          sessionKey: params.sessionKey,
          runId: params.runId
        },
        {
          timeoutMs: 15_000
        }
      );
    } catch (error) {
      this.logger.warn('Failed to abort gateway run', {
        sessionKey: params.sessionKey,
        runId: params.runId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async loadHistory(request: GatewayHistoryRequest): Promise<GatewayHistoryResult> {
    const payload = await this.callGateway(
      'chat.history',
      {
        sessionKey: request.sessionKey,
        limit: request.limit ?? 100
      },
      {
        timeoutMs: request.timeoutMs ?? 20_000
      }
    );

    if (!isObject(payload)) {
      throw new Error('Gateway history response is not an object');
    }

    return {
      sessionKey: request.sessionKey,
      messages: extractHistoryMessages(payload),
      raw: payload
    };
  }

  private async callGateway(method: string, params: Record<string, unknown>, options: GatewayCallOptions = {}): Promise<unknown> {
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

  private async runCommand(command: string, args: string[], timeoutMs: number): Promise<CommandResult> {
    return new Promise<CommandResult>((resolve, reject) => {
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
      child.stdout.on('data', (chunk: string) => {
        stdout += chunk;
      });

      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (chunk: string) => {
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
