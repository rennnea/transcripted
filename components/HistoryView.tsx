
import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';
import { cacheService } from '../utils/cacheService';
import { HistoryIcon } from './icons/HistoryIcon';

interface HistoryViewProps {
  onSelectItem: (item: HistoryItem) => void;
  onReturnToDashboard: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelectItem, onReturnToDashboard }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  
  useEffect(() => {
    setHistoryItems(cacheService.getAllItems());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire transcription history? This action cannot be undone.')) {
      cacheService.clearAll();
      setHistoryItems([]);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (historyItems.length === 0) {
    return (
      <div className="text-center py-12">
        <HistoryIcon className="w-16 h-16 text-beige-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-brown-700 dark:text-gray-300">No History Found</h3>
        <p className="text-brown-500 dark:text-gray-400 mt-2">Your past transcriptions will appear here after you process a file.</p>
        <button
            onClick={onReturnToDashboard}
            className="mt-6 px-6 py-2 bg-khaki-600 text-white font-bold rounded-lg hover:bg-khaki-700 focus:outline-none focus:ring-2 focus:ring-khaki-500 dark:focus:ring-khaki-400"
        >
            Transcribe a File
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brown-800 dark:text-gray-200">Transcription History</h2>
        <button
          onClick={handleClearHistory}
          className="px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
        >
          Clear All History
        </button>
      </div>
      <ul className="space-y-3">
        {historyItems.sort((a,b) => b.fileInfo.lastModified - a.fileInfo.lastModified).map(item => (
          <li key={item.key} className="bg-beige-50 dark:bg-gray-900 border border-beige-200/80 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between space-x-4">
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-brown-800 dark:text-gray-200 truncate" title={item.fileInfo.name}>
                {item.fileInfo.name}
              </p>
              <p className="text-sm text-brown-500 dark:text-gray-400">
                Transcribed on {formatDate(item.fileInfo.lastModified)}
              </p>
            </div>
            <button
              onClick={() => onSelectItem(item)}
              className="px-4 py-2 text-sm font-bold bg-khaki-600 text-white rounded-lg hover:bg-khaki-700 focus:outline-none focus:ring-2 focus:ring-khaki-500 dark:focus:ring-khaki-400 whitespace-nowrap"
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryView;
