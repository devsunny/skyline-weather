import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Place, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../data/defaults';

const SETTINGS_KEY = '@skyline/settings/v1';
const PLACES_KEY = '@skyline/places/v1';
const ACTIVE_PLACE_KEY = '@skyline/active-place/v1';

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return parsed.units === 'metric' ? { units: 'metric' } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Preferences are nice to have; never block the forecast on storage.
  }
}

function isPlace(value: unknown): value is Place {
  if (!value || typeof value !== 'object') return false;
  const place = value as Partial<Place>;
  return (
    typeof place.id === 'string' &&
    typeof place.name === 'string' &&
    typeof place.region === 'string' &&
    typeof place.latitude === 'number' &&
    Number.isFinite(place.latitude) &&
    place.latitude >= -90 &&
    place.latitude <= 90 &&
    typeof place.longitude === 'number' &&
    Number.isFinite(place.longitude) &&
    place.longitude >= -180 &&
    place.longitude <= 180
  );
}

export async function loadPlaces(): Promise<Place[] | null> {
  try {
    const raw = await AsyncStorage.getItem(PLACES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const places = parsed.filter(isPlace);
    return places.length ? places : null;
  } catch {
    return null;
  }
}

export async function savePlaces(places: Place[]) {
  try {
    await AsyncStorage.setItem(PLACES_KEY, JSON.stringify(places));
  } catch {
    // Ignore; saved places also live in memory for this session.
  }
}

export async function loadActivePlaceId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACTIVE_PLACE_KEY);
  } catch {
    return null;
  }
}

export async function saveActivePlaceId(id: string) {
  try {
    await AsyncStorage.setItem(ACTIVE_PLACE_KEY, id);
  } catch {
    // Ignore.
  }
}
