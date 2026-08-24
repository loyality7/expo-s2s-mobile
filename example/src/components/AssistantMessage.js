import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

export function AssistantMessage({ text, streaming, interrupted }) {
  return (
    <View style={styles.row}>
      <View style={[styles.bubble, streaming && styles.streaming]}>
        <Text style={typography.body}>
          {text}
          {streaming ? <Text style={{ color: colors.accent }}> ●</Text> : null}
        </Text>
        {interrupted ? <Text style={styles.interruptedTag}>Interrupted</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start', marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  bubble: {
    maxWidth: '86%',
    backgroundColor: colors.assistantBubble,
    borderRadius: radius.md,
    borderTopLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  streaming: { borderColor: colors.accentMuted },
  interruptedTag: { ...typography.caption, marginTop: spacing.xs, color: colors.warning },
});
