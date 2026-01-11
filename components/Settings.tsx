
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Key, ShieldCheck, ShieldAlert, ExternalLink, ChevronRight } from 'lucide-react';

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

const SettingsToggle: React.FC<{label: string, description: string, enabled: boolean, onToggle: (enabled: boolean) => void, id: string, tooltip: string}> = 
({label, description, enabled, onToggle, id, tooltip}) => (
    <div className="flex items-center justify-between py-3 group" title={tooltip}>
      <div className="cursor-pointer pr-6 flex-1" onClick={() => onToggle(!enabled)}>
        <div className="flex items-center space-x-2">
          <span className="text-base font-bold text-brown-800 dark:text-zinc-100 group-hover:text-khaki-700 transition-colors tracking-tight">{label}</span>
          <Info size={14} className="text-brown-300 group-hover:text-khaki-500 transition-colors" />
        </div>
        <p className="text-xs text-brown-500 dark:text-zinc-500 mt-1 leading-snug">{description}</p>
      </div>
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input type="checkbox" id={id} className="sr-only peer" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
        <div className="w-14 h-8 bg-beige-200 dark:bg-zinc-800 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-khaki-500/20 transition-all duration-300 peer-checked:bg-khaki-700"></div>
        <div className="absolute left-[4px] top-[4px] bg-white w-6 h-6 rounded-full transition-all duration-300 peer-checked:translate-x-6 shadow-md border border-beige-300 peer-checked:border-white"></div>
      </label>
    </div>
);

const ChipSelector: React.FC<{label: string, options: string[], selectedValue: string, onSelect: (v: string) => void}> = ({ label, options, selectedValue, onSelect }) => (
    <div className="group">
        <label className="block text-[10px] font-black text-brown-400 dark:text-zinc-500 uppercase tracking-widest mb-3 transition-colors group-hover:text-brown-600 dark:group-hover:text-zinc-300">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 active:scale-90
                        ${selectedValue === option
                            ? 'bg-khaki-700 text-white shadow-lg shadow-khaki-700/10'
                            : 'bg-beige-100 dark:bg-zinc-800 text-brown-700 dark:text-zinc-300 hover:bg-beige-200 dark:hover:bg-zinc-700'
                        }`
                    }
                >
                    {option}
                </button>
            ))}
        </div>
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
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const active = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(active);
      }
    };
    checkKey();
    const interval = setInterval(checkKey, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleManageKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  return (
    <div className="space-y-8 bg-white/60 dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-beige-200 dark:border-white/5 shadow-sm backdrop-blur-xl transition-all duration-500">
      
      {/* Account & Security Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-brown-800 dark:text-zinc-100 flex items-center gap-3 tracking-tight font-poppins">
            <Key size={20} className="text-khaki-700" />
            Security & Identity
        </h3>
        <div className="p-6 bg-khaki-50/50 dark:bg-zinc-800/40 rounded-3xl border border-khaki-100 dark:border-white/5 space-y-5">
            <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-black text-brown-800 dark:text-zinc-200 uppercase tracking-widest">Gemini Engine Access</h4>
                <div className="flex items-center gap-2">
                {hasApiKey ? (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-black uppercase tracking-wider">
                    <ShieldCheck size={16} /> Key Verified
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-black uppercase tracking-wider">
                    <ShieldAlert size={16} /> Setup Required
                    </div>
                )}
                </div>
            </div>
            <button 
                onClick={handleManageKey}
                className="px-8 py-3.5 bg-brown-800 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-black rounded-2xl hover:bg-brown-900 dark:hover:bg-white transition-all active:scale-95 shadow-md uppercase tracking-widest whitespace-nowrap"
            >
                {hasApiKey ? 'Sync New Key' : 'Initiate Setup'}
            </button>
            </div>
            <div className="flex items-start gap-3 pt-4 border-t border-khaki-200 dark:border-white/5">
            <Info size={16} className="text-khaki-700 dark:text-khaki-500 mt-1 flex-shrink-0" />
            <p className="text-xs text-brown-600 dark:text-zinc-400 leading-relaxed font-medium">
                Uses platform-managed billing. Ensure your selected API key belongs to a paid project with necessary quotas. 
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="ml-1 text-khaki-700 dark:text-khaki-400 hover:underline inline-flex items-center gap-1">
                Docs <ExternalLink size={10} />
                </a>
            </p>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-brown-800 dark:text-zinc-100 flex items-center gap-3 tracking-tight font-poppins border-b border-beige-200 dark:border-white/5 pb-4">
            Intelligence Parameters
        </h3>
        
        <div className="space-y-4">
            <label className="block text-[10px] font-black text-brown-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Primary Vocabulary</label>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 custom-scrollbar">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.value}
                        onClick={() => onLanguageChange(lang.value)}
                        className={`px-6 py-3 text-xs font-black rounded-2xl whitespace-nowrap transition-all duration-300 active:scale-90
                            ${language === lang.value 
                                ? 'bg-khaki-700 text-white shadow-xl shadow-khaki-700/20' 
                                : 'bg-beige-100 dark:bg-zinc-800 text-brown-700 dark:text-zinc-300 border border-beige-200 dark:border-white/5'
                            }`
                        }
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="space-y-2 divide-y divide-beige-100 dark:divide-white/5">
            <SettingsToggle
                id="diarization-toggle"
                label="Voice Recognition"
                description="Distinguish between multiple unique speakers"
                enabled={enableDiarization}
                onToggle={onDiarizationChange}
                tooltip="Gemini identifies acoustic signatures to label Speaker 1, 2, etc."
            />
            
            <div className="py-2">
                <SettingsToggle
                    id="summary-toggle"
                    label="Cognitive Summary"
                    description="Generate an executive overview of the recording"
                    enabled={enableSummary}
                    onToggle={onSummaryChange}
                    tooltip="Produces a synthesized report of the conversation's core meaning."
                />

                <AnimatePresence>
                    {enableSummary && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-6 pt-6 ml-6 pl-8 border-l-4 border-khaki-100 dark:border-zinc-800 my-4">
                                <ChipSelector label="Compression Level" options={SUMMARY_OPTIONS.length} selectedValue={summaryLength} onSelect={onSummaryLengthChange} />
                                <ChipSelector label="Resolution" options={SUMMARY_OPTIONS.detail} selectedValue={summaryDetail} onSelect={onSummaryDetailChange} />
                                <ChipSelector label="Syntactic Format" options={SUMMARY_OPTIONS.structure} selectedValue={summaryStructure} onSelect={onSummaryStructureChange} />
                                <div className="pt-2">
                                    <SettingsToggle
                                        id="grounding-toggle"
                                        label="Reality Sync"
                                        description="Ground findings via real-time Google Search"
                                        enabled={enableSearchGrounding}
                                        onToggle={onSearchGroundingChange}
                                        tooltip="Cross-references facts against current web data."
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <SettingsToggle
                id="entity-toggle"
                label="Semantic Mapping"
                description="Isolate key people, organizations, and places"
                enabled={enableEntityExtraction}
                onToggle={onEntityExtractionChange}
                tooltip="Scans for proper nouns and conceptual anchors."
            />
            <SettingsToggle
                id="sentiment-toggle"
                label="Emotional Profiling"
                description="Detect shifts in tone and emotional state"
                enabled={enableSentimentAnalysis}
                onToggle={onSentimentAnalysisChange}
                tooltip="Maps the emotional trajectory of the audio data."
            />
            <SettingsToggle
                id="autosave-toggle"
                label="Local Archiving"
                description="Automatically persist results to your local database"
                enabled={autoSaveHistory}
                onToggle={onAutoSaveHistoryChange}
                tooltip="Data is stored only in your browser's IndexedDB."
            />
        </div>
      </div>
    </div>
  );
};

export default Settings;
