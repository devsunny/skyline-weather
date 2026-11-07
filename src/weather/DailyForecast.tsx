import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplet } from 'lucide-react-native';

import type { DailyPeriod, Units } from '../types';
import type { SkyPalette } from '../lib/sky';
import { getSkyPalette } from '../lib/sky';
import { tempValue } from '../lib/format';
import { COLORS, FONTS, styles as shared } from '../ui/theme';
import { WeatherGlyph } from './WeatherGlyph';

type DailyForecastProps = {
  daily: DailyPeriod[];
  units: Units;
  palette: SkyPalette;
};

export function DailyForecast({ daily, units, palette }: DailyForecastProps) {
  const allTemps = daily.flatMap((day) => [day.lowF, day.temperatureF]);
  const min = Math.min(...allTemps);
  const max = Math.max(...allTemps);
  const range = Math.max(1, max - min);

  return (
    <View style={shared.card}>
      {daily.map((day, index) => {
        const left = Math.max(0, Math.min(1, (day.lowF - min) / range));
        const right = Math.max(left + 0.06, Math.min(1, (day.temperatureF - min) / range));
        const glyphPalette = getSkyPalette(day.condition, true);
        const precipitation = day.precipProbability ?? 0;

        return (
          <View
            key={`${day.startTime}-${index}`}
            accessible
            accessibilityLabel={`${day.name}, ${day.shortForecast}, high ${tempValue(day.temperatureF, units)}, low ${tempValue(day.lowF, units)}`}
            style={[styles.row, index < daily.length - 1 && styles.divider]}
          >
            <Text style={[styles.day, index === 0 && styles.dayToday]}>{day.name}</Text>
            <WeatherGlyph
              condition={day.condition}
              isDay
              palette={glyphPalette}
              size={27}
            />
            <View style={styles.precip}>
              {precipitation > 0 ? (
                <>
                  <Droplet size={8} color={palette.rain} fill={palette.rain} strokeWidth={1.4} />
                  <Text style={styles.precipText}>{precipitation}%</Text>
                </>
              ) : null}
            </View>
            <Text style={styles.low}>{tempValue(day.lowF, units)}°</Text>
            <View style={styles.track}>
              <LinearGradient
                colors={['#80D8EF', palette.accent, '#F4B86A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.fill,
                  {
                    left: `${left * 100}%`,
                    width: `${Math.max(7, (right - left) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.high}>{tempValue(day.temperatureF, units)}°</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 15,
    gap: 7,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
  },
  day: {
    width: 50,
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  dayToday: {
    color: COLORS.text,
    fontFamily: FONTS.bodySemibold,
  },
  precip: {
    width: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  precipText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 9,
  },
  low: {
    width: 30,
    textAlign: 'right',
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  high: {
    width: 33,
    textAlign: 'right',
    color: COLORS.text,
    fontFamily: FONTS.bodySemibold,
    fontSize: 12.5,
  },
});
