import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVoices, selectVoice } from 'expo-s2s-mobile';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Header } from '../components/Header';
import { SettingsRow } from '../components/SettingsRow';
import { Stepper } from '../components/Stepper';
import { getUserSettings, setUserSettings } from '../services/settingsStore';

const pct = (v) => `${Math.round(v * 100)}%`;

export function SettingsScreen({ onBack, onOpenModels, onOpenDiagnostics, onRestartRequired }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [settings, setSettings] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      setVoices(getVoices());
    } catch {
      setVoices([]);
    }
    getUserSettings().then(setSettings);
  }, []);

  const update = (section, field, value) => {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setDirty(true);
  };

  const handleSelectVoice = (id) => {
    setSelectedVoiceId(id);
    selectVoice(id);
  };

  const handleSave = async () => {
    await setUserSettings(settings);
    setDirty(false);
    onRestartRequired?.();
  };

  if (!settings) return null;

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
      <Header title="Settings" onSettingsPress={null} onResetPress={null} />
      <Pressable onPress={onBack} style={styles.backRow} hitSlop={10}>
        <Text style={[typography.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Engine</Text>
          <SettingsRow label="Models" sublabel="Choose which models power each stage" onPress={onOpenModels} />
        </View>

        {voices.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice</Text>
            {voices.map((v) => (
              <SettingsRow
                key={v.id}
                label={v.name}
                onPress={() => handleSelectVoice(v.id)}
                trailing={selectedVoiceId === v.id ? <Text style={{ color: colors.accent }}>✓</Text> : null}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Speech output</Text>
          <Stepper
            label="Speaking speed"
            value={settings.tts.speed}
            step={0.05}
            min={0.5}
            max={2}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(v) => update('tts', 'speed', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language model</Text>
          <View style={styles.promptBlock}>
            <Text style={typography.body}>System prompt</Text>
            <TextInput
              value={settings.llm.systemPrompt}
              onChangeText={(v) => update('llm', 'systemPrompt', v)}
              multiline
              style={styles.promptInput}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <Stepper
            label="Temperature"
            sublabel="Higher is more varied, lower is more focused"
            value={settings.llm.temperature}
            step={0.05}
            min={0}
            max={1.5}
            format={(v) => v.toFixed(2)}
            onChange={(v) => update('llm', 'temperature', v)}
          />
          <Stepper
            label="Response length"
            sublabel="Maximum tokens per reply"
            value={settings.llm.maxTokens}
            step={32}
            min={32}
            max={1024}
            onChange={(v) => update('llm', 'maxTokens', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listening</Text>
          <Stepper
            label="Voice detection sensitivity"
            value={settings.vad.threshold}
            step={0.05}
            min={0.1}
            max={0.9}
            format={pct}
            onChange={(v) => update('vad', 'threshold', v)}
          />
          <SettingsRow
            label="Echo cancellation"
            sublabel="Reduces the assistant hearing itself over the speaker"
            value={settings.audio.echoCancellation}
            onValueChange={(v) => update('audio', 'echoCancellation', v)}
          />
          <SettingsRow
            label="Noise suppression"
            value={settings.audio.noiseSuppression}
            onValueChange={(v) => update('audio', 'noiseSuppression', v)}
          />
          <SettingsRow
            label="Yield to calls and alarms"
            sublabel="Pause listening when another app needs audio"
            value={settings.audio.manageAudioFocus}
            onValueChange={(v) => update('audio', 'manageAudioFocus', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <SettingsRow label="Diagnostics" sublabel="Technical details for troubleshooting" onPress={onOpenDiagnostics} />
        </View>

        {dirty ? (
          <View style={{ padding: spacing.lg }}>
            <Pressable onPress={handleSave} style={styles.saveButton}>
              <Text style={typography.button}>Save & restart engine</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  backRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  section: { marginTop: spacing.md },
  sectionTitle: { ...typography.caption, paddingHorizontal: spacing.md, marginBottom: spacing.xs, textTransform: 'uppercase' },
  promptBlock: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  promptInput: {
    ...typography.bodySecondary,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.sm,
    padding: spacing.sm,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
});
