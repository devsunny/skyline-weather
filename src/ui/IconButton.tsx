import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS } from './theme';

type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type IconButtonProps = {
  icon: IconComponent;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  variant?: 'glass' | 'plain';
  disabled?: boolean;
};

export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  size = 18,
  variant = 'glass',
  disabled = false,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variant === 'glass' ? styles.glass : styles.plain,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View pointerEvents="none">
        <Icon size={size} color={COLORS.text} strokeWidth={1.9} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.lineStrong,
  },
  plain: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.94 }],
  },
  disabled: {
    opacity: 0.35,
  },
});
