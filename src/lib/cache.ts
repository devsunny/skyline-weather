import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Place, WeatherBundle } from '../types';
import { CACHE_VERSION } from './constants';

const CACHE_PREFIX = '@skyline/weather/v1/';
const MAX_CACHED_PLACES = 12;

type CacheEntry = {
  version: number;
  savedAt: number;
  data: WeatherBundle;
};

export function cacheKey(place: Place) {
  return `${CACHE_PREFIX}${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
}

export async function readCachedWeather(place: Place): Promise<WeatherBundle | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(place));
    if (!raw) return null;
    const entry = JSON.parse(raw) as Partial<CacheEntry>;
    if (entry.version !== CACHE_VERSION || !entry.data || typeof entry.savedAt !== 'number') {
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function writeCachedWeather(place: Place, data: WeatherBundle) {
  try {
    const entry: CacheEntry = {
      version: CACHE_VERSION,
      savedAt: Date.now(),
      data,
    };
    await AsyncStorage.setItem(cacheKey(place), JSON.stringify(entry));
    await trimCache();
  } catch {
    // A cache miss is fine. The network is the source of truth.
  }
}

async function trimCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const weatherKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    if (weatherKeys.length <= MAX_CACHED_PLACES) return;

    const entries = await Promise.all(
      weatherKeys.map(async (key) => {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) return { key, savedAt: 0 };
        try {
          const parsed = JSON.parse(raw) as Partial<CacheEntry>;
          return { key, savedAt: parsed.savedAt ?? 0 };
        } catch {
          return { key, savedAt: 0 };
        }
      }),
    );
    entries.sort((a, b) => b.savedAt - a.savedAt);
    await AsyncStorage.multiRemove(entries.slice(MAX_CACHED_PLACES).map((entry) => entry.key));
  } catch {
    // Ignore cache housekeeping failures.
  }
}

export async function clearWeatherCache(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const weatherKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    if (weatherKeys.length) await AsyncStorage.multiRemove(weatherKeys);
    return weatherKeys.length;
  } catch {
    return 0;
  }
}

export async function countCachedWeather(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter((key) => key.startsWith(CACHE_PREFIX)).length;
  } catch {
    return 0;
  }
}
