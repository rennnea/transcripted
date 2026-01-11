
import React, { useState, useMemo, useEffect } from 'react';
import { TranscriptionRecord, getAllTranscriptions } from '../utils/db';
import { SearchIcon } from './common/icons/SearchIcon';
import { HistoryItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, ChevronRight, Hash, RefreshCw } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';

interface GlobalSearchViewProps {
    query: string;
    onSelectItem: (item: HistoryItem) => void;
}

const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({ query, onSelectItem }) => {
    const [records, setRecords] = useState<TranscriptionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const all = await getAllTranscriptions();
            setRecords(all);
            setIsLoading(false);
        };
        load();
    }, []);

    const filteredResults = useMemo(() => {
        if (!query.trim()) return records;
        const lowQuery = query.toLowerCase();
        
        return records.filter(rec => {
            const fileNameMatch = rec.fileName.toLowerCase().includes(lowQuery);
            const indexMatch = rec.semanticIndex?.keywords.some(k => k.toLowerCase().includes(lowQuery)) ||
                             rec.semanticIndex?.themes.some(t => t.toLowerCase().includes(lowQuery)) ||
                             rec.semanticIndex?.searchSummary.toLowerCase().includes(lowQuery);
            const textMatch = rec.transcriptionData.summary.toLowerCase().includes(lowQuery);
            
            return fileNameMatch || indexMatch || textMatch;
        });
    }, [query, records]);

    const handleItemClick = (rec: TranscriptionRecord) => {
        const item: HistoryItem = {
            id: rec.id,
            cacheKey: rec.cacheKey,
            fileInfo: {
                name: rec.fileName,
                size: rec.fileSize,
                lastModified: rec.lastModified
            },
            result: rec.transcriptionData,
            geminiCacheName: rec.geminiCacheName,
            geminiCacheExpiry: rec.geminiCacheExpiry
        };
        onSelectItem(item);
    };

    return (
        <div className="space-y-12 animate-fade-in py-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-beige-200 dark:border-white/10 pb-8 gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-brown-800 dark:text-zinc-100 flex items-center gap-4 tracking-tighter font-poppins">
                        {/* FIX: Replaced unsupported `size` prop with Tailwind CSS classes `w-9 h-9` for sizing. */}
                        <SearchIcon className="w-9 h-9 text-khaki-700" />
                        Library Insights
                    </h2>
                    <p className="text-lg text-brown-500 dark:text-zinc-400 mt-2 tracking-tight">
                        Found {filteredResults.length} matches for "<span className="text-khaki-700 dark:text-khaki-400 font-black">{query}</span>"
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                        <RefreshCw className="text-khaki-700" size={48} />
                    </motion.div>
                    <p className="text-brown-600 dark:text-zinc-400 text-xl font-bold tracking-tight">Cross-referencing your archive...</p>
                </div>
            ) : filteredResults.length === 0 ? (
                <div className="text-center py-32 bg-beige-50/50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-beige-300 dark:border-zinc-800">
                    <SearchIcon className="w-20 h-20 text-beige-300 dark:text-zinc-800 mx-auto mb-6 opacity-40" />
                    <h3 className="text-2xl font-bold text-brown-800 dark:text-zinc-200 tracking-tight">No semantic matches</h3>
                    <p className="text-brown-500 dark:text-zinc-500 mt-3 max-w-sm mx-auto text-lg leading-relaxed">
                        The query didn't trigger any relevant indices. Try broader keywords like "Budget" or "Strategy".
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    <AnimatePresence>
                        {filteredResults.map((rec, idx) => (
                            <motion.div
                                key={rec.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                                className="group relative bg-white/70 dark:bg-zinc-900/80 border border-white dark:border-white/5 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:border-khaki-500/30 dark:hover:border-khaki-500/20 transition-all cursor-pointer overflow-hidden active:scale-[0.99]"
                                onClick={() => handleItemClick(rec)}
                            >
                                <div className="absolute top-0 right-0 px-8 py-3 bg-khaki-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-[1.5rem] opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 flex items-center gap-2">
                                    <Sparkles size={12} /> Explore Archive
                                </div>

                                <div className="flex flex-col lg:flex-row lg:items-start gap-10">
                                    <div className="w-16 h-16 bg-khaki-100 dark:bg-khaki-900/40 rounded-2xl flex items-center justify-center text-khaki-700 dark:text-khaki-500 flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <FileText size={32} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-4 flex-wrap mb-4">
                                            <h3 className="text-2xl font-bold text-brown-800 dark:text-zinc-100 group-hover:text-khaki-700 dark:group-hover:text-khaki-400 transition-colors truncate tracking-tighter">
                                                {rec.fileName}
                                            </h3>
                                            <span className="px-3 py-1 bg-beige-100 dark:bg-zinc-800 text-[10px] text-brown-500 dark:text-zinc-500 font-black uppercase tracking-widest rounded-lg">
                                                {formatFileSize(rec.fileSize)}
                                            </span>
                                        </div>

                                        <p className="text-lg text-brown-600 dark:text-zinc-400 mt-4 line-clamp-2 leading-relaxed tracking-tight">
                                            {rec.semanticIndex?.searchSummary || rec.transcriptionData.summary}
                                        </p>

                                        {rec.semanticIndex?.themes && rec.semanticIndex.themes.length > 0 && (
                                            <div className="flex flex-wrap gap-3 mt-8">
                                                {rec.semanticIndex.themes.slice(0, 5).map((theme, i) => (
                                                    <span key={i} className="flex items-center gap-2 text-[10px] font-black bg-white dark:bg-zinc-950 text-brown-500 dark:text-zinc-500 px-4 py-1.5 rounded-full border border-beige-200 dark:border-white/5 uppercase tracking-widest hover:border-khaki-500/50 transition-colors">
                                                        <Hash size={10} className="text-khaki-700" /> {theme}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="hidden lg:flex items-center h-full text-beige-400 dark:text-zinc-700 group-hover:text-khaki-700 transition-all transform group-hover:translate-x-2">
                                        <ChevronRight size={48} strokeWidth={1.5} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default GlobalSearchView;