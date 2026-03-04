import type { Logger } from 'openclaw/plugin-sdk';

const fallbackLogger: Logger = {
  child(name: string) {
    return this;
  },
  debug(message: string, meta?: unknown) {
    console.debug(message, meta ?? '');
  },
  info(message: string, meta?: unknown) {
    console.info(message, meta ?? '');
  },
  warn(message: string, meta?: unknown) {
    console.warn(message, meta ?? '');
  },
  error(message: string, meta?: unknown) {
    console.error(message, meta ?? '');
  }
};

export function resolveLogger(logger?: Logger): Logger {
  if (!logger) {
    return fallbackLogger;
  }

  if (typeof logger.child !== 'function') {
    return fallbackLogger;
  }

  return logger;
}
