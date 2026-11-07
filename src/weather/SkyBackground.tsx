import { useEffect, useId, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import type { SkyPalette } from '../lib/sky';

const STARS = [
  [24, 72, 1.6], [62, 128, 1.1], [108, 58, 1.2], [153, 112, 1.5],
  [190, 42, 0.9], [236, 96, 1.2], [284, 54, 1.5], [331, 132, 1],
  [369, 74, 1.3], [46, 206, 0.9], [119, 178, 1], [208, 196, 0.8],
  [302, 174, 1.2], [356, 236, 0.8], [76, 286, 0.9], [262, 244, 0.7],
] as const;

function SkyLayer({ palette }: { palette: SkyPalette }) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const glowTop = `glow-top-${uid}`;
  const glowBottom = `glow-bottom-${uid}`;

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={palette.colors}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={glowTop} gradientUnits="userSpaceOnUse" cx="315" cy="80" r="300">
            <Stop offset="0" stopColor={palette.glow} stopOpacity="0.95" />
            <Stop offset="0.55" stopColor={palette.glow} stopOpacity="0.26" />
            <Stop offset="1" stopColor={palette.glow} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={glowBottom} gradientUnits="userSpaceOnUse" cx="40" cy="710" r="280">
            <Stop offset="0" stopColor={palette.accent} stopOpacity="0.08" />
            <Stop offset="1" stopColor={palette.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="315" cy="80" r="300" fill={`url(#${glowTop})`} />
        <Circle cx="40" cy="710" r="280" fill={`url(#${glowBottom})`} />
        {!palette.isDay
          ? STARS.map(([x, y, r], index) => (
              <Circle key={index} cx={x} cy={y} r={r} fill={palette.star} opacity={0.18 + (index % 4) * 0.11} />
            ))
          : null}
      </Svg>
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.16)', 'rgba(0,0,0,0.34)']}
        locations={[0, 0.6, 1]}
        style={styles.bottomShade}
      />
      <View style={styles.topShade} />
    </View>
  );
}

export function SkyBackground({ palette }: { palette: SkyPalette }) {
  const [current, setCurrent] = useState(palette);
  const [previous, setPrevious] = useState<SkyPalette | null>(null);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (current.key === palette.key) {
      setCurrent(palette);
      return;
    }
    setPrevious(current);
    setCurrent(palette);
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 900,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setPrevious(null);
    });
    // Only a palette-key change should trigger the crossfade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette.key]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {previous ? <SkyLayer palette={previous} /> : null}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <SkyLayer palette={current} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '48%',
  },
  topShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(2, 7, 12, 0.06)',
  },
});
