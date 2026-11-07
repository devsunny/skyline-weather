import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CloudOff, RefreshCw } from 'lucide-react-native';

import { COLORS, FONTS } from '../ui/theme';

type StaleBannerProps = {
  message: string;
  onRetry: () => void;
};

export function StaleBanner({ message, onRetry }: StaleBannerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Showing saved weather. Tap to retry."
      onPress={onRetry}
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
    >
      <CloudOff size={15} color={COLORS.textSecondary} strokeWidth={1.9} />
      <Text style={styles.text} numberOfLines={2}>
        Showing saved weather. {message}
      </Text>
      <RefreshCw size={14} color={COLORS.textSecondary} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 10.5,
    lineHeight: 15,
  },
});
