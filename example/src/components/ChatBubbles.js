import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ChatBubbles = ({ conversation, currentTranscript, currentAssistantDelta, engineState }) => {
  if (conversation.length === 0 && !currentTranscript && !currentAssistantDelta && engineState === 'READY') {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>✨</Text>
        <Text style={styles.emptyText}>Tap the microphone and say hello.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {conversation.map((msg, idx) => (
        <View 
          key={idx} 
          style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}
        >
          <Text style={styles.roleLabel}>{msg.role === 'user' ? 'You' : 'Assistant'}</Text>
          <Text style={[styles.bubbleText, msg.role === 'user' ? styles.textUser : styles.textAssistant]}>
            {msg.content}
          </Text>
        </View>
      ))}

      {currentTranscript ? (
        <View style={[styles.bubble, styles.bubbleUser, styles.pending]}>
          <Text style={styles.roleLabel}>You</Text>
          <Text style={[styles.bubbleText, styles.textUser]}>{currentTranscript}</Text>
        </View>
      ) : null}

      {currentAssistantDelta ? (
        <View style={[styles.bubble, styles.bubbleAssistant, styles.pending]}>
          <Text style={styles.roleLabel}>Assistant</Text>
          <Text style={[styles.bubbleText, styles.textAssistant]}>{currentAssistantDelta}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    justify: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 12,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#7B61FF',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2937',
    borderBottomLeftRadius: 4,
  },
  pending: {
    opacity: 0.75,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
  },
  textUser: {
    color: '#FFFFFF',
  },
  textAssistant: {
    color: '#E5E7EB',
  },
});
