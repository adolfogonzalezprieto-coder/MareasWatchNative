import React from 'react';
import { MarineWeatherData, AIInsights } from '../types';
import { ArrowLeft, Sparkles, Navigation, ShieldAlert, Fish, Sailboat, Sun } from 'lucide-react';

interface Props {
  data: MarineWeatherData;
  aiInsights: AIInsights | null;
  onBack: () => void;
}

export const WearOSAIAssistantTile: React.FC<Props> = ({ data, aiInsights, onBack }) => {
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
        <div className="flex items-center gap-1 text-xs font-bold text-purple-300 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span>IA Marina</span>
        </div>
        <div className="w-6" />
      </div>

      {/* AI Summary Card */}
      <div className="w-full max-w-[210px] bg-gradient-to-b from-purple-950/80 via-indigo-950/80 to-slate-900 border border-purple-500/40 rounded-2xl p-2.5 my-1 text-left shadow-lg">
        <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Diagnóstico Costero</span>
        </div>
        <p className="text-xs text-purple-100 font-sans leading-relaxed">
          {aiInsights?.summary || 'Calculando condiciones óptimas de marea y viento para tu ubicación...'}
        </p>
      </div>

      {/* Activity Recommendations */}
      <div className="w-full max-w-[210px] space-y-1 my-1">
        {/* Surf */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-start gap-2 text-left">
          <div className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <Navigation className="w-3 h-3" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-cyan-300">Surf / Bodyboard</div>
            <p className="text-[10px] text-slate-300 leading-tight">
              {aiInsights?.surf || `Olas de ${data.waveHeight.toFixed(1)}m con viento de ${Math.round(data.windSpeed)} km/h.`}
            </p>
          </div>
        </div>

        {/* Fishing */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-start gap-2 text-left">
          <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Fish className="w-3 h-3" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-amber-300">Pesca Deportiva</div>
            <p className="text-[10px] text-slate-300 leading-tight">
              {aiInsights?.fishing || `Mejor actividad durante el repunte de ${data.tideTrend === 'RISING' ? 'Pleamar' : 'Bajamar'}.`}
            </p>
          </div>
        </div>

        {/* Sailing */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-start gap-2 text-left">
          <div className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sailboat className="w-3 h-3" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-indigo-300">Navegación & Vela</div>
            <p className="text-[10px] text-slate-300 leading-tight">
              {aiInsights?.sailing || `Viento de dirección ${data.windDirection}°. Velo con precaución.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
