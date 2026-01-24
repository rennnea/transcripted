
import { Type } from "@google/genai";
import { ai } from "./client";
import { 
    transcriptionSchema, 
    fastAnalysisSchema,
    summarySchema,
    getTranscriptionPrompt, 
    getFastAnalysisPrompt,
    getSummaryPrompt,
    getCacheSystemInstruction
} from "./prompts";
import { TranscriptionOptions, RawTranscriptionData, FastAnalysisData, SummaryData, SemanticIndex } from "../../types";

// Helper to clean markdown from JSON
export const cleanJsonResponse = (text: string): string => {
    return text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
};

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

export const fastAnalysisStep = async (transcriptionText: string, options: TranscriptionOptions): Promise<FastAnalysisData> => {
    console.log("Step C.1: Performing fast analysis (Sentiment, Entities)...");

    if (!options.enableSentimentAnalysis && !options.enableEntityExtraction) {
        return { sentiment: { overall: "Disabled", trend: [] }, entities: {} };
    }

    const prompt = getFastAnalysisPrompt(transcriptionText, options);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: fastAnalysisSchema,
            }
        });
        
        return JSON.parse(cleanJsonResponse(response.text || "{}")) as FastAnalysisData;

    } catch (error) {
        console.warn("Fast analysis step encountered an issue:", error);
        return {
            sentiment: { overall: "Unknown", trend: [] },
            entities: {},
        };
    }
};

export const summaryStep = async (transcriptionText: string, options: TranscriptionOptions): Promise<SummaryData> => {
    console.log("Step C.2: Performing summary generation...");

    if (!options.enableSummary) {
        return { summary: "Disabled by user.", sources: [] };
    }

    const prompt = getSummaryPrompt(transcriptionText, options);
    const config: any = {};

    if (options.enableSummary && options.enableSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
    } else {
        config.responseMimeType = "application/json";
        config.responseSchema = summarySchema;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: [{ parts: [{ text: prompt }] }],
            config: config
        });

        const result = JSON.parse(cleanJsonResponse(response.text || "{}"));
        
        if (options.enableSummary && options.enableSearchGrounding && response.candidates?.[0]?.groundingMetadata) {
            result.sources = response.candidates[0].groundingMetadata.groundingChunks;
        } else {
            result.sources = [];
        }

        return result as SummaryData;

    } catch (error) {
        console.warn("Summary step encountered an issue:", error);
        return {
            summary: "Summary generation failed.",
            sources: []
        };
    }
};

// Generate a searchable semantic index for the knowledge library
export const indexStep = async (transcriptionText: string): Promise<SemanticIndex> => {
    console.log("Generating Semantic Search Index...");
    const prompt = `Analyze this transcription and provide a JSON object for a search index. 
    Include: 
    1. 'themes' (array of strings, e.g., ["budget", "marketing strategy"])
    2. 'keywords' (array of specific terms)
    3. 'searchSummary' (3-sentence technical summary for quick retrieval)
    
    TRANSCRIPT:
    ${transcriptionText.substring(0, 30000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        themes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        searchSummary: { type: Type.STRING }
                    },
                    required: ["themes", "keywords", "searchSummary"]
                }
            }
        });

        return JSON.parse(cleanJsonResponse(response.text || "{}")) as SemanticIndex;
    } catch (e) {
        console.warn("Indexing failed:", e);
        return { themes: [], keywords: [], searchSummary: "No index available." };
    }
};

export const cacheStep = async (transcriptionText: string): Promise<{ name: string, ttl: number } | undefined> => {
    if (transcriptionText.length < 500) return undefined;

    console.log("Step D: Creating context cache...");
    try {
        const ttlSeconds = 1200;
        const instruction = getCacheSystemInstruction();
        
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
        
        return { name: cacheResult.name, ttl: ttlSeconds };
    } catch (error) {
        console.warn("Context caching failed:", error);
        return undefined;
    }
};