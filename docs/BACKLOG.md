
# Product Backlog

This document outlines the prioritized feature requests, technical debt, and UX improvements for **TranscriptedAI**.

## Priorities Strategy

| Priority | Description |
| :--- | :--- |
| **Critical** | Essential for core functionality or fixing major bugs. Blockers for release. |
| **High** | Significant value add, planned for immediate future releases. |
| **Medium** | "Nice to have" features that improve the experience but aren't blockers. |
| **Low** | Long-term ideas or niche use cases. |

---

## 1. Feature Requests

| ID | Priority | Feature | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| `F-01` | **Critical** | **Microphone Input Support** | Add a "Record" button next to upload. Use MediaRecorder API to stream audio chunks to Gemini. This moves the app from a file processor to a live transcription tool. | 🔴 Backlog |
| `F-02` | **High** | **Audio Player Integration** | Add a visual audio player waveform. Clicking a text segment in the transcript should jump the player to that specific timestamp (seek). | 🔴 Backlog |
| `F-03` | **Medium** | **Export Formats** | Allow users to download the transcript as `.srt` (Subtitles), `.vtt`, `.pdf`, or `.docx` files. Currently only supports `.txt`. | 🟢 Done (PDF) / 🟡 Partial (SRT/DOCX) |
| `F-04` | **Low** | **Custom Vocabulary** | Allow users to provide a list of names, acronyms, or industry jargon in Settings to prompt-inject into the transcription step for higher accuracy. | 🔴 Backlog |
| `F-05` | **Low** | **Cloud Sync** | Optional integration (e.g., Firebase/Supabase) to sync transcription history across devices. | 🔴 Backlog |

## 2. UX & UI Improvements

| ID | Priority | Improvement | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| `UX-01` | **High** | **Dark Mode** | Implement a system-aware dark theme variant of the current "Sand & Glass" UI to reduce eye strain. | 🔴 Backlog |
| `UX-02` | **High** | **Deep-Link Sources** | In the "Grounding" section, make citations clickable timestamps that seek the audio player to the specific moment (requires `F-02`). | 🔴 Backlog |
| `UX-03` | **Medium** | **Mobile Optimization** | Refine the "Insights Panel" interaction on mobile devices. Currently, it is hidden on small screens; needs a drawer/overlay implementation. | 🔴 Backlog |

## 3. Technical Debt & Architecture

| ID | Priority | Task | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| `T-01` | **High** | **Chatbot Context Awareness** | Ensure the Chatbot utilizes the `ai.caches` API effectively. Currently, there is a fallback to history injection; need to validate TTL handling and expiration UI states. | 🟢 Completed |
| `T-02` | **Medium** | **Quota Error Handling** | Implement exponential backoff for `429 Too Many Requests` errors from the Gemini API to prevent app crashes during high load. | 🔴 Backlog |
| `T-03` | **Medium** | **Unit Testing Coverage** | Increase unit test coverage for `geminiService.ts` and `analyticsUtils.ts` to >80%. | 🟢 Completed |
| `T-04` | **Critical** | **API Key Security (BYOK)** | Refactor the app to remove `process.env.[[[YOUR_API_KEY]]` dependency for production builds. Implement a "Settings" modal for users to input their own API key, stored in `localStorage`. | 🔴 Backlog |

## 4. Completed Items (Log)

| ID | Feature / Task | Date Completed |
| :--- | :--- | :--- |
| `C-01` | **File Ingestion Update** | Moved from Base64 to Gemini File API to support files > 20MB. |
| `C-02` | **IndexedDB Persistence** | Implemented local database for history storage using Dexie.js. |
| `C-03` | **Two-Stage Pipeline** | Split Transcription and Analysis into separate API calls for progressive loading. |
| `C-04` | **Test Suite** | Added `TestRunner` and unit tests for utils and services. |
| `C-05` | **Visual Analytics** | Added D3.js based sentiment distribution charts. |
