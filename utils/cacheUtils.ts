// FIX: Imported TranscriptionOptions from 'types.ts' where it is defined, instead of from 'geminiService.ts'.
import { TranscriptionOptions } from '../types';

export const generateCacheKey = (
    file: File,
    settings: TranscriptionOptions
): string => {
    const settingsCacheKey = JSON.stringify(settings);
    return `transcription_${file.name}_${file.size}_${file.lastModified}_${settingsCacheKey}`;
};