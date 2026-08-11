import React from 'react';
import { MarineWeatherData } from '../types';
import { ArrowLeft, Sun, ShieldAlert, Glasses, Clock, AlertTriangle } from 'lucide-react';
import { getUVMeta } from '../utils/uvCalculations';

interface Props {
  data: MarineWeatherData;
  onBack: () => void;
}

export const WearOSUVTile: React.FC<Props> = ({ data, onBack }) => {
  const uvMeta = getUVMeta(data.uvIndex);
  
  // Angle for arc gauge (0 to 12 max UV)
  const maxUV = 12;
  const clampedUV = Math.min(maxUV, Math.max(0, data.uvIndex));
  const progressPercent = Math.min(100, (clampedUV / maxUV) * 100);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 text-white select-none overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-[210px] mt-1">
        <button
          onClick={onBack}
          className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">Índice Rayos UV</span>
        <div className="w-6" />
      </div>

      {/* Main UV Gauge Meter (Arc) */}
      <div className="relative w-36 h-36 flex flex-col items-center justify-center my-1">
        <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeDasharray="251"
            strokeDashoffset="35"
            strokeLinecap="round"
          />
          {/* Active UV Progress Arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={uvMeta.color}
            strokeWidth="8"
            strokeDasharray="251"
            strokeDashoffset={251 - (216 * (progressPercent / 100))}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center UV Level Display */}
        <div className="z-10 flex flex-col items-center text-center">
          <div className="text-xs text-amber-300 font-semibold uppercase flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            <span>UV Index</span>
          </div>

          <div className="text-3xl font-black font-mono tracking-tight text-white my-0.5">
            {uvMeta.level}
            <span className="text-xs font-normal text-slate-400 ml-0.5">/12</span>
          </div>

          {/* Level Category Pill */}
          <div
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
            style={{ backgroundColor: `${uvMeta.color}25`, borderColor: `${uvMeta.color}60`, color: uvMeta.color }}
          >
            {uvMeta.category}
          </div>
        </div>
      </div>

      {/* Exposure Time Badge */}
      <div className="w-full max-w-[210px] bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between my-1">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>T. Máx sin crema:</span>
        </div>
        <span className="text-xs font-bold font-mono text-amber-300">{uvMeta.maxRecommendedTimeMin}</span>
      </div>

      {/* Recommended Protection Advice */}
      <div className={`w-full max-w-[210px] border rounded-xl p-2 text-left my-1 ${uvMeta.bgColor}`}>
        <div className="flex items-center gap-1.5 text-[10px] font-bold mb-0.5" style={{ color: uvMeta.color }}>
          <Glasses className="w-3.5 h-3.5" />
          <span>Protección Solar Recomendada</span>
        </div>
        <p className="text-[10px] text-slate-200 leading-tight">
          {uvMeta.advice}
        </p>
      </div>
    </div>
  );
};
