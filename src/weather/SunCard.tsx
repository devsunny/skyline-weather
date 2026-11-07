import { StyleSheet, Text, View } from 'react-native';
import { Sunrise, Sunset } from 'lucide-react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { SkyPalette } from '../lib/sky';
import { formatClock, formatDuration } from '../lib/format';
import { getDaylightInfo } from '../lib/sky';
import { COLORS, FONTS, styles as shared } from '../ui/theme';

type SunCardProps = {
  sunrise: string | null;
  sunset: string | null;
  timeZone: string;
  now: Date;
  palette: SkyPalette;
};

function arcPoint(progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  const start = { x: 20, y: 88 };
  const control = { x: 160, y: -22 };
  const end = { x: 300, y: 88 };
  const oneMinus = 1 - t;
  return {
    x: oneMinus * oneMinus * start.x + 2 * oneMinus * t * control.x + t * t * end.x,
    y: oneMinus * oneMinus * start.y + 2 * oneMinus * t * control.y + t * t * end.y,
  };
}

export function SunCard({ sunrise, sunset, timeZone, now, palette }: SunCardProps) {
  const daylight = getDaylightInfo(sunrise, sunset, timeZone, now);
  const point = arcPoint(daylight.progress);
  const hasTimes = Boolean(sunrise && sunset);
  const middleValue =
    daylight.remainingMinutes > 0 ? formatDuration(daylight.remainingMinutes) : 'Night';

  return (
    <View style={[shared.card, styles.card]}>
      <View style={styles.labels}>
        <View style={styles.labelBlock}>
          <View style={styles.iconLabel}>
            <Sunrise size={13} color={COLORS.textMuted} strokeWidth={2} />
            <Text style={styles.label}>SUNRISE</Text>
          </View>
          <Text style={styles.time}>{sunrise ? formatClock(sunrise, timeZone) : '—'}</Text>
        </View>
        <View style={[styles.labelBlock, styles.middle]}>
          <Text style={styles.label}>DAYLIGHT LEFT</Text>
          <Text style={[styles.time, { color: palette.accent }]}>{hasTimes ? middleValue : '—'}</Text>
        </View>
        <View style={[styles.labelBlock, styles.right]}>
          <View style={[styles.iconLabel, styles.iconRight]}>
            <Text style={styles.label}>SUNSET</Text>
            <Sunset size={13} color={COLORS.textMuted} strokeWidth={2} />
          </View>
          <Text style={styles.time}>{sunset ? formatClock(sunset, timeZone) : '—'}</Text>
        </View>
      </View>

      <Svg width="100%" height={94} viewBox="0 0 320 100" preserveAspectRatio="none">
        <Line x1="16" y1="88" x2="304" y2="88" stroke={COLORS.line} strokeWidth="1" strokeDasharray="2 6" />
        <Path
          d="M 20 88 Q 160 -22 300 88"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.3"
          strokeDasharray="3 5"
        />
        {hasTimes ? (
          <>
            <Circle cx={point.x} cy={point.y} r="13" fill={palette.accent} opacity={0.16} />
            <Circle cx={point.x} cy={point.y} r="6.5" fill={palette.accent} opacity={0.26} />
            <Circle cx={point.x} cy={point.y} r="3.4" fill={palette.accent} />
          </>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 4,
    overflow: 'hidden',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelBlock: {
    flex: 1,
  },
  middle: {
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  iconRight: {
    justifyContent: 'flex-end',
  },
  label: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemibold,
    fontSize: 8.5,
    letterSpacing: 1.2,
  },
  time: {
    color: COLORS.text,
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    letterSpacing: -0.3,
    marginTop: 5,
  },
});
