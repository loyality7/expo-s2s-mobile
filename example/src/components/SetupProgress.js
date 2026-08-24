import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';
import { formatBytesPair } from '../utils/formatBytes';

function ModelRow({ model }) {
  const label =
    model.status === 'COMPLETED'
      ? 'Ready'
      : model.status === 'EXTRACTING'
      ? 'Extracting'
      : model.status === 'VERIFYING'
      ? 'Verifying'
      : model.status === 'PRECHECK'
      ? 'Preparing'
      : model.percent > 0
      ? 'Downloading'
      : 'Waiting';

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={typography.body}>{model.name}</Text>
        <Text style={typography.caption}>
          {label} · {model.status === 'COMPLETED' ? formatBytesPair(model.totalBytes, model.totalBytes) : formatBytesPair(model.downloadedBytes, model.totalBytes)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, model.percent))}%` }]} />
      </View>
      <Text style={styles.pct}>{model.status === 'COMPLETED' ? '✓' : `${Math.round(model.percent)}%`}</Text>
    </View>
  );
}

export function SetupProgress({ models, overall, completedCount, totalCount }) {
  return (
    <View style={{ gap: spacing.md }}>
      {totalCount > 0 ? (
        <View style={styles.overall}>
          <Text style={typography.bodySecondary}>
            Downloading {completedCount} of {totalCount} models
          </Text>
          <Text style={typography.caption}>{formatBytesPair(overall.downloaded, overall.total)}</Text>
        </View>
      ) : null}
      <View style={{ gap: spacing.sm }}>
        {models.map((m) => (
          <ModelRow key={m.id} model={m} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  track: {
    width: 60,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.accent },
  pct: { ...typography.caption, width: 32, textAlign: 'right' },
});
