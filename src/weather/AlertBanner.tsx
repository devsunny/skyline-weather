import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, TriangleAlert } from 'lucide-react-native';

import type { WeatherAlert } from '../types';
import { formatRelativeTime } from '../lib/format';
import { COLORS, FONTS } from '../ui/theme';

type AlertBannerProps = {
  alerts: WeatherAlert[];
  timeZone: string;
  onPress: () => void;
};

export function AlertBanner({ alerts, timeZone, onPress }: AlertBannerProps) {
  const alert = alerts[0];
  if (!alert) return null;
  const end = alert.ends ?? alert.expires;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${alert.event}. Open weather alert.`}
      onPress={onPress}
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <TriangleAlert size={17} color={COLORS.amber} strokeWidth={2.1} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{alert.event}</Text>
          {alerts.length > 1 ? (
            <View style={styles.count}><Text style={styles.countText}>+{alerts.length - 1}</Text></View>
          ) : null}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {alert.severity !== 'Unknown' ? `${alert.severity} · ` : ''}
          {end ? `Ends ${formatRelativeTime(end, timeZone)}` : 'Active now'}
        </Text>
      </View>
      <ChevronRight size={17} color={COLORS.amber} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
    paddingLeft: 11,
    paddingRight: 13,
    borderRadius: 18,
    backgroundColor: COLORS.amberSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.amberLine,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(246, 201, 109, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    flexShrink: 1,
    color: COLORS.text,
    fontFamily: FONTS.bodySemibold,
    fontSize: 12.5,
  },
  meta: {
    color: 'rgba(246, 201, 109, 0.78)',
    fontFamily: FONTS.body,
    fontSize: 10.5,
    marginTop: 2,
  },
  count: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(246, 201, 109, 0.19)',
  },
  countText: {
    color: COLORS.amber,
    fontFamily: FONTS.bodySemibold,
    fontSize: 9,
  },
});
