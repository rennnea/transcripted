
# TranscriptedAI Service API Documentation

> **Note:** This document has been updated to reflect the new modular service architecture in `services/gemini/`. The legacy `geminiService.ts` is deprecated.

## 1. Overview

The **TranscriptedAI Service Layer** acts as the primary interface between the React frontend and the Google Gemini API. It handles file upload, transcription orchestration, data analysis, and context caching.

The service utilizes a **Progressive Multi-Stage Pipeline** to optimize user experience:
1.  **Stage 1 (Synchronous):** Strict transcription (audio-to-text).
2.  **Stage 2 (Asynchronous/Parallel):** Deep reasoning (Summarization, Sentiment, Entity Extraction, Grounding), Semantic Indexing, and Context Caching.

---

## 2. Authentication & Client

- **Configuration:** The API key is loaded via the environment variable `process.env.API_KEY`.
- **Client Initialization:** The `@google/genai` client is initialized as a singleton in `services/gemini/client.ts`.

```typescript
// services/gemini/client.ts
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

---

## 3. Core Orchestrator

### `processAudioPipeline`

The main orchestrator function in `services/gemini/orchestrator.ts`. It manages the upload and initiates all processing stages.

**Signature:**
```typescript
export const processAudioPipeline = async (
    file: File, 
    options: TranscriptionOptions
): Promise<{ 
    initialResult: RawTranscriptionData, 
    analysisPromise: Promise<AnalysisData>,
    indexPromise: Promise<SemanticIndex>,
    cachePromise: Promise<{ name: string, ttl: number } | undefined>
}>
```

**Returns:** A Promise that resolves to an object containing:
- `initialResult`: The raw transcription data, available immediately after Stage 1.
- `analysisPromise`: A promise that resolves later with the deep analysis object.
- `indexPromise`: A promise that resolves later with the semantic index for searching.
- `cachePromise`: A promise that resolves with cache metadata for the AI Chatbot.

---

## 4. Pipeline Architecture

### Step A: File Upload (`api.ts`)
- **Method:** `ai.files.upload`
- **Purpose:** Uploads audio binary to Gemini storage.
- **Output:** Returns a `fileUri` reference.

### Step B: Strict Transcription (Stage 1)
- **Model:** `gemini-2.5-flash`
- **Configuration:** `responseMimeType: "application/json"` with a strict schema.
- **Priority:** High / Blocking.

### Step C: Parallel Background Processing (Stage 2)

Once Stage 1 is complete, the following are triggered in parallel:

#### C.1: Deep Analysis (`analyzeStep`)
- **Model:** `gemini-3-pro-preview`
- **Purpose:** Generates summary, sentiment, entities, and grounding sources.

#### C.2: Semantic Indexing (`indexStep`)
- **Model:** `gemini-2.5-flash`
- **Purpose:** Creates a searchable index (`themes`, `keywords`, `searchSummary`).

#### C.3: Context Caching (`cacheStep`)
- **Method:** `ai.caches.create`
- **Purpose:** Caches transcript tokens for efficient Chatbot follow-up questions.

---

## 5. Error Handling

The service layer throws standard JavaScript `Error` objects with user-friendly messages. The `useGeminiPipeline` hook catches these and sets the `error` state for the UI to display.

**Common Errors:**
- `Failed to upload file...`: Network or file type validation issues.
- `Failed to transcribe audio...`: The model could not process the file.
- `Your API key is invalid...`: Authentication error.
- `The request was blocked due to safety settings...`: Content policy violation.
