
import React from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  thresholds: number[];
  unit: string;
}

const AnthroMonitor: React.FC<Props> = ({ label, value, min, max, thresholds, unit }) => {
  const getPercent = (val: number) => {
    const p = ((val - min) / (max - min)) * 100;
    return Math.min(Math.max(p, 0), 100);
  };

  const currentPos = getPercent(value);
  const isDanger = value < (thresholds[0] || 0);

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-baseline mb-6 md:mb-8">
        <h4 className="text-xs md:text-sm font-black text-slate-700">{label}</h4>
        <div className={`text-xl md:text-2xl font-black tracking-tighter ${isDanger ? 'text-rose-500' : 'text-slate-800'}`}>
          {value}<span className="text-[10px] md:text-xs ml-1 font-bold text-slate-400">{unit}</span>
        </div>
      </div>
      
      <div className="h-2 md:h-2.5 w-full bg-slate-100 rounded-full relative overflow-visible flex items-center shadow-inner">
        {/* Threshold Markers */}
        {thresholds.map((t, i) => (
          <div 
            key={i} 
            className="absolute h-4 md:h-5 w-[1.5px] bg-slate-300 z-10" 
            style={{ left: `${getPercent(t)}%` }}
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-black text-slate-300">
              {t}
            </span>
          </div>
        ))}

        {/* Current Value Indicator */}
        <div 
          className="absolute h-6 md:h-8 w-1 bg-slate-800 z-20 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
          style={{ left: `${currentPos}%` }}
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rounded-full border-2 border-white shadow-md"></div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">
            <span className="text-[9px] md:text-[10px] font-black text-slate-800 whitespace-nowrap">{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnthroMonitor;
