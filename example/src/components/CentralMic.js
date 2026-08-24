import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const CentralMic = ({ engineState, s2sState, onPress }) => {
  const getConfig = () => {
    if (engineState !== 'READY') {
      return { label: 'Preparing...', style: styles.disabled, icon: '🎙️' };
    }
    switch (s2sState) {
      case 'LISTENING':
        return { label: 'Listening...', style: styles.listening, icon: '🎙️' };
      case 'THINKING':
        return { label: 'Thinking...', style: styles.thinking, icon: '⚡' };
      case 'SPEAKING':
        return { label: 'Speaking...', style: styles.speaking, icon: '🔊' };
      case 'IDLE':
      default:
        return { label: 'Tap to talk', style: styles.idle, icon: '🎙️' };
    }
  };

  const config = getConfig();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, config.style]} 
        onPress={onPress}
        activeOpacity={0.8}
        disabled={engineState !== 'READY'}
      >
        <Text style={styles.icon}>{config.icon}</Text>
      </TouchableOpacity>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#090A0C',
  },
  button: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  icon: {
    fontSize: 34,
  },
  idle: {
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: '#374151',
  },
  listening: {
    backgroundColor: '#EF4444',
  },
  thinking: {
    backgroundColor: '#F59E0B',
  },
  speaking: {
    backgroundColor: '#10B981',
  },
  disabled: {
    backgroundColor: '#111827',
    opacity: 0.5,
  },
  label: {
    marginTop: 14,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
