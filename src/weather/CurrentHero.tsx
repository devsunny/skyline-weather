import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ArrowDown, ArrowUp } from 'lucide-react-native';

import type { SkyCondition, Units, WeatherBundle } from '../types';
import type { SkyPalette } from '../lib/sky';
import { conditionFromForecast } from '../lib/sky';
import { formatClock, tempValue } from '../lib/format';
import { COLORS, FONTS } from '../ui/theme';
import { WeatherGlyph } from './WeatherGlyph';

type CurrentHeroProps = {
  weather: WeatherBundle;
  palette: SkyPalette;
  units: Units;
};

export function CurrentHero({ weather, palette, units }: CurrentHeroProps) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -7,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  const { high, low, condition } = useMemo(() => {
    const temps = weather.hourly.slice(0, 24).map((period) => period.temperatureF);
    const fallbackHigh = weather.daily[0]?.temperatureF ?? weather.current.temperatureF;
    const fallbackLow = weather.daily[0]?.lowF ?? weather.current.temperatureF;
    const observedCondition =
      weather.current.description && weather.current.description !== 'Current conditions'
        ? conditionFromForecast(weather.current.description)
        : weather.hourly[0]?.condition ?? 'clear';
    return {
      high: weather.daily[0]?.temperatureF ?? (temps.length ? Math.max(...temps) : fallbackHigh),
      low: weather.daily[0]?.lowF ?? (temps.length ? Math.min(...temps) : fallbackLow),
      condition: observedCondition as SkyCondition,
    };
  }, [weather]);

  const observedTime = formatClock(weather.current.observedAt, weather.timeZone);
  const unitLetter = units === 'imperial' ? 'F' : 'C';
  const glyphSize = compact ? 138 : 164;

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <View style={styles.copy}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.dot, { backgroundColor: palette.accent }]} />
            <Text style={styles.eyebrow}>
              {weather.current.isObservation ? 'RIGHT NOW' : 'FORECAST'}
            </Text>
          </View>
          <Text style={styles.condition} numberOfLines={2}>
            {weather.current.description}
          </Text>
          <View style={styles.tempRow}>
            <Text
              style={[styles.temp, compact && styles.tempCompact]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {tempValue(weather.current.temperatureF, units)}
            </Text>
            <View style={styles.unitWrap}>
              <Text style={[styles.degree, compact && styles.degreeCompact, { color: palette.accent }]}>°</Text>
              <Text style={styles.unit}>{unitLetter}</Text>
            </View>
          </View>
          <Text style={styles.feels}>
            Feels like {tempValue(weather.current.feelsLikeF, units)}°
          </Text>
        </View>

        <Animated.View
          accessibilityLabel={`${weather.current.description} weather illustration`}
          style={[
            styles.glyph,
            { width: compact ? 142 : 164, height: compact ? 166 : 190, transform: [{ translateY: float }] },
          ]}
        >
          <View style={[styles.glyphHalo, { backgroundColor: palette.glow }]} />
          <WeatherGlyph
            condition={condition}
            isDay={palette.isDay}
            palette={palette}
            size={glyphSize}
          />
        </Animated.View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.highLow}>
          <View style={styles.statPill}>
            <ArrowUp size={13} color={COLORS.textSecondary} strokeWidth={2.4} />
            <Text style={styles.statText}>H {tempValue(high, units)}°</Text>
          </View>
          <View style={styles.statPill}>
            <ArrowDown size={13} color={COLORS.textSecondary} strokeWidth={2.4} />
            <Text style={styles.statText}>L {tempValue(low, units)}°</Text>
          </View>
        </View>
        <Text style={styles.observed} numberOfLines={1}>
          {weather.current.isObservation ? `Observed ${observedTime}` : 'NWS forecast'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 8,
    paddingBottom: 22,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 224,
  },
  copy: {
    flex: 1,
    zIndex: 2,
    paddingRight: 4,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  eyebrow: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemibold,
    fontSize: 9,
    letterSpacing: 1.8,
  },
  condition: {
    color: COLORS.text,
    fontFamily: FONTS.displayMedium,
    fontSize: 19,
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: -4,
    marginTop: -4,
  },
  temp: {
    color: COLORS.text,
    fontFamily: FONTS.displayHeavy,
    fontSize: 104,
    lineHeight: 116,
    letterSpacing: -7,
  },
  tempCompact: {
    fontSize: 90,
    lineHeight: 102,
    letterSpacing: -6,
  },
  unitWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginLeft: 3,
  },
  degree: {
    fontFamily: FONTS.displayMedium,
    fontSize: 48,
    lineHeight: 58,
    marginTop: 2,
  },
  degreeCompact: {
    fontSize: 42,
    lineHeight: 50,
  },
  unit: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemibold,
    fontSize: 11,
    letterSpacing: 0.4,
    marginTop: 8,
    marginLeft: 1,
  },
  feels: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    marginTop: -4,
  },
  glyph: {
    width: 164,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  glyphHalo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 80,
    opacity: 0.55,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -2,
    gap: 10,
  },
  highLow: {
    flexDirection: 'row',
    gap: 7,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
  },
  statText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemibold,
    fontSize: 11,
  },
  observed: {
    flexShrink: 1,
    color: COLORS.textFaint,
    fontFamily: FONTS.body,
    fontSize: 10,
    textAlign: 'right',
  },
});
