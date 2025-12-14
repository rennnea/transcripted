
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
import { TranscriptionResult } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'landing' | 'upload' | 'transcribing' | 'result'>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressState, setProgressState] = useState({ stage: '', percentage: 0 });

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

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
    setTranscriptionResult(null);
    setError(null);
    setAppState('transcribing');
  };

  const handleClear = () => {
    setAudioFile(null);
    setTranscriptionResult(null);
    setIsLoading(false);
    setError(null);
    setAppState('upload');
  };

  const handleTranscribe = useCallback(async () => {
    if (!audioFile) {
      setError("Please select an audio file first.");
      return;
    }

    const settingsCacheKey = JSON.stringify({language, enableDiarization, enableSummary, summaryLength, summaryDetail, summaryStructure, enableEntityExtraction, enableSentimentAnalysis, enableSearchGrounding});
    const cacheKey = `transcription_${audioFile.name}_${audioFile.size}_${audioFile.lastModified}_${settingsCacheKey}`;
    const cachedResult = sessionStorage.getItem(cacheKey);

    setIsLoading(true);
    setError(null);
    setTranscriptionResult(null);

    if (cachedResult) {
      console.log("Loading transcription from cache.");
      setProgressState({ stage: 'Loading from cache...', percentage: 100 });
      setTimeout(() => {
        setTranscriptionResult(JSON.parse(cachedResult));
        setAppState('result');
        setIsLoading(false);
      }, 500);
      return;
    }

    let currentInterval: number | undefined;
    try {
      console.log("Starting transcription process.");
      
      // Stage 1: Preparing Audio (0-15%)
      setProgressState({ stage: 'Preparing audio file...', percentage: 5 });
      const audioBase64 = await fileToBase64(audioFile);
      setProgressState({ stage: 'Preparing audio file...', percentage: 15 });

      // Stage 2: Uploading to AI (15-30%)
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network latency
      setProgressState({ stage: 'Sending to AI for transcription...', percentage: 30 });
      
      // Stage 3: AI is Transcribing (30-95%)
      const transcriptionPromise = transcribeAudio(
        audioBase64, audioFile.type, language, enableDiarization, 
        enableSummary, summaryLength, summaryDetail, summaryStructure, enableEntityExtraction,
        enableSentimentAnalysis, enableSearchGrounding
      );
      
      const audioDuration = await getAudioDuration(audioFile);
      
      // Estimate processing time to be ~1/4 of audio duration for a smoother progress bar
      // This is a rough estimate but provides better UX than a static spinner.
      const estimatedProcessingTimeMs = (audioDuration / 4) * 1000;
      const progressSteps = 95 - 30; // 65 steps
      const intervalTime = Math.max(50, estimatedProcessingTimeMs / progressSteps);
      
      setProgressState(prev => ({ ...prev, stage: 'AI is transcribing...' }));
      currentInterval = window.setInterval(() => {
        setProgressState(prev => ({ ...prev, percentage: Math.min(prev.percentage + 1, 95) }));
      }, intervalTime);

      const result = await transcriptionPromise;
      clearInterval(currentInterval);
      
      // Stage 4: Finalizing (95-100%)
      setProgressState({ stage: 'Finalizing result...', percentage: 100 });
      
      if (result) {
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
        setTranscriptionResult(result);
        setAppState('result');
      } else {
        setError("Transcription failed. The result was empty.");
        setAppState('result');
      }
    } catch (err) {
      if (currentInterval) clearInterval(currentInterval);
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during transcription.");
      setAppState('result');
    } finally {
      setIsLoading(false);
    }
  }, [audioFile, language, enableDiarization, enableSummary, summaryLength, summaryDetail, summaryStructure, enableEntityExtraction, enableSentimentAnalysis, enableSearchGrounding]);
  
  const handleSaveTranscription = (newText: string) => {
    if (transcriptionResult) {
      setTranscriptionResult({ ...transcriptionResult, text: newText });
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
        if (isLoading) { // Show loading screen immediately if transcribing
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
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 transition-all duration-300 ${appState === 'result' && transcriptionResult ? 'lg:mr-[350px]' : ''}`}>
          {renderContent()}
        </main>
      </div>
      {appState === 'result' && transcriptionResult && <InsightsPanel transcription={transcriptionResult} />}
    </div>
  );
};

export default App;
