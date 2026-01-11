
import Dexie, { Table } from 'dexie';
import { TranscriptionResult, SemanticIndex } from '../types';

export interface TranscriptionRecord {
  id?: number;
  fileName: string;
  fileSize: number;
  lastModified: number;
  transcriptionData: TranscriptionResult;
  semanticIndex?: SemanticIndex;
  cacheKey: string;
  createdAt: number;
  geminiCacheName?: string;
  geminiCacheExpiry?: number;
}

class TranscriptedDatabase extends Dexie {
  transcriptions!: Table<TranscriptionRecord>;

  constructor() {
    super('TranscriptedDB');
    (this as any).version(1).stores({
      transcriptions: '++id, cacheKey, [fileName+fileSize+lastModified], createdAt'
    });
  }
}

export const db = new TranscriptedDatabase();

export const saveTranscription = async (
  file: File, 
  cacheKey: string, 
  data: TranscriptionResult,
  cacheName?: string,
  ttlSeconds: number = 0
) => {
  const record: TranscriptionRecord = {
    fileName: file.name,
    fileSize: file.size,
    lastModified: file.lastModified,
    transcriptionData: data,
    semanticIndex: data.semanticIndex,
    cacheKey,
    createdAt: Date.now(),
    geminiCacheName: cacheName,
    geminiCacheExpiry: cacheName ? Date.now() + (ttlSeconds * 1000) : undefined
  };

  const existing = await db.transcriptions.where({ cacheKey }).first();
  if (existing && existing.id) {
    await db.transcriptions.update(existing.id, record);
  } else {
    await db.transcriptions.add(record);
  }
};

export const getTranscription = async (cacheKey: string): Promise<TranscriptionRecord | undefined> => {
  return await db.transcriptions.where({ cacheKey }).first();
};

export const getAllTranscriptions = async (): Promise<TranscriptionRecord[]> => {
  return await db.transcriptions.orderBy('createdAt').reverse().toArray();
};

export const deleteTranscription = async (id: number) => {
  await db.transcriptions.delete(id);
};

export const clearDatabase = async () => {
  await db.transcriptions.clear();
};
