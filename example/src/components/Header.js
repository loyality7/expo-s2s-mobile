import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

export function Header({ title, subtitle, onSettingsPress, onResetPress }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleBlock}>
        <Text style={typography.headline}>{title}</Text>
        {subtitle ? <Text style={typography.caption}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        {onResetPress ? (
          <Pressable onPress={onResetPress} hitSlop={10} style={styles.iconBtn} accessibilityLabel="Reset conversation">
            <Text style={styles.iconText}>↺</Text>
          </Pressable>
        ) : null}
        {onSettingsPress ? (
          <Pressable onPress={onSettingsPress} hitSlop={10} style={styles.iconBtn} accessibilityLabel="Settings">
            <Text style={styles.iconText}>⚙</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  titleBlock: { gap: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  iconText: { color: colors.textSecondary, fontSize: 16 },
});
