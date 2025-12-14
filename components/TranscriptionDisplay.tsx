
import React, { useState, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { EditIcon } from './icons/EditIcon';
import { SaveIcon } from './icons/SaveIcon';
import { SummaryIcon } from './icons/SummaryIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { EntitiesIcon } from './icons/EntitiesIcon';
import { SentimentIcon } from './icons/SentimentIcon';
import { TranscriptionResult, TranscriptionSegment } from '../types';
import { LinkIcon } from './icons/LinkIcon';
import ProgressIndicator from './ProgressIndicator';
import { SentimentTrendIcon } from './icons/SentimentTrendIcon';
import { SentimentTrendChart } from './charts/SentimentTrendChart';

interface TranscriptionDisplayProps {
  audioFile: File | null;
  isLoading: boolean;
  transcription: TranscriptionResult | null;
  error: string | null;
  onClear: () => void;
  onSave: (newResult: TranscriptionResult) => void;
  progress: { stage: string; percentage: number };
}

const ENTITY_COLORS: { [key: string]: string } = {
    'People': 'bg-khaki-100 text-brown-800',
    'Organizations': 'bg-amber-100 text-brown-800',
    'Locations': 'bg-lime-100 text-brown-800',
    'Other': 'bg-sky-100 text-brown-800',
    'Default': 'bg-beige-200 text-brown-800',
};

const SentimentDisplay: React.FC<{ sentiment: string }> = ({ sentiment }) => {
    if (!sentiment) return null;
    const sentimentLower = sentiment.toLowerCase();
    let bgColor = 'bg-beige-200';
    let textColor = 'text-brown-800';
    
    if (sentimentLower.includes('positive')) {
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
    } else if (sentimentLower.includes('negative')) {
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
    } else if (sentimentLower.includes('neutral') || sentimentLower.includes('mixed')) {
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
    }

    return (
        <div className={`p-4 rounded-xl flex items-center space-x-3 ${bgColor}`}>
            <SentimentIcon className={`w-6 h-6 ${textColor}`} />
            <div>
                <h4 className="font-semibold text-sm text-gray-500">Overall Sentiment</h4>
                <p className={`font-bold text-lg ${textColor}`}>{sentiment}</p>
            </div>
        </div>
    );
};

// Helper to format the structured data into a downloadable text file content
const formatResultForDownload = (result: TranscriptionResult): string => {
  let content = '';

  // Transcription
  content += 'TRANSCRIPTION\n' + '-'.repeat(13) + '\n';
  result.transcription.forEach(seg => {
    content += `${seg.timestamp} ${seg.speaker}: ${seg.text}\n`;
  });
  content += '\n';

  // Summary
  if (result.summary) {
    content += 'SUMMARY\n' + '-'.repeat(7) + '\n';
    content += result.summary + '\n\n';
  }

  // Sentiment
  if (result.sentiment?.overall) {
    content += 'SENTIMENT ANALYSIS\n' + '-'.repeat(18) + '\n';
    content += `Overall: ${result.sentiment.overall}\n\n`;
  }

  // Entities
  if (result.entities && Object.keys(result.entities).length > 0) {
    content += 'EXTRACTED ENTITIES\n' + '-'.repeat(18) + '\n';
    for (const category in result.entities) {
      content += `${category}:\n - ${result.entities[category].join(', ')}\n`;
    }
    content += '\n';
  }
  
  // Sources
  if (result.sources && result.sources.length > 0) {
    content += 'SOURCES\n' + '-'.repeat(7) + '\n';
    result.sources.forEach(source => {
      content += `- ${source.web.title || 'Untitled'} (${source.web.uri})\n`;
    });
  }

  return content;
};

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  audioFile, isLoading, transcription, error, onClear, onSave, progress
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscription, setEditedTranscription] = useState<TranscriptionSegment[]>([]);

  useEffect(() => {
    if (transcription) {
        setEditedTranscription(JSON.parse(JSON.stringify(transcription.transcription)));
    }
  }, [transcription]);

  const handleCopy = () => {
    if (transcription) {
      const formattedText = formatResultForDownload(transcription);
      navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (transcription) {
        setEditedTranscription(JSON.parse(JSON.stringify(transcription.transcription)));
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    if (transcription) {
      const newResult: TranscriptionResult = { ...transcription, transcription: editedTranscription };
      onSave(newResult);
      setIsEditing(false);
    }
  };
  
  const handleSegmentChange = (index: number, newText: string) => {
    const updatedSegments = [...editedTranscription];
    updatedSegments[index].text = newText;
    setEditedTranscription(updatedSegments);
  };

  const handleDownload = () => {
    if (!transcription) return;
    const formattedText = formatResultForDownload(transcription);
    const blob = new Blob([formattedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audioFile?.name.split('.')[0]}_transcription.txt` || 'transcription.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderClickableLinks = (line: string) => {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = line.split(linkRegex);
      return parts.map((part, i) => {
        if (i % 3 === 1) {
          const url = parts[i + 1];
          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-khaki-600 hover:underline font-medium">
              {part}
            </a>
          );
        }
        if (i % 3 === 2) return null;
        return part;
      });
    };

  if (isLoading) return <ProgressIndicator stage={progress.stage} percentage={progress.percentage} />;

  if (error) {
    return (
      <div className="text-center bg-beige-100 border border-red-300/50 rounded-2xl p-8 shadow-sm">
        <ErrorIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 font-semibold text-lg">An error occurred</p>
        <p className="text-brown-700 mt-2">{error}</p>
        <button onClick={onClear} className="mt-6 px-6 py-2 bg-khaki-600 text-white font-bold rounded-lg hover:bg-khaki-700 focus:outline-none focus:ring-2 focus:ring-khaki-500">
          Try Again
        </button>
      </div>
    );
  }

  if (transcription) {
    return (
      <div className="space-y-6">
        <div className="relative">
            <div className="w-full max-h-[70vh] space-y-6 text-brown-800 overflow-y-auto pr-4">
               <SentimentDisplay sentiment={transcription.sentiment?.overall} />

                {transcription.sentiment?.trend && transcription.sentiment.trend.length > 0 && (
                  <div className="bg-beige-100 border border-beige-200/80 rounded-2xl shadow-sm p-6">
                    <h3 className="flex items-center space-x-2 font-semibold text-brown-800 text-lg mb-4">
                      <SentimentTrendIcon className="w-6 h-6 text-khaki-500"/>
                      <span>Sentiment Trend</span>
                    </h3>
                    <SentimentTrendChart data={transcription.sentiment.trend} />
                  </div>
                )}
                
                {transcription.summary && (
                  <div className="bg-beige-100 border border-beige-200/80 rounded-2xl shadow-sm p-6">
                    <h3 className="flex items-center space-x-2 font-semibold text-brown-800 text-lg mb-4">
                      <SummaryIcon className="w-6 h-6 text-khaki-500"/>
                      <span>Summary</span>
                    </h3>
                    <div className="prose prose-sm max-w-none text-brown-700 whitespace-pre-wrap">{renderClickableLinks(transcription.summary)}</div>
                  </div>
                )}

                {transcription.sources && transcription.sources.length > 0 && (
                  <div className="bg-beige-100 border border-beige-200/80 rounded-2xl shadow-sm p-6">
                    <h3 className="flex items-center space-x-2 font-semibold text-brown-800 text-lg mb-2">
                      <LinkIcon className="w-6 h-6 text-khaki-500"/>
                      <span>Sources</span>
                    </h3>
                    <p className="text-xs text-brown-500 mb-4">The following web pages were consulted by the AI to provide a factually grounded summary.</p>
                    <ul className="list-disc list-inside space-y-2">
                      {transcription.sources.map((source: any, index: number) => (
                        <li key={index} className="text-sm">
                          <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-khaki-600 hover:underline">
                            {source.web.title || source.web.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {transcription.entities && Object.keys(transcription.entities).length > 0 && (
                    <div className="bg-beige-100 border border-beige-200/80 rounded-2xl shadow-sm p-6">
                        <h3 className="flex items-center space-x-2 font-semibold text-brown-800 text-lg mb-4">
                          <EntitiesIcon className="w-6 h-6 text-khaki-500"/>
                          <span>Extracted Entities</span>
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(transcription.entities).map(([category, items]) => (
                            <div key={category}>
                                <h4 className="text-sm font-semibold text-brown-700 mb-2">{category}</h4>
                                <div className="flex flex-wrap gap-2">
                                  {items.map((item, i) => (
                                    <span key={i} className={`px-2.5 py-1 text-sm font-medium rounded-full border border-black/5 shadow-sm ${ENTITY_COLORS[category] || ENTITY_COLORS.Default}`}>
                                        {item}
                                    </span>
                                  ))}
                                </div>
                            </div>
                          ))}
                        </div>
                    </div>
                )}

                <div className="bg-beige-100 border border-beige-200/80 rounded-2xl shadow-sm p-6">
                     {isEditing ? (
                        <div className="space-y-4">
                          {editedTranscription.map((segment, index) => (
                            <div key={index} className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1">
                                <div className="flex items-center col-start-1 row-start-1">
                                  <span className="font-mono text-xs text-brown-500 pt-2.5">{segment.timestamp}</span>
                                  <span className="font-bold text-khaki-600 ml-3 pt-2.5">{segment.speaker}:</span>
                                </div>
                                <textarea
                                  value={segment.text}
                                  onChange={(e) => handleSegmentChange(index, e.target.value)}
                                  className="col-start-1 sm:col-start-2 row-start-2 sm:row-start-1 w-full p-2 bg-beige-50 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-500"
                                  rows={Math.max(1, segment.text.split('\n').length)}
                                />
                            </div>
                          ))}
                        </div>
                     ) : (
                        transcription.transcription.map((segment, index) => (
                          <div key={index} className="flex items-start gap-3 mb-3">
                            <span className="font-mono text-xs text-brown-500 pt-1">{segment.timestamp}</span>
                            <div className="flex-1">
                              <p>
                                <span className="font-bold text-khaki-600 mr-2">{segment.speaker}:</span>
                                <span className="text-brown-700 whitespace-pre-wrap">{segment.text}</span>
                              </p>
                            </div>
                          </div>
                        ))
                     )}
                </div>
            </div>
            <div className="absolute top-4 right-4 flex space-x-1 bg-beige-100/50 backdrop-blur-sm rounded-lg p-1">
              {!isEditing && (
                <>
                  <button onClick={handleDownload} className="p-2 text-brown-500 rounded-md hover:bg-beige-200 hover:text-brown-800 focus:outline-none focus:ring-2 focus:ring-khaki-500" title="Download transcription">
                    <DownloadIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleEdit} className="p-2 text-brown-500 rounded-md hover:bg-beige-200 hover:text-brown-800 focus:outline-none focus:ring-2 focus:ring-khaki-500" title="Edit transcription">
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleCopy} className="p-2 text-brown-500 rounded-md hover:bg-beige-200 hover:text-brown-800 focus:outline-none focus:ring-2 focus:ring-khaki-500" title={copied ? "Copied!" : "Copy to clipboard"}>
                    {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                  </button>
                </>
              )}
            </div>
        </div>

        {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-beige-200">
              <button onClick={handleCancel} className="px-4 py-2 bg-beige-200 text-brown-800 font-semibold rounded-lg hover:bg-beige-300">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-khaki-600 text-white font-semibold rounded-lg hover:bg-khaki-700 flex items-center space-x-2">
                <SaveIcon className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
        )}
        <button onClick={onClear} className="w-full px-6 py-3 bg-khaki-600 text-white font-bold rounded-xl hover:bg-khaki-700 focus:outline-none focus:ring-4 focus:ring-khaki-300/50 transition-all">
          Transcribe Another File
        </button>

        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-brown-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="flex items-center space-x-2">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span>Copied to clipboard!</span>
            </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TranscriptionDisplay;