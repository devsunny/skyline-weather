import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS } from './theme';

export function BootScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, lift]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <View style={styles.mark}>
          <View style={styles.sun} />
          <View style={styles.cloudBack} />
          <View style={styles.cloudFront} />
        </View>
        <Text style={styles.brand}>SKYLINE</Text>
        <Text style={styles.tagline}>Weather, closer to home.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#071522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  mark: {
    width: 112,
    height: 84,
    marginBottom: 28,
  },
  sun: {
    position: 'absolute',
    right: 8,
    top: 2,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8C96F',
  },
  cloudBack: {
    position: 'absolute',
    left: 6,
    top: 34,
    width: 84,
    height: 36,
    borderRadius: 20,
    backgroundColor: 'rgba(221, 243, 252, 0.30)',
  },
  cloudFront: {
    position: 'absolute',
    left: 24,
    top: 22,
    width: 60,
    height: 42,
    borderRadius: 24,
    backgroundColor: '#EAF8FD',
  },
  brand: {
    color: COLORS.text,
    fontFamily: FONTS.displayHeavy,
    fontSize: 24,
    letterSpacing: 7,
    marginLeft: 7,
  },
  tagline: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 12,
    letterSpacing: 0.2,
    marginTop: 10,
  },
});
