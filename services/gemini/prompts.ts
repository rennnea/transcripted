
import { Type } from "@google/genai";
import { TranscriptionOptions } from "../../types";

// --- SCHEMAS ---

// Schema for Stage 1: Strict Transcription (Data Extraction)
export const transcriptionSchema = {
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
export const analysisSchema = {
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

// --- PROMPT GENERATORS ---

export const getTranscriptionPrompt = (options: TranscriptionOptions): string => {
    return `Transcribe the audio file accurately. 
    Language: ${options.language}. 
    ${options.enableDiarization ? "Identify unique speakers (Speaker 1, Speaker 2)." : "Treat as a single speaker."}
    timestamps are required in HH:MM:SS format.`;
};

export const getAnalysisPrompt = (transcriptionText: string, options: TranscriptionOptions): string => {
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
    
    // LOGIC FIX: Only ask for grounding if Summary is ALSO enabled, as the grounding instruction 
    // specifically asks to "Verify facts in the summary".
    if (options.enableSummary && options.enableSearchGrounding) {
        prompt += `\n\nVerify facts in the summary using Google Search. Return the result as a VALID JSON object matching this structure: ${JSON.stringify(analysisSchema)}`;
    }

    prompt += `\nTRANSCRIPT:\n${transcriptionText.substring(0, 800000)}`;
    
    return prompt;
};

export const getCacheSystemInstruction = (): string => {
    return "You are a helpful AI assistant. Answer questions based ONLY on the provided transcript context.";
};
