import type { Place } from '../types';
import { GEOCODE_USER_AGENT } from '../lib/constants';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const ZIP_URL = 'https://api.zippopotam.us/us';

const US_STATES: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
  Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
  Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
  Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI',
  Wyoming: 'WY', 'Puerto Rico': 'PR', 'U.S. Virgin Islands': 'VI', Guam: 'GU',
  'American Samoa': 'AS', 'Northern Mariana Islands': 'MP',
};

type NominatimResult = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
  addresstype?: string;
  address?: Record<string, string>;
};

type ZipPlace = {
  'place name'?: string;
  latitude?: string;
  longitude?: string;
  state?: string;
  'state abbreviation'?: string;
};

type ZipResponse = {
  places?: ZipPlace[];
};

export class LocationSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocationSearchError';
  }
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 10000);

  const abort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timer);
      const error = new Error('Aborted');
      error.name = 'AbortError';
      throw error;
    }
    signal.addEventListener('abort', abort);
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': GEOCODE_USER_AGENT,
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new LocationSearchError('Location search is unavailable right now.');
    }
    return (await response.json()) as T;
  } catch (error) {
    if (signal?.aborted) {
      const aborted = new Error('Aborted');
      aborted.name = 'AbortError';
      throw aborted;
    }
    if (error instanceof LocationSearchError) throw error;
    if (timedOut) {
      throw new LocationSearchError('Search took too long. Check your connection and try again.');
    }
    throw new LocationSearchError('Could not search for that place. Check your connection.');
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', abort);
  }
}

function stateAbbreviation(address?: Record<string, string>) {
  if (!address) return '';
  const iso = address['ISO3166-2-lvl4'];
  if (iso?.startsWith('US-')) return iso.slice(3);
  const state = address.state ?? '';
  return US_STATES[state] ?? state;
}

function placeName(result: NominatimResult) {
  const address = result.address;
  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.hamlet ||
    address?.municipality ||
    result.name ||
    result.display_name?.split(',')[0] ||
    'Location'
  ).replace(/\s+city$/i, '');
}

function toPlace(result: NominatimResult): Place | null {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const region = stateAbbreviation(result.address);
  return {
    id: `osm:${result.osm_type ?? 'node'}:${result.osm_id ?? result.place_id ?? `${latitude},${longitude}`}`,
    name: placeName(result),
    region,
    latitude,
    longitude,
    source: 'search',
  };
}

async function searchZip(zip: string, signal?: AbortSignal): Promise<Place[]> {
  const data = await fetchJson<ZipResponse>(`${ZIP_URL}/${zip}`, signal);
  const places = data.places ?? [];
  return places
    .map((item) => {
      const latitude = Number(item.latitude);
      const longitude = Number(item.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
      return {
        id: `zip:${zip}:${latitude.toFixed(3)},${longitude.toFixed(3)}`,
        name: item['place name'] ?? zip,
        region: item['state abbreviation'] ?? '',
        latitude,
        longitude,
        source: 'zip',
      } as Place;
    })
    .filter((place): place is Place => Boolean(place))
    .slice(0, 4);
}

async function searchNominatim(query: string, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    countrycodes: 'us',
    limit: '6',
    addressdetails: '1',
  });
  const results = await fetchJson<NominatimResult[]>(`${NOMINATIM_URL}?${params.toString()}`, signal);
  if (!Array.isArray(results)) return [];

  const seen = new Set<string>();
  return results
    .map(toPlace)
    .filter((place): place is Place => {
      if (!place) return false;
      const key = `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  if (/^\d{5}$/.test(trimmed)) {
    try {
      const zipResults = await searchZip(trimmed, signal);
      if (zipResults.length) return zipResults;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      // Fall through to Nominatim, which can still find the ZIP.
    }
  }

  return searchNominatim(trimmed, signal);
}
