
import { HistoryItem, TranscriptionResult } from '../types';

interface CacheData {
  fileInfo: {
    name: string;
    size: number;
    lastModified: number;
  };
  result: TranscriptionResult;
}

const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test_local_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

export const cacheService = {
  getItem: (key: string): CacheData | null => {
    if (!isLocalStorageAvailable()) return null;
    
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item);
    } catch (e) {
      // If parsing fails (e.g., corrupted data), silently return null.
      // The application logic handles a null return gracefully.
      return null;
    }
  },

  setItem: (key: string, value: CacheData): void => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available. Caching is disabled.');
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn(`Cache quota exceeded. The result could not be saved. Consider clearing old cache items.`);
      } else {
        console.error('Failed to save to cache:', e);
      }
    }
  },

  getAllItems: (): HistoryItem[] => {
    if (!isLocalStorageAvailable()) return [];

    const items: HistoryItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('transcription_')) {
        const data = cacheService.getItem(key);
        if (data) {
          items.push({ key, ...data });
        }
      }
    }
    return items;
  },

  clearAll: (): void => {
    if (!isLocalStorageAvailable()) return;
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('transcription_')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} items from history.`);
  },
};