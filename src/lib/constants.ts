const DEFAULT_CONTACT = 'contact@skylineweather.app';

export const NWS_USER_AGENT =
  process.env.EXPO_PUBLIC_NWS_USER_AGENT?.trim() ||
  `SkylineWeather/1.0 (${DEFAULT_CONTACT})`;
export const GEOCODE_USER_AGENT = NWS_USER_AGENT;
export const NWS_BASE = 'https://api.weather.gov';
export const REQUEST_TIMEOUT_MS = 15000;
export const CACHE_VERSION = 1;
