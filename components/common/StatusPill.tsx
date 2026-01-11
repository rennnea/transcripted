
import React from 'react';

export const StatusPill: React.FC = () => {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center space-x-4 px-6 py-3.5 bg-brown-900/95 dark:bg-zinc-800/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl animate-slide-down border border-white/10">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-khaki-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-khaki-500 shadow-[0_0_10px_rgba(229,184,142,0.5)]"></span>
            </div>
            <span className="text-sm font-bold tracking-tight pr-2">Processing Deep Intelligence...</span>
        </div>
    </div>
  );
};
