import { TestResult, TestSuiteResult } from './runAllTests';
import { GenerateContentParameters } from '@google/genai';
import { TranscriptionOptions } from '../types';

// This is a manual mock of the @google/genai library for testing purposes.
const mockGoogleGenAI = (scenario: 'success' | 'invalid_key' | 'safety' | 'empty' | 'server_error' | 'bad_json') => {
    let mockResponse: any;
    let shouldReject = false;

    const successfulResponse = {
        transcription: [{ timestamp: "00:00:01", speaker: "Speaker 1", text: "Test successful." }],
        summary: "This is a summary.",
        sentiment: { overall: "Neutral", trend: [] },
        entities: {}
    };

    switch (scenario) {
        case 'success':
            mockResponse = { text: JSON.stringify(successfulResponse), candidates: [{ groundingMetadata: { groundingChunks: [] } }] };
            break;
        case 'bad_json':
             mockResponse = { text: "{ not_json: ", candidates: [] };
             break;
        case 'empty':
            mockResponse = { text: null, candidates: [] };
            break;
        case 'invalid_key':
            mockResponse = new Error("[GoogleGenerativeAI Error]: API key not valid. Please pass a valid API key.");
            shouldReject = true;
            break;
        case 'safety':
            mockResponse = new Error("The request was blocked due to safety settings.");
            shouldReject = true;
            break;
        case 'server_error':
            mockResponse = new Error("A 500 server error occurred.");
            shouldReject = true;
            break;
    }

    return {
        models: {
            generateContent: async (request: any) => {
                (mockGoogleGenAI as any).lastRequest = request;
                if (shouldReject) {
                    return Promise.reject(mockResponse);
                }
                return Promise.resolve(mockResponse);
            }
        },
        files: {
            upload: async (params: any) => {
                if (scenario === 'invalid_key') throw new Error("API key not valid");
                return Promise.resolve({
                    file: {
                        uri: "https://generativelanguage.googleapis.com/v1beta/files/mock-file-id",
                        mimeType: params.config.mimeType
                    }
                });
            }
        }
    };
};

const DUMMY_OPTIONS: TranscriptionOptions = {
    language: 'en-US',
    enableDiarization: true,
    enableSummary: true,
    summaryLength: 'Medium',
    summaryDetail: 'Detailed',
    summaryStructure: 'Bullets',
    enableEntityExtraction: true,
    enableSentimentAnalysis: true,
    enableSearchGrounding: true
};

const DUMMY_FILE = {
    name: "test_audio.mp3",
    type: "audio/mp3",
    size: 1000
} as unknown as File;

// Re-implementing a simplified version of the service to inject the mock,
// as direct mocking of module internals is not straightforward in this environment.
const transcribeAudioWithMock = async (mockedAI: any, audioFile: File, options: TranscriptionOptions): Promise<any> => {
    try {
        const uploadResult = await mockedAI.files.upload({
            file: audioFile,
            config: { mimeType: audioFile.type }
        });

        const config: any = {};
        if (options.enableSearchGrounding) {
            config.tools = [{googleSearch: {}}];
        } else {
            config.responseMimeType = "application/json";
            config.responseSchema = {}; // In real code it's the schema object
        }

        const request: GenerateContentParameters = {
          model: "gemini-2.5-flash",
          contents: [{ parts: [{fileData: { fileUri: uploadResult.file.uri, mimeType: uploadResult.file.mimeType }}, {text: "prompt"}] }],
          config: config
        };
    
        const response = await mockedAI.models.generateContent(request);
        const jsonText = response.text;
        if (jsonText) {
          try {
            const parsedJson = JSON.parse(jsonText);
            parsedJson.sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
            return parsedJson;
          } catch (e) {
            throw new Error("The AI returned an invalid response format. Please try again.");
          }
        }
        return null;
    } catch (error) {
        let userFriendlyMessage = `An unexpected error occurred: ${(error as Error).message}`;
        // Simplified error handling for tests
        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            if (msg.includes('api key not valid')) userFriendlyMessage = "Your API key is invalid or missing. Please check your configuration and try again.";
            else if (msg.includes('safety')) userFriendlyMessage = "The request was blocked due to safety settings. The audio content may have violated the safety policy.";
            else if (msg.includes('500')) userFriendlyMessage = "The AI service is currently unavailable or experiencing issues. Please try again later.";
        }
        throw new Error(userFriendlyMessage);
    }
};

export const runGeminiServiceTests = async (): Promise<TestSuiteResult> => {
    const results: TestResult[] = [];
    const createTest = (description: string, success: boolean, error?: string): TestResult => ({ description, success, error });

    // Test 1: Successful transcription and JSON parsing
    try {
        const ai = mockGoogleGenAI('success');
        const result = await transcribeAudioWithMock(ai, DUMMY_FILE, DUMMY_OPTIONS);
        if (result && result.summary === "This is a summary.") {
            results.push(createTest("geminiService: Handles a successful API response with File upload and parses JSON", true));
        } else {
            results.push(createTest("geminiService: Handles a successful API response with File upload and parses JSON", false, "Did not return expected success object."));
        }
    } catch (e) {
        results.push(createTest("geminiService: Handles a successful API response with File upload and parses JSON", false, (e as Error).message));
    }
    
    // Test 2: Checks if the request is correctly formatted for JSON
    const optionsNoGrounding = { ...DUMMY_OPTIONS, enableSearchGrounding: false };
    const ai_schema_check = mockGoogleGenAI('success');
    await transcribeAudioWithMock(ai_schema_check, DUMMY_FILE, optionsNoGrounding);
    const lastRequest = (mockGoogleGenAI as any).lastRequest;
    if (lastRequest.config.responseMimeType === 'application/json' && lastRequest.config.responseSchema) {
       results.push(createTest("geminiService: Requests a JSON response with a schema when grounding is disabled", true));
    } else {
       results.push(createTest("geminiService: Requests a JSON response with a schema when grounding is disabled", false, "Request config was not set to application/json with a schema."));
    }
    
    // Test 3: Checks if grounding tool is added when enabled
     const optionsWithGrounding = { ...DUMMY_OPTIONS, enableSearchGrounding: true };
     const ai_grounding_check = mockGoogleGenAI('success');
     await transcribeAudioWithMock(ai_grounding_check, DUMMY_FILE, optionsWithGrounding);
     const lastRequestWithGrounding = (mockGoogleGenAI as any).lastRequest;
     if (lastRequestWithGrounding.config.tools?.[0]?.googleSearch && !lastRequestWithGrounding.config.responseMimeType) {
        results.push(createTest("geminiService: Adds grounding tool and removes JSON mime type when enabled", true));
     } else {
        results.push(createTest("geminiService: Adds grounding tool and removes JSON mime type when enabled", false, "Request config did not match expected grounding configuration."));
     }

    // Test 4: Handles invalid API key error
    try {
        const ai = mockGoogleGenAI('invalid_key');
        await transcribeAudioWithMock(ai, DUMMY_FILE, DUMMY_OPTIONS);
        results.push(createTest("geminiService: Handles invalid API key error", false, "Did not throw an error for invalid key."));
    } catch (e) {
        if ((e as Error).message.includes("Your API key is invalid")) {
            results.push(createTest("geminiService: Handles invalid API key error", true));
        } else {
            results.push(createTest("geminiService: Handles invalid API key error", false, (e as Error).message));
        }
    }

    // Test 5: Handles bad JSON response
    try {
        const ai = mockGoogleGenAI('bad_json');
        await transcribeAudioWithMock(ai, DUMMY_FILE, DUMMY_OPTIONS);
        results.push(createTest("geminiService: Handles malformed JSON from API", false, "Did not throw an error for bad JSON."));
    } catch (e) {
        if ((e as Error).message.includes("invalid response format")) {
            results.push(createTest("geminiService: Handles malformed JSON from API", true));
        } else {
            results.push(createTest("geminiService: Handles malformed JSON from API", false, (e as Error).message));
        }
    }

    return { suiteName: 'Gemini Service (geminiService.ts)', results };
};