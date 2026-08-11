import React, { useState } from 'react';
import { MarineWeatherData, AIInsights, CoastalSpot } from '../types';
import { 
  Navigation, 
  Search, 
  Waves, 
  Wind, 
  Compass, 
  Thermometer, 
  Sun, 
  Moon, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  ShieldAlert, 
  Fish, 
  Sailboat,
  Watch,
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';
import { getWeatherMeta, getWindDirectionLabel } from '../utils/weatherIcons';
import { formatTimeUntil } from '../utils/tideCalculations';
import { getUVMeta } from '../utils/uvCalculations';

interface Props {
  data: MarineWeatherData;
  aiInsights: AIInsights | null;
  onRefreshGPS: () => void;
  onOpenSearch: () => void;
  onOpenWatchMode: () => void;
  onOpenGuide: () => void;
  isLoading: boolean;
}

export const DesktopDashboard: React.FC<Props> = ({
  data,
  aiInsights,
  onRefreshGPS,
  onOpenSearch,
  onOpenWatchMode,
  onOpenGuide,
  isLoading,
}) => {
  const weatherMeta = getWeatherMeta(data.weatherCode, data.isDay);
  const IconComp = weatherMeta.icon;
  const windDirLabel = getWindDirectionLabel(data.windDirection);
  const uvMeta = getUVMeta(data.uvIndex);

  const nextHigh = data.nextTides.find(t => t.type === 'HIGH');
  const nextLow = data.nextTides.find(t => t.type === 'LOW');
  const isRising = data.tideTrend === 'RISING';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      {/* Navbar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Mareas & Tiempo Local</h1>
              <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                OnePlus Watch 3 Ready
              </span>
            </div>
            
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium mt-1 group"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="underline decoration-dashed underline-offset-4">{data.locationName}</span>
              <span className="text-slate-500 font-mono">({data.latitude.toFixed(2)}°, {data.longitude.toFixed(2)}°)</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onRefreshGPS}
            disabled={isLoading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>GPS Localizar</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span>Buscar Costa</span>
          </button>

          <button
            onClick={onOpenWatchMode}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
          >
            <Watch className="w-4 h-4" />
            <span>Modo OnePlus Watch 3</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 p-2.5 rounded-xl transition-all"
            title="Instrucciones de instalación en Smartwatch"
          >
            <Watch className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Live Tide Hero + Weather Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Tide Hero Card (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Waves className="w-4 h-4 animate-pulse" />
                <span>Estado Actual de la Marea</span>
              </div>
              <h2 className="text-3xl font-black text-white mt-1">
                {isRising ? 'Marea Creciente (Flujo)' : 'Marea Vaciante (Reflujo)'}
              </h2>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/80 border border-purple-500/30 px-4 py-2 rounded-2xl">
              <span className="text-2xl">{data.moonPhase.icon}</span>
              <div>
                <div className="text-xs font-bold text-purple-300">{data.moonPhase.name}</div>
                <div className="text-[11px] text-slate-400">
                  Coeficiente <span className="font-bold text-purple-400">{data.moonPhase.coefficient}</span> ({data.moonPhase.isSpringTide ? 'Marea Viva' : 'Marea Muerta'})
                </div>
              </div>
            </div>
          </div>

          {/* Big Tide Level Display & Next Tide Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center my-4">
            
            {/* Current Level Gauge */}
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-xs text-slate-400 uppercase font-medium">Nivel del Mar</span>
              <div className="text-5xl font-black text-cyan-300 font-mono tracking-tight my-1">
                {data.currentTideLevel.toFixed(2)}
                <span className="text-xl font-normal text-slate-400 ml-1">m</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                {isRising ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{data.tideProgress}% completado</span>
              </div>
            </div>

            {/* Next High Tide */}
            {nextHigh && (
              <div className="bg-cyan-950/50 border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Próxima Pleamar</div>
                  <div className="text-xl font-bold font-mono text-cyan-200">{nextHigh.time}</div>
                  <div className="text-xs text-cyan-400 font-medium">
                    {nextHigh.height}m ({formatTimeUntil(nextHigh.isoTime)})
                  </div>
                </div>
              </div>
            )}

            {/* Next Low Tide */}
            {nextLow && (
              <div className="bg-amber-950/50 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Próxima Bajamar</div>
                  <div className="text-xl font-bold font-mono text-amber-200">{nextLow.time}</div>
                  <div className="text-xs text-amber-400 font-medium">
                    {nextLow.height}m ({formatTimeUntil(nextLow.isoTime)})
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next 4 Tide Events Schedule Row */}
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.nextTides.map((t, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {t.type === 'HIGH' ? 'Pleamar' : 'Bajamar'}
                </div>
                <div className="text-sm font-bold font-mono text-white my-0.5">{t.time}</div>
                <div className="text-[11px] text-cyan-400 font-medium">{t.height}m</div>
              </div>
            ))}
          </div>
        </div>

        {/* Local Weather Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Meteorología Local</span>
              <span className="text-xs text-slate-400 font-mono">{weatherMeta.text}</span>
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-3">
                <IconComp className="w-12 h-12 text-amber-400 drop-shadow-md" />
                <div>
                  <div className="text-4xl font-black font-mono text-white tracking-tight">
                    {Math.round(data.temperature)}°C
                  </div>
                  <div className="text-xs text-slate-400">
                    Sensación: <span className="text-slate-200 font-medium">{Math.round(data.apparentTemp)}°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wind Details Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 my-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <span>Viento del {windDirLabel} ({data.windDirection}°)</span>
                </span>
                <span className="font-bold font-mono text-white">{Math.round(data.windSpeed)} km/h</span>
              </div>
              {data.windGusts > data.windSpeed && (
                <div className="text-[11px] text-amber-400 font-mono text-right">
                  Rachas hasta {Math.round(data.windGusts)} km/h
                </div>
              )}
            </div>

            {/* UV Radiation Card */}
            <div className={`border rounded-2xl p-3 my-3 ${uvMeta.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: uvMeta.color }}>
                  <Sun className="w-4 h-4" />
                  <span>Índice de Rayos UV</span>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full border" style={{ backgroundColor: `${uvMeta.color}20`, borderColor: `${uvMeta.color}50`, color: uvMeta.color }}>
                  {uvMeta.category} ({uvMeta.level}/12)
                </span>
              </div>

              {/* Progress Bar Gauge */}
              <div className="w-full bg-slate-950/80 rounded-full h-2.5 my-2.5 overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (uvMeta.level / 12) * 100)}%`, backgroundColor: uvMeta.color }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Tiempo Máx. Exposición: <strong className="text-amber-300 font-mono">{uvMeta.maxRecommendedTimeMin}</strong></span>
                <span className="text-[10px] text-slate-400">FPS 30+ Recomendado</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight mt-1.5 border-t border-slate-800/60 pt-1.5">
                {uvMeta.advice}
              </p>
            </div>

            {/* Quick Weather Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <div className="text-slate-400 text-[10px]">Oleaje / Swell</div>
                <div className="font-bold font-mono text-cyan-300 text-sm mt-0.5">{data.waveHeight.toFixed(1)}m</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <div className="text-slate-400 text-[10px]">Punto de Rocío</div>
                <div className="font-bold font-mono text-amber-400 text-sm mt-0.5">{Math.round(data.apparentTemp)}°C</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <div className="text-slate-400 text-[10px]">Humedad</div>
                <div className="font-bold font-mono text-sky-400 text-sm mt-0.5">{data.humidity}%</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <div className="text-slate-400 text-[10px]">Presión</div>
                <div className="font-bold font-mono text-purple-300 text-sm mt-0.5">{Math.round(data.pressure)} hPa</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Interactive Tide Curve Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Curva Horaria de Marea (24 Horas)</span>
            </h3>
            <p className="text-xs text-slate-400">Evolución del nivel de agua en metros para {data.locationName}</p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1"><div className="w-3 h-1 bg-cyan-400 rounded" /> Marea (m)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-1 bg-indigo-500 rounded" /> Oleaje (m)</span>
          </div>
        </div>

        {/* 24h Bar / Line Visualization */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
          <div className="min-w-[700px] h-48 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-800 relative">
            {data.hourlyTides.map((pt, idx) => {
              const currentHour = new Date().getHours();
              const isCurrent = idx === currentHour;
              const heightPercent = Math.min(100, Math.max(10, (pt.height / 3.5) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Height Tag on hover or active */}
                  <div className={`text-[10px] font-mono transition-opacity ${isCurrent ? 'font-bold text-cyan-300 opacity-100' : 'text-slate-500 opacity-60 group-hover:opacity-100'}`}>
                    {pt.height.toFixed(1)}m
                  </div>

                  {/* Tide Bar */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[18px] rounded-t-md transition-all duration-300 ${
                      isCurrent 
                        ? 'bg-gradient-to-t from-cyan-600 to-sky-400 shadow-lg shadow-cyan-500/50 border-t-2 border-white' 
                        : 'bg-slate-800 group-hover:bg-cyan-900'
                    }`}
                  />

                  {/* Hour Label */}
                  <span className={`text-[10px] font-mono ${isCurrent ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                    {pt.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Marine Recommendations Card */}
      {aiInsights && (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            <span>Asistente IA para Actividades Marítimas (Gemini AI)</span>
          </div>

          <div className="bg-slate-950/60 border border-purple-500/20 rounded-2xl p-4">
            <p className="text-sm text-purple-100 leading-relaxed italic font-sans">
              "{aiInsights.summary}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 font-bold text-xs text-cyan-300 mb-1">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Surf & Deportes de Ola</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{aiInsights.surf}</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-300 mb-1">
                <Fish className="w-4 h-4 text-amber-400" />
                <span>Pesca de Costa y Embarcación</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{aiInsights.fishing}</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 font-bold text-xs text-indigo-300 mb-1">
                <Sailboat className="w-4 h-4 text-indigo-400" />
                <span>Navegación & Seguridad</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{aiInsights.sailing}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
