export interface TideEvent {
  time: string; // "14:25"
  isoTime: string;
  type: 'HIGH' | 'LOW';
  height: number; // in meters
  coefficient?: number; // 20 to 120 (mareas vivas vs muertas)
}

export interface HourlyTidePoint {
  time: string; // "14:00"
  isoTime: string;
  height: number; // meters
  waveHeight: number; // meters
  temperature: number; // °C
  windSpeed: number; // km/h
}

export interface MoonPhaseInfo {
  name: string; // e.g. "Luna Llena", "Cuarto Creciente"
  icon: string; // symbol or emoji
  illumination: number; // 0 - 100%
  phaseValue: number; // 0 to 1
  isSpringTide: boolean; // True if Marea Viva (Full or New moon)
  coefficient: number; // 20 - 120
}

export interface MarineWeatherData {
  latitude: number;
  longitude: number;
  locationName: string;
  timestamp: string;
  
  // Current Weather
  temperature: number;
  apparentTemp: number;
  weatherCode: number;
  weatherText: string;
  isDay: boolean;
  
  // Wind & Atmosphere
  windSpeed: number; // km/h
  windDirection: number; // degrees
  windGusts: number; // km/h
  pressure: number; // hPa
  humidity: number; // %
  uvIndex: number;
  precipitationProb: number; // %
  
  // Waves & Sea
  waveHeight: number; // m
  wavePeriod: number; // s
  waveDirection: number; // degrees
  swellHeight: number; // m
  waterTemperature: number; // °C
  
  // Tides
  currentTideLevel: number; // m
  tideTrend: 'RISING' | 'FALLING' | 'STATIONARY';
  tideProgress: number; // 0 to 100% of cycle
  nextTides: TideEvent[];
  hourlyTides: HourlyTidePoint[];
  moonPhase: MoonPhaseInfo;
  
  // Astronomy
  sunrise: string;
  sunset: string;
}

export interface AIInsights {
  summary: string;
  surf: string;
  fishing: string;
  sailing: string;
  safety: string;
}

export type WatchTile = 'GLANCE' | 'MAREAS' | 'VIENTO' | 'OLEAJE' | 'UV_INDEX' | 'TIEMPO' | 'IA_ASSISTANT' | 'GRAFICO';

export type DisplayMode = 'WATCH_SIMULATOR' | 'DESKTOP_DASHBOARD' | 'INSTALL_GUIDE';

export interface CoastalSpot {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  isPopular?: boolean;
}
