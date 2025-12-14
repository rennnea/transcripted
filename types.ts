
export interface TranscriptionOptions {
  language: string;
  enableDiarization: boolean;
  enableSummary: boolean;
  summaryLength: string;
  summaryDetail: string;
  summaryStructure: string;
  enableEntityExtraction: boolean;
  enableSentimentAnalysis: boolean;
  enableSearchGrounding: boolean;
}

export interface TranscriptionSegment {
  timestamp: string;
  speaker: string;
  text: string;
}

export interface SentimentTrendPoint {
  segment: number;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

// Stage 1 Output: Pure Data
export interface RawTranscriptionData {
  transcription: TranscriptionSegment[];
}

// Stage 2 Output: Analysis
export interface AnalysisData {
  summary: string;
  sentiment: {
    overall: string;
    trend: SentimentTrendPoint[];
  };
  entities: { [key: string]: string[] };
  sources: any[];
}

// Combined Result stored in DB and used in UI
export interface TranscriptionResult extends RawTranscriptionData, AnalysisData {}

export interface HistoryItem {
  id?: number;
  fileInfo: {
    name: string;
    size: number;
    lastModified: number;
  };
  result: TranscriptionResult;
  geminiCacheName?: string;
  geminiCacheExpiry?: number;
  cacheKey: string;
}
