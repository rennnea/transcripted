
import { GoogleGenAI, GenerateContentParameters, Type } from "@google/genai";
import { TranscriptionResult, TranscriptionOptions, RawTranscriptionData, AnalysisData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- SCHEMAS ---

// Schema for Stage 1: Strict Transcription (Data Extraction)
const transcriptionSchema = {
  type: Type.OBJECT,
  properties: {
    transcription: {
      type: Type.ARRAY,
      description: "An array of transcribed audio segments with precise timestamps.",
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: "Start time (HH:MM:SS)" },
          speaker: { type: Type.STRING, description: "Speaker label (e.g., Speaker 1)" },
          text: { type: Type.STRING, description: "Spoken text" },
        },
        required: ["timestamp", "speaker", "text"],
      },
    },
  },
  required: ["transcription"],
};

// Schema for Stage 2: Analysis (Insights)
const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A structured summary." },
        sentiment: {
            type: Type.OBJECT,
            properties: {
                overall: { type: Type.STRING },
                trend: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            segment: { type: Type.INTEGER },
                            sentiment: { type: Type.STRING, enum: ["Positive", "Negative", "Neutral"] }
                        }
                    }
                }
            }
        },
        entities: {
            type: Type.OBJECT,
            properties: {
                People: { type: Type.ARRAY, items: { type: Type.STRING } },
                Organizations: { type: Type.ARRAY, items: { type: Type.STRING } },
                Locations: { type: Type.ARRAY, items: { type: Type.STRING } },
                Other: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        }
    }
};

// --- HELPER FUNCTIONS ---

const cleanJsonResponse = (text: string): string => {
    return text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
};

// --- PIPELINE STEPS ---

const uploadAudioFile = async (file: File): Promise<{ uri: string, mimeType: string }> => {
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

const transcribeStep = async (fileUri: string, mimeType: string, options: TranscriptionOptions): Promise<RawTranscriptionData> => {
    console.log("Step B: Performing strict transcription...");
    
    const prompt = `Transcribe the audio file accurately. 
    Language: ${options.language}. 
    ${options.enableDiarization ? "Identify unique speakers (Speaker 1, Speaker 2)." : "Treat as a single speaker."}
    timestamps are required in HH:MM:SS format.`;

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

const analyzeStep = async (transcriptionText: string, options: TranscriptionOptions): Promise<AnalysisData> => {
    console.log("Step C: Performing analysis...");
    
    if (!transcriptionText || transcriptionText.length < 10) {
        return {
            summary: "",
            sentiment: { overall: "Unknown", trend: [] },
            entities: {},
            sources: []
        };
    }

    let prompt = `Analyze the provided transcript text.\n`;
    
    if (options.enableSummary) {
        prompt += `Generate a ${options.summaryLength} ${options.summaryDetail} summary formatted as ${options.summaryStructure}.\n`;
    }
    if (options.enableSentimentAnalysis) {
        prompt += `Perform sentiment analysis (Overall + Trend).\n`;
    }
    if (options.enableEntityExtraction) {
        prompt += `Extract entities (People, Organizations, Locations).\n`;
    }
    
    prompt += `\nTRANSCRIPT:\n${transcriptionText.substring(0, 800000)}`;

    const config: any = {};

    if (options.enableSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
        prompt += `\n\nVerify facts in the summary using Google Search. Return the result as a VALID JSON object matching this structure: ${JSON.stringify(analysisSchema)}`;
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

const cacheStep = async (transcriptionText: string, fileName: string): Promise<{ name: string, ttl: number } | undefined> => {
    if (transcriptionText.length < 500) return undefined;

    console.log("Step D: Creating context cache...");
    try {
        const ttlSeconds = 1200;
        const cacheResult = await ai.caches.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are a helpful AI assistant. Answer questions based ONLY on the provided transcript context.",
            },
            contents: [{
                role: 'user',
                parts: [{ text: transcriptionText }]
            }],
            ttlSeconds: ttlSeconds
        });
        
        console.log(`Cache created: ${cacheResult.name}`);
        return { name: cacheResult.name, ttl: ttlSeconds };
    } catch (error) {
        console.warn("Context caching failed:", error);
        return undefined;
    }
};

// --- MAIN ORCHESTRATOR ---

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
    const cachePromise = cacheStep(fullText, file.name);

    return {
        initialResult: rawData,
        analysisPromise,
        cachePromise
    };
};
