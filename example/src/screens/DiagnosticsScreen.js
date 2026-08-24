import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useS2S } from '../state/S2SContext';

export const DiagnosticsScreen = () => {
  const { 
    setCurrentScreen, engineState, s2sState, lastError, installedModels,
    events, eventsPaused, setEventsPaused, setEvents,
    releaseEngine, resetConversation, onTrimMemory, cancelModelDownload,
    isHardwareAecActive, isHardwareNoiseSuppressionActive
  } = useS2S();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('SETTINGS')} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnostics & JNI Log</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionTitle}>SDK & NATIVE ENGINE STATUS</Text>
        <View style={styles.card}>
          <Text style={styles.codeText}>Engine State: {engineState}</Text>
          <Text style={styles.codeText}>S2S State: {s2sState}</Text>
          <Text style={styles.codeText}>Platform: {Platform.OS} (v{Platform.Version})</Text>
          <Text style={styles.codeText}>Hardware AEC: {isHardwareAecActive() ? 'Active' : 'Inactive'}</Text>
          <Text style={styles.codeText}>Hardware Noise Suppression: {isHardwareNoiseSuppressionActive() ? 'Active' : 'Inactive'}</Text>
          {lastError ? (
            <Text style={[styles.codeText, { color: '#F87171', marginTop: 6 }]}>
              Last Error: {lastError.message} ({lastError.time})
            </Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>MODEL REGISTRY CATALOG</Text>
        <View style={styles.card}>
          {installedModels.length === 0 ? (
            <Text style={styles.codeText}>No models queried.</Text>
          ) : (
            installedModels.map((m, idx) => (
              <View key={m.id || idx} style={styles.modelItem}>
                <Text style={styles.codeText}>• {m.name || m.id} ({m.category || 'N/A'})</Text>
                <Text style={styles.subCodeText}>Installed: {m.isInstalled ? 'YES' : 'NO'} | Path: {m.path || 'N/A'}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>DIRECTIVE CONTROLS</Text>
        <View style={styles.btnGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setCurrentScreen('PERMISSIONS')}>
            <Text style={styles.actionText}>Run Setup Flow</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={releaseEngine}>
            <Text style={styles.actionText}>Release Engine</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={resetConversation}>
            <Text style={styles.actionText}>Reset Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => onTrimMemory(10)}>
            <Text style={styles.actionText}>Trim Memory</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={cancelModelDownload}>
            <Text style={styles.actionText}>Cancel Downloads</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventHeader}>
          <Text style={styles.sectionTitle}>RAW EVENT STREAM ({events.length})</Text>
          <View style={styles.eventControls}>
            <TouchableOpacity onPress={() => setEventsPaused(!eventsPaused)}>
              <Text style={styles.ctrlText}>{eventsPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEvents([])} style={{ marginLeft: 12 }}>
              <Text style={styles.ctrlText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logBox}>
          {events.length === 0 ? (
            <Text style={styles.logText}>No native events captured yet.</Text>
          ) : (
            events.map((e, idx) => (
              <Text key={idx} style={styles.logText}>
                {e.time} | <Text style={styles.eventName}>{e.eventName}</Text>: {e.payloadSummary}
              </Text>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backBtn: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B61FF',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1A1C23',
    borderRadius: 12,
    padding: 14,
  },
  codeText: {
    color: '#E5E7EB',
    fontSize: 13,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  subCodeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modelItem: {
    marginBottom: 8,
  },
  btnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: '#262933',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '500',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  eventControls: {
    flexDirection: 'row',
  },
  ctrlText: {
    color: '#7B61FF',
    fontSize: 13,
    fontWeight: '600',
  },
  logBox: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 12,
    minHeight: 220,
    maxHeight: 400,
  },
  logText: {
    color: '#A0A0A0',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  eventName: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});
