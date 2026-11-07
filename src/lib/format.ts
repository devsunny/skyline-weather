import type { Units } from '../types';

export const cToF = (value: number) => (value * 9) / 5 + 32;
export const kmhToMph = (value: number) => value * 0.621371;
export const paToInHg = (value: number) => value / 3386.389;
export const mToMi = (value: number) => value / 1609.344;
export const mmToIn = (value: number) => value / 25.4;

export function fToC(value: number) {
  return ((value - 32) * 5) / 9;
}

export function tempValue(fahrenheit: number, units: Units) {
  return Math.round(units === 'imperial' ? fahrenheit : fToC(fahrenheit));
}

export function formatTemp(fahrenheit: number, units: Units, suffix = '°') {
  return `${tempValue(fahrenheit, units)}${suffix}`;
}

export function formatWind(mph: number | null, units: Units) {
  if (mph == null || !Number.isFinite(mph)) return '—';
  return units === 'imperial'
    ? `${Math.round(mph)} mph`
    : `${Math.round(mph * 1.609344)} km/h`;
}

export function formatPressure(inHg: number | null, units: Units) {
  if (inHg == null || !Number.isFinite(inHg)) return '—';
  return units === 'imperial'
    ? `${inHg.toFixed(2)} inHg`
    : `${Math.round(inHg * 33.8639)} hPa`;
}

export function formatVisibility(miles: number | null, units: Units) {
  if (miles == null || !Number.isFinite(miles)) return '—';
  return units === 'imperial'
    ? `${miles.toFixed(miles >= 10 ? 0 : 1)} mi`
    : `${(miles * 1.609344).toFixed(miles >= 6 ? 0 : 1)} km`;
}

export function formatPrecip(inches: number | null, units: Units) {
  if (inches == null || !Number.isFinite(inches)) return '—';
  if (inches <= 0) return 'None';
  return units === 'imperial'
    ? `${inches.toFixed(2)} in`
    : `${(inches * 25.4).toFixed(1)} mm`;
}

const CARDINALS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function cardinalFromDegrees(degrees: number | null) {
  if (degrees == null || !Number.isFinite(degrees)) return null;
  return CARDINALS[Math.round(((degrees % 360) / 22.5)) % 16] ?? null;
}

const CARDINAL_DEGREES: Record<string, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5
};

export function degreesFromCardinal(direction: string | null | undefined) {
  if (!direction) return null;
  return CARDINAL_DEGREES[direction.toUpperCase()] ?? null;
}

export function parseWindMph(windSpeed: string | null | undefined) {
  if (!windSpeed) return null;
  const numbers = windSpeed.match(/\d+(?:\.\d+)?/g);
  if (!numbers?.length) return null;
  return Number(numbers[numbers.length - 1]);
}

export function formatHour(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone,
  }).format(new Date(iso));
}

export function formatClock(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso));
}

export function formatWeekday(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone,
  }).format(new Date(iso));
}

export function formatLongWeekday(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone,
  }).format(new Date(iso));
}

export function formatMonthDay(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone,
  }).format(new Date(iso));
}

export function formatDateKey(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(new Date(iso));
}

export function formatUpdated(iso: string, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (seconds < 45) return 'Updated just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} hr ago`;
  return `Updated ${Math.floor(hours / 24)} d ago`;
}

export function formatRelativeTime(iso: string, timeZone: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const abs = Math.abs(diff);
  if (abs < 60 * 60 * 1000) {
    const mins = Math.max(1, Math.round(abs / 60000));
    return diff >= 0 ? `in ${mins} min` : `${mins} min ago`;
  }
  if (abs < 24 * 60 * 60 * 1000) {
    const hours = Math.max(1, Math.round(abs / 3600000));
    return diff >= 0 ? `in ${hours} hr` : `${hours} hr ago`;
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(date);
}

export function minutesInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

export function minutesFromIso(iso: string | null, timeZone: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return minutesInZone(date, timeZone);
}

export function formatDuration(minutes: number) {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}
