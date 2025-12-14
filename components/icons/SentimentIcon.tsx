
import React from 'react';

export const SentimentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15.182 8.418a3 3 0 1 0-4.242 4.242M9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 15H8.25m3.75 0v3.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" 
    />
  </svg>
);
