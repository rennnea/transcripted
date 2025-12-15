import React from 'react';
import { SummaryIcon } from './icons/SummaryIcon';

export const AppPreview: React.FC = () => {
  return (
    <div className="bg-beige-100 p-6 rounded-2xl border border-beige-200/80 shadow-lg w-full max-w-md mx-auto transform lg:rotate-3 transition-transform duration-300 hover:rotate-0 hover:scale-105">
      <div className="flex items-center space-x-1.5 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
        <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
            <SummaryIcon className="w-5 h-5 text-khaki-600"/>
            <div className="h-4 bg-beige-300 rounded w-1/3"></div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-beige-200 rounded w-full"></div>
            <div className="h-3 bg-beige-200 rounded w-5/6"></div>
        </div>
        <div className="h-px bg-beige-200 my-4"></div>
        <div className="space-y-3">
          <p><span className="font-bold text-khaki-600 text-sm">Speaker 1: </span><span className="h-3 bg-beige-300 rounded inline-block w-2/3 align-middle"></span></p>
          <p><span className="font-bold text-khaki-600 text-sm">Speaker 2: </span><span className="h-3 bg-beige-300 rounded inline-block w-3/4 align-middle"></span></p>
          <p><span className="font-bold text-khaki-600 text-sm">Speaker 1: </span><span className="h-3 bg-beige-300 rounded inline-block w-1/2 align-middle"></span></p>
        </div>
      </div>
    </div>
  );
};

export default AppPreview;