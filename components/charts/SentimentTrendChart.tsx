
import React from 'react';
import { SentimentTrendPoint } from '../../types';

interface SentimentTrendChartProps {
    data: SentimentTrendPoint[];
}

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 border border-dashed border-brown-200 rounded-xl bg-beige-50/50">
                <p className="text-sm text-brown-500 font-medium">No trend data available</p>
                <p className="text-xs text-brown-400 mt-1">Enable sentiment analysis to see the emotional arc.</p>
            </div>
        );
    }
    
    // Map data to values
    const sentimentMap = { 'Positive': 1, 'Neutral': 0, 'Negative': -1 };
    const chartData = data.map(point => ({
        name: `Seg ${point.segment}`,
        value: sentimentMap[point.sentiment] ?? 0,
        original: point.sentiment,
        segment: point.segment
    }));

    // SVG Dimensions
    const width = 300;
    const height = 140;
    const padding = { top: 20, right: 15, bottom: 30, left: 30 };
    const contentHeight = height - padding.top - padding.bottom;
    const contentWidth = width - padding.left - padding.right;

    // Scaling Functions
    const x = (index: number) => {
        if (chartData.length === 1) return padding.left + contentWidth / 2;
        return padding.left + (index / (chartData.length - 1)) * contentWidth;
    };
    
    // Invert Y because SVG 0 is top
    const y = (value: number) => {
        // value is -1 to 1. 
        // 1 maps to padding.top
        // -1 maps to height - padding.bottom
        return padding.top + ((1 - value) / 2) * contentHeight;
    };

    // Path Generation
    const pathData = chartData.map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${x(index)} ${y(point.value)}`;
    }).join(' ');

    // Geyser Palette Colors (Teal -> Sand -> Terracotta)
    // Matches the "Organic" theme of the app better than standard Red/Green
    const colors = {
        positive: '#35978f', // Muted Teal
        neutral:  '#999999', // Warm Grey
        negative: '#bf812d'  // Earthy Terracotta
    };

    const getColor = (val: number) => {
        if (val === 1) return colors.positive;
        if (val === -1) return colors.negative;
        return colors.neutral;
    };

    return (
        <div className="relative w-full h-full font-sans">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" aria-label="Sentiment Trend Chart">
                <defs>
                    {/* Geyser Gradient for the Line Stroke */}
                    <linearGradient id="geyserStroke" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={colors.positive} />
                        <stop offset="50%" stopColor={colors.neutral} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={colors.negative} />
                    </linearGradient>
                    
                    {/* Subtle Area Fill */}
                    <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={colors.positive} stopOpacity="0.1" />
                        <stop offset="100%" stopColor={colors.negative} stopOpacity="0.1" />
                    </linearGradient>
                </defs>

                {/* --- SEABORN WHITEBOARD STYLE: Background & Grid --- */}
                
                {/* Clean White Background */}
                <rect x="0" y="0" width={width} height={height} fill="white" fillOpacity="0.5" rx="8" />

                {/* Horizontal Grid Lines (Whiteboard style) */}
                <g className="stroke-gray-200" strokeWidth="1" strokeDasharray="0">
                    <line x1={padding.left} y1={y(1)} x2={width - padding.right} y2={y(1)} />
                    <line x1={padding.left} y1={y(0)} x2={width - padding.right} y2={y(0)} />
                    <line x1={padding.left} y1={y(-1)} x2={width - padding.right} y2={y(-1)} />
                </g>

                {/* Y-Axis Text Labels (Clean Sans-Serif) */}
                <g className="text-[10px] font-medium font-inter" textAnchor="end">
                    <text x={padding.left - 6} y={y(1) + 3} fill={colors.positive}>Pos</text>
                    <text x={padding.left - 6} y={y(0) + 3} fill={colors.neutral}>Neu</text>
                    <text x={padding.left - 6} y={y(-1) + 3} fill={colors.negative}>Neg</text>
                </g>

                {/* --- DATA VISUALIZATION --- */}

                {/* Area Fill (Optional, adds visual weight) */}
                {chartData.length > 1 && (
                    <path 
                        d={`${pathData} L ${x(chartData.length - 1)} ${y(-1.2)} L ${x(0)} ${y(-1.2)} Z`} 
                        fill="url(#areaFill)" 
                        stroke="none" 
                    />
                )}

                {/* The Trend Line */}
                {chartData.length > 1 && (
                    <path 
                        d={pathData} 
                        fill="none" 
                        stroke="url(#geyserStroke)" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="drop-shadow-sm"
                    />
                )}
                
                {/* Data Points (Interactive Hover) */}
                {chartData.map((point, index) => (
                    <g key={index} className="group" transform={`translate(${x(index)}, ${y(point.value)})`}>
                         {/* Hit area for easier hovering */}
                         <circle r="12" fill="transparent" className="cursor-pointer" />
                         
                         {/* Visible Dot */}
                         <circle 
                            r="4" 
                            fill="white" 
                            stroke={getColor(point.value)} 
                            strokeWidth="2"
                            className="transition-all duration-200 group-hover:r-6 group-hover:stroke-width-3" 
                         />
                         
                         {/* Tooltip on Hover */}
                         <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <rect x="-25" y="-32" width="50" height="20" rx="4" fill="#333" />
                            <text x="0" y="-19" textAnchor="middle" fill="white" className="text-[10px] font-bold">
                                {point.original}
                            </text>
                             {/* Triangle pointer */}
                             <path d="M -4 -12 L 4 -12 L 0 -8 Z" fill="#333" />
                         </g>
                    </g>
                ))}

                {/* X-Axis Labels (Only show start and end if too many points) */}
                {chartData.map((point, index) => {
                    // Show all labels if less than 8 points, otherwise show every 3rd point
                    if (chartData.length > 8 && index % Math.ceil(chartData.length / 5) !== 0 && index !== chartData.length - 1) return null;
                    
                    return (
                        <text key={index} x={x(index)} y={height - 10} textAnchor="middle" className="text-[9px] fill-gray-400 font-medium">
                            {point.segment}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};
