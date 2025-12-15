/**
 * @file orchestrator.ts
 * @description Pipeline orchestration for audio processing with progressive loading.
 * 
 * This module coordinates the multi-stage processing pipeline that transforms
 * audio files into structured, analyzed transcriptions. It implements a progressive
 * loading pattern where initial results are returned immediately while expensive
 * operations continue in the background.
 */

import { TranscriptionOptions, RawTranscriptionData, AnalysisData } from "../../types";
import { uploadAudioFile, transcribeStep, analyzeStep, cacheStep } from "./api";

/**
 * Processes an audio file through the complete transcription and analysis pipeline.
 * 
 * This function implements a **Progressive Two-Stage Pipeline** pattern:
 * 
 * **Stage 1 (Blocking)**: Upload + Transcription
 * - Uploads the audio file to Google's servers
 * - Performs strict transcription with speaker diarization
 * - Returns immediately with raw transcription data
 * - UI can display text while analysis continues
 * 
 * **Stage 2 (Non-Blocking)**: Analysis + Caching
 * - Analyzes text for sentiment, entities, and summary
 * - Creates a context cache for future chat interactions
 * - Returns as promises that resolve in the background
 * - UI updates progressively as results arrive
 * 
 * @param file - The audio file to process (MP3, WAV, M4A, etc.)
 * @param options - Transcription configuration options
 * @returns Object containing:
 *   - `initialResult`: Raw transcription data (available immediately)
 *   - `analysisPromise`: Promise resolving to analysis data (background)
 *   - `cachePromise`: Promise resolving to cache metadata (background)
 * 
 * @example
 * ```typescript
 * const { initialResult, analysisPromise, cachePromise } = 
 *   await processAudioPipeline(audioFile, {
 *     language: 'en',
 *     enableDiarization: true,
 *     enableSummary: true,
 *     enableSentimentAnalysis: true,
 *     enableSearchGrounding: false
 *   });
 * 
 * // Show initial transcription to user immediately
 * displayTranscription(initialResult);
 * 
 * // Wait for background tasks
 * const [analysisData, cacheData] = await Promise.all([
 *   analysisPromise, 
 *   cachePromise
 * ]);
 * 
 * // Update UI with full results
 * displayAnalysis(analysisData);
 * ```
 * 
 * @throws {Error} If file upload or transcription fails
 * @see {@link uploadAudioFile} for upload details
 * @see {@link transcribeStep} for transcription details
 * @see {@link analyzeStep} for analysis details
 * @see {@link cacheStep} for caching details
 */
export const processAudioPipeline = async (
    file: File, 
    options: TranscriptionOptions
): Promise<{ 
    initialResult: RawTranscriptionData, 
    analysisPromise: Promise<AnalysisData>,
    cachePromise: Promise<{ name: string, ttl: number } | undefined>
}> => {
    
    // 1. Upload & Transcribe (Blocking)
    // These operations complete before returning to allow the UI to show results immediately
    const { uri, mimeType } = await uploadAudioFile(file);
    const rawData = await transcribeStep(uri, mimeType, options);
    
    // Convert transcription array to formatted text for analysis
    const fullText = rawData.transcription
        .map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`)
        .join('\n');

    // 2. Start Analysis & Caching (Non-Blocking Promises)
    // These promises start executing but we don't await them, allowing the caller
    // to return results to the user immediately while these continue in the background
    const analysisPromise = analyzeStep(fullText, options);
    const cachePromise = cacheStep(fullText);

    return {
        initialResult: rawData,
        analysisPromise,
        cachePromise
    };
};
