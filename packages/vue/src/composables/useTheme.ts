import { computed, ref, watchEffect } from 'vue';
import type { ThemeMode } from '../types/index.js';

function resolveInitialTheme(initial?: ThemeMode): ThemeMode {
  if (initial) {
    return initial;
  }

  if (typeof localStorage === 'undefined') {
    return 'system';
  }

  const saved = localStorage.getItem('openclaw:theme') as ThemeMode | null;
  return saved ?? 'system';
}

function prefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme(initial?: ThemeMode) {
  const theme = ref<ThemeMode>(resolveInitialTheme(initial));

  const isDark = computed<boolean>(() => {
    if (theme.value === 'system') {
      return prefersDark();
    }
    return theme.value === 'dark';
  });

  function setTheme(next: ThemeMode): void {
    theme.value = next;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('openclaw:theme', next);
    }
  }

  function toggle(): void {
    setTheme(isDark.value ? 'light' : 'dark');
  }

  watchEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset.openclawTheme = isDark.value ? 'dark' : 'light';
  });

  return {
    theme,
    isDark,
    setTheme,
    toggle
  };
}
