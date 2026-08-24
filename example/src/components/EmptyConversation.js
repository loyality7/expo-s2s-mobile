import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../theme/theme';

export function EmptyConversation() {
  return (
    <View style={styles.wrap}>
      <Text style={typography.headline}>Say something</Text>
      <Text style={[typography.bodySecondary, styles.sub]}>
        Tap the orb below and start talking. Your assistant is listening on-device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
  sub: { textAlign: 'center' },
});
