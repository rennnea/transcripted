
import { generateCacheKey } from '../utils/cacheUtils';
import { cacheService } from '../utils/cacheService';
import { TestResult, TestSuiteResult } from './runAllTests';
import { TranscriptionOptions, TranscriptionResult } from '../types';

const createTest = (description: string, success: boolean, error?: string): TestResult => ({ description, success, error });

const assertEqual = (actual: any, expected: any, testName: string, results: TestResult[]) => {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr === expectedStr) {
        results.push(createTest(testName, true));
    } else {
        results.push(createTest(testName, false, `Expected ${expectedStr}, but got ${actualStr}`));
    }
};

const assertNotEqual = (actual: any, expected: any, testName: string, results: TestResult[]) => {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
        results.push(createTest(testName, true));
    } else {
        results.push(createTest(testName, false, `Expected values to be different, but both were ${actualStr}`));
    }
};

// A simple in-memory mock for the localStorage API
let mockStorage: { [key: string]: string } = {};
const mockLocalStorage = {
    getItem: (key: string): string | null => mockStorage[key] || null,
    setItem: (key: string, value: string): void => { mockStorage[key] = value; },
    removeItem: (key: string): void => { delete mockStorage[key]; },
    clear: (): void => { mockStorage = {}; },
    key: (index: number): string | null => Object.keys(mockStorage)[index] || null,
    get length(): number {
        return Object.keys(mockStorage).length;
    }
};

// Replace the global localStorage with our mock for the duration of the tests
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, configurable: true });
} else {
    (global as any).localStorage = mockLocalStorage;
}


export const runCacheTests = async (): Promise<TestSuiteResult> => {
    const results: TestResult[] = [];
    mockLocalStorage.clear();

    // --- Tests for generateCacheKey from cacheUtils.ts ---
    const mockFile = { name: 'test.mp3', size: 12345, lastModified: 1678886400000 } as File;
    const baseSettings: TranscriptionOptions = {
        language: 'en-US', enableDiarization: true, enableSummary: true, summaryLength: 'Medium',
        summaryDetail: 'Detailed', summaryStructure: 'Bullets', enableEntityExtraction: true,
        enableSentimentAnalysis: true, enableSearchGrounding: true
    };
    const differentSettings: TranscriptionOptions = { ...baseSettings, enableDiarization: false };

    const key1 = generateCacheKey(mockFile, baseSettings);
    const key2 = generateCacheKey(mockFile, baseSettings);
    assertEqual(key1, key2, 'generateCacheKey: Generates a consistent key for identical inputs', results);

    const key3 = generateCacheKey(mockFile, differentSettings);
    assertNotEqual(key1, key3, 'generateCacheKey: Generates a different key for different settings', results);

    const differentFile = { ...mockFile, name: 'other.mp3' };
    const key4 = generateCacheKey(differentFile, baseSettings);
    assertNotEqual(key1, key4, 'generateCacheKey: Generates a different key for a different file', results);

    // --- Tests for cacheService.ts ---
    const mockResult: TranscriptionResult = {
        transcription: [], summary: '', sentiment: { overall: '', trend: [] }, entities: {}, sources: []
    };
    const testKey1 = 'transcription_test_1';
    const testData1 = { fileInfo: { name: 'test.mp3', size: 123, lastModified: 123 }, result: mockResult };
    const testKey2 = 'transcription_test_2';
    const testData2 = { fileInfo: { name: 'test2.mp3', size: 456, lastModified: 456 }, result: mockResult };

    cacheService.setItem(testKey1, testData1);
    const retrieved = cacheService.getItem(testKey1);
    assertEqual(retrieved, testData1, 'cacheService: setItem and getItem work correctly', results);

    mockLocalStorage.setItem('non_transcription_key', 'some_value');
    cacheService.setItem(testKey2, testData2);
    
    const allItems = cacheService.getAllItems();
    assertEqual(allItems.length, 2, 'cacheService: getAllItems returns all items with "transcription_" prefix', results);
    
    // Check if one of the returned items matches our test data
    // Fix: Access item.cacheKey instead of item.key
    const foundItem = allItems.find(item => item.cacheKey === testKey1);
    assertEqual(foundItem ? foundItem.fileInfo.name : '', testData1.fileInfo.name, 'cacheService: getAllItems returns correct data', results);

    cacheService.clearAll();
    const afterClear = cacheService.getAllItems();
    assertEqual(afterClear.length, 0, 'cacheService: clearAll removes all transcription items', results);
    assertEqual(mockLocalStorage.getItem('non_transcription_key'), 'some_value', 'cacheService: clearAll does not remove non-transcription items', results);

    mockLocalStorage.setItem(testKey1, '{"bad json":');
    const badJsonItem = cacheService.getItem(testKey1);
    assertEqual(badJsonItem, null, 'cacheService: getItem returns null for malformed JSON', results);
    
    mockLocalStorage.clear();

    return { suiteName: 'Cache Utilities', results };
};
