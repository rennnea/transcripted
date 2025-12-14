
import React from 'react';

interface ProgressIndicatorProps {
  stage: string;
  percentage: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ stage, percentage }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-5 h-96">
        <p className="text-lg text-brown-700 font-semibold">{stage}</p>
        <div className="w-full max-w-md bg-beige-200 rounded-full h-2.5">
            <div 
            className="bg-khaki-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${percentage}%` }}
            ></div>
      </div>
      <p className="text-sm text-brown-500">This may take a moment for larger files.</p>
    </div>
  );
};

export default ProgressIndicator;
