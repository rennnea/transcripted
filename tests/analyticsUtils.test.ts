
import { calculateSpeakerDistribution, calculateSentimentTrend } from '../utils/analyticsUtils';
import { TestResult, TestSuiteResult } from './runAllTests';
import { TranscriptionSegment, SentimentTrendPoint } from '../types';

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

export const runAnalyticsUtilsTests = async (): Promise<TestSuiteResult> => {
    const results: TestResult[] = [];

    // --- Speaker Distribution Tests ---
    const segments1: TranscriptionSegment[] = [
        { timestamp: "00:00:01", speaker: "Speaker 1", text: "Hello world" },
        { timestamp: "00:00:03", speaker: "Speaker 2", text: "This is a test" }
    ];
    const result1 = calculateSpeakerDistribution(segments1);
    assertEqual(result1, [
        { name: 'Speaker 2', value: 67, color: 'bg-khaki-500' },
        { name: 'Speaker 1', value: 33, color: 'bg-amber-500' }
    ], 'calculateSpeakerDistribution: Calculates basic 2-speaker distribution', results);

    const segments2: TranscriptionSegment[] = [
        { timestamp: "00:00:01", speaker: "SPEAKER", text: "This is a monologue." }
    ];
    const result2 = calculateSpeakerDistribution(segments2);
    assertEqual(result2, [], 'calculateSpeakerDistribution: Returns empty array for a single speaker', results);

    const result3 = calculateSpeakerDistribution(null);
    assertEqual(result3, [], 'calculateSpeakerDistribution: Returns empty array for null input', results);

    const segments4: TranscriptionSegment[] = [
        { timestamp: "00:00:01", speaker: "Speaker 1", text: "This is one line." },
        { timestamp: "00:00:05", speaker: "Speaker 1", text: "This is another line." }
    ];
    const result4 = calculateSpeakerDistribution(segments4);
    assertEqual(result4, [], 'calculateSpeakerDistribution: Returns empty for a single speaker even with multiple segments', results);

    // --- Sentiment Trend Tests ---
    const trendData1: SentimentTrendPoint[] = [
        { segment: 1, sentiment: 'Neutral' },
        { segment: 2, sentiment: 'Positive' },
        { segment: 3, sentiment: 'Negative' }
    ];
    const trendResult1 = calculateSentimentTrend(trendData1);
    assertEqual(trendResult1, trendData1, 'calculateSentimentTrend: Correctly passes valid trend data', results);

    const trendResult2 = calculateSentimentTrend(null);
    assertEqual(trendResult2, [], 'calculateSentimentTrend: Returns empty array if trend data is null', results);

    const trendResult3 = calculateSentimentTrend([]);
    assertEqual(trendResult3, [], 'calculateSentimentTrend: Returns empty array for empty trend data', results);

    return { suiteName: 'Analytics Utilities (analyticsUtils.ts)', results };
};
