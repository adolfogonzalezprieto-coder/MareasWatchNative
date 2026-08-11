import React from 'react';
import { MarineWeatherData } from '../types';
import { ArrowLeft, Clock, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';
import { formatTimeUntil } from '../utils/tideCalculations';

interface Props {
  data: MarineWeatherData;
  onBack: () => void;
}

export const WearOSTideGraphTile: React.FC<Props> = ({ data, onBack }) => {
  const currentHour = new Date().getHours();
  
  // Calculate SVG curve path coordinates
  const hourly = data.hourlyTides || [];
  const svgWidth = 200;
  const svgHeight = 70;
  const padding = 10;
  
  const minH = 0;
  const maxH = 3.5;

  const points = hourly.map((pt, i) => {
    const x = padding + (i / 23) * (svgWidth - 2 * padding);
    const normalizedY = (pt.height - minH) / (maxH - minH);
    const y = svgHeight - padding - normalizedY * (svgHeight - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  // Current time X coordinate
  const currentX = padding + (currentHour / 23) * (svgWidth - 2 * padding);
  const currentPt = hourly[currentHour] || hourly[0];
  const currentY = currentPt ? svgHeight - padding - ((currentPt.height - minH) / (maxH - minH)) * (svgHeight - 2 * padding) : svgHeight / 2;

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
        <span className="text-xs font-bold text-cyan-300 tracking-wide uppercase">Mareas 24 Horas</span>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Tide Wave Curve SVG */}
      <div className="w-full max-w-[220px] bg-slate-900/90 border border-slate-800 rounded-2xl p-2 my-1 shadow-lg">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1 px-1">
          <span>00:00</span>
          <span className="text-cyan-400 font-bold">{currentHour}:00 ({data.currentTideLevel.toFixed(1)}m)</span>
          <span>23:00</span>
        </div>

        <div className="relative w-full h-[75px] bg-cyan-950/20 rounded-xl overflow-hidden border border-cyan-500/20">
          <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            {/* Grid horizontal lines */}
            <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="rgba(255,255,255,0.1)" strokeDasharray="2,2" />
            
            {/* Wave area fill */}
            <polygon
              points={`0,${svgHeight} ${points} ${svgWidth},${svgHeight}`}
              fill="url(#waveFill)"
              opacity="0.4"
            />
            
            {/* Wave curve line */}
            <polyline
              points={points}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Current hour vertical bar and marker */}
            <line x1={currentX} y1="0" x2={currentX} y2={svgHeight} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
            <circle cx={currentX} cy={currentY} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

            <defs>
              <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Next High & Low Tide List */}
      <div className="w-full max-w-[210px] space-y-1 my-1">
        {data.nextTides.slice(0, 2).map((tide, idx) => (
          <div
            key={idx}
            className={`p-1.5 px-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
              tide.type === 'HIGH'
                ? 'bg-cyan-950/60 border-cyan-500/30 text-cyan-200'
                : 'bg-amber-950/60 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium">
              {tide.type === 'HIGH' ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{tide.type === 'HIGH' ? 'Pleamar' : 'Bajamar'}</span>
            </div>
            <div className="flex items-center gap-2 font-mono font-bold">
              <span>{tide.time}</span>
              <span className="text-[10px] opacity-80">{tide.height}m</span>
            </div>
          </div>
        ))}
      </div>

      {/* Moon Phase & Tide Coeff Badge */}
      <div className="flex items-center gap-2 text-[10px] text-purple-300 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full">
        <span>{data.moonPhase.icon} {data.moonPhase.name}</span>
        <span className="font-bold">Coef. {data.moonPhase.coefficient}</span>
      </div>
    </div>
  );
};
