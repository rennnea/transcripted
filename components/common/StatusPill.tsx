import React from 'react';

export const StatusPill: React.FC = () => {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center space-x-3 px-4 py-2.5 bg-brown-800/90 backdrop-blur-md text-white rounded-full shadow-xl animate-slide-down">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-khaki-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-khaki-500"></span>
            </div>
            <span className="text-sm font-medium pr-1">Analyzing content & generating insights...</span>
        </div>
    </div>
  );
};