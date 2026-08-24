import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme/theme';
import { friendlyError } from '../utils/errorMessages';

export function ErrorScreen({ rawMessage, onRetry, onOpenDiagnostics }) {
  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Text style={typography.title}>Voice engine couldn’t start</Text>
        <Text style={[typography.bodySecondary, styles.body]}>{friendlyError(rawMessage)}</Text>
        <Pressable onPress={onRetry} style={styles.button}>
          <Text style={typography.button}>Try again</Text>
        </Pressable>
        <Pressable onPress={onOpenDiagnostics} hitSlop={10}>
          <Text style={[typography.bodySecondary, { color: colors.accent }]}>Diagnostics</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  body: { textAlign: 'center', marginBottom: spacing.sm },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
