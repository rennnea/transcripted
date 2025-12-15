
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  language: string;
  onLanguageChange: (language: string) => void;
  enableDiarization: boolean;
  onDiarizationChange: (enabled: boolean) => void;
  enableSummary: boolean;
  onSummaryChange: (enabled: boolean) => void;
  summaryLength: string;
  onSummaryLengthChange: (length: string) => void;
  summaryDetail: string;
  onSummaryDetailChange: (detail: string) => void;
  summaryStructure: string;
  onSummaryStructureChange: (structure: string) => void;
  enableEntityExtraction: boolean;
  onEntityExtractionChange: (enabled: boolean) => void;
  enableSentimentAnalysis: boolean;
  onSentimentAnalysisChange: (enabled: boolean) => void;
  enableSearchGrounding: boolean;
  onSearchGroundingChange: (enabled: boolean) => void;
  autoSaveHistory: boolean;
  onAutoSaveHistoryChange: (enabled: boolean) => void;
}

const LANGUAGES = [
  { value: 'en-US', label: 'English' }, { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' }, { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' }, { value: 'pt-BR', label: 'Portuguese' },
  { value: 'ja-JP', label: 'Japanese' }, { value: 'ko-KR', label: 'Korean' },
  { value: 'zh-CN', label: 'Chinese' }, { value: 'ru-RU', label: 'Russian' },
  { value: 'ar-SA', label: 'Arabic' }, { value: 'hu-HU', label: 'Hungarian' },
];

const SUMMARY_OPTIONS = {
  length: ['Short', 'Medium', 'Long'],
  detail: ['Key Points', 'Detailed', 'Comprehensive'],
  structure: ['Paragraph', 'Bullets', 'Key-Value Pairs'],
};

interface SampleOutputProps {
  enableDiarization: boolean;
  enableSummary: boolean;
  summaryStructure: string;
  enableEntityExtraction: boolean;
  enableSentimentAnalysis: boolean;
}

const SampleOutput: React.FC<SampleOutputProps> = ({
  enableDiarization,
  enableSummary,
  summaryStructure,
  enableEntityExtraction,
  enableSentimentAnalysis,
}) => {
  const diarizationText = "Speaker 1: This is a sample of the transcribed text.\nSpeaker 2: Each speaker is identified on a new line.";
  const noDiarizationText = "This is a sample of the transcribed text. The audio content will appear here as a continuous block of text without speaker labels.";

  const summaryParagraph = "This is a paragraph-style summary, providing a concise overview of the main points discussed in the audio.";
  const summaryBullets = "- This is a key point.\n- This is another important takeaway.\n- A third point is summarized here.";
  const summaryKeyValue = "Topic: Sample Discussion\nKey Result: Positive Outcome";

  let summaryContent = '';
  if (summaryStructure === 'Paragraph') summaryContent = summaryParagraph;
  else if (summaryStructure === 'Bullets') summaryContent = summaryBullets;
  else summaryContent = summaryKeyValue;

  const sentimentText = "Positive";
  const entitiesText = "People:\n  - John Doe, Jane Smith\nOrganizations:\n  - Sample Corp";

  return (
    <div className="mt-6 pt-4 border-t border-beige-200">
      <h4 className="text-sm font-semibold text-brown-800 mb-2">Output Preview</h4>
      <p className="text-xs text-brown-500 mb-3">This is how your final transcription file will be structured based on your current settings.</p>
      <div className="text-xs p-4 bg-beige-50 border border-beige-200 rounded-lg font-sans text-brown-700 max-h-48 overflow-y-auto transition-all duration-300">
        <pre className="whitespace-pre-wrap">
          {enableDiarization ? diarizationText : noDiarizationText}
          <AnimatePresence>
            {enableSummary && (
                <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="block overflow-hidden"
                >
                    {`\n\n--- SUMMARY ---\n${summaryContent}`}
                </motion.span>
            )}
            {enableSentimentAnalysis && (
                 <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="block overflow-hidden"
                >
                    {`\n\n--- SENTIMENT ---\n${sentimentText}`}
                </motion.span>
            )}
             {enableEntityExtraction && (
                 <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="block overflow-hidden"
                >
                    {`\n\n--- ENTITIES ---\n${entitiesText}`}
                </motion.span>
            )}
          </AnimatePresence>
        </pre>
      </div>
    </div>
  );
};

interface ChipSelectorProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({ label, options, selectedValue, onSelect }) => (
    <div className="group">
        <label className="block text-xs font-medium text-brown-500 mb-1.5 transition-colors group-hover:text-brown-700">{label}</label>
        <div className="flex items-center space-x-2">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 active:scale-95
                        ${selectedValue === option
                            ? 'bg-khaki-600 text-white shadow-md transform scale-105'
                            : 'bg-beige-200 text-brown-700 hover:bg-beige-300 hover:shadow-sm'
                        }`
                    }
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

const SettingsToggle: React.FC<{label: string, description: string, enabled: boolean, onToggle: (enabled: boolean) => void, id: string, tooltip: string}> = 
({label, description, enabled, onToggle, id, tooltip}) => (
    <div className="flex items-center justify-between py-1 group" title={tooltip}>
      <div className="cursor-pointer" onClick={() => onToggle(!enabled)}>
        <span className="text-sm font-medium text-brown-800 group-hover:text-khaki-800 transition-colors">{label}</span>
        <p className="text-xs text-brown-500 mt-1">{description}</p>
      </div>
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} className="sr-only peer" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
        <div className="w-11 h-6 bg-beige-200 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-khaki-300 transition-all duration-300 peer-checked:bg-khaki-600"></div>
        <div className="absolute left-[2px] top-[2px] bg-white border border-beige-300 w-5 h-5 rounded-full transition-all duration-300 peer-checked:translate-x-full peer-checked:border-white shadow-sm"></div>
      </label>
    </div>
);

const Settings: React.FC<SettingsProps> = ({
  language, onLanguageChange,
  enableDiarization, onDiarizationChange,
  enableSummary, onSummaryChange,
  summaryLength, onSummaryLengthChange,
  summaryDetail, onSummaryDetailChange,
  summaryStructure, onSummaryStructureChange,
  enableEntityExtraction, onEntityExtractionChange,
  enableSentimentAnalysis, onSentimentAnalysisChange,
  enableSearchGrounding, onSearchGroundingChange,
  autoSaveHistory, onAutoSaveHistoryChange,
}) => {
  return (
    <div className="space-y-6 bg-beige-100/50 p-6 rounded-2xl border border-beige-200/80 shadow-sm backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-brown-800 border-b border-beige-200 pb-3">
        Transcription Settings
      </h3>
      <div className="space-y-3">
         <label className="block text-sm font-medium text-brown-800" title="Select the primary language spoken in the audio for the most accurate transcription.">
          Audio Language
        </label>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.value}
                    onClick={() => onLanguageChange(lang.value)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 active:scale-95
                        ${language === lang.value 
                            ? 'bg-khaki-600 text-white shadow-md' 
                            : 'bg-beige-200 text-brown-700 hover:bg-beige-300 hover:shadow-sm'
                        }`
                    }
                >
                    {lang.label}
                </button>
            ))}
        </div>
      </div>
      
      <div className="space-y-5 pt-4 border-t border-beige-200">
        <SettingsToggle
            id="diarization-toggle"
            label="Speaker Diarization"
            description="Identify and label different speakers"
            enabled={enableDiarization}
            onToggle={onDiarizationChange}
            tooltip="When enabled, the AI will try to distinguish between different speakers and label their dialogue."
        />
        
        <div>
            <SettingsToggle
                id="summary-toggle"
                label="Generate Summary"
                description="Create a summary of the audio"
                enabled={enableSummary}
                onToggle={onSummaryChange}
                tooltip="When enabled, an AI-generated summary will be created from the transcription content."
            />

            <AnimatePresence>
                {enableSummary && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-4 pt-4 ml-4 pl-4 border-l-2 border-beige-200 my-2">
                            <ChipSelector label="Length" options={SUMMARY_OPTIONS.length} selectedValue={summaryLength} onSelect={onSummaryLengthChange} />
                            <ChipSelector label="Detail Level" options={SUMMARY_OPTIONS.detail} selectedValue={summaryDetail} onSelect={onSummaryDetailChange} />
                            <ChipSelector label="Structure" options={SUMMARY_OPTIONS.structure} selectedValue={summaryStructure} onSelect={onSummaryStructureChange} />
                            <SettingsToggle
                                id="grounding-toggle"
                                label="Factual Grounding"
                                description="Use Google Search for accuracy"
                                enabled={enableSearchGrounding}
                                onToggle={onSearchGroundingChange}
                                tooltip="When enabled, the AI will use Google Search to verify facts and provide up-to-date information in the summary."
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <SettingsToggle
            id="entity-toggle"
            label="Entity Extraction"
            description="Identify people, places, dates, etc."
            enabled={enableEntityExtraction}
            onToggle={onEntityExtractionChange}
            tooltip="When enabled, the AI will identify and list key entities like people, places, and organizations mentioned in the audio."
        />
        <SettingsToggle
            id="sentiment-toggle"
            label="Sentiment Analysis"
            description="Determine the emotional tone"
            enabled={enableSentimentAnalysis}
            onToggle={onSentimentAnalysisChange}
            tooltip="When enabled, the AI will analyze the overall sentiment of the conversation."
        />
      </div>

       <h3 className="text-lg font-semibold text-brown-800 border-b border-beige-200 pb-3 pt-4">
        General Settings
      </h3>
      <div className="space-y-5 pt-4">
         <SettingsToggle
            id="autosave-toggle"
            label="Auto-save to History"
            description="Automatically save transcriptions to local history"
            enabled={autoSaveHistory}
            onToggle={onAutoSaveHistoryChange}
            tooltip="When enabled, every transcription is automatically saved to your browser's local database."
        />
      </div>

      <SampleOutput
        enableDiarization={enableDiarization}
        enableSummary={enableSummary}
        summaryStructure={summaryStructure}
        enableEntityExtraction={enableEntityExtraction}
        enableSentimentAnalysis={enableSentimentAnalysis}
      />
    </div>
  );
};

export default Settings;
