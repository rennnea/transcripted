
import { TranscriptionSegment, SentimentTrendPoint } from '../types';

export const calculateSpeakerDistribution = (transcription: TranscriptionSegment[] | null) => {
    if (!transcription || transcription.length === 0) return [];

    const speakerWordCounts: { [key: string]: number } = {};
    let totalWords = 0;
    
    const uniqueSpeakers = new Set(transcription.map(s => s.speaker));
    // If there's only one speaker, no need to calculate distribution.
    if (uniqueSpeakers.size <= 1) return [];

    transcription.forEach(segment => {
        const wordCount = segment.text.split(/\s+/).filter(Boolean).length;
        if (wordCount > 0) {
            const speaker = segment.speaker || 'Unknown';
            speakerWordCounts[speaker] = (speakerWordCounts[speaker] || 0) + wordCount;
            totalWords += wordCount;
        }
    });

    if (totalWords === 0) return [];

    let distribution = Object.entries(speakerWordCounts).map(([name, count]) => ({
        name,
        value: Math.round((count / totalWords) * 100),
    }));
    
    distribution.sort((a, b) => b.value - a.value);

    const totalPercentage = distribution.reduce((sum, item) => sum + item.value, 0);
    if (distribution.length > 0 && totalPercentage !== 100) {
        distribution[0].value += (100 - totalPercentage);
    }
    
    const COLORS = ['bg-khaki-500', 'bg-amber-500', 'bg-orange-500', 'bg-lime-500', 'bg-green-500', 'bg-yellow-500'];
    return distribution.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
    }));
};

export const calculateSentimentTrend = (trendData: SentimentTrendPoint[] | null): SentimentTrendPoint[] => {
    if (!trendData || trendData.length === 0) return [];
    return trendData;
};
