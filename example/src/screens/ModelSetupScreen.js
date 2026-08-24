import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme/theme';
import { SetupProgress } from '../components/SetupProgress';
import { ErrorBanner } from '../components/ErrorBanner';
import { useS2SContext } from '../context/S2SContext';
import { ModelSetupState } from '../hooks/useModelSetup';
import { AppState } from '../context/S2SProvider';

export function ModelSetupScreen() {
  const { appState, modelSetup, startDownloadingModels } = useS2SContext();
  const isDownloading = appState === AppState.DOWNLOADING_MODELS;

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={typography.title}>Preparing your voice assistant</Text>
        <Text style={[typography.bodySecondary, styles.sub]}>
          These voice models run entirely on your device. This only happens once.
        </Text>
      </View>

      <ErrorBanner message={modelSetup.error} />

      <View style={styles.body}>
        <SetupProgress
          models={modelSetup.models}
          overall={modelSetup.overall}
          completedCount={modelSetup.completedCount}
          totalCount={modelSetup.totalCount}
        />
      </View>

      <View style={styles.footer}>
        {isDownloading ? (
          <Pressable onPress={modelSetup.cancel} style={styles.secondaryButton}>
            <Text style={[typography.button, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
        ) : (
          <Pressable onPress={startDownloadingModels} style={styles.button}>
            <Text style={typography.button}>Download models</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.xs },
  sub: { marginBottom: spacing.sm },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  footer: { padding: spacing.lg },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryButton: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
