import React from 'react';
import { MarineWeatherData } from '../types';
import { ArrowLeft, Wind, Compass, Thermometer, Sun, Droplets, Gauge } from 'lucide-react';
import { getWeatherMeta, getWindDirectionLabel } from '../utils/weatherIcons';

interface Props {
  data: MarineWeatherData;
  onBack: () => void;
}

export const WearOSWeatherTile: React.FC<Props> = ({ data, onBack }) => {
  const meta = getWeatherMeta(data.weatherCode, data.isDay);
  const IconComponent = meta.icon;
  const windDirLabel = getWindDirectionLabel(data.windDirection);

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
        <span className="text-xs font-bold text-sky-300 tracking-wide uppercase">Tiempo y Viento</span>
        <div className="w-6" />
      </div>

      {/* Temp & Icon Main Card */}
      <div className="w-full max-w-[210px] bg-gradient-to-b from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-2xl p-2.5 flex items-center justify-around my-1 shadow-lg">
        <div className="flex flex-col items-center">
          <IconComponent className="w-8 h-8 text-amber-400 drop-shadow" />
          <span className="text-[10px] text-slate-300 font-medium mt-1 truncate max-w-[90px]">{meta.text}</span>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            {Math.round(data.temperature)}°
          </div>
          <div className="text-[10px] text-slate-400">
            Sens. <span className="font-semibold text-slate-200">{Math.round(data.apparentTemp)}°C</span>
          </div>
        </div>
      </div>

      {/* Wind Rose & Speed Card */}
      <div className="w-full max-w-[210px] bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex items-center justify-between my-1">
        {/* Wind Arrow Compass */}
        <div className="relative w-12 h-12 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
          <Compass className="w-full h-full text-slate-700 opacity-40 absolute" />
          <div 
            className="w-full h-full flex items-center justify-center transition-transform duration-500"
            style={{ transform: `rotate(${data.windDirection}deg)` }}
          >
            <div className="w-0.5 h-6 bg-rose-500 rounded-full relative">
              <div className="absolute top-0 -left-1 w-2.5 h-2.5 bg-rose-500 clip-arrow" />
            </div>
          </div>
          <span className="absolute text-[9px] font-bold text-sky-400 font-mono">{windDirLabel}</span>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-[10px] text-sky-400 font-medium">
            <Wind className="w-3 h-3" />
            <span>Viento en Costa</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-100">
            {Math.round(data.windSpeed)} <span className="text-[10px] text-slate-400 font-normal">km/h</span>
          </div>
          {data.windGusts > data.windSpeed && (
            <div className="text-[9px] text-amber-400 font-mono">
              Rachas: {Math.round(data.windGusts)} km/h
            </div>
          )}
        </div>
      </div>

      {/* Grid Details (UV, Humidity, Pressure) */}
      <div className="grid grid-cols-3 gap-1 w-full max-w-[210px]">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 text-center">
          <div className="text-[9px] text-slate-400">UV</div>
          <div className="text-xs font-bold text-amber-400 font-mono">{data.uvIndex}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 text-center">
          <div className="text-[9px] text-slate-400">Humedad</div>
          <div className="text-xs font-bold text-cyan-400 font-mono">{data.humidity}%</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 text-center">
          <div className="text-[9px] text-slate-400">Presión</div>
          <div className="text-xs font-bold text-purple-400 font-mono">{Math.round(data.pressure)}</div>
        </div>
      </div>
    </div>
  );
};
