
import { TranscriptionOptions, RawTranscriptionData, FastAnalysisData, SummaryData, SemanticIndex } from "../../types";
import { uploadAudioFile, transcribeStep, fastAnalysisStep, summaryStep, cacheStep, indexStep } from "./api";

export const processAudioPipeline = async (
    file: File, 
    options: TranscriptionOptions
): Promise<{ 
    initialResult: RawTranscriptionData, 
    fastAnalysisPromise: Promise<FastAnalysisData>,
    summaryPromise: Promise<SummaryData>,
    indexPromise: Promise<SemanticIndex>,
    cachePromise: Promise<{ name: string, ttl: number } | undefined>
}> => {
    
    // 1. Upload & Transcribe (Blocking)
    const { uri, mimeType } = await uploadAudioFile(file);
    const rawData = await transcribeStep(uri, mimeType, options);
    
    const fullText = rawData.transcription
        .map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`)
        .join('\n');

    // 2. Start Parallel Background Tasks (Non-Blocking Promises)
    const fastAnalysisPromise = fastAnalysisStep(fullText, options);
    const summaryPromise = summaryStep(fullText, options);
    const indexPromise = indexStep(fullText);
    const cachePromise = cacheStep(fullText);

    return {
        initialResult: rawData,
        fastAnalysisPromise,
        summaryPromise,
        indexPromise,
        cachePromise
    };
};