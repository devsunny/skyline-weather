import { Platform, StyleSheet } from 'react-native';

export const COLORS = {
  text: '#F6FBFF',
  textSecondary: 'rgba(240, 249, 255, 0.70)',
  textMuted: 'rgba(240, 249, 255, 0.48)',
  textFaint: 'rgba(240, 249, 255, 0.32)',
  line: 'rgba(255, 255, 255, 0.11)',
  lineStrong: 'rgba(255, 255, 255, 0.20)',
  glass: 'rgba(255, 255, 255, 0.075)',
  glassStrong: 'rgba(255, 255, 255, 0.12)',
  glassBright: 'rgba(255, 255, 255, 0.17)',
  amber: '#F6C96D',
  amberSoft: 'rgba(246, 201, 109, 0.14)',
  amberLine: 'rgba(246, 201, 109, 0.32)',
  danger: '#FF9B8A',
  white: '#FFFFFF',
  black: '#03070C',
  sheet: '#07131D',
  sheetElevated: '#0C1C29',
};

export const FONTS = {
  display: 'Sora_700Bold',
  displayHeavy: 'Sora_800ExtraBold',
  displayMedium: 'Sora_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
};

export const RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
};

export const MAX_WIDTH = 560;

export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
  },
  android: { elevation: 6 },
  default: {},
});

export const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: RADIUS.lg,
    ...cardShadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemibold,
    fontSize: 10,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
});
