import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

export function UserMessage({ text, pending }) {
  return (
    <View style={styles.row}>
      <View style={[styles.bubble, pending && styles.pending]}>
        <Text style={typography.body}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-end', marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  bubble: {
    maxWidth: '82%',
    backgroundColor: colors.userBubble,
    borderRadius: radius.md,
    borderTopRightRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pending: { opacity: 0.6 },
});
