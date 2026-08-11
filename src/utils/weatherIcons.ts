import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  Wind,
  Droplets
} from 'lucide-react';

export interface WeatherMeta {
  text: string;
  iconName: string;
  icon: React.ElementType;
  bgGradient: string;
  accentColor: string;
}

export function getWeatherMeta(code: number, isDay: boolean = true): WeatherMeta {
  switch (code) {
    case 0:
      return {
        text: isDay ? 'Despejado' : 'Noche Despejada',
        iconName: 'Sun',
        icon: Sun,
        bgGradient: 'from-amber-500/20 to-sky-500/10',
        accentColor: '#f59e0b',
      };
    case 1:
    case 2:
      return {
        text: 'Parcialmente Nublado',
        iconName: 'CloudSun',
        icon: CloudSun,
        bgGradient: 'from-blue-500/20 to-sky-400/10',
        accentColor: '#38bdf8',
      };
    case 3:
      return {
        text: 'Nublado',
        iconName: 'Cloud',
        icon: Cloud,
        bgGradient: 'from-slate-500/20 to-gray-600/10',
        accentColor: '#94a3b8',
      };
    case 45:
    case 48:
      return {
        text: 'Niebla / Bruma',
        iconName: 'CloudFog',
        icon: CloudFog,
        bgGradient: 'from-teal-500/20 to-slate-600/10',
        accentColor: '#2dd4bf',
      };
    case 51:
    case 53:
    case 55:
      return {
        text: 'Llovizna',
        iconName: 'CloudDrizzle',
        icon: CloudDrizzle,
        bgGradient: 'from-cyan-500/20 to-blue-600/10',
        accentColor: '#06b6d4',
      };
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return {
        text: 'Lluvia',
        iconName: 'CloudRain',
        icon: CloudRain,
        bgGradient: 'from-blue-600/30 to-indigo-700/10',
        accentColor: '#3b82f6',
      };
    case 71:
    case 73:
    case 75:
      return {
        text: 'Nieve',
        iconName: 'CloudSnow',
        icon: CloudSnow,
        bgGradient: 'from-indigo-300/20 to-cyan-200/10',
        accentColor: '#818cf8',
      };
    case 95:
    case 96:
    case 99:
      return {
        text: 'Tormenta Eléctrica',
        iconName: 'CloudLightning',
        icon: CloudLightning,
        bgGradient: 'from-purple-600/30 to-amber-500/20',
        accentColor: '#a855f7',
      };
    default:
      return {
        text: 'Soleado con brisa',
        iconName: 'Sun',
        icon: Sun,
        bgGradient: 'from-sky-500/20 to-blue-600/10',
        accentColor: '#0ea5e9',
      };
  }
}

/**
 * Returns wind direction label from degrees (0-360) e.g. "N", "SW", "S-SO"
 */
export function getWindDirectionLabel(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

/**
 * Popular coastal locations in Spain and international coastal cities for quick GPS testing
 */
export const POPULAR_COASTAL_SPOTS = [
  { name: 'Cádiz', region: 'Andalucía', country: 'España', lat: 36.5298, lon: -6.2927, isPopular: true },
  { name: 'A Coruña', region: 'Galicia', country: 'España', lat: 43.3623, lon: -8.4115, isPopular: true },
  { name: 'San Sebastián', region: 'País Vasco', country: 'España', lat: 43.3183, lon: -1.9812, isPopular: true },
  { name: 'Barcelona', region: 'Cataluña', country: 'España', lat: 41.3851, lon: 2.1734, isPopular: true },
  { name: 'Málaga', region: 'Andalucía', country: 'España', lat: 36.7213, lon: -4.4214, isPopular: true },
  { name: 'Valencia', region: 'Comunidad Valenciana', country: 'España', lat: 39.4699, lon: -0.3763, isPopular: true },
  { name: 'Santander', region: 'Cantabria', country: 'España', lat: 43.4623, lon: -3.8099, isPopular: true },
  { name: 'Vigo', region: 'Galicia', country: 'España', lat: 42.2406, lon: -8.7207, isPopular: true },
  { name: 'Las Palmas', region: 'Canarias', country: 'España', lat: 28.1235, lon: -15.4363, isPopular: true },
  { name: 'Palma de Mallorca', region: 'Baleares', country: 'España', lat: 39.5696, lon: 2.6502, isPopular: true },
  { name: 'Lisboa', region: 'Lisboa', country: 'Portugal', lat: 38.7223, lon: -9.1393, isPopular: true },
  { name: 'Biarritz', region: 'Nueva Aquitania', country: 'Francia', lat: 43.4832, lon: -1.5586, isPopular: true },
  { name: 'Miami Beach', region: 'Florida', country: 'EE.UU.', lat: 25.7907, lon: -80.1300, isPopular: true },
  { name: 'Sydney Harbour', region: 'NSW', country: 'Australia', lat: -33.8568, lon: 151.2153, isPopular: true },
];
