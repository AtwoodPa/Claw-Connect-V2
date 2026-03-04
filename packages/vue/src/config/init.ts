import type { AgentOption, ChatInitConfig, ChatOptions, ThemeConfig } from '../types/index.js';

type ChatInitOverrides = Partial<Omit<ChatInitConfig, 'options'>> & {
  options?: Partial<Required<ChatOptions>>;
};

const defaultOptions: Required<ChatOptions> = {
  autoScroll: true,
  enableTypingIndicator: true,
  maxFileSize: 10 * 1024 * 1024,
  allowedFileTypes: ['image/*'],
  maxMessageLength: 4000,
  reconnectMax: 5,
  reconnectDelay: 3000
};

const defaultAgents: AgentOption[] = [
  {
    id: 'main',
    name: 'main'
  }
];

export const defaultThemeConfig: ThemeConfig = {
  mode: 'system'
};

export const defaultChatInitConfig: ChatInitConfig = {
  gatewayUrl: 'http://127.0.0.1:3000',
  token: '',
  sessionId: '',
  userId: '',
  defaultAgentId: 'main',
  agents: defaultAgents,
  locale: 'auto',
  theme: defaultThemeConfig,
  options: defaultOptions
};

function parseAgentsFromEnv(raw: unknown): AgentOption[] {
  if (typeof raw !== 'string') {
    return defaultAgents;
  }

  const list = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [idRaw, nameRaw] = item.split(':');
      const id = (idRaw ?? '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
      if (!id) {
        return null;
      }

      return {
        id,
        name: (nameRaw ?? '').trim() || id
      } satisfies AgentOption;
    })
    .filter((item): item is AgentOption => item !== null);

  if (list.length === 0) {
    return defaultAgents;
  }

  if (!list.some((item) => item.id === 'main')) {
    list.unshift({
      id: 'main',
      name: 'main'
    });
  }

  return list;
}

export function createChatInitConfig(partial: ChatInitOverrides = {}): ChatInitConfig {
  return {
    ...defaultChatInitConfig,
    ...partial,
    theme: {
      ...defaultThemeConfig,
      ...(partial.theme ?? {})
    },
    options: {
      ...defaultOptions,
      ...(partial.options ?? {})
    }
  };
}

export function createChatInitConfigFromEnv(env?: Record<string, unknown>): ChatInitConfig {
  const metaEnv =
    env ??
    (((import.meta as ImportMeta & { env?: Record<string, unknown> }).env as Record<string, unknown> | undefined) ?? {});

  return createChatInitConfig({
    gatewayUrl: String(metaEnv.VITE_OPENCLAW_GATEWAY_URL ?? defaultChatInitConfig.gatewayUrl),
    token: String(metaEnv.VITE_OPENCLAW_TOKEN ?? ''),
    defaultAgentId: String(metaEnv.VITE_OPENCLAW_DEFAULT_AGENT_ID ?? defaultChatInitConfig.defaultAgentId),
    agents: parseAgentsFromEnv(metaEnv.VITE_OPENCLAW_AGENTS),
    locale: String(metaEnv.VITE_OPENCLAW_LOCALE ?? 'auto'),
    theme: {
      mode: (metaEnv.VITE_OPENCLAW_THEME as ThemeConfig['mode']) ?? 'system'
    },
    options: {
      maxMessageLength: Number(metaEnv.VITE_OPENCLAW_MAX_MESSAGE_LENGTH ?? defaultOptions.maxMessageLength),
      reconnectDelay: Number(metaEnv.VITE_OPENCLAW_RECONNECT_DELAY ?? defaultOptions.reconnectDelay),
      reconnectMax: Number(metaEnv.VITE_OPENCLAW_RECONNECT_MAX ?? defaultOptions.reconnectMax),
      maxFileSize: Number(metaEnv.VITE_OPENCLAW_MAX_FILE_SIZE ?? defaultOptions.maxFileSize),
      autoScroll: String(metaEnv.VITE_OPENCLAW_AUTO_SCROLL ?? 'true') !== 'false',
      enableTypingIndicator: String(metaEnv.VITE_OPENCLAW_TYPING_INDICATOR ?? 'true') !== 'false',
      allowedFileTypes: defaultOptions.allowedFileTypes
    }
  });
}
