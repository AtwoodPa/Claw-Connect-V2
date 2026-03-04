import { createPinia, getActivePinia, setActivePinia, type Pinia } from 'pinia';

let fallbackPinia: Pinia | null = null;

export function ensurePinia(): Pinia {
  const current = getActivePinia();
  if (current) {
    return current;
  }

  if (!fallbackPinia) {
    fallbackPinia = createPinia();
  }

  setActivePinia(fallbackPinia);
  return fallbackPinia;
}
