import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, MAX_WIDTH } from './theme';
import { WeatherGlyph } from '../weather/WeatherGlyph';
import { getSkyPalette } from '../lib/sky';

export function LoadingScreen({ label = 'Reading the sky' }: { label?: string }) {
  const breathe = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0.72,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  return (
    <View style={styles.root}>
      <View style={styles.inner}>
        <Animated.View style={{ opacity: breathe, transform: [{ scale: breathe }] }}>
          <WeatherGlyph condition="partly" isDay palette={getSkyPalette('partly', true)} size={132} />
        </Animated.View>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.trackFill, { transform: [{ scaleX: breathe }] }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  inner: {
    alignItems: 'center',
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    letterSpacing: 0.3,
    marginTop: 12,
  },
  track: {
    width: 92,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginTop: 18,
    overflow: 'hidden',
  },
  trackFill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.50)',
  },
});
