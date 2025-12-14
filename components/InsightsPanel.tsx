
import React, { useMemo } from 'react';
import { SpeakerDistributionChart } from './charts/SpeakerDistributionChart';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { TranscriptionResult } from '../types';
import { LinkIcon } from './icons/LinkIcon';

interface InsightsPanelProps {
  transcription: TranscriptionResult | null;
}

const calculateSpeakerDistribution = (text: string | null) => {
    if (!text) return [];

    // Only parse the main transcription part, before any summary or other sections
    const transcriptionText = text.split('--- SUMMARY ---')[0];

    const lines = transcriptionText.split('\n');
    const speakerWordCounts: { [key: string]: number } = {};
    let totalWords = 0;

    const speakerRegex = /^(Speaker \d+|[A-Z\s]+):/i;

    lines.forEach(line => {
        const match = line.match(speakerRegex);
        if (match) {
            const speaker = match[1].trim();
            // Exclude common non-speaker labels that might match the regex
            if (['SUMMARY', 'ENTITIES', 'SENTIMENT'].some(label => speaker.includes(label))) {
                return;
            }

            const speech = line.substring(match[0].length).trim();
            const wordCount = speech.split(/\s+/).filter(Boolean).length;
            
            if (wordCount > 0) {
                speakerWordCounts[speaker] = (speakerWordCounts[speaker] || 0) + wordCount;
                totalWords += wordCount;
            }
        }
    });

    if (totalWords === 0) return [];

    const COLORS = ['bg-khaki-500', 'bg-amber-500', 'bg-orange-500', 'bg-lime-500', 'bg-green-500', 'bg-yellow-500'];
    const distribution = Object.entries(speakerWordCounts).map(([name, count], index) => ({
        name,
        value: Math.round((count / totalWords) * 100),
        color: COLORS[index % COLORS.length]
    }));
    
    // Simple remainder distribution to ensure it adds up to 100%
    const totalPercentage = distribution.reduce((sum, item) => sum + item.value, 0);
    if (distribution.length > 0 && totalPercentage !== 100) {
        const diff = 100 - totalPercentage;
        distribution[0].value += diff;
    }
    
    return distribution.sort((a, b) => b.value - a.value);
};


const InsightsPanel: React.FC<InsightsPanelProps> = ({ transcription }) => {

  const speakerData = useMemo(() => calculateSpeakerDistribution(transcription?.text ?? null), [transcription]);
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