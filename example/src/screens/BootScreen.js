import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';
import { AppState } from '../context/S2SProvider';

const STATUS_COPY = {
  [AppState.BOOTING]: 'Starting…',
  [AppState.CHECKING_PERMISSIONS]: 'Checking permissions…',
  [AppState.CHECKING_MODELS]: 'Checking installed models…',
  [AppState.INITIALIZING_ENGINE]: 'Starting speech engine…',
};

export function BootScreen({ appState }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.mark} />
      <Text style={typography.title}>Voice Assistant</Text>
      <View style={styles.statusRow}>
        <ActivityIndicator color={colors.accent} />
        <Text style={typography.status}>{STATUS_COPY[appState] || 'Preparing…'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  mark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: colors.accent,
    marginBottom: spacing.sm,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
});
