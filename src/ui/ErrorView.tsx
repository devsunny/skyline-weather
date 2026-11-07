import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CloudOff, MapPin, RefreshCw } from 'lucide-react-native';

import { COLORS, FONTS, MAX_WIDTH } from './theme';

type ErrorViewProps = {
  message: string;
  onRetry: () => void;
  onSearch: () => void;
};

export function ErrorView({ message, onRetry, onSearch }: ErrorViewProps) {
  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <CloudOff size={34} color={COLORS.textSecondary} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>The sky is out of reach</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <RefreshCw size={15} color="#07131D" strokeWidth={2.2} />
        <Text style={styles.primaryText}>Try again</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onSearch}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <MapPin size={14} color={COLORS.textSecondary} strokeWidth={2} />
        <Text style={styles.secondaryText}>Choose another place</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.display,
    fontSize: 23,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
    marginBottom: 28,
    maxWidth: 330,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 23,
    backgroundColor: COLORS.text,
    minWidth: 160,
  },
  primaryText: {
    color: '#07131D',
    fontFamily: FONTS.bodySemibold,
    fontSize: 13,
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 44,
    paddingHorizontal: 18,
    marginTop: 10,
  },
  secondaryText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12.5,
  },
  pressed: {
    opacity: 0.65,
  },
});
