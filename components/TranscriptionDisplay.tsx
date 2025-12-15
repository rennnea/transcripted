
import React, { useState, useEffect, memo } from 'react';
import { CopyIcon } from './common/icons/CopyIcon';
import { CheckIcon } from './common/icons/CheckIcon';
import { ErrorIcon } from './common/icons/ErrorIcon';
import { EditIcon } from './common/icons/EditIcon';
import { SaveIcon } from './common/icons/SaveIcon';
import { SummaryIcon } from './common/icons/SummaryIcon';
import { DownloadIcon } from './common/icons/DownloadIcon';
import { EntitiesIcon } from './common/icons/EntitiesIcon';
import { SentimentIcon } from './common/icons/SentimentIcon';
import { PdfIcon } from './common/icons/PdfIcon';
import { TranscriptionResult, TranscriptionSegment } from '../types';
import ProgressIndicator from './common/ProgressIndicator';
import { motion } from 'framer-motion';
// @ts-ignore
import { jsPDF } from "jspdf";

interface TranscriptionDisplayProps {
  audioFile: File | null;
  isLoading: boolean;
  transcription: TranscriptionResult | null;
  error: string | null;
  onClear: () => void;
  onSave: (newResult: TranscriptionResult) => void;
  progress: { stage: string; percentage: number };
}

const SentimentDisplay: React.FC<{ sentiment: string }> = ({ sentiment }) => {
    if (!sentiment) return null;
    const sentimentLower = sentiment.toLowerCase();
    let bgColor = 'bg-beige-100';
    let textColor = 'text-brown-800';
    let borderColor = 'border-beige-200';
    
    if (sentimentLower.includes('positive')) {
        bgColor = 'bg-green-50';
        textColor = 'text-green-800';
        borderColor = 'border-green-200';
    } else if (sentimentLower.includes('negative')) {
        bgColor = 'bg-red-50';
        textColor = 'text-red-800';
        borderColor = 'border-red-200';
    } else if (sentimentLower.includes('neutral') || sentimentLower.includes('mixed')) {
        bgColor = 'bg-yellow-50';
        textColor = 'text-yellow-800';
        borderColor = 'border-yellow-200';
    }

    return (
        <div className={`p-4 rounded-xl flex items-center space-x-3 ${bgColor} border ${borderColor} animate-fade-in transition-colors duration-500 hover:shadow-sm`}>
            <SentimentIcon className={`w-6 h-6 ${textColor}`} />
            <div>
                <h4 className="font-semibold text-xs text-brown-500 uppercase tracking-wide">Overall Sentiment</h4>
                <p className={`font-bold text-lg ${textColor}`}>{sentiment}</p>
            </div>
        </div>
    );
};

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

  const handleExportPDF = () => {
      if (!transcription || !audioFile) return;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = 20;

      // Helper to check Y pos and add page
      const checkY = (heightNeeded: number) => {
          if (yPos + heightNeeded > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              yPos = 20;
          }
      };

      // Header
      doc.setFontSize(22);
      doc.setTextColor(74, 64, 58); // brown-800
      doc.text("TranscriptedAI Report", margin, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(138, 122, 112); // brown-500
      doc.text(`File: ${audioFile.name}`, margin, yPos);
      yPos += 5;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
      yPos += 15;

      // Line
      doc.setDrawColor(220, 211, 201); // beige-300
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Summary
      if (transcription.summary) {
          doc.setFontSize(14);
          doc.setTextColor(188, 138, 95); // khaki-700
          doc.setFont(undefined, 'bold');
          doc.text("Executive Summary", margin, yPos);
          yPos += 7;

          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          doc.setFont(undefined, 'normal');
          
          const splitSummary = doc.splitTextToSize(transcription.summary, contentWidth);
          checkY(splitSummary.length * 5);
          doc.text(splitSummary, margin, yPos);
          yPos += (splitSummary.length * 5) + 10;
      }

      // Sentiment & Entities Grid
      const col1X = margin;
      const col2X = pageWidth / 2 + 5;
      
      const startGridY = yPos;
      
      // Sentiment
      if (transcription.sentiment?.overall) {
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(188, 138, 95);
          doc.text("Sentiment", col1X, yPos);
          yPos += 6;
          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          doc.setFont(undefined, 'normal');
          doc.text(`Overall: ${transcription.sentiment.overall}`, col1X, yPos);
      }

      // Entities (Right Col)
      if (transcription.entities) {
          let entY = startGridY;
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(188, 138, 95);
          doc.text("Key Entities", col2X, entY);
          entY += 6;
          
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.setFont(undefined, 'normal');
          
          const entities = Object.values(transcription.entities).flat().slice(0, 10);
          const entText = entities.join(", ");
          const splitEnt = doc.splitTextToSize(entText, (pageWidth/2) - margin - 5);
          
          doc.text(splitEnt, col2X, entY);
          
          // Adjust yPos based on whichever column was taller
          const entHeight = splitEnt.length * 5;
          const sentHeight = 15; // approximate
          yPos = Math.max(startGridY + sentHeight, entY + entHeight) + 15;
      } else {
          yPos += 15;
      }

      // Transcript
      checkY(20);
      doc.setFontSize(14);
      doc.setTextColor(188, 138, 95);
      doc.setFont(undefined, 'bold');
      doc.text("Full Transcript", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      // Loop through edited transcription if available, otherwise original
      const segments = isEditing ? editedTranscription : transcription.transcription;

      segments.forEach(seg => {
          // Timestamp & Speaker (Bold)
          const header = `[${seg.timestamp}] ${seg.speaker}`;
          checkY(7);
          doc.setTextColor(107, 93, 85); // brown-700
          doc.setFont(undefined, 'bold');
          doc.text(header, margin, yPos);
          yPos += 5;

          // Text
          doc.setTextColor(60, 60, 60);
          doc.setFont(undefined, 'normal');
          const splitText = doc.splitTextToSize(seg.text, contentWidth);
          checkY(splitText.length * 4.5 + 5);
          doc.text(splitText, margin, yPos);
          yPos += (splitText.length * 4.5) + 5;
      });

      doc.save(`${audioFile.name.split('.')[0]}_transcript.pdf`);
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
      <div className="text-center bg-white border border-red-200 rounded-3xl p-10 shadow-sm animate-fade-in-up">
        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ErrorIcon className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-red-700 font-bold text-xl mb-2">Transcription Failed</p>
        <p className="text-brown-600 mb-8">{error}</p>
        <button onClick={onClear} className="px-8 py-3 bg-khaki-600 text-white font-bold rounded-xl hover:bg-khaki-700 focus:outline-none focus:ring-4 focus:ring-khaki-200 transition-all active:scale-95">
          Try Again
        </button>
      </div>
    );
  }

  if (transcription) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="relative">
            <div className="w-full max-h-[75vh] space-y-8 text-brown-800 overflow-y-auto pr-2 custom-scrollbar">
               
               {/* Analysis Section Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SentimentDisplay sentiment={transcription.sentiment?.overall} />
                  
                  {transcription.entities && Object.keys(transcription.entities).length > 0 && (
                      <div className="bg-white/50 border border-white/60 rounded-xl p-4 shadow-sm animate-fade-in hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-2 mb-3">
                           <EntitiesIcon className="w-4 h-4 text-khaki-600" />
                           <h4 className="font-semibold text-xs text-brown-500 uppercase tracking-wide">Key Entities</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto custom-scrollbar">
                           {Object.values(transcription.entities).flat().slice(0, 8).map((item, i) => (
                             <span key={i} className="px-2 py-0.5 text-xs font-medium rounded-full bg-beige-100 text-brown-700 border border-beige-200 hover:bg-beige-200 transition-colors cursor-default">
                                {item}
                             </span>
                           ))}
                           {Object.values(transcription.entities).flat().length > 8 && (
                               <span className="text-xs text-brown-400 py-0.5">+ more</span>
                           )}
                        </div>
                      </div>
                  )}
               </div>

                {transcription.summary && (
                  <div className="bg-white/50 border border-white/60 rounded-2xl shadow-sm p-8 animate-fade-in transition-all hover:bg-white/70">
                    <h3 className="flex items-center space-x-2 font-bold text-brown-800 text-xl mb-4">
                      <SummaryIcon className="w-6 h-6 text-khaki-600"/>
                      <span>Executive Summary</span>
                    </h3>
                    <div className="prose prose-brown prose-p:text-brown-700 prose-a:text-khaki-700 max-w-none whitespace-pre-wrap leading-relaxed">
                        {renderClickableLinks(transcription.summary)}
                    </div>
                  </div>
                )}

                <div className="bg-white/80 border border-white/60 rounded-2xl shadow-sm p-8 backdrop-blur-sm">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl text-brown-800">Transcript</h3>
                        {isEditing && <span className="text-xs font-bold text-khaki-600 uppercase tracking-widest px-2 py-1 bg-khaki-50 rounded-md">Editing Mode</span>}
                     </div>
                     
                     {isEditing ? (
                        <div className="space-y-6">
                          {editedTranscription.map((segment, index) => (
                            <div key={index} className="group relative pl-4 border-l-2 border-beige-200 hover:border-khaki-400 transition-colors">
                                <div className="flex items-baseline space-x-3 mb-1.5">
                                  <span className="font-mono text-xs text-brown-400 select-none">{segment.timestamp}</span>
                                  <span className="font-bold text-khaki-700 text-sm uppercase tracking-wide">{segment.speaker}</span>
                                </div>
                                <textarea
                                  value={segment.text}
                                  onChange={(e) => handleSegmentChange(index, e.target.value)}
                                  className="w-full p-3 bg-white border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-500/20 focus:border-khaki-500 transition-all text-brown-800 leading-relaxed"
                                  rows={Math.max(1, segment.text.split('\n').length)}
                                />
                            </div>
                          ))}
                        </div>
                     ) : (
                        transcription.transcription.map((segment, index) => (
                          <div key={index} className="group flex items-start gap-4 mb-2 hover:bg-beige-50/80 p-3 rounded-lg -mx-3 transition-colors duration-200">
                            <span className="font-mono text-xs text-brown-400 pt-1.5 min-w-[50px] select-none group-hover:text-khaki-600 transition-colors">{segment.timestamp}</span>
                            <div className="flex-1">
                              <p className="mb-1">
                                <span className="font-bold text-brown-900 text-sm uppercase tracking-wide mr-2 group-hover:text-khaki-700 transition-colors">{segment.speaker}</span>
                              </p>
                              <p className="text-brown-700 leading-relaxed whitespace-pre-wrap">{segment.text}</p>
                            </div>
                          </div>
                        ))
                     )}
                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="absolute top-4 right-6 flex space-x-2 bg-white/80 backdrop-blur-md border border-white/40 shadow-lg rounded-xl p-1.5 z-10 transition-opacity duration-300">
              {!isEditing && (
                <>
                  <button onClick={handleExportPDF} className="p-2 text-brown-600 rounded-lg hover:bg-khaki-50 hover:text-khaki-700 transition-all active:scale-95" title="Export PDF">
                    <PdfIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleDownload} className="p-2 text-brown-600 rounded-lg hover:bg-khaki-50 hover:text-khaki-700 transition-all active:scale-95" title="Download TXT">
                    <DownloadIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleEdit} className="p-2 text-brown-600 rounded-lg hover:bg-khaki-50 hover:text-khaki-700 transition-all active:scale-95" title="Edit">
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleCopy} className="p-2 text-brown-600 rounded-lg hover:bg-khaki-50 hover:text-khaki-700 transition-all active:scale-95" title={copied ? "Copied" : "Copy"}>
                    {copied ? <CheckIcon className="w-5 h-5 text-green-600" /> : <CopyIcon className="w-5 h-5" />}
                  </button>
                </>
              )}
            </div>
        </div>

        {isEditing && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-beige-200 sticky bottom-0 bg-white/90 backdrop-blur p-4 rounded-b-2xl z-20 shadow-lg transform translate-y-2">
              <button onClick={handleCancel} className="px-5 py-2.5 bg-beige-100 text-brown-800 font-semibold rounded-xl hover:bg-beige-200 transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-khaki-600 text-white font-semibold rounded-xl hover:bg-khaki-700 shadow-md flex items-center space-x-2 transition-all active:scale-95">
                <SaveIcon className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
        )}
        
        {!isEditing && (
             <div className="flex justify-center pt-2 pb-6">
                <button onClick={onClear} className="text-sm font-semibold text-brown-500 hover:text-khaki-700 transition-colors flex items-center space-x-2 active:scale-95 transform">
                    <span>← Upload Another File</span>
                </button>
             </div>
        )}

        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-brown-900/90 backdrop-blur text-white px-5 py-3 rounded-full shadow-2xl transition-all duration-300 ease-in-out ${copied ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
            <div className="flex items-center space-x-2.5">
                <div className="bg-green-500 rounded-full p-0.5">
                    <CheckIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium">Copied to clipboard</span>
            </div>
        </div>
      </div>
    );
  }

  return null;
};

export default memo(TranscriptionDisplay);
