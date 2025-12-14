
import React from 'react';
import { SentimentTrendPoint } from '../../types';

interface SentimentTrendChartProps {
    data: SentimentTrendPoint[];
}

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-brown-500">Sentiment trend data not available.</p>
                <p className="text-xs text-brown-500/70 mt-1">Enable "Sentiment Analysis" for this insight.</p>
            </div>
        );
    }
    
    const sentimentMap = { 'Positive': 1, 'Neutral': 0, 'Negative': -1 };
    const chartData = data.map(point => ({
        name: `Seg. ${point.segment}`,
        value: sentimentMap[point.sentiment] ?? 0,
    }));

    const width = 290;
    const height = 120;
    const padding = { top: 15, right: 10, bottom: 25, left: 10 };

    const x = (index: number) => {
        if (chartData.length === 1) {
            return padding.left + (width - padding.left - padding.right) / 2;
        }
        return padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right);
    };
    const y = (value: number) => padding.top + ((1 - value) / 2) * (height - padding.top - padding.bottom);

    const pathData = chartData.map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${x(index)} ${y(point.value)}`;
    }).join(' ');
    
    const sentimentColors: { [key: number]: string } = {
        '1': 'stroke-green-500 fill-green-500',
        '0': 'stroke-yellow-500 fill-yellow-500',
        '-1': 'stroke-red-500 fill-red-500',
    };

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label="Sentiment Trend Chart">
                <defs>
                    <linearGradient id="sentimentGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#d2f2d2" />
                        <stop offset="50%" stopColor="#fefce8" />
                        <stop offset="100%" stopColor="#fee2e2" />
                    </linearGradient>
                </defs>

                {/* Background Gradient */}
                <rect x={padding.left} y={padding.top} width={width - padding.left - padding.right} height={height - padding.top - padding.bottom} fill="url(#sentimentGradient)" opacity="0.4" />

                {/* Y-Axis Labels */}
                <text x="0" y={y(1) + 4} className="text-[10px] fill-green-700 font-medium" aria-label="Positive sentiment line">Pos</text>
                <text x="0" y={y(0) + 4} className="text-[10px] fill-yellow-700 font-medium" aria-label="Neutral sentiment line">Neu</text>
                <text x="0" y={y(-1) + 4} className="text-[10px] fill-red-700 font-medium" aria-label="Negative sentiment line">Neg</text>
                
                {/* Grid Lines */}
                <line x1={padding.left} y1={y(1)} x2={width - padding.right} y2={y(1)} className="stroke-green-200" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1={padding.left} y1={y(0)} x2={width - padding.right} y2={y(0)} className="stroke-yellow-200" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1={padding.left} y1={y(-1)} x2={width - padding.right} y2={y(-1)} className="stroke-red-200" strokeWidth="0.5" strokeDasharray="2 2" />

                {/* Line Path */}
                {chartData.length > 1 && <path d={pathData} fill="none" className="stroke-khaki-700/80" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
                
                {/* Data Points */}
                {chartData.map((point, index) => (
                    <g key={index} className="group" transform={`translate(${x(index)}, ${y(point.value)})`}>
                         <circle r="6" className="fill-transparent" />
                         <circle r="3.5" className={`${sentimentColors[point.value] || 'stroke-gray-500 fill-gray-500'} transition-transform duration-200 group-hover:r-5`} />
                    </g>
                ))}

                {/* X-Axis Labels */}
                {chartData.map((point, index) => (
                     <text key={index} x={x(index)} y={height - 8} textAnchor="middle" className="text-[9px] fill-brown-500 font-semibold">
                        {point.name}
                    </text>
                ))}
            </svg>
        </div>
    );
};
