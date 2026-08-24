import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/theme';
import { Header } from '../components/Header';
import { ConversationList } from '../components/ConversationList';
import { VoiceOrb } from '../components/VoiceOrb';
import { VoiceStatus } from '../components/VoiceStatus';
import { ErrorBanner } from '../components/ErrorBanner';
import { useS2SContext } from '../context/S2SContext';
import { VoiceState } from '../hooks/useS2S';
import { friendlyError } from '../utils/errorMessages';

export function ChatScreen({ onOpenSettings }) {
  const { s2s, conversation } = useS2SContext();

  const handleOrbPress = () => {
    if (s2s.running) {
      s2s.stop();
    } else {
      s2s.start();
    }
  };

  const handleReset = () => {
    s2s.resetConversation();
    conversation.reset();
  };

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
      <Header
        title="Voice Assistant"
        subtitle={s2s.running ? 'On-device' : 'Stopped'}
        onSettingsPress={onOpenSettings}
        onResetPress={handleReset}
      />
      <VoiceStatus voiceState={s2s.voiceState} />

      <ErrorBanner
        message={s2s.lastError ? friendlyError(s2s.lastError) : null}
        onDismiss={s2s.clearError}
      />

      <View style={styles.chatArea}>
        <ConversationList messages={conversation.messages} />
      </View>

      <View style={styles.controlArea}>
        <VoiceOrb
          voiceState={s2s.voiceState}
          onPress={handleOrbPress}
          disabled={s2s.voiceState === VoiceState.PAUSED}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  chatArea: { flex: 1 },
  controlArea: { paddingVertical: spacing.lg, alignItems: 'center' },
});
