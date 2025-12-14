
import { runFileUtilsTests } from './fileUtils.test';
import { runAnalyticsUtilsTests } from './analyticsUtils.test';
import { runGeminiServiceTests } from './geminiService.test';
import { runCacheTests } from './cache.test';

export interface TestResult {
    description: string;
    success: boolean;
    error?: string;
}

export interface TestSuiteResult {
    suiteName: string;
    results: TestResult[];
}

export const runAllTests = async (): Promise<TestSuiteResult[]> => {
    // We can add a small delay to simulate a more realistic test run in the UI
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const allSuiteResults = await Promise.all([
        runFileUtilsTests(),
        runAnalyticsUtilsTests(),
        runGeminiServiceTests(),
        runCacheTests(),
    ]);

    return allSuiteResults;
};