/**
 * @file prompts.ts
 * @description Prompt templates and response schemas for Gemini API interactions.
 * 
 * This module centralizes all prompt engineering and schema definitions for the
 * transcription and analysis pipeline. It ensures consistent formatting and
 * makes it easy to update prompts across the application.
 * 
 * @module services/gemini/prompts
 */

import { Type } from "@google/genai";
import { TranscriptionOptions } from "../../types";

// --- SCHEMAS ---

/**
 * Schema for Stage 1: Strict Transcription (Data Extraction)
 * 
 * Defines the expected JSON structure for transcription responses.
 * This schema enforces structured output from the Gemini model, ensuring
 * we receive an array of timestamped segments with speaker labels.
 * 
 * **Output Structure:**
 * ```json
 * {
 *   "transcription": [
 *     {
 *       "timestamp": "00:00:00",
 *       "speaker": "Speaker 1",
 *       "text": "Hello, how are you?"
 *     }
 *   ]
 * }
 * ```
 * 
 * @see {@link transcribeStep} for usage
 */
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

/**
 * Schema for Stage 2: Analysis (Insights)
 * 
 * Defines the expected JSON structure for analysis responses.
 * This schema enforces structured output for summaries, sentiment analysis,
 * and entity extraction.
 * 
 * **Output Structure:**
 * ```json
 * {
 *   "summary": "The conversation discusses...",
 *   "sentiment": {
 *     "overall": "Positive",
 *     "trend": [
 *       { "segment": 1, "sentiment": "Positive" },
 *       { "segment": 2, "sentiment": "Neutral" }
 *     ]
 *   },
 *   "entities": {
 *     "People": ["John Doe", "Jane Smith"],
 *     "Organizations": ["Acme Corp"],
 *     "Locations": ["New York"],
 *     "Other": ["Project Alpha"]
 *   }
 * }
 * ```
 * 
 * **Note:** This schema is NOT used when `enableSearchGrounding` is true,
 * as Google Search integration requires a different response format.
 * 
 * @see {@link analyzeStep} for usage
 */
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

/**
 * Generates a prompt for the transcription step.
 * 
 * This prompt instructs the Gemini model to perform accurate speech-to-text
 * conversion with optional speaker diarization and timestamp generation.
 * 
 * @param options - Transcription configuration options
 * @returns Formatted prompt string for the transcription model
 * 
 * @example
 * ```typescript
 * const prompt = getTranscriptionPrompt({
 *   language: 'en',
 *   enableDiarization: true
 * });
 * // Returns: "Transcribe the audio file accurately. 
 * //           Language: en. 
 * //           Identify unique speakers (Speaker 1, Speaker 2).
 * //           timestamps are required in HH:MM:SS format."
 * ```
 */
export const getTranscriptionPrompt = (options: TranscriptionOptions): string => {
    return `Transcribe the audio file accurately. 
    Language: ${options.language}. 
    ${options.enableDiarization ? "Identify unique speakers (Speaker 1, Speaker 2)." : "Treat as a single speaker."}
    timestamps are required in HH:MM:SS format.`;
};

/**
 * Generates a prompt for the analysis step.
 * 
 * This prompt dynamically builds instructions based on enabled features
 * (summary, sentiment, entities, grounding). It ensures the model only
 * performs requested analysis tasks.
 * 
 * **Logic Note:** Search grounding is only requested when summary is also
 * enabled, as the grounding specifically verifies facts in the summary.
 * 
 * @param transcriptionText - The full transcription text to analyze
 * @param options - Analysis configuration options
 * @returns Formatted prompt string for the analysis model
 * 
 * @example
 * ```typescript
 * const prompt = getAnalysisPrompt(fullText, {
 *   enableSummary: true,
 *   summaryLength: 'medium',
 *   summaryDetail: 'detailed',
 *   summaryStructure: 'paragraph',
 *   enableSentimentAnalysis: true,
 *   enableEntityExtraction: true,
 *   enableSearchGrounding: false
 * });
 * // Returns: "Analyze the provided transcript text.
 * //           Generate a medium detailed summary formatted as paragraph.
 * //           Perform sentiment analysis (Overall + Trend).
 * //           Extract entities (People, Organizations, Locations).
 * //           
 * //           TRANSCRIPT:
 * //           [full text...]"
 * ```
 */
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

    // Include transcript text (limited to 800KB to stay within token limits)
    prompt += `\nTRANSCRIPT:\n${transcriptionText.substring(0, 800000)}`;
    
    return prompt;
};

/**
 * Generates the system instruction for context caching.
 * 
 * This instruction is embedded in the cached context and guides the model's
 * behavior when answering questions in chat mode. It ensures the chatbot
 * stays focused on the transcription content.
 * 
 * @returns System instruction string for the cache
 * 
 * @example
 * ```typescript
 * const instruction = getCacheSystemInstruction();
 * // Returns: "You are a helpful AI assistant. Answer questions based ONLY 
 * //           on the provided transcript context."
 * 
 * // Used in cache creation:
 * await ai.caches.create({
 *   systemInstruction: { parts: [{ text: instruction }] },
 *   contents: [{ role: 'user', parts: [{ text: transcriptionText }] }]
 * });
 * ```
 */
export const getCacheSystemInstruction = (): string => {
    return "You are a helpful AI assistant. Answer questions based ONLY on the provided transcript context.";
};
