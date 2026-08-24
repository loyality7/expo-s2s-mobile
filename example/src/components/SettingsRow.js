import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

export function SettingsRow({ label, sublabel, value, onValueChange, onPress, trailing }) {
  const isSwitch = typeof value === 'boolean' && !!onValueChange;

  const content = (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={typography.body}>{label}</Text>
        {sublabel ? <Text style={typography.caption}>{sublabel}</Text> : null}
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.surfaceRaised, true: colors.accentMuted }}
          thumbColor={value ? colors.accent : colors.textTertiary}
        />
      ) : (
        trailing || null
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
});
