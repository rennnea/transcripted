# Contributing to TranscriptedAI

Thank you for your interest in contributing to TranscriptedAI! This document outlines the standards and workflows required to maintain the quality and stability of this application.

## 1. Development Environment

### Prerequisites
*   **Node.js**: v18.x or higher.
*   **API Key**: A valid Google Gemini API Key set in your environment as `[[YOUR_API_KEY]]`.

### Setup
1.  Clone the repository.
2.  Install dependencies (if using a local setup).
3.  Ensure `process.env.[[YOUR_API_KEY]]` is available in your build context.

---

## 2. Google GenAI SDK Guidelines (Strict)

This project relies on `@google/genai`. Developers **MUST** adhere to the following rules to prevent breaking changes:

### Initialization
*   **Always** import from `@google/genai`.
*   **Always** initialize using the named parameter: `new GoogleGenAI({ apiKey: process.env.[[YOUR_API_KEY]] })`.
*   **Never** hardcode API keys or request them via UI input fields (until BYOK is implemented).

### Model Selection
Do not use deprecated model names. Use the following constants:
*   **Transcription (Fast):** `gemini-2.5-flash`
*   **Analysis (Complex):** `gemini-3-pro-preview`
*   **Search Grounding:** `gemini-2.5-flash` (or `gemini-3-pro-preview` if tool use requires it).

### Response Handling
*   **Text:** Access `.text` directly on the response object. Do NOT call `.text()`.
*   **JSON:** When expecting JSON, ensure the prompt explicitly requests it and use `cleanJsonResponse` helper to strip Markdown fences.

---

## 3. Coding Standards

### React & TypeScript
*   **Functional Components:** Use `React.FC<Props>` for all components.
*   **Strict Typing:** Avoid `any` wherever possible. Define interfaces in `types.ts`.
*   **State Management:** Keep state local to views where possible; lift to `App.tsx` only for global data (User, Transcription Result).

### Styling (Tailwind CSS)
*   **Utility First:** Use utility classes for layout and spacing.
*   **Theme Colors:** Use the custom `khaki`, `beige`, and `brown` palette defined in `index.html`.
*   **Responsive:** Mobile-first approach. Ensure layouts stack correctly on `< md` screens.

---

## 4. Git Workflow

1.  **Branching:** Create a feature branch for your work (e.g., `feature/microphone-input`).
2.  **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add microphone support`, `fix: handle 429 errors`).
3.  **Testing:** Run the internal `TestRunner` (available in the Sidebar) before submitting a Pull Request.

## 5. Definition of Done
A feature is considered "Done" when:
1.  It implements the requested functionality.
2.  It does not break existing `TestRunner` suites.
3.  It follows the UI design language ("Organic Intelligence").
4.  It handles API errors gracefully (no white screens).
