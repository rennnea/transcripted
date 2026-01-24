
import React, { useMemo, memo } from 'react';
import { SpeakerDistributionChart } from './charts/SpeakerDistributionChart';
import { SpeakerIcon } from './common/icons/SpeakerIcon';
import { TranscriptionResult } from '../types';
import { LinkIcon } from './common/icons/LinkIcon';
import { calculateSpeakerDistribution, calculateSentimentTrend } from '../utils/analyticsUtils';
import { SentimentTrendChart } from './charts/SentimentTrendChart';
import { SentimentDistributionChart } from './charts/SentimentDistributionChart';
import { SentimentTrendIcon } from './common/icons/SentimentTrendIcon';
import { BarChartIcon } from './common/icons/BarChartIcon';
import { Lightbulb, PanelLeftOpen, PanelRightClose } from 'lucide-react';

interface InsightsPanelProps {
    transcription: TranscriptionResult | null;
    isLoading?: boolean;
    isMinimized: boolean;
    onToggleMinimize: () => void;
}

const SkeletonLoader: React.FC<{ type: 'chart' | 'list' }> = ({ type }) => {
    return (
        <div className="animate-pulse space-y-3">
            {type === 'chart' ? (
                <>
                    <div className="h-32 bg-brown-100/50 dark:bg-zinc-800/50 rounded-lg w-full"></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="h-4 bg-brown-100/50 dark:bg-zinc-800/50 rounded w-full"></div>
                        <div className="h-4 bg-brown-100/50 dark:bg-zinc-800/50 rounded w-full"></div>
                    </div>
                </>
            ) : (
                <>
                    <div className="h-4 bg-brown-100/50 dark:bg-zinc-800/50 rounded w-3/4"></div>
                    <div className="h-4 bg-brown-100/50 dark:bg-zinc-800/50 rounded w-1/2"></div>
                    <div className="h-4 bg-brown-100/50 dark:bg-zinc-800/50 rounded w-5/6"></div>
                </>
            )}
        </div>
    );
};

const InsightsPanel: React.FC<InsightsPanelProps> = ({ transcription, isLoading = false, isMinimized, onToggleMinimize }) => {

  const speakerData = useMemo(() => calculateSpeakerDistribution(transcription?.transcription ?? null), [transcription]);
  const sentimentTrendData = useMemo(() => calculateSentimentTrend(transcription?.sentiment?.trend ?? null), [transcription]);
  const groundingSources = useMemo(() => transcription?.sources?.slice(0, 5) ?? [], [transcription]);

  return (
    <aside className={`fixed top-0 right-0 h-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-l border-white/20 dark:border-white/5 transition-all duration-500 ease-in-out hidden lg:block shadow-[-10px_0_40px_rgba(0,0,0,0.02)] dark:shadow-[-10px_0_40px_rgba(0,0,0,0.3)] ${isMinimized ? 'w-16' : 'w-[380px]'}`}>
        <div className="h-full relative">
            <button 
                onClick={onToggleMinimize}
                className={`absolute top-6 z-20 p-2 text-brown-500 dark:text-zinc-400 hover:bg-beige-200 dark:hover:bg-zinc-800 rounded-lg transition-all ${isMinimized ? 'left-1/2 -translate-x-1/2' : 'right-6'}`}
                title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
            >
                {isMinimized ? <PanelLeftOpen size={20} /> : <PanelRightClose size={20} />}
            </button>
            
            <div className={`h-full flex flex-col transition-opacity duration-300 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="p-8 pb-4">
                    <h2 className="text-xl font-bold text-brown-800 dark:text-zinc-100 flex items-center space-x-3">
                        <Lightbulb className="w-6 h-6 text-khaki-600 dark:text-khaki-500"/>
                        <span>Transcription Insights</span>
                    </h2>
                </div>

                <div className="flex-1 p-8 pt-2 space-y-8 overflow-y-auto">
                    {/* Speaker Distribution */}
                    <div className="bg-white/50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-white/40 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-md">
                        <h3 className="font-semibold text-brown-800 dark:text-zinc-200 flex items-center space-x-2 mb-4">
                            <SpeakerIcon className="w-5 h-5 text-brown-500 dark:text-zinc-500"/>
                            <span>Speaker Distribution</span>
                        </h3>
                        {isLoading ? <SkeletonLoader type="chart" /> : <SpeakerDistributionChart data={speakerData} />}
                    </div>
                    
                    {/* Sentiment Distribution (Stacked Bar) */}
                    <div className="bg-white/50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-white/40 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-md">
                        <h3 className="font-semibold text-brown-800 dark:text-zinc-200 flex items-center space-x-2 mb-4">
                            <BarChartIcon className="w-5 h-5 text-brown-500 dark:text-zinc-500"/>
                            <span>Sentiment Mix Over Time</span>
                        </h3>
                        {isLoading ? <SkeletonLoader type="chart" /> : <SentimentDistributionChart data={sentimentTrendData} />}
                    </div>

                    {/* Sentiment Trend */}
                    <div className="bg-white/50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-white/40 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-md">
                        <h3 className="font-semibold text-brown-800 dark:text-zinc-200 flex items-center space-x-2 mb-4">
                            <SentimentTrendIcon className="w-5 h-5 text-brown-500 dark:text-zinc-500"/>
                            <span>Sentiment Intensity</span>
                        </h3>
                        {isLoading ? <SkeletonLoader type="chart" /> : <SentimentTrendChart data={sentimentTrendData} />}
                    </div>

                    {/* Sources */}
                    {(groundingSources.length > 0 || isLoading) && (
                    <div className="bg-white/50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-white/40 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-md">
                        <h3 className="font-semibold text-brown-800 dark:text-zinc-200 flex items-center space-x-2 mb-4">
                            <LinkIcon className="w-5 h-5 text-brown-500 dark:text-zinc-500"/>
                            <span>Grounding Sources</span>
                        </h3>
                        {isLoading ? (
                            <SkeletonLoader type="list" />
                        ) : groundingSources.length > 0 ? (
                            <>
                                <p className="text-xs text-brown-500 dark:text-zinc-500 mb-3">
                                Consulted sources for factual verification:
                                </p>
                                <ul className="space-y-3">
                                {groundingSources.map((source: any, index: number) => (
                                    <li key={index} className="text-sm leading-tight group">
                                    <a 
                                        href={source.web.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-brown-600 dark:text-zinc-400 group-hover:text-khaki-700 dark:group-hover:text-khaki-500 transition-colors flex flex-col"
                                        title={source.web.uri}
                                    >
                                        <span className="font-medium group-hover:underline">{source.web.title || 'Untitled Source'}</span>
                                        <span className="text-[10px] text-brown-400 dark:text-zinc-600 mt-0.5 truncate">{source.web.uri}</span>
                                    </a>
                                    </li>
                                ))}
                                </ul>
                            </>
                        ) : null}
                    </div>
                    )}
                </div>
            </div>
        </div>
    </aside>
  );
};

export default memo(InsightsPanel);
