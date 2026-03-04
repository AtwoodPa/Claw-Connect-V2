import { defineStore } from 'pinia';
import type { ThemeMode } from '../types/index.js';

interface SettingsState {
  theme: ThemeMode;
  locale: string;
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: 'system',
    locale: 'auto'
  }),
  actions: {
    setTheme(mode: ThemeMode): void {
      this.theme = mode;
    },
    setLocale(locale: string): void {
      this.locale = locale;
    }
  }
});
