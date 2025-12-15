/**
 * @file geminiService.ts
 * @deprecated This file is deprecated as of version 2.0
 * 
 * # Overview
 * 
 * This file originally contained a monolithic service for handling all Google Gemini API interactions,
 * including audio file uploads, transcription, analysis, and caching. It has been refactored into a
 * modular service architecture for better maintainability, testability, and separation of concerns.
 * 
 * # Why This Was Deprecated
 * 
 * The original monolithic `geminiService.ts` combined multiple responsibilities:
 * - API client initialization
 * - File upload logic
 * - Transcription processing
 * - Analysis and sentiment extraction
 * - Context caching
 * - Pipeline orchestration
 * 
 * This violated the Single Responsibility Principle and made the code difficult to:
 * - Test individual components in isolation
 * - Maintain and debug
 * - Extend with new features
 * - Reuse in different contexts
 * 
 * # Migration Guide
 * 
 * The functionality has been split into a modular architecture under `services/gemini/`:
 * 
 * ## 1. API Client Initialization
 * **Old:** `geminiService.ts` initialized the client internally
 * **New:** Use `services/gemini/client.ts`
 * ```typescript
 * import { ai } from './services/gemini/client';
 * // ai is a pre-configured GoogleGenAI instance
 * ```
 * 
 * ## 2. Pipeline Orchestration
 * **Old:** `geminiService.processAudio(file, options)`
 * **New:** Use `services/gemini/orchestrator.ts`
 * ```typescript
 * import { processAudioPipeline } from './services/gemini/orchestrator';
 * 
 * const { initialResult, analysisPromise, cachePromise } = 
 *   await processAudioPipeline(file, options);
 * 
 * // initialResult: Contains transcription data (blocking)
 * // analysisPromise: Promise for analysis data (non-blocking)
 * // cachePromise: Promise for cache creation (non-blocking)
 * ```
 * 
 * ## 3. Individual API Operations
 * **New:** Use `services/gemini/api.ts` for granular control
 * ```typescript
 * import { uploadAudioFile, transcribeStep, analyzeStep, cacheStep } 
 *   from './services/gemini/api';
 * 
 * // Upload a file
 * const { uri, mimeType } = await uploadAudioFile(file);
 * 
 * // Transcribe
 * const rawData = await transcribeStep(uri, mimeType, options);
 * 
 * // Analyze (with optional grounding)
 * const analysisData = await analyzeStep(fullText, options);
 * 
 * // Create cache
 * const cacheData = await cacheStep(fullText);
 * ```
 * 
 * ## 4. Prompts and Schemas
 * **New:** Use `services/gemini/prompts.ts`
 * ```typescript
 * import { 
 *   transcriptionSchema, 
 *   analysisSchema,
 *   getTranscriptionPrompt,
 *   getAnalysisPrompt,
 *   getCacheSystemInstruction
 * } from './services/gemini/prompts';
 * ```
 * 
 * ## 5. React Integration
 * **Old:** Custom hooks directly importing `geminiService`
 * **New:** Use `hooks/useGeminiPipeline.ts`
 * ```typescript
 * import { useGeminiPipeline } from './hooks/useGeminiPipeline';
 * 
 * function MyComponent() {
 *   const { 
 *     result, 
 *     isLoading, 
 *     isAnalyzing, 
 *     error, 
 *     progress,
 *     activeCacheName,
 *     startPipeline,
 *     reset,
 *     loadExternalResult
 *   } = useGeminiPipeline();
 * 
 *   const handleUpload = (file: File, options: TranscriptionOptions) => {
 *     startPipeline(file, options);
 *   };
 * 
 *   return (
 *     // ... UI components
 *   );
 * }
 * ```
 * 
 * # New Architecture Benefits
 * 
 * ## 1. Progressive Loading
 * The pipeline now returns initial transcription results immediately while processing
 * expensive analysis operations in the background:
 * - Stage 1 (Blocking): Upload + Transcription → User sees text immediately
 * - Stage 2 (Non-Blocking): Analysis + Sentiment → UI updates progressively
 * - Stage 3 (Background): Context Caching → Ready for chat interactions
 * 
 * ## 2. Separation of Concerns
 * - `client.ts`: Single responsibility - API client configuration
 * - `api.ts`: Individual API operations with error handling
 * - `orchestrator.ts`: Pipeline coordination logic
 * - `prompts.ts`: Centralized prompt and schema management
 * 
 * ## 3. Improved Error Handling
 * Each module handles its own errors gracefully:
 * - Upload failures don't crash the entire pipeline
 * - Analysis failures return empty results instead of breaking the UI
 * - Cache failures are optional and don't block the user experience
 * 
 * ## 4. Better Testing
 * Individual modules can be tested in isolation with mocked dependencies
 * 
 * ## 5. Type Safety
 * Stronger TypeScript types throughout the pipeline with proper interfaces
 * 
 * # Processing Pipeline Details
 * 
 * The new architecture implements a **Progressive Two-Stage Pipeline**:
 * 
 * ```
 * User Upload
 *     ↓
 * [1] Upload File (ai.files.upload)
 *     ↓
 * [2] Transcribe Audio (gemini-2.5-flash) ← BLOCKING
 *     ↓
 * Show Initial Result to User ← UI UNBLOCKS HERE
 *     ↓
 * [3] Analyze Text (gemini-3-pro-preview) ← NON-BLOCKING
 *     ↓
 * [4] Create Context Cache (ai.caches.create) ← BACKGROUND
 *     ↓
 * Update UI with Full Results
 * ```
 * 
 * This approach provides a better user experience by showing transcription results
 * quickly while expensive analysis operations happen in the background.
 * 
 * # Key Models Used
 * 
 * - **gemini-2.5-flash**: Fast transcription with speaker diarization
 * - **gemini-3-pro-preview**: Advanced analysis with optional Google Search grounding
 * 
 * # Related Files
 * 
 * - `services/gemini/client.ts` - API client initialization
 * - `services/gemini/api.ts` - Individual API operations
 * - `services/gemini/orchestrator.ts` - Pipeline coordination
 * - `services/gemini/prompts.ts` - Prompt templates and schemas
 * - `hooks/useGeminiPipeline.ts` - React integration hook
 * - `utils/db.ts` - IndexedDB persistence layer
 * - `utils/cacheUtils.ts` - Cache key generation
 * - `utils/progressUtils.ts` - Progress simulation
 * - `types.ts` - TypeScript type definitions
 * 
 * @see {@link https://ai.google.dev/} Google Gemini API Documentation
 * @see {@link file://./docs/ARCHITECTURE.md} System Architecture Reference
 */
export {};