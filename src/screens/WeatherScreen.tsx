import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Search, Settings2 } from 'lucide-react-native';

import type { Settings, SkyCondition, WeatherBundle } from '../types';
import type { useWeather } from '../hooks/useWeather';
import { useNow } from '../hooks/useNow';
import {
  formatClock,
  formatLongWeekday,
  formatMonthDay,
  formatUpdated,
} from '../lib/format';
import {
  conditionFromForecast,
  getDaylightInfo,
  getSkyPalette,
  isDaylightNow,
} from '../lib/sky';
import { COLORS, FONTS, MAX_WIDTH } from '../ui/theme';
import { IconButton } from '../ui/IconButton';
import { SectionHeader } from '../ui/SectionHeader';
import { ErrorView } from '../ui/ErrorView';
import { LoadingScreen } from '../ui/LoadingScreen';
import { SkyBackground } from '../weather/SkyBackground';
import { CurrentHero } from '../weather/CurrentHero';
import { AlertBanner } from '../weather/AlertBanner';
import { HourlyStrip } from '../weather/HourlyStrip';
import { DailyForecast } from '../weather/DailyForecast';
import { SunCard } from '../weather/SunCard';
import { DetailsGrid } from '../weather/DetailsGrid';
import { StaleBanner } from '../weather/StaleBanner';

type WeatherScreenProps = {
  weather: ReturnType<typeof useWeather>;
  settings: Settings;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenAlerts: () => void;
};

function currentCondition(weather: WeatherBundle): SkyCondition {
  if (
    weather.current.description &&
    weather.current.description !== 'Current conditions' &&
    weather.current.isObservation
  ) {
    return conditionFromForecast(weather.current.description);
  }
  return weather.hourly[0]?.condition ?? 'partly';
}

export function WeatherScreen({
  weather,
  settings,
  onOpenSearch,
  onOpenSettings,
  onOpenAlerts,
}: WeatherScreenProps) {
  const now = useNow(30000);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const data = weather.data;

  const condition = data ? currentCondition(data) : 'partly';
  const isDay = data
    ? isDaylightNow(data.sunrise, data.sunset, data.timeZone, now)
    : now.getHours() >= 6 && now.getHours() < 19;
  const palette = useMemo(() => getSkyPalette(condition, isDay), [condition, isDay]);

  const timeZone =
    data?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'America/New_York';
  const displayPlace = data?.place ?? null;
  const daylight = data
    ? getDaylightInfo(data.sunrise, data.sunset, data.timeZone, now)
    : null;

  if (!data) {
    return (
      <View style={styles.root}>
        <SkyBackground palette={palette} />
        <StatusBar style="light" />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          {weather.status === 'error' ? (
            <>
              <View style={styles.errorHeader}>
                <View style={styles.brand}>
                  <View style={[styles.brandDot, { backgroundColor: palette.accent }]} />
                  <Text style={styles.brandText}>SKYLINE</Text>
                </View>
                <IconButton
                  icon={Settings2}
                  onPress={onOpenSettings}
                  accessibilityLabel="Open settings"
                />
              </View>
              <ErrorView
                message={weather.error ?? 'The forecast could not be loaded. Please try again.'}
                onRetry={weather.refresh}
                onSearch={onOpenSearch}
              />
            </>
          ) : (
            <LoadingScreen label={weather.status === 'refreshing' ? 'Refreshing the sky' : 'Reading the sky'} />
          )}
        </SafeAreaView>
      </View>
    );
  }

  const placeName = displayPlace?.name ?? 'Weather';
  const region = displayPlace?.region ?? '';
  const observedTime = formatClock(data.current.observedAt, data.timeZone);
  const isRefreshing = weather.status === 'refreshing';

  return (
    <View style={styles.root}>
      <SkyBackground palette={palette} />
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(42, insets.bottom + 30) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={weather.isManualRefreshing}
              onRefresh={weather.refresh}
              tintColor={COLORS.text}
              colors={[COLORS.text]}
              progressBackgroundColor="#0A1A27"
            />
          }
        >
          <View style={styles.topBar}>
            <View style={styles.brand}>
              <View style={[styles.brandDot, { backgroundColor: palette.accent }]} />
              <Text style={styles.brandText}>SKYLINE</Text>
            </View>
            <View style={styles.actions}>
              <View style={styles.livePill}>
                {isRefreshing ? (
                  <ActivityIndicator size="small" color={COLORS.textSecondary} />
                ) : (
                  <View style={[styles.liveDot, { backgroundColor: palette.accent }]} />
                )}
                <Text style={styles.liveText}>{isRefreshing ? 'SYNCING' : 'NWS'}</Text>
              </View>
              <IconButton
                icon={Settings2}
                onPress={onOpenSettings}
                accessibilityLabel="Open settings"
                size={18}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Change location. Currently ${placeName}${region ? `, ${region}` : ''}`}
            onPress={onOpenSearch}
            style={({ pressed }) => [styles.locationRow, pressed && styles.pressed]}
          >
            <View style={[styles.pinWrap, { backgroundColor: palette.accentSoft }]}>
              <MapPin size={15} color={palette.accent} strokeWidth={2.1} />
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.placeName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {placeName}
              </Text>
              <Text style={styles.placeMeta} numberOfLines={1}>
                {region ? `${region} · ` : ''}{formatClock(now.toISOString(), timeZone)} local
              </Text>
            </View>
            <View style={styles.searchPill}>
              <Search size={13} color={COLORS.textSecondary} strokeWidth={2.1} />
              <Text style={styles.searchText}>Search</Text>
            </View>
          </Pressable>

          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              {formatLongWeekday(now.toISOString(), timeZone)}, {formatMonthDay(now.toISOString(), timeZone)}
            </Text>
            <View style={styles.dateDot} />
            <Text style={styles.dateText}>
              {isRefreshing ? 'Refreshing…' : formatUpdated(data.fetchedAt, now.getTime())}
            </Text>
          </View>

          {weather.status === 'stale' && weather.error ? (
            <View style={styles.gapSmall}>
              <StaleBanner message={weather.error} onRetry={weather.refresh} />
            </View>
          ) : null}

          {data.alerts.length ? (
            <AlertBanner alerts={data.alerts} timeZone={data.timeZone} onPress={onOpenAlerts} />
          ) : null}

          <CurrentHero weather={data} palette={palette} units={settings.units} />

          <View style={styles.section}>
            <SectionHeader title="Hourly" meta="Next 24 hours" />
            <HourlyStrip
              hourly={data.hourly}
              units={settings.units}
              timeZone={data.timeZone}
              palette={palette}
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="7-day forecast" meta="High / low" />
            <DailyForecast daily={data.daily} units={settings.units} palette={palette} />
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Sun & sky"
              meta={daylight?.isDay ? 'Daylight' : 'After dark'}
            />
            <SunCard
              sunrise={data.sunrise}
              sunset={data.sunset}
              timeZone={data.timeZone}
              now={now}
              palette={palette}
            />
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Conditions"
              meta={data.current.isObservation ? 'Station observation' : 'NWS forecast'}
            />
            <DetailsGrid weather={data} units={settings.units} palette={palette} />
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerTitle}>Data from NOAA · National Weather Service</Text>
            <Text style={styles.footerText} numberOfLines={2}>
              {data.current.isObservation
                ? `${data.stationName} · observed ${observedTime}`
                : 'Current conditions are estimated from the hourly forecast'}
            </Text>
            <Text style={styles.footerText}>
              {width < 380 ? 'Skyline Weather' : 'Skyline Weather · Made for the U.S.'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#071522',
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 46,
    marginTop: 4,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  brandText: {
    color: COLORS.text,
    fontFamily: FONTS.bodySemibold,
    fontSize: 10,
    letterSpacing: 3.2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.065)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  liveText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemibold,
    fontSize: 8,
    letterSpacing: 1.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  pressed: {
    opacity: 0.68,
  },
  pinWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCopy: {
    flex: 1,
    minWidth: 0,
  },
  placeName: {
    color: COLORS.text,
    fontFamily: FONTS.display,
    fontSize: 26,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  placeMeta: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 10.5,
    marginTop: 1,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 32,
    paddingHorizontal: 11,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
  },
  searchText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
    marginBottom: 16,
  },
  dateText: {
    color: COLORS.textFaint,
    fontFamily: FONTS.body,
    fontSize: 10,
  },
  dateDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: COLORS.textFaint,
  },
  gapSmall: {
    marginBottom: 2,
  },
  section: {
    marginTop: 22,
  },
  footer: {
    marginTop: 34,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.line,
  },
  footerLine: {
    width: 26,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 12,
  },
  footerTitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
  },
  footerText: {
    color: COLORS.textFaint,
    fontFamily: FONTS.body,
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 4,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
  },
});
