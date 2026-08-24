import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';
import { PermissionState } from '../hooks/usePermissions';

const COPY = {
  [PermissionState.UNKNOWN]: {
    title: 'Microphone access',
    body: 'Your voice assistant needs microphone access to listen and respond.',
    action: 'Allow microphone',
  },
  [PermissionState.DENIED]: {
    title: 'Microphone access is required',
    body: 'Without it, the assistant can’t hear you. You can try again.',
    action: 'Try again',
  },
  [PermissionState.BLOCKED]: {
    title: 'Microphone access is required',
    body: 'You’ve blocked this before. Enable it from Android Settings to continue.',
    action: 'Open Settings',
  },
};

export function PermissionCard({ state, onRequest, onOpenSettings, requesting }) {
  const copy = COPY[state] || COPY[PermissionState.UNKNOWN];
  const isBlocked = state === PermissionState.BLOCKED;

  return (
    <View style={styles.wrap}>
      <Text style={typography.title}>{copy.title}</Text>
      <Text style={[typography.bodySecondary, styles.body]}>{copy.body}</Text>
      <Pressable
        onPress={isBlocked ? onOpenSettings : onRequest}
        disabled={requesting}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, requesting && styles.buttonDisabled]}
        accessibilityRole="button"
      >
        <Text style={typography.button}>{requesting ? 'Requesting…' : copy.action}</Text>
      </Pressable>
      <Text style={typography.caption}>You can change this later in Android Settings.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, gap: spacing.sm, alignItems: 'center' },
  body: { textAlign: 'center', marginBottom: spacing.md },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    alignSelf: 'stretch',
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
});
