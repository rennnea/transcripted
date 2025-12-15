
import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { SentimentTrendPoint } from '../../types';

interface SentimentDistributionChartProps {
  data: SentimentTrendPoint[];
}

export const SentimentDistributionChart: React.FC<SentimentDistributionChartProps> = ({ data }) => {
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);

  // 1. Process Data into Time Bins
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Aim for ~10 bins, or fewer if short audio
    const totalSegments = data.length;
    const binCount = Math.min(Math.max(5, Math.ceil(totalSegments / 3)), 12);
    const segmentsPerBin = Math.ceil(totalSegments / binCount);

    const bins = [];

    for (let i = 0; i < binCount; i++) {
      const startIdx = i * segmentsPerBin;
      const endIdx = Math.min((i + 1) * segmentsPerBin, totalSegments);
      const segmentSlice = data.slice(startIdx, endIdx);

      const counts = { Positive: 0, Neutral: 0, Negative: 0 };
      
      segmentSlice.forEach(p => {
        if (counts[p.sentiment] !== undefined) {
          counts[p.sentiment]++;
        }
      });

      const total = segmentSlice.length;
      
      // Calculate percentages for 100% stacked bar
      // If total is 0 (empty tail bin), we handle it gracefully
      bins.push({
        binIndex: i,
        label: `${Math.round((i / binCount) * 100)}%`,
        Positive: total > 0 ? counts.Positive / total : 0,
        Neutral: total > 0 ? counts.Neutral / total : 0,
        Negative: total > 0 ? counts.Negative / total : 0,
        rawCounts: counts,
        totalSegments: total
      });
    }
    
    // Filter out empty bins if any logic error occurred, though logic above prevents it mostly
    return bins.filter(b => b.totalSegments > 0);

  }, [data]);

  if (!data || data.length === 0) {
      return (
          <div className="text-center py-8 border border-dashed border-brown-200 rounded-xl bg-beige-50/50">
              <p className="text-sm text-brown-500 font-medium">No sentiment data available</p>
          </div>
      );
  }

  // 2. D3 Setup
  const width = 300;
  const height = 160;
  const margin = { top: 10, right: 10, bottom: 25, left: 25 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = d3.scaleBand()
    .domain(processedData.map(d => d.binIndex.toString()))
    .range([0, innerWidth])
    .padding(0.25);

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([innerHeight, 0]);

  // Stack Generator
  const stack = d3.stack<any>()
    .keys(['Negative', 'Neutral', 'Positive']) // Order: Bottom -> Top
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  const series = stack(processedData);

  // Colors (Organic Theme)
  const colorMap: Record<string, string> = {
    Positive: '#35978f', // Teal
    Neutral: '#A8A29E',  // Warm Grey
    Negative: '#bf812d'  // Terracotta
  };

  return (
    <div className="relative w-full select-none" style={{ aspectRatio: '16/9' }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <g transform={`translate(${margin.left},${margin.top})`}>
          
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(tick => (
            <g key={tick} transform={`translate(0,${yScale(tick)})`}>
              <line x2={innerWidth} stroke="#e5e5e5" strokeDasharray="3,3" />
              <text x={-6} dy="3" textAnchor="end" className="text-[9px] fill-gray-400 font-mono">
                {Math.round(tick * 100)}%
              </text>
            </g>
          ))}

          {/* Bars */}
          {series.map((layer) => (
            <g key={layer.key} fill={colorMap[layer.key]}>
              {layer.map((d, i) => {
                const binData = d.data;
                const barHeight = yScale(d[0]) - yScale(d[1]);
                const isHovered = hoveredBin === binData.binIndex;

                return (
                  <motion.rect
                    key={`bar-${layer.key}-${i}`}
                    initial={{ y: yScale(d[0]), height: 0 }}
                    animate={{ 
                      y: yScale(d[1]), 
                      height: barHeight,
                      opacity: isHovered || hoveredBin === null ? 1 : 0.4
                    }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    x={xScale(binData.binIndex.toString())}
                    width={xScale.bandwidth()}
                    rx={3}
                    onMouseEnter={() => setHoveredBin(binData.binIndex)}
                    onMouseLeave={() => setHoveredBin(null)}
                    className="cursor-pointer transition-opacity duration-200"
                  />
                );
              })}
            </g>
          ))}

          {/* X Axis Labels */}
          {processedData.map((d, i) => {
             // Only show First, Middle, Last to prevent clutter
             const isVisible = i === 0 || i === processedData.length - 1 || i === Math.floor(processedData.length / 2);
             if (!isVisible) return null;
             
             return (
               <text 
                 key={`label-${i}`} 
                 x={(xScale(d.binIndex.toString()) || 0) + xScale.bandwidth() / 2} 
                 y={innerHeight + 15} 
                 textAnchor="middle" 
                 className="text-[10px] fill-gray-500 font-medium"
               >
                 {i === 0 ? 'Start' : i === processedData.length - 1 ? 'End' : 'Mid'}
               </text>
             );
          })}
        </g>
      </svg>
      
      {/* Tooltip */}
      {hoveredBin !== null && processedData[hoveredBin] && (
        <div className="absolute top-0 right-0 bg-white/95 backdrop-blur shadow-lg border border-beige-200 p-3 rounded-lg pointer-events-none z-10 text-xs w-40">
           <h4 className="font-bold text-brown-800 border-b border-beige-200 pb-1 mb-2">
             Section {hoveredBin + 1}
           </h4>
           <div className="space-y-1">
              <div className="flex justify-between items-center text-brown-600">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#35978f]"></div>
                    <span>Positive</span>
                 </div>
                 <span className="font-mono font-bold">{processedData[hoveredBin].rawCounts.Positive}</span>
              </div>
              <div className="flex justify-between items-center text-brown-600">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#A8A29E]"></div>
                    <span>Neutral</span>
                 </div>
                 <span className="font-mono font-bold">{processedData[hoveredBin].rawCounts.Neutral}</span>
              </div>
              <div className="flex justify-between items-center text-brown-600">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#bf812d]"></div>
                    <span>Negative</span>
                 </div>
                 <span className="font-mono font-bold">{processedData[hoveredBin].rawCounts.Negative}</span>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
