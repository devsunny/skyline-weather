import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Droplet } from 'lucide-react-native';

import type { HourlyPeriod, Units } from '../types';
import type { SkyPalette } from '../lib/sky';
import { getSkyPalette } from '../lib/sky';
import { formatHour, tempValue } from '../lib/format';
import { COLORS, FONTS } from '../ui/theme';
import { WeatherGlyph } from './WeatherGlyph';

type HourlyStripProps = {
  hourly: HourlyPeriod[];
  units: Units;
  timeZone: string;
  palette: SkyPalette;
};

function HourCard({
  period,
  units,
  timeZone,
  palette,
  isFirst,
}: {
  period: HourlyPeriod;
  units: Units;
  timeZone: string;
  palette: SkyPalette;
  isFirst: boolean;
}) {
  const glyphPalette = getSkyPalette(period.condition, period.isDaytime);
  const precipitation = period.precipProbability ?? 0;

  return (
    <View
      accessible
      accessibilityLabel={`${isFirst ? 'Now' : formatHour(period.startTime, timeZone)}, ${tempValue(period.temperatureF, units)} degrees, ${period.shortForecast}${precipitation > 0 ? `, ${precipitation} percent chance of precipitation` : ''}`}
      style={[styles.card, isFirst && styles.cardNow]}
    >
      <Text style={[styles.hour, isFirst && styles.hourNow]}>
        {isFirst ? 'Now' : formatHour(period.startTime, timeZone)}
      </Text>
      <WeatherGlyph
        condition={period.condition}
        isDay={period.isDaytime}
        palette={glyphPalette}
        size={38}
      />
      <Text style={styles.temp}>{tempValue(period.temperatureF, units)}°</Text>
      <View style={styles.precip}>
        {precipitation > 0 ? (
          <>
            <Droplet size={8.5} color={palette.rain} fill={palette.rain} strokeWidth={1.6} />
            <Text style={[styles.precipText, { color: palette.rain }]}>{precipitation}%</Text>
          </>
        ) : (
          <Text style={styles.precipEmpty}> </Text>
        )}
      </View>
    </View>
  );
}

export function HourlyStrip({ hourly, units, timeZone, palette }: HourlyStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      decelerationRate="fast"
    >
      {hourly.map((period, index) => (
        <HourCard
          key={`${period.startTime}-${index}`}
          period={period}
          units={units}
          timeZone={timeZone}
          palette={palette}
          isFirst={index === 0}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingRight: 16,
  },
  card: {
    width: 66,
    height: 116,
    paddingVertical: 10,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.065)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardNow: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.30)',
  },
  hour: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 10.5,
  },
  hourNow: {
    color: COLORS.text,
    fontFamily: FONTS.bodySemibold,
  },
  temp: {
    color: COLORS.text,
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    letterSpacing: -0.5,
  },
  precip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: 13,
  },
  precipText: {
    fontFamily: FONTS.bodySemibold,
    fontSize: 9,
  },
  precipEmpty: {
    fontSize: 9,
  },
});
