import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS } from './theme';

type SectionHeaderProps = {
  title: string;
  meta?: string;
};

export function SectionHeader({ title, meta }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  title: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemibold,
    fontSize: 10,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  meta: {
    color: COLORS.textFaint,
    fontFamily: FONTS.bodySemibold,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
