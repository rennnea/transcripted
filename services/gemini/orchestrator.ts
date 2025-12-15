import { TranscriptionOptions, RawTranscriptionData, AnalysisData } from "../../types";
import { uploadAudioFile, transcribeStep, analyzeStep, cacheStep } from "./api";

// Return type updated to include promises for background tasks
export const processAudioPipeline = async (
    file: File, 
    options: TranscriptionOptions
): Promise<{ 
    initialResult: RawTranscriptionData, 
    analysisPromise: Promise<AnalysisData>,
    cachePromise: Promise<{ name: string, ttl: number } | undefined>
}> => {
    
    // 1. Upload & Transcribe (Blocking)
    const { uri, mimeType } = await uploadAudioFile(file);
    const rawData = await transcribeStep(uri, mimeType, options);
    
    const fullText = rawData.transcription
        .map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`)
        .join('\n');

    // 2. Start Analysis & Caching (Non-Blocking Promises)
    const analysisPromise = analyzeStep(fullText, options);
    const cachePromise = cacheStep(fullText);

    return {
        initialResult: rawData,
        analysisPromise,
        cachePromise
    };
};
