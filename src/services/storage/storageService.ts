/**
 * Safe local storage service with quota protection and fallback
 */

export const storageService = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`[storageService] Failed to read key: ${key}`, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[storageService] Failed to save key: ${key}`, e);
      return false;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[storageService] Failed to remove key: ${key}`, e);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('[storageService] Failed to clear storage', e);
    }
  },
};
