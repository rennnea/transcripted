
# System Architecture Reference

## 1. High-Level Overview

**TranscriptedAI** is a client-side Single Page Application (SPA) built to process audio data into structured intelligence. It adheres to a **Serverless / Fat-Client** architecture where the browser communicates directly with the Google Gemini API, eliminating the need for an intermediate backend server for processing.

### Key Architectural Characteristics
*   **Client-First:** All business logic, state management, and orchestration happen in the user's browser.
*   **Privacy-Centric:** Data persists locally via IndexedDB; no user audio or transcripts are stored on a TranscriptedAI proprietary server.
*   **Event-Driven:** The UI reacts to progressive state changes from the AI processing pipeline.

---

## 2. Component Architecture

The application uses **React 19** with a functional component structure. The UI is organized into a layout-based hierarchy managed by the root `App.tsx` controller.

```mermaid
graph TD
    Root[index.tsx] --> App[App.tsx / State Manager]
    App --> Sidebar[Sidebar Navigation]
    App --> Header[Global Header]
    App --> Main{Main View Switch}
    
    Main -->|State: Landing| Landing[LandingPage]
    Main -->|State: Upload| Uploader[FileUploader]
    Main -->|State: Result| Display[TranscriptionDisplay]
    Main -->|State: Chat| Chat[Chatbot Interface]
    Main -->|State: History| History[HistoryView]
    Main -->|State: Lab| Lab[SentimentLab]
    
    App --> Insights[InsightsPanel (Side Overlay)]
    
    Display --> Components[Sentiment / Entities / Summary]
    Chat --> GenAI[Gemini Chat Session]
```

### Core Components
-   **`App.tsx`**: Acts as the central **Store** and **Router**. It holds the file state, processing status, and manages the transition between views (`landing` -> `upload` -> `transcribing` -> `result`).
-   **`TranscriptionDisplay.tsx`**: The primary data presentation layer. It handles the rendering of timestamps, speaker labels, and editable text areas. It also manages **PDF Export** via `jspdf`.
-   **`InsightsPanel.tsx`**: A specialized visualization container that renders charts and lists side-by-side with the transcript. It utilizes **D3.js** for complex data visualizations like the Sentiment Distribution chart.
-   **`SentimentLab.tsx`**: An isolated interactive component for real-time text analysis, demonstrating client-side sentiment logic and fluid animations.

---

## 3. Data Flow & The Processing Pipeline

The core innovation of TranscriptedAI is its **Progressive Two-Stage Pipeline**, designed to mitigate the latency inherent in Large Language Model (LLM) processing.

### The Pipeline Pattern (`geminiService.ts`)

1.  **Ingestion:**
    *   User selects a file.
    *   File is uploaded via `ai.files.upload` (MIME-type agnostic).
    *   Returns a `fileUri` handle.

2.  **Stage 1: Transcription (Blocking/Synchronous)**
    *   **Goal:** Get text to the user ASAP.
    *   **Model:** `gemini-2.5-flash`.
    *   **Output:** Strict JSON array of `{ timestamp, speaker, text }`.
    *   **UX:** Loading spinner -> Text appears.

3.  **Stage 2: Analysis (Non-Blocking/Asynchronous)**
    *   **Goal:** Extract expensive insights (Sentiment, Summaries, Grounding).
    *   **Model:** `gemini-3-pro-preview`.
    *   **Output:** Complex JSON object.
    *   **UX:** `StatusPill` appears -> Insights Panel populates dynamically.
    *   **Post-Action:** If `autoSave` is enabled, the result is immediately committed to IndexedDB.

4.  **Stage 3: Context Caching (Background)**
    *   **Goal:** Prepare for Chatbot interactions.
    *   **Action:** `ai.caches.create` stores the transcript tokens on Google's edge.
    *   **Output:** A `cacheName` string (e.g., `caches/12345`).

---

## 4. Persistence Layer

Due to the size limitations of `localStorage` (typically 5MB), TranscriptedAI uses **IndexedDB** for storing transcription results.

### Database Schema (`utils/db.ts`)
We use **Dexie.js** as a wrapper for better DX.

| Table | Index | Description |
| :--- | :--- | :--- |
| `transcriptions` | `++id` | Auto-incrementing primary key. |
| | `cacheKey` | Unique hash based on file metadata + settings. |
| | `[fileName+fileSize+lastModified]` | Compound index for duplicate detection. |
| | `createdAt` | Used for sorting history. |

### Storage Strategy
1.  **Write:** Occurs automatically after the Pipeline completes (if Auto-save enabled).
2.  **Read:** Occurs when opening `HistoryView` or when re-uploading a file (Cache-First strategy).
3.  **Purge:** User-initiated via "Clear History" button.

---

## 5. External Integration (Google Gemini)

The application relies heavily on the `@google/genai` SDK.

### Service Abstraction
All direct API calls are encapsulated in `services/geminiService.ts`. This ensures:
*   **Separation of Concerns:** React components never import `@google/genai` directly (except for types).
*   **Error Handling:** centralized `try/catch` logic for API quotas and network failures.
*   **Mockability:** Easier to swap out for the `TestRunner` mocks.

### Model Strategy
*   **Transcription:** Uses **Flash** models for speed and cost-efficiency.
*   **Reasoning:** Uses **Pro** models for depth and adherence to complex instructions.
*   **Grounding:** Leverages Google Search Tool for factual verification.

---

## 6. Design System

The UI is built using **Tailwind CSS** with a custom configuration defined in `index.html`.

### Theme: "Organic Intelligence"
*   **Palette:** Earth tones (Khaki, Beige, Brown) to evoke a "paper/document" feel rather than a "tech/neon" feel.
*   **Typography:** `Inter` for UI density, `Poppins` for headings.
*   **Visuals:** Glassmorphism (`backdrop-blur`) is used on panels to maintain context of the underlying content.

---

## 7. Security Considerations

1.  **API Keys:** Currently handled via build-time `process.env`. Architecture readiness for "Bring Your Own Key" (BYOK) is high, requiring only a change in the `geminiService` initialization logic.
2.  **XSS Protection:** All user content is rendered via React's safe escaping mechanisms. Markdown rendering in summaries is handled via controlled CSS classes.
3.  **Data Isolation:** As a client-side app, there is no cross-user data leakage risk.
