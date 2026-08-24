import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  addS2SListener,
  getInstalledModelsAsync,
  isHardwareAecActive,
  isHardwareNoiseSuppressionActive,
} from 'expo-s2s-mobile';
import { colors, spacing, typography } from '../theme/theme';
import { Header } from '../components/Header';
import { useS2SContext } from '../context/S2SContext';
import { formatBytes } from '../utils/formatBytes';
import { formatMs } from '../utils/formatDuration';

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={typography.caption}>{label}</Text>
      <Text style={[typography.bodySecondary, { textAlign: 'right', flex: 1, marginLeft: spacing.md }]}>{value}</Text>
    </View>
  );
}

export function DiagnosticsScreen({ onBack }) {
  const { s2s, appState, bootError } = useS2SContext();
  const [models, setModels] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [rawErrors, setRawErrors] = useState([]);
  const [hwStatus, setHwStatus] = useState({ aec: false, ns: false });

  useEffect(() => {
    getInstalledModelsAsync().then(setModels).catch(() => {});
    try {
      setHwStatus({ aec: isHardwareAecActive(), ns: isHardwareNoiseSuppressionActive() });
    } catch {}

    const subs = [
      addS2SListener('onMetrics', (data) => setMetrics(data.metrics)),
      addS2SListener('onError', (data) =>
        setRawErrors((prev) => [{ message: data.message, cause: data.cause, time: Date.now() }, ...prev].slice(0, 20))
      ),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
      <Header title="Diagnostics" onSettingsPress={null} onResetPress={null} />
      <Pressable onPress={onBack} style={styles.backRow} hitSlop={10}>
        <Text style={[typography.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
        <View>
          <Text style={styles.sectionTitle}>Engine</Text>
          <Row label="App state" value={appState} />
          <Row label="Voice state" value={s2s.voiceState} />
          <Row label="Running" value={s2s.running ? 'yes' : 'no'} />
          {bootError ? <Row label="Boot error" value={bootError} /> : null}
        </View>

        <View>
          <Text style={styles.sectionTitle}>Audio hardware</Text>
          <Row label="Hardware echo cancellation" value={hwStatus.aec ? 'active' : 'inactive'} />
          <Row label="Hardware noise suppression" value={hwStatus.ns ? 'active' : 'inactive'} />
        </View>

        {metrics ? (
          <View>
            <Text style={styles.sectionTitle}>Last turn latency</Text>
            <Row label="Time to first token" value={formatMs(metrics.timeToFirstTokenMs)} />
            <Row label="Time to first audio" value={formatMs(metrics.timeToFirstAudioMs)} />
          </View>
        ) : null}

        <View>
          <Text style={styles.sectionTitle}>Models ({models.length})</Text>
          {models.map((m) => (
            <Row
              key={m.id}
              label={m.name}
              value={m.isInstalled ? formatBytes(m.diskUsageBytes) : 'not installed'}
            />
          ))}
        </View>

        {rawErrors.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Recent errors</Text>
            {rawErrors.map((e, i) => (
              <View key={i} style={{ marginBottom: spacing.sm }}>
                <Text style={[typography.bodySecondary, { color: colors.danger }]}>{e.message}</Text>
                {e.cause ? <Text style={typography.caption}>{e.cause}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  backRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  sectionTitle: { ...typography.caption, textTransform: 'uppercase', marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
});
