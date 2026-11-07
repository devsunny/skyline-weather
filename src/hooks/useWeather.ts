import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { Place, WeatherBundle } from '../types';
import { friendlyWeatherError, getWeather } from '../api/nws';
import { readCachedWeather, writeCachedWeather } from '../lib/cache';

export type WeatherStatus = 'loading' | 'refreshing' | 'ready' | 'stale' | 'error';

type WeatherState = {
  data: WeatherBundle | null;
  status: WeatherStatus;
  error: string | null;
};

const INITIAL_STATE: WeatherState = {
  data: null,
  status: 'loading',
  error: null,
};

const AUTO_REFRESH_MS = 10 * 60 * 1000;
const STALE_AFTER_MS = 15 * 60 * 1000;

export function useWeather(place: Place | null) {
  const [state, setState] = useState<WeatherState>(INITIAL_STATE);
  const [isManualRefreshing, setManualRefreshing] = useState(false);
  const dataRef = useRef<WeatherBundle | null>(null);
  const placeRef = useRef<Place | null>(place);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const setWeather = useCallback((next: WeatherState) => {
    dataRef.current = next.data;
    setState(next);
  }, []);

  const load = useCallback(
    async (
      target: Place,
      options: { keepData?: boolean; readCache?: boolean; manual?: boolean } = {},
    ) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (options.manual) setManualRefreshing(true);

      const existing = options.keepData ? dataRef.current : null;
      if (existing) {
        setWeather({ data: existing, status: 'refreshing', error: null });
      } else {
        setWeather({ data: null, status: 'loading', error: null });
      }

      if (options.readCache !== false && !existing) {
        const cached = await readCachedWeather(target);
        if (requestIdRef.current !== requestId || controller.signal.aborted) return;
        if (cached) {
          setWeather({ data: cached, status: 'refreshing', error: null });
        }
      }

      try {
        const fresh = await getWeather(target, controller.signal);
        if (requestIdRef.current !== requestId || controller.signal.aborted) return;
        setWeather({ data: fresh, status: 'ready', error: null });
        await writeCachedWeather(target, fresh);
      } catch (error) {
        if (requestIdRef.current !== requestId || controller.signal.aborted) return;
        const message = friendlyWeatherError(error);
        if (!message) return;
        const fallback = dataRef.current;
        if (fallback) {
          setWeather({ data: fallback, status: 'stale', error: message });
        } else {
          setWeather({ data: null, status: 'error', error: message });
        }
      } finally {
        if (requestIdRef.current === requestId) {
          abortRef.current = null;
          if (options.manual) setManualRefreshing(false);
        }
      }
    },
    [setWeather],
  );

  const placeKey = place
    ? `${place.latitude.toFixed(4)},${place.longitude.toFixed(4)}`
    : null;

  useEffect(() => {
    placeRef.current = place;
  }, [place]);

  useEffect(() => {
    if (!place) {
      requestIdRef.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
      setWeather(INITIAL_STATE);
      return;
    }

    void load(place, { readCache: true });
    return () => {
      abortRef.current?.abort();
    };
    // The coordinate key intentionally drives forecast reloads, not the place label.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeKey, place?.id, load, setWeather]);

  const refresh = useCallback(() => {
    const current = placeRef.current;
    if (!current) return;
    void load(current, { keepData: true, readCache: false, manual: true });
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = placeRef.current;
      if (current && !abortRef.current) {
        void load(current, { keepData: true, readCache: false });
      }
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const current = placeRef.current;
      const lastUpdated = dataRef.current ? new Date(dataRef.current.fetchedAt).getTime() : 0;
      if (
        nextState === 'active' &&
        current &&
        dataRef.current &&
        Date.now() - lastUpdated > STALE_AFTER_MS &&
        !abortRef.current
      ) {
        void load(current, { keepData: true, readCache: false });
      }
    });
    return () => subscription.remove();
  }, [load]);

  return {
    ...state,
    isManualRefreshing,
    refresh,
    lastUpdated: state.data ? new Date(state.data.fetchedAt).getTime() : null,
  };
}
