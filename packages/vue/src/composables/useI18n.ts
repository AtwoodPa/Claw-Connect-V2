import { computed } from 'vue';
import { createI18n } from 'vue-i18n';
import { localeMessages } from '../locales/index.js';

function detectLocale(): 'en' | 'zh-CN' {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

const storedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem('openclaw:locale') : null;
const initialLocale = (storedLocale as 'en' | 'zh-CN' | null) ?? detectLocale();

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: localeMessages
});

export function useI18n() {
  const locale = computed<string>({
    get: () => i18n.global.locale.value,
    set: (value) => {
      i18n.global.locale.value = value as never;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('openclaw:locale', value);
      }
    }
  });

  function setLocale(value: string): void {
    locale.value = value;
  }

  function t(key: string, params?: Record<string, unknown>): string {
    if (params) {
      return i18n.global.t(key, params) as string;
    }
    return i18n.global.t(key) as string;
  }

  return {
    t,
    locale,
    setLocale
  };
}
