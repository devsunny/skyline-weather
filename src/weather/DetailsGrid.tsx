import type { ComponentType } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CloudRain,
  Droplets,
  Eye,
  Gauge,
  Navigation,
  Thermometer,
  Wind,
} from 'lucide-react-native';

import type { Units, WeatherBundle } from '../types';
import type { SkyPalette } from '../lib/sky';
import {
  formatPrecip,
  formatPressure,
  formatVisibility,
  formatWind,
} from '../lib/format';
import { COLORS, FONTS, RADIUS, styles as shared } from '../ui/theme';

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

type DetailsGridProps = {
  weather: WeatherBundle;
  units: Units;
  palette: SkyPalette;
};

type MetricCardProps = {
  icon: IconComponent;
  label: string;
  value: string;
  detail: string;
  palette: SkyPalette;
  accessory?: React.ReactNode;
};

function MetricCard({ icon: Icon, label, value, detail, palette, accessory }: MetricCardProps) {
  return (
    <View style={[shared.card, styles.card]}>
      <View style={styles.topRow}>
        <View style={[styles.icon, { backgroundColor: palette.accentSoft }]}>
          <Icon size={15} color={palette.accent} strokeWidth={2} />
        </View>
        {accessory}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {value}
      </Text>
      <Text style={styles.detail} numberOfLines={1}>{detail}</Text>
    </View>
  );
}

export function DetailsGrid({ weather, units, palette }: DetailsGridProps) {
  const { current } = weather;
  const humidity = current.humidity != null ? `${Math.round(current.humidity)}%` : '—';
  const gustDetail = current.windGustMph != null
    ? `Gusts ${formatWind(current.windGustMph, units)}`
    : 'Sustained wind';
  const dewDetail = current.dewPointF != null
    ? current.dewPointF >= 65
      ? 'Muggy air'
      : current.dewPointF <= 45
        ? 'Dry air'
        : 'Comfortable'
    : 'Not reported';

  return (
    <View style={styles.grid}>
      <MetricCard
        icon={Wind}
        label="WIND"
        value={formatWind(current.windMph, units)}
        detail={current.windDirection ? `From ${current.windDirection} · ${gustDetail}` : gustDetail}
        palette={palette}
        accessory={
          current.windDirectionDeg != null ? (
            <Navigation
              size={13}
              color={COLORS.textMuted}
              strokeWidth={1.8}
              style={{ transform: [{ rotate: `${current.windDirectionDeg}deg` }] }}
            />
          ) : null
        }
      />
      <MetricCard
        icon={Droplets}
        label="HUMIDITY"
        value={humidity}
        detail="Relative humidity"
        palette={palette}
      />
      <MetricCard
        icon={Thermometer}
        label="DEW POINT"
        value={current.dewPointF != null ? `${Math.round(units === 'imperial' ? current.dewPointF : ((current.dewPointF - 32) * 5) / 9)}°` : '—'}
        detail={dewDetail}
        palette={palette}
      />
      <MetricCard
        icon={Gauge}
        label="PRESSURE"
        value={formatPressure(current.pressureInHg, units)}
        detail="Barometric pressure"
        palette={palette}
      />
      <MetricCard
        icon={Eye}
        label="VISIBILITY"
        value={formatVisibility(current.visibilityMi, units)}
        detail="Horizontal distance"
        palette={palette}
      />
      <MetricCard
        icon={CloudRain}
        label="PRECIPITATION"
        value={formatPrecip(current.precipIn, units)}
        detail="Last hour"
        palette={palette}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 140,
    padding: 14,
    borderRadius: RADIUS.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemibold,
    fontSize: 8.5,
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  value: {
    color: COLORS.text,
    fontFamily: FONTS.displayMedium,
    fontSize: 20,
    letterSpacing: -0.5,
  },
  detail: {
    color: COLORS.textFaint,
    fontFamily: FONTS.body,
    fontSize: 9.5,
    marginTop: 4,
  },
});
