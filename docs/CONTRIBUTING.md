
# Contributing to TranscriptedAI

Thank you for your interest in contributing to TranscriptedAI! This document outlines the standards and workflows required to maintain the quality and stability of this application.

## 1. Development Environment

### Prerequisites
*   **Node.js**: v18.x or higher.
*   **API Key**: A valid Google Gemini API Key set in your environment as `API_KEY`.

### Setup
1.  Clone the repository.
2.  Install dependencies (if using a local setup).
3.  Ensure `process.env.API_KEY` is available in your build context.

---

## 2. Google GenAI SDK Guidelines (Strict)

This project relies on `@google/genai`. Developers **MUST** adhere to the following rules:

### Initialization
*   **Always** import the client instance from `services/gemini/client.ts`. Do not initialize a new one.
*   **Never** hardcode API keys or request them via UI input fields (until BYOK is implemented).

### Model Selection
Do not use deprecated model names. Use the following models for their designated tasks:
*   **Transcription & Indexing (Fast):** `gemini-2.5-flash`
*   **Analysis (Complex Reasoning):** `gemini-3-pro-preview`
*   **Chat:** `gemini-2.5-flash` (with cache) or `gemini-3-pro-preview` (fallback).

### Response Handling
*   **Text:** Access `.text` directly on the response object. Do NOT call `.text()`.
*   **JSON:** Use the `cleanJsonResponse` helper in `services/gemini/api.ts` to strip Markdown fences before parsing.

---

## 3. Coding Standards

### React & TypeScript
*   **Functional Components:** Use `React.FC<Props>` for all components.
*   **Hooks for Logic:** Encapsulate complex stateful logic in custom hooks (see `hooks/` directory).
*   **Strict Typing:** Avoid `any` wherever possible. Define shared interfaces in `types.ts`.

### Project Structure
- **Services:** All Gemini API interactions must be defined within the `services/gemini/` directory.
- **Components:** Keep components focused. Break large components into smaller, reusable ones.
- **State:** Keep state as local as possible. Lift to `App.tsx` only for global state that affects multiple, disconnected views.

### Styling (Tailwind CSS)
*   **Utility First:** Use utility classes for layout and spacing.
*   **Theme Colors:** Use the custom `khaki`, `beige`, and `brown` palette defined in `index.html`.
*   **Responsive:** Mobile-first approach. Ensure layouts are functional and aesthetic on small screens.

---

## 4. Git Workflow

1.  **Branching:** Create a feature branch for your work (e.g., `feature/microphone-input`).
2.  **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add microphone support`, `fix: handle 429 errors`).
3.  **Testing:** Run the internal `TestRunner` (available in the Sidebar) before submitting a Pull Request.

## 5. Definition of Done
A feature is considered "Done" when:
1.  It implements the requested functionality.
2.  It does not break existing `TestRunner` suites.
3.  It is fully responsive and works well on mobile.
4.  It adheres to the UI design language in both light and dark modes.
5.  It handles API errors gracefully.
