import type { SkyCondition } from '../types';
import { minutesFromIso, minutesInZone } from './format';

export type SkyPalette = {
  key: string;
  condition: SkyCondition;
  isDay: boolean;
  colors: [string, string, string];
  accent: string;
  accentSoft: string;
  glow: string;
  cloud: string;
  cloudShade: string;
  rain: string;
  light: string;
  star: string;
};

const DAY_PALETTES: Record<SkyCondition, Omit<SkyPalette, 'key' | 'condition' | 'isDay'>> = {
  clear: {
    colors: ['#082A4B', '#0A6283', '#159DA7'],
    accent: '#FFD37D',
    accentSoft: 'rgba(255, 211, 125, 0.22)',
    glow: 'rgba(255, 202, 105, 0.32)',
    cloud: '#F7FCFF',
    cloudShade: '#C4DDE8',
    rain: '#8DE5F6',
    light: '#FFF3D2',
    star: '#FFFFFF',
  },
  partly: {
    colors: ['#0A2842', '#0F5877', '#318E9C'],
    accent: '#FFD98B',
    accentSoft: 'rgba(255, 217, 139, 0.20)',
    glow: 'rgba(255, 210, 130, 0.25)',
    cloud: '#F3FAFF',
    cloudShade: '#BCD6E4',
    rain: '#8DE5F6',
    light: '#FFF6DE',
    star: '#FFFFFF',
  },
  cloudy: {
    colors: ['#1A2B36', '#3C5260', '#6C7F89'],
    accent: '#E4EFF4',
    accentSoft: 'rgba(228, 239, 244, 0.16)',
    glow: 'rgba(206, 226, 235, 0.18)',
    cloud: '#EEF6FA',
    cloudShade: '#B3C8D3',
    rain: '#8ED6E8',
    light: '#FFFFFF',
    star: '#DDE8F4',
  },
  rain: {
    colors: ['#061A28', '#0D3A4B', '#1C6172'],
    accent: '#8DE5F6',
    accentSoft: 'rgba(141, 229, 246, 0.18)',
    glow: 'rgba(92, 196, 222, 0.22)',
    cloud: '#DDEFF7',
    cloudShade: '#9DBECA',
    rain: '#7AD9F0',
    light: '#E8FBFF',
    star: '#B9E4F2',
  },
  storms: {
    colors: ['#080614', '#1A1330', '#36234B'],
    accent: '#FFD36B',
    accentSoft: 'rgba(255, 211, 107, 0.20)',
    glow: 'rgba(137, 104, 220, 0.28)',
    cloud: '#C7C9DD',
    cloudShade: '#8589A6',
    rain: '#7ED8EF',
    light: '#FFE5A0',
    star: '#C9C3E7',
  },
  snow: {
    colors: ['#112C41', '#35627A', '#74A2B6'],
    accent: '#E4F8FF',
    accentSoft: 'rgba(228, 248, 255, 0.20)',
    glow: 'rgba(204, 240, 255, 0.24)',
    cloud: '#F7FDFF',
    cloudShade: '#C4DDE8',
    rain: '#CFEFFA',
    light: '#FFFFFF',
    star: '#FFFFFF',
  },
  sleet: {
    colors: ['#10283C', '#315A71', '#6E9AAD'],
    accent: '#DDF5FF',
    accentSoft: 'rgba(221, 245, 255, 0.18)',
    glow: 'rgba(185, 230, 249, 0.22)',
    cloud: '#EEF9FF',
    cloudShade: '#B8D3DF',
    rain: '#A9E2F4',
    light: '#FFFFFF',
    star: '#E6F6FF',
  },
  fog: {
    colors: ['#19252E', '#354A55', '#687981'],
    accent: '#DCE8EC',
    accentSoft: 'rgba(220, 232, 236, 0.16)',
    glow: 'rgba(203, 220, 226, 0.16)',
    cloud: '#E4EEF1',
    cloudShade: '#A9BCC3',
    rain: '#A9D9E5',
    light: '#FFFFFF',
    star: '#D8E5EB',
  },
  wind: {
    colors: ['#0C2733', '#245466', '#4A8998'],
    accent: '#C8F2F4',
    accentSoft: 'rgba(200, 242, 244, 0.18)',
    glow: 'rgba(144, 224, 229, 0.20)',
    cloud: '#ECF8FA',
    cloudShade: '#B5D1D8',
    rain: '#8DE5F6',
    light: '#FFFFFF',
    star: '#D8F3F6',
  },
};

const NIGHT_PALETTES: Record<SkyCondition, Omit<SkyPalette, 'key' | 'condition' | 'isDay'>> = {
  clear: {
    colors: ['#03050F', '#0A112B', '#1B2751'],
    accent: '#D9E6FF',
    accentSoft: 'rgba(199, 219, 255, 0.16)',
    glow: 'rgba(107, 145, 255, 0.25)',
    cloud: '#E5EDFF',
    cloudShade: '#9CAECF',
    rain: '#8CD8FF',
    light: '#FFFFFF',
    star: '#F4F8FF',
  },
  partly: {
    colors: ['#040713', '#0D1730', '#223054'],
    accent: '#DCE8FF',
    accentSoft: 'rgba(199, 219, 255, 0.14)',
    glow: 'rgba(106, 139, 235, 0.20)',
    cloud: '#DEE9FA',
    cloudShade: '#96A8C6',
    rain: '#8CD8FF',
    light: '#FFFFFF',
    star: '#EDF4FF',
  },
  cloudy: {
    colors: ['#070B10', '#151F28', '#2A3640'],
    accent: '#DCE8ED',
    accentSoft: 'rgba(220, 232, 237, 0.13)',
    glow: 'rgba(147, 175, 187, 0.14)',
    cloud: '#DCE7EC',
    cloudShade: '#8E9EA7',
    rain: '#8CD2E5',
    light: '#FFFFFF',
    star: '#C8D7DF',
  },
  rain: {
    colors: ['#030C13', '#0A2230', '#143D4C'],
    accent: '#8DE5F6',
    accentSoft: 'rgba(141, 229, 246, 0.15)',
    glow: 'rgba(70, 167, 193, 0.18)',
    cloud: '#CFE5ED',
    cloudShade: '#829FAA',
    rain: '#7AD9F0',
    light: '#DDF8FF',
    star: '#A8D7E6',
  },
  storms: {
    colors: ['#05040D', '#130E25', '#2A1B3C'],
    accent: '#FFD36B',
    accentSoft: 'rgba(255, 211, 107, 0.18)',
    glow: 'rgba(120, 85, 200, 0.24)',
    cloud: '#B8B9CE',
    cloudShade: '#70738E',
    rain: '#78CEE5',
    light: '#FFE19A',
    star: '#B9B3D9',
  },
  snow: {
    colors: ['#071827', '#153449', '#2E5268'],
    accent: '#E4F8FF',
    accentSoft: 'rgba(228, 248, 255, 0.17)',
    glow: 'rgba(176, 222, 244, 0.20)',
    cloud: '#E7F7FF',
    cloudShade: '#A5C2D0',
    rain: '#BFEAF7',
    light: '#FFFFFF',
    star: '#F4FCFF',
  },
  sleet: {
    colors: ['#061521', '#122E40', '#2A4C60'],
    accent: '#DDF5FF',
    accentSoft: 'rgba(221, 245, 255, 0.16)',
    glow: 'rgba(159, 207, 231, 0.18)',
    cloud: '#E4F5FC',
    cloudShade: '#9CB9C6',
    rain: '#A9E2F4',
    light: '#FFFFFF',
    star: '#E0F4FF',
  },
  fog: {
    colors: ['#090F14', '#18252E', '#33444D'],
    accent: '#DCE8EC',
    accentSoft: 'rgba(220, 232, 236, 0.12)',
    glow: 'rgba(153, 177, 187, 0.13)',
    cloud: '#D4E1E6',
    cloudShade: '#899AA2',
    rain: '#9BCFDC',
    light: '#FFFFFF',
    star: '#BFD2DB',
  },
  wind: {
    colors: ['#051319', '#112E3B', '#245261'],
    accent: '#C8F2F4',
    accentSoft: 'rgba(200, 242, 244, 0.15)',
    glow: 'rgba(112, 199, 207, 0.17)',
    cloud: '#DDF1F4',
    cloudShade: '#9CBAC1',
    rain: '#8CD8E8',
    light: '#FFFFFF',
    star: '#D4EFF3',
  },
};

export function getSkyPalette(condition: SkyCondition, isDay: boolean): SkyPalette {
  const base = isDay ? DAY_PALETTES[condition] : NIGHT_PALETTES[condition];
  return {
    ...base,
    key: `${condition}-${isDay ? 'day' : 'night'}`,
    condition,
    isDay,
  };
}

export function conditionFromForecast(shortForecast: string, iconUrl = ''): SkyCondition {
  const text = `${shortForecast} ${iconUrl}`.toLowerCase();
  if (/(thunder|tstm|tsra|lightning)/.test(text)) return 'storms';
  if (/(freezing rain|sleet|ice pellets|wintry mix)/.test(text)) return 'sleet';
  if (/(snow|flurr|blizzard)/.test(text)) return 'snow';
  if (/(rain|shower|drizzle)/.test(text)) return 'rain';
  if (/(fog|mist|haze|smoke)/.test(text)) return 'fog';
  if (/(wind|breezy|gust)/.test(text)) return 'wind';
  if (/partly/.test(text)) return 'partly';
  if (/mostly (sunny|clear)/.test(text)) return 'partly';
  if (/(overcast|cloudy)/.test(text)) return 'cloudy';
  return 'clear';
}

export function isDaylightNow(
  sunrise: string | null,
  sunset: string | null,
  timeZone: string,
  now = new Date(),
) {
  const nowMinutes = minutesInZone(now, timeZone);
  const sunriseMinutes = minutesFromIso(sunrise, timeZone);
  const sunsetMinutes = minutesFromIso(sunset, timeZone);
  if (sunriseMinutes == null || sunsetMinutes == null) {
    return nowMinutes >= 6 * 60 && nowMinutes < 19 * 60;
  }
  return nowMinutes >= sunriseMinutes && nowMinutes < sunsetMinutes;
}

export type DaylightInfo = {
  progress: number;
  remainingMinutes: number;
  totalMinutes: number;
  isDay: boolean;
  sunriseMinutes: number | null;
  sunsetMinutes: number | null;
};

export function getDaylightInfo(
  sunrise: string | null,
  sunset: string | null,
  timeZone: string,
  now = new Date(),
): DaylightInfo {
  const nowMinutes = minutesInZone(now, timeZone);
  const sunriseMinutes = minutesFromIso(sunrise, timeZone);
  const sunsetMinutes = minutesFromIso(sunset, timeZone);
  if (sunriseMinutes == null || sunsetMinutes == null || sunsetMinutes <= sunriseMinutes) {
    const fallbackProgress = Math.min(1, Math.max(0, (nowMinutes - 6 * 60) / (13 * 60)));
    return {
      progress: fallbackProgress,
      remainingMinutes: Math.max(0, 19 * 60 - nowMinutes),
      totalMinutes: 13 * 60,
      isDay: nowMinutes >= 6 * 60 && nowMinutes < 19 * 60,
      sunriseMinutes: null,
      sunsetMinutes: null,
    };
  }
  const total = sunsetMinutes - sunriseMinutes;
  const progress = Math.min(1, Math.max(0, (nowMinutes - sunriseMinutes) / total));
  const remainingMinutes = Math.max(0, sunsetMinutes - Math.max(nowMinutes, sunriseMinutes));
  return {
    progress,
    remainingMinutes,
    totalMinutes: total,
    isDay: nowMinutes >= sunriseMinutes && nowMinutes < sunsetMinutes,
    sunriseMinutes,
    sunsetMinutes,
  };
}

export function conditionLabel(condition: SkyCondition) {
  switch (condition) {
    case 'clear': return 'Clear';
    case 'partly': return 'Partly cloudy';
    case 'cloudy': return 'Cloudy';
    case 'rain': return 'Rain';
    case 'storms': return 'Thunderstorms';
    case 'snow': return 'Snow';
    case 'sleet': return 'Wintry mix';
    case 'fog': return 'Fog';
    case 'wind': return 'Windy';
  }
}
