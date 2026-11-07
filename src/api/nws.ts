import type {
  CurrentConditions,
  DailyPeriod,
  HourlyPeriod,
  Place,
  WeatherAlert,
  WeatherBundle,
} from '../types';
import { NWS_BASE, NWS_USER_AGENT, REQUEST_TIMEOUT_MS } from '../lib/constants';
import {
  cToF,
  cardinalFromDegrees,
  degreesFromCardinal,
  formatDateKey,
  formatWeekday,
  kmhToMph,
  mToMi,
  mmToIn,
  paToInHg,
  parseWindMph,
} from '../lib/format';
import { conditionFromForecast, isDaylightNow } from '../lib/sky';

type WeatherErrorKind = 'coverage' | 'network' | 'server' | 'parse';

export class WeatherApiError extends Error {
  readonly kind: WeatherErrorKind;
  readonly status?: number;

  constructor(kind: WeatherErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'WeatherApiError';
    this.kind = kind;
    this.status = status;
  }
}

const createAbortError = () => {
  const error = new Error('Request aborted');
  error.name = 'AbortError';
  return error;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestOnce<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timer);
      throw createAbortError();
    }
    signal.addEventListener('abort', abort);
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/geo+json, application/json',
        'User-Agent': NWS_USER_AGENT,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new WeatherApiError(
          'coverage',
          'The National Weather Service has no forecast for this spot. Skyline covers the U.S., including Alaska, Hawaii, and Puerto Rico.',
          404,
        );
      }
      if (response.status === 429) {
        throw new WeatherApiError(
          'server',
          'The weather service is receiving too many requests. Give it a moment and try again.',
          429,
        );
      }
      throw new WeatherApiError(
        'server',
        'The National Weather Service is having trouble right now. Please try again in a moment.',
        response.status,
      );
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new WeatherApiError('parse', 'The weather service returned an unreadable forecast.');
    }
  } catch (error) {
    if (signal?.aborted) throw createAbortError();
    if (error instanceof WeatherApiError) throw error;
    if (timedOut) {
      throw new WeatherApiError(
        'network',
        'The National Weather Service took too long to respond. Check your connection and try again.',
      );
    }
    throw new WeatherApiError(
      'network',
      'Skyline could not reach the National Weather Service. Check your connection and try again.',
    );
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', abort);
  }
}

async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await requestOnce<T>(url, signal);
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof WeatherApiError && (error.kind === 'server' || error.kind === 'network');
      if (!retryable || signal?.aborted || attempt === 1) throw error;
      await delay(550);
    }
  }
  throw lastError;
}

type PointResponse = {
  properties?: {
    forecast?: string;
    forecastHourly?: string;
    observationStations?: string;
    relativeLocation?: {
      properties?: {
        city?: string;
        state?: string;
      };
    };
    timeZone?: string;
    radarStation?: string;
    astronomicalData?: {
      sunrise?: string;
      sunset?: string;
    };
  };
};

type ForecastResponse = {
  properties?: {
    periods?: RawPeriod[];
  };
};

type RawPeriod = {
  number?: number;
  name?: string;
  startTime?: string;
  endTime?: string;
  isDaytime?: boolean;
  temperature?: number | null;
  temperatureUnit?: string;
  probabilityOfPrecipitation?: { value?: number | null };
  dewpoint?: { value?: number | null; unitCode?: string };
  relativeHumidity?: { value?: number | null };
  windSpeed?: string;
  windDirection?: string;
  icon?: string;
  shortForecast?: string;
  detailedForecast?: string;
};

type StationsResponse = {
  features?: Array<{ id?: string; properties?: { name?: string } }>;
};

type ObservationResponse = {
  properties?: {
    timestamp?: string;
    textDescription?: string;
    temperature?: { value?: number | null; unitCode?: string };
    dewpoint?: { value?: number | null; unitCode?: string };
    windDirection?: { value?: number | null };
    windSpeed?: { value?: number | null; unitCode?: string };
    windGust?: { value?: number | null; unitCode?: string };
    barometricPressure?: { value?: number | null; unitCode?: string };
    visibility?: { value?: number | null; unitCode?: string };
    relativeHumidity?: { value?: number | null };
    heatIndex?: { value?: number | null; unitCode?: string };
    windChill?: { value?: number | null; unitCode?: string };
    precipitationLastHour?: { value?: number | null; unitCode?: string };
    stationName?: string;
  };
};

type AlertsResponse = {
  features?: Array<{
    id?: string;
    properties?: {
      event?: string;
      headline?: string | null;
      description?: string;
      instruction?: string | null;
      severity?: string;
      urgency?: string;
      certainty?: string;
      onset?: string | null;
      ends?: string | null;
      expires?: string | null;
      areaDesc?: string;
      senderName?: string;
    };
  }>;
};

type PointInfo = {
  forecastUrl: string;
  hourlyUrl: string;
  stationsUrl: string;
  city: string;
  state: string;
  timeZone: string;
  radarStation: string | null;
  sunrise: string | null;
  sunset: string | null;
};

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const toF = (value: number | null, unit?: string | null) => {
  if (value == null) return null;
  return unit === 'C' || unit?.includes('degC') ? cToF(value) : value;
};

const windToMph = (value: number | null, unit?: string | null) => {
  if (value == null) return null;
  return unit && (unit.includes('km_h') || unit.includes('km/h')) ? kmhToMph(value) : value;
};

const distanceToMiles = (value: number | null, unit?: string | null) => {
  if (value == null) return null;
  if (!unit || unit.includes('mile')) return value;
  if (unit.includes('km')) return value * 0.621371;
  if (unit.includes('m')) return mToMi(value);
  return value;
};

const pressureToInHg = (value: number | null, unit?: string | null) => {
  if (value == null) return null;
  return unit && unit.includes('Pa') ? paToInHg(value) : value;
};

const precipToInches = (value: number | null, unit?: string | null) => {
  if (value == null) return null;
  return unit && unit.includes('mm') ? mmToIn(value) : value;
};

function maxNullable(a: number | null, b: number | null) {
  if (a == null) return b;
  if (b == null) return a;
  return Math.max(a, b);
}

async function getPoint(place: Place, signal?: AbortSignal): Promise<PointInfo> {
  const lat = place.latitude.toFixed(4);
  const lon = place.longitude.toFixed(4);
  const data = await getJSON<PointResponse>(`${NWS_BASE}/points/${lat},${lon}`, signal);
  const properties = data.properties;
  if (!properties?.forecast || !properties.forecastHourly || !properties.observationStations) {
    throw new WeatherApiError(
      'coverage',
      'The National Weather Service has no forecast grid for this spot. Try a nearby town or city.',
    );
  }

  return {
    forecastUrl: properties.forecast,
    hourlyUrl: properties.forecastHourly,
    stationsUrl: properties.observationStations,
    city: properties.relativeLocation?.properties?.city ?? place.name,
    state: properties.relativeLocation?.properties?.state ?? place.region,
    timeZone: properties.timeZone ?? 'America/New_York',
    radarStation: properties.radarStation ?? null,
    sunrise: properties.astronomicalData?.sunrise ?? null,
    sunset: properties.astronomicalData?.sunset ?? null,
  };
}

function selectHourly(periods: RawPeriod[], timeZone: string): HourlyPeriod[] {
  const cutoff = Date.now() - 30 * 60 * 1000;
  const upcoming = periods.filter((period) => {
    const end = period.endTime ? new Date(period.endTime).getTime() : 0;
    return Number.isFinite(end) && end > cutoff;
  });
  const source = (upcoming.length ? upcoming : periods).slice(0, 24);

  return source.map((period) => {
    const startTime = period.startTime ?? new Date().toISOString();
    const temperatureF = toF(asNumber(period.temperature), period.temperatureUnit) ?? 60;
    const isDaytime = period.isDaytime ?? true;
    return {
      startTime,
      endTime: period.endTime ?? startTime,
      temperatureF,
      precipProbability: asNumber(period.probabilityOfPrecipitation?.value),
      humidity: asNumber(period.relativeHumidity?.value),
      dewPointF: toF(asNumber(period.dewpoint?.value), period.dewpoint?.unitCode),
      windMph: parseWindMph(period.windSpeed),
      windDirection: period.windDirection ?? '',
      shortForecast: period.shortForecast ?? 'Forecast',
      isDaytime,
      condition: conditionFromForecast(period.shortForecast ?? '', period.icon),
    };
  });
}

function selectDaily(periods: RawPeriod[], timeZone: string): DailyPeriod[] {
  const rows: DailyPeriod[] = [];
  const todayKey = formatDateKey(new Date().toISOString(), timeZone);

  for (let index = 0; index < periods.length; index += 1) {
    const period = periods[index];
    if (!period.isDaytime) continue;

    const next = periods[index + 1];
    const night = next && next.isDaytime === false ? next : null;
    const startTime = period.startTime ?? new Date().toISOString();
    const temperatureF = toF(asNumber(period.temperature), period.temperatureUnit) ?? 60;
    const lowF =
      toF(asNumber(night?.temperature), night?.temperatureUnit) ??
      temperatureF - 10;

    rows.push({
      startTime,
      endTime: period.endTime ?? startTime,
      name:
        formatDateKey(startTime, timeZone) === todayKey
          ? 'Today'
          : formatWeekday(startTime, timeZone),
      temperatureF,
      lowF,
      precipProbability: maxNullable(
        asNumber(period.probabilityOfPrecipitation?.value),
        asNumber(night?.probabilityOfPrecipitation?.value),
      ),
      windMph: parseWindMph(period.windSpeed),
      windDirection: period.windDirection ?? '',
      shortForecast: period.shortForecast ?? 'Forecast',
      isDaytime: true,
      condition: conditionFromForecast(period.shortForecast ?? '', period.icon),
      detailedForecast: period.detailedForecast ?? '',
    });

    if (rows.length === 7) break;
  }
  return rows;
}

function normalizeAlerts(data: AlertsResponse | null): WeatherAlert[] {
  if (!data?.features?.length) return [];

  const severityRank: Record<string, number> = {
    Extreme: 5,
    Severe: 4,
    Moderate: 3,
    Minor: 2,
    Unknown: 1,
  };

  return data.features
    .map((feature) => {
      const props = feature.properties ?? {};
      const severity =
        props.severity === 'Extreme' ||
        props.severity === 'Severe' ||
        props.severity === 'Moderate' ||
        props.severity === 'Minor'
          ? props.severity
          : 'Unknown';
      return {
        id: feature.id ?? `${props.event ?? 'alert'}-${props.onset ?? ''}-${props.expires ?? ''}`,
        event: props.event ?? 'Weather alert',
        headline: props.headline || props.event || 'Weather alert',
        description: props.description ?? '',
        instruction: props.instruction ?? '',
        severity,
        urgency: props.urgency ?? 'Unknown',
        certainty: props.certainty ?? 'Unknown',
        onset: props.onset ?? null,
        ends: props.ends ?? null,
        expires: props.expires ?? null,
        areaDesc: props.areaDesc ?? '',
        senderName: props.senderName ?? 'National Weather Service',
      } as WeatherAlert;
    })
    .sort((a, b) => (severityRank[b.severity] ?? 0) - (severityRank[a.severity] ?? 0));
}

export async function getWeather(place: Place, signal?: AbortSignal): Promise<WeatherBundle> {
  const point = await getPoint(place, signal);
  const [forecast, hourlyForecast, stations, alerts] = await Promise.all([
    getJSON<ForecastResponse>(point.forecastUrl, signal),
    getJSON<ForecastResponse>(point.hourlyUrl, signal),
    getJSON<StationsResponse>(point.stationsUrl, signal).catch(() => null),
    getJSON<AlertsResponse>(
      `${NWS_BASE}/alerts/active?point=${place.latitude.toFixed(4)},${place.longitude.toFixed(4)}`,
      signal,
    ).catch(() => null),
  ]);

  const hourly = selectHourly(hourlyForecast.properties?.periods ?? [], point.timeZone);
  const daily = selectDaily(forecast.properties?.periods ?? [], point.timeZone);
  if (!hourly.length && !daily.length) {
    throw new WeatherApiError(
      'parse',
      'The National Weather Service did not return a usable forecast for this location.',
    );
  }

  const firstHour = hourly[0];
  const firstDay = daily[0];
  const stationId = stations?.features?.[0]?.id;
  let observation: ObservationResponse | null = null;
  if (stationId) {
    observation = await getJSON<ObservationResponse>(
      `${stationId.replace(/\/$/, '')}/observations/latest`,
      signal,
    ).catch(() => null);
  }

  const observationProperties = observation?.properties;
  const observedTempF = toF(
    asNumber(observationProperties?.temperature?.value),
    observationProperties?.temperature?.unitCode,
  );
  const fallbackTempF = firstHour?.temperatureF ?? firstDay?.temperatureF ?? 60;
  const observedAt = observationProperties?.timestamp ?? null;
  const observedAtMs = observedAt ? new Date(observedAt).getTime() : NaN;
  const observationAgeMs = Number.isFinite(observedAtMs) ? Date.now() - observedAtMs : Infinity;
  const observationFresh =
    observedTempF != null && observationAgeMs > -5 * 60 * 1000 && observationAgeMs < 90 * 60 * 1000;
  const temperatureF = observationFresh && observedTempF != null ? observedTempF : fallbackTempF;
  const heatIndexF = toF(
    asNumber(observationProperties?.heatIndex?.value),
    observationProperties?.heatIndex?.unitCode,
  );
  const windChillF = toF(
    asNumber(observationProperties?.windChill?.value),
    observationProperties?.windChill?.unitCode,
  );
  const description = observationFresh
    ? observationProperties?.textDescription?.trim() ||
      firstHour?.shortForecast ||
      firstDay?.shortForecast ||
      'Current conditions'
    : firstHour?.shortForecast || firstDay?.shortForecast || 'Forecast';

  const windDegrees = observationFresh
    ? asNumber(observationProperties?.windDirection?.value)
    : degreesFromCardinal(firstHour?.windDirection);
  const observationWind = windToMph(
    asNumber(observationProperties?.windSpeed?.value),
    observationProperties?.windSpeed?.unitCode,
  );
  const observedHumidity = asNumber(observationProperties?.relativeHumidity?.value);
  const observedDewPointF = toF(
    asNumber(observationProperties?.dewpoint?.value),
    observationProperties?.dewpoint?.unitCode,
  );
  const current: CurrentConditions = {
    temperatureF,
    feelsLikeF: observationFresh ? heatIndexF ?? windChillF ?? temperatureF : temperatureF,
    humidity: observationFresh ? observedHumidity ?? firstHour?.humidity ?? null : firstHour?.humidity ?? null,
    dewPointF: observationFresh ? observedDewPointF ?? firstHour?.dewPointF ?? null : firstHour?.dewPointF ?? null,
    windMph: observationFresh ? observationWind ?? firstHour?.windMph ?? null : firstHour?.windMph ?? null,
    windGustMph: observationFresh
      ? windToMph(
          asNumber(observationProperties?.windGust?.value),
          observationProperties?.windGust?.unitCode,
        )
      : null,
    windDirectionDeg: windDegrees,
    windDirection:
      cardinalFromDegrees(windDegrees) ||
      (firstHour?.windDirection ? firstHour.windDirection : null),
    pressureInHg: observationFresh
      ? pressureToInHg(
          asNumber(observationProperties?.barometricPressure?.value),
          observationProperties?.barometricPressure?.unitCode,
        )
      : null,
    visibilityMi: observationFresh
      ? distanceToMiles(
          asNumber(observationProperties?.visibility?.value),
          observationProperties?.visibility?.unitCode,
        )
      : null,
    precipIn: observationFresh
      ? precipToInches(
          asNumber(observationProperties?.precipitationLastHour?.value),
          observationProperties?.precipitationLastHour?.unitCode,
        )
      : null,
    description,
    stationName: observationFresh
      ? observationProperties?.stationName ||
        stations?.features?.[0]?.properties?.name ||
        'NWS observation'
      : 'NWS hourly forecast',
    observedAt: observationFresh && observedAt ? observedAt : new Date().toISOString(),
    isObservation: observationFresh,
  };

  const resolvedPlace: Place = {
    ...place,
    name:
      place.source === 'gps' || /^current location$/i.test(place.name)
        ? point.city || place.name
        : place.name || point.city,
    region: place.region || point.state,
  };

  return {
    place: resolvedPlace,
    timeZone: point.timeZone,
    sunrise: point.sunrise,
    sunset: point.sunset,
    current,
    hourly,
    daily,
    alerts: normalizeAlerts(alerts),
    fetchedAt: new Date().toISOString(),
    stationName: current.stationName,
    radarStation: point.radarStation,
  };
}

export function isDaytimeForWeather(bundle: WeatherBundle, now = new Date()) {
  return isDaylightNow(bundle.sunrise, bundle.sunset, bundle.timeZone, now);
}

export function friendlyWeatherError(error: unknown) {
  if (error instanceof WeatherApiError) return error.message;
  if (error instanceof Error && error.name === 'AbortError') return '';
  return 'Something went wrong while reading the sky. Please try again.';
}
