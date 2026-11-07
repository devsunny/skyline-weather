import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock3, MapPin, TriangleAlert } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { WeatherAlert } from '../types';
import { formatClock } from '../lib/format';
import { COLORS, FONTS, MAX_WIDTH } from '../ui/theme';
import { SheetHeader } from '../ui/SheetHeader';

type AlertSheetProps = {
  visible: boolean;
  alerts: WeatherAlert[];
  timeZone: string;
  onClose: () => void;
};

const severityColor: Record<WeatherAlert['severity'], string> = {
  Extreme: '#FF8C7B',
  Severe: '#FFAD7A',
  Moderate: COLORS.amber,
  Minor: '#9BD5F2',
  Unknown: '#B7C6CE',
};

export function AlertSheet({ visible, alerts, timeZone, onClose }: AlertSheetProps) {
  if (!alerts.length) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <LinearGradient colors={['#07131D', '#11151A', '#17130F']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <SheetHeader kicker="NATIONAL WEATHER SERVICE" title="Alerts" onClose={onClose} />
            <View style={styles.summary}>
              <View style={styles.summaryIcon}>
                <TriangleAlert size={18} color={COLORS.amber} strokeWidth={2} />
              </View>
              <Text style={styles.summaryText}>
                {alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'} for this location
              </Text>
            </View>

            {alerts.map((alert) => {
              const color = severityColor[alert.severity];
              const end = alert.ends ?? alert.expires;
              return (
                <View key={alert.id} style={styles.alertCard}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: `${color}1F`, borderColor: `${color}4D` }]}>
                      <Text style={[styles.badgeText, { color }]}>{alert.severity.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.sender} numberOfLines={1}>
                      {alert.senderName}
                    </Text>
                  </View>
                  <Text style={styles.event}>{alert.event}</Text>
                  {alert.headline && alert.headline !== alert.event ? (
                    <Text style={styles.headline}>{alert.headline}</Text>
                  ) : null}

                  <View style={styles.metaRow}>
                    <MapPin size={12} color={COLORS.textMuted} strokeWidth={2} />
                    <Text style={styles.meta} numberOfLines={2}>{alert.areaDesc}</Text>
                  </View>
                  {end ? (
                    <View style={styles.metaRow}>
                      <Clock3 size={12} color={COLORS.textMuted} strokeWidth={2} />
                      <Text style={styles.meta}>Until {formatClock(end, timeZone)}</Text>
                    </View>
                  ) : null}

                  <Text style={styles.body}>{alert.description}</Text>
                  {alert.instruction ? (
                    <View style={styles.instruction}>
                      <Text style={styles.instructionLabel}>WHAT TO DO</Text>
                      <Text style={styles.instructionText}>{alert.instruction}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}

            <Text style={styles.footer}>
              Alerts are issued by the National Weather Service. Always follow guidance from local
              officials in an emergency.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.sheet,
  },
  safe: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: 16,
    backgroundColor: COLORS.amberSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.amberLine,
    marginBottom: 14,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(246,201,109,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
    color: 'rgba(246, 201, 109, 0.85)',
    fontFamily: FONTS.bodyMedium,
    fontSize: 11.5,
  },
  alertCard: {
    borderRadius: 22,
    padding: 17,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: {
    fontFamily: FONTS.bodySemibold,
    fontSize: 8,
    letterSpacing: 1,
  },
  sender: {
    flex: 1,
    color: COLORS.textFaint,
    fontFamily: FONTS.body,
    fontSize: 9,
    textAlign: 'right',
  },
  event: {
    color: COLORS.text,
    fontFamily: FONTS.displayMedium,
    fontSize: 20,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  headline: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 9,
  },
  meta: {
    flex: 1,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 10,
    lineHeight: 15,
  },
  body: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 14,
  },
  instruction: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.line,
  },
  instructionLabel: {
    color: COLORS.amber,
    fontFamily: FONTS.bodySemibold,
    fontSize: 8.5,
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  instructionText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 11.5,
    lineHeight: 18,
  },
  footer: {
    color: COLORS.textFaint,
    fontFamily: FONTS.body,
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 12,
    paddingHorizontal: 2,
  },
});
