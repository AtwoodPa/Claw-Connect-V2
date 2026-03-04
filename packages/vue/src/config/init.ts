import type { ChatInitConfig, ChatOptions, ThemeConfig } from '../types/index.js';

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

export const defaultThemeConfig: ThemeConfig = {
  mode: 'system'
};

export const defaultChatInitConfig: ChatInitConfig = {
  gatewayUrl: 'http://127.0.0.1:3000',
  token: '',
  sessionId: '',
  userId: '',
  locale: 'auto',
  theme: defaultThemeConfig,
  options: defaultOptions
};

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
