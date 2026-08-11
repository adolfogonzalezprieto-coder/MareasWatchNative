import React, { useState } from 'react';
import { CoastalSpot } from '../types';
import { POPULAR_COASTAL_SPOTS } from '../utils/weatherIcons';
import { Search, MapPin, Navigation, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpot: (spot: CoastalSpot) => void;
  onUseCurrentGPS: () => void;
  currentSpotName: string;
}

export const LocationSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectSpot,
  onUseCurrentGPS,
  currentSpotName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');

  if (!isOpen) return null;

  const filteredSpots = POPULAR_COASTAL_SPOTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      onSelectSpot({
        name: `Coords (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
        region: 'Personalizado',
        country: 'GPS',
        lat,
        lon,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold">Seleccionar Costa / Puerto</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Current Location Button */}
        <button
          onClick={() => {
            onUseCurrentGPS();
            onClose();
          }}
          className="w-full bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-800/80 hover:to-blue-800/80 border border-cyan-500/40 rounded-2xl p-3.5 flex items-center justify-between group active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-cyan-200">Usar Ubicación GPS Actual</div>
              <div className="text-[11px] text-cyan-400/80">Detectar coordenadas automáticas de tu dispositivo</div>
            </div>
          </div>
          <Check className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar puerto o playa (Cádiz, Barcelona, A Coruña, Miami...)"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Popular Spots Grid */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Puertos & Playas Destacadas
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredSpots.map((spot, idx) => {
              const isSelected = currentSpotName.toLowerCase().includes(spot.name.toLowerCase());
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectSpot(spot);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{spot.name}</div>
                    <div className="text-[10px] text-slate-400">{spot.region}, {spot.country}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Coordinates Collapsible */}
        <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="number"
            step="any"
            value={customLat}
            onChange={(e) => setCustomLat(e.target.value)}
            placeholder="Latitud (e.g. 36.52)"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500"
          />
          <input
            type="number"
            step="any"
            value={customLon}
            onChange={(e) => setCustomLon(e.target.value)}
            placeholder="Longitud (e.g. -6.29)"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500"
          />
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl"
          >
            Ir
          </button>
        </form>
      </div>
    </div>
  );
};
