
# TranscriptedAI - AI-Powered Audio Transcription

<p align="center">
  <img src="https://storage.googleapis.com/aai-web-template-files/55a68cc7-4886-4435-a6a9-839e9f167e63_app-preview.png" alt="TranscriptedAI Application Preview" width="600"/>
</p>

TranscriptedAI is a modern web application that leverages the power of the Google Gemini API to provide fast, accurate, and insightful transcriptions of audio files. It's designed with a clean, intuitive user interface to streamline the process of converting speech to text and extracting valuable information.

## ✨ Key Features

- **Accurate Audio Transcription**: Upload various audio formats (MP3, WAV, M4A, etc.) and receive a high-quality text transcription.
- **Speaker Diarization**: The AI automatically identifies and labels different speakers in the conversation for clear, readable output.
- **AI-Powered Summarization**: Generate concise summaries of your transcriptions. Customize the summary's **length**, **detail level**, and **structure** (paragraph, bullets, key-value).
- **Factual Grounding**: Optionally enable Google Search integration to ground the summary in up-to-date, factual information, complete with source citations.
- **Insightful Analytics**:
    - **Entity Extraction**: Automatically identifies and categorizes key entities like people, organizations, and locations.
    - **Sentiment Analysis**: Determines the overall emotional tone of the conversation (Positive, Negative, Neutral).
- **Interactive Insights Panel**: Visualize speaker contribution and review grounding sources in a dedicated side panel.
- **Transcription Editor**: Easily edit and refine the generated transcript directly within the app.
- **Download & Copy**: Export the final transcription as a `.txt` file or copy it to your clipboard with a single click.
- **Responsive Design**: A beautiful and functional interface that works seamlessly on both desktop and mobile devices.
- **Session Caching**: Transcriptions are cached in the browser's session storage to prevent re-processing the same file and settings.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **AI Model**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
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

The codebase is organized to be clean and maintainable:

```
/
├── components/             # Reusable React components
│   ├── charts/             # Chart components for analytics
│   ├── icons/              # SVG icon components
│   ├── AppPreview.tsx      # Landing page UI preview
│   ├── FileUploader.tsx    # Drag-and-drop file input
│   ├── InsightsPanel.tsx   # Side panel for analytics
│   ├── LandingPage.tsx     # The initial page for new users
│   ├── ProgressIndicator.tsx # Staged loading screen
│   └── ...
├── services/               # Modules for external API calls
│   └── geminiService.ts    # Logic for interacting with the Gemini API
├── utils/                  # Utility and helper functions
│   └── fileUtils.ts        # File processing helpers
├── types.ts                # TypeScript type definitions
├── App.tsx                 # Main application component with state management
├── index.tsx               # Entry point for the React application
└── index.html              # Main HTML file
```

## 🗺️ Future Development Roadmap

This project has a strong foundation, but there are many exciting features that could be added next:

-   **Real-time Microphone Transcription**: Implement live audio transcription using the device microphone, potentially leveraging the Gemini Live API for real-time, low-latency responses.
-   **User Accounts & History**: Add user authentication (e.g., using Firebase Auth) to allow users to save, view, and manage their transcription history in a database (like Firestore).
-   **Advanced Analytics Dashboard**: Expand the "Insights" panel into a full dashboard with more visualizations, such as sentiment trends over time, word frequency clouds, and talk-to-listen ratio analysis.
-   **Video File Support**: Allow users to upload video files, automatically extract the audio track, and transcribe it.
-   **Custom Vocabulary**: Add a feature for users to input a list of custom words, names, or jargon to improve transcription accuracy for specialized topics.
-   **Additional Export Formats**: Provide options to download transcriptions in different formats, such as PDF, DOCX, or SRT for video subtitles.
-   **Team Collaboration**: Introduce a workspace or team feature where multiple users can upload, view, and comment on a shared pool of transcripts.
-   **Internationalization (i18n)**: Translate the application's UI into multiple languages to make it accessible to a global audience.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
