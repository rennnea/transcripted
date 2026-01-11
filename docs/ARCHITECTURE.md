
# System Architecture Reference

## 1. High-Level Overview

**TranscriptedAI** is a client-side Single Page Application (SPA) built to process audio data into structured intelligence. It adheres to a **Serverless / Fat-Client** architecture where the browser communicates directly with the Google Gemini API, eliminating the need for an intermediate backend server for processing.

### Key Architectural Characteristics
*   **Client-First:** All business logic, state management, and orchestration happen in the user's browser via React Hooks and modular services.
*   **Privacy-Centric:** Data persists locally via IndexedDB; no user audio or transcripts are stored on a TranscriptedAI proprietary server.
*   **Event-Driven:** The UI reacts to progressive state changes from the AI processing pipeline.

---

## 2. Component Architecture

The application uses **React** with a functional component structure. The UI is organized into a layout-based hierarchy managed by the root `App.tsx` controller.

```mermaid
graph TD
    Root[index.tsx] --> App[App.tsx / State Manager]
    App --> Layout[Layout Components]
    Layout --> Sidebar[Sidebar Navigation]
    Layout --> Header[Global Header w/ Search]
    
    App --> Main{Main View Switch}
    
    Main -->|State: Landing| Landing[LandingPage]
    Main -->|State: Upload| Uploader[FileUploader]
    Main -->|State: Result| Display[TranscriptionDisplay]
    Main -->|State: Chat| Chat[Chatbot Interface]
    Main -->|State: History| History[HistoryView]
    Main -->|State: Search| Search[GlobalSearchView]
    Main -->|State: Lab| Lab[SentimentLab]
    
    App --> Insights[InsightsPanel (Side Overlay)]
    
    Display --> Components[Sentiment / Entities / Summary]
    Chat --> GenAI[Gemini Chat Session]
```

### Core Components
-   **`App.tsx`**: Acts as the central **Controller View**. It holds the file state, processing status, and manages the transition between views (`landing` -> `upload` -> `result`). It orchestrates interactions between the UI and the `useGeminiPipeline` hook.
-   **`TranscriptionDisplay.tsx`**: The primary data presentation layer. It renders the transcript, summary, and analysis cards. It also manages **PDF Export** via `jspdf`.
-   **`GlobalSearchView.tsx`**: A dedicated view for displaying semantic search results from the local IndexedDB database.
-   **`InsightsPanel.tsx`**: A specialized visualization container that renders charts and lists side-by-side with the transcript. It utilizes **D3.js** for complex data visualizations.

---

## 3. Data Flow & The Processing Pipeline

The core innovation of TranscriptedAI is its **Progressive Multi-Stage Pipeline**, designed to mitigate LLM latency by delivering value to the user as quickly as possible.

### The Pipeline Pattern (`services/gemini/orchestrator.ts`)

1.  **Ingestion:**
    *   User selects a file.
    *   File is uploaded via `ai.files.upload`.
    *   Returns a `fileUri` handle.

2.  **Stage 1: Transcription (Blocking/Synchronous)**
    *   **Goal:** Get text to the user ASAP.
    *   **Model:** `gemini-2.5-flash`.
    *   **Output:** Strict JSON array of `{ timestamp, speaker, text }`.
    *   **UX:** Loading spinner -> Text appears.

3.  **Stage 2: Parallel Background Processing (Non-Blocking)**
    *   Once Stage 1 is complete, three asynchronous tasks are initiated in parallel.
    *   **Task A: Deep Analysis**
        *   **Goal:** Extract expensive insights (Sentiment, Summaries, Grounding).
        *   **Model:** `gemini-3-pro-preview`.
        *   **UX:** `StatusPill` appears -> Insights Panel populates dynamically.
    *   **Task B: Semantic Indexing**
        *   **Goal:** Prepare for Global Search.
        *   **Model:** `gemini-2.5-flash`.
        *   **Output:** JSON object with `{ themes, keywords, searchSummary }`.
        *   **UX:** Silent background task.
    *   **Task C: Context Caching**
        *   **Goal:** Prepare for Chatbot interactions.
        *   **Action:** `ai.caches.create` stores transcript tokens on Google's edge.
        *   **UX:** Silent background task, enables "Cached" badge in Chatbot.

4.  **Stage 3: Persistence**
    *   After all background tasks resolve, the complete `TranscriptionResult` (including the `semanticIndex`) is committed to IndexedDB if Auto-Save is enabled.

---

## 4. Persistence Layer

TranscriptedAI uses **IndexedDB** for storing transcription results via **Dexie.js**.

### Database Schema (`utils/db.ts`)

| Table | Index | Description |
| :--- | :--- | :--- |
| `transcriptions` | `++id`, `cacheKey`, `createdAt` | Core indices for retrieval and sorting. |
| `semanticIndex` | (object) | Stored within `transcriptionData`, not directly indexed but used for client-side filtering in `GlobalSearchView`. |

---

## 5. Design System

The UI is built using **Tailwind CSS** with a custom theme.

### Theme: "Organic Intelligence"
*   **Palette:** Earth tones (Khaki, Beige, Brown) to evoke a "paper/document" feel.
*   **Typography:** `Inter` for UI, `Poppins` for headings.
*   **Glassmorphism:** `backdrop-blur` is used on panels to maintain context.
*   **Dark Mode:** A first-class citizen of the design system, providing a high-contrast, low-light alternative that maintains the organic feel with muted tones.
