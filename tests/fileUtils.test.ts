
import { formatFileSize } from '../utils/fileUtils';
import { TestResult, TestSuiteResult } from './runAllTests';

const createTest = (description: string, success: boolean, error?: string): TestResult => ({ description, success, error });

export const runFileUtilsTests = async (): Promise<TestSuiteResult> => {
    const results: TestResult[] = [];

    // Test 1: formatFileSize with Bytes
    const size1 = 500;
    const res1 = formatFileSize(size1);
    if (res1 === '500 Bytes') {
        results.push(createTest("formatFileSize: Formats bytes correctly", true));
    } else {
        results.push(createTest("formatFileSize: Formats bytes correctly", false, `Expected '500 Bytes' but got '${res1}'`));
    }

    // Test 2: formatFileSize with KB
    const size2 = 1024;
    const res2 = formatFileSize(size2);
    if (res2 === '1 KB') {
        results.push(createTest("formatFileSize: Formats KB correctly", true));
    } else {
        results.push(createTest("formatFileSize: Formats KB correctly", false, `Expected '1 KB' but got '${res2}'`));
    }

    // Test 3: formatFileSize with MB
    const size3 = 1024 * 1024 * 1.5; // 1.5 MB
    const res3 = formatFileSize(size3);
    if (res3 === '1.5 MB') {
        results.push(createTest("formatFileSize: Formats MB correctly", true));
    } else {
        results.push(createTest("formatFileSize: Formats MB correctly", false, `Expected '1.5 MB' but got '${res3}'`));
    }

    return { suiteName: 'File Utilities (fileUtils.ts)', results };
};
