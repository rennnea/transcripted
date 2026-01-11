
import { TranscriptionOptions, RawTranscriptionData, AnalysisData, SemanticIndex } from "../../types";
import { uploadAudioFile, transcribeStep, analyzeStep, cacheStep, indexStep } from "./api";

export const processAudioPipeline = async (
    file: File, 
    options: TranscriptionOptions
): Promise<{ 
    initialResult: RawTranscriptionData, 
    analysisPromise: Promise<AnalysisData>,
    indexPromise: Promise<SemanticIndex>,
    cachePromise: Promise<{ name: string, ttl: number } | undefined>
}> => {
    
    // 1. Upload & Transcribe (Blocking)
    const { uri, mimeType } = await uploadAudioFile(file);
    const rawData = await transcribeStep(uri, mimeType, options);
    
    const fullText = rawData.transcription
        .map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`)
        .join('\n');

    // 2. Start Background Tasks (Non-Blocking Promises)
    const analysisPromise = analyzeStep(fullText, options);
    const indexPromise = indexStep(fullText);
    const cachePromise = cacheStep(fullText);

    return {
        initialResult: rawData,
        analysisPromise,
        indexPromise,
        cachePromise
    };
};
