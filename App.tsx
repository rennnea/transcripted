
import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import FileUploader from './components/FileUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import { FileInfo } from './components/FileInfo';
import Sidebar from './components/layout/Sidebar';
import InsightsPanel from './components/InsightsPanel';
import { TranscriptionResult, HistoryItem } from './types';
import TestRunner from './components/TestRunner';
import HistoryView from './components/HistoryView';
import Chatbot from './components/Chatbot';
import SentimentLab from './components/SentimentLab';
import GlobalSearchView from './components/GlobalSearchView';
import { StatusPill } from './components/common/StatusPill';
import { useGeminiPipeline } from './hooks/useGeminiPipeline';
import { getAudioDuration } from './utils/fileUtils';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'landing' | 'upload' | 'transcribing' | 'result' | 'history' | 'chatbot' | 'sentiment-lab' | 'global-search'>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [estimatedTokens, setEstimatedTokens] = useState<number | null>(null);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInsightsPanelMinimized, setIsInsightsPanelMinimized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Settings State
  const [language, setLanguage] = useState('en-US');
  const [enableDiarization, setEnableDiarization] = useState(false);
  const [enableSummary, setEnableSummary] = useState(true);
  const [enableEntityExtraction, setEnableEntityExtraction] = useState(true);
  const [enableSentimentAnalysis, setEnableSentimentAnalysis] = useState(true);
  const [enableSearchGrounding, setEnableSearchGrounding] = useState(true);
  const [summaryLength, setSummaryLength] = useState('Medium');
  const [summaryDetail, setSummaryDetail] = useState('Detailed');
  const [summaryStructure, setSummaryStructure] = useState('Bullets');
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Logic extracted to hook
  const { 
      result: transcriptionResult, 
      setResult: setTranscriptionResult,
      isLoading, 
      isAnalyzing, 
      error, 
      progress, 
      activeCacheName, 
      startPipeline, 
      reset,
      loadExternalResult 
  } = useGeminiPipeline();

  const handleGetStarted = () => setAppState('upload');

  const handleFileSelect = async (file: File) => {
    setAudioFile(file);
    reset();
    
    // Simple estimation: 1 second audio ~ 8 tokens (very rough approximation)
    const duration = await getAudioDuration(file);
    setEstimatedTokens(Math.round(duration * 8));
    
    setAppState('transcribing');
  };

  const handleClear = () => {
    setAudioFile(null);
    setEstimatedTokens(null);
    reset();
    setAppState('upload');
  };
  
  const handleShowDashboard = () => {
    if (appState === 'chatbot' || appState === 'sentiment-lab' || appState === 'global-search') {
        setAppState(transcriptionResult ? 'result' : 'upload');
    } else {
        handleClear();
    }
  };
  
  const handleShowHistory = () => setAppState('history');
  const handleShowSentimentLab = () => setAppState('sentiment-lab');
  
  const handleShowChatbot = () => {
      if (transcriptionResult) {
          setAppState('chatbot');
      }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      setAppState('global-search');
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    const mockFile: File = {
      name: item.fileInfo.name,
      size: item.fileInfo.size,
      type: 'audio/mp3', 
      lastModified: item.fileInfo.lastModified,
    } as File;

    setAudioFile(mockFile);
    
    // Use the hook to load data
    let cacheName: string | undefined = undefined;
    if (item.geminiCacheExpiry && item.geminiCacheExpiry > Date.now()) {
        cacheName = item.geminiCacheName;
    }
    loadExternalResult(item.result, cacheName);
    
    setAppState('result');
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;

    const transcriptionSettings = {
      language, enableDiarization, enableSummary, summaryLength, summaryDetail,
      summaryStructure, enableEntityExtraction, enableSentimentAnalysis, enableSearchGrounding, autoSave: autoSaveHistory
    };

    await startPipeline(audioFile, transcriptionSettings);
    setAppState('result');
  };
  
  const handleSaveTranscription = (newResult: TranscriptionResult) => {
    if (transcriptionResult && audioFile) {
      setTranscriptionResult(newResult);
    }
  };

  const renderContent = () => {
    const mainContentContainer = (children: React.ReactNode, fullWidth = false) => (
      <div className={`${fullWidth ? 'w-full max-w-7xl' : 'w-full max-w-4xl'} mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-6 md:p-10 transition-all duration-500`}>
        {children}
      </div>
    );

    switch (appState) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'upload':
        return mainContentContainer(<FileUploader onFileSelect={handleFileSelect} />);
       case 'history':
        return mainContentContainer(
          <HistoryView 
            onSelectItem={handleSelectHistoryItem} 
            onReturnToDashboard={handleClear}
          />
        );
      case 'global-search':
        return mainContentContainer(
          <GlobalSearchView 
            query={searchQuery}
            onSelectItem={handleSelectHistoryItem}
          />, true
        );
      case 'sentiment-lab':
        return <SentimentLab />;
      case 'chatbot':
        return transcriptionResult ? (
            <Chatbot 
                transcriptionText={transcriptionResult.transcription.map(s => `${s.speaker}: ${s.text}`).join('\n')}
                cacheName={activeCacheName}
                onClose={() => setAppState('result')}
            />
        ) : null;
      case 'result':
      case 'transcribing':
        // If we are in 'transcribing' mode but not loading yet (settings view)
        if (appState === 'transcribing' && !isLoading && !transcriptionResult) {
             return (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full max-w-7xl mx-auto animate-fade-in-up">
                <div className="lg:col-span-3 flex flex-col justify-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-8">
                  <FileInfo file={audioFile} />
                   <div className="flex flex-col sm:flex-row justify-start mt-8 space-y-3 sm:space-y-0 sm:space-x-4">
                      <button onClick={handleTranscribe} disabled={isLoading} className="w-full sm:w-auto px-8 py-3 bg-khaki-600 text-white font-bold rounded-xl hover:bg-khaki-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-khaki-300 transition-all duration-300 disabled:bg-brown-400 disabled:cursor-not-allowed disabled:transform-none">
                        Transcribe Audio
                      </button>
                      <button onClick={handleClear} className="w-full sm:w-auto px-8 py-3 bg-beige-200/50 dark:bg-zinc-800 text-brown-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-beige-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-4 focus:ring-beige-200 transition-all duration-300">
                        Change File
                      </button>
                    </div>
                </div>
                <div className="lg:col-span-2">
                  <Settings
                    language={language} onLanguageChange={setLanguage}
                    enableDiarization={enableDiarization} onDiarizationChange={setEnableDiarization}
                    enableSummary={enableSummary} onSummaryChange={setEnableSummary}
                    summaryLength={summaryLength} onSummaryLengthChange={setSummaryLength}
                    summaryDetail={summaryDetail} onSummaryDetailChange={setSummaryDetail}
                    summaryStructure={summaryStructure} onSummaryStructureChange={setSummaryStructure}
                    enableEntityExtraction={enableEntityExtraction} onEntityExtractionChange={setEnableEntityExtraction}
                    enableSentimentAnalysis={enableSentimentAnalysis} onSentimentAnalysisChange={setEnableSentimentAnalysis}
                    enableSearchGrounding={enableSearchGrounding} onSearchGroundingChange={setEnableSearchGrounding}
                    autoSaveHistory={autoSaveHistory} onAutoSaveHistoryChange={setAutoSaveHistory}
                  />
                </div>
              </div>
            );
        }

        // Show loading or result
        return (
            <>
               <TranscriptionDisplay
                  audioFile={audioFile}
                  isLoading={isLoading}
                  transcription={transcriptionResult}
                  error={error}
                  onClear={handleClear}
                  onSave={handleSaveTranscription}
                  progress={progress}
                />
            </>
        );
      default:
        return null;
    }
  }

  const mainPanelMargin = isInsightsPanelMinimized ? 'lg:mr-16' : 'lg:mr-[380px]';
  const shouldShowPanel = (appState === 'result' || appState === 'chatbot') && transcriptionResult;

  const mainClasses = appState === 'sentiment-lab' 
    ? 'flex-1 overflow-x-hidden overflow-y-auto' 
    : `flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 transition-all duration-500 ${shouldShowPanel ? mainPanelMargin : ''}`;

  return (
    <div className="flex h-screen bg-[#FDFBF7] dark:bg-zinc-950 text-brown-800 dark:text-zinc-100 font-sans selection:bg-khaki-200 transition-colors duration-500">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        estimatedTokens={estimatedTokens}
        onRunTests={() => setShowTestRunner(true)}
        onShowDashboard={handleShowDashboard}
        onShowHistory={handleShowHistory}
        onShowChatbot={handleShowChatbot}
        onShowSentimentLab={handleShowSentimentLab}
        activeView={appState}
        isResultAvailable={!!transcriptionResult}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isDarkMode={isDarkMode} 
          onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
          onSearch={handleSearch}
        />
        <main className={mainClasses}>
          {renderContent()}
        </main>
        {isAnalyzing && <StatusPill />}
      </div>
      {shouldShowPanel && (
        <InsightsPanel 
            transcription={transcriptionResult} 
            isLoading={isAnalyzing}
            isMinimized={isInsightsPanelMinimized}
            onToggleMinimize={() => setIsInsightsPanelMinimized(p => !p)}
        />
      )}
      {showTestRunner && <TestRunner onClose={() => setShowTestRunner(false)} />}
    </div>
  );
};

export default App;
