# Architecture Documentation

## Overview

**Transcripted** is an AI-powered audio transcription web application that converts audio files into accurate, speaker-separated text with intelligent analysis capabilities including summarization, sentiment analysis, and entity extraction.

---

## Technology Stack

### Frontend

- **Framework**: React 19.2.3
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (via CDN)
- **UI Components**: Custom React components
- **Fonts**: Google Fonts (Inter, Poppins)
- **State Management**: React Hooks (useState, useCallback)
- **Module System**: ESNext with ES2022 target

### Backend / AI Services

- **AI Provider**: Google Gemini AI
- **AI SDK**: @google/genai v1.33.0
- **API Integration**: RESTful API calls to Gemini AI
- **Audio Processing**: Browser-native Audio API for metadata extraction
- **File Processing**: Base64 encoding for file transmission

### Database / Storage

- **Primary Storage**: Browser LocalStorage
- **Caching Layer**: Custom cache service (cacheService.ts)
- **Data Persistence**: Client-side caching for transcription history
- **Session Management**: In-memory state management via React

### Development Tools

- **Package Manager**: npm
- **Module Bundler**: Vite with React plugin (@vitejs/plugin-react)
- **Type System**: TypeScript with experimental decorators
- **Module Resolution**: Bundler resolution strategy
- **Path Aliases**: `@/*` mapped to project root

---

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer (Browser)"
        A[User Interface<br/>React Components] --> B[State Management<br/>React Hooks]
        B --> C[File Upload Handler]
        B --> D[Settings Manager]
        B --> E[History Manager]
        B --> F[Chatbot Interface]
    end

    subgraph "Service Layer"
        G[Gemini Service<br/>geminiService.ts] --> H[File Utils]
        G --> I[Cache Service]
        G --> J[Analytics Utils]
        G --> K[Progress Utils]
    end

    subgraph "External Services"
        L[Google Gemini AI API<br/>@google/genai]
    end

    subgraph "Storage Layer"
        M[LocalStorage<br/>Browser Cache]
        N[Session State<br/>In-Memory]
    end

    C -->|Upload Audio| H
    H -->|Convert to Base64| G
    D -->|Configuration| G
    G -->|API Request| L
    L -->|AI Response| G
    G -->|Store Result| I
    I -->|Persist| M
    E -->|Retrieve History| I
    I -->|Load from| M
    B -->|Update| N
    G -->|Progress Updates| K
    K -->|Notify| B
    F -->|Chat Query| G
    G -->|AI Response| F
    J -->|Analyze Result| B
```

### Component Architecture

```mermaid
graph LR
    subgraph "Main Application"
        App[App.tsx<br/>Main Container]
    end

    subgraph "Layout Components"
        Header[Header.tsx]
        Sidebar[Sidebar.tsx]
        LandingPage[LandingPage.tsx]
    end

    subgraph "Feature Components"
        FileUploader[FileUploader.tsx]
        TranscriptionDisplay[TranscriptionDisplay.tsx]
        Settings[Settings.tsx]
        HistoryView[HistoryView.tsx]
        Chatbot[Chatbot.tsx]
        InsightsPanel[InsightsPanel.tsx]
    end

    subgraph "UI Components"
        FileInfo[FileInfo.tsx]
        ProgressIndicator[ProgressIndicator.tsx]
        Charts[Charts Components]
        Icons[Icon Components]
    end

    subgraph "Utilities & Services"
        GeminiService[geminiService.ts]
        CacheService[cacheService.ts]
        FileUtils[fileUtils.ts]
        AnalyticsUtils[analyticsUtils.ts]
    end

    App --> Header
    App --> Sidebar
    App --> LandingPage
    App --> FileUploader
    App --> TranscriptionDisplay
    App --> Settings
    App --> HistoryView
    App --> Chatbot
    App --> InsightsPanel

    FileUploader --> FileInfo
    TranscriptionDisplay --> Charts
    App --> ProgressIndicator

    FileUploader --> FileUtils
    App --> GeminiService
    App --> CacheService
    TranscriptionDisplay --> AnalyticsUtils
    GeminiService --> CacheService
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant State as App State
    participant FileUtil as File Utils
    participant Gemini as Gemini Service
    participant API as Gemini AI API
    participant Cache as Cache Service
    participant Storage as LocalStorage

    User->>UI: Upload Audio File
    UI->>State: Update audioFile state
    User->>UI: Configure Settings
    UI->>State: Update settings state
    User->>UI: Click Transcribe
    
    UI->>State: Set isLoading = true
    State->>FileUtil: Convert file to Base64
    FileUtil-->>State: Base64 data
    
    State->>Cache: Check cache for existing result
    Cache->>Storage: Query by cache key
    
    alt Cache Hit
        Storage-->>Cache: Cached result
        Cache-->>State: Return cached result
        State->>UI: Display cached result
    else Cache Miss
        State->>Gemini: transcribeAudio(file, options)
        Gemini->>API: Send audio + configuration
        API-->>Gemini: Transcription result
        Gemini-->>State: Return result
        
        State->>Cache: Store result
        Cache->>Storage: Save to LocalStorage
        
        State->>UI: Display new result
    end
    
    State->>State: Set isLoading = false
    UI->>User: Show transcription
```

---

## Core Features & Architecture

### 1. Audio Transcription
- **Input**: Audio files (MP3, WAV, M4A, etc.)
- **Processing**: Google Gemini AI with structured output schema
- **Output**: Timestamped, speaker-labeled transcription segments

### 2. Speaker Diarization
- **Feature**: Automatic speaker identification and labeling
- **Configuration**: Toggle-able via settings
- **Implementation**: Gemini AI native diarization capabilities

### 3. AI Summarization
- **Options**: Configurable length (Short, Medium, Long)
- **Detail Levels**: Concise, Balanced, Detailed
- **Formats**: Bullets, Paragraphs, Structured
- **Implementation**: Gemini AI text generation

### 4. Sentiment Analysis
- **Overall Sentiment**: Global emotional tone analysis
- **Trend Analysis**: Chronological sentiment progression
- **Visualization**: Charts and graphs via custom chart components

### 5. Entity Extraction
- **Categories**: People, Organizations, Locations, Dates, Topics
- **Implementation**: Gemini AI entity recognition
- **Display**: Categorized entity lists in insights panel

### 6. Search Grounding
- **Feature**: Optional web search integration for context
- **Implementation**: Gemini AI search grounding capabilities

### 7. Chatbot Interface
- **Purpose**: Interactive Q&A about transcription content
- **Context**: Maintains transcription context for queries
- **Implementation**: Gemini AI conversational model

### 8. History Management
- **Storage**: LocalStorage-based caching
- **Key Generation**: Hash-based cache keys from file + options
- **Retrieval**: Fast lookup by cache key
- **Display**: Historical transcriptions in dedicated view

---

## Security Considerations

### API Key Management
- **Storage**: Environment variables (.env.local)
- **Build-time Injection**: Vite configuration defines process.env variables
- **Client Protection**: API key exposed in client (note: consider backend proxy for production)

### File Handling
- **Validation**: File type and size validation before processing
- **Processing**: Client-side Base64 encoding
- **Transmission**: Direct to Gemini AI API

### Data Privacy
- **Local Storage**: All history stored client-side
- **No Backend**: No server-side data persistence
- **User Control**: User can clear cache/history

---

## Performance Optimizations

### Caching Strategy
- **Cache Key**: Generated from file metadata + transcription options
- **Hit Rate**: Prevents duplicate API calls for same file/settings
- **Storage**: Browser LocalStorage with size limitations

### Progress Indication
- **Simulated Progress**: Multi-stage progress updates during transcription
- **User Feedback**: Real-time progress bar with stage descriptions
- **UX Enhancement**: Keeps users informed during long operations

### Code Splitting
- **Module Loading**: ES modules with dynamic imports
- **Bundle Optimization**: Vite build optimization
- **Asset Loading**: Lazy loading where applicable

---

## Deployment Architecture

### Development Environment
- **Dev Server**: Vite dev server on port 3000
- **Host**: 0.0.0.0 (accessible on network)
- **Hot Reload**: Automatic on file changes

### Production Build
- **Build Command**: `npm run build`
- **Output**: Optimized static assets
- **Hosting**: Static file hosting (Vercel, Netlify, GitHub Pages compatible)
- **Preview**: `npm run preview` for production build testing

### Environment Configuration
- **API Keys**: .env.local file (not committed to repo)
- **Build Variables**: Injected at build time via Vite
- **Runtime**: Client-side environment variable access

---

## Future Architecture Considerations

### Scalability
- **Backend API**: Consider implementing backend proxy for API key security
- **Database**: Consider server-side database for cross-device history sync
- **File Storage**: Consider cloud storage for large audio files

### Enhanced Features
- **Real-time Transcription**: WebSocket integration for live audio
- **Multi-language Support**: Enhanced language detection and UI i18n
- **Collaboration**: Multi-user transcription editing
- **Export Formats**: PDF, DOCX, SRT subtitle generation

### Performance
- **Worker Threads**: Offload heavy processing to Web Workers
- **Streaming**: Implement streaming for large files
- **CDN**: Utilize CDN for static assets in production

---

## Technology Decisions Rationale

### Why React?
- Component reusability and modularity
- Rich ecosystem and community support
- Excellent TypeScript integration
- Virtual DOM for efficient updates

### Why Vite?
- Fast development server with HMR
- Optimized production builds
- Native ES modules support
- Simple configuration

### Why Tailwind CSS?
- Rapid UI development
- Consistent design system
- Small production bundle (via CDN)
- Utility-first approach

### Why Gemini AI?
- State-of-the-art transcription accuracy
- Built-in diarization capabilities
- Multi-modal AI features
- Structured output support

### Why LocalStorage?
- No backend infrastructure needed
- Fast client-side access
- Sufficient for MVP and demo purposes
- Zero-latency cache retrieval
