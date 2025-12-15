import React, { useState, useEffect } from 'react';
import { runAllTests, TestResult, TestSuiteResult } from '../tests/runAllTests';
import { CheckIcon } from './common/icons/CheckIcon';
import { ErrorIcon } from './common/icons/ErrorIcon';
import { TestIcon } from './common/icons/TestIcon';

interface TestRunnerProps {
    onClose: () => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ onClose }) => {
    const [testResults, setTestResults] = useState<TestSuiteResult[]>([]);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        const runTests = async () => {
            setIsRunning(true);
            const results = await runAllTests();
            setTestResults(results);
            setIsRunning(false);
        };
        runTests();
    }, []);

    const totalTests = testResults.reduce((acc, suite) => acc + suite.results.length, 0);
    const passedTests = testResults.reduce((acc, suite) => acc + suite.results.filter(r => r.success).length, 0);
    const failedTests = totalTests - passedTests;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-beige-50 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-beige-200 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <TestIcon className="w-6 h-6 text-khaki-600" />
                        <h2 className="text-lg font-semibold text-brown-800">Application Test Suite</h2>
                    </div>
                    {isRunning ? (
                         <div className="text-sm text-brown-500 font-medium">Running tests...</div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-semibold text-green-600">✓ {passedTests} Passed</span>
                            <span className={`text-sm font-semibold ${failedTests > 0 ? 'text-red-600' : 'text-brown-500'}`}>
                                {failedTests > 0 ? `✗ ${failedTests} Failed` : '✓ 0 Failed'}
                            </span>
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-4">
                    {testResults.map(suite => (
                        <div key={suite.suiteName}>
                            <h3 className="font-semibold text-brown-700">{suite.suiteName}</h3>
                            <ul className="mt-2 space-y-1 pl-4 border-l border-beige-200">
                                {suite.results.map((result, index) => (
                                    <li key={index} className="text-sm flex items-start">
                                        {result.success ? (
                                            <CheckIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <ErrorIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <span className={result.success ? 'text-brown-700' : 'text-red-700 font-medium'}>
                                                {result.description}
                                            </span>
                                            {!result.success && result.error && (
                                                <p className="text-xs text-red-500/80 mt-1 pl-1">{result.error}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                     {isRunning && <div className="text-center text-brown-500">Loading test results...</div>}
                </main>
                <footer className="p-4 border-t border-beige-200 flex justify-end flex-shrink-0">
                     <button onClick={onClose} className="px-4 py-2 bg-khaki-600 text-white font-bold rounded-lg hover:bg-khaki-700 focus:outline-none focus:ring-2 focus:ring-khaki-500">
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TestRunner;