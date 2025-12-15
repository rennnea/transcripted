
# Changelog

All notable changes to **TranscriptedAI** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-06-10

### Added
- **Sentiment Lab:** Introduced a new experimental view (`SentimentLab.tsx`) for real-time, client-side text sentiment analysis with fluid visualizations.
- **Chatbot Context Indicator:** Added a visual badge (Zap icon) in the Chatbot header to clearly indicate when an active Gemini context cache is being utilized.
- **Sidebar Navigation:** Added a direct link to the Sentiment Lab.

### Changed
- **Chatbot UI:** Polished the chat interface with improved message styling, input area aesthetics, and status messaging.
- **Backlog:** Updated status of Context Caching tasks.

## [1.3.0] - 2025-05-30

### Added
- **PDF Export:** Users can now export their transcription, including the summary and insights, into a formatted PDF document using `jspdf`.
- **D3.js Visualization:** Integrated D3.js to power a new "Sentiment Mix Over Time" stacked bar chart in the Insights Panel.
- **Auto-Save:** Added a toggle in Settings to automatically save transcripts to the local history database upon completion.
- **UI Enhancements:** Improved animations in the Settings panel using `AnimatePresence` and added hover effects to file upload interactions.

### Changed
- **Dependencies:** Added `d3` and `jspdf` to the import map.
- **Settings UI:** Reorganized settings into "Transcription" and "General" sections to accommodate the new Auto-save toggle.

## [1.2.0] - 2025-05-20

### Added
- **Context Caching for Chat:** Implemented the `ai.caches.create` method in `geminiService.ts`. This allows the Chatbot to reference the entire transcript without re-sending the token payload for every message, significantly reducing latency and cost for long sessions.
- **Interactive Chatbot (`Chatbot.tsx`):** Added a conversational interface utilizing `gemini-2.5-flash` (or `gemini-3-pro-preview` for fallback) to allow users to ask questions about specific parts of the audio.
- **Test Runner Suite:** Introduced an in-browser `TestRunner.tsx` that executes unit tests for `fileUtils`, `analyticsUtils`, and mocked `geminiService` calls to ensure regression stability.
- **Sentiment Trend Visualization:** Added `SentimentTrendChart.tsx` (SVG-based) to the Insights Panel, visualizing the emotional arc of the conversation over time.

### Changed
- **Pipeline Return Type:** Updated `processAudioPipeline` to return a `cachePromise`. This allows the UI to render the initial text immediately while the cache creation happens silently in the background.
- **Sidebar Navigation:** Added "AI Chat" and "Run Tests" navigation items; logic added to disable Chat until a file is processed.

### Fixed
- **Type Safety:** Resolved strict TypeScript errors regarding the `contents` property in the `ai.caches.create` method by applying specific type casting where the SDK types were lagging behind the API capabilities.

---

## [1.1.0] - 2025-05-05

### Added
- **IndexedDB Persistence:** Integrated `Dexie.js` to replace `localStorage` for storing transcription results. This raises the storage limit from ~5MB to gigabytes, allowing for long audio file history.
- **History View:** Created `HistoryView.tsx` to browse, search, and reload previous transcription sessions without re-querying the API.
- **Speaker Distribution Chart:** Added a visual breakdown of speaker dominance in `InsightsPanel.tsx`.

### Changed
- **Cache Strategy:** The application now uses a "Cache-First" strategy. If a file with the exact same metadata (Name + Size + LastModified) and settings is uploaded, the result is pulled from IndexedDB instantly.
- **Progress Simulation:** Improved the `simulateTranscriptionProgress` utility to be smoother and more representative of the two-stage pipeline duration.

---

## [1.0.0] - 2025-04-15

### Initial Release

### Features
- **Progressive Two-Stage Pipeline:**
    - **Stage 1 (Transcription):** Uses `gemini-2.5-flash` for high-speed audio-to-text conversion with strict JSON schema enforcement for timestamp extraction.
    - **Stage 2 (Analysis):** Uses `gemini-3-pro-preview` for complex reasoning tasks, including Summarization, Sentiment Analysis, and Entity Extraction.
- **Google Search Grounding:** Integrated the `googleSearch` tool in the analysis stage. If enabled, the summary is verified against live web data, and citations are rendered in the Insights Panel.
- **File Ingestion:** Implemented `ai.files.upload` to handle audio files (MP3, WAV, M4A) directly, replacing the legacy Base64 encoding method to support larger file sizes (up to 2GB).
- **Design System:** Launched with the "Organic Intelligence" theme using Tailwind CSS (Khaki/Beige palette).

### Technical
- **Architecture:** Established the Client-Side / Serverless architecture.
- **SDK:** Standardized on `@google/genai` (v1.33.0+).
- **Strict Mode:** React strict mode enabled for all components.

---

## [0.9.0-beta] - 2025-03-01

### Added
- Basic `FileUploader` with drag-and-drop support.
- Raw text display of transcription.
- Initial integration with Gemini API (Text-only prototyping).
