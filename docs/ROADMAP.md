# Strategic Roadmap

This document outlines the strategic direction and phased release plan for **TranscriptedAI**. It serves as a high-level guide for developers and stakeholders to understand the evolution of the product from a simple file transcriber to a comprehensive audio intelligence platform.

## 1. Product Vision

**"To become the most accessible and insightful interface for extracting intelligence from spoken audio."**

We aim to move beyond simple text transcription by leveraging Generative AI to provide deep context, factual verification, and interactive reasoning over audio data, all within a privacy-first, client-side architecture.

---

## 2. Phased Release Plan

### Phase 1: Interactive Fundamentals (v1.1)
*Target: Q2 2025*

The focus of this phase is to bridge the gap between static text and audio playback, making the transcription "alive" and editable.

- **Microphone Input & Live Streaming (`F-01`)**
  - **Goal:** Allow users to record meetings or voice notes directly in the browser.
  - **Tech:** Web Audio API + Gemini Live API (WebSocket streaming).
  
- **Audio Player Integration (`F-02`)**
  - **Goal:** Connect the text to the sound. Clicking a sentence should play that specific audio segment.
  - **Tech:** Waveform visualization (Wavesurfer.js) synchronized with timestamp data.

- **Bring Your Own Key (BYOK) Security (`T-04`)**
  - **Goal:** Remove the hardcoded API key for production readiness.
  - **Implementation:** Secure local storage of user keys with validation checks.

- **System-Aware Dark Mode (`UX-01`)**
  - **Goal:** Improve accessibility and reduce eye strain for night-time usage.
  - **Design:** Inverse "OLED" palette while maintaining the "Organic" design language.

### Phase 2: Professional Tools (v1.5)
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

- **Mobile Interface Overhaul (`UX-03`)**
  - **Goal:** Full feature parity on mobile.
  - **Design:** Swipeable bottom drawers for Insights and Settings.

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
| **Vector Database (Local)** | 🟡 Assessing | Semantic search across the entire transcription history (e.g., "Find where we discussed Q3 goals"). |
| **React Native** | 🔴 Hold | Native mobile apps (currently focusing on PWA). |

---

## 4. Success Metrics

We measure the success of roadmap items based on:
1.  **Transcription Accuracy:** WER (Word Error Rate) reduction via Custom Vocabulary.
2.  **User Retention:** Return rate after implementing History Persistence.
3.  **Engagement:** Interaction rate with the "Insights Panel" and "Chatbot".
