import { TideEvent, HourlyTidePoint, MoonPhaseInfo } from '../types';

/**
 * Calculates Moon Phase and Moon Age for a given Date.
 */
export function calculateMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  // Known reference new moon: Jan 11, 2024 11:57 UTC
  const refNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000; // lunar cycle in ms
  
  const diff = date.getTime() - refNewMoon;
  const cyclePosition = (diff % synodicMonth) / synodicMonth;
  const normalizedPhase = cyclePosition < 0 ? cyclePosition + 1 : cyclePosition;
  
  const moonAgeDays = normalizedPhase * 29.53058867;
  
  // Illumination calculation (0 to 100%)
  const illumination = Math.round((1 - Math.cos(normalizedPhase * 2 * Math.PI)) / 2 * 100);

  // Coefficient calculation (Mareas Vivas 80-115, Mareas Muertas 25-50)
  // Highest around new moon (0) and full moon (0.5)
  const springFactor = Math.abs(Math.cos(normalizedPhase * 2 * Math.PI));
  const coefficient = Math.round(35 + springFactor * 75); // Range ~35 to 110

  const isSpringTide = coefficient >= 75;

  let name = 'Luna Nueva';
  let icon = '🌑';

  if (normalizedPhase < 0.03 || normalizedPhase > 0.97) {
    name = 'Luna Nueva';
    icon = '🌑';
  } else if (normalizedPhase < 0.22) {
    name = 'Creciente';
    icon = '🌒';
  } else if (normalizedPhase < 0.28) {
    name = 'Cuarto Creciente';
    icon = '🌓';
  } else if (normalizedPhase < 0.47) {
    name = 'Gibosa Creciente';
    icon = '🌔';
  } else if (normalizedPhase < 0.53) {
    name = 'Luna Llena';
    icon = '🌕';
  } else if (normalizedPhase < 0.72) {
    name = 'Gibosa Menguante';
    icon = '🌖';
  } else if (normalizedPhase < 0.78) {
    name = 'Cuarto Menguante';
    icon = '🌗';
  } else {
    name = 'Menguante';
    icon = '🌘';
  }

  return {
    name,
    icon,
    illumination,
    phaseValue: normalizedPhase,
    isSpringTide,
    coefficient,
  };
}

/**
 * Calculates current tide level, next tide events, and 24h hourly curve.
 */
export function generateTideData(
  lat: number,
  lon: number,
  baseDate: Date = new Date(),
  marineData?: any
) {
  const moon = calculateMoonPhase(baseDate);
  const coeffFactor = moon.coefficient / 70; // Scaling factor for wave amplitude
  
  // Base mean sea level & tidal amplitude (varies slightly by latitude/geography)
  const meanSeaLevel = 1.8; // meters
  const maxAmplitude = 1.4 * coeffFactor; // max deviation from mean sea level
  
  // Tidal period = 12h 25.2m (44712 seconds)
  const tidePeriodMs = (12 * 3600 + 25 * 60 + 12) * 1000;
  
  // Phase shift based on longitude and day angle
  const dayStart = new Date(baseDate);
  dayStart.setHours(0, 0, 0, 0);
  
  // Phase offset based on longitude (tides travel around Earth)
  const lonOffsetMs = (lon / 360) * 24 * 3600 * 1000;
  const basePhaseShiftMs = 3 * 3600 * 1000 + lonOffsetMs; // Local reference shift

  // Current tide level function at any timestamp t
  const getTideHeightAt = (timeMs: number): number => {
    const elapsed = timeMs - dayStart.getTime() + basePhaseShiftMs;
    const phaseRad = (elapsed / tidePeriodMs) * 2 * Math.PI;
    
    // Primary M2 harmonic + secondary S2 harmonic
    const primaryWave = Math.sin(phaseRad);
    const secondaryWave = 0.25 * Math.sin(phaseRad * 2 + 0.5);
    
    const height = meanSeaLevel + maxAmplitude * (primaryWave + secondaryWave);
    return Math.max(0.1, Math.round(height * 100) / 100);
  };

  const currentMs = baseDate.getTime();
  const currentTideLevel = getTideHeightAt(currentMs);

  // Determine trend by comparing with 10 minutes in future
  const futureHeight = getTideHeightAt(currentMs + 10 * 60 * 1000);
  let tideTrend: 'RISING' | 'FALLING' | 'STATIONARY' = 'STATIONARY';
  if (futureHeight > currentTideLevel + 0.01) tideTrend = 'RISING';
  else if (futureHeight < currentTideLevel - 0.01) tideTrend = 'FALLING';

  // Find next 4 High and Low tide peaks within 36 hours
  const nextTides: TideEvent[] = [];
  let prevHeight = getTideHeightAt(currentMs - 15 * 60 * 1000);
  let stepMs = 10 * 60 * 1000; // 10 minute steps

  for (let t = currentMs; t <= currentMs + 36 * 3600 * 1000; t += stepMs) {
    const h = getTideHeightAt(t);
    const nextH = getTideHeightAt(t + stepMs);

    // Peak detection: High Tide (Pleamar)
    if (h > prevHeight && h >= nextH && h > meanSeaLevel + 0.2) {
      const eventDate = new Date(t);
      const timeStr = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
      nextTides.push({
        time: timeStr,
        isoTime: eventDate.toISOString(),
        type: 'HIGH',
        height: Math.round(h * 100) / 100,
        coefficient: moon.coefficient,
      });
    }
    // Trough detection: Low Tide (Bajamar)
    else if (h < prevHeight && h <= nextH && h < meanSeaLevel - 0.2) {
      const eventDate = new Date(t);
      const timeStr = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
      nextTides.push({
        time: timeStr,
        isoTime: eventDate.toISOString(),
        type: 'LOW',
        height: Math.round(h * 100) / 100,
        coefficient: moon.coefficient,
      });
    }

    if (nextTides.length >= 4) break;
    prevHeight = h;
  }

  // Calculate Tide Progress % through current cycle (0 = Low, 100 = High)
  const minHeight = meanSeaLevel - maxAmplitude;
  const maxHeight = meanSeaLevel + maxAmplitude;
  const tideProgress = Math.min(100, Math.max(0, Math.round(((currentTideLevel - minHeight) / (maxHeight - minHeight)) * 100)));

  // Generate 24 Hourly Tide points starting from today 00:00
  const hourlyTides: HourlyTidePoint[] = [];
  const startOfDayMs = dayStart.getTime();

  for (let hour = 0; hour < 24; hour++) {
    const hourTimeMs = startOfDayMs + hour * 3600 * 1000;
    const hourDate = new Date(hourTimeMs);
    const timeStr = `${hourDate.getHours().toString().padStart(2, '0')}:00`;
    
    // Wave height from marine API or default estimation
    const waveH = marineData?.hourly?.wave_height?.[hour] ?? Math.round((0.6 + Math.sin(hour * 0.3) * 0.4) * 10) / 10;
    const temp = 20 + Math.sin((hour - 8) * 0.2) * 3;

    hourlyTides.push({
      time: timeStr,
      isoTime: hourDate.toISOString(),
      height: getTideHeightAt(hourTimeMs),
      waveHeight: waveH,
      temperature: Math.round(temp * 10) / 10,
      windSpeed: Math.round(12 + Math.cos(hour * 0.4) * 6),
    });
  }

  return {
    currentTideLevel,
    tideTrend,
    tideProgress,
    nextTides,
    hourlyTides,
    moonPhase: moon,
  };
}

/**
 * Format minutes into readable hour/min text e.g. "1h 25m"
 */
export function formatTimeUntil(targetIso: string): string {
  const diffMs = new Date(targetIso).getTime() - new Date().getTime();
  if (diffMs <= 0) return 'Ahora';

  const totalMin = Math.floor(diffMs / (1000 * 60));
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}
