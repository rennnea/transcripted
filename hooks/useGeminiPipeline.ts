
import { useState, useCallback } from 'react';
import { processAudioPipeline } from '../services/gemini/orchestrator';
import { generateCacheKey } from '../utils/cacheUtils';
import { simulateTranscriptionProgress } from '../utils/progressUtils';
import { getTranscription, saveTranscription } from '../utils/db';
import { TranscriptionResult, TranscriptionOptions } from '../types';
import { getAudioDuration } from '../utils/fileUtils';

interface ProgressState {
    stage: string;
    percentage: number;
}

export const useGeminiPipeline = () => {
    const [result, setResult] = useState<TranscriptionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<ProgressState>({ stage: '', percentage: 0 });
    const [activeCacheName, setActiveCacheName] = useState<string | undefined>(undefined);

    const reset = useCallback(() => {
        setResult(null);
        setIsLoading(false);
        setIsAnalyzing(false);
        setError(null);
        setActiveCacheName(undefined);
        setProgress({ stage: '', percentage: 0 });
    }, []);

    const loadExternalResult = useCallback((data: TranscriptionResult, cacheName?: string) => {
        setResult(data);
        setActiveCacheName(cacheName);
        setIsLoading(false);
        setIsAnalyzing(false);
        setError(null);
    }, []);

    const startPipeline = useCallback(async (file: File, options: TranscriptionOptions) => {
        reset();
        setIsLoading(true);
        
        const cacheKey = generateCacheKey(file, options);

        // 1. Check Cache
        try {
            const cachedRecord = await getTranscription(cacheKey);
            if (cachedRecord) {
                setProgress({ stage: 'Loading from cache...', percentage: 100 });
                setTimeout(() => {
                    setResult(cachedRecord.transcriptionData);
                    if (cachedRecord.geminiCacheExpiry && cachedRecord.geminiCacheExpiry > Date.now()) {
                        setActiveCacheName(cachedRecord.geminiCacheName);
                    }
                    setIsLoading(false);
                }, 500);
                return;
            }
        } catch (e) {
            console.warn("Cache read error:", e);
        }

        // 2. Start Processing
        let stopProgressSimulation: (() => void) | null = null;
        try {
            const duration = await getAudioDuration(file);
            stopProgressSimulation = simulateTranscriptionProgress(duration, setProgress);

            const { initialResult, analysisPromise, indexPromise, cachePromise } = await processAudioPipeline(file, options);

            if (stopProgressSimulation) stopProgressSimulation();
            setProgress({ stage: 'Rendering text...', percentage: 100 });

            // Show initial result immediately
            const partialResult: TranscriptionResult = {
                ...initialResult,
                summary: "",
                sentiment: { overall: "", trend: [] },
                entities: {},
                sources: []
            };
            setResult(partialResult);
            setIsLoading(false);
            setIsAnalyzing(true);

            // Wait for background tasks
            const [analysisData, semanticIndex, cacheData] = await Promise.all([
                analysisPromise, 
                indexPromise, 
                cachePromise
            ]);

            const finalResult: TranscriptionResult = {
                ...initialResult,
                ...analysisData,
                semanticIndex // Include the searchable index
            };

            setResult(finalResult);
            if (cacheData) setActiveCacheName(cacheData.name);
            setIsAnalyzing(false);

            if (options.autoSave) {
                 await saveTranscription(file, cacheKey, finalResult, cacheData?.name, cacheData?.ttl);
            }

        } catch (err) {
            if (stopProgressSimulation) stopProgressSimulation();
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setIsLoading(false);
            setIsAnalyzing(false);
        }
    }, [reset]);

    return {
        result,
        setResult,
        isLoading,
        isAnalyzing,
        error,
        progress,
        activeCacheName,
        startPipeline,
        reset,
        loadExternalResult
    };
};
