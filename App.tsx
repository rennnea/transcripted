
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import Settings from './components/Settings';
import { transcribeAudio } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import LandingPage from './components/LandingPage';
import { FileInfo } from './components/FileInfo';
import Sidebar from './components/Sidebar';
import InsightsPanel from './components/InsightsPanel';
import { TranscriptionResult, HistoryItem } from './types';
import TestRunner from './components/TestRunner';
import { cacheService } from './utils/cacheService';
import HistoryView from './components/HistoryView';
import Chatbot from './components/Chatbot';
import { generateCacheKey } from './utils/cacheUtils';
import { simulateTranscriptionProgress } from './utils/progressUtils';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'landing' | 'upload' | 'transcribing' | 'result' | 'history' | 'chatbot'>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressState, setProgressState] = useState({ stage: '', percentage: 0 });
  const [estimatedTokens, setEstimatedTokens] = useState<number | null>(null);
  const [showTestRunner, setShowTestRunner] = useState(false);

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
        audio.onerror = () => {
            resolve(30); // fallback duration in seconds if metadata fails
        }
    });
  };

  const handleGetStarted = () => setAppState('upload');

  const handleFileSelect = async (file: File) => {
    setAudioFile(file);
    setTranscriptionResult(null);
    setError(null);
    const duration = await getAudioDuration(file);
    // 1 second of audio is roughly 8 tokens for Gemini Flash model
    setEstimatedTokens(Math.round(duration * 8));
    setAppState('transcribing');
  };

  const handleClear = () => {
    setAudioFile(null);
    setTranscriptionResult(null);
    setIsLoading(false);
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
      type: 'audio/mp3', // Assume a common type as we don't store it
      lastModified: item.fileInfo.lastModified,
    } as File;

    setAudioFile(mockFile);
    setTranscriptionResult(item.result);
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
    const cachedData = cacheService.getItem(cacheKey);

    setIsLoading(true);
    setError(null);
    setTranscriptionResult(null);

    if (cachedData) {
      console.log("Loading transcription from persistent cache.");
      setProgressState({ stage: 'Loading from cache...', percentage: 100 });
      setTimeout(() => {
        setTranscriptionResult(cachedData.result);
        setAppState('result');
        setIsLoading(false);
      }, 500);
      return;
    }

    let stopProgressSimulation: (() => void) | null = null;
    try {
      console.log("Starting transcription process.");
      
      setProgressState({ stage: 'Preparing audio file...', percentage: 5 });
      const audioBase64 = await fileToBase64(audioFile);
      setProgressState({ stage: 'Preparing audio file...', percentage: 15 });

      const uploadDuration = Math.max(200, Math.min(1000, Math.round(audioFile.size / 1024 / 100)));
      await new Promise(resolve => setTimeout(resolve, uploadDuration));
      
      const audioDuration = await getAudioDuration(audioFile);
      
      stopProgressSimulation = simulateTranscriptionProgress(audioDuration, setProgressState);
      
      const result = await transcribeAudio(audioBase64, audioFile.type, transcriptionSettings);
      
      if (stopProgressSimulation) stopProgressSimulation();
      
      setProgressState({ stage: 'Finalizing result...', percentage: 100 });
      
      if (result) {
        const fileInfo = { name: audioFile.name, size: audioFile.size, lastModified: audioFile.lastModified };
        cacheService.setItem(cacheKey, { fileInfo, result });
        setTranscriptionResult(result);
        setAppState('result');
      } else {
        setError("Transcription failed. The result was empty.");
        setAppState('result');
      }
    } catch (err) {
      if (stopProgressSimulation) stopProgressSimulation();
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during transcription.");
      setAppState('result');
    } finally {
      setIsLoading(false);
    }
  }, [audioFile, language, enableDiarization, enableSummary, summaryLength, summaryDetail, summaryStructure, enableEntityExtraction, enableSentimentAnalysis, enableSearchGrounding]);
  
  const handleSaveTranscription = (newResult: TranscriptionResult) => {
    if (transcriptionResult && audioFile) {
      setTranscriptionResult(newResult);
      // Update the cache with the new result
      const transcriptionSettings = {
        language, enableDiarization, enableSummary, summaryLength, summaryDetail,
        summaryStructure, enableEntityExtraction, enableSentimentAnalysis, enableSearchGrounding
      };
      const cacheKey = generateCacheKey(audioFile, transcriptionSettings);
      const fileInfo = { name: audioFile.name, size: audioFile.size, lastModified: audioFile.lastModified };
      cacheService.setItem(cacheKey, { fileInfo, result: newResult });
    }
  };

  const renderContent = () => {
    const mainContentContainer = (children: React.ReactNode) => (
      <div className="w-full max-w-4xl mx-auto bg-beige-100 border border-beige-200/80 rounded-2xl shadow-sm p-6 md:p-10">
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
                onClose={() => setAppState('result')}
            />
        ) : (
            mainContentContainer(
                <div className="text-center text-red-500">
                    Error: No transcription is available to chat with. Please transcribe a file first.
                </div>
            )
        );
      case 'result':
           return <TranscriptionDisplay
              audioFile={audioFile}
              isLoading={isLoading}
              transcription={transcriptionResult}
              error={error}
              onClear={handleClear}
              onSave={handleSaveTranscription}
              progress={progressState}
            />
      case 'transcribing':
        if (isLoading) {
            return <TranscriptionDisplay
              audioFile={audioFile}
              isLoading={true}
              transcription={null}
              error={null}
              onClear={handleClear}
              onSave={handleSaveTranscription}
              progress={progressState}
            />
        }
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full max-w-7xl mx-auto">
            <div className="lg:col-span-3 flex flex-col justify-center bg-beige-100 border border-beige-200/80 rounded-2xl shadow-sm p-8">
              <FileInfo file={audioFile} />
               <div className="flex flex-col sm:flex-row justify-start mt-8 space-y-3 sm:space-y-0 sm:space-x-4">
                  <button onClick={handleTranscribe} disabled={isLoading} className="w-full sm:w-auto px-8 py-3 bg-khaki-600 text-white font-bold rounded-xl hover:bg-khaki-700 focus:outline-none focus:ring-4 focus:ring-khaki-300 transition-all duration-300 transform hover:scale-105 disabled:bg-brown-500 disabled:cursor-not-allowed disabled:scale-100">
                    Transcribe Audio
                  </button>
                  <button onClick={handleClear} className="w-full sm:w-auto px-8 py-3 bg-beige-200 text-brown-700 font-bold rounded-xl hover:bg-beige-300 focus:outline-none focus:ring-4 focus:ring-beige-200 transition-all duration-300">
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
    <div className="flex h-screen bg-beige-50 text-brown-800 font-sans">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 transition-all duration-300 ${appState === 'result' && transcriptionResult ? 'lg:mr-[350px]' : ''}`}>
          {renderContent()}
        </main>
      </div>
      {appState === 'result' && transcriptionResult && <InsightsPanel transcription={transcriptionResult} />}
      {showTestRunner && <TestRunner onClose={() => setShowTestRunner(false)} />}
    </div>
  );
};

export default App;
