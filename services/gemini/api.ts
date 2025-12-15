import { ai } from "./client";
import { 
    transcriptionSchema, 
    analysisSchema, 
    getTranscriptionPrompt, 
    getAnalysisPrompt,
    getCacheSystemInstruction
} from "./prompts";
import { TranscriptionOptions, RawTranscriptionData, AnalysisData } from "../../types";

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

export const analyzeStep = async (transcriptionText: string, options: TranscriptionOptions): Promise<AnalysisData> => {
    console.log("Step C: Performing analysis...");
    
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
        
        if (options.enableSearchGrounding && response.candidates?.[0]?.groundingMetadata) {
            result.sources = response.candidates[0].groundingMetadata.groundingChunks;
        }

        return result as AnalysisData;

    } catch (error) {
        console.warn("Analysis step encountered an issue:", error);
        return {
            summary: "Analysis failed to generate.",
            sentiment: { overall: "Unknown", trend: [] },
            entities: {},
            sources: []
        };
    }
};

export const cacheStep = async (transcriptionText: string): Promise<{ name: string, ttl: number } | undefined> => {
    if (transcriptionText.length < 500) return undefined;

    console.log("Step D: Creating context cache...");
    try {
        const ttlSeconds = 1200;
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
        return undefined;
    }
};
