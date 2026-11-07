import { StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';

import { COLORS, FONTS } from './theme';
import { IconButton } from './IconButton';

type SheetHeaderProps = {
  kicker: string;
  title: string;
  onClose: () => void;
};

export function SheetHeader({ kicker, title, onClose }: SheetHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <IconButton icon={X} onPress={onClose} accessibilityLabel="Close" size={19} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 18,
  },
  copy: {
    flex: 1,
  },
  kicker: {
    color: COLORS.textFaint,
    fontFamily: FONTS.bodySemibold,
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.display,
    fontSize: 28,
    letterSpacing: -0.8,
  },
});
