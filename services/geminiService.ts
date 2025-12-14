
import { GoogleGenAI, GenerateContentParameters, Type } from "@google/genai";
import { TranscriptionResult, TranscriptionOptions } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    transcription: {
      type: Type.ARRAY,
      description: "An array of transcribed audio segments.",
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: "The start time of the speech segment in HH:MM:SS format." },
          speaker: { type: Type.STRING, description: "The identified speaker label (e.g., 'Speaker 1'). If diarization is disabled, this can be a generic label like 'SPEAKER'." },
          text: { type: Type.STRING, description: "The transcribed text for this segment." },
        },
        required: ["timestamp", "speaker", "text"],
      },
    },
    summary: { type: Type.STRING, description: "A summary of the transcription. Should be an empty string if summarization is disabled." },
    sentiment: {
      type: Type.OBJECT,
      description: "Analysis of the emotional tone of the conversation.",
      properties: {
        overall: { type: Type.STRING, description: "The overall sentiment (e.g., Positive, Negative, Neutral, Mixed). Empty if disabled." },
        trend: {
          type: Type.ARRAY,
          description: "A chronological trend of sentiment through the conversation. Empty if disabled.",
          items: {
            type: Type.OBJECT,
            properties: {
              segment: { type: Type.INTEGER, description: "The chronological segment number." },
              sentiment: { type: Type.STRING, description: "The sentiment for this segment (Positive, Negative, or Neutral)." },
            },
            required: ["segment", "sentiment"],
          },
        },
      },
      required: ["overall", "trend"],
    },
    entities: {
      type: Type.OBJECT,
      description: "A dictionary of extracted key entities, categorized by type (e.g., People, Organizations, Locations) and values are arrays of the identified entities. Should be an empty object if entity extraction is disabled.",
      properties: {
        People: {
          type: Type.ARRAY,
          description: "List of people's names mentioned in the audio.",
          items: { type: Type.STRING }
        },
        Organizations: {
          type: Type.ARRAY,
          description: "List of organizations, companies, or institutions mentioned.",
          items: { type: Type.STRING }
        },
        Locations: {
          type: Type.ARRAY,
          description: "List of cities, countries, or other locations mentioned.",
          items: { type: Type.STRING }
        },
        Other: {
            type: Type.ARRAY,
            description: "List of any other important entities that do not fit the above categories.",
            items: { type: Type.STRING }
        }
      },
    },
  },
  required: ["transcription", "summary", "sentiment", "entities"],
};

const buildSimplePrompt = (options: TranscriptionOptions): string => {
    const {
        language,
        enableDiarization,
        enableSummary,
        summaryLength,
        summaryDetail,
        summaryStructure,
        enableEntityExtraction,
        enableSentimentAnalysis,
    } = options;

    let prompt = `Analyze the provided audio file and return a structured JSON object that adheres to the provided schema. The primary language spoken is ${language}.`;

    if (enableDiarization) {
        prompt += ` Identify and label each speaker (e.g., 'Speaker 1', 'Speaker 2'). Provide timestamps in HH:MM:SS format for each segment.`;
    } else {
        prompt += ` Transcribe the audio assuming a single speaker. Provide timestamps in HH:MM:SS format for each segment.`;
    }

    if (enableSummary) {
        prompt += ` Include a ${summaryLength.toLowerCase()} ${summaryDetail.toLowerCase()} summary structured as ${summaryStructure.toLowerCase()}.`;
    }

    if (enableSentimentAnalysis) {
        prompt += ` Include an overall sentiment analysis and a chronological sentiment trend with 5-10 segments.`;
    }

    if (enableEntityExtraction) {
        prompt += ` Extract key entities mentioned in the audio. Categorize them into People, Organizations, Locations, and Other, as defined in the schema.`;
    }
    
    return prompt;
};

export const transcribeAudio = async (
  audioBase64: string, 
  mimeType: string,
  options: TranscriptionOptions
): Promise<TranscriptionResult | null> => {
  try {
    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType,
      },
    };

    const instructionText = buildSimplePrompt(options);

    const request: GenerateContentParameters = {
      model: "gemini-2.5-flash",
      contents: [{ parts: [audioPart, { text: instructionText }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    };

    if (options.enableSearchGrounding) {
        request.config!.tools = [{googleSearch: {}}];
    }

    const response = await ai.models.generateContent(request);
    
    const jsonText = response.text;
    
    if (jsonText) {
      try {
        const parsedJson = JSON.parse(jsonText);
        // Add grounding sources to the final object, as they are not part of the schema
        parsedJson.sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return parsedJson as TranscriptionResult;
      } catch (e) {
        console.error("Failed to parse JSON response from API:", e);
        console.error("Raw response text:", jsonText);
        throw new Error("The AI returned an invalid response format. Please try again.");
      }
    }
    
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);

    let userFriendlyMessage = "An unknown error occurred during transcription.";

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('api key not valid') || errorMessage.includes('api_key_invalid')) {
        userFriendlyMessage = "Your API key is invalid or missing. Please check your configuration and try again.";
      } else if (errorMessage.includes('400')) { // Bad Request
        userFriendlyMessage = "The request was invalid. This may be due to an unsupported audio format or a corrupted file. Please try a different audio file.";
      } else if (errorMessage.includes('500') || errorMessage.includes('503')) { // Server Error
        userFriendlyMessage = "The AI service is currently unavailable or experiencing issues. Please try again later.";
      } else if (errorMessage.includes('deadline_exceeded')) {
        userFriendlyMessage = "The request timed out. This can happen with very large files. Please try a smaller file or check your network connection.";
      } else if (errorMessage.includes('resource_exhausted')) {
         userFriendlyMessage = "You have exceeded your API quota. Please check your usage limits and billing information in your Google Cloud console.";
      } else if (errorMessage.includes('safety')) {
         userFriendlyMessage = "The request was blocked due to safety settings. The audio content may have violated the safety policy.";
      } else {
        userFriendlyMessage = `An unexpected error occurred: ${error.message}`;
      }
    }
    
    throw new Error(userFriendlyMessage);
  }
};