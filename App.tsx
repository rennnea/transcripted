
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import Settings from './components/Settings';
import { processAudioPipeline } from './services/geminiService';
import LandingPage from './components/LandingPage';
import { FileInfo } from './components/FileInfo';
import Sidebar from './components/Sidebar';
import InsightsPanel from './components/InsightsPanel';
import { TranscriptionResult, HistoryItem, RawTranscriptionData, AnalysisData } from './types';
import TestRunner from './components/TestRunner';
import { db, saveTranscription, getTranscription } from './utils/db';
import HistoryView from './components/HistoryView';
import Chatbot from './components/Chatbot';
import { generateCacheKey } from './utils/cacheUtils';
import { simulateTranscriptionProgress } from './utils/progressUtils';
import { StatusPill } from './components/StatusPill';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'landing' | 'upload' | 'transcribing' | 'result' | 'history' | 'chatbot'>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // State for progressive loading
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeCacheName, setActiveCacheName] = useState<string | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressState, setProgressState] = useState({ stage: '', percentage: 0 });
  const [estimatedTokens, setEstimatedTokens] = useState<number | null>(null);
  const [showTestRunner, setShowTestRunner] = useState(false);

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
  
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.onloadedmetadata = () => {
            resolve(audio.duration);
            URL.revokeObjectURL(audio.src);
        };
        audio.onerror = () => { resolve(30); }
    });
  };

  const handleGetStarted = () => setAppState('upload');

  const handleFileSelect = async (file: File) => {
    setAudioFile(file);
    setTranscriptionResult(null);
    setActiveCacheName(undefined);
    setError(null);
    const duration = await getAudioDuration(file);
    setEstimatedTokens(Math.round(duration * 8));
    setAppState('transcribing');
  };

  const handleClear = () => {
    setAudioFile(null);
    setTranscriptionResult(null);
    setActiveCacheName(undefined);
    setIsLoading(false);
    setIsAnalyzing(false);
    setError(null);
    setEstimatedTokens(null);
    setAppState('upload');
  };
  
  const handleShowDashboard = () => {
    if (appState === 'chatbot') {
        setAppState('result');
    } else {
        handleClear();
    }
  };
  
  const handleShowHistory = () => {
    setError(null);
    setAppState('history');
  };
  
  const handleShowChatbot = () => {
      if (transcriptionResult) {
          setAppState('chatbot');
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
    setTranscriptionResult(item.result);
    // Check if the cache is still valid
    if (item.geminiCacheExpiry && item.geminiCacheExpiry > Date.now()) {
        setActiveCacheName(item.geminiCacheName);
    } else {
        setActiveCacheName(undefined);
    }
    setIsAnalyzing(false);
    setError(null);
    setIsLoading(false);
    setAppState('result');
  };

  const handleTranscribe = useCallback(async () => {
    if (!audioFile) {
      setError("Please select an audio file first.");
      return;
    }

    const transcriptionSettings = {
      language, enableDiarization, enableSummary, summaryLength, summaryDetail,
      summaryStructure, enableEntityExtraction, enableSentimentAnalysis, enableSearchGrounding
    };

    const cacheKey = generateCacheKey(audioFile, transcriptionSettings);
    
    setIsLoading(true);
    setIsAnalyzing(false);
    setError(null);
    setTranscriptionResult(null);

    // 1. Check DB Cache
    try {
        const cachedRecord = await getTranscription(cacheKey);
        if (cachedRecord) {
            console.log("Loading transcription from IndexedDB cache.");
            setProgressState({ stage: 'Loading from cache...', percentage: 100 });
            
            setTimeout(() => {
                setTranscriptionResult(cachedRecord.transcriptionData);
                if (cachedRecord.geminiCacheExpiry && cachedRecord.geminiCacheExpiry > Date.now()) {
                    setActiveCacheName(cachedRecord.geminiCacheName);
                }
                setAppState('result');
                setIsLoading(false);
            }, 500);
            return;
        }
    } catch (e) {
        console.warn("DB Read Error:", e);
    }

    // 2. Start Pipeline
    let stopProgressSimulation: (() => void) | null = null;
    try {
      console.log("Starting transcription pipeline.");
      const audioDuration = await getAudioDuration(audioFile);
      stopProgressSimulation = simulateTranscriptionProgress(audioDuration, setProgressState);
      
      const { initialResult, analysisPromise, cachePromise } = await processAudioPipeline(audioFile, transcriptionSettings);
      
      // Stage 1 Complete: Show text immediately
      if (stopProgressSimulation) stopProgressSimulation();
      setProgressState({ stage: 'Rendering text...', percentage: 100 });
      
      const partialResult: TranscriptionResult = {
          ...initialResult,
          summary: "",
          sentiment: { overall: "", trend: [] },
          entities: {},
          sources: []
      };

      setTranscriptionResult(partialResult);
      setAppState('result');
      setIsLoading(false);
      
      // Stage 2: Background Analysis
      setIsAnalyzing(true);
      
      // Wait for analysis and cache in parallel
      const [analysisData, cacheData] = await Promise.all([analysisPromise, cachePromise]);
      
      // Update with full data
      const finalResult: TranscriptionResult = {
          ...initialResult,
          ...analysisData
      };
      
      setTranscriptionResult(finalResult);
      if (cacheData) setActiveCacheName(cacheData.name);
      setIsAnalyzing(false);

      // Save to DB
      await saveTranscription(audioFile, cacheKey, finalResult, cacheData?.name, cacheData?.ttl);

    } catch (err) {
      if (stopProgressSimulation) stopProgressSimulation();
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during transcription.");
      setAppState('result');
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  }, [audioFile, language, enableDiarization, enableSummary, summaryLength, summaryDetail, summaryStructure, enableEntityExtraction, enableSentimentAnalysis, enableSearchGrounding]);
  
  const handleSaveTranscription = (newResult: TranscriptionResult) => {
    if (transcriptionResult && audioFile) {
      setTranscriptionResult(newResult);
    }
  };

  const renderContent = () => {
    const mainContentContainer = (children: React.ReactNode) => (
      <div className="w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 transition-all duration-500">
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
      case 'chatbot':
        return transcriptionResult ? (
            <Chatbot 
                transcriptionText={transcriptionResult.transcription.map(s => `${s.speaker}: ${s.text}`).join('\n')}
                cacheName={activeCacheName}
                onClose={() => setAppState('result')}
            />
        ) : null;
      case 'result':
           return (
            <>
               <TranscriptionDisplay
                  audioFile={audioFile}
                  isLoading={isLoading}
                  transcription={transcriptionResult}
                  error={error}
                  onClear={handleClear}
                  onSave={handleSaveTranscription}
                  progress={progressState}
                />
            </>
           );
      case 'transcribing':
        if (isLoading && !transcriptionResult) {
            return (
                <div className="flex items-center justify-center h-full">
                    <TranscriptionDisplay
                    audioFile={audioFile}
                    isLoading={true}
                    transcription={null}
                    error={null}
                    onClear={handleClear}
                    onSave={handleSaveTranscription}
                    progress={progressState}
                    />
                </div>
            );
        }
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full max-w-7xl mx-auto animate-fade-in-up">
            <div className="lg:col-span-3 flex flex-col justify-center bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
              <FileInfo file={audioFile} />
               <div className="flex flex-col sm:flex-row justify-start mt-8 space-y-3 sm:space-y-0 sm:space-x-4">
                  <button onClick={handleTranscribe} disabled={isLoading} className="w-full sm:w-auto px-8 py-3 bg-khaki-600 text-white font-bold rounded-xl hover:bg-khaki-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-khaki-300 transition-all duration-300 disabled:bg-brown-400 disabled:cursor-not-allowed disabled:transform-none">
                    Transcribe Audio
                  </button>
                  <button onClick={handleClear} className="w-full sm:w-auto px-8 py-3 bg-beige-200/50 text-brown-700 font-bold rounded-xl hover:bg-beige-200 focus:outline-none focus:ring-4 focus:ring-beige-200 transition-all duration-300">
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
              />
            </div>
          </div>
        )
      default:
        return null;
    }
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-brown-800 font-sans selection:bg-khaki-200">
      <Sidebar 
        isOpen={isSidebarOpen} 
        estimatedTokens={estimatedTokens}
        onRunTests={() => setShowTestRunner(true)}
        onShowDashboard={handleShowDashboard}
        onShowHistory={handleShowHistory}
        onShowChatbot={handleShowChatbot}
        activeView={appState}
        isResultAvailable={!!transcriptionResult}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 transition-all duration-500 ${appState === 'result' && transcriptionResult ? 'lg:mr-[380px]' : ''}`}>
          {renderContent()}
        </main>
        {isAnalyzing && <StatusPill />}
      </div>
      {appState === 'result' && transcriptionResult && (
        <InsightsPanel transcription={transcriptionResult} isLoading={isAnalyzing} />
      )}
      {showTestRunner && <TestRunner onClose={() => setShowTestRunner(false)} />}
    </div>
  );
};

export default App;
