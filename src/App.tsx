import React, { useState, useEffect, useCallback } from 'react';
import { MarineWeatherData, AIInsights, WatchTile, DisplayMode, CoastalSpot } from './types';
import { generateTideData } from './utils/tideCalculations';
import { OnePlusWatchFrame } from './components/OnePlusWatchFrame';
import { DesktopDashboard } from './components/DesktopDashboard';
import { LocationSearchModal } from './components/LocationSearchModal';
import { InstallGuideModal } from './components/InstallGuideModal';
import { Waves, Navigation, RefreshCw } from 'lucide-react';

export default function App() {
  // Coordinates (Default Cadiz)
  const [coords, setCoords] = useState<{ lat: number; lon: number; name: string }>({
    lat: 36.5298,
    lon: -6.2927,
    name: 'Cádiz, Andalucía',
  });

  const [marineData, setMarineData] = useState<MarineWeatherData | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  
  const [displayMode, setDisplayMode] = useState<DisplayMode>('WATCH_SIMULATOR');
  const [activeTile, setActiveTile] = useState<WatchTile>('GLANCE');
  
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Marine & Weather Data
  const loadData = useCallback(async (lat: number, lon: number, customName?: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Try server endpoint
      const res = await fetch(`/api/weather-tides?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error('Servidor no disponible');
      
      const json = await res.json();
      const weather = json.weather?.current || {};
      const marine = json.marine?.current || {};
      const locationName = customName || json.locationName || 'Costa Local';

      // Generate astronomical tide predictions
      const tideInfo = generateTideData(lat, lon, new Date(), json.marine);

      const combinedData: MarineWeatherData = {
        latitude: lat,
        longitude: lon,
        locationName,
        timestamp: new Date().toISOString(),

        temperature: weather.temperature_2m ?? 23.5,
        apparentTemp: weather.apparent_temperature ?? 24.1,
        weatherCode: weather.weather_code ?? 0,
        weatherText: 'Despejado',
        isDay: weather.is_day !== 0,

        windSpeed: weather.wind_speed_10m ?? 16.5,
        windDirection: weather.wind_direction_10m ?? 225,
        windGusts: weather.wind_gusts_10m ?? 22.0,
        pressure: weather.surface_pressure ?? 1016,
        humidity: weather.relative_humidity_2m ?? 68,
        uvIndex: weather.uv_index ?? 6,
        precipitationProb: 10,

        waveHeight: marine.wave_height ?? 1.1,
        wavePeriod: marine.wave_period ?? 8,
        waveDirection: marine.wave_direction ?? 240,
        swellHeight: marine.swell_wave_height ?? 0.9,
        waterTemperature: 21.0,

        currentTideLevel: tideInfo.currentTideLevel,
        tideTrend: tideInfo.tideTrend,
        tideProgress: tideInfo.tideProgress,
        nextTides: tideInfo.nextTides,
        hourlyTides: tideInfo.hourlyTides,
        moonPhase: tideInfo.moonPhase,

        sunrise: json.weather?.daily?.sunrise?.[0] || '07:30',
        sunset: json.weather?.daily?.sunset?.[0] || '21:15',
      };

      setMarineData(combinedData);

      // 2. Fetch AI Insights from Gemini API
      try {
        const aiRes = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: locationName,
            temperature: combinedData.temperature,
            windSpeed: combinedData.windSpeed,
            windDirection: combinedData.windDirection,
            waveHeight: combinedData.waveHeight,
            tideState: combinedData.currentTideLevel.toFixed(1) + 'm',
            tideTrend: combinedData.tideTrend === 'RISING' ? 'Subiendo' : 'Bajando',
            moonPhase: combinedData.moonPhase.name,
          }),
        });
        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          if (aiJson.insights) setAiInsights(aiJson.insights);
        }
      } catch (e) {
        console.warn('AI insights fetch fallback:', e);
      }

    } catch (err: any) {
      console.warn('Fallback local tide generation:', err);
      // Fallback local computation if API unavailable
      const tideInfo = generateTideData(lat, lon, new Date());
      setMarineData({
        latitude: lat,
        longitude: lon,
        locationName: customName || 'Costa (Local)',
        timestamp: new Date().toISOString(),
        temperature: 24,
        apparentTemp: 25,
        weatherCode: 0,
        weatherText: 'Despejado',
        isDay: true,
        windSpeed: 18,
        windDirection: 220,
        windGusts: 24,
        pressure: 1015,
        humidity: 65,
        uvIndex: 7,
        precipitationProb: 0,
        waveHeight: 1.2,
        wavePeriod: 9,
        waveDirection: 230,
        swellHeight: 1.0,
        waterTemperature: 21,
        currentTideLevel: tideInfo.currentTideLevel,
        tideTrend: tideInfo.tideTrend,
        tideProgress: tideInfo.tideProgress,
        nextTides: tideInfo.nextTides,
        hourlyTides: tideInfo.hourlyTides,
        moonPhase: tideInfo.moonPhase,
        sunrise: '07:25',
        sunset: '21:20',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request browser GPS position
  const requestGPSLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocalización no soportada por el navegador');
      loadData(coords.lat, coords.lon, coords.name);
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon, name: 'Ubicación GPS' });
        loadData(lat, lon);
      },
      (err) => {
        console.warn('GPS position error:', err.message);
        setErrorMsg('Permiso de GPS no otorgado o inactivo. Mostrando Cádiz por defecto.');
        loadData(coords.lat, coords.lon, coords.name);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [coords, loadData]);

  // Initial load
  useEffect(() => {
    requestGPSLocation();
  }, []);

  const handleSelectSpot = (spot: CoastalSpot) => {
    setCoords({ lat: spot.lat, lon: spot.lon, name: spot.name });
    loadData(spot.lat, spot.lon, spot.name);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* View Switcher Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Waves className="w-4 h-4 animate-pulse" />
            </div>
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              Mareas & Tiempo Watch
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDisplayMode('WATCH_SIMULATOR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                displayMode === 'WATCH_SIMULATOR'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              ⌚ OnePlus Watch 3
            </button>

            <button
              onClick={() => setDisplayMode('DESKTOP_DASHBOARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                displayMode === 'DESKTOP_DASHBOARD'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              🖥️ Panel Completo
            </button>
          </div>
        </div>
      </header>

      {/* GPS Notice Toast */}
      {errorMsg && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-center text-xs text-amber-200">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main View Area */}
      <main className="py-6">
        {displayMode === 'WATCH_SIMULATOR' ? (
          marineData ? (
            <OnePlusWatchFrame
              data={marineData}
              aiInsights={aiInsights}
              activeTile={activeTile}
              onSelectTile={setActiveTile}
              onRefreshGPS={requestGPSLocation}
              onToggleDashboard={() => setDisplayMode('DESKTOP_DASHBOARD')}
              onOpenGuide={() => setIsGuideOpen(true)}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="text-sm">Obteniendo datos de marea y tiempo GPS...</span>
            </div>
          )
        ) : (
          marineData && (
            <DesktopDashboard
              data={marineData}
              aiInsights={aiInsights}
              onRefreshGPS={requestGPSLocation}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenWatchMode={() => setDisplayMode('WATCH_SIMULATOR')}
              onOpenGuide={() => setIsGuideOpen(true)}
              isLoading={isLoading}
            />
          )
        )}
      </main>

      {/* Modals */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSpot={handleSelectSpot}
        onUseCurrentGPS={requestGPSLocation}
        currentSpotName={coords.name}
      />

      <InstallGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
