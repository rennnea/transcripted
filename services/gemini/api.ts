/**
 * @file api.ts
 * @description Core API operations for Google Gemini interactions.
 * 
 * This module provides granular functions for each step of the audio processing pipeline:
 * - File upload to Google's servers
 * - Transcription with speaker diarization
 * - Advanced analysis (sentiment, entities, summary)
 * - Context cache creation for chatbot interactions
 * 
 * Each function is independent and can be used individually or composed together
 * through the orchestrator for complete pipeline processing.
 * 
 * @module services/gemini/api
 */

import { ai } from "./client";
import { 
    transcriptionSchema, 
    analysisSchema, 
    getTranscriptionPrompt, 
    getAnalysisPrompt,
    getCacheSystemInstruction
} from "./prompts";
import { TranscriptionOptions, RawTranscriptionData, AnalysisData } from "../../types";

/**
 * Cleans JSON response text by removing markdown code fences.
 * 
 * Some Gemini API responses may wrap JSON in markdown code blocks.
 * This helper removes the ```json and ``` markers to extract clean JSON.
 * 
 * @param text - Raw response text from the API
 * @returns Cleaned JSON string
 * 
 * @example
 * ```typescript
 * const raw = '```json\n{"key": "value"}\n```';
 * const clean = cleanJsonResponse(raw); // '{"key": "value"}'
 * ```
 */
export const cleanJsonResponse = (text: string): string => {
    return text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
};

/**
 * Uploads an audio file to Google's File API for processing.
 * 
 * This is the first step in the transcription pipeline. The file is uploaded
 * to Google's servers and a URI reference is returned for use in subsequent
 * API calls. The file remains accessible for a limited time (typically 48 hours).
 * 
 * **Supported Formats:**
 * - MP3, WAV, M4A, FLAC, AAC, OGG, and other common audio formats
 * - Maximum file size varies by plan (check Google AI Studio for limits)
 * 
 * @param file - The audio file to upload
 * @returns Object containing the file URI and MIME type
 * @throws {Error} If the upload fails due to network or API issues
 * 
 * @example
 * ```typescript
 * const audioFile = new File([...], 'recording.mp3', { type: 'audio/mp3' });
 * const { uri, mimeType } = await uploadAudioFile(audioFile);
 * console.log(`Uploaded: ${uri}`); // "https://generativelanguage.googleapis.com/v1beta/files/..."
 * ```
 */
export const uploadAudioFile = async (file: File): Promise<{ uri: string, mimeType: string }> => {
    console.log("Step A: Uploading file via File API...");
    try {
        const uploadResult = await ai.files.upload({
            file: file,
            config: { 
                mimeType: file.type,
                displayName: file.name,
            }
        });
        console.log(`File uploaded successfully: ${uploadResult.uri}`);
        return { uri: uploadResult.uri, mimeType: uploadResult.mimeType };
    } catch (error) {
        console.error("Upload failed:", error);
        throw new Error("Failed to upload file to AI service. Please check your network.");
    }
};

/**
 * Transcribes audio into structured text with timestamps and speaker labels.
 * 
 * This uses the **gemini-2.5-flash** model optimized for fast, accurate transcription.
 * The response is a structured JSON array with precise timestamps and speaker diarization
 * (if enabled in options).
 * 
 * **Features:**
 * - Accurate speech-to-text conversion
 * - Speaker diarization (identifies different speakers)
 * - Timestamp generation in HH:MM:SS format
 * - Multi-language support
 * 
 * @param fileUri - The URI of the uploaded file (from uploadAudioFile)
 * @param mimeType - The MIME type of the audio file
 * @param options - Transcription configuration options
 * @returns Raw transcription data with timestamps and speaker labels
 * @throws {Error} If transcription fails or the model cannot process the file
 * 
 * @example
 * ```typescript
 * const rawData = await transcribeStep(uri, 'audio/mp3', {
 *   language: 'en',
 *   enableDiarization: true
 * });
 * 
 * // Result:
 * // {
 * //   transcription: [
 * //     { timestamp: "00:00:00", speaker: "Speaker 1", text: "Hello!" },
 * //     { timestamp: "00:00:03", speaker: "Speaker 2", text: "Hi there!" }
 * //   ]
 * // }
 * ```
 */
export const transcribeStep = async (fileUri: string, mimeType: string, options: TranscriptionOptions): Promise<RawTranscriptionData> => {
    console.log("Step B: Performing strict transcription...");
    
    const prompt = getTranscriptionPrompt(options);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [
                { fileData: { fileUri, mimeType } }, 
                { text: prompt }
            ]}],
            config: {
                responseMimeType: "application/json",
                responseSchema: transcriptionSchema,
            }
        });

        const jsonText = cleanJsonResponse(response.text || "{}");
        return JSON.parse(jsonText) as RawTranscriptionData;
    } catch (error) {
        console.error("Transcription step failed:", error);
        throw new Error("Failed to transcribe audio. The model could not process the file.");
    }
};

/**
 * Analyzes transcription text to extract insights.
 * 
 * This uses the **gemini-3-pro-preview** model optimized for advanced analysis tasks.
 * It can extract summaries, sentiment, entities, and optionally ground facts using
 * Google Search integration.
 * 
 * **Analysis Features:**
 * - **Summary**: Concise overview with customizable length and format
 * - **Sentiment**: Overall tone and trend analysis over time
 * - **Entities**: Extraction of people, organizations, locations
 * - **Grounding**: Fact verification via Google Search (optional)
 * 
 * **Important:** When `enableSearchGrounding` is true, the response format changes
 * to accommodate grounding metadata, so we manually parse and structure the result.
 * 
 * @param transcriptionText - The formatted transcription text to analyze
 * @param options - Analysis configuration options
 * @returns Analysis data including summary, sentiment, entities, and sources
 * 
 * @example
 * ```typescript
 * const analysisData = await analyzeStep(fullText, {
 *   enableSummary: true,
 *   summaryLength: 'medium',
 *   summaryDetail: 'detailed',
 *   enableSentimentAnalysis: true,
 *   enableEntityExtraction: true,
 *   enableSearchGrounding: false
 * });
 * 
 * // Result:
 * // {
 * //   summary: "The conversation discusses...",
 * //   sentiment: { overall: "Positive", trend: [...] },
 * //   entities: { People: [...], Organizations: [...] },
 * //   sources: []
 * // }
 * ```
 */
export const analyzeStep = async (transcriptionText: string, options: TranscriptionOptions): Promise<AnalysisData> => {
    console.log("Step C: Performing analysis...");
    
    // Return empty results for very short transcriptions
    if (!transcriptionText || transcriptionText.length < 10) {
        return {
            summary: "",
            sentiment: { overall: "Unknown", trend: [] },
            entities: {},
            sources: []
        };
    }

    const prompt = getAnalysisPrompt(transcriptionText, options);
    const config: any = {};

    // Configure grounding if enabled
    // Note: Google Search grounding changes the response format
    if (options.enableSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
        // Note: responseMimeType/responseSchema are NOT allowed with googleSearch
    } else {
        config.responseMimeType = "application/json";
        config.responseSchema = analysisSchema;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: [{ parts: [{ text: prompt }] }],
            config: config
        });

        const result = JSON.parse(cleanJsonResponse(response.text || "{}"));
        
        // Extract grounding sources if search was enabled
        if (options.enableSearchGrounding && response.candidates?.[0]?.groundingMetadata) {
            result.sources = response.candidates[0].groundingMetadata.groundingChunks;
        }

        return result as AnalysisData;

    } catch (error) {
        console.warn("Analysis step encountered an issue:", error);
        // Return graceful fallback instead of failing
        return {
            summary: "Analysis failed to generate.",
            sentiment: { overall: "Unknown", trend: [] },
            entities: {},
            sources: []
        };
    }
};

/**
 * Creates a context cache for efficient future interactions.
 * 
 * Context caching stores the transcription text on Google's servers for a limited
 * time (TTL), enabling fast and cost-effective chatbot interactions. Subsequent
 * queries can reference the cached context without re-sending the full transcript.
 * 
 * **Benefits:**
 * - Reduced API costs (cached tokens are cheaper)
 * - Faster response times
 * - Enables chatbot features without re-uploading context
 * 
 * **Limitations:**
 * - Only created for transcriptions longer than 500 characters
 * - Cache expires after the TTL period (default: 1200 seconds / 20 minutes)
 * - Failures are non-blocking (returns undefined if caching fails)
 * 
 * @param transcriptionText - The transcription text to cache
 * @returns Cache metadata (name and TTL) or undefined if caching is skipped/failed
 * 
 * @example
 * ```typescript
 * const cacheData = await cacheStep(fullText);
 * 
 * if (cacheData) {
 *   console.log(`Cache created: ${cacheData.name}`);
 *   console.log(`Expires in: ${cacheData.ttl} seconds`);
 *   
 *   // Later, use in chat:
 *   const chatResponse = await ai.models.generateContent({
 *     model: 'gemini-2.5-flash',
 *     cachedContent: cacheData.name,
 *     contents: [{ parts: [{ text: 'What did Speaker 1 say?' }] }]
 *   });
 * }
 * ```
 */
export const cacheStep = async (transcriptionText: string): Promise<{ name: string, ttl: number } | undefined> => {
    // Skip caching for short transcriptions (not worth the overhead)
    if (transcriptionText.length < 500) return undefined;

    console.log("Step D: Creating context cache...");
    try {
        const ttlSeconds = 1200; // 20 minutes
        const instruction = getCacheSystemInstruction();
        
        // Cast to any to bypass strict SDK types if necessary for cache creation
        const cacheResult = await ai.caches.create({
            model: 'gemini-2.5-flash',
            contents: [{
                role: 'user',
                parts: [{ text: transcriptionText }]
            }],
            systemInstruction: {
                parts: [{ text: instruction }]
            },
            ttl: `${ttlSeconds}s`
        } as any);
        
        console.log(`Cache created: ${cacheResult.name}`);
        return { name: cacheResult.name, ttl: ttlSeconds };
    } catch (error) {
        console.warn("Context caching failed:", error);
        // Caching is optional - return undefined instead of throwing
        return undefined;
    }
};
