export interface UVMeta {
  level: number;
  label: string;
  category: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto' | 'Extremo';
  color: string; // hex
  bgColor: string;
  textColor: string;
  advice: string;
  maxRecommendedTimeMin: string;
}

export function getUVMeta(uv: number): UVMeta {
  const rounded = Math.round(uv * 10) / 10;

  if (rounded <= 2) {
    return {
      level: rounded,
      label: 'Bajo',
      category: 'Bajo',
      color: '#10b981', // emerald
      bgColor: 'bg-emerald-950/60 border-emerald-500/30',
      textColor: 'text-emerald-400',
      advice: 'Riesgo mínimo. Disfruta del sol sin protección especial.',
      maxRecommendedTimeMin: '> 60 min',
    };
  } else if (rounded <= 5) {
    return {
      level: rounded,
      label: 'Moderado',
      category: 'Moderado',
      color: '#f59e0b', // amber
      bgColor: 'bg-amber-950/60 border-amber-500/30',
      textColor: 'text-amber-400',
      advice: 'Usa crema solar SPF 30+, gafas de sol y gorra en horas centrales.',
      maxRecommendedTimeMin: '45 min',
    };
  } else if (rounded <= 7) {
    return {
      level: rounded,
      label: 'Alto',
      category: 'Alto',
      color: '#f97316', // orange
      bgColor: 'bg-orange-950/60 border-orange-500/30',
      textColor: 'text-orange-400',
      advice: 'Protección necesaria. Busca sombra entre 12:00 y 16:00 h.',
      maxRecommendedTimeMin: '25 min',
    };
  } else if (rounded <= 10) {
    return {
      level: rounded,
      label: 'Muy Alto',
      category: 'Muy Alto',
      color: '#ef4444', // red
      bgColor: 'bg-rose-950/60 border-rose-500/30',
      textColor: 'text-rose-400',
      advice: 'Peligro de quemaduras rápidas. Evita la exposición solar directa.',
      maxRecommendedTimeMin: '15 min',
    };
  } else {
    return {
      level: rounded,
      label: 'Extremo',
      category: 'Extremo',
      color: '#a855f7', // purple
      bgColor: 'bg-purple-950/60 border-purple-500/30',
      textColor: 'text-purple-400',
      advice: 'Extremar precaución. Quemadura solar en menos de 10 minutos.',
      maxRecommendedTimeMin: '< 10 min',
    };
  }
}
