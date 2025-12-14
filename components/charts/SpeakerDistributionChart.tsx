
import React from 'react';

interface ChartData {
    name: string;
    value: number;
    color: string;
}

interface SpeakerDistributionChartProps {
    data: ChartData[];
}

export const SpeakerDistributionChart: React.FC<SpeakerDistributionChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-brown-500">Speaker diarization data not available.</p>
                <p className="text-xs text-brown-500/70 mt-1">Enable "Speaker Diarization" for this insight.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            <div className="flex w-full h-8 rounded-full overflow-hidden bg-beige-200">
                {data.map(item => (
                    item.value > 0 && <div key={item.name} className={item.color} style={{ width: `${item.value}%` }} title={`${item.name}: ${item.value}%`}></div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-brown-700">
                {data.map(item => (
                    <div key={item.name} className="flex items-center space-x-1.5 overflow-hidden">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`}></span>
                        <span className="truncate" title={item.name}>{item.name}</span>
                        <span className="font-semibold">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};