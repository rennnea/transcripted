
// FIX: Replaced deprecated `GenerateContentRequest` with `GenerateContentParameters`.
import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import { TranscriptionResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const transcribeAudio = async (
  audioBase64: string, 
  mimeType: string,
  language: string,
  enableDiarization: boolean,
  enableSummary: boolean,
  summaryLength: string,
  summaryDetail: string,
  summaryStructure: string,
  enableEntityExtraction: boolean,
  enableSentimentAnalysis: boolean,
  enableSearchGrounding: boolean
): Promise<TranscriptionResult | null> => {
  try {
    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType,
      },
    };

    let transcriptionInstruction = `Transcribe this audio file accurately. The primary language spoken in the audio is ${language}.`;
    if (enableDiarization) {
      transcriptionInstruction += " Please also perform speaker diarization, identifying and labeling each speaker (e.g., 'Speaker 1:', 'Speaker 2:').";
    }
    if (enableSummary) {
      transcriptionInstruction += `\n\nAfter the full transcription, please add a section marked with '--- SUMMARY ---' followed by a ${summaryLength.toLowerCase()} summary. The summary should be ${summaryDetail.toLowerCase()} and structured as ${summaryStructure.toLowerCase()}.`;
      if (enableSearchGrounding) {
        transcriptionInstruction += `\nIf the topic is factual or scientific, use your search tool to find relevant background knowledge. Briefly add this information to the summary to provide more context and accuracy. For any information you add from a search, cite the source using markdown links like [Title](URL). If you are not sure of the topic or can't find relevant information, do not add any extra information.`;
      }
    }
    if (enableSentimentAnalysis) {
      transcriptionInstruction += `\n\nAfter the summary, add a section marked with '--- SENTIMENT ---'. In this section, provide an overall sentiment analysis of the conversation (e.g., Positive, Negative, Neutral, Mixed).`;
    }
    if (enableEntityExtraction) {
        transcriptionInstruction += `\n\nAfter the sentiment analysis, add a section marked with '--- ENTITIES ---'. In this section, extract and list key entities in Hungarian. Format it with the category name on its own line ending with a colon, also in Hungarian (e.g., Emberek:, Szervezetek:, Helyszínek:), followed by a new line with a comma-separated list of the entities.`;
    }

    const textPart = {
      text: transcriptionInstruction,
    };

    // FIX: Replaced deprecated `GenerateContentRequest` with `GenerateContentParameters`.
    const request: GenerateContentParameters = {
      model: "gemini-2.5-flash",
      contents: [{ parts: [audioPart, textPart] }],
      config: {}
    };

    if (enableSearchGrounding) {
        request.config!.tools = [{googleSearch: {}}];
    }

    const response = await ai.models.generateContent(request);
    
    const text = response.text ?? null;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    if (text) {
        return { text, sources };
    }
    
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
    throw new Error("An unknown error occurred while calling the Gemini API.");
  }
};