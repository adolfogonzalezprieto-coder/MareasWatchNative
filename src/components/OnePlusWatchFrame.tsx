import React, { useState, useEffect } from 'react';
import { MarineWeatherData, AIInsights, WatchTile } from '../types';
import { WearOSGlanceTile } from './WearOSGlanceTile';
import { WearOSTideGraphTile } from './WearOSTideGraphTile';
import { WearOSWeatherTile } from './WearOSWeatherTile';
import { WearOSMarineTile } from './WearOSMarineTile';
import { WearOSAIAssistantTile } from './WearOSAIAssistantTile';
import { WearOSUVTile } from './WearOSUVTile';
import { Wifi, BatteryCharging, Radio, RotateCw, Sparkles, Smartphone, Download, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  data: MarineWeatherData;
  aiInsights: AIInsights | null;
  activeTile: WatchTile;
  onSelectTile: (tile: WatchTile) => void;
  onRefreshGPS: () => void;
  onToggleDashboard: () => void;
  onOpenGuide: () => void;
  isLoading: boolean;
}

export const OnePlusWatchFrame: React.FC<Props> = ({
  data,
  aiInsights,
  activeTile,
  onSelectTile,
  onRefreshGPS,
  onToggleDashboard,
  onOpenGuide,
  isLoading,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [hapticTrigger, setHapticTrigger] = useState<boolean>(false);

  // Update digital watch clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerHaptic = () => {
    setHapticTrigger(true);
    setTimeout(() => setHapticTrigger(false), 200);
  };

  const handleCrownClick = () => {
    triggerHaptic();
    const tiles: WatchTile[] = ['GLANCE', 'GRAFICO', 'MAREAS', 'UV_INDEX', 'VIENTO', 'OLEAJE', 'IA_ASSISTANT'];
    const currentIndex = tiles.indexOf(activeTile);
    const nextIndex = (currentIndex + 1) % tiles.length;
    onSelectTile(tiles[nextIndex]);
  };

  const handleActionButtonClick = () => {
    triggerHaptic();
    onRefreshGPS();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Top Simulator Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-200">OnePlus Watch 3 (Wear OS 4)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDashboard}
            className="flex items-center gap-1.5 text-xs bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Vista Móvil / PC</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
            title="Instrucciones de Instalación en OnePlus Watch 3"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Instalar</span>
          </button>
        </div>
      </div>

      {/* Physical Smartwatch Frame Outer Container */}
      <div className="relative flex items-center justify-center my-2">
        {/* Top & Bottom Strap Attachments (Silicone Strap Texture) */}
        <div className="absolute -top-16 w-36 h-20 bg-slate-900 border-x-2 border-slate-800 rounded-t-3xl shadow-inner -z-10 bg-gradient-to-b from-slate-950 to-slate-900" />
        <div className="absolute -bottom-16 w-36 h-20 bg-slate-900 border-x-2 border-slate-800 rounded-b-3xl shadow-inner -z-10 bg-gradient-to-t from-slate-950 to-slate-900" />

        {/* Physical Stainless Steel Bezel */}
        <div 
          className={`relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-full bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-900 p-3 sm:p-4 shadow-2xl border-4 border-slate-600/80 transition-all ${
            hapticTrigger ? 'ring-4 ring-cyan-500/50 scale-[0.99]' : ''
          }`}
        >
          {/* Bezel Tick Marks (Minute Indicators) */}
          <div className="absolute inset-0 rounded-full border-[10px] border-slate-950 pointer-events-none opacity-80" />

          {/* Right Top Crown Button (Interactive) */}
          <button
            onClick={handleCrownClick}
            className="absolute -right-3.5 top-20 w-5 h-12 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-800 rounded-r-md border border-slate-500 shadow-md flex items-center justify-center active:scale-95 group transition-transform z-30"
            title="Girar / Pulsar Corona Rotatoria (Cambiar Pantalla)"
          >
            <div className="w-1 h-8 bg-slate-950/60 rounded-full group-hover:bg-cyan-400 transition-colors" />
          </button>

          {/* Right Bottom Flat Action Button (Interactive) */}
          <button
            onClick={handleActionButtonClick}
            className="absolute -right-2.5 bottom-24 w-4 h-10 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-800 rounded-r-sm border border-slate-600 shadow-md active:scale-95 group transition-transform z-30"
            title="Boton de Acción: Actualizar GPS"
          >
            <div className="w-0.5 h-6 bg-slate-900 group-hover:bg-amber-400 transition-colors" />
          </button>

          {/* Inner Display Ring & True Black AMOLED Circular Screen */}
          <div className="relative w-full h-full rounded-full bg-black overflow-hidden border-2 border-slate-900 flex flex-col items-center justify-between p-2 shadow-inner">
            
            {/* Watch Top Status Bar (Time, Battery, GPS) */}
            <div className="z-20 w-full flex items-center justify-between px-6 pt-1 text-[11px] font-mono font-semibold text-slate-400">
              <span className="text-cyan-300 font-bold">{currentTime}</span>
              
              {/* Center status icon */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>GPS</span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-300">
                <span>94%</span>
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Smartwatch Screen Content Container */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center text-cyan-400 gap-2 p-4 text-center">
                  <RotateCw className="w-8 h-8 animate-spin text-cyan-400" />
                  <span className="text-xs font-medium text-slate-200">Localizando GPS y Mareas...</span>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTile}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {activeTile === 'GLANCE' && (
                      <WearOSGlanceTile
                        data={data}
                        aiInsights={aiInsights}
                        onSelectTile={onSelectTile}
                        onRefreshGPS={onRefreshGPS}
                      />
                    )}
                    {(activeTile === 'GRAFICO' || activeTile === 'MAREAS') && (
                      <WearOSTideGraphTile data={data} onBack={() => onSelectTile('GLANCE')} />
                    )}
                    {activeTile === 'UV_INDEX' && (
                      <WearOSUVTile data={data} onBack={() => onSelectTile('GLANCE')} />
                    )}
                    {activeTile === 'VIENTO' && (
                      <WearOSWeatherTile data={data} onBack={() => onSelectTile('GLANCE')} />
                    )}
                    {(activeTile === 'OLEAJE' || activeTile === 'TIEMPO') && (
                      <WearOSMarineTile data={data} onBack={() => onSelectTile('GLANCE')} />
                    )}
                    {activeTile === 'IA_ASSISTANT' && (
                      <WearOSAIAssistantTile data={data} aiInsights={aiInsights} onBack={() => onSelectTile('GLANCE')} />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Watch Bottom Tile Indicator Dots */}
            <div className="z-20 flex items-center justify-center gap-1.5 pb-1">
              {(['GLANCE', 'GRAFICO', 'UV_INDEX', 'VIENTO', 'OLEAJE', 'IA_ASSISTANT'] as WatchTile[]).map((tile) => (
                <button
                  key={tile}
                  onClick={() => onSelectTile(tile)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeTile === tile ? 'w-4 bg-cyan-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Cambiar a pantalla ${tile}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Quick Tips */}
      <div className="text-center text-xs text-slate-400 mt-4 space-y-1">
        <p>💡 <span className="text-slate-200 font-medium">Consejo OnePlus Watch 3:</span> Pulsa la corona lateral derecha para alternar entre las pantallas de mareas, viento e IA.</p>
      </div>
    </div>
  );
};
