import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVoices, selectVoice } from 'expo-s2s-mobile';
import { colors, spacing, typography } from '../theme/theme';
import { Header } from '../components/Header';
import { SettingsRow } from '../components/SettingsRow';

export function SettingsScreen({ onBack, onOpenDiagnostics }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);

  useEffect(() => {
    try {
      setVoices(getVoices());
    } catch {
      setVoices([]);
    }
  }, []);

  const handleSelectVoice = (id) => {
    setSelectedVoiceId(id);
    selectVoice(id);
  };

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
      <Header title="Settings" onSettingsPress={null} onResetPress={null} />
      <Pressable onPress={onBack} style={styles.backRow} hitSlop={10}>
        <Text style={[typography.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <ScrollView>
        {voices.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice</Text>
            {voices.map((v) => (
              <SettingsRow
                key={v.id}
                label={v.name}
                onPress={() => handleSelectVoice(v.id)}
                trailing={
                  selectedVoiceId === v.id ? <Text style={{ color: colors.accent }}>✓</Text> : null
                }
              />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <SettingsRow label="Diagnostics" sublabel="Technical details for troubleshooting" onPress={onOpenDiagnostics} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  backRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  section: { marginTop: spacing.md },
  sectionTitle: { ...typography.caption, paddingHorizontal: spacing.md, marginBottom: spacing.xs, textTransform: 'uppercase' },
});
