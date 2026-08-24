import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

export function Stepper({ label, sublabel, value, onChange, step = 1, min, max, format }) {
  const displayValue = format ? format(value) : String(value);

  const dec = () => {
    const next = Math.max(min ?? -Infinity, round(value - step));
    onChange(next);
  };
  const inc = () => {
    const next = Math.min(max ?? Infinity, round(value + step));
    onChange(next);
  };

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={typography.body}>{label}</Text>
        {sublabel ? <Text style={typography.caption}>{sublabel}</Text> : null}
      </View>
      <View style={styles.controls}>
        <Pressable onPress={dec} style={styles.btn} hitSlop={8}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{displayValue}</Text>
        <Pressable onPress={inc} style={styles.btn} hitSlop={8}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function round(n) {
  return Math.round(n * 100) / 100;
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
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: colors.textPrimary, fontSize: 18, lineHeight: 20 },
  value: { ...typography.body, minWidth: 48, textAlign: 'center' },
});
