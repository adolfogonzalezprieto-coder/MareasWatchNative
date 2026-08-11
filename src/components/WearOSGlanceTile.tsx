import React from 'react';
import { MarineWeatherData, AIInsights, WatchTile } from '../types';
import { Waves, Wind, Compass, Sparkles, Navigation, ArrowUpRight, ArrowDownRight, Droplet, Sun } from 'lucide-react';
import { formatTimeUntil } from '../utils/tideCalculations';
import { getWindDirectionLabel } from '../utils/weatherIcons';
import { getUVMeta } from '../utils/uvCalculations';

interface Props {
  data: MarineWeatherData;
  aiInsights: AIInsights | null;
  onSelectTile: (tile: WatchTile) => void;
  onRefreshGPS: () => void;
}

export const WearOSGlanceTile: React.FC<Props> = ({
  data,
  aiInsights,
  onSelectTile,
  onRefreshGPS,
}) => {
  const nextHigh = data.nextTides.find((t) => t.type === 'HIGH');
  const nextLow = data.nextTides.find((t) => t.type === 'LOW');
  
  // Next imminent tide event
  const nextTide = data.nextTides[0];
  const isRising = data.tideTrend === 'RISING';

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 text-white select-none overflow-y-auto no-scrollbar">
      {/* Location & GPS Header */}
      <button
        onClick={onRefreshGPS}
        className="flex items-center gap-1.5 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 rounded-full px-3 py-1 text-[11px] font-medium text-cyan-200 transition-all active:scale-95 mt-1"
        title="Actualizar GPS"
      >
        <Navigation className="w-3 h-3 text-cyan-400 animate-pulse" />
        <span className="truncate max-w-[150px]">{data.locationName}</span>
      </button>

      {/* Main Circular Arc Gauge for Tide Status */}
      <div 
        onClick={() => onSelectTile('MAREAS')}
        className="relative w-40 h-40 flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition-transform"
      >
        {/* Outer Circular SVG Arc Gauge */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Arc track */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeDasharray="264"
            strokeDashoffset="30"
            strokeLinecap="round"
          />
          {/* Active Gradient Tide Arc */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke="url(#tideGradient)"
            strokeWidth="8"
            strokeDasharray="264"
            strokeDashoffset={264 - (234 * (data.tideProgress / 100))}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="tideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Tide Text */}
        <div className="z-10 flex flex-col items-center text-center px-2">
          <div className="flex items-center gap-1 text-cyan-300 font-semibold text-xs tracking-wide uppercase">
            {isRising ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            )}
            <span>{isRising ? 'Flujo' : 'Reflujo'}</span>
          </div>

          <div className="text-2xl font-black tracking-tight text-white my-0.5 font-mono">
            {data.currentTideLevel.toFixed(1)}
            <span className="text-sm font-normal text-slate-300 ml-0.5">m</span>
          </div>

          <div className="text-[11px] text-cyan-200/90 font-medium">
            {nextTide ? (
              <span>
                {nextTide.type === 'HIGH' ? 'Pleamar' : 'Bajamar'} {formatTimeUntil(nextTide.isoTime)}
              </span>
            ) : (
              'Marea Estable'
            )}
          </div>
        </div>
      </div>

      {/* Quick Glance Metrics Grid (2x2) */}
      <div className="grid grid-cols-2 gap-1.5 w-full max-w-[210px] my-1">
        {/* Wind */}
        <button
          onClick={() => onSelectTile('VIENTO')}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-2 flex items-center gap-2 text-left active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Wind className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] text-slate-400 font-medium leading-none">Viento</div>
            <div className="text-[12px] font-bold text-slate-100 font-mono truncate leading-tight mt-0.5">
              {Math.round(data.windSpeed)} <span className="text-[9px] font-normal text-slate-400">km/h</span>
            </div>
          </div>
        </button>

        {/* Waves */}
        <button
          onClick={() => onSelectTile('OLEAJE')}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-2 flex items-center gap-2 text-left active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Waves className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] text-slate-400 font-medium leading-none">Oleaje</div>
            <div className="text-[12px] font-bold text-slate-100 font-mono truncate leading-tight mt-0.5">
              {data.waveHeight.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">m</span>
            </div>
          </div>
        </button>

        {/* Weather Temp */}
        <button
          onClick={() => onSelectTile('TIEMPO')}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-2 flex items-center gap-2 text-left active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Droplet className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] text-slate-400 font-medium leading-none">Temp.</div>
            <div className="text-[12px] font-bold text-slate-100 font-mono truncate leading-tight mt-0.5">
              {Math.round(data.temperature)}°C
            </div>
          </div>
        </button>

        {/* Tide Coefficient / Moon */}
        <button
          onClick={() => onSelectTile('MAREAS')}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-2 flex items-center gap-2 text-left active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs shrink-0">
            {data.moonPhase.icon}
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] text-slate-400 font-medium leading-none">Coeficiente</div>
            <div className="text-[12px] font-bold text-purple-300 font-mono truncate leading-tight mt-0.5">
              {data.moonPhase.coefficient}
            </div>
          </div>
        </button>
      </div>

      {/* Quick UV Index Pill */}
      <button
        onClick={() => onSelectTile('UV_INDEX')}
        className="w-full max-w-[210px] bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 rounded-xl p-1.5 px-2.5 flex items-center justify-between text-left active:scale-95 transition-all mb-1"
      >
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Radiación UV</span>
        </div>
        <div className="text-[10px] font-bold font-mono text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40">
          UV {data.uvIndex} • {getUVMeta(data.uvIndex).category}
        </div>
      </button>

      {/* AI Smart Glance Pill */}
      {aiInsights?.summary ? (
        <button
          onClick={() => onSelectTile('IA_ASSISTANT')}
          className="w-full max-w-[210px] bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-cyan-900/60 border border-purple-500/30 rounded-xl p-1.5 px-2.5 flex items-center gap-2 text-left active:scale-95 transition-all mb-1"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0 animate-pulse" />
          <p className="text-[10px] text-purple-100 leading-tight line-clamp-2 italic font-sans">
            "{aiInsights.summary}"
          </p>
        </button>
      ) : (
        <button
          onClick={() => onSelectTile('GRAFICO')}
          className="w-full max-w-[210px] bg-slate-900/90 border border-slate-700/60 rounded-xl py-1.5 text-center text-[10px] text-cyan-400 hover:text-cyan-300 font-medium active:scale-95 transition-all mb-1"
        >
          Ver Gráfico de Mareas 24h →
        </button>
      )}
    </div>
  );
};
