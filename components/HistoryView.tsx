import React, { useEffect } from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon } from './common/icons/HistoryIcon';
import { useHistory } from '../hooks/useHistory';
import { formatFileSize } from '../utils/fileUtils';

interface HistoryViewProps {
  onSelectItem: (item: HistoryItem) => void;
  onReturnToDashboard: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelectItem, onReturnToDashboard }) => {
  const { historyItems, isLoading, reloadHistory, clearHistory } = useHistory();
  
  // Reload history when component mounts to ensure fresh data
  useEffect(() => {
    reloadHistory();
  }, [reloadHistory]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (isLoading) {
    return <div className="text-center py-12 text-brown-500">Loading history...</div>;
  }

  if (historyItems.length === 0) {
    return (
      <div className="text-center py-12">
        <HistoryIcon className="w-16 h-16 text-beige-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-brown-700">No History Found</h3>
        <p className="text-brown-500 mt-2">Your past transcriptions will appear here after you process a file.</p>
        <button
            onClick={onReturnToDashboard}
            className="mt-6 px-6 py-2 bg-khaki-600 text-white font-bold rounded-lg hover:bg-khaki-700 focus:outline-none focus:ring-2 focus:ring-khaki-500"
        >
            Transcribe a File
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brown-800">Transcription History</h2>
        <button
          onClick={clearHistory}
          className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Clear All History
        </button>
      </div>
      <ul className="space-y-3">
        {historyItems.map(item => (
          <li key={item.cacheKey || item.id} className="bg-beige-50 border border-beige-200/80 rounded-xl p-4 flex items-center justify-between space-x-4 hover:border-khaki-300 transition-colors">
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-brown-800 truncate" title={item.fileInfo.name}>
                    {item.fileInfo.name}
                </p>
                {item.geminiCacheName && item.geminiCacheExpiry && item.geminiCacheExpiry > Date.now() && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200" title="Cached in Gemini Context">Cached</span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-sm text-brown-500 mt-1">
                <span>{formatFileSize(item.fileInfo.size)}</span>
                <span className="w-1 h-1 rounded-full bg-brown-300"></span>
                <span>{formatDate(item.fileInfo.lastModified)}</span>
              </div>
            </div>
            <button
              onClick={() => onSelectItem(item)}
              className="px-4 py-2 text-sm font-bold bg-khaki-600 text-white rounded-lg hover:bg-khaki-700 focus:outline-none focus:ring-2 focus:ring-khaki-500 whitespace-nowrap"
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
