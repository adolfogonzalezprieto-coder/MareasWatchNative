import React from 'react';
import { MarineWeatherData } from '../types';
import { ArrowLeft, Waves, Anchor, Thermometer, ShieldAlert } from 'lucide-react';

interface Props {
  data: MarineWeatherData;
  onBack: () => void;
}

export const WearOSMarineTile: React.FC<Props> = ({ data, onBack }) => {
  // Determine marine status rating
  let seaStatus = 'Mar Rizada / Óptima';
  let seaColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';

  if (data.waveHeight > 2.5 || data.windSpeed > 35) {
    seaStatus = 'Mar Gruesa / Precaución';
    seaColor = 'text-rose-400 border-rose-500/30 bg-rose-950/40';
  } else if (data.waveHeight > 1.2 || data.windSpeed > 20) {
    seaStatus = 'Marejada Moderada';
    seaColor = 'text-amber-400 border-amber-500/30 bg-amber-950/40';
  }

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
        <span className="text-xs font-bold text-indigo-300 tracking-wide uppercase">Oleaje y Mar</span>
        <div className="w-6" />
      </div>

      {/* Sea Condition Badge */}
      <div className={`w-full max-w-[210px] border px-3 py-1.5 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 my-1 ${seaColor}`}>
        <Waves className="w-3.5 h-3.5" />
        <span>{seaStatus}</span>
      </div>

      {/* Wave Height big card */}
      <div className="w-full max-w-[210px] bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-around my-1">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Altura Olas</span>
          <div className="text-3xl font-black font-mono text-cyan-300 tracking-tight mt-0.5">
            {data.waveHeight.toFixed(1)} <span className="text-sm font-normal text-slate-400">m</span>
          </div>
        </div>

        <div className="w-px h-8 bg-slate-800" />

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Período</span>
          <div className="text-3xl font-black font-mono text-indigo-300 tracking-tight mt-0.5">
            {Math.round(data.wavePeriod || 8)} <span className="text-sm font-normal text-slate-400">s</span>
          </div>
        </div>
      </div>

      {/* Water Temp & Swell */}
      <div className="grid grid-cols-2 gap-1.5 w-full max-w-[210px] my-1">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Thermometer className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400">Agua Mar</div>
            <div className="text-xs font-bold text-slate-100 font-mono">{data.waterTemperature}°C</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Anchor className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400">Mar de Fondo</div>
            <div className="text-xs font-bold text-slate-100 font-mono">{data.swellHeight.toFixed(1)}m</div>
          </div>
        </div>
      </div>
    </div>
  );
};
