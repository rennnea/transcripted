
# Strategic Roadmap

This document outlines the strategic direction and phased release plan for **TranscriptedAI**. It serves as a high-level guide for developers and stakeholders to understand the evolution of the product from a simple file transcriber to a comprehensive audio intelligence platform.

## 1. Product Vision

**"To become the most accessible and insightful interface for extracting intelligence from spoken audio."**

We aim to move beyond simple text transcription by leveraging Generative AI to provide deep context, factual verification, and interactive reasoning over audio data, all within a privacy-first, client-side architecture.

---

## 2. Phased Release Plan

### Phase 1: Core Intelligence & UX (v1.0 - v1.5) - *In Progress*

This phase establishes a robust, beautiful, and insightful user experience.

- **Global Search & Semantic Indexing** `(Completed)`
  - **Goal:** Allow users to instantly find relevant information across their entire library.
  
- **System-Aware Dark Mode (`UX-01`)** `(Completed)`
  - **Goal:** Improve accessibility and reduce eye strain for low-light usage.

- **Microphone Input & Live Streaming (`F-01`)**
  - **Goal:** Allow users to record meetings or voice notes directly in the browser.
  - **Tech:** Web Audio API + Gemini Live API (WebSocket streaming).
  
- **Audio Player Integration (`F-02`)**
  - **Goal:** Connect the text to the sound. Clicking a sentence should play that specific audio segment.
  - **Tech:** Waveform visualization (Wavesurfer.js) synchronized with timestamp data.

- **Bring Your Own Key (BYOK) Security (`T-04`)**
  - **Goal:** Remove the hardcoded API key for production readiness.
  - **Implementation:** Secure local storage of user keys with validation checks.


### Phase 2: Professional Tools (v1.6 - v1.9)
*Target: Q3 2025*

This phase targets power users, journalists, and researchers who need specific output formats and higher accuracy for niche topics.

- **Advanced Export Options (`F-03`)**
  - **Formats:** PDF (Report style), SRT (Subtitles), VTT (Web captions), DOCX.
  - **Feature:** Include calculated summaries and sentiment charts in the PDF report.

- **Custom Vocabulary Injection (`F-04`)**
  - **Goal:** Improve accuracy for industry jargon (medical, legal, coding).
  - **Implementation:** Settings UI to pass a list of terms to the Gemini `config` object.

- **Deep-Link Grounding (`UX-02`)**
  - **Goal:** Make fact-checking instant.
  - **Implementation:** Clicking a source citation in the summary auto-scrolls to the relevant part of the transcript or audio.

- **Mobile Interface Overhaul (`UX-03`)** `(Partially Complete)`
  - **Goal:** Full feature parity on mobile.
  - **Design:** Swipeable bottom drawers for Insights and Settings; responsive charts.

### Phase 3: The Collaborative Platform (v2.0)
*Target: 2026*

Transitioning from a single-player tool to a collaborative workspace.

- **Cloud Sync & User Accounts (`F-05`)**
  - **Goal:** Access history across devices.
  - **Tech:** Firebase Auth + Firestore (optional opt-in for users).

- **Team Workspaces**
  - **Goal:** Shared project folders for teams.
  - **Feature:** Commenting on specific transcript segments.

- **Video Ingestion**
  - **Goal:** Support MP4/MOV files.
  - **Tech:** Client-side FFmpeg (WASM) to extract audio tracks before upload to save bandwidth.

---

## 3. Technology Radar

We are actively evaluating the following technologies for future inclusion:

| Technology | Status | Potential Use Case |
| :--- | :--- | :--- |
| **Gemini Live API** | 🟢 Adopting | Real-time low-latency voice conversation with the transcript context. |
| **WASM (FFmpeg)** | 🟡 Assessing | Client-side audio extraction from video files. |
| **Vector Database (Local)** | 🟡 Assessing | Deeper semantic search across the entire transcription history (e.g., "Find where we discussed Q3 goals"). |
| **React Native** | 🔴 Hold | Native mobile apps (currently focusing on PWA). |
