
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

export interface TranscriptionResult {
  transcription: TranscriptionSegment[];
  summary: string;
  sentiment: {
    overall: string;
    trend: SentimentTrendPoint[];
  };
  entities: { [key: string]: string[] };
  sources: any[];
}

export interface HistoryItem {
  key: string;
  fileInfo: {
    name: string;
    size: number;
    lastModified: number;
  };
  result: TranscriptionResult;
}
