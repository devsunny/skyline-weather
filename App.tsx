import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
const Sora_600SemiBold = require('@expo-google-fonts/sora/600SemiBold/Sora_600SemiBold.ttf');
const Sora_700Bold = require('@expo-google-fonts/sora/700Bold/Sora_700Bold.ttf');
const Sora_800ExtraBold = require('@expo-google-fonts/sora/800ExtraBold/Sora_800ExtraBold.ttf');
const Inter_400Regular = require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf');
const Inter_500Medium = require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf');
const Inter_600SemiBold = require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf');

import type { Place, Settings } from './src/types';
import { DEFAULT_PLACES, DEFAULT_SETTINGS } from './src/data/defaults';
import { useWeather } from './src/hooks/useWeather';
import {
  loadActivePlaceId,
  loadPlaces,
  loadSettings,
  saveActivePlaceId,
  savePlaces,
  saveSettings,
} from './src/lib/storage';
import { BootScreen } from './src/ui/BootScreen';
import { WeatherScreen } from './src/screens/WeatherScreen';
import { SearchSheet } from './src/screens/SearchSheet';
import { SettingsSheet } from './src/screens/SettingsSheet';
import { AlertSheet } from './src/screens/AlertSheet';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

const sameSpot = (left: Place, right: Place) =>
  Math.abs(left.latitude - right.latitude) < 0.02 &&
  Math.abs(left.longitude - right.longitude) < 0.02;

function Root() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [hydrated, setHydrated] = useState(false);
  const [places, setPlaces] = useState<Place[]>(DEFAULT_PLACES);
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const fontsReady = fontsLoaded || Boolean(fontError);
  const weather = useWeather(hydrated ? activePlace : null);
  const alerts = weather.data?.alerts ?? [];

  useEffect(() => {
    if (!fontsReady) return;
    void SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsReady]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [savedSettings, savedPlaces, savedActiveId] = await Promise.all([
        loadSettings(),
        loadPlaces(),
        loadActivePlaceId(),
      ]);
      if (!mounted) return;

      const nextPlaces = savedPlaces?.length ? savedPlaces : DEFAULT_PLACES;
      const nextActive =
        nextPlaces.find((place) => place.id === savedActiveId) ?? nextPlaces[0] ?? DEFAULT_PLACES[0];
      setSettings(savedSettings);
      setPlaces(nextPlaces);
      setActivePlace(nextActive);
      setHydrated(true);
    })().catch(() => {
      if (!mounted) return;
      setPlaces(DEFAULT_PLACES);
      setActivePlace(DEFAULT_PLACES[0]);
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveSettings(settings);
  }, [settings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void savePlaces(places);
  }, [places, hydrated]);

  useEffect(() => {
    if (!hydrated || !activePlace) return;
    void saveActivePlaceId(activePlace.id);
  }, [activePlace, hydrated]);

  useEffect(() => {
    if (alertsOpen && alerts.length === 0) setAlertsOpen(false);
  }, [alerts.length, alertsOpen]);

  const selectPlace = (incoming: Place) => {
    void Haptics.selectionAsync().catch(() => undefined);
    const isCurrent = incoming.source === 'gps' || incoming.id === 'current-location';

    if (isCurrent) {
      const existing = places.find((place) => place.id === 'current-location');
      if (existing) {
        const updated = {
          ...existing,
          latitude: incoming.latitude,
          longitude: incoming.longitude,
          name: 'Current location',
          region: '',
        };
        setPlaces((current) =>
          current.map((place) => (place.id === existing.id ? updated : place)),
        );
        setActivePlace(updated);
      } else {
        setPlaces((current) => [incoming, ...current].slice(0, 10));
        setActivePlace(incoming);
      }
      setSearchOpen(false);
      return;
    }

    const existing = places.find((place) => sameSpot(place, incoming));
    if (existing) {
      const updated = {
        ...existing,
        name: incoming.name || existing.name,
        region: incoming.region || existing.region,
      };
      if (updated.name !== existing.name || updated.region !== existing.region) {
        setPlaces((current) =>
          current.map((place) => (place.id === existing.id ? updated : place)),
        );
      }
      setActivePlace(updated);
    } else {
      setPlaces((current) => [incoming, ...current].slice(0, 10));
      setActivePlace(incoming);
    }
    setSearchOpen(false);
  };

  const removePlace = (place: Place) => {
    if (places.length <= 1) return;
    const next = places.filter((item) => item.id !== place.id);
    setPlaces(next);
    if (activePlace?.id === place.id) {
      setActivePlace(next[0] ?? DEFAULT_PLACES[0]);
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  };

  const changeUnits = (units: Settings['units']) => {
    setSettings((current) => ({ ...current, units }));
  };

  if (!fontsReady) {
    return <View style={styles.fontGate} />;
  }

  if (!hydrated) {
    return (
      <View style={styles.root}>
        <BootScreen />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <WeatherScreen
        weather={weather}
        settings={settings}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAlerts={() => setAlertsOpen(true)}
      />

      <SearchSheet
        visible={searchOpen}
        places={places}
        activePlaceId={activePlace?.id ?? ''}
        onClose={() => setSearchOpen(false)}
        onSelect={selectPlace}
        onRemove={removePlace}
      />

      <SettingsSheet
        visible={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onUnitsChange={changeUnits}
      />

      <AlertSheet
        visible={alertsOpen}
        alerts={alerts}
        timeZone={weather.data?.timeZone ?? 'America/New_York'}
        onClose={() => setAlertsOpen(false)}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#071522',
  },
  fontGate: {
    flex: 1,
    backgroundColor: '#071522',
  },
});
