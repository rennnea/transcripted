
import React, { useMemo } from 'react';
import { SpeakerDistributionChart } from './charts/SpeakerDistributionChart';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { TranscriptionResult } from '../types';
import { LinkIcon } from './icons/LinkIcon';
import { calculateSpeakerDistribution, calculateSentimentTrend } from '../utils/analyticsUtils';
import { SentimentTrendChart } from './charts/SentimentTrendChart';
import { SentimentTrendIcon } from './icons/SentimentTrendIcon';


const InsightsPanel: React.FC<{ transcription: TranscriptionResult | null; }> = ({ transcription }) => {

  const speakerData = useMemo(() => calculateSpeakerDistribution(transcription?.transcription ?? null), [transcription]);
  const sentimentTrendData = useMemo(() => calculateSentimentTrend(transcription?.sentiment?.trend ?? null), [transcription]);
  const groundingSources = useMemo(() => transcription?.sources?.slice(0, 5) ?? [], [transcription]);

  return (
    <aside className="fixed top-0 right-0 h-full w-[350px] bg-beige-100/70 backdrop-blur-xl border-l border-beige-200/80 p-6 overflow-y-auto transition-transform duration-300 transform translate-x-0 hidden lg:block">
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-brown-800 flex items-center space-x-2">
            <AnalyticsIcon className="w-6 h-6 text-khaki-600"/>
            <span>Transcription Insights</span>
        </h2>

        <div className="bg-beige-100/80 p-4 rounded-xl border border-beige-200/80 shadow-sm">
            <h3 className="font-semibold text-brown-800 flex items-center space-x-2 mb-3">
                <SpeakerIcon className="w-5 h-5 text-brown-500"/>
                <span>Speaker Distribution</span>
            </h3>
            <SpeakerDistributionChart data={speakerData} />
        </div>

        <div className="bg-beige-100/80 p-4 rounded-xl border border-beige-200/80 shadow-sm">
            <h3 className="font-semibold text-brown-800 flex items-center space-x-2 mb-3">
                <SentimentTrendIcon className="w-5 h-5 text-brown-500"/>
                <span>Sentiment Trend</span>
            </h3>
            <SentimentTrendChart data={sentimentTrendData} />
        </div>

        {groundingSources.length > 0 && (
          <div className="bg-beige-100/80 p-4 rounded-xl border border-beige-200/80 shadow-sm">
            <h3 className="font-semibold text-brown-800 flex items-center space-x-2 mb-3">
                <LinkIcon className="w-5 h-5 text-brown-500"/>
                <span>Grounding Sources</span>
            </h3>
            <p className="text-xs text-brown-500 mb-3">
              To provide an accurate and up-to-date summary, the AI consulted the following sources:
            </p>
            <ul className="space-y-2.5">
              {groundingSources.map((source: any, index: number) => (
                <li key={index} className="text-sm leading-tight">
                  <a 
                    href={source.web.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-khaki-700 hover:underline break-words"
                    title={source.web.uri}
                  >
                    {source.web.title || 'Untitled Source'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};

export default InsightsPanel;
