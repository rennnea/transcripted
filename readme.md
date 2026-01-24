
# TranscriptedAI - AI-Powered Audio Transcription

<p align="center">
  <img src="https://storage.googleapis.com/aai-web-template-files/55a68cc7-4886-4435-a6a9-839e9f167e63_app-preview.png" alt="TranscriptedAI Application Preview" width="600"/>
</p>

TranscriptedAI is a modern web application that leverages the power of the Google Gemini API to provide fast, accurate, and insightful transcriptions of audio files. It's designed with a clean, intuitive user interface to streamline the process of converting speech to text and extracting valuable information.

## ✨ Key Features

- **Accurate Audio Transcription**: Upload various audio formats (MP3, WAV, M4A, etc.) and receive a high-quality text transcription.
- **⚡ Progressive Insight Loading**: Experience a faster workflow with our parallel processing pipeline. Initial transcription text appears instantly, followed immediately by fast insights like sentiment and entities, while the more complex summary is generated in the background.
- **Speaker Diarization**: The AI automatically identifies and labels different speakers in the conversation for clear, readable output.
- **AI-Powered Summarization**: Generate concise summaries of your transcriptions. Customize the summary's **length**, **detail level**, and **structure** (paragraph, bullets, key-value).
- **Global Library Search**: A powerful semantic search allows you to find relevant transcripts across your entire history using keywords, themes, or concepts.
- **Factual Grounding**: Optionally enable Google Search integration to ground the summary in up-to-date, factual information, complete with source citations.
- **Insightful Analytics**:
    - **Entity Extraction**: Automatically identifies and categorizes key entities like people, organizations, and locations.
    - **Sentiment Analysis**: Determines the overall emotional tone of the conversation.
    - **Visual Data**: Interactive charts showing sentiment distribution over time and speaker dominance.
- **Sentiment Lab**: An experimental, interactive playground for real-time text analysis visualization.
- **Transcription Editor**: Easily edit and refine the generated transcript directly within the app.
- **Export Options**: Download the final transcription as a `.txt` file or generate a professional **PDF report** containing the summary, insights, and full text.
- **Auto-Save History**: Automatically saves your transcription sessions to the local browser database (IndexedDB), ensuring you never lose your work.
- **Dark Mode**: A beautiful, hand-tuned dark theme for comfortable use in low-light environments.
- **Responsive Design**: A functional and aesthetic interface that works seamlessly on both desktop and mobile devices.
- **Session Caching**: Transcriptions are cached on Gemini's servers for a short period, allowing for faster, cheaper follow-up questions in the AI Chat.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **AI Model**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Local Database**: [Dexie.js](https://dexie.org/) (a wrapper for IndexedDB)
- **Visualization**: [D3.js](https://d3js.org/) & [Framer Motion](https://www.framer.com/motion/) for charts and animations.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build/Dev Environment**: Vite-like setup using native ES Modules and an import map.

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher is recommended)
- A Google Gemini API Key. You can get one from [Google AI Studio](https://makersuite.google.com/).

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/transcripted-ai.git
    cd transcripted-ai
    ```

2.  **Set up your API Key:**
    The application loads the Gemini API key from `process.env.API_KEY`. You will need to configure this in your development environment.

3.  **Install dependencies and run:**
    This project is configured to run in a specific web-based development environment. Simply load the project files, ensure your `API_KEY` is set as an environment variable, and the application will be served automatically.

## 📂 Project Structure

The codebase is organized into a clean, feature-driven architecture:

```
/
├── components/                 # UI components
│   ├── charts/                 # D3.js chart components
│   ├── common/                 # Shared components (icons, etc.)
│   ├── layout/                 # Layout components (Header, Sidebar)
│   ├── Chatbot.tsx
│   ├── GlobalSearchView.tsx
│   └── ...
├── hooks/                      # Custom React Hooks for stateful logic
│   ├── useGeminiPipeline.ts    # Manages the entire transcription process
│   ├── useChatSession.ts       # Manages the AI chat state
│   └── useHistory.ts           # Manages history state from IndexedDB
├── services/                   # Modules for external API calls
│   └── gemini/                 # Modular Gemini service
│       ├── orchestrator.ts     # Main pipeline logic
│       ├── api.ts              # Direct API call functions
│       ├── client.ts           # Gemini client initialization
│       └── prompts.ts          # Prompt and schema definitions
├── utils/                      # Utility and helper functions
│   ├── db.ts                   # Dexie.js IndexedDB service
│   └── ...
├── types.ts                    # TypeScript type definitions
├── App.tsx                     # Main application component & state manager
└── index.html                  # Entry point HTML and Tailwind config
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". See `docs/CONTRIBUTING.md` for more details.

## 📄 License

Distributed under the GPL-3.0 License. See `LICENSE` for more information.