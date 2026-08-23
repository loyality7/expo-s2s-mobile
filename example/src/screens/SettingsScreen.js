import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useS2S } from '../state/S2SContext';

export const SettingsScreen = () => {
  const { 
    setCurrentScreen, voices, selectedVoiceId, selectVoice, 
    systemPrompt, setSystemPromptText, setSystemPrompt 
  } = useS2S();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('READY')} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionTitle}>VOICE & SYNTHESIS</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Available Voices</Text>
          {voices.length === 0 ? (
            <Text style={styles.subtext}>Default voice active (Sherpa ONNX TTS)</Text>
          ) : (
            voices.map(v => (
              <TouchableOpacity 
                key={v.id} 
                style={[styles.voiceItem, selectedVoiceId === v.id && styles.selectedVoice]}
                onPress={() => { selectVoice(v.id); }}
              >
                <Text style={styles.voiceText}>{v.name} (ID: {v.id})</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>SYSTEM PROMPT</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Enter AI system prompt..."
            placeholderTextColor="#6B7280"
            value={systemPrompt}
            onChangeText={setSystemPromptText}
          />
          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={() => setSystemPrompt(systemPrompt)}
          >
            <Text style={styles.saveText}>Apply System Prompt</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>DEVELOPER TOOLS</Text>
        <TouchableOpacity 
          style={styles.diagTile} 
          onPress={() => setCurrentScreen('DIAGNOSTICS')}
        >
          <View>
            <Text style={styles.diagTileTitle}>Diagnostics & Event Stream</Text>
            <Text style={styles.diagTileSub}>View raw native JNI logs, event trace, and lifecycle controls.</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.diagTile, { marginTop: 12 }]} 
          onPress={() => setCurrentScreen('PERMISSIONS')}
        >
          <View>
            <Text style={styles.diagTileTitle}>Re-check Permissions</Text>
            <Text style={styles.diagTileSub}>Review microphone and system permissions.</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.diagTile, { marginTop: 12 }]} 
          onPress={() => setCurrentScreen('MODELS')}
        >
          <View>
            <Text style={styles.diagTileTitle}>Model Setup & Manager</Text>
            <Text style={styles.diagTileSub}>View model registry files and download state.</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
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
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  voiceItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262933',
  },
  selectedVoice: {
    backgroundColor: 'rgba(123, 97, 255, 0.15)',
  },
  voiceText: {
    color: '#FFF',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#090A0C',
    color: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveBtn: {
    backgroundColor: '#374151',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  diagTile: {
    backgroundColor: '#1A1C23',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diagTileTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  diagTileSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    maxWidth: 260,
  },
  arrow: {
    fontSize: 20,
    color: '#7B61FF',
  },
});
