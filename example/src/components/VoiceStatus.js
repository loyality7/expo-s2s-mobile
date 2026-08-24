import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';
import { VoiceState } from '../hooks/useS2S';

// Small status text shown under the header — distinct from the orb's own
// label, for states worth surfacing even when the orb isn't in view.
export function VoiceStatus({ voiceState }) {
  if (voiceState !== VoiceState.PAUSED) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.dot} />
      <Text style={typography.caption}>Paused — another app is using audio</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warning },
});
