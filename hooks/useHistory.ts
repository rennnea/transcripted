import { useState, useEffect, useCallback } from 'react';
import { getAllTranscriptions, clearDatabase } from '../utils/db';
import { HistoryItem } from '../types';

export const useHistory = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
        const records = await getAllTranscriptions();
        const items: HistoryItem[] = records.map(rec => ({
            id: rec.id,
            cacheKey: rec.cacheKey,
            fileInfo: {
                name: rec.fileName,
                size: rec.fileSize,
                lastModified: rec.lastModified
            },
            result: rec.transcriptionData,
            geminiCacheName: rec.geminiCacheName,
            geminiCacheExpiry: rec.geminiCacheExpiry
        }));
        setHistoryItems(items);
    } catch (e) {
        console.error("Failed to load history:", e);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire transcription history? This action cannot be undone.')) {
      await clearDatabase();
      setHistoryItems([]);
    }
  };

  return { historyItems, isLoading, reloadHistory: loadHistory, clearHistory };
};
