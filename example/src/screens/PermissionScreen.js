import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useS2S } from '../state/S2SContext';

export const PermissionScreen = () => {
  const { permissions, permissionStatus, requestPermissions } = useS2S();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set up your voice assistant</Text>
        <Text style={styles.subtitle}>
          To hear your voice and converse in real-time, the assistant requires microphone access.
        </Text>

        <View style={styles.card}>
          <View style={styles.item}>
            <Text style={styles.icon}>🎙️</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Microphone access</Text>
              <Text style={styles.itemSubtitle}>Used to capture your voice speech and VAD barge-in.</Text>
            </View>
            <Text style={styles.status}>{permissions.microphone ? '✓ Granted' : 'Required'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.item}>
            <Text style={styles.icon}>🔔</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Download Notifications</Text>
              <Text style={styles.itemSubtitle}>Shows real-time model download progress in Android status bar.</Text>
            </View>
            <Text style={styles.status}>{permissions.notifications ? '✓ Granted' : 'Optional'}</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity 
          style={styles.button} 
          onPress={requestPermissions}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {permissionStatus === 'REQUESTING' ? 'Requesting...' : 'Grant permissions'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0C',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    lineHeight: 22,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#1A1C23',
    borderRadius: 16,
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7B61FF',
  },
  spacer: {
    flex: 1,
  },
  button: {
    backgroundColor: '#7B61FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
