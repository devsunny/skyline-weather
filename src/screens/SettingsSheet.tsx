import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  ArrowUpRight,
  CloudSun,
  Database,
  Gauge,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Settings, Units } from '../types';
import { clearWeatherCache, countCachedWeather } from '../lib/cache';
import { COLORS, FONTS, MAX_WIDTH } from '../ui/theme';
import { SheetHeader } from '../ui/SheetHeader';

type SettingsSheetProps = {
  visible: boolean;
  settings: Settings;
  onClose: () => void;
  onUnitsChange: (units: Units) => void;
};

export function SettingsSheet({ visible, settings, onClose, onUnitsChange }: SettingsSheetProps) {
  const [cacheCount, setCacheCount] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCleared(false);
    countCachedWeather().then(setCacheCount).catch(() => setCacheCount(0));
  }, [visible]);

  const changeUnits = (units: Units) => {
    if (units === settings.units) return;
    void Haptics.selectionAsync().catch(() => undefined);
    onUnitsChange(units);
  };

  const clearCache = async () => {
    setClearing(true);
    const removed = await clearWeatherCache();
    setCacheCount((current) => Math.max(0, (current ?? removed) - removed));
    setClearing(false);
    setCleared(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <LinearGradient colors={['#07131D', '#0A1925']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <SheetHeader kicker="PREFERENCES" title="Settings" onClose={onClose} />

            <Text style={styles.sectionTitle}>UNITS</Text>
            <View style={styles.segmented}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: settings.units === 'imperial' }}
                onPress={() => changeUnits('imperial')}
                style={[styles.segment, settings.units === 'imperial' && styles.segmentActive]}
              >
                <Text style={[styles.segmentValue, settings.units === 'imperial' && styles.segmentValueActive]}>
                  °F
                </Text>
                <Text style={[styles.segmentLabel, settings.units === 'imperial' && styles.segmentLabelActive]}>
                  Fahrenheit · mph
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: settings.units === 'metric' }}
                onPress={() => changeUnits('metric')}
                style={[styles.segment, settings.units === 'metric' && styles.segmentActive]}
              >
                <Text style={[styles.segmentValue, settings.units === 'metric' && styles.segmentValueActive]}>
                  °C
                </Text>
                <Text style={[styles.segmentLabel, settings.units === 'metric' && styles.segmentLabelActive]}>
                  Celsius · km/h
                </Text>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>DATA & COVERAGE</Text>
            <View style={styles.card}>
              <InfoRow
                icon={CloudSun}
                title="Forecast source"
                detail="NOAA / National Weather Service"
              />
              <View style={styles.divider} />
              <InfoRow
                icon={MapPin}
                title="Coverage"
                detail="United States, Alaska, Hawaii & territories"
              />
              <View style={styles.divider} />
              <InfoRow
                icon={RefreshCw}
                title="Refresh rhythm"
                detail="Rechecked every 10 minutes, cached for offline use"
              />
              <View style={styles.divider} />
              <InfoRow
                icon={ShieldCheck}
                title="No account needed"
                detail="No sign-in, ads, or tracking"
              />
            </View>

            <Text style={styles.sectionTitle}>STORAGE</Text>
            <Pressable
              accessibilityRole="button"
              onPress={clearCache}
              disabled={clearing}
              style={({ pressed }) => [styles.cacheRow, pressed && styles.pressed]}
            >
              <View style={styles.cacheIcon}>
                {clearing ? (
                  <ActivityIndicator size="small" color={COLORS.textSecondary} />
                ) : (
                  <Database size={16} color={COLORS.textSecondary} strokeWidth={2} />
                )}
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>
                  {cleared ? 'Cached forecasts cleared' : 'Clear cached forecasts'}
                </Text>
                <Text style={styles.rowDetail}>
                  {cacheCount == null
                    ? 'Checking local cache…'
                    : `${cacheCount} ${cacheCount === 1 ? 'forecast' : 'forecasts'} stored on this device`}
                </Text>
              </View>
              {cleared ? null : <Trash2 size={15} color={COLORS.textFaint} strokeWidth={1.9} />}
            </Pressable>

            <Text style={styles.sectionTitle}>ABOUT</Text>
            <View style={styles.card}>
              <InfoRow icon={Gauge} title="Skyline Weather" detail="Version 1.0.0 · Built with Expo" />
              <View style={styles.divider} />
              <Pressable
                accessibilityRole="link"
                onPress={() => Linking.openURL('https://www.weather.gov')}
                style={({ pressed }) => [styles.infoRow, pressed && styles.pressed]}
              >
                <View style={styles.infoIcon}>
                  <ArrowUpRight size={16} color={COLORS.textSecondary} strokeWidth={2} />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>weather.gov</Text>
                  <Text style={styles.rowDetail}>The source of every forecast in Skyline</Text>
                </View>
              </Pressable>
            </View>

            <Text style={styles.footer}>
              Weather data is provided by NOAA and the National Weather Service. Location search
              uses OpenStreetMap contributors. Skyline is an independent app and is not endorsed
              by NOAA.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function InfoRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof CloudSun;
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon size={16} color={COLORS.textSecondary} strokeWidth={2} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.sheet,
  },
  safe: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  sectionTitle: {
    color: COLORS.textFaint,
    fontFamily: FONTS.bodySemibold,
    fontSize: 9,
    letterSpacing: 1.7,
    marginTop: 26,
    marginBottom: 10,
    marginLeft: 2,
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
  },
  segment: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: COLORS.lineStrong,
  },
  segmentValue: {
    color: COLORS.textMuted,
    fontFamily: FONTS.displayMedium,
    fontSize: 19,
    letterSpacing: -0.4,
  },
  segmentValueActive: {
    color: COLORS.text,
  },
  segmentLabel: {
    color: COLORS.textFaint,
    fontFamily: FONTS.body,
    fontSize: 9.5,
    marginTop: 3,
  },
  segmentLabelActive: {
    color: COLORS.textSecondary,
  },
  card: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12.5,
  },
  rowDetail: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.line,
    marginLeft: 60,
  },
  cacheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
  },
  cacheIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    color: COLORS.textFaint,
    fontFamily: FONTS.body,
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 26,
    paddingHorizontal: 2,
  },
  pressed: {
    opacity: 0.6,
  },
});
