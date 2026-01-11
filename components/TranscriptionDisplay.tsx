
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
import { Play } from 'lucide-react';
import { TranscriptionResult, TranscriptionSegment } from '../types';
import ProgressIndicator from './common/ProgressIndicator';
import AudioPlayer from './common/AudioPlayer';
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

const timestampToSeconds = (ts: string): number => {
  const parts = ts.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

const SentimentDisplay: React.FC<{ sentiment: string }> = ({ sentiment }) => {
    if (!sentiment) return null;
    const sentimentLower = sentiment.toLowerCase();
    let bgColor = 'bg-beige-100 dark:bg-zinc-800';
    let textColor = 'text-brown-800 dark:text-zinc-100';
    let borderColor = 'border-beige-200 dark:border-white/10';
    
    if (sentimentLower.includes('positive')) {
        bgColor = 'bg-green-50 dark:bg-green-950/30';
        textColor = 'text-green-800 dark:text-green-400';
        borderColor = 'border-green-200 dark:border-green-800/40';
    } else if (sentimentLower.includes('negative')) {
        bgColor = 'bg-red-50 dark:bg-red-950/30';
        textColor = 'text-red-800 dark:text-red-400';
        borderColor = 'border-red-200 dark:border-red-800/40';
    } else if (sentimentLower.includes('neutral') || sentimentLower.includes('mixed')) {
        bgColor = 'bg-yellow-50 dark:bg-yellow-950/30';
        textColor = 'text-yellow-800 dark:text-yellow-400';
        borderColor = 'border-yellow-200 dark:border-yellow-800/40';
    }

    return (
        <div className={`p-6 rounded-3xl flex items-center space-x-4 ${bgColor} border ${borderColor} animate-fade-in transition-all duration-500 hover:shadow-md`}>
            <SentimentIcon className={`w-8 h-8 ${textColor}`} />
            <div>
                <h4 className="font-bold text-[10px] text-brown-500 dark:text-zinc-500 uppercase tracking-[0.1em] mb-1">Emotional Climate</h4>
                <p className={`font-bold text-xl tracking-tight ${textColor}`}>{sentiment}</p>
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
  const [seekTime, setSeekTime] = useState<number | null>(null);

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

      const checkY = (heightNeeded: number) => {
          if (yPos + heightNeeded > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              yPos = 20;
          }
      };

      doc.setFontSize(22);
      doc.setTextColor(74, 64, 58);
      doc.text("TranscriptedAI Report", margin, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(138, 122, 112);
      doc.text(`File: ${audioFile.name}`, margin, yPos);
      yPos += 5;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
      yPos += 15;

      doc.setDrawColor(220, 211, 201);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      if (transcription.summary) {
          doc.setFontSize(14);
          doc.setTextColor(188, 138, 95);
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

      const col1X = margin;
      const col2X = pageWidth / 2 + 5;
      const startGridY = yPos;
      
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
          
          const entHeight = splitEnt.length * 5;
          const sentHeight = 15;
          yPos = Math.max(startGridY + sentHeight, entY + entHeight) + 15;
      } else {
          yPos += 15;
      }

      checkY(20);
      doc.setFontSize(14);
      doc.setTextColor(188, 138, 95);
      doc.setFont(undefined, 'bold');
      doc.text("Full Transcript", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      const segments = isEditing ? editedTranscription : transcription.transcription;

      segments.forEach(seg => {
          const header = `[${seg.timestamp}] ${seg.speaker}`;
          checkY(7);
          doc.setTextColor(107, 93, 85);
          doc.setFont(undefined, 'bold');
          doc.text(header, margin, yPos);
          yPos += 5;

          doc.setTextColor(60, 60, 60);
          doc.setFont(undefined, 'normal');
          const splitText = doc.splitTextToSize(seg.text, contentWidth);
          checkY(splitText.length * 4.5 + 5);
          doc.text(splitText, margin, yPos);
          yPos += (splitText.length * 4.5) + 5;
      });

      doc.save(`${audioFile?.name.split('.')[0]}_transcript.pdf`);
  };

  const handleSeek = (timestamp: string) => {
    if (isEditing) return;
    const seconds = timestampToSeconds(timestamp);
    setSeekTime(seconds);
    setTimeout(() => setSeekTime(null), 100);
  };

  const renderClickableLinks = (line: string) => {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = line.split(linkRegex);
      return parts.map((part, i) => {
        if (i % 3 === 1) {
          const url = parts[i + 1];
          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-khaki-700 dark:text-khaki-400 hover:underline font-bold">
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
      <div className="text-center bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/20 rounded-3xl p-12 shadow-2xl animate-fade-in-up">
        <div className="bg-red-50 dark:bg-red-950/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <ErrorIcon className="w-12 h-12 text-red-500" />
        </div>
        <p className="text-red-700 dark:text-red-400 font-bold text-2xl mb-4 tracking-tight">Transcription Failed</p>
        <p className="text-brown-600 dark:text-zinc-400 mb-10 max-w-sm mx-auto leading-relaxed">{error}</p>
        <button onClick={onClear} className="px-10 py-4 bg-khaki-700 text-white font-bold rounded-2xl hover:bg-khaki-800 transition-all active:scale-95 shadow-lg">
          Try Again
        </button>
      </div>
    );
  }

  if (transcription) {
    return (
      <div className="space-y-10 animate-fade-in">
        <div className="relative">
            <div className="w-full max-h-[78vh] space-y-10 text-brown-800 dark:text-zinc-200 overflow-y-auto pr-3 custom-scrollbar">
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SentimentDisplay sentiment={transcription.sentiment?.overall} />
                  
                  {transcription.entities && Object.keys(transcription.entities).length > 0 && (
                      <div className="bg-white/70 dark:bg-zinc-900/70 border border-beige-200 dark:border-white/5 rounded-3xl p-6 shadow-sm animate-fade-in hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3 mb-4">
                           <EntitiesIcon className="w-5 h-5 text-khaki-700 dark:text-khaki-500" />
                           <h4 className="font-bold text-[10px] text-brown-500 dark:text-zinc-500 uppercase tracking-[0.1em]">Knowledge Nodes</h4>
                        </div>
                        <div className="flex flex-wrap gap-2.5 max-h-24 overflow-y-auto custom-scrollbar">
                           {Object.values(transcription.entities).flat().slice(0, 10).map((item, i) => (
                             <span key={i} className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-beige-100 dark:bg-zinc-800 text-brown-700 dark:text-zinc-300 border border-beige-200 dark:border-white/5 hover:bg-khaki-100 dark:hover:bg-khaki-900/20 transition-all cursor-default whitespace-nowrap">
                                {item}
                             </span>
                           ))}
                           {Object.values(transcription.entities).flat().length > 10 && (
                               <span className="text-xs font-bold text-brown-400 dark:text-zinc-500 self-center">+ more</span>
                           )}
                        </div>
                      </div>
                  )}
               </div>

                {transcription.summary && (
                  <div className="bg-white/80 dark:bg-zinc-900/80 border border-beige-200 dark:border-white/5 rounded-[2rem] shadow-sm p-10 animate-fade-in transition-all hover:bg-white/90 dark:hover:bg-zinc-800/90">
                    <h3 className="flex items-center space-x-3 font-bold text-brown-800 dark:text-zinc-100 text-2xl mb-6 tracking-tight font-poppins">
                      <SummaryIcon className="w-7 h-7 text-khaki-700 dark:text-khaki-500"/>
                      <span>Executive Overview</span>
                    </h3>
                    <div className="prose prose-brown dark:prose-invert prose-p:text-brown-700 dark:prose-p:text-zinc-300 prose-p:text-lg prose-p:leading-relaxed prose-a:text-khaki-700 dark:prose-a:text-khaki-500 max-w-none whitespace-pre-wrap">
                        {renderClickableLinks(transcription.summary)}
                    </div>
                  </div>
                )}

                <div className="bg-white/90 dark:bg-zinc-900/90 border border-beige-200 dark:border-white/5 rounded-[2rem] shadow-sm p-10 backdrop-blur-sm space-y-8">
                     <div className="flex items-center justify-between">
                        <h3 className="font-bold text-2xl text-brown-800 dark:text-zinc-100 tracking-tight font-poppins">Transcript Archive</h3>
                        {isEditing && <span className="text-[10px] font-black text-khaki-800 dark:text-khaki-300 uppercase tracking-[0.2em] px-3 py-1.5 bg-khaki-100 dark:bg-khaki-900/40 rounded-full border border-khaki-200 dark:border-khaki-800/30">Active Edit</span>}
                     </div>
                     
                     {audioFile && !isEditing && (
                       <AudioPlayer file={audioFile} seekToTime={seekTime} />
                     )}
                     
                     {isEditing ? (
                        <div className="space-y-8">
                          {editedTranscription.map((segment, index) => (
                            <div key={index} className="group relative pl-6 border-l-4 border-beige-200 dark:border-zinc-800 hover:border-khaki-500 transition-colors">
                                <div className="flex items-baseline space-x-4 mb-3">
                                  <span className="font-mono text-xs font-bold text-brown-400 dark:text-zinc-500 select-none">{segment.timestamp}</span>
                                  <span className="font-black text-khaki-700 dark:text-khaki-500 text-xs uppercase tracking-widest">{segment.speaker}</span>
                                </div>
                                <textarea
                                  value={segment.text}
                                  onChange={(e) => handleSegmentChange(index, e.target.value)}
                                  className="w-full p-5 bg-white dark:bg-zinc-950 border border-beige-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-khaki-500/10 focus:border-khaki-500 transition-all text-brown-800 dark:text-zinc-200 leading-relaxed text-lg"
                                  rows={Math.max(1, segment.text.split('\n').length)}
                                />
                            </div>
                          ))}
                        </div>
                     ) : (
                        <div className="space-y-2">
                          {transcription.transcription.map((segment, index) => (
                            <div 
                              key={index} 
                              onClick={() => handleSeek(segment.timestamp)}
                              className="group flex items-start gap-6 p-4 rounded-[1.5rem] -mx-4 transition-all duration-300 cursor-pointer border border-transparent hover:bg-khaki-50/50 dark:hover:bg-zinc-800/50 hover:border-khaki-100 dark:hover:border-white/5 active:scale-[0.99]"
                            >
                              <div className="font-mono text-xs font-bold text-brown-400 dark:text-zinc-500 pt-1.5 min-w-[55px] select-none group-hover:text-khaki-700 dark:group-hover:text-khaki-500 transition-colors flex flex-col items-center">
                                {segment.timestamp}
                                <Play size={12} className="mt-2 opacity-0 group-hover:opacity-100 text-khaki-700 dark:text-khaki-500 transition-all transform group-hover:translate-y-1" fill="currentColor" />
                              </div>
                              <div className="flex-1">
                                <div className="mb-2">
                                  <span className="font-black text-brown-900 dark:text-zinc-100 text-xs uppercase tracking-widest mr-3 group-hover:text-khaki-800 dark:group-hover:text-khaki-400 transition-colors">{segment.speaker}</span>
                                </div>
                                <p className="text-brown-700 dark:text-zinc-300 leading-relaxed text-lg whitespace-pre-wrap">{segment.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                     )}
                </div>
            </div>

            {/* Floating Action Bar - Refined with bigger hit areas */}
            <div className="absolute top-6 right-8 flex space-x-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-beige-200 dark:border-white/5 shadow-2xl rounded-2xl p-2 z-20">
              {!isEditing && (
                <>
                  <button onClick={handleExportPDF} className="w-11 h-11 flex items-center justify-center text-brown-600 dark:text-zinc-400 rounded-xl hover:bg-khaki-100 dark:hover:bg-zinc-800 hover:text-khaki-800 dark:hover:text-khaki-400 transition-all active:scale-90" title="Export PDF">
                    <PdfIcon className="w-6 h-6" />
                  </button>
                  <button onClick={handleDownload} className="w-11 h-11 flex items-center justify-center text-brown-600 dark:text-zinc-400 rounded-xl hover:bg-khaki-100 dark:hover:bg-zinc-800 hover:text-khaki-800 dark:hover:text-khaki-400 transition-all active:scale-90" title="Download TXT">
                    <DownloadIcon className="w-6 h-6" />
                  </button>
                  <button onClick={handleEdit} className="w-11 h-11 flex items-center justify-center text-brown-600 dark:text-zinc-400 rounded-xl hover:bg-khaki-100 dark:hover:bg-zinc-800 hover:text-khaki-800 dark:hover:text-khaki-400 transition-all active:scale-90" title="Edit">
                    <EditIcon className="w-6 h-6" />
                  </button>
                  <button onClick={handleCopy} className="w-11 h-11 flex items-center justify-center text-brown-600 dark:text-zinc-400 rounded-xl hover:bg-khaki-100 dark:hover:bg-zinc-800 hover:text-khaki-800 dark:hover:text-khaki-400 transition-all active:scale-90" title={copied ? "Copied" : "Copy"}>
                    {copied ? <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" /> : <CopyIcon className="w-6 h-6" />}
                  </button>
                </>
              )}
            </div>
        </div>

        {isEditing && (
            <div className="flex justify-end space-x-4 pt-8 border-t border-beige-200 dark:border-white/10 sticky bottom-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-6 rounded-[2.5rem] z-30 shadow-2xl-up transform translate-y-4">
              <button onClick={handleCancel} className="px-8 py-4 bg-beige-100 dark:bg-zinc-800 text-brown-800 dark:text-zinc-200 font-bold rounded-2xl hover:bg-beige-200 dark:hover:bg-zinc-700 transition-all active:scale-95">
                Discard Changes
              </button>
              <button onClick={handleSave} className="px-8 py-4 bg-khaki-700 text-white font-bold rounded-2xl hover:bg-khaki-800 shadow-xl flex items-center space-x-3 transition-all active:scale-95">
                <SaveIcon className="w-6 h-6" />
                <span>Save Final Polish</span>
              </button>
            </div>
        )}
        
        {!isEditing && (
             <div className="flex justify-center pt-4 pb-10">
                <button onClick={onClear} className="px-8 py-3 text-sm font-black text-brown-500 dark:text-zinc-500 hover:text-khaki-800 dark:hover:text-khaki-400 transition-all flex items-center space-x-3 group active:scale-95">
                    <span className="group-hover:-translate-x-2 transition-transform">←</span>
                    <span className="uppercase tracking-widest">Process Another File</span>
                </button>
             </div>
        )}

        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-brown-900 dark:bg-zinc-800 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 ease-spring ${copied ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}`}>
            <div className="flex items-center space-x-4">
                <div className="bg-green-500 rounded-full p-1 shadow-inner">
                    <CheckIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm tracking-tight">Copied to Clipboard</span>
            </div>
        </div>
      </div>
    );
  }

  return null;
};

export default memo(TranscriptionDisplay);
