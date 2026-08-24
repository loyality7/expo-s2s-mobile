import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';
import { VoiceState } from '../hooks/useS2S';

const LABELS = {
  [VoiceState.READY]: 'Tap to speak',
  [VoiceState.LISTENING]: 'Listening…',
  [VoiceState.THINKING]: 'Thinking…',
  [VoiceState.SPEAKING]: 'Speaking…',
  [VoiceState.PAUSED]: 'Paused',
};

const SIZE = 104;

const RUNNING_STATES = new Set([VoiceState.LISTENING, VoiceState.THINKING, VoiceState.SPEAKING]);

export function VoiceOrb({ voiceState, onPress, disabled }) {
  const isRunning = RUNNING_STATES.has(voiceState);
  const a11yLabel = isRunning ? `${LABELS[voiceState]}. Tap to stop.` : LABELS[voiceState] || 'Voice control';
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    pulse.stopAnimation();
    glow.stopAnimation();

    if (voiceState === VoiceState.LISTENING) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.12, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else if (voiceState === VoiceState.THINKING) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.4, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else if (voiceState === VoiceState.SPEAKING) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 260, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.98, duration: 260, useNativeDriver: true }),
        ])
      ).start();
    } else {
      Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      Animated.timing(glow, { toValue: 0.5, duration: 200, useNativeDriver: true }).start();
    }
  }, [voiceState, pulse, glow]);

  const ringColor =
    voiceState === VoiceState.SPEAKING
      ? colors.success
      : voiceState === VoiceState.THINKING
      ? colors.warning
      : colors.accent;

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.ring,
          { borderColor: ringColor, opacity: glow, transform: [{ scale: pulse }] },
        ]}
      />
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityState={{ disabled: !!disabled }}
        style={({ pressed }) => [
          styles.orb,
          pressed && !disabled && styles.orbPressed,
          disabled && styles.orbDisabled,
        ]}
      >
        <View style={[styles.core, { backgroundColor: ringColor }]} />
      </Pressable>
      <Text style={typography.status}>{LABELS[voiceState] || ''}</Text>
      {isRunning ? <Text style={[typography.caption, styles.hint]}>Tap to stop</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md },
  hint: { marginTop: -spacing.sm },
  ring: {
    position: 'absolute',
    top: -12,
    width: SIZE + 24,
    height: SIZE + 24,
    borderRadius: (SIZE + 24) / 2,
    borderWidth: 1.5,
  },
  orb: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  orbPressed: { backgroundColor: colors.surface },
  orbDisabled: { opacity: 0.4 },
  core: { width: 20, height: 20, borderRadius: 10 },
});
