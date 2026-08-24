import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme/theme';
import { Header } from '../components/Header';
import { ErrorBanner } from '../components/ErrorBanner';
import { useModelCatalog } from '../hooks/useModelCatalog';
import { formatBytes } from '../utils/formatBytes';

const CATEGORY_LABELS = {
  VAD: 'Voice detection',
  STT: 'Speech recognition',
  LLM: 'Language model',
  TTS: 'Speech synthesis',
};

function ModelOption({ model, isSelected, isDownloading, onSelect }) {
  return (
    <Pressable onPress={() => onSelect(model)} style={styles.option} disabled={isDownloading}>
      <View style={{ flex: 1 }}>
        <Text style={typography.body}>{model.name}</Text>
        <Text style={typography.caption}>
          {model.isInstalled ? 'Installed' : `Not installed · ${formatBytes(model.approxBytes)}`}
        </Text>
      </View>
      {isDownloading ? (
        <ActivityIndicator color={colors.accent} />
      ) : isSelected ? (
        <Text style={{ color: colors.accent, fontSize: 16 }}>✓</Text>
      ) : null}
    </Pressable>
  );
}

export function ModelsScreen({ onBack, onRestartRequired }) {
  const { categories, byCategory, selected, selectModel, downloadingId, loading } = useModelCatalog();
  const [error, setError] = useState(null);

  const handleSelect = async (category, model) => {
    setError(null);
    try {
      await selectModel(category, model);
      onRestartRequired?.();
    } catch (e) {
      setError(e?.message || 'Could not switch model');
    }
  };

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
      <Header title="Voice Engine" onSettingsPress={null} onResetPress={null} />
      <Pressable onPress={onBack} style={styles.backRow} hitSlop={10}>
        <Text style={[typography.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.accent} />
      ) : (
        <ScrollView>
          {categories.map((cat) => (
            <View key={cat} style={styles.section}>
              <Text style={styles.sectionTitle}>{CATEGORY_LABELS[cat]}</Text>
              {(byCategory[cat] || []).map((model) => (
                <ModelOption
                  key={model.id}
                  model={model}
                  isSelected={selected[cat] ? selected[cat] === model.id : model.isInstalled}
                  isDownloading={downloadingId === model.id}
                  onSelect={(m) => handleSelect(cat, m)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  backRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  section: { marginTop: spacing.md },
  sectionTitle: { ...typography.caption, textTransform: 'uppercase', paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    gap: spacing.sm,
  },
});
